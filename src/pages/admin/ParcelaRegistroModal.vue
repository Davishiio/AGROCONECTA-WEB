<!-- ... (TEMPLATE IGUAL, SOLO ACTUALIZAMOS EL SCRIPT) ... -->
<template>
  <div class="modal-backdrop fade show" v-if="show"></div>
  <div class="modal fade show d-block" v-if="show" tabindex="-1" role="dialog">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
        <div class="modal-header bg-agro-navy text-white px-4 py-3 border-0">
          <h5 class="modal-title fw-bold">Registrar Nuevo Predio</h5>
          <button type="button" class="btn-close btn-close-white" @click="handleClose"></button>
        </div>
        <div class="modal-body p-4 bg-light">
          <form @submit.prevent="handleSubmit">
            <!-- Inputs (Igual que antes) -->
            <div class="mb-3">
              <label class="form-label fw-bold text-agro-navy small">Nombre</label>
              <input v-model="form.nombreParcela" type="text" class="form-control" required>
            </div>
            <div class="mb-3">
              <label class="form-label fw-bold text-agro-navy small">ID / Clave Catastral</label>
              <input v-model="form.idParcelaGeo" type="number" class="form-control" min="1" max="225" required>
            </div>
            <div class="mb-4">
              <label class="form-label fw-bold text-agro-navy small">Documento</label>
              <input type="file" class="form-control" @change="handleFileChange" accept=".pdf,.jpg,.png" required>
            </div>

            <!-- ERROR VISIBLE -->
            <div v-if="errorMsg" class="alert alert-danger py-2 small border-0 d-flex align-items-center gap-2">
              <i class="bi bi-exclamation-triangle-fill"></i>
              <div>
                <strong>Error:</strong> {{ errorMsg }}
                <ul v-if="validationErrors.length" class="mb-0 ps-3 mt-1">
                  <li v-for="(e, i) in validationErrors" :key="i">{{ e }}</li>
                </ul>
              </div>
            </div>

            <div class="d-grid gap-2">
              <button type="submit" class="btn btn-agro-primary py-2 fw-bold" :disabled="submitting">
                {{ submitting ? 'Enviando...' : 'Dar de Alta' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { registrarParcela } from '@/services/parcelas.api'
import '@/assets/agro-theme.css'

const props = defineProps({ show: Boolean })
const emit = defineEmits(['close', 'success'])

const form = ref({ idParcelaGeo: '', nombreParcela: '', documento: null })
const submitting = ref(false)
const errorMsg = ref('')
const validationErrors = ref([])

watch(() => props.show, (val) => {
  if (val) {
    form.value = { idParcelaGeo: '', nombreParcela: '', documento: null }
    errorMsg.value = ''
    validationErrors.value = []
    submitting.value = false
  }
})

const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (file) form.value.documento = file
}

const handleSubmit = async () => {
  if (!form.value.documento) {
    errorMsg.value = "Falta el documento."
    return
  }
  submitting.value = true
  errorMsg.value = ''
  validationErrors.value = []

  try {
    await registrarParcela(form.value)
    emit('success')
    handleClose()
  } catch (error) {
    console.error("Error parcela:", error)
    if (error.response) {
      if (error.response.status === 422) {
        errorMsg.value = "Datos inválidos."
        // Capturamos errores específicos de Laravel (ej. "El campo idParcelaGeo ya existe")
        if (error.response.data.errors) {
          validationErrors.value = Object.values(error.response.data.errors).flat()
        } else if (error.response.data.message) {
          errorMsg.value = error.response.data.message
        }
      } else if (error.response.status === 409) {
        errorMsg.value = "Esta clave catastral ya está registrada."
      } else {
        errorMsg.value = error.response.data?.message || "Error del servidor."
      }
    } else {
      errorMsg.value = "Error de conexión."
    }
  } finally {
    submitting.value = false
  }
}

const handleClose = () => { if (!submitting.value) emit('close') }
</script>

<style scoped>
.modal-backdrop { background-color: rgba(30, 58, 95, 0.6); backdrop-filter: blur(4px); z-index: 1060; }
.modal { z-index: 1065; }
</style>