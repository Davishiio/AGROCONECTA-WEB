<template>
  <div class="auth-bg d-flex align-items-center justify-content-center">
    <!-- blobs decorativos -->
    <div class="blob blob-1"></div>
    <div class="blob blob-2"></div>

    <div class="container position-relative" style="z-index:1;">
      <!-- HERO: imagen grande y título -->
      <div class="text-center mb-4">
        <img src="/img/logo.svg" alt="AgroConecta Q.Roo" class="hero-logo img-fluid" />
        <h1 class="display-6 fw-semibold text-success mt-3">AGROCONECTA Q.ROO</h1>
      </div>

      <!-- Card de login -->
      <div class="mx-auto card shadow-sm border-0 auth-card">
        <div class="card-body p-4 p-md-5">
          <h2 class="h5 text-center mb-4">Iniciar sesión</h2>

          <form @submit.prevent="onSubmit" novalidate>
            <div class="mb-3">
              <label class="form-label ">Correo </label>
              <input
                  v-model.trim="email"
                  type="email"
                  inputmode="email"
                  autocomplete="username"
                  class="form-control"
                  placeholder="correo@qroo.gob.mx"
                  required
              />
            </div>

            <div class="mb-2">
              <label class="form-label">Contraseña</label>
              <div class="input-group">
                <input
                    :type="showPass ? 'text' : 'password'"
                    v-model.trim="password"
                    class="form-control"
                    placeholder="••••••••"
                    required
                    minlength="6"
                    autocomplete="current-password"
                />
                <button type="button" class="btn btn-outline-secondary" @click="showPass = !showPass" title="Mostrar/ocultar">
                  <i :class="showPass ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                </button>
              </div>
            </div>

            <div class="d-grid mt-3">
              <button class="btn btn-brand btn-lg" type="submit" :disabled="loading || !email || !password">
                <span v-if="!loading">Entrar</span>
                <span v-else class="d-inline-flex align-items-center gap-2">
                  <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  Validando…
                </span>
              </button>
            </div>

            <p v-if="error" class="text-danger small mt-3 mb-0">{{ error }}</p>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const showPass = ref(false)
const loading = ref(false)
const error = ref('')
const router = useRouter()
const auth = useAuthStore()

const onSubmit = async () => {
  error.value = ''
  loading.value = true
  try {
    await auth.login(email.value, password.value)
    router.replace('/admin')
  } catch (e) {
    error.value = (e?.response?.data?.message) || 'Credenciales inválidas'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-bg { background-color:#f8fbff; position:relative; min-height:100vh; overflow:hidden; padding: 48px 16px; }
.blob { position:absolute; border-radius:9999px; opacity:.35; }
.blob-1 { width:280px; height:280px; left:-80px; top:-80px; background:#e8eef7; }
.blob-2 { width:360px; height:360px; right:-100px; bottom:-120px; background:#cfe2ff; }

.hero-logo { max-width: 260px; width: 100%; filter: drop-shadow(0 6px 12px rgba(0,0,0,.06)); }
.auth-card { max-width:560px; width:100%; }
.btn-brand { background-color:#16A34A; border-color:#16A34A; }
.btn-brand:hover { background-color:#138a3f; border-color:#138a3f; }
/* Por si algún tema inyecta navbar: ocultar toggler */
.navbar-toggler { display:none !important; }
</style>
