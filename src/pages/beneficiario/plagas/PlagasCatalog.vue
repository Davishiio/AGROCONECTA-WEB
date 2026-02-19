<template>
  <div class="row g-4">
    <div v-if="loading" class="col-12 text-center py-5">
      <div class="spinner-border text-agro-emerald" role="status">
        <span class="visually-hidden">Cargando catálogo...</span>
      </div>
    </div>

    <div v-else-if="plagas.length === 0" class="col-12 text-center py-5">
      <p class="text-muted">No se encontraron plagas en el catálogo.</p>
    </div>

    <div v-else class="col-12 col-md-6 col-lg-4" v-for="plaga in plagas" :key="plaga.id">
      <div class="card h-100 border-0 shadow-sm rounded-4 hover-lift">
        <div class="position-relative">
            <img :src="plaga.foto_referencia_url || 'https://placehold.co/600x400?text=Sin+Imagen'" class="card-img-top rounded-top-4" style="height: 200px; object-fit: cover;" :alt="plaga.nombre_comun">
            <div class="position-absolute top-0 end-0 p-3">
                <span class="badge rounded-pill px-3 py-2 shadow-sm" :class="getPeligrosidadClass(plaga.nivel_peligrosidad)">
                    {{ plaga.nivel_peligrosidad }}
                </span>
            </div>
        </div>
        <div class="card-body">
          <h5 class="card-title fw-bold text-agro-navy mb-1">{{ plaga.nombre_comun }}</h5>
          <p class="card-text text-muted fst-italic small mb-3">{{ plaga.nombre_cientifico }}</p>
          <hr class="border-secondary opacity-25">
          <button class="btn btn-outline-agro-emerald w-100 rounded-pill" @click="showDetails(plaga)">
             <i class="bi bi-info-circle me-1"></i> Ver Detalles
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { fetchPlagasCatalog } from '@/services/plagas.api'

const plagas = ref([])
const loading = ref(true)

const loadCatalog = async () => {
    loading.value = true
    try {
        const data = await fetchPlagasCatalog()
        plagas.value = data
    } catch (e) {
        console.error("Error loading plagas catalog", e)
    } finally {
        loading.value = false
    }
}

const getPeligrosidadClass = (level) => {
    // Asumiendo que puede venir como texto "Alto", "Medio", "Bajo" o número
    const lowerLevel = String(level).toLowerCase()
    if (lowerLevel.includes('alto') || lowerLevel === 'high') return 'bg-danger text-white'
    if (lowerLevel.includes('medio') || lowerLevel === 'medium') return 'bg-warning text-dark'
    return 'bg-success text-white'
}

const showDetails = (plaga) => {
    // Por ahora simple alerta o modal futuro
    // Se puede expandir para mostrar un modal con más info si el backend lo provee
    console.log("Detalles de plaga", plaga)
}

onMounted(() => {
    loadCatalog()
})
</script>

<style scoped>
.hover-lift {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.hover-lift:hover {
    transform: translateY(-5px);
    box-shadow: 0 .5rem 1rem rgba(0,0,0,.15)!important;
}
</style>
