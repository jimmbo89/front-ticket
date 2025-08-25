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
      <v-icon cover>mdi-alert</v-icon>
    </v-avatar>

    <!-- Texto -->
    <div class="ml-4">
      <div class="text-h6 font-weight-medium">Incidentes</div>
      <div class="text-body-2 text-grey">Gestionar Incidentes</div>
    </div>

    <!-- Botones -->
    <v-spacer></v-spacer>

    <!--<v-btn class="text-subtitle-1 ml-12" :color="paleteColors.primary" variant="tonal" elevation="2"
      prepend-icon="mdi-plus-circle" @click="showAdd()">
      Agregar Viaje
    </v-btn>-->
  </v-card>
  <v-container style="min-width: 100%">
    <v-card flat>
      <!-- Barra superior: selección de sucursal + botón buscar + búsqueda global -->
      <v-card-title class="d-flex flex-wrap align-center gap-4 pb-2">
        <!-- Título -->
        <div class="text-h6 font-weight-bold">Listado de incidencias</div>

        <!-- Spacer (solo visible en md+) -->
        <v-spacer class="d-none d-md-block"></v-spacer>

        <!-- Grupo: Autocomplete + Botón buscar -->
        <div class="d-flex align-center gap-2 flex-grow-1" style="max-width: 100%">
          <!-- Autocomplete de sucursales (mismo estilo que el original) -->
          <v-autocomplete
            :no-data-text="'No hay datos disponibles'"
            v-model="branch_id"
            v-if="mostrarFila"
            :items="branches"
            label="Seleccione una Sucursal"
            prepend-inner-icon="mdi-store"
            item-title="name"
            item-value="id"
            variant="solo-filled"
            hide-details
            single-line
            flat
            :rules="selectRules"
            density="compact"
          >
            <template v-slot:item="{ props, item }">
              <v-list-item
                v-bind="props"
                :prepend-avatar="`${this.$axios.defaults.baseURL}images/${item.raw.image}`"
              >
              </v-list-item>
            </template>
          </v-autocomplete>

          <v-menu
            v-model="menu"
            :close-on-content-click="false"
            :nudge-right="40"
            transition="scale-transition"
            offset-y
            min-width="290px"
          >
            <template v-slot:activator="{ props }">
              <v-text-field
                v-bind="props"
                :modelValue="dateFormatted"
                variant="solo-filled"
                hide-details
                single-line
                flat
                prepend-inner-icon="mdi-calendar"
                label="Fecha"
                density="compact"
                class="ml-1"
              ></v-text-field>
            </template>
            <v-locale-provider locale="es">
              <v-date-picker
                header="Calendario"
                title="Seleccione la fecha"
                :color="paleteColors.primary"
                :modelValue="input"
                @update:model-value="updateDate"
                format="yyyy-MM-dd"
              ></v-date-picker>
            </v-locale-provider>
          </v-menu>

          <v-menu
            v-model="menu2"
            :close-on-content-click="false"
            :nudge-right="40"
            transition="scale-transition"
            offset-y
            min-width="290px"
          >
            <template v-slot:activator="{ props }">
              <v-text-field
                v-bind="props"
                :modelValue="dateFormatted1"
                variant="solo-filled"
                hide-details
                single-line
                flat
                prepend-inner-icon="mdi-calendar"
                label="Fecha"
                density="compact"
                class="ml-1"
              ></v-text-field>
            </template>
            <v-locale-provider locale="es">
              <v-date-picker
                header="Calendario"
                title="Seleccione la fecha"
                :color="paleteColors.primary"
                :modelValue="input2"
                @update:model-value="updateDate1"
                format="yyyy-MM-dd"
                :min="dateFormatted"
              ></v-date-picker>
            </v-locale-provider>
          </v-menu>

          <!-- Botón de búsqueda (actualizar datos) -->
          <v-btn
            icon
            @click="getIncidents"
            :color="paleteColors.primary"
            density="comfortable"
            :disabled="!branch_id"
            class="mt-2 mt-md-0 mr-5 ml-1"
          >
            <v-icon>mdi-magnify</v-icon>
          </v-btn>
        </div>

        <!-- Campo de búsqueda global -->
        <div class="flex-grow-1" style="max-width: 300px">
          <v-text-field
            v-model="search"
            density="compact"
            label="Buscar incidencia"
            prepend-inner-icon="mdi-magnify"
            variant="solo-filled"
            hide-details
            single-line
            flat
          ></v-text-field>
        </div>
      </v-card-title>

      <!-- Separador -->
      <v-divider class="my-2"></v-divider>
