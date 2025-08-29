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
  <v-card class="d-flex align-center pa-3" elevation="0" style="background-color: #f9f9f9">
    <!-- Icono -->
    <v-avatar :color="paleteColors.primary" class="icono-concavo">
      <v-icon cover>mdi-bus</v-icon>
    </v-avatar>

    <!-- Texto -->
    <div class="ml-4">
      <div class="text-h6 font-weight-medium">Vehículos</div>
      <div class="text-body-2 text-grey">Gestionar Vehículos</div>
    </div>

    <!-- Botones -->
    <v-spacer></v-spacer>

    <v-btn class="text-subtitle-1 ml-12" :color="paleteColors.primary" variant="tonal" elevation="2"
      prepend-icon="mdi-plus-circle" @click="showAdd()">
      Agregar Vehículo
    </v-btn>
  </v-card>
  <v-container style="min-width: 100%;">
    <!--<v-card elevation="6" class="mx-2">
     <v-card-text>
        <v-text-field class="mt-1 mb-1" v-model="search" append-icon="mdi-magnify" label="Buscar" single-line
          hide-details>
        </v-text-field>
        <v-data-table :headers="headers" :search="search" :items="vehicles" class="elevation-1"
          style="max-height: 68vh; overflow-y: auto;" :items-per-page-text="'Elementos por páginas'"
          no-data-text="No hay datos disponibles" :loading="loading" loading-text="Cargando datos...">
          <template v-slot:item.actions="{ item }">
            <v-btn density="comfortable" icon="mdi-account-tie" @click="showAddWorker(item)" :color="paleteColors.green"
              variant="tonal" elevation="1" title="Agregar Trabajador"></v-btn>
            <v-btn density="comfortable" icon="mdi-pencil" @click="editItem(item)" :color="paleteColors.primary"
              variant="tonal" elevation="1" title="Editar Vehículo"></v-btn>
            <v-btn density="comfortable" icon="mdi-delete" @click="deleteItem(item)" :color="paleteColors.error"
              variant="tonal" elevation="1" title="Eliminar Vehículo"></v-btn>
          </template>
          <template v-slot:item.plate="{ item }">
            <v-avatar class="mr-1" elevation="3" color="grey-lighten-4" size="small">
              <v-img :src="`${this.$axios.defaults.baseURL}images/${item.image}?t=${Date.now()}`" alt="image"></v-img>
            </v-avatar>
            {{ item.plate }}
          </template>
          <template v-slot:item.state="{ item }">
            <v-chip :color="item.state === 1 ? paleteColors.active : paleteColors.inactive"
              :text-color="paleteColors.white">
              {{ item.state === 1 ? "Activo" : "Inactivo" }}
            </v-chip>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>-->
    <v-card flat>
  <!-- Barra superior: selección de sucursal + botón buscar + búsqueda global -->
  <v-card-title class="d-flex flex-wrap align-center gap-4 pb-2">
    <!-- Título -->
    <div class="text-subtitle-1 font-weight-bold">Listado de vehículos</div>

    <!-- Spacer (solo visible en md+) -->
    <v-spacer class="d-none d-md-block"></v-spacer>
      <v-text-field v-model="search" density="compact" label="Buscar vehículo" prepend-inner-icon="mdi-magnify"
        variant="solo-filled" hide-details single-line flat></v-text-field>
  </v-card-title>

  <!-- Tabla de vehículos con filas personalizadas -->
  <v-data-table :headers="headers" :items="vehicles" :search="search" :items-per-page-text="'Elementos por página'"
    no-data-text="No hay datos disponibles" :loading="loading" loading-text="Cargando datos..." :hide-default-header="true"
    class="elevation-1" style="max-height: 68vh; overflow-y: auto; background: transparent">
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
              <div style="width: 20%; min-width: 0" class="text-left font-weight-bold">
                Chapa
              </div>

              <!-- Nombre (20%) -->
              <div style="width: 15%; min-width: 0" class="text-left font-weight-bold">
                Marca
              </div>

              <!-- Teléfono (10%) -->
              <div style="width: 15%; min-width: 0" class="text-left font-weight-bold">
                Modelo
              </div>

              <!-- Dirección (25%) -->
              <div style="width: 10%; min-width: 0" class="text-left font-weight-bold">
                Asientos
              </div>

              <div style="width: 10%; min-width: 0" class="text-center font-weight-bold">
                Estado
              </div>

              <!-- Acciones (25%) -->
              <div style="width: 30%; min-width: 0" class="d-flex justify-left font-weight-bold">
                
              </div>
            </v-card-text>
          </v-card>
        </template>
    <!-- Fila personalizada -->
    <template v-slot:item="slotProps">
      <tr>
        <td colspan="100%" style="padding: 0; border: none">
          <v-card class="mb-2 mx-1 rounded-lg" elevation="1" density="comfortable" flat>
            <v-card-text class="d-flex align-center pa-2" style="width: 100%; min-width: 0">
              <!-- Placa con avatar -->
              <div class="d-flex align-center" style="width: 20%; min-width: 0">
                <v-avatar class="mr-3 icono-concavo" color="grey-lighten-4">
                  <v-img :src="`${this.$axios.defaults.baseURL}images/${slotProps.item.image}?t=${getCacheTimestamp()}`" cover></v-img>
                </v-avatar>
                <span class="text-truncate">{{ slotProps.item.plate }}</span>
                <v-tooltip activator="parent" location="bottom" max-width="350px">
                  <span style="white-space: normal; word-break: break-word">
                    Chapa: {{ slotProps.item.plate }}
                  </span>
                </v-tooltip>
              </div>

              <!-- Marca -->
              <div style="width: 15%; min-width: 0" class="text-truncate text-center text-start">
                <span>{{ slotProps.item.brand }}</span>
                <v-tooltip activator="parent" location="bottom" max-width="350px">
                  <span style="white-space: normal; word-break: break-word">
                    Marca: {{ slotProps.item.brand }}
                  </span>
                </v-tooltip>
              </div>

              <!-- Modelo -->
              <div style="width: 15%; min-width: 0" class="text-truncate text-center text-start">
                <span>{{ slotProps.item.model }}</span>
                <v-tooltip activator="parent" location="bottom" max-width="350px">
                  <span style="white-space: normal; word-break: break-word">
                    Modelo: {{ slotProps.item.model }}
                  </span>
                </v-tooltip>
              </div>

              <!-- Asientos -->
              <div style="width: 10%; min-width: 0" class="text-truncate text-center text-start">
                <span>{{ slotProps.item.seats }}</span>
                <v-tooltip activator="parent" location="bottom" max-width="350px">
                  <span style="white-space: normal; word-break: break-word">
                    Asientos: {{ slotProps.item.seats }}
                  </span>
                </v-tooltip>
              </div>

              <!-- Estado -->
              <div style="width: 10%; min-width: 0" class="text-center">
                <v-chip :color="slotProps.item.state === 1 ? paleteColors.active : paleteColors.inactive" 
                        :text-color="paleteColors.white" size="small">
                  {{ slotProps.item.state === 1 ? "Activo" : "Inactivo" }}
                </v-chip>
                <v-tooltip activator="parent" location="bottom" max-width="350px">
                  <span style="white-space: normal; word-break: break-word">
                    Estado: {{ slotProps.item.state === 1 ? "Activo" : "Inactivo" }}
                  </span>
                </v-tooltip>
              </div>

              <!-- Acciones -->
              <div class="d-flex gap-1" style="width: 30%; justify-content: flex-end; flex-wrap: nowrap">
                <v-btn size="35" icon variant="outlined" :style="{ 'border-width': '1px', 'border-style': 'solid' }"
                  :color="paleteColors.green" @click="showAddWorker(slotProps.item)" class="flex-shrink-0 mr-1"
                  title="Agregar Trabajador">
                  <v-icon size="20">mdi-account-tie</v-icon>
                </v-btn>

                <v-btn size="35" icon variant="outlined" :style="{ 'border-width': '1px', 'border-style': 'solid' }"
                  :color="paleteColors.primary" @click="editItem(slotProps.item)" class="flex-shrink-0 mr-1"
                  title="Editar Vehículo">
                  <v-icon size="20">mdi-pencil</v-icon>
                </v-btn>

                <v-btn size="35" icon variant="outlined" :style="{ 'border-width': '1px', 'border-style': 'solid' }"
                  :color="paleteColors.error" @click="deleteItem(slotProps.item)" class="flex-shrink-0"
                  title="Eliminar Vehículo">
                  <v-icon size="20">mdi-delete</v-icon>
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </td>
      </tr>
    </template>
  </v-data-table>
