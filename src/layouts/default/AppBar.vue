<template>

  <v-snackbar

    v-model="snackbar"

    location="right top"

    :timeout="sb_timeout"

    :color="sb_type"

    variant="flat"

    elevation="10"

    class="busgo-snackbar"

  >

    <div class="d-flex align-center ga-3">

      <v-icon :icon="sb_icon" size="20" />

      <div>

        <div class="font-weight-bold">{{ sb_title }}</div>

        <div class="text-caption">{{ sb_message }}</div>

      </div>

    </div>

  </v-snackbar>

  <v-app-bar class="busgo-appbar" :height="mobile ? 56 : 64" elevation="0">

    <!-- Menú móvil -->

    <v-app-bar-nav-icon

      v-if="!$vuetify.display.mdAndUp"

      class="drawer-toggle"

      aria-label="Abrir menú"

      @click.stop="$emit('toggle-drawer')"

    >

      <v-icon icon="mdi-menu-2" />

    </v-app-bar-nav-icon>

  <!-- Identidad BusGo -->

  <v-app-bar-title class="busgo-brand" aria-label="BusGo">

    <div class="brand-container">

      <img

        :src="busgoLogo"

        alt=""

        class="brand-logo"

      />

    </div>

    </v-app-bar-title>

    <v-spacer />

    <!-- Estado operativo -->

    <div v-if="!mobile" class="appbar-status" aria-label="Operación en línea">

      <span class="appbar-status-dot"></span>

      <span>Operación en línea</span>

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

            <v-img v-if="hasProfileImage" :src="profileImageSrc" cover />

            <v-icon v-else icon="mdi-account-outline" size="20" />

            <span class="avatar-status"></span>

          </v-avatar>

          <v-icon icon="mdi-dots-vertical" size="20" />

        </button>

        <!-- Escritorio -->

        <button

          v-else

          v-bind="menuProps"

          type="button"

          class="user-chip"

          aria-label="Abrir menú de usuario"

        >

          <v-avatar size="36" class="user-avatar">

            <v-img v-if="hasProfileImage" :src="profileImageSrc" cover />

            <v-icon v-else icon="mdi-account-outline" size="20" />

            <span class="avatar-status"></span>

          </v-avatar>

          <div class="user-info">

            <div class="user-name">{{ displayName }}</div>

            <div class="user-role">{{ displayRole }}</div>

          </div>

          <v-icon class="user-chevron" icon="mdi-chevron-down" size="18" />

        </button>

      </template>

      <!-- Menú desplegable -->

      <v-list density="compact" class="user-menu">

        <div class="menu-header">

          <v-avatar size="42" class="menu-avatar">

            <v-img v-if="hasProfileImage" :src="profileImageSrc" cover />

            <v-icon v-else icon="mdi-account-outline" size="22" />

          </v-avatar>

          <div class="menu-user-information">

            <div class="menu-user-kicker">CUENTA ACTIVA</div>

            <div class="menu-user-name">{{ displayName }}</div>

            <div class="menu-user-role">{{ displayRole }}</div>

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

          <v-list-item-title>{{ item.title }}</v-list-item-title>

        </v-list-item>

      </v-list>

    </v-menu>

  </v-app-bar>

  <!-- DIALOG PASSWORD -->

  <v-dialog v-model="dialogChangePass" max-width="460px">

    <v-card class="password-dialog">

      <div class="password-dialog__header">

        <div class="password-dialog__heading">

          <div class="password-dialog__icon">

            <v-icon icon="mdi-shield-lock-outline" size="20" />

          </div>

          <div>

            <div class="password-dialog__eyebrow">SEGURIDAD DE LA CUENTA</div>

            <div class="password-dialog__title">Actualizar contraseña</div>

          </div>

        </div>

        <v-btn

          icon="mdi-close"

          variant="text"

          size="34"

          aria-label="Cerrar diálogo"

          @click="close"

        />

      </div>

      <v-card-text class="password-dialog__body">

        <p class="password-dialog__intro">

          Actualiza tu contraseña para mantener protegida tu cuenta BusGo.

        </p>

        <v-text-field

          v-model="editedItem.currentPassword"

          :type="visible ? 'text' : 'password'"

          label="Contraseña actual"

          variant="outlined"

          density="comfortable"

          autocomplete="current-password"

          :append-inner-icon="visible ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"

          @click:append-inner="visible = !visible"

        />

        <v-text-field

          v-model="editedItem.newPassword"

          :type="visible1 ? 'text' : 'password'"

          label="Nueva contraseña"

          variant="outlined"

          density="comfortable"

          autocomplete="new-password"

          :rules="[passwordRule]"

          :append-inner-icon="visible1 ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"

          @click:append-inner="visible1 = !visible1"

        />

        <v-text-field

          v-model="editedItem.newPassword1"

          :type="visible2 ? 'text' : 'password'"

          label="Repetir contraseña"

          variant="outlined"

          density="comfortable"

          autocomplete="new-password"

          :append-inner-icon="visible2 ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"

          @click:append-inner="visible2 = !visible2"

        />

        <v-alert

          v-if="editedItem.newPassword !== editedItem.newPassword1 && editedItem.newPassword1 !== ''"

          class="password-dialog__alert"

          type="error"

          variant="tonal"

          density="compact"

          text="Las contraseñas no coinciden."

        />

      </v-card-text>

      <v-card-actions class="password-dialog__actions">

        <v-spacer />

        <v-btn variant="text" class="password-dialog__cancel" @click="close">Cancelar</v-btn>

        <v-btn

          color="primary"

          variant="flat"

          class="password-dialog__save"

          :loading="loading"

          :disabled="editedItem.newPassword !== editedItem.newPassword1 || editedItem.newPassword === ''"

          @click="save"

        >

          Guardar contraseña

        </v-btn>

      </v-card-actions>

    </v-card>

  </v-dialog>

