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
          <div class="collection-section-header">
            <div class="d-flex align-center">
              <v-icon start>mdi-credit-card-multiple</v-icon>
              <span>Totales por Método de Pago</span>
            </div>
          </div>

          <v-data-table
            :headers="headersMetodos"
            :items="response.totalesPorMetodo || []"
            :items-per-page="5"
            density="comfortable"
            class="collection-table"
            no-data-text="No se encontraron registros de pagos"
          >
            <template #item.metodo="{ item }">
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
            </template>

            <template #item.cantidad="{ item }">
              <v-chip
                variant="outlined"
                size="small"
                :color="getMethodColor(item.metodo)"
                class="font-weight-bold"
              >
                {{ item.cantidad }}
              </v-chip>
            </template>

            <template #item.total="{ item }">
              <span
                class="font-weight-bold"
                :class="'text-' + getMethodColor(item.metodo) + '-darken-3'"
              >
                ${{ formatNumber(Number(item.total)) }}
              </span>
            </template>

            <template #bottom>
              <div class="collection-table-total">
                <span>Total general:</span>
                <strong>${{ formatNumber(Number(response.totales)) }}</strong>
              </div>
            </template>
          </v-data-table>
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
            <v-expansion-panels variant="accordion" class="pa-3">
              <v-expansion-panel
                v-for="(tramo, index) in filteredTramos"
                :key="index"
                class="collection-route-panel"
              >
                <v-expansion-panel-title
                  class="collection-route-title"
                  :expand-icon="tramo.totalPasajes > 0 ? 'mdi-chevron-down' : undefined"
                  :hide-actions="tramo.totalPasajes === 0"
                >
                  <v-row align="center" no-gutters>
                    <v-col cols="12" md="8" class="d-flex align-center">
                      <v-avatar
                        :color="
                          tramo.totalPasajes > 0
                            ? 'green-lighten-4'
                            : 'grey-lighten-3'
                        "
                        size="32"
                        class="mr-3"
                      >
                        <v-icon
                          :color="
                            tramo.totalPasajes > 0
                              ? 'green-darken-2'
                              : 'grey'
                          "
                          size="20"
                        >
                          mdi-road
                        </v-icon>
                      </v-avatar>

                      <div class="collection-route-name">
                        <span>{{ tramo.origin }}</span>
                        <v-icon
                          size="18"
                          :color="
                            tramo.totalPasajes > 0
                              ? 'green-darken-2'
                              : 'grey'
                          "
                          class="mx-2"
                        >
                          mdi-arrow-right
                        </v-icon>
                        <span>{{ tramo.destination }}</span>
                      </div>
                    </v-col>

                    <v-col cols="12" md="4" class="collection-route-summary">
                      <v-tooltip location="top">
                        <template #activator="{ props }">
                          <v-chip
                            v-bind="props"
                            :color="
                              tramo.totalPasajes > 0
                                ? 'green-lighten-2'
                                : 'grey-lighten-2'
                            "
                            variant="outlined"
                            size="small"
                            class="font-weight-bold"
                          >
                            <v-icon start size="16">mdi-ticket</v-icon>
                            {{ tramo.totalPasajes }}
                          </v-chip>
                        </template>
                        <span>Total pasajes vendidos</span>
                      </v-tooltip>

                      <v-tooltip location="top">
                        <template #activator="{ props }">
                          <v-chip
                            v-bind="props"
                            :color="
                              tramo.totalTramo > 0
                                ? 'green-darken-2'
                                : 'grey-lighten-3'
                            "
                            size="small"
                            class="font-weight-bold"
                          >
                            <v-icon start size="16">mdi-cash</v-icon>
                            ${{ formatNumber(Number(tramo.totalTramo)) }}
                          </v-chip>
                        </template>
                        <span>Total recaudado</span>
                      </v-tooltip>
                    </v-col>
                  </v-row>
                </v-expansion-panel-title>

                <v-expansion-panel-text
                  v-if="tramo.totalPasajes > 0"
                  class="collection-route-detail"
                >
                  <v-card variant="flat" class="collection-inner-card">
                    <v-data-table
                      :headers="headersTramoMetodos"
                      :items="tramo.totalesPorMetodo || []"
                      :items-per-page="3"
                      density="compact"
                      class="collection-table"
                    >
                      <template #item.metodo="{ item }">
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
                      </template>

                      <template #item.cantidad="{ item }">
                        <v-chip
                          variant="outlined"
                          size="small"
                          :color="getMethodColor(item.metodo)"
                          class="font-weight-bold"
                        >
                          {{ item.cantidad }}
                        </v-chip>
                      </template>

                      <template #item.total="{ item }">
                        <span
                          class="font-weight-bold"
                          :class="
                            'text-' + getMethodColor(item.metodo) + '-darken-3'
                          "
                        >
                          ${{ formatNumber(Number(item.total)) }}
                        </span>
                      </template>

                      <template #bottom>
                        <div class="collection-table-total">
                          <span>Subtotal:</span>
                          <strong>
                            ${{ formatNumber(Number(tramo.totalTramo)) }}
                          </strong>
                        </div>
                      </template>
                    </v-data-table>
                  </v-card>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
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
      { title: "MÉTODO DE PAGO", key: "metodo", align: "start" },
      { title: "CANTIDAD", key: "cantidad", align: "end" },
      { title: "TOTAL", key: "total", align: "end", class: "font-weight-bold" },
    ],
    headersTramoMetodos: [
      { title: "MÃ‰TODO", key: "metodo", align: "start" },
      { title: "CANTIDAD", key: "cantidad", align: "end" },
      { title: "TOTAL", key: "total", align: "end", class: "font-weight-bold" },
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
          tramo.nombre,
          tramo.origin,
          tramo.destination,
          tramo.totalPasajes,
          tramo.totalTramo,
          metodoTexto,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return texto.includes(query);
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
      rows.push(["ENISIÓN DE PASAJES"]);
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
  grid-template-columns: repeat(3, minmax(0, 1fr));
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

.collection-table {
  background: transparent;
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

.collection-route-panel {
  margin-bottom: 8px;
  border: 1px solid #eef2f7;
  border-radius: 14px !important;
  overflow: hidden;
  background: #ffffff;
}

.collection-route-title {
  min-height: 58px;
  padding: 10px 16px;
}

.collection-route-name {
  display: flex;
  align-items: center;
  min-width: 0;
  font-size: 14px;
  font-weight: 700;
  color: #111827;
}

.collection-route-summary {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.collection-route-detail {
  padding-top: 8px;
}

.collection-inner-card {
  border: 1px solid #eef2f7;
  border-radius: 14px;
  overflow: hidden;
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

  .collection-route-search {
    max-width: 100%;
  }

  .collection-route-summary {
    justify-content: flex-start;
    margin-top: 10px;
  }

  .collection-route-name {
    flex-wrap: wrap;
  }
}
</style>
