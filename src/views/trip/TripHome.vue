<template>
    <v-card class="d-flex align-center pa-3" elevation="0" style="background-color: #f9f9f9">
        <!-- Icono -->
        <v-avatar :color="paleteColors.primary" class="icono-concavo">
            <v-icon cover>mdi-steering</v-icon>
        </v-avatar>

        <!-- Texto -->
        <div class="ml-4">
            <div class="text-h6 font-weight-medium">Viajes y Plantillas de Viaje</div>
            <div class="text-body-2 text-grey">Gestionar Viajes y Plantillas de Viaje</div>
        </div>
    </v-card>
    <v-card flat>
        <v-card-text>
         

            <!-- Contenido de las pestañas: ahora controlado manualmente -->
            <div class="pa-0 flex-grow-1">
              
                        <trip />
                   
            </div>
        </v-card-text>
    </v-card>
</template>

<script>
import { paleteColors } from "@/assets/colors";
import LocalStorageService from "@/LocalStorageService";
import { handleRequest } from "@/utils/api"; // Ruta al archivo
import Trip from "./Trip.vue";
import TripTemplate from "../triptemplate/TripTemplate.vue";
export default {
    components: {
        Trip,
        TripTemplate
    },
  data: () => ({
    tabs: 1,
    paleteColors: paleteColors,
  }),
};
</script>
