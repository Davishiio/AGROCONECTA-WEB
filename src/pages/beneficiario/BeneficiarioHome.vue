<template>
  <div class="dashboard-container min-vh-100 font-sans bg-light">
    <!-- Navbar (Igual) -->
    <nav class="navbar navbar-expand-lg bg-white shadow-sm mb-4 sticky-top border-bottom border-success border-opacity-25">
      <div class="container">
        <span class="navbar-brand fw-bold d-flex align-items-center gap-2">
          <img src="/img/logo.svg" alt="AgroConecta" style="height: 35px; width: auto;">
          <span class="text-agro-emerald">AgroConecta</span>
        </span>
        <div class="d-flex align-items-center gap-3">
          <div class="d-none d-md-block text-end lh-1">
            <small class="d-block text-muted" style="font-size: 0.7rem;">Hola,</small>
            <span class="fw-bold text-agro-navy">{{ userName }}</span>
          </div>
          <button class="btn btn-outline-danger btn-sm rounded-circle shadow-sm" style="width: 32px; height: 32px; padding: 0;" @click="handleLogout">
            <i class="bi bi-power"></i>
          </button>
        </div>
      </div>
    </nav>

    <div class="container py-2">
      <!-- Hero Section (Igual) -->
      <div class="row mb-5">
        <div class="col-12">
          <div class="card border-0 text-white overflow-hidden shadow rounded-4 bg-agro-emerald">
            <div class="card-body p-4 p-lg-5 position-relative">
              <div class="position-relative z-1">
                <h1 class="h3 fw-bold mb-2">Panel de Beneficiario</h1>
                <p class="mb-0 opacity-90 fs-5">
                  Comunidad: <span class="fw-bold px-2 rounded bg-white text-agro-emerald">{{ nombreComunidad }}</span>
                </p>
              </div>
              <i class="bi bi-flower1 position-absolute text-white opacity-25" style="font-size: 12rem; right: -30px; bottom: -50px;"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Controles (Igual) -->
      <div class="d-flex justify-content-between align-items-end mb-4 border-bottom pb-3">
        <div>
          <h4 class="fw-bold text-agro-navy mb-1">Convocatorias Activas</h4>
          <span class="text-muted small">Apoyos disponibles para tu zona</span>
        </div>
        <button @click="loadConvocatorias" class="btn btn-agro-primary btn-sm rounded-pill px-3" :disabled="loading">
          <i class="bi" :class="loading ? 'bi-hourglass-split' : 'bi-arrow-clockwise'"></i> Actualizar
        </button>
      </div>

      <!-- Loading (Igual) -->
      <div v-if="loading" class="row g-4">
        <div class="col-md-4" v-for="n in 3" :key="n">
          <div class="card border-0 shadow-sm h-100 p-4 rounded-4">
            <span class="placeholder col-12 bg-light d-block mb-3" style="height: 100px;"></span>
            <span class="placeholder col-8 bg-secondary"></span>
          </div>
        </div>
      </div>

      <!-- Empty (Igual) -->
      <div v-else-if="convocatorias.length === 0" class="text-center py-5">
        <div class="mb-3 text-agro-emerald opacity-50"><i class="bi bi-inbox" style="font-size: 3rem;"></i></div>
        <h6 class="text-muted">No hay convocatorias por el momento.</h6>
      </div>

      <!-- LISTA PRINCIPAL -->
      <div v-else class="row g-4">
        <div class="col-md-6 col-lg-4" v-for="item in convocatorias" :key="item.idConvocatoria">
          <div class="card border-0 shadow-sm h-100 hover-elevate rounded-4 overflow-hidden">

            <!-- Borde superior -->
            <div class="h-1 w-100" :class="item.estatus_postulacion ? 'bg-secondary' : (item.nivelCobertura === 'ESTADO' ? 'bg-agro-emerald' : 'bg-agro-navy')"></div>

            <div class="card-body p-4 d-flex flex-column">
              <div class="d-flex justify-content-between align-items-start mb-3">
                <div class="icon-box rounded-circle bg-light p-2 text-agro-emerald">
                  <i class="bi fs-4" :class="getIconByContext(item.nombreConvocatoria)"></i>
                </div>

                <span v-if="item.estatus_postulacion" class="badge rounded-pill bg-warning text-dark border border-warning">
                  <i class="bi bi-clock-history me-1"></i> {{ item.estatus_postulacion }}
                </span>
                <span v-else class="badge rounded-pill fw-normal px-3 py-2" :style="getBadgeStyle(item.nivelCobertura)">
                  {{ item.nivelCobertura }}
                </span>
              </div>

              <h5 class="card-title fw-bold text-agro-navy mb-2 line-clamp-2">{{ item.nombreConvocatoria }}</h5>
              <p class="card-text text-muted small flex-grow-1">Consulta las bases y requisitos.</p>

              <div class="mt-4 pt-3 border-top">

                <!-- CAMBIO CLAVE: SI YA APLICÓ, LLAMA A LA NUEVA FUNCIÓN -->
                <button
                    v-if="item.estatus_postulacion"
                    class="btn btn-secondary w-100 rounded-3 fw-bold"
                    @click="viewApplicationStatus(item)"
                    :disabled="loadingDetails === item.idConvocatoria"
                >
                  <span v-if="loadingDetails === item.idConvocatoria" class="spinner-border spinner-border-sm"></span>
                  <span v-else><i class="bi bi-eye me-1"></i> Ver Mi Solicitud</span>
                </button>

                <button
                    v-else
                    class="btn btn-outline-agro w-100 rounded-3 fw-bold"
                    @click="openDetails(item.idConvocatoria, null)"
                    :disabled="loadingDetails === item.idConvocatoria"
                >
                  <span v-if="loadingDetails === item.idConvocatoria" class="spinner-border spinner-border-sm"></span>
                  <span v-else>Ver Requisitos <i class="bi bi-arrow-right ms-1"></i></span>
                </button>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL 1: Detalles (Para leer bases) -->
    <ConvocatoriaDetailsModal
        :show="showModal"
        :convocatoria="selectedConvocatoria"
        :estatusUsuario="currentStatus"
        @close="showModal = false"
        @apply="handleApplyFromDetails"
    />

    <!-- MODAL 2: Postulación (Para subir archivos) -->
    <ConvocatoriaPostulacionModal
        :show="showPostulacionModal"
        :idConvocatoria="postulacionData.id"
        :nombreConvocatoria="postulacionData.nombre"
        @close="showPostulacionModal = false"
        @success="handlePostulacionSuccess"
    />

    <!-- MODAL 3: Ver Mi Solicitud (Para ver documentos ya subidos) -->
    <SolicitudStatusModal
        :show="showStatusModal"
        :loading="loadingDocs"
        :documentos="myDocuments"
        :nombreConvocatoria="statusModalData.nombre"
        :estatusGlobal="statusModalData.estatus"
        @close="showStatusModal = false"
    />

    <!-- Toast Éxito -->
    <div v-if="showSuccessMsg" class="position-fixed top-0 start-50 translate-middle-x mt-4 p-3 z-3" style="z-index: 2000;">
      <div class="alert alert-success shadow-lg border-0 d-flex align-items-center gap-2">
        <i class="bi bi-check-circle-fill fs-4"></i>
        <div><strong>¡Solicitud enviada!</strong><br>Tu documentación ha sido recibida.</div>
        <button type="button" class="btn-close ms-3" @click="showSuccessMsg = false"></button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { fetchConvocatoriasAplicables, fetchConvocatoriaDetalle } from '@/services/convocatorias.api'
