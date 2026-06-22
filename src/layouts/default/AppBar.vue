<template>
  <v-snackbar class="mt-12" location="right top" :timeout="sb_timeout" :color="sb_type" elevation="24"
    :multi-line="true" vertical v-model="snackbar">
    <v-row>
      <v-col md="2">
        <v-avatar :icon="sb_icon" color="sb_type" size="40"></v-avatar>
      </v-col>
      <v-col md="10">
        <h4>{{ sb_title }}</h4>
        {{ sb_message }}

      </v-col>

    </v-row>
  </v-snackbar>
  <v-app-bar scroll-threshold="0" v-bind="$attrs">
     <v-app-bar-nav-icon 
      @click.stop="$emit('toggle-drawer')"
      v-if="!$vuetify.display.mdAndUp"
    />
    <v-app-bar-title>
  <div style="display: flex; align-items: center; gap: 0;">
    <!--<v-icon size="40">mdi-bus</v-icon>  Icono sin margen inferior -->
    <span style="font-size: 1.5rem; font-weight: bold; color: black;">
      Bus
    </span>
    <span style="font-size: 1.5rem; font-weight: bold; color: orange;">
      Go
    </span>
  </div>
</v-app-bar-title>
    <v-spacer></v-spacer>
    <!-- Campanita de notificaciones -->
    <!--<v-btn icon variant="text" class="mr-2" style="color: #2196F3; border: 2px solid #FFF;" @click="notifications.length ? openNoti() : ''">
          <template v-if="countNoti">

            <v-badge color="primary" :content="countNoti" overlap>
              <v-icon size="x-large" style="color: #2196F3;" icon="mdi-bell-badge-outline"></v-icon>
            </v-badge>
          </template>

          <template v-else>

            <v-icon size="x-large" style="color: #2196F3;" icon="mdi-bell-outline"></v-icon>
          </template>

          <v-menu v-model="menuNoti" :close-on-content-click="false" offset-y max-height="300" min-width="350px" max-width="350px"
            content-class="rounded-menu">
            <template v-slot:activator="{ props }">
              <div v-bind="props"></div>
            </template>

            <v-list style="max-height: 300px; overflow-y: auto;" class="notification-list">

              <v-list-item v-for="(notification, index) in notifications" :key="index"
                :class="{ 'notification-unread': notification.status === 0 }" class="notification-item" @click="handleItemClickNotif(notification)">
                <v-row align="center" no-gutters>

                  <v-col cols="auto" class="pr-1">
                    <v-avatar size="45" class="notification-image">
                      <v-img :src="`${this.$axios.defaults.baseURL}images/${notification.image}`" alt="Avatar"></v-img>
                    </v-avatar>
                  </v-col>


                  <v-col style="min-width: 0;">

                    <v-tooltip top>
                      <template v-slot:activator="{ on, attrs }">
                        <v-list-item-title v-bind="attrs" v-on="on"
                          :class="{ 'unread-title': notification.status === 0 }" class="text-truncate title-text">
                          {{ notification.title }}
                        </v-list-item-title>
                      </template>
                      <span>{{ notification.title }}</span>
                    </v-tooltip>


                    <v-tooltip top>
                      <template v-slot:activator="{ on, attrs }">
                        <v-list-item-subtitle v-bind="attrs" v-on="on" class="text-truncate description-text">
                          {{ notification.description }}
                        </v-list-item-subtitle>
                      </template>
                      <span>{{ notification.description }}</span>
                    </v-tooltip>
                  </v-col>
                </v-row>
              </v-list-item>


              <v-list-item v-if="hasMore" @click="getNotifications" class="load-more-item">
                <v-btn variant="text" color="primary" block class="load-more-btn">
                  Ver más
                  <v-icon right>mdi-chevron-down</v-icon>
                </v-btn>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-btn>-->
    <!--<v-menu>
      <template v-slot:activator="{ props }">

        <v-list-item v-bind="props" variant="tonal" class="mr-4" lines="two" :title="this.name" :subtitle="this.role"
          :style="{ color: '#000000' }">
          <template v-slot:prepend>
            <v-avatar class="mr-2">
                    <v-img :src="`${this.$axios.defaults.baseURL}images/${imageUrl}`" alt="Avatar de la persona"></v-img>
                  </v-avatar>      
        </template>
          <template v-slot:append>
            <v-btn size="small" variant="text" icon="mdi-menu-down"></v-btn>
          </template></v-list-item>

      </template>

      <v-list>
        <v-list-item v-for="(item, i) in items" :key="i" @click="handleItemClick(item)">

          <template v-slot:prepend>
            <v-icon :icon="item.icon"></v-icon>
          </template>


          <v-list-item-title> {{ item.title }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>-->
     <v-menu 
    :max-width="mobile ? '280' : undefined" 
    :transition="mobile ? 'slide-y-transition' : 'scale-transition'"
    location="bottom end"
  >
    <template v-slot:activator="{ props: menuProps }">
      <!-- Versión móvil con tooltip -->
      <v-tooltip 
        v-if="mobile" 
        location="bottom"
        content-class="custom-user-tooltip"
      >
        <template v-slot:activator="{ props: tooltipProps }">
          <div v-bind="{...tooltipProps, ...menuProps}" class="mobile-avatar-wrapper">
            <v-avatar class="mr-2" size="40">
              <v-img 
                :src="`${this.$axios.defaults.baseURL}images/${imageUrl}`" 
                alt="Avatar"
              />
            </v-avatar>
            <v-btn 
              size="small" 
              variant="text" 
              icon="mdi-dots-vertical"
              class="mobile-menu-btn"
            />
          </div>
        </template>
        <div class="tooltip-content">
          <div class="text-subtitle-2">{{ name }}</div>
          <div class="text-caption text-medium-emphasis">{{ role }}</div>
        </div>
      </v-tooltip>

      <!-- Versión desktop -->
      <v-list-item
        v-if="!mobile"
        v-bind="menuProps"
        variant="tonal"
        class="user-menu-activator"
        lines="two"
        :title="name"
        :subtitle="role"
      >
        <template v-slot:prepend>
          <v-avatar class="mr-2">
            <v-img 
              :src="`${this.$axios.defaults.baseURL}images/${imageUrl}`" 
              alt="Avatar"
            />
          </v-avatar>      
        </template>
        <template v-slot:append>
          <v-btn 
            size="small" 
            variant="text" 
            icon="mdi-menu-down"
          />
        </template>
      </v-list-item>
    </template>

    <v-list density="compact" nav>
      <v-list-item
        v-for="(item, i) in items"
        :key="i"
        :value="item"
        @click="handleItemClick(item)"
      >
        <template v-slot:prepend>
          <v-icon :icon="item.icon"/>
        </template>
        <v-list-item-title>{{ item.title }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
  </v-app-bar>
  <v-dialog v-model="dialogChangePass" max-width="400px">
    <v-form ref="form" v-model="valid" enctype="multipart/form-data">
      <v-card>
        <v-toolbar color="#1976D2">
          <span class="text-subtitle-2 ml-4">Actualizar Contraseña</span>
        </v-toolbar>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12" md="12">
                <v-text-field :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'" :type="visible ? 'text' : 'password'"
                density="compact" placeholder="Contraseña actual" prepend-inner-icon="mdi-lock-outline" variant="underlined"
                @click:append-inner="visible = !visible" v-model="editedItem.currentPassword"></v-text-field>
              </v-col>
              <v-col cols="12" md="12">
                <v-text-field :append-inner-icon="visible1 ? 'mdi-eye-off' : 'mdi-eye'" :type="visible1 ? 'text' : 'password'"
                density="compact" placeholder="Contraseña nueva" prepend-inner-icon="mdi-lock-outline" variant="underlined"
                @click:append-inner="visible1 = !visible1" v-model="editedItem.newPassword" :rules="[passwordRule]"></v-text-field>
              </v-col>
              <v-col cols="12" md="12">
                <v-text-field :append-inner-icon="visible2 ? 'mdi-eye-off' : 'mdi-eye'" :type="visible2 ? 'text' : 'password'"
                density="compact" placeholder="Contraseña nueva" prepend-inner-icon="mdi-lock-outline" variant="underlined"
                @click:append-inner="visible2 = !visible2" v-model="editedItem.newPassword1"></v-text-field>
              </v-col>
              <!-- Alerta de error si las contraseñas no coinciden -->
              <v-alert v-if="editedItem.newPassword !== editedItem.newPassword1 && editedItem.newPassword1 !== ''" type="error" dense>
                Las contraseñas no coinciden.
              </v-alert>
            </v-row>
          </v-container>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="#DA7171" variant="flat" @click="close">Cancelar</v-btn>
          <v-btn color="#1976D2" variant="flat" :loading="loading" @click="save" :disabled="editedItem.newPassword !== editedItem.newPassword1 || editedItem.newPassword === ''">Aceptar</v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
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
/* Estilos para móvil */
.mobile-avatar-wrapper {
  display: flex;
  align-items: center;
  padding: 8px;
  cursor: pointer;
}

.mobile-menu-btn {
  margin-left: 4px;
}

/* Estilos para desktop */
.user-menu-activator {
  max-width: 300px;
}

/* Estilos del tooltip */
:deep(.custom-user-tooltip) {
  opacity: 1 !important;
  background: rgba(var(--v-theme-surface-variant), 0.9) !important;
  color: rgba(var(--v-theme-on-surface-variant)) !important;
  padding: 8px 12px !important;
  border-radius: 4px !important;
  box-shadow: 0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23);
}

.tooltip-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

@media (max-width: 600px) {
  .v-menu__content {
    min-width: 100vw !important;
    max-width: 100vw !important;
    left: 0 !important;
    right: 0 !important;
  }
}
</style>
