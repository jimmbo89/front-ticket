import { handleRequest } from '@/utils/api';

// Ticket Template Configuration Service
// Centralizes template structure, QR generation, preview data, and API access

export const ticketTemplateTripTypes = [
  { title: 'Normal', value: 'normal' },
  { title: 'Express', value: 'express' },
  { title: 'A bordo', value: 'on_board' },
];
export const ticketTemplateStatusOptions = ['active', 'inactive'];

const tripTypeAliases = {
  full: 'normal',
  web: 'normal',
  abordo: 'on_board',
  'on board': 'on_board',
};

export function normalizeTripType(value) {
  const normalized = String(value || '').trim().toLowerCase();
  return tripTypeAliases[normalized] || normalized;
}

export function ticketTemplateTripTypeLabel(value) {
  const normalized = normalizeTripType(value);
  return ticketTemplateTripTypes.find((option) => option.value === normalized)?.title || value || '—';
}

export function getDefaultTicketTemplateConfig() {
  return {
    version: '1.0',
    blocks: {
      logo: { enabled: true },
      companyData: {
        enabled: true,
        fields: { name: true, rut: true, address: true },
      },
      tripTitle: { enabled: true, text: 'DETALLE DEL VIAJE' },
      route: {
        enabled: true,
        fields: { origin: true, destination: true, direction: true },
      },
      dateTime: {
        enabled: true,
        fields: {
          tripDate: true,
          departureTime: true,
          arrivalDate: true,
          arrivalTime: true,
        },
      },
      seats: {
        enabled: true,
        title: 'ASIENTO(S)',
        hideWhenEmpty: false,
        emptyMessage: 'NO HAY ASIENTOS REGISTRADOS',
      },
      paymentTitle: { enabled: true, text: 'DETALLE DE PAGO' },
      fareDetails: {
        enabled: true,
        columns: { type: true, quantity: true, unitPrice: true, subtotal: true },
      },
      total: { enabled: true, label: 'TOTAL', decimals: 0 },
      paymentMethod: { enabled: true, label: 'Medio de pago', value: '' },
      transactionNumber: { enabled: true, label: 'N° Transacción', value: '' },
      qr: { enabled: true, size: 110, centered: true },
      footer: {
        enabled: true,
        fields: {
          copyControl: true,
          transactionId: true,
          vehiclePlate: true,
          optionalText: true,
        },
        optionalText: '',
      },
    },
    showSeparators: true,
    spacing: 'comfortable',
  };
}

export function buildExamplePreviewData() {
  return {
    company: {
      name: 'Transportes del Valle',
      rut: '76.123.456-7',
      address: 'Av. Principal 1234, Santiago',
    },
    trip: {
      origin: 'Santiago',
      destination: 'Valparaíso',
      direction: 'Sur a Norte',
    },
    schedule: {
      tripDate: '15/01/2025',
      departureTime: '14:30',
      arrivalDate: '15/01/2025',
      arrivalTime: '16:45',
    },
    seats: [
      { number: '12' },
      { number: '13' },
      { number: '14' },
    ],
    fares: [
      { type: 'Adulto', quantity: 2, unitPrice: 8500, subtotal: 17000 },
      { type: 'Estudiante', quantity: 1, unitPrice: 5100, subtotal: 5100 },
    ],
    total: 22100,
    paymentMethod: 'Efectivo',
    transactionNumber: 'TXN-2025-001234',
    footer: {
      transactionId: 'TXN-2025-001234',
      vehiclePlate: 'VBUS-456',
    },
  };
}

export function buildQrPayload(data) {
  // Builds a string payload for QR code, e.g., transaction info
  const { company, tripType, transactionId, vehiclePlate } = data;
  return `${company}|${tripType}|${transactionId}|${vehiclePlate}`;
}

function hasValue(value) {
  return value !== undefined && value !== null && value !== '';
}

function requireCompanyId(companyId) {
  if (!hasValue(companyId)) {
    throw new Error('No se encontró la empresa seleccionada.');
  }
  return companyId;
}

function normalizeTemplate(template = {}) {
  return {
    ...template,
    id: template.id,
    company_id: template.company_id ?? template.companyId,
    name: template.name || '',
    tripType: normalizeTripType(template.trip_type ?? template.tripType),
    status: template.status || 'active',
    config: template.config || getDefaultTicketTemplateConfig(),
    createdAt: template.created_at ?? template.createdAt,
    updatedAt: template.updated_at ?? template.updatedAt,
  };
}

function ticketTemplateFromResponse(data) {
  return normalizeTemplate(data?.ticketTemplate ?? data);
}

