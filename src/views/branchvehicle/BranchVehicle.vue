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

        <div v-if="branch"></div>
      </v-col>
    </v-row>
  </v-snackbar>

  <v-card class="busgo-page-header" elevation="0">
    <v-avatar :color="paleteColors.primary" class="busgo-page-icon">
      <v-img
        :src="`${this.$axios.defaults.baseURL}images/${this.branch.image}?t=${getCacheTimestamp()}`"
        alt="Sucursal"
        cover
      />
    </v-avatar>

    <div>
      <div class="busgo-page-title">
        {{ this.branch.name }}
      </div>

      <div class="busgo-page-subtitle">
        Gestionar vehículos de la sucursal
      </div>
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
          <div class="busgo-card-title">
            Listado de vehículos
          </div>

          <div class="busgo-card-subtitle">
            Administra los vehículos asignados a esta sucursal.
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
        :items="branchvehicles"
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
            <div class="branch-vehicle-col-plate">
              Patente
            </div>

            <div class="branch-vehicle-col-brand">
              Marca
            </div>

            <div class="branch-vehicle-col-model">
              Modelo
            </div>

            <div class="branch-vehicle-col-seats">
              Asientos
            </div>

            <div class="branch-vehicle-col-actions"></div>
          </div>
        </template>

        <template #item="slotProps">
          <tr>
            <td class="pa-0 border-0">
              <div class="busgo-row">
                <div class="branch-vehicle-col-plate busgo-name-cell">
                  <v-avatar
                    size="36"
                    rounded="lg"
                    color="grey-lighten-4"
                    class="busgo-avatar"
                  >
                    <v-img
                      :src="`${this.$axios.defaults.baseURL}images/${slotProps.item.image}?v=${imageVersion}`"
                      alt="Imagen del vehículo"
                      cover
                    />
                  </v-avatar>

                  <div class="min-width-0">
                    <div class="busgo-name">
                      {{ slotProps.item.plate }}
                    </div>

                    <div class="busgo-submeta text-truncate">
                      Interno: {{ getVehicleInternalNumber(slotProps.item) }}
                    </div>
                  </div>
                </div>

                <div class="branch-vehicle-col-brand busgo-meta">
                  <span class="text-truncate">
                    {{ slotProps.item.brand }}
                  </span>
                </div>

                <div class="branch-vehicle-col-model busgo-meta">
                  <span class="text-truncate">
                    {{ slotProps.item.model }}
                  </span>
                </div>

                <div class="branch-vehicle-col-seats busgo-meta">
                  <v-icon size="16" color="primary">
                    mdi-seat
                  </v-icon>

                  <span>
                    {{ slotProps.item.seats }}
                  </span>
                </div>

                <div class="branch-vehicle-col-actions busgo-actions">
              

                  <v-btn
                    size="30"
                    icon
                    variant="tonal"
                    :color="paleteColors.error"
                    @click="deleteItem(slotProps.item)"
                    title="Eliminar vehículo"
                  >
                    <v-icon size="17">mdi-delete</v-icon>
                  </v-btn>
                </div>
              </div>
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-card>
  </v-container>

  <v-dialog v-model="dialog" max-width="540px" persistent>
  <v-form ref="form" v-model="valid" enctype="multipart/form-data">
    <v-card class="busgo-vehicle-dialog" elevation="18">

      <div class="busgo-vehicle-header">
        <div class="busgo-vehicle-icon">
          <v-icon size="28">mdi-bus</v-icon>
        </div>

        <div>
          <div class="busgo-vehicle-title">
            {{ formTitle }}
          </div>
          <div class="busgo-vehicle-subtitle">
            Selecciona el vehículo que será asignado a la sucursal
          </div>
        </div>

        <v-spacer />

        <v-btn
          icon="mdi-close"
          variant="text"
          size="small"
          class="busgo-vehicle-close"
          @click="close"
        />
      </div>

      <v-card-text class="busgo-vehicle-body">
        <label class="busgo-field-label">Vehículo</label>

        <v-autocomplete
          :no-data-text="'No hay datos disponibles'"
          v-model="editedItem.vehicle_id"
          :items="vehicles"
          placeholder="Buscar por patente, marca o modelo..."
          prepend-inner-icon="mdi-car-search-outline"
          item-title="plate"
          item-value="id"
          variant="outlined"
          density="comfortable"
          rounded="lg"
          :rules="selectRules"
          hide-details="auto"
          clearable
        >
          <template #item="{ props, item }">
            <v-list-item
              v-bind="props"
              class="busgo-vehicle-option"
              :prepend-avatar="`${this.$axios.defaults.baseURL}images/${item.raw.image}`"
              :title="item.raw.name"
            >
              <v-list-item-subtitle class="busgo-vehicle-option-subtitle">
                <div>
                  <v-icon size="18">mdi-card-text-outline</v-icon>
                 <strong> Patente: {{ item.raw.plate }} </strong> 
                </div>

                <div>
                  <v-icon size="14">mdi-pound</v-icon>
                  Número interno: {{ getVehicleInternalNumber(item.raw) }}
                </div>

                <div>
                  <v-icon size="14">mdi-factory</v-icon>
                  Marca: {{ item.raw.brand }}
                </div>

                <div>
                  <v-icon size="14">mdi-car-info</v-icon>
                  Modelo: {{ item.raw.model }}
                </div>
              </v-list-item-subtitle>
            </v-list-item>
          </template>
        </v-autocomplete>
      </v-card-text>

      <v-card-actions class="busgo-vehicle-actions">
        <v-btn
          class="busgo-vehicle-cancel"
          variant="flat"
          prepend-icon="mdi-close"
          @click="close"
        >
          Cerrar
        </v-btn>

        <v-btn
          class="busgo-vehicle-save"
          variant="flat"
          prepend-icon="mdi-check"
          @click="save"
          :disabled="!valid"
          :loading="loading"
        >
          Guardar
        </v-btn>
      </v-card-actions>

    </v-card>
  </v-form>
