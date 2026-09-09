<template>
  <v-snackbar class="mt-12" location="right top" :timeout="sb_timeout" :color="sb_type" elevation="24"
    :multi-line="true" vertical v-model="snackbar">
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
 <!-- HEADER BUSGO -->
  <v-card class="busgo-page-header structures-page-header" elevation="0">
    <v-avatar class="structures-page-icon">
      <v-icon>mdi-seat-passenger</v-icon>
    </v-avatar>

    <div class="structures-heading-copy">
      <div class="structures-page-title">
        Estructuras de Asientos
      </div>

      <div class="structures-page-subtitle">
        Gestionar estructuras y distribución de asientos
      </div>
    </div>

    <v-spacer />

    <v-btn
      :color="paleteColors.primary"
      variant="flat"
      elevation="0"
      prepend-icon="mdi-plus"
      class="busgo-add-btn structures-add-button"
      @click="showAdd()"
    >
      Agregar Estructura
    </v-btn>
  </v-card>

  <!-- CONTENIDO -->
  <v-container fluid class="busgo-container structures-content">
    <v-card class="busgo-card structures-table-panel" elevation="0">
      <div class="busgo-card-header structures-table-toolbar">
        <div>
          <div class="structures-section-title">
            Listado de estructuras
          </div>

          <div class="structures-section-subtitle">
            {{ structures.length === 1 ? '1 estructura registrada' : `${structures.length} estructuras registradas` }}
          </div>
        </div>

        <v-text-field
          v-model="search"
          density="compact"
          placeholder="Buscar estructura..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          hide-details
          single-line
          class="busgo-search structures-search"
        />
      </div>

      <v-data-table
        :headers="headers"
        :items="structures"
        :search="search"
        v-model:items-per-page="itemsPerPage"
        v-model:page="page"
        v-model:sort-by="sortBy"
        :items-per-page-options="[5, 10, 15, 25]"
        items-per-page-text="Elementos por página"
        no-data-text="No hay estructuras disponibles"
        :loading="loading"
        loading-text="Cargando datos..."
       
        class="structures-table"
      >
        <template #loading><v-skeleton-loader type="table-row@5" /></template>
        <template #[`item.name`]="{ item }"><div class="structure-name-cell"><div class="structure-avatar"><v-icon size="19">mdi-seat-passenger</v-icon></div><div class="structure-copy"><div class="structure-name">{{ item.name || 'Sin nombre' }}</div><div class="structure-meta">Plano de distribución del vehículo</div></div></div></template>
        <template #[`item.seatCount`]="{ item }"><button type="button" class="seat-count-badge" @click="openDialog(item)"><v-icon size="16">mdi-seat-outline</v-icon><strong>{{ item.seatCount || 0 }}</strong><span>asientos</span></button></template>
        <template #[`item.description`]="{ item }"><span class="structure-description">{{ item.description || 'Sin descripción' }}</span></template>
        <template #[`item.actions`]="{ item }"><div class="structure-actions"><v-tooltip text="Ver distribución" location="top"><template #activator="{ props }"><v-btn v-bind="props" icon="mdi-eye-outline" variant="text" size="small" class="action-button action-button--view" @click="openDialog(item)" /></template></v-tooltip><v-tooltip text="Editar estructura" location="top"><template #activator="{ props }"><v-btn v-bind="props" icon="mdi-pencil-outline" variant="text" size="small" class="action-button action-button--edit" @click="editItem(item)" /></template></v-tooltip><v-tooltip text="Eliminar estructura" location="top"><template #activator="{ props }"><v-btn v-bind="props" icon="mdi-trash-can-outline" variant="text" size="small" class="action-button action-button--delete" @click="deleteItem(item)" /></template></v-tooltip></div></template>
      </v-data-table>
      <div class="structures-table-note"><v-icon size="15">mdi-information-outline</v-icon>Las estructuras se utilizan para configurar la distribución de asientos de los vehículos.</div>
    </v-card>
  </v-container>

  <!-- Diálogo para crear una nueva estructura-->
  <v-dialog v-model="dialog" fullscreen transition="dialog-bottom-transition" class="seat-editor-overlay">
    <v-card class="seat-editor-dialog">
      <v-form ref="form" v-model="valid">
        <v-toolbar class="seat-editor-header" color="white">
          <div class="editor-header-icon"><v-icon>mdi-seat-passenger</v-icon></div><div><div class="editor-title">{{ formTitle }}</div><div class="editor-subtitle">Diseña la distribución interior del vehículo</div></div><v-spacer/><div class="editor-progress"><strong>{{ selectedCount }}</strong><span>de {{ editedItem.seatCount || 0 }} asientos</span></div><v-btn icon="mdi-close" variant="text" @click="close" />
        </v-toolbar>
        <v-card-text class="seat-editor-body">
          <v-row class="editor-form-grid" dense>
            <v-col cols="12" md="4" class="editor-field-col">
              <v-text-field v-model="editedItem.name" clearable label="Nombre de la estructura" prepend-inner-icon="mdi-tag-outline"
                variant="outlined" density="comfortable" :rules="nameRules"></v-text-field>
            </v-col>
            <v-col cols="12" md="4" class="editor-field-col">
              <v-text-field v-model="editedItem.seatCount" label="Capacidad de asientos" type="number"
                @input="generateSeatMap" prepend-inner-icon="mdi-car-seat" :rules="seatCountRules"
                variant="outlined" density="comfortable"></v-text-field>
            </v-col>
            <v-col cols="12" md="4" class="editor-field-col">
              <v-text-field v-model="editedItem.description" clearable label="Descripción" prepend-inner-icon="mdi-note-text-outline"
                variant="outlined" density="comfortable"></v-text-field>
            </v-col>
            <v-col cols="12" class="editor-stats-col">
              <div class="editor-stat"><div class="editor-stat-icon blue"><v-icon size="18">mdi-seat-passenger</v-icon></div><div><strong>{{ Number(editedItem.seatCount) || 0 }}</strong><span>Capacidad total</span></div></div>
              <div class="editor-stat"><div class="editor-stat-icon green"><v-icon size="18">mdi-check-circle-outline</v-icon></div><div><strong>{{ selectedCount }}</strong><span>Asientos configurados</span></div></div>
              <div class="editor-stat"><div class="editor-stat-icon slate"><v-icon size="18">mdi-progress-clock</v-icon></div><div><strong>{{ Math.max((Number(editedItem.seatCount) || 0) - selectedCount, 0) }}</strong><span>Pendientes</span></div></div>
              <div class="configuration-progress"><div class="configuration-progress-copy"><span>Progreso de configuración</span><strong>{{ configurationProgress }}%</strong></div><v-progress-linear :model-value="configurationProgress" color="#2454d6" bg-color="#e6ebf3" height="7" rounded /></div>
            </v-col>
            <v-col cols="12" md="12">
              <v-row dense>
                <v-col cols="12" md="4" lg="3">
                  <div>
                    <v-card class="seat-tools-panel" elevation="0">
                      <v-toolbar class="panel-toolbar" color="transparent">
                        <span class="panel-title">Herramienta de diseño</span>
                      </v-toolbar>
                      <v-card-text>
                        <v-radio-group v-model="selectedType">
                          <!-- Radio buttons con íconos -->
                          <v-radio label="Asiento" value="seat" color="primary">
                            <template v-slot:label>
                              <v-icon>mdi-car-seat</v-icon>
                              <span class="ml-2">Asiento</span>
                            </template>
                          </v-radio>

                          <v-radio label="Pasillo" value="aisle" color="secondary">
                            <template v-slot:label>
                              <v-icon>mdi-arrow-down</v-icon>
                              <span class="ml-2">Pasillo</span>
                            </template>
                          </v-radio>

                          <v-radio label="Desmarcar" value="unmark" color="grey">
                            <template v-slot:label>
                              <v-icon>mdi-close</v-icon>
                              <span class="ml-2">Desmarcar</span>
                            </template>
                          </v-radio>
                        </v-radio-group>
                        <div class="tool-help"><v-icon size="16">mdi-information-outline</v-icon><span>Selecciona una herramienta y luego pulsa una posición en el plano.</span></div>
                      </v-card-text>
                      <v-divider></v-divider><div class="seat-legend"><div><i class="legend-seat"></i>Asiento</div><div><i class="legend-aisle"></i>Pasillo</div><div><i class="legend-empty"></i>Libre</div></div>
                    </v-card>
                  </div>
                </v-col>
                <v-col cols="12" md="8" lg="9">
                  <v-card v-if="this.editedItem.seatMap.length > 0" class="seat-map-card" elevation="0">
                    <v-toolbar class="panel-toolbar" color="transparent">
                      <span class="panel-title">Distribución del bus</span><v-spacer/><span class="editor-help">Selecciona una herramienta y pulsa una celda</span>
                    </v-toolbar>
                    <v-card-text class="bus-canvas-scroll">
                      <!-- Contendor principal: d-flex + justify-center para centrar -->
                      <div class="bus-designer-shell">
                        
                        <!-- Capa izquierda: Flecha + texto -->
                        <div class="bus-front-marker">
                          <div class="steering-wheel"><v-icon size="25">mdi-steering</v-icon></div>
                          <v-icon size="28">mdi-arrow-right</v-icon>
                          <span>Frente</span>
                        </div>

                        <!-- Espacio mínimo entre flecha y mapa -->
                        <span class="bus-front-gap"></span>

                        <!-- Capa derecha: Diagrama de asientos (ancho dinámico) -->
                        <div class="seat-map-container designer-seat-map">
                          <div v-for="(row, rowIndex) in editedItem.seatMap" :key="rowIndex" class="seat-row">
                            <div v-for="(seat, seatIndex) in row" :key="seatIndex" class="seat-container">
                              <div v-if="seat.type === 'seat'" :style="{ color: getSeatColor(seat) }"
                                  @click="confirmSelection(rowIndex, seatIndex)" class="seat-icon"
                                  :class="{ 'is-configured': seat.selected }">
                                <v-icon size="46" class="seat-glyph front-facing-seat">mdi-car-seat</v-icon>
                                <span class="seat-label">{{ seat.label }}</span>
                              </div>

                              <div v-else-if="seat.type === 'aisle'" :style="{ color: getSeatColor(seat) }"
                                  @click="confirmSelection(rowIndex, seatIndex)" class="aisle-icon">
                                <v-icon size="40" class="aisle-icon">''</v-icon>
                                <span class="aisle-label">P</span>
                              </div>

                              <v-btn v-else :color="getSeatColor(seat)" @click="confirmSelection(rowIndex, seatIndex)"
                                    class="seat-button">
                                {{ seat.label ? `${seat.label}` : '' }}
                              </v-btn>
                            </div>
                          </div>
                        </div>
                      </div>
                      <!--<div v-for="(row, rowIndex) in editedItem.seatMap" :key="rowIndex" class="seat-row">
                        <div v-for="(seat, seatIndex) in row" :key="seatIndex" class="seat-container">
                          <div v-if="seat.type === 'seat'" :style="{ color: getSeatColor(seat) }"
                            @click="confirmSelection(rowIndex, seatIndex)" class="seat-icon"
                            style="cursor: pointer; position: relative;">
                            <v-icon size="50" class="seat-icon">mdi-seat</v-icon>
                            <span class="seat-label">{{ seat.label }}</span>
                          </div>

                          <div v-else-if="seat.type === 'aisle'" :style="{ color: getSeatColor(seat) }"
                            @click="confirmSelection(rowIndex, seatIndex)" class="aisle-icon"
                            style="cursor: pointer; position: relative; opacity: 0.7">
                            <v-icon size="40" class="aisle-icon">''</v-icon>
                            <span class="aisle-label">P</span>
                          </div>

                          <v-btn v-else :color="getSeatColor(seat)" @click="confirmSelection(rowIndex, seatIndex)"
                            class="seat-button" style=" opacity: 0.7">

                            {{ seat.label ? `${seat.label}` : '' }}
                          </v-btn>
                        </div>
                      </div>-->
                    </v-card-text>
                  </v-card>
                  <v-card v-else class="seat-empty-state" elevation="0"><div class="empty-bus-icon"><v-icon size="34">mdi-bus-side</v-icon></div><div class="empty-bus-title">Define la capacidad del vehículo</div><div class="empty-bus-copy">Ingresa la cantidad de asientos para generar el plano editable.</div></v-card>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="editor-actions">
          <v-spacer></v-spacer>
          <v-btn @click="close" variant="text" class="cancel-button">Cancelar</v-btn>
          <v-btn @click="save" class="save-button" elevation="0" :loading="this.loading"
            :disabled="!valid">{{ editedIndex === -1 ? 'Crear estructura' : 'Guardar cambios' }}</v-btn>
        </v-card-actions>

      </v-form>
    </v-card>
  </v-dialog>
  <!-- Diálogo para seleccionar tipo (asiento o pasillo) -->
  <v-dialog v-model="dialogType" max-width="430" persistent>
    <v-card class="internal-dialog" elevation="0">
      <div class="internal-dialog-header"><div class="dialog-heading"><div class="dialog-icon"><v-icon size="20">mdi-cursor-default-click-outline</v-icon></div><div><div class="dialog-title">Tipo de celda</div><div class="dialog-subtitle">Define el uso de la posición seleccionada</div></div></div><v-btn icon="mdi-close" variant="text" size="small" class="dialog-close" @click="dialogType = false" /></div>
      <v-divider />
      <v-card-text class="internal-dialog-body">
        <v-radio-group v-model="selectedType" :color="this.radioColor">
          <!-- Radio buttons con íconos -->
          <v-radio label="Asiento" value="seat">
            <template v-slot:label>
              <v-icon>mdi-car-seat</v-icon>
              <span class="ml-2">Asiento</span>
            </template>
          </v-radio>

          <v-radio label="Pasillo" value="aisle">
            <template v-slot:label>
              <v-icon>mdi-arrow-down</v-icon>
              <span class="ml-2">Pasillo</span>
            </template>
          </v-radio>

          <v-radio label="Desmarcar" value="unmark">
            <template v-slot:label>
              <v-icon>mdi-close</v-icon>
              <span class="ml-2">Desmarcar</span>
            </template>
          </v-radio>
        </v-radio-group>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions class="internal-dialog-actions">
        <v-btn variant="text" class="cancel-button" @click="dialogType = false">Cancelar</v-btn>
        <v-btn class="save-button" elevation="0" @click="confirmSelection">Aplicar selección</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