<v-data-table
  :headers="headers"
  :items="incidents"
  v-model:expanded="expandedItems"
  item-value="id"
  :items-per-page-text="'Elementos por página'"
    no-data-text="No hay datos disponibles" :loading="loading" loading-text="Cargando datos..." hide-default-header
        class="elevation-1 hidden-header" style="max-height: 68vh; overflow-y: auto; background: transparent"
  show-expand
>
  <!-- Personalización completa de la fila con v-slot:row -->
  <template v-slot:row="{ item }">
<tr>
        <td colspan="100%" style="padding: 0; border: none">
          <v-card class="mb-2 mx-1 rounded-lg" elevation="1" density="comfortable" flat>
            <v-card-text class="d-flex align-center pa-2" style="width: 100%; min-width: 0">
          <!-- Avatar + Nombre -->
          <div class="d-flex align-center" style="width: 20%; min-width: 0; gap: 8px">
            <v-avatar class="icono-concavo" color="grey-lighten-4" size="40">
              <v-img
                :src="`${this.$axios.defaults.baseURL}images/${item.image}`"
                class="icono-concavo"
                cover
              ></v-img>
            </v-avatar>
            <div class="d-inline-block" style="min-width: 0; flex: 1">
              <span class="text-truncate d-inline-block" style="max-width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">
                {{ item.workerName }}
              </span>
              <v-tooltip activator="parent" location="bottom" max-width="350px">
                <span style="white-space: normal; word-break: break-word">
                  Trabajador: {{ item.workerName }}
                </span>
              </v-tooltip>
            </div>
          </div>

          <!-- Título con ícono -->
          <div style="width: 25%; min-width: 0; flex: 1">
            <div class="d-flex align-center" style="gap: 6px">
              <v-icon
                v-if="item.title.includes('Retraso')"
                color="warning"
                size="20"
              >
                mdi-clock-alert
              </v-icon>
              <v-icon
                v-else-if="item.title.includes('Escaneo')"
                color="success"
                size="20"
              >
                mdi-qrcode-scan
              </v-icon>
              <v-icon
                v-else-if="item.title.includes('Reimpresión')"
                color="info"
                size="20"
              >
                mdi-printer
              </v-icon>
              <div class="d-inline-block" style="min-width: 0; flex: 1">
                <span
                  class="text-truncate d-inline-block"
                  style="max-width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis"
                >
                  {{ item.title }}
                </span>
                <v-tooltip activator="parent" location="bottom" max-width="350px">
                  <span style="white-space: normal; word-break: break-word">
                    {{ item.title }}
                  </span>
                </v-tooltip>
              </div>
            </div>
          </div>

          <!-- Fecha -->
          <div style="width: 10%; min-width: 0; text-align: center">
            <span class="text-truncate d-inline-block" style="max-width: 100%">
              {{ item.date }}
            </span>
            <v-tooltip activator="parent" location="bottom">
              Fecha: {{ item.date }}
            </v-tooltip>
          </div>

          <!-- Descripción -->
          <div style="width: 30%; min-width: 0; text-align: center">
            <span class="text-truncate d-inline-block" style="max-width: 100%">
              {{ item.description }}
            </span>
            <v-tooltip activator="parent" location="bottom" max-width="350px">
              <span style="white-space: normal; word-break: break-word">
                Descripción: {{ item.description }}
              </span>
            </v-tooltip>
          </div>

          <!-- Botón de expansión -->
          <div style="width: 10%; min-width: 0; text-align: right">
            <v-btn
              size="small"
              variant="text"
              :color="getDetailsButtonColor(item)"
              @click.stop="toggleExpand(item)"
            >
              <v-icon start size="18">
                {{ isExpanded(item) ? "mdi-chevron-up" : "mdi-chevron-down" }}
              </v-icon>
              <span class="text-caption">
                {{ isExpanded(item) ? "Ocultar" : "Ver" }}
              </span>
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </td>
  </tr>