</v-card>
  </v-container>
  <v-dialog v-model="dialog" max-width="700px">
    <v-form ref="form" v-model="valid" enctype="multipart/form-data">
      <v-card>
        <v-toolbar :color="paleteColors.primary">
          <span class="text-subtitle-2 ml-4">{{ formTitle }}</span>
        </v-toolbar>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12" md="12">
                <v-autocomplete :no-data-text="'No hay datos disponibles'" v-model="editedItem.structure_id"
                  :items="structures" label="Estructura de asientos" prepend-icon="mdi-seat" item-title="name"
                  item-value="id" variant="underlined" :rules="selectRules" @update:model-value="updateSeats">
                  <!-- Personalizar el ítem del autocomplete -->
                  <template v-slot:item="{ props, item }">
                    <v-list-item v-bind="props">
                      <template v-slot:prepend>
                        <!-- Vista previa de la matriz de asientos -->
                        <div class="seat-map-preview">
                          <div v-for="(row, rowIndex) in item.raw.seatMap" :key="rowIndex" class="seat-row">
                            <v-btn v-for="(seat, seatIndex) in row" :key="seatIndex"
                              :color="seat.selected ? paleteColors.primary : ''" class="seat-button-preview"
                              size="x-small" height="25" width="25" disabled>
                              {{ Number(seat.label) ? `A${Number(seat.label)}` : '' }}
                            </v-btn>
                          </div>
                        </div>
                      </template>
                      <v-list-item-subtitle>{{ item.raw.description }}</v-list-item-subtitle>
                    </v-list-item>
                  </template>

                </v-autocomplete>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="editedItem.brand" label="Marca" prepend-icon="mdi-car"
                  variant="underlined"></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="editedItem.model" label="Modelo" prepend-icon="mdi-car-info"
                  variant="underlined"></v-text-field>
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field v-model="editedItem.plate" label="Placa" prepend-icon="mdi-license" variant="underlined"
                  :rules="[v => !!v || 'La placa es requerida']"></v-text-field>
              </v-col>
              <!--<v-col cols="12" md="6">
                <v-text-field v-model="editedItem.rut" label="RUT" prepend-icon="mdi-identifier"
                  variant="underlined" :rules="rutRules">
                </v-text-field>
              </v-col>-->
              <v-col cols="12" md="4">
                <v-text-field v-model="editedItem.seats" label="Asientos" prepend-icon="mdi-seat" variant="underlined"
                  :rules="[v => !!v || 'El número de asientos es requerido',
                  v => !isNaN(v) || 'Debe ser un número'
                  ]" disabled="true"></v-text-field>
              </v-col>
              <v-col cols="12" md="4">
                <v-switch 
  v-model="editedItem.state" 
  :true-value=1
  :false-value=0
  :color="paleteColors.active"
  hide-details 
  inset 
  class="custom-switch"
