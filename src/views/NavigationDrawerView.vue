<template>
  <v-card flat class="pa-0" style="overflow: hidden;">
    <!-- Encabezado -->

      <v-list>
          <v-list-item
            :prepend-avatar="`${this.$axios.defaults.baseURL}images/${imageBranch}`"
            :subtitle="subtitle"
            :title="title"
            to="home"
            value="home"
          >
            
          </v-list-item>
        </v-list>

  <v-divider></v-divider>
    <!-- Menú -->
    <v-list nav :opened="open" open-strategy="single"  bg-color="" density="compact">
      <v-list-item
        prepend-icon="mdi-view-dashboard-outline"
        title="Dashboard"
        to="home"
        value="home"
        class="menu-item"
      ></v-list-item>

      <v-list-item
        prepend-icon="mdi-office-building"
        title="Empresa"
        to="company"
        value="company"
        class="menu-item"
        permission= "view_business"
      ></v-list-item>

      <v-list-item
        prepend-icon="mdi-steering"
        title="Viajes y Plantillas"
        to="trip-home"
        value="trip-home"
        class="menu-item"
        permission= "view_trips"
      ></v-list-item>
      <!-- Tickets -->
      <v-list-group value="Mantenedores" v-if="filteredMenuTickets.length">
        <template v-slot:activator="{ props }">
          <v-list-item v-bind="props" prepend-icon="mdi-progress-wrench" title="Tickets"></v-list-item>
        </template>
        <v-list-item
          v-for="item in filteredMenuTickets"
          :key="item.title"
          :prepend-icon="item.icon"
          :title="item.title"
          :to="item.to"
          :value="item.value"
          class="sub-menu-item"
        ></v-list-item>
      </v-list-group>
      <!-- Administración 
      <v-list-group value="Admin" v-if="filteredMenuAdministracion.length">
        <template v-slot:activator="{ props }">
          <v-list-item v-bind="props" prepend-icon="mdi-cog-outline" title="Administración"></v-list-item>
        </template>
        <v-list-item
          v-for="item in filteredMenuAdministracion"
          :key="item.title"
          :prepend-icon="item.icon"
          :title="item.title"
          :to="item.to"
          :value="item.value"
          class="sub-menu-item"
        ></v-list-item>
      </v-list-group>-->

      <!-- Seguridad -->
      <v-list-group value="Seguridad" v-if="filteredMenuSecurity.length">
        <template v-slot:activator="{ props }">
          <v-list-item v-bind="props" prepend-icon="mdi-shield-account" title="Seguridad"></v-list-item>
        </template>
        <v-list-item
          v-for="item in filteredMenuSecurity"
          :key="item.title"
          :prepend-icon="item.icon"
          :title="item.title"
          :to="item.to"
          :value="item.value"
          class="sub-menu-item"
        ></v-list-item>
      </v-list-group>

      <!-- Reportes -->
      <v-list-group value="Reportes" v-if="filteredMenuReports.length">
        <template v-slot:activator="{ props }">
          <v-list-item v-bind="props" prepend-icon="mdi-file-chart" title="Reportes"></v-list-item>
        </template>
        <v-list-item
          v-for="item in filteredMenuReports"
          :key="item.title"
          :prepend-icon="item.icon"
          :title="item.title"
          :to="item.to"
          :value="item.value"
          class="sub-menu-item"
        ></v-list-item>
      </v-list-group>

     
    </v-list>
  </v-card>
</template>

<script>
import LocalStorageService from "@/LocalStorageService";

