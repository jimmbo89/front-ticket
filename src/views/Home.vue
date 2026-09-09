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
        <v-avatar :icon="sb_icon" color="sb_type" size="40"></v-avatar>
      </v-col>
      <v-col md="10">
        <h4>{{ sb_title }}</h4>
        {{ sb_message }}
      </v-col>
    </v-row>
  </v-snackbar>

  <v-card
    class="d-flex align-center pa-3"
    elevation="0"
    style="background-color: #f9f9f9"
  >
    <!-- Icono -->
    <v-avatar :color="paleteColors.primary" class="icono-concavo">
      <v-icon cover>mdi-office-building</v-icon>
    </v-avatar>

    <!-- Texto -->
    <div class="ml-4">
      <div class="text-h6 font-weight-medium">Dashboard</div>
      <div class="text-body-2 text-grey">Resumen general</div>
    </div>

    <!-- Botones -->
    <v-spacer></v-spacer>

    <v-chip class="ma-2" prepend-icon="mdi-clock-outline" label color="primary">
      {{ currentDateTime }}
    </v-chip>
  </v-card>
  <v-container style="min-width: 100%; min-height: 100%; background-color: #f5f5f5">
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
   <!-- INDICADORES SUPERIORES -->
<v-col
  v-for="(stat, index) in sales"
  :key="index"
  cols="12"
  sm="6"
  md="3"
  class="kpi-column"
>
  <v-card
    class="kpi-card-stat"
    elevation="0"
    :style="{ '--stat-color': stat.color }"
    @click="$router.push(stat.to)"
  >
    <div
      class="kpi-accent"
      :style="{ background: stat.color }"
    ></div>

    <div class="kpi-header">
      <div class="kpi-heading">
        <span class="kpi-label">
          {{ stat.title }}
        </span>

        <span class="kpi-period">
          Periodo actual
        </span>
      </div>

      <div
        class="kpi-icon-box"
        :style="{
          color: stat.color,
          backgroundColor: `${stat.color}12`,
          borderColor: `${stat.color}22`
        }"
      >
        <v-icon size="22">
          {{ stat.icon }}
        </v-icon>
      </div>
    </div>

    <div class="kpi-number">
      <span
        v-if="
          stat.title !== 'Boletos Vendidos' &&
          stat.title !== 'Incidentes'
        "
      >
        {{ formatNumber(stat.value) }}
      </span>

      <span v-else>
        {{ stat.value }}
      </span>
    </div>

    <div class="kpi-footer">
      <div
        class="kpi-trend"
        :style="{
          color: getTrendHexColor(stat),
          backgroundColor: `${getTrendHexColor(stat)}12`
        }"
      >
        <v-icon size="15">
          {{ getTrendIcon(stat.comparison) }}
        </v-icon>

        <span class="kpi-trend-value">
          {{ formatTrendPercent(stat.comparison?.changePercent) }}
        </span>
      </div>

      <span class="kpi-trend-text">
        vs. periodo anterior
      </span>
    </div>

    <div
      class="kpi-decoration"
      :style="{ borderColor: `${stat.color}0D` }"
    ></div>
  </v-card>
</v-col>

      <!-- Gráfica -->
      <v-col cols="12" md="6" class="d-flex">
        <v-card class="chart-card dashboard-panel pa-2" rounded="lg" >
          <!-- HEADER -->
          <div class="chart-header">
            <div class="kpi-label">
              <v-icon size="18" class="mr-2">mdi-chart-bar</v-icon>
              Performance operacional - Flujo de ventas
            </div>
          </div>

          <!-- BODY -->
          <div class="chart-body">
            <Bar :dataArray="earlyYear" />
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="6" class="d-flex">
        <v-card
          flat
        
          rounded="lg"
          class="trip-card panel-card dashboard-panel"
        >
          <!-- HEADER -->
          <v-card-title class="d-flex align-center px-5 py-4">
            <div class="kpi-label">Próximos viajes</div>

            <v-spacer />

            <v-btn
              variant="text"
              color="primary"
              append-icon="mdi-arrow-right"
              class="view-all-btn"
              @click="$router.push('trip-home')"
            >
              Ver todos
            </v-btn>
          </v-card-title>

          <v-card-text class="trip-card-body"
            ><!-- TABLE -->
            <v-data-table
  :headers="tripHeaders"
  :items="trips"
  :loading="loading"
  loading-text="Cargando..."
  no-data-text="Sin próximos viajes"
  hide-default-header
  hide-default-footer
  :items-per-page="-1"
  density="compact"
  class="bg-transparent"
