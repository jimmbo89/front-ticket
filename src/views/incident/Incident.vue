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
      <v-icon>mdi-alert</v-icon>
    </v-avatar>

    <div>
      <div class="busgo-page-title">Incidentes</div>
      <div class="busgo-page-subtitle">Gestionar incidentes operacionales</div>
    </div>

    <v-spacer />
  </v-card>

  <v-container fluid class="busgo-container">
    <v-card class="busgo-card" elevation="0">
      <div class="busgo-card-header">
        <div>
          <div class="busgo-card-title">Listado de incidencias</div>
          <div class="busgo-card-subtitle">
            Consulta eventos, trabajadores, sucursales y detalles asociados.
          </div>
        </div>
      </div>

      <div class="incident-toolbar px-6 pb-4">
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
          icon
          variant="tonal"
          :color="paleteColors.primary"
          @click="getIncidents"
          :disabled="type === 'Sucursal' && !branch_id"
        >
          <v-icon>mdi-magnify</v-icon>
        </v-btn>

        <v-spacer />

        <v-text-field
          v-model="search"
          density="compact"
          placeholder="Buscar incidencia..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          hide-details
          single-line
          class="incident-search"
        />
      </div>

      <v-data-table
        :headers="headers"
        :items="sortedIncidents"
        v-model:expanded="expandedItems"
        item-value="id"
        :items-per-page-text="'Elementos por página'"
        no-data-text="No hay datos disponibles"
        :loading="loading"
        loading-text="Cargando datos..."
        :hide-default-header="true"
        class="busgo-table"
        show-expand
      >
        <template #top>
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

        <template #item="slotProps">
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
    </v-card>
  </v-container>
</template>

<script>
import { paleteColors } from "@/assets/colors";
import LocalStorageService from "@/LocalStorageService";
import { handleRequest } from "@/utils/api"; // Ruta al archivo
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
    branches: [],
    data: {},
    company_id: "",
    branch_id: "",
    options: [
      { title: "Empresa", value: "Company", icon: "mdi-office-building" },
      { title: "Sucursal", value: "Sucursal", icon: "mdi-store" },
    ],
    headers: [
      { title: "Sucursal", key: "nameBranch" },
      { title: "Trabajador", key: "workerName" },
      { title: "Titulo", key: "title" },
      { title: "Fecha", key: "date" },
      { title: "Acciones", key: "data-table-expand" },
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
      this.data = {};
      if (this.type === "Company") {
        this.data.company_id = Number(this.company_id);
      } else {
        this.data.branch_id = Number(this.branch_id);
      }
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
      this.data = {};
      if (this.type === "Company") {
        this.data.company_id = Number(this.company_id);
      } else {
        this.data.branch_id = Number(this.branch_id);
      }
      this.data.startDate =
        this.editedItem.startDate ?? new Date().toISOString().split("T")[0];
      this.data.endDate =
        this.editedItem.endDate ?? new Date().toISOString().split("T")[0];
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