import { fetchMisDocumentos } from '@/services/documentos.api' // Importamos el nuevo servicio

import ConvocatoriaPostulacionModal from './ConvocatoriaPostulacionModal.vue'
import ConvocatoriaDetailsModal from './ConvocatoriaDetailsModal.vue'
import SolicitudStatusModal from './SolicitudStatusModal.vue' // Nuevo Modal
import '@/assets/agro-theme.css'

const auth = useAuthStore()
const loading = ref(true)
const convocatorias = ref([])
const loadingDetails = ref(null)

// Estados de Modales
const showModal = ref(false)
const showPostulacionModal = ref(false)
const showStatusModal = ref(false) // Estado para el nuevo modal

// Data para modales
const selectedConvocatoria = ref({})
const currentStatus = ref(null)
const postulacionData = ref({ id: null, nombre: '' })
const statusModalData = ref({ nombre: '', estatus: '' })
const myDocuments = ref([])
const loadingDocs = ref(false)

const showSuccessMsg = ref(false)

const userName = computed(() => {
  const u = auth.user || {}
  return [u.nombre, u.apellido_paterno].filter(Boolean).join(' ') || 'Beneficiario'
})
const nombreComunidad = computed(() => auth.user?.nombre_comunidad || 'Tu Comunidad')

// Helpers
const getIconByContext = (t) => {
  const text = (t || '').toLowerCase()
  if (text.includes('caña') || text.includes('maiz')) return 'bi-flower3'
  if (text.includes('insumos')) return 'bi-box-seam'
  if (text.includes('agua')) return 'bi-droplet'
  return 'bi-file-earmark-text'
}
const getBadgeStyle = (n) => {
  if (n === 'ESTADO') return { backgroundColor: '#d1e7dd', color: 'var(--agro-emerald)', border: '1px solid var(--agro-emerald)' }
  return { backgroundColor: '#e2e6ea', color: 'var(--agro-navy)', border: '1px solid var(--agro-navy)' }
}

