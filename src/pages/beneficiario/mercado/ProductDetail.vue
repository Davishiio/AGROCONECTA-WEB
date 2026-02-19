np<template>
  <div class="container py-4" v-if="product">
    <button class="btn btn-link text-decoration-none text-muted mb-3 ps-0" @click="$router.back()">
      <i class="bi bi-arrow-left me-1"></i> Regresar
    </button>

    <div class="row g-4">
      <!-- Imágenes y Principal -->
      <div class="col-lg-8">
        <div class="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
          <img :src="product.fotos?.[0] || '/img/placeholder-product.jpg'" 
               class="w-100 object-fit-cover" 
               style="height: 400px; max-height: 50vh;"
               alt="Detalle Producto">
        </div>
        
        <div class="card border-0 shadow-sm rounded-4 p-4">
           <div class="d-flex justify-content-between align-items-start mb-3">
             <span class="badge bg-success bg-opacity-10 text-success fs-6 px-3 py-2 rounded-pill">{{ product.categoria }}</span>
             <h2 class="text-agro-emerald fw-bold mb-0">${{ product.precio }} <small class="text-muted fs-6 fw-normal">/ {{ product.unidad }}</small></h2>
           </div>
           
           <h1 class="fw-bold text-agro-navy mb-3">{{ product.nombre }}</h1>
           
           <h5 class="fw-bold text-agro-navy mt-4 mb-2">Descripción</h5>
           <p class="text-muted lead fs-6">{{ product.descripcion }}</p>
           
           <div class="d-flex gap-3 mt-4 pt-4 border-top">
              <div class="d-flex align-items-center gap-2 text-muted">
                 <i class="bi bi-box-seam fs-5"></i>
                 <span>Stock: <strong>{{ product.stock }} {{ product.unidad }}(s)</strong></span>
              </div>
              <div class="d-flex align-items-center gap-2 text-muted" v-if="product.acepta_trueque">
                 <i class="bi bi-arrow-repeat fs-5 text-success"></i>
                 <span class="text-success fw-bold">Acepta Trueque</span>
              </div>
           </div>
        </div>
      </div>
      
      <!-- Sidebar Vendedor -->
      <div class="col-lg-4">
        <div class="card border-0 shadow-sm rounded-4 p-4 sticky-top" style="top: 100px;">
           <h5 class="fw-bold text-agro-navy mb-4">Información del Vendedor</h5>
           
           <div class="d-flex align-items-center gap-3 mb-4">
              <img :src="vendor.foto_url || '/img/default-avatar.png'" class="rounded-circle border shadow-sm" width="60" height="60" alt="Vendedor">
              <div>
                 <h6 class="fw-bold mb-0 text-dark">{{ vendor.nombre }}</h6>
                 <small class="text-muted"><i class="bi bi-geo-alt-fill text-danger me-1"></i>{{ vendor.localidad }}</small>
              </div>
           </div>
           
           <p class="small text-muted fst-italic mb-4">"{{ vendor.descripcion || 'Productor local confiable.' }}"</p>
           
           <div class="d-grid gap-2">
             <a :href="'https://wa.me/' + cleanPhone(vendor.telefono)" target="_blank" class="btn btn-success fw-bold py-2 rounded-3">
                <i class="bi bi-whatsapp me-2"></i> Contactar por WhatsApp
             </a>
             <button class="btn btn-outline-secondary fw-bold py-2 rounded-3" disabled>
                <i class="bi bi-envelope me-2"></i> Enviar Mensaje
             </button>
           </div>
           
           <div class="mt-4 pt-3 border-top text-center">
             <small class="text-muted d-block mb-1">Unidad Productiva Verificada</small>
             <i class="bi bi-shield-check text-success fs-4"></i>
           </div>
        </div>
      </div>
    </div>
  </div>
  
  <div v-else-if="loading" class="container py-5 text-center">
    <div class="spinner-border text-agro-emerald" role="status"></div>
  </div>
  
  <div v-else class="container py-5 text-center">
     <h3>Producto no encontrado</h3>
     <button class="btn btn-primary" @click="$router.push({name: 'mercado-list'})">Volver al Mercado</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { fetchProductDetail } from '@/services/mercado.api'

const route = useRoute()
const product = ref(null)
const vendor = ref({})
const loading = ref(true)

const cleanPhone = (phone) => {
  return phone ? phone.replace(/[^0-9]/g, '') : ''
}

const loadDetail = async () => {
   try {
     const data = await fetchProductDetail(route.params.id)
     product.value = data.producto || data
     vendor.value = data.vendedor || {}
   } catch (e) {
     console.error("Error loading product detail", e)
   } finally {
     loading.value = false
   }
}

onMounted(loadDetail)
</script>
