// Composables
import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    component: () => import("@/views/Login.vue"),
  },
  {
    path: "/login",
    name: "Login",
    component: () => import(/* webpackChunkName: "home" */ "@/views/Login.vue"),
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: () =>
      import(/* webpackChunkName: "home" */ "@/views/DashboardView.vue"),
    children: [
      {
        path: "/home",
        name: "Home",
        component: () =>
          import(/* webpackChunkName: "home" */ "@/views/Home.vue"),
      },
      {
        path: "/company",
        name: "Negocio",
        component: () =>
          import(/* webpackChunkName: "home" */ "@/views/company/Company.vue"),
      },
      {
        path: "/branch",
        name: "Branch",
        component: () =>
          import(/* webpackChunkName: "home" */ "@/views/branch/Branch.vue"),
      },
      {
        path: "/worker",
        name: "Worker",
        component: () =>
          import(/* webpackChunkName: "home" */ "@/views/worker/Worker.vue"),
      },
      {
        path: "/role",
        name: "Role",
        component: () =>
          import(/* webpackChunkName: "home" */ "@/views/role/Role.vue"),
      },
      {
        path: "/vehicle",
        name: "Vehicle",
        component: () =>
          import(/* webpackChunkName: "home" */ "@/views/vehicle/Vehicle.vue"),
      },
      {
        path: "/structure-vehicle",
        name: "StructureVehicle",
        component: () =>
          import(
            /* webpackChunkName: "home" */ "@/views/vehicle/StructureVehicle.vue"
          ),
      },
      {
        path: "/location",
        name: "Location",
        component: () =>
          import(
            /* webpackChunkName: "home" */ "@/views/location/Location.vue"
          ),
      },
      {
        path: "/device",
        name: "Device",
        component: () =>
          import(/* webpackChunkName: "home" */ "@/views/device/Device.vue"),
      },
      {
        path: "/route",
        name: "Route",
        component: () =>
          import(/* webpackChunkName: "home" */ "@/views/route/Route.vue"),
      },
      {
        path: "/location-route",
        name: "LocatioRoute",
        component: () =>
          import(/* webpackChunkName: "home" */ "@/views/route/LocationRoute.vue"),
      },
      {
        path: "/trip",
        name: "Trip",
        component: () =>
          import(/* webpackChunkName: "home" */ "@/views/trip/Trip.vue"),
      },
      {
        path: "/trip-home",
        name: "Trip Home",
        component: () =>
          import(/* webpackChunkName: "home" */ "@/views/trip/TripHome.vue"),
      },
      {
        path: "/ticket",
        name: "Ticket",
        component: () =>
          import(/* webpackChunkName: "home" */ "@/views/ticket/Tickect.vue"),
      },
      {
        path: "/permission",
        name: "Permission",
        component: () =>
          import(
            /* webpackChunkName: "home" */ "@/views/permission/Permission.vue"
          ),
      },
      {
        path: "/structure",
        name: "Structure",
        component: () =>
          import(
            /* webpackChunkName: "home" */ "@/views/structure/Structure.vue"
          ),
      },
      {
        path: "/ticketdate",
        name: "TicketsDate",
        component: () =>
          import(
            /* webpackChunkName: "home" */ "@/views/reportes/TicketDate.vue"
          ),
      },
      {
        path: "/tickettripdate",
        name: "TicketsTripsDate",
        component: () =>
          import(
            /* webpackChunkName: "home" */ "@/views/reportes/TripPeriodo.vue"
          ),
      },
      {
        path: "/tripsworker",
        name: "TripsWorker",
        component: () =>
          import(
            /* webpackChunkName: "home" */ "@/views/reportes/TripsWorkers.vue"
          ),
      },
      {
        path: "/ticket-passenger-type-report",
        name: "TicketPassengerTypeReport",
        component: () =>
          import(
            /* webpackChunkName: "home" */ "@/views/reportes/TicketPassengerTypeReport.vue"
          ),
      },
      {
        path: "/promotion",
        name: "Promotion",
        component: () =>
          import(
            /* webpackChunkName: "home" */ "@/views/promotion/Promotion.vue"
          ),
      },
      {
        path: "/incident",
        name: "Incident",
        component: () =>
          import(
            /* webpackChunkName: "home" */ "@/views/incident/Incident.vue"
          ),
      },
      {
        path: "/ticket-type",
        name: "Tipo Pasaje",
        component: () =>
          import(
            /* webpackChunkName: "home" */ "@/views/tickettype/TicketType.vue"
          ),
      },
      {
        path: "/trip-template",
        name: "TripTemplates",
        component: () =>
          import(
            /* webpackChunkName: "home" */ "@/views/triptemplate/TripTemplate.vue"
          ),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
