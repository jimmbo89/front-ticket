<template>
  <v-snackbar
    v-model="snackbar"
    location="right top"
    :timeout="sb_timeout"
    :color="sb_type"
    elevation="10"
    class="busgo-snackbar"
  >
    <div class="d-flex align-center ga-3">
      <v-icon :icon="sb_icon" />
      <div>
        <div class="font-weight-bold">{{ sb_title }}</div>
        <div class="text-caption">{{ sb_message }}</div>
      </div>
    </div>
  </v-snackbar>

  <v-app-bar class="busgo-appbar" elevation="1">

    <!-- MENU MOBILE -->
    <v-app-bar-nav-icon
      v-if="!$vuetify.display.mdAndUp"
      @click.stop="$emit('toggle-drawer')"
    />

    <!-- BRAND -->
    <v-app-bar-title class="busgo-brand">
      <span class="brand-bus">Bus</span>
      <span class="brand-go">Go</span>
    </v-app-bar-title>

    <v-spacer />

    <!-- USER MENU -->
    <v-menu
      :max-width="mobile ? 280 : 320"
      location="bottom end"
      :transition="mobile ? 'slide-y-transition' : 'scale-transition'"
    >

      <template v-slot:activator="{ props: menuProps }">

        <!-- MOBILE -->
        <div
          v-if="mobile"
          v-bind="menuProps"
          class="user-chip-mobile"
        >
          <v-avatar size="36">
            <v-img :src="`${this.$axios.defaults.baseURL}images/${imageUrl}`" />
          </v-avatar>

          <v-btn icon="mdi-dots-vertical" variant="text" />
        </div>

        <!-- DESKTOP -->
        <div
          v-else
          v-bind="menuProps"
          class="user-chip"
        >
          <v-avatar size="36">
            <v-img :src="`${this.$axios.defaults.baseURL}images/${imageUrl}`" />
          </v-avatar>

          <div class="user-info">
            <div class="user-name">{{ name }}</div>
            <div class="user-role">{{ role }}</div>
          </div>

          <v-icon size="18">mdi-chevron-down</v-icon>
        </div>

      </template>

      <!-- MENU -->
      <v-list density="compact" class="user-menu">

        <v-list-item
          v-for="(item, i) in items"
          :key="i"
          @click="handleItemClick(item)"
          class="menu-item"
        >
          <template v-slot:prepend>
            <v-icon :icon="item.icon" />
          </template>

          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item>

      </v-list>
    </v-menu>

  </v-app-bar>

  <!-- DIALOG PASSWORD (sin cambios de lógica) -->
  <v-dialog v-model="dialogChangePass" max-width="420px">
    <v-card class="password-dialog">

      <v-toolbar color="#0f172a">
        <span class="text-subtitle-2 ml-4">Actualizar contraseña</span>
      </v-toolbar>

      <v-card-text>
        <v-text-field
          v-model="editedItem.currentPassword"
          type="password"
          label="Contraseña actual"
          variant="outlined"
        />

        <v-text-field
          v-model="editedItem.newPassword"
          type="password"
          label="Nueva contraseña"
          variant="outlined"
          :rules="[passwordRule]"
        />

        <v-text-field
          v-model="editedItem.newPassword1"
          type="password"
          label="Repetir contraseña"
          variant="outlined"
        />

        <v-alert
          v-if="editedItem.newPassword !== editedItem.newPassword1 && editedItem.newPassword1 !== ''"
          type="error"
          variant="tonal"
        >
          Las contraseñas no coinciden
        </v-alert>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="close">Cancelar</v-btn>
        <v-btn
          color="primary"
          :loading="loading"
          :disabled="editedItem.newPassword !== editedItem.newPassword1 || editedItem.newPassword === ''"
          @click="save"
        >
          Guardar
        </v-btn>
      </v-card-actions>

    </v-card>
  </v-dialog>

</template>

