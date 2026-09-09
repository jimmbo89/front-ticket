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

  <v-app-bar class="busgo-appbar" elevation="0">
  <!-- Menú móvil -->
  <v-app-bar-nav-icon
    v-if="!$vuetify.display.mdAndUp"
    class="drawer-toggle"
    aria-label="Abrir menú"
    @click.stop="$emit('toggle-drawer')"
  />

  <!-- Identidad -->
  <v-app-bar-title class="busgo-brand">
    <div class="brand-container">
      <div class="brand-symbol">
        <v-icon size="20">mdi-bus</v-icon>
      </div>

      <div class="brand-wordmark">
        <span class="brand-bus">Bus</span>
        <span class="brand-go">GO</span>
      </div>
    </div>
  </v-app-bar-title>

  <v-spacer />

  <!-- Estado del sistema -->
  <div v-if="!mobile" class="appbar-status">
    <span class="appbar-status-dot"></span>
    <span>Sistema en línea</span>
  </div>

  <div v-if="!mobile" class="appbar-divider"></div>

  <!-- Menú del usuario -->
  <v-menu
    :max-width="mobile ? 280 : 320"
    location="bottom end"
    offset="8"
    :transition="mobile ? 'slide-y-transition' : 'scale-transition'"
  >
    <template #activator="{ props: menuProps }">
      <!-- Móvil -->
      <button
        v-if="mobile"
        v-bind="menuProps"
        type="button"
        class="user-chip-mobile"
        aria-label="Abrir menú de usuario"
      >
        <v-avatar size="36" class="user-avatar">
          <v-img
            :src="`${this.$axios.defaults.baseURL}images/${imageUrl}`"
            cover
          />

          <span class="avatar-status"></span>
        </v-avatar>

        <v-icon size="20">mdi-dots-vertical</v-icon>
      </button>

      <!-- Escritorio -->
      <button
        v-else
        v-bind="menuProps"
        type="button"
        class="user-chip"
      >
        <v-avatar size="36" class="user-avatar">
          <v-img
            :src="`${this.$axios.defaults.baseURL}images/${imageUrl}`"
            cover
          />

          <span class="avatar-status"></span>
        </v-avatar>

        <div class="user-info">
          <div class="user-name">
            {{ name }}
          </div>

          <div class="user-role">
            {{ role }}
          </div>
        </div>

        <v-icon class="user-chevron" size="18">
          mdi-chevron-down
        </v-icon>
      </button>
    </template>

    <!-- Menú desplegable -->
    <v-list density="compact" class="user-menu">
      <div class="menu-header">
        <v-avatar size="40" class="menu-avatar">
          <v-img
            :src="`${this.$axios.defaults.baseURL}images/${imageUrl}`"
            cover
          />
        </v-avatar>

        <div class="menu-user-information">
          <div class="menu-user-name">
            {{ name }}
          </div>

          <div class="menu-user-role">
            {{ role }}
          </div>
        </div>
      </div>

      <v-divider class="menu-divider" />

      <v-list-item
        v-for="(item, i) in items"
        :key="i"
        class="menu-item"
        :class="{ 'menu-item--logout': item.title === 'Cerrar Sesión' }"
        @click="handleItemClick(item)"
      >
        <template #prepend>
          <div class="menu-icon">
            <v-icon :icon="item.icon" size="18" />
          </div>
        </template>

        <v-list-item-title>
          {{ item.title }}
        </v-list-item-title>
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
/* ========================================
   VARIABLES
======================================== */

.busgo-appbar {
  --busgo-blue: #2454d6;
  --busgo-blue-light: #3266e4;
  --busgo-blue-dark: #132d6b;
  --busgo-blue-deep: #0e1f46;
  --busgo-cyan: #35b8e8;

  --appbar-text: #1e293b;
  --appbar-muted: #64748b;
  --appbar-border: #e8edf5;
  --appbar-hover: #f2f5fb;

  color: var(--appbar-text) !important;
  background: rgba(255, 255, 255, 0.96) !important;
  border-bottom: 1px solid var(--appbar-border);
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.03) !important;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

/* Corrige el contenido interno de Vuetify */

.busgo-appbar :deep(.v-toolbar__content) {
  min-height: 60px;
  padding: 0 18px;
}

/* ========================================
   BOTÓN DEL DRAWER
======================================== */

