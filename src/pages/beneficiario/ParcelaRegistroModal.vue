<template>
  <div class="modal-backdrop fade show" v-if="show"></div>
  <div class="modal fade show d-block" v-if="show" tabindex="-1" role="dialog" data-bs-backdrop="static">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">

        <!-- Header -->
        <div class="modal-header bg-agro-navy text-white px-4 py-3 border-0">
          <div>
            <h5 class="modal-title fw-bold">Registrar Nuevo Predio</h5>
            <p class="mb-0 small opacity-75">Da de alta tu parcela para solicitar apoyos.</p>
          </div>
          <button type="button" class="btn-close btn-close-white" @click="handleClose" :disabled="submitting"></button>
        </div>

        <div class="modal-body p-4 bg-light">
          <form @submit.prevent="handleSubmit">

            <!-- Nombre de la Parcela -->
            <div class="mb-3">
              <label class="form-label fw-bold text-agro-navy small text-uppercase ls-1">Nombre del Predio</label>
              <div class="input-group">
                <span class="input-group-text bg-white text-agro-emerald border-end-0"><i class="bi bi-tag-fill"></i></span>
                <input
                    v-model="form.nombreParcela"
                    type="text"
                    class="form-control border-start-0 ps-0 focus-emerald"
                    placeholder="Ej. Parcela Santa María"
                    required
                >
              </div>
            </div>

            <!-- ID Catastral (Validación 1-225) -->
            <div class="mb-3">
              <label class="form-label fw-bold text-agro-navy small text-uppercase ls-1">
                ID / Clave Catastral
              </label>
              <div class="input-group">
                <span class="input-group-text bg-white text-agro-emerald border-end-0"><i class="bi bi-hash"></i></span>
                <input
                    v-model="form.idParcelaGeo"
                    type="number"
                    class="form-control border-start-0 ps-0 focus-emerald"
                    placeholder="Ej. 105"
                    min="1"
                    max="225"
                    required
                    @input="validateIdRange"
                >
              </div>
              <div class="form-text small d-flex justify-content-between">
                <span>Ingresa el ID registrado en el sistema.</span>
                <span :class="isIdValid ? 'text-muted' : 'text-danger fw-bold'">Rango válido: 1 - 225</span>
              </div>
            </div>

            <!-- Carga de Documento -->
            <div class="mb-4">
              <label class="form-label fw-bold text-agro-navy small text-uppercase ls-1">Acreditación de Propiedad</label>
              <div class="card border-dashed bg-white text-center p-3 position-relative hover-shadow transition-all">
                <input
                    type="file"
                    class="position-absolute top-0 start-0 w-100 h-100 opacity-0 cursor-pointer"
                    @change="handleFileChange"
                    accept=".pdf,.jpg,.png"
                    required
                >
                <div v-if="!form.documento">
                  <i class="bi bi-cloud-arrow-up text-agro-emerald fs-2"></i>
                  <p class="mb-0 text-muted small fw-bold">Haz clic o arrastra tu archivo aquí</p>
                  <small class="text-muted x-small">(PDF, JPG o PNG)</small>
                </div>
                <div v-else class="d-flex align-items-center justify-content-center gap-2 text-success">
                  <i class="bi bi-file-earmark-check-fill fs-3"></i>
                  <div class="text-start overflow-hidden">
                    <div class="fw-bold small text-truncate" style="max-width: 200px;">{{ form.documento.name }}</div>
                    <div class="x-small text-muted">{{ (form.documento.size / 1024).toFixed(1) }} KB</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Mensajes de Error -->
            <div v-if="errorMsg" class="alert py-2 small border-0 shadow-sm d-flex align-items-start gap-2" :class="errorTypeClass">
              <i class="bi bi-exclamation-triangle-fill mt-1"></i>
              <div>{{ errorMsg }}</div>
            </div>

            <!-- Botones -->
            <div class="d-grid gap-2">
              <button
                  type="submit"
                  class="btn btn-agro-primary py-2 fw-bold shadow-sm"
                  :disabled="submitting || !isIdValid"
              >
                <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
                {{ submitting ? 'Registrando...' : 'Dar de Alta Predio' }}
              </button>
              <button type="button" class="btn btn-link text-decoration-none text-muted small" @click="handleClose" :disabled="submitting">
                Cancelar
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { registrarParcela } from '@/services/parcelas.api'
import '@/assets/agro-theme.css'

const props = defineProps({ show: Boolean })
const emit = defineEmits(['close', 'success'])

const form = ref({
  idParcelaGeo: '',
  nombreParcela: '',
  documento: null
})

const submitting = ref(false)
const errorMsg = ref('')
const errorCode = ref(null)
const isIdValid = ref(true)

watch(() => props.show, (val) => {
  if (val) {
    form.value = { idParcelaGeo: '', nombreParcela: '', documento: null }
    errorMsg.value = ''
    errorCode.value = null
    submitting.value = false
    isIdValid.value = true
  }
})

const validateIdRange = () => {
  const val = Number(form.value.idParcelaGeo)
  // Validación estricta: debe ser número entero entre 1 y 225
  if (!form.value.idParcelaGeo || val < 1 || val > 225) {
    isIdValid.value = false
  } else {
    isIdValid.value = true
  }
}

const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (file) form.value.documento = file
}

const errorTypeClass = computed(() => {
  if (errorCode.value === 409) return 'alert-warning text-dark' // Conflicto
  return 'alert-danger bg-agro-clay text-white' // Error general
})

const handleSubmit = async () => {
  validateIdRange()
  if (!isIdValid.value) {
    errorMsg.value = "El ID Catastral debe estar entre 1 y 225."
    return
  }

  if (!form.value.documento) {
    errorMsg.value = "Debes adjuntar el documento de propiedad."
    return
  }

  submitting.value = true
  errorMsg.value = ''
  errorCode.value = null

  try {
    const resp = await registrarParcela(form.value)
    // Emitimos la data para que el padre pueda mostrar URL u otros datos
    emit('success', resp)
    handleClose()
  } catch (error) {
    console.error("Error parcela:", error)
    if (error.response) {
      errorCode.value = error.response.status
      if (error.response.status === 409) {
        errorMsg.value = "Esta clave catastral ya está registrada en el sistema."
      } else if (error.response.status === 422) {
        errorMsg.value = "Datos inválidos. Verifica el archivo y los campos."
      } else {
        errorMsg.value = error.response.data?.message || "Ocurrió un error al registrar el predio."
      }
    } else {
      errorMsg.value = "Error de conexión."
    }
  } finally {
    submitting.value = false
  }
}

const handleClose = () => {
  if (!submitting.value) emit('close')
}
</script>

<style scoped>
.modal-backdrop { background-color: rgba(30, 58, 95, 0.6); backdrop-filter: blur(4px); z-index: 1060; }
.modal { z-index: 1065; }
.ls-1 { letter-spacing: 1px; }
.focus-emerald:focus { border-color: var(--agro-emerald); box-shadow: none; }
.border-dashed { border-style: dashed !important; border-width: 2px !important; }
.cursor-pointer { cursor: pointer; }
.hover-shadow:hover { box-shadow: 0 0.5rem 1rem rgba(0,0,0,0.1); background-color: #f8f9fa; }
.transition-all { transition: all 0.3s ease; }
.x-small { font-size: 0.75rem; }
</style>