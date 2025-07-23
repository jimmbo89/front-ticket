<template>
  <v-card style="display: flex; flex-direction: column; height: 100%;">
        <template v-slot:prepend>
          <v-list-item class="text-subtitle-1" lines="two" variant="flat"
            :prepend-avatar="`${this.$axios.defaults.baseURL}images/${this.imageBranch}`" :title="this.title"
            :subtitle="this.subtitle"
            :style="{ backgroundColor: '#ECEFF1', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#000000' }"
            cover>
          </v-list-item>
        </template>
        <!--prepend-avatar=`${this.$axios.defaults.baseURL}images/${imageBusiness}`-->
        <v-divider></v-divider>

        <v-list density="compact" nav :opened="open" open-strategy="single">
          <v-list-item prepend-icon="mdi-view-dashboard-outline" title="Dashboard" to="home" value="home"
            class="list-item"></v-list-item>
          <v-list-group value="Admin" v-if="filteredMenuAdministracion.length !== 0">
            <template v-slot:activator="{ props }">
              <v-list-item v-bind="props" prepend-icon="mdi-cog-outline" title="Administración"></v-list-item>
            </template>

            <v-list-item v-for="item in filteredMenuAdministracion" style="padding-left: 20px !important;"
              :key="item.title" :prepend-icon="item.icon" :title="item.title" :to="item.to" :value="item.value">
              <!-- Filtrado directo usando v-if -->

            </v-list-item>

          </v-list-group>

          <v-list-group value="Seguridad" v-if="filteredMenuSecurity.length !== 0">
            <template v-slot:activator="{ props }">
              <v-list-item v-bind="props" prepend-icon="mdi-shield-account" title="Seguridad"></v-list-item>
            </template>

            <v-list-item v-for="item in filteredMenuSecurity" style="padding-left: 20px !important" :key="item.title"
              :prepend-icon="item.icon" :title="item.title" :to="item.to" :value="item.value"></v-list-item>
            <!-- Filtrado directo usando v-if -->
          </v-list-group>

          <v-list-group value="Reportes" v-if="filteredMenuReports.length !== 0">
            <template v-slot:activator="{ props }">
              <v-list-item v-bind="props" prepend-icon="mdi-file-chart" title="Reportes"></v-list-item>
            </template>

            <v-list-item v-for="item in filteredMenuReports" style="padding-left: 20px !important" :key="item.title"
              :prepend-icon="item.icon" :title="item.title" :to="item.to" :value="item.value"></v-list-item>
            <!-- Filtrado directo usando v-if -->
          </v-list-group>

          <v-list-group value="Mantenedores" v-if="filteredMenuMainteiners.length !== 0">
            <template v-slot:activator="{ props }">
              <v-list-item v-bind="props" prepend-icon="mdi-progress-wrench" title="Mantenedores"></v-list-item>
            </template>

            <v-list-item v-for="item in filteredMenuMainteiners" style="padding-left: 20px !important" :key="item.title"
              :prepend-icon="item.icon" :title="item.title" :to="item.to" :value="item.value"></v-list-item>
            <!-- Filtrado directo usando v-if -->
          </v-list-group>
        </v-list>

        <!-- Espaciador -->
        <v-spacer></v-spacer>
        <template v-slot:append>

          <!-- Opciones en la parte inferior 
          <v-list density="compact" nav>
            <v-list-item prepend-icon="mdi-cog-outline" title="Configuración" to="/settings" value="settings"
              class="list-item"></v-list-item>
          </v-list>-->
        </template>

      <v-main style="height: 94vh"></v-main>

  </v-card>
</template>