.drawer-toggle {
  margin-right: 6px;
  color: var(--busgo-blue-dark) !important;
  border-radius: 9px;
}

.drawer-toggle:hover {
  color: var(--busgo-blue) !important;
  background: var(--appbar-hover);
}

.drawer-toggle :deep(.v-icon) {
  opacity: 1 !important;
}

/* ========================================
   MARCA BUSGO
======================================== */

.busgo-brand {
  flex: 0 0 auto;
  overflow: visible;
}

.busgo-brand :deep(.v-toolbar-title__placeholder) {
  overflow: visible;
}

.brand-container {
  display: flex;
  align-items: center;
  gap: 9px;
}

.brand-symbol {
  display: grid;
  flex: 0 0 34px;
  width: 34px;
  height: 34px;
  place-items: center;

  color: #ffffff;
  background:
    radial-gradient(
      circle at 90% 5%,
      rgba(53, 184, 232, 0.5),
      transparent 24px
    ),
    linear-gradient(
      135deg,
      var(--busgo-blue-deep),
      var(--busgo-blue)
    );

  border-radius: 9px;
  box-shadow: 0 4px 10px rgba(36, 84, 214, 0.18);
}

.brand-symbol :deep(.v-icon) {
  color: #ffffff !important;
  opacity: 1 !important;
}

.brand-wordmark {
  display: flex;
  align-items: baseline;
  font-size: 18px;
  font-weight: 850;
  line-height: 1;
  letter-spacing: -0.04em;
}

.brand-bus {
  color: var(--busgo-blue-deep);
}

.brand-go {
  margin-left: 2px;
  color: var(--busgo-blue);
}

/* ========================================
   ESTADO DEL SISTEMA
======================================== */

.appbar-status {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 6px 9px;

  color: #64748b;
  font-size: 11px;
  font-weight: 700;
  line-height: 1;

  background: #f8fafc;
  border: 1px solid #edf1f5;
  border-radius: 20px;
}

.appbar-status-dot {
  width: 7px;
  height: 7px;
  background: #20a66a;
  border: 1px solid #d7f5e7;
  border-radius: 50%;
  box-shadow: 0 0 0 3px rgba(32, 166, 106, 0.1);
}

.appbar-divider {
  width: 1px;
  height: 26px;
  margin: 0 12px;
  background: var(--appbar-border);
}

/* ========================================
   USUARIO EN ESCRITORIO
======================================== */

.user-chip {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 0;
  padding: 5px 7px 5px 5px;

  color: var(--appbar-text);
  font: inherit;
  text-align: left;
  cursor: pointer;

  background: transparent;
  border: 1px solid transparent;
  border-radius: 11px;
  outline: none;

  transition:
    color 150ms ease,
    background-color 150ms ease,
    border-color 150ms ease,
    box-shadow 150ms ease;
}

.user-chip:hover {
  background: var(--appbar-hover);
  border-color: #e9eef6;
}

.user-chip:focus-visible {
  border-color: rgba(36, 84, 214, 0.4);
  box-shadow: 0 0 0 3px rgba(36, 84, 214, 0.1);
}

.user-avatar {
  position: relative;
  overflow: visible !important;
  background: #e8edf5;
  border: 2px solid #ffffff;
  box-shadow: 0 0 0 1px #dce3ed;
}

.user-avatar :deep(.v-img) {
  overflow: hidden;
  border-radius: 50%;
}

.avatar-status {
  position: absolute;
  right: -1px;
  bottom: 0;
  z-index: 2;

  width: 9px;
  height: 9px;

  background: #20a66a;
  border: 2px solid #ffffff;
  border-radius: 50%;
}

.user-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
  max-width: 170px;
  line-height: 1.15;
}

