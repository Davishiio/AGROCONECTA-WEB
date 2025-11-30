<template>
  <!-- Fondo suave (Crema o Blanco) -->
  <div class="register-container d-flex align-items-center justify-content-center min-vh-100 py-5" style="background-color: #f8f9fa;">
    <div class="card border-0 shadow-lg rounded-4 overflow-hidden" style="max-width: 980px; width: 100%;">
      <div class="row g-0">

        <!-- Sidebar Branding: PREDOMINA EL VERDE ESMERALDA -->
        <div class="col-lg-4 d-none d-lg-flex flex-column align-items-center justify-content-center p-5 text-center position-relative bg-agro-emerald">
          <div class="position-relative z-1">
            <img src="/img/logo.svg" alt="Logo" class="mb-4" style="width: 140px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));" />
            <h2 class="fw-bold text-white">Únete a AgroConecta</h2>
            <p class="text-white opacity-90 mt-3 fs-6">
              La plataforma oficial para gestionar tus apoyos agrícolas de manera transparente.
            </p>

            <div class="mt-5">
              <p class="text-white small mb-2 opacity-75">¿Ya tienes cuenta?</p>
              <router-link to="/login" class="btn btn-outline-light rounded-pill px-4 fw-bold w-100">
                Iniciar Sesión
              </router-link>
            </div>
          </div>
          <!-- Decoración de fondo -->
          <i class="bi bi-flower1 position-absolute text-white opacity-10" style="font-size: 15rem; bottom: -50px; left: -50px;"></i>
        </div>

        <!-- Formulario -->
        <div class="col-lg-8 bg-white">
          <div class="card-body p-4 p-md-5">
            <div class="d-flex justify-content-between align-items-center mb-4">
              <!-- Título en Azul para contraste -->
              <h3 class="fw-bold text-agro-navy mb-0">Crear Cuenta</h3>
              <router-link to="/login" class="d-lg-none text-agro-emerald fw-bold text-decoration-none small">
                Ya tengo cuenta
              </router-link>
            </div>

            <form @submit.prevent="handleSubmit" class="row g-3 needs-validation">

              <!-- Datos Personales -->
              <div class="col-12">
                <h6 class="text-agro-emerald text-uppercase small ls-1 border-bottom pb-2 mb-0 fw-bold">
                  <i class="bi bi-person-lines-fill me-1"></i> Datos Personales
                </h6>
              </div>

              <div class="col-md-4">
                <label class="form-label small fw-bold text-agro-navy">Nombre(s)</label>
                <input v-model="form.nombre" type="text" class="form-control bg-light border-0" placeholder="Ej. Juan" required>
              </div>
              <div class="col-md-4">
                <label class="form-label small fw-bold text-agro-navy">Apellido Paterno</label>
                <input v-model="form.apellido_paterno" type="text" class="form-control bg-light border-0" placeholder="Ej. Pérez" required>
              </div>
              <div class="col-md-4">
                <label class="form-label small fw-bold text-agro-navy">Apellido Materno</label>
                <input v-model="form.apellido_materno" type="text" class="form-control bg-light border-0" placeholder="Ej. López">
              </div>

              <div class="col-md-6">
                <label class="form-label small fw-bold text-agro-navy">CURP</label>
                <input
                    v-model="form.CURP"
                    type="text"
                    class="form-control bg-light border-0 text-uppercase"
                    required
                    minlength="18"
                    maxlength="18"
                    placeholder="18 caracteres"
                >
                <!-- ETIQUETA DE AYUDA RECUPERADA -->
                <div class="form-text-agro"><i class="bi bi-info-circle me-1"></i>Tu identificador oficial único.</div>
              </div>

              <!-- Ubicación -->
              <div class="col-12 mt-4">
                <h6 class="text-agro-emerald text-uppercase small ls-1 border-bottom pb-2 mb-0 fw-bold">
                  <i class="bi bi-geo-alt-fill me-1"></i> Ubicación
                </h6>
              </div>

              <div class="col-md-6">
                <label class="form-label small fw-bold text-agro-navy">Municipio</label>
                <select v-model="selectedMunicipio" class="form-select bg-light border-0" required @change="handleMunicipioChange">
                  <option value="" disabled selected>Selecciona tu municipio</option>
                  <option v-for="m in municipios" :key="m.idMunicipio" :value="m.idMunicipio">{{ m.nombreMunicipio }}</option>
                </select>
                <div class="form-text-agro">El municipio donde resides.</div>
              </div>

              <div class="col-md-6">
                <label class="form-label small fw-bold text-agro-navy">Comunidad</label>
                <select
                    v-model="form.idComunidad"
                    class="form-select bg-light border-0"
                    :disabled="!selectedMunicipio || loadingComunidades"
                    required
                >
                  <option value="" disabled selected>
                    {{ loadingComunidades ? 'Cargando...' : 'Selecciona tu comunidad' }}
                  </option>
                  <option v-for="c in comunidades" :key="c.idComunidad" :value="c.idComunidad">{{ c.nombreComunidad }}</option>
                </select>
                <!-- MENSAJE DE ERROR RECUPERADO -->
                <div v-if="comunidades.length === 0 && selectedMunicipio && !loadingComunidades" class="text-danger x-small mt-1">
                  <i class="bi bi-exclamation-triangle me-1"></i>No hay comunidades registradas para este municipio.
                </div>
              </div>

              <!-- Seguridad -->
              <div class="col-12 mt-4">
                <h6 class="text-agro-emerald text-uppercase small ls-1 border-bottom pb-2 mb-0 fw-bold">
                  <i class="bi bi-shield-lock-fill me-1"></i> Seguridad y Contacto
                </h6>
              </div>

              <div class="col-md-6">
                <label class="form-label small fw-bold text-agro-navy">Correo Electrónico</label>
                <input v-model="form.correo" type="email" class="form-control bg-light border-0" required placeholder="nombre@ejemplo.com">
                <div class="form-text-agro">Lo usaremos para notificaciones importantes.</div>
              </div>
              <div class="col-md-6">
                <label class="form-label small fw-bold text-agro-navy">Teléfono Celular</label>
                <input v-model="form.telefono" type="tel" class="form-control bg-light border-0" required maxlength="10" placeholder="10 dígitos">
              </div>

              <div class="col-md-6">
                <label class="form-label small fw-bold text-agro-navy">Contraseña</label>
                <input v-model="form.password" type="password" class="form-control bg-light border-0" required minlength="8">
                <div class="form-text-agro">Mínimo 8 caracteres.</div>
              </div>
              <div class="col-md-6">
                <label class="form-label small fw-bold text-agro-navy">Confirmar Contraseña</label>
                <input
                    v-model="form.password_confirmation"
                    type="password"
                    class="form-control bg-light border-0"
                    :class="{'is-invalid': form.password && form.password_confirmation && form.password !== form.password_confirmation}"
                    required
                >
                <div class="invalid-feedback">Las contraseñas no coinciden.</div>
              </div>

              <div class="col-12 mt-3">
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" required id="terms">
                  <label class="form-check-label small text-muted" for="terms">
                    Acepto los <a href="#" class="text-agro-emerald fw-bold">Términos y Condiciones</a>
                  </label>
                </div>
              </div>

              <!-- Botón Principal VERDE ESMERALDA -->
              <div class="col-12 mt-4">
                <div v-if="errorMsg" class="alert alert-danger py-2 small mb-3 border-0 bg-agro-clay text-white">
                  <i class="bi bi-exclamation-circle me-1"></i> {{ errorMsg }}
                </div>

                <button
                    type="submit"
                    class="btn btn-agro-primary w-100 py-2 fw-bold shadow-sm"
                    :disabled="loading"
                >
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                  Crear Mi Cuenta
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchMunicipios, fetchComunidadesByMunicipio } from '@/services/geo.api'
import { useAuthStore } from '@/stores/auth'
import '@/assets/agro-theme.css'

