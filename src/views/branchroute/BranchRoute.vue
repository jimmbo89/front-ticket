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
        Gestionar rutas de la sucursal
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
      Agregar Ruta
    </v-btn>
  </v-card>

  <v-container fluid class="busgo-container">
    <v-card class="busgo-card" elevation="0">
      <div class="busgo-card-header">
        <div>
          <div class="busgo-card-title">
            Listado de rutas
          </div>

          <div class="busgo-card-subtitle">
            Administra las rutas asignadas a esta sucursal.
          </div>
        </div>

        <v-text-field
          v-model="search"
          density="compact"
          placeholder="Buscar ruta..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          hide-details
          single-line
          class="busgo-search"
        />
      </div>

      <v-data-table
        :headers="headers"
        :items="branchroutes"
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
            <div class="branch-route-col-name">
              Nombre de la ruta
            </div>

            <div class="branch-route-col-origin">
              Origen
            </div>

            <div class="branch-route-col-destination">
              Destino
            </div>

            <div class="branch-route-col-info">
              Distancia / Tiempo
            </div>

            <div class="branch-route-col-actions"></div>
          </div>
        </template>

        <template #item="slotProps">
          <tr>
            <td class="pa-0 border-0">
              <div class="busgo-row branch-route-row">
                <div class="branch-route-col-name busgo-name-cell">
                  <v-avatar
                    size="36"
                    rounded="lg"
                    color="grey-lighten-4"
                    class="busgo-avatar"
                  >
                    <v-icon color="primary" size="20">
                      mdi-map-marker-path
                    </v-icon>
                  </v-avatar>

                  <div class="busgo-name">
                    {{ slotProps.item.name }}
                  </div>

                  <v-tooltip activator="parent" location="top" max-width="350px">
                    <span style="white-space: normal; word-break: break-word">
                      Nombre de la ruta: {{ slotProps.item.name }}
                    </span>
                  </v-tooltip>
                </div>

                <div class="branch-route-col-origin busgo-name-cell">
                  <v-avatar
                    size="34"
                    rounded="lg"
                    color="grey-lighten-4"
                    class="busgo-avatar"
                  >
                    <v-img
                      :src="`${$axios.defaults.baseURL}images/${slotProps.item.originImage}?t=${getCacheTimestamp()}`"
                      alt="Imagen del origen"
                      cover
                    />
                  </v-avatar>

                  <span class="branch-route-location text-truncate">
                    {{ slotProps.item.originName }}
                  </span>

                  <v-tooltip activator="parent" location="top" max-width="350px">
                    <span style="white-space: normal; word-break: break-word">
                      Origen: {{ slotProps.item.originName }}
                    </span>
                  </v-tooltip>
                </div>

                <div class="branch-route-col-destination busgo-name-cell">
                  <v-avatar
                    size="34"
                    rounded="lg"
                    color="grey-lighten-4"
                    class="busgo-avatar"
                  >
                    <v-img
                      :src="`${$axios.defaults.baseURL}images/${slotProps.item.destinationImage}?t=${getCacheTimestamp()}`"
                      alt="Imagen del destino"
                      cover
                    />
                  </v-avatar>

                  <span class="branch-route-location text-truncate">
                    {{ slotProps.item.destinationName }}
                  </span>

                  <v-tooltip activator="parent" location="top" max-width="350px">
                    <span style="white-space: normal; word-break: break-word">
                      Destino: {{ slotProps.item.destinationName }}
                    </span>
                  </v-tooltip>
                </div>

                <div class="branch-route-col-info branch-route-info">
                  <div class="branch-route-distance">
                    <v-icon size="16" color="primary">
                      mdi-ruler
                    </v-icon>

                    <span class="text-truncate">
                      {{ formatNumber(Number(slotProps.item.distance)) }}
                    </span>
                  </div>

                  <div class="branch-route-time">
                    <v-icon size="15" color="primary">
                      mdi-clock-outline
                    </v-icon>

                    <span class="text-truncate">
                      {{ formatEstimatedTime(slotProps.item.estimated) }}
                    </span>
                  </div>

                  <v-tooltip activator="parent" location="top" max-width="350px">
                    <span style="white-space: normal; word-break: break-word">
                      Distancia: {{ formatNumber(Number(slotProps.item.distance)) }}<br />
                      Tiempo estimado: {{ formatEstimatedTime(slotProps.item.estimated) }}
                    </span>
                  </v-tooltip>
                </div>

                <div class="branch-route-col-actions busgo-actions">
                  <v-btn
                    size="30"
                    icon
                    variant="tonal"
                    :color="paleteColors.error"
                    @click="deleteItem(slotProps.item)"
                    title="Eliminar Ruta"
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

