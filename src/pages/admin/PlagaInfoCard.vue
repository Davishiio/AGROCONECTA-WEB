<template>
  <div class="card border-0 shadow-sm h-100 bg-white border-start border-4" :class="getBorderClass(plaga.nivel_peligrosidad)">
    <div class="card-body">
      <h6 class="fw-bold text-muted text-uppercase small mb-3">
        <i class="bi bi-bug-fill me-1" :class="getTextClass(plaga.nivel_peligrosidad)"></i>
        Plaga Identificada / Sospechosa
      </h6>

      <div class="d-flex align-items-start gap-3">
        <!-- Foto de Referencia (Catálogo) -->
        <div class="position-relative">
          <img
              v-if="plaga.foto_referencia_url"
              :src="plaga.foto_referencia_url"
              alt="Referencia"
              class="rounded-3 object-fit-cover shadow-sm"
              style="width: 80px; height: 80px;"
              onerror="this.style.display='none'"
          >
          <div v-else class="rounded-3 bg-light d-flex align-items-center justify-content-center text-muted border" style="width: 80px; height: 80px;">
            <i class="bi bi-image"></i>
          </div>
        </div>

        <!-- Información -->
        <div class="flex-grow-1">
          <h5 class="fw-bold text-dark mb-1">{{ plaga.nombre_comun }}</h5>
          <p class="fst-italic text-secondary small mb-2 border-bottom pb-2">
            {{ plaga.nombre_cientifico }}
          </p>

          <div class="d-flex justify-content-between align-items-center">
            <span
                class="badge rounded-pill"
                :class="getBadgeClass(plaga.nivel_peligrosidad)"
            >
              Peligrosidad: {{ plaga.nivel_peligrosidad }}
            </span>

            <!-- Slot opcional por si quieres agregar botones extra en otros módulos -->
            <slot name="actions"></slot>
          </div>
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

// Helpers para estilos dinámicos según peligrosidad
const getBorderClass = (nivel) => {
  switch (nivel?.toLowerCase()) {
    case 'alto': return 'border-danger'
    case 'medio': return 'border-warning'
    case 'bajo': return 'border-success'
    default: return 'border-secondary'
  }
}

const getTextClass = (nivel) => {
  switch (nivel?.toLowerCase()) {
    case 'alto': return 'text-danger'
    case 'medio': return 'text-warning'
    case 'bajo': return 'text-success'
    default: return 'text-secondary'
  }
}

const getBadgeClass = (nivel) => {
  switch (nivel?.toLowerCase()) {
    case 'alto': return 'bg-danger text-white'
    case 'medio': return 'bg-warning text-dark'
    case 'bajo': return 'bg-success text-white'
    default: return 'bg-secondary text-white'
  }
}
</script>