const auth = useAuthStore()
const router = useRouter()
const loading = ref(false)
const loadingComunidades = ref(false)
const errorMsg = ref('')
const municipios = ref([])
const comunidades = ref([])
const selectedMunicipio = ref('')

const form = ref({
  nombre: '', apellido_paterno: '', apellido_materno: '',
  CURP: '', correo: '', telefono: '',
  password: '', password_confirmation: '', idComunidad: '',
  terminosycondiciones: true
})

onMounted(async () => {
  try { municipios.value = await fetchMunicipios() } catch (e) {}
})

const handleMunicipioChange = async () => {
  form.value.idComunidad = ''
  comunidades.value = []
  if (!selectedMunicipio.value) return
  loadingComunidades.value = true
  try {
    comunidades.value = await fetchComunidadesByMunicipio(selectedMunicipio.value)
  } finally { loadingComunidades.value = false }
}

const handleSubmit = async () => {
  if (form.value.password !== form.value.password_confirmation) {
    errorMsg.value = 'Las contraseñas no coinciden'
    return
  }
  loading.value = true
  errorMsg.value = ''
  try {
    const ok = await auth.registerBeneficiario({ ...form.value, idComunidad: Number(form.value.idComunidad) })
    if (ok) {
      await router.push('/beneficiario')
    }
  } catch (error) {
    errorMsg.value = error.response?.data?.message || 'Ocurrió un error al registrarse.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.ls-1 { letter-spacing: 1px; }
.x-small { font-size: 0.75rem; }
</style>