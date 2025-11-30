<template>
  <div class="container-fluid">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h3 class="fw-bold text-agro-navy mb-1">Categorías de Apoyo</h3>
        <p class="text-muted mb-0">Selecciona un sector para gestionar sus convocatorias.</p>
      </div>
      <!-- Botón decorativo (funcionalidad futura) -->
      <button class="btn btn-agro-primary fw-bold shadow-sm" disabled>
        <i class="bi bi-plus-lg me-2"></i> Nueva Categoría
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="row g-4">
      <div class="col-md-6 col-lg-4" v-for="n in 3" :key="n">
        <div class="card border-0 shadow-sm rounded-4 h-100 p-4">
          <span class="placeholder col-6 bg-secondary mb-3"></span>
          <span class="placeholder col-12 bg-light" style="height: 60px;"></span>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="categorias.length === 0" class="text-center py-5">
      <div class="bg-light rounded-circle d-inline-flex p-4 mb-3 text-muted">
        <i class="bi bi-tags fs-1"></i>
      </div>
      <h5>No hay categorías disponibles</h5>
      <p class="text-muted">Parece que no hay conexión con el servidor.</p>
    </div>

    <!-- Grid de Categorías -->
    <div v-else class="row g-4">
      <div
          class="col-md-6 col-lg-4"
          v-for="cat in categorias"
          :key="cat.idCategoria"
      >
        <div
            class="card border-0 shadow-sm rounded-4 h-100 hover-card cursor-pointer position-relative overflow-hidden"
            @click="goToCategory(cat)"
        >
          <!-- Borde lateral de color -->
          <div class="position-absolute top-0 start-0 bottom-0 bg-agro-emerald" style="width: 6px;"></div>

          <div class="card-body p-4 ms-2">
            <div class="d-flex justify-content-between align-items-start mb-3">
              <div class="icon-box bg-light text-agro-emerald rounded-3 p-2">
                <!-- Icono dinámico según ID o nombre (opcional) -->
                <i class="bi" :class="getIcon(cat.idCategoria)"></i>
              </div>
              <span class="badge bg-white text-secondary border rounded-pill px-3">
              </span>
            </div>

            <h5 class="fw-bold text-agro-navy mb-2">{{ cat.nombreCategoria }}</h5>
            <p class="text-muted small mb-0 line-clamp-3">
              {{ cat.descripcionCategoria }}
            </p>
          </div>

          <div class="card-footer bg-white border-0 py-3 ms-2 d-flex justify-content-between align-items-center">
            <small class="text-agro-emerald fw-bold">Ver Convocatorias</small>
            <div class="btn btn-sm btn-light rounded-circle">
              <i class="bi bi-arrow-right text-dark"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchCategorias } from '@/services/convocatorias.api'
import '@/assets/agro-theme.css'

const router = useRouter()
const categorias = ref([])
const loading = ref(true)

// Mapeo simple de iconos por ID (puedes mejorarlo)
const getIcon = (id) => {
  const map = {
    1: 'bi-flower1', // Agricultura
    2: 'bi-house-heart', // Desarrollo Rural
    3: 'bi-piggy-bank', // Ganadería
    4: 'bi-water', // Pesca
    5: 'bi-cash-coin', // Financiamiento
    6: 'bi-bricks' // Infraestructura
  }
  return map[id] || 'bi-grid'
}

const loadData = async () => {
  loading.value = true
  try {
    // LLAMADA A LA API
    const response = await fetchCategorias()

    // --- LÓGICA CLAVE PARA TU JSON ---
    // Tu API devuelve: { count: 6, data: [...] }
    if (response.data && Array.isArray(response.data)) {
      categorias.value = response.data
    } else if (Array.isArray(response)) {
      // Por si acaso devuelve array directo
      categorias.value = response
    } else {
      categorias.value = []
    }

  } catch (error) {
    console.error("Error cargando categorías:", error)
  } finally {
    loading.value = false
  }
}

const goToCategory = (cat) => {
  // Navega a la lista de convocatorias de esa categoría
  // Ruta definida en index.js: /admin/convocatorias/:idCategoria
  router.push({
    name: 'admin-convocatorias-list',
    params: { idCategoria: cat.idCategoria },
    // Pasamos el nombre como prop o query para mostrarlo en el título de la siguiente página
    query: { nombre: cat.nombreCategoria }
  })
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.hover-card { transition: transform 0.2s ease, box-shadow 0.2s ease; cursor: pointer; }
.hover-card:hover { transform: translateY(-5px); box-shadow: 0 1rem 3rem rgba(0,0,0,.1)!important; }
.icon-box { width: 45px; height: 45px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; }
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>