>
  <template v-slot:label>
    <span class="text-body-1"
      :style="{ color: editedItem.state ? paleteColors.active : paleteColors.grey }">
      {{ editedItem.state ? 'Activo' : 'Inactivo' }}
    </span>
  </template>
</v-switch>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" md="6">
                <v-file-input v-model="file" ref="fileInput" label="Imagen del Vehículo" variant="underlined"
                  density="compact" name="file" accept=".png, .jpg, .jpeg" @change="onFileSelected">
                </v-file-input>
              </v-col>
              <v-col cols="12" md="6">
                <v-card elevation="6" class="mx-auto" max-width="210" max-height="120">
                  <img v-if="imagenDisponible()" :src="imgedit" height="120" width="210">
                </v-card>


              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn :color="paleteColors.gris" variant="flat" @click="close">Cancelar</v-btn>
          <v-btn :color="paleteColors.primary" variant="flat" @click="save" :disabled="!valid"
            :loading="loading">Aceptar</v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
  <v-dialog v-model="dialogDelete" max-width="500px">
    <v-card>

      <v-toolbar :color="paleteColors.error">
        <span class="text-subtitle-2 ml-4"> Eliminar Vehículo</span>
      </v-toolbar>

      <v-card-text class="mt-2 mb-2"> ¿Desea eliminar el vehículo seleccionado?</v-card-text>
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

  <!-- Diálogo donde se mostrarán los detalles de las rutas -->
  <v-dialog v-model="dialogVehicleWorker" fullscreen transition="dialog-bottom-transition">
    <v-card>
      <v-card-text>
        <!-- Aquí pasamos el 'selectedWorker' al componente dentro del diálogo -->
        <VehicleWorker :vehicle="selectedVehicle" />
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="flat" :color="paleteColors.gris" @click="closeDialogVehicleWorker">Cerrar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { handleRequest } from "@/utils/api"; // Ruta al archivo
import VehicleWorker from "../vehicleworker/VehicleWorker.vue";
import { paleteColors } from "@/assets/colors";
export default {
  components: {
    VehicleWorker
  },
  data: () => ({
    snackbar: false,
    sb_type: '',
    sb_message: '',
    sb_timeout: 2000,
    sb_title: '',
    sb_icon: '',
    paleteColors: paleteColors,
    valid: true,
    loading: false,
    mostrar: false,
    file: null,
    imgMiniatura: '',
    dialog: false,
    dialogDelete: false,
    vehicles: [],
    structures: [],
    data: {},
    selectedVehicle: [],
    dialogVehicleWorker: null,
    headers: [
      //{ title: 'Sucursal', value: 'branchName', width: '20%' },
      { title: 'Placa', value: 'plate', },
      { title: 'Marca', value: 'brand', },
      { title: 'Modelo', value: 'model', },
      //{ title: 'Rut', value: 'rut', width: '15%' },
      { title: 'Asientos', value: 'seats', },
      { title: 'Estado', value: 'state', },
      { title: 'Acciones', value: 'actions', sortable: false, width: '20%' },
    ],
    statusOptions: [
      { text: 'Activo', value: 1 },
      { text: 'Inactivo', value: 0 },
    ],
    editedItem: {
      id: '',
      structure_id: '',
      plate: '',
      model: '',
      brand: '',
      image: '',
      rut: '',
      state: 1,
      seats: ''
    },
    originalItem: {
      id: '',
      structure_id: '',
      plate: '',
      model: '',
      brand: '',
      image: '',
      rut: '',
      state: 1,
      seats: ''
    },
    defaultItem: {
      id: '',
      structure_id: '',
      plate: '',
      model: '',
      brand: '',
      image: '',
      rut: '',
      state: 1,
      seats: ''
    },
    editedIndex: -1,
    search: '',
    nameRules: [
      (v) => !!v || "El campo es requerido",
      (v) => (v && v.length <= 50) ||
        "El campo debe tener menos de 51 caracteres",
      (v) => (v && v.length >= 3) ||
        "El campo debe tener al menos de 3 caracteres",
    ],
    selectRules: [(v) => !!v || "Seleccionar al menos un elemento"],
    rutRules: [
      (v) => !v || /^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/.test(v) || "El RUT debe estar en el formato XX.XXX.XXX-Y (ejemplo: 12.345.678-9)",
    ],
  }),
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? 'Agregar Vehículo' : 'Editar Vehículo';
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
      const selectedStructure = this.structures.find((structure) => structure.id === structureId);

      // Si encuentra el elemento, actualiza el valor de seats
      if (selectedStructure) {
        this.editedItem.seats = selectedStructure.seatCount;
      } else {
        this.editedItem.seats = ''; // Reinicia si no hay elemento seleccionado
      }
      console.log();
    },
    async showAdd() {
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
          this.companies = [];
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
      this.editedIndex = -1
      this.file = null;
      this.imgMiniatura = '';
    },
    async initialize() {
      try {
        this.data = {};
        this.data.branch_id = this.editedItem.branch_id;
        this.loading = true;
        const result = await handleRequest({
          endpoint: 'vehicle',
          method: 'GET',
        });

        if (result.success) {
          // Si la solicitud es exitosa, asignamos las sucursales
          this.vehicles = result.data?.vehicles || [];
        } else {
          // Si no hay datos, asignamos un array vacío
          this.vehicles = [];
        }
      } catch (error) {
        this.loading = false;
        // Captura de errores no controlados
        this.showAlert('error', 'Ocurrió un error inesperado al procesar la solicitud.', 3000);
      } finally {
        this.loading = false;
      }
    },
    async save() {
      this.loading = true;
      if (this.editedIndex === -1) {
        this.valid = false;
        const fieldsToUpdate = ['brand', 'model', 'plate', 'rut', 'seats', 'state', 'image', 'structure_id'];

        let updatedFields = Object.keys(this.editedItem)
          .filter((key) => fieldsToUpdate.includes(key) && this.editedItem[key] !== this.originalItem[key])
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
              endpoint: 'vehicle',
              method: 'POST',
              data: formData
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
            this.showAlert("error", "Ocurrió un error inesperado al procesar la solicitud.", 3000);
          }
        } else {
          this.loading = false;
          this.showAlert("success", "Debe completar los datos.", 3000);
        }
      } else {
        this.valid = false;
        const fieldsToUpdate = ['brand', 'model', 'plate', 'rut', 'seats', 'state', 'image', 'structure_id'];
        let updatedFields = Object.keys(this.editedItem)
          .filter((key) => fieldsToUpdate.includes(key) && this.editedItem[key] !== this.originalItem[key])
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
              endpoint: 'vehicle-update',
              method: 'POST',
              data: formData
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
            this.showAlert("error", "Ocurrió un error inesperado al procesar la solicitud.", 3000);
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
      this.originalItem = Object.assign({}, item);
      this.editedItem = Object.assign({}, item);
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
          console.error('Error al cargar la imagen', error);
          this.showAlert('error', 'Error al cargar la imagen.', 3000);
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
      this.dialogDelete = false
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
      })
    },
    async deleteItemConfirm() {
      try {
        let request = {
          id: this.editedItem.id
        };
        const result = await handleRequest({
          endpoint: 'vehicle-destroy',
          method: 'POST',
          data: request
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
        this.showAlert("error", "Ocurrió un error inesperado al procesar la solicitud.", 3000);
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
      if (this.imgedit !== undefined && this.imgedit !== '') {
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
        this.showAlert('warning', 'El archivo de imagen debe ser de máximo 500 KB', 3000);
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
      }
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
<style>
/* Estilos para la vista previa de la matriz de asientos */
seat-map-preview {
  max-width: 200px;
  /* Ancho máximo */
  max-height: 100px;
  /* Altura máxima */
  overflow: auto;
  /* Agregar scroll si es necesario */
}

.seat-row {
  display: flex;
  gap: 2px;
  /* Espacio reducido entre asientos */
  margin-bottom: 2px;
  /* Espacio reducido entre filas */
}

.seat-button-preview {
  min-width: 20px !important;
  /* Ancho reducido */
  height: 20px !important;
  /* Altura reducida */
  padding: 0 !important;
  /* Eliminar padding */
  margin: 1px !important;
  /* Margen reducido */
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