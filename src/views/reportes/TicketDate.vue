<template>
  <v-card class="busgo-page-header" elevation="0">
    <v-avatar :color="paleteColors.primary" class="busgo-page-icon">
      <v-icon>mdi-finance</v-icon>
    </v-avatar>

    <div>
      <div class="busgo-page-title">Recaudación</div>
      <div class="busgo-page-subtitle">Recaudación por períodos</div>
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
          <div class="busgo-card-title">Resumen de recaudación</div>
          <div class="busgo-card-subtitle">
            Consulta ventas, reimpresiones, métodos de pago y rutas.
          </div>
        </div>

        <div class="collection-date">
          Fecha: {{ response.fecha }}
        </div>
      </div>

      <div class="collection-toolbar px-6 pb-4">
        <ReportDateRangeFilter
          v-model:start-date="date"
          v-model:end-date="endDate"
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
          class="collection-filter"
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
          class="collection-filter"
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
          @click="initialize"
        >
          <v-icon>mdi-magnify</v-icon>
        </v-btn>
      </div>

      <div class="collection-kpi-grid px-6 pb-4">
        <v-card class="collection-kpi-card" elevation="0">
          <v-avatar :color="paleteColors.green" class="collection-kpi-icon">
            <v-icon>mdi-ticket-confirmation</v-icon>
          </v-avatar>

          <div>
            <div class="collection-kpi-label">Pasajes emitidos</div>
            <div class="collection-kpi-value">
              {{ response.pasajesEmitidos }}
            </div>
          </div>
        </v-card>

        <v-card class="collection-kpi-card" elevation="0">
          <v-avatar color="indigo-lighten-1" class="collection-kpi-icon">
            <v-icon>mdi-seat</v-icon>
          </v-avatar>

          <div>
            <div class="collection-kpi-label">Asientos vendidos</div>
            <div class="collection-kpi-value">
              {{ response.asientosComprados }}
            </div>
          </div>
        </v-card>

        <v-card class="collection-kpi-card" elevation="0">
          <v-avatar color="orange-lighten-1" class="collection-kpi-icon">
            <v-icon>mdi-printer</v-icon>
          </v-avatar>

          <div>
            <div class="collection-kpi-label">Reimpresiones</div>
            <div class="collection-kpi-value">
              {{ response.reimpresiones }}
            </div>
          </div>
        </v-card>

        <v-card class="collection-kpi-card" elevation="0">
          <v-avatar color="black" class="collection-kpi-icon">
            <v-icon>mdi-scale-balance</v-icon>
          </v-avatar>

          <div>
            <div class="collection-kpi-label">Total general</div>
            <div class="collection-kpi-value">
              ${{ formatNumber(Number(response.totales)) }}
            </div>
          </div>
        </v-card>
      </div>

      <div class="px-6 pb-4">
        <v-card class="collection-section-card" elevation="0">
          <div class="collection-section-header collection-methods-section-header">
            <div class="d-flex align-center collection-methods-title">
              <v-icon start>mdi-credit-card-multiple</v-icon>
              <span>Totales por Método de Pago</span>
            </div>

            <div class="collection-methods-header-cell">Asientos</div>
            <div class="collection-methods-header-cell">Pasajes</div>
            <div class="collection-methods-header-cell">Total</div>
          </div>

          <div class="collection-methods-body">
            <div
              v-for="item in response.totalesPorMetodo || []"
              :key="item.metodo"
              class="collection-methods-row"
            >
              <div class="collection-methods-cell">
              <v-chip
                :color="getMethodInfo(item.metodo).color"
                size="small"
                label
                class="font-weight-bold text-body-2"
              >
                <v-icon
                  start
                  :icon="getMethodInfo(item.metodo).icon"
                  size="small"
                />
                {{ item.metodo }}
              </v-chip>
              </div>

              <div class="collection-methods-cell collection-methods-cell--center">
              <v-chip
                variant="outlined"
                size="small"
                color="indigo"
                class="font-weight-bold"
              >
                {{ item.asientosComprados || 0 }}
              </v-chip>
              </div>

              <div class="collection-methods-cell collection-methods-cell--center">
              <v-chip
                variant="outlined"
                size="small"
                :color="getMethodColor(item.metodo)"
                class="font-weight-bold"
              >
                {{ item.cantidad }}
              </v-chip>
              </div>

              <div class="collection-methods-cell collection-methods-cell--end">
              <span
                class="font-weight-bold"
                :class="'text-' + getMethodColor(item.metodo) + '-darken-3'"
              >
                ${{ formatNumber(Number(item.total)) }}
              </span>
              </div>
            </div>

            <div
              v-if="!response.totalesPorMetodo || response.totalesPorMetodo.length === 0"
              class="collection-methods-empty"
            >
              No se encontraron registros de pagos
            </div>

            <div class="collection-table-total">
              <span>Total general:</span>
              <strong>${{ formatNumber(Number(response.totales)) }}</strong>
            </div>
          </div>
        </v-card>
      </div>

      <div class="px-6 pb-6">
        <v-card class="collection-section-card" elevation="0">
          <div class="collection-section-header">
            <div class="d-flex align-center">
              <v-icon start>mdi-map-marker-path</v-icon>
              <span>Rutas</span>
            </div>

            <v-text-field
              v-model="searchTramos"
              variant="outlined"
              hide-details
              single-line
              density="compact"
              prepend-inner-icon="mdi-magnify"
              placeholder="Buscar viaje..."
              class="collection-route-search"
            />
          </div>

          <v-card-text class="pa-0 collection-routes-container">
            <v-data-table
              v-model:expanded="expandedTramoRows"
              :headers="headersTramos"
              :items="sortedTramos"
              item-value="code"
              show-expand
              :items-per-page-text="'Elementos por página'"
              :items-per-page="5"
              no-data-text="No se encontraron rutas"
              :hide-default-header="true"
              class="busgo-table collection-route-table"
            >
              <template #top>
                <div class="collection-route-table-head">
                  <div
                    class="collection-route-col-code collection-route-sortable"
                    @click="toggleTramoSort('code')"
                  >
                    <span>Código viaje</span>
                    <v-icon size="16" class="ml-1">
                      {{ getTramoSortIcon("code") }}
                    </v-icon>
                  </div>

                  <div
                    class="collection-route-col-route collection-route-sortable"
                    @click="toggleTramoSort('routeName')"
                  >
                    <span>Ruta</span>
                    <v-icon size="16" class="ml-1">
                      {{ getTramoSortIcon("routeName") }}
                    </v-icon>
                  </div>

                  <div
                    class="collection-route-col-total collection-route-sortable"
                    @click="toggleTramoSort('totalTramo')"
                  >
                    <span>Total</span>
                    <v-icon size="16" class="ml-1">
                      {{ getTramoSortIcon("totalTramo") }}
                    </v-icon>
                  </div>

                  <div class="collection-route-col-actions"></div>
                </div>
              </template>

              <template #item="{ item }">
                <tr>
                  <td class="pa-0 border-0">
                    <div class="collection-route-row">
                      <div class="collection-route-col-code busgo-meta">
                        <span class="collection-route-code-value text-truncate">
                          {{ item.code || item.tripCode || "-" }}
                        </span>
                      </div>

                      <div class="collection-route-col-route">
                        <div class="collection-route-name-row">
                          <div class="collection-route-name">
                            {{ item.routeName || item.nombre || item.origin }}
                          </div>

                          <v-chip
                            v-if="item.routeCode"
                            size="x-small"
                            variant="tonal"
                            class="collection-route-code-chip flex-shrink-0"
                          >
                            {{ item.routeCode }}
                          </v-chip>
                        </div>

                        <div class="collection-route-meta text-truncate">
                          {{ item.origin }} → {{ item.destination }}
                        </div>
                      </div>

                      <div class="collection-route-col-total collection-route-total">
                        ${{ formatNumber(Number(item.totalTramo || 0)) }}
                      </div>

                      <div class="collection-route-col-actions collection-route-actions">
                        <v-btn
                          v-if="Number(item.totalPasajes || 0) > 0"
                          size="small"
                          variant="tonal"
                          :color="isTramoExpanded(item) ? 'primary' : 'grey'"
                          @click.stop="toggleTramoExpand(item)"
                        >
                          <v-icon size="18">
                            {{
                              isTramoExpanded(item)
                                ? "mdi-chevron-up"
                                : "mdi-chevron-down"
                            }}
                          </v-icon>
                        </v-btn>
                      </div>
                    </div>
                  </td>
                </tr>
              </template>

              <template #expanded-row="{ item }">
                <tr v-if="Number(item.totalPasajes || 0) > 0">
                  <td :colspan="headersTramos.length">
                    <div class="collection-route-detail">
                      <v-card variant="flat" class="collection-inner-card">
                        <div class="collection-tramo-methods-header-grid">
                          <div class="collection-tramo-methods-header-cell">
                            Método de pago
                          </div>
                          <div class="collection-tramo-methods-header-cell">
                            Asientos
                          </div>
                          <div class="collection-tramo-methods-header-cell">
                            Pasajes
                          </div>
                          <div class="collection-tramo-methods-header-cell">
                            Total
                          </div>
                        </div>

                        <div class="collection-tramo-methods-body">
                          <div
                            v-for="metodo in item.totalesPorMetodo || []"
                            :key="metodo.metodo"
                            class="collection-tramo-methods-row"
                          >
                            <div class="collection-tramo-methods-cell">
                            <v-chip
                              :color="getMethodInfo(metodo.metodo).color"
                              size="small"
                              label
                              class="font-weight-bold text-body-2"
                            >
                              <v-icon
                                start
                                :icon="getMethodInfo(metodo.metodo).icon"
                                size="small"
                              />
                              {{ metodo.metodo }}
                            </v-chip>
                            </div>

                            <div class="collection-tramo-methods-cell collection-tramo-methods-cell--center">
                            <v-chip
                              variant="outlined"
                              size="small"
                              color="indigo"
                              class="font-weight-bold"
                            >
                              {{ metodo.asientosComprados || 0 }}
                            </v-chip>
                            </div>

                            <div class="collection-tramo-methods-cell collection-tramo-methods-cell--center">
                            <v-chip
                              variant="outlined"
                              size="small"
                              :color="getMethodColor(metodo.metodo)"
                              class="font-weight-bold"
                            >
                              {{ metodo.cantidad }}
                            </v-chip>
                            </div>

                            <div class="collection-tramo-methods-cell collection-tramo-methods-cell--end">
                            <span
                              class="font-weight-bold"
                              :class="
                                'text-' + getMethodColor(metodo.metodo) + '-darken-3'
                              "
                            >
                              ${{ formatNumber(Number(metodo.total)) }}
                            </span>
                            </div>
                          </div>

                          <div class="collection-table-total">
                            <span>Subtotal:</span>
                            <strong>
                              ${{ formatNumber(Number(item.totalTramo || 0)) }}
                            </strong>
                          </div>
                        </div>
                      </v-card>
                    </div>
                  </td>
                </tr>
              </template>
            </v-data-table>
          </v-card-text>

          <v-divider v-if="filteredTramos.length > 0" />

          <v-card-actions
            v-if="filteredTramos.length > 0"
            class="collection-route-footer"
          >
            <v-spacer />

            <div>
              <span>Total General:</span>
              <strong>
                ${{
                  formatNumber(
                    Number(
                      filteredTramos.reduce(
                        (acc, curr) => acc + Number(curr.totalTramo),
                        0
                      )
                    )
                  )
                }}
              </strong>
            </div>
          </v-card-actions>
        </v-card>
      </div>
    </v-card>
  </v-container>
