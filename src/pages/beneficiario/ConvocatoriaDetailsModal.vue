<template>
  <!-- Backdrop oscuro -->
  <div class="modal-backdrop fade show" v-if="show"></div>

  <!-- Modal -->
  <div
      class="modal fade show d-block"
      v-if="show"
      tabindex="-1"
      role="dialog"
      aria-modal="true"
      @click.self="$emit('close')"
  >
    <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">

        <!-- Header -->
        <div class="modal-header bg-success text-white border-0 px-4 py-3">
          <div class="d-flex flex-column">
            <span class="badge bg-white text-success bg-opacity-75 align-self-start mb-1 shadow-sm">
              {{ convocatoria.numeroConvocatoria || 'Convocatoria' }}
            </span>
            <h5 class="modal-title fw-bold text-white mb-0" style="line-height: 1.2;">
              {{ convocatoria.nombreConvocatoria }}
            </h5>
          </div>
          <button
              type="button"
              class="btn-close btn-close-white align-self-start ms-2 mt-1"
              @click="$emit('close')"
              aria-label="Cerrar"
          ></button>
        </div>

        <!-- Body -->
        <div class="modal-body p-4 bg-light">

          <!-- Sección Descripción -->
          <div class="card border-0 shadow-sm mb-4">
            <div class="card-body">
              <h6 class="text-success fw-bold text-uppercase small ls-1 mb-2">
                <i class="bi bi-info-circle-fill me-2"></i>Descripción
              </h6>
              <p class="text-muted mb-3 small">{{ convocatoria.descripcionConvocatoria }}</p>

              <div class="bg-success bg-opacity-10 p-3 rounded-3 border border-success border-opacity-25 d-flex gap-3">
                <i class="bi bi-cash-stack fs-2 text-success"></i>
                <div>
                  <h6 class="fw-bold text-dark mb-1">Apoyo Económico / Especie</h6>
                  <p class="small mb-0 text-secondary lh-sm">{{ convocatoria.descripcionMontoApoyo }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="row g-4">
            <!-- Columna Izquierda: Requisitos -->
            <div class="col-md-7">
              <div class="card border-0 shadow-sm h-100">
                <div class="card-header bg-white border-bottom-0 pt-3 pb-0">
                  <h6 class="text-success fw-bold text-uppercase small ls-1 mb-0">
                    <i class="bi bi-clipboard-check-fill me-2"></i>Requisitos
                  </h6>
                </div>
                <div class="card-body pt-2">
                  <ul class="list-group list-group-flush small">
                    <!-- Iteramos sobre el objeto requisitos -->
                    <li
                        v-for="(req, key) in convocatoria.requisitos"
                        :key="key"
                        class="list-group-item px-0 border-0 d-flex gap-2 bg-transparent py-2"
                    >
                      <i class="bi bi-check-square-fill text-primary mt-1 flex-shrink-0"></i>
                      <span class="text-muted">{{ req }}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- Columna Derecha: Elegibilidad y Registro -->
            <div class="col-md-5">
              <!-- Elegibilidad -->
              <div class="card border-0 shadow-sm mb-3">
                <div class="card-body">
                  <h6 class="text-success fw-bold text-uppercase small ls-1 mb-2">
                    <i class="bi bi-person-check-fill me-2"></i>Elegibilidad
                  </h6>
                  <div v-if="convocatoria.criteriosElegibilidad?.especificos" class="small text-muted">
                    <ul class="ps-3 mb-0">
                      <li v-for="(crit, idx) in convocatoria.criteriosElegibilidad.especificos" :key="'esp'+idx" class="mb-1">
                        {{ crit }}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <!-- Info Registro -->
              <div class="card border-0 shadow-sm bg-white">
                <div class="card-body">
                  <h6 class="text-dark fw-bold text-uppercase small ls-1 mb-3">
                    <i class="bi bi-geo-alt-fill me-2"></i>Registro
                  </h6>

                  <div class="mb-2">
                    <small class="text-uppercase text-secondary fw-bold" style="font-size: 0.7rem;">Horario de Atención</small>
                    <div class="text-dark small"><i class="bi bi-clock me-1"></i>{{ convocatoria.procesoRegistro?.horario }}</div>
                  </div>

                  <div class="mb-0 mt-3 pt-2 border-top">
                    <a
                        v-if="convocatoria.procesoRegistro?.publicacion_web"
                        :href="convocatoria.procesoRegistro.publicacion_web"
                        target="_blank"
                        class="btn btn-sm btn-outline-primary w-100"
                    >
                      Sitio Web Oficial <i class="bi bi-box-arrow-up-right ms-1"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>


        <div class="modal-footer border-top bg-light py-3 d-flex justify-content-between align-items-center">
          <button type="button" class="btn btn-outline-secondary px-4 fw-bold" @click="$emit('close')">
            Cerrar
          </button>

          <!-- BOTÓN NUEVO DE APLICAR -->
          <!-- Si hay URL externa, mantiene el comportamiento anterior, si no, abre modal interno -->
          <div class="d-flex gap-2">
            <a
                v-if="convocatoria.urlPublicacionResultados"
                :href="convocatoria.urlPublicacionResultados"
                target="_blank"
                class="btn btn-outline-agro px-4"
            >
              Ver Resultados
            </a>

            <button
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
/**
 * Props:
 * show: Boolean para controlar visibilidad
 * convocatoria: Objeto con toda la data de la convocatoria
 */
defineProps({
  show: { type: Boolean, required: true },
  convocatoria: { type: Object, default: () => ({}) }
})

defineEmits(['close', 'apply']) //
</script>

<style scoped>
.modal-backdrop {
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(3px);
  z-index: 1050;
}
.modal {
  z-index: 1055;
}
.ls-1 {
  letter-spacing: 1px;
}
/* Scrollbar bonita */
.modal-body::-webkit-scrollbar {
  width: 8px;
}
.modal-body::-webkit-scrollbar-track {
  background: #f1f1f1;
}
.modal-body::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}
.modal-body::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>