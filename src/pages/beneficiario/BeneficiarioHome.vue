<template>
  <div class="dashboard-container min-vh-100 font-sans bg-light">
    <!-- Navbar -->
    <nav class="navbar navbar-expand-lg bg-white shadow-sm mb-4 sticky-top border-bottom border-success border-opacity-25">
      <div class="container">
        <span class="navbar-brand fw-bold d-flex align-items-center gap-2">
          <img src="/img/logo.svg" onerror="this.style.display='none'" alt="AgroConecta" style="height: 35px; width: auto;">
          <span class="text-agro-emerald">AgroConecta</span>
        </span>
        <div class="d-flex align-items-center gap-3">
          <div class="d-none d-md-block text-end lh-1">
            <span class="fw-bold text-agro-navy">{{ userName }}</span>
            <small class="d-block text-muted">{{ nombreComunidad }}</small>
          </div>
          <button class="btn btn-outline-danger btn-sm rounded-circle shadow-sm" style="width: 32px; height: 32px;" @click="handleLogout">
            <i class="bi bi-power"></i>
          </button>
        </div>
      </div>
    </nav>

    <div class="container py-2">
      <!-- Hero Section -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card border-0 text-white overflow-hidden shadow rounded-4 bg-agro-emerald">
            <div class="card-body p-4 p-lg-5 position-relative">
              <div class="position-relative z-1">
                <h1 class="h3 fw-bold mb-2">Bienvenido, {{ auth.user?.nombre }}</h1>
                <p class="mb-0 opacity-90 fs-5">
                  Gestiona tus parcelas y aplica a convocatorias activas.
                </p>
              </div>
              <i class="bi bi-flower1 position-absolute text-white opacity-25" style="font-size: 12rem; right: -30px; bottom: -50px;"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- SECCIÓN: ALERTAS FITOSANITARIAS -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card border-0 shadow-sm" :class="alertasPlagas.length > 0 ? 'bg-danger bg-opacity-10 border-start border-danger border-4' : 'bg-white'">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <div class="d-flex align-items-center">
                  <i class="bi bi-exclamation-triangle-fill fs-3 me-3" :class="alertasPlagas.length > 0 ? 'text-danger' : 'text-secondary opacity-50'"></i>
                  <div>
                    <h5 class="fw-bold mb-0" :class="alertasPlagas.length > 0 ? 'text-danger' : 'text-agro-navy'">Alertas Fitosanitarias</h5>
                    <small class="text-muted">Monitoreo de plagas en tu comunidad.</small>
                  </div>
                </div>
                <!-- Botones Reportar / Mis Reportes -->
                <div class="d-flex gap-2">
                  <button class="btn btn-sm btn-outline-secondary" @click="showMyReportsModal = true">
                    <i class="bi bi-list-check me-1"></i> Mis Reportes
                  </button>
                  <button class="btn btn-sm btn-danger" @click="showReportModal = true">
                    <i class="bi bi-bug me-1"></i> Reportar Plaga
                  </button>
                </div>
              </div>

              <div v-if="alertasPlagas.length > 0" class="list-group">
                <div v-for="item in alertasPlagas" :key="item.id" class="list-group-item border-0 bg-transparent px-0 py-2">
                  <div class="d-flex align-items-start gap-2">
                    <i class="bi bi-bug text-danger mt-1"></i>
                    <div>
                      <strong>{{ item.alerta?.reporte?.plaga?.nombre_comun || 'Plaga Detectada' }}</strong>
                      <p class="mb-0 small text-muted">{{ item.alerta?.mensaje_alerta }}</p>
                      <small class="text-secondary fst-italic">{{ formatDateShort(item.created_at) }}</small>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="text-muted small fst-italic ms-5">
                No hay alertas activas en tu zona por el momento.
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- SECCIÓN: MIS PREDIOS -->
      <div class="row mb-5">
        <div class="col-12 mb-3 d-flex justify-content-between align-items-end">
          <div>
            <h5 class="fw-bold text-agro-navy mb-1">Mis Predios</h5>
            <p class="text-muted small mb-0">Parcelas registradas y validadas.</p>
          </div>
          <button v-if="parcelas.length === 0" class="btn btn-agro-secondary shadow-sm fw-bold" @click="showParcelaModal = true">
            <i class="bi bi-plus-circle me-2"></i> Nuevo Predio
          </button>
        </div>

        <div v-if="parcelas.length > 0" class="row g-3">
          <div class="col-md-6 col-lg-4" v-for="p in parcelas" :key="p.idParcela">
            <div class="card border-0 shadow-sm rounded-4 h-100 overflow-hidden">
              <div class="h-1 w-100" :class="p.statusParcela === 'Activa' ? 'bg-success' : 'bg-warning'"></div>

              <div class="card-body p-3 d-flex flex-column gap-2">
                <div class="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 class="fw-bold text-agro-navy mb-0">{{ p.nombreParcela || 'Predio sin nombre' }}</h6>
                    <small class="text-muted">ID Geo: {{ p.idParcelaGeo }}</small>
                  </div>
                  <span class="badge rounded-pill" :class="p.statusParcela === 'Activa' ? 'bg-success' : 'bg-warning text-dark'">
                    {{ p.statusParcela }}
                  </span>
                </div>

                <div class="mt-2 pt-2 border-top d-flex flex-column gap-2">
                  <button v-if="p.poligono" class="btn btn-sm btn-outline-success w-100 rounded-3 fw-bold d-flex align-items-center justify-content-center gap-2" @click="viewMap(p)">
                    <i class="bi bi-map-fill"></i> Ver Ubicación Satelital
                  </button>
                  <div v-else class="text-center bg-light rounded p-2 text-muted small fst-italic">
                    <i class="bi bi-geo"></i> Sin delimitación geográfica
                  </div>

                  <a v-if="p.doc_tipo_8_url" :href="p.doc_tipo_8_url" target="_blank" class="btn btn-sm btn-light w-100 rounded-3 text-secondary border d-flex align-items-center justify-content-center gap-2">
                    <i class="bi bi-file-earmark-image"></i> Ver Título Propiedad
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="col-12">
          <div class="card border-dashed bg-light text-center p-5 rounded-4">
            <i class="bi bi-layers text-muted opacity-50 display-4"></i>
            <p class="text-muted mt-3">No tienes predios registrados.</p>
          </div>
        </div>
      </div>

      <!-- SECCIÓN CONVOCATORIAS -->
      <div class="d-flex justify-content-between align-items-end mb-4 border-bottom pb-3">
        <div>
          <h4 class="fw-bold text-agro-navy mb-1">Convocatorias Abiertas</h4>
          <span class="text-muted small">Apoyos disponibles para {{ nombreComunidad }}</span>
        </div>
        <button @click="loadConvocatorias" class="btn btn-agro-primary btn-sm rounded-pill px-3" :disabled="loading">
          <i class="bi" :class="loading ? 'bi-hourglass-split' : 'bi-arrow-clockwise'"></i> Actualizar
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="row g-4">
        <div class="col-md-4" v-for="n in 3" :key="n">
          <div class="card border-0 shadow-sm h-100 p-4 rounded-4">
            <span class="placeholder col-12 bg-light d-block mb-3" style="height: 100px;"></span>
            <span class="placeholder col-8 bg-secondary"></span>
          </div>
        </div>
      </div>

      <!-- Contenido Agrupado por Categorías -->
      <div v-else>
        <!-- Iteramos sobre las categorías -->
        <div v-for="categoria in categoriasList" :key="categoria.idCategoria" class="mb-5 animate-fade-in">

          <!-- Título de la Categoría -->
          <div class="d-flex align-items-center gap-2 mb-3">
            <span class="badge rounded-pill bg-success bg-opacity-10 text-success p-2">
              <i class="bi bi-tags-fill"></i>
            </span>
            <h5 class="fw-bold text-agro-navy mb-0">{{ categoria.nombreCategoria }}</h5>
          </div>

          <!-- Grid de Convocatorias de esta categoría -->
          <div class="row g-4">
            <div class="col-md-6 col-lg-4" v-for="item in categoria.convocatorias" :key="item.idConvocatoria">
              <div class="card border-0 shadow-sm h-100 hover-elevate rounded-4 overflow-hidden">
                <div class="h-1 w-100" :class="item.estatus_postulacion ? 'bg-secondary' : 'bg-agro-navy'"></div>
                <div class="card-body p-4 d-flex flex-column">

                  <div class="d-flex justify-content-between align-items-start mb-3">
                    <div class="icon-box rounded-circle bg-light p-2 text-agro-emerald">
                      <i class="bi bi-flower3 fs-4"></i>
                    </div>
                    <!-- Estatus Postulación -->
                    <span v-if="item.estatus_postulacion" class="badge rounded-pill bg-warning text-dark border border-warning">
                      {{ item.estatus_postulacion }}
                    </span>
                    <!-- Fecha Cierre (como badge info) -->
                    <span v-else class="badge rounded-pill bg-light text-secondary border text-truncate">
                       <i class="bi bi-calendar-event me-1"></i> {{ formatDateShort(item.fechaCierre) }}
                    </span>
                  </div>

                  <h5 class="card-title fw-bold text-agro-navy mb-2">{{ item.nombreConvocatoria }}</h5>

                  <p class="card-text text-muted small flex-grow-1 mb-2">
                    Consulta las bases y requisitos.
                  </p>

                  <div class="mt-4 pt-3 border-top">
                    <button v-if="item.estatus_postulacion" class="btn btn-secondary w-100 rounded-3 fw-bold" @click="viewApplicationStatus(item)" :disabled="loadingDetails === item.idConvocatoria">
                      <span v-if="loadingDetails === item.idConvocatoria" class="spinner-border spinner-border-sm"></span>
                      <span v-else>Ver Mi Solicitud</span>
                    </button>
                    <button v-else class="btn btn-outline-agro w-100 rounded-3 fw-bold" @click="openDetails(item.idConvocatoria, null)">
                      Ver Requisitos <i class="bi bi-arrow-right ms-1"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State Global -->
        <div v-if="categoriasList.length === 0" class="text-center py-5">
          <div class="card border-dashed bg-light p-5 rounded-4 d-inline-block">
            <i class="bi bi-inbox fs-1 text-muted opacity-50"></i>
            <p class="text-muted mt-3 mb-0">No hay convocatorias activas disponibles.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- MODALES -->
    <ConvocatoriaDetailsModal :show="showModal" :convocatoria="selectedConvocatoria" :estatusUsuario="currentStatus" @close="showModal = false" @apply="handleApplyFromDetails" />
    <ConvocatoriaPostulacionModal :show="showPostulacionModal" :idConvocatoria="postulacionData.id" :nombreConvocatoria="postulacionData.nombre" @close="showPostulacionModal = false" @success="handlePostulacionSuccess" />
    <SolicitudStatusModal :show="showStatusModal" :loading="loadingDocs" :documentos="myDocuments" :nombreConvocatoria="statusModalData.nombre" :estatusGlobal="statusModalData.estatus" @close="showStatusModal = false" />
    <ParcelaRegistroModal :show="showParcelaModal" @close="showParcelaModal = false" @success="handleParcelaSuccess" />
    
    <ReportarPlagaModal :show="showReportModal" @close="showReportModal = false" @success="handleReportSuccess" />
    <MisReportesModal :show="showMyReportsModal" @close="showMyReportsModal = false" @create="showMyReportsModal = false; showReportModal = true" />

    <div v-if="showMapViewer" class="modal-backdrop fade show" style="z-index: 1050;"></div>
    <div v-if="showMapViewer" class="modal fade show d-block" tabindex="-1">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content rounded-4 shadow border-0">
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title fw-bold text-agro-navy">
              <i class="bi bi-geo-fill text-danger me-2"></i> Ubicación: {{ selectedParcelaMap?.nombreParcela }}
            </h5>
            <button type="button" class="btn-close" @click="closeMap"></button>
          </div>
          <div class="modal-body p-4">
            <ParcelaMap
                v-if="selectedParcelaMap && selectedParcelaMap.poligono"
                :poligono="selectedParcelaMap.poligono"
                :parcela-id="selectedParcelaMap.idParcela"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL ALERTA INICIAL -->
    <div v-if="showAlertaModal && alertasPlagas.length > 0" class="modal fade show d-block" style="background: rgba(0,0,0,0.6); z-index: 1060;">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4 border-top border-danger border-5">
          <div class="modal-header border-0">
            <h5 class="modal-title fw-bold text-danger">
              <i class="bi bi-exclamation-triangle-fill me-2"></i> ¡Alerta Fitosanitaria!
            </h5>
            <button type="button" class="btn-close" @click="showAlertaModal = false"></button>
          </div>
          <div class="modal-body">
            <p class="lead fs-6 text-dark mb-3">
              Se han detectado amenazas fitosanitarias cerca de tus parcelas. Por favor revisa tus cultivos.
            </p>
            <div class="list-group">
              <div v-for="item in alertasPlagas" :key="item.id" class="list-group-item list-group-item-action border-0 bg-light mb-2 rounded">
                <div class="d-flex w-100 justify-content-between">
                  <h6 class="mb-1 fw-bold text-danger">{{ item.alerta?.reporte?.plaga?.nombre_comun || 'Plaga Desconocida' }}</h6>
                  <small class="text-muted">{{ formatDateShort(item.created_at) }}</small>
                </div>
                <p class="mb-1 small">{{ item.alerta?.mensaje_alerta }}</p>
                <small class="text-muted fst-italic">Radio de alerta: {{ parseInt(item.alerta?.radio_km) }} km</small>
              </div>
            </div>
          </div>
          <div class="modal-footer border-0">
            <button type="button" class="btn btn-danger w-100 fw-bold" @click="showAlertaModal = false">
              Entendido, revisaré mis parcelas
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showSuccessMsg" class="position-fixed top-0 start-50 translate-middle-x mt-4 p-3 z-3">
      <div class="alert alert-success shadow-lg border-0 rounded-4 px-4 py-3">
        <i class="bi bi-check-circle-fill me-2"></i> <strong>{{ successMsgText }}</strong>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { fetchConvocatoriasAplicables, fetchConvocatoriaDetalle, fetchMiSolicitudEnConvocatoria } from '@/services/convocatorias.api'
