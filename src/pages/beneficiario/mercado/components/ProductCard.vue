<template>
  <div class="card h-100 border-0 shadow-sm rounded-4 overflow-hidden product-card">
    <div class="position-relative">
      <img :src="productImage" 
           class="card-img-top object-fit-cover" 
           alt="Producto" 
           loading="lazy"
           style="height: 200px;"
           onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
       <div class="fallback-img position-absolute top-0 start-0 w-100 h-100 bg-light d-flex align-items-center justify-content-center text-muted" style="display: none;">
         <i class="bi bi-basket fs-1"></i>
       </div>
       
       <span class="badge bg-white text-agro-emerald position-absolute top-0 end-0 m-3 shadow-sm rounded-pill px-3 py-2 fw-bold">
         ${{ product.precio }} / {{ product.unidad }}
       </span>
    </div>
    
    <div class="card-body p-3 d-flex flex-column">
      <div class="mb-2">
        <span class="badge bg-light text-secondary border rounded-pill small">{{ product.categoria }}</span>
      </div>
      
      <h5 class="card-title fw-bold text-agro-navy mb-1 text-truncate" :title="product.nombre">
        {{ product.nombre }}
      </h5>
      
      <p class="card-text text-muted small mb-3 flex-grow-1 text-truncate-2">
        {{ product.descripcion }}
      </p>
      
      <div class="d-flex align-items-center gap-2 mb-3 pt-3 border-top">
        <div class="avatar-sm rounded-circle bg-light d-flex align-items-center justify-content-center text-secondary border" style="width: 30px; height: 30px;">
          <i class="bi bi-person-fill"></i>
        </div>
        <div class="lh-1 overflow-hidden">
          <small class="d-block fw-bold text-dark text-truncate">{{ product.productor }}</small>
          <small class="text-muted x-small text-truncate"><i class="bi bi-geo-alt-fill text-danger me-1"></i>{{ product.localidad }}</small>
        </div>
      </div>
      
      <router-link :to="{ name: 'mercado-detail', params: { id: product.id }}" class="btn btn-outline-agro w-100 rounded-3 fw-bold mt-auto stretched-link">
        Ver Detalles
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const STORAGE_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/api\/?$/, '')

const productImage = computed(() => {
  const fotos = props.product.fotos
  let img = null

  if (Array.isArray(fotos) && fotos.length > 0) {
    img = fotos[0]
  } else if (typeof fotos === 'string' && fotos.length > 5) {
    try {
        const parsed = JSON.parse(fotos)
        if (Array.isArray(parsed) && parsed.length > 0) img = parsed[0]
        else img = fotos
    } catch(e) {
        img = fotos
    }
  }
  
  if (!img) return '/img/placeholder-product.jpg'

  // Already a full URL or data URI — use as-is
  if (img.startsWith('http') || img.startsWith('data:')) return img

  // Relative storage path from backend (e.g. "storage/products/abc.jpg")
  // Prepend the backend base URL
  const cleanPath = img.startsWith('/') ? img : `/${img}`
  return `${STORAGE_BASE}${cleanPath}`
})
</script>

<style scoped>
.text-truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.product-card:hover {
  transform: translateY(-5px);
  transition: all 0.3s ease;
  box-shadow: 0 1rem 3rem rgba(0,0,0,.15)!important;
}
</style>
