<template>
  <!-- Modal de recuperación de contraseña -->
  <v-dialog v-model="dialog" max-width="500" persistent>
    <v-card>
      <v-card-title class="py-5 font-weight-black">
        <div v-if="step === 1">Recuperar Contraseña</div>
        <div v-if="step === 2">Verificar Código</div>
        <div v-if="step === 3">Nueva Contraseña</div>
      </v-card-title>
      
      <v-card-text>
        <div v-if="step === 1">
          Ingresa tu correo electrónico registrado y te enviaremos un código para restablecer tu contraseña.
        </div>
        <div v-if="step === 2">
          Código de verificación enviado al correo <strong>{{ email }}</strong>,
          activo por {{ formatTime(secondsRemaining) }}
        </div>
        <div v-if="step === 3">Ingresa tu nueva contraseña a continuación.</div>
      </v-card-text>

      <v-card-text>
        <!-- Paso 1: Correo electrónico -->
        <v-text-field
          v-if="step === 1"
          v-model="email"
          label="Correo electrónico"
          variant="outlined"
          density="comfortable"
          :rules="emailRules"
          class="mb-4"
        />

        <!-- Paso 2: Código de verificación -->
        <div v-if="step === 2" class="d-flex justify-center mb-6">
          <v-text-field
            v-for="(digit, index) in code"
            :key="index"
            v-model="code[index]"
            :class="{ 'digit-filled': !!code[index] }"
            maxlength="1"
            variant="outlined"
            hide-details
            class="mx-1 large-centered-input"
            style="width: 48px;"
            :ref="el => { if (el) inputRefs[index] = el; }"
            @input="handleInput(index)"
            @keydown="handleKeydown(index, $event)"
            @focus="selectContent($event)"
            color="green"
          ></v-text-field>
        </div>

        <!-- Paso 3: Nueva contraseña -->
        <div v-if="step === 3" class="mt-4">
          <v-text-field
            v-model="newPassword"
            label="Nueva contraseña"
            variant="outlined"
            density="comfortable"
            :type="showNewPassword ? 'text' : 'password'"
            :append-inner-icon="showNewPassword ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append-inner="showNewPassword = !showNewPassword"
            :rules="passwordRules"
            class="mb-4"
          />
          <v-text-field
            v-model="confirmPassword"
            label="Confirmar contraseña"
            variant="outlined"
            density="comfortable"
            :type="showConfirmPassword ? 'text' : 'password'"
            :append-inner-icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append-inner="showConfirmPassword = !showConfirmPassword"
            :rules="confirmPasswordRules"
          />
        </div>
      </v-card-text>

      <!-- Acciones -->
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          class="text-none"
          color="grey-lighten-3"
          variant="flat"
          @click="close"
          :disabled="loading"
        >
          Cancelar
        </v-btn>
        
        <!-- Botón Reenviar código (solo paso 2) -->
        <v-btn
          v-if="step === 2 && !isTimerActive"
          color="cyan-darken-3"
          class="gradient-btn text-subtitle-1"
          variant="flat"
          style="text-transform: none;"
          @click="resendCode"
          :disabled="loading"
        >
          Reenviar código
        </v-btn>
        
        <!-- Botón Verificar código (solo paso 2) -->
        <v-btn
          v-if="step === 2 && isTimerActive"
          color="cyan-darken-3"
          class="gradient-btn text-subtitle-1"
          variant="flat"
          style="text-transform: none;"
          @click="verifyCode"
          :disabled="loading || !isCodeComplete"
          :loading="loading"
        >
          Verificar código
        </v-btn>
        
        <!-- Botón Continuar (solo paso 1) -->
        <v-btn
          v-if="step === 1"
          color="cyan-darken-3"
          class="text-white text-subtitle-1 gradient-btn"
          variant="flat"
          style="text-transform: none;"
          @click="sendCode"
          :disabled="!isEmailValid"
          :loading="loading"
        >
          Continuar
        </v-btn>
        
        <!-- Botón Cambiar contraseña (solo paso 3) -->
        <v-btn
          v-if="step === 3"
          color="cyan-darken-3"
          class="gradient-btn text-subtitle-1"
          variant="flat"
          style="text-transform: none;"
          @click="updatePassword"
          :disabled="loading || !isPasswordValid"
          :loading="loading"
        >
          Cambiar contraseña
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { handleRequest } from "@/utils/api";

