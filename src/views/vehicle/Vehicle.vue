<template>
  <div class="vehicles-page">
    <v-snackbar v-model="snackbar" location="right top" :timeout="sb_timeout" :color="sb_type" elevation="10" class="busgo-snackbar">
      <div class="snackbar-content">
        <v-icon :icon="sb_icon" size="22" />
        <div><div class="snackbar-title">{{ sb_title }}</div><div class="snackbar-message">{{ sb_message }}</div></div>
      </div>
    </v-snackbar>

    <header class="page-header">
      <div class="page-heading">
        <div class="page-icon"><v-icon size="21">mdi-bus</v-icon></div>
        <div><h1 class="page-title">Vehículos</h1><p class="page-subtitle">Administra la flota, capacidad y asignación de trabajadores</p></div>
      </div>
      <v-btn class="add-button" prepend-icon="mdi-plus" elevation="0" @click="showAdd">Agregar vehículo</v-btn>
    </header>

    <v-container fluid class="page-content">
      <v-row class="summary-row">
        <v-col cols="12" sm="4"><div class="summary-card"><div class="summary-icon summary-icon--blue"><v-icon size="19">mdi-bus-multiple</v-icon></div><div><div class="summary-value">{{ vehicles.length }}</div><div class="summary-label">Total de vehículos</div></div></div></v-col>
        <v-col cols="12" sm="4"><div class="summary-card"><div class="summary-icon summary-icon--green"><v-icon size="19">mdi-check-circle-outline</v-icon></div><div><div class="summary-value">{{ activeVehicles }}</div><div class="summary-label">Vehículos activos</div></div></div></v-col>
        <v-col cols="12" sm="4"><div class="summary-card"><div class="summary-icon summary-icon--amber"><v-icon size="19">mdi-seat-passenger</v-icon></div><div><div class="summary-value">{{ totalSeats }}</div><div class="summary-label">Capacidad total</div></div></div></v-col>
      </v-row>

      <v-card class="table-panel" elevation="0">
        <div class="table-toolbar">
          <div><div class="section-title">Listado de vehículos</div><div class="section-subtitle">{{ registeredCountText }}</div></div>
          <div class="toolbar-filters">
            <v-text-field v-model="search" class="search-field" density="compact" placeholder="Buscar vehículo..." prepend-inner-icon="mdi-magnify" variant="outlined" hide-details clearable />
          </div>
        </div>
        <v-divider />

        <v-data-table
          v-model:items-per-page="itemsPerPage"
          v-model:page="page"
          v-model:sort-by="sortBy"
          :headers="headers"
          :items="vehicles"
          :search="search"
          :loading="loading"
          :hide-default-header="false"
          sort-asc-icon="mdi-arrow-up"
          sort-desc-icon="mdi-arrow-down"
          :items-per-page-options="[5, 10, 15, 25]"
          items-per-page-text="Elementos por página"
          no-data-text="No hay vehículos disponibles"
          loading-text="Cargando vehículos..."
          class="vehicles-table"
        >
          <template #loading><v-skeleton-loader type="table-row@5" /></template>

          <template #[`item.plate`]="{ item }">
            <div class="vehicle-name-cell">
              <div class="vehicle-avatar">
                <v-img v-if="item.image" :src="`${this.$axios.defaults.baseURL}images/${item.image}?v=${imageVersion}`" class="vehicle-photo" width="34" height="34" cover>
                  <template #error><div class="image-fallback"><v-icon size="17">mdi-bus</v-icon></div></template>
                </v-img>
                <v-icon v-else size="17">mdi-bus</v-icon>
              </div>
              <div class="cell-copy"><div class="vehicle-plate">{{ item.plate || "Sin patente" }}</div><div class="vehicle-number">{{ item.internal_number || "Sin número interno" }}</div></div>
            </div>
          </template>
          <template #[`item.brand`]="{ item }"><span class="vehicle-text">{{ item.brand || "Sin marca" }}</span></template>
          <template #[`item.model`]="{ item }"><span class="vehicle-text">{{ item.model || "Sin modelo" }}</span></template>
          <template #[`item.seats`]="{ item }"><span class="seat-badge"><v-icon size="14">mdi-seat-passenger</v-icon>{{ item.seats || 0 }}</span></template>
          <template #[`item.state`]="{ item }"><span class="status-badge" :class="Number(item.state) === 1 ? 'status-badge--active' : 'status-badge--inactive'"><span class="status-dot"></span>{{ Number(item.state) === 1 ? "Activo" : "Inactivo" }}</span></template>
          <template #[`item.actions`]="{ item }">
            <div class="action-buttons">
              <v-tooltip text="Asignar trabajadores" location="top"><template #activator="{ props }"><v-btn v-bind="props" icon="mdi-account-tie-outline" variant="text" size="small" class="action-button action-button--worker" @click="showAddWorker(item)" /></template></v-tooltip>
              <v-tooltip text="Editar vehículo" location="top"><template #activator="{ props }"><v-btn v-bind="props" icon="mdi-pencil-outline" variant="text" size="small" class="action-button action-button--edit" @click="editItem(item)" /></template></v-tooltip>
              <v-tooltip text="Eliminar vehículo" location="top"><template #activator="{ props }"><v-btn v-bind="props" icon="mdi-trash-can-outline" variant="text" size="small" class="action-button action-button--delete" @click="deleteItem(item)" /></template></v-tooltip>
            </div>
          </template>
        </v-data-table>
        <div class="table-footer-note"><v-icon size="15">mdi-information-outline</v-icon>Gestiona los trabajadores asignados desde las acciones de cada vehículo.</div>
      </v-card>
    </v-container>

    <!-- Nivel principal · diálogo interno para crear o editar -->
    <v-dialog v-model="dialog" max-width="760" persistent>
      <v-form ref="form" v-model="valid" enctype="multipart/form-data" @submit.prevent="save">
        <v-card class="form-dialog" elevation="0">
          <div class="dialog-header">
            <div class="dialog-heading">
              <div class="dialog-icon"><v-icon class="dialog-icon-main" size="20">mdi-bus</v-icon><v-icon class="dialog-icon-action" size="11">{{ editedIndex === -1 ? "mdi-plus" : "mdi-pencil" }}</v-icon></div>
              <div><div class="dialog-title">{{ formTitle }}</div><div class="dialog-subtitle">{{ editedIndex === -1 ? "Registra un nuevo vehículo en la flota" : "Actualiza la información del vehículo" }}</div></div>
            </div>
            <v-btn icon="mdi-close" variant="text" size="small" class="dialog-close" :disabled="loading" @click="close" />
          </div>
          <v-divider />

          <v-card-text class="dialog-body">
            <div class="form-section-label">Información general</div>
            <v-row dense>
              <v-col cols="12">
                <v-autocomplete
                  v-model="editedItem.structure_id"
                  :items="structures"
                  item-title="name"
                  item-value="id"
                  label="Estructura de asientos"
                  prepend-inner-icon="mdi-seat-passenger"
                  variant="outlined"
                  density="comfortable"
                  no-data-text="No hay estructuras disponibles"
                  :rules="selectRules"
                  :menu-props="{ contentClass: 'vehicle-structure-menu' }"
                  @update:model-value="updateSeats"
                >
                  <template #item="{ props, item }">
                    <v-list-item v-bind="props" :title="item.raw.name" :subtitle="item.raw.description">
                      <template #prepend><div class="structure-menu-icon"><v-icon size="18">mdi-seat-passenger</v-icon></div></template>
                      <template #append><span class="structure-seat-count">{{ item.raw.seatCount || 0 }} asientos</span></template>
                    </v-list-item>
                  </template>
                </v-autocomplete>
              </v-col>
              <v-col cols="12" md="6"><v-text-field v-model.trim="editedItem.brand" label="Marca" placeholder="Ej.: Mercedes-Benz" prepend-inner-icon="mdi-bus-marker" variant="outlined" density="comfortable" :rules="nameRules" maxlength="50" clearable /></v-col>
              <v-col cols="12" md="6"><v-text-field v-model.trim="editedItem.model" label="Modelo" placeholder="Ej.: Marcopolo G7" prepend-inner-icon="mdi-bus-side" variant="outlined" density="comfortable" :rules="nameRules" maxlength="50" clearable /></v-col>
              <v-col cols="12" md="4"><v-text-field v-model.trim="editedItem.plate" label="Patente" placeholder="Ej.: ABCD12" prepend-inner-icon="mdi-card-text-outline" variant="outlined" density="comfortable" :rules="[(v) => !!v || 'La patente es requerida']" clearable /></v-col>
              <v-col cols="12" md="4"><v-text-field v-model.trim="editedItem.internal_number" label="Número interno" placeholder="Ej.: BUS-014" prepend-inner-icon="mdi-pound" variant="outlined" density="comfortable" clearable /></v-col>
              <v-col cols="12" md="4"><v-text-field v-model="editedItem.seats" label="Asientos" prepend-inner-icon="mdi-seat-passenger" variant="outlined" density="comfortable" :rules="[(v) => !!v || 'El número de asientos es requerido', (v) => !isNaN(v) || 'Debe ser un número']" disabled /></v-col>
            </v-row>

            <div class="status-control">
              <div><div class="status-control-title">Estado del vehículo</div><div class="status-control-description">Los vehículos inactivos no estarán disponibles para la operación.</div></div>
              <div class="status-switch" :class="Number(editedItem.state) === 1 ? 'is-active' : 'is-inactive'"><span>{{ Number(editedItem.state) === 1 ? "Activo" : "Inactivo" }}</span><v-switch v-model="editedItem.state" :true-value="1" :false-value="0" color="success" hide-details inset /></div>
            </div>

            <div class="form-section-label form-section-label--spaced">Imagen del vehículo</div>
            <div class="image-upload-area">
              <div class="image-preview">
                <v-img v-if="imgedit" :src="imgedit" cover><template #error><div class="preview-placeholder"><v-icon size="28">mdi-image-off-outline</v-icon></div></template></v-img>
                <div v-else class="preview-placeholder"><v-icon size="28">mdi-bus</v-icon></div>
              </div>
              <div class="upload-copy">
                <div class="upload-title">Fotografía del vehículo</div>
                <div class="upload-description">Formatos JPG, JPEG o PNG. Tamaño máximo: 500 KB.</div>
                <v-file-input ref="fileInput" v-model="file" class="file-field" label="Seleccionar imagen" prepend-inner-icon="mdi-upload-outline" prepend-icon="" variant="outlined" density="compact" accept=".png,.jpg,.jpeg" hide-details clearable @change="onFileSelected" />
              </div>
            </div>
          </v-card-text>
          <v-divider />
          <v-card-actions class="dialog-actions"><v-btn variant="text" class="cancel-button" :disabled="loading" @click="close">Cancelar</v-btn><v-btn type="submit" class="save-button" elevation="0" :loading="loading" :disabled="!valid">{{ editedIndex === -1 ? "Crear vehículo" : "Guardar cambios" }}</v-btn></v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>

    <!-- Nivel principal · diálogo interno de eliminación -->
    <v-dialog v-model="dialogDelete" max-width="430" persistent>
      <v-card class="delete-dialog" elevation="0">
        <div class="delete-icon"><v-icon size="27">mdi-trash-can-outline</v-icon></div>
        <div class="delete-title">Eliminar vehículo</div>
        <div class="delete-message">¿Deseas eliminar el vehículo <strong>{{ editedItem.plate || "seleccionado" }}</strong>? Esta acción no se puede deshacer.</div>
        <div class="delete-actions"><v-btn variant="text" class="cancel-button" :disabled="loading" @click="closeDelete">Cancelar</v-btn><v-btn class="delete-button" elevation="0" :loading="loading" @click="deleteItemConfirm">Eliminar</v-btn></div>
      </v-card>
    </v-dialog>

    <!-- SubNivel externo: VehicleWorker.vue -->
    <v-dialog v-model="dialogVehicleWorker" fullscreen transition="dialog-bottom-transition">
      <v-card class="worker-dialog-shell">
        <v-card-text class="worker-dialog-body"><VehicleWorker :vehicle="selectedVehicle" @close="closeDialogVehicleWorker" /></v-card-text>
        <v-divider />
        <v-card-actions class="worker-dialog-actions"><v-spacer /><v-btn variant="text" class="cancel-button" @click="closeDialogVehicleWorker">Cerrar</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>