</template>

<script>

import LocalStorageService from "@/LocalStorageService";

import { handleRequest } from "@/utils/api"; // Ruta al archivo

import { useDisplay } from 'vuetify';

import busgoLogo from "@/assets/logo.png";

export default {

  inheritAttrs: false,

  emits: ['toggle-drawer'],

  props: {

    drawerVisible: Boolean

  },

  data: () => ({

    busgoLogo,

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

  computed: {

    displayName() {

      return this.name || 'Usuario BusGo'

    },

    displayRole() {

      return this.role || 'Cuenta activa'

    },

    hasProfileImage() {

      return Boolean(this.imageUrl && this.imageUrl !== 'null' && this.imageUrl !== 'undefined')

    },

    profileImageSrc() {

      const baseUrl = this.$axios?.defaults?.baseURL || ''

      const normalizedBaseUrl = `${String(baseUrl).replace(/\/?$/, '/')}`

      return `${normalizedBaseUrl}images/${this.imageUrl}`

    },

  },

  mounted() {

    this.name = this.readStorageValue('name');

    this.user = this.readStorageValue('user');

    this.user_id = this.readStorageValue('user_id');

    this.rol_id = this.readStorageValue('role_id');

    this.role = this.readStorageValue('role');

    this.imageUrl = String(this.readStorageValue('image') || '')

      .replace(/['"]+/g, '')

      .trim();

  },

  methods: {

    readStorageValue(key) {

      const rawValue = LocalStorageService.getItem(key)

      if (rawValue === null || rawValue === undefined || rawValue === '') {

        return ''

      }

      if (typeof rawValue !== 'string') {

        return rawValue

      }

      try {

        return JSON.parse(rawValue)

      } catch {

        return rawValue.replace(/^"(.*)"$/, '$1')

      }

    },

    showAlert(sb_type, sb_message, sb_timeout) {

      const alertConfig = {

        success: { title: 'Éxito', icon: 'mdi-check-circle' },

        error: { title: 'Error', icon: 'mdi-alert-circle' },

        warning: { title: 'Advertencia', icon: 'mdi-alert-circle' },

      }[sb_type] || { title: 'Aviso', icon: 'mdi-information-outline' }

      this.sb_type = sb_type

      this.sb_title = alertConfig.title

      this.sb_icon = alertConfig.icon

      this.sb_message = sb_message

      this.sb_timeout = sb_timeout

      this.snackbar = true

    },

    async handleItemClick(item) {

      if (item.title === 'Cambiar Contraseña') {

        this.editedItem = Object.assign({}, this.defaultItem);

        this.resetPasswordVisibility();

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

      this.resetPasswordVisibility();

      this.dialogChangePass = false;

    },

    resetPasswordVisibility() {

      this.visible = false;

      this.visible1 = false;

      this.visible2 = false;

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

        this.resetPasswordVisibility();

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

.busgo-appbar,

.password-dialog {

  --busgo-navy: #142b55;

  --busgo-blue: #2454d6;

  --busgo-blue-dark: #1b3d91;

  --appbar-text: #111827;

  --appbar-muted: #64748b;

  --appbar-border: #e5eaf2;

  --appbar-hover: #f5f7fb;

}

.busgo-appbar {

  color: var(--appbar-text) !important;

  background: #ffffff !important;

  border-bottom: 1px solid var(--appbar-border);

  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.035) !important;

}

/* Corrige el contenido interno de Vuetify */

.busgo-appbar :deep(.v-toolbar__content) {

  min-height: inherit;

  padding: 0 18px;

}

/* ========================================

   BOTÓN DEL DRAWER

======================================== */

.drawer-toggle {

  margin-right: 6px;

  color: var(--busgo-navy) !important;

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

  min-width: 0;

}

.brand-logo {

  display: block;

  width: auto;

  max-width: 150px;

  height: 44px;

  object-fit: contain;

  object-position: left center;

}

.brand-symbol {

  position: relative;

  display: grid;

  flex: 0 0 34px;

  width: 34px;

  height: 34px;

  place-items: center;

  color: #ffffff;

  background: var(--busgo-navy);

  border-radius: 9px;

  box-shadow: 0 4px 10px rgba(20, 43, 85, 0.16);

}

.brand-symbol::after {

  position: absolute;

  right: 6px;

  bottom: 6px;

  width: 4px;

  height: 21px;

  content: '';

  background: var(--busgo-blue);

  border-radius: 4px;

  transform: rotate(12deg);

}

.brand-symbol-letter {

  position: relative;

  z-index: 1;

  margin-left: -2px;

  color: #ffffff;

  font-size: 19px;

  font-weight: 900;

  line-height: 1;

  letter-spacing: -0.08em;

}

.brand-wordmark {

  display: flex;

  align-items: baseline;

  font-size: 18px;

  font-weight: 800;

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

  white-space: nowrap;

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

  color: var(--busgo-navy);

  background: #eef2f8;

  border: 2px solid #ffffff;

  box-shadow: 0 0 0 1px #dce3ed;

}

.user-avatar :deep(.v-img) {

  overflow: hidden;

  border-radius: 50%;

}

.user-avatar :deep(.v-icon) {

  color: var(--busgo-navy) !important;

  opacity: 1 !important;

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

.user-chip-mobile:focus-visible {

  box-shadow: 0 0 0 3px rgba(36, 84, 214, 0.1);

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

  color: var(--busgo-navy);

  background: #eef2f8;

  border: 1px solid #dce3ed;

}

.menu-avatar :deep(.v-icon) {

  color: var(--busgo-navy) !important;

  opacity: 1 !important;

}

.menu-user-information {

  min-width: 0;

}

.menu-user-kicker {

  margin-bottom: 3px;

  color: var(--busgo-blue);

  font-size: 8px;

  font-weight: 800;

  letter-spacing: 0.1em;

  line-height: 1;

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

  border-radius: 18px !important;

  box-shadow: 0 22px 60px rgba(15, 23, 42, 0.18);

}

.password-dialog__header {

  display: flex;

  align-items: center;

  justify-content: space-between;

  gap: 14px;

  padding: 18px 20px 15px;

  background: #ffffff;

  border-bottom: 1px solid #eef2f7;

}

.password-dialog__heading {

  display: flex;

  align-items: center;

  gap: 11px;

  min-width: 0;

}

.password-dialog__icon {

  display: grid;

  flex: 0 0 38px;

  width: 38px;

  height: 38px;

  place-items: center;

  color: var(--busgo-blue);

  background: #edf2ff;

  border: 1px solid #dce5ff;

  border-radius: 11px;

}

.password-dialog__icon :deep(.v-icon) {

  color: inherit !important;

}

.password-dialog__eyebrow {

  margin-bottom: 4px;

  color: var(--busgo-blue);

  font-size: 9px;

  font-weight: 800;

  letter-spacing: 0.1em;

  line-height: 1;

}

.password-dialog__title {

  overflow: hidden;

  color: var(--appbar-text);

  font-size: 17px;

  font-weight: 800;

  line-height: 1.2;

  text-overflow: ellipsis;

  white-space: nowrap;

}

.password-dialog__header :deep(.v-btn) {

  flex: 0 0 auto;

  color: #64748b !important;

  border-radius: 9px;

}

.password-dialog__header :deep(.v-btn:hover) {

  color: var(--busgo-blue) !important;

  background: #f3f6fb;

}

.password-dialog__body {

  padding: 18px 20px 6px;

}

.password-dialog__intro {

  margin: 0 0 17px;

  color: var(--appbar-muted);

  font-size: 12px;

  line-height: 1.5;

}

.password-dialog__body :deep(.v-text-field) {

  margin-bottom: 2px;

}

.password-dialog__body :deep(.v-field) {

  border-radius: 10px;

}

.password-dialog__body :deep(.v-field__append-inner .v-icon) {

  color: #94a3b8;

  cursor: pointer;

}

.password-dialog__alert {

  margin-top: 3px;

  border-radius: 10px;

}

.password-dialog__actions {

  gap: 5px;

  padding: 10px 20px 18px;

}

.password-dialog__cancel {

  color: #64748b !important;

  font-weight: 700;

}

.password-dialog__save {

  min-width: 150px;

  border-radius: 9px;

  font-weight: 750;

  letter-spacing: 0;

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

  .brand-logo {

    max-width: 132px;

    height: 32px;

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

  .brand-logo {

    max-width: 118px;

    height: 30px;

  }

  .brand-symbol {

    flex-basis: 30px;

    width: 30px;

    height: 30px;

  }

  .brand-symbol-letter {

    font-size: 17px;

  }

  .brand-wordmark {

    font-size: 16px;

  }

  .user-menu {

    min-width: 260px;

  }

  .password-dialog__header {

    padding: 16px 16px 14px;

  }

  .password-dialog__body {

    padding: 16px 16px 4px;

  }

  .password-dialog__actions {

    padding: 9px 16px 16px;

  }

  .password-dialog__save {

    min-width: 0;

  }

}

</style>
