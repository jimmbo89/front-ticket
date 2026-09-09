<template>

  <div class="incidents-page">

  <v-snackbar

    class="busgo-snackbar"

    location="right top"

    :timeout="sb_timeout"

    :color="sb_type"

    elevation="10"

    v-model="snackbar"

  >

    <div class="snackbar-content">
      <v-icon :icon="sb_icon" size="22" />
      <div>
        <div class="snackbar-title">{{ sb_title }}</div>
        <div class="snackbar-message">{{ sb_message }}</div>
      </div>
    </div>

  </v-snackbar>

  <header class="page-header">
    <div class="page-heading">
      <div class="page-icon"><v-icon size="21">mdi-alert-outline</v-icon></div>
      <div>
        <h1 class="page-title">Incidentes</h1>
        <p class="page-subtitle">Consulta y supervisa eventos operacionales de la flota</p>
      </div>
    </div>
  </header>

  <v-container fluid class="page-content">

    <div class="incidents-content">

      <v-progress-linear
        v-if="loading"
        indeterminate
        :color="paleteColors.primary"
        class="incidents-loading-bar"
      />

      <v-row class="summary-row">
        <v-col cols="12" sm="4">
          <div class="summary-card">
            <div class="summary-icon summary-icon--blue"><v-icon size="19">mdi-alert-circle-outline</v-icon></div>
            <div><div class="summary-value">{{ incidents.length }}</div><div class="summary-label">Incidentes registrados</div></div>
          </div>
        </v-col>
        <v-col cols="12" sm="4">
          <div class="summary-card">
            <div class="summary-icon summary-icon--amber"><v-icon size="19">mdi-clock-alert-outline</v-icon></div>
            <div><div class="summary-value">{{ delayIncidentCount }}</div><div class="summary-label">Eventos de retraso</div></div>
          </div>
        </v-col>
        <v-col cols="12" sm="4">
          <div class="summary-card">
            <div class="summary-icon summary-icon--green"><v-icon size="19">mdi-qrcode-scan</v-icon></div>
            <div><div class="summary-value">{{ scanIncidentCount }}</div><div class="summary-label">Eventos de escaneo</div></div>
          </div>
        </v-col>
      </v-row>

      <div class="incident-toolbar">

        <div class="incidents-toolbar-label">
          <v-icon size="18">mdi-tune-variant</v-icon>
          <div>
            <strong>Filtros de incidentes</strong>
            <span>Selecciona el período y el alcance de la consulta</span>
          </div>
        </div>

        <ReportDateRangeFilter

          v-model:start-date="editedItem.startDate"

          v-model:end-date="editedItem.endDate"

        />

        <v-select

          v-if="mostrarFila"

          v-model="type"

          :items="options"

          item-title="title"

          item-value="value"

          density="compact"

          variant="outlined"

          prepend-inner-icon="mdi-filter"

          placeholder="Tipo"

          hide-details

          class="incident-filter"

          :menu-props="{ contentClass: 'incidents-select-menu' }"

        >

          <template #item="{ props, item }">

            <v-list-item v-bind="props">

              <template #prepend>

                <v-icon :icon="item.raw.icon" />

              </template>

            </v-list-item>

          </template>

        </v-select>

        <v-autocomplete

          v-if="type === 'Sucursal' && mostrarFila"

          v-model="branch_id"

          :items="branches"

          :no-data-text="'No hay datos disponibles'"

          item-title="name"

          item-value="id"

          density="compact"

          variant="outlined"

          prepend-inner-icon="mdi-store"

          placeholder="Sucursal"

          hide-details

          class="incident-filter"

          :menu-props="{ contentClass: 'incidents-select-menu' }"

          :rules="selectRules"

        >

          <template #item="{ props, item }">

            <v-list-item

              v-bind="props"

              :prepend-avatar="`${this.$axios.defaults.baseURL}images/${item.raw.image}`"

            />

          </template>

        </v-autocomplete>

        <v-btn

          variant="flat"

          :color="paleteColors.primary"

          prepend-icon="mdi-magnify"

          class="incidents-query-button"

          @click="getIncidents"

          :disabled="type === 'Sucursal' && !branch_id"

        >

          Consultar

        </v-btn>

      </div>

      <v-card class="table-panel" elevation="0">
        <div class="table-toolbar">
          <div>
            <div class="section-title">Listado de incidentes</div>
            <div class="section-subtitle">{{ registeredCountText }}</div>
          </div>

          <v-text-field
            v-model="search"
            density="compact"
            placeholder="Buscar incidencia..."
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            hide-details
            clearable
            class="search-field"
          />
        </div>

        <v-divider />

      <v-data-table

        v-model:sort-by="tableSortBy"

        :headers="headers"

        :items="incidents"

        :search="search"

        v-model:expanded="expandedItems"

        item-value="id"

        :items-per-page-text="'Elementos por página'"

        :items-per-page-options="[5, 10, 15, 25]"

        no-data-text="No hay datos disponibles"

        :loading="loading"

        loading-text="Cargando datos..."

        class="incidents-table"

      >

        <template #loading><v-skeleton-loader type="table-row@5" /></template>

        <template #unused-top>

          <div class="busgo-table-head">

            <div

              class="incident-col-branch incident-sortable"

              @click="toggleIncidentSort('nameBranch')"

            >

              Sucursal

              <v-icon size="16" class="ml-1">{{ incidentSortIcon('nameBranch') }}</v-icon>

            </div>

            <div

              class="incident-col-worker incident-sortable"

              @click="toggleIncidentSort('workerName')"

            >

              Trabajador

              <v-icon size="16" class="ml-1">{{ incidentSortIcon('workerName') }}</v-icon>

            </div>

            <div

              class="incident-col-title incident-sortable"

              @click="toggleIncidentSort('title')"

            >

              Título

              <v-icon size="16" class="ml-1">{{ incidentSortIcon('title') }}</v-icon>

            </div>

            <div

              class="incident-col-date incident-sortable"

              @click="toggleIncidentSort('date')"

            >

              Fecha

              <v-icon size="16" class="ml-1">{{ incidentSortIcon('date') }}</v-icon>

            </div>

            <div class="incident-col-actions"></div>

          </div>

        </template>

        <template #unused-item="slotProps">

          <tr>

            <td class="pa-0 border-0">

              <div class="busgo-row">

                <div class="incident-col-branch busgo-name-cell">

                  <v-avatar

                    size="36"

                    rounded="lg"

                    color="grey-lighten-4"

                    class="busgo-avatar"

                  >

                    <v-img

                      :src="

                        slotProps.item.imageBranch

                          ? `${this.$axios.defaults.baseURL}images/${slotProps.item.imageBranch}`

                          : ''

                      "

                      cover

                    />

                  </v-avatar>

                  <div class="busgo-name">

                    {{ slotProps.item.nameBranch || slotProps.item.branchName }}

                  </div>

                </div>

                <div class="incident-col-worker busgo-name-cell">

                  <v-avatar

                    size="36"

                    rounded="lg"

                    color="grey-lighten-4"

                    class="busgo-avatar"

                  >

                    <v-img

                      :src="`${this.$axios.defaults.baseURL}images/${slotProps.item.image}`"

                      cover

                    />

                  </v-avatar>

                  <div class="busgo-name">

                    {{ slotProps.item.workerName }}

                  </div>

                </div>

                <div class="incident-col-title busgo-meta">

                  <v-icon

                    v-if="slotProps.item.title.includes('Retraso')"

                    color="warning"

                    size="18"

                  >

                    mdi-clock-alert

                  </v-icon>

                  <v-icon

                    v-else-if="slotProps.item.title.includes('Escaneo')"

                    color="success"

                    size="18"

                  >

                    mdi-qrcode-scan

                  </v-icon>

                  <v-icon

                    v-else-if="slotProps.item.title.includes('Reimpresión')"

                    color="info"

                    size="18"

                  >

                    mdi-printer

                  </v-icon>

                  <span class="text-truncate">

                    {{ slotProps.item.title }}

                  </span>

                </div>

                <div class="incident-col-date busgo-meta">

                  <v-icon size="16" color="primary">mdi-calendar</v-icon>

                  <span class="incident-date-text">

                    {{ slotProps.item.date }}

                  </span>

                </div>

                <div class="incident-col-actions busgo-actions">

                  <v-btn

                    size="small"

                    variant="tonal"

                    :color="getDetailsButtonColor(slotProps.item)"

                    @click.stop="toggleExpand(slotProps.item)"

                  >

                    <v-icon start size="18">

                      {{ isExpanded(slotProps.item) ? "mdi-chevron-up" : "mdi-chevron-down" }}

                    </v-icon>

                    <span class="text-caption">

                      {{ isExpanded(slotProps.item) ? "Ocultar" : "Ver" }}

                    </span>

                  </v-btn>

                </div>

              </div>

            </td>

          </tr>

        </template>

        <template #[`item.nameBranch`]="{ item }">
          <div class="branch-cell">
            <div class="table-avatar">
              <v-img
                v-if="item.imageBranch"
                :src="`${this.$axios.defaults.baseURL}images/${item.imageBranch}`"
                width="36"
                height="36"
                cover
              >
                <template #error><div class="avatar-fallback"><v-icon size="17">mdi-store-outline</v-icon></div></template>
              </v-img>
              <v-icon v-else size="17">mdi-store-outline</v-icon>
            </div>
            <span :title="item.nameBranch || item.branchName">
              {{ item.nameBranch || item.branchName || "Sin sucursal" }}
            </span>
          </div>
        </template>

        <template #[`item.workerName`]="{ item }">
          <div class="worker-cell">
            <div class="table-avatar">
              <v-img
                v-if="item.image"
                :src="`${this.$axios.defaults.baseURL}images/${item.image}`"
                width="36"
                height="36"
                cover
              >
                <template #error><div class="avatar-fallback"><v-icon size="17">mdi-account-outline</v-icon></div></template>
              </v-img>
              <v-icon v-else size="17">mdi-account-outline</v-icon>
            </div>
            <span :title="item.workerName">{{ item.workerName || "Sin trabajador" }}</span>
          </div>
        </template>

        <template #[`item.title`]="{ item }">
          <div class="incident-title-cell">
            <div
              class="incident-type-icon"
              :class="{
                'incident-type-icon--warning': String(item.title || '').includes('Retraso'),
                'incident-type-icon--success': String(item.title || '').includes('Escaneo'),
                'incident-type-icon--info': String(item.title || '').includes('Reimpresión')
              }"
            >
              <v-icon size="17">
                {{
                  String(item.title || '').includes('Retraso')
                    ? 'mdi-clock-alert-outline'
                    : String(item.title || '').includes('Escaneo')
                      ? 'mdi-qrcode-scan'
                      : String(item.title || '').includes('Reimpresión')
                        ? 'mdi-printer-outline'
                        : 'mdi-alert-outline'
                }}
              </v-icon>
            </div>
            <span :title="item.title">{{ item.title || "Sin título" }}</span>
          </div>
        </template>

        <template #[`item.date`]="{ item }">
          <span class="date-value"><v-icon size="14">mdi-calendar-outline</v-icon>{{ item.date || "-" }}</span>
        </template>

        <template #[`item.actions`]="{ item }">
          <div class="action-buttons">
            <v-btn
              size="small"
              variant="tonal"
              :color="getDetailsButtonColor(item)"
              class="details-button"
              @click.stop="toggleExpand(item)"
            >
              <v-icon start size="17">{{ isExpanded(item) ? "mdi-chevron-up" : "mdi-eye-outline" }}</v-icon>
              {{ isExpanded(item) ? "Ocultar" : "Ver" }}
            </v-btn>
          </div>
        </template>

        <template #expanded-row="{ item }">

          <tr>

            <td :colspan="headers.length">

              <div class="incident-expanded">

                <div class="d-flex align-center mb-3">

                  <v-icon

                    v-if="item.title.includes('Retraso')"

                    color="warning"

                    class="mr-2"

                  >

                    mdi-clock-alert

                  </v-icon>

                  <v-icon

                    v-else-if="item.title.includes('Escaneo')"

                    color="success"

                    class="mr-2"

                  >

                    mdi-qrcode-scan

                  </v-icon>

                  <v-icon

                    v-else-if="item.title.includes('Reimpresión')"

                    color="info"

                    class="mr-2"

                  >

                    mdi-printer

                  </v-icon>

                  <strong>{{ item.title }}</strong>

                </div>

                <div v-if="item.description" class="incident-expanded-description">

                  <div class="incident-detail-key pa-0 mb-1">

                    Descripción:

                  </div>

                  <div class="incident-detail-value pa-0">

                    {{ item.description }}

                  </div>

                </div>

                <table class="incident-detail-table">

                  <tbody>

                    <tr

                      v-for="(value, key) in getFilteredDetails(item.details)"

                      :key="key"

                    >

                      <td class="incident-detail-key">

                        {{ formatDetailKey(key) }}:

                      </td>

                      <td class="incident-detail-value">

                        {{ formatDetailValue(key, value) }}

                      </td>

                    </tr>

                  </tbody>

                </table>

              </div>

            </td>

          </tr>

        </template>

      </v-data-table>

        <div class="table-footer-note">
          <v-icon size="15">mdi-information-outline</v-icon>
          Utiliza “Ver” para consultar todos los datos asociados a cada incidente.
        </div>

      </v-card>

    </div>

  </v-container>

  </div>