import { fetchMisParcelas } from '@/services/parcelas.api'
import plagasService from '@/services/plagas.service'

import ConvocatoriaPostulacionModal from './ConvocatoriaPostulacionModal.vue'
import ConvocatoriaDetailsModal from './ConvocatoriaDetailsModal.vue'
import SolicitudStatusModal from './SolicitudStatusModal.vue'
import ParcelaRegistroModal from './ParcelaRegistroModal.vue'
import ParcelaMap from './ParcelaMap.vue'
import ReportarPlagaModal from './ReportarPlagaModal.vue'
import MisReportesModal from './MisReportesModal.vue'
import '@/assets/agro-theme.css'

const router = useRouter()
const auth = useAuthStore()

// Estados
const loading = ref(true)
const categoriasList = ref([]) // CAMBIO: Ahora almacenamos categorías
const parcelas = ref([])
const alertasPlagas = ref([]) // Alertas de plagas
const loadingDetails = ref(null)
const loadingDocs = ref(false)

// Modales
const showModal = ref(false)
const showPostulacionModal = ref(false)
const showStatusModal = ref(false)
const showParcelaModal = ref(false)
const showReportModal = ref(false)
const showMyReportsModal = ref(false)
const showMapViewer = ref(false)
const showSuccessMsg = ref(false)
const successMsgText = ref('')
const showAlertaModal = ref(false)

