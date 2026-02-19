<template>
  <div class="card border-0 shadow-sm rounded-4 p-4 mb-4">
    <h6 class="fw-bold mb-3 text-agro-navy"><i class="bi bi-funnel-fill me-2"></i>Filtros</h6>
    
    <div class="d-flex flex-column gap-3">
      <!-- Búsqueda -->
      <div>
        <label class="form-label small fw-bold text-muted">Buscar</label>
        <div class="input-group">
          <span class="input-group-text bg-light border-end-0"><i class="bi bi-search text-muted"></i></span>
          <input type="text" class="form-control border-start-0 bg-light" placeholder="Producto, productor..." v-model="filters.q" @input="emitFilters">
        </div>
      </div>

      <!-- Categoría -->
      <div>
        <label class="form-label small fw-bold text-muted">Categoría</label>
        <select class="form-select bg-light" v-model="filters.categoria" @change="emitFilters">
          <option value="">Todas</option>
          <option v-for="cat in categorias" :key="cat.id" :value="cat.nombre">{{ cat.nombre }}</option>
        </select>
      </div>

       <!-- Localidad (Optional) -->
       <!-- Could add more filters here later -->
       
       <button class="btn btn-sm btn-link text-muted text-decoration-none text-end" @click="resetFilters" v-if="filters.q || filters.categoria">
         Limpiar filtros
       </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { fetchCategories } from '@/services/mercado.api'

const emit = defineEmits(['update:filters'])

const filters = ref({
  q: '',
  categoria: ''
})

const categorias = ref([])

const loadCategories = async () => {
    try {
        const response = await fetchCategories()
        // console.log("Categories Response:", response) 
        
        let data = []
        if (Array.isArray(response)) {
            data = response
        } else if (response && Array.isArray(response.data)) {
            data = response.data
        } else if (response && typeof response === 'object') {
            // Maybe it's an object with keys? 
            // If it's just { ... }, we might wrap it in array if it looks like a category?
            // For now, assume if not array, it might be fail.
        }
        
        if (data && data.length > 0) {
           categorias.value = data
        } else {
           // If no data from API, just use fallback quietly or log warning
           console.warn("API returned no categories, using fallback.")
           throw new Error("No categories found in API response")
        }
    } catch (e) {
        console.warn("Using fallback categories due to:", e.message)
        categorias.value = [
            {nombre: 'Huevo y aves'}, {nombre: 'Miel y derivados'}, {nombre: 'Frutas y verduras'},
            {nombre: 'Maíz y granos'}, {nombre: 'Lácteos y quesos'}, {nombre: 'Artesanías rurales'},
            {nombre: 'Pesca'}
        ]
    }
}

const emitFilters = () => {
  emit('update:filters', { ...filters.value })
}

const resetFilters = () => {
  filters.value = { q: '', categoria: '' }
  emitFilters()
}

onMounted(loadCategories)
</script>
