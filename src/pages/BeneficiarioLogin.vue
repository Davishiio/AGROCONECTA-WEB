<template>
  <div class="login-container d-flex align-items-center justify-content-center min-vh-100 py-5" style="background-color: #f0f2f5;">
    <div class="card border-0 shadow-lg rounded-4 overflow-hidden" style="max-width: 900px; width: 100%;">
      <div class="row g-0">

        <!-- Columna Izquierda: Formulario -->
        <div class="col-lg-6 bg-white p-4 p-md-5 order-2 order-lg-1">
          <div class="d-flex align-items-center gap-3 mb-4">
            <img src="/img/logo.svg" alt="AgroConecta" class="logo-small" />
            <!-- Texto Azul Navy para contraste -->
            <h4 class="fw-bold text-agro-navy mb-0">AgroConecta</h4>
          </div>

          <div class="mb-4">
            <h2 class="fw-bold text-dark mb-1">¡Hola de nuevo!</h2>
            <p class="text-muted small">Ingresa a tu portal de beneficiario.</p>
          </div>

          <form @submit.prevent="handleLogin">
            <div class="mb-3">
              <label class="form-label small fw-bold text-agro-navy text-uppercase ls-1">CURP</label>
              <div class="input-group">
                <!-- Icono en esmeralda -->
                <span class="input-group-text bg-light border-0 text-agro-emerald"><i class="bi bi-person-vcard"></i></span>
                <input
                    v-model="curp"
                    type="text"
                    class="form-control bg-light border-0 py-2 text-uppercase"
                    placeholder="Tu CURP"
                    required
                >
              </div>
            </div>

            <div class="mb-4">
              <div class="d-flex justify-content-between align-items-center">
                <label class="form-label small fw-bold text-agro-navy text-uppercase ls-1">Contraseña</label>
              </div>
              <div class="input-group">
                <span class="input-group-text bg-light border-0 text-agro-emerald"><i class="bi bi-lock"></i></span>
                <input
                    v-model="password"
                    :type="showPassword ? 'text' : 'password'"
                    class="form-control bg-light border-0 py-2"
                    placeholder="••••••••"
                    required
                >
                <button class="btn btn-light border-0 text-muted" type="button" @click="showPassword = !showPassword">
                  <i class="bi" :class="showPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
                </button>
              </div>
            </div>

            <div v-if="errorMsg" class="alert alert-danger py-2 small mb-3 border-0 bg-agro-clay text-white">
              <i class="bi bi-exclamation-circle-fill me-1"></i> {{ errorMsg }}
            </div>

            <!-- Botón Login: Verde Esmeralda -->
            <button
                type="submit"
                class="btn btn-agro-primary w-100 py-2 fw-bold shadow-sm mb-4"
                :disabled="loading"
            >
              <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
              {{ loading ? 'Entrando...' : 'Ingresar' }}
            </button>

            <div class="text-center border-top pt-4">
              <p class="small text-muted mb-2">¿Eres nuevo en la plataforma?</p>
              <!-- Botón Outline Esmeralda -->
              <router-link
                  to="/registro"
                  class="btn btn-outline-agro btn-sm rounded-pill px-4"
              >
                Crear una cuenta
              </router-link>
            </div>
          </form>
        </div>

        <!-- Columna Derecha: Branding VERDE ESMERALDA -->
        <div class="col-lg-6 d-none d-lg-flex flex-column align-items-center justify-content-center p-5 text-center position-relative order-1 order-lg-2 overflow-hidden bg-agro-emerald">
          <div class="position-relative z-1">
            <img src="/img/logo.svg" alt="Logo Grande" class="mb-4" style="width: 180px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));" />

            <h3 class="fw-bold text-white">Impulso al Campo</h3>
            <p class="mt-2 fs-6 text-white opacity-90">
              Conectando oportunidades para los productores de nuestro estado.
            </p>
          </div>

          <!-- Patrón decorativo sutil -->
          <div class="position-absolute opacity-10" style="width: 200%; height: 200%; background: radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 60%);"></div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import '@/assets/agro-theme.css'

const auth = useAuthStore()
const router = useRouter()
const curp = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const errorMsg = ref('')

const handleLogin = async () => {
  loading.value = true; errorMsg.value = ''
  try {
    await auth.loginBeneficiario(curp.value, password.value)
    // Navegar al dashboard de beneficiario en éxito
    await router.push('/beneficiario')
  } catch (error) {
    errorMsg.value = error.response?.status === 401 ? 'Credenciales incorrectas.' : 'Error de conexión.'
  } finally { loading.value = false }
}
</script>

<style scoped>
.logo-small { height: 40px; width: auto; }
.ls-1 { letter-spacing: 1px; }
</style>