</template>

<script>

import { paleteColors } from "@/assets/colors";

import LocalStorageService from "@/LocalStorageService";

import { handleRequest } from "@/utils/api"; // Ruta al archivo

import { formatLocalDate } from "@/utils/date";

import _ from "lodash";

import QRCode from "qrcode";

import ReportDateRangeFilter from "@/components/ReportDateRangeFilter.vue";

export default {

  components: {

    ReportDateRangeFilter,

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

    type: "Sucursal",

    estimated: 0,

    timeSlotsKey: 0,

    mostrarFila: false,

    permissions: "",

    incidents: [],

    incidentSortBy: "date",

    incidentSortOrder: "desc",

    tableSortBy: [{ key: "date", order: "desc" }],

    branches: [],

    data: {},

    company_id: "",

    branch_id: "",

    options: [

      { title: "Empresa", value: "Company", icon: "mdi-office-building" },

      { title: "Sucursal", value: "Sucursal", icon: "mdi-store" },

    ],

    headers: [

      { title: "Sucursal", key: "nameBranch", sortable: true, width: "23%" },

      { title: "Trabajador", key: "workerName", sortable: true, width: "20%" },

      { title: "Título", key: "title", sortable: true, width: "29%" },

      { title: "Fecha", key: "date", sortable: true, width: "16%" },

      { title: "", key: "actions", sortable: false, align: "end", width: "12%" },

    ],

    editedItem: {

      startDate: null,

      endDate: null,

      branch_id: "",

    },

    originalItem: {

      startDate: null,

      endDate: null,

      branch_id: "",

    },

    defaultItem: {

      startDate: null,

      endDate: null,

      branch_id: "",

    },

    editedIndex: -1,

    search: "",

    tab: null,

    expandedItems: [],

    expanded: [],

    nameRules: [

      (v) => !!v || "El campo es requerido",

      (v) => (v && v.length <= 50) || "El campo debe tener menos de 51 caracteres",

      (v) => (v && v.length >= 3) || "El campo debe tener al menos 3 caracteres",

    ],

    selectRules: [(v) => !!v || "Seleccionar al menos un elemento"],

    priceRules: [

      (v) => !!v || "El precio es obligatorio", // El campo es obligatorio

      (v) =>

        /^[0-9]+(\.[0-9]{1,2})?$/.test(v) ||

        "El precio debe ser un número válido con hasta 2 decimales", // Valida el formato del precio

      (v) => v > 0 || "El precio debe ser un número positivo", // El precio debe ser positivo

    ],

  }),

  computed: {

    registeredCountText() {

      const count = this.incidents.length;

      return `${count} ${count === 1 ? "incidente registrado" : "incidentes registrados"}`;

    },

    delayIncidentCount() {

      return this.incidents.filter((item) =>

        String(item?.title || "").toLowerCase().includes("retraso")

      ).length;

    },

    scanIncidentCount() {

      return this.incidents.filter((item) =>

        String(item?.title || "").toLowerCase().includes("escaneo")

      ).length;

    },

    sortedIncidents() {

      return [...(this.incidents || [])].sort((a, b) => this.compareIncidents(a, b));

    },

  },

  mounted() {

    this.role = JSON.parse(LocalStorageService.getItem("role"));

    this.company_id = LocalStorageService.getItem("business_id");

    this.permissions = LocalStorageService.getItem("permissions");

    if (this.hasPermission("view_incidents_company")) {

      this.showBranches();

      this.type = "Company";

      this.mostrarFila = true;

    } else {

      this.type = "Sucursal";

      this.branch_id = LocalStorageService.getItem("branch_id");

      this.initialize();

    }

  },

  methods: {

    toggleIncidentSort(field) {

      if (this.incidentSortBy === field) {

        this.incidentSortOrder = this.incidentSortOrder === "asc" ? "desc" : "asc";

        return;

      }

      this.incidentSortBy = field;

      this.incidentSortOrder = "asc";

    },

    incidentSortIcon(field) {

      if (this.incidentSortBy !== field) {

        return "mdi-swap-vertical";

      }

      return this.incidentSortOrder === "asc" ? "mdi-arrow-up" : "mdi-arrow-down";

    },

    getIncidentSortValue(incident, field) {

      if (!incident) {

        return "";

      }

      if (field === "nameBranch") {

        return incident.nameBranch || incident.branchName || "";

      }

      return incident[field] ?? "";

    },

    compareIncidents(a, b) {

      const direction = this.incidentSortOrder === "asc" ? 1 : -1;

      const aValue = this.getIncidentSortValue(a, this.incidentSortBy);

      const bValue = this.getIncidentSortValue(b, this.incidentSortBy);

      const aEmpty = aValue === null || aValue === undefined || aValue === "";

      const bEmpty = bValue === null || bValue === undefined || bValue === "";

      if (aEmpty && bEmpty) {

        return 0;

      }

      if (aEmpty) {

        return 1;

      }

      if (bEmpty) {

        return -1;

      }

      const aNumber = Number(aValue);

      const bNumber = Number(bValue);

      if (Number.isFinite(aNumber) && Number.isFinite(bNumber)) {

        return (aNumber - bNumber) * direction;

      }

      return (

        String(aValue).toLowerCase().localeCompare(String(bValue).toLowerCase(), "es", {

          sensitivity: "base",

        }) * direction

      );

    },

    getDetailsObject(details) {

      if (!details) return {};

      // Ya es objeto

      if (typeof details === "object" && !Array.isArray(details)) {

        return details;

      }

      // Es string, intentar parsear

      if (typeof details === "string") {

        try {

          return JSON.parse(details);

        } catch (e) {

          console.warn("Error parseando details:", details, e);

          return { error: "Datos inválidos" };

        }

      }

      // Tipo desconocido

      return { error: `Tipo no soportado: ${typeof details}` };

    },

    hasPermission(requiredPermissions) {

      // Si es un string, lo convertimos a array

      const perms = Array.isArray(requiredPermissions)

        ? requiredPermissions

        : [requiredPermissions];

      // Retorna true si al menos uno coincide

      return perms.some((p) => this.permissions.includes(p));

    },

    toggleExpand(item) {

      this.expandedItems = this.isExpanded(item) ? [] : [item.id];

    },

    isExpanded(item) {

      if (!item || !item.id) return false;

      return this.expandedItems.includes(item.id);

    },

    isValidJSON(str) {

      try {

        JSON.parse(str);

        return true;

      } catch (e) {

        return false;

      }

    },

    getCacheTimestamp() {

      // Usamos medianoche (00:00:00) del día actual

      const now = new Date();

      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      return startOfDay.getTime(); // Ej: 1714003200000 (cambia una vez al día)

    },

    buildIncidentRequestData() {

      const data = {};

      if (this.type === "Company") {

        data.company_id = Number(this.company_id);

      } else {

        data.branch_id = Number(this.branch_id);

      }

      const startDate = this.editedItem.startDate || formatLocalDate();

      const endDate = this.editedItem.endDate || "";

      data.startDate = startDate;

      if (endDate && endDate !== startDate) {

        data.endDate = endDate;

      }

      return data;

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

          this.editedItem.branch_id = this.branches[0].id;

          this.branch_id = this.branches[0].id;

        } else {

          // Si no hay datos, asignamos un array vacío

          this.branches = [];

          this.mostrarFila = false;

        }

      } catch (error) {

        this.mostrarFila = false;

        // Captura de errores no controlados

        this.showAlert(

          "error",

          "Ocurrió un error inesperado al procesar la solicitud.",

          3000

        );

      } finally {

        this.mostrarFila = true;

        this.loading = false;

        this.initialize();

      }

    },

    async initialize() {

      if (this.type === "Sucursal" && this.branch_id === "null") {

        this.incidents = [];

        this.loading = false;

        return;

      }

      this.data = this.buildIncidentRequestData();

      try {

        this.loading = true;

        const result = await handleRequest({

          endpoint: "incident-date",

          method: "POST",

          data: this.data,

        });

        if (result.success) {

          // Si la solicitud es exitosa, asignamos las sucursales

          this.incidents = result.data?.incidents || [];

        } else {

          // Si no hay datos, asignamos un array vacío

          this.incidents = [];

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

    async getIncidents() {

      this.data = this.buildIncidentRequestData();

      try {

        this.loading = true;

        const result = await handleRequest({

          endpoint: "incident-date",

          method: "POST",

          data: this.data,

        });

        if (result.success) {

          // Si la solicitud es exitosa, asignamos las sucursales

          this.incidents = result.data?.incidents || [];

        } else {

          // Si no hay datos, asignamos un array vacío

          this.incidents = [];

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

    getDetailsButtonColor(item) {

      if (item.title.includes("Reimpresión")) return "info";

      if (item.title.includes("Retraso")) return "warning";

      if (item.title.includes("Escaneo")) return "success";

      return "primary";

    },

    /*formatDetailKey(key) {

      const keysMap = {

        qr: "Código QR",

        action: "Acción",

        ticket_id: "ID Ticket",

        new_status: "Nuevo Estado",

        previous_status: "Estado Anterior",

        arrival: "Llegada Programada",

        actualEnd: "Llegada Real",

        difference: "Diferencia",

        actualStart: "Inicio Real",

        scheduledStart: "Inicio Programado",

        print: "Número de Reimpresión",

        method: "Método de Pago",

        quantity: "Cantidad",

        price: "Precio Unitario",

        total: "Total",

        trip_id: "ID del Viaje",

      };

      return (

        keysMap[key] ||

        key

          .split("_")

          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))

          .join(" ")

      );

    },*/

    /*formatDetailValue(key, value) {

      if (key === "qr") return "";

      if (key === "difference" && typeof value === "number") {

        const hours = Math.floor(value / 60);

        const minutes = value % 60;

        return `${hours}h ${minutes}m`;

      }

      if (key === "method") {

        const methods = {

          cash: "Efectivo",

          card: "Tarjeta",

          transfer: "Transferencia",

        };

        return methods[value] || value;

      }

      if (["price", "total"].includes(key)) {

        return new Intl.NumberFormat("es-MX", {

          style: "currency",

          currency: "MXN",

        }).format(value);

      }

      return value;

    },*/

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

    async onItemExpanded({ item, value }) {

      // Solo generar QR cuando se expande y tiene datos QR

      if (value && item.details?.qr) {

        console.log("item", item);

        await this.$nextTick();

        await this.generateQRCode(item);

      }

    },

    async generateQRCode(item) {

      if (!item.details?.qr) return;

      console.log("item", item);

      const containerId = `qr-container-${item.id}`;

      await this.$nextTick();

      const container = document.getElementById(containerId);

      if (!container) return;

      // Limpiar contenedor por si ya tenía un QR

      container.innerHTML = "";

      const canvas = document.createElement("canvas");

      container.appendChild(canvas);

      try {

        await QRCode.toCanvas(canvas, item.details.qr, {

          width: 120,

          margin: 1,

          color: {

            dark: "#000000",

            light: "#ffffff",

          },

        });

      } catch (error) {

        console.error("Error generando QR:", error);

        container.innerHTML =

          '<span class="error-text">Error al generar código QR</span>';

      }

    },

    // Reemplaza el método getDetailsObject por este nuevo método que filtra y ordena los campos

    getFilteredDetails(details) {

      if (!details) return {};

      // Parsear si es string JSON

      let parsed = details;

      if (typeof details === "string") {

        try {

          parsed = JSON.parse(details);

        } catch (e) {

          console.warn("Error parseando details:", details, e);

          return { error: "Datos inválidos" };

        }

      }

      if (typeof parsed !== "object" || Array.isArray(parsed)) {

        return { error: `Tipo no soportado: ${typeof parsed}` };

      }

      if (

        typeof parsed.type === "string" &&

        parsed.type.includes("TRIP_VEHICLE_CHANGE")

      ) {

        return {

          trip_code: parsed.trip_code || "-",

          old_vehicle: parsed.old_vehicle || "-",

          new_vehicle: parsed.new_vehicle || "-",

          reassignedSeats: parsed.reassignedSeats ?? "-",

        };

      }

      // === FILTRAR: Excluir campos que NO queremos mostrar ===

      const { ticket_id, trip_id, sequenceNumber, branchName, ...cleanDetails } = parsed;

      // === ORDENAR: Definir orden preferido de visualización ===

      const preferredOrder = [

        "transactionNumber",

        "routeName",

        "routeOrigin",

        "routeDestination",

        "departureTime",

        "arrivalTime",

        "print",

        "method",

        "quantity",

        "price",

        "total",

      ];

      const result = {};

      // Primero agregar campos en el orden preferido (si existen y tienen valor)

      preferredOrder.forEach((key) => {

        if (

          cleanDetails[key] !== undefined &&

          cleanDetails[key] !== null &&

          cleanDetails[key] !== ""

        ) {

          result[key] = cleanDetails[key];

        }

      });

      // Luego agregar cualquier otro campo restante que no esté en preferredOrder

      Object.keys(cleanDetails).forEach((key) => {

        if (

          !preferredOrder.includes(key) &&

          cleanDetails[key] !== undefined &&

          cleanDetails[key] !== null &&

          cleanDetails[key] !== ""

        ) {

          result[key] = cleanDetails[key];

        }

      });

      return result;

    },

    // Actualiza formatDetailKey para incluir los nuevos campos

    formatDetailKey(key) {

      const keysMap = {

        qr: "Código QR",

        action: "Acción",

        ticket_id: "ID Ticket", // Ya no se mostrará, pero se mantiene por compatibilidad

        trip_id: "ID Viaje", // Ya no se mostrará, pero se mantiene por compatibilidad

        trip_code: "Código del Viaje",

        routeCode: "Código de Ruta",

        route_code: "Código de Ruta",

        "Route Code": "Código de Ruta",

        date: "Fecha",

        Date: "Fecha",

        schedule: "Hora Programada",

        Schedule: "Hora Programada",

        origin: "Origen",

        Origin: "Origen",

        destination: "Destino",

        Destination: "Destino",

        scan_count: "Cantidad de Escaneos",

        scanCount: "Cantidad de Escaneos",

        timestamp: "Fecha y Hora",

        old_vehicle: "Vehículo Anterior",

        new_vehicle: "Vehículo Nuevo",

        reassignedSeats: "Asientos Reasignados",

        new_status: "Nuevo Estado",

        previous_status: "Estado Anterior",

        arrival: "Llegada Programada",

        actualEnd: "Llegada Real",

        difference: "Diferencia",

        actualStart: "Inicio Real",

        scheduledStart: "Inicio Programado",

        print: "Reimpresiones",

        method: "Método de Pago",

        quantity: "Cantidad",

        price: "Precio Unitario",

        total: "Total",

        // === NUEVOS CAMPOS ===

        transactionNumber: "N° Transacción",

        //sequenceNumber: "N° Secuencia",

        routeName: "Ruta",

        routeOrigin: "Origen",

        routeDestination: "Destino",

        departureTime: "Hora de Salida",

        arrivalTime: "Hora de Llegada",

      };

      return (

        keysMap[key] ||

        key

          .split("_")

          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))

          .join(" ")

      );

    },

    // Actualiza formatDetailValue para formatear horas cuando existan

    formatDetailValue(key, value) {

      if (key === "qr") return "";

      if (key === "reassignedSeats") {

        return this.formatReassignedSeats(value);

      }

      // === FORMATEO DE HORAS ===

      if (["departureTime", "arrivalTime", "timestamp"].includes(key) && value) {

        const date = new Date(value);

        if (!isNaN(date.getTime())) {

          return date.toLocaleTimeString("es-ES", {

            hour: "2-digit",

            minute: "2-digit",

            hour12: false,

          });

        }

        return value; // Si no es fecha válida, mostrar tal cual

      }

      if (key === "difference" && typeof value === "number") {

        const hours = Math.floor(value / 60);

        const minutes = value % 60;

        return `${hours}h ${minutes}m`;

      }

      if (key === "method") {

        const methods = {

          cash: "Efectivo",

          card: "Tarjeta",

          transfer: "Transferencia",

          Efectivo: "Efectivo", // Por si ya viene formateado desde backend

        };

        return methods[value] || value;

      }

      if (["price", "total"].includes(key)) {

        return new Intl.NumberFormat("es-CL", {

          // Ajustado a CLP según contexto

          style: "currency",

          currency: "CLP",

          minimumFractionDigits: 0,

          maximumFractionDigits: 0,

        }).format(value);

      }

      return value;

    },

    formatReassignedSeats(value) {

      if (!value) {

        return "-";

      }

      let seatsData = value;

      if (typeof value === "string") {

        try {

          seatsData = JSON.parse(value);

        } catch (error) {

          return value;

        }

      }

      if (!Array.isArray(seatsData)) {

        return String(seatsData);

      }

      const formatted = seatsData

        .map((item) => {

          const seats = Array.isArray(item?.seats) ? item.seats : [];

          const seatsText = seats.length ? seats.join(", ") : "-";

          if (item?.sequenceNumber) {

            return `Ticket ${item.sequenceNumber}: asientos ${seatsText}`;

          }

          return `Asientos ${seatsText}`;

        })

        .filter(Boolean);

      return formatted.length ? formatted.join(" | ") : "-";

    },

  },

};

</script>

<style>

.selected-tab {

  background-color: #1976d2;

  /* Fondo del tab seleccionado */

  color: white;

  /* Texto blanco */

  border-radius: 4px;

  /* Esquinas redondeadas, opcional */

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

.incident-toolbar {

  display: flex;

  align-items: center;

  gap: 12px;

  flex-wrap: wrap;

}

.incident-filter {

  width: 220px;

  min-width: 220px;

}

.incident-search {

  width: 300px;

  min-width: 260px;

}

.incident-col-branch {

  width: 23%;

  min-width: 0;

}

.incident-col-worker {

  width: 17%;

  min-width: 0;

}

.incident-col-title {

  width: 34%;

  min-width: 0;

}

.incident-col-date {

  width: 16%;

  min-width: 150px;

}

.incident-col-actions {

  width: 10%;

  min-width: 0;

}

.incident-date-text {

  white-space: nowrap;

  overflow: visible;

  text-overflow: clip;

}

.incident-sortable {

  display: flex;

  align-items: center;

  cursor: pointer;

  user-select: none;

}

.incident-expanded {

  margin: 0 16px 10px;

  padding: 18px 22px;

  border: 1px solid #eef2f7;

  border-radius: 14px;

  background: #f8fafc;

}

.incident-detail-table {

  width: 100%;

  border-collapse: collapse;

  font-size: 13px;

}

.incident-detail-key {

  width: 220px;

  padding: 6px 8px;

  font-weight: 700;

  color: #334155;

}

.incident-detail-value {

  padding: 6px 8px;

  color: #475569;

}

.incident-expanded-description {

  margin-bottom: 12px;

}

@media (max-width: 960px) {

  .incident-toolbar {

    width: 100%;

    flex-direction: column;

    align-items: stretch;

  }

  .incident-filter,

  .incident-search {

    width: 100%;

    min-width: 100%;

  }

  .incident-col-branch,

  .incident-col-worker,

  .incident-col-title,

  .incident-col-date,

  .incident-col-actions {

    width: 100%;

  }

}

</style>

<style scoped>
/* Identidad visual basada en RoutesView.vue */
.incidents-page {
  min-height: 100%;
  color: #1e293b;
  background: #f6f8fb;
}

.page-header {
  display: flex;
  min-height: 70px;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 24px;
  background: #ffffff;
  border-bottom: 1px solid #e8edf5;
}

.page-heading {
  display: flex;
  align-items: center;
  gap: 11px;
}

.page-icon {
  display: grid;
  flex: 0 0 38px;
  width: 38px;
  height: 38px;
  color: #ffffff;
  background: radial-gradient(circle at 90% 5%, rgba(53,184,232,.5), transparent 28px), linear-gradient(135deg,#0e1f46,#2454d6);
  border-radius: 10px;
  box-shadow: 0 5px 12px rgba(36,84,214,.17);
  place-items: center;
}

.page-title {
  margin: 0;
  color: #0f172a;
  font-size: 19px;
  font-weight: 850;
}

.page-subtitle {
  margin: 3px 0 0;
  color: #526176;
  font-size: 12px;
  font-weight: 650;
}

.page-content {
  padding: 18px 24px 28px;
}

.incidents-content {
  position: relative;
}

.incidents-loading-bar {
  position: fixed !important;
  top: 70px;
  left: 0;
  z-index: 8;
}

.summary-row {
  margin-bottom: 4px;
}

.summary-card {
  display: flex;
  min-height: 72px;
  align-items: center;
  gap: 11px;
  padding: 13px 15px;
  background: #ffffff;
  border: 1px solid #e8edf5;
  border-radius: 12px;
  box-shadow: 0 4px 14px rgba(15,23,42,.035);
}

.summary-icon {
  display: grid;
  width: 36px;
  height: 36px;
  border-radius: 9px;
  place-items: center;
}

.summary-icon--blue { color: #2454d6; background: #eef3ff; }
.summary-icon--green { color: #16875a; background: #eaf8f1; }
.summary-icon--amber { color: #b86a08; background: #fff6e6; }
.summary-value { color: #0f172a; font-size: 20px; font-weight: 900; line-height: 1; }
.summary-label { margin-top: 4px; color: #526176; font-size: 11px; font-weight: 700; }

.incident-toolbar {
  display: flex;
  align-items: center;
  gap: 10px !important;
  margin: 0 0 16px !important;
  padding: 14px !important;
  background: #ffffff;
  border: 1px solid #e8edf5;
  border-radius: 12px;
  box-shadow: 0 4px 14px rgba(15,23,42,.035);
}

.incidents-toolbar-label {
  display: flex;
  flex: 1 0 100%;
  align-items: center;
  gap: 9px;
  padding-bottom: 2px;
  color: #2454d6;
}

.incidents-toolbar-label strong,
.incidents-toolbar-label span { display: block; }
.incidents-toolbar-label strong { color: #0f172a; font-size: 12.5px; font-weight: 850; }
.incidents-toolbar-label span { margin-top: 2px; color: #64748b; font-size: 10.5px; font-weight: 600; }

.table-panel {
  overflow: hidden;
  background: #ffffff;
  border: 1px solid #e8edf5;
  border-radius: 13px !important;
  box-shadow: 0 5px 18px rgba(15,23,42,.04) !important;
}

.table-toolbar {
  display: flex;
  min-height: 69px;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 12px 17px;
}

.section-title { color: #0f172a; font-size: 15px; font-weight: 850; }
.section-subtitle { margin-top: 3px; color: #64748b; font-size: 11px; font-weight: 650; }

.search-field {
  flex: 0 1 320px;
  width: 320px;
  max-width: 320px;
}

.search-field :deep(.v-field) {
  min-height: 40px;
  color: #334155;
  background: #ffffff;
  border-radius: 9px;
  font-size: 12px;
}

.search-field :deep(.v-field__outline) { color: #dce3ed; opacity: 1; }
.search-field :deep(.v-field__input) { min-height: 40px; padding-block: 0; color: #1e293b; font-size: 12px; font-weight: 600; }
.search-field :deep(.v-field__input::placeholder) { color: #94a3b8; opacity: 1; }
.search-field :deep(.v-icon) { color: #64748b; opacity: 1; }
.search-field :deep(.v-field--focused .v-field__outline) { color: #2454d6; }

.incidents-table {
  color: #1e293b;
  background: transparent;
}

.incidents-table :deep(thead) { display: table-header-group !important; visibility: visible !important; }
.incidents-table :deep(thead th) {
  height: 40px !important;
  color: #334155 !important;
  background: #f8fafc !important;
  border-bottom: 1px solid #e8edf5 !important;
  font-size: 11px !important;
  font-weight: 850 !important;
  letter-spacing: .04em;
  text-transform: uppercase;
}
.incidents-table :deep(tbody td) {
  height: 62px !important;
  padding-inline: 16px !important;
  color: #1e293b;
  border-bottom: 1px solid #eef2f6 !important;
  font-size: 13px;
  font-weight: 600;
}
.incidents-table :deep(tbody tr:hover) { background: #f8faff !important; }
.incidents-table :deep(.v-data-table-footer) { min-height: 52px; padding: 6px 16px; color: #334155; font-size: 11.5px; font-weight: 700; }

.incidents-table :deep(.v-data-table__th--sortable) { cursor: pointer; user-select: none; transition: color .18s ease, background-color .18s ease; }
.incidents-table :deep(.v-data-table__th--sortable:hover) { color: #2454d6 !important; background: #f4f7ff !important; }
.incidents-table :deep(.v-data-table-header__content) { display: flex !important; align-items: center !important; gap: 5px !important; }
.incidents-table :deep(.v-data-table-header__sort-icon) { display: inline-flex !important; visibility: visible !important; width: 15px !important; height: 15px !important; margin-left: 1px !important; color: #94a3b8 !important; font-size: 15px !important; opacity: .65 !important; }
.incidents-table :deep(.v-data-table__th--sorted) { color: #2454d6 !important; background: #f5f7ff !important; }
.incidents-table :deep(.v-data-table__th--sorted .v-data-table-header__sort-icon) { color: #2454d6 !important; opacity: 1 !important; }

.branch-cell,
.worker-cell,
.incident-title-cell {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 9px;
}

.table-avatar {
  display: grid;
  flex: 0 0 36px;
  width: 36px;
  height: 36px;
  overflow: hidden;
  color: #2454d6;
  background: #eef3ff;
  border: 1px solid #dce6ff;
  border-radius: 9px;
  place-items: center;
}

.table-avatar :deep(.v-img__img) { width: 100% !important; height: 100% !important; object-fit: cover; }
.avatar-fallback { display: grid; width: 100%; height: 100%; color: #2454d6; background: #eef3ff; place-items: center; }
.branch-cell span,.worker-cell span,.incident-title-cell > span { overflow: hidden; color: #334155; font-size: 12.5px; font-weight: 750; text-overflow: ellipsis; white-space: nowrap; }

.incident-type-icon {
  display: grid;
  flex: 0 0 32px;
  width: 32px;
  height: 32px;
  color: #64748b;
  background: #f1f5f9;
  border-radius: 8px;
  place-items: center;
}
.incident-type-icon--warning { color: #b86a08; background: #fff6e6; }
.incident-type-icon--success { color: #16875a; background: #eaf8f1; }
.incident-type-icon--info { color: #2454d6; background: #eef3ff; }
.date-value { display: inline-flex; align-items: center; gap: 5px; color: #334155; font-size: 11.5px; font-weight: 800; white-space: nowrap; }
.action-buttons { display: flex; justify-content: flex-end; }
.details-button { min-width: 90px; min-height: 34px; border-radius: 8px !important; font-size: 11px; font-weight: 750; letter-spacing: 0; text-transform: none; }

.incidents-table :deep(.busgo-table-head) {
  min-height: 40px;
  padding: 10px 17px;
  color: #334155;
  background: #f8fafc;
  border-bottom: 1px solid #e8edf5;
  font-size: 11px;
  font-weight: 850;
  letter-spacing: .04em;
  text-transform: uppercase;
}

.incidents-table :deep(.busgo-row) {
  min-height: 62px;
  padding: 10px 17px;
  color: #1e293b;
  background: #ffffff;
  border-bottom: 1px solid #eef2f6;
  font-size: 13px;
  font-weight: 600;
  transition: background-color .16s ease;
}

.incidents-table :deep(.busgo-row:hover) { background: #f8faff; }
.incidents-table :deep(.busgo-avatar) { background: #eef3ff !important; border: 1px solid #dce6ff; border-radius: 9px !important; }
.incidents-table :deep(.busgo-name) { overflow: hidden; color: #0f172a; font-size: 12.5px; font-weight: 750; text-overflow: ellipsis; white-space: nowrap; }

.incident-sortable { color: #334155; font-size: 11px; font-weight: 850; transition: color .16s ease; }
.incident-sortable:hover { color: #2454d6; }
.incident-date-text { color: #334155; font-size: 11.5px; font-weight: 800; }
.incident-col-actions :deep(.v-btn) { min-height: 34px; border-radius: 8px !important; font-size: 11px; font-weight: 750; letter-spacing: 0; text-transform: none; }

.incident-expanded {
  margin: 8px 16px 14px !important;
  padding: 16px 18px !important;
  background: #f8fafc !important;
  border: 1px solid #e5eaf1 !important;
  border-left: 3px solid #2454d6 !important;
  border-radius: 10px !important;
  box-shadow: 0 3px 10px rgba(15,23,42,.03);
}

.incident-expanded strong { color: #0f172a; font-size: 13.5px; font-weight: 850; }
.incident-detail-table { margin-top: 10px; overflow: hidden; background: #ffffff; border: 1px solid #e8edf5; border-radius: 9px; border-collapse: separate !important; border-spacing: 0; }
.incident-detail-table tr:not(:last-child) td { border-bottom: 1px solid #eef2f6; }
.incident-detail-key { width: 220px !important; padding: 9px 12px !important; color: #475569 !important; background: #f8fafc; font-size: 11.5px; font-weight: 800 !important; }
.incident-detail-value { padding: 9px 12px !important; color: #1e293b !important; font-size: 12.5px; font-weight: 600; }

.table-footer-note {
  display: flex;
  min-height: 42px;
  align-items: center;
  gap: 6px;
  padding: 9px 16px;
  color: #64748b;
  font-size: 10.5px;
  font-weight: 650;
  border-top: 1px solid #edf1f5;
}

.snackbar-content { display: flex; align-items: center; gap: 10px; }
.snackbar-title { font-size: 11px; font-weight: 850; }
.snackbar-message { margin-top: 2px; font-size: 9.5px; font-weight: 600; }
.busgo-snackbar :deep(.v-snackbar__wrapper) { border-radius: 11px; }

@media (max-width: 1100px) {
  .incidents-table { overflow-x: auto; }
  .incidents-table :deep(.v-table__wrapper) { min-width: 950px; }
}

@media (max-width: 959px) {
  .page-header { padding-inline: 17px; }
  .page-content { padding: 15px 17px 24px; }
  .table-toolbar { align-items: stretch; flex-direction: column; }
  .search-field { width: 100%; max-width: none; }
  .incident-toolbar { margin-inline: 0 !important; }
}

@media (max-width: 600px) {
  .page-header { align-items: flex-start; padding: 11px 12px; }
  .page-subtitle { max-width: 250px; }
  .page-content { padding: 11px 12px 20px; }
  .incident-detail-key { width: 120px !important; }
}
</style>

<style scoped>
/* BUSGO · INCIDENTES */
.incidents-page-header {
  display:flex!important;
  min-height:72px!important;
  align-items:center!important;
  gap:12px!important;
  padding:13px 24px!important;
  background:#fff!important;
  border-bottom:1px solid #e7ecf3!important;
  border-radius:0!important;
}

.incidents-page-icon {
  display:grid!important;
  flex:0 0 40px!important;
  width:40px!important;
  height:40px!important;
  color:#fff!important;
  background:radial-gradient(circle at 90% 5%,rgba(245,158,11,.5),transparent 28px),linear-gradient(135deg,#9a3412,#ea580c)!important;
  border-radius:11px!important;
  box-shadow:0 6px 14px rgba(234,88,12,.2)!important;
  place-items:center!important;
}

.incidents-page-header .busgo-page-title { color:#0f172a!important; font-size:19px!important; font-weight:850!important; line-height:1.2!important; }
.incidents-page-header .busgo-page-subtitle { margin-top:3px!important; color:#526176!important; font-size:12px!important; font-weight:650!important; }

.incidents-container { min-height:calc(100vh - 72px); padding:18px 24px 30px!important; background:#f6f8fb!important; }
.incidents-shell { position:relative; overflow:hidden!important; background:#fff!important; border:1px solid #e4eaf2!important; border-radius:14px!important; box-shadow:0 6px 22px rgba(15,23,42,.045)!important; }
.incidents-loading-bar { position:absolute!important; top:0; left:0; z-index:8; }

.incidents-summary-header {
  display:flex!important;
  min-height:76px!important;
  align-items:center!important;
  padding:17px 22px!important;
  border-bottom:1px solid #edf1f5!important;
}
.incidents-summary-header .busgo-card-title { color:#0f172a!important; font-size:16px!important; font-weight:850!important; }
.incidents-summary-header .busgo-card-subtitle { margin-top:4px!important; color:#64748b!important; font-size:11.5px!important; font-weight:600!important; }

.incident-toolbar {
  gap:10px!important;
  margin:0 22px 16px;
  padding:14px!important;
  background:#f8fafc;
  border:1px solid #e7ecf3;
  border-radius:11px;
}

.incidents-toolbar-label { display:flex; flex:1 0 100%; align-items:center; gap:9px; padding-bottom:2px; color:#2454d6; }
.incidents-toolbar-label strong,.incidents-toolbar-label span { display:block; }
.incidents-toolbar-label strong { color:#0f172a; font-size:12.5px; font-weight:850; }
.incidents-toolbar-label span { margin-top:2px; color:#64748b; font-size:10.5px; font-weight:600; }

.incident-filter { flex:0 1 245px; width:245px!important; min-width:210px!important; }
.incident-toolbar :deep(.v-field) { min-height:40px!important; color:#334155!important; background:#fff!important; border-radius:9px!important; }
.incident-toolbar :deep(.v-field__outline) { color:#dce3ed; opacity:1; }
.incident-toolbar :deep(.v-field__input),.incident-toolbar :deep(.v-label) { min-height:40px; color:#334155!important; font-size:12px!important; font-weight:650!important; opacity:1!important; }
.incident-toolbar :deep(.v-field__prepend-inner),.incident-toolbar :deep(.v-field__append-inner) { color:#64748b; opacity:1; }
.incident-toolbar :deep(.v-field--focused .v-field__outline),.incident-toolbar :deep(.v-field--focused .v-field__prepend-inner) { color:#2454d6!important; }
.incident-toolbar :deep(.v-select__selection),.incident-toolbar :deep(.v-autocomplete__selection) { min-width:0; color:#1e293b; font-size:12px; font-weight:750; }

.incidents-query-button { min-width:112px!important; min-height:40px!important; color:#fff!important; border-radius:9px!important; font-size:12.5px!important; font-weight:800!important; letter-spacing:0!important; text-transform:none!important; box-shadow:0 5px 12px rgba(36,84,214,.18)!important; }

.incidents-table-panel { margin:0 22px 22px; overflow:hidden; background:#fff; border:1px solid #e8edf5; border-radius:13px; box-shadow:0 5px 18px rgba(15,23,42,.04); }
.incidents-table-heading { display:flex; min-height:69px; align-items:center; justify-content:space-between; gap:18px; padding:12px 17px; background:#fff; }
.incidents-table-title { color:#0f172a; font-size:15px; font-weight:850; line-height:1.25; }
.incidents-table-subtitle { margin-top:3px; color:#64748b; font-size:11px; font-weight:650; }

.incident-search { flex:0 1 285px; width:285px!important; min-width:240px!important; max-width:285px; }
.incident-search :deep(.v-field) { min-height:40px; color:#334155; background:#fff; border-radius:9px; font-size:12px; }
.incident-search :deep(.v-field__outline) { color:#dce3ed; opacity:1; }
.incident-search :deep(.v-field__input) { min-height:40px; padding-top:0; padding-bottom:0; color:#1e293b; font-size:12px; font-weight:600; }
.incident-search :deep(.v-field__input::placeholder) { color:#94a3b8; opacity:1; }
.incident-search :deep(.v-icon) { color:#64748b; opacity:1; }
.incident-search :deep(.v-field--focused .v-field__outline) { color:#2454d6; }

.incidents-table-panel :deep(.v-data-table thead) { display:none!important; }
.incidents-table-panel :deep(tbody td) { height:auto!important; padding:0!important; border-bottom:0!important; }
.incidents-table-panel :deep(.v-data-table-footer) { min-height:52px; padding:6px 16px; color:#334155; font-size:11.5px; font-weight:700; border-top:1px solid #eef2f6; }

.incidents-table-panel :deep(.busgo-table-head) {
  min-height:40px;
  padding:10px 17px;
  color:#334155;
  background:#f8fafc;
  border-bottom:1px solid #e8edf5;
  font-size:11px;
  font-weight:850;
  letter-spacing:.04em;
  text-transform:uppercase;
}

.incidents-table-panel :deep(.busgo-row) { min-height:62px; padding:10px 17px; color:#1e293b; border-bottom:1px solid #eef2f6; font-size:13px; font-weight:600; transition:background-color .16s ease; }
.incidents-table-panel :deep(.busgo-row:hover) { background:#f8faff; }
.incidents-table-panel :deep(.busgo-avatar) { background:#eef3ff!important; border:1px solid #dbe5ff; border-radius:9px!important; }
.incidents-table-panel :deep(.busgo-name) { color:#172033; font-size:12.5px; font-weight:800; }
.incident-sortable { color:#334155; transition:color .16s ease; }
.incident-sortable:hover { color:#2454d6; }

.incident-expanded { margin:8px 16px 14px!important; padding:16px 18px!important; background:#f8fafc!important; border:1px solid #e5eaf1!important; border-left:3px solid #2454d6!important; border-radius:10px!important; box-shadow:0 3px 10px rgba(15,23,42,.03); }
.incident-expanded strong { color:#0f172a; font-size:13.5px; font-weight:850; }
.incident-detail-table { margin-top:10px; overflow:hidden; background:#fff; border:1px solid #e8edf5; border-radius:9px; border-collapse:separate!important; border-spacing:0; }
.incident-detail-table tr:not(:last-child) td { border-bottom:1px solid #eef2f6; }
.incident-detail-key { width:220px!important; padding:9px 12px!important; color:#475569!important; background:#f8fafc; font-size:11.5px; font-weight:800!important; }
.incident-detail-value { padding:9px 12px!important; color:#1e293b!important; font-size:12.5px; font-weight:600; }
.busgo-snackbar { border-radius:11px; }

@media (max-width:960px) {
  .incidents-container { padding:14px!important; }
  .incident-toolbar,.incidents-table-panel { margin-inline:14px; }
  .incident-filter,.incidents-query-button { width:100%!important; min-width:100%!important; }
  .incidents-table-heading { align-items:stretch; flex-direction:column; }
  .incident-search { width:100%!important; min-width:100%!important; max-width:none; }
}

@media (max-width:600px) {
  .incidents-page-header { align-items:flex-start!important; padding:13px 14px!important; }
  .incident-detail-key { width:120px!important; }
}
</style>

<style>
/* Los menús de Vuetify se renderizan mediante teleport. */
.incidents-select-menu { overflow:hidden!important; padding:6px!important; background:#fff!important; border:1px solid #dfe6ef!important; border-radius:11px!important; box-shadow:0 14px 34px rgba(15,23,42,.14)!important; }
.incidents-select-menu .v-list { padding:0!important; background:transparent!important; }
.incidents-select-menu .v-list-item { min-height:48px!important; margin:2px 0!important; padding:7px 10px!important; color:#1e293b!important; border-radius:8px!important; transition:background-color .16s ease,color .16s ease; }
.incidents-select-menu .v-list-item:hover { color:#2454d6!important; background:#f4f7ff!important; }
.incidents-select-menu .v-list-item--active { color:#2454d6!important; background:#eef3ff!important; }
.incidents-select-menu .v-list-item-title { color:inherit!important; font-size:12.5px!important; font-weight:750!important; }
.incidents-select-menu .v-list-item-subtitle { margin-top:3px!important; color:#64748b!important; font-size:10.5px!important; font-weight:600!important; opacity:1!important; }
.incidents-select-menu .v-list-item__prepend > .v-icon { width:32px!important; height:32px!important; margin-inline-end:10px!important; color:#2454d6!important; background:#eef3ff!important; border:1px solid #dbe5ff!important; border-radius:8px!important; font-size:17px!important; }
.incidents-select-menu .v-avatar { width:34px!important; height:34px!important; margin-inline-end:10px!important; background:#eef3ff!important; border:1px solid #dbe5ff!important; border-radius:8px!important; }
.incidents-select-menu .v-list-item__overlay { opacity:0!important; }

/* Garantiza la cabecera nativa de Vuetify igual que en Rutas. */
.incidents-table thead {
  display: table-header-group !important;
  visibility: visible !important;
}

.incidents-table thead tr,
.incidents-table thead th {
  visibility: visible !important;
}

.incidents-table .v-data-table__th--sortable .v-data-table-header__sort-icon {
  display: inline-flex !important;
  visibility: visible !important;
  opacity: .65 !important;
}

.incidents-table .v-data-table__th--sortable:hover .v-data-table-header__sort-icon,
.incidents-table .v-data-table__th--sorted .v-data-table-header__sort-icon {
  color: #2454d6 !important;
  opacity: 1 !important;
}
</style>
