<template>
  <v-card flat class="busgo-drawer">
   

    <div class="brand-divider" />

    <!-- MENÚ -->
    <v-list nav class="drawer-menu">
      

      <v-list-item
        prepend-icon="mdi-view-dashboard-outline"
        title="Dashboard"
        to="home"
        class="drawer-item"
      />

      <!-- OPERACIÓN -->
      <div class="drawer-section">
        Operación
      </div>

      <v-list-item
        v-if="
          hasPermission([
            'view_trips',
            'view_trips_company',
            'view_triptemplates_company',
            'view_triptemplates',
          ])
        "
        prepend-icon="mdi-bus-clock"
        title="Viajes"
        to="trip"
        class="drawer-item"
      />

      <v-list-item
        v-if="hasPermission(['view_tickets', 'view_tickets_company'])"
        prepend-icon="mdi-ticket-confirmation-outline"
        title="Ventas"
        to="sales"
        class="drawer-item"
      />

      <v-list-item
        v-if="hasPermission(['view_tickets', 'view_tickets_company'])"
        prepend-icon="mdi-calendar-sync-outline"
        title="Plantillas de viaje"
        to="trip-template"
        class="drawer-item"
      />

      <!-- CONFIGURACIÓN -->
      <div
        v-if="
          hasPermission('view_business') ||
          filteredMenuConfiguration.length
        "
        class="drawer-section"
      >
        Configuración
      </div>

      <v-list-item
        v-if="hasPermission('view_business')"
        prepend-icon="mdi-office-building-outline"
        title="Empresa"
        to="company"
        class="drawer-item"
      />

      <v-list-item
        v-for="item in filteredMenuConfiguration"
        :key="item.title"
        :prepend-icon="item.icon"
        :title="item.title"
        :to="item.to"
        class="drawer-item"
      />

      <!-- COMERCIAL -->
      <div
        v-if="filteredMenuTickets.length"
        class="drawer-section"
      >
        Comercial
      </div>

      <v-list-item
        v-for="item in filteredMenuTickets"
        :key="item.title"
        :prepend-icon="item.icon"
        :title="item.title"
        :to="item.to"
        class="drawer-item"
      />

      <!-- SEGURIDAD -->
      <div
        v-if="filteredMenuSecurity.length"
        class="drawer-section"
      >
        Seguridad
      </div>

      <v-list-item
        v-for="item in filteredMenuSecurity"
        :key="item.title"
        :prepend-icon="item.icon"
        :title="item.title"
        :to="item.to"
        class="drawer-item"
      />

      <!-- REPORTES -->
      <div
        v-if="filteredMenuReports.length"
        class="drawer-section"
      >
        Reportes
      </div>

      <v-list-item
        v-for="item in filteredMenuReports"
        :key="item.title"
        :prepend-icon="item.icon"
        :title="item.title"
        :to="item.to"
        class="drawer-item"
      />
    </v-list>

   
  </v-card>
</template>

<script>
import LocalStorageService from "@/LocalStorageService";

