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

  <v-card class="d-flex align-center pa-3" elevation="0" style="background-color: #f9f9f9">
    <v-avatar :color="paleteColors.primary" class="icono-concavo">
      <v-icon cover>mdi-map-marker-path</v-icon>
    </v-avatar>

    <div class="ml-4">
      <div class="text-h6 font-weight-medium">{{ routeTitle }}</div>
      <div class="text-body-2 text-grey">Gestionar paradas de la ruta</div>
    </div>

    <v-spacer></v-spacer>

    <v-btn
      class="text-subtitle-1 ml-12"
      :color="paleteColors.primary"
      variant="tonal"
      elevation="2"
      prepend-icon="mdi-plus-circle"
      @click="showAdd()"
    >
      Agregar Parada
    </v-btn>
  </v-card>

  <v-container style="min-width: 100%">
    <v-card flat>
      <v-card-title class="d-flex flex-wrap align-center gap-4 pb-2">
        <div class="text-subtitle-1 font-weight-bold">Listado de paradas</div>
        <v-spacer class="d-none d-md-block"></v-spacer>

        <div class="flex-grow-1" style="max-width: 320px">
          <v-text-field
            v-model="search"
            density="compact"
            label="Buscar parada"
            prepend-inner-icon="mdi-magnify"
            variant="solo-filled"
            hide-details
            single-line
            flat
          ></v-text-field>
        </div>
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="routeStops"
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
          <v-card
            flat
            color="blue-grey-lighten-5"
            class="mb-2 mx-1 rounded-lg"
            elevation="1"
            style="
              border: 1px solid #eceff1;
              height: 40px;
              min-height: 40px;
              display: flex;
              align-items: center;
            "
          >
            <v-card-text
              class="d-flex pa-2"
              style="
                width: 100%;
                min-width: 0;
                height: 100%;
                padding: 0 16px !important;
                display: flex;
                align-items: center;
              "
            >
              <div style="width: 28%; min-width: 0" class="text-left font-weight-bold">
                Parada
              </div>
              <div style="width: 12%; min-width: 0" class="text-left font-weight-bold">
                Orden
              </div>
              <div style="width: 12%; min-width: 0" class="text-left font-weight-bold">
                Distancia
              </div>
              <div style="width: 12%; min-width: 0" class="text-left font-weight-bold">
                Minutos
              </div>
              <div style="width: 10%; min-width: 0" class="text-left font-weight-bold">
                Subir
              </div>
              <div style="width: 10%; min-width: 0" class="text-left font-weight-bold">
                Bajar
              </div>
              <div style="width: 10%; min-width: 0" class="text-left font-weight-bold">
                Estado
              </div>
              <div style="width: 6%; min-width: 0" class="d-flex justify-left font-weight-bold"></div>
            </v-card-text>
          </v-card>
        </template>

        <template v-slot:item="slotProps">
          <tr>
            <td colspan="100%" style="padding: 0; border: none">
              <v-card class="mb-2 mx-1 rounded-lg" elevation="1" density="comfortable" flat>
                <v-card-text class="d-flex align-center pa-2" style="width: 100%; min-width: 0">
                  <div class="d-flex align-center" style="width: 28%; min-width: 0">
                    <v-avatar class="mr-3 icono-concavo" color="grey-lighten-4">
                      <v-img
                        :src="`${this.$axios.defaults.baseURL}images/${slotProps.item.locationImage}`"
                        cover
                      ></v-img>
                    </v-avatar>
                    <div class="text-truncate">
                      <div class="font-weight-medium">{{ slotProps.item.locationName }}</div>
                      <div class="text-caption text-grey text-truncate">
                        {{ slotProps.item.locationCity }}, {{ slotProps.item.locationCountry }}
                      </div>
                    </div>
                    <v-tooltip activator="parent" location="bottom" max-width="350px">
                      <span style="white-space: normal; word-break: break-word">
                        {{ slotProps.item.locationName }} - {{ slotProps.item.locationCity }},
                        {{ slotProps.item.locationCountry }}
                      </span>
                    </v-tooltip>
                  </div>

                  <div style="width: 12%; min-width: 0" class="text-truncate">
                    <span>{{ slotProps.item.stop_order }}</span>
                    <v-tooltip activator="parent" location="bottom" max-width="350px">
                      <span style="white-space: normal; word-break: break-word">
                        Orden: {{ slotProps.item.stop_order }}
                      </span>
                    </v-tooltip>
                  </div>

                  <div style="width: 12%; min-width: 0" class="text-truncate">
                    <span>{{ slotProps.item.distance_km }} km</span>
                    <v-tooltip activator="parent" location="bottom" max-width="350px">
                      <span style="white-space: normal; word-break: break-word">
                        Distancia: {{ slotProps.item.distance_km }} km
                      </span>
                    </v-tooltip>
                  </div>

                  <div style="width: 12%; min-width: 0" class="text-truncate">
                    <span>{{ slotProps.item.minutes_from_origin }} min</span>
                    <v-tooltip activator="parent" location="bottom" max-width="350px">
                      <span style="white-space: normal; word-break: break-word">
                        Minutos desde origen: {{ slotProps.item.minutes_from_origin }}
                      </span>
                    </v-tooltip>
                  </div>

                  <div style="width: 10%; min-width: 0" class="text-truncate">
                    <v-chip
                      :color="slotProps.item.allows_boarding ? paleteColors.success : paleteColors.grey"
                      :text-color="paleteColors.white"
                    >
                      {{ slotProps.item.allows_boarding ? "Sí" : "No" }}
                    </v-chip>
                  </div>

                  <div style="width: 10%; min-width: 0" class="text-truncate">
                    <v-chip
                      :color="slotProps.item.allows_alighting ? paleteColors.success : paleteColors.grey"
                      :text-color="paleteColors.white"
                    >
                      {{ slotProps.item.allows_alighting ? "Sí" : "No" }}
                    </v-chip>
                  </div>

                  <div style="width: 10%; min-width: 0" class="text-truncate">
                    <v-chip
                      :color="slotProps.item.active ? paleteColors.active : paleteColors.inactive"
                      :text-color="paleteColors.white"
                    >
                      {{ slotProps.item.active ? "Activa" : "Inactiva" }}
                    </v-chip>
                  </div>

                  <div
                    class="d-flex gap-1"
                    style="width: 6%; justify-content: flex-end; flex-wrap: nowrap"
                  >
                    <v-btn
                      size="35"
                      icon
                      variant="outlined"
                      :style="{ 'border-width': '1px', 'border-style': 'solid' }"
                      :color="paleteColors.primary"
                      @click="editItem(slotProps.item)"
                      class="flex-shrink-0 mr-1"
                      title="Editar parada"
                    >
                      <v-icon size="20">mdi-pencil</v-icon>
                    </v-btn>

                    <v-btn
                      size="35"
                      icon
                      variant="outlined"
                      :style="{ 'border-width': '1px', 'border-style': 'solid' }"
                      :color="paleteColors.error"
                      @click="deleteItem(slotProps.item)"
                      class="flex-shrink-0"
                      title="Eliminar parada"
                    >
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

  <v-dialog v-model="dialog" max-width="700px" persistent>
    <v-form ref="form" v-model="valid">
      <v-card>
        <v-toolbar :color="paleteColors.primary">
          <span class="text-subtitle-2 ml-4">{{ formTitle }}</span>
        </v-toolbar>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12" md="12">
                <v-autocomplete
                  v-model="editedItem.location_id"
                  :items="locations"
                  :no-data-text="'No hay datos disponibles'"
                  label="Parada"
                  prepend-icon="mdi-map-marker"
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
                    >
                      <v-list-item-subtitle>
                        {{ item.raw.city }}, {{ item.raw.country }}
                      </v-list-item-subtitle>
                    </v-list-item>
                  </template>
                </v-autocomplete>
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field
                  v-model="editedItem.stop_order"
                  label="Orden"
                  prepend-icon="mdi-numeric"
                  variant="underlined"
                  type="number"
                  min="1"
                  :rules="stopOrderRules"
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field
                  v-model="editedItem.distance_km"
                  label="Distancia (Km)"
                  prepend-icon="mdi-ruler"
                  variant="underlined"
                  type="number"
                  step="0.1"
                  min="0"
                  :rules="numberRules"
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field
                  v-model="editedItem.minutes_from_origin"
                  label="Minutos desde origen"
                  prepend-icon="mdi-timer-outline"
                  variant="underlined"
                  type="number"
                  min="0"
                  :rules="numberRules"
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="4" class="d-flex align-center">
                <div class="d-flex align-center compact-switch-line">
                  <v-switch
                    v-model="editedItem.allows_boarding"
                    :true-value="true"
                    :false-value="false"
                    :color="editedItem.allows_boarding ? paleteColors.green : paleteColors.grey"
                    :base-color="editedItem.allows_boarding ? paleteColors.green : paleteColors.grey"
                    hide-details
                    inset
                    density="compact"
                    class="custom-switch compact-inline-switch"
                  />
                  <span
                    class="text-body-1 compact-switch-label"
                    :style="{
                      color: editedItem.allows_boarding
                        ? paleteColors.green
                        : paleteColors.grey,
                    }"
                  >
                    {{ editedItem.allows_boarding ? "Subida" : "Sin subida" }}
                  </span>
                </div>
              </v-col>

              <v-col cols="12" md="4" class="d-flex align-center">
                <div class="d-flex align-center compact-switch-line">
                  <v-switch
                    v-model="editedItem.allows_alighting"
                    :true-value="true"
                    :false-value="false"
                    :color="editedItem.allows_alighting ? paleteColors.green : paleteColors.grey"
                    :base-color="editedItem.allows_alighting ? paleteColors.green : paleteColors.grey"
                    hide-details
                    inset
                    density="compact"
                    class="custom-switch compact-inline-switch"
                  />
                  <span
                    class="text-body-1 compact-switch-label"
                    :style="{
                      color: editedItem.allows_alighting
                        ? paleteColors.green
                        : paleteColors.grey,
                    }"
                  >
                    {{ editedItem.allows_alighting ? "Bajada" : "Sin bajada" }}
                  </span>
                </div>
              </v-col>

              <v-col cols="12" md="4" class="d-flex align-center">
                <div class="d-flex align-center compact-switch-line">
                  <v-switch
                    v-model="editedItem.active"
                    :true-value="true"
                    :false-value="false"
                    :color="editedItem.active ? paleteColors.green : paleteColors.grey"
                    :base-color="editedItem.active ? paleteColors.green : paleteColors.grey"
                    hide-details
                    inset
                    density="compact"
                    class="custom-switch compact-inline-switch"
                  />
                  <span
                    class="text-body-1 compact-switch-label"
                    :style="{ color: editedItem.active ? paleteColors.green : paleteColors.grey }"
                  >
                    {{ editedItem.active ? "Activa" : "Inactiva" }}
                  </span>
                </div>
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
        <span class="text-subtitle-2 ml-4">Eliminar una parada</span>
      </v-toolbar>
      <v-card-text class="mt-2 mb-2">
        ¿Desea eliminar la parada seleccionada?
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn :color="paleteColors.gris" variant="flat" @click="closeDelete">Cancelar</v-btn>
        <v-btn :color="paleteColors.error" variant="flat" @click="deleteItemConfirm">
          Aceptar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { paleteColors } from "@/assets/colors";