// Data temporal
const selectedConvocatoria = ref({})
const currentStatus = ref(null)
const postulacionData = ref({})
const statusModalData = ref({})
const myDocuments = ref([])
const selectedParcelaMap = ref(null)

const userName = computed(() => auth.user?.nombre || 'Beneficiario')
const nombreComunidad = computed(() => auth.user?.comunidad || 'Comunidad')

// Helper fechas
const formatDateShort = (dateStr) => {
  if(!dateStr) return 'Abierta';
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
}

const loadParcelas = async () => {
  try {
    const data = await fetchMisParcelas()
    parcelas.value = data
  } catch (error) {
    console.error("Error cargando parcelas:", error)
  }
}

const loadAlertasPlagas = async () => {
  try {
    const res = await plagasService.getAlerts()
    // Soporte para respuesta tipo Laravel Resource { data: [...] } o array directo
    alertasPlagas.value = res.data.data || res.data || []
    
    // Si hay alertas, mostrar modal
    if (alertasPlagas.value.length > 0) {
      showAlertaModal.value = true
    }
  } catch (e) {
    console.error("Error cargando alertas de plagas:", e)
  }
}

const viewMap = (p) => {
  selectedParcelaMap.value = p
  showMapViewer.value = true
}
const closeMap = () => {
  showMapViewer.value = false
  selectedParcelaMap.value = null
}