<script>
import LocalStorageService from "@/LocalStorageService";
import { handleRequest } from "@/utils/api"; // Ruta al archivo
import { useDisplay } from 'vuetify';
export default {
  inheritAttrs: false,
  emits: ['toggle-drawer'],
  props: {
    drawerVisible: Boolean
  },
  data: () => ({
    visible: false,
    visible1: false,
    visible2: false,
    snackbar: false,
    loading: false,
    sb_type: '',
    sb_message: '',
    sb_timeout: 2000,
    sb_title: '',
    sb_icon: '',
    user: '',
    dialogChangePass: false,
    user_id: '',
    email: '',
    name: '',
    imageUrl: null,
    rol_id: '',
    role: '',
    data: {},
    editedItem: {
      currentPassword: '',
      newPassword: '',
      newPassword1: '',
    },
    defaultItem: {
      currentPassword: '',
      newPassword: '',
      newPassword1: ''
    },
    items: [
      //{ title: 'Mi Perfil', icon: "mdi-account-tie-outline" },
      { title: 'Cambiar Contraseña', icon: "mdi-form-textbox-password" },
      { title: 'Cerrar Sesión', icon: "mdi-exit-to-app" },

    ],
    passwordRule: (value) => value && value.length >= 5 || 'La contraseña debe tener al menos 5 caracteres',
  }),
  setup() {
    const { mobile } = useDisplay()
    return { mobile }
  },
  mounted() {
    this.name = JSON.parse(LocalStorageService.getItem('name'));
    this.user = JSON.parse(LocalStorageService.getItem('user'));
    this.user_id = JSON.parse(LocalStorageService.getItem('user_id'));
    this.rol_id = LocalStorageService.getItem('role_id');
    this.role = JSON.parse(LocalStorageService.getItem('role'));
    this.imageUrl = LocalStorageService.getItem('image').replace(/['"]+/g, '');
    this.$router.push({ path: 'home' });
  },
  methods: {
    showAlert(sb_type, sb_message, sb_timeout) {
      this.sb_type = sb_type

      if (sb_type == "success") {
        this.sb_title = 'Éxito'
        this.sb_icon = 'mdi-check-circle'
      }

      if (sb_type == "error") {
        this.sb_title = 'Error'
        this.sb_icon = 'mdi-check-circle'
      }

      if (sb_type == "warning") {
        this.sb_title = 'Advertencia'
        this.sb_icon = 'mdi-alert-circle'
      }
      this.sb_message = sb_message
      this.sb_timeout = sb_timeout
      this.snackbar = true
    },
    async handleItemClick(item) {
      if (item.title === 'Cambiar Contraseña') {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.dialogChangePass = true;
      }
      if (item.title === 'Cerrar Sesión') {
        try {
        const result = await handleRequest({
          endpoint: 'logout',
          method: 'GET'
        });

        if (result.success) {
          // Mostrar mensaje de éxito
          this.showAlert('success', 'Sesión cerrada correctamente', 3000);
          setTimeout(() => {
            // Eliminar el token y redirigir al login
            LocalStorageService.logout();
            this.$router.push({ path: '/' });
          }, 1000);
        } else {
          // Mostrar mensaje de error
          this.showAlert('warning', result.message, 3000);
          setTimeout(() => {
            // Eliminar el token y redirigir al login
            LocalStorageService.logout();
            this.$router.push({ path: '/' });
          }, 1000);
        }
      } catch (error) {
        // En caso de que algo salga mal, manejar errores adicionales aquí si es necesario
        this.showAlert('error', 'Ocurrió un error inesperado.', 3000);
      } finally {
        this.loading = false;
      }
      }
      if (item.title === 'Mi Perfil') {
        console.log('Mi Perfil');
      }
    },
    close(){
      this.editedItem = Object.assign({}, this.defaultItem);
      this.dialogChangePass = false;
    },
    async save(){
      this.loading = true; // Iniciar loader
      try {
        // Preparar el payload
        this.data.id = this.user_id;
        this.data.currentPassword = this.editedItem.currentPassword;
        this.data.newPassword = this.editedItem.newPassword;

        // Petición al servidor utilizando handleRequest
        const result = await handleRequest({
          endpoint: 'update-password',
          method: 'POST',
          data: this.data
        });

        if (result.success) {
          // Manejo en caso de éxito
          this.showAlert('success', 'Contraseña actualizada correctamente', 3000);
          // Reiniciar el formulario
          this.editedItem = Object.assign({}, this.defaultItem);
        } else {
          // Manejo de errores definidos por la API
          this.showAlert('warning', result.details || 'Error inesperado', 3000);
        }
      } catch (error) {
        // Manejo de errores no controlados
        this.showAlert('error', 'Ocurrió un error inesperado al iniciar sesión.', 3000);
      } finally {
        this.loading = false; // Detener el loader
        this.dialogChangePass = false;
      }
    },
  }
}
</script>
<style scoped>
/* APP BAR */
.busgo-appbar {
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(12px);
  color: white;
}

/* BRAND */
.busgo-brand {
  font-weight: 800;
  font-size: 1.3rem;
}

.brand-bus {
  color: rgb(0, 0, 0);
}

.brand-go {
  color: #f59e0b;
}

/* SNACKBAR */
.busgo-snackbar {
  border-radius: 12px;
}

/* USER CHIP DESKTOP */
.user-chip {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 10px;
  border-radius: 14px;
  cursor: pointer;
  transition: 0.2s;
  background: rgba(255,255,255,0.06);
}

.user-chip:hover {
  background: rgba(255,255,255,0.1);
}

/* USER INFO */
.user-info {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}

.user-name {
  font-size: 0.9rem;
  font-weight: 600;
}

.user-role {
  font-size: 0.75rem;
  opacity: 0.7;
}

/* MOBILE CHIP */
.user-chip-mobile {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* MENU */
.user-menu {
  border-radius: 12px;
  padding: 6px;
}

.menu-item {
  border-radius: 10px;
  margin: 2px 0;
}

.menu-item:hover {
  background: rgba(59,130,246,0.08);
}
</style>
