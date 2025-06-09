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
    <v-row justify="center">
      <v-col
        cols="11"
        sm="6"
        md="5"
        lg="4"
        xl="2"
      >
      </v-col>
      </v-row>
  <div class="d-flex align-center justify-center" style="height: 100vh; background-color: #B0BEC5;">
    <v-form ref="form" v-model="valid" enctype="multipart/form-data">
      <v-card class="mx-auto" elevation="8" max-width="600px" :min-width="$vuetify.display.smAndDown ? '90%' : '400px'"
        rounded="lg">

        <v-toolbar :class="$vuetify.display.smAndDown ? 'pt-8 pb-8' : 'pt-16 pb-12'" dark>
          <div class="mx-auto" :style="{
            fontSize: $vuetify.display.smAndDown ? '2.5rem' : '3.5rem',
            fontWeight: 'bold',
            color: '#1976D2',
            textAlign: 'center',
            width: '100%'
          }">
            <v-icon :class="$vuetify.display.smAndDown ? 'mb-2' : 'mb-3'" style="margin-top: 16px;">mdi-bus</v-icon>
            <div style="display: flex; align-items: center; justify-content: center; gap: 0;">
              <span style="color: black;">Bus</span>
              <span style="color: orange;">Go</span>
            </div>
          </div>
        </v-toolbar>

        <v-progress-linear v-if="loading" color="#1976D2" indeterminate></v-progress-linear>

        <v-container>
          <v-text-field :density="$vuetify.display.smAndDown ? 'comfortable' : 'compact'" placeholder="Usuario"
            prepend-inner-icon="mdi-account-circle-outline" variant="outlined" v-model="editedItem.email">
          </v-text-field>

          <v-text-field :density="$vuetify.display.smAndDown ? 'comfortable' : 'compact'"
            :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'" :type="visible ? 'text' : 'password'"
            placeholder="Contraseña" prepend-inner-icon="mdi-lock-outline" variant="outlined"
            @click:append-inner="visible = !visible" v-model="editedItem.password">
          </v-text-field>

          <v-radio-group v-model="selectedOption" inline>
            <v-radio color="#1976D2" label="Empresa" value="empresa"></v-radio>
            <v-radio color="#1976D2" class="ml-4" label="Sucursales" value="sucursales"></v-radio>
          </v-radio-group>

          <v-autocomplete :no-data-text="'No hay datos disponibles'" v-if="selectedOption === 'sucursales'" clearable
            label="Seleccione una Sucursal" variant="outlined" prepend-inner-icon="mdi-domain"
            v-model="editedItem.branch_id" :items="branches" item-title="name" item-value="id" :rules="requiredRules">
            <template v-slot:item="{ props, item }">
              <v-list-item v-bind="props" :prepend-avatar="`${this.$axios.defaults.baseURL}images/${item.raw.image}`"
                :title="item.raw.name"></v-list-item>
            </template>
          </v-autocomplete>

          <v-btn class="mb-8" color="#1976D2" size="large" variant="tonal" block :loading="loading" @click="login()"
            :disabled="!valid">
            Ingresar
          </v-btn>
          <v-divider></v-divider>
          <v-row class="mt-2" justify="center">
          BusGo v1.0
        </v-row>
        </v-container>
      </v-card>
    </v-form>
  </div>
</template>
<script>
import LocalStorageService from "@/LocalStorageService";
import router from '@/router/index';
import { handleRequest } from "@/utils/api";

