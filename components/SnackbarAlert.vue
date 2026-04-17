<!-- src/components/Snackbar.vue -->
<template>
  <v-snackbar
    v-model="snackbar.show"
    :timeout="snackbar.timeout"
    :color="snackbar.type"
    location="top right"
    class="mt-12"
    elevation="24"
    max-width="35%"
    rounded="lg"
    :style="{ padding: '16px' }"
  >
    <!-- Contenido principal con v-row -->
    <v-row class="align-center" no-gutters>
      <!-- Ícono -->
      <v-col cols="auto" class="pr-3">
        <v-avatar
          :icon="snackbar.icon"
          :color="snackbar.type"
          size="40"
          rounded="lg"
        ></v-avatar>
      </v-col>

      <!-- Título + Mensaje -->
      <v-col class="py-0">
        <h4 class="text-subtitle-1 font-weight-bold mb-1">{{ snackbar.title }}</h4>
        <p class="text-body-2 mb-0">{{ snackbar.message }}</p>
      </v-col>

      <!-- Botón de cerrar (siempre visible) -->
      <v-col cols="auto" class="pl-2">
        <v-btn
          icon
          size="small"
          variant="text"
          @click="snackbar.close()"
          color="white"
        >
          <v-icon size="20">mdi-close</v-icon>
        </v-btn>
      </v-col>
    </v-row>
       <!-- Enlace "Ver más" (si existe) -->
    <div v-if="snackbar.linkRoute" class="d-flex justify-end mt-1">
      <v-btn
         @click="handleLinkClick"
        color="white"
        variant="text"
        size="small"
        prepend-icon="mdi-eye"
      >
        {{ snackbar.linkText }}
      </v-btn>
    </div>
    <!-- Botón de acción (si existe) -->
    <div v-if="snackbar.actionText" class="d-flex justify-end mt-1">
      <v-btn
        :color="snackbar.type === 'warning' ? 'warning' : 'white'"
        variant="flat"
        size="small"
        @click="snackbar.handleAction"
        class="mr-2"
      >
        {{ snackbar.actionText }}
      </v-btn>
    </div>
  </v-snackbar>
</template>

<script setup>
import { useSnackbarStore } from '@/stores/snackbar'
import { useRouter } from 'vue-router'

const snackbar = useSnackbarStore()
const router = useRouter() // ✅ Inyectar router
const handleLinkClick = () => {
  if (snackbar.linkRoute) {
    // Soporta string u objeto de ruta
    router.push(snackbar.linkRoute)
    snackbar.close() // Opcional: cerrar al hacer clic
  }
}
</script>

<style scoped>
.text-body-2 {
  word-break: break-word;
  white-space: normal;
}

/* Asegurar que el snackbar no tenga padding extra */
.v-snackbar__wrapper {
  padding: 0 !important;
}

.v-snackbar__content {
  padding: 16px !important;
}
</style>