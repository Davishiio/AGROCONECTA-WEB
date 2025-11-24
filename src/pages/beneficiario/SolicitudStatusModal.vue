<template>
  <div class="modal-backdrop fade show" v-if="show"></div>
  <div
      class="modal fade show d-block"
      v-if="show"
      tabindex="-1"
      role="dialog"
      @click.self="$emit('close')"
  >
    <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">

        <!-- Header: Azul Navy para diferenciar de la postulación -->
        <div class="modal-header bg-agro-navy text-white px-4 py-3 border-0">
          <div>
            <span class="badge bg-warning text-dark mb-1 shadow-sm border border-warning">
              <i class="bi bi-clock-history me-1"></i> {{ estatusGlobal }}
            </span>
            <h5 class="modal-title fw-bold text-white lh-sm">Mi Solicitud</h5>
            <p class="mb-0 small opacity-75 text-truncate" style="max-width: 400px;">
              {{ nombreConvocatoria }}
            </p>
          </div>
          <button type="button" class="btn-close btn-close-white align-self-start ms-auto" @click="$emit('close')"></button>
        </div>

        <div class="modal-body p-4 bg-light">

          <!-- Loading -->
          <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-agro-navy" role="status"></div>
            <p class="text-muted mt-2 small">Consultando expediente...</p>
          </div>

          <!-- Empty State (Si no hay docs filtrados) -->
          <div v-else-if="documentos.length === 0" class="text-center py-5">
            <i class="bi bi-folder-x text-muted opacity-50" style="font-size: 3rem;"></i>
            <p class="text-muted mt-3">No se encontraron documentos asociados a esta convocatoria.</p>
          </div>

          <!-- Lista de Documentos -->
          <div v-else>
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h6 class="fw-bold text-agro-navy mb-0">Expediente Digital</h6>
              <span class="badge bg-white text-secondary border">{{ documentos.length }} documentos</span>
            </div>

            <div class="d-flex flex-column gap-3">
              <div
                  v-for="doc in documentos"
                  :key="doc.idDocumento"
                  class="card border-0 shadow-sm transition-hover"
              >
                <div class="card-body p-3 d-flex align-items-center gap-3">
                  <!-- Icono según tipo -->
                  <div class="rounded-circle bg-light p-3 text-agro-navy flex-shrink-0">
                    <i class="bi bi-file-earmark-pdf fs-4"></i>
                  </div>

                  <!-- Info Documento -->
                  <div class="flex-grow-1 overflow-hidden">
                    <h6 class="mb-1 fw-bold text-dark text-truncate" :title="doc.nombre_tipo_documento">
                      {{ doc.nombre_tipo_documento }}
                    </h6>
                    <div class="d-flex flex-wrap gap-2 align-items-center small">
                      <span class="text-muted"><i class="bi bi-paperclip me-1"></i>{{ doc.nombre_original }}</span>
                      <span class="text-muted border-start ps-2">{{ (doc.peso_kb / 1024).toFixed(2) }} MB</span>
                      <span class="text-muted border-start ps-2">{{ formatDate(doc.fecha_subida) }}</span>
                    </div>
                  </div>

                  <!-- Estatus Individual -->
                  <div class="text-end" style="min-width: 100px;">
                    <span
                        class="badge rounded-pill px-2 py-1 mb-2 d-inline-block"
                        :class="getStatusClass(doc.estado)"
                    >
                      {{ doc.estado }}
                    </span>
                    <div>
                      <a
                          :href="doc.url"
                          target="_blank"
                          class="btn btn-sm btn-outline-primary border-0"
                          title="Ver documento"
                      >
                        <i class="bi bi-eye-fill"></i>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- Footer -->
        <div class="modal-footer border-top bg-light py-3">
          <button type="button" class="btn btn-secondary px-4 fw-bold" @click="$emit('close')">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import '@/assets/agro-theme.css'

const props = defineProps({
  show: Boolean,
  loading: Boolean,
  documentos: { type: Array, default: () => [] },
  nombreConvocatoria: String,
  estatusGlobal: { type: String, default: 'En Revisión' }
})

defineEmits(['close'])

const formatDate = (fecha) => {
  if (!fecha) return ''
  return new Date(fecha).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
}

const getStatusClass = (estado) => {
  switch (estado?.toLowerCase()) {
    case 'aprobado': return 'bg-success text-white'
    case 'rechazado': return 'bg-danger text-white'
    case 'pendiente':
    default: return 'bg-warning text-dark bg-opacity-75'
  }
}
</script>

<style scoped>
.modal-backdrop { background-color: rgba(30, 58, 95, 0.6); backdrop-filter: blur(4px); z-index: 1060; }
.modal { z-index: 1065; }
.transition-hover { transition: transform 0.2s; }
.transition-hover:hover { transform: translateY(-2px); }
</style>