<template>
  <div class="container-fluid p-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="text-agro-navy fw-bold mb-0">
        <i class="bi bi-robot me-2 text-agro-emerald"></i>
        Centro de Análisis IA
      </h2>
      <button class="btn btn-outline-secondary btn-sm" @click="fetchVideos">
        <i class="bi bi-arrow-clockwise me-1"></i> Recargar Tabla
      </button>
    </div>

    <!-- PANEL DE PROCESANDO (Loader) -->
    <div v-if="processingItem" class="card border-0 shadow-sm mb-4 bg-light border-start border-success border-4">
      <div class="card-body">
        <div class="text-center py-4">
          <div class="spinner-border text-agro-emerald mb-3" style="width: 3rem; height: 3rem;" role="status"></div>
          <h5 class="fw-bold text-agro-navy">Analizando Video con IA...</h5>
          <p class="text-muted mb-0">
            Procesando solicitud #{{ processingItem.idSolicitud }} de
            <strong>{{ processingItem.beneficiario?.nombre }}</strong>
          </p>
          <small class="text-muted fst-italic">Descargando > Transcribiendo > Resumiendo > Guardando</small>
        </div>
      </div>
    </div>

    <!-- TABLA PRINCIPAL -->
    <div class="card border-0 shadow-sm">
      <div class="card-header bg-white py-3">
        <div class="d-flex justify-content-between align-items-center">
          <h5 class="mb-0 fw-bold text-agro-navy">Solicitudes Validadas (Video Mentor)</h5>
          <span class="badge bg-light text-dark border">Total: {{ totalVideos }}</span>
        </div>
      </div>
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="bg-light text-secondary small text-uppercase">
            <tr>
              <th class="ps-4">ID</th>
              <th>Fecha</th>
              <th>Beneficiario</th>
              <th>Estado Video</th>
              <th>Enlace</th>
              <th class="text-end pe-4">Acciones</th>
            </tr>
            </thead>
            <tbody>
            <!-- Loader de tabla -->
            <tr v-if="loadingList" class="text-center">
              <td colspan="6" class="py-5 text-muted">
                <span class="spinner-border spinner-border-sm me-2"></span> Cargando datos...
              </td>
            </tr>
            <!-- Sin datos -->
            <tr v-else-if="videos.length === 0" class="text-center">
              <td colspan="6" class="py-5 text-muted">No hay solicitudes pendientes con video.</td>
            </tr>

            <!-- Filas de Datos -->
            <tr v-for="item in videos" :key="item.idSolicitud">
              <!-- 1. ID -->
              <td class="ps-4 fw-bold text-secondary">#{{ item.idSolicitud }}</td>

              <!-- 2. Fecha -->
              <td class="small text-muted">{{ formatDate(item.fechaSolicitud) }}</td>

              <!-- 3. Beneficiario -->
              <td>
                <div class="fw-bold text-dark">{{ item.beneficiario?.nombre }}</div>
                <div class="small text-muted">{{ item.beneficiario?.curp }}</div>
              </td>

              <!-- 4. Estado -->
              <td>
                <div v-if="getArchivoVideo(item)">
                  <!-- Si ya fue analizado (según la bandera 'analizado' del JSON) -->
                  <span v-if="getArchivoVideo(item).analizado" class="badge bg-success bg-opacity-10 text-success border border-success px-3 py-2 rounded-pill">
                      <i class="bi bi-check-circle-fill me-1"></i> Analizado
                    </span>
                  <span v-else class="badge bg-warning bg-opacity-10 text-warning border border-warning px-3 py-2 rounded-pill">
                      <i class="bi bi-hourglass-split me-1"></i> Pendiente
                    </span>
                </div>
                <span v-else class="badge bg-secondary">Sin video cargado</span>
              </td>

              <!-- 5. Link Video -->
              <td>
                <div v-if="getArchivoVideo(item)?.url">
                  <a :href="getArchivoVideo(item).url" target="_blank" class="btn btn-sm btn-light border text-muted" title="Ver MP4 Original">
                    <i class="bi bi-play-circle text-danger"></i> Ver Video
                  </a>
                </div>
              </td>

              <!-- 6. Acciones -->
              <td class="text-end pe-4">
                <!-- Botón ANALIZAR (Rayo) -->
                <button
                    v-if="getArchivoVideo(item) && !getArchivoVideo(item).analizado"
                    @click="processFullAnalysis(item)"
                    class="btn btn-sm btn-agro-emerald text-white shadow-sm fw-bold"
                    :disabled="processingItem !== null"
                    title="Analizar con IA (Descargar, Transcribir, Resumir)"
                >
                  <i class="bi bi-lightning-charge-fill me-1"></i> Analizar IA
                </button>

                <!-- Botón VER RESULTADOS (Ojo) -->
                <button
                    v-if="getArchivoVideo(item) && getArchivoVideo(item).analizado"
                    class="btn btn-sm btn-outline-primary"
                    @click="showDetails(item)"
                    title="Ver detalle del análisis"
                >
                  <i class="bi bi-eye"></i> Ver Resumen
                </button>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- MODAL DETALLE (Simple) -->
    <div v-if="showModal && selectedAnalysis" class="modal fade show d-block" style="background: rgba(0,0,0,0.5)">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header bg-agro-navy text-white">
            <h5 class="modal-title"><i class="bi bi-file-earmark-text me-2"></i>Resultado del Análisis</h5>
            <button type="button" class="btn-close btn-close-white" @click="closeModal"></button>
          </div>
          <div class="modal-body p-4">
            <!-- TEMA -->
            <h4 class="fw-bold text-agro-emerald mb-3">{{ selectedAnalysis.tema || 'Tema no detectado' }}</h4>

            <!-- RESUMEN -->
            <div class="alert alert-light border border-start-0 border-end-0 border-3 border-success">
              <p class="mb-0 lead fs-6">{{ selectedAnalysis.resumen || 'Sin resumen disponible.' }}</p>
            </div>

            <!-- PASOS CLAVE (Aquí manejamos el array vacío) -->
            <div class="mt-4">
              <h6 class="fw-bold text-uppercase text-muted small mb-3">Pasos Clave Detectados</h6>

              <div v-if="selectedAnalysis.pasos_clave && selectedAnalysis.pasos_clave.length > 0">
                <ul class="list-group list-group-flush">
                  <li v-for="(paso, index) in selectedAnalysis.pasos_clave" :key="index" class="list-group-item px-0 d-flex">
                    <i class="bi bi-check2-circle text-success me-3 mt-1"></i>
                    <span>{{ paso }}</span>
                  </li>
                </ul>
              </div>
              <!-- Fallback si el array viene vacío -->
              <div v-else class="text-muted fst-italic p-3 bg-light rounded text-center border border-dashed">
                <i class="bi bi-info-circle me-2"></i>
                No se detectaron pasos específicos en formato lista, pero revisa el resumen general.
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="closeModal">Cerrar</button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import videoService from '@/services/video.service'

