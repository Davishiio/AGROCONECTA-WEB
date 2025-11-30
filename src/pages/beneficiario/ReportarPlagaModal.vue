<template>
  <div v-if="show" class="modal-backdrop fade show" style="z-index: 1050;"></div>
  <div v-if="show" class="modal fade show d-block" tabindex="-1" role="dialog">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content border-0 shadow-lg rounded-4">
        <div class="modal-header border-0 pb-0">
          <h5 class="modal-title fw-bold text-agro-navy">
            <i class="bi bi-bug-fill text-danger me-2"></i> Reportar Plaga
          </h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>
        <div class="modal-body p-4">
          <p class="text-muted small mb-4">
            Ayúdanos a detectar riesgos fitosanitarios. Selecciona tu parcela y sube la evidencia.
          </p>

          <div v-if="loadingOptions" class="text-center py-4">
            <div class="spinner-border text-agro-emerald" role="status"></div>
            <p class="text-muted mt-2">Cargando opciones...</p>
          </div>

          <form v-else @submit.prevent="submitReport">

            <div class="row">
              <!-- Parcela -->
              <div class="col-md-6 mb-3">
                <label class="form-label fw-bold small text-secondary">Parcela Afectada <span class="text-danger">*</span></label>
                <select v-model="form.id_parcela" class="form-select rounded-3" required>
                  <option value="" disabled>Selecciona una parcela...</option>
                  <option
                      v-for="p in options.parcelas"
                      :key="p.idParcela"
                      :value="p.idParcela"
                      :disabled="parcelasReportadas.has(p.idParcela)"
                      :class="{'text-muted fst-italic': parcelasReportadas.has(p.idParcela)}"
                  >
                    {{ p.nombreParcela }} {{ parcelasReportadas.has(p.idParcela) ? '(Ya reportada)' : '' }}
                  </option>
                </select>
                <div v-if="parcelasReportadas.has(form.id_parcela)" class="text-danger small mt-1">
                  <i class="bi bi-exclamation-circle"></i> Ya existe un reporte activo para esta parcela.
                </div>
              </div>

              <!-- Fecha de Aparición -->
              <div class="col-md-6 mb-3">
                <label class="form-label fw-bold small text-secondary">Fecha de Aparición <span class="text-danger">*</span></label>
                <input type="date" v-model="form.fecha_aparicion" class="form-control rounded-3" required :max="today">
              </div>
            </div>

            <div class="row">
              <!-- Posible Plaga -->
              <div class="col-12 mb-3">
                <label class="form-label fw-bold small text-secondary">Posible Plaga (Opcional)</label>
                <select v-model="form.id_plaga_reportada" class="form-select rounded-3">
                  <!-- Usamos null para indicar que no hay selección -->
                  <option :value="null">No estoy seguro / Otra</option>
                  <option v-for="plaga in options.plagas" :key="plaga.id" :value="plaga.id">
                    {{ plaga.nombre_comun }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Tipo de Evidencia -->
            <div class="mb-3">
              <label class="form-label fw-bold small text-secondary">Tipo de Evidencia <span class="text-danger">*</span></label>
              <div class="d-flex gap-2">
                <div v-for="tipo in options.tipos_evidencia" :key="tipo" class="form-check form-check-inline">
                  <input class="form-check-input" type="radio" :id="'evidencia-'+tipo" :value="tipo" v-model="form.tipo_evidencia" @change="handleEvidenciaChange">
                  <label class="form-check-label" :for="'evidencia-'+tipo">{{ tipo }}</label>
                </div>
              </div>
            </div>

            <!-- Evidencia (Foto/Video/Audio) -->
            <div class="mb-3" v-if="form.tipo_evidencia && form.tipo_evidencia !== 'Texto'">
              <label class="form-label fw-bold small text-secondary">Archivo de Evidencia ({{ form.tipo_evidencia }}) <span class="text-danger">*</span></label>
              <div class="border-dashed p-4 text-center rounded-3 bg-light position-relative" @dragover.prevent @drop.prevent="handleDrop">
                <input type="file" ref="fileInput" class="d-none" :accept="acceptedFileTypes" @change="handleFileSelect">

                <div v-if="!previewUrl && !selectedFile">
                  <i class="bi bi-cloud-upload fs-1 text-muted opacity-50"></i>
                  <p class="mb-2 text-muted small">Arrastra tu {{ form.tipo_evidencia }} aquí o</p>
                  <button type="button" class="btn btn-sm btn-outline-agro rounded-pill" @click="$refs.fileInput.click()">
                    Seleccionar Archivo
                  </button>
                </div>

                <div v-else class="position-relative d-inline-block">
                  <!-- Preview Imagen -->
                  <img v-if="fileType === 'image'" :src="previewUrl" class="img-fluid rounded shadow-sm" style="max-height: 200px;">

                  <!-- Preview Video -->
                  <video v-else-if="fileType === 'video'" :src="previewUrl" class="img-fluid rounded shadow-sm" style="max-height: 200px;" controls></video>

                  <!-- Preview Audio -->
                  <div v-else-if="fileType === 'audio'" class="p-3 bg-white rounded shadow-sm border d-flex align-items-center gap-2">
                    <i class="bi bi-music-note-beamed fs-4 text-primary"></i>
                    <span class="small">{{ selectedFile?.name }}</span>
                    <audio :src="previewUrl" controls class="d-block mt-2" style="height: 30px;"></audio>
                  </div>

                  <button type="button" class="btn btn-sm btn-danger rounded-circle position-absolute top-0 start-100 translate-middle" @click="clearFile">
                    <i class="bi bi-x"></i>
                  </button>
                </div>
              </div>
              <div v-if="fileError" class="text-danger small mt-1">{{ fileError }}</div>
            </div>

            <!-- Comentario Usuario -->
            <div class="mb-3">
              <label class="form-label fw-bold small text-secondary">Comentarios Adicionales</label>
              <textarea v-model="form.comentario_usuario" class="form-control rounded-3" rows="3" placeholder="Detalles adicionales sobre la afectación..."></textarea>
            </div>

            <div class="d-flex justify-content-end gap-2 pt-3 border-top">
              <button type="button" class="btn btn-light text-secondary fw-bold" @click="$emit('close')">Cancelar</button>
              <button type="submit" class="btn btn-danger fw-bold px-4" :disabled="loading || !isValid">
                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                Enviar Reporte
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import plagasService from '@/services/plagas.service'

const props = defineProps({
  show: Boolean
})
const emit = defineEmits(['close', 'success'])

const loading = ref(false)
const loadingOptions = ref(false)
const fileInput = ref(null)
const previewUrl = ref(null)
const fileType = ref(null) // 'image', 'video', 'audio'
const selectedFile = ref(null)
const fileError = ref('')
// Set para almacenar IDs de parcelas ya reportadas
const parcelasReportadas = ref(new Set())

const today = new Date().toISOString().split('T')[0]

const options = reactive({
  plagas: [],
  parcelas: [],
  tipos_evidencia: []
})

const form = reactive({
  id_parcela: '',
  id_plaga_reportada: null,
  tipo_evidencia: 'Foto',
  fecha_aparicion: today,
  comentario_usuario: ''
})

// Computed para validar el formulario antes de enviar
const isValid = computed(() => {
  if (!form.id_parcela) return false
  // Validación extra: no permitir enviar si la parcela ya está reportada (por seguridad)
  if (parcelasReportadas.value.has(form.id_parcela)) return false

  if (!form.tipo_evidencia) return false
  if (!form.fecha_aparicion) return false
  if (form.tipo_evidencia !== 'Texto' && !selectedFile.value) return false
  return true
})

const acceptedFileTypes = computed(() => {
  switch (form.tipo_evidencia) {
    case 'Foto': return 'image/*'
    case 'Video': return 'video/*'
    case 'Audio': return 'audio/*'
    default: return '*'
  }
})

const loadOptions = async () => {
  loadingOptions.value = true
  try {
    // 1. Cargar opciones del formulario
    const resOptions = await plagasService.getCreateOptions()
    const data = resOptions.data
    options.plagas = data.plagas || []
    options.parcelas = data.parcelas || []
    options.tipos_evidencia = data.tipos_evidencia || ['Foto', 'Video', 'Audio', 'Texto']

    // 2. Cargar reportes existentes para verificar duplicados
    const resReportes = await plagasService.getUserReports()
    const reportesExistentes = resReportes.data.data || resReportes.data || []

    // Llenamos el Set con los IDs de las parcelas que ya tienen reporte
    parcelasReportadas.value = new Set(reportesExistentes.map(r => r.id_parcela))

  } catch (e) {
    console.error("Error cargando opciones:", e)
    alert("Error al cargar datos del formulario.")
  } finally {
    loadingOptions.value = false
  }
}

const handleEvidenciaChange = () => {
  clearFile()
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  processFile(file)
}

const handleDrop = (event) => {
  const file = event.dataTransfer.files[0]
  processFile(file)
}

const processFile = (file) => {
  if (!file) return

  let valid = false
  if (form.tipo_evidencia === 'Foto' && file.type.startsWith('image/')) valid = true
  if (form.tipo_evidencia === 'Video' && file.type.startsWith('video/')) valid = true
  if (form.tipo_evidencia === 'Audio' && file.type.startsWith('audio/')) valid = true

  if (!valid && file.type === '') {
    // Tolerancia para tipos mime vacíos en algunos SO
  }

  if (!valid) {
    fileError.value = `El archivo no coincide con el tipo de evidencia seleccionado (${form.tipo_evidencia}).`
    return
  }

  if (file.size > 50 * 1024 * 1024) {
    fileError.value = "El archivo es demasiado grande (Max 50MB)."
    return
  }

  fileError.value = ''
  selectedFile.value = file

  if (file.type.startsWith('image/')) fileType.value = 'image'
  else if (file.type.startsWith('video/')) fileType.value = 'video'
  else if (file.type.startsWith('audio/')) fileType.value = 'audio'

  const reader = new FileReader()
  reader.onload = (e) => previewUrl.value = e.target.result
  reader.readAsDataURL(file)
}

const clearFile = () => {
  selectedFile.value = null
  previewUrl.value = null
  fileType.value = null
  fileError.value = ''
  if (fileInput.value) fileInput.value.value = ''
}

const submitReport = async () => {
  // Doble verificación antes de enviar
  if (parcelasReportadas.value.has(form.id_parcela)) {
    alert("Esta parcela ya tiene un reporte activo.")
    return
  }

  if (form.tipo_evidencia !== 'Texto' && !selectedFile.value) {
    fileError.value = "Debes subir un archivo."
    return
  }

  loading.value = true
  try {
    const formData = new FormData()
    formData.append('id_parcela', form.id_parcela)
    formData.append('tipo_evidencia', form.tipo_evidencia)
    formData.append('fecha_aparicion', form.fecha_aparicion)

    if (form.id_plaga_reportada) {
      formData.append('id_plaga_reportada', form.id_plaga_reportada)
    }

    if (form.comentario_usuario) {
      formData.append('comentario_usuario', form.comentario_usuario)
    }

    if (selectedFile.value) {
      formData.append('archivo_evidencia', selectedFile.value)
    }

    await plagasService.createReport(formData)
    emit('success')
    resetForm()
  } catch (e) {
    console.error(e)
    if (e.response && e.response.data && e.response.data.errors) {
      const errors = Object.values(e.response.data.errors).flat().join('\n')
      alert("Errores de validación:\n" + errors)
    } else {
      alert("Error al enviar el reporte. Inténtalo más tarde.")
    }
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  form.id_parcela = ''
  form.id_plaga_reportada = null
  form.tipo_evidencia = 'Foto'
  form.fecha_aparicion = today
  form.comentario_usuario = ''
  clearFile()
}

watch(() => props.show, (val) => {
  if (val) {
    loadOptions()
  }
})
</script>

<style scoped>
.border-dashed { border: 2px dashed #dee2e6; }
</style>