<template>
  <div v-if="show" class="modal-backdrop fade show" style="z-index: 1050;"></div>
  <div v-if="show" class="modal fade show d-block" tabindex="-1" role="dialog">
    <div class="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
      <div class="modal-content border-0 shadow-lg rounded-4">
        <div class="modal-header border-0 pb-0">
          <h5 class="modal-title fw-bold text-agro-navy">
            <i class="bi bi-list-check text-agro-emerald me-2"></i> Mis Reportes de Plagas
          </h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>
        <div class="modal-body p-4 bg-light">

          <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-agro-emerald" role="status"></div>
            <p class="text-muted mt-2">Cargando reportes...</p>
          </div>

          <div v-else-if="reportes.length === 0" class="text-center py-5">
            <i class="bi bi-inbox fs-1 text-muted opacity-50"></i>
            <p class="text-muted mt-3">No has realizado reportes aún.</p>
            <button class="btn btn-agro-primary btn-sm rounded-pill" @click="$emit('create')">
              Crear Nuevo Reporte
            </button>
          </div>

          <div v-else class="d-flex flex-column gap-3">
            <div v-for="reporte in reportes" :key="reporte.id" class="card border-0 shadow-sm rounded-3 overflow-hidden">
              <div class="card-body p-3">
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <h6 class="fw-bold text-agro-navy mb-0">{{ reporte.tipo_cultivo || 'Cultivo Desconocido' }}</h6>
                    <small class="text-muted">{{ formatDate(reporte.created_at) }}</small>
                  </div>
                  <span class="badge rounded-pill" :class="getStatusClass(reporte.estado)">
                    {{ reporte.estado }}
                  </span>
                </div>

                <p class="text-secondary small mb-2">{{ reporte.descripcion }}</p>

                <!-- Feedback del Admin si existe -->
                <div v-if="reporte.retroalimentacion" class="bg-warning bg-opacity-10 p-2 rounded mb-2 border border-warning border-opacity-25">
                  <small class="fw-bold text-warning-emphasis d-block"><i class="bi bi-chat-left-text me-1"></i> Respuesta Admin:</small>
                  <small class="text-muted">{{ reporte.retroalimentacion }}</small>
                </div>

                <!-- Botón Seguimiento (Solo si Aprobado) -->
                <div v-if="reporte.estado === 'Aprobado'" class="mt-2 pt-2 border-top">
                   <button class="btn btn-sm btn-outline-primary w-100" @click="toggleFollowUp(reporte.id)">
                     <i class="bi bi-clipboard-plus me-1"></i> Agregar Seguimiento
                   </button>

                   <!-- Formulario Seguimiento -->
                   <div v-if="activeFollowUp === reporte.id" class="mt-3 bg-light p-3 rounded">
                     <h6 class="small fw-bold text-muted mb-2">Nuevo Seguimiento</h6>
                     <div class="mb-2">
                       <input v-model="followUpForm.accion" class="form-control form-control-sm mb-2" placeholder="Acción realizada (ej. Fumigación)">
                       <input v-model="followUpForm.resultado" class="form-control form-control-sm" placeholder="Resultado observado">
                     </div>
                     <div class="d-flex justify-content-end gap-2">
                       <button class="btn btn-sm btn-link text-secondary text-decoration-none" @click="activeFollowUp = null">Cancelar</button>
                       <button class="btn btn-sm btn-primary" :disabled="sendingFollowUp" @click="submitFollowUp(reporte.id)">
                         <span v-if="sendingFollowUp" class="spinner-border spinner-border-sm"></span>
                         Guardar
                       </button>
                     </div>
                   </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import plagasService from '@/services/plagas.service'

const props = defineProps({
  show: Boolean
})
const emit = defineEmits(['close', 'create'])

const loading = ref(false)
const reportes = ref([])
const activeFollowUp = ref(null)
const sendingFollowUp = ref(false)
const followUpForm = ref({ accion: '', resultado: '' })

const loadReports = async () => {
  loading.value = true
  try {
    const res = await plagasService.getUserReports()
    reportes.value = res.data.data || res.data || []
  } catch (e) {
    console.error("Error cargando reportes:", e)
  } finally {
    loading.value = false
  }
}

const getStatusClass = (status) => {
  switch (status) {
    case 'Aprobado': return 'bg-success'
    case 'Rechazado': return 'bg-danger'
    case 'Pendiente': return 'bg-warning text-dark'
    default: return 'bg-secondary'
  }
}

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('es-MX', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  })
}

const toggleFollowUp = (id) => {
  if (activeFollowUp.value === id) {
    activeFollowUp.value = null
  } else {
    activeFollowUp.value = id
    followUpForm.value = { accion: '', resultado: '' }
  }
}

const submitFollowUp = async (id) => {
  if (!followUpForm.value.accion) return
  sendingFollowUp.value = true
  try {
    await plagasService.addFollowUp(id, followUpForm.value)
    alert("Seguimiento agregado correctamente.")
    activeFollowUp.value = null
    // Opcional: recargar reportes si el backend devuelve el reporte actualizado
  } catch (e) {
    console.error(e)
    alert("Error al guardar seguimiento.")
  } finally {
    sendingFollowUp.value = false
  }
}

watch(() => props.show, (val) => {
  if (val) loadReports()
})
</script>