<!-- Diálogo para mostrar el gráfico de asientos -->
  <v-dialog v-model="dialogSeats" max-width="680">
    <v-card class="internal-dialog" elevation="0">
      <div class="internal-dialog-header"><div class="dialog-heading"><div class="dialog-icon"><v-icon size="20">mdi-seat-passenger</v-icon></div><div><div class="dialog-title">Gráfico de asientos</div><div class="dialog-subtitle">Vista previa de la distribución seleccionada</div></div></div><v-btn icon="mdi-close" variant="text" size="small" class="dialog-close" @click="dialogSeats = false" /></div><v-divider />
      <v-card-text class="internal-dialog-body preview-dialog-body">
        <div v-if="selectedStructure" class="seat-map-container">
          <div class="text-h6">{{ selectedStructure.name }}</div>
          <div class="text-body-1">{{ selectedStructure.description }}</div>
          <div class="text-caption">Asientos: {{ selectedStructure.seatCount }}</div>

          <!-- Gráfico de asientos -->
          <div v-for="(row, rowIndex) in selectedStructure.seatMap" :key="rowIndex" class="seat-row">
            <v-btn v-for="(seat, seatIndex) in row" :key="seatIndex" :color="seat.selected ? paleteColors.primary : ''"
              class="seat-button-preview" disabled>
              <v-icon v-if="seat.label" class="front-facing-seat">mdi-car-seat</v-icon>
              {{ seat.label ? `${seat.label}` : '' }}
            </v-btn>
          </div>
        </div>
      </v-card-text>
      <v-divider /><v-card-actions class="internal-dialog-actions">
        <v-btn @click="dialogSeats = false" variant="text" class="cancel-button">
          Cerrar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <v-dialog v-model="dialogDelete" max-width="430" persistent>
    <v-card class="delete-dialog-modern" elevation="0">
      <div class="delete-icon-modern"><v-icon size="27">mdi-trash-can-outline</v-icon></div>
      <div class="delete-title-modern">Eliminar estructura</div>
      <div class="delete-message-modern">¿Deseas eliminar <strong>{{ editedItem.name || 'esta estructura' }}</strong>? Esta acción no se puede deshacer.</div>
      <div class="delete-actions-modern"><v-btn variant="text" class="cancel-button" :disabled="loading" @click="closeDelete">Cancelar</v-btn><v-btn class="delete-button-modern" elevation="0" :loading="loading" @click="deleteItemConfirm">Eliminar</v-btn></div>
    </v-card>
  </v-dialog>
  <v-dialog v-model="dialogStructure" max-width="820" scrollable>
    <v-card class="internal-dialog structure-preview-dialog" elevation="0">
      <div class="internal-dialog-header"><div class="dialog-heading"><div class="dialog-icon"><v-icon size="20">mdi-bus-side</v-icon></div><div><div class="dialog-title">{{ selectedStructure?.name || 'Estructura de asientos' }}</div><div class="dialog-subtitle">{{ selectedStructure?.seatCount || 0 }} asientos · {{ selectedStructure?.description || 'Sin descripción' }}</div></div></div><v-btn icon="mdi-close" variant="text" size="small" class="dialog-close" @click="dialogStructure = false" /></div>
      <v-divider></v-divider>
      <v-card-text class="internal-dialog-body structure-preview-body">
        <!-- Contenedor flex para alinear elementos horizontalmente -->
        <div class="d-flex align-center" style="min-height: 60px;">
          
          <!-- Flecha y texto a la izquierda -->
          <div style="flex-shrink: 0; margin: 0; padding: 0;">
            <div class="text-body-1 text-primary font-weight-bold" style="margin: -8px 0 0 0; padding: 0; line-height: 1;">Frente</div>
            <v-icon color="primary" size="45">mdi-arrow-right</v-icon>
          </div>
          <span style="display: inline-block; width: 16px;"></span>
          <!-- Espacio vacío para empujar el mapa a la derecha -->
          <div style="flex-grow: 1;"></div>

          <!-- Diagrama de asientos a la derecha -->
          <div class="seat-map-container">
            <div v-for="(row, rowIndex) in selectedStructure?.seatMap" :key="rowIndex" class="seat-row">
              <div v-for="(seat, seatIndex) in row" :key="seatIndex" class="seat-container">
                <div v-if="seat.type === 'seat'" :style="{ color: getSeatColor(seat) }" class="seat-icon-card"
                  style="cursor: pointer; position: relative;">
                  <v-icon size="38" class="front-facing-seat">mdi-car-seat</v-icon>
                  <span class="seat-label-card">{{ seat.label }}</span>
                </div>

                <div v-else-if="seat.type === 'aisle'" :style="{ color: getSeatColor(seat) }" class="aisle-icon-card"
                  style="cursor: pointer; position: relative; opacity: 0.6;">
                  <v-icon size="small">' '</v-icon>
                  <span class="aisle-label-card"> </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </v-card-text>
      <v-divider/><v-card-actions class="internal-dialog-actions">
        <v-btn variant="text" class="cancel-button" @click="dialogStructure = false">Cerrar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <!--</v-container>-->