const loadConvocatorias = async () => {
  loading.value = true
  try {
    const idComunidad = auth.user?.id_comunidad || 15
    const data = await fetchConvocatoriasAplicables(idComunidad)
    convocatorias.value = data.convocatorias || []
  } catch (e) { console.error(e) } finally { loading.value = false }
}

const openDetails = async (id, estatus) => {
  loadingDetails.value = id
  currentStatus.value = estatus
  try {
    const det = await fetchConvocatoriaDetalle(id)
    if (det) { selectedConvocatoria.value = det; showModal.value = true }
  } catch (e) { alert("Error al cargar detalles") } finally { loadingDetails.value = null }
}

// --- NUEVA FUNCIÓN PARA VER STATUS ---
const viewApplicationStatus = async (convocatoria) => {
  // 1. Abrir modal inmediatamente con estado de carga
  statusModalData.value = {
    nombre: convocatoria.nombreConvocatoria,
    estatus: convocatoria.estatus_postulacion
  }
  myDocuments.value = []
  showStatusModal.value = true
  loadingDocs.value = true
  loadingDetails.value = convocatoria.idConvocatoria

  try {
    // 2. Traer todos los documentos
    const allDocs = await fetchMisDocumentos()

    // 3. Filtrar en frontend solo los de ESTA convocatoria
    // Nota: Aseguramos que los tipos de datos (string/number) coincidan
    myDocuments.value = allDocs.filter(d => Number(d.idConvocatoria) === Number(convocatoria.idConvocatoria))

  } catch (error) {
    console.error("Error cargando documentos", error)
  } finally {
    loadingDocs.value = false
    loadingDetails.value = null
  }
}

const handleApplyFromDetails = (convocatoria) => {
  showModal.value = false
  postulacionData.value = {
    id: convocatoria.idConvocatoria || convocatoria.id,
    nombre: convocatoria.nombreConvocatoria
  }
  setTimeout(() => { showPostulacionModal.value = true }, 300)
}

const handlePostulacionSuccess = () => {
  showPostulacionModal.value = false
  showSuccessMsg.value = true
  loadConvocatorias()
  setTimeout(() => { showSuccessMsg.value = false }, 5000)
}

const handleLogout = () => auth.logout()
onMounted(() => loadConvocatorias())
</script>

<style scoped>
.font-sans { font-family: 'Inter', sans-serif; }
.hover-elevate:hover { transform: translateY(-5px); box-shadow: 0 1rem 3rem rgba(0,0,0,.15)!important; }
</style>