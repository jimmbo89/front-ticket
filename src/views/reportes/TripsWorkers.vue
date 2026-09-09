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

  <v-card class="busgo-page-header worker-report-page-header" elevation="0">

    <v-avatar :color="paleteColors.primary" class="busgo-page-icon worker-report-page-icon">

      <v-icon>mdi-account-cash-outline</v-icon>

    </v-avatar>

    <div>

      <div class="busgo-page-title">Recaudación por Trabajador</div>

      <div class="busgo-page-subtitle">

        Analiza el rendimiento comercial de cada trabajador

      </div>

    </div>

    <v-spacer />

    <v-btn

      :color="paleteColors.green"

      variant="flat"

      elevation="0"

      prepend-icon="mdi-file-excel-box"

      class="busgo-add-btn worker-report-export-button"
      :disabled="loading"

      @click="exportToExcel()"

    >

      Exportar a Excel

    </v-btn>

  </v-card>

  <v-container fluid class="busgo-container worker-report-container">

    <v-card class="busgo-card worker-report-shell" elevation="0">

      <v-progress-linear
        v-if="loading"
        indeterminate
        :color="paleteColors.primary"
        class="worker-report-loading-bar"
      />

      <div class="busgo-card-header worker-report-summary-header">

        <div>

          <div class="busgo-card-title">

            Listado de recaudación por trabajador

          </div>

          <div class="busgo-card-subtitle">

            Consulta viajes, pasajeros, horarios y montos generados.

          </div>

        </div>

        <v-chip

          color="green-darken-2"

          variant="tonal"

          label

          size="large"

          class="worker-collection-total"

        >

          <v-icon start size="17">mdi-cash-multiple</v-icon>
          Total general: ${{ formatNumber(Number(totalGeneral || 0)) }}

        </v-chip>

      </div>

      <div class="worker-collection-toolbar px-6 pb-4">

        <div class="worker-toolbar-label">
          <v-icon size="18">mdi-tune-variant</v-icon>
          <div>
            <strong>Filtros del reporte</strong>
            <span>Selecciona el período, sucursal y trabajador</span>
          </div>
        </div>

        <ReportDateRangeFilter

          v-model:start-date="date"

          v-model:end-date="endDate"

        />

        <v-autocomplete

          v-if="mostrarFila"

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

          single-line

          class="worker-collection-filter"

          :menu-props="{ contentClass: 'worker-report-select-menu' }"

          :rules="selectRules"

        >

          <template #item="{ props, item }">

            <v-list-item v-bind="props" :title="undefined" :subtitle="undefined" class="worker-report-select-item">
              <template #prepend>
                <v-avatar size="34" rounded="lg" class="worker-report-option-avatar">
                  <v-img :src="getImageUrl(item.raw.image)" cover />
                </v-avatar>
              </template>
              <v-list-item-title>{{ item.raw.name }}</v-list-item-title>
              <v-list-item-subtitle>Sucursal operativa</v-list-item-subtitle>
            </v-list-item>

          </template>

          <template #selection="{ item }">
            <div class="worker-report-selection">
              <v-avatar size="24" rounded="lg">
                <v-img :src="getImageUrl(item.raw.image)" cover />
              </v-avatar>
              <span>{{ item.raw.name }}</span>
            </div>
          </template>

        </v-autocomplete>

        <v-autocomplete

          v-if="mostrarFila"

          v-model="selectedWorker"

          :items="workers"

          :no-data-text="'No hay datos disponibles'"

          item-title="name"

          item-value="id"

          density="compact"

          variant="outlined"

          prepend-inner-icon="mdi-account"

          placeholder="Trabajador"

          hide-details

          single-line

          class="worker-collection-filter"

          :menu-props="{ contentClass: 'worker-report-select-menu' }"

          :rules="selectRules"

        >

          <template #item="{ props, item }">

            <v-list-item v-bind="props" :title="undefined" :subtitle="undefined" class="worker-report-select-item">
              <template #prepend>
                <v-avatar size="34" rounded="lg" class="worker-report-option-avatar">
                  <v-img :src="getImageUrl(item.raw.image)" cover />
                </v-avatar>
              </template>
              <v-list-item-title>{{ item.raw.name }}</v-list-item-title>
              <v-list-item-subtitle>
                {{ item.raw.role?.name || "Sin rol asignado" }}
              </v-list-item-subtitle>
              <template #append>
                <v-icon size="16">mdi-account-check-outline</v-icon>
              </template>
            </v-list-item>

          </template>

          <template #selection="{ item }">
            <div class="worker-report-selection">
              <v-avatar size="24" rounded="lg">
                <v-img :src="getImageUrl(item.raw.image)" cover />
              </v-avatar>
              <span>{{ item.raw.name }}</span>
            </div>
          </template>

        </v-autocomplete>

        <v-btn

          variant="flat"

          :color="paleteColors.primary"

          prepend-icon="mdi-magnify"

          class="worker-report-query-button"

          :loading="loading"

          @click="initialize"

        >

          Consultar

        </v-btn>

      </div>

      <div class="worker-kpi-grid">
        <v-card class="worker-kpi-card worker-kpi-card--trips" elevation="0">
          <div class="worker-kpi-icon"><v-icon>mdi-bus-clock</v-icon></div>
          <div><span>Viajes registrados</span><strong>{{ totalTrips }}</strong></div>
        </v-card>

        <v-card class="worker-kpi-card worker-kpi-card--passengers" elevation="0">
          <div class="worker-kpi-icon"><v-icon>mdi-account-group</v-icon></div>
          <div><span>Pasajeros</span><strong>{{ totalPassengers }}</strong></div>
        </v-card>

        <v-card class="worker-kpi-card worker-kpi-card--tickets" elevation="0">
          <div class="worker-kpi-icon"><v-icon>mdi-ticket-confirmation</v-icon></div>
          <div><span>Pasajes emitidos</span><strong>{{ totalTickets }}</strong></div>
        </v-card>

        <v-card class="worker-kpi-card worker-kpi-card--revenue" elevation="0">
          <div class="worker-kpi-icon"><v-icon>mdi-cash-multiple</v-icon></div>
          <div><span>Recaudación</span><strong>${{ formatNumber(Number(totalGeneral || 0)) }}</strong></div>
        </v-card>
      </div>

      <div class="worker-table-panel">
        <div class="worker-table-heading">
          <div>
            <div class="worker-table-title">Listado de viajes</div>
            <div class="worker-table-subtitle">
              {{ sortedResponse.length }} viajes registrados
            </div>
          </div>

          <v-text-field
            v-model="search"
            density="compact"
            placeholder="Buscar viaje..."
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            hide-details
            clearable
            class="worker-table-search"
          />
        </div>

        <v-divider />

        <v-data-table

        v-model:items-per-page="itemsPerPage"

        v-model:page="page"

        v-model:sort-by="tableSortBy"

        :headers="tableHeaders"

        :items="response"

        :search="search"

        :hide-default-header="false"

        sort-asc-icon="mdi-arrow-up"

        sort-desc-icon="mdi-arrow-down"

        :items-per-page-options="[5, 10, 15, 25]"

        items-per-page-text="Elementos por página"

        no-data-text="No hay datos disponibles"

        :loading="loading"

        loading-text="Cargando datos..."

        class="worker-native-table"

      >

        <template #loading><v-skeleton-loader type="table-row@5" /></template>


        <template #[`item.code`]="{ item }">
          <div class="worker-code-cell">
            <div class="worker-table-avatar worker-table-avatar--code">
              <v-icon size="17">mdi-ticket-confirmation-outline</v-icon>
            </div>
            <span class="worker-code-value">{{ item.code || "-" }}</span>
          </div>
        </template>

        <template #[`item.routeCode`]="{ item }">
          <div class="worker-route-cell">
            <div class="worker-route-name">{{ item.routeCode || "Sin ruta" }}</div>
            <div class="worker-route-points">
              <v-icon size="13">mdi-map-marker</v-icon>
              <span>{{ item.origin || "-" }}</span>
              <v-icon size="13">mdi-arrow-right</v-icon>
              <span>{{ item.destination || "-" }}</span>
            </div>
          </div>
        </template>

        <template #[`item.date`]="{ item }">
          <span class="worker-date-value"><v-icon size="15">mdi-calendar-outline</v-icon>{{ item.date || "-" }}</span>
        </template>

        <template #[`item.scheduled_departure`]="{ item }">
          <span class="worker-date-value"><v-icon size="15">mdi-clock-outline</v-icon>{{ formatScheduledDeparture(item.scheduled_departure) }}</span>
        </template>

        <template #[`item.sale_mode_label`]="{ item }">
          <span class="worker-mode-badge" :class="getSaleModeLabel(item) === 'Express' ? 'worker-mode-badge--express' : 'worker-mode-badge--full'">
            {{ getSaleModeLabel(item) }}
          </span>
        </template>

        <template #[`item.vehicleName`]="{ item }">
          <div class="worker-vehicle-cell">
            <div class="worker-table-avatar">
              <v-img
                v-if="item.vehicleImage"
                :src="`${this.$axios.defaults.baseURL}images/${item.vehicleImage}?t=${getCacheTimestamp()}`"
                width="34"
                height="34"
                cover
              >
                <template #error><v-icon size="17">mdi-bus</v-icon></template>
              </v-img>
              <v-icon v-else size="17">mdi-bus</v-icon>
            </div>
            <div class="worker-vehicle-copy">
              <strong>{{ item.plate || item.vehicleName || "Sin vehículo" }}</strong>
              <span v-if="item.vehicleName && item.vehicleName !== item.plate">{{ item.vehicleName }}</span>
            </div>
          </div>
        </template>

        <template #[`item.asientosComprados`]="{ item }">
          <span class="worker-count-badge worker-count-badge--passengers"><v-icon size="14">mdi-seat-passenger</v-icon>{{ item.asientosComprados || 0 }}</span>
        </template>

        <template #[`item.passenger`]="{ item }">
          <span class="worker-count-badge worker-count-badge--tickets"><v-icon size="14">mdi-ticket-outline</v-icon>{{ item.passenger || 0 }}</span>
        </template>

        <template #[`item.totalAmount`]="{ item }">
          <span class="worker-amount-value">${{ formatNumber(Number(item.totalAmount || 0)) }}</span>
        </template>

        </v-data-table>
      </div>

    </v-card>

  </v-container>

