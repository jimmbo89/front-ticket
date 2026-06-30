<template>
  <v-card flat class="busgo-drawer">
    <!-- HEADER -->

    <v-list nav density="comfortable" class="drawer-menu">
      <!-- DASHBOARD -->
      <v-list-item
        prepend-icon="mdi-view-dashboard-outline"
        title="Dashboard"
        to="home"
        class="drawer-item"
      />

      <!-- OPERACIÓN -->
      <div class="drawer-section">Operación</div>

      <v-list-item
        v-if="
          hasPermission([
            'view_trips',
            'view_trips_company',
            'view_triptemplates_company',
            'view_triptemplates',
          ])
        "
        prepend-icon="mdi-bus"
        title="Viajes"
        to="trip-home"
        class="drawer-item"
      />

      <v-list-item
        v-if="hasPermission(['view_tickets', 'view_tickets_company'])"
        prepend-icon="mdi-ticket-confirmation-outline"
        title="Venta de Tickets"
        to="ticket"
        class="drawer-item"
      />

      <!-- CONFIGURACIÓN -->
      <div class="drawer-section">Configuración</div>

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
      <div class="drawer-section">Comercial</div>

      <v-list-item
        v-for="item in filteredMenuTickets"
        :key="item.title"
        :prepend-icon="item.icon"
        :title="item.title"
        :to="item.to"
        class="drawer-item"
      />

      <!-- SEGURIDAD -->
      <div class="drawer-section">Seguridad</div>

      <v-list-item
        v-for="item in filteredMenuSecurity"
        :key="item.title"
        :prepend-icon="item.icon"
        :title="item.title"
        :to="item.to"
        class="drawer-item"
      />

      <!-- REPORTES -->
      <div class="drawer-section">Reportes</div>

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
.busgo-drawer {
  height: 100%;
  background: #ffffff;
  border-right: 1px solid #eef2f7;
  color: #334155;
  overflow-y: auto;
}

/* HEADER */
.drawer-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 22px 20px 18px;
}

.drawer-avatar {
  border: 1px solid #e5e7eb;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08);
}

.drawer-title {
  font-size: 14px;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.1;
}

.drawer-subtitle {
  font-size: 12px;
  font-weight: 600;
  color: #94a3b8;
  margin-top: 3px;
}

/* MENU */
.drawer-menu {
  padding: 6px 14px 24px;
}

/* SECCIONES */
.drawer-section {
  margin: 8px 0 10px;
  padding-left: 8px;
  font-size: 11px;
  font-weight: 900;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

/* ITEMS */
.drawer-item {
  min-height: 30px;
  margin-bottom: 4px;
  padding-inline: 12px !important;
  border-radius: 10px;
  color: #4b5563;
  font-size: 14px;
  font-weight: 700;
  transition: all 0.18s ease;
}

.drawer-item :deep(.v-list-item-title) {
  font-size: 14px;
  font-weight: 700;
  color: #4b5563;
}

.drawer-item :deep(.v-icon) {
  color: #6b7280;
  font-size: 21px;
}

.drawer-item:hover {
  background: #f5f7fb;
  color: #2563eb;
}

.drawer-item:hover :deep(.v-list-item-title),
.drawer-item:hover :deep(.v-icon) {
  color: #2563eb;
}

/* ACTIVO */
.drawer-item.router-link-active,
.drawer-item.v-list-item--active {
  background: #eef5ff;
  color: #2563eb;
}

.drawer-item.router-link-active :deep(.v-list-item-title),
.drawer-item.router-link-active :deep(.v-icon),
.drawer-item.v-list-item--active :deep(.v-list-item-title),
.drawer-item.v-list-item--active :deep(.v-icon) {
  color: #2563eb;
  font-weight: 800;
}

/* QUITAR COLOR DEFAULT VUETIFY */
.drawer-item :deep(.v-list-item__overlay) {
  display: none;
}

.drawer-item {
  min-height: 30px !important;
  padding-inline: 8px !important;
}

.drawer-item :deep(.v-list-item__prepend) {
  margin-inline-end: -20px !important;
}

.drawer-item :deep(.v-list-item-title) {
  font-size: 13px;
  font-weight: 600;
}
</style>
