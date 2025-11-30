<template>
  <div class="modal-backdrop fade show" v-if="show"></div>
  <div class="modal fade show d-block" v-if="show" tabindex="-1" role="dialog" @click.self="$emit('close')">
    <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">

        <!-- Header -->
        <div class="modal-header bg-agro-emerald text-white px-4 py-3 border-0">
          <div class="d-flex flex-column" style="max-width: 90%;">
            <div class="d-flex align-items-center gap-2 mb-1">
              <span class="badge bg-white text-agro-emerald bg-opacity-75 border border-white">
              </span>
              <span v-if="estatusUsuario" class="badge bg-warning text-dark border border-warning shadow-sm">
                <i class="bi bi-info-circle-fill"></i> Solicitud {{ estatusUsuario }}
              </span>
            </div>
            <h5 class="modal-title fw-bold text-white lh-sm text-truncate">
              {{ convocatoria.nombreConvocatoria }}
            </h5>
          </div>
          <button type="button" class="btn-close btn-close-white align-self-start ms-auto" @click="$emit('close')"></button>
        </div>

        <div class="modal-body p-0 bg-light">
          <!-- Resumen -->
          <div class="bg-white p-4 border-bottom">
            <p class="text-secondary mb-3 small" v-if="convocatoria.descripcionConvocatoria">
              {{ convocatoria.descripcionConvocatoria }}
            </p>
            <div class="d-flex flex-wrap gap-2">
              <span class="badge bg-light text-secondary border d-flex align-items-center gap-1">
                <i class="bi bi-calendar-check"></i> Inicio: {{ formatDate(convocatoria.fechaInicio) }}
              </span>
              <span class="badge bg-light text-secondary border d-flex align-items-center gap-1">
                <i class="bi bi-calendar-x"></i> Cierre: {{ formatDate(convocatoria.fechaCierre) }}
              </span>
            </div>
          </div>

          <!-- Tabs -->
          <div class="bg-white px-3 pt-2">
            <ul class="nav nav-tabs nav-tabs-agro border-bottom-0" role="tablist">
              <li class="nav-item"><button class="nav-link" :class="{active: tab==='objetivo'}" @click="tab='objetivo'">Objetivo</button></li>
              <li class="nav-item"><button class="nav-link" :class="{active: tab==='requisitos'}" @click="tab='requisitos'">Requisitos</button></li>
              <li class="nav-item"><button class="nav-link" :class="{active: tab==='registro'}" @click="tab='registro'">Registro</button></li>
            </ul>
          </div>

          <!-- Contenido Tabs -->
          <div class="p-4" style="min-height: 250px;">
            <section v-if="tab==='objetivo'" class="animate-fade-in">
              <h6 class="text-agro-navy fw-bold mb-2">Objetivo General</h6>
              <p class="text-secondary small mb-4">{{ convocatoria.objetivoGeneral || 'No especificado.' }}</p>
              <h6 class="text-agro-emerald fw-bold mb-1"><i class="bi bi-cash-stack me-2"></i>Apoyo</h6>
              <p class="text-muted small mb-0">{{ convocatoria.descripcionMontoApoyo }}</p>
            </section>

            <section v-if="tab==='requisitos'" class="animate-fade-in">
              <h6 class="text-agro-navy fw-bold mb-3">Documentación Requerida</h6>
              <ul class="list-group list-group-flush border rounded-3">
                <li v-for="(req, idx) in requisitosList" :key="idx" class="list-group-item d-flex gap-2 align-items-start bg-transparent py-3">
                  <i class="bi bi-check-circle-fill text-agro-emerald mt-1 flex-shrink-0"></i>
                  <span class="text-secondary small">{{ req }}</span>
                </li>
              </ul>
            </section>

            <section v-if="tab==='registro'" class="animate-fade-in">
              <div class="alert alert-light border border-success border-opacity-25 d-flex gap-3 align-items-center mb-4">
                <i class="bi bi-clock-history fs-3 text-agro-emerald"></i>
                <div>
                  <strong class="d-block text-agro-navy">Horario de Atención</strong>
                  <span class="text-secondary small">{{ convocatoria.procesoRegistro?.horario || 'No especificado' }}</span>
                </div>
              </div>
            </section>
          </div>
        </div>

        <!-- Footer -->
        <div class="modal-footer border-top bg-light py-3 d-flex justify-content-between align-items-center">
          <button type="button" class="btn btn-outline-secondary fw-bold" @click="$emit('close')">Cerrar</button>

          <div class="d-flex gap-2 align-items-center">
            <div v-if="estatusUsuario" class="text-muted small fw-bold bg-white px-3 py-2 rounded border">
              <i class="bi bi-check2-circle text-success fs-5 align-middle me-1"></i>
              Ya has aplicado ({{ estatusUsuario }})
            </div>
            <button
                v-else
                type="button"
                class="btn btn-agro-primary px-4 fw-bold shadow-sm"
                @click="$emit('apply', convocatoria)"
            >
              Solicitar Apoyo <i class="bi bi-send-check-fill ms-2"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import '@/assets/agro-theme.css'

const props = defineProps({
  show: { type: Boolean, required: true },
  convocatoria: { type: Object, default: () => ({}) },
  estatusUsuario: { type: String, default: null }
})

const emit = defineEmits(['close', 'apply'])
const tab = ref('objetivo')

watch(() => props.show, (val) => { if (val) tab.value = 'objetivo' })

const requisitosList = computed(() => {
  if (!props.convocatoria.requisitos) return []
  if (Array.isArray(props.convocatoria.requisitos)) return props.convocatoria.requisitos
  return Object.entries(props.convocatoria.requisitos)
      .sort((a,b) => Number(a[0]) - Number(b[0]))
      .map(([,v]) => v)
})

const formatDate = (iso) => {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  if(!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString('es-MX', { year:'numeric', month:'long', day:'numeric' })
}
</script>

<style scoped>
.modal-backdrop { background-color: rgba(30, 58, 95, 0.6); backdrop-filter: blur(4px); z-index: 1050; }
.modal { z-index: 1055; }
.nav-tabs-agro .nav-link { color: var(--agro-navy); border: none; border-bottom: 3px solid transparent; padding: 0.75rem 1rem; font-weight: 500; }
.nav-tabs-agro .nav-link.active { color: var(--agro-emerald); border-bottom-color: var(--agro-emerald); background: transparent; font-weight: 700; }
.animate-fade-in { animation: fadeIn 0.3s ease-in-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
</style>