</template>

  <!-- Contenido expandido -->
  <template v-slot:expanded-row="{ item }">
    <tr>
      <td :colspan="headers.length">
        <div class="pa-4 bg-grey-lighten-4">
          <h4 class="text-subtitle-1 mb-2">Detalles completos:</h4>

          <!-- Título con ícono -->
          <div class="d-flex align-center mb-3">
            <v-icon v-if="item.title.includes('Retraso')" color="warning" class="mr-2">
              mdi-clock-alert
            </v-icon>
            <v-icon v-else-if="item.title.includes('Escaneo')" color="success" class="mr-2">
              mdi-qrcode-scan
            </v-icon>
            <v-icon v-else-if="item.title.includes('Reimpresión')" color="info" class="mr-2">
              mdi-printer
            </v-icon>
            <strong>{{ item.title }}</strong>
          </div>

          <!-- Tabla de detalles -->
          <table class="v-table v-table--density-compact text-body-2 bg-grey-lighten-4">
            <tbody>
              <tr v-for="(value, key) in JSON.parse(item.details)" :key="key">
                <td class="font-weight-bold" style="width: 200px">
                  {{ formatDetailKey(key) }}:
                </td>
                <td>
                  {{ formatDetailValue(key, value) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </td>
    </tr>
  </template>
</v-data-table>
    </v-card>
  </v-container>
</template>

<script>
import { paleteColors } from "@/assets/colors";
import LocalStorageService from "@/LocalStorageService";
import { handleRequest } from "@/utils/api"; // Ruta al archivo
import _ from "lodash";
import QRCode from "qrcode";
export default {
  data: () => ({
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
    dialogDelete: false,
    estimated: 0,
    timeSlotsKey: 0,
    mostrarFila: false,
    incidents: [],
    branches: [],
    data: {},
    branch_id: "",
    headers: [
      { title: "Trabajador", value: "workerName" },
      { title: "Título", value: "title" },
      { title: "Fecha", value: "date" },
      { title: "Descripción", value: "description" },
       { title: "Acciones", key: "data-table-expand", value: "data-table-expand" },
    ],
    editedItem: {
      startDate: null,
      endDate: null,
      branch_id: "",
    },
    originalItem: {
      startDate: null,
      endDate: null,
      branch_id: "",
    },
    defaultItem: {
      startDate: null,
      endDate: null,
      branch_id: "",
    },
    editedIndex: -1,
    search: "",
    menu: false,
    menu2: false,
    input: null,
    input2: null,
    tab: null,
     expandedItems: [],
     expanded: [],
    nameRules: [
      (v) => !!v || "El campo es requerido",
      (v) => (v && v.length <= 50) || "El campo debe tener menos de 51 caracteres",
      (v) => (v && v.length >= 3) || "El campo debe tener al menos 3 caracteres",
    ],
    selectRules: [(v) => !!v || "Seleccionar al menos un elemento"],
    priceRules: [
      (v) => !!v || "El precio es obligatorio", // El campo es obligatorio
      (v) =>
        /^[0-9]+(\.[0-9]{1,2})?$/.test(v) ||
        "El precio debe ser un número válido con hasta 2 decimales", // Valida el formato del precio
      (v) => v > 0 || "El precio debe ser un número positivo", // El precio debe ser positivo
    ],
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
  },
  mounted() {
    this.role = JSON.parse(LocalStorageService.getItem("role"));
    if (this.role === "Administrador") {
      this.showBranches();
    } else {
      this.branch_id = LocalStorageService.getItem("branch_id");
      this.initialize();
    }
  },

  methods: {
     toggleExpand(item) {
    const index = this.expandedItems.findIndex(i => i.id === item.id);
    if (index > -1) {
      this.expandedItems = this.expandedItems.filter(i => i.id !== item.id);
    } else {
      this.expandedItems = [...this.expandedItems, item];
    }
  },

  isExpanded(item) {
    if (!item || !item.id) return false;
    return this.expandedItems.some(i => i.id === item.id);
  },
    isValidJSON(str) {
      try {
        JSON.parse(str);
        return true;
      } catch (e) {
        return false;
      }
    },
    getCacheTimestamp() {
      // Usamos medianoche (00:00:00) del día actual
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return startOfDay.getTime(); // Ej: 1714003200000 (cambia una vez al día)
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
          this.editedItem.branch_id = this.branches[0].id;
          this.branch_id = this.branches[0].id;
        } else {
          // Si no hay datos, asignamos un array vacío
          this.branches = [];
          this.mostrarFila = false;
        }
      } catch (error) {
        this.mostrarFila = false;
        // Captura de errores no controlados
        this.showAlert(
          "error",
          "Ocurrió un error inesperado al procesar la solicitud.",
          3000
        );
      } finally {
        this.mostrarFila = true;
        this.loading = false;
        this.initialize();
      }
    },
    updateDate(val) {
      this.input = val;
      this.editedItem.startDate = this.dateFormatted;
      this.menu = false;
    },
    updateDate1(val) {
      this.input2 = val;
      this.editedItem.endDate = this.dateFormatted1;
      this.menu2 = false;
    },
    async initialize() {
      this.data = {};
      this.data.branch_id = this.branch_id;
      const today = new Date();
      const formattedDate = today.toISOString().split("T")[0]; // Formato: YYYY-MM-DD
      //this.data.date = formattedDate;
      try {
        this.loading = true;
        const result = await handleRequest({
          endpoint: "incident-date",
          method: "POST",
          data: this.data,
        });

        if (result.success) {
          // Si la solicitud es exitosa, asignamos las sucursales
          this.incidents = result.data?.incidents || [];
        } else {
          // Si no hay datos, asignamos un array vacío
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
    async getIncidents() {
      this.data = {};
      this.data.branch_id = this.branch_id;
      this.data.startDate =
        this.editedItem.startDate ?? new Date().toISOString().split("T")[0];
      this.data.endDate =
        this.editedItem.endDate ?? new Date().toISOString().split("T")[0];
      try {
        this.loading = true;
        const result = await handleRequest({
          endpoint: "incident-date",
          method: "POST",
          data: this.data,
        });

        if (result.success) {
          // Si la solicitud es exitosa, asignamos las sucursales
          this.incidents = result.data?.incidents || [];
        } else {
          // Si no hay datos, asignamos un array vacío
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

    getDetailsButtonColor(item) {
      if (item.title.includes("Reimpresión")) return "info";
      if (item.title.includes("Retraso")) return "warning";
      if (item.title.includes("Escaneo")) return "success";
      return "primary";
    },
    formatDetailKey(key) {
      const keysMap = {
        qr: "Código QR",
        action: "Acción",
        ticket_id: "ID Ticket",
        new_status: "Nuevo Estado",
        previous_status: "Estado Anterior",
        arrival: "Llegada Programada",
        actualEnd: "Llegada Real",
        difference: "Diferencia",
        actualStart: "Inicio Real",
        scheduledStart: "Inicio Programado",
        print: "Número de Reimpresión",
        method: "Método de Pago",
        quantity: "Cantidad",
        price: "Precio Unitario",
        total: "Total",
        trip_id: "ID del Viaje",
      };
      return (
        keysMap[key] ||
        key
          .split("_")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ")
      );
    },
    formatDetailValue(key, value) {
      if (key === "qr") return "";
      if (key === "difference" && typeof value === "number") {
        const hours = Math.floor(value / 60);
        const minutes = value % 60;
        return `${hours}h ${minutes}m`;
      }
      if (key === "method") {
        const methods = {
          cash: "Efectivo",
          card: "Tarjeta",
          transfer: "Transferencia",
        };
        return methods[value] || value;
      }
      if (["price", "total"].includes(key)) {
        return new Intl.NumberFormat("es-MX", {
          style: "currency",
          currency: "MXN",
        }).format(value);
      }
      return value;
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
    async onItemExpanded({ item, value }) {
      // Solo generar QR cuando se expande y tiene datos QR
      if (value && item.details?.qr) {
        console.log("item", item);
        await this.$nextTick();
        await this.generateQRCode(item);
      }
    },

    async generateQRCode(item) {
      if (!item.details?.qr) return;
      console.log("item", item);
      const containerId = `qr-container-${item.id}`;
      await this.$nextTick();

      const container = document.getElementById(containerId);
      if (!container) return;

      // Limpiar contenedor por si ya tenía un QR
      container.innerHTML = "";

      const canvas = document.createElement("canvas");
      container.appendChild(canvas);

      try {
        await QRCode.toCanvas(canvas, item.details.qr, {
          width: 120,
          margin: 1,
          color: {
            dark: "#000000",
            light: "#ffffff",
          },
        });
      } catch (error) {
        console.error("Error generando QR:", error);
        container.innerHTML =
          '<span class="error-text">Error al generar código QR</span>';
      }
    },
  },
};
</script>
<style>
.selected-tab {
  background-color: #1976d2;
  /* Fondo del tab seleccionado */
  color: white;
  /* Texto blanco */
  border-radius: 4px;
  /* Esquinas redondeadas, opcional */
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