<script>
import LocalStorageService from "@/LocalStorageService";
export default {
  data: () => ({
    open: ["Admin"],
    /*mainteiners: [
      //['Categorías', 'mdi-text-box-outline', '/category'],
      //['Prioridades', 'mdi-star-circle-outline', '/priority'],
      ['Roles', 'mdi-account-cog-outline', '/role'],
      ['Permisos', 'mdi-shield-check', '/permission'],
    ],*/
    mainteiners: [
      { title: "Estructuras de asientos", icon: "mdi-bus-side", to: "structure", permission: "view_structures" },
      { title: "Promociones", icon: "mdi-tag-outline", to: "promotion", permission: "view_promotions" },
      { title: "Tipos de Pasajes", icon: "mdi-ticket-confirmation-outline", to: "ticket-type", permission: "view_tickettype" },
      { title: "Plantillas de Viajes", icon: "mdi-map-marker-path", to: "trip-template", permission: "view_triptemplates" },
    ],
    security: [
      { title: "Roles", icon: "mdi-account-cog-outline", to: "role", permission: "view_roles" },
      { title: "Permisos", icon: "mdi-shield-check", to: "permission", permission: "view_permissions" },
    ],
    administracion: [
      { icon: "mdi-office-building", title: "Negocio", to: "company", value: "company", permission: "view_business" },
      { icon: "mdi-store", title: "Sucursales", to: "branch", value: "branch", permission: "view_branches" },
      { icon: "mdi-account", title: "Trabajadores", to: "worker", value: "worker", permission: "view_workers" },
      { icon: "mdi-devices", title: "Dispositivos", to: "device", value: "devices", permission: "view_devices" },
      { icon: "mdi-bus", title: "Vehículos", to: "vehicle", value: "vehicle", permission: "view_vehicles" },
      { icon: "mdi-map-marker", title: "Lugares", to: "location", value: "location", permission: "view_locations" },
      { icon: "mdi-road-variant", title: "Rutas", to: "route", value: "route", permission: "view_routes" },
      { icon: "mdi-steering", title: "Viajes", to: "trip", value: "trip", permission: "view_trips" },
      { icon: "mdi-ticket", title: "Tickets", to: "ticket", value: "ticket", permission: "view_tickets" },
      { icon: "mdi-alert", title: "Incidentes", to: "incident", value: "incident", permission: "view_incidents" }
    ],
    reports: [
      { title: "Monto generado", icon: "mdi-finance", to: "ticketdate", permission: "view_ticketsdate" },
      { title: "Monto por viajes", icon: "mdi-map-marker-path", to: "tickettripdate", permission: "view_tickettripsdate" },
      { title: "Viajes por trabajador", icon: "mdi-bus-marker", to: "tripsworker", permission: "view_tripsworker" },
    ],
    title: '',
    imageBranch: '',
    subtitle: 'Negocio',
    role: '',
  }),
  computed: {
    permissions() {
    // Recuperar permisos de LocalStorage
    const permissions = LocalStorageService.getItem('permissions');
    console.log("Permisos recuperados de LocalStorage:", permissions); // Depuración
    // Convertir de JSON a array (si es necesario)
    try {
      return permissions ? JSON.parse(permissions) : [];
    } catch (error) {
      console.error("Error al parsear permisos:", error);
      return [];
    }
  },
  filteredMenuAdministracion() {
    return this.administracion.filter(item => 
      this.permissions.includes(item.permission) // Comparación exacta
    );
  },
  filteredMenuSecurity() {
    return this.security.filter(item => 
      this.permissions.includes(item.permission)
    );
  },
  filteredMenuMainteiners() {
    return this.mainteiners.filter(item => 
      this.permissions.includes(item.permission)
    );
  },
  filteredMenuReports() {
    return this.reports.filter(item => 
      this.permissions.includes(item.permission)
    );
  },
  },
  mounted() {
    /*this.name = JSON.parse(LocalStorageService.getItem('name'));
    this.user = JSON.parse(LocalStorageService.getItem('user'));
    this.user_id = JSON.parse(LocalStorageService.getItem('user_id'));
    this.rol_id = LocalStorageService.getItem('role_id');*/
    this.role = JSON.parse(LocalStorageService.getItem('role'));
   // this.permissions = LocalStorageService.getItem("permissions");
    ///console.log('this.permissions');
    //console.log(this.permissions);
    console.log(this.role);
    if (this.role === 'Administrador') {
      this.title = JSON.parse(LocalStorageService.getItem('nameBusiness'));
      this.imageBranch = LocalStorageService.getItem('imageBusiness').replace(/['"]+/g, '');
      this.subtitle = 'Negocio'
    } else {
      this.title = JSON.parse(LocalStorageService.getItem('nameBranch'));
      this.imageBranch = LocalStorageService.getItem('imageBranch').replace(/['"]+/g, '');
      this.subtitle = 'Sucursal'
    }
  },
}
</script>
<style>
.list-item {
  padding: 2px 4px !important;
  /* Reduce el padding vertical y horizontal */
}

.maintainer-item {
  padding-left: 16px !important;
  /* Indentación menor para subelementos */
}
</style>
