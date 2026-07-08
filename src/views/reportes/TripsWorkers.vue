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
      <v-icon>mdi-account-cash-outline</v-icon>
    </v-avatar>

    <div>
      <div class="busgo-page-title">Recaudación por Trabajador</div>
      <div class="busgo-page-subtitle">
        Gestionar recaudación por trabajador
      </div>
    </div>

    <v-spacer />

    <v-btn
      :color="paleteColors.green"
      variant="flat"
      elevation="0"
      prepend-icon="mdi-file-excel-box"
      class="busgo-add-btn"
      @click="exportToExcel()"
    >
      Exportar a Excel
    </v-btn>
  </v-card>

  <v-container fluid class="busgo-container">
    <v-card class="busgo-card" elevation="0">
      <div class="busgo-card-header">
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
          Total general: ${{ formatNumber(Number(totalGeneral || 0)) }}
        </v-chip>
      </div>

      <div class="worker-collection-toolbar px-6 pb-4">
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
          :rules="selectRules"
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
          :rules="selectRules"
        >
          <template #item="{ props, item }">
            <v-list-item
              v-bind="props"
              :prepend-avatar="getImageUrl(item.raw.image)"
              :title="item.raw.name"
            >
              <v-list-item-subtitle class="d-flex flex-column">
                <div>Rol: {{ item.raw.role.name }}</div>
              </v-list-item-subtitle>
            </v-list-item>
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

        <v-spacer />

        <v-text-field
          v-model="search"
          density="compact"
          placeholder="Buscar viaje..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          hide-details
          single-line
          class="worker-collection-search"
        />
      </div>

      <v-data-table
        :headers="headers"
        :items="sortedResponse"
        :search="search"
        :items-per-page-text="'Elementos por página'"
        no-data-text="No hay datos disponibles"
        :loading="loading"
        loading-text="Cargando datos..."
        :hide-default-header="true"
        class="busgo-table"
      >
        <template #top>
          <div class="busgo-table-head">
            <div
              class="worker-collection-col-route worker-collection-sortable"
              @click="toggleSort('name')"
            >
              Ruta

              <v-icon size="16" class="ml-1">
                {{
                  sortBy === "name"
                    ? sortOrder === "asc"
                      ? "mdi-arrow-up"
                      : "mdi-arrow-down"
                    : "mdi-swap-vertical"
                }}
              </v-icon>
            </div>

            <div
              class="worker-collection-col-date worker-collection-sortable"
              @click="toggleSort('date')"
            >
              Fecha

              <v-icon size="16" class="ml-1">
                {{
                  sortBy === "date"
                    ? sortOrder === "asc"
                      ? "mdi-arrow-up"
                      : "mdi-arrow-down"
                    : "mdi-swap-vertical"
                }}
              </v-icon>
            </div>

            <div class="worker-collection-col-vehicle">
              Vehículo
            </div>

            <div class="worker-collection-col-start">
              Salida
            </div>

            <div class="worker-collection-col-end">
              Llegada
            </div>

            <div class="worker-collection-col-passengers">
              Pasajeros
            </div>

            <div class="worker-collection-col-amount">
              Monto
            </div>
          </div>
        </template>

        <template #item="slotProps">
          <tr>
            <td class="pa-0 border-0">
              <div class="busgo-row worker-collection-row">
                <div class="worker-collection-col-route">
                  <div class="worker-collection-route-title">
                    {{ slotProps.item.name }}
                  </div>

                  <div class="worker-collection-route-meta">
                    <v-icon size="14" class="mr-1">
                      mdi-map-marker
                    </v-icon>

                    <span class="text-truncate">
                      Origen: {{ slotProps.item.origin }}
                    </span>

                    <v-icon size="14" class="mx-2">
                      mdi-ray-start-arrow
                    </v-icon>

                    <span class="text-truncate">
                      Destino: {{ slotProps.item.destination }}
                    </span>
                  </div>
                </div>

                <div class="worker-collection-col-date busgo-meta">
                  <v-icon size="16" color="primary">
                    mdi-calendar
                  </v-icon>

                  <span class="text-truncate">
                    {{ slotProps.item.date }}
                  </span>
                </div>

                <div class="worker-collection-col-vehicle busgo-name-cell">
                  <v-avatar
                    size="36"
                    rounded="lg"
                    color="grey-lighten-4"
                    class="busgo-avatar"
                  >
                    <v-img
                      :src="`${this.$axios.defaults.baseURL}images/${slotProps.item.vehicleImage}?t=${getCacheTimestamp()}`"
                      cover
                    />
                  </v-avatar>

                  <div class="min-width-0">
                    <div class="busgo-name">
                      {{ slotProps.item.plate || slotProps.item.vehicleName }}
                    </div>

                    <div
                      v-if="
                        slotProps.item.vehicleName &&
                        slotProps.item.vehicleName !== slotProps.item.plate
                      "
                      class="busgo-submeta text-truncate"
                    >
                      {{ slotProps.item.vehicleName }}
                    </div>
                  </div>
                </div>

                <div class="worker-collection-col-start busgo-meta">
                  <v-icon size="16" color="primary">
                    mdi-clock-start
                  </v-icon>

                  <span class="text-truncate">
                    {{ slotProps.item.start }}
                  </span>
                </div>

                <div class="worker-collection-col-end busgo-meta">
                  <v-icon size="16" color="primary">
                    mdi-clock-end
                  </v-icon>

                  <span class="text-truncate">
                    {{ slotProps.item.end }}
                  </span>
                </div>

                <div class="worker-collection-col-passengers busgo-meta">
                  <v-icon size="16" color="primary">
                    mdi-account-multiple
                  </v-icon>

                  <span class="text-truncate">
                    {{ slotProps.item.passenger }}
                  </span>
                </div>

                <div class="worker-collection-col-amount worker-collection-amount">
                  ${{ formatNumber(Number(slotProps.item.totalAmount || 0)) }}
                </div>
              </div>
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script>
import LocalStorageService from "@/LocalStorageService";
import { handleRequest } from "@/utils/api"; // Ruta al archivo
import { paleteColors } from "@/assets/colors";
import { format } from 'date-fns';
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
        headers: [
            { title: 'Ruta', value: 'name', },
            { title: 'Fecha', value: 'date', },
            { title: 'Origen', value: 'origin', },
            { title: 'Destino', value: 'destination', },
            { title: 'Vehículo', value: 'vehicleName', },
            { title: 'Salida', value: 'start', },
            { title: 'LLegada', value: 'end', },
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
      sortedResponse() {
        const items = Array.isArray(this.response) ? [...this.response] : [];
        const key = this.sortBy;
        const direction = this.sortOrder === 'asc' ? 1 : -1;

        return items.sort((a, b) => {
          const aValue = a?.[key];
          const bValue = b?.[key];

          if (key === 'date') {
            return direction * this.compareDates(aValue, bValue);
          }

          return direction * String(aValue ?? '').localeCompare(String(bValue ?? ''), 'es', {
            sensitivity: 'base',
          });
        });
      },
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
      getImageUrl(imagePath) {
      return `${this.$axios.defaults.baseURL}images/${imagePath}?t=${this.getCacheTimestamp()}`;
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
                this.data = {};
                this.data.branch_id = this.branch_id;
                const selectedWorker = this.workers.find((worker) => worker.id === this.selectedWorker);
                this.data.user_id = selectedWorker?.user_id ?? this.user_id ?? this.worker_id;
                // Formatear las fechas
               /* const formattedDate = this.date ? format(new Date(this.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');
                const formattedEndDate = this.endDate ? format(new Date(this.endDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');*/
                const formattedDate =
                this.date ?? new Date().toISOString().split("T")[0];
              const formattedEndDate =
                this.endDate ?? new Date().toISOString().split("T")[0];
                // Comparar las fechas
                if (formattedDate === formattedEndDate) {
                    this.data.date = formattedDate; // Solo enviar una fecha si son iguales
                } else {
                    this.data.date = formattedDate;
                    this.data.endDate = formattedEndDate;
                }
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
                origin: '',
                destination: '',
                plate: '',
                start: '',
                end: '',
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

.worker-collection-col-route {
  width: 44%;
  min-width: 0;
}

.worker-collection-col-date {
  width: 10%;
  min-width: 0;
}

.worker-collection-col-vehicle {
  width: 13%;
  min-width: 0;
}

.worker-collection-col-start {
  width: 6%;
  min-width: 0;
}

.worker-collection-col-end {
  width: 6%;
  min-width: 0;
}

.worker-collection-col-passengers {
  width: 8%;
  min-width: 0;
}

.worker-collection-col-amount {
  width: 13%;
  min-width: 0;
}

.worker-collection-sortable {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.worker-collection-row {
  min-height: 66px;
}

.worker-collection-route-title {
  font-size: 14px;
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
  .worker-collection-col-date,
  .worker-collection-col-vehicle,
  .worker-collection-col-start,
  .worker-collection-col-end,
  .worker-collection-col-passengers,
  .worker-collection-col-amount {
    width: 100%;
  }

  .worker-collection-route-meta {
    flex-wrap: wrap;
  }
}
</style>


