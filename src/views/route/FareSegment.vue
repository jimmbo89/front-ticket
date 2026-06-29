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
      <v-icon cover>mdi-cash-multiple</v-icon>
    </v-avatar>

    <div class="ml-4">
      <div class="text-h6 font-weight-medium">{{ routeTitle }}</div>
      <div class="text-body-2 text-grey">Gestionar tramos tarifarios de la ruta</div>
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
      Agregar Tramo
    </v-btn>
  </v-card>

  <v-container style="min-width: 100%">
    <v-card flat>
      <v-card-title class="d-flex flex-wrap align-center gap-4 pb-2">
        <div class="text-subtitle-1 font-weight-bold">Listado de tramos</div>
        <v-spacer class="d-none d-md-block"></v-spacer>

        <div class="flex-grow-1" style="max-width: 320px">
          <v-text-field
            v-model="search"
            density="compact"
            label="Buscar tramo"
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
        :items="fareSegments"
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
              <div style="width: 24%; min-width: 0" class="text-left font-weight-bold">
                Origen
              </div>
              <div style="width: 24%; min-width: 0" class="text-left font-weight-bold">
                Destino
              </div>
              <div style="width: 12%; min-width: 0" class="text-left font-weight-bold">
                Clase
              </div>
              <div style="width: 10%; min-width: 0" class="text-left font-weight-bold">
                Precio
              </div>
              <div style="width: 15%; min-width: 0" class="text-left font-weight-bold">
                Vigencia
              </div>
              <div style="width: 5%; min-width: 0" class="text-left font-weight-bold">
                Prioridad
              </div>
              <div style="width: 10%; min-width: 0" class="text-left font-weight-bold">
                Estado
              </div>
              <div style="width: 10%; min-width: 0" class="d-flex justify-left font-weight-bold">
                Acciones
              </div>
            </v-card-text>
          </v-card>
        </template>

        <template v-slot:item="slotProps">
          <tr>
            <td colspan="100%" style="padding: 0; border: none">
              <v-card class="mb-2 mx-1 rounded-lg" elevation="1" density="comfortable" flat>
                <v-card-text class="d-flex align-center pa-2" style="width: 100%; min-width: 0">
                  <div class="d-flex align-center" style="width: 24%; min-width: 0">
                    <v-avatar class="mr-3 icono-concavo" color="grey-lighten-4">
                      <v-img
                        :src="getImageUrl(slotProps.item.originLocationImage)"
                        cover
                      ></v-img>
                    </v-avatar>
                    <div class="text-truncate">
                      <div class="font-weight-medium">
                        {{ slotProps.item.originLocationName }}
                      </div>
                      <div class="text-caption text-grey text-truncate">
                        {{ slotProps.item.originLocationCity }},
                        {{ slotProps.item.originLocationCountry }}
                      </div>
                    </div>
                    <v-tooltip activator="parent" location="bottom" max-width="350px">
                      <span style="white-space: normal; word-break: break-word">
                        Origen: {{ slotProps.item.originLocationName }}<br />
                        Orden: {{ slotProps.item.originStopOrder }}
                      </span>
                    </v-tooltip>
                  </div>

                  <div class="d-flex align-center" style="width: 24%; min-width: 0">
                    <v-avatar class="mr-3 icono-concavo" color="grey-lighten-4">
                      <v-img
                        :src="getImageUrl(slotProps.item.destinationLocationImage)"
                        cover
                      ></v-img>
                    </v-avatar>
                    <div class="text-truncate">
                      <div class="font-weight-medium">
                        {{ slotProps.item.destinationLocationName }}
                      </div>
                      <div class="text-caption text-grey text-truncate">
                        {{ slotProps.item.destinationLocationCity }},
                        {{ slotProps.item.destinationLocationCountry }}
                      </div>
                    </div>
                    <v-tooltip activator="parent" location="bottom" max-width="350px">
                      <span style="white-space: normal; word-break: break-word">
                        Destino: {{ slotProps.item.destinationLocationName }}<br />
                        Orden: {{ slotProps.item.destinationStopOrder }}
                      </span>
                    </v-tooltip>
                  </div>

                  <div style="width: 12%; min-width: 0" class="text-truncate">
                    <v-chip :text-color="paleteColors.white" :color="paleteColors.primary">
                      {{ serviceClassLabel(slotProps.item.service_class) }}
                    </v-chip>
                  </div>

                  <div style="width: 10%; min-width: 0" class="text-truncate">
                    <span>{{ formatNumber(slotProps.item.base_price) }}</span>
                    <v-tooltip activator="parent" location="bottom" max-width="350px">
                      <span style="white-space: normal; word-break: break-word">
                        Precio base: {{ formatNumber(slotProps.item.base_price) }}
                        {{ slotProps.item.currency }}
                      </span>
                    </v-tooltip>
                  </div>

                  <div style="width: 15%; min-width: 0" class="text-truncate">
                    <div>{{ slotProps.item.valid_from || "-" }}</div>
                    <div>hasta {{ slotProps.item.valid_to || "-" }}</div>
                  </div>

                  <div style="width: 5%; min-width: 0" class="text-truncate">
                    <span>{{ slotProps.item.priority }}</span>
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
                    style="width: 10%; justify-content: flex-end; flex-wrap: nowrap"
                  >
                    <v-btn
                      size="35"
                      icon
                      variant="outlined"
                      :style="{ 'border-width': '1px', 'border-style': 'solid' }"
                      :color="paleteColors.primary"
                      @click="editItem(slotProps.item)"
                      class="flex-shrink-0 mr-1"
                      title="Editar tramo"
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
                      title="Eliminar tramo"
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

  <v-dialog v-model="dialog" max-width="800px" persistent>
    <v-form ref="form" v-model="valid">
      <v-card>
        <v-toolbar :color="paleteColors.primary">
          <span class="text-subtitle-2 ml-4">{{ formTitle }}</span>
        </v-toolbar>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12" md="6">
                <v-autocomplete
                  v-model="editedItem.origin_route_stop_id"
                  :items="routeStops"
                  :no-data-text="'No hay datos disponibles'"
                  label="Origen"
                  prepend-icon="mdi-arrow-up-circle"
                  item-title="locationName"
                  item-value="id"
                  variant="underlined"
                  :rules="selectRules"
                >
                  <template v-slot:item="{ props, item }">
                    <v-list-item
                      v-bind="props"
                      :prepend-avatar="getImageUrl(item.raw.locationImage)"
                      :title="item.raw.locationName"
                    >
                      <v-list-item-subtitle>
                        Orden {{ item.raw.stop_order }} - {{ item.raw.locationCity }},
                        {{ item.raw.locationCountry }}
                      </v-list-item-subtitle>
                    </v-list-item>
                  </template>
                </v-autocomplete>
              </v-col>

              <v-col cols="12" md="6">
                <v-autocomplete
                  v-model="editedItem.destination_route_stop_id"
                  :items="destinationStops"
                  :no-data-text="'No hay datos disponibles'"
                  label="Destino"
                  prepend-icon="mdi-arrow-down-circle"
                  item-title="locationName"
                  item-value="id"
                  variant="underlined"
                  :rules="selectRules"
                >
                  <template v-slot:item="{ props, item }">
                    <v-list-item
                      v-bind="props"
                      :prepend-avatar="getImageUrl(item.raw.locationImage)"
                      :title="item.raw.locationName"
                    >
                      <v-list-item-subtitle>
                        Orden {{ item.raw.stop_order }} - {{ item.raw.locationCity }},
                        {{ item.raw.locationCountry }}
                      </v-list-item-subtitle>
                    </v-list-item>
                  </template>
                </v-autocomplete>
              </v-col>

              <v-col cols="12" md="6">
                <v-autocomplete
                  v-model="editedItem.service_class"
                  :items="serviceClassOptions"
                  :no-data-text="'No hay datos disponibles'"
                  label="Clase de servicio"
                  prepend-icon="mdi-bus-side"
                  item-title="text"
                  item-value="value"
                  variant="underlined"
                  :rules="selectRules"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="editedItem.base_price"
                  label="Precio base"
                  prepend-icon="mdi-currency-usd"
                  variant="underlined"
                  type="number"
                  min="0"
                  :rules="numberRules"
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <DatePicker
                  v-model="editedItem.valid_from"
                  label="Vigencia desde"
                  prepend-icon="mdi-calendar-start"
                  variant="underlined"
                  density="compact"
                  :min-width="140"
                  :hide-details="true"
                  color="primary"
                  :min-date="todayYmd"
                  :max-date="editedItem.valid_to || null"
                />
              </v-col>

              <v-col cols="12" md="6">
                <DatePicker
                  v-model="editedItem.valid_to"
                  label="Vigencia hasta"
                  prepend-icon="mdi-calendar-end"
                  variant="underlined"
                  density="compact"
                  :min-width="140"
                  :hide-details="true"
                  color="primary"
                  :min-date="editedItem.valid_from || todayYmd"
                />
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field
                  v-model="editedItem.priority"
                  label="Prioridad"
                  prepend-icon="mdi-numeric"
                  variant="underlined"
                  type="number"
                  min="1"
                  :rules="numberRules"
                ></v-text-field>
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
        <span class="text-subtitle-2 ml-4">Eliminar un tramo</span>
      </v-toolbar>
      <v-card-text class="mt-2 mb-2">¿Desea eliminar el tramo seleccionado?</v-card-text>
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
  name: "FareSegment",
  emits: ["close"],
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
    search: "",
    company_id: "",
    route_id: "",
    routeStops: [],
    fareSegments: [],
    editedIndex: -1,
    data: {},
    headers: [
      { title: "Origen", value: "origin_route_stop_id" },
      { title: "Destino", value: "destination_route_stop_id" },
      { title: "Clase", value: "service_class" },
      { title: "Precio", value: "base_price" },
      { title: "Vigencia", value: "valid_from" },
      { title: "Prioridad", value: "priority" },
      { title: "Estado", value: "active" },
      { title: "Acciones", value: "actions", sortable: false },
    ],
    serviceClassOptions: [
      { text: "Semi cama", value: "semi_cama" },
      { text: "Salon cama", value: "salon_cama" },
      { text: "Cama", value: "cama" },
      { text: "Ejecutivo", value: "ejecutivo" },
    ],
    editedItem: {
      id: "",
      company_id: "",
      route_id: "",
      origin_route_stop_id: "",
      destination_route_stop_id: "",
      service_class: "",
      base_price: 0,
      currency: "CLP",
      valid_from: "",
      valid_to: "",
      priority: 1,
      active: true,
    },
    originalItem: {
      id: "",
      company_id: "",
      route_id: "",
      origin_route_stop_id: "",
      destination_route_stop_id: "",
      service_class: "",
      base_price: 0,
      currency: "CLP",
      valid_from: "",
      valid_to: "",
      priority: 1,
      active: true,
    },
    defaultItem: {
      id: "",
      company_id: "",
      route_id: "",
      origin_route_stop_id: "",
      destination_route_stop_id: "",
      service_class: "",
      base_price: 0,
      currency: "CLP",
      valid_from: "",
      valid_to: "",
      priority: 1,
      active: true,
    },
    selectRules: [(v) => !!v || "Seleccionar al menos un elemento"],
    numberRules: [
      (v) => (v !== null && v !== undefined && v !== "") || "El campo es requerido",
      (v) => !Number.isNaN(Number(v)) || "Debe ser un numero valido",
      (v) => Number(v) >= 0 || "Debe ser mayor o igual a 0",
    ],
  }),
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "Agregar Tramo" : "Editar Tramo";
    },
    routeTitle() {
      return this.route?.name ? `Tramos de ${this.route.name}` : "Tramos tarifarios";
    },
    todayYmd() {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    },
    destinationStops() {
      const originStop = this.getRouteStopById(this.editedItem.origin_route_stop_id);
      if (!originStop) {
        return this.routeStops;
      }

      return this.routeStops.filter(
        (stop) => Number(stop.stop_order) > Number(originStop.stop_order)
      );
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
    "editedItem.origin_route_stop_id"() {
      if (
        this.editedItem.destination_route_stop_id &&
        !this.destinationStops.some(
          (stop) => Number(stop.id) === Number(this.editedItem.destination_route_stop_id)
        )
      ) {
        this.editedItem.destination_route_stop_id = "";
      }
    },
    "editedItem.valid_from"(newValue) {
      if (
        newValue &&
        this.editedItem.valid_to &&
        String(newValue) > String(this.editedItem.valid_to)
      ) {
        this.editedItem.valid_to = "";
      }
    },
  },
  methods: {
    getImageUrl(image) {
      const safeImage = image || "locations/default.jpg";
      return `${this.$axios.defaults.baseURL}images/${safeImage}`;
    },
    getRouteStopById(routeStopId) {
      return this.routeStops.find((stop) => Number(stop.id) === Number(routeStopId));
    },
    routeStopLabel(stop) {
      if (!stop) return "";
      return `${stop.stop_order}. ${stop.locationName || stop.address || "Sin nombre"}`;
    },
    serviceClassLabel(value) {
      const option = this.serviceClassOptions.find((item) => item.value === value);
      return option ? option.text : value || "-";
    },
    formatNumber(value) {
      const numberValue = parseFloat(value);
      if (Number.isNaN(numberValue)) {
        return "0.00";
      }
      return numberValue.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    },
    normalizeFareSegment(item = {}) {
      const originStop = this.getRouteStopById(item.origin_route_stop_id);
      const destinationStop = this.getRouteStopById(item.destination_route_stop_id);

      return {
        ...item,
        company_id: item.company_id ?? this.company_id ?? "",
        route_id: item.route_id ?? this.route_id ?? "",
        origin_route_stop_id: item.origin_route_stop_id ?? "",
        destination_route_stop_id: item.destination_route_stop_id ?? "",
        service_class: item.service_class ?? "",
        base_price: item.base_price ?? 0,
        currency: item.currency ?? "CLP",
        valid_from: item.valid_from ?? "",
        valid_to: item.valid_to ?? "",
        priority: item.priority ?? 1,
        active: item.active ?? true,
        originLocationName:
          item.originLocationName || originStop?.locationName || item.originName || "",
        originLocationCity:
          item.originLocationCity || originStop?.locationCity || item.originCity || "",
        originLocationCountry:
          item.originLocationCountry ||
          originStop?.locationCountry ||
          item.originCountry ||
          "",
        originLocationImage:
          item.originLocationImage || originStop?.locationImage || "locations/default.jpg",
        originStopOrder: item.originStopOrder ?? originStop?.stop_order ?? "",
        destinationLocationName:
          item.destinationLocationName ||
          destinationStop?.locationName ||
          item.destinationName ||
          "",
        destinationLocationCity:
          item.destinationLocationCity ||
          destinationStop?.locationCity ||
          item.destinationCity ||
          "",
        destinationLocationCountry:
          item.destinationLocationCountry ||
          destinationStop?.locationCountry ||
          item.destinationCountry ||
          "",
        destinationLocationImage:
          item.destinationLocationImage ||
          destinationStop?.locationImage ||
          "locations/default.jpg",
        destinationStopOrder: item.destinationStopOrder ?? destinationStop?.stop_order ?? "",
      };
    },
    async loadRouteStops() {
      if (!this.route_id) {
        this.routeStops = [];
        return;
      }

      const result = await handleRequest({
        endpoint: "route-stop-by-route",
        method: "POST",
        data: { route_id: this.route_id },
      });

      if (result.success) {
        const rawStops = Array.isArray(result.data?.routeStops)
          ? result.data.routeStops
          : Object.values(result.data?.routeStops || {});
        this.routeStops = rawStops.map((item) => ({
          ...item,
          active: item.active ?? true,
        }));
      } else {
        this.routeStops = [];
      }
    },
    async loadFareSegments() {
      if (!this.route_id) {
        this.fareSegments = [];
        return;
      }

      const result = await handleRequest({
        endpoint: "fare-segment-by-route",
        method: "POST",
        data: { route_id: this.route_id },
      });

      if (result.success) {
        const rawSegments = Array.isArray(result.data?.fareSegments)
          ? result.data.fareSegments
          : Object.values(result.data?.fareSegments || {});
        this.fareSegments = rawSegments
          .map((item) => this.normalizeFareSegment(item))
          .sort((a, b) => Number(a.priority) - Number(b.priority));
      } else {
        this.fareSegments = [];
      }
    },
    async initialize() {
      if (!this.route_id) {
        this.routeStops = [];
        this.fareSegments = [];
        return;
      }

      this.loading = true;
      try {
        await this.loadRouteStops();
        await this.loadFareSegments();
      } catch (error) {
        this.showAlert("error", "Ocurrió un error inesperado al procesar la solicitud.", 3000);
      } finally {
        this.loading = false;
      }
    },
    async showAdd() {
      this.editedIndex = -1;
      this.editedItem = Object.assign({}, this.defaultItem, {
        company_id: this.company_id,
        route_id: this.route_id,
        currency: "CLP",
        active: true,
        priority: 1,
      });
      this.originalItem = Object.assign({}, this.defaultItem);

      try {
        if (!this.routeStops.length) {
          await this.loadRouteStops();
        }
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
    validateSegment() {
      const originStop = this.getRouteStopById(this.editedItem.origin_route_stop_id);
      const destinationStop = this.getRouteStopById(this.editedItem.destination_route_stop_id);

      if (!originStop || !destinationStop) {
        this.showAlert("warning", "Debe seleccionar un origen y un destino validos.", 3000);
        return false;
      }

      if (Number(originStop.id) === Number(destinationStop.id)) {
        this.showAlert("warning", "El origen y el destino no pueden ser iguales.", 3000);
        return false;
      }

      if (Number(originStop.stop_order) >= Number(destinationStop.stop_order)) {
        this.showAlert(
          "warning",
          "El origen debe estar antes que el destino dentro de la ruta.",
          3000
        );
        return false;
      }

      if (this.editedItem.valid_from && this.editedItem.valid_to) {
        if (this.editedItem.valid_from > this.editedItem.valid_to) {
          this.showAlert(
            "warning",
            "La vigencia desde no puede ser mayor que la vigencia hasta.",
            3000
          );
          return false;
        }
      }

      if (this.editedItem.valid_from && this.editedItem.valid_from < this.todayYmd) {
        this.showAlert(
          "warning",
          "La vigencia desde no puede ser anterior al día actual.",
          3000
        );
        return false;
      }

      return true;
    },
    async save() {
      this.loading = true;
      try {
        if (!this.validateSegment()) {
          this.loading = false;
          return;
        }

        const payload = {
          company_id: this.company_id,
          route_id: this.route_id,
          origin_route_stop_id: this.editedItem.origin_route_stop_id,
          destination_route_stop_id: this.editedItem.destination_route_stop_id,
          service_class: this.editedItem.service_class,
          base_price: Number(this.editedItem.base_price),
          currency: this.editedItem.currency || "CLP",
          valid_from: this.editedItem.valid_from,
          valid_to: this.editedItem.valid_to,
          priority: Number(this.editedItem.priority) || 1,
          active: this.editedItem.active ?? true,
        };

        if (this.editedIndex !== -1) {
          payload.id = this.editedItem.id;
        }

        const result = await handleRequest({
          endpoint: "fare-segment",
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
      this.originalItem = Object.assign({}, this.normalizeFareSegment(item));
      this.editedItem = Object.assign({}, this.normalizeFareSegment(item));
      try {
        if (!this.routeStops.length) {
          await this.loadRouteStops();
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
          endpoint: "fare-segment-destroy",
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
        sb_type === "success" ? "Exito" : sb_type === "warning" ? "Advertencia" : "Error";
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
