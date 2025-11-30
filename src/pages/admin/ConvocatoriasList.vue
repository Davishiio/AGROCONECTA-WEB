<script setup>
import { onMounted, ref, computed } from 'vue'
import { fetchConvocatoriasActivasByCategoria, fetchConvocatoriaDetalle } from '@/services/convocatorias.api'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const idCategoria = computed(() => Number(route.params.idCategoria))
const categoriaNombre = computed(() => route.query?.nombre || '')

// Estado de la Lista
const loading = ref(true)
const error = ref('')
const convocatorias = ref([])
const total = ref(0)

// Estado del Modal de Detalle
const showModal = ref(false)
const detailLoading = ref(false)
const detailError = ref('')
const detailData = ref(null)
const activeTab = ref('objetivo')

onMounted(async () => {
  await loadConvocatorias()
})

const loadConvocatorias = async () => {
  loading.value = true
  try {
    // API devuelve: { items: [...], total: 4 }
    const res = await fetchConvocatoriasActivasByCategoria(idCategoria.value)
    convocatorias.value = res.items
    total.value = res.total
  } catch (e) {
    console.error(e)
    error.value = e?.response?.data?.message || 'Error al cargar convocatorias'
  } finally {
    loading.value = false
  }
}

// --- LÓGICA DE DETALLE (Modal) ---

const openDetail = async (item) => {
  showModal.value = true
  detailLoading.value = true
  detailError.value = ''
  detailData.value = null
  activeTab.value = 'objetivo'

  try {
    // CORRECCIÓN CRÍTICA:
    // Antes enviabas (idCategoria, item.idConvocatoria)
    // El servicio solo espera (idConvocatoria), así que tomaba el idCategoria como ID.
    // Ahora enviamos el ID correcto:
    const res = await fetchConvocatoriaDetalle(item.idConvocatoria)
    detailData.value = res
  } catch (e) {
    console.error(e)
    detailError.value = 'No se pudieron cargar los detalles de esta convocatoria.'
  } finally {
    detailLoading.value = false
  }
}

const closeDetail = () => {
  showModal.value = false
  setTimeout(() => { detailData.value = null }, 300)
}

// Helpers de Detalle
const requisitosList = computed(() => {
  if (!detailData.value?.requisitos) return []
  // Si requisitos es objeto:
  if (typeof detailData.value.requisitos === 'object' && !Array.isArray(detailData.value.requisitos)) {
    const entries = Object.entries(detailData.value.requisitos).sort((a,b) => Number(a[0]) - Number(b[0]))
    return entries.map(([,v]) => v)
  }
  // Si ya es array:
  return detailData.value.requisitos
})

const diasRestantes = computed(() => {
  if (!detailData.value?.fechaCierre) return null
  const hoy = new Date()
  const cierre = new Date(detailData.value.fechaCierre + 'T23:59:59')
  const diff = Math.ceil((cierre - hoy) / (1000*60*60*24))
  return diff < 0 ? 0 : diff
})

// Helpers Visuales
const formatDate = (dateString) => {
  if (!dateString) return '—';
  // Ajuste para evitar problemas de zona horaria con fechas "YYYY-MM-DD"
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('es-MX', options);
}

const getBorderClass = (id) => {
  const colors = ['border-primary', 'border-success', 'border-info', 'border-warning'];
  return colors[(id || 0) % colors.length];
}
</script>

