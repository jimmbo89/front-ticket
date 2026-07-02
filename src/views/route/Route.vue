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
      <v-icon>mdi-map-marker-path</v-icon>
    </v-avatar>

    <div>
      <div class="busgo-page-title">Rutas</div>
      <div class="busgo-page-subtitle">Gestionar rutas del sistema</div>
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
          <div class="busgo-card-title">Listado de rutas</div>
          <div class="busgo-card-subtitle">
            Administra origen, destino, distancia, duración, paradas y tramos.
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
        :items="branchRoutes"
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
            <div class="route-list-col-name">Ruta</div>
            <div class="route-list-col-origin">Origen</div>
            <div class="route-list-col-destination">Destino</div>
            <div class="route-list-col-distance">Distancia</div>
            <div class="route-list-col-duration">Duración</div>
            <div class="route-list-col-actions">Acciones</div>
          </div>
        </template>

        <template #item="slotProps">
          <tr>
            <td class="pa-0 border-0">
              <div class="busgo-row route-list-row">
                <div class="route-list-col-name busgo-name-cell">
                  <v-avatar
                    size="36"
                    rounded="lg"
                    color="grey-lighten-4"
                    class="busgo-avatar"
                  >
                    <v-icon color="primary" size="20">
                      mdi-road-variant
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

                <div class="route-list-col-origin busgo-name-cell">
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

                  <span class="route-list-location text-truncate">
                    {{ slotProps.item.originName }}
                  </span>

                  <v-tooltip activator="parent" location="top" max-width="350px">
                    <span style="white-space: normal; word-break: break-word">
                      Origen: {{ slotProps.item.originName }}
                    </span>
                  </v-tooltip>
                </div>

                <div class="route-list-col-destination busgo-name-cell">
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

                  <span class="route-list-location text-truncate">
                    {{ slotProps.item.destinationName }}
                  </span>

                  <v-tooltip activator="parent" location="top" max-width="350px">
                    <span style="white-space: normal; word-break: break-word">
                      Destino: {{ slotProps.item.destinationName }}
                    </span>
                  </v-tooltip>
                </div>

                <div class="route-list-col-distance busgo-meta">
                  <v-icon size="16" color="primary">mdi-ruler</v-icon>

                  <span class="text-truncate">
                    {{ slotProps.item.distance }} km
                  </span>

                  <v-tooltip activator="parent" location="bottom" max-width="350px">
                    <span style="white-space: normal; word-break: break-word">
                      Distancia: {{ slotProps.item.distance }} km
                    </span>
                  </v-tooltip>
                </div>

                <div class="route-list-col-duration busgo-meta">
                  <v-icon size="16" color="primary">mdi-timer-outline</v-icon>

                  <span class="text-truncate">
                    {{ slotProps.item.estimated }} min
                  </span>

                  <v-tooltip activator="parent" location="bottom" max-width="350px">
                    <span style="white-space: normal; word-break: break-word">
                      Duración: {{ slotProps.item.estimated }} minutos
                    </span>
                  </v-tooltip>
                </div>

                <div class="route-list-col-actions busgo-actions">
                  <v-btn
                    size="30"
                    icon
                    variant="tonal"
                    :color="paleteColors.success"
                    @click="openRouteStops(slotProps.item)"
                    title="Gestionar paradas"
                  >
                    <v-icon size="17">mdi-map-marker-path</v-icon>
                  </v-btn>

                  <v-btn
                    size="30"
                    icon
                    variant="tonal"
                    :color="paleteColors.warning"
                    @click="openFareSegments(slotProps.item)"
                    title="Gestionar tramos"
                  >
                    <v-icon size="17">mdi-cash-multiple</v-icon>
                  </v-btn>

                  <v-btn
                    size="30"
                    icon
                    variant="tonal"
                    :color="paleteColors.primary"
                    @click="editItem(slotProps.item)"
                    title="Editar Ruta"
                  >
                    <v-icon size="17">mdi-pencil</v-icon>
                  </v-btn>

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

  <v-dialog v-model="dialog" max-width="500px" persistent>
    <v-form ref="form" v-model="valid" enctype="multipart/form-data">
      <v-card class="busgo-dialog-card">
        <v-toolbar :color="paleteColors.primary">
          <span class="text-subtitle-2 ml-4">{{ formTitle }}</span>
        </v-toolbar>

        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12" md="12">
                <v-text-field
                  v-model="editedItem.name"
                  label="Nombre"
                  prepend-icon="mdi-store"
                  variant="underlined"
                  :rules="nameRules"
                />
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
                >
                  <template #item="{ props, item }">
                    <v-list-item
                      v-bind="props"
                      :prepend-avatar="`${this.$axios.defaults.baseURL}images/${item.raw.image}`"
                      :title="item.raw.address"
                    />
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
                  <template #item="{ props, item }">
                    <v-list-item
                      v-bind="props"
                      :prepend-avatar="`${this.$axios.defaults.baseURL}images/${item.raw.image}`"
                      :title="item.raw.address"
                    />
                  </template>
                </v-autocomplete>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="editedItem.distance"
                  label="Distancia (Km)"
                  prepend-icon="mdi-ruler"
                  variant="underlined"
                  :rules="distanceRules"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="editedItem.estimated"
                  label="Duración (Minutos)"
                  prepend-icon="mdi-timer"
                  variant="underlined"
                  :rules="durationRules"
                />
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-divider />

        <v-card-actions class="busgo-dialog-actions">
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
    <v-card class="busgo-dialog-card">
      <v-toolbar :color="paleteColors.error">
        <span class="text-subtitle-2 ml-4">
          Eliminar ruta
        </span>
      </v-toolbar>

      <v-card-text class="mt-2 mb-2">
        ¿Desea eliminar la ruta seleccionada?
      </v-card-text>

      <v-divider />

      <v-card-actions class="busgo-dialog-actions">
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

  <v-dialog v-model="dialogRouteStop" fullscreen transition="dialog-bottom-transition">
    <v-card class="route-list-full-dialog">
      <v-card-text class="route-list-full-dialog-content">
        <RouteStop :route="selectedRoute" @close="closeDialogRouteStop" />
      </v-card-text>

      <v-divider />

      <v-card-actions class="busgo-dialog-actions">
        <v-spacer />

        <v-btn
          variant="flat"
          :color="paleteColors.gris"
          prepend-icon="mdi-close"
          @click="closeDialogRouteStop"
        >
          Cerrar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="dialogFareSegment" fullscreen transition="dialog-bottom-transition">
    <v-card class="route-list-full-dialog">
      <v-card-text class="route-list-full-dialog-content">
        <FareSegment :route="selectedRoute" @close="closeDialogFareSegment" />
      </v-card-text>

      <v-divider />

      <v-card-actions class="busgo-dialog-actions">
        <v-spacer />

        <v-btn
          variant="flat"
          :color="paleteColors.gris"
          prepend-icon="mdi-close"
          @click="closeDialogFareSegment"
        >
          Cerrar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { paleteColors } from "@/assets/colors";