.user-name {
  overflow: hidden;
  color: var(--appbar-text);
  font-size: 12.5px;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-role {
  margin-top: 2px;
  overflow: hidden;
  color: var(--appbar-muted);
  font-size: 9.5px;
  font-weight: 650;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-chevron {
  color: #7c899b !important;
  opacity: 1 !important;
  transition: transform 150ms ease;
}

.user-chip:hover .user-chevron {
  color: var(--busgo-blue) !important;
  transform: translateY(1px);
}

/* ========================================
   USUARIO EN MÓVIL
======================================== */

.user-chip-mobile {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px;

  color: var(--appbar-text);
  font: inherit;
  cursor: pointer;

  background: transparent;
  border: none;
  border-radius: 10px;
  outline: none;
}

.user-chip-mobile:hover {
  background: var(--appbar-hover);
}

.user-chip-mobile :deep(.v-icon) {
  color: #64748b !important;
  opacity: 1 !important;
}

/* ========================================
   MENÚ DEL USUARIO
======================================== */

.user-menu {
  min-width: 270px;
  padding: 7px;

  color: var(--appbar-text);
  background: rgba(255, 255, 255, 0.99);
  border: 1px solid var(--appbar-border);
  border-radius: 13px !important;
  box-shadow: 0 14px 35px rgba(15, 23, 42, 0.14);
}

.menu-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 8px 9px;
}

.menu-avatar {
  flex: 0 0 auto;
  background: #e8edf5;
  border: 1px solid #dce3ed;
}

.menu-user-information {
  min-width: 0;
}

.menu-user-name {
  overflow: hidden;
  color: var(--appbar-text);
  font-size: 12.5px;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.menu-user-role {
  margin-top: 2px;
  overflow: hidden;
  color: var(--appbar-muted);
  font-size: 10px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.menu-divider {
  margin: 1px 3px 6px;
  border-color: var(--appbar-border);
  opacity: 1;
}

.menu-item {
  min-height: 38px !important;
  margin: 2px 0;
  padding: 3px 7px !important;

  color: #334155 !important;
  cursor: pointer;
  border-radius: 9px !important;
}

.menu-item :deep(.v-list-item__overlay) {
  display: none;
}

.menu-item :deep(.v-list-item__prepend) {
  margin-right: 9px;
  opacity: 1 !important;
}

.menu-item :deep(.v-list-item__spacer) {
  width: 0 !important;
}

.menu-item :deep(.v-list-item-title) {
  color: inherit !important;
  font-size: 12px;
  font-weight: 700;
  opacity: 1 !important;
}

.menu-icon {
  display: grid;
  width: 28px;
  height: 28px;
  place-items: center;

  color: #64748b;
  background: #f1f5f9;
  border-radius: 7px;
}

.menu-icon :deep(.v-icon) {
  color: inherit !important;
  opacity: 1 !important;
}

.menu-item:hover {
  color: var(--busgo-blue) !important;
  background: var(--appbar-hover);
}

.menu-item:hover .menu-icon {
  color: var(--busgo-blue);
  background: #e8eefc;
}

.menu-item--logout:hover {
  color: #dc2626 !important;
  background: #fff1f2;
}

.menu-item--logout:hover .menu-icon {
  color: #dc2626;
  background: #ffe4e6;
}

/* ========================================
   SNACKBAR
======================================== */

.busgo-snackbar :deep(.v-snackbar__wrapper) {
  border-radius: 12px;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.18);
}

/* ========================================
   DIÁLOGO DE CONTRASEÑA
======================================== */

.password-dialog {
  overflow: hidden;
  border: 1px solid var(--appbar-border);
  border-radius: 14px !important;
  box-shadow: 0 22px 60px rgba(15, 23, 42, 0.2);
}

.password-dialog :deep(.v-toolbar) {
  color: #ffffff;
  background:
    radial-gradient(
      circle at 100% 0,
      rgba(53, 184, 232, 0.25),
      transparent 110px
    ),
    linear-gradient(
      135deg,
      var(--busgo-blue-deep),
      var(--busgo-blue-dark)
    ) !important;
}

/* ========================================
   RESPONSIVE
======================================== */

@media (max-width: 959px) {
  .busgo-appbar :deep(.v-toolbar__content) {
    padding: 0 10px;
  }

  .brand-symbol {
    flex-basis: 32px;
    width: 32px;
    height: 32px;
  }

  .brand-wordmark {
    font-size: 17px;
  }
}

@media (max-width: 600px) {
  .busgo-appbar :deep(.v-toolbar__content) {
    min-height: 56px;
    padding: 0 7px;
  }

  .drawer-toggle {
    margin-right: 1px;
  }

  .brand-container {
    gap: 7px;
  }

  .brand-symbol {
    flex-basis: 30px;
    width: 30px;
    height: 30px;
  }

  .brand-symbol :deep(.v-icon) {
    font-size: 18px !important;
  }

  .brand-wordmark {
    font-size: 16px;
  }

  .user-menu {
    min-width: 260px;
  }
}
</style>