</template>

<style>
.bus-designer-shell::before { display: none !important; content: none !important; }
.bus-exit { display: none !important; }
.front-facing-seat { transform: scaleX(-1); }
</style>

<style>
/* Mantiene el asiento orientado hacia el frente incluso durante el hover. */
.front-facing-seat,
.seat-icon:hover .front-facing-seat,
.seat-icon-card:hover .front-facing-seat,
.seat-button-preview:hover .front-facing-seat {
  transform: scaleX(-1) !important;
}

.seat-glyph {
  position: relative;
  z-index: 1;
  transition: filter 0.16s ease !important;
}

/* Placa legible para el número del asiento. */
.designer-seat-map .seat-label,
.structure-preview-dialog .seat-icon-card .seat-label-card {
  position: absolute !important;
  top: 50% !important;
  left: 50% !important;
  z-index: 3 !important;
  display: grid !important;
  min-width: 21px !important;
  height: 19px !important;
  padding: 0 4px !important;
  place-items: center !important;
  color: #17377f !important;
  background: #ffffff !important;
  border: 1px solid rgba(36, 84, 214, 0.22) !important;
  border-radius: 6px !important;
  box-shadow: 0 2px 5px rgba(15, 23, 42, 0.16) !important;
  font-size: 10px !important;
  font-weight: 900 !important;
  line-height: 1 !important;
  pointer-events: none !important;
  transform: translate(-50%, -50%) !important;
}
</style>

