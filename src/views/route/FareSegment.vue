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
    style="background-color: #f9f9f9"
  >
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
              <div
                style="width: 10%; min-width: 0"
                class="d-flex justify-left font-weight-bold"
              >
                Acciones
              </div>
            </v-card-text>
          </v-card>
        </template>

        <template v-slot:item="slotProps">
          <tr>
            <td colspan="100%" style="padding: 0; border: none">
              <v-card
                class="mb-2 mx-1 rounded-lg"
                elevation="1"
                density="comfortable"
                flat
              >
                <v-card-text
                  class="d-flex align-center pa-2"
                  style="width: 100%; min-width: 0"
                >
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
                      :color="
                        slotProps.item.active
                          ? paleteColors.active
                          : paleteColors.inactive
                      "
                      :text-color="paleteColors.white"
                    >
                      {{ slotProps.item.active ? "Activo" : "Inactivo" }}
                    </v-chip>
                  </div>

                  <div
                    class="d-flex gap-1"
                    style="width: 10%; justify-content: flex-end; flex-wrap: nowrap"
                  >
                    <v-btn
                      v-if="
                        slotProps.item.fare_segment_ticket_types &&
                        slotProps.item.fare_segment_ticket_types.length
                      "
                      size="35"
                      icon
                      variant="outlined"
                      :style="{ 'border-width': '1px', 'border-style': 'solid' }"
                      :color="paleteColors.primary"
                      @click="toggleFareSegmentExpanded(slotProps.item)"
                      class="flex-shrink-0 mr-1"
                      title="Ver tipos de pasaje"
                    >
                      <v-icon size="20">
                        {{
                          isFareSegmentExpanded(slotProps.item)
                            ? "mdi-chevron-up"
                            : "mdi-chevron-down"
                        }}
                      </v-icon>
                    </v-btn>

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

                <v-expand-transition>
                  <div
                    v-if="
                      isFareSegmentExpanded(slotProps.item) &&
                      slotProps.item.fare_segment_ticket_types &&
                      slotProps.item.fare_segment_ticket_types.length
                    "
                    class="px-4 pb-4"
                  >
                    <v-card
                      variant="outlined"
                      class="fare-segment-expanded-card"
                      elevation="0"
                    >
                      <div class="fare-segment-expanded-header">
                        <div>Tipo de pasaje</div>
                        <div>Precio</div>
                        <div>Estado</div>
                      </div>

                      <div
                        v-for="(ticketType, ticketIndex) in slotProps.item
                          .fare_segment_ticket_types"
                        :key="fareSegmentTicketTypeKey(ticketType, ticketIndex)"
                        class="fare-segment-expanded-row"
                      >
                        <div class="text-truncate font-weight-medium">
                          {{ ticketType.ticketTypeName }}
                        </div>
                        <div>{{ formatNumber(ticketType.base_price) }}</div>
                        <div>
                          <v-chip
                            size="small"
                            :color="
                              ticketType.active
                                ? paleteColors.active
                                : paleteColors.inactive
                            "
                            :text-color="paleteColors.white"
                          >
                            {{ ticketType.active ? "Activo" : "Inactivo" }}
                          </v-chip>
                        </div>
                      </div>
                    </v-card>
                  </div>
                </v-expand-transition>
              </v-card>
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-card>
  </v-container>

  <v-dialog v-model="dialog" max-width="1200px" persistent>
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
                  :items="originStops"
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
                  density="compact"
                  min="1"
                  :rules="numberRules"
                ></v-text-field>
              </v-col>

              <v-col cols="12" class="pt-0">
                <div class="fare-segment-active-block">
                  <div class="fare-segment-active-row">
                    <div class="fare-segment-active-switch">
                      <v-switch
                        v-model="editedItem.active"
                        :true-value="true"
                        :false-value="false"
                        :color="editedItem.active ? paleteColors.green : paleteColors.grey"
                        :base-color="
                          editedItem.active ? paleteColors.green : paleteColors.grey
                        "
                        hide-details
                        inset
                        density="compact"
                        class="fare-segment-main-switch"
                      />
                    </div>
                    <div class="fare-segment-active-copy">
                      <div class="text-body-1 font-weight-medium">
                        {{ editedItem.active ? "Tramo activo" : "Tramo inactivo" }}
                      </div>
                    </div>
                  </div>
                  <div class="fare-segment-active-helper text-caption text-medium-emphasis">
                    Si está inactivo, no estará disponible para la venta.
                  </div>
                </div>
              </v-col>

              <v-col cols="12" class="pt-0">
                <v-divider class="my-2"></v-divider>
              </v-col>

              <v-col cols="12">
                <div class="d-flex align-center mb-2">
                  <v-icon color="primary" size="18" class="mr-2"
                    >mdi-ticket-confirmation-outline</v-icon
                  >
                  <div>
                    <div class="text-subtitle-1 font-weight-bold">Tipos de pasajeros</div>
                    <div class="text-caption text-medium-emphasis">
                      Define los tipos de pasajeros disponibles para este tramo.
                    </div>
                  </div>
                </div>

                <v-card
                  variant="outlined"
                  class="fare-segment-ticket-types-panel rounded-lg"
                  elevation="0"
                >
                  <div class="fare-segment-ticket-types-header">
                    <div class="fare-segment-col-name">Tipo de pasajero</div>
                    <div class="fare-segment-col-price">Precio (Bs.)</div>
                    <div class="fare-segment-col-status">Habilitado</div>
                  </div>

                  <div v-if="editedItem.fareSegmentTicketTypes.length">
                    <div
                      v-for="(ticketType, index) in editedItem.fareSegmentTicketTypes"
                      :key="fareSegmentTicketTypeKey(ticketType, index)"
                      class="fare-segment-ticket-types-row"
                    >
                      <div class="fare-segment-col-name">
                        <div class="font-weight-medium text-truncate">
                          {{ ticketType.ticketTypeName }}
                        </div>
                      </div>

                      <div class="fare-segment-col-price">
                        <v-text-field
                          v-model.number="ticketType.base_price"
                          type="number"
                          min="0"
                          step="1"
                          variant="underlined"
                          density="compact"
                          hide-details
                        ></v-text-field>
                      </div>

                      <div class="fare-segment-col-status">
                        <div class="fare-segment-status-inline">
                          <v-switch
                            v-model="ticketType.active"
                            :true-value="true"
                            :false-value="false"
                            :color="
                              ticketType.active ? paleteColors.success : paleteColors.grey
                            "
                            :base-color="
                              ticketType.active ? paleteColors.success : paleteColors.grey
                            "
                            hide-details
                            inset
                            density="compact"
                            class="fare-segment-row-switch"
                          />
                          <span
                            class="fare-segment-status-label text-body-2"
                            :style="{
                              color: ticketType.active
                                ? paleteColors.success
                                : paleteColors.grey,
                            }"
                          >
                            {{ ticketType.active ? "Sí" : "No" }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div v-else class="pa-4 text-medium-emphasis">
                    No hay tipos de pasajes disponibles.
                  </div>
                </v-card>

                <div class="mt-3">
                  <v-btn
                    variant="outlined"
                    :color="paleteColors.primary"
                    prepend-icon="mdi-plus"
                    @click="addFareSegmentTicketType"
                    :disabled="!hasMoreFareSegmentTicketTypes"
                  >
                    Agregar tipo de pasaje
                  </v-btn>
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
        <v-btn :color="paleteColors.gris" variant="flat" @click="closeDelete"
          >Cancelar</v-btn
        >
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
    ticketTypes: [],
    fareSegments: [],
    expandedFareSegmentIds: [],
    editedIndex: -1,
    data: {},
    headers: [
      { title: "Origen", value: "origin_route_stop_id" },
      { title: "Destino", value: "destination_route_stop_id" },
      { title: "Precio", value: "base_price" },
      { title: "Vigencia", value: "valid_from" },
      { title: "Prioridad", value: "priority" },
      { title: "Estado", value: "active" },
      { title: "Acciones", value: "actions", sortable: false },
    ],
    editedItem: {
      id: "",
      company_id: "",
      route_id: "",
      origin_route_stop_id: "",
      destination_route_stop_id: "",
      // service_class: null,
      base_price: 0,
      currency: "CLP",
      valid_from: "",
      valid_to: "",
      priority: 1,
      active: true,
      fareSegmentTicketTypes: [],
    },
    originalItem: {
      id: "",
      company_id: "",
      route_id: "",
      origin_route_stop_id: "",
      destination_route_stop_id: "",
      // service_class: null,
      base_price: 0,
      currency: "CLP",
      valid_from: "",
      valid_to: "",
      priority: 1,
      active: true,
      fareSegmentTicketTypes: [],
    },
    defaultItem: {
      id: "",
      company_id: "",
      route_id: "",
      origin_route_stop_id: "",
      destination_route_stop_id: "",
      // service_class: null,
      base_price: 0,
      currency: "CLP",
      valid_from: "",
      valid_to: "",
      priority: 1,
      active: true,
      fareSegmentTicketTypes: [],
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
      return this.routeStops.filter(
        (stop) =>
          this.canBeDestinationStop(stop) &&
          Number(stop.id) !== Number(this.editedItem.origin_route_stop_id)
      );
    },
    originStops() {
      return this.routeStops.filter(
        (stop) =>
          this.canBeOriginStop(stop) &&
          Number(stop.id) !== Number(this.editedItem.destination_route_stop_id)
      );
    },
    hasMoreFareSegmentTicketTypes() {
      return this.ticketTypes.some(
        (ticketType) =>
          !this.editedItem.fareSegmentTicketTypes.some(
            (row) => Number(row.ticket_type_id) === Number(ticketType.id)
          )
      );
    },
  },
  watch: {
    route: {
      deep: true,
      immediate: true,
      handler(newRoute) {
        this.company_id =
          newRoute?.company_id || LocalStorageService.getItem("business_id");
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

      this.validateFareSegmentCombination();
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
    "editedItem.destination_route_stop_id"() {
      this.validateFareSegmentCombination();
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
    canBeOriginStop(stop) {
      return (
        Boolean(stop?.allows_boarding) ||
        stop?.allows_boarding === 1 ||
        stop?.allows_boarding === "1"
      );
    },
    canBeDestinationStop(stop) {
      return (
        Boolean(stop?.allows_alighting) ||
        stop?.allows_alighting === 1 ||
        stop?.allows_alighting === "1"
      );
    },
    hasDuplicateFareSegment(originRouteStopId, destinationRouteStopId) {
      if (!originRouteStopId || !destinationRouteStopId) {
        return false;
      }

      const currentSegmentId = Number(this.editedItem?.id || 0);
      return this.fareSegments.some((segment) => {
        if (Number(segment.id) === currentSegmentId) {
          return false;
        }

        return (
          Number(segment.origin_route_stop_id) === Number(originRouteStopId) &&
          Number(segment.destination_route_stop_id) === Number(destinationRouteStopId)
        );
      });
    },
    validateFareSegmentCombination() {
      const originRouteStopId = this.editedItem.origin_route_stop_id;
      const destinationRouteStopId = this.editedItem.destination_route_stop_id;

      if (!originRouteStopId || !destinationRouteStopId) {
        return true;
      }

      if (this.hasDuplicateFareSegment(originRouteStopId, destinationRouteStopId)) {
        this.showAlert(
          "warning",
          "Ya existe un tramo con ese origen y destino. Cambia la combinación antes de continuar.",
          3500
        );
        this.editedItem.destination_route_stop_id = "";
        return false;
      }

      return true;
    },
    normalizeRouteStop(stop = {}) {
      return {
        ...stop,
        id: stop.id,
        locationId: stop.locationId ?? stop.location_id ?? "",
        location_id: stop.location_id ?? stop.locationId ?? "",
        locationName: stop.locationName ?? stop.location_name ?? "",
        locationCity: stop.locationCity ?? stop.location_city ?? "",
        locationCountry: stop.locationCountry ?? stop.location_country ?? "",
        locationImage:
          stop.locationImage ?? stop.location_image ?? "locations/default.jpg",
        stopOrder: stop.stopOrder ?? stop.stop_order ?? "",
        stop_order: stop.stop_order ?? stop.stopOrder ?? "",
        allows_boarding:
          stop.allows_boarding ?? stop.allowsBoarding ?? stop.subida ?? false,
        allows_alighting:
          stop.allows_alighting ?? stop.allowsAlighting ?? stop.bajada ?? false,
        active: stop.active ?? true,
      };
    },
    getRouteStopsFromRoute(route = this.route) {
      const routeStops = Array.isArray(route?.routeStops)
        ? route.routeStops
        : Array.isArray(route?.route_stops)
        ? route.route_stops
        : [];

      return routeStops.map((stop) => this.normalizeRouteStop(stop));
    },
    syncRouteStopsFromRoute(route = this.route) {
      const normalizedStops = this.getRouteStopsFromRoute(route);
      if (!normalizedStops.length) {
        return false;
      }

      this.routeStops = normalizedStops;
      return true;
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
        // service_class: item.service_class ?? null,
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
          item.originLocationImage ||
          originStop?.locationImage ||
          "locations/default.jpg",
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
        destinationStopOrder:
          item.destinationStopOrder ?? destinationStop?.stop_order ?? "",
        fare_segment_ticket_types: this.normalizeFareSegmentTicketTypes(
          item.fare_segment_ticket_types ?? item.fareSegmentTicketTypes ?? []
        ),
        fareSegmentTicketTypes: this.buildFareSegmentTicketTypeRows(
          item.fareSegmentTicketTypes ?? item.fare_segment_ticket_types ?? []
        ),
      };
    },
    normalizeFareSegmentTicketTypes(relations = []) {
      return (Array.isArray(relations) ? relations : []).map((relation) => ({
        id: relation.id ?? "",
        fare_segment_id: relation.fare_segment_id ?? relation.fareSegmentId ?? "",
        ticket_type_id: relation.ticket_type_id ?? relation.ticketTypeId ?? "",
        base_price: relation.base_price ?? relation.basePrice ?? 0,
        active: relation.active ?? true,
        ticketTypeName: relation.ticketTypeName ?? relation.ticketType?.name ?? "",
        ticketTypeDescription:
          relation.ticketTypeDescription ?? relation.ticketType?.description ?? "",
        ticketTypeActive:
          relation.ticketTypeActive ?? relation.ticketType?.active ?? true,
      }));
    },
    normalizeTicketType(ticketType = {}) {
      return {
        ...ticketType,
        id: ticketType.id,
        ticketTypeName:
          ticketType.ticketTypeName ??
          ticketType.ticket_type_name ??
          ticketType.name ??
          "",
        active: ticketType.active ?? true,
      };
    },
    getTicketTypesFromResponse(data = {}) {
      if (Array.isArray(data)) {
        return data;
      }

      if (Array.isArray(data?.tickettypes)) {
        return data.tickettypes;
      }

      if (Array.isArray(data?.ticketTypes)) {
        return data.ticketTypes;
      }

      if (Array.isArray(data?.ticket_types)) {
        return data.ticket_types;
      }

      return Object.values(
        data?.tickettypes || data?.ticketTypes || data?.ticket_types || {}
      );
    },
    fareSegmentTicketTypeKey(ticketType, index) {
      return ticketType?.id
        ? `ticket-type-${ticketType.id}`
        : `ticket-type-${ticketType?.ticket_type_id ?? index}`;
    },
    isFareSegmentExpanded(item) {
      return this.expandedFareSegmentIds.includes(Number(item.id));
    },
    toggleFareSegmentExpanded(item) {
      const itemId = Number(item.id);
      if (this.isFareSegmentExpanded(item)) {
        this.expandedFareSegmentIds = [];
        return;
      }

      this.expandedFareSegmentIds = [itemId];
    },
    async loadTicketTypes(force = false) {
      if (!force && this.ticketTypes.length) {
        return;
      }

      const result = await handleRequest({
        endpoint: "get-ticket-type",
        method: "GET",
      });

      if (result.success) {
        const rawTicketTypes = this.getTicketTypesFromResponse(result.data);
        this.ticketTypes = rawTicketTypes.map((ticketType) =>
          this.normalizeTicketType(ticketType)
        );
      } else {
        this.ticketTypes = [];
      }
    },
    buildFareSegmentTicketTypeRows(relations = [], definitions = this.ticketTypes) {
      const relationsByTicketTypeId = new Map(
        (Array.isArray(relations) ? relations : []).map((relation) => [
          Number(relation.ticket_type_id),
          relation,
        ])
      );

      return (Array.isArray(definitions) ? definitions : []).map((ticketType) => {
        const relation = relationsByTicketTypeId.get(Number(ticketType.id));
        return {
          id: relation?.id ?? "",
          ticket_type_id: ticketType.id,
          ticketTypeName: ticketType.ticketTypeName || ticketType.name || "",
          base_price:
            relation?.base_price !== undefined && relation?.base_price !== null
              ? Number(relation.base_price)
              : 0,
          active: relation?.active ?? true,
        };
      });
    },
    buildFareSegmentTicketTypesPayload() {
      return (Array.isArray(this.editedItem.fareSegmentTicketTypes)
        ? this.editedItem.fareSegmentTicketTypes
        : []
      ).map((ticketType) => {
        const payload = {
          ticket_type_id: ticketType.ticket_type_id,
          base_price: Number(ticketType.base_price ?? 0),
          active: ticketType.active ?? true,
        };

        if (ticketType.id) {
          payload.id = ticketType.id;
        }

        return payload;
      });
    },
    addFareSegmentTicketType() {
      const nextTicketType = this.ticketTypes.find(
        (ticketType) =>
          !this.editedItem.fareSegmentTicketTypes.some(
            (row) => Number(row.ticket_type_id) === Number(ticketType.id)
          )
      );

      if (!nextTicketType) {
        return;
      }

      this.editedItem.fareSegmentTicketTypes.push({
        id: "",
        ticket_type_id: nextTicketType.id,
        ticketTypeName: nextTicketType.ticketTypeName || nextTicketType.name || "",
        base_price: 0,
        active: true,
      });
    },
    async ensureCatalogsLoaded() {
      if (!this.ticketTypes.length) {
        await this.loadTicketTypes(true);
      }

      if (!this.routeStops.length) {
        await this.loadRouteStops();
      }
    },
    async loadRouteStops() {
      if (!this.route_id) {
        this.routeStops = [];
        return;
      }

      if (this.syncRouteStopsFromRoute()) {
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
        this.routeStops = rawStops.map((item) => this.normalizeRouteStop(item));
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
        this.ticketTypes = [];
        return;
      }

      this.loading = true;
      try {
        await this.loadTicketTypes();
        await this.loadRouteStops();
        await this.loadFareSegments();
      } catch (error) {
        this.showAlert(
          "error",
          "Ocurrió un error inesperado al procesar la solicitud.",
          3000
        );
      } finally {
        this.loading = false;
      }
    },
    async showAdd() {
      try {
        await this.loadTicketTypes(true);
        await this.ensureCatalogsLoaded();
      } catch (error) {
        this.showAlert(
          "error",
          "Ocurrió un error inesperado al procesar la solicitud.",
          3000
        );
        return;
      }

      this.editedIndex = -1;
      this.editedItem = Object.assign({}, this.defaultItem, {
        company_id: this.company_id,
        route_id: this.route_id,
        currency: "CLP",
        active: true,
        priority: 1,
        fareSegmentTicketTypes: this.buildFareSegmentTicketTypeRows(),
      });
      this.originalItem = Object.assign({}, this.defaultItem);
      this.dialog = true;
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
      const destinationStop = this.getRouteStopById(
        this.editedItem.destination_route_stop_id
      );

      if (!originStop || !destinationStop) {
        this.showAlert(
          "warning",
          "Debe seleccionar un origen y un destino validos.",
          3000
        );
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

      if (
        !this.validateFareSegmentCombination()
      ) {
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

      if (
        this.editedIndex === -1 &&
        this.editedItem.valid_from &&
        this.editedItem.valid_from < this.todayYmd
      ) {
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
          base_price: Number(this.editedItem.base_price),
          currency: this.editedItem.currency || "CLP",
          valid_from: this.editedItem.valid_from,
          valid_to: this.editedItem.valid_to,
          priority: Number(this.editedItem.priority) || 1,
          active: this.editedItem.active ?? true,
          service_class: null,
          fareSegmentTicketTypes: this.buildFareSegmentTicketTypesPayload(),
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
        this.showAlert(
          "error",
          "Ocurrió un error inesperado al procesar la solicitud.",
          3000
        );
      } finally {
        this.loading = false;
        this.close();
      }
    },
    async editItem(item) {
      try {
        await this.loadTicketTypes(true);
        await this.ensureCatalogsLoaded();
      } catch (error) {
        this.showAlert(
          "error",
          "Ocurrió un error inesperado al procesar la solicitud.",
          3000
        );
        return;
      }

      this.editedIndex = 1;
      this.originalItem = Object.assign({}, this.normalizeFareSegment(item));
      this.editedItem = Object.assign({}, this.normalizeFareSegment(item));
      try {
        this.dialog = true;
      } catch (error) {
        this.showAlert(
          "error",
          "Ocurrió un error inesperado al procesar la solicitud.",
          3000
        );
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

.fare-segment-active-block {
  padding: 2px 0 8px;
}

.fare-segment-active-row {
  display: grid;
  grid-template-columns: 60px 1fr;
  align-items: center;
  column-gap: 4px;
  width: 100%;
}

.fare-segment-active-switch {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.fare-segment-active-copy {
  text-align: left;
}

.fare-segment-active-copy .text-caption {
  display: none;
}

.fare-segment-active-helper {
  margin-top: 2px;
  margin-left: 0;
  padding-left: 0;
  line-height: 1.25;
}

.fare-segment-main-switch {
  margin: 0;
}

.fare-segment-main-switch :deep(.v-selection-control) {
  min-height: 0;
  min-width: 0;
}

.fare-segment-ticket-types-section {
  padding-top: 4px;
}

.fare-segment-expanded-card {
  border-color: #d9e1ef;
  background: #fafcff;
}

.fare-segment-expanded-header,
.fare-segment-expanded-row {
  display: grid;
  grid-template-columns: 1.2fr 0.7fr 0.7fr;
  gap: 12px;
  padding: 10px 14px;
  align-items: center;
}

.fare-segment-expanded-header {
  font-weight: 700;
  font-size: 14px;
  background: #f4f7fc;
  border-bottom: 1px solid #d9e1ef;
}

.fare-segment-expanded-row {
  border-bottom: 1px solid #e5eaf2;
}

.fare-segment-expanded-row:last-child {
  border-bottom: none;
}

.fare-segment-ticket-types-panel {
  border-color: #d9e1ef;
  background: #ffffff;
  overflow: hidden;
}

.fare-segment-ticket-types-header {
  display: grid;
  grid-template-columns: 1.6fr 0.9fr 0.8fr;
  gap: 10px;
  padding: 6px 14px;
  background: linear-gradient(180deg, #f7f9fc 0%, #eef3fb 100%);
  border-bottom: 1px solid #d9e1ef;
  font-weight: 700;
  font-size: 13.5px;
  color: #1f2a44;
}

.fare-segment-ticket-types-row {
  display: grid;
  grid-template-columns: 1.6fr 0.9fr 0.8fr;
  gap: 10px;
  align-items: center;
  padding: 6px 14px;
  border-bottom: 1px solid #e5eaf2;
}

.fare-segment-ticket-types-row:last-child {
  border-bottom: none;
}

.fare-segment-col-name,
.fare-segment-col-price,
.fare-segment-col-status {
  min-width: 0;
}

.fare-segment-col-price {
  max-width: 180px;
}

.fare-segment-status-inline {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.fare-segment-status-label {
  white-space: nowrap;
  line-height: 1;
}

.fare-segment-row-switch :deep(.v-selection-control) {
  min-height: 0;
  min-width: 0;
}

.fare-segment-row-switch :deep(.v-switch__track) {
  transform: scale(0.65);
  transform-origin: left center;
}

.fare-segment-row-switch :deep(.v-switch__thumb) {
  transform: scale(0.65);
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
