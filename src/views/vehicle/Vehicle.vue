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
        <v-avatar :icon="sb_icon" color="sb_type" size="40" />
      </v-col>

      <v-col md="10">
        <h4>{{ sb_title }}</h4>
        {{ sb_message }}
      </v-col>
    </v-row>
  </v-snackbar>

  <v-card class="busgo-page-header" elevation="0">
    <v-avatar :color="paleteColors.primary" class="busgo-page-icon">
      <v-icon>mdi-bus</v-icon>
    </v-avatar>

    <div>
      <div class="busgo-page-title">Vehículos</div>
      <div class="busgo-page-subtitle">Gestionar flota de vehículos</div>
    </div>

    <v-spacer />

    <v-btn
      :color="paleteColors.primary"
      variant="flat"
      elevation="0"
      prepend-icon="mdi-plus"
      class="busgo-add-btn"
      @click="showAdd()"
    >
      Agregar Vehículo
    </v-btn>
  </v-card>

  <v-container fluid class="busgo-container">
    <v-card class="busgo-card" elevation="0">
      <div class="busgo-card-header">
        <div>
          <div class="busgo-card-title">Listado de vehículos</div>
          <div class="busgo-card-subtitle">
            Administra la flota, capacidad, estado y asignación de trabajadores.
          </div>
        </div>

        <v-text-field
          v-model="search"
          density="compact"
          placeholder="Buscar vehículo..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          hide-details
          single-line
          class="busgo-search"
        />
      </div>

      <v-data-table
        :headers="headers"
        :items="vehicles"
        :search="search"
        :items-per-page-text="'Elementos por página'"
        no-data-text="No hay datos disponibles"
        :loading="loading"
        loading-text="Cargando datos..."
        :hide-default-header="true"
        class="busgo-table"
      >
        <template #top>
          <div class="busgo-table-head">
            <div class="vehicle-col-plate">Patente</div>
            <div class="vehicle-col-number">Interno</div>
            <div class="vehicle-col-brand">Marca</div>
            <div class="vehicle-col-model">Modelo</div>
            <div class="vehicle-col-seats">Asientos</div>
            <div class="vehicle-col-state">Estado</div>
            <div class="vehicle-col-actions"></div>
          </div>
        </template>

        <template #item="slotProps">
          <tr>
            <td class="pa-0 border-0">
              <div class="busgo-row">
                <div class="vehicle-col-plate busgo-name-cell">
                  <v-avatar
                    size="36"
                    rounded="lg"
                    color="grey-lighten-4"
                    class="busgo-avatar"
                  >
                    <v-img
                      :src="`${this.$axios.defaults.baseURL}images/${slotProps.item.image}?v=${imageVersion}`"
                      cover
                    />
                  </v-avatar>

                  <div class="busgo-name">
                    {{ slotProps.item.plate }}
                  </div>
                </div>

                <div class="vehicle-col-number busgo-meta">
                  <span class="text-truncate">
                    {{ slotProps.item.internal_number || "-" }}
                  </span>
                </div>

                <div class="vehicle-col-brand busgo-meta">
                  <span class="text-truncate">
                    {{ slotProps.item.brand }}
                  </span>
                </div>

                <div class="vehicle-col-model busgo-meta">
                  <span class="text-truncate">
                    {{ slotProps.item.model }}
                  </span>
                </div>

                <div class="vehicle-col-seats busgo-meta">
                  <v-icon size="16" color="primary">mdi-seat</v-icon>
                  <span>{{ slotProps.item.seats }}</span>
                </div>

                <div class="vehicle-col-state">
                  <v-chip
                    size="small"
                    :color="
                      slotProps.item.state === 1
                        ? paleteColors.active
                        : paleteColors.inactive
                    "
                    :text-color="paleteColors.white"
                  >
                    {{ slotProps.item.state === 1 ? "Activo" : "Inactivo" }}
                  </v-chip>
                </div>

                <div class="vehicle-col-actions busgo-actions">
                  <v-btn
                    size="30"
                    icon
                    variant="tonal"
                    :color="paleteColors.green"
                    @click="showAddWorker(slotProps.item)"
                    title="Agregar Trabajador"
                  >
                    <v-icon size="17">mdi-account-tie</v-icon>
                  </v-btn>

                  <v-btn
                    size="30"
                    icon
                    variant="tonal"
                    :color="paleteColors.primary"
                    @click="editItem(slotProps.item)"
                    title="Editar Vehículo"
                  >
                    <v-icon size="17">mdi-pencil</v-icon>
                  </v-btn>

                  <v-btn
                    size="30"
                    icon
                    variant="tonal"
                    :color="paleteColors.error"
                    @click="deleteItem(slotProps.item)"
                    title="Eliminar Vehículo"
                  >
                    <v-icon size="17">mdi-delete</v-icon>
                  </v-btn>
                </div>
              </div>
            </td>
          </tr>
        </template>
      </v-data-table>

      <v-card-actions class="busgo-footer">
        <v-spacer />

        <v-btn
          variant="tonal"
          :color="paleteColors.gris"
          to="/company"
          prepend-icon="mdi-arrow-left"
          aria-label="Volver a Empresa"
        >
          Volver
        </v-btn>
      </v-card-actions>
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
                <v-autocomplete
                  :no-data-text="'No hay datos disponibles'"
                  v-model="editedItem.structure_id"
                  :items="structures"
                  label="Estructura de asientos"
                  prepend-icon="mdi-seat"
                  item-title="name"
                  item-value="id"
                  variant="underlined"
                  :rules="selectRules"
                  @update:model-value="updateSeats"
                >
                  <template #item="{ props, item }">
                    <v-list-item v-bind="props">
                      <template #prepend>
                        <div class="seat-map-preview">
                          <div
                            v-for="(row, rowIndex) in item.raw.seatMap"
                            :key="rowIndex"
                            class="seat-row"
                          >
                            <v-btn
                              v-for="(seat, seatIndex) in row"
                              :key="seatIndex"
                              :color="seat.selected ? paleteColors.primary : ''"
                              class="seat-button-preview"
                              size="x-small"
                              height="25"
                              width="25"
                              disabled
                            >
                              {{ Number(seat.label) ? `A${Number(seat.label)}` : "" }}
                            </v-btn>
                          </div>
                        </div>
                      </template>

                      <v-list-item-subtitle>
                        {{ item.raw.description }}
                      </v-list-item-subtitle>
                    </v-list-item>
                  </template>
                </v-autocomplete>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="editedItem.brand"
                  label="Marca"
                  prepend-icon="mdi-car"
                  variant="underlined"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="editedItem.model"
                  label="Modelo"
                  prepend-icon="mdi-car-info"
                  variant="underlined"
                />
              </v-col>

              <v-col cols="12" md="3">
                <v-text-field
                  v-model="editedItem.plate"
                  label="Placa"
                  prepend-icon="mdi-license"
                  variant="underlined"
                  :rules="[(v) => !!v || 'La placa es requerida']"
                />
              </v-col>

              <v-col cols="12" md="3">
                <v-text-field
                  v-model="editedItem.internal_number"
                  label="Número interno"
                  prepend-icon="mdi-pound"
                  variant="underlined"
                />
              </v-col>

              <v-col cols="12" md="3">
                <v-text-field
                  v-model="editedItem.seats"
                  label="Asientos"
                  prepend-icon="mdi-seat"
                  variant="underlined"
                  :rules="[
                    (v) => !!v || 'El número de asientos es requerido',
                    (v) => !isNaN(v) || 'Debe ser un número'
                  ]"
                  :disabled="true"
                />
              </v-col>

              <v-col cols="12" md="3">
                <v-switch
                  v-model="editedItem.state"
                  :true-value="1"
                  :false-value="0"
                  :color="paleteColors.active"
                  hide-details
                  inset
                  class="custom-switch"
                >
                  <template #label>
                    <span
                      class="text-body-1"
                      :style="{
                        color: editedItem.state
                          ? paleteColors.active
                          : paleteColors.grey
                      }"
                    >
                      {{ editedItem.state ? "Activo" : "Inactivo" }}
                    </span>
                  </template>
                </v-switch>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="6">
                <v-file-input
                  v-model="file"
                  ref="fileInput"
                  label="Imagen del Vehículo"
                  variant="underlined"
                  density="compact"
                  name="file"
                  accept=".png, .jpg, .jpeg"
                  @change="onFileSelected"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-card elevation="6" class="mx-auto" max-width="210" max-height="120">
                  <img
                    v-if="imagenDisponible()"
                    :src="imgedit"
                    height="120"
                    width="210"
                  />
                </v-card>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-divider />

        <v-card-actions>
          <v-spacer />

          <v-btn
            :color="paleteColors.gris"
            variant="flat"
            @click="close"
          >
            Cancelar
          </v-btn>

          <v-btn
            :color="paleteColors.primary"
            variant="flat"
            @click="save"
            :disabled="!valid"
            :loading="loading"
          >
            Aceptar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>

  <v-dialog v-model="dialogDelete" max-width="500px">
    <v-card>
      <v-toolbar :color="paleteColors.error">
        <span class="text-subtitle-2 ml-4">
          Eliminar Vehículo
        </span>
      </v-toolbar>

      <v-card-text class="mt-2 mb-2">
        ¿Desea eliminar el vehículo seleccionado?
      </v-card-text>

      <v-divider />

      <v-card-actions>
        <v-spacer />

        <v-btn
          :color="paleteColors.gris"
          variant="flat"
          @click="closeDelete"
        >
          Cancelar
        </v-btn>

        <v-btn
          :color="paleteColors.error"
          variant="flat"
          @click="deleteItemConfirm"
        >
          Aceptar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog
    v-model="dialogVehicleWorker"
    fullscreen
    transition="dialog-bottom-transition"
  >
    <v-card>
      <v-card-text>
        <VehicleWorker :vehicle="selectedVehicle" />
      </v-card-text>

      <v-divider />

      <v-card-actions>
        <v-spacer />

        <v-btn
          variant="flat"
          :color="paleteColors.gris"
          @click="closeDialogVehicleWorker"
        >
          Cerrar
        </v-btn>
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
    headers: [
      //{ title: 'Sucursal', value: 'branchName', width: '20%' },
      { title: "Placa", value: "plate" },
      { title: "Marca", value: "brand" },
      { title: "Modelo", value: "model" },
      //{ title: 'Rut', value: 'rut', width: '15%' },
      { title: "Asientos", value: "seats" },
      { title: "Estado", value: "state" },
      { title: "Acciones", value: "actions", sortable: false, width: "20%" },
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
    formTitle() {
      return this.editedIndex === -1 ? "Agregar Vehículo" : "Editar Vehículo";
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

.vehicle-col-plate {
  width: 18%;
  min-width: 0;
}

.vehicle-col-number {
  width: 12%;
  min-width: 0;
}

.vehicle-col-brand {
  width: 14%;
  min-width: 0;
}

.vehicle-col-model {
  width: 14%;
  min-width: 0;
}

.vehicle-col-seats {
  width: 8%;
  min-width: 0;
}

.vehicle-col-state {
  width: 10%;
  min-width: 0;
}

.vehicle-col-actions {
  width: 24%;
  min-width: 0;
}

.seat-map-preview {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-right: 12px;
  max-width: 180px;
  overflow: hidden;
}

.seat-row {
  display: flex;
  gap: 2px;
}

.seat-button-preview {
  min-width: 25px !important;
  padding: 0 !important;
  font-size: 10px;
}

@media (max-width: 960px) {
  .vehicle-col-plate,
  .vehicle-col-number,
  .vehicle-col-brand,
  .vehicle-col-model,
  .vehicle-col-seats,
  .vehicle-col-state,
  .vehicle-col-actions {
    width: 100%;
  }
}

.busgo-delete-dialog {
  border-radius: 24px !important;
  overflow: hidden;
  background: #ffffff;
}

.busgo-delete-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 22px 24px;
  background: linear-gradient(135deg, #7f1d1d 0%, #991b1b 55%, #dc2626 100%);
  color: #ffffff;
}

.busgo-delete-icon {
  width: 50px;
  height: 50px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.16);
  display: flex;
  align-items: center;
  justify-content: center;
}

.busgo-delete-title {
  font-size: 18px;
  font-weight: 800;
  line-height: 1.2;
}

.busgo-delete-subtitle {
  font-size: 13px;
  opacity: 0.82;
  margin-top: 3px;
}

.busgo-delete-close {
  color: #ffffff !important;
  opacity: 0.9;
}

.busgo-delete-body {
  padding: 24px !important;
  background: #fff7f7;
}

.busgo-delete-message {
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 14px;
}

.busgo-delete-warning {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 14px;
  border-radius: 16px;
  background: #ffffff;
  border: 1px solid #fecaca;
  color: #7f1d1d;
  font-size: 13px;
  line-height: 1.45;
}

.busgo-delete-actions {
  padding: 18px 24px !important;
  background: #ffffff;
  border-top: 1px solid #fee2e2;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.busgo-delete-cancel {
  background: #f1f5f9 !important;
  color: #475569 !important;
  border-radius: 12px !important;
  text-transform: none !important;
  font-weight: 700 !important;
  min-width: 110px;
}

.busgo-delete-confirm {
  background: #dc2626 !important;
  color: #ffffff !important;
  border-radius: 12px !important;
  text-transform: none !important;
  font-weight: 800 !important;
  min-width: 120px;
}

@media (max-width: 600px) {
  .busgo-delete-header {
    padding: 18px;
  }

  .busgo-delete-body {
    padding: 18px !important;
  }

  .busgo-delete-actions {
    padding: 16px 18px !important;
  }

  .busgo-delete-cancel,
  .busgo-delete-confirm {
    flex: 1;
  }
}
</style>
