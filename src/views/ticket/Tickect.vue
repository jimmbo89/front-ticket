<template>
<div class="ticket-view">
  <v-snackbar class="ticket-snackbar" location="right top" :timeout="sb_timeout" :color="sb_type" elevation="10" v-model="snackbar">
    <div class="ticket-alert-content"><v-icon :icon="sb_icon" size="22" /><div><strong>{{ sb_title }}</strong><div>{{ sb_message }}</div></div></div>
  </v-snackbar>

  <v-card class="busgo-page-header" elevation="0">
    <v-avatar :color="paleteColors.primary" class="busgo-page-icon">
      <v-icon>mdi-ticket</v-icon>
    </v-avatar>

    <div>
      <div class="busgo-page-title">Tickets</div>
      <div class="busgo-page-subtitle">Reporte y gestión de tickets vendidos</div>
    </div>

    <v-spacer />


  </v-card>

  <v-container fluid class="busgo-container">
    <v-card class="busgo-card" elevation="0">
      <div class="busgo-card-header">
        <div>
          <div class="busgo-card-title">
            Listado de tickets vendidos
          </div>

          <div class="busgo-card-subtitle">
            Consulta ventas, rutas, asientos, métodos de pago y reimpresiones.
          </div>
        </div>
      </div>

      <div class="ticket-toolbar px-6 pb-4">
        <v-autocomplete v-if="mostrarFila" :no-data-text="'No hay datos disponibles'" v-model="branch_id"
          :items="branches" placeholder="Seleccione una sucursal" prepend-inner-icon="mdi-store" item-title="name"
          item-value="id" variant="outlined" hide-details single-line density="compact" class="ticket-filter"
          :rules="selectRules" @update:modelValue="initialize">
          <template #item="{ props, item }">
            <v-list-item v-bind="props"
              :prepend-avatar="`${this.$axios.defaults.baseURL}images/${getTableRowItem(item).image}`" />
          </template>
        </v-autocomplete>

        <v-menu v-model="menu2" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y
          min-width="290px">
          <template #activator="{ props }">
            <v-text-field v-bind="props" :modelValue="dateFormattedSearch" prepend-inner-icon="mdi-calendar"
              placeholder="Fecha" density="compact" variant="outlined" hide-details single-line
              class="ticket-date-filter" />
          </template>

          <v-locale-provider locale="es">
            <v-date-picker header="Calendario" title="Seleccione la fecha" :color="paleteColors.primary"
              :modelValue="input2" @update:model-value="updateDateSearch" format="yyyy-MM-dd"
              />
          </v-locale-provider>
        </v-menu>

        <v-spacer />

        <v-text-field v-model="search" density="compact" placeholder="Buscar ticket..." prepend-inner-icon="mdi-magnify"
          variant="outlined" hide-details single-line class="ticket-search" />
      </div>

      <v-data-table :headers="headers" :items="sortedTickets" :search="search"
        :items-per-page-text="'Elementos por página'" no-data-text="No hay datos disponibles" :loading="loading"
        loading-text="Cargando datos..." class="busgo-table ticket-list-table">
        <template #headers><tr><th colspan="100" class="ticket-header-shell">
          <div class="busgo-table-head">
            <div class="ticket-col-code ticket-sortable-header" @click="toggleTicketSort('code')">
              <span>Código</span>
              <v-icon size="14">{{ ticketSortIcon('code') }}</v-icon>
            </div>
            <div class="ticket-col-route ticket-sortable-header" @click="toggleTicketSort('tripName')">
              <span>Tramos</span>
              <v-icon size="14">{{ ticketSortIcon('tripName') }}</v-icon>
            </div>
            <div class="ticket-col-date ticket-sortable-header" @click="toggleTicketSort('date')">
              <span>Fecha</span>
              <v-icon size="14">{{ ticketSortIcon('date') }}</v-icon>
            </div>
            <div class="ticket-col-schedule ticket-sortable-header" @click="toggleTicketSort('schedule')">
              <span>Horario</span>
              <v-icon size="14">{{ ticketSortIcon('schedule') }}</v-icon>
            </div>
            <div class="ticket-col-method ticket-sortable-header" @click="toggleTicketSort('method')">
              <span>Método</span>
              <v-icon size="14">{{ ticketSortIcon('method') }}</v-icon>
            </div>
            <div class="ticket-col-quantity ticket-sortable-header" @click="toggleTicketSort('quantity')">
              <span>Pasajes</span>
              <v-icon size="14">{{ ticketSortIcon('quantity') }}</v-icon>
            </div>
            <div class="ticket-col-seats ticket-sortable-header" @click="toggleTicketSort('seats')">
              <span>Asientos</span>
              <v-icon size="14">{{ ticketSortIcon('seats') }}</v-icon>
            </div>
            <div class="ticket-col-price ticket-sortable-header" @click="toggleTicketSort('price')">
              <span>Precio</span>
              <v-icon size="14">{{ ticketSortIcon('price') }}</v-icon>
            </div>
            <div class="ticket-col-total ticket-sortable-header" @click="toggleTicketSort('total')">
              <span>Total</span>
              <v-icon size="14">{{ ticketSortIcon('total') }}</v-icon>
            </div>
            <div class="ticket-col-actions">Acciones</div>
          </div>
        </th></tr></template>

        <template #item="slotProps">
          <tr>
            <td colspan="100" class="pa-0 border-0">
              <div class="busgo-row ticket-row">
                <div class="ticket-col-code busgo-meta ticket-code-cell">
                  <span class="ticket-code-value text-truncate">
                    {{ slotProps.item.code || "-" }}
                  </span>
                </div>

                <div class="ticket-col-route">
                  <div class="ticket-route-title-row">
                    <div class="ticket-route-main text-truncate">
                      {{ slotProps.item.routeCode || "-" }}
                    </div>

                    <v-chip v-if="getTicketFareSegment(slotProps.item)" size="x-small" :color="paleteColors.primary"
                      variant="tonal" class="flex-shrink-0">
                      Tramo
                    </v-chip>

                    <v-chip
                      size="x-small"
                      :color="getSaleModeColor(slotProps.item)"
                      variant="tonal"
                      class="flex-shrink-0"
                    >
                      {{ getSaleModeLabel(slotProps.item) }}
                    </v-chip>
                  </div>

                  <div class="ticket-route-meta">
                    <v-icon size="14" class="mr-0">mdi-map-marker</v-icon>

                    <span class="text-truncate">
                      Origen: {{ getTicketRouteOriginLabel(slotProps.item) }}
                    </span>

                    <v-icon size="14" class="mx-2">mdi-ray-start-arrow</v-icon>

                    <span class="text-truncate">
                      Destino: {{ getTicketRouteDestinationLabel(slotProps.item) }}
                    </span>
                  </div>

                  <v-tooltip activator="parent" location="bottom" max-width="420px">
                    <span style="white-space: normal; word-break: break-word">
                      Código viaje: {{ slotProps.item.code || "-" }}<br />
                      Código ruta: {{ slotProps.item.routeCode || "-" }}<br />
                      Origen: {{ getTicketRouteOriginLabel(slotProps.item) }}<br />
                      Destino: {{ getTicketRouteDestinationLabel(slotProps.item) }}
                    </span>
                  </v-tooltip>
                </div>

                <div class="ticket-col-date busgo-meta">
                  <v-icon size="16" color="primary">mdi-calendar</v-icon>
                  <span class="text-truncate">{{ slotProps.item.date }}</span>
                </div>

                <div class="ticket-col-schedule busgo-meta">
                  <v-icon size="16" color="primary">mdi-clock-outline</v-icon>
                  <span class="text-truncate">{{ slotProps.item.schedule }}</span>
                </div>

                <div class="ticket-col-method busgo-meta">
                  <span class="ticket-method-chip">
                    {{ slotProps.item.method }}
                  </span>
                </div>

                <div class="ticket-col-quantity busgo-meta">
                  <span>{{ slotProps.item.quantity }}</span>
                </div>

                <div class="ticket-col-seats busgo-meta">
                  <v-icon size="16" color="primary">mdi-seat</v-icon>
                  <span class="text-truncate">{{ slotProps.item.seats }}</span>
                </div>

                <div class="ticket-col-price ticket-money">
                  ${{ formatNumber(Number(slotProps.item.price)) }}
                </div>

                <div class="ticket-col-total ticket-money ticket-money-total">
                  ${{ formatNumber(Number(slotProps.item.total)) }}
                </div>

                <div class="ticket-col-actions busgo-actions">
                  <v-tooltip text="Reimprimir ticket" location="top"><template #activator="{ props }"><v-btn v-bind="props" icon="mdi-printer-outline" variant="text" size="small" class="ticket-action ticket-action--print" @click="printerItem(slotProps.item)" /></template></v-tooltip>

                  <v-tooltip text="Eliminar ticket" location="top"><template #activator="{ props }"><v-btn v-bind="props" icon="mdi-trash-can-outline" variant="text" size="small" class="ticket-action ticket-action--delete" @click="deleteItem(slotProps.item)" /></template></v-tooltip>
                </div>
              </div>
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
  <v-dialog v-model="dialogDelete" max-width="500px">
    <v-card class="busgo-dialog-card ticket-delete-dialog">
      <div class="ticket-confirm-heading"><span class="ticket-confirm-icon"><v-icon size="22">mdi-trash-can-outline</v-icon></span><div><strong>Eliminar ticket</strong><span>Confirma la eliminación de la venta</span></div><v-spacer /><v-btn icon="mdi-close" variant="text" size="small" aria-label="Cerrar" @click="closeDelete" /></div>

      <v-card-text class="mt-2 mb-2">
        ¿Desea eliminar el ticket seleccionado?
      </v-card-text>

      <v-divider />

      <v-card-actions class="busgo-dialog-actions">
        <v-spacer />

        <v-btn class="ticket-cancel-button" variant="text" @click="closeDelete">
          Cancelar
        </v-btn>

        <v-btn class="ticket-delete-button" variant="flat" @click="deleteItemConfirm" :loading="loading">
          Eliminar ticket
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="showTicketDialog" max-width="500" persistent>
    <v-card class="ticket-preview-dialog ticket-print-card">
      <div class="ticket-confirm-heading">
        <span class="ticket-confirm-icon ticket-confirm-icon--preview"><v-icon size="22">mdi-ticket-confirmation-outline</v-icon></span>
        <div><strong>Vista previa del ticket</strong><span>Revisa el comprobante antes de imprimir</span></div>
        <v-spacer />
        <v-btn icon="mdi-close" variant="text" size="small" aria-label="Cerrar vista previa" @click="showTicketDialog = false" />
      </div>
      <v-card-title class="ticket-print-header">
        <div class="d-flex flex-column align-center" style="width: 100%">
          <div v-if="ticketCompanyImage" class="ticket-branch-logo-preview mb-3">
            <img :src="`${this.$axios.defaults.baseURL}images/${ticketCompanyImage}`" :alt="ticketCompanyName"
              class="ticket-branch-logo-preview__img" />
          </div>

          <div class="text-center">
            <div class="text-subtitle-1 font-weight-bold">
              {{ selectedBranch?.name || "Nombre Sucursal" }}
            </div>

            <div class="text-body-2" v-if="selectedBranch?.rut">
              RUT: {{ selectedBranch.rut }}
            </div>

            <div class="text-body-2" v-if="selectedBranch?.address">
              Dirección: {{ selectedBranch.address }}
            </div>

            <div class="text-body-2" v-if="selectedBranch?.phone">
              Teléfono: {{ selectedBranch.phone }}
            </div>

            <div class="text-body-2" v-if="selectedBranch?.id">
              Folio N° {{ currentTicket.id }}
            </div>
          </div>
        </div>

        <v-btn icon @click="printTicket" class="ticket-print-button" title="Imprimir">
          <v-icon>mdi-printer</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <div class="ticket-container">
          <div class="d-flex justify-space-between align-center mb-3">
            <div class="font-weight-medium">
              Fecha: {{ currentTicket.date }}
            </div>

            <div class="font-weight-medium">
              Hora: {{ currentTicket.schedule || "--:--" }}
            </div>
          </div>

          <div class="mb-3">
            <div class="d-flex align-center justify-space-between mb-1">
              <div class="font-weight-bold">Recorrido:</div>

              <v-chip size="x-small" variant="tonal" :color="getSaleModeColor(currentTicket)">
                {{ getSaleModeLabel(currentTicket) }}
              </v-chip>
            </div>

            <div>
              <span class="font-weight-medium mr-1">Origen:</span>
              <span>{{ currentTicket.tripOrigin || "No especificado" }}</span>
            </div>

            <div>
              <span class="font-weight-medium mr-1">Destino:</span>
              <span>{{ currentTicket.tripDestination || "No especificado" }}</span>
            </div>
          </div>

          <div class="ticket-details">
            <div class="d-flex align-center mb-1">
              <span class="font-weight-medium mr-1">Precio:</span>
              <span>${{ formatNumber(currentTicket.total) }}</span>
            </div>

            <div class="d-flex align-center mb-1">
              <span class="font-weight-medium mr-1">Medio de pago:</span>
              <span>{{ currentTicket.method }}</span>
            </div>
          </div>

          <br />

          <div class="text-center">
            <canvas ref="qrCanvasOriginal" style="width: 150px; height: 150px"></canvas>
          </div>

          <br />

          <div class="dashed-divider my-3"></div>

          <div class="text-center caption mb-3">
            -Copia de control-

            <div class="text-body-2" v-if="currentTicket?.id">
              Folio N° {{ currentTicket.id }}
            </div>
          </div>

          <div class="d-flex justify-space-between align-center mb-3">
            <div class="font-weight-medium">
              Fecha: {{ currentTicket.date }}
            </div>

            <div class="font-weight-medium">
              Hora: {{ currentTicket.schedule || "--:--" }}
            </div>
          </div>

          <div class="mb-3">
            <div class="d-flex align-center justify-space-between mb-1">
              <div class="font-weight-bold">Recorrido:</div>

              <v-chip size="x-small" variant="tonal" :color="getSaleModeColor(currentTicket)">
                {{ getSaleModeLabel(currentTicket) }}
              </v-chip>
            </div>

            <div>
              <span class="font-weight-medium mr-1">Origen:</span>
              <span>{{ currentTicket.tripOrigin || "No especificado" }}</span>
            </div>

            <div>
              <span class="font-weight-medium mr-1">Destino:</span>
              <span>{{ currentTicket.tripDestination || "No especificado" }}</span>
            </div>
          </div>

          <div class="ticket-details">
            <div class="d-flex align-center mb-1">
              <span class="font-weight-medium mr-1">Precio:</span>
              <span>${{ formatNumber(currentTicket.total) }}</span>
            </div>

            <div class="d-flex align-center mb-1">
              <span class="font-weight-medium mr-1">Medio de pago:</span>
              <span>{{ currentTicket.method }}</span>
            </div>
          </div>

          <br />

          <div class="text-center">
            <canvas ref="qrCanvasControl" style="width: 150px; height: 150px"></canvas>
          </div>

          <br />

          <v-divider class="my-2" />

          <div v-if="currentTicket.print > 1" class="text-center caption mt-2 uppercase-text">
            (COPIA REIMPRESA POR EL OPERADOR {{ nameUser }})
          </div>
        </div>
      </v-card-text>

      <v-card-actions class="busgo-dialog-actions">
        <v-spacer />

        <v-btn color="primary" variant="flat" prepend-icon="mdi-close" @click="showTicketDialog = false">
          Cerrar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</div>