<script>
import { paleteColors } from "@/assets/colors";
import { handleRequest } from "@/utils/api"; // Ruta al archivo
export default {
  data() {
    return {
      /*
      */
      itemsPerPage: 10,
      totalItems: 0,
      dialogStructure: false,
      selectedStructure: null,
      name: '',
      description: '',
      page: 1,
      sortBy: [],
      paleteColors: paleteColors,
      snackbar: false,
      sb_type: '',
      sb_message: '',
      sb_timeout: 2000,
      sb_title: '',
      sb_icon: '',
      search: '',
      valid: true,
      loading: false,
      dialogDelete: false,
      dialogSeats: false,
      dialog: false, // Controla la visibilidad del diálogo
      headers: [
        //{ title: 'Sucursal', value: 'branchName', width: '20%' },
        { title: 'Nombre', key: 'name', sortable: true, width: '34%' },
        { title: 'Asientos', key: 'seatCount', sortable: true, width: '18%' },
        { title: 'Descripción', key: 'description', sortable: true, width: '34%' },
        { title: '', key: 'actions', sortable: false, align: 'end', width: '14%' },
      ],
      editedItem: {
        id: '',
        name: '',
        description: '',
        seatCount: 0,
        seats: [],
        seatMap: [],
      },
      defaultItem: {
        id: '',
        name: '',
        description: '',
        seatCount: 0,
        seats: [],
        seatMap: [],
      },
      originalItem: {
        id: '',
        name: '',
        description: '',
        seatCount: 0,
        seats: [],
        seatMap: [],
      },
      nameRules: [
        (v) => !!v || "El campo es requerido",
        (v) => (v && v.length <= 50) ||
          "El campo debe tener menos de 51 caracteres",
        (v) => (v && v.length >= 3) ||
          "El campo debe tener al menos 3 caracteres",
      ],
      seatCountRules: [
        (v) => !!v || "El campo es requerido", // Asegura que no esté vacío
        (v) => (v > 0) || "La cantidad de asientos debe ser mayor a 0", // Asegura que sea mayor a 0
        (v) => Number.isInteger(Number(v)) || "Debe ser un número entero", // Asegura que sea un número
      ],
      data: {},
      editedIndex: -1,
      seatMap: [], // Matriz de asientos
      structures: [], // Array estático de estructuras
      selectedCount: 0, // Contador de asientos seleccionados
      nextSeatNumber: 1, // Siguiente número de asiento a asignar
      cursor: null,   // Cursor para la paginación
      hasMore: false, // Indica si hay más páginas
      isLoading: false, // Para evitar múltiples solicitudes simultáneas
      dialogType: false, // Controla la visibilidad del diálogo
      selectedType: 'seat', // Tipo seleccionado (asiento o pasillo)
      selectedSeat: { rowIndex: null, seatIndex: null }, // Almacena la posición del asiento seleccionad
      radioColor: '#1976D2', // Color por defecto
    };
  },
  computed: {
    configurationProgress() {
      const total = Number(this.editedItem.seatCount) || 0;
      if (total <= 0) return 0;
      return Math.min(100, Math.round((this.selectedCount / total) * 100));
    },
    formTitle() {
      return this.editedIndex === -1 ? 'Agregar Estructura' : 'Editar Estructura';
    },
    filteredSeatMap() {
      return this.item.seatMap.filter((row, rowIndex) => {
        // Si no es la última fila, siempre se incluye
        if (rowIndex !== this.item.seatMap.length - 1) return true;

        // Si es la última fila, se incluye solo si tiene asientos seleccionados
        return row.some(seat => seat.selected);
      });
    },
  },
  mounted() {
    this.initialize();
  },
  methods: {
    unwrapItem(item) {
      return item?.raw ?? item ?? {};
    },
    openDialog(item) {
      const structure = this.unwrapItem(item);
      this.selectedStructure = JSON.parse(JSON.stringify(structure));
      this.dialogStructure = true;
    },
    // Confirma la selección del tipo (asiento o pasillo)
    confirmSelection(rowIndex, seatIndex) {
      /*const { rowIndex, seatIndex } = this.selectedSeat;
      const seat = this.editedItem.seatMap[rowIndex][seatIndex];*/
      const seat = this.editedItem.seatMap[rowIndex][seatIndex];
      // Guardar la posición del asiento seleccionado
      this.selectedSeat = { rowIndex, seatIndex };
      // Actualizar el color del radio button
      this.radioColor = this.getSeatColor(seat);
      //this.selectedType = seat.type;

      if (this.selectedType === 'seat') {
        this.setAsSeat(rowIndex, seatIndex);
      } else if (this.selectedType === 'aisle') {
        this.setAsAisle(rowIndex, seatIndex);
      } else if (this.selectedType === 'unmark') {
        this.resetSeatsFrom(rowIndex, seatIndex); // Desmarcar el asiento o pasillo
      }

      // Cerrar el diálogo y reiniciar la selección
      //this.dialogType = false;
      //this.selectedType = null;
    },
    // Marca el asiento como "asiento"
    /*setAsSeat(rowIndex, seatIndex) {
      const seat = this.editedItem.seatMap[rowIndex][seatIndex];

      // Verificar si se puede seleccionar más asientos
      if (this.selectedCount >= this.editedItem.seatCount) {
        return;
      }

      // Marcar como asiento
      seat.type = 'seat';
      seat.selected = true;
      seat.label = `${this.nextSeatNumber}`;

      // Incrementar el contador y el número del próximo asiento
      this.selectedCount++;
      this.nextSeatNumber++;

      // Agregar el número del asiento al array 'editedItem.seats'
      this.editedItem.seats.push(this.nextSeatNumber - 1);
    },*/
    setAsSeat(rowIndex, seatIndex) {
      const seat = this.editedItem.seatMap[rowIndex][seatIndex];

      // Verificar si se puede seleccionar más asientos
      if (this.selectedCount >= this.editedItem.seatCount || seat.label || /\d/.test(seat.label)) {
        return;
      }

      // Buscar el menor número disponible
      const availableNumber = this.findAvailableSeatNumber();

      // Marcar como asiento
      seat.type = 'seat';
      seat.selected = true;
      seat.label = `${availableNumber}`;

      // Incrementar el contador de asientos seleccionados
      this.selectedCount++;
    },

    // Buscar el menor número disponible
    findAvailableSeatNumber() {
      const seatMap = this.editedItem.seatMap;
      const usedNumbers = new Set();

      // Recopilar todos los números de asientos en uso
      for (let i = 0; i < seatMap.length; i++) {
        for (let j = 0; j < seatMap[i].length; j++) {
          const currentSeat = seatMap[i][j];

          if (currentSeat.type === 'seat' && currentSeat.selected) {
            usedNumbers.add(parseInt(currentSeat.label));
          }
        }
      }

      // Encontrar el menor número disponible
      let availableNumber = 1;
      while (usedNumbers.has(availableNumber)) {
        availableNumber++;
      }

      return availableNumber;
    },
    setAsAisle(rowIndex, seatIndex) {
      const seat = this.editedItem.seatMap[rowIndex][seatIndex];
      if (seat.type === 'seat') {
        this.selectedCount--;
      }
      // Marcar como pasillo
      seat.type = 'aisle';
      seat.selected = false; // Los pasillos no son seleccionables
      seat.label = ''; // Los pasillos no tienen número

      // No se incrementa el contador de asientos
    }, resetSeatsFrom(rowIndex, seatIndex) {
      const seatMap = this.editedItem.seatMap;

      // Obtener el asiento seleccionado
      const selectedSeat = seatMap[rowIndex][seatIndex];
      // Si es un seat, reducir selectedCount en 1
      if (selectedSeat.type === 'seat') {
        this.selectedCount--;
      }
      selectedSeat.type = undefined;
      selectedSeat.selected = false;
      selectedSeat.label = '';
    },
    toggleSeat(rowIndex, seatIndex) {
      const seat = this.editedItem.seatMap[rowIndex][seatIndex];
      // Guardar la posición del asiento seleccionado
      this.selectedSeat = { rowIndex, seatIndex };

      // Actualizar el color del radio button
      this.radioColor = this.getSeatColor(seat);
      this.selectedType = seat.type;
      // Abrir el diálogo
      //this.dialogType = true;
    },
    // Devuelve el color del botón según el tipo de asiento
    getSeatColor(seat) {
      if (seat.type === 'seat') {
        return paleteColors.primary;
      } else if (seat.type === 'aisle') {
        return paleteColors.secondary;
      } else {
        return paleteColors.grey;
      }
    }, // Genera la matriz de asientos con 4 columnas y el número mínimo de filas
    shouldDisplayRow(row, rowIndex) {
      // Si no es la última fila, siempre se muestra
      if (rowIndex !== this.item.seatMap.length - 1) return true;

      // Si es la última fila, verifica si tiene asientos seleccionados
      return row.some(seat => seat.selected);
    },
    generateSeatMap() {
      const totalSeats = this.editedItem.seatCount;
      const rows = 5; // Número fijo de columnas (ajusta según tu diseño)

      // Calcular el número de filas necesario
      const columns = Math.ceil(totalSeats / (rows - 1)) + 2; // Resta 1 columna para pasillos y agrega 2 filas adicionales

      this.seatMap = [];
      this.editedItem.seatMap = [];

      for (let i = 0; i < rows; i++) {
        const row = [];
        for (let j = 0; j < columns; j++) {
          // Inicializar todas las celdas como no definidas
          row.push({ label: '', selected: false, disabled: false, type: undefined });
        }
        this.seatMap.push(row);
        this.editedItem.seatMap.push(row);
      }

      this.selectedCount = 0; // Reinicia el contador de asientos seleccionados
      this.nextSeatNumber = 1; // Reinicia el contador de números de asiento
    },
    deselectFollowingSeats(seatNumber) {
      // Recorrer todos los asientos para deseleccionar los que tienen un número mayor
      this.editedItem.seatMap.forEach(row => {
        row.forEach(seat => {
          if (seat.selected && Number(seat.label) > seatNumber) {
            // Deseleccionar el asiento
            seat.selected = false;
            seat.label = '';
            this.selectedCount--;

            // Eliminar el número del asiento deseleccionado del array 'editedItem.seats'
            const index = this.editedItem.seats.indexOf(Number(seat.label));
            if (index !== -1) {
              this.editedItem.seats.splice(index, 1);
            }
          }
        });
      });
    },
    showAdd() {
      this.close();
      this.dialog = true;
    },
    // Guarda la estructura en el array estático
    saveStructure() {
      const selectedSeats = this.seatMap
        .flat()
        .filter(seat => seat.selected)
        .map(seat => seat.label);
      const structure = {
        ...this.editedItem,
        seats: selectedSeats,
        seatMap: JSON.parse(JSON.stringify(this.seatMap)), // Guarda una copia de la matriz de asientos
      };
      this.editedItem.seatMap = JSON.parse(JSON.stringify(this.seatMap));
      this.structures.push(structure); // Agrega la estructura al array estático
      console.log(this.structures);
      this.dialog = false; // Cierra el diálogo
      this.resetForm(); // Reinicia el formulario
    },
    async initialize() {
      try {
        /*this.data = {};
        this.data.limit = this.limit || this.itemsPerPage;
        this.data.search = this.search;
        this.data.cursor = this.cursor;*/
        this.loading = true;
        const result = await handleRequest({
          endpoint: 'structure',
          method: 'GET',
          //data: this.data
        });

        if (result.success) {
          // Si la solicitud es exitosa, asignamos las sucursales
          // Agregar las nuevas estructuras a la lista


          // Agregar solo las estructuras nuevas a la lista
          this.structures = result.data?.structures;
          //this.totalItems = this.structures.length;
          //this.hasMore = hasMore;
          //this.cursor = nextCursor; // Actualizar el cursor para la próxima página
        } else {
          // Si no hay datos, asignamos un array vacío
          this.structures = [];
        }
      } catch (error) {
        this.loading = false;
        // Captura de errores no controlados
        this.showAlert('error', 'Ocurrió un error inesperado al procesar la solicitud.', 3000);
      } finally {
        this.loading = false;
      }
    },
    close() {
      this.dialog = false;
      this.loading = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
      });
      this.editedIndex = -1;
      this.selectedCount = 0;
      this.nextSeatNumber = 1;
    },
    async save() {
      this.loading = true;
      this.data = {};
      if (this.editedIndex === -1) {
        this.valid = false;
        this.data.name = this.editedItem.name;
        this.data.description = this.editedItem.description;
        this.data.seatMap = JSON.parse(JSON.stringify(this.seatMap));
        this.data.seats = JSON.parse(JSON.stringify(this.editedItem.seats));
        this.data.seatCount = this.editedItem.seatCount;
        console.log('this.data');
        console.log(this.data);
        try {
          const result = await handleRequest({
            endpoint: 'structure',
            method: 'POST',
            data: this.data
          });

          // Manejo de la respuesta según el resultado
          if (result.success) {
            this.showAlert("success", result.message, 3000);
            this.initialize();
          } else {
            this.loading = false;
            this.showAlert("warning", result.message, 3000);
          }
        } catch (error) {
          this.loading = false;
          // Este bloque captura errores inesperados fuera del manejo estándar
          this.showAlert("error", "Ocurrió un error inesperado al procesar la solicitud.", 3000);
        } finally {
          this.loading = false;
        }
      } else {
        const fieldsToUpdate = ['id', 'name', 'description', 'seats', 'seatCount', 'seatMap'];
        let updatedFields = Object.keys(this.editedItem)
          .filter((key) => fieldsToUpdate.includes(key) && this.editedItem[key] !== this.originalItem[key])
          .reduce((obj, key) => {
            obj[key] = this.editedItem[key];
            return obj;
          }, {});
        if (Object.keys(updatedFields).length > 0) {
          updatedFields.id = this.editedItem.id;
          this.loading = true;
          try {
            const result = await handleRequest({
              endpoint: 'structure',
              method: 'PUT',
              data: updatedFields
            });

            // Manejo de la respuesta según el resultado
            if (result.success) {
              this.showAlert("success", result.message, 3000);
              this.initialize();
            } else {
              this.loading = false;
              this.editedIndex = -1;
              this.showAlert("warning", result.message, 3000);
            }
          } catch (error) {
            this.loading = false;
            this.editedIndex = -1;
            // Este bloque captura errores inesperados fuera del manejo estándar
            this.showAlert("error", "Ocurrió un error inesperado al procesar la solicitud.", 3000);
          }
        } else {
          this.loading = false;
          this.showAlert("success", "No se realizaron cambios.", 3000);
        }
      }
      this.close();
    },
    // Método para abrir el formulario de edición con los datos de la estructura seleccionada
    editItem(structure) {
      structure = this.unwrapItem(structure);
      //this.close();

      // Clonar la estructura sin referencia
      this.editedItem = JSON.parse(JSON.stringify(structure));

      // Inicializar el seatMap con los asientos seleccionados
      this.editedItem.seatMap = this.editedItem.seatMap.map(row =>
        row.map(seat => ({
          ...seat,
          selected: seat.label && this.editedItem.seats.includes(Number(seat.label))
        }))
      );

      // Inicializar el contador de asientos seleccionados
      this.selectedCount = this.editedItem.seatCount;

      // Inicializar el siguiente número de asiento
      /*this.nextSeatNumber = this.selectedCount > 0
        ? Math.max(...this.editedItem.seats) + 1
        : 1;*/
      this.editedIndex = 1;
      // Abrir el diálogo
      this.dialog = true;
    },

    // Reinicia el formulario
    resetForm() {
      this.editedItem = {
        name: '',
        seatCount: 0,
        seats: [],
      };
      this.seatMap = [];
      this.selectedCount = 0;
      this.nextSeatNumber = 1;
    },
    deleteItem(item) {
      item = this.unwrapItem(item);
      this.editedIndex = -1;
      this.editedItem.id = item.id;
      this.editedItem.name = item.name;
      this.dialogDelete = true;
    },
    closeDelete() {
      this.dialogDelete = false
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
      })
    },
    async deleteItemConfirm() {
      this.loading = true;
      try {
        let request = {
          id: this.editedItem.id
        };
        const result = await handleRequest({
          endpoint: 'structure-destroy',
          method: 'POST',
          data: request
        });

        // Manejo de la respuesta según el resultado
        if (result.success) {
          this.showAlert("success", result.message, 3000);
          // 🔍 Verificar estructura actual antes de eliminar
          console.log("Estructura actual:", this.structure);

          // Buscar el índice del elemento a eliminar
          const index = this.structures.findIndex(item => item.id == this.editedItem.id);
          console.log("Índice encontrado:", index);
          console.log("Elemento encontrado:", this.structures[index]);

          // Si el elemento existe, eliminarlo
          if (index !== -1) {
            this.structures.splice(index, 1);
            console.log("Estructura después de eliminar:", this.structures);
            this.structures = [...this.structures]; // 🔄 Forzar actualización en Vue
            this.totalItems--;
          }
        } else {
          this.showAlert("warning", result.message, 3000);
        }
      } catch (error) {
        // Este bloque captura errores inesperados fuera del manejo estándar
        this.showAlert("error", "Ocurrió un error inesperado al procesar la solicitud.", 3000);
      } finally {
        this.loading = false;
        this.closeDelete();
      }
    },
    showAlert(sb_type, sb_message, sb_timeout) {
      this.sb_type = sb_type;

      if (sb_type == "success") {
        this.sb_title = "Éxito";
        this.sb_icon = "mdi-check-circle";
      }

      if (sb_type == "error") {
        this.sb_title = "Error";
        this.sb_icon = "mdi-check-circle";
      }

      if (sb_type == "warning") {
        this.sb_title = "Advertencia";
        this.sb_icon = "mdi-alert-circle";
      }
      this.sb_message = sb_message;
      this.sb_timeout = sb_timeout;
      this.snackbar = true;
    },
  },
};
</script>

