<template>
  <div class="control-wrapper">

    <!-- 🌍 BACKGROUND OPERATIVO -->
    <div class="map-core"></div>
    <div class="grid-overlay"></div>

    <!-- STATUS BAR -->
    <div class="status-bar">
      <span class="dot"></span>
      BusGo · Operación de transporte, rutas y tickets en tiempo real
    </div>

    <v-container fluid class="fill-height pa-0">

      <v-row class="fill-height ma-0">

        <!-- LEFT: SISTEMA OPERATIVO -->
        <v-col cols="12" md="7" class="left-control d-none d-md-flex">

          <div class="tower">

            <h1>BusGo</h1>

            <p>
              Plataforma de gestión operativa de transporte terrestre.
              Controla venta de tickets, rutas activas, viajes en curso, tarifas dinámicas
              y disponibilidad de asientos en tiempo real.
            </p>

            <div class="metrics">

              <div class="metric">
                <div class="val">Flota activa</div>
                <div class="lab">Vehículos en operación</div>
              </div>

              <div class="metric">
                <div class="val">24/7</div>
                <div class="lab">Operación continua</div>
              </div>

              <div class="metric">
                <div class="val">Rutas</div>
                <div class="lab">Viajes programados y activos</div>
              </div>

            </div>

            <div class="flow">
              <div class="pulse"></div>
              Sincronización activa, tickets vendidos y ocupación por viaje
            </div>

          </div>

        </v-col>

        <!-- RIGHT: LOGIN (TU LÓGICA INTACTA) -->
        <v-col cols="12" md="5" class="right-console">

          <div class="console-card">

            <div class="console-header">

              <div class="lock-ring">
                <v-icon>mdi-shield-lock</v-icon>
              </div>

              <h2>Acceso a operación</h2>


            </div>

            <!-- FORMULARIO (SIN CAMBIOS) -->
            <v-form ref="form" v-model="valid">

              <v-text-field
                ref="emailField"
                v-model="editedItem.email"
                label="Usuario operativo"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-account"
                @keydown.enter.prevent="handleEmailEnter"
              />

              <v-text-field
                ref="passwordField"
                v-model="editedItem.password"
                :type="visible ? 'text' : 'password'"
                label="Clave de acceso"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-lock"
                :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="visible = !visible"
                @keydown.enter.prevent="handlePasswordEnter"
              />

              <v-radio-group
                ref="optionGroup"
                v-model="selectedOption"
                inline
                class="mt-2"
                @keydown.enter.prevent="handleOptionEnter"
              >

                <v-radio class="mr-9"
                  value="empresa"
                  label="Operador central"
                  color="amber"
                />

                <v-radio
                  value="sucursales"
                  label="Sucursal operativa"
                  color="amber"
                />

              </v-radio-group>

              <v-autocomplete
                ref="branchField"
                v-if="selectedOption === 'sucursales'"
                v-model="editedItem.branch_id"
                :items="branches"
                item-title="name"
                item-value="id"
                label="Nodo operativo (Sucursal)"
                variant="outlined"
                density="comfortable"
                clearable
                :rules="selectedOption === 'sucursales' ? requiredRules : []"
                @keydown.enter.prevent="handleBranchEnter"
              />

              <v-btn
                ref="loginButton"
                block
                height="54"
                class="enter-btn"
                :loading="loading"
                :disabled="!valid"
                @click="login"
              >

                <span v-if="!loading">
                  Acceder
                </span>

                <span v-else>
                  Validando acceso operativo...
                </span>

              </v-btn>

            </v-form>

            <div class="console-footer">
              BusGo v1.0 · Plataforma de control de rutas, viajes y venta de tickets
            </div>

          </div>

        </v-col>

      </v-row>

    </v-container>

    <!-- SNACKBAR (TU LÓGICA IGUAL) -->
    <v-snackbar v-model="snackbar" location="top right" :timeout="sb_timeout">
      <v-alert :type="sb_type" variant="tonal" :icon="sb_icon">
        <strong>{{ sb_title }}</strong><br />
        {{ sb_message }}
      </v-alert>
    </v-snackbar>

  </div>
