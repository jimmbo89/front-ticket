<template>
    <v-snackbar class="mt-12" location="right top" :timeout="sb_timeout" :color="sb_type" elevation="24"
        :multi-line="true" vertical v-model="snackbar">
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
      <v-card class="d-flex align-center pa-3" elevation="0" style="background-color: #f9f9f9">
    <!-- Icono -->
    <v-avatar :color="paleteColors.primary" class="icono-concavo">
      <v-icon cover>mdi-bus-marker</v-icon>
    </v-avatar>

    <!-- Texto -->
    <div class="ml-4">
      <div class="text-h6 font-weight-medium">Recaudación por Trabajador</div>
      <div class="text-body-2 text-grey">Gestionar recaudación por trabajador</div>
    </div>

    <!-- Botones -->
    <v-spacer></v-spacer>

    <v-btn class="text-subtitle-1 ml-12" :color="paleteColors.green" variant="tonal" elevation="2"
      prepend-icon="mdi-file-excel-box" @click="exportToExcel()">
      Exportar a Excel
    </v-btn>
  </v-card>
  <v-container style="min-width: 100%;">
   <v-card flat>
  <!-- Barra superior: selección de sucursal + botón buscar + búsqueda global -->
  <v-card-title class="d-flex flex-wrap align-center gap-4 pb-2">
    <!-- Título -->
    <div class="text-subtitle-1 font-weight-bold">Listado de recaudación por trabajador</div>

    <!-- Spacer (solo visible en md+) -->
    <v-spacer class="d-none d-md-block"></v-spacer>

    <!-- Grupo: Autocomplete + Botón buscar -->
   <div class="d-flex align-center gap-2 flex-grow-1" style="max-width: 100%">
          <!-- Autocomplete de sucursales (mismo estilo que el original) -->

          <ReportDateRangeFilter
            v-model:start-date="date"
            v-model:end-date="endDate"
          />

          <v-autocomplete :no-data-text="'No hay datos disponibles'" v-model="branch_id" v-if="this.mostrarFila"
            :items="branches" label="Seleccione una Sucursal" prepend-inner-icon="mdi-store" item-title="name"
            item-value="id" variant="solo-filled" hide-details single-line flat :rules="selectRules" density="compact" class="ml-1 mr-1">
            <template v-slot:item="{ props, item }">
              <v-list-item v-bind="props" :prepend-avatar="this.getImageUrl(item.raw.image)">
              </v-list-item>
            </template>
          </v-autocomplete>
                <v-autocomplete :no-data-text="'No hay datos disponibles'" v-model="this.selectedWorker" v-if="this.mostrarFila"
                  :items="workers" label="Trabajadores" prepend-inner-icon="mdi-account" item-title="name" item-value="id"
                  variant="solo-filled" hide-details single-line flat density="compact" :rules="selectRules">
                  <template v-slot:item="{ props, item }">
                    <v-list-item v-bind="props"
                      :prepend-avatar="getImageUrl(item.raw.image)"
                      :title="item.raw.name">
                      <v-list-item-subtitle class="d-flex flex-column">
                        <div>Rol: {{ item.raw.role.name }}</div>
                      </v-list-item-subtitle>
                    </v-list-item>
                  </template>
                </v-autocomplete>
          <!-- Botón de búsqueda (actualizar datos) -->
          <v-btn icon @click="initialize" :color="paleteColors.primary" density="comfortable" class="mt-2 mt-md-0 mr-5 ml-1">
            <v-icon>mdi-magnify</v-icon>
          </v-btn>
        </div>

    <!-- Campo de búsqueda global -->
    <div class="flex-grow-1" style="max-width: 300px">
      <v-text-field v-model="search" density="compact" label="Buscar viaje" prepend-inner-icon="mdi-magnify"
        variant="solo-filled" hide-details single-line flat></v-text-field>
    </div>

    <v-chip
      class="ml-2"
      color="green-darken-2"
      variant="tonal"
      label
      size="large"
    >
      Total general: ${{ formatNumber(Number(totalGeneral || 0)) }}
    </v-chip>
  </v-card-title>

  <!-- Tabla de viajes con filas personalizadas -->
  <v-data-table :headers="headers" :items="sortedResponse" :search="search" :items-per-page-text="'Elementos por página'"
    no-data-text="No hay datos disponibles" :loading="loading" loading-text="Cargando datos..." :hide-default-header="true"
        class="elevation-1" style="max-height: 68vh; overflow-y: auto; background: transparent">
        <template v-slot:top>
  <!-- Tarjeta de encabezado con alto fijo -->
  <v-card
    flat
    color="blue-grey-lighten-5"
    class="mb-2 mx-1 rounded-lg"
    elevation="1"
    style="border: 1px solid #ECEFF1; height: 40px; min-height: 40px; display: flex; align-items: center"
  >
    <v-card-text
      class="d-flex pa-2"
      style="width: 100%; min-width: 0; height: 100%; padding: 0 16px !important; display: flex; align-items: center"
    >
              <!-- Ruta -->
              <div
                style="width: 44%; min-width: 0; cursor: pointer"
                class="text-left font-weight-bold d-flex align-center"
                @click="toggleSort('name')"
              >
                Ruta
                <v-icon size="16" class="ml-1">
                  {{
                    sortBy === 'name'
                      ? sortOrder === 'asc'
                        ? 'mdi-arrow-up'
                        : 'mdi-arrow-down'
                      : 'mdi-swap-vertical'
                  }}
                </v-icon>
              </div>

              <!-- Fecha -->
              <div
                style="width: 10%; min-width: 0; cursor: pointer"
                class="text-left font-weight-bold d-flex align-center"
                @click="toggleSort('date')"
              >
                Fecha
                <v-icon size="16" class="ml-1">
                  {{
                    sortBy === 'date'
                      ? sortOrder === 'asc'
                        ? 'mdi-arrow-up'
                        : 'mdi-arrow-down'
                      : 'mdi-swap-vertical'
                  }}
                </v-icon>
              </div>

              <div style="width: 13%; min-width: 0" class="text-left font-weight-bold">
                Vehículo
              </div>

              <div style="width: 6%; min-width: 0" class="text-left font-weight-bold">
                Salida
              </div>

             <div style="width: 6%; min-width: 0" class="text-left font-weight-bold">
                Llegada
              </div>

              <div style="width: 6%; min-width: 0" class="text-left font-weight-bold">
                Pasajeros
              </div>

              <div style="width: 11%; min-width: 0" class="text-left font-weight-bold">
                Monto
              </div>
            </v-card-text>
          </v-card>
        </template>
    <!-- Fila personalizada -->
    <template v-slot:item="slotProps">
      <tr>
        <td colspan="100%" style="padding: 0; border: none">
          <v-card class="mb-2 mx-1 rounded-lg" elevation="1" density="comfortable" flat>
            <v-card-text class="d-flex align-center pa-2" style="width: 100%; min-width: 0">
              <!-- Ruta -->
              <div style="width: 44%; min-width: 0" class="text-truncate">
                <div class="font-weight-medium text-truncate">{{ slotProps.item.name }}</div>
                <div class="d-flex align-center flex-wrap text-caption text-grey text-truncate mt-1">
                  <v-icon size="14" class="mr-1">mdi-map-marker</v-icon>
                  <span class="text-truncate">Origen: {{ slotProps.item.origin }}</span>
                  <v-icon size="14" class="mx-2">mdi-ray-start-arrow</v-icon>
                  <span class="text-truncate">Destino: {{ slotProps.item.destination }}</span>
                </div>
                <v-tooltip activator="parent" location="bottom" max-width="350px">
                  <span style="white-space: normal; word-break: break-word">
                    Ruta: {{ slotProps.item.name }}<br />
                    Origen: {{ slotProps.item.origin }}<br />
                    Destino: {{ slotProps.item.destination }}
                  </span>
                </v-tooltip>
              </div>

              <!-- Fecha -->
              <div style="width: 10%; min-width: 0" class="text-truncate text-left">
                <span>{{ slotProps.item.date }}</span>
                <v-tooltip activator="parent" location="bottom" max-width="350px">
                  <span style="white-space: normal; word-break: break-word">
                    Fecha: {{ slotProps.item.date }}
                  </span>
                </v-tooltip>
              </div>

              <!-- Vehículo con avatar -->
              <div class="d-flex align-center" style="width: 13%; min-width: 0">
                <v-avatar class="mr-3 icono-concavo" color="grey-lighten-4">
                  <v-img :src="`${this.$axios.defaults.baseURL}images/${slotProps.item.vehicleImage}?t=${getCacheTimestamp()}`" class="icono-concavo" cover></v-img>
                </v-avatar>
                <div class="text-truncate">
                  <div class="font-weight-medium text-truncate">
                    {{ slotProps.item.plate || slotProps.item.vehicleName }}
                  </div>
                  <div
                    v-if="slotProps.item.vehicleName && slotProps.item.vehicleName !== slotProps.item.plate"
                    class="text-caption text-grey text-truncate"
                  >
                    {{ slotProps.item.vehicleName }}
                  </div>
                </div>
                <v-tooltip activator="parent" location="bottom" max-width="350px">
                  <span style="white-space: normal; word-break: break-word">
                    Vehículo: {{ slotProps.item.vehicleName }}
                  </span>
                </v-tooltip>
              </div>

              <!-- Salida -->
              <div style="width: 6%; min-width: 0" class="text-truncate text-left">
                <span>{{ slotProps.item.start }}</span>
                <v-tooltip activator="parent" location="bottom" max-width="350px">
                  <span style="white-space: normal; word-break: break-word">
                    Salida: {{ slotProps.item.start }}
                  </span>
                </v-tooltip>
              </div>

              <!-- Llegada -->
              <div style="width: 6%; min-width: 0" class="text-truncate text-left">
                <span>{{ slotProps.item.end }}</span>
                <v-tooltip activator="parent" location="bottom" max-width="350px">
                  <span style="white-space: normal; word-break: break-word">
                    Llegada: {{ slotProps.item.end }}
                  </span>
                </v-tooltip>
              </div>

              <div style="width: 6%; min-width: 0" class="text-truncate text-left">
                <span>{{ slotProps.item.passenger }}</span>
                <v-tooltip activator="parent" location="bottom" max-width="350px">
                  <span style="white-space: normal; word-break: break-word">
                    Pasajeros: {{ slotProps.item.passenger }}
                  </span>
                </v-tooltip>
              </div>

              <div style="width: 11%; min-width: 0" class="text-truncate text-left">
                <span class="font-weight-medium">${{ formatNumber(Number(slotProps.item.totalAmount || 0)) }}</span>
                <v-tooltip activator="parent" location="bottom" max-width="350px">
                  <span style="white-space: normal; word-break: break-word">
                    Monto generado: ${{ formatNumber(Number(slotProps.item.totalAmount || 0)) }}
                  </span>
                </v-tooltip>
              </div>
            </v-card-text>
          </v-card>
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
                this.data.worker_id = this.selectedWorker;
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
                    endpoint: 'trips-worker-date',
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
</style>