<style>
/* Alinear el botón a la derecha */
.button-container {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.seat-button {
  margin: 5px;
  /* Espacio entre los asientos */
  border-radius: 8px;
  /* Bordes redondeados */
  min-width: 45px;
  /* Tamaño mínimo */
  min-height: 45px;
  /* Tamaño mínimo */
  font-size: 14px;
  /* Tamaño de la fuente */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  /* Sombra suave */
}

/* Estilo para asientos seleccionados */
.v-btn--active.seat-button {
  background-color: #1976d2;
  /* Color primario */
  color: white;
}

/* Estilo para asientos no seleccionados */
.v-btn.seat-button {
  background-color: #e0e0e0;
  /* Color gris */
  color: #000;
}

/* Estilos para la vista previa de la matriz de asientos */
.seat-map-preview {
  margin-top: 10px;
}

.seat-button-preview {
  margin: 2px;
  /* Espacio entre los asientos */
  border-radius: 4px;
  /* Bordes redondeados */
  min-width: 20px;
  /* Tamaño mínimo */
  min-height: 20px;
  /* Tamaño mínimo */
  font-size: 12px;
  /* Tamaño de la fuente */
}

.structure-card {
  height: 100%;
  /* Asegura que todas las cards tengan la misma altura */
  width: 100%;
  /* Asegura que todas las cards tengan la misma altura */
  display: flex;
  flex-direction: column;
}

.card-content {
  flex: 1;
  /* Hace que el contenido ocupe todo el espacio disponible */
  display: flex;
  flex-direction: column;
}

.structure-info {
  margin-bottom: 16px;
  /* Espacio entre los datos y la matriz */
}

.seat-map-preview {
  flex: 1;
  /* Hace que la matriz ocupe el espacio restante */
  display: flex;
  flex-direction: column;
  justify-content: center;
  /* Centra la matriz verticalmente */
}

.seat-row {
  display: flex;
  justify-content: center;
  /* Centra los asientos horizontalmente */
  margin-bottom: 8px;
  /* Espacio entre filas de asientos */
}

.structure-actions {
  margin-top: auto;
  /* Empuja los botones hacia la parte inferior */
  display: flex;
  justify-content: flex-end;
  /* Alinea los botones a la derecha */
}

/* Estilos para la vista previa de la matriz de asientos */
.seat-map-preview {
  margin-bottom: 10px;
  flex-grow: 1;
  /* Hace que la matriz ocupe el espacio disponible */
}

.seat-button-preview {
  margin: 1px;
  /* Espacio entre los asientos */
  border-radius: 4px;
  /* Bordes redondeados */
  min-width: 20px;
  /* Tamaño mínimo */
  min-height: 20px;
  /* Tamaño mínimo */
  font-size: 12px;
  /* Tamaño de la fuente */
}

/* Estilos para los botones de acciones */
.structure-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: auto;
  /* Alinear los botones al final */
}

/*data table*/
.seat-map-container {
  display: inline-block;
  border: 1px solid #ddd;
  padding: 8px;
  border-radius: 4px;
  background-color: #f9f9f9;
}

.seat-row {
  display: flex;
  gap: 4px;
  margin-bottom: 4px;
}

.seat-button-preview {
  min-width: 20px !important;
  height: 20px !important;
  padding: 0 !important;
}

.seat-map-card {
  max-height: 69vh;
  min-height: 69vh;
  /* 70% del alto de la ventana */
  overflow-y: auto;
  /* Hacer el contenido desplazable verticalmente */
}

.seat-row {
  display: flex;
  justify-content: center;
  margin-bottom: 8px;
}

.seat-container {
  margin: 4px; /* Espacio entre asientos */
}

