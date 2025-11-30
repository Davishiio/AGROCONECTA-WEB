<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import adminApi from '@/services/admin.service'
import api from '@/utils/http' // Importamos cliente HTTP para endpoint específico
import SolicitudRevisionModal from './SolicitudRevisionModal.vue'

const route = useRoute()
const router = useRouter()

const solicitudes = ref([])
const loading = ref(true)
const filterText = ref('')

// Estado para el modal
const showModal = ref(false)
const selectedSolicitud = ref(null)

// Detectar si hay filtro por convocatoria en la URL
const convocatoriaId = computed(() => route.query.convocatoria)

const fetchSolicitudes = async () => {
  loading.value = true
  try {
    let response

    if (convocatoriaId.value) {
      // CASO 1: Filtrado por convocatoria (viene del Dashboard)
      // Usamos el endpoint específico que devuelve las solicitudes de esa convocatoria
      response = await api.get(`/convocatorias/${convocatoriaId.value}/solicitudes`)
    } else {
      // CASO 2: Sin filtro (Ver todo)
      // Usamos el endpoint general
      response = await adminApi.getSolicitudes()
    }

    // Ajuste para leer la respuesta (Laravel Resource suele devolver { data: [...] })
    solicitudes.value = response.data.data || response.data || []

  } catch (e) {
    console.error("Error cargando solicitudes:", e)
  } finally {
    loading.value = false
  }
}

// Acción para abrir el modal
const openRevision = (solicitud) => {
  selectedSolicitud.value = solicitud
  showModal.value = true
}

const clearFilter = () => {
  router.replace({ query: null })
}

const filteredSolicitudes = computed(() => {
  if (!filterText.value) return solicitudes.value
  const term = filterText.value.toLowerCase()
  return solicitudes.value.filter(s =>
      s.beneficiario?.nombre?.toLowerCase().includes(term) ||
      s.beneficiario?.curp?.toLowerCase().includes(term) ||
      s.convocatoria?.nombre?.toLowerCase().includes(term)
  )
})

// Recargar datos si cambia el filtro en la URL
watch(convocatoriaId, fetchSolicitudes)

onMounted(fetchSolicitudes)
</script>

<template>
  <div>
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
      <div>
        <h2 class="h4 fw-bold text-dark mb-0">Solicitudes Recibidas</h2>

        <!-- Indicador de Filtro Activo -->
        <div v-if="convocatoriaId" class="text-primary small mt-1 d-flex align-items-center gap-2">
            <span class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25">
              <i class="bi bi-funnel-fill me-1"></i> Filtrando por Convocatoria
            </span>
          <button @click="clearFilter" class="btn btn-link btn-sm p-0 text-muted text-decoration-none" title="Ver todas">
            <i class="bi bi-x-circle"></i> Quitar filtro
          </button>
        </div>
      </div>

      <div class="input-group" style="max-width: 300px;">
        <span class="input-group-text bg-white border-end-0"><i class="bi bi-search"></i></span>
        <input v-model="filterText" type="text" class="form-control border-start-0 ps-0" placeholder="Buscar beneficiario...">
      </div>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-success" role="status"></div>
      <p class="text-muted small mt-2">Cargando expedientes...</p>
    </div>

    <div v-else class="card border-0 shadow-sm">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="bg-light">
          <tr>
            <th class="ps-4">Folio</th>
            <th>Beneficiario</th>
            <th>Convocatoria</th>
            <th>Fecha</th>
            <th>Status Docs</th>
            <th class="text-end pe-4">Acciones</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="sol in filteredSolicitudes" :key="sol.idSolicitud">
            <td class="ps-4 fw-bold">#{{ sol.idSolicitud }}</td>
            <td>
              <div class="fw-medium">{{ sol.beneficiario?.nombre || 'Sin nombre' }}</div>
              <small class="text-muted" style="font-size: 0.75rem;">{{ sol.beneficiario?.curp || 'N/A' }}</small>
            </td>
            <td>
              <span class="d-block text-truncate" style="max-width: 250px;" :title="sol.convocatoria?.nombre">
                  {{ sol.convocatoria?.nombre }}
              </span>
              <small v-if="sol.convocatoria?.nombreCategoria" class="text-muted fst-italic" style="font-size: 0.7rem;">
                {{ sol.convocatoria.nombreCategoria }}
              </small>
            </td>
            <td>{{ sol.fechaSolicitud ? new Date(sol.fechaSolicitud).toLocaleDateString() : '—' }}</td>
            <td>
               <span class="badge" :class="sol.requisitos?.length ? 'bg-warning text-dark' : 'bg-secondary'">
                  {{ sol.requisitos?.length || 0 }} Documentos
               </span>
            </td>
            <td class="text-end pe-4">
              <button
                  class="btn btn-sm btn-outline-primary"
                  title="Ver Expediente"
                  @click="openRevision(sol)"
              >
                Revisar <i class="bi bi-arrow-right-short"></i>
              </button>
            </td>
          </tr>
          <tr v-if="filteredSolicitudes.length === 0">
            <td colspan="6" class="text-center py-5 text-muted">
              <i class="bi bi-inbox fs-1 d-block mb-2 opacity-50"></i>
              No se encontraron solicitudes con los criterios actuales.
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- INTEGRACIÓN DEL MODAL -->
    <SolicitudRevisionModal
        :show="showModal"
        :solicitud="selectedSolicitud || {}"
        @close="showModal = false"
    />

  </div>
</template>