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
  <v-container style="min-width: 100%; min-height: 100%; background-color: #F5F5F5;">
    <v-row v-if="showWelcomeMessage" align="stretch">
      <v-col cols="12" class="text-center">
        <v-card class="elevation-4 pa-6">
          <v-icon color="primary" size="64">mdi-hand-wave</v-icon>
          <v-card-title class="text-h4 font-weight-bold">
            Bienvenido a la Administración de BusGo
          </v-card-title>
        </v-card>
      </v-col>
    </v-row>
    <v-row v-else align="stretch">
      <!-- Información general de viajes -->
      <v-col cols="12" md="6">
        <v-row align="stretch">
          <v-col cols="12" sm="6" md="6" v-for="(stat, index) in sales" :key="index">
            <v-card class="mx-1 ma-sm-1" :style="{ borderRadius: '8px', border: 'none' }" @click="$router.push(stat.to)">
              <template v-slot:title>
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                  <span>{{ stat.title }}</span>
                  <v-avatar size="48">
                    <v-icon :color="stat.color" size="28">{{ stat.icon }}</v-icon>
                  </v-avatar>
                </div>
              </template>
              <v-card-text>
                <v-col cols="12">
                  <v-row no-gutters>
                    <v-col cols="12" class="text-left">
                      <span v-if="stat.title !== 'Boletos Vendidos' && stat.title !== 'Incidentes'"
                        class="text-h4 font-weight-black">
                        {{ this.formatNumber(stat.value) }}
                      </span>
                      <span v-else class="text-h4 font-weight-black">
                        {{ stat.value }}
                      </span>
                    </v-col>
                    <v-col cols="12" class="text-left">
                      <span class="font-weight-black">Ver más</span>
                    </v-col>
                  </v-row>
                </v-col>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-col>

      <!-- Gráfica -->
      <v-col cols="12" md="6">
        <v-card class="mx-1 ma-sm-1" align="center">
          <template v-slot:title>
            <div class="d-flex align-center">
              <v-icon color="#1976D2" class="mr-2">mdi-information</v-icon>
              <span>Información</span>
            </div>
          </template>
          <Bar :dataArray="earlyYear" />
          <v-card-text class="py-1"></v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Tabla de viajes -->
    <v-row align="stretch" v-if="!showWelcomeMessage">
        <!--<v-card class="elevation-4 mx-1 ma-sm-1">
          <v-container fluid>
            <v-toolbar color="white">
              <v-row align="center">
                <v-col cols="12" md="8" class="grow">
                  <span class="text-subtitle-1"><strong>Viajes</strong></span>
                </v-col>
              </v-row>
            </v-toolbar>
            <v-divider />
            <v-text-field class="mt-1 mb-1" v-model="search" append-icon="mdi-magnify" label="Buscar" single-line
              hide-details>
            </v-text-field>
            <v-data-table :headers="headers" :items="trips" :search="search" fixed-header class="elevation-1"
              :items-per-page="5" no-data-text="No hay datos disponibles" :loading="loading"
              loading-text="Cargando datos...">
              <template v-slot:item.vehiclePlate="{ item }">
                <v-avatar class="mr-1" elevation="3" color="grey-lighten-4" size="small">
                  <v-img :src="`${this.$axios.defaults.baseURL}images/${item.vehicleImage}?t=${Date.now()}`"
                    alt="image"></v-img>
                </v-avatar>
                {{ item.vehiclePlate }}
              </template>
              <template v-slot:item.dineroGenerado="{ item }">
                <span style="font-weight: bold;">{{ this.formatNumber(item.dineroGenerado) }}</span>
              </template>
              <template v-slot:item.horario="{ item }">
                <v-tooltip location="top">
                  <template v-slot:activator="{ props }">
                    <div v-bind="props" class="d-flex flex-column time-cell">
                      <div class="d-flex flex-column time-cell">
                        <v-icon small color="primary" class="mr-1">mdi-clock-outline</v-icon>
                        <span class="font-weight-medium">
                          {{ formatTimeRange(item.horario) }}
                        </span>
                      </div>
                      <span class="text-caption text-grey">
                        {{ item.estimated }} minutos
                      </span>
                    </div>
                  </template>
                  <span>Horario completo:<br>{{ item.horario }}</span>
                </v-tooltip>
              </template>
              <--noooo<template v-slot:item.horario="{ item }">
      <div class="d-flex flex-column time-cell">
        <div class="d-flex align-center">
          <v-icon small color="primary" class="mr-1">mdi-clock-outline</v-icon>
          <span class="font-weight-medium">
            {{ formatTimeRange(item.horario) }}
          </span>
        </div>
        <span v-if="showDuration(item)" class="text-caption text-grey">
          {{ calculateDuration(item.horario) }}
        </span>
      </div>
    </template>--noooo
            </v-data-table>
          </v-container>
        </v-card>-->
        <v-container style="min-width: 100%;">
   <v-card flat elevation="1">
  <!-- Barra superior: selección de sucursal + botón buscar + búsqueda global -->
  <v-card-title class="d-flex flex-wrap align-center gap-4 pb-2">
    <!-- Título -->
    <div class="text-subtitle-1 font-weight-bold">Viajes</div>

    <!-- Spacer (solo visible en md+) -->
    <v-spacer class="d-none d-md-block"></v-spacer>

    <!-- Campo de búsqueda global -->
    <div class="flex-grow-1" style="max-width: 300px">
      <v-text-field v-model="search" density="compact" label="Buscar viaje" prepend-inner-icon="mdi-magnify"
        variant="solo-filled" hide-details single-line flat></v-text-field>
    </div>
  </v-card-title>

  <!-- Separador -->
  <v-divider class="my-2"></v-divider>

  <!-- Tabla de viajes con filas personalizadas -->
  <v-data-table :headers="headers" :items="trips" :search="search" :items-per-page-text="'Elementos por página'"
    no-data-text="No hay datos disponibles" :loading="loading" loading-text="Cargando datos..." :hide-default-header="true"
        class="elevation-1" style="max-height: 68vh; overflow-y: auto; background: transparent" :items-per-page="5">
        <template v-slot:top>
  <!-- Tarjeta de encabezado con alto fijo -->
  <v-card
    flat
    color="blue-grey-lighten-5"
    class="mb-2 mx-1 rounded-lg"
    elevation="1"
    style="border: 1px solid #ECEFF1; height: 40px; display: flex; align-items: center"
  >
    <v-card-text
      class="d-flex pa-2"
      style="width: 100%; min-width: 0; height: 100%; padding: 0 16px !important; display: flex; align-items: center"
    >
              <!-- Negocio (20%) -->
              <div style="width: 10%; min-width: 0" class="text-left font-weight-bold">
                Vehiculo
              </div>

              <!-- Nombre (20%) -->
              <div style="width: 7%; min-width: 0" class="text-left font-weight-bold">
                Marca
              </div>

              <!-- Teléfono (10%) -->
              <div style="width: 30%; min-width: 0" class="text-left font-weight-bold">
                Recorrido
              </div>

              <!-- Dirección (25%) -->
              <div style="width: 10%; min-width: 0" class="text-left font-weight-bold">
                Fecha
              </div>

              <div style="width: 10%; min-width: 0" class="text-left font-weight-bold">
                Horario
              </div>

              <div style="width: 8%; min-width: 0" class="text-left font-weight-bold">
                Capacidad
              </div>

              <div style="width: 10%; min-width: 0" class="text-left font-weight-bold">
                Asientos Vendidos
              </div>

              <div style="width: 10%; min-width: 0" class="text-left font-weight-bold">
                Dinero Generado
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
             <!-- Vehículo con avatar -->
              <div class="d-flex align-center" style="width: 10%; min-width: 0">
                <v-avatar class="mr-3 icono-concavo" color="grey-lighten-4">
                  <v-img :src="`${this.$axios.defaults.baseURL}images/${slotProps.item.vehicleImage}?t=${getCacheTimestamp()}`" class="icono-concavo" cover></v-img>
                </v-avatar>
                <span class="text-truncate">{{ slotProps.item.vehiclePlate }}</span>
                <v-tooltip activator="parent" location="bottom" max-width="350px">
                  <span style="white-space: normal; word-break: break-word">
                    Vehículo: {{ slotProps.item.vehiclePlate }}
                  </span>
                </v-tooltip>
              </div>

              <div style="width: 7%; min-width: 0" class="text-truncate text-left">
                <span>{{ slotProps.item.vehicleBrand }}</span>
                <v-tooltip activator="parent" location="bottom" max-width="350px">
                  <span style="white-space: normal; word-break: break-word">
                    Marca: {{ slotProps.item.vehicleBrand }}
                  </span>
                </v-tooltip>
              </div>

              <div style="width: 30%; min-width: 0" class="text-truncate text-left">
                <span>{{ slotProps.item.route }}</span>
                <v-tooltip activator="parent" location="bottom" max-width="350px">
                  <span style="white-space: normal; word-break: break-word">
                    Recorrido: {{ slotProps.item.route }}
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

              <!-- Horario -->
              <div style="width: 10%; min-width: 0" class="text-truncate">
                <v-tooltip location="top">
                  <!-- Activator -->
                  <template v-slot:activator="{ props }">
                    <div
                      v-bind="props"
                      class="d-flex flex-column"
                      style="cursor: default; padding: 4px 0;"
                    >
                      <!-- Fila superior: ícono + minutos alineados horizontalmente -->
                      <div class="d-flex align-left gap-1">
                        <v-icon size="small" color="primary" class="mr-1">mdi-clock-outline</v-icon>
                        <span class="text-grey">
                          {{ slotProps.item.estimated }} minutos
                        </span>
                      </div>

                      <!-- Horario debajo del ícono (alineado con el ícono, no con los minutos) -->
                      <span class="ml-1 mt-1">
                        {{ formatTimeRange(slotProps.item.horario) }}
                      </span>
                    </div>
                  </template>

                  <!-- Tooltip -->
                  <span>
                    <strong>Horario completo:</strong><br>{{ slotProps.item.horario }}
                  </span>
                </v-tooltip>
              </div>
              <!-- Capacidad -->
              <div style="width: 8%; min-width: 0" class="text-truncate text-left">
                <span>{{ slotProps.item.capacidad }}</span>
                <v-tooltip activator="parent" location="bottom" max-width="350px">
                  <span style="white-space: normal; word-break: break-word">
                    Capacidad: {{ slotProps.item.capacidad }}
                  </span>
                </v-tooltip>
              </div>

              <!-- Asientos -->
              <div style="width: 10%; min-width: 0" class="text-truncate text-left">
                <span>{{ slotProps.item.asientosVendidos }}</span>
                <v-tooltip activator="parent" location="bottom" max-width="350px">
                  <span style="white-space: normal; word-break: break-word">
                    Asientos vendidos: {{ slotProps.item.asientosVendidos }}
                  </span>
                </v-tooltip>
              </div>

              <!-- Precio -->
              <div style="width: 10%; min-width: 0" class="text-truncate text-left">
                <span style="font-weight: bold;">{{ formatNumber(slotProps.item.dineroGenerado) }}</span>
                <v-tooltip activator="parent" location="bottom" max-width="350px">
                  <span style="white-space: normal; word-break: break-word">
                    Dinero Generado: {{ formatNumber(slotProps.item.dineroGenerado) }}
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
      
    </v-row>
  </v-container>