<template>
  <div class="position-relative">
    <!-- Header de la Sección -->
    <div class="d-flex align-items-center justify-content-between mb-4">
      <div>
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-1 small">
            <li class="breadcrumb-item"><a href="#" @click.prevent="$router.push({name: 'admin-convocatorias-categorias'})" class="text-decoration-none text-muted">Categorías</a></li>
            <li class="breadcrumb-item active text-primary fw-bold" aria-current="page">{{ categoriaNombre || 'Lista' }}</li>
          </ol>
        </nav>
        <h4 class="mb-0 fw-bold text-dark">Convocatorias Activas</h4>
        <small class="text-secondary">
          Mostrando {{ total }} resultados disponibles
        </small>
      </div>
      <button class="btn btn-outline-secondary btn-sm px-3" @click="$router.back()">
        <i class="bi bi-arrow-left me-1"></i> Volver
      </button>
    </div>

    <!-- Loading Lista -->
    <div v-if="loading" class="d-flex justify-content-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
    </div>

    <!-- Error Lista -->
    <div v-else-if="error" class="alert alert-danger shadow-sm border-0">
      <i class="bi bi-exclamation-triangle-fill me-2"></i> {{ error }}
    </div>

    <!-- Lista de Contenido -->
    <div v-else>
      <div v-if="convocatorias.length === 0" class="text-center py-5 bg-white rounded-3 shadow-sm">
        <div class="mb-3 text-secondary opacity-25">
          <i class="bi bi-inbox" style="font-size: 3rem;"></i>
        </div>
        <h5 class="text-secondary fw-bold">No hay convocatorias activas</h5>
        <p class="text-muted small">En este momento no hay convocatorias abiertas en esta categoría.</p>
      </div>

      <div class="row g-4" v-else>
        <!-- ITEM CARD -->
        <div class="col-12 col-lg-6" v-for="item in convocatorias" :key="item.idConvocatoria">
          <div
              class="card h-100 border-0 shadow-sm hover-elevate transition-all cursor-pointer"
              @click="openDetail(item)"
          >
            <!-- Borde lateral de color -->
            <div class="position-absolute top-0 bottom-0 start-0 border-start border-4 rounded-start" :class="getBorderClass(item.idConvocatoria)" style="width: 4px;"></div>

            <div class="card-body p-4 ps-4 ms-2 d-flex flex-column">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <!-- ID visible para debug -->
                <span class="badge bg-light text-secondary border border-light rounded-pill mb-2">
                </span>
                <span class="badge bg-success-subtle text-success rounded-pill d-flex align-items-center gap-1">
                  <i class="bi bi-circle-fill" style="font-size: 0.5rem;"></i> {{ item.estatus || 'Activa' }}
                </span>
              </div>

              <h5 class="card-title fw-bold text-dark mb-3">
                {{ item.nombreConvocatoria || 'Convocatoria Sin Título' }}
              </h5>

              <div class="mb-4 text-muted small">
                <div class="d-flex align-items-center mb-2">
                  <i class="bi bi-calendar-event me-2 text-primary"></i>
                  <span>Vigencia: <strong>{{ formatDate(item.fechaInicio) }}</strong> al <strong>{{ formatDate(item.fechaCierre) }}</strong></span>
                </div>
              </div>

              <div class="mt-auto d-flex justify-content-end border-top pt-3 border-light">
                <button class="btn btn-primary btn-sm px-4 rounded-pill fw-medium d-flex align-items-center">
                  Ver detalles <i class="bi bi-chevron-right ms-1" style="font-size: 0.8rem;"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- === MODAL DE DETALLE === -->
    <div v-if="showModal" class="modal-backdrop fade show" style="z-index: 1050;"></div>

    <div v-if="showModal" class="modal fade show d-block" tabindex="-1" role="dialog" style="z-index: 1055;" @click.self="closeDetail">
      <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content border-0 shadow-lg rounded-4">

          <!-- Header del Modal -->
          <div class="modal-header border-bottom-0 pb-0 pt-4 px-4 bg-white rounded-top-4">
            <div class="w-100">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <span class="badge bg-primary bg-opacity-10 text-primary border border-primary-subtle px-3 py-2 rounded-pill">
                  Detalle Convocatoria
                </span>
                <button type="button" class="btn-close" @click="closeDetail" aria-label="Close"></button>
              </div>
              <h4 class="modal-title fw-bold text-agro-navy pe-3">
                {{ detailData?.nombreConvocatoria || 'Cargando información...' }}
              </h4>
              <p class="text-muted small mb-3" v-if="detailData">
                Categoría: {{ categoriaNombre }}
              </p>
            </div>
          </div>

          <!-- Body del Modal -->
          <div class="modal-body p-4 bg-light bg-opacity-10">
            <!-- Loading Detail -->
            <div v-if="detailLoading" class="text-center py-5">
              <div class="spinner-border text-primary mb-3" role="status"></div>
              <p class="text-muted fw-medium">Obteniendo detalles...</p>
            </div>

            <!-- Error Detail -->
            <div v-else-if="detailError" class="alert alert-danger shadow-sm border-0">
              <i class="bi bi-exclamation-triangle-fill me-2"></i> {{ detailError }}
            </div>

            <!-- Content Detail -->
            <div v-else-if="detailData">
              <!-- Tarjeta de Resumen -->
              <div class="card border-0 shadow-sm mb-4 rounded-4 overflow-hidden">
                <div class="card-body p-4 bg-white">
                  <p class="text-secondary mb-4 lead fs-6" v-if="detailData.descripcionConvocatoria">
                    {{ detailData.descripcionConvocatoria }}
                  </p>

                  <div class="d-flex flex-wrap gap-3 align-items-center p-3 bg-light rounded-3 border border-light">
                    <div class="d-flex align-items-center gap-2">
                      <div class="icon-box bg-white text-success rounded-circle shadow-sm p-2 d-flex align-items-center justify-content-center" style="width:36px;height:36px;">
                        <i class="bi bi-calendar-check"></i>
                      </div>
                      <div>
                        <small class="d-block text-muted lh-1" style="font-size:0.75rem">Apertura</small>
                        <span class="fw-bold text-dark">{{ formatDate(detailData.fechaInicio) }}</span>
                      </div>
                    </div>
                    <div class="vr mx-2 text-secondary opacity-25 d-none d-sm-block"></div>
                    <div class="d-flex align-items-center gap-2">
                      <div class="icon-box bg-white text-danger rounded-circle shadow-sm p-2 d-flex align-items-center justify-content-center" style="width:36px;height:36px;">
                        <i class="bi bi-calendar-x"></i>
                      </div>
                      <div>
                        <small class="d-block text-muted lh-1" style="font-size:0.75rem">Cierre</small>
                        <span class="fw-bold text-dark">{{ formatDate(detailData.fechaCierre) }}</span>
                      </div>
                    </div>
                    <div class="ms-auto" v-if="diasRestantes !== null">
                        <span class="badge bg-warning text-dark border border-warning shadow-sm px-3 py-2 rounded-pill">
                          <i class="bi bi-hourglass-split me-1"></i> {{ diasRestantes }} días restantes
                        </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Tabs y Contenido -->
              <div class="row g-4">
                <div class="col-lg-3">
                  <div class="nav flex-column nav-pills gap-2 sticky-top" style="top: 1rem;">
                    <button class="nav-link text-start py-3 px-3 rounded-3" :class="{active: activeTab==='objetivo'}" @click="activeTab='objetivo'">
                      <i class="bi bi-info-circle me-2"></i> General
                    </button>
                    <button class="nav-link text-start py-3 px-3 rounded-3" :class="{active: activeTab==='requisitos'}" @click="activeTab='requisitos'">
                      <i class="bi bi-list-check me-2"></i> Requisitos
                    </button>
                    <button class="nav-link text-start py-3 px-3 rounded-3" :class="{active: activeTab==='registro'}" @click="activeTab='registro'">
                      <i class="bi bi-pencil-square me-2"></i> Registro
                    </button>
                  </div>
                </div>

                <div class="col-lg-9">
                  <div class="bg-white p-4 rounded-4 shadow-sm h-100 border border-light">
                    <!-- Tab General -->
                    <div v-show="activeTab==='objetivo'">
                      <h5 class="fw-bold text-agro-navy mb-4">Información General</h5>
                      <div class="mb-4">
                        <h6 class="fw-bold text-dark mb-2">Objetivo</h6>
                        <p class="text-secondary">{{ detailData.objetivoGeneral || 'No especificado.' }}</p>
                      </div>
                      <div class="mb-4">
                        <h6 class="fw-bold text-dark mb-2">Población Objetivo</h6>
                        <p class="text-secondary">{{ detailData.poblacionObjetivo || 'No especificada.' }}</p>
                      </div>
                    </div>

                    <!-- Tab Requisitos -->
                    <div v-show="activeTab==='requisitos'">
                      <h5 class="fw-bold text-agro-navy mb-4">Requisitos</h5>
                      <ul class="list-group list-group-flush border rounded-3">
                        <li v-for="(val, idx) in requisitosList" :key="idx" class="list-group-item px-3 py-3 d-flex align-items-start gap-2">
                          <i class="bi bi-check-circle-fill text-success mt-1"></i>
                          <span class="text-secondary">{{ val }}</span>
                        </li>
                        <li v-if="requisitosList.length === 0" class="list-group-item text-muted">No se detallan requisitos específicos.</li>
                      </ul>
                    </div>

                    <!-- Tab Registro -->
                    <div v-show="activeTab==='registro'">
                      <h5 class="fw-bold text-agro-navy mb-4">Registro</h5>
                      <p class="text-secondary">Consulte las bases completas descargando la convocatoria.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer border-top-0 pt-0 px-4 pb-4 bg-light bg-opacity-10 rounded-bottom-4">
            <button class="btn btn-outline-secondary px-4 fw-medium" @click="closeDetail">Cerrar</button>
            <a v-if="detailData?.urlConvocatoria" :href="detailData.urlConvocatoria" target="_blank" class="btn btn-primary px-4 fw-bold shadow-sm">
              <i class="bi bi-file-earmark-arrow-down me-2"></i> Descargar PDF
            </a>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.hover-elevate {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.hover-elevate:hover {
  transform: translateY(-4px);
  box-shadow: 0 .5rem 1rem rgba(0,0,0,.1)!important;
}
.cursor-pointer { cursor: pointer; }
.transition-all { transition: all 0.2s ease; }

/* Estilos activos para Nav Pills */
.nav-pills .nav-link { color: #555; background: #fff; border: 1px solid #eee; }
.nav-pills .nav-link:hover { background: #f8f9fa; }
.nav-pills .nav-link.active {
  background-color: var(--bs-primary);
  color: white !important;
  border-color: var(--bs-primary);
}
</style>