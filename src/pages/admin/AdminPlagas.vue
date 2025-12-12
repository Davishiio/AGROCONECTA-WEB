<template>
  <div class="container-fluid p-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="text-agro-navy fw-bold mb-0">
        <i class="bi bi-bug me-2 text-danger"></i>
        Gestión de Plagas
      </h2>
      <button class="btn btn-outline-secondary btn-sm" @click="fetchReports">
        <i class="bi bi-arrow-clockwise me-1"></i> Recargar
      </button>
    </div>

    <!-- Filtros -->
    <div class="card border-0 shadow-sm mb-4">
      <div class="card-body p-3">
        <div class="d-flex gap-2">
          <button
              class="btn btn-sm rounded-pill px-3"
              :class="filter === '' ? 'btn-dark' : 'btn-outline-secondary'"
              @click="setFilter('')"
          >
            Todos
          </button>
          <button
              class="btn btn-sm rounded-pill px-3"
              :class="filter === 'Recibido' ? 'btn-warning text-dark' : 'btn-outline-secondary'"
              @click="setFilter('Recibido')"
          >
            Pendientes (Recibidos)
          </button>
          <button
              class="btn btn-sm rounded-pill px-3"
              :class="filter === 'Validado' ? 'btn-success text-white' : 'btn-outline-secondary'"
              @click="setFilter('Validado')"
          >
            Aprobados (Validados)
          </button>
          <button
              class="btn btn-sm rounded-pill px-3"
              :class="filter === 'Rechazado' ? 'btn-danger text-white' : 'btn-outline-secondary'"
              @click="setFilter('Rechazado')"
          >
            Rechazados
          </button>
        </div>
      </div>
    </div>

    <!-- Tabla -->
    <div class="card border-0 shadow-sm">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="bg-light text-secondary small text-uppercase">
            <tr>
              <th class="ps-4">ID</th>
              <th>Fecha</th>
              <th>Usuario</th>
              <th>Parcela</th>
              <th style="min-width: 200px;">Posible Plaga</th>
              <th>Estado</th>
              <th class="text-end pe-4">Acciones</th>
            </tr>
            </thead>
            <tbody>
            <tr v-if="loading" class="text-center">
              <td colspan="7" class="py-5 text-muted">
                <span class="spinner-border spinner-border-sm me-2"></span> Cargando reportes...
              </td>
            </tr>
            <tr v-else-if="reports.length === 0" class="text-center">
              <td colspan="7" class="py-5 text-muted">No hay reportes encontrados con este filtro.</td>
            </tr>
            <tr v-for="item in reports" :key="item.id">
              <td class="ps-4 fw-bold text-secondary">#{{ item.id }}</td>
              <td class="small text-muted">{{ formatDate(item.created_at) }}</td>

              <td>
                <div class="fw-bold text-dark">
                  {{ getNombreUsuario(item) }}
                </div>
                <div class="small text-muted">
                  {{ item.usuario?.correo || 'Sin correo' }}
                </div>
              </td>

              <td>
                <div class="fw-bold text-agro-navy small">
                  <i class="bi bi-geo-alt me-1"></i>
                  {{ item.parcela?.nombreParcela || 'Sin Nombre' }}
                </div>
                <div class="small text-muted fst-italic">
                  Mpio ID: {{ item.parcela?.idMunicipio }}
                </div>
              </td>

              <td>
                <div v-if="item.plaga" class="d-flex align-items-center gap-2">
                  <div class="rounded-circle bg-danger bg-opacity-10 p-2 text-danger">
                    <i class="bi bi-bug-fill"></i>
                  </div>
                  <div>
                    <div class="fw-bold text-dark small">{{ item.plaga.nombre_comun }}</div>
                    <div class="text-muted fst-italic" style="font-size: 0.75rem;">
                      {{ item.plaga.nombre_cientifico }}
                    </div>
                  </div>
                </div>
                <span v-else class="text-muted small ms-2">- Sin identificar -</span>
              </td>

              <td>
                  <span
                      class="badge rounded-pill px-3 py-2"
                      :class="{
                      'bg-warning text-dark bg-opacity-25 border border-warning': item.estado_reporte === 'Recibido' || item.estado_reporte === 'En Revisión',
                      'bg-success text-white': item.estado_reporte === 'Validado',
                      'bg-danger text-white': item.estado_reporte === 'Rechazado'
                    }"
                  >
                    {{ item.estado_reporte }}
                  </span>
              </td>
              <td class="text-end pe-4">
                <button
                    class="btn btn-sm btn-primary shadow-sm"
                    @click="openDetails(item)"
                >
                  <i class="bi bi-eye me-1"></i> Ver Detalle
                </button>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal Detalle -->
    <div v-if="showModal && selectedReport" class="modal fade show d-block" style="background: rgba(0,0,0,0.5)">
      <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content border-0 shadow">
          <div class="modal-header bg-white">
            <h5 class="modal-title fw-bold text-agro-navy">
              Reporte #{{ selectedReport.id }}
            </h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body p-4 bg-light">

            <!-- Evidencia Multimedia (Solo si hay URL) -->
            <div v-if="selectedReport.archivo_r2_url" class="card border-0 shadow-sm mb-3">
              <div class="card-header bg-white fw-bold text-secondary">Evidencia Multimedia</div>
              <div class="card-body text-center bg-dark rounded-bottom">
                <img
                    v-if="isImage(selectedReport.archivo_r2_url)"
                    :src="selectedReport.archivo_r2_url"
                    class="img-fluid rounded"
                    style="max-height: 300px;"
                >
                <video
                    v-else-if="isVideo(selectedReport.archivo_r2_url)"
                    :src="selectedReport.archivo_r2_url"
                    controls
                    class="img-fluid rounded"
                    style="max-height: 300px;"
                ></video>
                <div v-else class="text-white py-5">
                  <i class="bi bi-file-earmark-binary fs-1"></i>
                  <p class="mt-2">Archivo disponible para descarga</p>
                  <a :href="selectedReport.archivo_r2_url" target="_blank" class="btn btn-light btn-sm">Descargar</a>
                </div>
              </div>
            </div>

            <!-- INFORMACIÓN PRINCIPAL (Grid) -->
            <div class="row g-3">

              <!-- Columna 1: Info Reporte -->
              <div class="col-md-6">
                <div class="card border-0 shadow-sm h-100">
                  <div class="card-body">
                    <h6 class="fw-bold text-muted text-uppercase small mb-3">Información del Reporte</h6>
                    <p class="mb-1">
                      <strong>Usuario:</strong>
                      {{ getNombreUsuario(selectedReport) }}
                    </p>
                    <p class="mb-1">
                      <strong>Curp:</strong>
                      {{ getCurpUsuario(selectedReport) }}
                    </p>
                    <p class="mb-1"><strong>Fecha:</strong> {{ formatDate(selectedReport.fecha_aparicion || selectedReport.created_at) }}</p>
                    <p class="mb-1"><strong>Parcela:</strong> {{ selectedReport.parcela?.nombreParcela }}</p>
                    <p class="mb-1"><strong>Tipo Evidencia:</strong> <span class="badge bg-light text-dark border">{{ selectedReport.tipo_evidencia }}</span></p>

                    <div class="mt-2 p-2 bg-light rounded border-start border-4 border-info">
                      <small class="d-block fw-bold text-muted">Comentario Usuario:</small>
                      <span class="fst-italic small">{{ selectedReport.comentario_usuario || 'Sin comentarios' }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Columna 2: Análisis IA -->
              <div class="col-md-6">
                <div class="card border-0 shadow-sm h-100">
                  <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                      <h6 class="fw-bold text-muted text-uppercase small mb-0">Análisis IA (Python)</h6>
                      <button
                          v-if="selectedReport.estado_analisis !== 'Finalizado'"
                          @click="runAnalysis"
                          class="btn btn-sm btn-outline-primary"
                          :disabled="analyzing"
                      >
                        <span v-if="analyzing" class="spinner-border spinner-border-sm me-1"></span>
                        <span v-else><i class="bi bi-cpu me-1"></i> Analizar</span>
                      </button>
                    </div>

                    <div v-if="selectedReport.ia_json_data" class="bg-light p-3 rounded border">
                      <div v-if="typeof selectedReport.ia_json_data === 'object'">
                        <strong class="d-block text-primary mb-1">{{ selectedReport.ia_json_data.tema || 'Análisis Completo' }}</strong>
                        <ul class="small mb-2 ps-3 text-secondary">
                          <li v-for="(paso, idx) in selectedReport.ia_json_data.pasos_clave" :key="idx">{{ paso }}</li>
                        </ul>
                        <p class="small fst-italic mb-0 border-top pt-2">{{ selectedReport.ia_json_data.resumen }}</p>
                      </div>
                      <pre v-else class="small mb-0" style="white-space: pre-wrap;">{{ selectedReport.ia_json_data }}</pre>
                    </div>

                    <div v-else class="text-center text-muted py-4 small">
                      <i class="bi bi-robot fs-4 d-block mb-2"></i>
                      {{ analyzing ? 'Procesando evidencia...' : 'No se ha realizado análisis automático.' }}
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <!-- SECCIÓN: Tarjeta de la Plaga (Si existe en el reporte original) -->
            <div v-if="selectedReport.plaga" class="mt-3">
              <PlagaInfoCard :plaga="selectedReport.plaga" />
            </div>

            <!-- Acciones de Validación -->
            <div v-if="selectedReport.estado_reporte === 'Recibido'" class="card border-0 shadow-sm mt-3 border-start border-4 border-warning">
              <div class="card-body">
                <h6 class="fw-bold text-warning mb-3">Validación y Alertas</h6>
                <div class="row g-2">
                  <div class="col-md-4">
                    <label class="form-label small fw-bold">Radio de Alerta (km)</label>
                    <input type="number" v-model="validationRadio" class="form-control form-control-sm" step="0.5" min="0.5">
                  </div>

                  <div class="col-md-8">
                    <label class="form-label small fw-bold">Confirmar Plaga</label>
                    <select v-model="idPlagaConfirmada" class="form-select form-select-sm">
                      <option :value="null">-- Seleccionar Plaga --</option>
                      <option v-for="plaga in catalogoPlagas" :key="plaga.id" :value="plaga.id">
                        {{ plaga.nombre_comun }} ({{ plaga.nombre_cientifico }})
                      </option>
                    </select>
                  </div>

                  <div class="col-12">
                    <label class="form-label small fw-bold">Nota Administrativa</label>
                    <input type="text" v-model="validationComment" class="form-control form-control-sm" placeholder="Razón de la decisión...">
                  </div>

                  <!-- NUEVO CAMPO: Mensaje de Alerta Editable -->
                  <div class="col-12">
                    <label class="form-label small fw-bold">Mensaje de Alerta</label>
                    <textarea
                        v-model="validationAlertMsg"
                        class="form-control form-control-sm"
                        rows="2"
                        placeholder="Mensaje que se enviará a los vecinos..."
                    ></textarea>
                    <div class="form-text small" style="font-size: 0.75rem;">
                      Este mensaje se enviará a las parcelas vecinas dentro del radio seleccionado.
                    </div>
                  </div>
                </div>
                <div class="d-flex gap-2 mt-3">
                  <button
                      @click="validate('Aprobar')"
                      class="btn btn-success text-white flex-grow-1"
                      :disabled="validating"
                  >
                    <i class="bi bi-check-circle me-1"></i> Validar y Alertar
                  </button>
                  <button
                      @click="validate('Rechazar')"
                      class="btn btn-danger text-white flex-grow-1"
                      :disabled="validating"
                  >
                    <i class="bi bi-x-circle me-1"></i> Rechazar
                  </button>
                </div>
              </div>
            </div>

          </div>
          <div class="modal-footer bg-white">
            <button class="btn btn-secondary" @click="closeModal">Cerrar</button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import plagasService from '@/services/plagas.service'
import PlagaInfoCard from './PlagaInfoCard.vue'

const reports = ref([])
const catalogoPlagas = ref([]) // Catálogo para el select
const loading = ref(false)
const filter = ref('')

const showModal = ref(false)
const selectedReport = ref(null)
const analyzing = ref(false)
const validating = ref(false)

const validationRadio = ref(3.0)
const validationComment = ref('')
const idPlagaConfirmada = ref(null)
const validationAlertMsg = ref('')

const setFilter = (newFilter) => {
  filter.value = newFilter
  fetchReports()
}

const fetchCatalogo = async () => {
  try {
    const res = await plagasService.getCatalogo()
    catalogoPlagas.value = res.data || []
  } catch(e) {
    console.error("Error cargando catálogo", e)
  }
}

const fetchReports = async () => {
  loading.value = true
  try {
    const params = {}
    if (filter.value) {
      params.estado = filter.value
    }
    const response = await plagasService.getAdminReports(params)
    reports.value = response.data
  } catch (e) {
    console.error("Error fetching reports:", e)
  } finally {
    loading.value = false
  }
}

const openDetails = async (item) => {
  selectedReport.value = item
  try {
    const res = await plagasService.getAdminReportDetails(item.id)
    selectedReport.value = res.data

    // Pre-llenar Select si ya venía reportado
    if (selectedReport.value.plaga) {
      idPlagaConfirmada.value = selectedReport.value.plaga.id
    } else {
      idPlagaConfirmada.value = item.id_plaga_reportada || null
    }
  } catch (e) {
    console.error(e)
  }
  showModal.value = true
  validationRadio.value = 3.0
  validationComment.value = ''
  // Resetear mensaje de alerta
  validationAlertMsg.value = ''
}

const closeModal = () => {
  showModal.value = false
  selectedReport.value = null
}

const runAnalysis = async () => {
  if (!selectedReport.value) return

  const esTexto = selectedReport.value.tipo_evidencia === 'Texto'

  if (!selectedReport.value.archivo_r2_url && !esTexto) {
    alert("No hay archivo adjunto para analizar.")
    return
  }

  analyzing.value = true
  try {
    const payload = {
      tipo: selectedReport.value.tipo_evidencia,
      url: selectedReport.value.archivo_r2_url,
      text_content: selectedReport.value.comentario_usuario
    }

    const res = await plagasService.analyzeEvidenceDirect(payload)

    // Aquí guardamos los datos en selectedReport (MEMORIA)
    selectedReport.value.ia_json_data = res.data.summary
    selectedReport.value.ia_transcripcion = res.data.transcription
    selectedReport.value.estado_analisis = 'Finalizado'

    alert('Análisis IA completado exitosamente.')
  } catch (e) {
    console.error(e)
    alert('Error al conectar con el servicio de IA (Puerto 8001). Asegúrate que main.py esté corriendo.')
  } finally {
    analyzing.value = false
  }
}

// Watcher para autocompletar el mensaje de alerta (UX)
watch([idPlagaConfirmada, validationRadio], ([newPlagaId, newRadio]) => {
  if (!newPlagaId) {
    // Si no hay plaga, no borramos si el usuario ya escribió algo, a menos que sea el mensaje automático anterior
    return
  }
  const plaga = catalogoPlagas.value.find(p => p.id === newPlagaId)
  const nombre = plaga ? plaga.nombre_comun : 'una plaga'

  // Sugerimos un mensaje
  validationAlertMsg.value = `ALERTA FITOSANITARIA: Se ha confirmado la presencia de ${nombre} en su zona (Radio: ${newRadio}km). Revise sus cultivos.`
})

// --- VALIDACIÓN CORREGIDA ---
const validate = async (decision) => {
  if (!selectedReport.value) return

  if (decision === 'Aprobar' && !idPlagaConfirmada.value) {
    alert("Por favor selecciona qué plaga se está confirmando para poder aprobar.")
    return
  }

  if (!confirm(`¿Estás seguro de ${decision} este reporte?`)) return

  validating.value = true
  try {
    // Map decision to backend status
    const estadoReporte = decision === 'Aprobar' ? 'Validado' : 'Rechazado'

    // Construir payload COMPLETO según requerimientos del backend
    const payload = {
      estado_reporte: estadoReporte,
      id_plaga_confirmada: idPlagaConfirmada.value,
      radio_km: parseFloat(validationRadio.value),
      mensaje_alerta: validationAlertMsg.value,
      nota_admin: validationComment.value,
      idParcela: selectedReport.value.parcela?.idParcela,
      
      // Datos de IA requeridos si el análisis finalizó
      ia_json_data: selectedReport.value.ia_json_data || null,
      ia_transcripcion: selectedReport.value.ia_transcripcion || null
    }

    // Debug
    console.log("Payload enviado a validar:", payload)

    await plagasService.validateReport(selectedReport.value.id, payload)

    alert(`Reporte procesado exitosamente`)
    closeModal()
    fetchReports()
  } catch (e) {
    console.error(e)
    alert('Error al validar reporte: ' + (e.response?.data?.message || e.message))
  } finally {
    validating.value = false
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('es-MX', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
}

const isImage = (url) => {
  if (!url) return false
  return url.match(/\.(jpeg|jpg|gif|png|webp|bmp)$/i) != null
}

const isVideo = (url) => {
  if (!url) return false
  return url.match(/\.(mp4|webm|ogg|mov)$/i) != null
}

onMounted(() => {
  filter.value = 'Recibido'
  fetchCatalogo()
  fetchReports()
})

// Helpers para mostrar datos de usuario correctamente
const getNombreUsuario = (row) => {
  const b = row?.usuario?.beneficiario
  const nombre = [b?.nombre, b?.apellido_paterno, b?.apellido_materno]
    .filter(Boolean)
    .join(' ')
    .trim()
  return nombre || row?.usuario?.correo || 'Usuario Desconocido'
}

const getCurpUsuario = (row) => {
  const b = row?.usuario?.beneficiario
  return b?.CURP || 'N/A'
}
</script>

<style scoped>
.text-agro-navy { color: #0f172a; }
</style>