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
              <div class="row g-0 h-100">

                <!-- COLUMNA IZQUIERDA: EVIDENCIA -->
                <div class="col-4 col-sm-3 bg-light d-flex align-items-center justify-content-center border-end position-relative" style="min-height: 120px;">
                  <!-- Caso FOTO -->
                  <img
                      v-if="reporte.tipo_evidencia === 'Foto' && reporte.archivo_r2_url"
                      :src="reporte.archivo_r2_url"
                      class="img-fluid h-100 w-100 object-fit-cover position-absolute top-0 start-0"
                      alt="Evidencia"
                  >
                  <!-- Caso VIDEO -->
                  <div v-else-if="reporte.tipo_evidencia === 'Video'" class="text-center text-muted p-2">
                    <i class="bi bi-camera-reels fs-1 d-block mb-1"></i>
                    <span class="badge bg-dark bg-opacity-75 small">VIDEO</span>
                  </div>
                  <!-- Caso AUDIO -->
                  <div v-else-if="reporte.tipo_evidencia === 'Audio'" class="text-center text-muted p-2">
                    <i class="bi bi-mic fs-1 d-block mb-1"></i>
                    <span class="badge bg-secondary small">AUDIO</span>
                  </div>
                  <!-- Fallback / Texto -->
                  <div v-else class="text-center text-muted p-2">
                    <i class="bi bi-file-text fs-1 d-block mb-1"></i>
                    <span class="small">Texto</span>
                  </div>
                </div>

                <!-- COLUMNA DERECHA: INFORMACIÓN -->
                <div class="col-8 col-sm-9">
                  <div class="card-body p-3 h-100 d-flex flex-column">

                    <!-- Encabezado: Parcela y Fecha -->
                    <div class="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <h6 class="fw-bold text-agro-navy mb-0 text-truncate" style="max-width: 200px;">
                          {{ reporte.parcela?.nombreParcela || 'Parcela sin nombre' }}
                        </h6>
                        <small class="text-muted d-flex align-items-center">
                          <i class="bi bi-calendar-event me-1"></i> {{ formatDate(reporte.fecha_aparicion) }}
                        </small>
                      </div>

                      <!-- Badge de Estado Normalizado -->
                      <span class="badge rounded-pill border" :class="getStatusBadge(reporte.estado_reporte).class">
                        <i :class="getStatusBadge(reporte.estado_reporte).icon" class="me-1"></i>
                        {{ getStatusBadge(reporte.estado_reporte).label }}
                      </span>
                    </div>

                    <!-- Cuerpo: Descripción del usuario -->
                    <p class="text-secondary small mb-2 fst-italic text-truncate-2">
                      "{{ reporte.comentario_usuario || 'Sin descripción proporcionada.' }}"
                    </p>

                    <!-- SECCIÓN: RESULTADO DEL ANÁLISIS/VALIDACIÓN -->
                    <div class="mt-auto">

                      <!-- Caso 1: Validado (Plaga Confirmada) -->
                      <div v-if="reporte.estado_reporte === 'Validado'" class="bg-danger bg-opacity-10 px-2 py-1 rounded border border-danger border-opacity-25 d-inline-block">
                        <small class="fw-bold text-danger">
                          <i class="bi bi-bug-fill me-1"></i>
                          {{ reporte.plaga?.nombre_comun || 'Plaga Confirmada' }}
                        </small>
                      </div>

                      <!-- Caso 2: Rechazado (Nota Admin) -->
                      <div v-else-if="reporte.estado_reporte === 'Rechazado' && reporte.nota_admin" class="bg-secondary bg-opacity-10 px-2 py-1 rounded">
                        <small class="fw-bold text-dark d-block">Motivo rechazo:</small>
                        <small class="text-muted">{{ reporte.nota_admin }}</small>
                      </div>

                      <!-- Caso 3: Recibido/Pendiente (Mensaje de espera) -->
                      <div v-else-if="reporte.estado_reporte === 'Recibido'" class="text-muted small">
                        <i class="bi bi-hourglass-split me-1 text-warning"></i>
                        Tu reporte está siendo analizado por el comité técnico.
                      </div>

                    </div>

                    <!-- Botón Seguimiento (Solo si Validado) -->
                    <div v-if="reporte.estado_reporte === 'Validado'" class="mt-2 border-top pt-2">
                      <button class="btn btn-sm btn-outline-primary w-100 py-1" @click="toggleFollowUp(reporte.id)">
                        <i class="bi bi-clipboard-plus me-1"></i> Agregar Seguimiento
                      </button>

                      <!-- Formulario Seguimiento -->
                      <div v-if="activeFollowUp === reporte.id" class="mt-2 bg-light p-2 rounded border animate-fade-in">
                        <h6 class="small fw-bold text-muted mb-2">Bitácora de Tratamiento</h6>
                        <div class="mb-2">
                          <input v-model="followUpForm.accion" class="form-control form-control-sm mb-2" placeholder="¿Qué aplicaste? (ej. Insecticida X)">
                          <select v-model="followUpForm.resultado" class="form-select form-select-sm">
                            <option value="" disabled selected>Resultado observado</option>
                            <option value="En tratamiento">En tratamiento</option>
                            <option value="Controlado">Controlado</option>
                            <option value="Erradicado">Erradicado</option>
                            <option value="Empeoró">Empeoró</option>
                          </select>
                        </div>
                        <div class="d-flex justify-content-end gap-2">
                          <button class="btn btn-sm btn-link text-secondary p-0" @click="activeFollowUp = null">Cancelar</button>
                          <button class="btn btn-sm btn-primary px-3" :disabled="sendingFollowUp" @click="submitFollowUp(reporte.id)">
                            <span v-if="sendingFollowUp" class="spinner-border spinner-border-sm"></span>
                            <span v-else>Guardar</span>
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
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
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
    // Ajuste: Dependiendo de si Laravel devuelve { data: [...] } o [...] directo
    reportes.value = Array.isArray(res.data) ? res.data : (res.data.data || [])
  } catch (e) {
    console.error("Error cargando reportes:", e)
  } finally {
    loading.value = false
  }
}

// Helpers visuales
const getStatusBadge = (status) => {
  const normalized = status?.toLowerCase() || ''

  if (normalized === 'validado' || normalized === 'aprobado') {
    return { label: 'Confirmado', class: 'bg-success text-white border-success', icon: 'bi-check-circle-fill' }
  } else if (normalized === 'rechazado') {
    return { label: 'Descartado', class: 'bg-danger text-white border-danger', icon: 'bi-x-circle-fill' }
  } else {
    // Default: Recibido / Pendiente
    return { label: 'Pendiente', class: 'bg-warning text-dark border-warning bg-opacity-25', icon: 'bi-clock-history' }
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('es-MX', {
    year: 'numeric', month: 'short', day: 'numeric'
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
  if (!followUpForm.value.accion || !followUpForm.value.resultado) {
    alert("Por favor completa la acción y el resultado.")
    return
  }

  sendingFollowUp.value = true
  try {
    await plagasService.addFollowUp(id, {
      accion_realizada: followUpForm.value.accion,
      resultado: followUpForm.value.resultado
    })
    alert("Seguimiento registrado correctamente.")
    activeFollowUp.value = null
    // Recargar para actualizar vista si fuera necesario (aunque seguimiento va en otra tabla)
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

<style scoped>
.text-truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.object-fit-cover {
  object-fit: cover;
}
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>