/* Estilos para el ícono de asiento */
.seat-icon {
  font-size: 3rem; /* Tamaño del ícono */
}

/* Estilos para el ícono de pasillo */
.aisle-icon {
  font-size: 3rem; /* Tamaño del ícono */
}

/* Estilos para el ícono de asiento */
.seat-icon-card {
  font-size: 1.5rem; /* Tamaño del ícono */
}

/* Estilos para el ícono de pasillo */
.aisle-icon-card {
  font-size: 1.5rem; /* Tamaño del ícono */
}

/* Estilos para el número del asiento */
.seat-label-card {
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.9rem; /* Tamaño del número */
  font-weight: bold;
  color: black; /* Color del texto */
}

/* Estilos para la "P" del pasillo */
.aisle-label-card {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.8rem; /* Tamaño de la "P" */
  font-weight: bold;
  color: black; /* Color del texto */
}

/* Estilos para el número del asiento */
.seat-label {
  position: absolute;
  top: 35%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 1rem; /* Tamaño del número */
  font-weight: bold;
  color: black; /* Color del texto */
}

/* Estilos para la "P" del pasillo */
.aisle-label {
  position: absolute;
  top: 35%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 1.5rem; /* Tamaño de la "P" */
  font-weight: bold;
  color: black; /* Color del texto */
}

/* Estilos para el botón */
.seat-button {
  min-width: 30px; /* Ajusta el tamaño del botón */
  min-height: 30px; /* Ajusta el tamaño del botón */
  position: relative; /* Necesario para posicionar los elementos hijos de forma absoluta */
}

.icono-concavo {
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  color: white;
  /* Mantenemos solo el efecto cóncavo en el ícono 
  box-shadow: inset;*/
  position: relative;
  overflow: hidden;
}

.icono-concavo::after {
  content: "";
  position: absolute;
  top: 2px;
  left: 2px;
  right: 2px;
  bottom: 2px;
  border-radius: 8px;
  background: transparent;
}
.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.busgo-page-header {
  display: flex;
  align-items: center;
  padding: 18px 24px;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
}

.busgo-page-icon {
  border-radius: 14px;
}

.busgo-add-btn {
  border-radius: 10px;
  font-weight: 600;
  text-transform: none;
}

.busgo-container {
  padding: 24px;
}

.busgo-card {
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  background: #ffffff;
  overflow: hidden;
}

.busgo-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 20px 24px;
}

.busgo-search {
  max-width: 380px;
}

.busgo-table {
  max-height: calc(100vh - 285px);
  overflow-y: auto;
  background: transparent;
}