</template>

<script>
import Bar from "@/components/Bar.vue";
import Doughnut from "@/components/Doughnut.vue";
import LocalStorageService from "@/LocalStorageService";
import { handleRequest } from "@/utils/api"; // Ruta al archivo
import { paleteColors } from "@/assets/colors";
export default {
  name: 'BarChart',
  components: { Bar, Doughnut, },
  data() {
    return {
      snackbar: false,
      sb_type: '',
      sb_message: '',
      sb_timeout: 2000,
      sb_title: '',
      sb_icon: '',
      role: '',
      paleteColors: paleteColors,
      showWelcomeMessage: false, // Controlar si se muestra el mensaje de bienvenida
      branch_id: '',
      sales: [],
      data: {},
      earlyYear: [],
      trips: [],
      loading: false,
      type: 'Negocio',
      search: '',
      headers: [
        { title: 'Patente', value: 'vehiclePlate' },
        { title: 'Marca', value: 'vehicleBrand' },
        { title: 'Recorrido', value: 'route' },
        { title: 'Fecha', value: 'date' },
        { title: 'Horario', value: 'horario' },
        { title: 'Capacidad', value: 'capacidad' },
        { title: 'Asientos Vendidos', value: 'asientosVendidos' },
        { title: 'Dinero Generado', value: 'dineroGenerado' },
      ],
    };
  },

  mounted() {
    this.role = JSON.parse(LocalStorageService.getItem('role'));
    this.permissions = JSON.parse(LocalStorageService.getItem('permissions')); // Recuperar permisos

    // Verificar si el usuario tiene el permiso necesario
    if (this.permissions.includes('view_dashboard')) {
      this.initialize();
    } else {
      this.showWelcomeMessage = true;
    }
    if (this.role === 'Administrador') {
      this.type = 'Negocio';
    } else {
      this.branch_id = JSON.parse(LocalStorageService.getItem('branch_id'));
      this.type = 'Sucursal';
    }
  },
  methods: {
    getCacheTimestamp() {
      // Usamos medianoche (00:00:00) del día actual
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return startOfDay.getTime(); // Ej: 1714003200000 (cambia una vez al día)
    },
    formatTimeRange(timeRange) {
    if (!timeRange) return '--';
    
    const [start, end] = timeRange.split(' - ');
    return `${this.formatTime(start)} → ${this.formatTime(end)}`;
  },
  
  formatTime(datetime) {
    if (!datetime) return '--';
    return datetime.split(' ')[1].substring(0, 5); // Extrae solo HH:MM
  },
  
  showDuration(item) {
    return item.horario && item.horario.includes(' - ');
  },
  
  calculateDuration(timeRange) {
    if (!timeRange) return '';
    
    const [startStr, endStr] = timeRange.split(' - ');
    const start = new Date(startStr);
    const end = new Date(endStr);
    
    const diffMs = end - start;
    const diffMins = Math.round(diffMs / 60000);
    
    return `${diffMins} min`;
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
    month() {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0"); // Asegura 2 dígitos (ej. 01, 02, etc.)
      return `${year}-${month}`; // Formato YYYY-MM
    },
    async initialize() {
      this.loading = true;
      this.data = {};
      this.data.type = this.type;
      this.data.branch_id = this.branch_id;
      this.data.month = this.month();
      try {
        this.loading = true;
        const result = await handleRequest({
          endpoint: 'monthly-sales',
          method: 'POST',
          data: this.data
        });

        if (result.success) {
          // Si la solicitud es exitosa, asignamos las sucursales
          this.sales = result.data?.sales || [];
          this.earlyYear = result.data?.salesYear || [];
          this.trips = result.data?.trips || [];
        } else {
          // Si no hay datos, asignamos un array vacío
          this.sales = [];
          this.earlyYear = [];
          this.trips = [];
        }
      } catch (error) {
        this.loading = false;
        // Captura de errores no controlados
        this.showAlert('error', 'Ocurrió un error inesperado al procesar la solicitud.', 3000);
      } finally {
        this.loading = false;
      }
    },
    viewTripDetails(trip) {
      console.log('Detalles del viaje:', trip);
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

<style>
.text-white {
  color: white !important;
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
</style>
