<template>
  <div class="modal-backdrop fade show" v-if="show"></div>
  <div
      class="modal fade show d-block"
      v-if="show"
      tabindex="-1"
      role="dialog"
      data-bs-backdrop="static"
      data-bs-keyboard="false"
  >
    <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content border-0 shadow-lg rounded-4">

        <!-- Header Esmeralda -->
        <div class="modal-header bg-agro-emerald text-white px-4 py-3 border-0">
          <div>
            <h5 class="modal-title fw-bold">Solicitud de Apoyo</h5>
            <p class="mb-0 small opacity-90">Adjunta la documentación solicitada para: <strong>{{ nombreConvocatoria }}</strong></p>
          </div>
          <button type="button" class="btn-close btn-close-white" @click="handleClose" :disabled="submitting"></button>
        </div>

        <div class="modal-body p-4 bg-light">

          <!-- Loading State -->
          <div v-if="loadingRequisitos" class="text-center py-5">
            <div class="spinner-border text-agro-emerald" role="status"></div>
            <p class="text-muted mt-2 small">Cargando requisitos...</p>
          </div>

          <!-- Formulario -->
          <form v-else @submit.prevent="handleSubmit">

            <div class="alert alert-light border-start border-4 border-success shadow-sm mb-4">
              <div class="d-flex align-items-center gap-2">
                <i class="bi bi-info-circle-fill text-agro-emerald"></i>
                <span class="small text-muted">Asegúrate de que tus documentos sean legibles (PDF o Imagen). Los campos marcados con <span class="text-danger">*</span> son obligatorios.</span>
              </div>
            </div>

            <!-- Lista de Requisitos -->
            <div class="d-flex flex-column gap-3">
              <div
                  v-for="(item, index) in requisitos"
                  :key="item.requisito.id"
                  class="card border-0 shadow-sm transition-hover"
                  :class="{'border-start border-4 border-success': files[item.requisito.id]}"
              >
                <div class="card-body p-3 d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3">

                  <!-- Info del Requisito -->
                  <div class="flex-grow-1">
                    <label :for="'req-' + item.requisito.id" class="fw-bold text-agro-navy mb-1 d-block">
                      {{ item.requisito.nombre }}
                      <span v-if="item.requisito.obligatorio" class="text-danger">*</span>
                    </label>
                    <span v-if="item.archivo_cargado" class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill">
                      <i class="bi bi-check-circle me-1"></i> Documento ya en sistema
                    </span>
                    <span v-else class="text-muted small">
                      {{ item.requisito.temporal ? 'Vigencia temporal' : 'Documento permanente' }}
                    </span>
                  </div>

                  <!-- Input File -->
                  <div class="" style="min-width: 250px;">
                    <!-- Si ya tiene archivo cargado (permanente), mostramos estado OK, si no, input -->
                    <div v-if="!item.archivo_cargado" class="input-group input-group-sm">
                      <input
                          type="file"
                          class="form-control form-control-sm border-secondary border-opacity-25"
                          :id="'req-' + item.requisito.id"
                          @change="(e) => handleFileChange(e, item.requisito.id)"
                          :required="item.requisito.obligatorio"
                          accept=".pdf,.jpg,.jpeg,.png"
                      >
                    </div>
                    <div v-else class="text-end">
                      <button type="button" class="btn btn-sm btn-outline-secondary disabled border-0">
                        <i class="bi bi-file-earmark-check"></i> Cargado
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            <!-- Error Global -->
            <div v-if="errorMsg" class="alert alert-danger mt-3 py-2 small bg-agro-clay text-white border-0">
              <i class="bi bi-exclamation-triangle-fill me-2"></i> {{ errorMsg }}
            </div>

          </form>
        </div>

        <!-- Footer Actions -->
        <div class="modal-footer border-top bg-light py-3">
          <button
              type="button"
              class="btn btn-outline-secondary px-4 fw-bold"
              @click="handleClose"
              :disabled="submitting"
          >
            Cancelar
          </button>
          <button
              type="button"
              class="btn btn-agro-primary px-4 fw-bold shadow-sm"
              @click="handleSubmit"
              :disabled="submitting || !isFormValid"
          >
            <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
            {{ submitting ? 'Enviando...' : 'Confirmar Solicitud' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { fetchRequisitosConvocatoria, submitPostulacion } from '@/services/convocatorias.api'
import '@/assets/agro-theme.css'

const props = defineProps({
  show: Boolean,
  idConvocatoria: [Number, String],
  nombreConvocatoria: String
})

const emit = defineEmits(['close', 'success'])

const requisitos = ref([])
const files = ref({}) // Mapa de archivos: { idRequisito: File }
const loadingRequisitos = ref(false)
const submitting = ref(false)
const errorMsg = ref('')

// Cargar requisitos cuando se abre el modal
watch(() => props.show, async (newVal) => {
  if (newVal && props.idConvocatoria) {
    resetForm()
    await loadRequisitos()
  }
})

const loadRequisitos = async () => {
  loadingRequisitos.value = true
  try {
    requisitos.value = await fetchRequisitosConvocatoria(props.idConvocatoria)
  } catch (error) {
    errorMsg.value = 'No se pudieron cargar los requisitos. Intente nuevamente.'
  } finally {
    loadingRequisitos.value = false
  }
}

const handleFileChange = (event, idRequisito) => {
  const file = event.target.files[0]
  if (file) {
    files.value[idRequisito] = file
  } else {
    delete files.value[idRequisito]
  }
}

// Validación computada: Verifica que todos los obligatorios (que no tengan archivo previo) tengan un archivo seleccionado
const isFormValid = computed(() => {
  if (requisitos.value.length === 0) return false

  return requisitos.value.every(item => {
    // Si no es obligatorio, pasa
    if (!item.requisito.obligatorio) return true

    // Si ya tiene archivo cargado en backend, pasa
    if (item.archivo_cargado) return true

    // Si es obligatorio y no tiene archivo previo, DEBE tener uno seleccionado ahora
    return !!files.value[item.requisito.id]
  })
})

const handleSubmit = async () => {
  if (!isFormValid.value) return

  submitting.value = true
  errorMsg.value = ''

  try {
    await submitPostulacion(props.idConvocatoria, files.value)
    emit('success') // Avisar al padre que se completó
    handleClose()
    // Aquí podrías disparar una alerta de SweetAlert o similar en el padre
  } catch (error) {
    console.error(error)
    errorMsg.value = 'Ocurrió un error al enviar la solicitud. Verifique su conexión o el tamaño de los archivos.'
  } finally {
    submitting.value = false
  }
}

const handleClose = () => {
  if (!submitting.value) emit('close')
}

const resetForm = () => {
  requisitos.value = []
  files.value = {}
  errorMsg.value = ''
  submitting.value = false
}
</script>

<style scoped>
.modal-backdrop {
  background-color: rgba(30, 58, 95, 0.6); /* Navy con transparencia */
  backdrop-filter: blur(4px);
  z-index: 1060;
}
.modal {
  z-index: 1065;
}
.transition-hover {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.transition-hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 .25rem .5rem rgba(0,0,0,.08)!important;
}
</style>