export default {
  data: () => ({
    open: ["Admin"],
    tickets: [
      //{ title: "Estructuras de asientos", icon: "mdi-bus-side", to: "structure", permission: "view_structures" },
      { title: "Promociones", icon: "mdi-tag-outline", to: "promotion", permission: "view_promotions" },
      { title: "Tipos de Pasajes", icon: "mdi-ticket-confirmation-outline", to: "ticket-type", permission: "view_tickettype" },
      //{ title: "Plantillas de Viajes", icon: "mdi-map-marker-path", to: "trip-template", permission: "view_triptemplates" },
      { icon: "mdi-ticket", title: "Venta de Tickets", to: "ticket", value: "ticket", permission: "view_tickets" },
    ],
    security: [
      { title: "Roles", icon: "mdi-account-cog-outline", to: "role", permission: "view_roles" },
      { title: "Permisos", icon: "mdi-shield-check", to: "permission", permission: "view_permissions" },
    ],
    administracion: [
      { icon: "mdi-office-building", title: "Empresa", to: "company", value: "company", permission: "view_business" },
      //{ icon: "mdi-store", title: "Sucursales", to: "branch", value: "branch", permission: "view_branches" },
      //{ icon: "mdi-account", title: "Trabajadores", to: "worker", value: "worker", permission: "view_workers" },
      //{ icon: "mdi-devices", title: "Dispositivos", to: "device", value: "devices", permission: "view_devices" },
      //{ icon: "mdi-bus", title: "Estructura de Asientos y Vehículos", to: "structure-vehicle", value: "structure-vehicle", permission: "view_vehicles" },
      //{ icon: "mdi-map-marker", title: "Lugares", to: "location", value: "location", permission: "view_locations" },
      //{ icon: "mdi-road-variant", title: "Rutas", to: "route", value: "route", permission: "view_routes" },
      { icon: "mdi-steering", title: "Viajes y Plantillas", to: "trip-home", value: "trip-home", permission: "view_trips" },
      { icon: "mdi-ticket", title: "Tickets", to: "ticket", value: "ticket", permission: "view_tickets" },
    ],
    reports: [
      { title: "Monto generado", icon: "mdi-finance", to: "ticketdate", permission: "view_ticketsdate" },
      { title: "Monto por viajes", icon: "mdi-map-marker-path", to: "tickettripdate", permission: "view_tickettripsdate" },
      { title: "Viajes por trabajador", icon: "mdi-bus-marker", to: "tripsworker", permission: "view_tripsworker" },
      { title: "Incidentes", icon: "mdi-alert",  to: "incident", permission: "view_incidents" }
    ],
    title: '',
    imageBranch: '',
    subtitle: 'Empresa',
    role: '',
  }),
  computed: {
    permissions() {
      const permissions = LocalStorageService.getItem('permissions');
      try {
        return permissions ? JSON.parse(permissions) : [];
      } catch {
        return [];
      }
    },
    filteredMenuAdministracion() {
      return this.administracion.filter(item => this.permissions.includes(item.permission));
    },
    filteredMenuSecurity() {
      return this.security.filter(item => this.permissions.includes(item.permission));
    },
    filteredMenuTickets() {
      return this.tickets.filter(item => this.permissions.includes(item.permission));
    },
    filteredMenuReports() {
      return this.reports.filter(item => this.permissions.includes(item.permission));
    },
  },
  mounted() {
    this.role = JSON.parse(LocalStorageService.getItem('role'));
    if (this.role === 'Administrador') {
      this.title = JSON.parse(LocalStorageService.getItem('nameBusiness'));
      this.imageBranch = LocalStorageService.getItem('imageBusiness').replace(/['"]+/g, '');
      this.subtitle = 'Empresa';
    } else {
      this.title = JSON.parse(LocalStorageService.getItem('nameBranch'));
      this.imageBranch = LocalStorageService.getItem('imageBranch').replace(/['"]+/g, '');
      this.subtitle = 'Sucursal';
    }
  },
};
</script>

<style scoped>
/* Estilos existentes */
.menu-item:hover {
  background-color: rgba(25, 118, 210, 0.1);
}
.sub-menu-item {
  padding-left: 32px !important;
}

/* Reducir márgenes de iconos en TODO el menú */
.v-list-item .v-list-item__prepend {
  margin-right: 6px !important;    /* Reduce margen derecho del icono */
  margin-left: -6px !important;    /* Reduce margen izquierdo del icono */
}

/* Aumentar tamaño del texto en TODO el menú */
.v-list-item {
  font-size: 1rem !important;      /* Tamaño ligeramente más grande */
}

/* Opcional: Ajustar específicamente los items del submenú */
.sub-menu-item {
  font-size: 1rem !important;    /* Tamaño consistente para submenú */
}

/* Ajustar iconos del menú principal también */
.v-list-group__header .v-list-item__prepend {
  margin-right: 3px !important;
  margin-left: -3px !important;
}
.v-list-item--nav {
  padding-inline: 4px;
}
</style>
