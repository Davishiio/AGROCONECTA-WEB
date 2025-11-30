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
                <span class="small text-muted">Asegúrate de que tus documentos sean legibles. Los campos marcados con <span class="text-danger">*</span> son obligatorios.</span>
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

                    <!-- Badge de tipo de archivo esperado -->
                    <div class="d-flex gap-2 align-items-center mb-1">
                      <span v-if="item.requisito.id === 14" class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 rounded-pill" style="font-size: 0.7rem;">
                         <i class="bi bi-camera-video me-1"></i> Video Requerido
                      </span>
                      <span v-else class="badge bg-light text-secondary border rounded-pill" style="font-size: 0.7rem;">
                         <i class="bi bi-file-earmark-text me-1"></i> Documento / Imagen
                      </span>
                    </div>

                    <span v-if="item.archivo_cargado" class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill">
                      <i class="bi bi-check-circle me-1"></i> Documento ya en sistema
                    </span>
                    <span v-else class="text-muted small d-block">
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
                          :accept="getAcceptType(item.requisito.id)"
                          :disabled="submitting"
                      >
                    </div>
                    <div v-else class="text-end">
                      <button type="button" class="btn btn-sm btn-outline-secondary disabled border-0">
                        <i class="bi bi-file-earmark-check"></i> Cargado
                      </button>
                    </div>
                    <!-- Helper text para el usuario -->
                    <div class="text-end mt-1">
                      <small class="text-muted fst-italic" style="font-size: 0.7rem;">
                        {{ getAcceptLabel(item.requisito.id) }}
                      </small>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            <!-- BARRA DE PROGRESO (Solo visible al enviar) -->
            <div v-if="submitting" class="mt-4 animate-fade-in">
              <div class="d-flex justify-content-between mb-1">
                <span class="small fw-bold text-agro-navy">Subiendo archivos...</span>
                <span class="small fw-bold text-agro-emerald">{{ uploadProgress }}%</span>
              </div>
              <div class="progress shadow-sm" style="height: 12px; border-radius: 6px;">
                <div
                    class="progress-bar bg-agro-emerald progress-bar-striped progress-bar-animated"
                    role="progressbar"
                    :style="{ width: uploadProgress + '%' }"
                    :aria-valuenow="uploadProgress"
                    aria-valuemin="0"
                    aria-valuemax="100">
                </div>
              </div>
              <p v-if="uploadProgress < 100" class="text-center text-muted small mt-2 mb-0">
                Por favor, espera mientras subimos tu video y documentos. No cierres esta ventana.
              </p>
              <p v-else class="text-center text-success small mt-2 mb-0 fw-bold">
                <i class="bi bi-hourglass-split"></i> Procesando respuesta del servidor...
              </p>
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
            <span v-if="submitting && uploadProgress < 100" class="spinner-border spinner-border-sm me-2"></span>
            <span v-if="submitting">Enviando...</span>
            <span v-else>Confirmar Solicitud</span>
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
const files = ref({})
const loadingRequisitos = ref(false)
const submitting = ref(false)
const errorMsg = ref('')
const uploadProgress = ref(0) // Estado para la barra

const getAcceptType = (id) => {
  if (id === 14) return '.mp4,.mov,.avi,.mkv,video/*'
  return '.pdf,.jpg,.jpeg,.png'
}

const getAcceptLabel = (id) => {
  if (id === 14) return 'Formatos: MP4, MOV, AVI'
  return 'Formatos: PDF, JPG, PNG'
}

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
    // Advertencia de tamaño para videos (Requisito 14)
    // 200MB como ejemplo de límite "suave" para advertir
    if (idRequisito === 14 && file.size > 200 * 1024 * 1024) {
      alert("El video seleccionado es mayor a 200MB. La subida podría tardar varios minutos dependiendo de tu conexión.")
    }
    files.value[idRequisito] = file
  } else {
    delete files.value[idRequisito]
  }
}

const isFormValid = computed(() => {
  if (requisitos.value.length === 0) return false
  return requisitos.value.every(item => {
    if (!item.requisito.obligatorio) return true
    if (item.archivo_cargado) return true
    return !!files.value[item.requisito.id]
  })
})

const handleSubmit = async () => {
  if (!isFormValid.value) return

  submitting.value = true
  uploadProgress.value = 0
  errorMsg.value = ''

  try {
    // Pasamos el callback para actualizar la barra
    await submitPostulacion(props.idConvocatoria, files.value, (progress) => {
      uploadProgress.value = progress
    })

    emit('success')
    handleClose()
  } catch (error) {
    console.error(error)
    // Manejo específico de timeout o entidad demasiado grande
    if (error.response && error.response.status === 413) {
      errorMsg.value = 'El archivo es demasiado grande para el servidor. Intenta comprimir el video.'
    } else {
      errorMsg.value = 'Ocurrió un error al enviar la solicitud. Verifique su conexión.'
    }
  } finally {
    submitting.value = false
    uploadProgress.value = 0
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
  uploadProgress.value = 0
}
</script>

<style scoped>
.modal-backdrop {
  background-color: rgba(30, 58, 95, 0.6);
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
.animate-fade-in { animation: fadeIn 0.3s ease-in-out; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
</style>