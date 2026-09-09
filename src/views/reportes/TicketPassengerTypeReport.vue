<template>

  <v-snackbar

    class="busgo-snackbar"

    location="right top"

    :timeout="sb_timeout"

    :color="sb_type"

    elevation="10"

    v-model="snackbar"

  >

    <div class="d-flex align-center ga-3">
      <v-icon :icon="sb_icon" />
      <div>
        <div class="font-weight-bold">{{ sb_title }}</div>
        <div class="text-caption">{{ sb_message }}</div>
      </div>
    </div>

  </v-snackbar>

  <v-card class="busgo-page-header ticket-report-page-header" elevation="0">

    <v-avatar :color="paleteColors.primary" class="busgo-page-icon ticket-report-page-icon">

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

      class="busgo-add-btn ticket-report-export-button"
      :disabled="loading"

      @click="exportToExcel"

    >

      Exportar a Excel

    </v-btn>

  </v-card>

  <v-container fluid class="busgo-container ticket-report-container">

    <v-card class="busgo-card ticket-report-shell" elevation="0">

      <v-progress-linear
        v-if="loading"
        indeterminate
        :color="paleteColors.primary"
        class="ticket-report-loading-bar"
      />

      <div class="busgo-card-header ticket-report-summary-header">

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

        <div class="ticket-report-toolbar-label">
          <v-icon size="18">mdi-tune-variant</v-icon>
          <div>
            <strong>Filtros del reporte</strong>
            <span>Selecciona el período y el alcance de la consulta</span>
          </div>
        </div>

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

          placeholder="Nivel de consulta"

          hide-details

          class="ticket-type-report-filter"

          :menu-props="{ contentClass: 'ticket-report-select-menu' }"

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

          :menu-props="{ contentClass: 'ticket-report-select-menu' }"

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

          :menu-props="{ contentClass: 'ticket-report-select-menu' }"

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

          :menu-props="{ contentClass: 'ticket-report-select-menu' }"

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

          variant="flat"

          :color="paleteColors.primary"

          :loading="loading"

          prepend-icon="mdi-magnify"

          class="ticket-report-query-button"

          @click="initialize"

        >

          Consultar

        </v-btn>

      </div>

      <div class="ticket-type-report-kpi-grid px-6 pb-4">

        <v-card class="ticket-type-report-kpi-card" elevation="0">

          <v-avatar :color="paleteColors.green" class="ticket-type-report-kpi-icon">

            <v-icon>mdi-ticket-confirmation</v-icon>

          </v-avatar>

          <div>

            <div class="ticket-type-report-kpi-label">Pasajes emitidos</div>

            <div class="ticket-type-report-kpi-value">

              {{ formatCount(resumen.cantidadTickets || 0) }}

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

              {{ formatCount(resumen.asientosVendidos || 0) }}

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

      <div class="px-6 pb-4 ticket-report-totals-layout">

        <v-card class="ticket-type-report-section-card ticket-report-totals-table" elevation="0">

          <div class="ticket-type-report-section-header ticket-report-panel-header">
            <div>
              <div class="d-flex align-center">
                <v-icon start>mdi-format-list-bulleted-type</v-icon>
                <span>Totales por tipo de pasaje</span>
              </div>
              <div class="ticket-report-section-subtitle">Pasajes, pasajeros y recaudación</div>
            </div>
          </div>
          <div class="ticket-type-report-category-header">
            <button v-for="column in categoryHeaders" :key="column.key" type="button"
              class="ticket-type-report-header-cell ticket-type-report-sortable ticket-report-category-sort"
              :class="`ticket-report-category-sort-${column.key}`"
              :aria-label="`${column.title}: ${categorySortBy === column.key ? (categorySortOrder === 'asc' ? 'orden ascendente' : 'orden descendente') : 'sin ordenar'}. Cambiar orden`"
              @click="toggleCategorySort(column.key)">
              <span>{{ column.title }}</span>
              <v-icon size="14">{{ categorySortBy === column.key ? (categorySortOrder === 'asc' ? 'mdi-arrow-up' : 'mdi-arrow-down') : 'mdi-swap-vertical' }}</v-icon>
            </button>
          </div>

          <div class="ticket-type-report-category-body">

            <div

              v-for="item in sortedCategories"

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

                <span class="ticket-report-category-count">{{ formatCount(getCategoryTicketCount(item)) }}</span>

              </div>

              <div class="ticket-type-report-category-cell ticket-type-report-cell-center">

                <span class="ticket-report-category-count">{{ formatCount(getCategoryPassengerCount(item)) }}</span>

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

        <v-card class="ticket-type-report-section-card ticket-report-revenue-card" elevation="0">
          <div class="ticket-type-report-section-header">
            <div>
              <div class="d-flex align-center">
                <v-icon start>mdi-chart-pie</v-icon>
                <span>Recaudación por tipo</span>
              </div>
              <div class="ticket-report-section-subtitle">Participación por categoría</div>
            </div>
          </div>
          <div class="ticket-report-revenue-content" :aria-busy="loading">
            <ul v-if="revenueChartItems.length" class="ticket-report-revenue-legend">
              <li v-for="item in revenueChartItems" :key="item.key">
                <span class="ticket-report-revenue-dot" :style="{ backgroundColor: item.color }" aria-hidden="true"></span>
                <span class="ticket-report-revenue-label">{{ item.label }}</span>
                <span class="ticket-report-revenue-value">
                  <strong>${{ formatNumber(item.amount) }}</strong>
                  <small v-if="!revenueChartHasNegative">{{ item.percentage }}%</small>
                </span>
              </li>
            </ul>
            <template v-if="revenueChartTotal > 0 && !revenueChartHasNegative">
              <div class="ticket-report-donut">
              <svg class="ticket-report-revenue-pie" viewBox="0 0 240 240" role="img"
                aria-label="Distribución de la recaudación por tipo de pasaje. Montos y porcentajes en la leyenda de categorías.">
                <g v-for="slice in revenueChartSlices" :key="slice.key">
                  <circle v-if="slice.fullCircle" cx="120" cy="120" r="108" :fill="slice.color">
                    <title>{{ slice.label }}: ${{ formatNumber(slice.amount) }} ({{ slice.percentage }}%)</title>
                  </circle>
                  <path v-else :d="slice.path" :fill="slice.color" stroke="white" stroke-width="2" stroke-linejoin="round">
                    <title>{{ slice.label }}: ${{ formatNumber(slice.amount) }} ({{ slice.percentage }}%)</title>
                  </path>
                </g>
                <circle cx="120" cy="120" r="78" fill="white" />
              </svg>
              <div class="ticket-report-revenue-total">
                <span>Total recaudado</span>
                <strong>${{ formatNumber(revenueChartTotal) }}</strong>
              </div>
              </div>
            </template>
            <div v-else class="ticket-report-revenue-empty" role="status">
              <v-icon size="40" color="grey-lighten-1">mdi-chart-pie</v-icon>
              <span>{{ revenueChartHasNegative ? 'No se puede representar una torta con montos negativos.' : 'No hay recaudación para graficar en esta consulta.' }}</span>
            </div>

          </div>
        </v-card>


      </div>

      <div class="px-6 pb-6">

        <v-card class="ticket-type-report-section-card" elevation="0">

          <div class="ticket-type-report-section-header">

            <div>

              <div class="d-flex align-center">

                <v-icon start>mdi-text-box-search-outline</v-icon>

                <span>Listado de ventas por tipo de pasaje</span>

              </div>

              <div class="ticket-report-section-subtitle">
                {{ sortedDetails.length }} ventas registradas
              </div>

            </div>

            <v-text-field
              v-model="search"
              density="compact"
              placeholder="Buscar detalle..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              hide-details
              clearable
              class="ticket-type-report-search"
            />

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

                <div class="ticket-type-report-col-sale-mode ticket-type-report-sortable" @click="toggleSort('sale_mode_label')">

                  <span>Modo venta</span>

                  <v-icon size="16" class="ml-1">{{ getSortIcon("sale_mode_label") }}</v-icon>

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

                      <span>{{ formatCount(getDetailPassengerCount(item)) }}</span>

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

    categorySortBy: "name",
    categorySortOrder: "asc",
    categoryHeaders: [
      { key: "name", title: "Tipo" },
      { key: "tickets", title: "Tickets" },
      { key: "passengers", title: "Pasajeros" },
      { key: "base", title: "Tarifa" },
      { key: "amount", title: "Total" },
    ],

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

    // Uses exactly the same rows and monetary field as the category totals table.
    sortedCategories() {
      const direction = this.categorySortOrder === "asc" ? 1 : -1;
      return [...this.totalsByCategory].sort((a, b) => {
        const left = this.getCategorySortValue(a, this.categorySortBy);
        const right = this.getCategorySortValue(b, this.categorySortBy);
        return direction * (this.categorySortBy === "name"
          ? left.localeCompare(right, "es", { numeric: true, sensitivity: "base" })
          : left - right);
      });
    },

    revenueChartItems() {
      const colors = ["#2454d6", "#0f9d8a", "#f0a52b", "#805ad5", "#e35d78", "#427eaa", "#b7791f", "#64748b"];
      const rows = this.totalsByCategory.map((item, index) => {
        const amount = Number(item.montoRecaudado || 0);
        return {
          key: `${item.ticketTypeId ?? item.ticket_type_id ?? item.categoria ?? "category"}-${index}`,
          label: item.ticketTypeName || item.categoria || "Sin categoría",
          amount: Number.isFinite(amount) ? amount : 0,
          color: colors[index] || `hsl(${(index * 137.508) % 360}, 60%, 45%)`,
        };
      });
      const total = rows.reduce((sum, row) => sum + row.amount, 0);
      return rows.map((row) => ({
        ...row,
        percentage: this.formatPercentage(total > 0 ? row.amount / total * 100 : 0),
      }));
    },

    revenueChartTotal() {
      return this.revenueChartItems.reduce((sum, item) => sum + item.amount, 0);
    },

    revenueChartHasNegative() {
      return this.revenueChartItems.some((item) => item.amount < 0);
    },

    revenueChartSlices() {
      if (this.revenueChartTotal <= 0 || this.revenueChartHasNegative) return [];
      const items = this.revenueChartItems.filter((item) => item.amount > 0);
      let angle = -Math.PI / 2;
      return items.map((item) => {
        const sweep = item.amount / this.revenueChartTotal * Math.PI * 2;
        const end = angle + sweep;
        const x1 = 120 + 108 * Math.cos(angle);
        const y1 = 120 + 108 * Math.sin(angle);
        const x2 = 120 + 108 * Math.cos(end);
        const y2 = 120 + 108 * Math.sin(end);
        angle = end;
        return {
          ...item,
          fullCircle: items.length === 1,
          path: `M 120 120 L ${x1} ${y1} A 108 108 0 ${sweep > Math.PI ? 1 : 0} 1 ${x2} ${y2} Z`,
        };
      });
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

    formatCount(value) {
      const number = Number(value);
      return (Number.isFinite(number) ? number : 0).toLocaleString("es-CL", { maximumFractionDigits: 0 });
    },

    formatPercentage(value) {
      if (!Number.isFinite(value) || value === 0) return "0";
      if (value > 0 && value < 0.01) return "< 0,01";
      return value.toLocaleString("es-CL", { maximumFractionDigits: 2 });
    },

    toggleCategorySort(key) {
      if (this.categorySortBy === key) {
        this.categorySortOrder = this.categorySortOrder === "asc" ? "desc" : "asc";
      } else {
        this.categorySortBy = key;
        this.categorySortOrder = "asc";
      }
    },

    getCategorySortValue(item, key) {
      if (key === "name") return String(item.ticketTypeName || item.categoria || "Sin categoría");
      const value = key === "tickets" ? this.getCategoryTicketCount(item)
        : key === "passengers" ? this.getCategoryPassengerCount(item)
        : key === "base" ? this.getCategoryBaseUnit(item)
        : Number(item.montoRecaudado || 0);
      return Number.isFinite(value) ? value : 0;
    },


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

      return saleMode === "express" ? "Express" : "Full";

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

<style>
/* El menú de Vuetify se renderiza fuera del componente. */
.ticket-report-select-menu {
  overflow: hidden !important;
  padding: 6px !important;
  background: #ffffff !important;
  border: 1px solid #dfe6ef !important;
  border-radius: 11px !important;
  box-shadow: 0 14px 34px rgba(15, 23, 42, 0.14) !important;
}

.ticket-report-select-menu .v-list {
  padding: 0 !important;
  background: transparent !important;
}

.ticket-report-select-menu .v-list-item {
  min-height: 48px !important;
  margin: 2px 0 !important;
  padding: 7px 10px !important;
  color: #1e293b !important;
  border-radius: 8px !important;
  transition: background-color .16s ease, color .16s ease;
}

.ticket-report-select-menu .v-list-item:hover {
  color: #2454d6 !important;
  background: #f4f7ff !important;
}

.ticket-report-select-menu .v-list-item--active {
  color: #2454d6 !important;
  background: #eef3ff !important;
}

.ticket-report-select-menu .v-list-item-title {
  color: inherit !important;
  font-size: 12.5px !important;
  font-weight: 750 !important;
  line-height: 1.25 !important;
}

.ticket-report-select-menu .v-list-item-subtitle {
  margin-top: 3px !important;
  color: #64748b !important;
  font-size: 10.5px !important;
  font-weight: 600 !important;
  opacity: 1 !important;
}

.ticket-report-select-menu .v-list-item__prepend > .v-icon {
  width: 32px !important;
  height: 32px !important;
  margin-inline-end: 10px !important;
  color: #2454d6 !important;
  background: #eef3ff !important;
  border: 1px solid #dbe5ff !important;
  border-radius: 8px !important;
  font-size: 17px !important;
}

.ticket-report-select-menu .v-avatar {
  width: 34px !important;
  height: 34px !important;
  margin-inline-end: 10px !important;
  background: #eef3ff !important;
  border: 1px solid #dbe5ff !important;
  border-radius: 8px !important;
}

.ticket-report-select-menu .v-list-item__append .v-icon,
.ticket-report-select-menu .v-selection-control__input {
  color: #2454d6 !important;
}

.ticket-report-select-menu .v-list-item--active::before,
.ticket-report-select-menu .v-list-item__overlay {
  opacity: 0 !important;
}

.ticket-report-select-menu .v-list-item--disabled {
  color: #94a3b8 !important;
  opacity: 1 !important;
}
</style>

<style scoped>
/* BUSGO · REPORTE DE RECAUDACIÓN POR TIPO DE PASAJE */
.ticket-report-page-header {
  display: flex !important;
  min-height: 72px !important;
  align-items: center !important;
  gap: 12px !important;
  padding: 13px 24px !important;
  background: #ffffff !important;
  border-bottom: 1px solid #e7ecf3 !important;
  border-radius: 0 !important;
}

.ticket-report-page-icon {
  display: grid !important;
  flex: 0 0 40px !important;
  width: 40px !important;
  height: 40px !important;
  color: #ffffff !important;
  background: radial-gradient(circle at 90% 5%, rgba(53,184,232,.55), transparent 28px), linear-gradient(135deg,#0e1f46,#2454d6) !important;
  border-radius: 11px !important;
  box-shadow: 0 6px 14px rgba(36,84,214,.2) !important;
  place-items: center !important;
}

.ticket-report-page-header .busgo-page-title { color:#0f172a!important; font-size:19px!important; font-weight:850!important; line-height:1.2!important; }
.ticket-report-page-header .busgo-page-subtitle { margin-top:3px!important; color:#526176!important; font-size:12px!important; font-weight:650!important; }

.ticket-report-export-button {
  min-height:40px!important;
  padding-inline:16px!important;
  color:#fff!important;
  background:linear-gradient(100deg,#16875a,#20a56e)!important;
  border-radius:9px!important;
  font-size:12.5px!important;
  font-weight:800!important;
  letter-spacing:0!important;
  text-transform:none!important;
  box-shadow:0 6px 14px rgba(22,135,90,.2)!important;
}

.ticket-report-container { min-height:calc(100vh - 72px); padding:18px 24px 30px!important; background:#f6f8fb!important; }
.ticket-report-shell { position:relative; overflow:hidden!important; background:#fff!important; border:1px solid #e4eaf2!important; border-radius:14px!important; box-shadow:0 6px 22px rgba(15,23,42,.045)!important; }
.ticket-report-loading-bar { position:absolute!important; top:0; left:0; z-index:8; }

.ticket-report-summary-header {
  display:flex!important;
  min-height:76px!important;
  align-items:center!important;
  justify-content:space-between!important;
  gap:18px!important;
  padding:17px 22px!important;
  border-bottom:1px solid #edf1f5!important;
}
.ticket-report-summary-header .busgo-card-title { color:#0f172a!important; font-size:16px!important; font-weight:850!important; }
.ticket-report-summary-header .busgo-card-subtitle { margin-top:4px!important; color:#64748b!important; font-size:11.5px!important; font-weight:600!important; }
.ticket-type-report-total { min-height:36px!important; padding-inline:12px!important; color:#14734f!important; background:#eaf8f1!important; border:1px solid #d4eee1!important; border-radius:9px!important; font-size:11.5px!important; font-weight:850!important; }

.ticket-type-report-toolbar {
  gap:10px!important;
  margin:0 22px 16px;
  padding:14px!important;
  background:#f8fafc;
  border:1px solid #e7ecf3;
  border-radius:11px;
}

.ticket-report-toolbar-label { display:flex; flex:1 0 100%; align-items:center; gap:9px; padding-bottom:2px; color:#2454d6; }
.ticket-report-toolbar-label strong,.ticket-report-toolbar-label span { display:block; }
.ticket-report-toolbar-label strong { color:#0f172a; font-size:12.5px; font-weight:850; }
.ticket-report-toolbar-label span { margin-top:2px; color:#64748b; font-size:10.5px; font-weight:600; }

.ticket-type-report-filter { flex:1 1 190px; width:auto!important; min-width:190px!important; }
.ticket-type-report-toolbar :deep(.v-field) { min-height:40px!important; color:#334155!important; background:#fff!important; border-radius:9px!important; }
.ticket-type-report-toolbar :deep(.v-field__outline) { color:#dce3ed; opacity:1; }
.ticket-type-report-toolbar :deep(.v-field__input),.ticket-type-report-toolbar :deep(.v-label) { min-height:40px; color:#334155!important; font-size:12px!important; font-weight:650!important; opacity:1!important; }
.ticket-type-report-toolbar :deep(.v-field__prepend-inner) { color:#64748b; opacity:1; }
.ticket-type-report-toolbar :deep(.v-field__append-inner) { color:#64748b; opacity:1; }
.ticket-type-report-toolbar :deep(.v-field--focused .v-field__outline) { color:#2454d6!important; }
.ticket-type-report-toolbar :deep(.v-field--focused .v-field__prepend-inner) { color:#2454d6!important; }
.ticket-type-report-toolbar :deep(.v-select__selection),
.ticket-type-report-toolbar :deep(.v-autocomplete__selection) { min-width:0; color:#1e293b; font-size:12px; font-weight:750; }
.ticket-type-report-toolbar :deep(.v-chip) {
  min-height:25px;
  padding-inline:8px;
  color:#2454d6!important;
  background:#eef3ff!important;
  border:1px solid #dbe5ff!important;
  border-radius:7px!important;
  font-size:10.5px!important;
  font-weight:800!important;
}
.ticket-type-report-toolbar :deep(.v-chip__close) { color:#64748b!important; font-size:14px!important; }

.ticket-report-query-button { min-width:112px!important; min-height:40px!important; color:#fff!important; border-radius:9px!important; font-size:12.5px!important; font-weight:800!important; letter-spacing:0!important; text-transform:none!important; box-shadow:0 5px 12px rgba(36,84,214,.18)!important; }

.ticket-type-report-kpi-grid { gap:12px!important; padding:0 22px 16px!important; }
.ticket-type-report-kpi-card { position:relative; min-height:88px; gap:12px!important; padding:15px!important; overflow:hidden; border:1px solid #e5eaf1!important; border-radius:11px!important; box-shadow:0 4px 14px rgba(15,23,42,.035)!important; }
.ticket-type-report-kpi-card::before { position:absolute; top:0; bottom:0; left:0; width:3px; content:""; background:#2454d6; }
.ticket-type-report-kpi-card:nth-child(2)::before { background:#4f46e5; }
.ticket-type-report-kpi-card:nth-child(3)::before { background:#d97706; }
.ticket-type-report-kpi-card:nth-child(4)::before { background:#16875a; }
.ticket-type-report-kpi-icon { width:40px!important; height:40px!important; color:#2454d6!important; background:#eef3ff!important; border-radius:10px!important; }
.ticket-type-report-kpi-card:nth-child(2) .ticket-type-report-kpi-icon { color:#4f46e5!important; background:#f0efff!important; }
.ticket-type-report-kpi-card:nth-child(3) .ticket-type-report-kpi-icon { color:#d97706!important; background:#fff7e8!important; }
.ticket-type-report-kpi-card:nth-child(4) .ticket-type-report-kpi-icon { color:#16875a!important; background:#eaf8f1!important; }
.ticket-type-report-kpi-label { color:#526176!important; font-size:11px!important; font-weight:700!important; }
.ticket-type-report-kpi-value { margin-top:4px!important; color:#0f172a!important; font-size:20px!important; font-weight:900!important; letter-spacing:-.02em; }

.ticket-type-report-section-card { border:1px solid #e8edf5!important; border-radius:13px!important; box-shadow:0 5px 18px rgba(15,23,42,.04)!important; }
.ticket-type-report-section-header { min-height:69px!important; padding:12px 17px!important; color:#0f172a!important; background:#fff!important; border-bottom:1px solid #e8edf5!important; font-size:15px!important; font-weight:850!important; }
.ticket-report-section-subtitle { margin-top:3px; color:#64748b; font-size:11px; font-weight:650; }

.ticket-type-report-search { flex:0 1 285px; width:285px!important; min-width:240px!important; max-width:285px; }
.ticket-type-report-search :deep(.v-field) { min-height:40px; color:#334155; background:#fff; border-radius:9px; font-size:12px; }
.ticket-type-report-search :deep(.v-field__outline) { color:#dce3ed; opacity:1; }
.ticket-type-report-search :deep(.v-field__input) { min-height:40px; padding-top:0; padding-bottom:0; color:#1e293b; font-size:12px; font-weight:600; }
.ticket-type-report-search :deep(.v-field__input::placeholder) { color:#94a3b8; opacity:1; }
.ticket-type-report-search :deep(.v-icon) { color:#64748b; opacity:1; }
.ticket-type-report-search :deep(.v-field--focused .v-field__outline) { color:#2454d6; }

.ticket-type-report-category-header { min-height:40px!important; padding:10px 17px!important; background:#f8fafc!important; }
.ticket-type-report-header-cell,.ticket-type-report-sortable { color:#334155!important; font-size:11px!important; font-weight:850!important; letter-spacing:.04em; }
.ticket-type-report-category-row { min-height:58px!important; padding:10px 17px!important; }
.ticket-type-report-category-name { color:#0f172a!important; font-size:13px!important; font-weight:800!important; }
.ticket-type-report-category-description { color:#64748b!important; font-size:11px!important; }

.ticket-type-report-table-head { min-height:40px!important; padding:10px 17px!important; background:#f8fafc!important; border-bottom:1px solid #e8edf5!important; }
.ticket-type-report-row { min-height:58px!important; padding:10px 17px!important; }
.ticket-type-report-row:hover { background:#f8faff; }
.ticket-type-report-table :deep(thead) { display:none!important; }
.ticket-type-report-table :deep(tbody td) { height:auto!important; border-bottom:0!important; }
.ticket-type-report-table :deep(.v-data-table-footer) { min-height:52px; padding:6px 16px; color:#334155; font-size:11.5px; font-weight:700; border-top:1px solid #eef2f6; }

.busgo-snackbar { border-radius:11px; }

@media (max-width:960px) {
  .ticket-report-container { padding:14px!important; }
  .ticket-type-report-toolbar { margin-inline:14px; }
  .ticket-type-report-filter,.ticket-report-query-button { width:100%!important; min-width:100%!important; }
  .ticket-type-report-kpi-grid { grid-template-columns:repeat(2,minmax(0,1fr))!important; padding-inline:14px!important; }
  .ticket-type-report-search { width:100%!important; min-width:100%!important; max-width:none; }
}

@media (max-width:600px) {
  .ticket-report-page-header { align-items:flex-start!important; flex-wrap:wrap!important; padding:13px 14px!important; }
  .ticket-report-export-button { width:100%; }
  .ticket-report-summary-header { align-items:flex-start!important; flex-direction:column!important; }
  .ticket-type-report-total { width:100%; justify-content:center; }
  .ticket-type-report-kpi-grid { grid-template-columns:1fr!important; }
}

/* Two equal panels aligned with the KPI grid above. */
.ticket-report-totals-layout { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px; align-items:stretch; padding:0 22px 16px!important; }
.ticket-report-totals-layout > .v-card { min-width:0; min-height:0; display:flex; flex-direction:column; font-size:12px; }
.ticket-report-totals-table { grid-column:auto; }
.ticket-report-totals-layout .ticket-type-report-section-header { min-height:88px!important; padding:14px!important; font-size:14px!important; line-height:1.4; font-weight:800!important; flex-shrink:0; align-items:center; }
.ticket-report-totals-layout .ticket-type-report-section-header .v-icon { font-size:18px; }
.ticket-report-totals-layout .ticket-report-section-subtitle { font-size:12px; font-weight:500; line-height:1.5; color:#64748b; }
.ticket-report-totals-table .ticket-type-report-category-header,
.ticket-report-totals-table .ticket-type-report-category-row { min-width:0; grid-template-columns:minmax(0,1.5fr) minmax(0,.85fr) minmax(0,.85fr) minmax(0,1.1fr) minmax(0,1.2fr); gap:8px; padding:12px!important; }
.ticket-report-totals-table .ticket-type-report-header-cell { font-size:12px!important; font-weight:700!important; letter-spacing:0; text-transform:none; line-height:1.4; overflow-wrap:anywhere; }
.ticket-report-type-heading { text-align:left; }
.ticket-report-totals-table .ticket-type-report-category-name { font-size:12px!important; font-weight:700!important; overflow-wrap:anywhere; }
.ticket-report-totals-table .ticket-type-report-category-description { font-size:12px!important; font-weight:500; }
.ticket-report-totals-table .ticket-type-report-category-description,
.ticket-report-totals-table .ticket-type-report-money,
.ticket-report-totals-table .ticket-type-report-category-cell { white-space:normal; overflow:visible; text-overflow:clip; overflow-wrap:anywhere; }
.ticket-report-totals-table .ticket-type-report-cell-end { font-size:12px; font-weight:700; font-variant-numeric:tabular-nums; }
.ticket-report-totals-table .v-chip { max-width:100%; height:auto; min-height:24px; padding:3px 5px; font-size:12px; }
.ticket-report-totals-table :deep(.v-chip__content) { white-space:normal; overflow-wrap:anywhere; min-width:0; }
.ticket-report-revenue-content { padding:16px; flex:1; display:flex; flex-wrap:wrap; align-items:center; gap:20px; }
.ticket-report-revenue-pie { display:block; width:100%; max-width:200px; margin:0 auto; }
.ticket-report-revenue-pie path:hover,.ticket-report-revenue-pie circle:hover { opacity:.85; }
.ticket-report-revenue-total { display:flex; flex-direction:column; gap:4px; margin:8px 0 18px; }
.ticket-report-revenue-total { align-items:center; }
.ticket-report-revenue-total span { font-size:12px; color:#64748b; }
.ticket-report-revenue-total strong { font-size:22px; font-weight:800; color:#0f172a; font-variant-numeric:tabular-nums; }
.ticket-report-revenue-legend { list-style:none; margin:0; padding:0; flex:1 1 210px; min-width:0; }
.ticket-report-revenue-legend li { display:grid; grid-template-columns:10px minmax(0,1fr) minmax(0,1fr); gap:8px; align-items:center; padding:12px 0; border-top:1px solid #eef2f7; }
.ticket-report-revenue-dot { width:10px; height:10px; border-radius:3px; }
.ticket-report-revenue-label { color:#334155; font-size:12px; font-weight:700; overflow-wrap:anywhere; }
.ticket-report-revenue-value { display:flex; flex-direction:column; align-items:flex-end; gap:3px; font-size:12px; font-variant-numeric:tabular-nums; }
.ticket-report-revenue-value strong { color:#0f172a; font-weight:700; overflow-wrap:anywhere; }
.ticket-report-revenue-value small { color:#64748b; font-size:12px; }
.ticket-report-revenue-empty { flex:1 1 200px; display:flex; flex-direction:column; align-items:center; gap:12px; padding:30px 12px; text-align:center; color:#64748b; font-size:12px; }
@media (max-width:960px) {
  .ticket-report-totals-layout { grid-template-columns:minmax(0,1fr); padding-inline:14px!important; }
  .ticket-report-totals-table { grid-column:1 / -1; }
  .ticket-report-totals-layout > .v-card { min-height:0; }
}
@media (max-width:600px) {
  .ticket-report-totals-layout { grid-template-columns:minmax(0,1fr); }
  .ticket-report-totals-table { grid-column:auto; }
}

.ticket-report-category-sort { display:flex; align-items:center; justify-content:center; gap:3px; width:100%; min-width:0; border:0; background:none; cursor:pointer; font:inherit; }
.ticket-report-category-sort-name { justify-content:flex-start; }
.ticket-report-category-sort-base,.ticket-report-category-sort-amount { justify-content:flex-end; }
.ticket-report-category-sort span { min-width:0; overflow-wrap:anywhere; }
.ticket-report-category-sort .v-icon { flex-shrink:0; }
.ticket-report-category-sort:focus-visible { outline:2px solid #2454d6; outline-offset:3px; border-radius:3px; }
.ticket-report-totals-table .ticket-type-report-category-header { background:#f8fafc!important; border-bottom:1px solid #e8edf5; }
.ticket-report-totals-table .ticket-type-report-header-cell { font-size:11px!important; font-weight:850!important; text-transform:uppercase; }
.ticket-report-category-count { font-size:12px; font-weight:700; font-variant-numeric:tabular-nums; }
.ticket-report-totals-table .ticket-type-report-category-row:hover { background:#f8faff; }
.ticket-report-donut { position:relative; width:100%; flex:1 1 200px; min-width:0; max-width:260px; margin:0 auto; }
.ticket-report-donut .ticket-report-revenue-pie { max-width:none; }
.ticket-report-donut .ticket-report-revenue-total { position:absolute; inset:30% 19%; margin:0; justify-content:center; text-align:center; pointer-events:none; }
.ticket-report-donut .ticket-report-revenue-total strong { font-size:clamp(12px,1.1vw,18px); max-width:100%; overflow-wrap:anywhere; line-height:1.25; }
.ticket-report-donut .ticket-report-revenue-total span { font-size:12px; }
</style>