import { handleRequest } from "@/utils/api"; // Ruta al archivo

import VehicleWorker from "../vehicleworker/VehicleWorker.vue";

import { paleteColors } from "@/assets/colors";

export default {

  components: {

    VehicleWorker,

  },

  data: () => ({

    snackbar: false,

    sb_type: "",

    sb_message: "",

    sb_timeout: 2000,

    sb_title: "",

    sb_icon: "",

    paleteColors: paleteColors,

    valid: true,

    loading: false,

    mostrar: false,

    file: null,

    imgMiniatura: "",

    dialog: false,

    dialogDelete: false,

    vehicles: [],

    structures: [],

    data: {},

    selectedVehicle: [],

    dialogVehicleWorker: null,

    itemsPerPage: 10,

    page: 1,

    sortBy: [{ key: "plate", order: "asc" }],

    headers: [

      //{ title: 'Sucursal', value: 'branchName', width: '20%' },

      { title: "Patente", key: "plate", sortable: true, width: "24%" },

      { title: "Marca", key: "brand", sortable: true, width: "18%" },

      { title: "Modelo", key: "model", sortable: true, width: "18%" },

      //{ title: 'Rut', value: 'rut', width: '15%' },

      { title: "Asientos", key: "seats", sortable: true, width: "12%" },

      { title: "Estado", key: "state", sortable: true, width: "12%" },

      { title: "", key: "actions", sortable: false, align: "end", width: "16%" },

    ],

    statusOptions: [

      { text: "Activo", value: 1 },

      { text: "Inactivo", value: 0 },

    ],

    editedItem: {

      id: "",

      structure_id: "",

      plate: "",

      internal_number: "",

      model: "",

      brand: "",

      image: "",

      rut: "",

      state: 1,

      seats: "",

    },

    originalItem: {

      id: "",

      structure_id: "",

      plate: "",

      internal_number: "",

      model: "",

      brand: "",

      image: "",

      rut: "",

      state: 1,

      seats: "",

    },

    defaultItem: {

      id: "",

      structure_id: "",

      plate: "",

      internal_number: "",

      model: "",

      brand: "",

      image: "",

      rut: "",

      state: 1,

      seats: "",

    },

    editedIndex: -1,

    search: "",

    imageVersion: 0,

    nameRules: [

      (v) => !!v || "El campo es requerido",

      (v) => (v && v.length <= 50) || "El campo debe tener menos de 51 caracteres",

      (v) => (v && v.length >= 3) || "El campo debe tener al menos de 3 caracteres",

    ],

    selectRules: [(v) => !!v || "Seleccionar al menos un elemento"],

    rutRules: [

      (v) =>

        !v ||

        /^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/.test(v) ||

        "El RUT debe estar en el formato XX.XXX.XXX-Y (ejemplo: 12.345.678-9)",

    ],

  }),

  computed: {

    registeredCountText() {

      const count = this.vehicles.length;

      return `${count} ${count === 1 ? "vehículo registrado" : "vehículos registrados"}`;

    },

    activeVehicles() {

      return this.vehicles.filter((vehicle) => Number(vehicle.state) === 1).length;

    },

    totalSeats() {

      return this.vehicles.reduce((total, vehicle) => total + (Number(vehicle.seats) || 0), 0);

    },

    formTitle() {

      return this.editedIndex === -1 ? "Agregar vehículo" : "Editar vehículo";

    },

    imgedit() {

      return this.imgMiniatura;

    },

  },

  mounted() {

    this.initialize();

  },

  methods: {

    getCacheTimestamp() {

      // Usamos medianoche (00:00:00) del día actual

      const now = new Date();

      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      return startOfDay.getTime(); // Ej: 1714003200000 (cambia una vez al día)

    },

    updateSeats(structureId) {

      // Busca el elemento seleccionado en el array trips

      const selectedStructure = this.structures.find(

        (structure) => structure.id === structureId

      );

      // Si encuentra el elemento, actualiza el valor de seats

      if (selectedStructure) {

        this.editedItem.seats = selectedStructure.seatCount;

      } else {

        this.editedItem.seats = ""; // Reinicia si no hay elemento seleccionado

      }

      console.log();

    },

    async showAdd() {

      this.close();

      try {

        const result = await handleRequest({

          endpoint: "structure",

          method: "GET",

        });

        if (result.success) {

          // Si la solicitud es exitosa, asignamos las sucursales

          this.structures = result.data?.structures || [];

        } else {

          // Si no hay datos, asignamos un array vacío

          this.structures = [];

        }

      } catch (error) {

        this.showAlert(

          "error",

          "Ocurrió un error inesperado al procesar la solicitud.",

          3000

        );

      } finally {

        this.dialog = true;

      }

    },

    close() {

      this.dialog = false;

      this.$nextTick(() => {

        this.editedItem = Object.assign({}, this.defaultItem);

        this.originalItem = Object.assign({}, this.defaultItem);

      });

      this.editedIndex = -1;

      this.file = null;

      this.imgMiniatura = "";

    },

    async initialize() {

      try {

        this.data = {};

        this.data.branch_id = this.editedItem.branch_id;

        this.loading = true;

        const result = await handleRequest({

          endpoint: "vehicle",

          method: "GET",

        });

        if (result.success) {

          // Si la solicitud es exitosa, normalizamos la lista de vehículos

          const rawVehicles = Array.isArray(result.data?.vehicles)

            ? result.data.vehicles

            : Object.values(result.data?.vehicles || {});

          this.vehicles = rawVehicles.map((vehicle) => ({

            ...vehicle,

            internal_number: vehicle.internal_number ?? vehicle.internalNumber ?? "",

          }));

          this.imageVersion += 1;

        } else {

          // Si no hay datos, asignamos un array vacío

          this.vehicles = [];

        }

      } catch (error) {

        this.loading = false;

        // Captura de errores no controlados

        this.showAlert(

          "error",

          "Ocurrió un error inesperado al procesar la solicitud.",

          3000

        );

      } finally {

        this.loading = false;

      }

    },

    async save() {

      this.loading = true;

      if (this.editedIndex === -1) {

        this.valid = false;

        const fieldsToUpdate = [

          "brand",

          "model",

          "plate",

          "internal_number",

          "rut",

          "seats",

          "state",

          "image",

          "structure_id",

        ];

        let updatedFields = Object.keys(this.editedItem)

          .filter(

            (key) =>

              fieldsToUpdate.includes(key) &&

              this.editedItem[key] !== this.originalItem[key]

          )

          .reduce((obj, key) => {

            obj[key] = this.editedItem[key];

            return obj;

          }, {});

        if (Object.keys(updatedFields).length > 0) {

          if (this.file) {

            updatedFields.image = this.editedItem.image;

          }

          const formData = new FormData();

          for (let key in updatedFields) {

            formData.append(key, updatedFields[key]);

          }

          try {

            const result = await handleRequest({

              endpoint: "vehicle",

              method: "POST",

              data: formData,

            });

            // Manejo de la respuesta según el resultado

            if (result.success) {

              this.loading = false;

              this.showAlert("success", result.message, 3000);

              this.initialize();

            } else {

              this.loading = false;

              this.showAlert("warning", result.message, 3000);

            }

          } catch (error) {

            this.loading = false;

            // Este bloque captura errores inesperados fuera del manejo estándar

            this.showAlert(

              "error",

              "Ocurrió un error inesperado al procesar la solicitud.",

              3000

            );

          }

        } else {

          this.loading = false;

          this.showAlert("success", "Debe completar los datos.", 3000);

        }

      } else {

        this.valid = false;

        const fieldsToUpdate = [

          "brand",

          "model",

          "plate",

          "internal_number",

          "rut",

          "seats",

          "state",

          "image",

          "structure_id",

        ];

        let updatedFields = Object.keys(this.editedItem)

          .filter(

            (key) =>

              fieldsToUpdate.includes(key) &&

              this.editedItem[key] !== this.originalItem[key]

          )

          .reduce((obj, key) => {

            obj[key] = this.editedItem[key];

            return obj;

          }, {});

        if (Object.keys(updatedFields).length > 0) {

          updatedFields.id = this.editedItem.id;

          if (this.file) {

            updatedFields.image = this.editedItem.image;

          }

          const formData = new FormData();

          for (let key in updatedFields) {

            formData.append(key, updatedFields[key]);

          }

          try {

            const result = await handleRequest({

              endpoint: "vehicle-update",

              method: "POST",

              data: formData,

            });

            // Manejo de la respuesta según el resultado

            if (result.success) {

              this.loading = false;

              this.showAlert("success", result.message, 3000);

              this.initialize();

            } else {

              this.loading = false;

              this.showAlert("warning", result.message, 3000);

            }

          } catch (error) {

            this.loading = false;

            // Este bloque captura errores inesperados fuera del manejo estándar

            this.showAlert(

              "error",

              "Ocurrió un error inesperado al procesar la solicitud.",

              3000

            );

          }

        } else {

          this.loading = false;

          this.showAlert("success", "No se realizaron cambios.", 3000);

        }

      }

      this.close();

    },

    async editItem(item) {

      this.editedIndex = 1;

      const normalizedItem = {

        ...item,

        internal_number: item.internal_number ?? item.internalNumber ?? "",

      };

      this.originalItem = Object.assign({}, normalizedItem);

      this.editedItem = Object.assign({}, normalizedItem);

      this.file = null;

      // Crear la imagen y configurar el src

      const img = new Image();

      img.src = `${this.$axios.defaults.baseURL}images/${item.image}`; // Se asume que item.image_url es la URL de la imagen

      // Usar una función asíncrona para manejar la carga de la imagen

      img.onload = async () => {

        try {

          // Asignar la imagen cargada a imgMiniatura

          this.imgMiniatura = `${this.$axios.defaults.baseURL}images/${item.image}`;

        } catch (error) {

          console.error("Error al cargar la imagen", error);

          this.showAlert("error", "Error al cargar la imagen.", 3000);

        }

      };

      try {

        // Asignar la imagen cargada a imgMiniatura

        this.imgMiniatura = `${this.$axios.defaults.baseURL}images/${item.image}`;

      } catch (error) {

        console.error("Error al cargar la imagen", error);

        this.showAlert("error", "Error al cargar la imagen.", 3000);

      }

      try {

        const result = await handleRequest({

          endpoint: "structure",

          method: "GET",

        });

        if (result.success) {

          // Si la solicitud es exitosa, asignamos las sucursales

          this.structures = result.data?.structures || [];

        } else {

          // Si no hay datos, asignamos un array vacío

          this.structures = [];

        }

      } catch (error) {

        this.showAlert(

          "error",

          "Ocurrió un error inesperado al procesar la solicitud.",

          3000

        );

      } finally {

        this.dialog = true;

      }

    },

    deleteItem(item) {

      this.editedIndex = 1;

      this.editedItem.id = item.id;

      this.dialogDelete = true;

    },

    closeDelete() {

      this.dialogDelete = false;

      this.$nextTick(() => {

        this.editedItem = Object.assign({}, this.defaultItem);

      });

    },

    async deleteItemConfirm() {

      try {

        let request = {

          id: this.editedItem.id,

        };

        const result = await handleRequest({

          endpoint: "vehicle-destroy",

          method: "POST",

          data: request,

        });

        // Manejo de la respuesta según el resultado

        if (result.success) {

          this.showAlert("success", result.message, 3000);

          this.initialize();

        } else {

          this.showAlert("warning", result.message, 3000);

        }

      } catch (error) {

        // Este bloque captura errores inesperados fuera del manejo estándar

        this.showAlert(

          "error",

          "Ocurrió un error inesperado al procesar la solicitud.",

          3000

        );

      } finally {

        this.closeDelete();

      }

    },

    showAlert(sb_type, sb_message, sb_timeout) {

      this.sb_type = sb_type;

      if (sb_type == "success") {

        this.sb_title = "Éxito";

        this.sb_icon = "mdi-check-circle";

      }

      if (sb_type == "info") {

        this.sb_title = "Información";

        this.sb_icon = "mdi-alert-circle";

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

    imagenDisponible() {

      if (this.imgedit !== undefined && this.imgedit !== "") {

        // Intenta cargar la imagen en un elemento oculto para verificar si está disponible

        let img = new Image();

        img.src = this.imgedit;

        return true; // Devuelve true si la imagen está disponible

      }

      return false; // Si la URL de la imagen no está definida o está vacía, devuelve false

    },

    onFileSelected(event) {

      let file = event.target.files[0];

      // Validar el tamaño del archivo (500 KB máximo)

      const maxSize = 500 * 1024; // 500 KB en bytes

      if (file && file.size > maxSize) {

        this.valid = false;

        this.showAlert("warning", "El archivo de imagen debe ser de máximo 500 KB", 3000);

        return; // Detener el proceso si el archivo es demasiado grande

      }

      this.valid = true;

      this.editedItem.image = file;

      //console.log(this.editedItem.image_cardgift);

      this.cargarImage(file);

    },

    cargarImage(file) {

      let reader = new FileReader();

      reader.onload = (e) => {

        this.imgMiniatura = e.target.result;

      };

      reader.readAsDataURL(file);

    },

    //Trabajadores asociados

    showAddWorker(item) {

      this.selectedVehicle = item; // Asignamos el trabajador seleccionado

      this.dialogVehicleWorker = true; // Abrimos el diálogo

    },

    closeDialogVehicleWorker() {

      this.dialogVehicleWorker = false; // Cerramos el diálogo

      this.selectedVehicle = [];

    },

  },

};

</script>
<style scoped>

.vehicles-page { --blue:#2454d6; --blue-light:#3266e4; min-height:100%; color:#1e293b; background:#f6f8fb; }

.page-header { display:flex; align-items:center; justify-content:space-between; gap:16px; min-height:70px; padding:12px 24px; background:#fff; border-bottom:1px solid #e8edf5; }

.page-heading,.dialog-heading { display:flex; align-items:center; gap:11px; }

.page-icon,.dialog-icon { position:relative; display:grid; flex:0 0 38px; width:38px; height:38px; place-items:center; color:#fff; background:radial-gradient(circle at 90% 5%,rgba(53,184,232,.5),transparent 28px),linear-gradient(135deg,#0e1f46,#2454d6); border-radius:10px; box-shadow:0 5px 12px rgba(36,84,214,.17); }

.dialog-icon-main { transform:translate(-2px,1px); }

.dialog-icon-action { position:absolute; right:5px; bottom:5px; padding:1px; color:#0e1f46; background:#fff; border-radius:50%; box-shadow:0 1px 3px rgba(15,23,42,.22); }

.page-title { margin:0; color:#0f172a; font-size:19px; font-weight:850; line-height:1.2; }.page-subtitle { margin:3px 0 0; color:#526176; font-size:12px; font-weight:650; }

.add-button,.save-button { min-height:40px; color:#fff!important; background:linear-gradient(100deg,#2454d6,#3266e4)!important; border-radius:9px!important; font-size:12.5px; font-weight:800; letter-spacing:0; text-transform:none; box-shadow:0 5px 12px rgba(36,84,214,.2)!important; }

.page-content { padding:18px 24px 28px; }.summary-row { margin-bottom:4px; }

.summary-card { display:flex; align-items:center; gap:11px; min-height:72px; padding:13px 15px; background:#fff; border:1px solid #e8edf5; border-radius:12px; box-shadow:0 4px 14px rgba(15,23,42,.035); }

.summary-icon { display:grid; width:36px; height:36px; place-items:center; border-radius:9px; }.summary-icon--blue { color:#2454d6; background:#eef3ff; }.summary-icon--green { color:#16875a; background:#eaf8f1; }.summary-icon--amber { color:#b76e00; background:#fff5dc; }

.summary-value { color:#0f172a; font-size:20px; font-weight:900; line-height:1; }.summary-label { margin-top:4px; color:#526176; font-size:11px; font-weight:700; }

.table-panel { overflow:hidden; background:#fff; border:1px solid #e8edf5; border-radius:13px!important; box-shadow:0 5px 18px rgba(15,23,42,.04)!important; }

.table-toolbar { display:flex; align-items:center; justify-content:space-between; gap:18px; min-height:69px; padding:12px 17px; }.section-title { color:#0f172a; font-size:15px; font-weight:850; }.section-subtitle { margin-top:3px; color:#64748b; font-size:11px; font-weight:650; }

.toolbar-filters { display:flex; align-items:center; justify-content:flex-end; gap:9px; flex:1; }.branch-filter { flex:0 1 245px; }.search-field { flex:0 1 285px; }.branch-filter :deep(.v-field),.search-field :deep(.v-field) { border-radius:9px; font-size:12px; }.branch-filter :deep(.v-field__outline),.search-field :deep(.v-field__outline) { color:#dce3ed; }

.vehicles-table { color:#1e293b; background:transparent; }.vehicles-table :deep(thead th) { height:40px!important; color:#334155!important; font-size:11px!important; font-weight:850!important; letter-spacing:.04em; text-transform:uppercase; background:#f8fafc!important; border-bottom:1px solid #e8edf5!important; }.vehicles-table :deep(tbody td) { height:58px!important; color:#1e293b; font-size:13px; font-weight:600; border-bottom:1px solid #eef2f6!important; }.vehicles-table :deep(tbody tr:hover) { background:#f8faff!important; }.vehicles-table :deep(.v-data-table-footer) { min-height:52px; padding:6px 16px; color:#334155; font-size:11.5px; font-weight:700; }

.vehicles-table :deep(.v-data-table__th--sortable) { cursor:pointer; user-select:none; transition:color .18s ease,background-color .18s ease; }

.vehicles-table :deep(.v-data-table__th--sortable:hover) { color:#2454d6!important; background:#f4f7ff!important; }

.vehicles-table :deep(.v-data-table-header__content) { display:flex!important; align-items:center!important; gap:5px!important; }

.vehicles-table :deep(.v-data-table-header__sort-icon) { display:inline-flex!important; visibility:visible!important; flex:0 0 auto; width:15px!important; height:15px!important; margin-left:1px!important; color:#94a3b8!important; font-size:15px!important; opacity:.65!important; transition:color .18s ease,opacity .18s ease,transform .18s ease; }

.vehicles-table :deep(.v-data-table__th--sorted) { color:#2454d6!important; background:#f5f7ff!important; }

.vehicles-table :deep(.v-data-table__th--sorted .v-data-table-header__sort-icon) { color:#2454d6!important; opacity:1!important; }

.status-badge { display:inline-flex; align-items:center; gap:5px; padding:4px 7px; font-size:11.5px; font-weight:800; border-radius:7px; }.status-badge--active { color:#116b49; background:#eaf8f1; }.status-badge--inactive { color:#475569; background:#f1f5f9; }.status-dot { width:6px; height:6px; background:currentColor; border-radius:50%; }.description-cell { max-width:260px; overflow:hidden; color:#334155; font-size:12.5px; font-weight:650; text-overflow:ellipsis; white-space:nowrap; }

.action-buttons { display:flex; justify-content:flex-end; gap:2px; }.action-button { border-radius:8px!important; }.action-button--edit { color:#2454d6!important; }.action-button--edit:hover { background:#eef3ff; }.action-button--delete { color:#dc2626!important; }.action-button--delete:hover { background:#fff1f2; }.table-footer-note { display:flex; align-items:center; gap:6px; min-height:42px; padding:9px 16px; color:#64748b; font-size:10.5px; font-weight:650; border-top:1px solid #edf1f5; }

.form-dialog,.delete-dialog { overflow:hidden; color:#1e293b; background:#fff; border:1px solid #dfe6ef; border-radius:14px!important; box-shadow:0 22px 60px rgba(15,23,42,.2)!important; }.dialog-header { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:17px 20px; }.dialog-title { color:#0f172a; font-size:16px; font-weight:850; line-height:1.2; }.dialog-subtitle { margin-top:4px; color:#64748b; font-size:11.5px; font-weight:600; }.dialog-close { color:#64748b!important; }.dialog-body { max-height:70vh; padding:21px 22px 16px!important; overflow-y:auto; }.form-section-label { margin-bottom:13px; color:#475569; font-size:10.5px; font-weight:850; letter-spacing:.065em; text-transform:uppercase; }.form-section-label--spaced { margin-top:7px; }

.dialog-body :deep(.v-field) { border-radius:9px; }.dialog-body :deep(.v-field__outline) { color:#d6dee9; }.dialog-body :deep(.v-label) { color:#64748b; font-size:13px; font-weight:650; opacity:1; }.dialog-body :deep(.v-field__input) { color:#1e293b; font-size:13px; font-weight:650; }

.status-control { display:flex; align-items:center; justify-content:space-between; gap:16px; padding:11px 13px; background:#f8fafc; border:1px solid #e8edf5; border-radius:10px; }.status-control-title { color:#334155; font-size:12.5px; font-weight:800; }.status-control-description { margin-top:4px; color:#64748b; font-size:10.5px; font-weight:600; }.status-switch { display:flex; align-items:center; gap:8px; font-size:11.5px; font-weight:800; }.is-active { color:#16875a; }.is-inactive { color:#64748b; }

.image-upload-area { display:flex; align-items:center; gap:14px; padding:12px; background:#f8fafc; border:1px solid #e8edf5; border-radius:10px; }.image-preview { flex:0 0 92px; width:92px; height:68px; overflow:hidden; background:#eef3ff; border:1px solid #dce6ff; border-radius:9px; }.preview-placeholder { display:grid; width:100%; height:100%; place-items:center; color:#2454d6; }.upload-copy { flex:1; min-width:0; }.upload-title { color:#334155; font-size:12.5px; font-weight:800; }.upload-description { margin:3px 0 8px; color:#64748b; font-size:10.5px; font-weight:600; }.file-field { max-width:330px; }

.dialog-actions { justify-content:flex-end; gap:9px; padding:14px 20px!important; }.cancel-button { min-width:94px; min-height:39px; color:#475569!important; font-size:12.5px; font-weight:750; letter-spacing:0; text-transform:none; border-radius:9px!important; }.cancel-button:hover { background:#f1f5f9; }.save-button { min-width:150px; padding-inline:18px!important; }

.delete-dialog { padding:29px 27px 24px; text-align:center; }.delete-icon { display:grid; width:56px; height:56px; margin:0 auto 16px; place-items:center; color:#dc2626; background:#fff1f2; border:1px solid #ffe0e4; border-radius:15px; }.delete-title { color:#0f172a; font-size:18px; font-weight:850; }.delete-message { max-width:340px; margin:10px auto 22px; color:#64748b; font-size:12.5px; font-weight:600; line-height:1.55; }.delete-message strong { color:#334155; font-weight:800; }.delete-actions { display:flex; justify-content:center; gap:9px; }.delete-button { min-width:112px; min-height:40px; color:#fff!important; background:#dc2626!important; border-radius:9px!important; font-size:12.5px; font-weight:800; letter-spacing:0; text-transform:none; }

.snackbar-content { display:flex; align-items:center; gap:10px; }.snackbar-title { font-size:11px; font-weight:850; }.snackbar-message { margin-top:2px; font-size:9.5px; font-weight:600; }.busgo-snackbar :deep(.v-snackbar__wrapper) { border-radius:11px; }

@media (max-width:1100px) { .vehicles-table { overflow-x:auto; }.vehicles-table :deep(.v-table__wrapper) { min-width:1050px; } }

@media (max-width:959px) { .page-header { padding-inline:17px; }.page-content { padding:15px 17px 24px; }.table-toolbar { align-items:stretch; flex-direction:column; }.toolbar-filters { justify-content:flex-start; }.branch-filter,.search-field { flex:1 1 0; } }

@media (max-width:600px) { .page-header { align-items:flex-start; padding:11px 12px; }.page-subtitle { max-width:210px; }.add-button { min-width:42px!important; padding-inline:10px!important; }.add-button :deep(.v-btn__content) { font-size:0; }.add-button :deep(.v-icon) { margin:0!important; }.page-content { padding:11px 12px 20px; }.toolbar-filters { align-items:stretch; flex-direction:column; }.branch-filter,.search-field { flex-basis:auto; width:100%; }.dialog-header { padding:14px; }.dialog-body { padding:17px 14px 12px!important; }.status-control,.image-upload-area { align-items:flex-start; flex-direction:column; }.status-switch { width:100%; justify-content:space-between; }.dialog-actions { padding-inline:13px!important; } }


.vehicle-name-cell { display:flex; align-items:center; gap:10px; min-width:190px; }
.vehicle-avatar { display:grid; flex:0 0 38px; width:38px; height:38px; place-items:center; overflow:hidden; color:#2454d6; background:#eef3ff; border:1px solid #dce6ff; border-radius:9px; }
.vehicle-photo,.image-fallback { width:100%; height:100%; }.vehicle-photo :deep(.v-img__img) { object-fit:cover; }.image-fallback { display:grid; place-items:center; }
.cell-copy { min-width:0; }.vehicle-plate { overflow:hidden; color:#0f172a; font-size:13px; font-weight:850; text-overflow:ellipsis; white-space:nowrap; }.vehicle-number { margin-top:2px; overflow:hidden; color:#64748b; font-size:10.5px; font-weight:650; text-overflow:ellipsis; white-space:nowrap; }
.vehicle-text { color:#334155; font-size:12.5px; font-weight:700; }
.seat-badge { display:inline-flex; align-items:center; gap:5px; min-height:26px; padding:3px 9px; color:#2454d6; background:#eef3ff; border-radius:8px; font-size:11.5px; font-weight:800; }
.action-button--worker { color:#0c9468!important; }.action-button--worker:hover { background:#eaf8f3; }
.status-control { margin-top:5px; }.status-switch.is-active { color:#0c9468; }.status-switch.is-inactive { color:#64748b; }.status-switch :deep(.v-switch) { flex:0 0 auto; }
.structure-menu-icon { display:grid; width:34px; height:34px; place-items:center; color:#2454d6; background:#eef3ff; border-radius:8px; }.structure-seat-count { color:#475569; font-size:11px; font-weight:750; }
.worker-dialog-shell { background:#f5f7fb!important; }.worker-dialog-body { padding:0!important; }.worker-dialog-actions { min-height:64px; padding:10px 24px!important; background:#fff; }

</style>

<style>

/* Los indicadores nativos viven dentro de v-data-table y requieren alcance global. */

.vehicles-table .v-data-table__th--sortable .v-data-table-header__sort-icon {

  display: inline-flex !important;

  visibility: visible !important;

  width: 15px !important;

  height: 15px !important;

  margin-left: 5px !important;

  color: #94a3b8 !important;

  font-size: 15px !important;

  opacity: 0.72 !important;

}

.vehicles-table thead {

  display: table-header-group !important;

  visibility: visible !important;

}

.vehicles-table thead tr {

  display: table-row !important;

  visibility: visible !important;

}

.vehicles-table thead th {

  display: table-cell !important;

  visibility: visible !important;

}

.vehicles-table .v-data-table__th--sortable:hover .v-data-table-header__sort-icon,

.vehicles-table .v-data-table__th--sorted .v-data-table-header__sort-icon {

  color: #2454d6 !important;

  opacity: 1 !important;

}

</style>