.structure-table-head {
  display: flex;
  align-items: center;
  height: 42px;
  padding: 0 20px;
  margin: 0 16px 6px;
  border-radius: 12px;
  background: #f8fafc;
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

.busgo-row {
  display: flex;
  align-items: center;
  min-height: 58px;
  padding: 8px 20px;
  margin: 0 16px 6px;
  border: 1px solid #eef2f7;
  border-radius: 12px;
  background: #ffffff;
  transition: 0.15s ease;
}

.busgo-row:hover {
  background: #f8fafc;
  border-color: #dbeafe;
}

.structure-col-name {
  width: 25%;
  min-width: 0;
}

.structure-col-seats {
  width: 12%;
  min-width: 0;
}

.structure-col-description {
  width: 48%;
  min-width: 0;
}

.structure-col-actions {
  width: 15%;
  min-width: 0;
}

.busgo-name-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.busgo-avatar {
  border: 1px solid #e5e7eb;
}

.busgo-name-text {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.busgo-info-cell {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
  color: #374151;
}

.structure-seats-click {
  cursor: pointer;
  font-weight: 600;
  color: #2563eb;
}

.busgo-actions {
  display: flex;
  justify-content: flex-end;
  gap: 5px;
  flex-wrap: nowrap;
}

.busgo-footer {
  padding: 12px 24px 18px;
  border-top: 1px solid #eef2f7;
}

.border-0 {
  border: 0 !important;
}

.busgo-table::-webkit-scrollbar {
  width: 8px;
}

.busgo-table::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 20px;
}

.seat-map-container {
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  margin: 0;
  padding: 0;
}

.seat-row {
  display: flex;
  margin: 0;
  padding: 0;
}

.seat-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.seat-icon,
.seat-icon-card {
  cursor: pointer;
  position: relative;
}

.seat-label,
.seat-label-card {
  position: absolute;
  top: 45%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 11px;
  font-weight: 700;
  color: white;
}

.aisle-icon {
  cursor: pointer;
  position: relative;
  opacity: 0.7;
  width: 40px;
  height: 40px;
}

.aisle-label {
  font-size: 12px;
  font-weight: 700;
}

.seat-button,
.seat-button-preview {
  min-width: 36px;
  height: 36px;
  margin: 2px;
}

@media (max-width: 960px) {
  .busgo-page-header {
    flex-wrap: wrap;
    gap: 12px;
  }

  .busgo-card-header {
    flex-direction: column;
    align-items: stretch;
  }

  .busgo-search {
    max-width: 100%;
  }

  .structure-table-head {
    display: none;
  }

  .busgo-row {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .structure-col-name,
  .structure-col-seats,
  .structure-col-description,
  .structure-col-actions {
    width: 100%;
  }

  .busgo-actions {
    justify-content: flex-start;
  }
}

</style>

<style>
.editor-form-grid{margin:0!important}.editor-field-col{padding:5px 6px!important}.editor-stats-col{display:grid!important;grid-template-columns:repeat(3,minmax(150px,190px)) minmax(230px,1fr);align-items:center;gap:10px;padding:4px 6px 15px!important}.editor-stat{display:flex;align-items:center;gap:9px;min-height:58px;padding:9px 11px;background:#fff;border:1px solid #e5eaf1;border-radius:10px;box-shadow:0 3px 10px rgba(15,23,42,.025)}.editor-stat-icon{display:grid;flex:0 0 33px;width:33px;height:33px;place-items:center;border-radius:8px}.editor-stat-icon.blue{color:#2454d6;background:#eef3ff}.editor-stat-icon.green{color:#16875a;background:#eaf8f1}.editor-stat-icon.slate{color:#64748b;background:#f1f5f9}.editor-stat strong,.editor-stat span{display:block}.editor-stat strong{color:#0f172a;font-size:17px;font-weight:900;line-height:1}.editor-stat span{margin-top:4px;color:#64748b;font-size:10px;font-weight:700}.configuration-progress{padding:10px 13px;background:#fff;border:1px solid #e5eaf1;border-radius:10px}.configuration-progress-copy{display:flex;align-items:center;justify-content:space-between;margin-bottom:7px;color:#526176;font-size:10.5px;font-weight:700}.configuration-progress-copy strong{color:#2454d6;font-size:12px;font-weight:900}.tool-help{display:flex;align-items:flex-start;gap:6px;padding:9px;color:#526176;background:#f8fafc;border-radius:8px;font-size:10px;font-weight:650;line-height:1.4}.seat-legend{display:flex;flex-wrap:wrap;gap:10px;padding:11px 14px;color:#526176;font-size:10px;font-weight:750}.seat-legend>div{display:flex;align-items:center;gap:5px}.seat-legend i{display:inline-block;width:11px;height:11px;border-radius:3px}.legend-seat{background:#2454d6}.legend-aisle{background:repeating-linear-gradient(135deg,#e2e8f0,#e2e8f0 2px,#fff 2px,#fff 4px);border:1px solid #cbd5e1}.legend-empty{background:#fff;border:1px dashed #94a3b8}.bus-canvas-scroll{max-height:calc(100vh - 330px)!important;min-height:355px!important;padding:28px!important;overflow:auto!important;background:radial-gradient(circle at 50% 30%,#fff 0,#f8fafc 72%)!important}.bus-designer-shell{position:relative;display:flex;align-items:center;width:max-content;min-width:520px;min-height:260px;margin:auto;padding:34px 52px 34px 35px;background:#fff;border:2px solid #d8e0ea;border-radius:92px 24px 24px 92px;box-shadow:inset 0 0 0 7px #f8fafc,0 16px 38px rgba(15,23,42,.1)}.bus-designer-shell:before{position:absolute;top:24px;bottom:24px;left:12px;width:9px;content:"";background:linear-gradient(#cbd5e1 0 28%,transparent 28% 40%,#cbd5e1 40% 68%,transparent 68% 80%,#cbd5e1 80%);border-radius:9px}.bus-designer-shell:after{position:absolute;top:50%;right:14px;width:7px;height:44%;content:"";background:#dce3ed;border-radius:6px;transform:translateY(-50%)}.bus-front-marker{display:flex;flex:0 0 74px;align-items:center;flex-direction:column;justify-content:center;gap:3px;color:#2454d6}.bus-front-marker span{font-size:10px;font-weight:850;text-transform:uppercase}.steering-wheel{display:grid;width:39px;height:39px;margin-bottom:7px;place-items:center;color:#334155;background:#f1f5f9;border:1px solid #dce3ed;border-radius:50%}.bus-front-gap{width:12px}.designer-seat-map{display:inline-flex!important;align-items:flex-start!important;flex-direction:column!important;gap:3px!important;margin:0!important}.designer-seat-map .seat-row{gap:6px!important}.designer-seat-map .seat-container{width:59px!important;height:59px!important;margin:1px!important}.designer-seat-map .seat-icon{position:relative!important;cursor:pointer!important}.designer-seat-map .seat-icon.is-configured{filter:drop-shadow(0 4px 5px rgba(36,84,214,.2))}.designer-seat-map .aisle-icon{position:relative!important;cursor:pointer!important;opacity:1!important}.bus-exit{position:absolute;right:20px;bottom:18px;display:flex;align-items:center;gap:3px;color:#64748b;font-size:8px;font-weight:800;text-transform:uppercase}.seat-empty-state{display:flex!important;min-height:385px;align-items:center;flex-direction:column;justify-content:center;color:#64748b;background:#fff!important;border:1px solid #e5eaf1!important;border-radius:13px!important}.empty-bus-icon{display:grid;width:64px;height:64px;margin-bottom:14px;place-items:center;color:#2454d6;background:#eef3ff;border-radius:17px}.empty-bus-title{color:#0f172a;font-size:15px;font-weight:850}.empty-bus-copy{max-width:330px;margin-top:6px;font-size:11px;font-weight:650;text-align:center}@media(max-width:1150px){.editor-stats-col{grid-template-columns:repeat(3,1fr)}.configuration-progress{grid-column:1/4}}@media(max-width:900px){.editor-stats-col{grid-template-columns:1fr 1fr}.configuration-progress{grid-column:1/3}.bus-canvas-scroll{min-height:330px!important}.bus-designer-shell{transform-origin:top left}}@media(max-width:600px){.editor-stats-col{grid-template-columns:1fr}.configuration-progress{grid-column:auto}.editor-stat:nth-child(3){display:none}.bus-canvas-scroll{padding:18px!important}.bus-designer-shell{min-width:480px;transform:scale(.86)}}
</style>

<style>
.internal-dialog,.delete-dialog-modern{overflow:hidden!important;color:#1e293b!important;background:#fff!important;border:1px solid #dfe6ef!important;border-radius:14px!important;box-shadow:0 22px 60px rgba(15,23,42,.2)!important}.internal-dialog-header{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:17px 20px}.dialog-heading{display:flex;align-items:center;gap:11px}.dialog-icon{position:relative;display:grid;flex:0 0 38px;width:38px;height:38px;place-items:center;color:#fff;background:radial-gradient(circle at 90% 5%,rgba(53,184,232,.5),transparent 28px),linear-gradient(135deg,#0e1f46,#2454d6);border-radius:10px;box-shadow:0 5px 12px rgba(36,84,214,.17)}.dialog-title{color:#0f172a;font-size:16px;font-weight:850;line-height:1.2}.dialog-subtitle{margin-top:4px;color:#64748b;font-size:11.5px;font-weight:600}.dialog-close{color:#64748b!important}.internal-dialog-body{padding:20px 22px!important}.internal-dialog-body .v-radio-group{padding:0}.internal-dialog-body .v-radio{min-height:49px;margin:5px 0;padding:0 12px;color:#334155;background:#f8fafc;border:1px solid #e8edf5;border-radius:9px}.internal-dialog-body .v-radio:has(.v-selection-control--dirty){color:#2454d6;background:#eef3ff;border-color:#cbd9ff}.internal-dialog-body .v-label{color:inherit!important;font-size:13px!important;font-weight:700!important;opacity:1!important}.internal-dialog-actions{justify-content:flex-end!important;gap:9px!important;padding:14px 20px!important}.preview-dialog-body,.structure-preview-body{max-height:70vh;overflow:auto;background:linear-gradient(180deg,#f8fafc,#fff)}.preview-dialog-body>.seat-map-container{display:flex!important;width:max-content;min-width:360px;margin:auto;padding:22px 30px;background:#fff;border:2px solid #dce3ed;border-radius:55px 15px 15px 55px;box-shadow:inset 0 0 0 5px #f8fafc,0 10px 25px rgba(15,23,42,.07)}.structure-preview-body>.d-flex{position:relative;width:max-content;min-width:430px;margin:auto;padding:28px 38px!important;background:#fff;border:2px solid #dce3ed;border-radius:65px 17px 17px 65px;box-shadow:inset 0 0 0 6px #f8fafc,0 12px 30px rgba(15,23,42,.08)}.structure-preview-body>.d-flex:after{position:absolute;right:12px;width:7px;height:44%;content:"";background:#dce3ed;border-radius:5px}.structure-preview-dialog .seat-icon-card{display:grid!important;width:48px!important;height:48px!important;place-items:center!important;color:#2454d6!important}.structure-preview-dialog .seat-label-card{top:16px!important;color:#fff!important;font-size:10px!important;font-weight:900!important}.structure-preview-dialog .aisle-icon-card{display:grid!important;width:46px!important;height:46px!important;place-items:center!important;background:repeating-linear-gradient(135deg,#f8fafc,#f8fafc 5px,#eef2f6 5px,#eef2f6 10px)!important;border:1px dashed #cbd5e1!important;border-radius:9px!important}.delete-dialog-modern{padding:29px 27px 24px;text-align:center}.delete-icon-modern{display:grid;width:56px;height:56px;margin:0 auto 16px;place-items:center;color:#dc2626;background:#fff1f2;border:1px solid #ffe0e4;border-radius:15px}.delete-title-modern{color:#0f172a;font-size:18px;font-weight:850}.delete-message-modern{max-width:350px;margin:10px auto 22px;color:#64748b;font-size:12.5px;font-weight:600;line-height:1.55}.delete-message-modern strong{color:#334155;font-weight:800}.delete-actions-modern{display:flex;justify-content:center;gap:9px}.delete-button-modern{min-width:112px!important;min-height:40px!important;color:#fff!important;background:#dc2626!important;border-radius:9px!important;font-size:12.5px!important;font-weight:800!important;letter-spacing:0!important;text-transform:none!important}@media(max-width:600px){.internal-dialog-header{padding:14px}.dialog-subtitle{max-width:240px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.internal-dialog-body{padding:15px!important}.structure-preview-body>.d-flex{min-width:360px;transform:scale(.84);transform-origin:top center}}
</style>

<style>
.structures-table-toolbar{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:18px!important;min-height:69px!important;padding:12px 17px!important}.structures-section-title{color:#0f172a;font-size:15px;font-weight:850}.structures-section-subtitle{margin-top:3px;color:#64748b;font-size:11px;font-weight:650}.structures-search{flex:0 1 320px!important;max-width:320px!important}.structures-search .v-field{border-radius:9px!important;font-size:12px!important}.structures-table{color:#1e293b!important;background:transparent!important}.structures-table thead{display:table-header-group!important;visibility:visible!important}.structures-table thead th{height:40px!important;color:#334155!important;font-size:11px!important;font-weight:850!important;letter-spacing:.04em!important;text-transform:uppercase!important;background:#f8fafc!important;border-bottom:1px solid #e8edf5!important}.structures-table tbody td{height:62px!important;color:#1e293b!important;font-size:13px!important;font-weight:600!important;border-bottom:1px solid #eef2f6!important}.structures-table tbody tr:hover{background:#f8faff!important}.structures-table .v-data-table-footer{min-height:52px!important;padding:6px 16px!important;color:#334155!important;font-size:11.5px!important;font-weight:700!important}.structures-table .v-data-table__th--sortable:hover,.structures-table .v-data-table__th--sorted{color:#2454d6!important;background:#f4f7ff!important}.structure-name-cell{display:flex;align-items:center;gap:10px;min-width:0}.structure-avatar{display:grid;flex:0 0 38px;width:38px;height:38px;place-items:center;color:#2454d6;background:#eef3ff;border:1px solid #dce6ff;border-radius:9px}.structure-copy{min-width:0}.structure-name{max-width:320px;overflow:hidden;color:#0f172a;font-size:13.5px;font-weight:850;text-overflow:ellipsis;white-space:nowrap}.structure-meta{margin-top:2px;color:#526176;font-size:11px;font-weight:700}.seat-count-badge{display:inline-flex;align-items:center;gap:6px;padding:5px 9px;color:#2454d6;background:#eef3ff;border:1px solid #dce6ff;border-radius:8px;cursor:pointer}.seat-count-badge strong{font-size:12.5px;font-weight:900}.seat-count-badge span{color:#526176;font-size:10.5px;font-weight:700}.seat-count-badge:hover{background:#e5edff;border-color:#bfd0ff}.structure-description{display:block;max-width:430px;overflow:hidden;color:#334155;font-size:12.5px;font-weight:700;text-overflow:ellipsis;white-space:nowrap}.structure-actions{display:flex;justify-content:flex-end;gap:2px}.action-button{border-radius:8px!important}.action-button--view{color:#64748b!important}.action-button--view:hover{color:#2454d6!important;background:#eef3ff!important}.action-button--edit{color:#2454d6!important}.action-button--edit:hover{background:#eef3ff!important}.action-button--delete{color:#dc2626!important}.action-button--delete:hover{background:#fff1f2!important}.structures-table-note{display:flex;align-items:center;gap:6px;min-height:42px;padding:9px 16px;color:#64748b;font-size:10.5px;font-weight:650;border-top:1px solid #edf1f5}@media(max-width:900px){.structures-table{overflow-x:auto}.structures-table .v-table__wrapper{min-width:850px}.structures-table-toolbar{align-items:stretch!important;flex-direction:column!important}.structures-search{width:100%!important;max-width:none!important}}
</style>

<style>
.structures-page-header{display:flex!important;align-items:center!important;gap:11px!important;min-height:70px!important;padding:12px 24px!important;background:#fff!important;border-bottom:1px solid #e8edf5!important;border-radius:0!important}.structures-page-icon{display:grid!important;flex:0 0 38px!important;width:38px!important;height:38px!important;place-items:center!important;color:#fff!important;background:radial-gradient(circle at 90% 5%,rgba(53,184,232,.5),transparent 28px),linear-gradient(135deg,#0e1f46,#2454d6)!important;border-radius:10px!important;box-shadow:0 5px 12px rgba(36,84,214,.17)!important}.structures-heading-copy{margin-left:0!important}.structures-page-title{color:#0f172a;font-size:19px;font-weight:850;line-height:1.2}.structures-page-subtitle{margin-top:3px;color:#526176;font-size:12px;font-weight:650}.structures-add-button,.save-button{min-height:40px!important;color:#fff!important;background:linear-gradient(100deg,#2454d6,#3266e4)!important;border-radius:9px!important;font-size:12.5px!important;font-weight:800!important;letter-spacing:0!important;text-transform:none!important;box-shadow:0 5px 12px rgba(36,84,214,.2)!important}.structures-content{padding:18px 24px 28px!important;background:#f6f8fb}.structures-table-panel{overflow:hidden!important;background:#fff!important;border:1px solid #e8edf5!important;border-radius:13px!important;box-shadow:0 5px 18px rgba(15,23,42,.04)!important}.seat-editor-dialog{color:#1e293b!important;background:#f6f8fb!important}.seat-editor-header{min-height:72px!important;padding:0 22px!important;border-bottom:1px solid #e5eaf1!important;box-shadow:none!important}.editor-header-icon{display:grid;width:40px;height:40px;margin-right:12px;place-items:center;color:#fff;background:radial-gradient(circle at 90% 5%,rgba(53,184,232,.5),transparent 28px),linear-gradient(135deg,#0e1f46,#2454d6);border-radius:10px}.editor-title{color:#0f172a;font-size:17px;font-weight:850}.editor-subtitle{margin-top:3px;color:#64748b;font-size:11.5px;font-weight:600}.editor-progress{display:flex;align-items:baseline;gap:5px;margin-right:18px;padding:7px 11px;color:#2454d6;background:#eef3ff;border:1px solid #dce6ff;border-radius:9px}.editor-progress strong{font-size:17px;font-weight:900}.editor-progress span{font-size:10.5px;font-weight:750}.seat-editor-body{padding:20px 24px!important}.seat-editor-body .v-field{background:#fff;border-radius:9px}.seat-editor-body .v-label{color:#64748b!important;font-size:13px!important;font-weight:650!important;opacity:1!important}.seat-editor-body .v-field__input{color:#1e293b!important;font-size:13px!important;font-weight:650!important}.seat-tools-panel,.seat-map-card{height:100%;overflow:hidden;background:#fff!important;border:1px solid #e5eaf1!important;border-radius:13px!important;box-shadow:0 5px 18px rgba(15,23,42,.04)!important}.panel-toolbar{min-height:52px!important;padding:0 15px!important;border-bottom:1px solid #edf1f5!important}.panel-title{color:#0f172a;font-size:13px;font-weight:850}.editor-help{color:#64748b;font-size:10.5px;font-weight:650}.seat-tools-panel .v-radio-group{padding:6px 3px}.seat-tools-panel .v-radio{min-height:48px;margin:4px 0;padding:0 10px;background:#f8fafc;border:1px solid #e8edf5;border-radius:9px}.seat-tools-panel .v-radio:has(.v-selection-control--dirty){color:#2454d6;background:#eef3ff;border-color:#cbd9ff}.seat-map-card .v-card-text{padding:24px!important;background:linear-gradient(180deg,#f8fafc,#fff)}.seat-map-card .d-flex.align-center.justify-center{position:relative;width:max-content!important;min-width:420px!important;margin:auto;padding:30px 42px!important;background:#fff;border:2px solid #dce3ed;border-radius:70px 18px 18px 70px;box-shadow:inset 0 0 0 6px #f8fafc,0 12px 30px rgba(15,23,42,.08)}.seat-map-card .d-flex.align-center.justify-center:after{position:absolute;right:13px;width:7px;height:46%;content:"";background:#dce3ed;border-radius:5px}.seat-map-container{gap:3px!important}.seat-row{display:flex!important;justify-content:center!important;gap:5px!important;margin:0!important}.seat-container{display:grid!important;width:58px!important;height:58px!important;margin:2px!important;place-items:center!important}.seat-icon,.aisle-icon,.seat-button{transition:transform .16s ease,filter .16s ease!important}.seat-icon:hover,.aisle-icon:hover,.seat-button:hover{transform:translateY(-2px) scale(1.04)!important;filter:brightness(.96)}.seat-icon{display:grid!important;width:54px!important;height:54px!important;place-items:center!important;color:#2454d6!important}.seat-label{position:absolute!important;top:17px!important;left:50%!important;color:#fff!important;font-size:11px!important;font-weight:900!important;transform:translateX(-50%)!important}.aisle-icon{display:grid!important;width:48px!important;height:48px!important;place-items:center!important;color:#94a3b8!important;background:repeating-linear-gradient(135deg,#f8fafc,#f8fafc 5px,#eef2f6 5px,#eef2f6 10px)!important;border:1px dashed #cbd5e1!important;border-radius:9px!important}.aisle-label{color:#64748b!important;font-size:10px!important;font-weight:850!important}.seat-button{min-width:48px!important;width:48px!important;height:48px!important;color:#94a3b8!important;background:#f8fafc!important;border:1px dashed #cbd5e1!important;border-radius:9px!important;box-shadow:none!important}.editor-actions{min-height:68px!important;padding:12px 24px!important;background:#fff!important;border-top:1px solid #e5eaf1!important}.cancel-button{min-width:94px!important;min-height:39px!important;color:#475569!important;font-size:12.5px!important;font-weight:750!important;text-transform:none!important;border-radius:9px!important}.save-button{min-width:155px!important}.seat-editor-overlay .v-overlay__content{margin:0!important}.seat-editor-overlay .v-card-actions{justify-content:flex-end!important;gap:9px!important}@media(max-width:900px){.structures-page-header{padding-inline:14px!important}.structures-content{padding:13px!important}.seat-editor-body{padding:14px!important}.editor-progress{display:none}.seat-map-card .d-flex.align-center.justify-center{min-width:360px!important;padding:24px!important;transform-origin:top center}}@media(max-width:600px){.structures-page-header{align-items:flex-start!important;flex-wrap:wrap!important}.structures-add-button{width:100%}.editor-subtitle,.editor-help{display:none}.seat-editor-header{padding-inline:12px!important}.seat-map-card .v-card-text{overflow:auto!important}.seat-map-card .d-flex.align-center.justify-center{transform:scale(.82)}}
</style>