</template>


<script>
import LocalStorageService from "@/LocalStorageService";
import { handleRequest } from "@/utils/api";
import { paleteColors } from "@/assets/colors";
import QRCode from "qrcode";

export default {
  name: 'TicketView',
  
  data: () => ({ snackbar: false,
    sb_type: "",
    sb_message: "",
    sb_timeout: 2000,
    sb_title: "",
    sb_icon: "",
    paleteColors: paleteColors,
    loading: false,
    mostrarFila: false,
    permissions: "",
    dialogDelete: false,
    branch_id: "",
    tickets: [],
    currentTicket: {},
    nameUser: "",
    selectedBranch: {},
    data: {},
    seats: 0,
    branches: [],
    showTicketDialog: false,
    headers: [
      { title: "Código", key: "code" },
      { title: "Ruta", key: "routeCode" },
      { title: "Origen", key: "tripOrigin" },
      { title: "Destino", key: "tripDestination" },
      { title: "Fecha", key: "date" },
      { title: "Horario", key: "schedule" },
      { title: "Metodo", key: "method" },
      { title: "Pasajes", key: "quantity" },
      //{ title: "Adultos", key: "adults", },
      //{ title: "Menores", key: "minors", },
      { title: "Asientos", key: "seats" },
      { title: "Precio", key: "price" },
      { title: "Total", key: "total" },
      { title: "Acciones", key: "actions", sortable: false, width: "15%" },
    ],
    search: "",
    menu2: false,
    input2: null,
    selectRules: [(v) => !!v || "Seleccionar al menos un elemento"],
    ticketSortBy: "date",
    ticketSortOrder: "desc",
    role: null,
    pendingTicketId: null }),
  computed: { ticketCompanyImage() {
      return (
        this.getLocalStorageValue("imageBusiness") ||
        this.selectedBranch?.company?.image ||
        this.selectedBranch?.companyImage ||
        this.currentTicket?.companyImage ||
        this.selectedBranch?.image ||
        ""
      );
    },
    ticketCompanyName() {
      return (
        this.getLocalStorageValue("nameBusiness") ||
        this.selectedBranch?.company?.name ||
        this.selectedBranch?.companyName ||
        this.selectedBranch?.name ||
        "Empresa"
      );
    },
    dateFormattedSearch() {
      const date = this.input2 ? new Date(this.input2) : new Date();
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();
      return `${year}-${month}-${day}`;
    },
    sortedTickets() {
      return this.sortRows(this.tickets, this.ticketSortBy, this.ticketSortOrder, (row, field) =>
        this.getTicketSortValue(row, field)
      );
    } },
  
  mounted() {
    this.role = JSON.parse(LocalStorageService.getItem("role"));
    this.nameUser = JSON.parse(LocalStorageService.getItem("name"));
    this.permissions = LocalStorageService.getItem("permissions");
    if (this.hasPermission("view_tickets_company")) {
      this.showBranches();
      this.mostrarFila = true;
    } else {
      this.branch_id = LocalStorageService.getItem("branch_id");
      this.initialize();
    }
  },
  methods: { getLocalStorageValue(key) {
      const value = LocalStorageService.getItem(key);

      if (value === null || value === undefined || value === "") {
        return "";
      }

      try {
        return JSON.parse(value) || "";
      } catch (error) {
        return value;
      }
    },
    hasPermission(requiredPermissions) {
    const requested = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];
    let permissions = this.permissions || [];
    if (typeof permissions === 'string') {
      try { permissions = JSON.parse(permissions); } catch { permissions = permissions.split(',').map(value => value.trim()); }
    }
    return Array.isArray(permissions) && requested.some(permission => permissions.includes(permission));
  },
    getTableRowItem(item) {
      return item?.raw || item || {};
    },
    sortRows(rows = [], sortBy = "", sortOrder = "asc", valueGetter = () => null) {
      const direction = sortOrder === "desc" ? -1 : 1;

      return [...(Array.isArray(rows) ? rows : [])].sort((a, b) => {
        const rawA = valueGetter(a, sortBy);
        const rawB = valueGetter(b, sortBy);

        const numA = Number(rawA);
        const numB = Number(rawB);
        const canCompareAsNumbers =
          rawA !== null &&
          rawA !== undefined &&
          rawA !== "" &&
          rawB !== null &&
          rawB !== undefined &&
          rawB !== "" &&
          !Number.isNaN(numA) &&
          !Number.isNaN(numB);

        if (canCompareAsNumbers) {
          return (numA - numB) * direction;
        }

        return String(rawA ?? "")
          .localeCompare(String(rawB ?? ""), "es", {
            numeric: true,
            sensitivity: "base",
          }) * direction;
      });
    },
    ticketSortIcon(field) {
      if (this.ticketSortBy !== field) {
        return "mdi-swap-vertical";
      }

      return this.ticketSortOrder === "asc" ? "mdi-arrow-up" : "mdi-arrow-down";
    },
    toggleTicketSort(field) {
      if (this.ticketSortBy === field) {
        this.ticketSortOrder = this.ticketSortOrder === "asc" ? "desc" : "asc";
        return;
      }

      this.ticketSortBy = field;
      this.ticketSortOrder = "asc";
    },
    getTicketSortValue(row, field) {
      switch (field) {
        case "code":
          return row?.code ?? "";
        case "tripName":
          return row?.tripName ?? "";
        case "date":
          return row?.date ?? "";
        case "schedule":
          return row?.schedule ?? "";
        case "method":
          return row?.method ?? "";
        case "quantity":
          return Number(row?.quantity ?? 0);
        case "seats":
          return Number(row?.seats ?? 0);
        case "price":
          return Number(row?.price ?? 0);
        case "total":
          return Number(row?.total ?? 0);
        default:
          return row?.[field] ?? "";
      }
    },
    getTicketFareSegment(ticket) {
      const directSegment =
        ticket?.fareSegment ?? ticket?.fare_segment ?? ticket?.fareSegmentData ?? null;
      if (directSegment) {
        return directSegment;
      }

      const ticketItems = Array.isArray(ticket?.ticketItems) ? ticket.ticketItems : [];
      const firstItem = ticketItems[0] || null;
      const tripFare = firstItem?.tripFare || null;

      return (
        tripFare?.fareSegment ??
        tripFare?.fareSegmentTicketType?.fareSegment ??
        tripFare?.fare_segment?.fareSegment ??
        tripFare?.fareSegmentData ??
        null
      );
    },
    getFareSegmentRouteStopLabel(routeStop) {
      if (!routeStop) {
        return "No especificado";
      }

      if (typeof routeStop === "string") {
        return routeStop;
      }

      return (
        routeStop.location?.address ||
        routeStop.locationName ||
        routeStop.address ||
        routeStop.name ||
        routeStop.label ||
        "No especificado"
      );
    },
    getTicketRouteOriginLabel(ticket) {
      const fareSegment = this.getTicketFareSegment(ticket);
      if (fareSegment) {
        return this.getFareSegmentRouteStopLabel(
          fareSegment.originRouteStop ??
          fareSegment.origin_route_stop ??
          fareSegment.originStop ??
          fareSegment.origin
        );
      }

      return ticket?.tripOrigin ?? ticket?.origin ?? "No especificado";
    },
    getTicketRouteDestinationLabel(ticket) {
      const fareSegment = this.getTicketFareSegment(ticket);
      if (fareSegment) {
        return this.getFareSegmentRouteStopLabel(
          fareSegment.destinationRouteStop ??
          fareSegment.destination_route_stop ??
          fareSegment.destinationStop ??
          fareSegment.destination
        );
      }

      return ticket?.tripDestination ?? ticket?.destination ?? "No especificado";
    },
    getSaleModeLabel(ticket = {}) {
      const saleMode = String(ticket?.sale_mode || ticket?.saleMode || "normal").toLowerCase();
      return saleMode === "express" ? "Express" : "Full";
    },
    getSaleModeColor(ticket = {}) {
      const saleMode = String(ticket?.sale_mode || ticket?.saleMode || "normal").toLowerCase();
      return saleMode === "express" ? "secondary" : "primary";
    },
    formatNumber(value) {
      // Verificar si el valor es 0, null, undefined o no es un nÃºmero
      if (value === 0 || value === null || value === undefined || isNaN(value)) {
        return "0.0";
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

      // Convierte el valor a cadena con formato de nÃºmero local (en-US)
      let formattedValue = value.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      return formattedValue;
    },
    async showBranches() {
    this.loading = true;
    try {
      const result = await handleRequest({ endpoint: 'branch', method: 'GET' });
      this.branches = result.success && Array.isArray(result.data?.branches) ? result.data.branches : [];
      this.branch_id = this.branches[0]?.id ?? '';
      if (!result.success) this.showAlert('warning', result.message || 'No se pudieron cargar las sucursales.', 3000);
    } catch (error) {
      this.branches = [];
      this.branch_id = '';
      this.showAlert('error', 'No se pudieron cargar las sucursales.', 3000);
    } finally {
      this.loading = false;
    }
    await this.initialize();
  },
    updateDateSearch(val) {
      this.input2 = val;
      //this.editedItem.date = this.dateFormatted;
      this.menu2 = false;
      this.initialize();
    },
    async initialize() {
      if (!Number(this.branch_id)) {
        this.tickets = [];
        this.loading = false;
        return;
      }
      try {
        this.loading = true;
        this.data = {};
        const today = new Date();
        const formattedDate = today
          .toLocaleDateString("es-CL", {
            timeZone: "America/Santiago",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          })
          .split("-")
          .reverse()
          .join("-"); // Convierte "DD-MM-YYYY" a "YYYY-MM-DD"
        this.data.date = this.dateFormattedSearch;
        this.data.branch_id = Number(this.branch_id);
        const result = await handleRequest({
          endpoint: "get-tickets-date",
          method: "POST",
          data: this.data,
        });

        if (result.success) {
          // Si la solicitud es exitosa, asignamos las sucursales
          this.tickets = result.data?.tickets || [];
        } else {
          // Si no hay datos, asignamos un array vacÃ­o
          this.tickets = [];
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
    async generateQRCode() {
      try {
        const qrData = this.currentTicket.qr;

        if (!qrData) return;

        // Opciones comunes para ambos QR
        const qrOptions = {
          width: 150,
          margin: 1,
          color: {
            dark: "#000000",
            light: "#ffffff",
          },
        };

        // Generar QR original
        if (this.$refs.qrCanvasOriginal) {
          await QRCode.toCanvas(this.$refs.qrCanvasOriginal, qrData, qrOptions);
        }

        // Generar QR para copia de control
        if (this.$refs.qrCanvasControl) {
          await QRCode.toCanvas(this.$refs.qrCanvasControl, qrData, qrOptions);
        }
      } catch (error) {
        console.error("Error generando QR codes:", error);
        this.showAlert("error", "Error al generar códigos QR", 3000);
      }
    },
    async printerItem(item) {
      this.currentTicket = {};

      this.data = {};
      this.data.id = Number(item.id);
      //this.data.date = formattedDate;
      try {
        const result = await handleRequest({
          endpoint: "ticket-show",
          method: "POST",
          data: this.data,
        });

        if (result.success) {
          // Si la solicitud es exitosa, asignamos las sucursales
          this.currentTicket = result.data?.ticket || {};
        } else {
          // Si no hay datos, asignamos un array vacÃ­o
          this.currentTicket = {};
        }
      } catch (error) {
        this.showAlert(
          "error",
          "Ocurrió un error inesperado al procesar la solicitud.",
          3000
        );
      } finally {
        this.showTicketDialog = true;
        const branchIdBuscado = this.currentTicket.branch_id; // o el ID que necesitas comparar

        // Encuentra la branch que coincide
        const branchEncontrada = this.branches.find(
          (branch) => branch.id === branchIdBuscado
        );

        // Si necesitas la branch en this para usarla en el template
        this.selectedBranch = branchEncontrada || null;
        // Genera el QR despuÃ©s de que el componente se haya renderizado
        await this.$nextTick();
        await this.generateQRCode();
      }
    },
    async printTicket() {
      try {
        const printWindow = window.open("", "_blank");

        // Generar ambos cÃ³digos QR
        let qrImageOriginal = "";
        let qrImageControl = "";
        const qrData = this.currentTicket.qr || this.currentTicket.id;

        if (qrData) {
          qrImageOriginal = await QRCode.toDataURL(qrData, {
            width: 150,
            margin: 1,
            color: {
              dark: "#000000",
              light: "#ffffff",
            },
          });
          qrImageControl = qrImageOriginal; // Usamos el mismo QR para ambas secciones
        }

        const ticketCompanyImage = this.ticketCompanyImage;
        const ticketCompanyName = this.ticketCompanyName;
        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Ticket de Viaje</title>
                <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 10px;
                    font-size: 14px;
                }
                .ticket-container {
                    max-width: 100%;
                    margin: 0 auto;
                }
                .header {
                    text-align: center;
                    margin-bottom: 15px;
                }
                .branch-logo {
                        width: 150px;
                        height: 80px;
                        margin: 0 auto 10px;
                        display: block;
                        object-fit: contain;
                    }

                    @media print {
                        body {
                            padding: 5px;
                        }
                        .branch-logo {
                            width: 150px !important;
                            height: 80px !important;
                            margin: 0 auto 8px !important;
                        }
                    }
                .branch-name {
                    font-size: 1.25rem;
                    font-weight: bold;
                    margin-bottom: 5px;
                }
                .branch-info {
                    font-size: 0.875rem;
                    margin-bottom: 3px;
                }
                .dashed-divider {
                    border-top: 1px dashed #000;
                    width: 100%;
                    margin: 15px 0;
                }
                .detail-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 8px;
                }
                .font-weight-medium {
                    font-weight: 500;
                }
                .font-weight-bold {
                    font-weight: bold;
                }
                .mr-1 {
                    margin-right: 4px;
                }
                .mb-1 {
                    margin-bottom: 4px;
                }
                .mb-3 {
                    margin-bottom: 12px;
                }
                .my-3 {
                    margin-top: 12px;
                    margin-bottom: 12px;
                }
                .text-center {
                    text-align: center;
                }
                .caption {
                    font-size: 0.75rem;
                }
                .uppercase-text {
                    text-transform: uppercase;
                }
                .ticket-details {
                    margin-bottom: 15px;
                }
                .control-copy-title {
                    font-style: italic;
                    margin-bottom: 8px;
                }
                @page {
                    size: auto;
                    margin: 0;
                }
                @media print {
                    body {
                    padding: 5px;
                    }
                }
                </style>
            </head>
            <body>
                <div class="ticket-container">
                <!-- Encabezado con logo e informaciÃ³n de sucursal -->
                <div class="header">
                    ${ticketCompanyImage
            ? `
                    <img src="${this.$axios.defaults.baseURL}images/${ticketCompanyImage}" 
                        class="branch-logo" 
                        alt="${ticketCompanyName}">
                    `
            : ""
          }
                    
                    <div class="branch-name">${this.selectedBranch?.name || "Nombre Sucursal"
          }</div>
                    
                    ${this.selectedBranch?.rut
            ? `
                    <div class="branch-info">RUT: ${this.selectedBranch.rut}</div>
                    `
            : ""
          }
                    
                    ${this.selectedBranch?.address
            ? `
                    <div class="branch-info">Dirección: ${this.selectedBranch.address}</div>
                    `
            : ""
          }
                    
                    ${this.selectedBranch?.phone
            ? `
                    <div class="branch-info">Teléfono: ${this.selectedBranch.phone}</div>
                    `
            : ""
          }
                    
                    <div class="branch-info">Folio N° ${this.currentTicket.id}</div>
                </div>
                
                <!-- Ticket original -->
                <div class="detail-row">
                    <div class="font-weight-medium">Fecha: ${this.currentTicket.date
          }</div>
                    <div class="font-weight-medium">Hora: ${this.currentTicket.schedule || "--:--"
          }</div>
                </div>
                
                <div class="mb-3">
                    <div class="detail-row">
                    <div class="font-weight-bold">Recorrido:</div>
                    <div class="ticket-sale-mode ticket-sale-mode--${String(this.currentTicket.sale_mode || this.currentTicket.saleMode || "normal").toLowerCase()}">${this.getSaleModeLabel(this.currentTicket)}</div>
                    </div>
                    <div>
                    <span class="font-weight-medium mr-1">Origen:</span>
                    <span>${this.currentTicket.tripOrigin || "No especificado"}</span>
                    </div>
                    <div>
                    <span class="font-weight-medium mr-1">Destino:</span>
                    <span>${this.currentTicket.tripDestination || "No especificado"
          }</span>
                    </div>
                </div>
                
                <div class="ticket-details">
                    <div class="d-flex align-center mb-1">
                    <span class="font-weight-medium mr-1">Precio:</span>
                    <span>$${this.formatNumber(this.currentTicket.total)}</span>
                    </div>
                    <div class="d-flex align-center mb-1">
                    <span class="font-weight-medium mr-1">Medio de pago:</span>
                    <span>${this.currentTicket.method}</span>
                    </div>
                </div>
                
                <br>
                
                ${qrImageOriginal
            ? `
                    <div class="text-center">
                    <img src="${qrImageOriginal}" style="width: 150px; height: 150px;">
                    </div>
                `
            : ""
          }
                
                <br>
                
                <!-- LÃ­nea divisoria -->
                <div class="dashed-divider"></div>
                
                <!-- Copia de control -->
                <div class="text-center caption control-copy-title">
                    -Copia de control-
                    <div class="branch-info">Folio N° ${this.currentTicket.id}</div>
                </div>
                
                <div class="detail-row">
                    <div class="font-weight-medium">Fecha: ${this.currentTicket.date
          }</div>
                    <div class="font-weight-medium">Hora: ${this.currentTicket.schedule || "--:--"
          }</div>
                </div>
                
                <div class="mb-3">
                    <div class="detail-row">
                    <div class="font-weight-bold">Recorrido:</div>
                    <div class="ticket-sale-mode ticket-sale-mode--${String(this.currentTicket.sale_mode || this.currentTicket.saleMode || "normal").toLowerCase()}">${this.getSaleModeLabel(this.currentTicket)}</div>
                    </div>
                    <div>
                    <span class="font-weight-medium mr-1">Origen:</span>
                    <span>${this.currentTicket.tripOrigin || "No especificado"}</span>
                    </div>
                    <div>
                    <span class="font-weight-medium mr-1">Destino:</span>
                    <span>${this.currentTicket.tripDestination || "No especificado"
          }</span>
                    </div>
                </div>
                
                <div class="ticket-details">
                    <div class="d-flex align-center mb-1">
                    <span class="font-weight-medium mr-1">Precio:</span>
                    <span>$${this.formatNumber(this.currentTicket.total)}</span>
                    </div>
                    <div class="d-flex align-center mb-1">
                    <span class="font-weight-medium mr-1">Medio de pago:</span>
                    <span>${this.currentTicket.method}</span>
                    </div>
                </div>
                
                <br>
                
                ${qrImageControl
            ? `
                    <div class="text-center">
                    <img src="${qrImageControl}" style="width: 150px; height: 150px;">
                    </div>
                `
            : ""
          }
                
                <br>
                
                <!-- Nota de impresiÃ³n -->
                
                
                ${this.currentTicket.print >= 1
            ? `
                    <div class="text-center caption mt-2 uppercase-text">
                    (COPIA REIMPRESA POR EL OPERADOR ${this.nameUser})
                    </div>
                `
            : ""
          }
                </div>
                
                <script>
                setTimeout(() => {
                    window.print();
                    window.close();
                }, 300);
                <\/script>
            </body>
            </html>
            `;

        printWindow.document.open();
        printWindow.document.write(printContent);
        printWindow.document.close();
      } catch (error) {
        console.error("Error al imprimir:", error);
        this.showAlert("error", "Error al imprimir el ticket", 3000);
      }
    },
    deleteItem(item) { this.pendingTicketId = item.id; this.dialogDelete = true; },
    closeDelete() { this.dialogDelete = false; this.pendingTicketId = null; },
    async deleteItemConfirm() {
      this.loading = true;
      try {
        let request = {
          id: this.pendingTicketId,
        };
        const result = await handleRequest({
          endpoint: "ticket-destroy",
          method: "POST",
          data: request,
        });

        // Manejo de la respuesta segÃƒÂºn el resultado
        if (result.success) {
          this.showAlert("success", result.message, 3000);
          await this.initialize();
        } else {
          this.showAlert("warning", result.message, 3000);
          this.loading = false;
        }
      } catch (error) {
        // Este bloque captura errores inesperados fuera del manejo estÃƒÂ¡ndar
        this.showAlert(
          "error",
          "Ocurrió un error inesperado al procesar la solicitud.",
          3000
        );
        this.loading = false;
      } finally {
        this.loading = false;
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
    } }
};
</script>
<style scoped>
.payment-method-disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.selected-efectivo {
  border-color: #388e3c !important;
  background-color: rgba(56, 142, 60, 0.05) !important;
}

.selected-debito {
  border-color: #5e35b1 !important;
  background-color: rgba(94, 53, 177, 0.05) !important;
}

.selected-credito {
  border-color: #1976d2 !important;
  background-color: rgba(25, 118, 210, 0.05) !important;
}

.payment-method-content {
  width: 100%;
  height: 100%;
  gap: 0;
}

.payment-method-label {
  width: 100%;
  font-size: 0.72rem;
  line-height: 1.05;
  white-space: normal;
  word-break: break-word;
  overflow-wrap: anywhere;
}

.payment-methods-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}

.ticket-total-preview {
  line-height: 1.1;
}

.ticket-price-pill {
  display: inline-flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  padding: 8px 12px;
  border-radius: 12px;
  background: rgba(25, 118, 210, 0.08);
  border: 1px solid rgba(25, 118, 210, 0.12);
  min-width: 140px;
}

.trip-sale-sheet {
  overflow: hidden;
}

.trip-sale-subtitle {
  opacity: 0.88;
  color: rgba(255, 255, 255, 0.92);
}

.trip-sale-panel {
  border-color: #d9e1ef;
  background: #ffffff;
  overflow: hidden;
}

.trip-sale-panel__header,
.trip-sale-panel__row {
  display: grid;
  grid-template-columns: 1.85fr 0.78fr 0.9fr 1fr 0.72fr 0.72fr;
  gap: 10px;
  align-items: center;
}

.trip-sale-panel__header {
  padding: 6px 14px;
  background: linear-gradient(180deg, #f7f9fc 0%, #eef3fb 100%);
  border-bottom: 1px solid #d9e1ef;
  font-weight: 700;
  font-size: 14px;
  color: #1f2a44;
}

.trip-sale-panel__row {
  padding: 6px 14px;
  border-bottom: 1px solid #e5eaf2;
  cursor: pointer;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease;
}

.trip-sale-panel__row:last-child {
  border-bottom: none;
}

.trip-sale-panel__row:hover {
  border-color: rgba(25, 118, 210, 0.28);
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.08);
  background: #fafcff;
}

.trip-sale-panel__row--selected {
  border-color: rgba(25, 118, 210, 0.42);
  background: rgba(25, 118, 210, 0.04);
}

.trip-sale-col {
  min-width: 0;
}

.trip-sale-col--route {
  min-width: 0;
}

.trip-sale-col--schedule,
.trip-sale-col--arrival,
.trip-sale-col--vehicle,
.trip-sale-col--price,
.trip-sale-col--actions {
  min-width: 0;
}

.trip-sale-col--price {
  max-width: 130px;
}

.trip-sale-col--actions {
  justify-self: end;
}

.trip-sale-summary {
  overflow: hidden;
  background: #fff;
}

.trip-sale-summary__header {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  border-bottom: 1px solid #e5e7eb;
  background: #f8fafc;
}

.trip-sale-summary__body {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  padding: 12px 16px;
}

.trip-sale-summary__item {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-start;
}

.trip-sale-summary__label {
  font-size: 0.7rem;
  color: rgba(0, 0, 0, 0.55);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  line-height: 1.1;
  display: block;
}

.trip-sale-summary__value {
  font-size: 0.92rem;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.87);
  min-width: 0;
  line-height: 1.2;
  display: block;
}

.trip-sale-row-meta {
  line-height: 1.1;
  margin-top: 1px;
}

.trip-sale-panel .v-chip {
  height: 28px;
}

@media (max-width: 960px) {
  .trip-sale-summary__body {
    grid-template-columns: 1fr;
  }
}

.v-icon {
  transition: all 0.3s ease;
}

.seat-container {
  position: relative;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 44px;
  height: 44px;
  cursor: pointer;
  margin: 6px;
  transition: all 0.2s ease;
}



.seat-number {
  position: absolute;

  top: 30%;
  left: 50%;

  transform: translate(-50%, -50%);

  min-width: 18px;

  text-align: center;

  font-size: 14px;
  font-weight: 900;

  color: #000;

  -webkit-text-stroke: 0.8px #fff;

  line-height: 1;

  font-variant-numeric: tabular-nums;

  pointer-events: none;
}


/* Indicador de pasillo */
.aisle-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

/* Colores para diferentes estados */






/* Efecto hover para asientos disponibles */
.seat-available:hover {
  transform: scale(1.1);
  box-shadow: 0 0 8px rgba(76, 175, 80, 0.5);
}

/* NÃºmeros mÃ¡s oscuros en asientos claros */
.seat-available .seat-number,
.seat-available .aisle-indicator,
.seat-aisle .aisle-indicator {
  color: #fefefe;
  font-weight: bold;
  padding-top: 8px;
  border: #fbfbfb;
}

/* NÃºmeros claros en asientos oscuros */
.seat-selected .seat-number,
.seat-reserved .seat-number {
  color: #ffffff;
  font-weight: bold;
  padding-top: 8px;
  border: #ffffff;
}

@media (max-width: 768px) {
  .payment-methods-grid {
    gap: 6px;
    justify-content: space-between;
  }



  .payment-method-label {
    font-size: 0.68rem;
  }

  .ticket-total-preview {
    font-size: 0.72rem;
  }

  .ticket-price-pill {
    min-width: 120px;
    padding: 6px 10px;
  }

  .seat-container {
    width: 40px;
    height: 40px;
    margin: 4px;
  }

  .seat-icon,
  .aisle-icon {
    font-size: 32px !important;
  }

  .seat-number,
  .aisle-indicator {
    font-size: 12px;
  }

  /* Ajuste fino para mÃ³viles */
  .seat-number {
    top: 28%;
    /* Puedes ajustar este valor segÃºn necesidad */
  }
}

.icono-concavo {
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  color: white;
  /* Mantenemos solo el efecto cÃ³ncavo en el Ã­cono 
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



.ticket-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.ticket-header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.ticket-filter {
  width: 260px;
  min-width: 260px;
}

.ticket-date-filter {
  width: 180px;
  min-width: 180px;
}

.ticket-search {
  width: 300px;
  min-width: 260px;
}

.ticket-col-code {
  width: 16%;
  min-width: 0;
}

.ticket-sortable-header {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  user-select: none;
}

.ticket-sortable-header:hover {
  color: #0f172a;
}

.ticket-col-route {
  width: 28%;
  min-width: 0;
}

.ticket-col-date {
  width: 10%;
  min-width: 0;
}

.ticket-col-schedule {
  width: 10%;
  min-width: 0;
}

.ticket-col-method {
  width: 8%;
  min-width: 0;
}

.ticket-col-quantity {
  width: 6%;
  min-width: 0;
}

.ticket-col-seats {
  width: 10%;
  min-width: 0;
}

.ticket-col-price {
  width: 8%;
  min-width: 0;
}

.ticket-col-total {
  width: 8%;
  min-width: 0;
}

.ticket-col-actions {
  width: 10%;
  min-width: 0;
}

.ticket-row {
  min-height: 66px;
}

.ticket-code-cell {
  flex-direction: column;
  align-items: flex-start !important;
  justify-content: center;
  gap: 2px;
  text-align: left;
}

.ticket-code-value {
  display: block;
  max-width: 100%;
  font-size: 12px;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: 0.02em;
  text-align: left;
}

.ticket-route-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.ticket-route-main {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
}

.ticket-route-code-chip {
  max-width: 100%;
  font-size: 11px;
  letter-spacing: 0.02em;
}

.ticket-route-meta {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  margin-top: 4px;
  font-size: 12px;
  color: #64748b;
  min-width: 0;
}

.ticket-method-chip {
  max-width: 100%;
  padding: 3px 9px;
  border-radius: 999px;
  background: #eef2ff;
  color: #3730a3;
  font-size: 12px;
  font-weight: 700;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.ticket-money {
  font-size: 13px;
  font-weight: 700;
  color: #374151;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ticket-money-total {
  color: #15803d;
  font-weight: 800;
}

.ticket-sale-dialog {
  height: 100vh;
}

.ticket-sale-stepper {
  max-height: calc(100vh - 72px);
  overflow-y: auto;
}

.ticket-sale-step-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.ticket-print-card {
  border-radius: 18px;
  overflow: hidden;
}

.ticket-print-header {
  position: relative;
}

.ticket-print-button {
  position: absolute;
  right: 16px;
  top: 16px;
}

.ticket-branch-logo-preview {
  width: 150px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
}

.ticket-branch-logo-preview__img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.ticket-sale-mode {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: uppercase;
}

.ticket-sale-mode--express {
  background: #e0e7ff;
  color: #4338ca;
}

.ticket-sale-mode--normal {
  background: #dcfce7;
  color: #166534;
}

.busgo-dialog-card {
  border-radius: 18px;
  overflow: hidden;
}

.busgo-dialog-actions {
  padding: 14px 18px;
  background: #f8fafc;
}

.min-width-0 {
  min-width: 0;
}

@media (max-width: 960px) {
  .ticket-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .ticket-filter,
  .ticket-date-filter,
  .ticket-search {
    width: 100%;
    min-width: 100%;
  }

  .ticket-col-route,
  .ticket-col-date,
  .ticket-col-schedule,
  .ticket-col-method,
  .ticket-col-quantity,
  .ticket-col-seats,
  .ticket-col-price,
  .ticket-col-total,
  .ticket-col-actions {
    width: 100%;
  }

  .ticket-route-meta {
    flex-wrap: wrap;
  }
}

.ticket-sale-dialog-pro {
  min-height: 100vh;
  background: #f8fafc;
}

.ticket-sale-topbar {
  min-height: 76px;
  padding: 14px 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  color: #ffffff;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 55%, #334155 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.ticket-sale-topbar__left {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}

.ticket-sale-topbar__icon {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.14);
  display: flex;
  align-items: center;
  justify-content: center;
}

.ticket-sale-topbar__title {
  font-size: 19px;
  font-weight: 800;
  line-height: 1.2;
}

.ticket-sale-topbar__subtitle {
  font-size: 13px;
  opacity: 0.78;
  margin-top: 3px;
}

.ticket-sale-step-chip {
  background: rgba(255, 255, 255, 0.14) !important;
  color: #ffffff !important;
  font-weight: 700 !important;
}

.ticket-sale-close {
  color: #ffffff !important;
}

.ticket-sale-body {
  padding: 20px 24px 24px !important;
}

.ticket-sale-stepper-pro {
  background: transparent !important;
  box-shadow: none !important;
}

.ticket-sale-layout {
  max-width: 1480px;
  margin: 0 auto;
}

.ticket-sale-section-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 22px;
  padding: 18px;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
}

.ticket-sale-fill {
  height: 100%;
}

.ticket-sale-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.ticket-sale-section-title {
  font-size: 16px;
  font-weight: 800;
  color: #0f172a;
}

.ticket-sale-section-subtitle {
  font-size: 13px;
  color: #64748b;
  margin-top: 2px;
}

.ticket-sale-mini-icon {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  background: #eef2ff;
  color: #0f172a;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.ticket-sale-label {
  display: block;
  font-size: 12px;
  font-weight: 800;
  color: #475569;
  margin-bottom: 7px;
}

.ticket-location-option {
  padding: 12px 14px !important;
}

.ticket-location-option__title {
  font-size: 13px;
  font-weight: 800;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ticket-location-option__subtitle {
  font-size: 12px;
  color: #64748b;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.trip-sale-panel-pro {
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  overflow: hidden;
  background: #ffffff;
}

.trip-sale-panel-pro__header {
  display: grid;
  grid-template-columns: 1.2fr 2.4fr 0.75fr 0.75fr 0.75fr 0.7fr 0.75fr 0.75fr;
  gap: 12px;
  padding: 13px 16px;
  background: #f1f5f9;
  color: #475569;
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.trip-sale-sortable-header {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  user-select: none;
}

.trip-sale-sortable-header:hover {
  color: #0f172a;
}

.trip-sale-row-pro {
  display: grid;
  grid-template-columns: 1.2fr 2.4fr 0.75fr 0.75fr 0.75fr 0.7fr 0.75fr 0.75fr;
  gap: 12px;
  align-items: center;
  padding: 15px 16px;
  border-top: 1px solid #e5e7eb;
  cursor: pointer;
  transition: 0.18s ease;
}

.trip-sale-row-pro:hover {
  background: #f8fafc;
}

.trip-sale-row-pro--selected {
  background: #eef2ff;
  border-left: 4px solid #0f172a;
}

.trip-sale-route {
  min-width: 0;
}

.trip-sale-code {
  font-size: 12px;
  font-weight: 800;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.trip-sale-route__title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.trip-sale-route__name {
  font-size: 12px;
  font-weight: 800;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.trip-sale-route-code-chip {
  max-width: 100%;
  font-size: 12px;
  letter-spacing: 0.02em;
}

.trip-sale-route__meta,
.trip-sale-muted {
  font-size: 12px;
  color: #64748b;
  margin-top: 2px;
}

.trip-sale-strong {
  font-size: 12px;
  font-weight: 800;
  color: #0f172a;
}

.trip-sale-price {
  font-size: 14px;
  font-weight: 900;
  color: #0f172a;
  white-space: nowrap;
}

.ticket-sale-empty {
  padding: 38px 20px;
  text-align: center;
  color: #94a3b8;
}

.ticket-sale-empty__title {
  font-size: 15px;
  font-weight: 800;
  color: #475569;
  margin-top: 10px;
}

.ticket-sale-empty__text {
  font-size: 13px;
  margin-top: 3px;
}

.ticket-sale-footer-actions {
  position: sticky;
  bottom: 0;
  z-index: 5;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 18px;
  padding: 16px 0 0;
  background: linear-gradient(180deg, rgba(248, 250, 252, 0) 0%, #f8fafc 32%);
}

.ticket-sale-btn-secondary {
  background: #f1f5f9 !important;
  color: #475569 !important;
  border-radius: 13px !important;
  text-transform: none !important;
  font-weight: 800 !important;
  min-width: 130px;
}

.ticket-sale-btn-primary {
  background: #0f172a !important;
  color: #ffffff !important;
  border-radius: 13px !important;
  text-transform: none !important;
  font-weight: 900 !important;
  min-width: 150px;
}

.ticket-sale-btn-primary.v-btn--disabled {
  background: #cbd5e1 !important;
  color: #ffffff !important;
}

.ticket-sale-summary-pro {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 22px;
  padding: 18px;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
}

.ticket-sale-summary-grid {
  display: grid;
  grid-template-columns: 1.5fr 1.5fr 1fr 1fr;
  gap: 12px;
  margin-top: 16px;
}

.ticket-sale-summary-grid div {
  min-width: 0;
  padding: 13px 14px;
  border-radius: 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.ticket-sale-summary-grid span {
  display: block;
  font-size: 11px;
  font-weight: 800;
  color: #64748b;
  margin-bottom: 4px;
}

.ticket-sale-summary-grid strong {
  display: block;
  font-size: 13px;
  font-weight: 900;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ticket-type-list {
  max-height: 58vh;
  overflow-y: auto;
  padding-right: 4px;
}

.ticket-type-card {
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 13px;
  margin-bottom: 10px;
  background: #ffffff;
}

.ticket-type-card__main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.ticket-type-card__title {
  font-size: 14px;
  font-weight: 900;
  color: #0f172a;
}

.ticket-type-card__price {
  font-size: 12px;
  color: #64748b;
  margin-top: 2px;
}

.ticket-type-card__input {
  max-width: 96px;
}

.ticket-type-card__total {
  margin-top: 10px;
  padding: 9px 11px;
  border-radius: 12px;
  background: #eef2ff;
  color: #0f172a;
  font-size: 12px;
  font-weight: 700;
}

.seat-row {
  display: flex;
  flex-direction: row;
  gap: 6px;
}

.seat-container {
  position: relative;
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: 0.16s ease;
}

.seat-container:hover {
  transform: translateY(-1px);
}

.seat-available {
  background: #e0f2fe;
  color: #0369a1;
}

.seat-selected {
  background: #dcfce7 !important;
  color: #15803d !important;
  box-shadow: 0 0 0 2px rgba(21, 128, 61, 0.22);
}

.seat-reserved {
  background: #fee2e2 !important;
  color: #b91c1c !important;
  cursor: not-allowed;
  opacity: 0.8;
}

.seat-disabled {
  background: #e2e8f0 !important;
  color: #334155 !important;
  cursor: not-allowed;
  opacity: 0.7;
}

.seat-aisle {
  background: transparent !important;
  color: #cbd5e1 !important;
  cursor: default;
}

.seat-number {
  position: absolute;
  bottom: 4px;
  right: 6px;
  font-size: 12px;
  font-weight: 900;
}

.payment-methods-grid-pro {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

.payment-method-card-pro {
  border-radius: 16px !important;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  transition: 0.16s ease;
}

.payment-method-card-pro:hover {
  transform: translateY(-1px);
}

.payment-method-content-pro {
  min-height: 72px;
  padding: 12px !important;
  display: flex;
  align-items: center;
  gap: 12px;
}

.payment-method-label {
  font-size: 13px;
  font-weight: 900;
  color: #0f172a;
}

.payment-method-disabled {
  opacity: 0.45;
  pointer-events: none;
}

.ticket-total-box {
  margin-top: 16px;
  padding: 16px;
  border-radius: 18px;
  background: #0f172a;
  color: #ffffff;
}

.ticket-total-box span {
  display: block;
  font-size: 12px;
  opacity: 0.75;
  margin-bottom: 4px;
}

.ticket-total-box strong {
  display: block;
  font-size: 20px;
  font-weight: 900;
}

@media (max-width: 960px) {
  .ticket-sale-summary-grid {
    grid-template-columns: 1fr 1fr;
  }

  .trip-sale-panel-pro__header {
    display: none;
  }

  .trip-sale-row-pro {
    grid-template-columns: 1fr;
    gap: 8px;
    padding: 16px;
  }

  .ticket-col-code,
  .ticket-col-route,
  .ticket-col-date,
  .ticket-col-schedule,
  .ticket-col-method,
  .ticket-col-quantity,
  .ticket-col-seats,
  .ticket-col-price,
  .ticket-col-total,
  .ticket-col-actions {
    width: 100%;
  }

  .ticket-route-title-row,
  .trip-sale-route__title-row {
    flex-wrap: wrap;
  }
}

@media (max-width: 600px) {
  .ticket-sale-topbar {
    padding: 14px 16px;
  }

  .ticket-sale-topbar__subtitle,
  .ticket-sale-step-chip {
    display: none;
  }

  .ticket-sale-body {
    padding: 14px !important;
  }

  .ticket-sale-section-card,
  .ticket-sale-summary-pro {
    border-radius: 18px;
    padding: 14px;
  }

  .ticket-sale-summary-grid {
    grid-template-columns: 1fr;
  }

  .ticket-sale-footer-actions {
    gap: 8px;
  }

  .ticket-sale-btn-secondary,
  .ticket-sale-btn-primary {
    flex: 1;
    min-width: 0;
  }
}

.seat-map-shell {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 14px;
  border-radius: 18px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.seat-map-scroll {
  width: 100%;
  max-height: 430px;
  overflow-y: auto;
  overflow-x: auto;
  padding: 6px;
}

.seat-map-preview {
  width: max-content;
  min-width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: center;
}

/* Identidad BusGo: mismas medidas, tipografía y acciones que Vehículos. */
.ticket-view { min-height:100%; color:#1e293b; background:#f6f8fb; }
.busgo-page-header { display:flex; align-items:center; gap:11px; min-height:70px; padding:12px 24px; background:#fff; border-bottom:1px solid #e8edf5; border-radius:0!important; }
.busgo-page-icon { flex:0 0 38px; width:38px!important; height:38px!important; color:#fff!important; background:linear-gradient(135deg,#0e1f46,#2454d6)!important; border-radius:10px!important; box-shadow:0 5px 12px #2454d62b; }
.busgo-page-title { color:#0f172a; font-size:19px; font-weight:850; line-height:1.2; }
.busgo-page-subtitle { margin-top:3px; color:#526176; font-size:12px; font-weight:650; }
.busgo-add-btn,.ticket-sale-btn-primary { min-height:40px; color:#fff!important; background:linear-gradient(100deg,#2454d6,#3266e4)!important; border-radius:9px!important; font-size:12.5px; font-weight:800; letter-spacing:0; text-transform:none; box-shadow:0 5px 12px #2454d633!important; }
.ticket-header-actions .busgo-add-btn:last-child:not(:first-child) { background:#eef3ff!important; color:#2454d6!important; box-shadow:none!important; border:1px solid #dce6ff; }
.busgo-container { padding:18px 24px 28px!important; }
.busgo-card { overflow:hidden; background:#fff; border:1px solid #e8edf5; border-radius:13px!important; box-shadow:0 5px 18px #0f172a0a!important; }
.busgo-card-header { display:flex; align-items:center; min-height:69px; padding:12px 17px; }
.busgo-card-title { color:#0f172a; font-size:15px; font-weight:850; }
.busgo-card-subtitle { margin-top:3px; color:#64748b; font-size:11px; font-weight:650; }
.ticket-toolbar { padding:0 17px 13px!important; gap:9px; }
.ticket-toolbar :deep(.v-field) { border-radius:9px; color:#1e293b; font-size:12px; background:#fff; }
.ticket-toolbar :deep(.v-field__outline) { color:#dce3ed; }
.ticket-toolbar :deep(.v-field__input) { font-size:13px; font-weight:600; }
.ticket-toolbar :deep(.v-field__prepend-inner) { color:#64748b; opacity:1; }
.ticket-list-table { color:#1e293b; background:#fff; }
.ticket-list-table :deep(.v-table__wrapper > table) { min-width:1240px; }
.ticket-list-table :deep(thead) { display:table-header-group!important; }
.ticket-list-table :deep(th.ticket-header-shell) { padding:0!important; height:40px!important; border:0!important; }
.busgo-table-head,.ticket-row { display:grid!important; grid-template-columns:1.05fr 2.5fr 1fr .8fr 1fr .6fr 1fr .85fr .95fr 86px; align-items:center!important; gap:12px!important; min-width:1240px; margin:0!important; padding:10px 17px!important; border-radius:0!important; }
.busgo-table-head > div,.ticket-row > div { width:auto!important; min-width:0; }
.busgo-table-head { min-height:40px; color:#334155; font-size:11px; font-weight:850; letter-spacing:.04em; text-transform:uppercase; background:#f8fafc; border-bottom:1px solid #e8edf5; }
.ticket-row { min-height:66px; background:#fff; border:0; border-bottom:1px solid #eef2f6; color:#1e293b; font-size:13px; font-weight:600; }
.ticket-row:hover { background:#f8faff; }
.ticket-list-table :deep(tbody td) { padding:0!important; border:0!important; }
.ticket-list-table :deep(.v-data-table-footer) { min-height:52px; padding:6px 16px; color:#334155; font-size:11.5px; font-weight:700; }
.ticket-sortable-header:hover { color:#2454d6; }
.busgo-meta { display:flex; align-items:center; gap:6px; color:#334155; font-size:13px; }
.ticket-code-value,.ticket-route-main { color:#0f172a; font-size:13px; font-weight:800; }
.ticket-route-meta { display:grid; grid-template-columns:14px minmax(0,1fr); gap:3px 5px; align-items:center; margin-top:5px; color:#526176; font-size:12px; }
.ticket-route-meta :deep(.mx-2) { margin:0!important; }
.ticket-route-meta > span { white-space:normal; overflow-wrap:anywhere; }
.ticket-route-title-row { flex-wrap:wrap; gap:5px; }
.ticket-method-chip { display:inline-flex; padding:4px 7px; color:#475569; background:#f1f5f9; border-radius:7px; font-size:11.5px; font-weight:750; }
.ticket-money { color:#334155; font-size:13px; font-weight:700; font-variant-numeric:tabular-nums; }
.ticket-money-total { color:#183d9c; font-weight:850; }
.busgo-actions { display:flex; justify-content:flex-end; gap:2px; }
.ticket-action { border-radius:8px!important; }
.ticket-action--print { color:#2454d6!important; }
.ticket-action--print:hover { background:#eef3ff; }
.ticket-action--delete { color:#dc2626!important; }
.ticket-action--delete:hover { background:#fff1f2; }
.ticket-sale-dialog-pro { height:100dvh; min-height:0; display:flex; flex-direction:column; color:#1e293b; background:#f6f8fb; }
.ticket-sale-topbar { flex-shrink:0; min-height:72px; padding:11px 22px; background:linear-gradient(110deg,#0e1f46,#173b8f 58%,#2454d6); }
.ticket-sale-topbar__icon { width:40px; height:40px; border-radius:10px; }
.ticket-sale-topbar__title { font-size:17px; font-weight:850; }
.ticket-sale-topbar__subtitle { color:#dbe7ff; font-size:12px; opacity:1; }
.ticket-sale-body { flex:1; min-height:0; overflow-y:auto; padding:0 22px 20px!important; }
.ticket-sale-stepper-pro :deep(.v-stepper-header) { position:sticky; top:0; z-index:4; min-height:64px; background:#f6f8fb; box-shadow:none; border-bottom:1px solid #e1e8f1; }
.ticket-sale-stepper-pro :deep(.v-stepper-item) { padding:14px 18px; }
.ticket-sale-stepper-pro :deep(.v-stepper-item__title) { font-size:13px; color:#475569; font-weight:750; }
.ticket-sale-stepper-pro :deep(.v-stepper-item--selected .v-stepper-item__avatar) { color:#fff; background:#2454d6; }
.ticket-sale-stepper-pro :deep(.v-stepper-window) { margin:18px 0 0; }
.ticket-sale-section-card,.ticket-sale-summary-pro { border:1px solid #e4eaf2; border-radius:13px; padding:18px; box-shadow:0 5px 18px #0f172a0a; }
.ticket-sale-section-header { margin-bottom:16px; }
.ticket-sale-section-title { color:#0f172a; font-size:15px; font-weight:850; }
.ticket-sale-section-subtitle { color:#526176; font-size:12px; line-height:1.5; }
.ticket-sale-mini-icon { width:36px; height:36px; border-radius:9px; background:#eef3ff; color:#2454d6; }
.ticket-sale-label { color:#475569; font-size:12px; font-weight:750; }
.ticket-sale-dialog-pro :deep(.v-field) { background:#fff; border-radius:9px!important; }
.ticket-sale-dialog-pro :deep(.v-field__outline) { color:#d6dee9; }
.ticket-sale-dialog-pro :deep(.v-field__input),.ticket-sale-dialog-pro :deep(.v-label) { color:#1e293b; font-size:14px; font-weight:600; opacity:1; }
.ticket-sale-dialog-pro :deep(.v-field__prepend-inner .v-icon) { color:#64748b; opacity:1; }
:global(.ticket-location-menu .v-list) { padding:6px; border:1px solid #e2e8f0; border-radius:11px; background:#fff; }
:global(.ticket-location-menu .v-list-item) { margin:3px 0; padding:11px 12px!important; border-radius:8px; }
:global(.ticket-location-menu .v-list-item--active) { background:#eef3ff; color:#2454d6; }
.ticket-location-option__title { white-space:normal; overflow-wrap:anywhere; color:#1e293b; font-size:14px; line-height:1.45; }
.ticket-location-option__subtitle { white-space:normal; color:#526176; font-size:12px; line-height:1.5; }
.trip-sale-panel-pro { border:1px solid #e8edf5; border-radius:10px; overflow-x:auto; }
.trip-sale-panel-pro__header,.trip-sale-row-pro { display:grid!important; grid-template-columns:1fr 2.2fr .8fr .8fr 1fr .8fr 1fr 1fr; min-width:1000px; gap:12px; padding:12px 16px; }
.trip-sale-panel-pro__header { min-height:40px; align-items:center; color:#334155; background:#f8fafc; font-size:11px; font-weight:850; letter-spacing:.04em; }
.trip-sale-row-pro { min-height:66px; border:0; border-bottom:1px solid #eef2f6; }
.trip-sale-row-pro--selected { background:#eef3ff; box-shadow:inset 3px 0 #2454d6; }
.trip-sale-code,.trip-sale-route__name,.trip-sale-strong { font-size:13px; color:#1e293b; font-weight:750; }
.trip-sale-route__meta,.trip-sale-muted { color:#526176; font-size:12px; }
.trip-sale-price { color:#183d9c; font-size:13px; font-variant-numeric:tabular-nums; }
.ticket-sale-summary-grid { grid-template-columns:1.7fr 1fr 1fr 1fr; }
.ticket-sale-summary-grid > div { padding:12px; border-radius:9px; border-color:#e8edf5; }
.ticket-sale-summary-grid strong { white-space:normal; font-size:14px; }
.ticket-sale-summary-grid > div:last-child { background:#eef3ff; border-color:#dce6ff; }
.ticket-sale-summary-grid > div:last-child strong { color:#2454d6; }
.ticket-sale-footer-actions { padding:14px 0; margin-top:16px; background:#f6f8fb; border-top:1px solid #e1e8f1; }
.ticket-sale-btn-secondary { min-height:40px; background:#fff!important; border:1px solid #dce3ed; border-radius:9px!important; color:#475569!important; font-size:12.5px; }
.ticket-sale-btn-primary.v-btn--disabled { background:#dce3ed!important; color:#64748b!important; box-shadow:none!important; }
.ticket-type-card { padding:13px; margin-bottom:9px; border-radius:10px; border-color:#e4eaf2; }
.ticket-type-card__total { border-radius:7px; background:#eef3ff; color:#183d9c; }
.ticket-type-card__input { flex:0 0 85px; }
.payment-method-card-pro { border-radius:10px!important; box-shadow:none!important; }
.payment-method-content-pro { min-height:62px; gap:8px; padding:10px!important; }
.payment-method-label { font-size:12px; font-weight:750; }
.ticket-total-box { border-radius:11px; background:#183d9c; padding:14px; }
.ticket-total-box strong { font-size:18px; overflow-wrap:anywhere; }
.ticket-seat-legend { display:flex; flex-wrap:wrap; gap:7px 13px; margin-bottom:12px; color:#526176; font-size:11px; }
.ticket-seat-legend > span { display:flex; align-items:center; gap:5px; }
.ticket-seat-legend i { width:9px; height:9px; border-radius:3px; }
.legend-free { background:#c7d9f9; }.legend-selected { background:#2454d6; }.legend-reserved { background:#efacac; }.legend-disabled { background:#cbd5e1; }
.seat-map-shell { border-radius:11px; padding:12px; }
.seat-map-preview { min-width:0; padding:14px 12px; border:2px solid #d9e2ef; border-radius:36px 36px 18px 18px; background:#fff; }
.ticket-bus-front { display:flex; align-items:center; justify-content:space-between; gap:25px; align-self:stretch; margin:0 4px 15px; padding:6px 9px 12px; border-bottom:3px solid #dce6f5; color:#64748b; font-size:10px; font-weight:700; }
.seat-container { flex:0 0 42px; width:42px; height:44px; margin:3px; border-radius:7px; background:transparent; }
.seat-container:hover,.seat-available:hover { transform:none; box-shadow:none; }
.ticket-seat-shape { width:42px; height:44px; }
.seat-available { color:#426bb7; background:transparent; }
.seat-selected { color:#2454d6!important; background:#eef3ff!important; box-shadow:0 0 0 2px #2454d6; }
.seat-reserved { color:#b94c4c!important; background:#fff1f2!important; }
.seat-disabled { color:#64748b!important; background:#f1f5f9!important; }
.seat-number,.seat-available .seat-number,.seat-selected .seat-number,.seat-reserved .seat-number { position:absolute; top:18px; left:50%; right:auto; bottom:auto; transform:translate(-50%,-50%); padding:0; color:#1e293b; -webkit-text-stroke:0; font-size:12px; font-weight:850; line-height:1; pointer-events:none; }
.seat-selected .seat-number { color:#183d9c; }
.aisle-icon { visibility:hidden; }
.ticket-delete-dialog,.ticket-preview-dialog { color:#1e293b; background:#fff; border:1px solid #dfe6ef; border-radius:14px!important; }
.ticket-confirm-heading { display:flex; align-items:center; gap:11px; padding:17px 20px; border-bottom:1px solid #e8edf5; }
.ticket-confirm-icon { display:grid; place-items:center; width:38px; height:38px; border-radius:10px; color:#dc2626; background:#fff1f2; }
.ticket-confirm-icon--preview { color:#2454d6; background:#eef3ff; }
.ticket-confirm-heading strong { display:block; color:#0f172a; font-size:16px; font-weight:850; }
.ticket-confirm-heading span:not(.ticket-confirm-icon) { display:block; margin-top:4px; color:#64748b; font-size:11.5px; }
.ticket-delete-dialog :deep(.v-card-text) { color:#334155; font-size:14px; padding:22px!important; }
.busgo-dialog-actions { gap:9px; padding:14px 20px!important; }
.ticket-cancel-button { color:#475569!important; border-radius:9px!important; font-size:12.5px; font-weight:750; text-transform:none; }
.ticket-delete-button { color:#fff!important; background:#dc2626!important; border-radius:9px!important; min-height:40px; font-size:12.5px; font-weight:750; text-transform:none; }
.ticket-preview-dialog :deep(.v-card-text) { color:#334155; font-size:13px; }
.ticket-alert-content { display:flex; align-items:center; gap:10px; font-size:12px; }
.ticket-alert-content strong { display:block; margin-bottom:3px; font-size:13px; }
@media(max-width:959px) { .busgo-container { padding:15px 17px 24px!important; }.busgo-page-header { padding-inline:17px; }.ticket-sale-summary-grid { grid-template-columns:1fr 1fr; }.ticket-toolbar { align-items:stretch; }.ticket-sale-body { padding-inline:14px!important; } }
@media(max-width:600px) { .busgo-page-header { flex-wrap:wrap; padding:12px; }.ticket-header-actions { width:100%; justify-content:flex-start; gap:8px; }.busgo-container { padding:12px!important; }.ticket-sale-summary-grid { grid-template-columns:1fr; }.ticket-sale-section-card { padding:14px; }.ticket-sale-topbar { padding:11px 14px; }.ticket-sale-topbar__title { font-size:16px; }.seat-container { flex-basis:38px; width:38px; margin:2px; } }

.seat-row {
  display: flex;
  flex-direction: row;
  gap: 6px;
  flex-wrap: nowrap;
}

@media (max-width: 600px) {
  .seat-map-scroll {
    max-height: 360px;
  }
}
/* Representación compartida con Estructura: frente a la izquierda. */
.seat-map-scroll { padding:16px!important; max-height:340px; overflow:auto; }
.ticket-structure-bus { position:relative; display:flex!important; flex-direction:row!important; align-items:center!important; gap:12px!important; width:max-content!important; min-width:500px!important; min-height:214px; padding:22px 42px 22px 30px!important; margin:auto; overflow:visible!important; background:linear-gradient(90deg,#2454d609,transparent 18%),#fff; border:2px solid #bfcbd9!important; border-radius:64px 25px 25px 64px!important; box-shadow:inset 0 0 0 6px #f4f7fa,inset -15px 0 0 #e2e8f073,0 12px 28px #0f172a1c; }
.ticket-structure-windshield { position:absolute; top:23px; bottom:23px; left:15px; width:24px; z-index:1; background:linear-gradient(180deg,#d9eff9,#b9d9e9); border:1px solid #9bbccd; border-radius:38px 8px 8px 38px; box-shadow:inset -4px 0 7px #33415517; pointer-events:none; }
.ticket-structure-wheel { position:absolute; width:31px; height:9px; background:#334155; border:2px solid #1e293b; border-radius:5px; box-shadow:inset 0 0 0 1px #64748b; pointer-events:none; }
.ticket-structure-wheel.front-top { top:-6px; left:60px; }.ticket-structure-wheel.front-bottom { bottom:-6px; left:60px; }.ticket-structure-wheel.rear-top { top:-6px; right:54px; }.ticket-structure-wheel.rear-bottom { bottom:-6px; right:54px; }
.ticket-structure-front { position:relative; z-index:2; display:flex; flex:0 0 62px; flex-direction:column; align-items:center; gap:5px; padding-left:8px; color:#2454d6; }
.ticket-structure-front > div { display:grid; place-items:center; width:35px; height:35px; color:#334155; background:#eef2f6; border:1px solid #cbd5e1; border-radius:50%; }
.ticket-structure-front > span { font-size:10px; font-weight:850; text-transform:uppercase; }
.ticket-structure-grid { display:flex; flex-direction:column; align-items:flex-start; gap:3px; }
.ticket-structure-grid .seat-row { display:flex!important; flex-wrap:nowrap!important; justify-content:flex-start!important; gap:6px!important; margin:0!important; }
.ticket-structure-grid .seat-container { position:relative; display:grid!important; place-items:center!important; flex:0 0 55px!important; width:55px!important; height:55px!important; margin:1px!important; background:transparent!important; border-radius:9px; transform:none!important; box-shadow:none; }
.ticket-structure-grid .ticket-structure-seat,.ticket-structure-grid .seat-container:hover .ticket-structure-seat { position:relative; z-index:1; width:46px!important; height:46px!important; font-size:46px!important; transform:scaleX(-1)!important; transition:filter .16s ease!important; }
.ticket-structure-grid .seat-available { color:#2454d6!important; }
.ticket-structure-grid .seat-selected { color:#16875a!important; background:#eaf8f1!important; box-shadow:0 0 0 2px #16875a!important; }
.ticket-structure-grid .seat-reserved { color:#bd5555!important; opacity:1!important; }
.ticket-structure-grid .seat-disabled { color:#94a3b8!important; opacity:1!important; }
.ticket-structure-grid .seat-number { position:absolute!important; z-index:3!important; top:50%!important; left:50%!important; right:auto!important; bottom:auto!important; display:grid!important; place-items:center; min-width:21px; height:19px; padding:0 4px!important; color:#17377f!important; background:#fff!important; border:1px solid #2454d638; border-radius:6px; font-size:11px!important; font-weight:900!important; line-height:1!important; transform:translate(-50%,-50%)!important; -webkit-text-stroke:0!important; }
.ticket-structure-grid .seat-selected .seat-number { color:#116b49!important; border-color:#16875a66; }
.ticket-structure-grid .seat-aisle { color:#94a3b8!important; cursor:default; background:repeating-linear-gradient(135deg,#f8fafc,#f8fafc 5px,#eef2f6 5px,#eef2f6 10px)!important; border:1px dashed #cbd5e1; }
.ticket-structure-grid .seat-aisle .aisle-indicator::after { content:'P'; color:#64748b; font-size:10px; font-weight:850; }
.ticket-seat-legend .legend-free { background:#2454d6; }.ticket-seat-legend .legend-selected { background:#16875a; }
</style>
