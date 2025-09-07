<template>
  <v-snackbar
    class="mt-12"
    location="right top"
    :timeout="sb_timeout"
    :color="sb_type"
    elevation="24"
    :multi-line="true"
    vertical
    v-model="snackbar"
  >
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
  <v-card
    class="d-flex align-center pa-3"
    elevation="0"
  >
    <!-- Icono 
    <v-avatar :color="paleteColors.primary" class="icono-concavo">
      <v-icon cover>mdi-road-variant</v-icon>
    </v-avatar>
    <div class="ml-4">
      <div class="text-h6 font-weight-medium">Rutas</div>
      <div class="text-body-2 text-grey">Gestionar Rutas</div>
    </div>-->

    <!-- Botones -->
    <v-spacer></v-spacer>

    <v-btn
      class="text-subtitle-1 ml-12"
      :color="paleteColors.primary"
      variant="tonal"
      elevation="2"
      prepend-icon="mdi-plus-circle"
      @click="showAdd()"
    >
      Agregar Ruta
    </v-btn>
  </v-card>
  <v-container style="min-width: 100%">
    <v-card flat class="mt-4">
      <!-- Barra superior con título y búsqueda -->
      <v-card-title class="d-flex flex-wrap align-center gap-4 pb-2">
        <!-- Título -->
        <div class="text-subtitle-1 font-weight-bold">Listado de rutas</div>

        <!-- Spacer (solo visible en md+) -->
         <v-spacer class="d-none d-md-block"></v-spacer>

    <!-- Grupo: Autocomplete + Botón buscar -->
   <div class="d-flex align-center gap-2 flex-grow-1" style="max-width: 400px">
          <!-- Autocomplete de sucursales (mismo estilo que el original) -->
          <v-autocomplete :no-data-text="'No hay datos disponibles'" v-model="branch_id" v-if="mostrarFila"
            :items="branches" label="Seleccione una Sucursal" prepend-inner-icon="mdi-store" item-title="name" class="mr-1"
            item-value="id" variant="solo-filled" hide-details single-line flat :rules="selectRules" density="compact" @update:modelValue="initialize">
            <template v-slot:item="{ props, item }">
              <v-list-item v-bind="props" :prepend-avatar="`${this.$axios.defaults.baseURL}images/${item.raw.image}`">
              </v-list-item>
            </template>
          </v-autocomplete>

          <!-- Botón de búsqueda (actualizar datos) 
          <v-btn icon @click="initialize" :color="paleteColors.primary" density="comfortable" :disabled="!branch_id"
            class="mt-2 mt-md-0 mr-5 ml-1">
            <v-icon>mdi-magnify</v-icon>
          </v-btn>-->
        </div>

        <!-- Campo de búsqueda global -->
        <div class="flex-grow-1" style="max-width: 30%">
          <v-text-field
            v-model="search"
            density="compact"
            label="Buscar ruta"
            prepend-inner-icon="mdi-magnify"
            variant="solo-filled"
            hide-details
            single-line
            flat
          ></v-text-field>
        </div>
      </v-card-title>

      <!-- Tabla de rutas con filas personalizadas -->
      <v-data-table
        :headers="headers"
        :items="branchRoutes"
        :search="search"
        :items-per-page-text="'Elementos por página'"
        no-data-text="No hay datos disponibles"
        :loading="loading"
        loading-text="Cargando datos..."
        :hide-default-header="true"
        class="elevation-1"
        style="max-height: 68vh; overflow-y: auto; background: transparent"
      >
        <template v-slot:top>
  <!-- Tarjeta de encabezado con alto fijo -->
  <v-card
    flat
    color="blue-grey-lighten-5"
    class="mb-2 mx-1 rounded-lg"
    elevation="1"
    style="border: 1px solid #ECEFF1; height: 40px; min-height: 40px; display: flex; align-items: center"
  >
    <v-card-text
      class="d-flex pa-2"
      style="width: 100%; min-width: 0; height: 100%; padding: 0 16px !important; display: flex; align-items: center"
    >
              <!-- Negocio (20%) -->
              <div style="width: 10%; min-width: 0" class="text-left font-weight-bold text-subtitle-2">
                Nombre de la ruta
              </div>

              <!-- Nombre (20%) -->
              <div style="width: 25%; min-width: 0" class="text-left font-weight-bold text-subtitle-2">
                Origen
              </div>

              <!-- Teléfono (10%) -->
              <div style="width: 25%; min-width: 0" class="text-left font-weight-bold text-subtitle-2">
                Destino
              </div>

              <!-- Dirección (25%) -->
              <div style="width: 10%; min-width: 0" class="text-left font-weight-bold text-subtitle-2">
                Precio
              </div>

              <div style="width: 10%; min-width: 0" class="text-left font-weight-bold">
                Distancia
              </div>

              <div style="width: 10%; min-width: 0" class="text-left font-weight-bold">
                Duración
              </div>

              <!-- Acciones (25%) -->
              <div style="width: 10%; min-width: 0" class="d-flex justify-left font-weight-bold text-subtitle-2">
                
              </div>
            </v-card-text>
          </v-card>
        </template>
      <!-- Slot personalizado para cada fila -->
      <template v-slot:item="slotProps">
        <tr>
          <td colspan="100%" style="padding: 0; border: none">
            <v-card class="mb-2 mx-1 rounded-lg" elevation="1" density="comfortable" flat>
              <v-card-text class="d-flex align-center pa-2" style="width: 100%; min-width: 0">
                <!-- Columna 1: Nombre de la ruta -->
                <div class="d-flex align-center" style="width: 10%; min-width: 0">
                  <span class="text-truncate font-weight-medium">{{ slotProps.item.name }}</span>
                  <v-tooltip activator="parent" location="top" max-width="350px">
                    <span style="white-space: normal; word-break: break-word">
                      Nombre de la ruta: {{ slotProps.item.name }}
                    </span>
                  </v-tooltip>
                </div>

                <!-- Columna 2: Origen (con avatar) -->
                <div class="d-flex align-center" style="width: 25%; min-width: 0">
                  <v-avatar class="mr-3 icono-concavo" color="grey-lighten-4">
                    <v-img
                      :src="`${$axios.defaults.baseURL}images/${slotProps.item.originImage}?t=${getCacheTimestamp()}`"
                      alt="Imagen del origen" class="icono-concavo" cover></v-img>
                  </v-avatar>
                  <span class="text-truncate">{{ slotProps.item.originName }}</span>
                  <v-tooltip activator="parent" location="top" max-width="350px">
                    <span style="white-space: normal; word-break: break-word">
                      Origen: {{ slotProps.item.originName }}
                    </span>
                  </v-tooltip>
                </div>

                <!-- Columna 3: Destino (con avatar) -->
                <div class="d-flex align-center" style="width: 25%; min-width: 0">
                  <v-avatar class="mr-3 icono-concavo" color="grey-lighten-4">
                    <v-img
                      :src="`${$axios.defaults.baseURL}images/${slotProps.item.destinationImage}?t=${getCacheTimestamp()}`"
                      alt="Imagen del destino" class="icono-concavo" cover></v-img>
                  </v-avatar>
                  <span class="text-truncate">{{ slotProps.item.destinationName }}</span>
                  <v-tooltip activator="parent" location="top" max-width="350px">
                    <span style="white-space: normal; word-break: break-word">
                      Destino: {{ slotProps.item.destinationName }}
                    </span>
                  </v-tooltip>
                </div>

                <!-- Columna 4: Precio -->
                <div style="width: 10%; min-width: 0" class="text-truncate">
                  <span>{{ formatNumber(Number(slotProps.item.price)) }}</span>
                  <v-tooltip activator="parent" location="top" max-width="350px">
                    <span style="white-space: normal; word-break: break-word">
                      Precio: {{ formatNumber(Number(slotProps.item.price)) }}
                    </span>
                  </v-tooltip>
                </div>

                <div style="width: 10%; min-width: 0" class="text-truncate">
                    <span>{{ slotProps.item.distance }} km</span>
                    <v-tooltip activator="parent" location="bottom" max-width="350px">
                      <span style="white-space: normal; word-break: break-word">
                        Distancia: {{ slotProps.item.distance }} km
                      </span>
                    </v-tooltip>
                  </div>

                  <!-- Duración -->
                  <div style="width: 10%; min-width: 0" class="text-truncate">
                    <span>{{ slotProps.item.estimated }} min</span>
                    <v-tooltip activator="parent" location="bottom" max-width="350px">
                      <span style="white-space: normal; word-break: break-word">
                        Duración: {{ slotProps.item.estimated }} minutos
                      </span>
                    </v-tooltip>
                  </div>

                <!-- Columna 5: Acciones -->
                <div class="d-flex flex-column align-end" style="width: 10%; min-width: 0; text-align: right">
                  <div class="d-flex gap-1 mt-1" style="flex-wrap: nowrap">
                    <v-btn size="35" icon variant="outlined" :style="{ 'border-width': '1px', 'border-style': 'solid' }"
                      :color="paleteColors.primary" @click="editItem(slotProps.item)" class="flex-shrink-0 mr-1"
                      title="Editar Ruta">
                      <v-icon size="20">mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn size="35" icon variant="outlined" :style="{ 'border-width': '1px', 'border-style': 'solid' }"
                      :color="paleteColors.error" @click="deleteItem(slotProps.item)" class="flex-shrink-0"
                      title="Eliminar Ruta">
                      <v-icon size="20">mdi-delete</v-icon>
                    </v-btn>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </td>
        </tr>
      </template>
      </v-data-table>
      
            <v-card-actions class="pa-4">
    <v-spacer></v-spacer>
    <v-btn
      variant="flat"
      :color="paleteColors.gris"
      to="/company"
      aria-label="Volver a Empresa"
    >
      Volver
    </v-btn>
  </v-card-actions>
    </v-card>
  </v-container>
  <v-dialog v-model="dialog" max-width="500px">
    <v-form ref="form" v-model="valid" enctype="multipart/form-data">
      <v-card>
        <v-toolbar :color="paleteColors.primary">
          <span class="text-subtitle-2 ml-4">{{ formTitle }}</span>
        </v-toolbar>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12" md="12">
                <v-autocomplete :no-data-text="'No hay datos disponibles'" v-model="editedItem.branch_id" v-if="mostrarFila"
                :items="branches" label="Seleccione una Sucursal" prepend-icon="mdi-store" item-title="name"
                item-value="id" variant="underlined" hide-details single-line flat :rules="selectRules" @update:modelValue="showAdd" :disabled="editedIndex !== -1">
                <template v-slot:item="{ props, item }">
                  <v-list-item v-bind="props" :prepend-avatar="`${this.$axios.defaults.baseURL}images/${item.raw.image}`">
                  </v-list-item>
                </template>
          </v-autocomplete>
              </v-col>
              <v-col cols="12" md="12">
                <v-text-field
                  v-model="editedItem.name"
                  label="Nombre"
                  prepend-icon="mdi-store"
                  variant="underlined"
                  :rules="nameRules"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="12">
                <v-autocomplete
                  :no-data-text="'No hay datos disponibles'"
                  v-model="editedItem.origin_id"
                  :items="locationsOrigins"
                  label="Origen"
                  prepend-icon="mdi-arrow-up-circle"
                  item-title="address"
                  item-value="id"
                  variant="underlined"
                  :rules="selectRules"
                  :disabled="!!editedItem.origin_id"
                >
                  <template v-slot:item="{ props, item }">
                    <v-list-item
                      v-bind="props"
                      :prepend-avatar="`${this.$axios.defaults.baseURL}images/${item.raw.image}`"
                      :title="item.raw.address"
                    ></v-list-item>
                  </template>
                </v-autocomplete>
              </v-col>
              <v-col cols="12" md="12">
                <v-autocomplete
                  :no-data-text="'No hay datos disponibles'"
                  v-model="editedItem.destination_id"
                  :items="filteredDestinations"
                  label="Destino"
                  prepend-icon="mdi-arrow-down-circle"
                  item-title="address"
                  item-value="id"
                  variant="underlined"
                  :rules="selectRules"
                >
                  <template v-slot:item="{ props, item }">
                    <v-list-item
                      v-bind="props"
                      :prepend-avatar="`${this.$axios.defaults.baseURL}images/${item.raw.image}`"
                      :title="item.raw.address"
                    ></v-list-item>
                  </template>
                </v-autocomplete>
              </v-col>
              <v-col cols="12" md="12">
                <v-text-field v-model="editedItem.price" label="Precio" type="number" variant="underlined"
                  density="compact" prepend-icon="mdi-cash" :rules="[(v) => v > 0 || 'Debe ser un precio válido']"
                  placeholder="Ingrese el precio del pasaje" min="0" step="1.00">
                </v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="editedItem.distance"
                  
                  label="Distancia (Km)"
                  prepend-icon="mdi-ruler"
                  variant="underlined"
                  :rules="distanceRules"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="editedItem.estimated"
                  
                  label="Duración (Minutos)"
                  prepend-icon="mdi-timer"
                  variant="underlined"
                  :rules="durationRules"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn :color="paleteColors.gris" variant="flat" @click="close">Cancelar</v-btn>
          <v-btn
            :color="paleteColors.primary"
            variant="flat"
            @click="save"
            :disabled="!valid"
            :loading="loading"
            >Aceptar</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
  <v-dialog v-model="dialogDelete" max-width="500px">
    <v-card>
      <v-toolbar :color="paleteColors.error">
        <span class="text-subtitle-2 ml-4"> Eliminar una Ruta</span>
      </v-toolbar>

      <v-card-text class="mt-2 mb-2"> ¿Desea eliminar la ruta seleccionada?</v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn :color="paleteColors.gris" variant="flat" @click="closeDelete">
          Cancelar
        </v-btn>
        <v-btn :color="paleteColors.error" variant="flat" @click="deleteItemConfirm">
          Aceptar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { paleteColors } from "@/assets/colors";
