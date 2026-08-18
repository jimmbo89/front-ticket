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
      <v-icon>mdi-ticket-percent-outline</v-icon>
    </v-avatar>

    <div>
      <div class="busgo-page-title">Recaudación por Tipo de Pasaje</div>
      <div class="busgo-page-subtitle">
        Resumen de tarifas, ajustes y montos por categoría.
      </div>
    </div>

    <v-spacer />

    <v-btn
      :color="paleteColors.green"
      variant="flat"
      elevation="0"
      prepend-icon="mdi-file-excel"
      class="busgo-add-btn"
      @click="exportToExcel"
    >
      Exportar a Excel
    </v-btn>
  </v-card>

  <v-container fluid class="busgo-container">
    <v-card class="busgo-card" elevation="0">
      <div class="busgo-card-header">
        <div>
          <div class="busgo-card-title">Resumen por tipo de pasaje</div>
          <div class="busgo-card-subtitle">
            Filtra por empresa, sucursal, trabajador, tipo y período.
          </div>
        </div>

        <v-chip
          color="green-darken-2"
          variant="tonal"
          label
          size="large"
          class="ticket-type-report-total"
        >
          Total general: ${{ formatNumber(Number(resumen.montoRecaudado || 0)) }}
        </v-chip>
      </div>

      <div class="ticket-type-report-toolbar px-6 pb-4">
        <ReportDateRangeFilter
          v-model:start-date="date"
          v-model:end-date="endDate"
        />

        <v-select
          v-if="mostrarFila"
          v-model="visibleFilterTypes"
          :items="scopeOptions"
          item-title="title"
          item-value="value"
          multiple
          chips
          closable-chips
          density="compact"
          variant="outlined"
          prepend-inner-icon="mdi-filter"
          placeholder="Empresa"
          hide-details
          class="ticket-type-report-filter"
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
          v-if="mostrarFila && showBranchFilter"
          v-model="branch_id"
          :items="branches"
          :no-data-text="'No hay datos disponibles'"
          item-title="name"
          item-value="id"
          density="compact"
          variant="outlined"
          prepend-inner-icon="mdi-store"
          placeholder="Sucursal"
          clearable
          hide-details
          single-line
          class="ticket-type-report-filter"
        >
          <template #item="{ props, item }">
            <v-list-item
              v-bind="props"
              :prepend-avatar="getImageUrl(item.raw.image)"
              :title="item.raw.name"
            />
          </template>
        </v-autocomplete>

        <v-autocomplete
          v-if="mostrarFila && showWorkerFilter"
          v-model="selectedWorker"
          :items="workers"
          :no-data-text="'No hay datos disponibles'"
          item-title="name"
          item-value="id"
          density="compact"
          variant="outlined"
          prepend-inner-icon="mdi-account"
          placeholder="Trabajador"
          clearable
          hide-details
          single-line
          class="ticket-type-report-filter"
        >
          <template #item="{ props, item }">
            <v-list-item
              v-bind="props"
              :prepend-avatar="getImageUrl(item.raw.image)"
              :title="item.raw.name"
            >
              <v-list-item-subtitle v-if="item.raw.role?.name">
                Rol: {{ item.raw.role.name }}
              </v-list-item-subtitle>
            </v-list-item>
          </template>
        </v-autocomplete>

        <v-autocomplete
          v-model="ticket_type_id"
          :items="ticketTypes"
          :no-data-text="'No hay tipos de pasaje disponibles'"
          item-title="name"
          item-value="id"
          density="compact"
          variant="outlined"
          prepend-inner-icon="mdi-ticket-confirmation-outline"
          placeholder="Tipo de pasaje"
          clearable
          hide-details
          single-line
          class="ticket-type-report-filter"
        >
          <template #item="{ props, item }">
            <v-list-item v-bind="props" :title="item.raw.name">
              <v-list-item-subtitle v-if="item.raw.description">
                {{ item.raw.description }}
              </v-list-item-subtitle>
            </v-list-item>
          </template>
        </v-autocomplete>

        <v-btn
          icon
          variant="tonal"
          :color="paleteColors.primary"
          :loading="loading"
          @click="initialize"
        >
          <v-icon>mdi-magnify</v-icon>
        </v-btn>

        <v-spacer />

        <v-text-field
          v-model="search"
          density="compact"
          placeholder="Buscar detalle..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          hide-details
          single-line
          class="ticket-type-report-search"
        />
      </div>

      <div class="ticket-type-report-kpi-grid px-6 pb-4">
        <v-card class="ticket-type-report-kpi-card" elevation="0">
          <v-avatar :color="paleteColors.green" class="ticket-type-report-kpi-icon">
            <v-icon>mdi-ticket-confirmation</v-icon>
          </v-avatar>

          <div>
            <div class="ticket-type-report-kpi-label">Pasajes emitidos</div>
            <div class="ticket-type-report-kpi-value">
              {{ resumen.cantidadTickets || 0 }}
            </div>
          </div>
        </v-card>

        <v-card class="ticket-type-report-kpi-card" elevation="0">
          <v-avatar color="indigo-lighten-1" class="ticket-type-report-kpi-icon">
            <v-icon>mdi-seat</v-icon>
          </v-avatar>

          <div>
            <div class="ticket-type-report-kpi-label">Pasajeros</div>
            <div class="ticket-type-report-kpi-value">
              {{ resumen.asientosVendidos || 0 }}
            </div>
          </div>
        </v-card>

        <v-card class="ticket-type-report-kpi-card" elevation="0">
          <v-avatar color="orange-lighten-1" class="ticket-type-report-kpi-icon">
            <v-icon>mdi-receipt-text-outline</v-icon>
          </v-avatar>

          <div>
            <div class="ticket-type-report-kpi-label">Base unitaria promedio</div>
            <div class="ticket-type-report-kpi-value">
              ${{ formatNumber(summaryBaseUnit) }}
            </div>
          </div>
        </v-card>

        <v-card class="ticket-type-report-kpi-card" elevation="0">
          <v-avatar color="teal" class="ticket-type-report-kpi-icon">
            <v-icon>mdi-cash-multiple</v-icon>
          </v-avatar>

          <div>
            <div class="ticket-type-report-kpi-label">Total general</div>
            <div class="ticket-type-report-kpi-value">
              ${{ formatNumber(Number(resumen.montoRecaudado || 0)) }}
            </div>
          </div>
        </v-card>
      </div>

      <div class="px-6 pb-4">
        <v-card class="ticket-type-report-section-card" elevation="0">
          <div class="ticket-type-report-section-header ticket-type-report-category-header">
            <div class="d-flex align-center ticket-type-report-section-title">
              <v-icon start>mdi-format-list-bulleted-type</v-icon>
              <span>Totales por tipo de pasaje</span>
            </div>
            <div class="ticket-type-report-header-cell">Pasajes emitidos</div>
            <div class="ticket-type-report-header-cell">Pasajeros</div>
            <div class="ticket-type-report-header-cell">Base unitaria</div>
            <div class="ticket-type-report-header-cell">Total</div>
          </div>

          <div class="ticket-type-report-category-body">
            <div
              v-for="item in totalsByCategory"
              :key="item.ticketTypeId || item.ticket_type_id || item.categoria"
              class="ticket-type-report-category-row"
            >
              <div class="ticket-type-report-category-cell">
                <div class="ticket-type-report-category-name">
                  {{ item.ticketTypeName || item.categoria || "Sin categoría" }}
                </div>
                <div v-if="item.description" class="ticket-type-report-category-description">
                  {{ item.description }}
                </div>
              </div>

              <div class="ticket-type-report-category-cell ticket-type-report-cell-center">
                <v-chip variant="outlined" size="small" color="green" class="font-weight-bold">
                  {{ getCategoryTicketCount(item) }}
                </v-chip>
              </div>

              <div class="ticket-type-report-category-cell ticket-type-report-cell-center">
                <v-chip variant="outlined" size="small" color="indigo" class="font-weight-bold">
                  {{ getCategoryPassengerCount(item) }}
                </v-chip>
              </div>

              <div class="ticket-type-report-category-cell ticket-type-report-cell-end">
                ${{ formatNumber(getCategoryBaseUnit(item)) }}
              </div>

              <div class="ticket-type-report-category-cell ticket-type-report-cell-end ticket-type-report-money">
                ${{ formatNumber(Number(item.montoRecaudado || 0)) }}
              </div>
            </div>

            <div v-if="!totalsByCategory.length" class="ticket-type-report-empty">
              No se encontraron totales por tipo de pasaje
            </div>
          </div>
        </v-card>
      </div>

      <div class="px-6 pb-6">
        <v-card class="ticket-type-report-section-card" elevation="0">
          <div class="ticket-type-report-section-header">
            <div class="d-flex align-center">
              <v-icon start>mdi-text-box-search-outline</v-icon>
              <span>Detalle de ventas</span>
            </div>
          </div>

          <v-data-table
            :headers="headers"
            :items="sortedDetails"
            :search="search"
            :items-per-page-text="'Elementos por página'"
            :items-per-page="10"
            no-data-text="No hay datos disponibles"
            :loading="loading"
            loading-text="Cargando datos..."
            :hide-default-header="true"
            class="busgo-table ticket-type-report-table"
          >
            <template #top>
              <div class="ticket-type-report-table-head">
                <div class="ticket-type-report-col-method ticket-type-report-sortable" @click="toggleSort('tripCode')">
                  <span>Código viaje</span>
                  <v-icon size="16" class="ml-1">{{ getSortIcon("tripCode") }}</v-icon>
                </div>

                <div class="ticket-type-report-col-route ticket-type-report-sortable" @click="toggleSort('routeCode')">
                  <span>Ruta</span>
                  <v-icon size="16" class="ml-1">{{ getSortIcon("routeCode") }}</v-icon>
                </div>

                <div class="ticket-type-report-col-date ticket-type-report-sortable" @click="toggleSort('date')">
                  <span>Fecha</span>
                  <v-icon size="16" class="ml-1">{{ getSortIcon("date") }}</v-icon>
                </div>

                <div class="ticket-type-report-col-sale-mode">
                  <span>Modo venta</span>
                </div>

                <div class="ticket-type-report-col-type ticket-type-report-sortable" @click="toggleSort('ticketTypeName')">
                  <span>Tipo</span>
                  <v-icon size="16" class="ml-1">{{ getSortIcon("ticketTypeName") }}</v-icon>
                </div>

                <div class="ticket-type-report-col-quantity ticket-type-report-sortable" @click="toggleSort('quantity')">
                  <span>Pasajeros</span>
                  <v-icon size="16" class="ml-1">{{ getSortIcon("quantity") }}</v-icon>
                </div>

                <div class="ticket-type-report-col-base ticket-type-report-sortable" @click="toggleSort('tarifaBaseUnitaria')">
                  <span>Base unitaria</span>
                  <v-icon size="16" class="ml-1">{{ getSortIcon("tarifaBaseUnitaria") }}</v-icon>
                </div>

                <div class="ticket-type-report-col-total ticket-type-report-sortable" @click="toggleSort('montoRecaudado')">
                  <span>Total</span>
                  <v-icon size="16" class="ml-1">{{ getSortIcon("montoRecaudado") }}</v-icon>
                </div>
              </div>
            </template>

            <template #item="{ item }">
              <tr>
                <td class="pa-0 border-0">
                  <div class="busgo-row ticket-type-report-row">
                    <div class="ticket-type-report-col-method busgo-meta">
                      <span class="ticket-type-report-ticket-method text-truncate">
                        {{ item.tripCode || "-" }}
                      </span>
                    </div>

                    <div class="ticket-type-report-col-route">
                      <div class="ticket-type-report-route-title-row">
                        <div class="ticket-type-report-route-title">
                          {{ item.routeCode || "-" }}
                        </div>
                      </div>

                      <div class="ticket-type-report-route-meta">
                        <v-icon size="14" class="mr-1">mdi-map-marker</v-icon>

                        <span class="text-truncate">
                          {{ item.origin || "-" }}
                        </span>

                        <v-icon size="14" class="mx-2">mdi-ray-start-arrow</v-icon>

                        <span class="text-truncate">
                          {{ item.destination || "-" }}
                        </span>
                      </div>

                      <v-tooltip activator="parent" location="bottom" max-width="350px">
                        <span style="white-space: normal; word-break: break-word">
                          Código viaje: {{ item.tripCode || "-" }}<br />
                          Código ruta: {{ item.routeCode || "-" }}<br />
                          Origen: {{ item.origin || "-" }}<br />
                          Destino: {{ item.destination || "-" }}
                        </span>
                      </v-tooltip>
                    </div>

                    <div class="ticket-type-report-col-date busgo-meta">
                      <v-icon size="16" color="primary">mdi-calendar</v-icon>
                      <span class="text-truncate">{{ item.date || "-" }}</span>
                    </div>

                    <div class="ticket-type-report-col-sale-mode">
                      <v-chip
                        size="x-small"
                        :color="getSaleModeColor(item)"
                        variant="tonal"
                        class="ticket-type-report-sale-mode-chip"
                      >
                        {{ getSaleModeLabel(item) }}
                      </v-chip>
                    </div>

                    <div class="ticket-type-report-col-type">
                      <v-chip size="small" label variant="tonal" color="primary">
                        {{ item.ticketTypeName || "Sin tipo" }}
                      </v-chip>
                    </div>

                    <div class="ticket-type-report-col-quantity busgo-meta">
                      <v-icon size="16" color="primary">mdi-account-multiple</v-icon>
                      <span>{{ getDetailPassengerCount(item) }}</span>
                    </div>

                    <div class="ticket-type-report-col-base ticket-type-report-money">
                      ${{ formatNumber(getBaseUnit(item)) }}
                    </div>

                    <div class="ticket-type-report-col-total ticket-type-report-money ticket-type-report-money-total">
                      ${{ formatNumber(Number(item.montoRecaudado || 0)) }}
                    </div>
                  </div>
                </td>
              </tr>
            </template>
          </v-data-table>
        </v-card>
      </div>
    </v-card>
  </v-container>
