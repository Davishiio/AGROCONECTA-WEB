<template>
  <div class="register-container d-flex align-items-center justify-content-center min-vh-100 py-5">
    <div class="card border-0 shadow-lg rounded-4 overflow-hidden" style="max-width: 900px; width: 100%;">
      <div class="row g-0">

        <!-- Sidebar decorativo (visible en desktop) -->
        <div class="col-lg-4 bg-success text-white d-none d-lg-flex flex-column align-items-center justify-content-center p-5 text-center position-relative">
          <div class="position-relative z-1">
            <i class="bi bi-flower1 mb-3" style="font-size: 4rem;"></i>
            <h2 class="fw-bold">AgroConecta</h2>
            <p class="opacity-75 mt-3">Únete a la plataforma digital para el campo. Gestiona tus apoyos de manera sencilla y transparente.</p>
            <router-link to="/login" class="btn btn-outline-light mt-4 rounded-pill px-4">
              ¿Ya tienes cuenta? Inicia sesión
            </router-link>
          </div>
          <!-- Patrón de fondo -->
          <i class="bi bi-tree-fill position-absolute opacity-10" style="font-size: 15rem; bottom: -50px; left: -50px;"></i>
        </div>

        <!-- Formulario -->
        <div class="col-lg-8 bg-white">
          <div class="card-body p-4 p-md-5">
            <div class="d-flex justify-content-between align-items-center mb-4">
              <h3 class="fw-bold text-dark mb-0">Crear Cuenta</h3>
              <router-link to="/login" class="d-lg-none text-success fw-bold text-decoration-none small">
                Iniciar Sesión
              </router-link>
            </div>

            <form @submit.prevent="handleSubmit" class="row g-3 needs-validation">

              <!-- Sección: Datos Personales -->
              <div class="col-12"><h6 class="text-muted text-uppercase small ls-1 border-bottom pb-2 mb-0">Datos Personales</h6></div>

              <div class="col-md-4">
                <label class="form-label small fw-bold">Nombre(s)</label>
                <input v-model="form.nombre" type="text" class="form-control bg-light border-0" required placeholder="Ej. Juan">
              </div>
              <div class="col-md-4">
                <label class="form-label small fw-bold">Apellido Paterno</label>
                <input v-model="form.apellido_paterno" type="text" class="form-control bg-light border-0" required placeholder="Ej. Pérez">
              </div>
              <div class="col-md-4">
                <label class="form-label small fw-bold">Apellido Materno</label>
                <input v-model="form.apellido_materno" type="text" class="form-control bg-light border-0" placeholder="Ej. López">
              </div>

              <div class="col-md-6">
                <label class="form-label small fw-bold">CURP</label>
                <input v-model="form.CURP" type="text" class="form-control bg-light border-0 text-uppercase" required minlength="18" maxlength="18" placeholder="18 Caracteres">
                <div class="form-text x-small">Tu identificador oficial único.</div>
              </div>

              <!-- Sección: Ubicación (Cascada) -->
              <div class="col-12 mt-4"><h6 class="text-muted text-uppercase small ls-1 border-bottom pb-2 mb-0">Ubicación</h6></div>

              <div class="col-md-6">
                <label class="form-label small fw-bold">Municipio</label>
                <select
                    v-model="selectedMunicipio"
                    class="form-select bg-light border-0"
                    required
                    @change="handleMunicipioChange"
                >
                  <option value="" disabled selected>Selecciona tu municipio</option>
                  <option v-for="m in municipios" :key="m.idMunicipio" :value="m.idMunicipio">
                    {{ m.nombreMunicipio }}
                  </option>
                </select>
              </div>

              <div class="col-md-6">
                <label class="form-label small fw-bold">Comunidad / Localidad</label>
                <select
                    v-model="form.idComunidad"
                    class="form-select bg-light border-0"
                    :disabled="!selectedMunicipio || loadingComunidades"
                    required
                >
                  <option value="" disabled selected>
                    {{ loadingComunidades ? 'Cargando...' : 'Selecciona tu comunidad' }}
                  </option>
                  <option v-for="c in comunidades" :key="c.idComunidad" :value="c.idComunidad">
                    {{ c.nombreComunidad }}
                  </option>
                </select>
                <div v-if="comunidades.length === 0 && selectedMunicipio && !loadingComunidades" class="text-danger x-small mt-1">
                  No hay comunidades registradas para este municipio.
                </div>
              </div>

              <!-- Sección: Cuenta y Seguridad -->
              <div class="col-12 mt-4"><h6 class="text-muted text-uppercase small ls-1 border-bottom pb-2 mb-0">Seguridad y Contacto</h6></div>

              <div class="col-md-6">
                <label class="form-label small fw-bold">Correo Electrónico</label>
                <input v-model="form.correo" type="email" class="form-control bg-light border-0" required placeholder="nombre@ejemplo.com">
              </div>
              <div class="col-md-6">
                <label class="form-label small fw-bold">Teléfono Celular</label>
                <input v-model="form.telefono" type="tel" class="form-control bg-light border-0" required maxlength="10" placeholder="10 dígitos">
              </div>

              <div class="col-md-6">
                <label class="form-label small fw-bold">Contraseña</label>
                <input v-model="form.password" type="password" class="form-control bg-light border-0" required minlength="8">
              </div>
              <div class="col-md-6">
                <label class="form-label small fw-bold">Confirmar Contraseña</label>
                <input
                    v-model="form.password_confirmation"
                    type="password"
                    class="form-control bg-light border-0"
                    :class="{'is-invalid': passwordMismatch}"
                    required
                >
                <div class="invalid-feedback">Las contraseñas no coinciden.</div>
              </div>

              <!-- Términos -->
              <div class="col-12 mt-3">
                <div class="form-check">
                  <input v-model="form.terminosycondiciones" class="form-check-input" type="checkbox" id="termsCheck" required>
                  <label class="form-check-label small text-muted" for="termsCheck">
                    Acepto los <a href="#" class="text-success fw-bold text-decoration-none">Términos y Condiciones</a> y el Aviso de Privacidad de AgroConecta.
                  </label>
                </div>
              </div>

              <!-- Botones -->
              <div class="col-12 mt-4">
                <div v-if="errorMsg" class="alert alert-danger py-2 small mb-3">{{ errorMsg }}</div>

                <button
                    type="submit"
                    class="btn btn-success w-100 py-2 fw-bold shadow-sm"
                    :disabled="loading || passwordMismatch"
                >
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                  {{ loading ? 'Registrando...' : 'Crear Cuenta' }}
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
import { ref, computed, onMounted } from 'vue'
import { fetchMunicipios, fetchComunidadesByMunicipio } from '@/services/geo.api'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