// Estados
const loadingList = ref(false)
const videos = ref([])
const totalVideos = ref(0)
const processingItem = ref(null)

// Estados para el Modal
const showModal = ref(false)
const selectedAnalysis = ref(null)

// ----------------------------------------------------------------
// 1. HELPERS: Extraer datos de la estructura anidada del JSON
// ----------------------------------------------------------------
const getArchivoVideo = (item) => {
  // Buscamos dentro del array "requisitos" aquel que tenga archivo cargado
  // El JSON muestra: item.requisitos[0].archivo_cargado
  if (!item.requisitos || !Array.isArray(item.requisitos)) return null

  // Buscamos el primer requisito que tenga un archivo con URL
  const req = item.requisitos.find(r => r.archivo_cargado && r.archivo_cargado.url)
  return req ? req.archivo_cargado : null
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('es-MX', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit'
  })
}

// ----------------------------------------------------------------
// 2. CARGAR DATOS
// ----------------------------------------------------------------
const fetchVideos = async () => {
  loadingList.value = true
  try {
    const response = await videoService.getVideosValidados()
    // Laravel devuelve { total: X, data: [...] }
    if(response.data && response.data.data) {
      videos.value = response.data.data
      totalVideos.value = response.data.total
    }
  } catch (e) {
    console.error("Error cargando tabla:", e)
    alert("Error al cargar la lista de videos.")
  } finally {
    loadingList.value = false
  }
}