export default {
  name: "PasswordRecoveryDialog",
  
  props: {
    modelValue: {
      type: Boolean,
      default: false
    }
  },
  
  emits: ['update:modelValue', 'success', 'error'],
  
  data() {
    return {
      dialog: false,
      step: 1,
      email: '',
      code: ['', '', '', '', '', ''],
      newPassword: '',
      confirmPassword: '',
      userId: null,
      
      // Estados
      loading: false,
      showNewPassword: false,
      showConfirmPassword: false,
      isTimerActive: false,
      secondsRemaining: 180,
      
      // Referencias
      inputRefs: [],
      timer: null,
      
      // Reglas de validación
      emailRules: [
        v => !!v || 'El correo es requerido',
        v => /.+@.+\..+/.test(v) || 'Ingresa un correo válido'
      ],
      passwordRules: [
        v => !!v || 'La contraseña es requerida',
        v => (v && v.length >= 8) || 'Mínimo 8 caracteres',
        v => (v && /[A-Z]/.test(v)) || 'Debe tener al menos una mayúscula',
        v => (v && /\d/.test(v)) || 'Debe tener al menos un número'
      ]
    };
  },
  
  computed: {
    isEmailValid() {
      if (!this.email) return false;
      return this.emailRules.every(rule => rule(this.email) === true);
    },
    
    isCodeComplete() {
      return this.code.every(digit => digit !== '');
    },
    
    isPasswordValid() {
      return this.newPassword && 
             this.confirmPassword && 
             this.newPassword === this.confirmPassword &&
             this.passwordRules.every(rule => rule(this.newPassword) === true);
    },
    
    confirmPasswordRules() {
      return [
        v => !!v || 'Confirma la contraseña',
        v => v === this.newPassword || 'Las contraseñas no coinciden'
      ];
    }
  },
  
  watch: {
    modelValue(val) {
      this.dialog = val;
      if (val) {
        this.reset();
      }
    },
    
    dialog(val) {
      this.$emit('update:modelValue', val);
    }
  },
  
  methods: {
    // Resetear estado
    reset() {
      this.step = 1;
      this.email = '';
      this.code = ['', '', '', '', '', ''];
      this.newPassword = '';
      this.confirmPassword = '';
      this.userId = null;
      this.loading = false;
      this.showNewPassword = false;
      this.showConfirmPassword = false;
      this.stopTimer();
    },
    
    // Paso 1: Enviar código al correo
    async sendCode() {
      if (!this.isEmailValid) return;
      
      this.loading = true;
      try {
        const result = await handleRequest({
          endpoint: 'forgot-password',
          method: 'POST',
          data: { email: this.email },
          includeToken: false
        });
        
        if (result.success) {
          this.step = 2;
          this.startTimer();
          this.$emit('success', { message: 'Código enviado exitosamente' });
        } else {
          this.$emit('error', { message: result.message || 'Error al enviar código' });
        }
      } catch (error) {
        this.$emit('error', { message: 'Error de conexión' });
      } finally {
        this.loading = false;
      }
    },
    
    // Paso 2: Reenviar código
    async resendCode() {
      this.loading = true;
      try {
        const result = await handleRequest({
          endpoint: 'forgot-password',
          method: 'POST',
          data: { email: this.email },
          includeToken: false
        });
        
        if (result.success) {
          this.code = ['', '', '', '', '', ''];
          this.startTimer();
          this.$emit('success', { message: 'Código reenviado exitosamente' });
        } else {
          this.$emit('error', { message: result.message || 'Error al reenviar código' });
        }
      } catch (error) {
        this.$emit('error', { message: 'Error de conexión' });
      } finally {
        this.loading = false;
      }
    },
    
    // Paso 2: Verificar código
    async verifyCode() {
      if (!this.isCodeComplete) return;
      
      const fullCode = this.code.join('');
      this.loading = true;
      
      try {
        const result = await handleRequest({
          endpoint: 'verify-code-password',
          method: 'POST',
          data: { 
            email: this.email,
            code: fullCode 
          },
          includeToken: false
        });
        
        if (result.success) {
          this.userId = result.data.userId;
          this.step = 3;
          this.stopTimer();
        } else {
          this.code = ['', '', '', '', '', ''];
          this.$emit('error', { message: result.message || 'Código incorrecto' });
        }
      } catch (error) {
        this.$emit('error', { message: 'Error al verificar código' });
      } finally {
        this.loading = false;
      }
    },
    
    // Paso 3: Actualizar contraseña
    async updatePassword() {
      if (!this.isPasswordValid) return;
      
      this.loading = true;
      try {
        const result = await handleRequest({
          endpoint: 'reset-password',
          method: 'POST',
          data: {
            email: this.email,
            user_id: this.userId,
            newPassword: this.newPassword
          }
        });
        
        if (result.success) {
          this.$emit('success', { message: 'Contraseña actualizada exitosamente' });
          this.close();
        } else {
          this.$emit('error', { message: result.message || 'Error al cambiar la contraseña' });
        }
      } catch (error) {
        this.$emit('error', { message: 'Error de conexión' });
      } finally {
        this.loading = false;
      }
    },
    
    // Manejo del timer
    startTimer() {
      this.stopTimer();
      this.secondsRemaining = 180;
      this.isTimerActive = true;
      
      this.timer = setInterval(() => {
        this.secondsRemaining--;
        if (this.secondsRemaining <= 0) {
          this.stopTimer();
        }
      }, 1000);
    },
    
    stopTimer() {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
      this.isTimerActive = false;
    },
    
    formatTime(seconds) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    },
    
    // Manejo de inputs del código
    handleInput(index) {
      if (this.code[index]?.length === 1 && index < 5) {
        this.$nextTick(() => {
          const nextInput = this.inputRefs[index + 1];
          if (nextInput && nextInput.$el) {
            const inputEl = nextInput.$el.querySelector('input');
            if (inputEl) inputEl.focus();
          }
        });
      }
    },
    
    handleKeydown(index, event) {
      if (event.key === 'Backspace' && !this.code[index] && index > 0) {
        this.$nextTick(() => {
          const prevInput = this.inputRefs[index - 1];
          if (prevInput && prevInput.$el) {
            const inputEl = prevInput.$el.querySelector('input');
            if (inputEl) {
              inputEl.focus();
              inputEl.select();
            }
          }
        });
      }
    },
    
    selectContent(event) {
      event.target.select();
    },
    
    close() {
      this.stopTimer();
      this.dialog = false;
      this.reset();
    }
  },
  
  beforeUnmount() {
    this.stopTimer();
  }
};
</script>

<style scoped>
    .gradient-btn {
  background: linear-gradient(90deg, #3b82f6, #1d4ed8);
  color: white;
  font-weight: 600;
  transition: all 0.3s ease;
}
.gradient-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(29, 78, 216, 0.4);
}
:deep(.digit-filled .v-field__outline__border) {
  border-color: rgb(var(--v-theme-green)) !important;
}

:deep(.digit-filled .v-field__outline__notch::before),
:deep(.digit-filled .v-field__outline__notch::after) {
  border-color: rgb(var(--v-theme-green)) !important;
}

:deep(.large-centered-input input) {
  font-size: 24px !important;
  text-align: center !important;
  font-weight: 500;
}
</style>