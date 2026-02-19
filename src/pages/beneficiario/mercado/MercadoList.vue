<template>
  <div class="container-fluid px-4 pb-4">
    <!-- Header Sticky -->
    <div class="d-flex justify-content-between align-items-center py-3 bg-light sticky-header mb-4 border-bottom">
       <div>
         <h2 class="fw-bold text-agro-navy mb-0">Mercado Comunitario</h2>
         <p class="text-muted mb-0">Descubre y compra productos locales de tu comunidad.</p>
       </div>
       <router-link :to="{ name: 'mercado-my-products' }" class="btn btn-agro-primary rounded-pill px-4 fw-bold shadow-sm">
         <i class="bi bi-shop-window me-2"></i> Mis Productos
       </router-link>
    </div>

    <div class="row">
      <!-- Sidebar Filters Sticky -->
      <div class="col-lg-3 col-xxl-2">
        <div class="sticky-sidebar">
            <ProductFilters @update:filters="handleFilters" />
            
            <div class="card border-0 bg-agro-emerald text-white rounded-4 p-4 mt-3 shadow-sm">
              <h5 class="fw-bold"><i class="bi bi-lightbulb mb-2 d-block fs-1"></i>¿Vendes algo?</h5>
              <p class="small opacity-90">Publica tus productos y llega a más personas en tu comunidad.</p>
              <router-link :to="{ name: 'mercado-my-products' }" class="btn btn-light text-agro-emerald w-100 fw-bold rounded-pill">Empezar a Vender</router-link>
            </div>
        </div>
      </div>
      
      <!-- Product Grid (Scrollable by default window scroll) -->
      <div class="col-lg-9 col-xxl-10">
         <div v-if="loading" class="row g-4">
            <div class="col-md-6 col-lg-4 col-xl-3" v-for="n in 8" :key="n">
               <div class="card border-0 shadow-sm rounded-4 p-3" aria-hidden="true">
                 <div class="placeholder-glow">
                   <span class="placeholder col-12 rounded" style="height: 180px;"></span>
                   <span class="placeholder col-8 mt-3"></span>
                   <span class="placeholder col-4"></span>
                 </div>
               </div>
            </div>
         </div>
         
         <div v-else-if="products.length > 0" class="row g-3">
            <div class="col-sm-6 col-md-4 col-lg-4 col-xl-3 col-xxl-2" v-for="product in products" :key="product.id">
               <ProductCard :product="product" />
            </div>
         </div>
         
         <div v-else class="text-center py-5">
            <div class="opacity-50 mb-3">
              <i class="bi bi-search fs-1"></i>
            </div>
            <h5 class="text-muted">No se encontraron productos</h5>
            <p class="text-muted small">Intenta ajustar tus filtros de búsqueda.</p>
         </div>

         <!-- Infinite Scroll Sentinel & Loading More Indicator -->
         <div ref="sentinelRef" class="text-center py-4">
            <div v-if="loadingMore" class="d-flex align-items-center justify-content-center gap-2 text-muted">
               <div class="spinner-border spinner-border-sm text-agro-emerald" role="status"></div>
               <span class="small">Cargando más productos...</span>
            </div>
            <p v-else-if="!hasMore && products.length > 0" class="text-muted small mb-0 opacity-50">
               <i class="bi bi-check-circle me-1"></i> Has visto todos los productos.
            </p>
         </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Ajuste para que el header quede debajo del Navbar (aprox 70-80px) */
.sticky-header {
  position: sticky;
  top: 76px; /* Altura aprox del navbar */
  z-index: 900;
  /* Fondo para que no se transparente al scrollear */
  background-color: var(--bs-light); 
  margin-top: -1.5rem; /* Compensar el padding top del container si es necesario */
  padding-top: 1.5rem !important;
}

.sticky-sidebar {
  position: sticky;
  top: 180px; /* Navbar + Header height + gap */
  height: calc(100vh - 180px);
  overflow-y: auto;
  padding-bottom: 2rem;
}

/* Hide scrollbar for cleaner sidebar */
.sticky-sidebar::-webkit-scrollbar {
  width: 4px;
}
.sticky-sidebar::-webkit-scrollbar-track {
  background: transparent;
}
.sticky-sidebar::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 4px;
}
</style>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { fetchProducts } from '@/services/mercado.api'
import ProductCard from './components/ProductCard.vue'
import ProductFilters from './components/ProductFilters.vue'

const allProducts = ref([]) // Stores all fetched products
const products = ref([]) // Stores currently visible products
const loading = ref(true)
const loadingMore = ref(false)
const activeFilters = ref({})
const sentinelRef = ref(null)

// Infinite Scroll state
const page = ref(1)
const pageSize = 12
const hasMore = ref(true)

const loadProducts = async () => {
   loading.value = true
   try {
     const data = await fetchProducts(activeFilters.value)
     allProducts.value = data
     // Reset pagination
     page.value = 1
     products.value = []
     hasMore.value = true
     
     // Initial chunk
     loadMoreChunk()
   } catch (e) {
     console.error("Error loading products", e)
   } finally {
     loading.value = false
   }
}

const loadMoreChunk = () => {
    if (!hasMore.value || loadingMore.value) return
    loadingMore.value = true
    
    // Small delay to show loading state and avoid overwhelming the DOM
    setTimeout(() => {
        const start = (page.value - 1) * pageSize
        const end = start + pageSize
        const chunk = allProducts.value.slice(start, end)
        
        if (chunk.length > 0) {
            products.value = [...products.value, ...chunk]
            page.value++
        }
        
        if (products.value.length >= allProducts.value.length) {
            hasMore.value = false
        }
        loadingMore.value = false
    }, 300)
}

const handleFilters = (filters) => {
  activeFilters.value = filters
  loadProducts()
}

// Sentinel observer for infinite scroll
let observer = null

const setupObserver = () => {
    if (observer) observer.disconnect()
    
    observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !loading.value && hasMore.value && !loadingMore.value) {
                loadMoreChunk()
            }
        })
    }, {
        root: null,
        rootMargin: '300px',
        threshold: 0
    })
    
    if (sentinelRef.value) {
        observer.observe(sentinelRef.value)
    }
}

// Re-setup observer after products load so sentinel is in the DOM
watch(loading, (newVal) => {
    if (!newVal) {
        nextTick(() => setupObserver())
    }
})

onMounted(async () => {
    await loadProducts()
})

onUnmounted(() => {
    if (observer) observer.disconnect()
})
</script>
