<template>
  <div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
       <div>
         <h2 class="fw-bold text-agro-navy mb-0">Mis Productos</h2>
         <p class="text-muted mb-0">Administra lo que ofreces a la comunidad.</p>
       </div>
       <div class="d-flex gap-2">
         <router-link :to="{ name: 'mercado-vendor-profile' }" class="btn btn-outline-secondary fw-bold rounded-pill">
           <i class="bi bi-person-badge me-2"></i> Mi Perfil Vendedor
         </router-link>
         <button class="btn btn-agro-primary fw-bold rounded-pill" @click="openCreateModal">
           <i class="bi bi-plus-lg me-2"></i> Publicar Nuevo
         </button>
       </div>
    </div>
    
    <!-- Alerta Perfil Incompleto (Mock) -->
    <!-- Podríamos checar si tiene perfil de vendedor y si no, mostrar alerta -->
    
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-agro-emerald" role="status"></div>
    </div>
    
    <div v-else-if="products.length > 0" class="table-responsive rounded-4 shadow-sm bg-white">
      <table class="table table-hover align-middle mb-0">
        <thead class="bg-light text-secondary">
           <tr>
             <th class="ps-4 py-3">Producto</th>
             <th>Categoría</th>
             <th>Precio</th>
             <th>Stock</th>
             <th class="text-end pe-4">Acciones</th>
           </tr>
        </thead>
        <tbody>
           <tr v-for="p in products" :key="p.id">
             <td class="ps-4">
               <div class="d-flex align-items-center gap-3">
                  <img :src="p.fotos?.[0] || '/img/placeholder.png'" class="rounded border" width="48" height="48" style="object-fit:cover;">
                  <div>
                    <span class="fw-bold text-dark d-block">{{ p.nombre }}</span>
                    <small class="text-muted d-block text-truncate" style="max-width: 200px;">{{ p.descripcion }}</small>
                  </div>
               </div>
             </td>
             <td><span class="badge bg-light text-dark border">{{ p.categoria }}</span></td>
             <td class="fw-bold text-success">${{ p.precio }}</td>
             <td>
               <span :class="p.stock > 5 ? 'text-dark' : 'text-danger fw-bold'">
                 {{ p.stock }} {{ p.unidad }}
               </span>
             </td>
             <td class="text-end pe-4">
               <button class="btn btn-sm btn-outline-primary me-2" @click="editProduct(p)">
                 <i class="bi bi-pencil-fill"></i>
               </button>
               <button class="btn btn-sm btn-outline-danger" @click="confirmDelete(p)">
                 <i class="bi bi-trash-fill"></i>
               </button>
             </td>
           </tr>
        </tbody>
      </table>
    </div>
    
    <div v-else class="text-center py-5 bg-light rounded-4 border-dashed">
       <i class="bi bi-shop-window fs-1 text-muted opacity-50"></i>
       <h5 class="mt-3 text-muted">Aún no has publicado productos.</h5>
       <button class="btn btn-link fw-bold" @click="openCreateModal">¡Publica tu primer producto hoy!</button>
    </div>
    
    <!-- Modal Form (Simple implementation) -->
    <div v-if="showModal" class="modal fade show d-block" style="background: rgba(0,0,0,0.5)">
       <div class="modal-dialog modal-lg modal-dialog-centered">
         <div class="modal-content border-0 shadow-lg rounded-4">
           <div class="modal-header border-0">
              <h5 class="modal-title fw-bold">{{ isEditing ? 'Editar Producto' : 'Nuevo Producto' }}</h5>
              <button class="btn-close" @click="closeModal"></button>
           </div>
           <div class="modal-body">
              <ProductForm 
                  :initial-data="currentProduct" 
                  :is-edit="isEditing" 
                  @submit="handleSave"
                  @cancel="closeModal"
              />
           </div>
         </div>
       </div>
    </div>
    
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { fetchMyProducts, createProduct, updateProduct, deleteProduct } from '@/services/mercado.api'
import ProductForm from './components/ProductForm.vue'

const products = ref([])
const loading = ref(true)
const showModal = ref(false)
const isEditing = ref(false)
const currentProduct = ref({})

const loadMyProducts = async () => {
  loading.value = true
  try {
    const data = await fetchMyProducts() 
    products.value = data
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  isEditing.value = false
  currentProduct.value = {}
  showModal.value = true
}

const editProduct = (p) => {
  isEditing.value = true
  currentProduct.value = { ...p }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const handleSave = async (formData) => {
  try {
     if (isEditing.value) {
        // Extract ID from FormData
        const id = formData.get('id');
        // NOTE: If backend supports PUT with multipart, this is fine. 
        // If not, we might need POST with _method: PUT.
        // User docs say: PUT /api/products/{id} accepts files.
        await updateProduct(id, formData)
     } else {
        await createProduct(formData)
     }
     closeModal()
     loadMyProducts()
  } catch(e) {
     alert("Error al guardar: " + e.message)
  }
}

const confirmDelete = async (p) => {
  if (confirm(`¿Estás seguro de eliminar ${p.nombre}?`)) {
    try {
      await deleteProduct(p.id)
      loadMyProducts()
    } catch(e) {
      alert("Error al eliminar")
    }
  }
}

onMounted(loadMyProducts)
</script>