import { handleRequest } from "@/utils/api";
import LocalStorageService from "@/LocalStorageService";

export default {
  name: "RouteStop",
  props: {
    route: {
      type: Object,
      required: true,
      default: () => ({}),
    },
  },
  data: () => ({
    snackbar: false,
    sb_type: "",
    sb_message: "",
    sb_timeout: 2000,
    sb_title: "",
    sb_icon: "",
    paleteColors,
    valid: true,
    loading: false,
    dialog: false,
    dialogDelete: false,
    routeStops: [],
    locations: [],
    search: "",
    company_id: "",
    route_id: "",
    editedIndex: -1,
    data: {},
    headers: [
      { title: "Parada", value: "locationName" },
      { title: "Orden", value: "stop_order" },
      { title: "Distancia", value: "distance_km" },
      { title: "Minutos", value: "minutes_from_origin" },
      { title: "Subida", value: "allows_boarding" },
      { title: "Bajada", value: "allows_alighting" },
      { title: "Estado", value: "active" },
      { title: "Acciones", value: "actions", sortable: false },
    ],
    editedItem: {
      id: "",
      company_id: "",
      route_id: "",
      location_id: "",
      stop_order: 1,
      distance_km: 0,
      minutes_from_origin: 0,
      allows_boarding: true,
      allows_alighting: true,
      active: true,
    },
    originalItem: {
      id: "",
      company_id: "",
      route_id: "",
      location_id: "",
      stop_order: 1,
      distance_km: 0,
      minutes_from_origin: 0,
      allows_boarding: true,
      allows_alighting: true,
      active: true,
    },
    defaultItem: {
      id: "",
      company_id: "",
      route_id: "",
      location_id: "",
      stop_order: 1,
      distance_km: 0,
      minutes_from_origin: 0,
      allows_boarding: true,
      allows_alighting: true,
      active: true,
    },
    selectRules: [(v) => !!v || "Seleccionar al menos un elemento"],
    numberRules: [
      (v) => (v !== null && v !== undefined && v !== "") || "El campo es requerido",
      (v) => !Number.isNaN(Number(v)) || "Debe ser un número válido",
    ],
  }),
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "Agregar Parada" : "Editar Parada";
    },
    routeTitle() {
      return this.route?.name ? `Paradas de ${this.route.name}` : "Paradas de la ruta";
    },
    stopOrderRules() {
      return [
        (v) => (v !== null && v !== undefined && v !== "") || "El campo es requerido",
        (v) => !Number.isNaN(Number(v)) || "Debe ser un número válido",
        (v) => Number(v) >= 1 || "El orden debe ser mayor o igual a 1",
        (v) =>
          !this.hasDuplicateStopOrder(v) || "Ya existe una parada con ese orden en esta ruta",
      ];
    },
  },
  mounted() {
    this.company_id = this.route?.company_id || LocalStorageService.getItem("business_id");
    this.route_id = this.route?.route_id || this.route?.id || "";
    this.initialize();
  },
  watch: {
    route: {
      deep: true,
      immediate: true,
      handler(newRoute) {
        this.company_id = newRoute?.company_id || LocalStorageService.getItem("business_id");
        this.route_id = newRoute?.route_id || newRoute?.id || "";
        if (this.route_id) {
          this.initialize();
        }
      },
    },
  },
  methods: {
    normalizeRouteStop(item = {}) {
      return {
        ...item,
        company_id: item.company_id ?? this.company_id ?? "",
        route_id: item.route_id ?? this.route_id ?? "",
        stop_order: item.stop_order ?? 1,
        distance_km: item.distance_km ?? 0,
        minutes_from_origin: item.minutes_from_origin ?? 0,
        allows_boarding: item.allows_boarding ?? true,
        allows_alighting: item.allows_alighting ?? true,
        active: item.active ?? true,
      };
    },
    getNextStopOrder() {
      const stopOrders = (Array.isArray(this.routeStops) ? this.routeStops : [])
        .map((stop) => Number(stop.stop_order ?? stop.stopOrder))
        .filter((value) => Number.isFinite(value) && value > 0);

      if (!stopOrders.length) {
        return 1;
      }

      return Math.max(...stopOrders) + 1;
    },
    hasDuplicateStopOrder(value) {
      const stopOrder = Number(value);
      if (!Number.isFinite(stopOrder) || stopOrder < 1) {
        return false;
      }

      return (Array.isArray(this.routeStops) ? this.routeStops : []).some((stop) => {
        if (this.editedIndex !== -1 && Number(stop.id) === Number(this.editedItem.id)) {
          return false;
        }

        return Number(stop.stop_order ?? stop.stopOrder) === stopOrder;
      });
    },
    async loadLocations() {
      const result = await handleRequest({
        endpoint: "location",
        method: "GET",
      });

      if (result.success) {
        const rawLocations = Array.isArray(result.data?.locations)
          ? result.data.locations
          : Object.values(result.data?.locations || {});
        this.locations = rawLocations.map((location) => ({
          ...location,
          active: location.active ?? true,
        }));
      } else {
        this.locations = [];
      }
    },
    async initialize() {
      if (!this.route_id) {
        this.routeStops = [];
        return;
      }

      this.loading = true;
      try {
        const result = await handleRequest({
          endpoint: "route-stop-by-route",
          method: "POST",
          data: { route_id: this.route_id },
        });

        if (result.success) {
          const rawStops = Array.isArray(result.data?.routeStops)
            ? result.data.routeStops
            : Object.values(result.data?.routeStops || {});
          this.routeStops = rawStops.map((item) => this.normalizeRouteStop(item));
        } else {
          this.routeStops = [];
        }
      } catch (error) {
        this.showAlert("error", "Ocurrió un error inesperado al procesar la solicitud.", 3000);
      } finally {
        this.loading = false;
      }
    },
    async showAdd() {
      this.dialog = false;
      this.editedIndex = -1;
      this.editedItem = Object.assign({}, this.defaultItem);
      this.originalItem = Object.assign({}, this.defaultItem);
      try {
        await this.loadLocations();
        this.editedItem.company_id = this.company_id;
        this.editedItem.route_id = this.route_id;
        this.editedItem.stop_order = this.getNextStopOrder();
        this.dialog = true;
      } catch (error) {
        this.showAlert("error", "Ocurrió un error inesperado al procesar la solicitud.", 3000);
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
    async save() {
      if (this.hasDuplicateStopOrder(this.editedItem.stop_order)) {
        this.showAlert(
          "warning",
          "Ya existe una parada con ese orden. Elige otro número para continuar.",
          3000
        );
        return;
      }

      this.loading = true;
      try {
        const payload = {
          company_id: this.company_id,
          route_id: this.route_id,
          location_id: this.editedItem.location_id,
          stop_order: Number(this.editedItem.stop_order),
          distance_km: Number(this.editedItem.distance_km),
          minutes_from_origin: Number(this.editedItem.minutes_from_origin),
          allows_boarding: !!this.editedItem.allows_boarding,
          allows_alighting: !!this.editedItem.allows_alighting,
          active: this.editedItem.active ?? true,
        };

        if (this.editedIndex !== -1) {
          payload.id = this.editedItem.id;
        }

        const result = await handleRequest({
          endpoint: "route-stop",
          method: this.editedIndex === -1 ? "POST" : "PUT",
          data: payload,
        });

        if (result.success) {
          this.showAlert("success", result.message, 3000);
          await this.initialize();
        } else {
          this.showAlert("warning", result.message, 3000);
        }
      } catch (error) {
        this.showAlert("error", "Ocurrió un error inesperado al procesar la solicitud.", 3000);
      } finally {
        this.loading = false;
        this.close();
      }
    },
    async editItem(item) {
      this.editedIndex = 1;
      this.originalItem = Object.assign({}, this.normalizeRouteStop(item));
      this.editedItem = Object.assign({}, this.normalizeRouteStop(item));
      try {
        await this.loadLocations();
        if (
          this.editedItem.location_id &&
          !this.locations.some((location) => Number(location.id) === Number(this.editedItem.location_id))
        ) {
          const selectedLocation = this.routeStops.find(
            (stop) => Number(stop.location_id) === Number(this.editedItem.location_id)
          );
          if (selectedLocation) {
            this.locations.push({
              id: selectedLocation.location_id,
              address: selectedLocation.locationName,
              image: selectedLocation.locationImage,
              city: selectedLocation.locationCity,
              country: selectedLocation.locationCountry,
            });
          }
        }
        this.dialog = true;
      } catch (error) {
        this.showAlert("error", "Ocurrió un error inesperado al procesar la solicitud.", 3000);
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
        const result = await handleRequest({
          endpoint: "route-stop-destroy",
          method: "POST",
          data: { id: this.editedItem.id },
        });

        if (result.success) {
          this.showAlert("success", result.message, 3000);
          await this.initialize();
        } else {
          this.showAlert("warning", result.message, 3000);
        }
      } catch (error) {
        this.showAlert("error", "Ocurrió un error inesperado al procesar la solicitud.", 3000);
      } finally {
        this.closeDelete();
      }
    },
    showAlert(sb_type, sb_message, sb_timeout) {
      this.sb_type = sb_type;
      this.sb_title =
        sb_type === "success"
          ? "Éxito"
          : sb_type === "warning"
            ? "Advertencia"
            : "Error";
      this.sb_icon = sb_type === "success" ? "mdi-check-circle" : "mdi-alert-circle";
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

.compact-switch-line {
  gap: 4px;
}

.compact-switch-label {
  font-weight: 500;
  line-height: 1;
  white-space: nowrap;
}

.compact-inline-switch :deep(.v-selection-control) {
  min-height: 0;
  min-width: 0;
}

.compact-inline-switch :deep(.v-switch__track) {
  transform: scale(0.68);
  transform-origin: left center;
}

.compact-inline-switch :deep(.v-switch__thumb) {
  transform: scale(0.68);
}

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
</style>