</v-dialog>

<v-dialog v-model="dialogDelete" max-width="480px" persistent>
  <v-card class="busgo-delete-dialog" elevation="18">

    <div class="busgo-delete-header">
      <div class="busgo-delete-icon">
        <v-icon size="30">mdi-bus-alert</v-icon>
      </div>

      <div>
        <div class="busgo-delete-title">
          Eliminar Vehículo
        </div>
        <div class="busgo-delete-subtitle">
          Esta acción no se puede deshacer
        </div>
      </div>

      <v-spacer />

      <v-btn
        icon="mdi-close"
        variant="text"
        size="small"
        class="busgo-delete-close"
        @click="closeDelete"
      />
    </div>

    <v-card-text class="busgo-delete-body">
      <div class="busgo-delete-message">
        ¿Desea eliminar el vehículo seleccionado?
      </div>

      <div class="busgo-delete-warning">
        <v-icon size="20">mdi-information-outline</v-icon>
        <span>
          Verifique que el vehículo no tenga viajes, rutas o ventas asociadas antes de continuar.
        </span>
      </div>
    </v-card-text>

    <v-card-actions class="busgo-delete-actions">
      <v-btn
        class="busgo-delete-cancel"
        variant="flat"
        prepend-icon="mdi-close"
        @click="closeDelete"
      >
        Cerrar
      </v-btn>

      <v-btn
        class="busgo-delete-confirm"
        variant="flat"
        prepend-icon="mdi-delete-outline"
        @click="deleteItemConfirm"
      >
        Eliminar
      </v-btn>
    </v-card-actions>

  </v-card>
</v-dialog>
</template>