</template>

<script>
import { paleteColors } from "@/assets/colors";
import LocalStorageService from "@/LocalStorageService";
import ReportDateRangeFilter from "@/components/ReportDateRangeFilter.vue";
import { handleRequest } from "@/utils/api";
import { formatLocalDate } from "@/utils/date";
import * as XLSX from "xlsx";

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
    paleteColors,
    loading: false,
    search: "",
    visibleFilterTypes: [],
    company_id: "",
    branch_id: "",
    worker_id: "",
    user_id: "",
    selectedWorker: "",
    ticket_type_id: null,
    date: null,
    endDate: null,
    branches: [],
    workers: [],
    ticketTypes: [],
    permissions: [],
    mostrarFila: false,
    response: {
      filters: {},
      resumen: {},
      totalesPorCategoria: [],
      detalles: [],
    },
    sortBy: "date",
    sortOrder: "desc",
    headers: [
      { title: "Código viaje", value: "tripCode" },
      { title: "Ruta", value: "routeCode" },
      { title: "Fecha", value: "date" },
      { title: "Modo venta", value: "sale_mode_label" },
      { title: "Tipo", value: "ticketTypeName" },
      { title: "Pasajeros", value: "quantity" },
      { title: "Base unitaria", value: "tarifaBaseUnitaria" },
      { title: "Recaudado", value: "montoRecaudado" },
    ],
    scopeOptions: [
      { title: "Sucursal", value: "Sucursal", icon: "mdi-store-outline" },
      { title: "Trabajador", value: "Trabajador", icon: "mdi-account-outline" },
    ],
  }),
  computed: {
    showBranchFilter() {
      return (
        this.visibleFilterTypes.includes("Sucursal") ||
        this.visibleFilterTypes.includes("Trabajador")
      );
    },
    showWorkerFilter() {
      return this.visibleFilterTypes.includes("Trabajador");
    },
    resumen() {
      return this.response?.resumen || {};
    },
    totalsByCategory() {
      return Array.isArray(this.response?.totalesPorCategoria)
        ? this.response.totalesPorCategoria
        : Array.isArray(this.response?.totalPorCategoria)
          ? this.response.totalPorCategoria
          : [];
    },
    details() {
      return Array.isArray(this.response?.detalles) ? this.response.detalles : [];
    },
    summaryBaseUnit() {
      const promedioResumen = Number(this.resumen.tarifaBasePromedio);
      if (Number.isFinite(promedioResumen)) {
        return promedioResumen;
      }

      return this.totalsByCategory.reduce(
        (total, item) => total + this.getCategoryBaseUnit(item),
        0
      );
    },
    sortedDetails() {
      const items = [...this.details];
      const direction = this.sortOrder === "asc" ? 1 : -1;

      return items.sort((a, b) => {
        const aValue = this.getSortValue(a, this.sortBy);
        const bValue = this.getSortValue(b, this.sortBy);

        if (this.isNumericSortKey(this.sortBy)) {
          return direction * (Number(aValue || 0) - Number(bValue || 0));
        }

        if (this.sortBy === "date") {
          return direction * (new Date(aValue || 0).getTime() - new Date(bValue || 0).getTime());
        }

        return direction * String(aValue ?? "").localeCompare(String(bValue ?? ""), "es", {
          numeric: true,
          sensitivity: "base",
        });
      });
    },
  },
  watch: {
    visibleFilterTypes(nextFilters) {
      if (!nextFilters.includes("Sucursal") && !nextFilters.includes("Trabajador")) {
        this.branch_id = "";
      }

      if (!nextFilters.includes("Trabajador")) {
        this.selectedWorker = "";
      }

      if (
        nextFilters.includes("Trabajador") &&
        !this.branch_id &&
        this.branches.length
      ) {
        this.branch_id = this.branches[0]?.id || "";
      }
    },
    branch_id(newBranchId) {
      if (!newBranchId) {
        this.workers = [];
        this.selectedWorker = "";
        return;
      }

      const selectedBranch = this.branches.find(
        (branch) => Number(branch.id) === Number(newBranchId)
      );
      this.workers = selectedBranch?.workers || [];

      if (!this.workers.some((worker) => Number(worker.id) === Number(this.selectedWorker))) {
        this.selectedWorker = "";
      }
    },
  },
  mounted() {
    this.company_id = LocalStorageService.getItem("business_id");
    this.branch_id = this.toNumberOrEmpty(LocalStorageService.getItem("branch_id"));
    this.worker_id = this.toNumberOrEmpty(LocalStorageService.getItem("worker_id"));
    this.user_id = this.toNumberOrEmpty(LocalStorageService.getItem("user_id"));
    this.selectedWorker = this.worker_id;
    this.permissions = this.parsePermissions(LocalStorageService.getItem("permissions"));
    this.date = formatLocalDate();
    this.endDate = formatLocalDate();

    if (this.hasPermission("view_ticketsdate_company")) {
      this.mostrarFila = true;
      this.showBranchesAndTicketTypes();
      return;
    }

    this.mostrarFila = false;
    this.visibleFilterTypes = ["Sucursal"];
    this.showBranchesAndTicketTypes();
  },
  methods: {
    parsePermissions(value) {
      if (Array.isArray(value)) {
        return value;
      }

      try {
        return value ? JSON.parse(value) : [];
      } catch {
        return String(value || "").split(",");
      }
    },
    hasPermission(requiredPermissions) {
      const perms = Array.isArray(requiredPermissions)
        ? requiredPermissions
        : [requiredPermissions];

      return perms.some((permission) => this.permissions.includes(permission));
    },
    toNumberOrEmpty(value) {
      const parsed = Number(value);
      return Number.isFinite(parsed) && value !== null && value !== "null" ? parsed : "";
    },
    getImageUrl(imagePath) {
      if (!imagePath) {
        return "";
      }

      return `${this.$axios.defaults.baseURL}images/${imagePath}?t=${this.getCacheTimestamp()}`;
    },
    getCacheTimestamp() {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return startOfDay.getTime();
    },
    normalizeTicketType(ticketType = {}) {
      return {
        ...ticketType,
        id: ticketType.id ?? ticketType.ticketTypeId ?? ticketType.ticket_type_id,
        name: ticketType.name ?? ticketType.ticketTypeName ?? ticketType.categoria ?? "",
        description: ticketType.description ?? ticketType.ticketTypeDescription ?? "",
      };
    },
    async showBranchesAndTicketTypes() {
      try {
        this.loading = true;
        const result = await handleRequest({
          endpoint: "worker-branches-ticket-types",
          method: "POST",
          data: {
            worker_id: this.worker_id || undefined,
            company_id: this.company_id ? Number(this.company_id) : undefined,
          },
        });

        if (result.success) {
          this.branches = result.data?.branches || [];
          this.ticketTypes = (result.data?.ticketTypes || []).map((ticketType) =>
            this.normalizeTicketType(ticketType)
          );

          if (!this.branch_id && this.branches.length) {
            this.branch_id = this.branches[0].id;
          }

          const selectedBranch = this.branches.find(
            (branch) => Number(branch.id) === Number(this.branch_id)
          );
          this.workers = selectedBranch?.workers || this.branches[0]?.workers || [];
          this.selectedWorker = this.workers.some(
            (worker) => Number(worker.id) === Number(this.worker_id)
          )
            ? this.worker_id
            : "";

          if (this.branches.length > 1 && this.hasPermission("view_ticketsdate_company")) {
            this.mostrarFila = true;
          }
        } else {
          this.branches = [];
          this.workers = [];
          this.ticketTypes = [];
          this.showAlert("warning", result.message || "No se encontraron filtros disponibles.", 3000);
        }
      } catch (error) {
        this.showAlert("error", "Ocurrió un error al cargar los filtros.", 3000);
      } finally {
        this.loading = false;
        this.initialize();
      }
    },
    buildPayload() {
      const formattedDate = this.date || formatLocalDate();
      const formattedEndDate = this.endDate || formattedDate;
      const payload = {
        date: formattedDate,
      };

      if (this.company_id) {
        payload.company_id = Number(this.company_id);
      }

      if (formattedEndDate !== formattedDate) {
        payload.endDate = formattedEndDate;
      }

      if (this.ticket_type_id) {
        payload.ticket_type_id = Number(this.ticket_type_id);
      }

      if (this.showBranchFilter && this.branch_id) {
        payload.branch_id = Number(this.branch_id);
      }

      if (this.showWorkerFilter && this.selectedWorker) {
        const selectedWorker = this.workers.find(
          (worker) => Number(worker.id) === Number(this.selectedWorker)
        );
        payload.worker_id = Number(this.selectedWorker);
        payload.user_id = Number(selectedWorker?.user_id ?? this.user_id);
      }

      return payload;
    },
    async initialize() {
      if (!this.date) {
        this.date = formatLocalDate();
      }

      try {
        this.loading = true;
        const result = await handleRequest({
          endpoint: "ticket-passenger-type-report",
          method: "POST",
          data: this.buildPayload(),
        });

        if (result.success) {
          this.response = {
            filters: result.data?.filters || {},
            resumen: result.data?.resumen || {},
            totalesPorCategoria:
              result.data?.totalesPorCategoria || result.data?.totalPorCategoria || [],
            detalles: (result.data?.detalles || []).map((item) => ({
              ...item,
              sale_mode_label: this.getSaleModeLabel(item),
            })),
          };
        } else {
          this.response = { filters: {}, resumen: {}, totalesPorCategoria: [], detalles: [] };
          this.showAlert("warning", result.message || "No hay datos disponibles.", 3000);
        }
      } catch (error) {
        this.showAlert("error", "Ocurrió un error inesperado al procesar la solicitud.", 3000);
      } finally {
        this.loading = false;
      }
    },
    toggleSort(key) {
      if (this.sortBy === key) {
        this.sortOrder = this.sortOrder === "asc" ? "desc" : "asc";
        return;
      }

      this.sortBy = key;
      this.sortOrder = key === "date" ? "desc" : "asc";
    },
    getSortIcon(key) {
      if (this.sortBy !== key) {
        return "mdi-swap-vertical";
      }

      return this.sortOrder === "asc" ? "mdi-arrow-up" : "mdi-arrow-down";
    },
    getSortValue(item, key) {
      if (key === "quantity") {
        return this.getDetailPassengerCount(item);
      }

      if (key === "tarifaBaseUnitaria") {
        return this.getBaseUnit(item);
      }

      if (key === "sale_mode_label") {
        return this.getSaleModeLabel(item);
      }

      return item?.[key] ?? "";
    },
    isNumericSortKey(key) {
      return ["quantity", "tarifaBaseUnitaria", "montoRecaudado"].includes(key);
    },
    getBaseUnit(item = {}) {
      return Number(
        item.tarifaBaseUnitaria ?? item.tarifaBase ?? item.basePrice ?? item.base_price ?? 0
      );
    },
    getBaseTotal(item = {}) {
      return Number(item.tarifaBaseTotal ?? item.tarifaBase ?? 0);
    },
    getCategoryTicketCount(item = {}) {
      return Number(item.pasajesEmitidos ?? item.cantidadTickets ?? 0);
    },
    getCategoryPassengerCount(item = {}) {
      return Number(item.asientosVendidos ?? item.quantity ?? 0);
    },
    getDetailPassengerCount(item = {}) {
      return Number(item.quantity ?? item.asientosVendidos ?? item.pasajesEmitidos ?? 0);
    },
    getCategoryBaseUnit(item = {}) {
      const directValue = Number(
        item.tarifaBasePromedio ??
          item.tarifaBaseUnitaria ??
          item.basePrice ??
          item.base_price
      );
      if (Number.isFinite(directValue)) {
        return directValue;
      }

      const quantity = this.getCategoryPassengerCount(item);
      return quantity > 0 ? this.getBaseTotal(item) / quantity : 0;
    },
    getSaleModeLabel(item = {}) {
      const saleMode = String(item?.sale_mode || item?.saleMode || "normal")
        .toLowerCase()
        .trim();

      return saleMode === "express" ? "Express" : "Normal";
    },
    getSaleModeColor(item = {}) {
      const saleMode = String(item?.sale_mode || item?.saleMode || "normal")
        .toLowerCase()
        .trim();

      return saleMode === "express" ? "secondary" : "primary";
    },
    formatNumber(value) {
      const numberValue = Number(value);

      if (!Number.isFinite(numberValue)) {
        return "0.00";
      }

      return numberValue.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    },
    exportToExcel() {
      const rows = [];
      const filters = this.response?.filters || {};

      rows.push(["Reporte de recaudación por tipo de pasaje"]);
      rows.push([]);
      rows.push(["Fecha inicio", filters.date || this.date || ""]);
      rows.push(["Fecha final", filters.endDate || this.endDate || filters.date || this.date || ""]);
      rows.push([]);
      rows.push(["Resumen"]);
      rows.push(["Pasajes emitidos", this.resumen.cantidadTickets || 0]);
      rows.push(["Pasajeros", this.resumen.asientosVendidos || 0]);
      rows.push(["Monto recaudado", Number(this.resumen.montoRecaudado || 0)]);
      rows.push([]);
      rows.push(["Totales por tipo"]);
      rows.push(["Tipo", "Descripción", "Pasajes emitidos", "Pasajeros", "Base unitaria", "Total"]);

      this.totalsByCategory.forEach((item) => {
        rows.push([
          item.ticketTypeName || item.categoria || "",
          item.description || "",
          this.getCategoryTicketCount(item),
          this.getCategoryPassengerCount(item),
          this.getCategoryBaseUnit(item),
          Number(item.montoRecaudado || 0),
        ]);
      });

      rows.push([]);
      rows.push(["Detalle"]);
      rows.push(["Fecha", "Código viaje", "Sucursal", "Código ruta", "Origen", "Destino", "Modo venta", "Tipo", "Pasajeros", "Base unitaria", "Base total", "Total"]);

      this.details.forEach((item) => {
        rows.push([
          item.date || "",
          item.tripCode || "",
          item.branchName || "",
          item.routeCode || "",
          item.origin || "",
          item.destination || "",
          item.sale_mode_label || this.getSaleModeLabel(item),
          item.ticketTypeName || "",
          this.getDetailPassengerCount(item),
          this.getBaseUnit(item),
          this.getBaseTotal(item),
          Number(item.montoRecaudado || 0),
        ]);
      });

      const ws = XLSX.utils.aoa_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Reporte");
      XLSX.writeFile(
        wb,
        `reporte_tipo_pasaje_${new Date().toLocaleDateString().replace(/\//g, "-")}.xlsx`
      );
    },
    showAlert(sb_type, sb_message, sb_timeout) {
      this.sb_type = sb_type;

      if (sb_type === "success") {
        this.sb_title = "Éxito";
        this.sb_icon = "mdi-check-circle";
      }

      if (sb_type === "error") {
        this.sb_title = "Error";
        this.sb_icon = "mdi-alert-circle";
      }

      if (sb_type === "warning") {
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

<style scoped>
.ticket-type-report-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.ticket-type-report-filter {
  width: 240px;
  min-width: 240px;
}

.ticket-type-report-search {
  width: 300px;
  min-width: 260px;
}

.ticket-type-report-total {
  font-weight: 700;
}

.ticket-type-report-kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.ticket-type-report-kpi-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px;
  border: 1px solid #eef2f7;
  border-radius: 16px;
  background: #ffffff;
}

.ticket-type-report-kpi-icon {
  border-radius: 14px;
}

.ticket-type-report-kpi-label {
  font-size: 13px;
  color: #64748b;
  font-weight: 600;
}

.ticket-type-report-kpi-value {
  font-size: 22px;
  font-weight: 800;
  color: #111827;
  margin-top: 2px;
}

.ticket-type-report-section-card {
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  overflow: hidden;
  background: #ffffff;
}

.ticket-type-report-section-header {
  min-height: 56px;
  padding: 12px 18px;
  background: #f8fafc;
  border-bottom: 1px solid #eef2f7;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  font-size: 15px;
  font-weight: 700;
  color: #111827;
}

.ticket-type-report-category-header,
.ticket-type-report-category-row {
  display: grid;
  grid-template-columns: minmax(220px, 1fr) 130px 110px 150px 150px;
  gap: 12px;
  align-items: center;
}

.ticket-type-report-section-title,
.ticket-type-report-category-cell {
  min-width: 0;
}

.ticket-type-report-header-cell {
  min-width: 0;
  font-size: 12px;
  font-weight: 800;
  color: #475569;
  text-transform: uppercase;
  text-align: center;
}

.ticket-type-report-header-cell:last-child {
  text-align: right;
}

.ticket-type-report-category-row {
  min-height: 58px;
  padding: 12px 18px;
  border-bottom: 1px solid #eef2f7;
}

.ticket-type-report-category-name {
  font-size: 14px;
  font-weight: 800;
  color: #111827;
}

.ticket-type-report-category-description {
  margin-top: 3px;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ticket-type-report-cell-center {
  display: flex;
  justify-content: center;
}

.ticket-type-report-cell-end {
  text-align: right;
  font-size: 14px;
  font-weight: 700;
}

.ticket-type-report-money {
  font-size: 14px;
  font-weight: 800;
  color: #15803d;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ticket-type-report-empty {
  padding: 16px 18px;
  color: #64748b;
  font-size: 14px;
}

.ticket-type-report-table-head,
.ticket-type-report-row {
  display: grid;
  grid-template-columns: minmax(90px, 0.7fr) minmax(260px, 2.1fr) minmax(100px, 0.75fr) 104px minmax(130px, 1fr) minmax(82px, 0.6fr) minmax(118px, 0.85fr) minmax(118px, 0.9fr);
  gap: 12px;
  align-items: center;
}

.ticket-type-report-table-head {
  min-height: 56px;
  padding: 12px 18px;
  background: #f8fafc;
  border-bottom: 1px solid #eef2f7;
}

.ticket-type-report-sortable {
  display: flex;
  align-items: center;
  min-width: 0;
  cursor: pointer;
  user-select: none;
  font-size: 12px;
  font-weight: 800;
  color: #475569;
  text-transform: uppercase;
}

.ticket-type-report-row {
  min-height: 66px;
  padding: 14px 18px;
  border-bottom: 1px solid #eef2f7;
}

.ticket-type-report-col-method,
.ticket-type-report-col-route,
.ticket-type-report-col-date,
.ticket-type-report-col-sale-mode,
.ticket-type-report-col-type,
.ticket-type-report-col-quantity,
.ticket-type-report-col-base,
.ticket-type-report-col-total {
  min-width: 0;
}

.ticket-type-report-col-sale-mode {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
  color: #475569;
  text-transform: uppercase;
}

.ticket-type-report-sale-mode-chip {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: uppercase;
}

.ticket-type-report-ticket-method {
  display: block;
  max-width: 100%;
  margin-top: 2px;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
}

.ticket-type-report-route-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.ticket-type-report-route-title {
  font-size: 12px;
  font-weight: 700;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ticket-type-report-route-meta {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  margin-top: 4px;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ticket-type-report-money-total {
  justify-self: end;
}

.ticket-type-report-col-quantity,
.ticket-type-report-col-base,
.ticket-type-report-col-total {
  justify-self: end;
  text-align: right;
}

.ticket-type-report-col-quantity.ticket-type-report-sortable,
.ticket-type-report-col-base.ticket-type-report-sortable,
.ticket-type-report-col-total.ticket-type-report-sortable {
  justify-content: flex-end;
}

.ticket-type-report-col-quantity.busgo-meta {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
}

@media (max-width: 960px) {
  .ticket-type-report-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .ticket-type-report-filter,
  .ticket-type-report-search {
    width: 100%;
    min-width: 100%;
  }

  .ticket-type-report-kpi-grid {
    grid-template-columns: 1fr;
  }

  .ticket-type-report-section-header {
    flex-direction: column;
    align-items: stretch;
  }

  .ticket-type-report-category-header,
  .ticket-type-report-category-row,
  .ticket-type-report-table-head,
  .ticket-type-report-row {
    grid-template-columns: minmax(140px, 1fr) minmax(120px, 1fr);
  }
}
</style>
