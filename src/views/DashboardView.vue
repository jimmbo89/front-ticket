<template>
  <v-app class="fill-height">
    <v-layout class="rounded rounded-md" style="height: 100vh; display: flex; flex-direction: row; max-width: 100%; overflow-x: hidden;">
      <!-- Barra de navegación superior -->
      <AppBarView app style="flex-shrink: 0;" @toggle-drawer="drawer = !drawer" 
      :drawer-visible="drawer"></AppBarView>
      <v-navigation-drawer class="pt-4 my-1" color="white"
      v-model="drawer"
      :permanent="$vuetify.display.mdAndUp"
      :temporary="!$vuetify.display.mdAndUp"
    >
      <!-- Contenido de tu menú -->
      <NavigationDrawerView />
    </v-navigation-drawer>

      <v-main class="mt-1" style="max-width: 100vw; overflow-x: hidden;">
          <router-view />
      </v-main>

      <!-- Pie de página -->
      <v-footer app>
        <!-- Contenido del footer -->
      </v-footer>
    </v-layout>
  </v-app>
</template>

<script>
import NavigationDrawerView from './NavigationDrawerView.vue';
import AppBarView from '@/layouts/default/AppBar.vue';

export default {
  components: {
    NavigationDrawerView,
    AppBarView,
  },
  data() {
    return {
      drawer: null
    }
  },
  mounted() {
    this.drawer = this.$vuetify.display.mdAndUp
  },
  watch: {
    '$vuetify.display.mdAndUp'(newVal) {
      this.drawer = newVal
    }
  }
};
</script>

<style scoped>
.fill-height {
  min-height: 100vh;
}
</style>