<script>
import { paleteColors } from "@/assets/colors";
import { handleRequest } from "@/utils/api"; // Ruta al archivo
export default {
  props: {
    branch: {
      type: Object,
      required: true,
      default: () => ({}), // Objeto vacío por defecto
    },
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

    dialog: false,
    dialogDelete: false,
    branchvehicles: [],
    vehicles: [],
    branch_id: "",
    data: {},
    headers: [
      { title: "Patente", key: "plate", width: "30%" },
      { title: "Marca", key: "brand", width: "20%" },
      { title: "Modelo", key: "model", width: "20%" },
      { title: "Asientos", key: "seats", width: "10%" },
      { title: "Acciones", key: "actions", sortable: false, width: "20%" },
    ],

    editedItem: {
      id: "",
      branch_id: "",
      vehicle_id: "",
    },
    originalItem: {
      id: "",
      branch_id: "",
      role_id: "",
    },
    defaultItem: {
      id: "",
      branch_id: "",
      role_id: "",
    },
    editedIndex: -1,
    search: "",
    imageVersion: 0,
    selectRules: [(v) => !!v || "Seleccionar al menos un elemento"],
  }),
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "Agregar Vehículo" : "Editar Vehículo";
    },
  },
  mounted() {
    this.branch_id = this.branch.id;
    this.initialize();
  },
  methods: {
    getVehicleInternalNumber(vehicle) {
      return vehicle?.internal_number ?? vehicle?.internalNumber ?? "No asignado";
    },
    getCacheTimestamp() {
      // Usamos medianoche (00:00:00) del día actual
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return startOfDay.getTime(); // Ej: 1714003200000 (cambia una vez al día)
    },
    async showAdd() {
      this.data = {};
      try {
        const result = await handleRequest({
          endpoint: "vehicle",
          method: "GET",
        });

        if (result.success) {
          this.vehicles =
            result.data?.vehicles.filter(
              (vehicle) =>
                !this.branchvehicles.some(
                  (branchvehicle) => branchvehicle.vehicle_id === vehicle.id
                )
            ) || [];
        } else {
          // Si no hay datos, asignamos un array vacío
          this.vehicles = [];
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
      try {
        this.loading = true;
        this.data = {};
        this.data.branch_id = this.branch_id;
        const result = await handleRequest({
          endpoint: "branch-vehicles",
          method: "POST",
          data: this.data,
        });

        if (result.success) {
          // Si la solicitud es exitosa, asignamos las sucursales
          this.branchvehicles = result.data?.branchVehicles || [];
          this.imageVersion += 1;
          this.loading = false;
        } else {
          // Si no hay datos, asignamos un array vacío
          this.branchVehicles = [];
          this.loading = false;
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
        this.data = {};
        this.data.branch_id = this.branch_id;
        this.data.vehicle_id = this.editedItem.vehicle_id;

        try {
          const result = await handleRequest({
            endpoint: "branch-vehicle",
            method: "POST",
            data: this.data,
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
        this.valid = false;
        const fieldsToUpdate = ["id", "branch_id", "vehicle_id"];
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
              endpoint: "branch-vehicle",
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
      this.data.type = "Sucursal";
      try {
        const result = await handleRequest({
          endpoint: "vehicle",
          method: "GET",
        });

        if (result.success) {
          this.vehicles =
            result.data?.vehicles.filter(
              (vehicle) =>
                !this.branchvehicles.some(
                  (branchvehicle) => branchvehicle.vehicle_id === vehicle.id
                ) || vehicle.id === this.editedItem.vehicle_id
            ) || [];
        } else {
          // Si no hay datos, asignamos un array vacío
          this.vehicles = [];
        }
      } catch (error) {
        this.showAlert("error", "Ocurrió un error inesperado al cargar los datos.", 3000);
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
          endpoint: "branch-vehicle-destroy",
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
.branch-vehicle-col-plate {
  width: 34%;
  min-width: 0;
}

.branch-vehicle-col-brand {
  width: 20%;
  min-width: 0;
}

.branch-vehicle-col-model {
  width: 20%;
  min-width: 0;
}

.branch-vehicle-col-seats {
  width: 10%;
  min-width: 0;
}

.branch-vehicle-col-actions {
  width: 16%;
  min-width: 0;
}

.busgo-dialog-card {
  border-radius: 18px;
  overflow: hidden;
}

.busgo-dialog-actions {
  padding: 14px 18px;
  background: #f8fafc;
}

.busgo-submeta {
  font-size: 12px;
  color: #64748b;
  margin-top: 2px;
}

.min-width-0 {
  min-width: 0;
}

@media (max-width: 960px) {
  .branch-vehicle-col-plate,
  .branch-vehicle-col-brand,
  .branch-vehicle-col-model,
  .branch-vehicle-col-seats,
  .branch-vehicle-col-actions {
    width: 100%;
  }
}

.busgo-vehicle-dialog {
  border-radius: 24px !important;
  overflow: hidden;
  background: #ffffff;
}

.busgo-vehicle-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 22px 24px;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 55%, #334155 100%);
  color: #ffffff;
}

.busgo-vehicle-icon {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.14);
  display: flex;
  align-items: center;
  justify-content: center;
}

.busgo-vehicle-title {
  font-size: 18px;
  font-weight: 800;
  line-height: 1.2;
}

.busgo-vehicle-subtitle {
  font-size: 13px;
  opacity: 0.78;
  margin-top: 3px;
}

.busgo-vehicle-close {
  color: #ffffff !important;
  opacity: 0.9;
}

.busgo-vehicle-body {
  padding: 24px !important;
  background: #f8fafc;
}

.busgo-field-label {
  display: block;
  font-size: 12px;
  font-weight: 700;
  color: #475569;
  margin-bottom: 8px;
  letter-spacing: 0.02em;
}

.busgo-vehicle-option {
  border-radius: 14px !important;
  margin: 4px 8px !important;
}

.busgo-vehicle-option-subtitle {
  display: flex;
  flex-direction: column;
  gap: 3px;
  margin-top: 4px;
  color: #64748b !important;
  font-size: 12px;
}

.busgo-vehicle-option-subtitle div {
  display: flex;
  align-items: center;
  gap: 5px;
}

.busgo-vehicle-actions {
  padding: 18px 24px !important;
  background: #ffffff;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.busgo-vehicle-cancel {
  background: #f1f5f9 !important;
  color: #475569 !important;
  border-radius: 12px !important;
  text-transform: none !important;
  font-weight: 700 !important;
  min-width: 115px;
}

.busgo-vehicle-save {
  background: #0f172a !important;
  color: #ffffff !important;
  border-radius: 12px !important;
  text-transform: none !important;
  font-weight: 800 !important;
  min-width: 120px;
}

.busgo-vehicle-save.v-btn--disabled {
  background: #cbd5e1 !important;
  color: #ffffff !important;
}

@media (max-width: 600px) {
  .busgo-vehicle-header {
    padding: 18px;
  }

  .busgo-vehicle-body {
    padding: 18px !important;
  }

  .busgo-vehicle-actions {
    padding: 16px 18px !important;
  }

  .busgo-vehicle-cancel,
  .busgo-vehicle-save {
    flex: 1;
  }
}


</style>