import { handleRequest } from "@/utils/api"; // Ruta al archivo
import LocalStorageService from "@/LocalStorageService";
import RouteStop from "./RouteStop.vue";
import FareSegment from "./FareSegment.vue";
export default {
  components: {
    RouteStop,
    FareSegment,
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
    locations: [],
    locationsOrigins: [],
    filteredDestinations: [],
    routes: [],
    branchRoutes: [],
    data: {},
    branch_id: "",
    permissions: "",
    selectedRoute: {},
    dialogRouteStop: false,
    dialogFareSegment: false,
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
  watch: {},
  mounted() {
    this.role = JSON.parse(LocalStorageService.getItem("role"));
    this.company_id = LocalStorageService.getItem("business_id");
    this.branch_id = LocalStorageService.getItem("branch_id");
    this.permissions = LocalStorageService.getItem("permissions");
    this.initialize();
  },
  methods: {
    hasPermission(requiredPermissions) {
      // Si es un string, lo convertimos a array
      const perms = Array.isArray(requiredPermissions)
        ? requiredPermissions
        : [requiredPermissions];

      // Retorna true si al menos uno coincide
      return perms.some((p) => this.permissions.includes(p));
    },
    formatNumber(value) {
      const numberValue = parseFloat(value);

      // Si no es un número válido, devolvemos '0.00'
      if (isNaN(numberValue)) {
        return "0.00";
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
    getCacheTimestamp() {
      // Usamos medianoche (00:00:00) del día actual
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return startOfDay.getTime(); // Ej: 1714003200000 (cambia una vez al día)
    },
    async showAdd() {
      //this.close();
      this.data = {};
      this.editedIndex = -1;
      try {
        const result = await handleRequest({
          endpoint: "location-route",
          method: "POST",
          data: this.data,
        });

        if (result.success) {
          this.locations = result.data?.destinations || [];
          this.locationsOrigins = result.data?.origins || [];

          this.editedItem.origin_id = null;
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
      try {
        this.loading = true;
        const result = await handleRequest({
          endpoint: "branch-routes",
          method: "POST",
          data: {},
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
    openRouteStops(item) {
      this.selectedRoute = {
        ...item,
        id: item.route_id ?? item.id,
        route_id: item.route_id ?? item.id,
      };
      this.dialogRouteStop = true;
    },
    openFareSegments(item) {
      this.selectedRoute = {
        ...item,
        id: item.route_id ?? item.id,
        route_id: item.route_id ?? item.id,
      };
      this.dialogFareSegment = true;
    },
    closeDialogRouteStop() {
      this.dialogRouteStop = false;
      this.selectedRoute = {};
    },
    closeDialogFareSegment() {
      this.dialogFareSegment = false;
      this.selectedRoute = {};
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

.route-col-name {
  width: 17%;
  min-width: 0;
}

.route-col-origin {
  width: 25%;
  min-width: 0;
}

.route-col-destination {
  width: 25%;
  min-width: 0;
}

.route-col-distance {
  width: 11%;
  min-width: 0;
}

.route-col-duration {
  width: 11%;
  min-width: 0;
}

.route-col-actions {
  width: 11%;
  min-width: 0;
}

.busgo-meta-text {
  font-size: 13px;
  color: #374151;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* =======================================================
   BUSGO DESIGN SYSTEM
   ======================================================= */

:root{

--busgo-border:#E5E7EB;

--busgo-border-soft:#EEF2F7;

--busgo-surface:#FFFFFF;

--busgo-surface-alt:#F8FAFC;

--busgo-text:#111827;

--busgo-text-soft:#64748B;

--busgo-radius-lg:18px;

--busgo-radius-md:12px;

--busgo-shadow:

0 1px 2px rgba(15,23,42,.04),

0 4px 12px rgba(15,23,42,.05);

}


/* =======================================================
   LAYOUT
   ======================================================= */

.busgo-page{

padding:24px;

}

.busgo-card{

background:var(--busgo-surface);

border:1px solid var(--busgo-border);

border-radius:var(--busgo-radius-lg);

overflow:hidden;

box-shadow:var(--busgo-shadow);

}

.busgo-section{

padding:24px;

}


/* =======================================================
   HEADER
   ======================================================= */

.busgo-page-header{

display:flex;

align-items:center;

gap:16px;

padding:18px 24px;

background:var(--busgo-surface-alt);

border-bottom:1px solid var(--busgo-border);

}

.busgo-page-icon{

border-radius:14px;

}

.busgo-page-title{

font-size:22px;

font-weight:700;

color:var(--busgo-text);

}

.busgo-page-subtitle{

font-size:13px;

color:var(--busgo-text-soft);

margin-top:2px;

}

.busgo-page-actions{

margin-left:auto;

display:flex;

gap:8px;

}


/* =======================================================
   SEARCH
   ======================================================= */

.busgo-search{

max-width:380px;

min-width:280px;

}


/* =======================================================
   CARD HEADER
   ======================================================= */

.busgo-card-header{

display:flex;

justify-content:space-between;

align-items:center;

gap:24px;

padding:20px 24px;

}

.busgo-card-title{

font-size:16px;

font-weight:700;

color:var(--busgo-text);

}

.busgo-card-subtitle{

font-size:13px;

color:var(--busgo-text-soft);

}


/* =======================================================
   TABLE
   ======================================================= */

.busgo-table{

background:transparent;

max-height:68vh;

overflow:auto;

}

.busgo-table-head{

display:flex;

align-items:center;

padding:0 20px;

height:42px;

margin:0 16px 6px;

border-radius:12px;

background:var(--busgo-surface-alt);

font-size:12px;

font-weight:700;

text-transform:uppercase;

color:var(--busgo-text-soft);

}

.busgo-row{

display:flex;

align-items:center;

min-height:58px;

padding:8px 20px;

margin:0 16px 6px;

border:1px solid var(--busgo-border-soft);

border-radius:12px;

background:white;

transition:all .15s ease;

}

.busgo-row:hover{

background:#fafafa;

border-color:#dbeafe;

}


/* =======================================================
   CELLS
   ======================================================= */

.busgo-name-cell{

display:flex;

align-items:center;

gap:12px;

}

.busgo-avatar{

border:1px solid var(--busgo-border);

}

.busgo-name{

font-size:14px;

font-weight:600;

overflow:hidden;

white-space:nowrap;

text-overflow:ellipsis;

}

.busgo-meta{

display:flex;

align-items:center;

gap:6px;

font-size:13px;

color:#374151;

}


/* =======================================================
   BUTTONS
   ======================================================= */

.busgo-actions{

display:flex;

justify-content:flex-end;

gap:5px;

}

.busgo-action{

width:30px;

height:30px;

}


/* =======================================================
   FOOTER
   ======================================================= */

.busgo-footer{

padding:14px 24px;

border-top:1px solid var(--busgo-border-soft);

}


/* =======================================================
   SCROLL
   ======================================================= */

.busgo-table::-webkit-scrollbar{

width:8px;

}

.busgo-table::-webkit-scrollbar-thumb{

background:#CBD5E1;

border-radius:30px;

}


/* =======================================================
   RESPONSIVE
   ======================================================= */

@media(max-width:960px){

.busgo-card-header{

flex-direction:column;

align-items:stretch;

}

.busgo-search{

max-width:100%;

min-width:100%;

}

.busgo-table-head{

display:none;

}

.busgo-row{

flex-direction:column;

align-items:stretch;

gap:12px;

}

.busgo-actions{

justify-content:flex-start;

}

}


.route-list-col-name {
  width: 14%;
  min-width: 0;
}

.route-list-col-origin {
  width: 24%;
  min-width: 0;
}

.route-list-col-destination {
  width: 24%;
  min-width: 0;
}

.route-list-col-distance {
  width: 12%;
  min-width: 0;
}

.route-list-col-duration {
  width: 12%;
  min-width: 0;
}

.route-list-col-actions {
  width: 14%;
  min-width: 0;
}

.route-list-row {
  min-height: 62px;
}

.route-list-location {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}

.route-list-full-dialog {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.route-list-full-dialog-content {
  flex: 1;
  overflow-y: auto;
}

.busgo-dialog-card {
  border-radius: 18px;
  overflow: hidden;
}

.busgo-dialog-actions {
  padding: 14px 18px;
  background: #f8fafc;
}

@media (max-width: 960px) {
  .route-list-col-name,
  .route-list-col-origin,
  .route-list-col-destination,
  .route-list-col-distance,
  .route-list-col-duration,
  .route-list-col-actions {
    width: 100%;
  }
}

</style>