// Estados de Carga
const loading = ref(false)
const loadingComunidades = ref(false)
const errorMsg = ref('')

// Datos geográficos
const municipios = ref([])
const comunidades = ref([])
const selectedMunicipio = ref('') // Solo para controlar el select, no se envía al back

// Formulario
const form = ref({
  nombre: '',
  apellido_paterno: '',
  apellido_materno: '',
  CURP: '',
  correo: '',
  telefono: '',
  password: '',
  password_confirmation: '',
  idComunidad: '',
  terminosycondiciones: false
})

// Validación simple de password
const passwordMismatch = computed(() => {
  return form.value.password &&
      form.value.password_confirmation &&
      form.value.password !== form.value.password_confirmation
})

// 1. Cargar Municipios al montar
onMounted(async () => {
  try {
    municipios.value = await fetchMunicipios()
  } catch (error) {
    console.error('Error cargando municipios', error)
    errorMsg.value = 'No se pudo cargar la lista de municipios.'
  }
})

// 2. Manejar cambio de municipio (Cascada)
const handleMunicipioChange = async () => {
  // Resetear comunidad
  form.value.idComunidad = ''
  comunidades.value = []

  if (!selectedMunicipio.value) return

  loadingComunidades.value = true
  try {
    comunidades.value = await fetchComunidadesByMunicipio(selectedMunicipio.value)
  } catch (error) {
    console.error('Error cargando comunidades', error)
  } finally {
    loadingComunidades.value = false
  }
}

// 3. Enviar formulario
const handleSubmit = async () => {
  if (passwordMismatch.value) return

  loading.value = true
  errorMsg.value = ''

  try {
    // Convertir ID a número si es necesario por el backend
    const payload = {
      ...form.value,
      idComunidad: Number(form.value.idComunidad)
    }

    await auth.registerBeneficiario(payload)
    // La redirección se maneja en el store, o aquí si prefieres
  } catch (error) {
    console.error(error)
    // Manejo básico de errores del backend (ej. CURP duplicada)
    if (error.response?.data?.message) {
      errorMsg.value = error.response.data.message
    } else if (error.response?.data?.errors) {
      // Si laravel devuelve objeto de errores, tomamos el primero
      const firstKey = Object.keys(error.response.data.errors)[0]
      errorMsg.value = error.response.data.errors[firstKey][0]
    } else {
      errorMsg.value = 'Ocurrió un error al registrar. Verifique sus datos.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-container {
  background-color: #f3f4f6;
  background-image: radial-gradient(#e5e7eb 1px, transparent 1px);
  background-size: 20px 20px;
}
.ls-1 {
  letter-spacing: 1px;
}
.x-small {
  font-size: 0.75rem;
}
</style>