function throwRequestError(result, fallbackMessage) {
  if (result?.success) return;
  const error = new Error(result?.message || fallbackMessage);
  error.status = result?.status;
  error.data = result?.data;
  throw error;
}

function buildTemplatePayload(templateData = {}, companyId, includeCompany = false) {
  const payload = {
    name: String(templateData.name || '').trim(),
    trip_type: normalizeTripType(templateData.trip_type ?? templateData.tripType),
    status: templateData.status || 'active',
    config: templateData.config || getDefaultTicketTemplateConfig(),
  };

  if (includeCompany) {
    payload.company_id = requireCompanyId(companyId);
  }

  if (hasValue(templateData.id)) {
    payload.id = templateData.id;
  }

  return payload;
}

function templatesFromResponse(data) {
  const templates = data?.ticketTemplates ?? data?.templates ?? data;
  if (!Array.isArray(templates)) return [];
  return templates.map(normalizeTemplate);
}

// ============================================================================
// PUBLIC API
// ============================================================================

const ticketTemplateService = {
  /**
   * List templates for a company. Type and status are sent in the POST body
   * because the backend uses parameterized POST queries.
   * @returns {Promise<Array>} Array of templates
   */
  async listTemplates({ companyId, tripType, status } = {}) {
    const data = { company_id: requireCompanyId(companyId) };
    if (hasValue(tripType)) data.trip_type = normalizeTripType(tripType);
    if (hasValue(status)) data.status = status;

    const result = await handleRequest({
      endpoint: 'get-ticket-templates',
      method: 'POST',
      data,
    });

    // The API uses 204 when the company has no templates.
    if (result?.status === 204 || (!result?.success && result?.message === 'No encontrado.')) {
      return [];
    }

    throwRequestError(result, 'No fue posible cargar las plantillas de tickets.');
    return templatesFromResponse(result.data);
  },

  /**
   * Get a single template by ID.
   * @param {string} id Template ID
   * @returns {Promise<Object>} Template object or null
   */
  async getTemplate(id, companyId) {
    const templates = await this.listTemplates({ companyId });
    return templates.find((template) => String(template.id) === String(id)) || null;
  },

  /**
   * Create a new ticket template.
   * @param {Object} templateData Template data with name, tripType, status, config
   * @returns {Promise<Object>} Created template with ID
   */
  async createTemplate(templateData, companyId) {
    const result = await handleRequest({
      endpoint: 'ticket-templates',
      method: 'POST',
      data: buildTemplatePayload(templateData, companyId, true),
    });
    throwRequestError(result, 'No fue posible crear la plantilla de tickets.');
    return ticketTemplateFromResponse(result.data);
  },

  /**
   * Update an existing template.
   * @param {Object} templateData Template data with id and fields to update
   * @returns {Promise<Object>} Updated template
   */
  async updateTemplate(templateData) {
    const result = await handleRequest({
      endpoint: 'ticket-templates',
      method: 'PUT',
      data: buildTemplatePayload(templateData),
    });
    throwRequestError(result, 'No fue posible actualizar la plantilla de tickets.');
    return ticketTemplateFromResponse(result.data);
  },

  /**
   * Duplicate a template by creating a copy through the public create endpoint.
   * The backend contract does not require a dedicated duplicate endpoint.
   * @param {Object} template Template to duplicate
   * @returns {Promise<Object>} New duplicated template
   */
  async duplicateTemplate(template, companyId) {
    if (!template) throw new Error('No se encontró la plantilla a duplicar.');
    return this.createTemplate({
      name: `${template.name || 'Plantilla'} (Copia)`,
      tripType: template.tripType,
      status: template.status,
      config: JSON.parse(JSON.stringify(template.config || getDefaultTicketTemplateConfig())),
    }, companyId);
  },

  /**
   * Toggle template status (active <-> inactive).
   * @param {string} id Template ID
   * @param {string} newStatus New status ('active' or 'inactive')
   * @returns {Promise<Object>} Updated template
   */
  async toggleStatus(template, newStatus) {
    if (!template) throw new Error('No se encontró la plantilla.');
    return this.updateTemplate({
      id: template.id,
      name: template.name,
      tripType: template.tripType,
      status: newStatus,
      config: template.config,
    });
  },

  /**
   * Delete a template by ID.
   * @param {string} id Template ID
   * @returns {Promise<boolean>} True if deleted
   */
  async deleteTemplate(id) {
    const result = await handleRequest({
      endpoint: 'ticket-templates-destroy',
      method: 'POST',
      data: { id },
    });
    throwRequestError(result, 'No fue posible eliminar la plantilla de tickets.');
    return true;
  },
};

export default ticketTemplateService;