export default {
  data: () => ({
    visible: false,
    loading: false,
    selectedOption: 'empresa', // Controla la opción seleccionada
    valid: true,
    snackbar: false,
    sb_type: '',
    sb_message: '',
    sb_timeout: 2000,
    sb_title: '',
    sb_icon: '',
    branches: [],
    user: [],
    data: {},
    editedItem: {
      password: '',
      branch_id: '',
      business_id: '',
      email: ''
    },
    defaultItem: {
      password: '',
      branch_id: '',
      business_id: '',
      email: ''
    },
    requiredRules: [
      (v) => !!v || "El campo es requerido",
    ],
  }),

  mounted() {
    this.loading = false;
    this.valid = true;
    this.initialize();
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
    async initialize() {
      try {
        const result = await handleRequest({
          endpoint: 'branch-login',
          method: 'GET',
        });

        if (result.success) {
          // Si la solicitud es exitosa, asignamos las sucursales
          this.branches = result.data?.branches || [];
        } else {
          // Si no hay datos, asignamos un array vacío
          this.branches = [];
        }
      } catch (error) {
        // Captura de errores no controlados
        this.showAlert('error', 'Ocurrió un error inesperado al cargar las sucursales.', 3000);
      }
    },
    async login() {
      this.loading = true; // Iniciar loader
      try {
        // Preparar el payload
        this.data.email = this.editedItem.email;
        this.data.password = this.editedItem.password;
        this.data.branch_id = this.editedItem.branch_id;

        // Petición al servidor utilizando handleRequest
        const result = await handleRequest({
          endpoint: 'login',
          method: 'POST',
          data: this.data,
          includeToken: false
        });

        if (result.success) {
          // Manejo en caso de éxito
          this.showAlert('success', 'Inicio de sesión exitoso', 2000);
          this.user = result.data;

          // Guardar datos en LocalStorage
          const user = this.user;
          LocalStorageService.setItem('token', user.token);
          LocalStorageService.setItem('authenticateUser', true);
          LocalStorageService.setItem('role_id', user.roleId);
          LocalStorageService.setItem('user_id', user.id);
          LocalStorageService.setItem('user', user.userName);
          LocalStorageService.setItem('image', user.image);
          LocalStorageService.setItem('name', user.name);
          LocalStorageService.setItem('role', user.nameRole);
          LocalStorageService.setItem('worker_id', user.workerId);
          LocalStorageService.setItem('branch_id', user.branch.id);
          LocalStorageService.setItem('nameBranch', user.branch.name);
          LocalStorageService.setItem('imageBranch', user.branch.image);
          LocalStorageService.setItem('business_id', user.company.id);
          LocalStorageService.setItem('nameBusiness', user.company.name);
          LocalStorageService.setItem('imageBusiness', user.company.image);
          // Puedes descomentar los siguientes si son necesarios
          // LocalStorageService.setItem('branch_id', user.branch_id);
          // LocalStorageService.setItem('charge', user.charge);
          // LocalStorageService.setItem('charge_id', user.charge_id);
          // LocalStorageService.setItem('nameBranch', user.nameBranch);
          // LocalStorageService.setItem('nameBusiness', user.nameBusiness);
          // LocalStorageService.setItem('imageBusiness', user.imageBusiness);
          // LocalStorageService.setItem('business_id', user.business_id);
          const permissions = user.permissions.map(permission => permission.split(',')[0].trim());
          LocalStorageService.setItem('permissions', permissions);
          //LocalStorageService.setItem('permissions', user.permissions);
          console.log();
          // Reiniciar el formulario
          this.editedItem = Object.assign({}, this.defaultItem);

          // Redirigir al Dashboard
          setTimeout(() => {
            router.push({ name: 'Dashboard' });
          }, 1000);
        } else {
          this.loading = false; // Detener el loader
          // Manejo de errores definidos por la API
          this.showAlert('warning', result.message || 'Error inesperado', 2000);
          //this.showAlert('warning', result.details || 'Error inesperado', 3000);
        }
      } catch (error) {
        this.loading = false; // Detener el loader
        // Manejo de errores no controlados
        this.showAlert('error', 'Ocurrió un error inesperado al iniciar sesión.', 3000);
        //console.error(error);
      } finally {
        this.loading = false; // Detener el loader
      }
    },
  }
}
</script>