// ----------------------------------------------------------------
// 3. PROCESO DE ANÁLISIS (Vue -> Python -> Laravel)
// ----------------------------------------------------------------
const processFullAnalysis = async (item) => {
  const archivo = getArchivoVideo(item)
  if (!archivo || !archivo.url) {
    alert("No se encontró URL de video para este registro.")
    return
  }

  // Activamos loader UI para este item
  processingItem.value = item

  try {
    // PASO A: Enviar URL a Python (Microservicio IA)
    // Esto descargará el video temporalmente y lo analizará
    console.log("🚀 Enviando a Python...", archivo.url)
    const pyResponse = await videoService.analyzeVideo({ url: archivo.url })

    if (pyResponse.data.status !== 'success') {
      throw new Error(pyResponse.data.message || 'La IA no pudo procesar el video.')
    }

    const analisisData = pyResponse.data
    console.log("🤖 IA Respondió:", analisisData)

    // PASO B: Guardar resultado en Laravel
    // Importante: 'summary' es el objeto JSON {tema, pasos_clave, resumen}
    const payload = {
      idDocumento: archivo.idDocumento,
      status: 'success',
      transcription: analisisData.transcription,
      file_path: archivo.url, // Guardamos la URL original como referencia
      summary: analisisData.summary
    }

    console.log("💾 Guardando en BD...", payload)
    await videoService.saveAnalysis(payload)

    // PASO C: Actualizar UI (Optimista)
    archivo.analizado = true // Cambia el badge a verde

    // Guardamos el resultado en el objeto local para poder verlo en el modal sin recargar
    // (Simulamos la estructura que vendría de BD si hiciéramos un refresh)
    archivo.video_analisis = [
      { summary: analisisData.summary }
    ]

    alert(`✅ Análisis completado correctamente.`)

  } catch (e) {
    console.error(e)
    const msg = e.response?.data?.message || e.message || 'Error desconocido'
    alert(`❌ Falló el análisis: ${msg}`)
  } finally {
    processingItem.value = null // Desactivar loader
  }
}

// ----------------------------------------------------------------
// 4. VER DETALLES (Modal)
// ----------------------------------------------------------------
const showDetails = (item) => {
  const archivo = getArchivoVideo(item)

  // Intentamos sacar el análisis.
  // NOTA: El endpoint inicial devolvía "video_analisis": []
  // Si acabamos de analizar en esta sesión, lo inyectamos manualmente en el paso C.
  // Si recargamos la página, el backend debería traer el análisis dentro de ese array.

  let analysisData = null

  if (archivo.video_analisis && archivo.video_analisis.length > 0) {
    // Tomamos el más reciente (o el primero)
    // Asumiendo que Laravel devuelve el modelo completo o el campo summary
    const raw = archivo.video_analisis[0]
    analysisData = raw.summary || raw // Depende de cómo lo devuelva Laravel (anidado o plano)
  } else {
    alert("El análisis está marcado como listo, pero no hay datos cargados en esta vista. Intenta recargar la tabla.")
    return
  }

  selectedAnalysis.value = analysisData
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedAnalysis.value = null
}

onMounted(() => {
  fetchVideos()
})
</script>

<style scoped>
.text-agro-navy { color: #0f172a; }
.text-agro-emerald { color: #10b981; }
.bg-agro-navy { background-color: #0f172a; }

.btn-agro-emerald {
  background-color: #10b981;
  border: none;
  transition: all 0.2s;
}
.btn-agro-emerald:hover {
  background-color: #059669;
  transform: translateY(-1px);
}
.border-dashed {
  border-style: dashed !important;
}
</style>