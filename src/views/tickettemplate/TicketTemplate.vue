<template>
  <v-container fluid>
    <v-card elevation="6" class="mx-2">
      <v-toolbar color="#1976D2">
        <v-row align="center">
          <v-col cols="12" md="8" class="grow ml-4">
            <span class="text-subtitle-1"><strong>Plantillas de Tickets</strong></span>
          </v-col>
          <v-col cols="12" md="3" class="text-right">
            <v-btn class="text-subtitle-1 ml-12" color="white" variant="tonal" elevation="2"
              prepend-icon="mdi-plus-circle" @click="openCreateDialog">
              Nueva plantilla
            </v-btn>
          </v-col>
        </v-row>
      </v-toolbar>

      <v-card-text>
        <v-row class="mt-1 mb-2">
          <v-col cols="12" md="4">
            <v-text-field v-model="search" append-icon="mdi-magnify" label="Buscar por nombre" single-line hide-details />
          </v-col>
          <v-col cols="12" md="4">
            <v-select v-model="filterType" :items="tripTypeOptions" label="Tipo de viaje" clearable variant="outlined" density="compact" />
          </v-col>
          <v-col cols="12" md="4">
            <v-select v-model="filterStatus" :items="statusOptions" label="Estado" clearable variant="outlined" density="compact" />
          </v-col>
        </v-row>

        <v-data-table :headers="headers" :items="filteredTemplates" :search="search" class="elevation-1"
          style="max-height: 68vh; overflow-y: auto" :items-per-page-text="'Elementos por páginas'"
          no-data-text="No hay datos disponibles" :loading="loading" loading-text="Cargando datos..."
          :items-per-page="10" :items-per-page-options="[5, 10, 20]">
          <template v-slot:item.name="{ item }">
            <div class="font-weight-medium">{{ item.name }}</div>
          </template>
          <template v-slot:item.tripType="{ item }">
            <v-chip color="#1976D2" variant="flat" size="small">
              {{ item.tripType }}
            </v-chip>
          </template>
          <template v-slot:item.status="{ item }">
            <v-chip :color="item.status === 'active' ? 'success' : 'default'" size="small" variant="tonal">
              {{ item.status === 'active' ? 'Activa' : 'Inactiva' }}
            </v-chip>
          </template>
          <template v-slot:item.updatedAt="{ item }">
            {{ formatDate(item.updatedAt) }}
          </template>
          <template v-slot:item.actions="{ item }">
            <div class="d-flex align-center ga-2">
              <v-btn density="comfortable" icon="mdi-eye-outline" @click="viewTemplate(item)" color="#1976D2" variant="tonal" title="Ver configuración" />
              <v-btn density="comfortable" icon="mdi-pencil" @click="editTemplate(item)" color="#1976D2" variant="tonal" title="Editar" />
              <v-btn density="comfortable" icon="mdi-content-copy" @click="duplicateTemplate(item)" color="#5C6BC0" variant="tonal" title="Duplicar" />
              <v-btn density="comfortable" :icon="item.status === 'active' ? 'mdi-toggle-switch' : 'mdi-toggle-switch-off'" @click="toggleTemplateStatus(item)" :color="item.status === 'active' ? 'success' : 'grey'" variant="tonal" :title="item.status === 'active' ? 'Desactivar' : 'Activar'" />
              <v-btn density="comfortable" icon="mdi-delete" @click="confirmDelete(item)" color="#DA7171" variant="tonal" title="Eliminar" />
            </div>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </v-container>

  <v-dialog v-model="dialog" max-width="1200px" persistent class="trip-dialog-modal">
    <v-card class="trip-dialog-card">
      <v-toolbar color="#2454d6" class="trip-dialog-toolbar">
        <v-icon class="mr-3">mdi-ticket-percent-outline</v-icon>
        <div>
          <div class="trip-dialog-title-text">{{ dialogTitle }}</div>
          <div class="trip-dialog-subtitle-text">{{ readOnly ? 'Visualizar configuración' : 'Configurar bloques y campos' }}</div>
        </div>
        <v-spacer />
        <v-btn icon variant="text" @click="cancelDialog" class="trip-dialog-close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text class="pa-4">
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field v-model="draft.name" label="Nombre de la plantilla" prepend-icon="mdi-text-box-outline" variant="underlined" :disabled="readOnly" :rules="nameRules" />

            <v-select v-model="draft.tripType" :items="tripTypeOptions" label="Tipo de viaje" prepend-icon="mdi-map-marker-path" variant="underlined" :disabled="readOnly" />

            <v-select v-model="draft.status" :items="statusOptionsLabels" label="Estado" prepend-icon="mdi-toggle-switch" variant="underlined" :disabled="readOnly" />

            <v-card variant="outlined" class="mt-4">
              <v-card-title class="text-subtitle-2 pb-2">Configuración del ticket</v-card-title>
              <v-card-text class="pt-0">
                <div v-for="(block, key) in blockDefinitions" :key="key" class="block-config mb-3">
                  <v-switch
                    v-if="block.switchable"
                    v-model="draft.config.blocks[key].enabled"
                    :label="block.label"
                    density="compact"
                    inset
                    :disabled="readOnly"
                  />

                  <div v-if="block.fields" class="ml-3 mt-2 d-flex flex-column ga-2">
                    <v-checkbox
                      v-for="(fieldLabel, fieldKey) in block.fields"
                      :key="fieldKey"
                      v-model="draft.config.blocks[key].fields[fieldKey]"
                      :label="fieldLabel"
                      density="compact"
                      hide-details
                      :disabled="readOnly"
                    />
                  </div>

                  <div v-if="block.textKey" class="mt-2 ml-3">
                    <v-text-field
                      v-model="draft.config.blocks[key][block.textKey]"
                      :label="block.textLabel"
                      density="compact"
                      variant="outlined"
                      :disabled="readOnly"
                    />
                  </div>

                  <div v-if="key === 'seats' && draft.config.blocks.seats" class="ml-3 mt-2">
                    <v-checkbox v-model="draft.config.blocks.seats.hideWhenEmpty" label="Ocultar bloque cuando no existan asientos" density="compact" hide-details :disabled="readOnly" />
                    <v-text-field v-model="draft.config.blocks.seats.emptyMessage" label="Mensaje sin asientos" density="compact" variant="outlined" class="mt-2" :disabled="readOnly" />
                    <v-text-field v-model="draft.config.blocks.seats.title" label="Título de asientos" density="compact" variant="outlined" class="mt-2" :disabled="readOnly" />
                  </div>

                  <div v-if="key === 'fareDetails' && draft.config.blocks.fareDetails" class="ml-3 mt-2 d-flex flex-column ga-2">
                    <v-checkbox v-model="draft.config.blocks.fareDetails.columns.type" label="Tipo de pasaje" density="compact" hide-details :disabled="readOnly" />
                    <v-checkbox v-model="draft.config.blocks.fareDetails.columns.quantity" label="Cantidad" density="compact" hide-details :disabled="readOnly" />
                    <v-checkbox v-model="draft.config.blocks.fareDetails.columns.unitPrice" label="Precio unitario" density="compact" hide-details :disabled="readOnly" />
                    <v-checkbox v-model="draft.config.blocks.fareDetails.columns.subtotal" label="Subtotal" density="compact" hide-details :disabled="readOnly" />
                  </div>

                  <div v-if="key === 'qr' && draft.config.blocks.qr" class="ml-3 mt-2">
                    <v-slider v-model="draft.config.blocks.qr.size" :min="72" :max="180" :step="4" label="Tamaño del QR" thumb-label :disabled="readOnly" />
                    <v-checkbox v-model="draft.config.blocks.qr.centered" label="Centrado" density="compact" hide-details :disabled="readOnly" />
                  </div>

                  <div v-if="key === 'footer' && draft.config.blocks.footer" class="ml-3 mt-2 d-flex flex-column ga-2">
                    <v-checkbox v-model="draft.config.blocks.footer.fields.copyControl" label="Copia de control" density="compact" hide-details :disabled="readOnly" />
                    <v-checkbox v-model="draft.config.blocks.footer.fields.transactionId" label="ID de transacción" density="compact" hide-details :disabled="readOnly" />
                    <v-checkbox v-model="draft.config.blocks.footer.fields.vehiclePlate" label="Patente del vehículo" density="compact" hide-details :disabled="readOnly" />
                    <v-checkbox v-model="draft.config.blocks.footer.fields.optionalText" label="Texto adicional" density="compact" hide-details :disabled="readOnly" />
                    <v-text-field v-model="draft.config.blocks.footer.optionalText" label="Texto adicional opcional" density="compact" variant="outlined" :disabled="readOnly" />
                  </div>
                </div>

                <v-divider class="my-3" />
                <v-checkbox v-model="draft.config.showSeparators" label="Mostrar separadores entre bloques" :disabled="readOnly" hide-details />
                <v-select v-model="draft.config.spacing" :items="['compact', 'comfortable']" label="Espaciado" variant="outlined" density="compact" class="mt-3" :disabled="readOnly" />
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="6">
            <v-card variant="outlined" class="h-100">
              <v-card-title class="text-subtitle-2 pb-2">Vista previa con datos de ejemplo</v-card-title>
              <v-card-text class="preview-panel">
                <div class="thermal-paper" :class="{ compact: draft.config.spacing === 'compact' }">
                  <div v-if="draft.config.blocks.logo.enabled" class="ticket-row logo-row">
                    <div class="logo-box">TV</div>
                    <div class="logo-company">Transportes del Valle</div>
                  </div>

                  <div v-if="draft.config.blocks.companyData.enabled" class="ticket-section">
                    <div v-if="draft.config.blocks.companyData.fields.name" class="ticket-row"><strong>Empresa:</strong> {{ previewData.company.name }}</div>
                    <div v-if="draft.config.blocks.companyData.fields.rut" class="ticket-row"><strong>RUT:</strong> {{ previewData.company.rut }}</div>
                    <div v-if="draft.config.blocks.companyData.fields.address" class="ticket-row"><strong>Dirección:</strong> {{ previewData.company.address }}</div>
                  </div>

                  <div v-if="draft.config.blocks.tripTitle.enabled" class="ticket-section title-section">
                    <div class="ticket-title">{{ draft.config.blocks.tripTitle.text || 'DETALLE DEL VIAJE' }}</div>
                  </div>

                  <div v-if="draft.config.blocks.route.enabled" class="ticket-section">
                    <div v-if="draft.config.blocks.route.fields.origin" class="ticket-row"><strong>Origen:</strong> {{ previewData.trip.origin }}</div>
                    <div v-if="draft.config.blocks.route.fields.destination" class="ticket-row"><strong>Destino:</strong> {{ previewData.trip.destination }}</div>
                    <div v-if="draft.config.blocks.route.fields.direction" class="ticket-row"><strong>Dirección:</strong> {{ previewData.trip.direction }}</div>
                  </div>

                  <div v-if="draft.config.blocks.dateTime.enabled" class="ticket-section">
                    <div v-if="draft.config.blocks.dateTime.fields.tripDate" class="ticket-row"><strong>Fecha:</strong> {{ previewData.schedule.tripDate }}</div>
                    <div v-if="draft.config.blocks.dateTime.fields.departureTime" class="ticket-row"><strong>Salida:</strong> {{ previewData.schedule.departureTime }}</div>
                    <div v-if="draft.config.blocks.dateTime.fields.arrivalDate" class="ticket-row"><strong>Fecha llegada:</strong> {{ previewData.schedule.arrivalDate }}</div>
                    <div v-if="draft.config.blocks.dateTime.fields.arrivalTime" class="ticket-row"><strong>Llegada:</strong> {{ previewData.schedule.arrivalTime }}</div>
                  </div>

                  <div v-if="shouldRenderSeats" class="ticket-section">
                    <div class="ticket-subtitle">{{ draft.config.blocks.seats.title || 'ASIENTO(S)' }}</div>
                    <div v-if="previewData.seats.length">
                      <div v-for="(seat, index) in previewData.seats" :key="index" class="ticket-row">Asiento {{ seat.number }}</div>
                    </div>
                    <div v-else class="ticket-row muted">{{ draft.config.blocks.seats.emptyMessage || 'NO HAY ASIENTOS REGISTRADOS' }}</div>
                  </div>

                  <div v-if="draft.config.blocks.paymentTitle.enabled" class="ticket-section title-section">
                    <div class="ticket-title">{{ draft.config.blocks.paymentTitle.text || 'DETALLE DE PAGO' }}</div>
                  </div>

                  <div v-if="draft.config.blocks.fareDetails.enabled" class="ticket-section">
                    <table class="fare-table">
                      <thead>
                        <tr>
                          <th v-if="draft.config.blocks.fareDetails.columns.type">Tipo</th>
                          <th v-if="draft.config.blocks.fareDetails.columns.quantity">Cant.</th>
                          <th v-if="draft.config.blocks.fareDetails.columns.unitPrice">Precio</th>
                          <th v-if="draft.config.blocks.fareDetails.columns.subtotal">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(fare, index) in previewData.fares" :key="index">
                          <td v-if="draft.config.blocks.fareDetails.columns.type">{{ fare.type }}</td>
                          <td v-if="draft.config.blocks.fareDetails.columns.quantity">{{ fare.quantity }}</td>
                          <td v-if="draft.config.blocks.fareDetails.columns.unitPrice">{{ formatCurrency(fare.unitPrice) }}</td>
                          <td v-if="draft.config.blocks.fareDetails.columns.subtotal">{{ formatCurrency(fare.subtotal) }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div v-if="draft.config.blocks.total.enabled" class="ticket-section total-section">
                    <div class="ticket-row total-row">
                      <strong>{{ draft.config.blocks.total.label || 'TOTAL' }}</strong>
                      <span>{{ formatCurrency(previewData.total, draft.config.blocks.total.decimals || 0) }}</span>
                    </div>
                  </div>

                  <div v-if="draft.config.blocks.paymentMethod.enabled" class="ticket-section">
                    <div class="ticket-row"><strong>{{ draft.config.blocks.paymentMethod.label || 'Medio de pago' }}:</strong> {{ draft.config.blocks.paymentMethod.value || previewData.paymentMethod }}</div>
                  </div>

                  <div v-if="draft.config.blocks.transactionNumber.enabled" class="ticket-section">
                    <div class="ticket-row"><strong>{{ draft.config.blocks.transactionNumber.label || 'N° Transacción' }}:</strong> {{ draft.config.blocks.transactionNumber.value || previewData.transactionNumber }}</div>
                  </div>

                  <div v-if="draft.config.blocks.qr.enabled" class="ticket-section qr-section">
                    <div class="qr-wrapper" :style="{ width: `${draft.config.blocks.qr.size}px`, margin: `0 auto` }">
                      <img :src="previewQrUrl" :width="draft.config.blocks.qr.size" :height="draft.config.blocks.qr.size" alt="QR" class="qr-image" />
                    </div>
                  </div>

                  <div v-if="draft.config.blocks.footer.enabled" class="ticket-section footer-section">
                    <div v-if="draft.config.blocks.footer.fields.copyControl" class="ticket-row">Copia de Control</div>
                    <div v-if="draft.config.blocks.footer.fields.transactionId" class="ticket-row">ID: {{ previewData.footer.transactionId }}</div>
                    <div v-if="draft.config.blocks.footer.fields.vehiclePlate" class="ticket-row">Patente: {{ previewData.footer.vehiclePlate }}</div>
                    <div v-if="draft.config.blocks.footer.fields.optionalText" class="ticket-row">{{ draft.config.blocks.footer.optionalText || 'Ticket emitido por la sucursal principal' }}</div>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>

      <v-divider></v-divider>
      <v-card-actions class="trip-step-actions pa-4">
        <v-btn variant="flat" color="#475569" @click="cancelDialog">Cancelar</v-btn>
        <v-spacer />
        <v-btn variant="flat" color="#475569" @click="restoreDefaultConfig" :disabled="readOnly" class="mr-2" v-if="!readOnly">Restaurar</v-btn>
        <v-btn color="#2454d6" variant="flat" @click="saveTemplate" :loading="saving" :disabled="saving || !isDraftValid || readOnly">
          {{ readOnly ? 'Cerrar' : 'Guardar' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="dialogDelete" max-width="500px">
    <v-card>
      <v-toolbar color="#DA7171">
        <span class="text-subtitle-2 ml-4">Eliminar plantilla</span>
      </v-toolbar>
      <v-card-text class="mt-2 mb-2">¿Desea eliminar la plantilla <strong>{{ selectedTemplateName }}</strong>?</v-card-text>
      <v-divider />
      <v-card-actions>
        <v-spacer />
        <v-btn color="#DA7171" variant="flat" @click="dialogDelete = false">Cancelar</v-btn>
        <v-btn color="#1976D2" variant="flat" @click="deleteTemplateConfirmed" :loading="deleting">Aceptar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-snackbar class="mt-12" location="right top" :timeout="sb_timeout" :color="sb_type" elevation="24" :multi-line="true" vertical v-model="snackbar">
    <v-row>
      <v-col md="2">
        <v-avatar :icon="sb_icon" color="sb_type" size="40"></v-avatar>
      </v-col>
      <v-col md="10">
        <h4>{{ sb_title }}</h4>
        {{ sb_message }}
      </v-col>
    </v-row>
  </v-snackbar>
</template>

<script>
import LocalStorageService from '@/LocalStorageService';
import ticketTemplateService, {
  getDefaultTicketTemplateConfig,
  ticketTemplateTripTypes,
  ticketTemplateStatusOptions,
  buildExamplePreviewData,
  buildQrPayload,
} from '@/services/ticketTemplateService';

export default {
  name: 'TicketTemplateView',
  data: () => ({
    snackbar: false,
    sb_type: '',
    sb_message: '',
    sb_timeout: 3000,
    sb_title: '',
    sb_icon: '',
    loading: false,
    saving: false,
    deleting: false,
    dialog: false,
    dialogDelete: false,
    readOnly: false,
    search: '',
    filterType: null,
    filterStatus: null,
    selectedTemplate: null,
    selectedTemplateName: '',
    templates: [],
    draft: null,
    originalDraft: null,
    tripTypeOptions: ticketTemplateTripTypes,
    statusOptions: ticketTemplateStatusOptions,
    statusOptionsLabels: [
      { title: 'Activa', value: 'active' },
      { title: 'Inactiva', value: 'inactive' },
    ],
    headers: [
      { title: 'Nombre', value: 'name', width: '28%' },
      { title: 'Tipo de viaje', value: 'tripType', width: '18%' },
      { title: 'Estado', value: 'status', width: '14%' },
      { title: 'Fecha de actualización', value: 'updatedAt', width: '22%' },
      { title: 'Acciones', value: 'actions', sortable: false, width: '18%' },
    ],
    nameRules: [
      (v) => !!v || 'El nombre es obligatorio',
      (v) => (v && v.trim().length >= 3) || 'Debe tener al menos 3 caracteres',
    ],
    blockDefinitions: {
      logo: { label: 'Logo', switchable: true },
      companyData: {
        label: 'Datos de la empresa',
        switchable: true,
        fields: {
          name: 'Nombre',
          rut: 'RUT',
          address: 'Dirección',
        },
      },
      tripTitle: {
        label: 'Título del viaje',
        switchable: true,
        textKey: 'text',
        textLabel: 'Texto del título',
      },
      route: {
        label: 'Trayecto',
        switchable: true,
        fields: {
          origin: 'Origen',
          destination: 'Destino',
          direction: 'Indicador de dirección',
        },
      },
      dateTime: {
        label: 'Fecha y horarios',
        switchable: true,
        fields: {
          tripDate: 'Fecha del viaje',
          departureTime: 'Hora de salida',
          arrivalDate: 'Fecha de llegada',
          arrivalTime: 'Hora de llegada',
        },
      },
      seats: { label: 'Asientos', switchable: true },
      paymentTitle: {
        label: 'Título del pago',
        switchable: true,
        textKey: 'text',
        textLabel: 'Texto del título de pago',
      },
      fareDetails: { label: 'Detalle de pasajes', switchable: true },
      total: { label: 'Total a pagar', switchable: true, textKey: 'label', textLabel: 'Etiqueta del total' },
      paymentMethod: { label: 'Medio de pago', switchable: true, textKey: 'label', textLabel: 'Etiqueta del medio de pago' },
      transactionNumber: { label: 'Número de transacción', switchable: true, textKey: 'label', textLabel: 'Etiqueta de la transacción' },
      qr: { label: 'Código QR', switchable: true },
      footer: { label: 'Pie de control', switchable: true },
    },
  }),
  computed: {
    filteredTemplates() {
      return this.templates.filter((item) => {
        const q = this.search.trim().toLowerCase();
        const matchSearch = !q || item.name.toLowerCase().includes(q);
        const matchType = !this.filterType || item.tripType === this.filterType;
        const matchStatus = !this.filterStatus || item.status === this.filterStatus;
        return matchSearch && matchType && matchStatus;
      });
    },
    dialogTitle() {
      if (this.readOnly) return 'Vista previa y configuración';
      return this.draft && this.draft.id ? 'Editar plantilla' : 'Nueva plantilla';
    },
    previewData() {
      return buildExamplePreviewData();
    },
    previewQrUrl() {
      const payload = buildQrPayload({
        transactionId: this.previewData.footer.transactionId,
        vehiclePlate: this.previewData.footer.vehiclePlate,
        company: this.previewData.company.name,
        tripType: this.draft?.tripType || 'Express',
      });
      return `https://api.qrserver.com/v1/create-qr-code/?size=${this.draft?.config?.blocks?.qr?.size || 120}x${this.draft?.config?.blocks?.qr?.size || 120}&data=${encodeURIComponent(payload)}`;
    },
    shouldRenderSeats() {
      if (!this.draft?.config?.blocks?.seats?.enabled) return false;
      if (!this.previewData.seats.length && this.draft.config.blocks.seats.hideWhenEmpty) return false;
      return true;
    },
    isDraftValid() {
      if (!this.draft) return false;
      const name = (this.draft.name || '').trim();
      return name.length >= 3 && !!this.draft.tripType;
    },
  },
  mounted() {
    this.ensureAccess();
    this.loadTemplates();
  },
  methods: {
    ensureAccess() {
      let permissions = [];
      try {
        const raw = LocalStorageService.getItem('permissionsUser');
        permissions = raw ? JSON.parse(raw) : [];
      } catch (error) {
        permissions = [];
      }

      const normalized = permissions
        .map((permission) => String(permission).trim())
        .filter(Boolean);

      const allowedPermissions = ['*', 'ticket-template', 'ticket-template:*', 'ticket-template:read', 'ticket-template:write', 'tickets:read', 'tickets:write'];
      const hasAccess = normalized.length === 0 || normalized.some((permission) => allowedPermissions.includes(permission));

      if (!hasAccess) {
        this.showAlert('warning', 'No tienes permisos para acceder a Plantillas de Tickets.', 4000);
      }
    },
    showAlert(type, message, timeout = 3000) {
      this.sb_type = type;
      this.sb_message = message;
      this.sb_timeout = timeout;
      if (type === 'success') {
        this.sb_title = 'Éxito';
        this.sb_icon = 'mdi-check-circle';
      } else if (type === 'error') {
        this.sb_title = 'Error';
        this.sb_icon = 'mdi-alert-circle';
      } else if (type === 'warning') {
        this.sb_title = 'Advertencia';
        this.sb_icon = 'mdi-alert-circle';
      } else {
        this.sb_title = 'Información';
        this.sb_icon = 'mdi-information';
      }
      this.snackbar = true;
    },
    formatDate(value) {
      if (!value) return '-';
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) {
        return value;
      }
      return date.toLocaleString('es-CL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    },
    formatCurrency(value, decimals = 0) {
      const amount = Number(value || 0);
      return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(amount);
    },
    cloneConfig(config) {
      return JSON.parse(JSON.stringify(config || getDefaultTicketTemplateConfig()));
    },
    createEmptyDraft() {
      return {
        id: null,
        name: '',
        tripType: 'Express',
        status: 'active',
        updatedAt: new Date().toISOString(),
        config: this.cloneConfig(getDefaultTicketTemplateConfig()),
      };
    },
    resetDraftToTemplate(template) {
      this.draft = {
        ...template,
        config: this.cloneConfig(template.config || getDefaultTicketTemplateConfig()),
      };
      this.originalDraft = JSON.parse(JSON.stringify(this.draft));
    },
    async loadTemplates() {
      this.loading = true;
      try {
        this.templates = await ticketTemplateService.listTemplates();
      } catch (error) {
        this.showAlert('error', 'No se pudieron cargar las plantillas de tickets.', 3500);
      } finally {
        this.loading = false;
      }
    },
    openCreateDialog() {
      this.readOnly = false;
      this.draft = this.createEmptyDraft();
      this.originalDraft = JSON.parse(JSON.stringify(this.draft));
      this.dialog = true;
    },
    async editTemplate(template) {
      this.readOnly = false;
      this.selectedTemplate = template;
      this.resetDraftToTemplate(template);
      this.dialog = true;
    },
    async viewTemplate(template) {
      this.readOnly = true;
      this.selectedTemplate = template;
      this.resetDraftToTemplate(template);
      this.dialog = true;
    },
    async duplicateTemplate(item) {
      try {
        const copied = await ticketTemplateService.duplicateTemplate(item.id);
        if (copied) {
          this.showAlert('success', 'Plantilla duplicada correctamente.', 2500);
          this.loadTemplates();
        }
      } catch (error) {
        this.showAlert('error', 'No se pudo duplicar la plantilla.', 3000);
      }
    },
    async toggleTemplateStatus(item) {
      try {
        const nextStatus = item.status === 'active' ? 'inactive' : 'active';
        const updated = await ticketTemplateService.toggleStatus(item.id, nextStatus);
        if (updated) {
          this.showAlert('success', `Plantilla ${nextStatus === 'active' ? 'activada' : 'desactivada'}.`, 2500);
          this.loadTemplates();
        }
      } catch (error) {
        this.showAlert('error', 'No se pudo cambiar el estado de la plantilla.', 3000);
      }
    },
    confirmDelete(item) {
      this.selectedTemplate = item;
      this.selectedTemplateName = item.name;
      this.dialogDelete = true;
    },
    async deleteTemplateConfirmed() {
      if (!this.selectedTemplate) return;
      this.deleting = true;
      try {
        await ticketTemplateService.deleteTemplate(this.selectedTemplate.id);
        this.showAlert('success', 'Plantilla eliminada correctamente.', 2500);
        this.dialogDelete = false;
        this.selectedTemplate = null;
        this.selectedTemplateName = '';
        this.loadTemplates();
      } catch (error) {
        this.showAlert('error', 'No se pudo eliminar la plantilla.', 3000);
      } finally {
        this.deleting = false;
      }
    },
    cancelDialog() {
      if (this.readOnly) {
        this.dialog = false;
        return;
      }

      const dirty = JSON.stringify(this.draft) !== JSON.stringify(this.originalDraft);
      if (dirty) {
        const shouldDiscard = window.confirm('¿Desea descartar los cambios sin guardar?');
        if (!shouldDiscard) return;
      }
      this.dialog = false;
      this.draft = null;
      this.originalDraft = null;
    },
    restoreDefaultConfig() {
      const shouldRestore = window.confirm('¿Desea restaurar la configuración inicial?');
      if (!shouldRestore) return;
      this.draft.config = this.cloneConfig(getDefaultTicketTemplateConfig());
    },
    async saveTemplate() {
      if (!this.isDraftValid) {
        this.showAlert('warning', 'Debe completar nombre y tipo de viaje.', 3000);
        return;
      }

      const trimmedName = this.draft.name.trim();
      const duplicated = this.templates.some((item) => {
        return item.name.toLowerCase() === trimmedName.toLowerCase() && item.id !== this.draft.id;
      });

      if (duplicated) {
        this.showAlert('warning', 'Ya existe una plantilla con ese nombre.', 3000);
        return;
      }

      this.saving = true;
      try {
        const payload = {
          ...this.draft,
          name: trimmedName,
          status: this.draft.status || 'active',
          tripType: this.draft.tripType,
          config: this.draft.config,
          updatedAt: new Date().toISOString(),
        };

        const saved = this.draft.id
          ? await ticketTemplateService.updateTemplate(payload)
          : await ticketTemplateService.createTemplate(payload);

        if (saved) {
          this.showAlert('success', 'Plantilla guardada correctamente.', 2500);
          this.dialog = false;
          this.loadTemplates();
          this.draft = null;
          this.originalDraft = null;
        }
      } catch (error) {
        this.showAlert('error', 'No se pudo guardar la plantilla.', 3000);
      } finally {
        this.saving = false;
      }
    },
  },
};
</script>

<style scoped>
.preview-panel {
  background: #f7f7f7;
  min-height: 420px;
}

.thermal-paper {
  width: 100%;
  max-width: 360px;
  background: #ffffff;
  color: #000000;
  border: 1px solid #d9d9d9;
  padding: 16px 14px;
  margin: 0 auto;
  font-size: 12px;
  line-height: 1.5;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.thermal-paper.compact {
  padding: 12px 12px;
}

.ticket-row,
.ticket-section,
.ticket-title,
.ticket-subtitle {
  width: 100%;
}

.ticket-section {
  border-top: 1px solid rgba(0, 0, 0, 0.18);
  padding-top: 6px;
  margin-top: 6px;
}

.ticket-section:first-child {
  border-top: none;
  padding-top: 0;
  margin-top: 0;
}

.ticket-title,
.ticket-subtitle {
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.logo-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.logo-box {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: linear-gradient(135deg, #1976d2, #6cb7ff);
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
}

.logo-company {
  font-weight: 700;
  font-size: 13px;
  word-break: break-word;
}

.total-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-weight: 700;
  font-size: 13px;
}

.fare-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;
}

.fare-table th,
.fare-table td {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  padding: 3px 2px;
  text-align: left;
}

.qr-image {
  display: block;
  margin: 0 auto;
  border: 1px solid rgba(0, 0, 0, 0.2);
  background: #fff;
}

.muted {
  opacity: 0.7;
}

.block-config {
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  padding: 10px 12px;
}

/* Modal Dialog Improvements */
.trip-dialog-modal .v-overlay__content {
  max-height: 90vh;
}

.trip-dialog-card {
  display: flex !important;
  flex-direction: column;
  max-height: 90vh;
}

.trip-dialog-toolbar {
  background: linear-gradient(100deg, #0e1f46, #173b8f 58%, #2454d6) !important;
  color: #fff !important;
  box-shadow: 0 5px 18px rgba(15, 23, 42, 0.18);
}

.trip-dialog-toolbar .v-icon {
  color: #fff;
}

.trip-dialog-title-text {
  font-size: 17px;
  font-weight: 850;
  color: #fff;
  line-height: 1.2;
}

.trip-dialog-subtitle-text {
  margin-top: 3px;
  color: #dbe7ff;
  font-size: 11px;
  font-weight: 600;
}

.trip-dialog-close {
  color: #fff !important;
  border-radius: 9px !important;
}

.trip-step-actions {
  background: #f6f8fb !important;
  border-top: 1px solid #dfe5ed !important;
  box-shadow: 0 -8px 16px #f6f8fb;
}

.trip-step-actions .v-btn {
  min-width: 108px;
  min-height: 42px;
  border-radius: 9px !important;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0;
  text-transform: none;
}

.trip-step-actions .v-btn:first-child {
  color: #475569 !important;
  background: #fff !important;
  border: 1px solid #dce3ed;
}

.trip-step-actions .v-btn--disabled {
  color: #94a3b8 !important;
  background: #e8edf4 !important;
  box-shadow: none !important;
}
</style>