const loadConvocatorias = async () => {
  loading.value = true
  try {
    const idComunidad = auth.user?.id_comunidad || 15
    const data = await fetchConvocatoriasAplicables(idComunidad)
    // data ahora es un array de categorías, cada una con su array 'convocatorias'
    categoriasList.value = data
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const openDetails = async (id, estatus) => {
  loadingDetails.value = id
  currentStatus.value = estatus
  try {
    const det = await fetchConvocatoriaDetalle(id)
    if (det) { selectedConvocatoria.value = det; showModal.value = true }
  } catch (e) { alert("Error al cargar detalles.") } finally { loadingDetails.value = null }
}

const viewApplicationStatus = async (item) => {
  statusModalData.value = { nombre: item.nombreConvocatoria, estatus: item.estatus_postulacion }
  myDocuments.value = []
  showStatusModal.value = true
  loadingDocs.value = true
  loadingDetails.value = item.idConvocatoria

  try {
    const data = await fetchMiSolicitudEnConvocatoria(item.idConvocatoria)
    const listaDocumentos = data.data || data || []
    myDocuments.value = listaDocumentos
  } catch(e) {
    console.error(e)
  } finally {
    loadingDocs.value = false;
    loadingDetails.value = null
  }
}

const handleApplyFromDetails = (c) => {
  showModal.value = false
  postulacionData.value = { id: c.idConvocatoria, nombre: c.nombreConvocatoria }
  setTimeout(() => showPostulacionModal.value = true, 300)
}

const handlePostulacionSuccess = () => {
  showPostulacionModal.value = false
  successMsgText.value = "Solicitud enviada correctamente."
  showSuccessMsg.value = true
  loadConvocatorias()
  setTimeout(() => showSuccessMsg.value = false, 4000)
}

const handleParcelaSuccess = async () => {
  showParcelaModal.value = false
  successMsgText.value = "Predio registrado exitosamente."
  showSuccessMsg.value = true
  await loadParcelas()
  await auth.refreshUserParcelas()
  setTimeout(() => showSuccessMsg.value = false, 4000)
}

const handleReportSuccess = () => {
  showReportModal.value = false
  successMsgText.value = "Reporte enviado. Gracias por tu colaboración."
  showSuccessMsg.value = true
  setTimeout(() => showSuccessMsg.value = false, 4000)
}

const handleLogout = async () => {
  auth.logout()
  router.replace({ name: 'beneficiario-login' })
}

onMounted(() => {
  loadParcelas()
  loadConvocatorias()
  loadAlertasPlagas()
})
</script>

<style scoped>
.font-sans { font-family: 'Inter', sans-serif; }
.hover-elevate:hover { transform: translateY(-5px); box-shadow: 0 1rem 3rem rgba(0,0,0,.15)!important; transition: all 0.3s ease; }
.border-dashed { border-style: dashed !important; }
.animate-fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>