</template>
<script>
import LocalStorageService from "@/LocalStorageService";
import router from '@/router/index';
import { handleRequest } from "@/utils/api";
import { nextTick } from "vue";
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
    focusComponent(refName) {
      const component = this.$refs[refName];

      if (!component) {
        return;
      }

      if (typeof component.focus === "function") {
        component.focus();
        return;
      }

      component.$el?.focus?.();
      component.$el?.querySelector?.("input, button, [tabindex]")?.focus?.();
    },
    async focusLoginButton() {
      await nextTick();
      this.focusComponent("loginButton");
    },
    async focusBranchField() {
      await nextTick();
      this.focusComponent("branchField");
    },
    async handleEmailEnter() {
      if (this.editedItem.email?.trim()) {
        await nextTick();
        this.focusComponent("passwordField");
      }
    },
    async handlePasswordEnter() {
      if (!this.editedItem.password?.trim()) {
        return;
      }

      if (!this.selectedOption) {
        await nextTick();
        this.focusComponent("optionGroup");
        return;
      }

      if (this.selectedOption === "sucursales") {
        if (this.editedItem.branch_id) {
          await this.focusLoginButton();
          return;
        }

        await this.focusBranchField();
        return;
      }

      await this.focusLoginButton();
    },
    async handleOptionEnter() {
      if (!this.selectedOption) {
        return;
      }

      if (this.selectedOption === "sucursales") {
        if (this.editedItem.branch_id) {
          await this.focusLoginButton();
          return;
        }

        await this.focusBranchField();
        return;
      }

      await this.focusLoginButton();
    },
    async handleBranchEnter() {
      if (this.editedItem.branch_id) {
        await this.focusLoginButton();
      }
    },
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
        this.data.platform = 'web';

        // Petición al servidor utilizando handleRequest
        const result = await handleRequest({
          endpoint: 'login',
          method: 'POST',
          data: this.data,
          includeToken: false
        });
        console.log(result);
        if (result.success) {
          // Manejo en caso de éxito
          this.showAlert('success', 'Inicio de sesión exitoso', 2000);
          this.user = result.data;

          // Guardar datos en LocalStorage
          const user = this.user;
          // Manejo de branch: es un array vacío []
            let branch_id = null;
            let nameBranch = null;
            let imageBranch = null;

            if (user.branch) {
              branch_id = user.branch.id || null;
              nameBranch = user.branch.name || null;
              imageBranch = user.branch.image || null;
            }

            // Manejo de company: puede no existir
            let business_id = null;
            let nameBusiness = null;
            let imageBusiness = null;

            if (user.company) {
              business_id = user.company.id || null;
              nameBusiness = user.company.name || null;
              imageBusiness = user.company.image || null;
            }
          LocalStorageService.setItem('token', user.token);
          LocalStorageService.setItem('authenticateUser', true);
          LocalStorageService.setItem('role_id', user.roleId);
          LocalStorageService.setItem('user_id', user.id);
          LocalStorageService.setItem('user', user.userName);
          LocalStorageService.setItem('image', user.image);
          LocalStorageService.setItem('name', user.name);
          LocalStorageService.setItem('role', user.nameRole);
          LocalStorageService.setItem('worker_id', user.workerId);
          LocalStorageService.setItem('branch_id', branch_id);
          LocalStorageService.setItem('nameBranch', nameBranch);
          LocalStorageService.setItem('imageBranch', imageBranch);
          LocalStorageService.setItem('business_id', business_id);
          LocalStorageService.setItem('nameBusiness', nameBusiness);
          LocalStorageService.setItem('imageBusiness', imageBusiness);
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
 
          // Reiniciar el formulario
          this.editedItem = Object.assign({}, this.defaultItem);

          // Redirigir al Dashboard
          setTimeout(() => {
            router.push({ name: 'Home' });
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

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');

.control-wrapper {
  font-family: Inter;
  height: 100vh;
  overflow: hidden;
  background: #020617;
}

/* 🌍 MAP CORE */
.map-core {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 30% 40%, rgba(59,130,246,0.18), transparent 40%),
    radial-gradient(circle at 70% 60%, rgba(245,158,11,0.14), transparent 45%),
    radial-gradient(circle at 50% 50%, rgba(16,185,129,0.08), transparent 55%);
  filter: blur(40px);
  animation: drift 10s ease-in-out infinite alternate;
}

@keyframes drift {
  0% { transform: scale(1); }
  100% { transform: scale(1.08); }
}

/* GRID */
.grid-overlay {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
  background-size: 60px 60px;
  opacity: 0.25;
}

/* STATUS */
.status-bar {
  position: absolute;
  top: 16px;
  left: 16px;
  color: #cbd5e1;
  font-size: 13px;
  display: flex;
  gap: 10px;
  align-items: center;
}

.dot {
  width: 8px;
  height: 8px;
  background: #22c55e;
  border-radius: 50%;
  box-shadow: 0 0 10px #22c55e;
}

/* LEFT */
.left-control {
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.tower {
  max-width: 460px;
}

.tower h1 {
  font-size: 44px;
  font-weight: 800;
}

.tower p {
  color: #94a3b8;
  margin-bottom: 24px;
}

.metrics {
  display: flex;
  gap: 12px;
  margin-bottom: 18px;
}

.metric {
  background: rgba(255,255,255,0.06);
  padding: 14px;
  border-radius: 14px;
  backdrop-filter: blur(12px);
  min-width: 100px;
}

.val {
  color: #fff;
  font-weight: 700;
}

.lab {
  font-size: 12px;
  color: #94a3b8;
}

.flow {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #a3e635;
  font-size: 13px;
}

.pulse {
  width: 10px;
  height: 10px;
  background: #a3e635;
  border-radius: 50%;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.6); opacity: 0.4; }
  100% { transform: scale(1); opacity: 1; }
}

/* RIGHT */
.right-console {
  display: flex;
  align-items: center;
  justify-content: center;
}

.console-card {
  width: 460px;
  padding: 40px;
  border-radius: 18px;
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(20px);
  box-shadow: 0 40px 120px rgba(0,0,0,0.5);
}

.console-header {
  text-align: center;
  margin-bottom: 20px;
}

.lock-ring {
  width: 64px;
  height: 64px;
  margin: auto;
  border-radius: 16px;
  background: linear-gradient(135deg, #0ea5e9, #6366f1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-bottom: 10px;
}

.enter-btn {
  margin-top: 18px;
  background: linear-gradient(90deg, #0ea5e9, #6366f1);
  color: white;
  font-weight: 800;
  letter-spacing: 1px;
  border-radius: 14px;
}

.console-footer {
  margin-top: 14px;
  text-align: center;
  font-size: 11px;
  color: #64748b;
}
</style>
