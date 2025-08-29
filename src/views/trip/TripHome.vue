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
            <v-tabs v-model="tabs" color="primary" grow class="text-subtitle-1">
                <v-tab :value="1">
                    <v-icon icon="mdi-steering"></v-icon>Viajes
                </v-tab>
                <v-tab :value="2">
                    <v-icon icon="mdi-map-marker-path"></v-icon>Plantillas de Viaje
                </v-tab>
            </v-tabs>

            <!-- Contenido de las pestañas: ahora controlado manualmente -->
            <div class="pa-0 flex-grow-1">
                <v-window v-model="tabs">
                    <v-window-item :value="1">
                        <trip />
                    </v-window-item>

                    <v-window-item :value="2">
                        <tripTemplate />
                    </v-window-item>
                </v-window>
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
