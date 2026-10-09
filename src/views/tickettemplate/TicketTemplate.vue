<template>
  <div class="ticket-templates-view">
    <v-snackbar v-model="snackbar" class="busgo-snackbar" location="right top"
      :timeout="sb_timeout" :color="sb_type" elevation="10">
      <div class="template-alert">
        <v-icon :icon="sb_icon" size="22" />
        <div><strong>{{ sb_title }}</strong><div>{{ sb_message }}</div></div>
      </div>
    </v-snackbar>

    <v-card class="busgo-page-header" elevation="0">
      <v-avatar :color="paleteColors.primary" class="busgo-page-icon">
        <v-icon>mdi-ticket-confirmation-outline</v-icon>
      </v-avatar>
      <div class="busgo-page-heading">
        <div class="busgo-page-title">Plantillas de tickets</div>
        <div class="busgo-page-subtitle">Gestionar configuración, bloques y campos del ticket térmico</div>
      </div>
      <v-spacer />
      <v-btn :color="paleteColors.primary" variant="flat" elevation="0"
        prepend-icon="mdi-plus" class="busgo-add-btn" @click="openCreateDialog">
        Nueva plantilla
      </v-btn>
    </v-card>

    <v-container fluid class="busgo-container">
      <v-card class="busgo-card" elevation="0">
        <div class="busgo-card-header">
          <div>
            <div class="busgo-card-title">Listado de plantillas de tickets</div>
            <div class="busgo-card-subtitle">Administra el formato de impresión para cada tipo de viaje.</div>
          </div>
        </div>
        <div class="ticket-template-toolbar">
          <v-select v-model="filterType" :items="tripTypeOptions" label="Tipo de viaje"
            prepend-inner-icon="mdi-ticket-outline" variant="outlined" density="compact"
            clearable hide-details class="ticket-template-filter" />
          <v-select v-model="filterStatus" :items="statusOptionsLabels" label="Estado"
            prepend-inner-icon="mdi-toggle-switch-outline" variant="outlined" density="compact"
            clearable hide-details class="ticket-template-filter ticket-template-filter--status" />
          <v-spacer />
          <v-text-field v-model="search" density="compact" placeholder="Buscar plantilla de ticket..."
            prepend-inner-icon="mdi-magnify" variant="outlined" hide-details single-line
            class="ticket-template-search" />
        </div>
        <v-data-table :headers="headers" :items="sortedTemplates"
          items-per-page-text="Elementos por página" no-data-text="No hay datos disponibles"
          :loading="loading" loading-text="Cargando datos..." class="busgo-table template-list-table">
          <template #headers>
            <tr>
              <th :colspan="headers.length" class="template-header-shell">
                <div class="template-readable-head">
                  <div v-for="column in sortableColumns" :key="column.key" class="template-heading-group">
                    <button type="button" class="template-sort-button" @click="toggleTemplateSort(column.key)"
                      :aria-label="sortButtonLabel(column)">
                      {{ column.title }}<v-icon size="14">{{ templateSortIcon(column.key) }}</v-icon>
                    </button>
                  </div>
                  <div>Acciones</div>
                </div>
              </th>
            </tr>
          </template>
          <template #item="{ item }">
            <tr>
              <td :colspan="headers.length" class="template-row-shell">
                <div class="template-readable-row">
                  <div>
                    <strong class="template-cell-title">{{ item.name || 'Sin nombre' }}</strong>
                    <span class="template-muted">Configuración de bloques y campos</span>
                  </div>
                  <div><BusgoChip color="#2454d6">{{ item.tripType || '—' }}</BusgoChip></div>
                  <div><BusgoChip :color="item.status === 'active' ? '#16845b' : '#64748b'">
                    {{ item.status === 'active' ? 'Activa' : 'Inactiva' }}
                  </BusgoChip></div>
                  <div class="template-date"><v-icon size="15">mdi-calendar-clock-outline</v-icon><span>{{ formatDate(item.updatedAt) }}</span></div>
                  <div class="template-row-actions">
                    <v-btn icon="mdi-eye-outline" variant="text" size="small" color="#2454d6"
                      title="Ver configuración" aria-label="Ver configuración" @click="viewTemplate(item)" />
                    <v-btn icon="mdi-pencil-outline" variant="text" size="small" color="#2454d6"
                      title="Editar plantilla" aria-label="Editar plantilla" @click="editTemplate(item)" />
                    <v-btn icon="mdi-content-copy" variant="text" size="small" color="#2454d6"
                      title="Duplicar plantilla" aria-label="Duplicar plantilla" @click="duplicateTemplate(item)" />
                    <v-btn :icon="item.status === 'active' ? 'mdi-toggle-switch' : 'mdi-toggle-switch-off'"
                      variant="text" size="small" :color="item.status === 'active' ? '#16845b' : '#64748b'"
                      :title="item.status === 'active' ? 'Desactivar' : 'Activar'"
                      :aria-label="item.status === 'active' ? 'Desactivar' : 'Activar'" @click="toggleTemplateStatus(item)" />
                    <v-btn icon="mdi-trash-can-outline" variant="text" size="small" color="#dc2626"
                      title="Eliminar plantilla" aria-label="Eliminar plantilla" @click="confirmDelete(item)" />
                  </div>
                </div>
              </td>
            </tr>
          </template>
        </v-data-table>
      </v-card>
    </v-container>

    <v-dialog v-model="dialog" fullscreen persistent transition="dialog-bottom-transition"
      :no-click-animation="true" @keydown.esc="cancelDialog">
      <v-card v-if="draft" class="ticket-dialog">
        <header class="ticket-dialog-header">
          <div class="ticket-dialog-heading">
            <div class="ticket-dialog-icon"><v-icon size="21">mdi-ticket-confirmation-outline</v-icon></div>
            <div>
              <div class="ticket-dialog-title">{{ dialogTitle }}</div>
              <div class="ticket-dialog-subtitle">Configura el contenido y revisa cómo quedará el ticket impreso</div>
            </div>
          </div>
          <div class="ticket-dialog-meta">
            <span>{{ readOnly ? 'Modo consulta' : 'Configuración del ticket' }}</span>
            <strong>{{ draft.tripType || 'Tipo de viaje pendiente' }}</strong>
          </div>
          <v-btn icon="mdi-close" variant="text" class="ticket-dialog-close"
            aria-label="Cerrar configuración" :disabled="saving" @click="cancelDialog" />
        </header>

        <v-card-text class="ticket-dialog-body pa-0">
          <v-form class="ticket-form" :disabled="readOnly || saving" @submit.prevent="saveTemplate">
            <div class="ticket-editor-scroll">
              <div class="ticket-editor-surface">
              <section class="ticket-general-section">
                <div class="ticket-editor-section-heading">
                  <div class="ticket-configuration-icon"><v-icon size="19">mdi-file-document-edit-outline</v-icon></div>
                  <h2>Datos generales</h2>
                </div>
                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field v-model="draft.name" label="Nombre de la plantilla" prepend-inner-icon="mdi-text-box-outline"
                      variant="outlined" density="compact" :rules="nameRules" hide-details="auto" />
                  </v-col>
                  <v-col cols="12" md="3">
                    <v-select v-model="draft.tripType" :items="tripTypeOptions" label="Tipo de viaje"
                      prepend-inner-icon="mdi-ticket-outline" variant="outlined" density="compact" hide-details="auto"
                      :rules="[(value) => !!value || 'Selecciona el tipo de viaje']" />
                  </v-col>
                  <v-col cols="12" md="3">
                    <v-select v-model="draft.status" :items="statusOptionsLabels" label="Estado"
                      prepend-inner-icon="mdi-toggle-switch-outline" variant="outlined" density="compact" hide-details="auto" />
                  </v-col>
                </v-row>
              </section>

              <section class="ticket-configuration" aria-labelledby="ticket-configuration-title">
                <div class="ticket-configuration-heading">
                  <div class="ticket-configuration-icon"><v-icon size="21">mdi-tune-variant</v-icon></div>
                  <div>
                    <h2 id="ticket-configuration-title">Configuración del ticket</h2>
                    <p>Activa o desactiva los bloques y selecciona los campos que aparecerán en el ticket.</p>
                  </div>
                </div>
                <div class="ticket-config-grid">
                  <div v-for="(groups, columnIndex) in blockGroupColumns" :key="columnIndex" class="ticket-config-column">
                    <section v-for="group in groups" :key="group.title" class="ticket-config-section"
                        :style="{ order: blockGroups.indexOf(group) }">
                      <div class="ticket-config-toolbar">
                        <div class="ticket-config-toolbar-icon"><v-icon size="19">{{ group.icon }}</v-icon></div>
                        <strong>{{ group.title }}</strong>
                      </div>
                      <div class="ticket-block-list">
                        <section v-for="key in group.keys" :key="key" class="ticket-block"
                          :class="{ 'ticket-block--disabled': !draft.config.blocks[key].enabled }">
                          <div class="ticket-block-heading">
                            <div class="ticket-block-label">
                              <v-icon size="18">{{ blockIcons[key] }}</v-icon>
                              <strong>{{ blockDefinitions[key].label }}</strong>
                            </div>
                            <div class="ticket-block-toggle">
                              <span>{{ draft.config.blocks[key].enabled ? 'Visible' : 'Oculto' }}</span>
                              <v-switch v-model="draft.config.blocks[key].enabled" color="#16845b"
                                :true-value="true" :false-value="false" density="compact" hide-details inset
                                :aria-label="blockDefinitions[key].label" />
                            </div>
                          </div>
                          <div v-if="draft.config.blocks[key].enabled && hasBlockOptions(key)" class="ticket-block-options">
                            <div v-if="blockDefinitions[key].fields" class="ticket-field-grid">
                              <v-checkbox v-for="(fieldLabel, fieldKey) in blockDefinitions[key].fields" :key="fieldKey"
                                v-model="draft.config.blocks[key].fields[fieldKey]" :label="fieldLabel"
                                color="#2454d6" density="compact" hide-details />
                            </div>
                            <v-text-field v-if="blockDefinitions[key].textKey"
                              v-model="draft.config.blocks[key][blockDefinitions[key].textKey]"
                              :label="blockDefinitions[key].textLabel" variant="outlined" density="compact" hide-details="auto" />

                            <template v-if="key === 'seats'">
                              <v-checkbox v-model="draft.config.blocks.seats.hideWhenEmpty"
                                label="Ocultar bloque cuando no existan asientos" color="#2454d6" density="compact" hide-details />
                              <div class="ticket-option-grid">
                                <v-text-field v-model="draft.config.blocks.seats.title" label="Título de asientos"
                                  variant="outlined" density="compact" hide-details="auto" />
                                <v-text-field v-model="draft.config.blocks.seats.emptyMessage" label="Mensaje sin asientos"
                                  variant="outlined" density="compact" hide-details="auto" />
                              </div>
                            </template>
                            <div v-if="key === 'fareDetails'" class="ticket-field-grid">
                              <v-checkbox v-for="(label, column) in fareColumnLabels" :key="column"
                                v-model="draft.config.blocks.fareDetails.columns[column]" :label="label"
                                color="#2454d6" density="compact" hide-details />
                            </div>
                            <template v-if="key === 'qr'">
                              <div class="ticket-qr-size-label"><span>Tamaño del QR</span><strong>{{ draft.config.blocks.qr.size }} px</strong></div>
                              <v-slider v-model="draft.config.blocks.qr.size" :min="72" :max="180" :step="4"
                                color="#2454d6" aria-label="Tamaño del QR" thumb-label hide-details />
                              <v-checkbox v-model="draft.config.blocks.qr.centered" label="Centrar código QR"
                                color="#2454d6" density="compact" hide-details />
                            </template>
                            <template v-if="key === 'footer'">
                              <div class="ticket-field-grid">
                                <v-checkbox v-for="(label, field) in footerFieldLabels" :key="field"
                                  v-model="draft.config.blocks.footer.fields[field]" :label="label"
                                  color="#2454d6" density="compact" hide-details />
                              </div>
                              <v-text-field v-model="draft.config.blocks.footer.optionalText" label="Texto adicional opcional"
                                variant="outlined" density="compact" hide-details="auto"
                                :disabled="readOnly || saving || !draft.config.blocks.footer.fields.optionalText" />
                            </template>
                          </div>
                        </section>
                      </div>
                    </section>
                  </div>
                </div>

                <section class="ticket-config-section ticket-format-section">
                  <div class="ticket-config-toolbar">
                    <div class="ticket-config-toolbar-icon"><v-icon size="19">mdi-format-line-spacing</v-icon></div>
                    <strong>Formato de impresión</strong>
                  </div>
                  <div class="ticket-format-options">
                    <v-checkbox v-model="draft.config.showSeparators" label="Mostrar separadores entre bloques"
                      color="#2454d6" density="compact" hide-details />
                    <v-select v-model="draft.config.spacing" :items="spacingOptions" label="Espaciado"
                      variant="outlined" density="compact" hide-details class="ticket-spacing-select" />
                  </div>
                </section>
              </section>
              </div>
            </div>

            <aside class="ticket-live-preview" aria-label="Vista previa del ticket">
              <div class="ticket-preview-heading">
                <v-icon size="20">mdi-receipt-text-outline</v-icon>
                <div><strong>Tu ticket</strong><span>Vista previa con datos de ejemplo</span></div>
              </div>
              <div class="ticket-preview-meta">
                <strong>{{ draft.name.trim() || 'Nueva plantilla' }}</strong>
                <div><BusgoChip color="#2454d6">{{ draft.tripType || '—' }}</BusgoChip>
                  <BusgoChip :color="draft.status === 'active' ? '#16845b' : '#64748b'">
                    {{ draft.status === 'active' ? 'Activa' : 'Inactiva' }}
                  </BusgoChip>
                </div>
              </div>
              <div class="ticket-preview-canvas">
                <div class="thermal-paper" :class="{ compact: draft.config.spacing === 'compact', 'thermal-paper--no-separators': !draft.config.showSeparators }">
                  <header v-if="draft.config.blocks.logo.enabled" class="busgo-ticket-logo-header">
                    <div class="logo-box">TV</div>
                  </header>

                  <div v-if="shouldRenderCompany" class="ticket-section company-section">
                    <strong v-if="draft.config.blocks.companyData.fields.name" class="ticket-company-name">{{ previewData.company.name }}</strong>
                    <div v-if="draft.config.blocks.companyData.fields.rut" class="ticket-row">RUT {{ previewData.company.rut }}</div>
                    <div v-if="draft.config.blocks.companyData.fields.address" class="ticket-row">{{ previewData.company.address }}</div>
                  </div>

                  <div v-if="draft.config.blocks.tripTitle.enabled" class="ticket-section title-section">
                    <div class="ticket-title">{{ draft.config.blocks.tripTitle.text || 'DETALLE DEL VIAJE' }}</div>
                  </div>

                  <div v-if="shouldRenderRoute" class="ticket-section route-section">
                    <div v-if="draft.config.blocks.route.fields.origin" class="ticket-place">
                      <span class="ticket-small-label">Origen</span>
                      <strong>{{ previewData.trip.origin }}</strong>
                    </div>
                    <div v-if="draft.config.blocks.route.fields.destination" class="ticket-place ticket-place--destination">
                      <span class="ticket-small-label">Destino</span>
                      <strong>{{ previewData.trip.destination }}</strong>
                    </div>
                    <div v-if="draft.config.blocks.route.fields.tripId" class="ticket-trip-id"><span>ID del viaje</span><strong>{{ previewTripId }}</strong></div>
                  </div>

                  <div v-if="shouldRenderDateTime" class="ticket-section ticket-schedule-grid">
                    <div v-if="draft.config.blocks.dateTime.fields.tripDate" class="ticket-schedule-item">
                      <span class="ticket-small-label">Fecha del viaje</span>
                      <strong>{{ previewData.schedule.tripDate }}</strong>
                    </div>
                    <div v-if="draft.config.blocks.dateTime.fields.departureTime" class="ticket-schedule-item">
                      <span class="ticket-small-label">Hora de salida</span>
                      <strong class="ticket-departure-time">{{ previewData.schedule.departureTime }}</strong>
                    </div>
                    <div v-if="draft.config.blocks.dateTime.fields.arrivalDate" class="ticket-schedule-item">
                      <span class="ticket-small-label">Fecha de llegada</span>
                      <strong>{{ previewData.schedule.arrivalDate }}</strong>
                    </div>
                    <div v-if="draft.config.blocks.dateTime.fields.arrivalTime" class="ticket-schedule-item">
                      <span class="ticket-small-label">Hora de llegada</span>
                      <strong>{{ previewData.schedule.arrivalTime }}</strong>
                    </div>
                  </div>

                  <div v-if="shouldRenderVehicle" class="ticket-section vehicle-section">
                    <div class="ticket-subtitle">Datos del vehículo</div>
                    <div class="ticket-vehicle-grid">
                      <div v-if="draft.config.blocks.vehicleData.fields.vehiclePlate">
                        <span class="ticket-small-label">Patente</span><strong>{{ previewVehicle.vehiclePlate }}</strong>
                      </div>
                      <div v-if="draft.config.blocks.vehicleData.fields.internalNumber">
                        <span class="ticket-small-label">N° interno</span><strong>{{ previewVehicle.internalNumber }}</strong>
                      </div>
                    </div>
                  </div>

                  <div v-if="shouldRenderSeats" class="ticket-section seats-section">
                    <div class="ticket-subtitle">{{ draft.config.blocks.seats.title || 'ASIENTO(S)' }}</div>
                    <div v-if="previewData.seats.length" class="ticket-seat-list">
                      <strong v-for="(seat, index) in previewData.seats" :key="index" class="ticket-seat-number">{{ seat.number }}</strong>
                    </div>
                    <div v-else class="ticket-row ticket-empty-seats">{{ draft.config.blocks.seats.emptyMessage || 'NO HAY ASIENTOS REGISTRADOS' }}</div>
                  </div>

                  <div v-if="draft.config.blocks.paymentTitle.enabled" class="ticket-section title-section">
                    <div class="ticket-title">{{ draft.config.blocks.paymentTitle.text || 'DETALLE DE PAGO' }}</div>
                  </div>

                  <div v-if="draft.config.blocks.fareDetails.enabled && Object.values(draft.config.blocks.fareDetails.columns).some(Boolean)" class="ticket-section fare-section">
                    <table class="fare-table" aria-label="Detalle de pasajes">
                      <thead>
                        <tr>
                          <th v-if="draft.config.blocks.fareDetails.columns.type" scope="col">Pasaje</th>
                          <th v-if="draft.config.blocks.fareDetails.columns.quantity" scope="col" class="fare-quantity">Cant.</th>
                          <th v-if="draft.config.blocks.fareDetails.columns.unitPrice" scope="col" class="fare-amount">Precio</th>
                          <th v-if="draft.config.blocks.fareDetails.columns.subtotal" scope="col" class="fare-amount">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(fare, index) in previewData.fares" :key="index">
                          <td v-if="draft.config.blocks.fareDetails.columns.type">{{ fare.type }}</td>
                          <td v-if="draft.config.blocks.fareDetails.columns.quantity" class="fare-quantity">{{ fare.quantity }}</td>
                          <td v-if="draft.config.blocks.fareDetails.columns.unitPrice" class="fare-amount">{{ formatCurrency(fare.unitPrice) }}</td>
                          <td v-if="draft.config.blocks.fareDetails.columns.subtotal" class="fare-amount">{{ formatCurrency(fare.subtotal) }}</td>
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

                  <div v-if="draft.config.blocks.paymentMethod.enabled" class="ticket-section ticket-reference-section">
                    <div class="ticket-reference-row">
                      <span>{{ draft.config.blocks.paymentMethod.label || 'Medio de pago' }}</span>
                      <strong>{{ draft.config.blocks.paymentMethod.value || previewData.paymentMethod }}</strong>
                    </div>
                  </div>
                  <div v-if="draft.config.blocks.transactionNumber.enabled" class="ticket-section ticket-reference-section">
                    <div class="ticket-reference-row">
                      <span>{{ draft.config.blocks.transactionNumber.label || 'N° Transacción' }}</span>
                      <strong class="ticket-reference-number">{{ draft.config.blocks.transactionNumber.value || previewData.transactionNumber }}</strong>
                    </div>
                  </div>

                  <div v-if="draft.config.blocks.qr.enabled" class="ticket-section qr-section">
                    <div class="qr-wrapper" :style="{ width: `${draft.config.blocks.qr.size}px`, margin: draft.config.blocks.qr.centered ? '0 auto' : '0' }">
                      <img :src="previewQrUrl" :width="draft.config.blocks.qr.size" :height="draft.config.blocks.qr.size" alt="Código QR de ejemplo" class="qr-image" />
                    </div>
                  </div>

                  <div v-if="shouldRenderFooter" class="ticket-section footer-section">
                    <div v-if="draft.config.blocks.footer.fields.copyControl" class="ticket-row ticket-copy-label">Copia de control</div>
                    <div v-if="draft.config.blocks.footer.fields.transactionId" class="ticket-row">ID {{ previewData.footer.transactionId }}</div>
                    <div v-if="draft.config.blocks.footer.fields.optionalText" class="ticket-row">{{ draft.config.blocks.footer.optionalText || 'Ticket emitido por la sucursal principal' }}</div>
                  </div>
                </div>

              </div>
              <div class="ticket-preview-note"><v-icon size="16">mdi-information-outline</v-icon>
                <span>{{ readOnly ? 'Esta vista muestra la configuración guardada.' : 'La vista previa se actualiza al cambiar los bloques. Los cambios se guardan al confirmar la plantilla.' }}</span>
              </div>
            </aside>
          </v-form>
        </v-card-text>

        <footer class="ticket-dialog-actions">
          <v-btn variant="flat" class="ticket-secondary-btn" :disabled="saving" @click="cancelDialog">
            {{ readOnly ? 'Cerrar' : 'Cancelar' }}
          </v-btn>
          <v-spacer />
          <v-btn v-if="!readOnly" prepend-icon="mdi-restore" variant="flat" class="ticket-secondary-btn"
            :disabled="saving" @click="restoreDefaultConfig">Restaurar</v-btn>
          <v-btn v-if="!readOnly" prepend-icon="mdi-check" variant="flat" class="ticket-primary-btn"
            :loading="saving" :disabled="saving || !isDraftValid" @click="saveTemplate">Guardar plantilla</v-btn>
        </footer>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialogConfirm" max-width="500px">
      <v-card class="busgo-dialog-card template-small-dialog">
        <v-toolbar :color="confirmationAction === 'discard' ? paleteColors.error : paleteColors.primary">
          <v-icon class="ml-4" size="21">{{ confirmationAction === 'discard' ? 'mdi-close-circle-outline' : 'mdi-restore' }}</v-icon>
          <span class="text-subtitle-2 ml-3">{{ confirmationTitle }}</span>
        </v-toolbar>
        <v-card-text class="mt-2 mb-2">{{ confirmationMessage }}</v-card-text>
        <v-divider />
        <v-card-actions class="busgo-dialog-actions">
          <v-spacer />
          <v-btn variant="flat" class="ticket-secondary-btn" @click="dialogConfirm = false">Cancelar</v-btn>
          <v-btn :color="confirmationAction === 'discard' ? paleteColors.error : paleteColors.primary"
            variant="flat" @click="applyConfirmation">
            {{ confirmationAction === 'discard' ? 'Descartar cambios' : 'Restaurar' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialogDelete" max-width="500px" :persistent="deleting">
      <v-card class="busgo-dialog-card template-small-dialog">
        <v-toolbar :color="paleteColors.error">
          <v-icon class="ml-4" size="21">mdi-trash-can-outline</v-icon>
          <span class="text-subtitle-2 ml-3">Eliminar plantilla de ticket</span>
        </v-toolbar>
        <v-card-text class="mt-2 mb-2">¿Desea eliminar la plantilla <strong>{{ selectedTemplateName }}</strong>?</v-card-text>
        <v-divider />
        <v-card-actions class="busgo-dialog-actions">
          <v-spacer />
          <v-btn variant="flat" class="ticket-secondary-btn" :disabled="deleting" @click="dialogDelete = false">Cancelar</v-btn>
          <v-btn :color="paleteColors.error" variant="flat" :loading="deleting" :disabled="deleting"
            @click="deleteTemplateConfirmed">Eliminar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
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
import { paleteColors } from '@/assets/colors';
import BusgoChip from '@/components/BusgoChip.vue';

export default {
  name: 'TicketTemplateView',
  components: { BusgoChip },
  data: () => ({
    snackbar: false,
    sb_type: '',
    sb_message: '',
    sb_timeout: 3000,
    sb_title: '',
    sb_icon: '',
    paleteColors: paleteColors,
    loading: false,
    saving: false,
    deleting: false,
    dialog: false,
    dialogDelete: false,
    dialogConfirm: false,
    confirmationAction: '',
    readOnly: false,
    search: '',
    filterType: null,
    filterStatus: null,
    templateSortBy: '',
    templateSortOrder: 'asc',
    sortableColumns: [
      { title: 'Nombre', key: 'name' },
      { title: 'Tipo de viaje', key: 'tripType' },
      { title: 'Estado', key: 'status' },
      { title: 'Actualización', key: 'updatedAt' },
    ],
    spacingOptions: [
      { title: 'Compacto', value: 'compact' },
      { title: 'Cómodo', value: 'comfortable' },
    ],
    blockGroups: [
      { title: 'Encabezado del ticket', description: 'Identidad de la empresa y título del viaje.', icon: 'mdi-domain', keys: ['logo', 'companyData', 'tripTitle'] },
      { title: 'Datos del viaje', description: 'Trayecto, horarios, vehículo y asientos.', icon: 'mdi-map-marker-path', keys: ['route', 'dateTime', 'vehicleData', 'seats'] },
      { title: 'Detalle del pago', description: 'Pasajes, total y datos de la transacción.', icon: 'mdi-credit-card-outline', keys: ['paymentTitle', 'fareDetails', 'total', 'paymentMethod', 'transactionNumber'] },
      { title: 'Validación y control', description: 'Código QR y datos del pie del ticket.', icon: 'mdi-qrcode', keys: ['qr', 'footer'] },
    ],
    blockIcons: {
      logo: 'mdi-image-outline', companyData: 'mdi-domain', tripTitle: 'mdi-format-title',
      route: 'mdi-map-marker-path', dateTime: 'mdi-calendar-clock-outline', vehicleData: 'mdi-bus', seats: 'mdi-seat-passenger',
      paymentTitle: 'mdi-format-title', fareDetails: 'mdi-ticket-outline', total: 'mdi-cash',
      paymentMethod: 'mdi-credit-card-outline', transactionNumber: 'mdi-pound', qr: 'mdi-qrcode', footer: 'mdi-clipboard-check-outline',
    },
    fareColumnLabels: { type: 'Tipo de pasaje', quantity: 'Cantidad', unitPrice: 'Precio unitario', subtotal: 'Subtotal' },
    footerFieldLabels: { copyControl: 'Copia de control', transactionId: 'ID de transacción', optionalText: 'Texto adicional' },
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
          tripId: 'Identificador del viaje',
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
      vehicleData: {
        label: 'Datos del vehículo',
        switchable: true,
        fields: {
          vehiclePlate: 'Patente del vehículo',
          internalNumber: 'Número interno',
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
    blockGroupColumns() {
      return [
        this.blockGroups.filter((group, index) => index % 2 === 0),
        this.blockGroups.filter((group, index) => index % 2 === 1),
      ];
    },
    confirmationTitle() {
      return this.confirmationAction === 'discard' ? 'Descartar cambios' : 'Restaurar configuración';
    },
    confirmationMessage() {
      return this.confirmationAction === 'discard'
        ? '¿Desea descartar los cambios sin guardar?'
        : '¿Desea restaurar la configuración inicial del ticket?';
    },
    filteredTemplates() {
      return this.templates.filter((item) => {
        const q = this.search.trim().toLowerCase();
        const matchSearch = !q || String(item.name || '').toLowerCase().includes(q);
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
    previewTripId() {
      const trip = this.previewData.trip || {};
      // El servicio de ejemplos anterior no incluía el identificador del viaje.
      return trip.id ?? trip.tripId ?? trip.trip_id ?? this.previewData.tripId ?? this.previewData.trip_id ?? '5238';
    },
    shouldRenderCompany() {
      const block = this.draft?.config?.blocks?.companyData;
      return !!(block?.enabled && (
        block.fields.name || block.fields.rut || block.fields.address
      ));
    },
    shouldRenderRoute() {
      return this.hasVisibleFields('route');
    },
    shouldRenderDateTime() {
      return this.hasVisibleFields('dateTime');
    },
    shouldRenderFooter() {
      return this.hasVisibleFields('footer');
    },
    previewVehicle() {
      const vehicle = this.previewData.vehicle || {};
      const footer = this.previewData.footer || {};
      return {
        vehiclePlate: vehicle.vehiclePlate ?? vehicle.plate ?? footer.vehiclePlate ?? 'JJBW-13',
        internalNumber: vehicle.internalNumber ?? vehicle.internal_number ?? footer.internalNumber ?? footer.internal_number ?? '23',
      };
    },
    shouldRenderVehicle() {
      const block = this.draft?.config?.blocks?.vehicleData;
      return !!(block?.enabled && (block.fields?.vehiclePlate || block.fields?.internalNumber));
    },
    previewQrUrl() {
      const payload = buildQrPayload({
        transactionId: this.previewData.footer.transactionId,
        vehiclePlate: this.previewData.footer.vehiclePlate,
        company: this.previewData.company.name,
        tripType: this.draft?.tripType || 'Express',
      });
      return `https://api.qrserver.com/v1/create-qr-code/?size=${this.draft?.config?.blocks?.qr?.size || 120}x${this.draft?.config?.blocks?.qr?.size || 120}&qzone=4&margin=0&format=svg&color=000000&bgcolor=ffffff&data=${encodeURIComponent(payload)}`;
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
    sortedTemplates() {
      const direction = this.templateSortOrder === 'desc' ? -1 : 1;
      return [...this.filteredTemplates].sort((a, b) => {
        if (!this.templateSortBy) {
          if (a.status !== b.status) return a.status === 'active' ? -1 : 1;
          return String(a.name || '').localeCompare(String(b.name || ''), 'es', { numeric: true, sensitivity: 'base' });
        }
        if (this.templateSortBy === 'updatedAt') {
          return ((Date.parse(a.updatedAt) || 0) - (Date.parse(b.updatedAt) || 0)) * direction;
        }
        const value = (item) => this.templateSortBy === 'status'
          ? (item.status === 'active' ? 'Activa' : 'Inactiva')
          : String(item[this.templateSortBy] || '');
        return value(a).localeCompare(value(b), 'es', { numeric: true, sensitivity: 'base' }) * direction;
      });
    },
  },
  mounted() {
    this.ensureAccess();
    this.loadTemplates();
  },
  methods: {
    hasVisibleFields(key) {
      const block = this.draft?.config?.blocks?.[key];
      return !!(block?.enabled && Object.values(block.fields || {}).some(Boolean));
    },
    hasBlockOptions(key) {
      const block = this.blockDefinitions[key];
      return !!(block.fields || block.textKey || ['seats', 'fareDetails', 'qr', 'footer'].includes(key));
    },
    templateSortIcon(field) {
      if (this.templateSortBy !== field) return 'mdi-swap-vertical';
      return this.templateSortOrder === 'asc' ? 'mdi-arrow-up' : 'mdi-arrow-down';
    },
    toggleTemplateSort(field) {
      if (this.templateSortBy === field) {
        this.templateSortOrder = this.templateSortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        this.templateSortBy = field;
        this.templateSortOrder = 'asc';
      }
    },
    sortButtonLabel(column) {
      const nextOrder = this.templateSortBy === column.key && this.templateSortOrder === 'asc' ? 'descendente' : 'ascendente';
      return `Ordenar por ${column.title.toLowerCase()} en orden ${nextOrder}`;
    },
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
      // Completa propiedades faltantes de plantillas anteriores sin perder sus valores.
      const defaults = getDefaultTicketTemplateConfig();
      const merge = (base, saved) => {
        const result = { ...base };
        Object.entries(saved || {}).forEach(([key, value]) => {
          result[key] = value && typeof value === 'object' && !Array.isArray(value)
            ? merge(base?.[key] || {}, value)
            : value;
        });
        return result;
      };
      const merged = merge(defaults, config);
      const routeFields = merged.blocks.route.fields;
      // Reemplaza el indicador anterior conservando su visibilidad configurada.
      routeFields.tripId = routeFields.tripId ?? routeFields.direction ?? true;
      delete routeFields.direction;
      const footer = merged.blocks.footer;
      const vehicleDefaults = {
        enabled: true,
        fields: { vehiclePlate: true, internalNumber: true },
      };
      if (!merged.blocks.vehicleData) {
        // Conserva la visibilidad de los datos de vehículo en plantillas anteriores.
        merged.blocks.vehicleData = {
          enabled: footer?.enabled ?? true,
          fields: {
            vehiclePlate: footer?.fields?.vehiclePlate ?? true,
            internalNumber: footer?.fields?.internalNumber ?? true,
          },
        };
      } else {
        merged.blocks.vehicleData = merge(vehicleDefaults, merged.blocks.vehicleData);
      }
      // Estos campos se muestran únicamente en su nueva sección.
      if (footer?.fields) {
        footer.fields.vehiclePlate = false;
        if (Object.prototype.hasOwnProperty.call(footer.fields, 'internalNumber')) {
          footer.fields.internalNumber = false;
        }
      }
      return JSON.parse(JSON.stringify(merged));
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
        name: template.name || '',
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
    initialize() {
      this.loadTemplates();
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
      if (this.saving || this.dialogConfirm) return;
      if (this.readOnly) {
        this.dialog = false;
        return;
      }

      const dirty = JSON.stringify(this.draft) !== JSON.stringify(this.originalDraft);
      if (dirty) {
        this.confirmationAction = 'discard';
        this.dialogConfirm = true;
        return;
      }
      this.dialog = false;
      this.draft = null;
      this.originalDraft = null;
    },
    restoreDefaultConfig() {
      if (this.readOnly || this.saving || !this.draft) return;
      this.confirmationAction = 'restore';
      this.dialogConfirm = true;
    },
    applyConfirmation() {
      if (this.readOnly || this.saving || !this.draft) return;
      if (this.confirmationAction === 'restore') {
        this.draft.config = this.cloneConfig(getDefaultTicketTemplateConfig());
      } else if (this.confirmationAction === 'discard') {
        this.dialog = false;
        this.draft = null;
        this.originalDraft = null;
      }
      this.dialogConfirm = false;
      this.confirmationAction = '';
    },
    async saveTemplate() {
      if (this.readOnly || this.saving) return;
      if (!this.isDraftValid) {
        this.showAlert('warning', 'Debe completar nombre y tipo de viaje.', 3000);
        return;
      }

      const trimmedName = this.draft.name.trim();
      const duplicated = this.templates.some((item) => {
        return String(item.name || '').trim().toLowerCase() === trimmedName.toLowerCase() && String(item.id) !== String(this.draft.id);
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
/* Superficie y listado: mismas medidas y colores que Plantillas de Viajes. */
.ticket-templates-view { min-height:100%; background:#f6f8fb; color:#1e293b; }
.busgo-page-header { display:flex; align-items:center; gap:11px; min-height:70px; padding:12px 24px; background:#fff; border-bottom:1px solid #e8edf5; border-radius:0!important; }
.busgo-page-icon { flex:0 0 38px; width:38px!important; height:38px!important; border-radius:10px!important; color:#fff!important; background:#173b8f!important; }
.busgo-page-heading { min-width:0; }
.busgo-page-title { font-size:19px; font-weight:800; color:#0f172a; line-height:1.2; }
.busgo-page-subtitle { font-size:12px; color:#526176; line-height:1.5; margin-top:4px; }
.busgo-add-btn { min-height:40px; background:#2454d6!important; color:#fff!important; border-radius:9px; font-size:12.5px; font-weight:750; letter-spacing:0; text-transform:none; }
.busgo-container { padding:18px 24px 28px!important; }
.busgo-card { background:#fff; border:1px solid #e4eaf2; border-radius:12px; overflow:hidden; }
.busgo-card-header { display:flex; align-items:center; justify-content:space-between; padding:18px 20px 16px; }
.busgo-card-title { font-size:15px; font-weight:800; color:#0f172a; }
.busgo-card-subtitle { font-size:12px; color:#526176; margin-top:4px; line-height:1.5; }
.ticket-template-toolbar { display:flex; align-items:center; flex-wrap:wrap; gap:12px; padding:0 20px 16px; }
.ticket-template-filter { flex:0 1 220px; min-width:160px; }
.ticket-template-filter--status { flex-basis:180px; }
.ticket-template-search { flex:0 1 320px; min-width:240px; }
.ticket-template-toolbar :deep(.v-field) { background:#fff; border-radius:9px; color:#233654; }
.ticket-template-toolbar :deep(.v-field__input) { font-size:14px; color:#233654; }
.ticket-template-toolbar :deep(.v-field__outline) { color:#c5cfdd; }
.ticket-template-toolbar :deep(.v-label) { color:#475569; opacity:1; font-size:13px; }
.template-list-table :deep(.v-table__wrapper) { overflow-x:auto; }
.template-list-table :deep(.v-table__wrapper > table) { min-width:980px; width:100%; table-layout:fixed; }
.template-list-table :deep(th.template-header-shell) { height:auto!important; padding:0!important; border:0!important; }
.template-list-table :deep(td.template-row-shell) { padding:0!important; border:0!important; }
.template-readable-head,.template-readable-row { display:grid; grid-template-columns:minmax(220px,1.7fr) minmax(125px,1fr) minmax(95px,.75fr) minmax(185px,1.2fr) 180px; align-items:center; gap:14px; padding:12px 18px; min-width:980px; width:100%; box-sizing:border-box; }
.template-readable-head { background:#f3f6fa; color:#334155; font-size:11px; font-weight:750; border-bottom:1px solid #e4eaf2; }
.template-heading-group { display:flex; min-width:0; }
.template-sort-button { display:flex; align-items:center; gap:5px; text-align:left; font:inherit; color:inherit; cursor:pointer; width:fit-content; background:none; border:0; }
.template-sort-button:hover { color:#2454d6; }
.template-sort-button:focus-visible { outline:2px solid #2454d6; outline-offset:3px; border-radius:3px; }
.template-readable-row { min-height:86px; background:#fff; border-bottom:1px solid #e8edf5; color:#334155; font-size:13px; }
.template-readable-row:hover { background:#f8faff; }
.template-readable-row > div { min-width:0; }
.template-cell-title { display:block; font-size:13px; color:#1e293b; font-weight:750; line-height:1.5; white-space:normal; overflow-wrap:anywhere; }
.template-muted { display:block; color:#64748b; font-size:11px; line-height:1.5; margin-top:5px; }
.template-date { display:flex; align-items:flex-start; gap:6px; color:#475569; font-size:12px; line-height:1.5; }
.template-date > .v-icon { flex-shrink:0; margin-top:2px; color:#64748b; }
.template-row-actions { display:flex; align-items:center; gap:0; }
.template-row-actions .v-btn { flex:0 0 36px; border-radius:8px; width:36px; height:36px; }
.template-row-actions :deep(.v-icon) { font-size:18px; }
.template-list-table :deep(.v-data-table-footer) { padding:6px 16px; font-size:12px; color:#475569; min-height:52px; }
.template-alert { display:flex; gap:10px; align-items:center; font-size:12px; }
.template-alert strong { display:block; font-size:13px; margin-bottom:3px; }

/* Nombres propios para evitar colisiones con los estilos globales de viajes. */
.ticket-dialog { display:flex; flex-direction:column; min-height:0; height:100vh; height:100dvh; color:#1e293b; background:#f6f8fb; border-radius:0; }
.ticket-dialog-header { z-index:2; display:grid; flex:0 0 auto; grid-template-columns:minmax(0,1fr) auto 42px; align-items:center; gap:18px; min-height:72px; padding:11px 22px; color:#fff; background:radial-gradient(circle at 88% -40%,rgba(53,184,232,.38),transparent 230px),linear-gradient(110deg,#0e1f46,#173b8f 58%,#2454d6); box-shadow:0 5px 18px rgba(15,23,42,.18); }
.ticket-dialog-heading { display:flex; align-items:center; gap:11px; min-width:0; }
.ticket-dialog-heading > div:last-child { min-width:0; }
.ticket-dialog-icon { display:grid; flex:0 0 40px; width:40px; height:40px; place-items:center; background:rgba(255,255,255,.13); border:1px solid rgba(255,255,255,.17); border-radius:10px; }
.ticket-dialog-title { font-size:17px; font-weight:850; line-height:1.2; }
.ticket-dialog-subtitle { margin-top:3px; overflow:hidden; color:#dbe7ff; font-size:11px; font-weight:600; text-overflow:ellipsis; white-space:nowrap; }
.ticket-dialog-meta { display:flex; align-items:flex-end; flex-direction:column; }
.ticket-dialog-meta span { color:#b8cbf5; font-size:9px; font-weight:800; letter-spacing:.06em; text-transform:uppercase; }
.ticket-dialog-meta strong { margin-top:2px; font-size:12px; font-weight:800; }
.ticket-dialog-close { color:#fff!important; border-radius:9px!important; }
.ticket-dialog-body { display:flex; flex:1 1 auto; flex-direction:column; overflow:hidden; min-height:0; background:#f6f8fb; }
.ticket-form { display:grid; grid-template-columns:minmax(0,1fr) 380px; flex:1 1 auto; min-height:0; overflow:hidden; }
.ticket-editor-scroll { min-width:0; min-height:0; overflow:auto; padding:20px 22px; overscroll-behavior:contain; }
.ticket-editor-surface { min-width:0; padding:18px; background:#fff; border:1px solid #e4eaf2; border-radius:13px; box-shadow:0 4px 16px rgba(15,23,42,.035); }
.ticket-editor-section-heading { display:flex; align-items:center; gap:9px; margin-bottom:12px; }
.ticket-editor-section-heading h2 { color:#0f172a; font-size:15px; font-weight:800; line-height:1.4; }
.ticket-config-column { position:relative; display:flex; flex-direction:column; gap:18px; min-width:0; }
.ticket-config-column + .ticket-config-column::before { position:absolute; left:-12px; top:0; bottom:0; width:1px; background:#edf1f6; content:''; }
.ticket-block-list { overflow:hidden; border:1px solid #e5eaf2; border-radius:10px; background:#fff; }
.ticket-format-section { padding-top:16px; border-top:1px solid #e8edf5; }
.ticket-general-section { padding:0 0 18px; margin:0 0 18px; background:transparent; border:0; border-bottom:1px solid #e8edf5; border-radius:0; box-shadow:none; }
.ticket-general-section :deep(.v-col) { padding:6px 8px; }
.ticket-dialog :deep(.v-field) { background:#fff; border-radius:9px!important; }
.ticket-dialog :deep(.v-label),.ticket-dialog :deep(.v-field__input),.ticket-dialog :deep(.v-select__selection-text) { color:#334155; font-size:14px; font-weight:600; opacity:1; }
.ticket-dialog :deep(.v-field__outline) { color:#c5cfdd; }
.ticket-dialog :deep(.v-field--disabled) { background:#f8fafc; opacity:.78; }
.ticket-configuration { min-width:0; }
.ticket-configuration-heading { display:flex; align-items:center; gap:9px; margin-bottom:16px; padding:0; background:transparent; border:0; border-radius:0; }
.ticket-configuration-icon { display:grid; flex:0 0 30px; width:30px; height:30px; place-items:center; color:#2454d6; background:#eef3ff; border-radius:8px; }
.ticket-configuration-heading h2 { margin:0; color:#0f172a; font-size:15px; font-weight:800; line-height:1.4; }
.ticket-configuration-heading p { margin:4px 0 0; color:#526176; font-size:12px; line-height:1.5; }
.ticket-config-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); align-items:start; gap:24px; margin-bottom:18px; }
.ticket-config-column > .ticket-config-section { min-width:0; margin-bottom:0; }
.ticket-config-section { min-width:0; margin:0; overflow:visible; background:transparent; border:0; border-radius:0; box-shadow:none; }
.ticket-config-section:last-child { margin-bottom:0; }
.ticket-config-toolbar { display:flex; align-items:center; gap:8px; min-height:34px; padding:0 0 8px; color:#233654; background:transparent; border:0; }
.ticket-config-toolbar-icon { display:grid; place-items:center; width:26px; height:26px; flex:0 0 26px; color:#2454d6; background:#eef3ff; border-radius:7px; }
.ticket-config-toolbar strong { display:block; font-size:13px; font-weight:850; }
.ticket-config-toolbar span { display:block; margin-top:3px; color:#64748b; font-size:10.5px; font-weight:600; line-height:1.5; }
.ticket-block { border-bottom:1px solid #edf1f5; }
.ticket-block:last-child { border-bottom:0; }
.ticket-block-heading { display:flex; align-items:center; justify-content:space-between; gap:8px; min-height:40px; padding:4px 12px; }
.ticket-block-label { display:flex; align-items:center; gap:6px; min-width:0; }
.ticket-block-label > .v-icon { flex-shrink:0; color:#64748b; }
.ticket-block-label strong { color:#1e293b; font-size:12px; font-weight:750; }
.ticket-block-toggle { display:flex; align-items:center; flex:0 0 auto; gap:7px; }
.ticket-block-toggle > span { display:none; }
.ticket-block-toggle :deep(.v-selection-control) { min-height:32px; }
.ticket-block-options { display:flex; flex-direction:column; gap:8px; padding:0 12px 12px; }
.ticket-block-options :deep(.v-label),.ticket-format-options :deep(.v-label) { font-size:12px; font-weight:500; }
.ticket-block--disabled .ticket-block-heading { background:#fbfcfe; }
.ticket-block--disabled .ticket-block-label strong { color:#64748b; }
.ticket-field-grid { display:flex; flex-wrap:wrap; gap:0 10px; min-width:0; }
.ticket-option-grid { display:grid; grid-template-columns:1fr; gap:7px; min-width:0; }
.ticket-field-grid > .v-input { flex:0 1 auto; min-width:0; }
.ticket-configuration :deep(.v-checkbox .v-selection-control) { min-height:30px; --v-selection-control-size:30px; }
.ticket-configuration :deep(.v-checkbox .v-selection-control__input > .v-icon) { font-size:19px; }
.ticket-field-grid :deep(.v-label) { white-space:normal; padding-top:0; line-height:1.4; }
.ticket-block-options :deep(.v-field__input) { font-size:13px; }
.ticket-qr-size-label { display:flex; align-items:center; justify-content:space-between; gap:12px; color:#475569; font-size:12px; }
.ticket-qr-size-label strong { color:#2454d6; font-size:11px; }
.ticket-format-options { display:flex; align-items:center; flex-wrap:wrap; gap:12px; padding:10px 12px; border:1px solid #e5eaf2; border-radius:10px; }
.ticket-spacing-select { flex:0 1 210px; min-width:170px; }

/* Vista previa con scroll propio, siempre junto a la configuración en escritorio. */
.ticket-live-preview { min-width:0; min-height:0; overflow-y:auto; padding:22px 18px; background:#fff; border-left:1px solid #e1e8f1; overscroll-behavior:contain; }
.ticket-preview-heading { display:flex; align-items:center; gap:9px; margin-bottom:20px; color:#2454d6; }
.ticket-preview-heading strong { display:block; color:#0f172a; font-size:16px; font-weight:800; }
.ticket-preview-heading span { display:block; margin-top:3px; color:#64748b; font-size:11px; }
.ticket-preview-meta { padding:15px; margin-bottom:14px; border:1px solid #dce6fb; border-radius:12px; background:linear-gradient(145deg,#f0f5ff,#fff); }
.ticket-preview-meta > strong { display:block; margin-bottom:10px; color:#183d9c; font-size:14px; font-weight:800; overflow-wrap:anywhere; }
.ticket-preview-meta > div { display:flex; align-items:center; flex-wrap:wrap; gap:8px; }
.ticket-preview-canvas { padding:16px 10px 22px; background:#f3f6fa; border:1px solid #e4eaf2; border-radius:12px; }
.ticket-preview-note { display:flex; align-items:flex-start; gap:6px; margin-top:14px; color:#64748b; font-size:11px; line-height:1.6; }
.ticket-preview-note > .v-icon { flex-shrink:0; margin-top:2px; }
/* Ticket monocromo: énfasis por tamaño y peso, sin fondos de tinta. */
.thermal-paper { width:100%; max-width:360px; box-sizing:border-box; background:#fff; color:#000; border:1px solid #d9d9d9; padding:18px 15px; margin:0 auto; font-family:Arial,Helvetica,sans-serif; font-size:12px; line-height:1.4; box-shadow:0 4px 12px rgba(0,0,0,.08); overflow-wrap:anywhere; }
.thermal-paper.compact { padding:12px; line-height:1.3; }
.ticket-row,.ticket-section,.ticket-title,.ticket-subtitle { width:100%; }
.ticket-section { border-top:1px dashed #000; padding-top:10px; margin-top:10px; }
.thermal-paper.compact .ticket-section { padding-top:6px; margin-top:6px; }
.ticket-section:first-child { border-top:none; padding-top:0; margin-top:0; }
.thermal-paper--no-separators .ticket-section { border-top:0; }
.ticket-title { font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:.09em; }
.ticket-subtitle { margin-bottom:7px; font-size:9px; font-weight:800; text-transform:uppercase; letter-spacing:.07em; }
.title-section { text-align:center; }
.thermal-paper > .busgo-ticket-logo-header { display:block!important; width:100%; padding:0 0 7px; text-align:center; }
.thermal-paper > .busgo-ticket-logo-header > .logo-box { display:grid!important; place-items:center; width:38px; height:38px; margin:0 auto!important; border:2px solid #000; border-radius:7px; color:#000; font-size:14px; font-weight:800; }
.thermal-paper > .company-section { display:block!important; width:100%; padding-top:0; margin-top:0; border-top:0; text-align:center; font-size:10px; line-height:1.5; }
.thermal-paper .ticket-company-name { display:block!important; width:100%; margin:0 0 7px; text-align:center!important; font-size:17px; font-weight:800; line-height:1.2; }
.route-section { border-top:0; padding-top:8px; margin-top:0; }
.ticket-small-label { display:block; margin-bottom:3px; font-size:9px; font-weight:600; line-height:1.3; text-transform:uppercase; letter-spacing:.04em; }
.ticket-place + .ticket-place { margin-top:9px; }
.ticket-place strong { display:block; font-size:14px; font-weight:700; line-height:1.25; }
.ticket-place--destination strong { font-size:18px; font-weight:800; }
.ticket-trip-id { display:flex; align-items:baseline; justify-content:center; gap:6px; margin-top:9px; font-size:10px; }
.ticket-trip-id span { font-weight:500; }
.ticket-trip-id strong { font-size:11px; font-weight:800; font-variant-numeric:tabular-nums; overflow-wrap:anywhere; }
.ticket-schedule-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:9px 12px; align-items:start; }
.ticket-schedule-item { min-width:0; }
.ticket-schedule-item strong { display:block; font-size:12px; line-height:1.3; font-variant-numeric:tabular-nums; }
.ticket-schedule-item .ticket-departure-time { font-size:23px; font-weight:800; line-height:1; }
.ticket-vehicle-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px; }
.ticket-vehicle-grid strong { display:block; font-size:14px; font-weight:750; font-variant-numeric:tabular-nums; }
.ticket-seat-list { display:flex; flex-wrap:wrap; gap:6px; }
.ticket-seat-number { display:grid; place-items:center; min-width:36px; min-height:30px; padding:3px 7px; color:#000; border:1px solid #000; border-radius:4px; font-size:17px; line-height:1; font-variant-numeric:tabular-nums; }
.ticket-empty-seats { font-size:10px; }
.fare-section { margin-top:0; padding-top:7px; border-top:0; }
.fare-table { width:100%; table-layout:auto; border-collapse:collapse; font-size:11px; }
.fare-table th { border-bottom:1px solid #000; padding:0 3px 5px 0; font-size:9px; font-weight:700; text-align:left; }
.fare-table td { border-bottom:0; padding:6px 3px 0 0; text-align:left; overflow-wrap:anywhere; }
.fare-table .fare-quantity { text-align:center; white-space:nowrap; }
.fare-table .fare-amount { text-align:right; white-space:nowrap; font-variant-numeric:tabular-nums; }
.fare-table th:last-child,.fare-table td:last-child { padding-right:0; }
.total-section { border-top:2px solid #000; padding-top:9px; margin-top:11px; }
.total-row { display:flex; align-items:center; justify-content:space-between; gap:10px; }
.total-row > strong { font-size:12px; font-weight:800; text-transform:uppercase; }
.total-row > span { flex-shrink:0; font-size:23px; font-weight:800; line-height:1.1; font-variant-numeric:tabular-nums; }
.ticket-reference-section { padding-top:7px; margin-top:0; border-top:0; }
.ticket-reference-row { display:flex; align-items:baseline; justify-content:space-between; flex-wrap:wrap; gap:3px 10px; }
.ticket-reference-row > span { font-size:10px; }
.ticket-reference-row > strong { min-width:0; max-width:100%; font-size:11px; text-align:right; overflow-wrap:anywhere; }
.ticket-reference-number { font-family:'Courier New',monospace; font-variant-numeric:tabular-nums; }
.qr-section { padding-top:12px; margin-top:10px; border-top:0; }
.qr-wrapper { max-width:100%; background:#fff; }
.qr-image { display:block; max-width:100%; height:auto; border:0; background:#fff; }
.footer-section { padding-top:8px; margin-top:9px; text-align:center; font-size:9px; line-height:1.5; }
.ticket-copy-label { font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:.06em; }
.muted { opacity:.7; }

/* Acciones fijas fuera de las regiones con scroll. */
.ticket-dialog-actions { display:flex; flex:0 0 auto; align-items:center; gap:10px; padding:14px 22px calc(14px + env(safe-area-inset-bottom)); background:#fff; border-top:1px solid #dfe5ed; }
.ticket-dialog-actions :deep(.v-btn),.busgo-dialog-actions :deep(.v-btn) { min-height:42px; border-radius:9px; font-size:13px; font-weight:800; letter-spacing:0; text-transform:none; }
.ticket-secondary-btn { color:#475569!important; background:#fff!important; border:1px solid #dce3ed; box-shadow:none!important; }
.ticket-primary-btn { color:#fff!important; background:linear-gradient(100deg,#2454d6,#3266e4)!important; box-shadow:0 5px 12px rgba(36,84,214,.18)!important; }
.ticket-primary-btn.v-btn--disabled { background:#e8edf4!important; color:#94a3b8!important; box-shadow:none!important; }
.busgo-dialog-card { border-radius:12px; overflow:hidden; }
.template-small-dialog { border:1px solid #e4eaf2; background:#fff; color:#1e293b; }
.template-small-dialog :deep(.v-toolbar__content) { min-height:56px; height:auto!important; }
.template-small-dialog :deep(.v-card-text) { font-size:14px; color:#334155; }
.busgo-dialog-actions { background:#f8fafc; padding:14px 18px; gap:8px; }

@media (min-width:1440px) {
  .ticket-option-grid { grid-template-columns:repeat(2,minmax(0,1fr)); }
}
@media (max-width:1199px) {
  .ticket-form { grid-template-columns:minmax(0,1fr) 340px; }
  .ticket-live-preview { padding:16px 12px; }
  .ticket-editor-scroll { padding:18px 14px; }
  .ticket-editor-surface { padding:16px; }
}
@media (max-width:959px) {
  .busgo-page-header { padding-inline:17px; }
  .busgo-container { padding:15px 17px 24px!important; }
  .ticket-template-toolbar { align-items:stretch; }
  .ticket-template-filter,.ticket-template-filter--status { flex:1 1 200px; min-width:0; }
  .ticket-template-search { flex:1 1 260px; min-width:0; }
  .ticket-form { display:flex; flex-direction:column; overflow-y:auto; }
  .ticket-editor-scroll { overflow:visible; flex:0 0 auto; }
  .ticket-live-preview { flex:0 0 auto; overflow:visible; border-left:0; border-top:1px solid #e1e8f1; padding:18px; }
  .ticket-preview-canvas { max-width:420px; margin-inline:auto; }
  .ticket-option-grid { grid-template-columns:repeat(2,minmax(0,1fr)); }
}
@media (max-width:600px) {
  .busgo-page-header { flex-wrap:wrap; padding:12px; }
  .busgo-page-heading { flex:1 1 calc(100% - 49px); }
  .busgo-page-header > .v-spacer { display:none; }
  .busgo-add-btn { margin-left:49px; }
  .busgo-container { padding:12px!important; }
  .busgo-page-title { font-size:17px; }
  .ticket-template-toolbar { padding-inline:14px; }
  .ticket-template-toolbar > .v-spacer { display:none; }
  .ticket-template-filter,.ticket-template-filter--status,.ticket-template-search { flex-basis:100%; }
  .ticket-dialog-header { grid-template-columns:minmax(0,1fr) 42px; gap:8px; padding:10px 12px; }
  .ticket-dialog-meta { display:none; }
  .ticket-dialog-subtitle { font-size:10px; }
  .ticket-editor-scroll { padding:12px; }
  .ticket-editor-surface { padding:12px; }
  .ticket-block-heading { padding-inline:12px; gap:8px; }
  .ticket-block-options { padding:0 12px 10px; }
  .ticket-config-grid { grid-template-columns:1fr; gap:16px; }
  .ticket-config-column { display:contents; }
  .ticket-config-column + .ticket-config-column::before { display:none; }
  .ticket-option-grid { grid-template-columns:1fr; }
  .ticket-block-label strong { font-size:12px; }
  .ticket-block-toggle > span { display:none; }
  .ticket-format-options { align-items:stretch; flex-direction:column; padding:10px 12px; }
  .ticket-spacing-select { flex:0 0 auto; min-width:0; }
  .ticket-dialog-actions { flex-wrap:wrap; gap:8px; padding:12px 12px calc(12px + env(safe-area-inset-bottom)); }
  .ticket-dialog-actions :deep(.v-btn) { font-size:12px; min-height:40px; }
}
</style>