export default {
  data: () => ({
    title: "",
    subtitle: "Empresa",
    imageBranch: "",
    role: "",

    configuration: [
      {
        icon: "mdi-store-outline",
        title: "Sucursales",
        to: "branch",
        permission: "view_branches",
      },
      {
        icon: "mdi-account-group-outline",
        title: "Trabajadores",
        to: "worker",
        permission: "view_workers",
      },
      {
        icon: "mdi-bus-side",
        title: "Vehículos",
        to: "vehicle",
        permission: "view_vehicles",
      },
      {
        icon: "mdi-seat-passenger",
        title: "Estructuras de Asientos",
        to: "structure",
        permission: "view_structures",
      },
      {
        icon: "mdi-map-marker-outline",
        title: "Ubicaciones",
        to: "location",
        permission: "view_locations",
      },
      { icon: "mdi-map-marker-path", title: "Rutas", to: "route", permission: "view_routes" },
      {
        icon: "mdi-devices",
        title: "Dispositivos",
        to: "device",
        permission: "view_devices",
      },
    ],

    tickets: [
      {
        title: "Tipos de pasajeros",
        icon: "mdi-account-group-outline",
        to: "ticket-type",
        permission: "view_tickettype",
      },
      {
        title: "Tarifas",
        icon: "mdi-tag-outline",
        to: "promotion",
        permission: "view_promotions",
      },
    ],

    security: [
      {
        title: "Roles",
        icon: "mdi-account-cog-outline",
        to: "role",
        permission: "view_roles",
      },
      {
        title: "Permisos",
        icon: "mdi-shield-check-outline",
        to: "permission",
        permission: "view_permissions",
      },
    ],

    reports: [
      {
        title: "Reporte de Ventas",
        icon: "mdi-ticket-confirmation-outline",
        to: "ticket",
        permission: ["view_tickets", "view_tickets_company"],
      },
      {
        title: "Recaudación",
        icon: "mdi-cash-multiple",
        to: "ticketdate",
        permission: ["view_ticketsdate", "view_ticketsdate_company"],
      },
      {
        title: "Recaudación por Trabajador",
        icon: "mdi-account-cash-outline",
        to: "tripsworker",
        permission: ["view_tripsworker", "view_tripsworker_company"],
      },
      {
        title: "Recaudación por Tipo de Pasaje",
        icon: "mdi-ticket-percent-outline",
        to: "ticket-passenger-type-report",
        permission: "report_ticket_passenger_type",
      },
      {
        title: "Incidentes",
        icon: "mdi-alert-outline",
        to: "incident",
        permission: ["view_incidents", "view_incidents_company"],
      },

     
    ],
  }),

  computed: {
    permissions() {
      const permissions = LocalStorageService.getItem("permissions");
      try {
        return permissions ? JSON.parse(permissions) : [];
      } catch {
        return [];
      }
    },

    filteredMenuConfiguration() {
      return this.configuration.filter((item) => this.hasPermission(item.permission));
    },

    filteredMenuTickets() {
      return this.tickets.filter((item) => this.hasPermission(item.permission));
    },

    filteredMenuSecurity() {
      return this.security.filter((item) => this.hasPermission(item.permission));
    },

    filteredMenuReports() {
      return this.reports.filter((item) => this.hasPermission(item.permission));
    },
  },

  mounted() {
    this.role = JSON.parse(LocalStorageService.getItem("role"));
    if (this.role === "Administrador") {
      this.title = JSON.parse(LocalStorageService.getItem("nameBusiness"));
      this.imageBranch = LocalStorageService.getItem("imageBusiness").replace(
        /['"]+/g,
        ""
      );
      this.subtitle = "Empresa";
    } else {
      this.title = JSON.parse(LocalStorageService.getItem("nameBranch"));
      this.imageBranch = LocalStorageService.getItem("imageBranch").replace(/['"]+/g, "");
      this.subtitle = "Sucursal";
    }
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
  },
};
</script>
<style scoped>
/* ========================================
   VARIABLES Y CONTENEDOR PRINCIPAL
======================================== */

.busgo-drawer {
  --busgo-blue: #2454d6;
  --busgo-blue-light: #3266e4;
  --busgo-blue-dark: #132d6b;
  --busgo-blue-deep: #0e1f46;
  --busgo-cyan: #35b8e8;

  --drawer-text: #1e293b;
  --drawer-muted: #334155;
  --drawer-section: #64748b;
  --drawer-icon: #334155;
  --drawer-border: #e8edf5;
  --drawer-hover: #f2f5fb;

  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;

  color: var(--drawer-text);
  background: #ffffff;
  border-right: 1px solid var(--drawer-border);
}

/* ========================================
   CABECERA
======================================== */

.drawer-brand {
  position: relative;
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 10px;
  min-height: 60px;
  padding: 9px 12px;
  overflow: hidden;

  color: #ffffff;
  background:
    radial-gradient(
      circle at 90% 10%,
      rgba(53, 184, 232, 0.24),
      transparent 85px
    ),
    linear-gradient(
      135deg,
      var(--busgo-blue-deep),
      var(--busgo-blue-dark)
    );
}

.drawer-brand::after {
  position: absolute;
  right: -32px;
  bottom: -48px;
  width: 110px;
  height: 110px;

  content: "";
  pointer-events: none;
  border: 17px solid rgba(255, 255, 255, 0.04);
  border-radius: 50%;
}

/* Logo o imagen de empresa */

.brand-avatar {
  position: relative;
  z-index: 1;
  display: grid;
  flex: 0 0 36px;
  width: 36px;
  height: 36px;
  place-items: center;
  overflow: hidden;

  color: #ffffff;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.24);
  border-radius: 10px;
  box-shadow: none;
  backdrop-filter: blur(8px);
}

.brand-avatar :deep(.v-icon) {
  color: #ffffff !important;
  opacity: 1 !important;
}

.brand-image {
  width: 100%;
  height: 100%;
}

/* Información de empresa */

.brand-information {
  position: relative;
  z-index: 1;
  flex: 1;
  min-width: 0;
}

.brand-context {
  margin-bottom: 2px;
  color: rgba(255, 255, 255, 0.72);
  font-size: 8px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.brand-title {
  overflow: hidden;
  color: #ffffff;
  font-size: 13px;
  font-weight: 800;
  line-height: 1.25;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Botón de cambio de empresa */

.brand-action {
  position: relative;
  z-index: 1;
  flex: 0 0 auto;
  color: rgba(255, 255, 255, 0.82) !important;
  opacity: 1 !important;
}

.brand-action :deep(.v-icon) {
  color: inherit !important;
  opacity: 1 !important;
}

.brand-action:hover {
  color: #ffffff !important;
  background: rgba(255, 255, 255, 0.1);
}

/* La cabecera ya separa el menú */

.brand-divider {
  display: none;
}

/* ========================================
   CONTENEDOR DEL MENÚ
======================================== */

.drawer-menu {
  flex: 1 1 auto;
  min-height: 0;
  margin: 0;
  padding: 5px 8px 12px;
  overflow-x: hidden;
  overflow-y: auto;

  color: var(--drawer-text);
  overscroll-behavior: contain;
  scrollbar-color: #cbd5e1 transparent;
  scrollbar-width: thin;
}

.drawer-menu::-webkit-scrollbar {
  width: 4px;
}

.drawer-menu::-webkit-scrollbar-track {
  background: transparent;
}

.drawer-menu::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 20px;
}

.drawer-menu::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* ========================================
   SECCIONES
======================================== */

.drawer-section {
  position: relative;
  min-height: 10px;
  margin: 10px 8px 3px;
  padding-left: 8px;

  color: var(--drawer-section);
  font-size: 8px;
  font-weight: 900;
  line-height: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.drawer-section::before {
  position: absolute;
  top: 50%;
  left: 0;
  width: 2px;
  height: 9px;

  content: "";
  background: var(--busgo-cyan);
  border-radius: 5px;
  transform: translateY(-50%);
}

.drawer-section--first {
  margin-top: 4px;
}

/* ========================================
   ÍTEMS DEL MENÚ
======================================== */

.drawer-item {
  position: relative;
  height: auto !important;
  min-height: 32px !important;
  margin: 0;
  padding: 2px 8px !important;
  overflow: hidden;

  color: var(--drawer-muted) !important;
  border: none;
  border-radius: 8px !important;
  box-shadow: none;

  transition:
    color 150ms ease,
    background-color 150ms ease,
    transform 150ms ease,
    box-shadow 150ms ease;
}

/* Elimina el indicador anterior */

.drawer-item::before {
  display: none;
}

/* Elimina el overlay automático de Vuetify */

.drawer-item :deep(.v-list-item__overlay) {
  display: none;
}

/* Contenido interno */

.drawer-item :deep(.v-list-item__content) {
  align-self: center;
  padding: 0;
  color: inherit !important;
  opacity: 1 !important;
}

/* Contenedor del icono */

.drawer-item :deep(.v-list-item__prepend) {
  align-self: center;
  margin-right: 7px;
  color: inherit !important;
  opacity: 1 !important;
}

/* Vuetify agrega este espacio automáticamente */

.drawer-item :deep(.v-list-item__spacer) {
  width: 0 !important;
}

/* Iconos */

.drawer-item :deep(.v-list-item__prepend > .v-icon) {
  display: grid;
  flex: 0 0 23px;
  width: 23px;
  height: 23px;
  margin: 0 !important;
  place-items: center;

  color: var(--drawer-icon) !important;
  font-size: 16.5px;
  opacity: 1 !important;
  background: transparent;
  border-radius: 6px;
  box-shadow: none;

  transition:
    color 150ms ease,
    background-color 150ms ease,
    transform 150ms ease;
}

/* Texto */

.drawer-item :deep(.v-list-item-title) {
  overflow: visible;
  color: inherit !important;
  font-size: 12px;
  font-weight: 650;
  line-height: 1.15;
  letter-spacing: -0.01em;
  text-overflow: initial;
  white-space: normal;
  opacity: 1 !important;
}

/* ========================================
   HOVER
======================================== */

.drawer-item:hover {
  color: var(--busgo-blue) !important;
  background: var(--drawer-hover);
  transform: translateX(1px);
}

.drawer-item:hover :deep(.v-list-item-title) {
  color: var(--busgo-blue) !important;
}

.drawer-item:hover :deep(.v-list-item__prepend > .v-icon) {
  color: var(--busgo-blue) !important;
  transform: translateX(1px);
}

/* ========================================
   ÍTEM ACTIVO
======================================== */

.drawer-item.router-link-active,
.drawer-item.router-link-exact-active,
.drawer-item.v-list-item--active {
  color: #ffffff !important;
  background:
    radial-gradient(
      circle at 100% 0,
      rgba(53, 184, 232, 0.3),
      transparent 75px
    ),
    linear-gradient(
      100deg,
      var(--busgo-blue),
      var(--busgo-blue-light)
    );

  box-shadow: 0 3px 8px rgba(36, 84, 214, 0.18);
}

.drawer-item.router-link-active :deep(.v-list-item-title),
.drawer-item.router-link-exact-active :deep(.v-list-item-title),
.drawer-item.v-list-item--active :deep(.v-list-item-title) {
  color: #ffffff !important;
  font-weight: 800;
  opacity: 1 !important;
}

.drawer-item.router-link-active
  :deep(.v-list-item__prepend > .v-icon),
.drawer-item.router-link-exact-active
  :deep(.v-list-item__prepend > .v-icon),
.drawer-item.v-list-item--active
  :deep(.v-list-item__prepend > .v-icon) {
  color: #ffffff !important;
  opacity: 1 !important;
  background: rgba(255, 255, 255, 0.15);
  box-shadow: none;
}

/* Corrige la opacidad que Vuetify aplica al elemento activo */

.drawer-item.v-list-item--active
  :deep(.v-list-item__prepend),
.drawer-item.v-list-item--active
  :deep(.v-list-item__content) {
  color: #ffffff !important;
  opacity: 1 !important;
}

/* ========================================
   PIE Y ESTADO DEL SISTEMA
======================================== */

.drawer-footer {
  flex: 0 0 auto;
  padding: 5px 8px 7px;
  background: rgba(255, 255, 255, 0.97);
  border-top: 1px solid var(--drawer-border);
}

.system-status {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 34px;
  padding: 4px 9px;

  background: #f8fafc;
  border: 1px solid #edf1f5;
  border-radius: 8px;
}

.status-dot {
  flex: 0 0 7px;
  width: 7px;
  height: 7px;

  background: #20a66a;
  border: 1px solid #d7f5e7;
  border-radius: 50%;
  box-shadow: 0 0 0 3px rgba(32, 166, 106, 0.1);
}

.status-title {
  color: #334155;
  font-size: 9.5px;
  font-weight: 800;
  line-height: 1.15;
}

.status-description {
  margin-top: 0;
  color: #64748b;
  font-size: 8.5px;
  font-weight: 600;
  line-height: 1.15;
}

/* ========================================
   NOTEBOOKS Y PANTALLAS MEDIANAS
======================================== */

@media (max-height: 850px) {
  .drawer-footer {
    display: none;
  }
}

/* ========================================
   PANTALLAS DE POCA ALTURA
======================================== */

@media (max-height: 720px) {
  .drawer-brand {
    min-height: 54px;
    padding-block: 7px;
  }

  .brand-avatar {
    flex-basis: 34px;
    width: 34px;
    height: 34px;
  }

  .drawer-menu {
    padding-top: 3px;
    padding-bottom: 8px;
  }

  .drawer-section {
    margin-top: 7px;
    margin-bottom: 2px;
  }

  .drawer-section--first {
    margin-top: 3px;
  }

  .drawer-item {
    min-height: 30px !important;
    padding-block: 1px !important;
  }

  .drawer-item :deep(.v-list-item__prepend) {
    margin-right: 6px;
  }

  .drawer-item :deep(.v-list-item__prepend > .v-icon) {
    flex-basis: 21px;
    width: 21px;
    height: 21px;
    font-size: 15.5px;
  }

  .drawer-item :deep(.v-list-item-title) {
    font-size: 11.5px;
  }
}

/* ========================================
   MÓVIL
======================================== */

@media (max-width: 600px) {
  .drawer-brand {
    min-height: 58px;
  }

  .drawer-item {
    min-height: 36px !important;
  }

  .drawer-item :deep(.v-list-item-title) {
    font-size: 12.5px;
  }
}

/* Móvil con poca altura */

@media (max-width: 600px) and (max-height: 720px) {
  .drawer-brand {
    min-height: 54px;
  }

  .drawer-item {
    min-height: 32px !important;
  }

  .drawer-item :deep(.v-list-item-title) {
    font-size: 12px;
  }
}
</style>