</template>

<script>
import { paleteColors } from "@/assets/colors";
import LocalStorageService from "@/LocalStorageService";
import { handleRequest } from "@/utils/api"; // Ruta al archivo
import { format } from "date-fns";
import * as XLSX from "xlsx";
import ReportDateRangeFilter from "@/components/ReportDateRangeFilter.vue";
export default {
  components: {
    ReportDateRangeFilter,
  },
  data: () => ({
    reporteData: {
      nombre: "Empresa XYZ",
      fecha: "2023-10-01",
      pasajesEmitidos: 150,
      reimpresiones: 10,
      totalesPorMetodo: [
        { metodo: "Efectivo", total: 5000 },
        { metodo: "Tarjeta", total: 3000 },
        { metodo: "Transferencia", total: 2000 },
      ],
      totales: 10000,
    },
    headersResumen: [
      { title: "RESUMEN", key: "title", align: "start", class: "font-weight-bold" },
      { title: "Pasajes emitidos", key: "pasajesEmitidos", align: "end" },
      { title: "Reimpresiones", key: "reimpresiones", align: "end" },
    ],
    headersMetodos: [
      { title: "MÉTODO DE PAGO", key: "metodo", align: "start", width: "40%" },
      { title: "ASIENTOS VENDIDOS", key: "asientosComprados", align: "end", width: "20%" },
      { title: "PASAJES", key: "cantidad", align: "end", width: "20%" },
      { title: "TOTAL", key: "total", align: "end", width: "20%", class: "font-weight-bold" },
    ],
    headersTramoMetodos: [
      { title: "MÉTODO", key: "metodo", align: "start" },
      { title: "ASIENTOS", key: "asientosComprados", align: "end" },
      { title: "PASAJES", key: "cantidad", align: "end" },
      { title: "TOTAL", key: "total", align: "end", class: "font-weight-bold" },
    ],
    headersTramos: [
      { title: "CÓDIGO", key: "code", align: "start" },
      { title: "RUTA", key: "routeName", align: "start" },
      { title: "TOTAL", key: "totalTramo", align: "end" },
      { title: "ACCIONES", key: "data-table-expand", align: "end" },
    ],
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
    type: "Sucursal",
    mostrarFila: false,
    permissions: "",
    branch_id: "",
    company_id: "",
    role: "",
    response: [],
    branches: [],
    data: {},
    menu: false,
    menu2: false,
    input: null,
    input2: null,
    date: null,
    endDate: null,
    searchTramos: "",
    sortTramosBy: "code",
    sortTramosOrder: "asc",
    expandedTramoRows: [],
    options: [
      { title: "Empresa", value: "Company", icon: "mdi-office-building" }, // Opción Negocio con ícono
      { title: "Sucursal", value: "Sucursal", icon: "mdi-store" }, // Opción Sucursal con ícono
    ],
    selectRules: [(v) => !!v || "Seleccionar al menos un elemento"],
  }),
  computed: {
    dateFormatted() {
      const date = this.input ? new Date(this.input) : new Date();
      return date.toISOString().split("T")[0];
    },
    getDate() {
      return this.input ? new Date(this.input) : new Date();
    },
    dateFormatted1() {
      const date = this.input2 ? new Date(this.input2) : new Date();
      return date.toISOString().split("T")[0];
    },
    getDate1() {
      return this.input2 ? new Date(this.input2) : new Date();
    },
    filteredTramos() {
      const tramos = Array.isArray(this.response?.tramos)
        ? [...this.response.tramos]
        : [];

      const query = this.searchTramos?.trim().toLowerCase();
      if (!query) {
        return tramos;
      }

      return tramos.filter((tramo) => {
        const metodoTexto = (tramo.totalesPorMetodo || [])
          .map((item) => `${item.metodo} ${item.cantidad} ${item.total}`)
          .join(" ")
          .toLowerCase();

        const texto = [
          tramo.code,
          tramo.tripCode,
          tramo.routeCode,
          tramo.routeName,
          tramo.nombre,
          tramo.origin,
          tramo.destination,
          tramo.totalPasajes,
          tramo.totalAsientosComprados,
          tramo.totalTramo,
          metodoTexto,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return texto.includes(query);
      });
    },
    sortedTramos() {
      const tramos = [...this.filteredTramos];

      const getValue = (tramo) => {
        switch (this.sortTramosBy) {
          case "routeName":
            return (tramo.routeName || tramo.nombre || tramo.origin || "").toString();
          case "totalTramo":
            return Number(tramo.totalTramo || 0);
          case "code":
          default:
            return (tramo.code || tramo.tripCode || "").toString();
        }
      };

      return tramos.sort((a, b) => {
        const valueA = getValue(a);
        const valueB = getValue(b);

        if (typeof valueA === "number" && typeof valueB === "number") {
          return this.sortTramosOrder === "asc"
            ? valueA - valueB
            : valueB - valueA;
        }

        return this.sortTramosOrder === "asc"
          ? valueA.localeCompare(valueB, "es", { sensitivity: "base" })
          : valueB.localeCompare(valueA, "es", { sensitivity: "base" });
      });
    },
  },
  mounted() {
    this.role = JSON.parse(LocalStorageService.getItem("role"));
    this.company_id = LocalStorageService.getItem("business_id");
    this.permissions = LocalStorageService.getItem("permissions");
    if (this.hasPermission("view_ticketsdate_company")) {
      this.showBranches();
      this.type = "Company";
      this.mostrarFila = true;
    } else {
      this.type = "Sucursal";
      this.branch_id = LocalStorageService.getItem("branch_id");
    }
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
    getMethodColor(metodo) {
      if (!metodo) return "grey"; // Manejo de valores nulos/undefined

      // Normalización del texto
      const normalized = metodo
        .toString()
        .toLowerCase() // Convertir a minúsculas
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Eliminar tildes
        .trim(); // Eliminar espacios extras

      const methodColors = {
        efectivo: "green",
        debito: "blue",
        credito: "orange",
        // Puedes agregar más variantes si es necesario
        "tarjeta debito": "blue",
        "tarjeta credito": "orange",
        cash: "green",
        contado: "green",
      };

      return methodColors[normalized] || "grey";
    },

    getMethodInfo(metodo) {
      if (!metodo) return { color: "grey", icon: "mdi-help-circle" };

      const normalized = metodo
        .toString()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();

      const methodData = {
        efectivo: { color: "green", icon: "mdi-cash" },
        debito: { color: "blue", icon: "mdi-credit-card-outline" },
        credito: { color: "orange", icon: "mdi-credit-card" },
        "tarjeta debito": { color: "blue", icon: "mdi-credit-card-outline" },
        "tarjeta credito": { color: "orange", icon: "mdi-credit-card" },
        // ... más métodos
      };

      return methodData[normalized] || { color: "grey", icon: "mdi-help-circle" };
    },
    toggleTramoSort(field) {
      if (this.sortTramosBy === field) {
        this.sortTramosOrder = this.sortTramosOrder === "asc" ? "desc" : "asc";
        return;
      }

      this.sortTramosBy = field;
      this.sortTramosOrder = "asc";
    },
    getTramoSortIcon(field) {
      if (this.sortTramosBy !== field) {
        return "mdi-swap-vertical";
      }

      return this.sortTramosOrder === "asc" ? "mdi-arrow-up" : "mdi-arrow-down";
    },
    toggleTramoExpand(tramo) {
      const rowId = tramo.code || tramo.tripCode;
      if (!rowId) return;
      this.expandedTramoRows =
        this.expandedTramoRows[0] === rowId ? [] : [rowId];
    },
    isTramoExpanded(tramo) {
      const rowId = tramo.code || tramo.tripCode;
      if (!rowId) return false;
      return this.expandedTramoRows.includes(rowId);
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
    async showBranches() {
      try {
        const result = await handleRequest({
          endpoint: "branch",
          method: "GET",
        });

        if (result.success) {
          // Si la solicitud es exitosa, asignamos las sucursales
          this.branches = result.data?.branches || [];
          this.branch_id = this.branches[0].id;
        } else {
          // Si no hay datos, asignamos un array vacío
          this.branches = [];
        }
      } catch (error) {
        this.loading = false;
        // Captura de errores no controlados
        //this.showAlert('error', 'Ocurrió un error inesperado al procesar la solicitud.', 3000);
      } finally {
        this.loading = false;
        this.initialize();
      }
    },
    async initialize() {
      if (this.branch_id === "null" && this.type === "Sucursal") {
        this.response = [];
        this.loading = false;
        return;
      }
      try {
        this.loading = true;
        this.data = {};
        this.data.id =
          this.type === "Company" ? Number(this.company_id) : Number(this.branch_id);
        this.data.type = this.type;
        // Formatear las fechas

        /*const formattedDate = this.date
          ? format(new Date(this.date), "yyyy-MM-dd")
          : format(new Date(), "yyyy-MM-dd");
        const formattedEndDate = this.endDate
          ? format(new Date(this.endDate), "yyyy-MM-dd")
          : format(new Date(), "yyyy-MM-dd");*/
        const formattedDate = this.date ?? new Date().toISOString().split("T")[0];
        const formattedEndDate = this.endDate ?? new Date().toISOString().split("T")[0];

        // Comparar las fechas
        if (formattedDate === formattedEndDate) {
          this.data.date = formattedDate; // Solo enviar una fecha si son iguales
        } else {
          this.data.date = formattedDate;
          this.data.endDate = formattedEndDate;
        }
        const result = await handleRequest({
          endpoint: "ticket-sold-date",
          method: "POST",
          data: this.data,
        });

        if (result.success) {
          // Si la solicitud es exitosa, asignamos las sucursales
          this.response = result.data || [];
        } else {
          // Si no hay datos, asignamos un array vacío
          this.response = [];
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
    updateDate(val) {
      this.input = val;
      this.date = this.dateFormatted;
      this.menu = false;
    },
    updateDate1(val) {
      this.input2 = val;
      this.endDate = this.dateFormatted1;
      this.menu2 = false;
    },
    exportToExcel() {
      //try {
      let rows = [];

      rows.push([this.response.nombre]);
      rows.push([]);
      rows.push(["FECHA:", this.response.fecha]);
      rows.push([]);
      rows.push(["EMISIÓN DE PASAJES"]);
      rows.push([]);
      rows.push(["Pasajes emitidos:", this.response.pasajesEmitidos]);
      rows.push(["Reimpresiones:", this.response.reimpresiones]);
      rows.push([]);
      // 4. Agregar filas con los totales por método de pago
      this.response.totalesPorMetodo.forEach((item) => {
        rows.push([item.metodo, `$${item.cantidad}`]);
      });

      rows.push([]); // Fila vacía para separar
      // 3. Agregar encabezados para los totales por método de pago
      rows.push(["TOTALES"]);
      rows.push([]);
      // 4. Agregar filas con los totales por método de pago
      this.response.totalesPorMetodo.forEach((item) => {
        rows.push([item.metodo, `$${item.total}`]);
      });

      rows.push([]); // Fila vacía para separar

      rows.push(["TOTAL:", `$${this.response.totales}`]);
      rows.push([]);
      rows.push(["---------------------------------------------"]);
      rows.push(["Rutas:"]);
      rows.push(["---------------------------------------------"]);
      rows.push([]);

      (this.response.tramos || []).forEach((tramo) => {
        rows.push([tramo.nombre]);
        rows.push([]);
        rows.push(["Total Pasajes:", tramo.totalPasajes]);

        (tramo.totalesPorMetodo || []).forEach((total) => {
          rows.push([`${total.metodo}:`, total.cantidad]);
        });

        rows.push(["Total Ruta:", tramo.totalTramo]);

        (tramo.totalesPorMetodo || []).forEach((total) => {
          rows.push([`${total.metodo}:`, `$${total.total}`]);
        });

        rows.push(["---------------------------------------------"]);
        rows.push([]);
      });

      const ws = XLSX.utils.aoa_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Reporte");

      XLSX.writeFile(
        wb,
        `reporte_ventas_${new Date().toLocaleDateString().replace(/\//g, "-")}.xlsx`
      );
      //} catch (error) {
      //this.showAlert("error", "Ocurrió un error al exportar el Excel.", 3000);
      //}
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

<style scoped>
/* Estilos personalizados */
.v-card-title {
  padding: 16px;
}

.v-card-text {
  padding: 16px;
}

.v-table {
  width: 100%;
}

.text-h4 {
  font-weight: bold;
}

.primary--text {
  color: #1976d2;
  /* Color primario de Vuetify */
}
.tramos-card {
  max-height: 600px; /* Altura máxima ajustable */
  display: flex;
  flex-direction: column;
}

.tramos-container {
  overflow-y: auto;
  flex: 1;
}

.metodo-pago-table {
  max-height: 200px;
}

/* Scrollbar personalizada */
.tramos-container::-webkit-scrollbar {
  width: 6px;
}

.tramos-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.tramos-container::-webkit-scrollbar-thumb {
  background: #b0bec5;
  border-radius: 3px;
}

.tramos-container::-webkit-scrollbar-thumb:hover {
  background: #78909c;
}

.collection-date {
  font-size: 13px;
  font-weight: 600;
  color: #475569;
}

.collection-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.collection-filter {
  width: 230px;
  min-width: 230px;
}

.collection-kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.collection-kpi-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px;
  border: 1px solid #eef2f7;
  border-radius: 16px;
  background: #ffffff;
}

.collection-kpi-icon {
  border-radius: 14px;
}

.collection-kpi-label {
  font-size: 13px;
  color: #64748b;
  font-weight: 600;
}

.collection-kpi-value {
  font-size: 22px;
  font-weight: 800;
  color: #111827;
  margin-top: 2px;
}

.collection-section-card {
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  overflow: hidden;
  background: #ffffff;
}

.collection-section-header {
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

.collection-methods-section-header,
.collection-methods-row {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr) minmax(140px, 1fr);
  gap: 12px;
  align-items: center;
}

.collection-methods-title,
.collection-methods-cell {
  min-width: 0;
}

.collection-methods-header-cell {
  min-width: 0;
  font-size: 12px;
  font-weight: 800;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  text-align: center;
}

.collection-methods-header-cell:last-child {
  text-align: right;
}

.collection-table {
  background: transparent;
}

.collection-methods-body {
  background: #ffffff;
}

.collection-methods-row {
  min-height: 52px;
  padding: 10px 18px;
  border-bottom: 1px solid #eef2f7;
}

.collection-methods-cell--center {
  display: flex;
  justify-content: center;
}

.collection-methods-cell--end {
  text-align: right;
}

.collection-methods-empty {
  padding: 16px 18px;
  color: #64748b;
  font-size: 14px;
  border-bottom: 1px solid #eef2f7;
}

.collection-table-total {
  padding: 12px 16px;
  text-align: right;
  border-top: 1px solid #eef2f7;
  font-size: 14px;
}

.collection-table-total span {
  margin-right: 8px;
  color: #475569;
}

.collection-route-search {
  max-width: 320px;
}

.collection-routes-container {
  max-height: 58vh;
  overflow-y: auto;
}

.collection-route-detail {
  padding: 10px 18px 16px;
}

.collection-inner-card {
  border: 1px solid #eef2f7;
  border-radius: 14px;
  overflow: hidden;
}

.collection-tramo-methods-header-grid {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr) minmax(120px, 1fr);
  gap: 12px;
  align-items: center;
  padding: 12px 18px 10px;
  background: #f8fafc;
  border-bottom: 1px solid #eef2f7;
}

.collection-tramo-methods-header-cell {
  min-width: 0;
  font-size: 12px;
  font-weight: 800;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.collection-tramo-methods-header-cell:nth-child(2),
.collection-tramo-methods-header-cell:nth-child(3) {
  text-align: center;
}

.collection-tramo-methods-header-cell:nth-child(4) {
  text-align: right;
}

.collection-tramo-methods-body {
  background: #ffffff;
}

.collection-tramo-methods-row {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr) minmax(120px, 1fr);
  gap: 12px;
  align-items: center;
  min-height: 52px;
  padding: 10px 18px;
  border-bottom: 1px solid #eef2f7;
}

.collection-tramo-methods-cell {
  min-width: 0;
}

.collection-tramo-methods-cell--center {
  display: flex;
  justify-content: center;
}

.collection-tramo-methods-cell--end {
  text-align: right;
}

.collection-route-table {
  background: transparent;
}

.collection-route-table-head {
  display: grid;
  grid-template-columns: minmax(160px, 1.2fr) minmax(220px, 1.8fr) minmax(120px, 0.8fr) 64px;
  gap: 12px;
  align-items: center;
  min-height: 56px;
  padding: 12px 18px;
  background: #f8fafc;
  border-bottom: 1px solid #eef2f7;
}

.collection-route-sortable {
  display: flex;
  align-items: center;
  min-width: 0;
  cursor: pointer;
  font-size: 12px;
  font-weight: 800;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.collection-route-col-total {
  justify-content: flex-end;
  text-align: right;
}

.collection-route-col-actions {
  justify-self: end;
}

.collection-route-row {
  display: grid;
  grid-template-columns: minmax(160px, 1.2fr) minmax(220px, 1.8fr) minmax(120px, 0.8fr) 64px;
  gap: 12px;
  align-items: center;
  padding: 14px 18px;
  background: #ffffff;
  border-bottom: 1px solid #eef2f7;
}

.collection-route-col-code,
.collection-route-col-route,
.collection-route-col-total,
.collection-route-col-actions {
  min-width: 0;
}

.collection-route-code-value {
  font-size: 13px;
  font-weight: 700;
  color: #111827;
}

.collection-route-name-row {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 8px;
}

.collection-route-name {
  min-width: 0;
  font-size: 14px;
  font-weight: 700;
  color: #111827;
}

.collection-route-code-chip {
  flex-shrink: 0;
}

.collection-route-meta {
  margin-top: 4px;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
}

.collection-route-total {
  justify-self: end;
  font-size: 14px;
  font-weight: 800;
  color: #111827;
}

.collection-route-actions {
  display: flex;
  justify-content: flex-end;
}

.collection-route-footer {
  padding: 14px 18px;
  background: #f8fafc;
  font-size: 15px;
}

.collection-route-footer span {
  margin-right: 8px;
  color: #475569;
}

@media (max-width: 960px) {
  .collection-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .collection-filter {
    width: 100%;
    min-width: 100%;
  }

  .collection-kpi-grid {
    grid-template-columns: 1fr;
  }

  .collection-section-header {
    flex-direction: column;
    align-items: stretch;
  }

  .collection-methods-section-header,
  .collection-methods-row {
    grid-template-columns: minmax(0, 1.4fr) minmax(0, 0.8fr) minmax(0, 0.8fr) minmax(110px, 0.9fr);
    gap: 8px;
  }

  .collection-route-search {
    max-width: 100%;
  }

  .collection-route-table-head,
  .collection-route-row {
    grid-template-columns: minmax(120px, 1fr) minmax(160px, 1.4fr) minmax(100px, 0.75fr) 56px;
    gap: 8px;
    padding-left: 14px;
    padding-right: 14px;
  }

  .collection-route-name-row {
    flex-wrap: wrap;
  }
}
</style>