import { handleRequest } from "@/utils/api"; // Ruta al archivo
import LocalStorageService from "@/LocalStorageService";
export default {
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
    dialog: false,
    dialogDelete: false,
    locations: [],
    locationsOrigins: [],
    filteredDestinations: [],
    routes: [],
    branches: [],
    branchRoutes: [],
    data: {},
    branch_id: '',
    mostrarFila: false,
    headers: [
      { title: "Nombre", value: "name", width: "15%" },
      { title: "Origen", value: "originAddress", width: "30%" },
      { title: "Destino", value: "destinationAddress", width: "30%" },
      { title: "Distancia (Km)", value: "distance", width: "5%" },
      { title: "Duración (Minutos)", value: "estimated", width: "5%" },
      { title: "Acciones", value: "actions", sortable: false, width: "15%" },
    ],

    editedItem: {
      id: "",
      name: "",
      origin_id: "",
      destination_id: "",
      distance: "",
      estimated: "",
      status: "1",
      route_id: "",
      price: "",
      branch_id: "",
    },
    originalItem: {
      id: "",
      name: "",
      origin_id: "",
      destination_id: "",
      distance: "",
      estimated: "",
      status: "1",
      route_id: "",
      price: "",
      branch_id: "",
    },
    defaultItem: {
      id: "",
      name: "",
      origin_id: "",
      destination_id: "",
      distance: "",
      estimated: "",
      status: "1",
      route_id: "",
      price: "",
      branch_id: "",
    },
    editedIndex: -1,
    search: "",
    nameRules: [
      (v) => !!v || "El campo es requerido",
      (v) => (v && v.length <= 50) || "El campo debe tener menos de 51 caracteres",
      (v) => (v && v.length >= 3) || "El campo debe tener al menos 3 caracteres",
    ],
    selectRules: [(v) => !!v || "Seleccionar al menos un elemento"],
    distanceRules: [
      (v) => !isNaN(v) || "La distancia debe ser un número",
      (v) => v > 0 || "La distancia debe ser mayor a 0",
    ],
    durationRules: [
      (v) => !isNaN(v) || "La duración debe ser un número",
      (v) => v > 0 || "La duración debe ser mayor a 0",
    ],
  }),
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "Agregar Ruta" : "Editar Ruta";
    },
    imgedit() {
      return this.imgMiniatura;
    },
  },
  watch: {
  'editedItem.origin_id'(newOriginId) {
    if (newOriginId) {
      // Filtrar locations para excluir el origen seleccionado
      this.filteredDestinations = this.locations.filter(
        location => location.id !== newOriginId
      );
    } else {
      // Si no hay origen, mostrar todos los destinos
      this.filteredDestinations = this.locations;
    }
  }
},
  mounted() {
    this.role = JSON.parse(LocalStorageService.getItem("role"));
    this.company_id = LocalStorageService.getItem("business_id");
    if (this.role === "Administrador") {
      this.showBranches();
      this.mostrarFila = true;
    } else {
      this.branch_id = LocalStorageService.getItem("branch_id");
      this.initialize();
    }
  },
  methods: {
    formatNumber(value) {
      const numberValue = parseFloat(value);

    // Si no es un número válido, devolvemos '0.00'
    if (isNaN(numberValue)) {
      return '0.00';
    }
      // Si el valor es menor que 1000, devuelve el valor original con dos decimales
      if (value < 1000) {
        return (Math.round((value + Number.EPSILON) * 100) / 100).toLocaleString(
          "en-US",
          { minimumFractionDigits: 2, maximumFractionDigits: 2 }
        );
      }

      // Primero, redondea el valor a dos decimales
      value = Math.round((value + Number.EPSILON) * 100) / 100;

      // Convierte el valor a cadena con formato de número local (en-US)
      let formattedValue = value.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      return formattedValue;
    },
    async showBranches() {
      try {
        const result = await handleRequest({
          endpoint: "branch",
          method: "GET",
        });

        if (result.success) {
          // Si la solicitud es exitosa, asignamos las sucursales
          this.branches = result.data?.branches || [];
          this.branch_id = this.branches[0].id;
        } else {
          // Si no hay datos, asignamos un array vacío
          this.branches = [];
        }
      } catch (error) {
        this.loading = false;
        // Captura de errores no controlados
        //this.showAlert('error', 'Ocurrió un error inesperado al procesar la solicitud.', 3000);
      } finally {
        this.loading = false;
        this.initialize();
      }
    },
    getCacheTimestamp() {
      // Usamos medianoche (00:00:00) del día actual
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return startOfDay.getTime(); // Ej: 1714003200000 (cambia una vez al día)
    },
    async showAdd() {
      this.data = {};
      this.editedIndex = -1;
      this.editedItem.branch_id = 
  (this.editedItem.branch_id !== null && 
   this.editedItem.branch_id !== undefined && 
   this.editedItem.branch_id !== '') 
    ? this.editedItem.branch_id 
    : this.branch_id;
      this.data.branch_id = this.editedItem.branch_id;
      try {
        const result = await handleRequest({
          endpoint: "location-route",
          method: "POST",
          data: this.data,
        });

        if (result.success) {
          this.locations = result.data?.destinations || [];
          this.locationsOrigins = result.data?.origins || [];
          
          const branchroutes = result.data?.branchroutes || [];
          if (this.locationsOrigins.length > 0 && branchroutes.length > 0) {
          this.editedItem.origin_id = this.locationsOrigins[0].id;
        }else{
          this.editedItem.origin_id = null;
        }
        // Inicializar filteredDestinations (sin filtrar al inicio)
        this.filteredDestinations = this.locations;
        } else {
          // Si no hay datos, asignamos un array vacío
          this.locations = [];
          this.locationsOrigins = [];
          this.filteredDestinations = [];
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
    },
    async initialize() {
      this.data = {};
      this.data.branch_id = this.branch_id;
      try {
        this.loading = true;
        const result = await handleRequest({
          endpoint: "branch-routes",
          method: "POST",
          data: this.data,
        });

        if (result.success) {
          // Si la solicitud es exitosa, asignamos las sucursales
          this.branchRoutes = result.data?.branchRoutes || [];
        } else {
          // Si no hay datos, asignamos un array vacío
          this.branchRoutes = [];
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
          "name",
          "origin_id",
          "destination_id",
          "distance",
          "estimated",
          "status",
          "branch_id",
          "route_id",
          "price"
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
          //updatedFields.branch_id = this.branch_id;
          try {
            const result = await handleRequest({
              endpoint: "route",
              method: "POST",
              data: updatedFields,
            });

            // Manejo de la respuesta según el resultado
            if (result.success) {
              this.showAlert("success", result.message, 3000);
              this.branch_id = this.editedItem.branch_id;
              this.initialize();
              this.loading = false;
            } else {
              this.showAlert("warning", result.message, 3000);
              this.loading = false;
            }
          } catch (error) {
            // Este bloque captura errores inesperados fuera del manejo estándar
            this.showAlert(
              "error",
              "Ocurrió un error inesperado al procesar la solicitud.",
              3000
            );
            this.loading = false;
          }
        }
      } else {
        this.valid = false;
        const fieldsToUpdate = [
          "name",
          "origin_id",
          "destination_id",
          "distance",
          "estimated",
          "status",
          "branch_id",
          "route_id",
          "price"
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
          try {
            const result = await handleRequest({
              endpoint: "route",
              method: "PUT",
              data: updatedFields,
            });

            // Manejo de la respuesta según el resultado
            if (result.success) {
              this.showAlert("success", result.message, 3000);
              this.initialize();
              this.loading = false;
            } else {
              this.showAlert("warning", result.message, 3000);
              this.loading = false;
            }
          } catch (error) {
            // Este bloque captura errores inesperados fuera del manejo estándar
            this.showAlert(
              "error",
              "Ocurrió un error inesperado al procesar la solicitud.",
              3000
            );
            this.loading = false;
          }
        } else {
          this.showAlert("success", "No se realizaron cambios.", 3000);
          this.loading = false;
        }
      }
      this.close();
    },
    async editItem(item) {
      this.editedIndex = 1;
      this.originalItem = Object.assign({}, item);
      this.editedItem = Object.assign({}, item);
      this.data = {};
      this.data.branch_id = this.branch_id;
      try {
        const result = await handleRequest({
          endpoint: "location-route",
          method: "POST",
          data: this.data,
        });

        if (result.success) {
          this.locations = result.data?.destinations || [];
          this.locationsOrigins = result.data?.origins || [];
          this.filteredDestinations = this.locations;
        } else {
          // Si no hay datos, asignamos un array vacío
          this.locations = [];
          this.locationsOrigins = [];
          this.filteredDestinations = [];
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
          endpoint: "route-destroy",
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
/* OCULTAR HEADER DE v-data-table - Vuetify 3.4.7 */
/* Máxima especificidad para ocultar el thead */
.v-data-table > .v-data-table__wrapper > table > thead,
.v-data-table > .v-data-table__wrapper > .v-table > table > thead,
.v-data-table__content > table > thead,
.v-data-table__content > thead,
table.v-table > thead,
.v-table > .v-table__wrapper > table > thead {
  display: none !important;
  visibility: hidden !important;
  height: 0 !important;
  margin: 0 !important;
  padding: 0 !important;
  border: none !important;
  border-spacing: 0 !important;
  border-collapse: collapse !important;
}
.hidden-header .v-data-table__content > table > thead {
  display: none !important;
}
</style>