</template>

<script>

import LocalStorageService from "@/LocalStorageService";

import { handleRequest } from "@/utils/api"; // Ruta al archivo

import { paleteColors } from "@/assets/colors";

import { formatLocalDate } from "@/utils/date";

import * as XLSX from 'xlsx';

import ReportDateRangeFilter from "@/components/ReportDateRangeFilter.vue";

export default {

    components: {

        ReportDateRangeFilter,

    },

    data: () => ({

        snackbar: false,

        sb_type: '',

        sb_message: '',

        sb_timeout: 2000,

        sb_title: '',

        sb_icon: '',

        paleteColors: paleteColors,

        valid: true,

        loading: false,

        itemsPerPage: 10,

        page: 1,

        tableSortBy: [{ key: 'date', order: 'desc' }],

        tableHeaders: [
            { title: 'Código', key: 'code', align: 'start', width: 125 },
            { title: 'Ruta', key: 'routeCode', align: 'start', width: 300 },
            { title: 'Fecha', key: 'date', align: 'start', width: 115 },
            { title: 'Hora programada', key: 'scheduled_departure', align: 'start', width: 125 },
            { title: 'Modo venta', key: 'sale_mode_label', align: 'center', width: 105 },
            { title: 'Vehículo', key: 'vehicleName', align: 'start', width: 185 },
            { title: 'Pasajeros', key: 'asientosComprados', align: 'center', width: 100 },
            { title: 'Pasajes emitidos', key: 'passenger', align: 'center', width: 125 },
            { title: 'Total', key: 'totalAmount', align: 'end', width: 130 },
        ],

        headers: [

            { title: 'Código', value: 'code', },

            { title: 'Ruta', value: 'routeCode', },

            { title: 'Fecha', value: 'date', },

            { title: 'Hora Programada', value: 'scheduled_departure', },

            { title: 'Modo venta', value: 'sale_mode_label', },

            { title: 'Origen', value: 'origin', },

            { title: 'Destino', value: 'destination', },

            { title: 'Vehículo', value: 'vehicleName', },

            { title: 'Asientos', value: 'asientosComprados', },

            { title: 'Pasajes', value: 'passenger', },

            { title: 'Monto generado', value: 'totalAmount', },

        ],

        search: '',

        branch_id: '',

        worker_id: '',

        user_id: '',

        selectedWorker: '',

        workers: [],

        role: '',

        response: [],

        totalGeneral: 0,

        sortBy: 'date',

        sortOrder: 'desc',

        branches: [],

        mostrarFila: false,

        permissions: '',

        data: {},

        menu: false,

        menu2: false,

        input: null,

        input2: null,

        date: null,

        endDate: null,

        selectRules: [(v) => !!v || "Seleccionar al menos un elemento"],

    }),

    computed: {

      totalTrips() {
        return Array.isArray(this.response) ? this.response.length : 0;
      },

      totalPassengers() {
        return (Array.isArray(this.response) ? this.response : []).reduce(
          (total, item) => total + Number(item.asientosComprados || 0),
          0
        );
      },

      totalTickets() {
        return (Array.isArray(this.response) ? this.response : []).reduce(
          (total, item) => total + Number(item.passenger || 0),
          0
        );
      },

      sortedResponse() {

        const items = Array.isArray(this.response) ? [...this.response] : [];

        const key = this.sortBy;

        const direction = this.sortOrder === 'asc' ? 1 : -1;

        return items.sort((a, b) => {

          const aValue = this.getSortValue(a, key);

          const bValue = this.getSortValue(b, key);

          if (this.isDateSortKey(key)) {

            return direction * this.compareDates(aValue, bValue);

          }

          if (this.isNumericSortKey(key)) {

            return direction * (Number(aValue || 0) - Number(bValue || 0));

          }

          return direction * String(aValue ?? '').localeCompare(String(bValue ?? ''), 'es', {

            numeric: true,

            sensitivity: 'base',

          });

        });

      },

       dateFormatted() {

      return formatLocalDate(this.input || new Date());

    },

    getDate() {

      return this.input ? new Date(this.input) : new Date();

    },

    dateFormatted1() {

      return formatLocalDate(this.input2 || new Date());

    },

    getDate1() {

      return this.input2 ? new Date(this.input2) : new Date();

    },

    },

    watch: {

    branch_id(newBranchId) {

      if (newBranchId) {

        // Buscar la sucursal seleccionada

        const selectedBranch = this.branches.find(b => b.id === newBranchId);

        // Asignar sus trabajadores al array `workers`

        this.workers = selectedBranch?.workers || [];

        this.selectedWorker = this.worker_id;

      } else {

        this.workers = [];

        this.selectedWorker = this.worker_id;

      }

    }

  },

    mounted() {

        this.role = JSON.parse(LocalStorageService.getItem('role'));

        this.worker_id =  parseInt(LocalStorageService.getItem('worker_id'), 10);

        this.user_id = parseInt(LocalStorageService.getItem('user_id'), 10);

        this.selectedWorker = this.worker_id;

        this.permissions = LocalStorageService.getItem('permissions');

        if (this.hasPermission('view_tripsworker_company'))  {

            this.showBranches();

            this.mostrarFila = true;

        } else {

          this.mostrarFila = false,

            this.branch_id =  parseInt(LocalStorageService.getItem('branch_id'), 10);

            this.initialize();

        }

        console.log('LocalStorageService.getItem(branch_id)');

        console.log(LocalStorageService.getItem('branch_id'));

    },

    methods: {

      toggleSort(key) {

        if (this.sortBy === key) {

          this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';

          return;

        }

        this.sortBy = key;

        this.sortOrder = key === 'date' ? 'desc' : 'asc';

      },

      compareDates(a, b) {

        const aTime = new Date(a || 0).getTime();

        const bTime = new Date(b || 0).getTime();

        return aTime - bTime;

      },

      isDateSortKey(key) {

        return ['date'].includes(key);

      },

      isNumericSortKey(key) {

        return ['asientosComprados', 'passenger', 'totalAmount'].includes(key);

      },

      getSortValue(item, key) {

        switch (key) {

          case 'code':

            return item?.code ?? '';

          case 'routeCode':

            return item?.routeCode ?? '';

          case 'date':

            return item?.date ?? '';

          case 'scheduled_departure':

            return item?.scheduled_departure ?? '';

          case 'sale_mode_label':

            return this.getSaleModeLabel(item);

          case 'origin':

            return item?.origin ?? '';

          case 'destination':

            return item?.destination ?? '';

          case 'vehicleName':

            return item?.vehicleName ?? '';

          case 'asientosComprados':

            return item?.asientosComprados ?? 0;

          case 'passenger':

            return item?.passenger ?? 0;

          case 'totalAmount':

            return item?.totalAmount ?? 0;

          default:

            return item?.[key] ?? '';

        }

      },

      getImageUrl(imagePath) {

      return `${this.$axios.defaults.baseURL}images/${imagePath}?t=${this.getCacheTimestamp()}`;

    },

      getSaleModeLabel(trip = {}) {

        const saleMode = String(trip?.sale_mode || trip?.saleMode || 'normal')

          .toLowerCase()

          .trim();

        return saleMode === 'express' ? 'Express' : 'Full';

      },

      getSaleModeColor(trip = {}) {

        const saleMode = String(trip?.sale_mode || trip?.saleMode || 'normal')

          .toLowerCase()

          .trim();

        return saleMode === 'express' ? 'secondary' : 'primary';

      },

      formatScheduledDeparture(value) {

        if (!value) {

          return '--:--';

        }

        const text = String(value).trim();

        const timeMatch = text.match(/(?:T|\s)(\d{2}:\d{2})(?::\d{2})?/);

        if (timeMatch) {

          return timeMatch[1];

        }

        const shortTimeMatch = text.match(/^(\d{1,2}:\d{2})(?::\d{2})?$/);

        if (shortTimeMatch) {

          return shortTimeMatch[1].padStart(5, '0');

        }

        return text;

      },

    getCacheTimestamp() {

      // Usamos medianoche (00:00:00) del día actual

      const now = new Date();

      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      return startOfDay.getTime(); // Ej: 1714003200000 (cambia una vez al día)

    },

      hasPermission(permission) {

        return this.permissions.includes(permission);

        },

        formatNumber(value) {

            // Si el valor es menor que 1000, devuelve el valor original con dos decimales

            if (value < 1000) {

                return (Math.round((value + Number.EPSILON) * 100) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

            }

            // Primero, redondea el valor a dos decimales

            value = Math.round((value + Number.EPSILON) * 100) / 100;

            // Convierte el valor a cadena con formato de número local (en-US)

            let formattedValue = value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

            return formattedValue;

        },

        buildReportRequestData() {

            const selectedWorker = this.workers.find((worker) => worker.id === this.selectedWorker);

            const formattedDate = this.date || formatLocalDate();

            const formattedEndDate = this.endDate || formattedDate;

            const data = {

                branch_id: this.branch_id,

                user_id: selectedWorker?.user_id ?? this.user_id ?? this.worker_id,

                date: formattedDate,

            };

            if (formattedEndDate !== formattedDate) {

                data.endDate = formattedEndDate;

            }

            return data;

        },

        async showBranches() {

            try {

                this.data = {};

                this.data.worker_id = this.worker_id;

                //this.data.worker_id = this.worker_id;

                const result = await handleRequest({

                    endpoint: 'worker-branches',

                    method: 'POST',

                    data: this.data

                });

                if (result.success) {

                    // Si la solicitud es exitosa, asignamos las sucursales

                    this.branches = result.data?.branches || [];

                    this.branch_id = this.branches[0].id;

                    this.workers = this.branches[0]?.workers || [];

                    this.selectedWorker = this.worker_id;

                } else {

                    // Si no hay datos, asignamos un array vacío

                    this.branches = [];

                }

            } catch (error) {

                this.loading = false;

                // Captura de errores no controlados

                //this.showAlert('error', 'Ocurrió un error inesperado al procesar la solicitud.', 3000);

            } finally {

                if (this.branches.length > 1) {

                    this.mostrarFila = true;

                }

                this.loading = false;

                this.initialize();

            }

        },

        async initialize() {

           if (this.branch_id === 'null') {

              this.response = [];

              this.loading = false;

              return;

            }

            try {

                this.loading = true;

                this.data = this.buildReportRequestData();

                const result = await handleRequest({

                    endpoint: 'trips-worker-report',

                    method: 'POST',

                    data: this.data

                });

                if (result.success) {

                    // Si la solicitud es exitosa, asignamos las sucursales

                    this.response = (result.data?.trips || []).map((trip) => ({

                        ...trip,

                        vehicleName: trip.vehicleName || trip.plate || '',

                        sale_mode_label: this.getSaleModeLabel(trip),

                    }));

                    this.totalGeneral = Number(result.data?.totalGeneral || 0);

                } else {

                    // Si no hay datos, asignamos un array vacío

                    this.response = [];

                    this.totalGeneral = 0;

                }

            } catch (error) {

                this.loading = false;

                // Captura de errores no controlados

                this.showAlert('error', 'Ocurrió un error inesperado al procesar la solicitud.', 3000);

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

        exportToExcel() {

            // Primero, prepara una matriz que contendrá todas las filas de datos, incluidos los encabezados

            let rows = [];

            // Construye un objeto para los encabezados basado en la estructura de 'headers'

            let headerRow = {};

            this.headers.forEach(header => {

                headerRow[header.value] = header.title; // Usa 'key' para el mapeo y 'title' para el texto del encabezado

            });

            rows.push(headerRow);

            // Ahora, mapea los datos de los items para que coincidan con los encabezados

            this.response.forEach(item => {

                let rowData = {};

                this.headers.forEach(header => {

                    rowData[header.value] = item[header.value] || ''; // Asegura que cada celda se mapee correctamente; usa '' para datos faltantes

                });

                rows.push(rowData);

            });

            let nameReport = {

                // eslint-disable-next-line vue/no-use-computed-property-like-method

                name: 'Recaudación por Trabajador', // Título coherente con el reporte

                date: '',

                scheduled_departure: '',

                sale_mode_label: '',

                origin: '',

                destination: '',

                plate: '',

                asientosComprados: '',

                passenger: '',

                totalAmount: '',

            };

            rows.push(nameReport);

            rows.push({

                name: 'Total general',

                totalAmount: `$${this.formatNumber(Number(this.totalGeneral || 0))}`,

            });

            // Convierte la matriz de filas en una hoja de trabajo Excel

            const ws = XLSX.utils.json_to_sheet(rows, { skipHeader: true }); // 'skipHeader: true' porque ya agregamos manualmente los encabezados

            // Crea un nuevo libro de trabajo y añade la hoja de trabajo con los datos

            const wb = XLSX.utils.book_new();

            XLSX.utils.book_append_sheet(wb, ws, "Report" + this.date);

            // Escribe el libro de trabajo a un archivo y desencadena la descarga

            //XLSX.writeFile(wb, "report.xlsx");

            XLSX.writeFile(wb, `report_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`);

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

  justify-content: flex-start;

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

.worker-collection-toolbar {

  display: flex;

  align-items: center;

  gap: 12px;

  flex-wrap: wrap;

}

.worker-collection-filter {

  width: 240px;

  min-width: 240px;

}

.worker-collection-search {

  width: 300px;

  min-width: 260px;

}

.worker-collection-total {

  font-weight: 700;

}

.worker-collection-col-code {

  width: 11%;

  min-width: 0;

}

.worker-collection-col-route {

  width: 27%;

  min-width: 0;

}

.worker-collection-col-date {

  width: 8%;

  min-width: 0;

}

.worker-collection-col-departure {

  width: 11%;

  min-width: 0;

}

.worker-collection-col-sale-mode {

  display: flex;

  align-items: center;

  justify-content: center;

  width: 8%;

  min-width: 0;

}

.worker-collection-col-vehicle {

  width: 12%;

  min-width: 0;

}

.worker-collection-col-seats {

  width: 6%;

  min-width: 0;

}

.worker-collection-col-passengers {

  width: 7%;

  min-width: 0;

}

.worker-collection-col-amount {

  width: 10%;

  min-width: 0;

}

.worker-collection-sortable {

  display: flex;

  align-items: center;

  cursor: pointer;

  user-select: none;

}

.worker-collection-row {

  min-height: 62px;

}

.worker-collection-code-cell {

  flex-direction: row;

  align-items: center !important;

  justify-content: center;

  gap: 10px;

  text-align: left;

}

.worker-collection-code-value {

  display: block;

  max-width: 100%;

  font-size: 12px;

  font-weight: 700;

  color: #0f172a;

  letter-spacing: 0.02em;

  text-align: left;

}

.worker-collection-route-title-row {

  display: flex;

  align-items: center;

  gap: 8px;

  min-width: 0;

}

.worker-collection-route-title {

  font-size: 12px;

  font-weight: 700;

  color: #111827;

  white-space: nowrap;

  overflow: hidden;

  text-overflow: ellipsis;

}

.worker-collection-route-meta {

  display: flex;

  align-items: center;

  flex-wrap: nowrap;

  margin-top: 4px;

  font-size: 12px;

  color: #64748b;

  min-width: 0;

}

.worker-collection-amount {

  font-size: 14px;

  font-weight: 800;

  color: #15803d;

  white-space: nowrap;

  overflow: hidden;

  text-overflow: ellipsis;

}

.busgo-submeta {

  font-size: 12px;

  color: #64748b;

  margin-top: 2px;

}

.worker-collection-route-code-chip {

  max-width: 100%;

  font-size: 11px;

  font-weight: 600;

}

.worker-collection-sale-mode-chip {

  font-size: 10px;

  font-weight: 700;

  letter-spacing: 0;

  text-transform: uppercase;

}

.min-width-0 {

  min-width: 0;

}

@media (max-width: 960px) {

  .worker-collection-toolbar {

    flex-direction: column;

    align-items: stretch;

  }

  .worker-collection-filter,

  .worker-collection-search {

    width: 100%;

    min-width: 100%;

  }

  .worker-collection-col-route,

  .worker-collection-col-code,

  .worker-collection-col-date,

  .worker-collection-col-departure,

  .worker-collection-col-sale-mode,

  .worker-collection-col-vehicle,

  .worker-collection-col-seats,

  .worker-collection-col-passengers,

  .worker-collection-col-amount {

    width: 100%;

  }

  .worker-collection-route-meta {

    flex-wrap: wrap;

  }

}

</style>

<style scoped>
.worker-native-table {
  color: #1e293b;
  background: transparent;
}

.worker-native-table :deep(thead th) {
  height: 40px !important;
  color: #334155 !important;
  background: #f8fafc !important;
  border-bottom: 1px solid #e8edf5 !important;
  font-size: 11px !important;
  font-weight: 850 !important;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.worker-native-table :deep(tbody td) {
  height: 58px !important;
  color: #1e293b;
  border-bottom: 1px solid #eef2f6 !important;
  font-size: 13px;
  font-weight: 600;
}

.worker-native-table :deep(tbody tr:hover) {
  background: #f8faff !important;
}

.worker-native-table :deep(.v-data-table-footer) {
  min-height: 52px;
  padding: 6px 16px;
  color: #334155;
  font-size: 11.5px;
  font-weight: 700;
}

.worker-native-table :deep(.v-data-table__th--sortable) {
  cursor: pointer;
  user-select: none;
  transition: color 0.18s ease, background-color 0.18s ease;
}

.worker-native-table :deep(.v-data-table__th--sortable:hover) {
  color: #2454d6 !important;
  background: #f4f7ff !important;
}

.worker-native-table :deep(.v-data-table-header__content) {
  display: flex !important;
  align-items: center !important;
  gap: 5px !important;
}

.worker-native-table :deep(.v-data-table-header__sort-icon) {
  display: inline-flex !important;
  visibility: visible !important;
  flex: 0 0 auto;
  width: 15px !important;
  height: 15px !important;
  margin-left: 1px !important;
  color: #94a3b8 !important;
  font-size: 15px !important;
  opacity: 0.65 !important;
  transition: color 0.18s ease, opacity 0.18s ease, transform 0.18s ease;
}

.worker-native-table :deep(.v-data-table__th--sorted) {
  color: #2454d6 !important;
  background: #f5f7ff !important;
}

.worker-native-table :deep(.v-data-table__th--sorted .v-data-table-header__sort-icon) {
  color: #2454d6 !important;
  opacity: 1 !important;
}

.worker-code-cell,
.worker-vehicle-cell {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 9px;
}

.worker-table-avatar {
  display: grid;
  flex: 0 0 34px;
  width: 34px;
  height: 34px;
  overflow: hidden;
  color: #2454d6;
  background: #eef3ff;
  border: 1px solid #dce6ff;
  border-radius: 8px;
  place-items: center;
}

.worker-table-avatar :deep(.v-img__img) {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover;
}

.worker-code-value {
  overflow: hidden;
  color: #0f172a;
  font-size: 12.5px;
  font-weight: 850;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.worker-route-cell,
.worker-vehicle-copy {
  min-width: 0;
}

.worker-route-name,
.worker-vehicle-copy strong {
  display: block;
  overflow: hidden;
  color: #0f172a;
  font-size: 12.5px;
  font-weight: 850;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.worker-route-points {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 5px;
  margin-top: 3px;
  color: #526176;
  font-size: 10.5px;
  font-weight: 650;
}

.worker-route-points span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.worker-route-points .v-icon {
  flex: 0 0 auto;
  color: #64748b;
}

.worker-date-value {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #334155;
  font-size: 11.5px;
  font-weight: 700;
  white-space: nowrap;
}

.worker-date-value .v-icon {
  color: #2454d6;
}

.worker-mode-badge,
.worker-count-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 7px;
  border-radius: 7px;
  font-size: 11px;
  font-weight: 800;
  white-space: nowrap;
}

.worker-mode-badge--full {
  color: #17377f;
  background: #eef3ff;
}

.worker-mode-badge--express {
  color: #116b49;
  background: #eaf8f1;
}

.worker-vehicle-copy span {
  display: block;
  margin-top: 2px;
  overflow: hidden;
  color: #526176;
  font-size: 10.5px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.worker-count-badge--passengers {
  color: #4338ca;
  background: #eef0ff;
}

.worker-count-badge--tickets {
  color: #9a5b08;
  background: #fff7e8;
}

.worker-amount-value {
  color: #116b49;
  font-size: 12.5px;
  font-weight: 900;
  white-space: nowrap;
}

@media (max-width: 1180px) {
  .worker-native-table {
    overflow-x: auto;
  }

  .worker-native-table :deep(.v-table__wrapper) {
    min-width: 1260px;
  }
}
</style>

<style>
/* Los encabezados e indicadores nativos requieren alcance global. */
.worker-native-table thead {
  display: table-header-group !important;
  visibility: visible !important;
}

.worker-native-table thead tr {
  display: table-row !important;
  visibility: visible !important;
}

.worker-native-table thead th {
  display: table-cell !important;
  visibility: visible !important;
}

.worker-native-table .v-data-table__th--sortable .v-data-table-header__sort-icon {
  display: inline-flex !important;
  visibility: visible !important;
  width: 15px !important;
  height: 15px !important;
  color: #94a3b8 !important;
  opacity: 0.72 !important;
}

.worker-native-table .v-data-table__th--sortable:hover .v-data-table-header__sort-icon,
.worker-native-table .v-data-table__th--sorted .v-data-table-header__sort-icon {
  color: #2454d6 !important;
  opacity: 1 !important;
}
</style>

<style>
/* =========================================================
   BUSGO · REPORTE DE RECAUDACIÓN POR TRABAJADOR
   ========================================================= */
.worker-report-page-header {
  display: flex !important;
  align-items: center !important;
  gap: 12px !important;
  min-height: 72px !important;
  padding: 13px 24px !important;
  background: #ffffff !important;
  border-bottom: 1px solid #e7ecf3 !important;
  border-radius: 0 !important;
}

.worker-report-page-icon {
  display: grid !important;
  flex: 0 0 40px !important;
  width: 40px !important;
  height: 40px !important;
  color: #ffffff !important;
  background:
    radial-gradient(circle at 90% 5%, rgba(53, 184, 232, 0.55), transparent 28px),
    linear-gradient(135deg, #0e1f46, #2454d6) !important;
  border-radius: 11px !important;
  box-shadow: 0 6px 14px rgba(36, 84, 214, 0.2) !important;
  place-items: center !important;
}

.worker-report-page-header .busgo-page-title {
  color: #0f172a !important;
  font-size: 19px !important;
  font-weight: 850 !important;
  line-height: 1.2 !important;
}

.worker-report-page-header .busgo-page-subtitle {
  margin-top: 3px !important;
  color: #526176 !important;
  font-size: 12px !important;
  font-weight: 650 !important;
}

.worker-report-export-button {
  min-height: 40px !important;
  padding-inline: 16px !important;
  color: #ffffff !important;
  background: linear-gradient(100deg, #16875a, #20a56e) !important;
  border-radius: 9px !important;
  font-size: 12.5px !important;
  font-weight: 800 !important;
  letter-spacing: 0 !important;
  text-transform: none !important;
  box-shadow: 0 6px 14px rgba(22, 135, 90, 0.2) !important;
}

.worker-report-container {
  min-height: calc(100vh - 72px);
  padding: 18px 24px 30px !important;
  background: #f6f8fb !important;
}

.worker-report-shell {
  position: relative;
  overflow: hidden !important;
  background: #ffffff !important;
  border: 1px solid #e4eaf2 !important;
  border-radius: 14px !important;
  box-shadow: 0 6px 22px rgba(15, 23, 42, 0.045) !important;
}

.worker-report-loading-bar {
  position: absolute !important;
  top: 0;
  left: 0;
  z-index: 8;
}

.worker-report-summary-header {
  display: flex !important;
  min-height: 76px !important;
  align-items: center !important;
  justify-content: space-between !important;
  gap: 18px !important;
  padding: 17px 22px !important;
  border-bottom: 1px solid #edf1f5 !important;
}

.worker-report-summary-header .busgo-card-title {
  color: #0f172a !important;
  font-size: 16px !important;
  font-weight: 850 !important;
}

.worker-report-summary-header .busgo-card-subtitle {
  margin-top: 4px !important;
  color: #64748b !important;
  font-size: 11.5px !important;
  font-weight: 600 !important;
}

.worker-collection-total {
  min-height: 36px !important;
  padding-inline: 12px !important;
  color: #14734f !important;
  background: #eaf8f1 !important;
  border: 1px solid #d4eee1 !important;
  border-radius: 9px !important;
  font-size: 11.5px !important;
  font-weight: 850 !important;
}

.worker-collection-toolbar {
  gap: 10px !important;
  margin: 0 22px 16px;
  padding: 14px !important;
  background: #f8fafc;
  border: 1px solid #e7ecf3;
  border-radius: 11px;
}

.worker-toolbar-label {
  display: flex;
  flex: 1 0 100%;
  align-items: center;
  gap: 9px;
  padding-bottom: 2px;
  color: #2454d6;
}

.worker-toolbar-label strong,
.worker-toolbar-label span {
  display: block;
}

.worker-toolbar-label strong {
  color: #0f172a;
  font-size: 12.5px;
  font-weight: 850;
}

.worker-toolbar-label span {
  margin-top: 2px;
  color: #64748b;
  font-size: 10.5px;
  font-weight: 600;
}

.worker-collection-toolbar .v-field {
  min-height: 40px !important;
  color: #334155 !important;
  background: #ffffff !important;
  border-radius: 9px !important;
}

.worker-collection-toolbar .v-field__input,
.worker-collection-toolbar .v-label {
  color: #334155 !important;
  font-size: 12.5px !important;
  font-weight: 650 !important;
  opacity: 1 !important;
}

.worker-collection-filter {
  width: 230px !important;
  min-width: 230px !important;
}

.worker-report-selection {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 7px;
}

.worker-report-selection span {
  overflow: hidden;
  color: #1e293b;
  font-size: 12px;
  font-weight: 750;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.worker-report-query-button {
  min-width: 112px !important;
  min-height: 40px !important;
  color: #ffffff !important;
  border-radius: 9px !important;
  font-size: 12.5px !important;
  font-weight: 800 !important;
  letter-spacing: 0 !important;
  text-transform: none !important;
  box-shadow: 0 5px 12px rgba(36, 84, 214, 0.18) !important;
}

.worker-collection-search {
  width: 285px !important;
  min-width: 240px !important;
}

/* Menús teletransportados de los autocompletes. */
.worker-report-select-menu {
  overflow: hidden !important;
  padding: 5px !important;
  background: #ffffff !important;
  border: 1px solid #dfe6ef !important;
  border-radius: 11px !important;
  box-shadow: 0 14px 36px rgba(15, 23, 42, 0.16) !important;
}

.worker-report-select-menu .v-list {
  padding: 0 !important;
  background: transparent !important;
}

.worker-report-select-item {
  min-height: 54px !important;
  margin: 2px 0 !important;
  padding: 6px 9px !important;
  color: #334155 !important;
  border-radius: 8px !important;
}

.worker-report-select-item:hover {
  background: #f5f8ff !important;
}

.worker-report-select-item.v-list-item--active {
  color: #2454d6 !important;
  background: #eef3ff !important;
}

.worker-report-select-item .v-list-item-title {
  color: #172033 !important;
  font-size: 12.5px !important;
  font-weight: 800 !important;
}

.worker-report-select-item .v-list-item-subtitle {
  margin-top: 3px !important;
  color: #64748b !important;
  font-size: 10.5px !important;
  font-weight: 650 !important;
  opacity: 1 !important;
}

.worker-report-select-item .v-list-item__append {
  color: #94a3b8;
}

.worker-report-select-item.v-list-item--active .v-list-item__append {
  color: #2454d6;
}

.worker-report-option-avatar {
  color: #2454d6 !important;
  background: #eef3ff !important;
  border: 1px solid #dbe5ff !important;
}

.worker-kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  padding: 0 22px 16px;
}

.worker-kpi-card {
  position: relative;
  display: flex !important;
  min-height: 88px;
  align-items: center;
  gap: 12px;
  padding: 15px !important;
  overflow: hidden;
  background: #ffffff !important;
  border: 1px solid #e5eaf1 !important;
  border-radius: 11px !important;
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.035) !important;
}

.worker-kpi-card::before {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 3px;
  content: "";
  background: #2454d6;
}

.worker-kpi-card--trips::before { background: #2454d6; }
.worker-kpi-card--passengers::before { background: #4f46e5; }
.worker-kpi-card--tickets::before { background: #d97706; }
.worker-kpi-card--revenue::before { background: #16875a; }

.worker-kpi-icon {
  display: grid;
  flex: 0 0 40px;
  width: 40px;
  height: 40px;
  color: #2454d6;
  background: #eef3ff;
  border-radius: 10px;
  place-items: center;
}

.worker-kpi-card--passengers .worker-kpi-icon {
  color: #4f46e5;
  background: #eef0ff;
}

.worker-kpi-card--tickets .worker-kpi-icon {
  color: #d97706;
  background: #fff7e8;
}

.worker-kpi-card--revenue .worker-kpi-icon {
  color: #16875a;
  background: #eaf8f1;
}

.worker-kpi-card span,
.worker-kpi-card strong {
  display: block;
}

.worker-kpi-card span {
  color: #526176;
  font-size: 11px;
  font-weight: 700;
}

.worker-kpi-card strong {
  margin-top: 4px;
  color: #0f172a;
  font-size: 20px;
  font-weight: 900;
  letter-spacing: -0.02em;
}

.worker-table-panel {
  margin: 0 22px 22px;
  overflow: hidden;
  background: #ffffff;
  border: 1px solid #e8edf5;
  border-radius: 13px;
  box-shadow: 0 5px 18px rgba(15, 23, 42, 0.04);
}

.worker-table-heading {
  display: flex;
  min-height: 69px;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 12px 17px;
  background: #ffffff;
}

.worker-table-title {
  color: #0f172a;
  font-size: 15px;
  font-weight: 850;
  line-height: 1.25;
}

.worker-table-subtitle {
  margin-top: 3px;
  color: #64748b;
  font-size: 11px;
  font-weight: 650;
  line-height: 1.35;
}

.worker-table-search {
  flex: 0 1 285px;
  width: 285px;
  max-width: 285px;
}

.worker-table-search :deep(.v-field) {
  min-height: 40px;
  color: #334155;
  background: #ffffff;
  border-radius: 9px;
  font-size: 12px;
}

.worker-table-search :deep(.v-field__outline) {
  color: #dce3ed;
  opacity: 1;
}

.worker-table-search :deep(.v-field__input) {
  min-height: 40px;
  padding-top: 0;
  padding-bottom: 0;
  color: #1e293b;
  font-size: 12px;
  font-weight: 600;
}

.worker-table-search :deep(.v-field__input::placeholder) {
  color: #94a3b8;
  opacity: 1;
}

.worker-table-search :deep(.v-icon) {
  color: #64748b;
  opacity: 1;
}

.worker-table-search :deep(.v-field--focused .v-field__outline) {
  color: #2454d6;
}


.busgo-snackbar {
  border-radius: 11px;
}

@media (max-width: 1280px) {
  .worker-kpi-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .worker-collection-toolbar .v-spacer {
    display: none;
  }
}

@media (max-width: 960px) {
  .worker-report-container {
    padding: 14px !important;
  }

  .worker-collection-toolbar {
    margin-inline: 14px;
  }

  .worker-collection-filter,
  .worker-collection-search,
  .worker-report-query-button {
    width: 100% !important;
    min-width: 100% !important;
  }

  .worker-kpi-grid {
    padding-inline: 14px;
  }

  .worker-table-panel {
    margin-inline: 14px;
  }

  .worker-table-heading {
    align-items: stretch;
    flex-direction: column;
  }

  .worker-table-search {
    flex-basis: auto;
    width: 100%;
    max-width: none;
  }

}

@media (max-width: 600px) {
  .worker-report-page-header {
    align-items: flex-start !important;
    flex-wrap: wrap !important;
    padding: 13px 14px !important;
  }

  .worker-report-export-button {
    width: 100%;
  }

  .worker-report-summary-header {
    align-items: flex-start !important;
    flex-direction: column !important;
  }

  .worker-collection-total {
    width: 100%;
    justify-content: center;
  }

  .worker-kpi-grid {
    grid-template-columns: 1fr;
  }
}
</style>