>
  <template #bottom />

  <template #item="{ item }">
    <tr>
      <td class="px-3 py-3">
        <div class="d-flex align-center ga-3">
          <!-- HORA -->
          <div class="flex-shrink-0 text-center">
            <div class="text-subtitle-1 font-weight-bold text-primary">
              {{ getDepartureTime(item.horario) }}
            </div>

            <div class="text-caption text-medium-emphasis">
              {{ item.estimated }} min
            </div>
          </div>

          <v-divider vertical />

          <!-- INFORMACIÓN -->
          <div class="flex-grow-1 overflow-hidden">
            <v-tooltip location="top" :text="item.route">
              <template #activator="{ props }">
                <div
                  v-bind="props"
                  class="text-body-2 font-weight-medium text-truncate"
                >
                  {{ item.route }}
                </div>
              </template>
            </v-tooltip>

            <div class="d-flex align-center flex-wrap ga-1 mt-1">
              <v-icon size="14" color="medium-emphasis">
                mdi-bus
              </v-icon>

              <span class="text-caption text-medium-emphasis">
                {{ item.vehiclePlate }}
              </span>

              <v-chip
                    
size="small"
label                color="primary"
              >
                N.º {{ item.internalNumber }}
              </v-chip>

              <v-chip
                size="small"
                label
                :color="
                  item.saleMode === 'express'
                    ? 'info'
                    : 'primary'
                "
              >
                {{ item.saleMode }}
              </v-chip>
            </div>
          </div>

          <!-- OCUPACIÓN -->
          <div class="flex-shrink-0 text-center">
            <div class="text-body-2 font-weight-bold">
              {{ item.asientosVendidos }}/{{ item.capacidad }}
            </div>

            <div class="text-caption text-medium-emphasis">
              {{ getOccupancyPercentage(item) }}%
            </div>
          </div>

          <!-- MONTO -->
          <div class="flex-shrink-0 text-right">
            <div class="text-body-2 font-weight-bold">
              ${{ formatNumber(item.dineroGenerado) }}
            </div>

            <div class="text-caption text-medium-emphasis">
              Ingresos
            </div>
          </div>
        </div>

        <v-progress-linear
          :model-value="getOccupancyPercentage(item)"
          :color="getOccupancyColor(item)"
          bg-color="grey-lighten-3"
          height="4"
          rounded
          class="mt-2"
        />
      </td>
    </tr>
  </template>

  <template #no-data>
    <div
      class="d-flex flex-column align-center justify-center ga-2 py-10"
    >
      <v-icon color="primary" size="28">
        mdi-calendar-blank-outline
      </v-icon>

      <span class="text-body-2 font-weight-medium">
        Sin próximos viajes
      </span>
    </div>
  </template>
