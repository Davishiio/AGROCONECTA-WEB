<template>
  <div class="modal fade show d-block" tabindex="-1" role="dialog" style="background: rgba(0,0,0,0.5);">
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content rounded-4 border-0 shadow-lg">
        <div class="modal-header border-0 pb-0">
          <h5 class="modal-title fw-bold text-agro-navy">{{ plaga.plaga.nombre_comun }}</h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>
        <div class="modal-body">
           <div class="text-center mb-3" v-if="plaga.plaga.foto_url">
              <img :src="plaga.plaga.foto_url" class="img-fluid rounded-3 shadow-sm" style="max-height: 200px; object-fit: cover;" alt="Plaga">
           </div>
           
           <div class="mb-3">
              <span class="badge rounded-pill px-3 py-2" :class="getPeligrosidadClass(plaga.plaga.nivel_peligrosidad)">
                 Peligrosidad: {{ plaga.plaga.nivel_peligrosidad }}
              </span>
           </div>
           
           <p class="text-muted fst-italic mb-2">{{ plaga.plaga.nombre_cientifico }}</p>
           
           <div class="alert alert-warning border-0 rounded-3 d-flex align-items-start gap-2">
              <i class="bi bi-exclamation-triangle-fill mt-1"></i>
              <div>
                  <strong class="d-block mb-1">Alerta:</strong>
                  {{ plaga.alerta.mensaje }}
              </div>
           </div>
           
           <div class="d-flex justify-content-between text-muted small mt-3 pt-3 border-top">
             <span><i class="bi bi-calendar-event me-1"></i>Reportado: {{ formatDate(plaga.fecha) }}</span>
             <span><i class="bi bi-geo-alt me-1"></i>Radio: {{ plaga.ubicacion.radio_km }} km</span>
           </div>
        </div>
        <div class="modal-footer border-0 pt-0">
          <button type="button" class="btn btn-secondary w-100 rounded-pill fw-bold" @click="$emit('close')">Cerrar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  plaga: {
    type: Object,
    required: true
  }
})

const getPeligrosidadClass = (level) => {
    const lowerLevel = String(level).toLowerCase()
    if (lowerLevel.includes('alto') || lowerLevel === 'high') return 'bg-danger text-white'
    if (lowerLevel.includes('medio') || lowerLevel === 'medium') return 'bg-warning text-dark'
    return 'bg-success text-white'
}

const formatDate = (dateStr) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString()
}
</script>