<v-dialog v-model="dialog" max-width="620px" persistent>
  <v-form ref="form" v-model="valid" enctype="multipart/form-data">
    <v-card class="busgo-route-dialog" elevation="18">

      <div class="busgo-route-header">
        <div class="busgo-route-icon">
          <v-icon size="28">mdi-road-variant</v-icon>
        </div>

        <div>
          <div class="busgo-route-title">{{ formTitle }}</div>
          <div class="busgo-route-subtitle">
            Asigna una ruta disponible a la sucursal
          </div>
        </div>

        <v-spacer />

        <v-btn
          icon="mdi-close"
          variant="text"
          size="small"
          class="busgo-route-close"
          @click="close"
        />
      </div>

      <v-card-text class="busgo-route-body">
        <label class="busgo-field-label">Ruta</label>

        <v-autocomplete
          :no-data-text="'No hay datos disponibles'"
          v-model="editedItem.route_id"
          :items="routes"
          placeholder="Buscar ruta..."
          prepend-inner-icon="mdi-map-search-outline"
          item-title="name"
          item-value="id"
          variant="outlined"
          density="comfortable"
          rounded="lg"
          :rules="selectRules"
          :disabled="this.editedIndex === 1"
          hide-details="auto"
          clearable
        >
          <template #item="{ props, item }">
            <v-list-item v-bind="props" class="busgo-route-option">
              <div class="busgo-route-option-grid">

                <div class="busgo-route-point">
                  <v-avatar size="42" class="busgo-route-avatar">
                    <v-img :src="`${this.$axios.defaults.baseURL}images/${item.raw.originImage}`" />
                  </v-avatar>

                  <div class="busgo-route-point-info">
                    <div class="busgo-route-point-label">
                      <v-icon size="14">mdi-map-marker-outline</v-icon>
                      Origen
                    </div>

                    <v-tooltip location="top">
                      <template #activator="{ props: tooltipProps }">
                        <div v-bind="tooltipProps" class="busgo-route-address">
                          {{ item.raw.originAddress }}
                        </div>
                      </template>
                      <span>{{ item.raw.originAddress }}</span>
                    </v-tooltip>
                  </div>
                </div>

                <div class="busgo-route-arrow">
                  <v-icon size="20">mdi-arrow-right</v-icon>
                </div>

                <div class="busgo-route-point">
                  <v-avatar size="42" class="busgo-route-avatar">
                    <v-img :src="`${this.$axios.defaults.baseURL}images/${item.raw.destinationImage}`" />
                  </v-avatar>

                  <div class="busgo-route-point-info">
                    <div class="busgo-route-point-label">
                      <v-icon size="14">mdi-map-marker-check-outline</v-icon>
                      Destino
                    </div>

                    <v-tooltip location="top">
                      <template #activator="{ props: tooltipProps }">
                        <div v-bind="tooltipProps" class="busgo-route-address">
                          {{ item.raw.destinationAddress }}
                        </div>
                      </template>
                      <span>{{ item.raw.destinationAddress }}</span>
                    </v-tooltip>
                  </div>
                </div>

              </div>
            </v-list-item>
          </template>
        </v-autocomplete>
      </v-card-text>

      <v-card-actions class="busgo-route-actions">
        <v-btn class="busgo-route-cancel" variant="flat" @click="close">
          Cancelar
        </v-btn>

        <v-btn
          class="busgo-route-save"
          variant="flat"
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
        <v-icon size="30">mdi-map-marker-remove-outline</v-icon>
      </div>

      <div>
        <div class="busgo-delete-title">Eliminar Ruta</div>
        <div class="busgo-delete-subtitle">Esta acción no se puede deshacer</div>
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
        ¿Desea eliminar la ruta seleccionada?
      </div>

      <div class="busgo-delete-warning">
        <v-icon size="20">mdi-information-outline</v-icon>
        <span>
          Verifique que la ruta no tenga viajes, tarifas o ventas asociadas antes de continuar.
        </span>
      </div>
    </v-card-text>

    <v-card-actions class="busgo-delete-actions">
      <v-btn class="busgo-delete-cancel" variant="flat" @click="closeDelete">
        Cancelar
      </v-btn>

      <v-btn
        class="busgo-delete-confirm"
        variant="flat"
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
    branchroutes: [],
    routes: [],
    branch_id: "",
    data: {},
    headers: [
      { title: "Ruta", key: "name", width: "15%" },
      { title: "Origen", key: "originName", width: "30%" },
      { title: "Destino", key: "destinationName", width: "30%" },
      { title: "Acciones", key: "actions", sortable: false, width: "25%" },
    ],

    editedItem: {
      id: "",
      branch_id: "",
      route_id: "",
    },
    originalItem: {
      id: "",
      branch_id: "",
      route_id: "",
    },
    defaultItem: {
      id: "",
      branch_id: "",
      route_id: "",
    },
    editedIndex: -1,
    search: "",
    selectRules: [(v) => !!v || "Seleccionar al menos un elemento"],
  }),
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "Agregar Ruta" : "Editar Ruta";
    },
  },
  mounted() {
    this.branch_id = this.branch.id;
    this.initialize();
  },
  methods: {
    getCacheTimestamp() {
      // Usamos medianoche (00:00:00) del día actual
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return startOfDay.getTime(); // Ej: 1714003200000 (cambia una vez al día)
    },
    formatNumber(value) {
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
    formatEstimatedTime(minutes) {
      const totalMinutes = Number(minutes) || 0;
      const hours = Math.floor(totalMinutes / 60);
      const mins = totalMinutes % 60;

      if (hours === 0) {
        return `${mins} min`;
      }

      if (mins === 0) {
        return `${hours} h`;
      }

      return `${hours} h ${mins} min`;
    },
    async showAdd() {
      this.data = {};
      const firstBranchRoute = this.branchroutes[0];
      const targetOriginId = firstBranchRoute?.origin_id;
      this.data.branch_id = this.branch_id;
      try {
        const result = await handleRequest({
          endpoint: "route-index-branch",
          method: "POST",
          data: this.data,
        });

        if (result.success) {
          // Obtenemos el origin_id de la primera ruta en branchroutes (si existe)
          /*const firstBranchRoute = this.branchroutes[0];
          const targetOriginId = firstBranchRoute?.origin_id;*/

          // Filtramos las rutas
          this.routes =
            result.data?.routes.filter(
              (route) =>
                !this.branchroutes.some(
                  (branchroute) => branchroute.route_id === route.id
                ) || route.id === this.editedItem.route_id
            ) || [];
        } else {
          this.routes = [];
        }
      } catch (error) {
        this.showAlert("error", "Ocurrió un error inesperado al cargar los datos.", 3000);
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
          endpoint: "branch-routes",
          method: "POST",
          data: this.data,
        });

        if (result.success) {
          // Si la solicitud es exitosa, asignamos las sucursales
          this.branchroutes = result.data?.branchRoutes || [];
          this.loading = false;
        } else {
          // Si no hay datos, asignamos un array vacío
          this.branchroutes = [];
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
        this.data.route_id = this.editedItem.route_id;

        try {
          const result = await handleRequest({
            endpoint: "branch-route",
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
        const fieldsToUpdate = ["id", "branch_id", "route_id"];
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
              endpoint: "branch-route",
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
      this.data = {};
      this.originalItem = Object.assign({}, item);
      this.editedItem = Object.assign({}, item);
      this.data.branch_id = this.branch_id;
      try {
        const result = await handleRequest({
          endpoint: "route-index-branch",
          method: "POST",
          data: this.data,
        });

        if (result.success) {
          this.routes = result.data?.routes || [];
        } else {
          // Si no hay datos, asignamos un array vacío
          this.routes = [];
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
          endpoint: "branch-route-destroy",
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
.branch-route-col-name {
  width: 15%;
  min-width: 0;
}

.branch-route-col-origin {
  width: 25%;
  min-width: 0;
}

.branch-route-col-destination {
  width: 25%;
  min-width: 0;
}

.branch-route-col-info {
  width: 20%;
  min-width: 0;
}

.branch-route-col-actions {
  width: 15%;
  min-width: 0;
}

.branch-route-row {
  min-height: 62px;
}

.branch-route-location {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}

.branch-route-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
  font-size: 13px;
  color: #374151;
}

.branch-route-distance,
.branch-route-time {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.branch-route-time {
  font-size: 12px;
  color: #64748b;
}

.busgo-dialog-card {
  border-radius: 18px;
  overflow: hidden;
}

.busgo-dialog-actions {
  padding: 14px 18px;
}

@media (max-width: 960px) {
  .branch-route-col-name,
  .branch-route-col-origin,
  .branch-route-col-destination,
  .branch-route-col-info,
  .branch-route-col-actions {
    width: 100%;
  }

  .branch-route-info {
    flex-direction: row;
    flex-wrap: wrap;
  }
}

.busgo-route-dialog,
.busgo-delete-dialog {
  border-radius: 24px !important;
  overflow: hidden;
  background: #ffffff;
}

.busgo-route-header,
.busgo-delete-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 22px 24px;
  color: #ffffff;
}

.busgo-route-header {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 55%, #334155 100%);
}

.busgo-delete-header {
  background: linear-gradient(135deg, #7f1d1d 0%, #991b1b 55%, #dc2626 100%);
}

.busgo-route-icon,
.busgo-delete-icon {
  width: 50px;
  height: 50px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.16);
  display: flex;
  align-items: center;
  justify-content: center;
}

.busgo-route-title,
.busgo-delete-title {
  font-size: 18px;
  font-weight: 800;
  line-height: 1.2;
}

.busgo-route-subtitle,
.busgo-delete-subtitle {
  font-size: 13px;
  opacity: 0.8;
  margin-top: 3px;
}

.busgo-route-close,
.busgo-delete-close {
  color: #ffffff !important;
  opacity: 0.9;
}

.busgo-route-body {
  padding: 24px !important;
  background: #f8fafc;
}

.busgo-field-label {
  display: block;
  font-size: 12px;
  font-weight: 700;
  color: #475569;
  margin-bottom: 8px;
}

.busgo-route-option {
  margin: 6px 8px !important;
  border-radius: 16px !important;
  background: #ffffff;
}

.busgo-route-option-grid {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 34px 1fr;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
}

.busgo-route-point {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 10px;
}

.busgo-route-avatar {
  border: 2px solid #e2e8f0;
}

.busgo-route-point-info {
  min-width: 0;
}

.busgo-route-point-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 800;
  color: #64748b;
}

.busgo-route-address {
  font-size: 13px;
  font-weight: 700;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.busgo-route-arrow {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  background: #eef2ff;
  color: #334155;
  display: flex;
  align-items: center;
  justify-content: center;
}

.busgo-route-actions,
.busgo-delete-actions {
  padding: 18px 24px !important;
  background: #ffffff;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.busgo-route-cancel,
.busgo-delete-cancel {
  background: #f1f5f9 !important;
  color: #475569 !important;
  border-radius: 12px !important;
  text-transform: none !important;
  font-weight: 700 !important;
  min-width: 110px;
}

.busgo-route-save {
  background: #0f172a !important;
  color: #ffffff !important;
  border-radius: 12px !important;
  text-transform: none !important;
  font-weight: 800 !important;
  min-width: 120px;
}

.busgo-route-save.v-btn--disabled {
  background: #cbd5e1 !important;
  color: #ffffff !important;
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
  border-top: 1px solid #fee2e2;
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
  .busgo-route-header,
  .busgo-delete-header {
    padding: 18px;
  }

  .busgo-route-body,
  .busgo-delete-body {
    padding: 18px !important;
  }

  .busgo-route-option-grid {
    grid-template-columns: 1fr;
  }

  .busgo-route-arrow {
    transform: rotate(90deg);
    margin-left: 4px;
  }

  .busgo-route-actions,
  .busgo-delete-actions {
    padding: 16px 18px !important;
  }

  .busgo-route-cancel,
  .busgo-route-save,
  .busgo-delete-cancel,
  .busgo-delete-confirm {
    flex: 1;
  }
}
</style>