</v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <!-- Tabla de viajes -->
    <v-row align="stretch" v-if="!showWelcomeMessage">
      <v-col cols="12">
        <v-card flat  rounded="lg" class="">
          <!-- HEADER -->
          <v-card-title class="d-flex align-center px-5 py-4">
            <div>
              <div class="kpi-label">Últimas incidencias</div>
            </div>

            <v-spacer />

            <v-btn
              variant="text"
              color="primary"
              append-icon="mdi-arrow-right"
              class="view-all-btn"
              @click="$router.push('incident')"
            >
              Ver todas
            </v-btn>
          </v-card-title>

          <v-card-text>
            <div class="incident-header">
              <div>Sucursal</div>
              <div>Trabajador</div>
              <div>Incidencia</div>
              <div>Fecha</div>
              <div>Descripción</div>
            </div>

            <div
              v-for="incident in incidents.slice(0, 5)"
              :key="incident.id"
              class="incident-row"
            >
              <div class="incident-branch text-truncate">
                <v-tooltip location="top" :text="getIncidentBranchName(incident)">
                  <template #activator="{ props }">
                    <v-chip
                      v-bind="props"
                      color="primary"
                      variant="tonal"
                      size="small"
                      rounded="lg"
                      class="font-weight-bold"
                    >
                      {{ getIncidentBranchName(incident) }}
                    </v-chip>
                  </template>
                </v-tooltip>
              </div>

              <div class="incident-worker text-truncate">
                <v-tooltip
                  location="top"
                  :text="incident.workerName || 'Trabajador sin nombre'"
                >
                  <template #activator="{ props }">
                    <span v-bind="props" class="text-truncate">
                      <v-icon size="16" class="mr-1">mdi-account-outline</v-icon>
                      {{ incident.workerName || "Trabajador sin nombre" }}
                    </span>
                  </template>
                </v-tooltip>
              </div>

              <div class="incident-title text-truncate">
                <v-tooltip
                  location="top"
                  :text="incident.title || 'Incidencia sin título'"
                >
                  <template #activator="{ props }">
                    <span v-bind="props" class="text-truncate">
                      <v-icon
                        size="17"
                        :color="incident.iconColor || 'warning'"
                        class="mr-2"
                      >
                        {{ incident.icon || "mdi-alert-circle-outline" }}
                      </v-icon>
                      {{ incident.title || "Incidencia sin título" }}
                    </span>
                  </template>
                </v-tooltip>
              </div>

              <div class="incident-date">
                {{ incident.date || "--" }}
              </div>

              <div class="incident-description text-truncate">
                <v-tooltip
                  location="top"
                  max-width="420"
                  :text="incident.description || '--'"
                >
                  <template #activator="{ props }">
                    <span v-bind="props" class="text-truncate">
                      {{ incident.description || "--" }}
                    </span>
                  </template>
                </v-tooltip>
              </div>
            </div>

            <div v-if="!incidents.length" class="incident-empty">
              Sin incidencias registradas
            </div>
          </v-card-text>
        </v-card>
      </v-col>
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
  name: "BarChart",
  components: { Bar, Doughnut },
  data() {
    return {
    tripHeaders: [
      {
        title: "Hora",
        key: "horario",
        sortable: false,
        width: 110,
      },
      {
        title: "Ruta y vehículo",
        key: "route",
        sortable: false,
      },
      {
        title: "Modalidad",
        key: "saleMode",
        sortable: false,
        width: 130,
      },
      {
        title: "Ocupación",
        key: "occupancy",
        sortable: false,
        width: 160,
      },
      {
        title: "Ingresos",
        key: "dineroGenerado",
        sortable: false,
        align: "end",
        width: 130,
      },
    ],
      incidents: [],
      currentDateTime: "",
      snackbar: false,
      sb_type: "",
      sb_message: "",
      sb_timeout: 2000,
      sb_title: "",
      sb_icon: "",
      role_id: "",
      role: "",
      paleteColors: paleteColors,
      showWelcomeMessage: false, // Controlar si se muestra el mensaje de bienvenida
      branch_id: "",
      company_id: "",
      sales: [],
      data: {},
      earlyYear: [],
      trips: [],
      loading: false,
      type: "Negocio",
      search: "",
      headers: [
        { title: "Patente", value: "vehiclePlate" },
        { title: "Marca", value: "vehicleBrand" },
        { title: "Ruta", value: "route" },
        { title: "Fecha", value: "date" },
        { title: "Emisión", value: "horario" },
        { title: "Capacidad", value: "capacidad" },
        { title: "Asientos Vendidos", value: "asientosVendidos" },
        { title: "Dinero Generado", value: "dineroGenerado" },
      ],
    };
  },

  mounted() {
    this.updateDateTime();
    setInterval(this.updateDateTime, 1000);

    this.role = JSON.parse(LocalStorageService.getItem("role"));
    if (this.normalizeRole(this.role) === "ADMINISTRADOR") {
      this.company_id = JSON.parse(LocalStorageService.getItem("business_id"));
      this.type = "Negocio";
    } else {
      this.branch_id = JSON.parse(LocalStorageService.getItem("branch_id"));
      this.type = "Sucursal";
    }
    this.permissions = JSON.parse(LocalStorageService.getItem("permissions")); // Recuperar permisos

    // Verificar si el usuario tiene el permiso necesario
    if (this.permissions.includes("view_dashboard")) {
      this.initialize();
    } else {
      this.showWelcomeMessage = true;
    }
  },
  methods: {
 getDepartureTime(schedule) {
    if (!schedule) return "--:--";

    const start = schedule.split(" - ")[0];

    return start.split(" ")[1]?.substring(0, 5) || "--:--";
  },

  getOccupancyPercentage(trip) {
    const sold = Number(trip.asientosVendidos) || 0;
    const capacity = Number(trip.capacidad) || 0;

    if (capacity <= 0) return 0;

    return Math.min(
      100,
      Math.round((sold * 100) / capacity)
    );
  },

  getOccupancyColor(trip) {
    const percentage = this.getOccupancyPercentage(trip);

    if (percentage >= 90) return "error";
    if (percentage >= 70) return "warning";
    if (percentage >= 40) return "primary";

    return "success";
  },

    updateDateTime() {
      this.currentDateTime = new Date().toLocaleString("es-CL", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },

    getCacheTimestamp() {
      // Usamos medianoche (00:00:00) del día actual
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return startOfDay.getTime(); // Ej: 1714003200000 (cambia una vez al día)
    },
    formatTimeRange(timeRange) {
      if (!timeRange) return "--";

      const [start, end] = timeRange.split(" - ");
      return `${this.formatTime(start)} → ${this.formatTime(end)}`;
    },

    formatTime(datetime) {
      if (!datetime) return "--";
      return datetime.split(" ")[1].substring(0, 5); // Extrae solo HH:MM
    },

    showDuration(item) {
      return item.horario && item.horario.includes(" - ");
    },

    calculateDuration(timeRange) {
      if (!timeRange) return "";

      const [startStr, endStr] = timeRange.split(" - ");
      const start = new Date(startStr);
      const end = new Date(endStr);

      const diffMs = end - start;
      const diffMins = Math.round(diffMs / 60000);

      return `${diffMins} min`;
    },
    formatNumber(value) {
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
    getTrendDirection(comparison) {
      if (!comparison) return "flat";

      const changePercent = Number(comparison.changePercent) || 0;
      if (changePercent > 0) return "up";
      if (changePercent < 0) return "down";
      return comparison.trend || "flat";
    },
    getTrendIcon(comparison) {
      const direction = this.getTrendDirection(comparison);

      if (direction === "down") return "mdi-arrow-bottom-right";
      if (direction === "flat") return "mdi-minus";
      return "mdi-arrow-top-right";
    },
    getTrendHexColor(stat) {
      const direction = this.getTrendDirection(stat?.comparison);
      const isIncidents = stat?.title === "Incidentes";

      if (direction === "flat") return "#9E9E9E";

      if (isIncidents) {
        if (direction === "up") return "#F44336";
        return "#4CAF50";
      }

      if (direction === "down") return "#F44336";
      return "#4CAF50";
    },
    formatTrendPercent(changePercent) {
      const value = Number(changePercent);

      if (!Number.isFinite(value)) return "0%";

      const absValue = Math.abs(value);
      const formatted = Number.isInteger(absValue)
        ? `${absValue}%`
        : `${absValue.toFixed(1)}%`;

      if (value > 0) return `+${formatted}`;
      if (value < 0) return `-${formatted}`;
      return formatted;
    },
    getTripBranchName(trip) {
      return (
        trip?.nameBranch ||
        trip?.branchName ||
        trip?.sucursal ||
        trip?.internal_number ||
        trip?.internalNumber ||
        "Sucursal sin nombre"
      );
    },
    getIncidentBranchName(incident) {
      return (
        incident?.nameBranch ||
        incident?.branchName ||
        incident?.sucursal ||
        "Sucursal sin nombre"
      );
    },
    getTripSaleModeLabel(trip = {}) {
      const saleMode = String(trip?.sale_mode || trip?.saleMode || "normal").toLowerCase();
      return saleMode === "express" ? "Express" : "Full";
    },
    getTripSaleModeColor(trip = {}) {
      const saleMode = String(trip?.sale_mode || trip?.saleMode || "normal").toLowerCase();
      return saleMode === "express" ? "secondary" : "primary";
    },
    getTripRouteTooltip(trip = {}) {
      return trip?.route || "Ruta sin información";
    },
    getIncidentDetails(incident) {
      if (!incident?.details) return {};
      if (typeof incident.details === "object") return incident.details;

      try {
        return JSON.parse(incident.details);
      } catch (error) {
        return {};
      }
    },
    prepareIncident(incident) {
      const details = this.getIncidentDetails(incident);
      const type = details?.type || "";

      if (type.includes("TRIP_VEHICLE_CHANGE")) {
        return {
          ...incident,
          icon: "mdi-bus-alert",
          iconColor: "primary",
        };
      }

      return {
        ...incident,
        icon: "mdi-alert-circle-outline",
        iconColor: "warning",
      };
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
      this.data.company_id = this.company_id;
      this.data.month = this.month();
      try {
        this.loading = true;
        const result = await handleRequest({
          endpoint: "monthly-sales",
          method: "POST",
          data: this.data,
        });

        if (result.success) {
          // Si la solicitud es exitosa, asignamos las sucursales
          this.sales = result.data?.sales || [];
          this.earlyYear = result.data?.salesYear || [];
          this.trips = result.data?.trips || [];
          this.incidents = (result.data?.incidents || []).map(this.prepareIncident);
        } else {
          // Si no hay datos, asignamos un array vacío
          this.sales = [];
          this.earlyYear = [];
          this.trips = [];
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
    viewTripDetails(trip) {
      console.log("Detalles del viaje:", trip);
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
    normalizeRole(role) {
      return String(role || "")
        .trim()
        .toUpperCase();
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



.kpi-card {
  border-radius: 14px;
  padding: 16px;
  background: linear-gradient(
    145deg,
    rgba(255, 255, 255, 0.06),
    rgba(255, 255, 255, 0.02)
  );
  border: 1px solid rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(10px);
  cursor: pointer;
  transition: all 0.25s ease;
  position: relative;
  overflow: hidden;
}

.kpi-card:hover {
  transform: translateY(-3px);
  border-color: rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.08);
}

.kpi-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.04);
}

.kpi-avatar {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.kpi-value {
  font-size: 30px;
  font-weight: 800;
  margin-top: 12px;

  /* 👇 esto es lo importante */
  color: #111827;
  /* casi negro elegante */
  letter-spacing: -0.02em;
}

.kpi-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  font-size: 12px;
  opacity: 0.6;
}

.chart-card {
  border-radius: 14px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100%;
}

.chart-header {
  padding: 16px 16px 0 16px;
}

.chart-title {
  display: flex;
  align-items: center;
  font-weight: 700;
  font-size: 14px;
  color: #111827;
}

.chart-subtitle {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

.chart-body {
  padding: 10px 14px 16px 14px;
  flex: 1;
  min-height: 0;
}

.trip-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100%;
}

.trip-card-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-top: 0;
  display: flex;
  flex-direction: column;
}

.trip-card .v-data-table {
  height: 100%;
  flex: 1;
  min-height: 0;
}

.dashboard-panel {
  height: 100%;
}

.busgo-table-shell {
  border-radius: 14px;
  background: #0b1220;
  overflow: hidden;
}

.header-title {
  color: #e5e7eb;
  font-weight: 700;
  font-size: 14px;
}

.header-sub {
  display: block;
  font-size: 11px;
  color: #94a3b8;
}

/* TABLE HEADER */
.table-head {
  background: rgba(173, 41, 41, 0.04);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.col {
  font-size: 12px;
  color: #000000bd;
  padding: 6px 8px;
}

/* ROW */
.busgo-row {
  display: flex;
  align-items: center;
  padding: 2.6px 8px;

  border-radius: 12px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: 0.2s;
}

.busgo-row:hover {
  background: rgba(255, 255, 255, 0.05);
  transform: translateY(-1px);
}

/* COLUMN WIDTHS (CLAVE PARA LOOK PRO) */
.col-vehicle {
  width: 14%;
}

.col-brand {
  width: 10%;
}

.col-route {
  width: 100%;
}

.trip-route-title {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.trip-route-title > span {
  min-width: 0;
}

.trip-sale-mode-chip {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: uppercase;
}

.col-date {
  width: 10%;
}

.col-cap {
  width: 8%;
}

.col-sold {
  width: 10%;
}

.col-money {
  width: 14%;
}

/* ROUTE META */
.route-meta {
  font-size: 11px;
  color: #94a3b8;
  display: flex;
  gap: 6px;
  align-items: center;
}

/* MONEY */
.money-badge {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  padding: 5px 10px;
  border-radius: 10px;
  font-weight: 700;
  color: white;
  font-size: 12px;
  box-shadow: 0 6px 16px rgba(34, 197, 94, 0.25);
}

/* ========================================
   CUADRÍCULA DE INDICADORES
======================================== */

.kpi-grid {
  margin-top: -4px;
  margin-bottom: 2px;
}

.kpi-column {
  display: flex;
}

.kpi-card-stat {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 148px;
  padding: 17px 18px 15px;
  overflow: hidden;

  color: #0f172a;
  cursor: pointer;
  background: #ffffff;
  border: 1px solid #e8edf5;
  border-radius: 13px !important;
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.045) !important;

  transition:
    transform 180ms ease,
    border-color 180ms ease,
    box-shadow 180ms ease;
}

.kpi-card-stat:hover {
  border-color: #dce4ef;
  box-shadow: 0 12px 27px rgba(15, 23, 42, 0.09) !important;
  transform: translateY(-3px);
}

.kpi-card-stat:active {
  transform: translateY(-1px);
}

/* Línea superior */

.kpi-accent {
  position: absolute;
  top: 0;
  left: 18px;
  width: 34px;
  height: 3px;
  border-radius: 0 0 4px 4px;
  transition: width 180ms ease;
}

.kpi-card-stat:hover .kpi-accent {
  width: 50px;
}

/* ========================================
   CABECERA
======================================== */

.kpi-header {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.kpi-heading {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.kpi-label {
  margin: 0;
  overflow: hidden;
  color: #475569;
  font-size: 14px;
  font-weight: 800;
  line-height: 1.25;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.kpi-period {
  margin-top: 3px;
  color: #a0aaba;
  font-size: 11px;
  font-weight: 650;
  line-height: 1;
  letter-spacing: 0.02em;
}

/* ========================================
   ICONO
======================================== */

.kpi-icon-box {
  display: grid;
  flex: 0 0 39px;
  width: 39px;
  height: 39px;
  place-items: center;

  border: 1px solid;
  border-radius: 10px;

  transition:
    transform 180ms ease,
    box-shadow 180ms ease;
}

.kpi-icon-box :deep(.v-icon) {
  color: inherit !important;
  opacity: 1 !important;
}

.kpi-card-stat:hover .kpi-icon-box {
  box-shadow: 0 5px 13px rgba(15, 23, 42, 0.08);
  transform: translateY(-1px);
}

/* ========================================
   VALOR PRINCIPAL
======================================== */

.kpi-number {
  position: relative;
  z-index: 2;
  margin-top: 7px;
  overflow: hidden;

  color: #0f172a;
  font-size: clamp(24px, 2vw, 29px);
  font-weight: 900;
  line-height: 1.05;
  letter-spacing: -0.035em;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ========================================
   TENDENCIA
======================================== */

.kpi-footer {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
  margin-top: auto;
  padding-top: 11px;
}

.kpi-trend {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 2px;
  min-height: 22px;
  padding: 3px 7px;

  font-size: 12px;
  font-weight: 850;
  line-height: 1;
  border-radius: 7px;
}

.kpi-trend :deep(.v-icon) {
  color: inherit !important;
  opacity: 1 !important;
}

.kpi-trend-value {
  color: inherit;
}

.kpi-trend-text {
  overflow: hidden;
  color: #94a3b8;
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ========================================
   DECORACIÓN
======================================== */

.kpi-decoration {
  position: absolute;
  right: -28px;
  bottom: -43px;
  width: 95px;
  height: 95px;

  pointer-events: none;
  border: 15px solid;
  border-radius: 50%;
}

/* ========================================
   RESPONSIVE
======================================== */

@media (max-width: 1279px) {
  .kpi-card-stat {
    min-height: 145px;
  }

  .kpi-number {
    font-size: 27px;
  }
}

@media (max-width: 959px) {
  .kpi-card-stat {
    min-height: 142px;
  }

  .kpi-label {
    white-space: normal;
  }
}

@media (max-width: 600px) {
  .kpi-card-stat {
    min-height: 138px;
    padding: 15px 16px 14px;
  }

  .kpi-accent {
    left: 16px;
  }

  .kpi-number {
    margin-top: 6px;
    font-size: 26px;
  }

  .kpi-icon-box {
    flex-basis: 37px;
    width: 37px;
    height: 37px;
  }
}

.col-occupancy {
  width: 100px;
}

.occupancy-main {
  font-weight: 700;
  color: #0f172a;
}

.occupancy-separator {
  color: #94a3b8;
  margin: 0 2px;
}

.occupancy-percent {
  font-size: 11px;
  color: #64748b;
}

.view-all-btn {
  font-size: 13px;
  font-weight: 700;
  text-transform: none;
  letter-spacing: 0;
}

.view-all-btn:hover {
  background: rgba(var(--v-theme-primary), 0.06);
}

.incident-subtitle {
  margin-top: 2px;
  font-size: 12px;
  font-weight: 500;
  color: #94a3b8;
}

.incident-header,
.incident-row {
  display: grid;
  grid-template-columns: 150px 170px 220px 120px minmax(260px, 1fr);
  align-items: center;
  column-gap: 14px;
}

.incident-header {
  padding: 0 16px 10px;
  font-size: 11px;
  font-weight: 900;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.incident-row {
  min-height: 58px;
  padding: 10px 16px;
  margin-bottom: 8px;
  border-radius: 14px;
  background: #ffffff;
  border: 1px solid #edf1f5;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.04);
  transition: 0.18s ease;
}
</style>
