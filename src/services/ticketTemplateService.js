// Ticket Template Configuration Service
// Centralizes template structure, QR generation, preview data, and persistence

export const ticketTemplateTripTypes = ['Express', 'Full', 'Web', 'Abordo'];
export const ticketTemplateStatusOptions = ['active', 'inactive'];

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

// ============================================================================
// PERSISTENCE SERVICE (with backend contract documented)
// ============================================================================

// LOCAL STORAGE KEY
const STORAGE_KEY = 'busgo_ticket_templates';

// In-memory cache for current session
let templatesCache = null;

function loadFromStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading templates from localStorage:', error);
  }
  return [];
}

function saveToStorage(templates) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  } catch (error) {
    console.error('Error saving templates to localStorage:', error);
  }
}

function ensureCache() {
  if (!templatesCache) {
    templatesCache = loadFromStorage();
  }
  return templatesCache;
}

// ============================================================================
// PUBLIC API
// ============================================================================

const ticketTemplateService = {
  /**
   * List all ticket templates.
   * @returns {Promise<Array>} Array of templates
   */
  async listTemplates() {
    // TODO: Replace with backend call
    // return axios.get('/api/ticket-templates');
    ensureCache();
    return Promise.resolve(templatesCache || []);
  },

  /**
   * Get a single template by ID.
   * @param {string} id Template ID
   * @returns {Promise<Object>} Template object or null
   */
  async getTemplate(id) {
    ensureCache();
    const template = templatesCache.find((t) => t.id === id);
    return Promise.resolve(template || null);
  },

  /**
   * Create a new ticket template.
   * @param {Object} templateData Template data with name, tripType, status, config
   * @returns {Promise<Object>} Created template with ID
   */
  async createTemplate(templateData) {
    ensureCache();
    const newTemplate = {
      id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...templateData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    templatesCache.push(newTemplate);
    saveToStorage(templatesCache);
    return Promise.resolve(newTemplate);
  },

  /**
   * Update an existing template.
   * @param {Object} templateData Template data with id and fields to update
   * @returns {Promise<Object>} Updated template
   */
  async updateTemplate(templateData) {
    ensureCache();
    const index = templatesCache.findIndex((t) => t.id === templateData.id);
    if (index >= 0) {
      templatesCache[index] = {
        ...templatesCache[index],
        ...templateData,
        updatedAt: new Date().toISOString(),
      };
      saveToStorage(templatesCache);
      return Promise.resolve(templatesCache[index]);
    }
    return Promise.reject(new Error('Template not found'));
  },

  /**
   * Duplicate a template by ID.
   * @param {string} id Template ID to duplicate
   * @returns {Promise<Object>} New duplicated template
   */
  async duplicateTemplate(id) {
    ensureCache();
    const original = templatesCache.find((t) => t.id === id);
    if (!original) {
      return Promise.reject(new Error('Template not found'));
    }
    const newTemplate = {
      id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...JSON.parse(JSON.stringify(original)),
      name: `${original.name} (Copia)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    templatesCache.push(newTemplate);
    saveToStorage(templatesCache);
    return Promise.resolve(newTemplate);
  },

  /**
   * Toggle template status (active <-> inactive).
   * @param {string} id Template ID
   * @param {string} newStatus New status ('active' or 'inactive')
   * @returns {Promise<Object>} Updated template
   */
  async toggleStatus(id, newStatus) {
    ensureCache();
    const template = templatesCache.find((t) => t.id === id);
    if (!template) {
      return Promise.reject(new Error('Template not found'));
    }
    template.status = newStatus;
    template.updatedAt = new Date().toISOString();
    saveToStorage(templatesCache);
    return Promise.resolve(template);
  },

  /**
   * Delete a template by ID.
   * @param {string} id Template ID
   * @returns {Promise<boolean>} True if deleted
   */
  async deleteTemplate(id) {
    ensureCache();
    const index = templatesCache.findIndex((t) => t.id === id);
    if (index >= 0) {
      templatesCache.splice(index, 1);
      saveToStorage(templatesCache);
      return Promise.resolve(true);
    }
    return Promise.reject(new Error('Template not found'));
  },
};

export default ticketTemplateService;
