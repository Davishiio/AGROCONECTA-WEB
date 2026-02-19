<template>
  <form @submit.prevent="handleSubmit" class="row g-3">
     <div class="col-md-6">
       <label class="form-label fw-bold">Nombre del Producto</label>
       <input type="text" class="form-control" v-model="form.nombre" required placeholder="Ej. Miel de Abeja 100%">
     </div>
     
     <div class="col-md-6">
       <label class="form-label fw-bold">Categoría</label>
       <select class="form-select" v-model="form.categoria" required>
         <option value="" disabled>Selecciona...</option>
         <option v-for="cat in categorias" :key="cat.id || cat.nombre" :value="cat.nombre">{{ cat.nombre }}</option>
       </select>
     </div>
     
     <div class="col-md-4">
       <label class="form-label fw-bold">Precio Unitario</label>
       <div class="input-group">
         <span class="input-group-text">$</span>
         <input type="number" step="0.50" class="form-control" v-model="form.precio" required>
       </div>
     </div>
     
     <div class="col-md-4">
       <label class="form-label fw-bold">Unidad de Medida</label>
       <select class="form-select" v-model="form.unidad" required>
         <option value="kg">Kilogramo (kg)</option>
         <option value="litro">Litro (l)</option>
         <option value="pieza">Pieza/Unidad</option>
         <option value="manojo">Manojo</option> 
         <option value="caja">Caja</option>
         <option value="costal">Costal</option>
       </select>
     </div>
     
     <div class="col-md-4">
       <label class="form-label fw-bold">Stock Disponible</label>
       <input type="number" class="form-control" v-model="form.stock" required>
     </div>
     
     <div class="col-12">
       <label class="form-label fw-bold">Descripción</label>
       <textarea class="form-control" rows="3" v-model="form.descripcion" placeholder="Describe tu producto, origen, calidad, etc."></textarea>
     </div>
     
     <div class="col-12">
       <div class="form-check form-switch ps-5">
         <input class="form-check-input scale-125" type="checkbox" role="switch" id="trueque" v-model="form.acepta_trueque">
         <label class="form-check-label fw-bold ms-2" for="trueque">
            <i class="bi bi-arrow-repeat text-success me-1"></i> Acepto trueque por este producto
         </label>
       </div>
     </div>
     
     <!-- Fotos Field -->
     <div class="col-12">
       <label class="form-label fw-bold">Fotos del Producto</label>
       <input type="file" class="form-control" @change="handleFileSelect" multiple accept="image/*">
       <small class="text-muted">Máximo 5MB por imagen.</small>
       
       <div class="d-flex gap-2 mt-3 flex-wrap">
         <!-- Previews of new files -->
         <div v-for="(file, idx) in newFiles" :key="'new-'+idx" class="position-relative">
            <img :src="getFilePreview(file)" class="rounded border" width="80" height="80" style="object-fit: cover;">
            <button type="button" class="btn btn-sm btn-danger badge position-absolute top-0 start-100 translate-middle rounded-circle" @click="removeNewFile(idx)">x</button>
         </div>
         
         <!-- Existing files (URLs) -->
         <div v-for="(foto, idx) in form.fotos" :key="'ex-'+idx" class="position-relative">
            <img :src="foto" class="rounded border" width="80" height="80" style="object-fit: cover;">
            <button type="button" class="btn btn-sm btn-danger badge position-absolute top-0 start-100 translate-middle rounded-circle" @click="removeExistingPhoto(idx)">x</button>
         </div>
       </div>
     </div>
     
     <div class="col-12 mt-4 text-end">
       <button type="button" class="btn btn-light me-2 fw-bold" @click="$emit('cancel')">Cancelar</button>
       <button type="submit" class="btn btn-agro-primary px-4 fw-bold" :disabled="loading">
         <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
         {{ isEdit ? 'Actualizar Producto' : 'Publicar Producto' }}
       </button>
     </div>
  </form>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { fetchCategories } from '@/services/mercado.api'

const props = defineProps({
  initialData: { type: Object, default: () => ({}) },
  isEdit: { type: Boolean, default: false }
})

const emit = defineEmits(['submit', 'cancel'])

const form = ref({
  nombre: '',
  categoria: '',
  precio: '',
  unidad: 'kg',
  stock: 1,
  descripcion: '',
  fotos: [], // Array of URLs (existing)
  acepta_trueque: false,
  ...props.initialData
})

const newFiles = ref([]) // Array of File objects
const categorias = ref([])
const loading = ref(false)

const loadCats = async () => {
    try {
        const response = await fetchCategories() 
        let data = []
        
        if (Array.isArray(response)) {
            data = response
        } else if (response && Array.isArray(response.data)) {
            data = response.data
        }
        
        if (data && data.length > 0) {
           categorias.value = data
        } else {
           console.warn("API returned no categories, using fallback.")
           throw new Error("No categories found in API response")
        }
    } catch(e) { 
        console.warn("Using fallback categories due to:", e.message)
        categorias.value = [
            {nombre: 'Huevo y aves'}, {nombre: 'Miel y derivados'}, {nombre: 'Frutas y verduras'},
            {nombre: 'Maíz y granos'}, {nombre: 'Lácteos y quesos'}, {nombre: 'Artesanías rurales'},
            {nombre: 'Pesca'}
        ]
    }
}

const handleFileSelect = (event) => {
  const files = Array.from(event.target.files)
  files.forEach(file => {
    if (file.size > 5 * 1024 * 1024) {
      alert(`El archivo ${file.name} excede 5MB`)
      return
    }
    newFiles.value.push(file)
  })
  // Reset input
  event.target.value = ''
}

const getFilePreview = (file) => URL.createObjectURL(file)

const removeNewFile = (idx) => {
  newFiles.value.splice(idx, 1)
}

const removeExistingPhoto = (idx) => {
  form.value.fotos.splice(idx, 1)
}

const handleSubmit = () => {
  loading.value = true
  
  const formData = new FormData()
  formData.append('nombre', form.value.nombre)
  formData.append('categoria', form.value.categoria)
  formData.append('precio', form.value.precio)
  formData.append('unidad', form.value.unidad)
  formData.append('stock', form.value.stock)
  formData.append('descripcion', form.value.descripcion || '')
  formData.append('acepta_trueque', form.value.acepta_trueque ? 1 : 0)
  
  // Append ID if editing
  if (props.isEdit && form.value.id) {
    formData.append('id', form.value.id)
     // Keep existing photos if the backend logic allows (or maybe we don't send them in formData for create/update logic if it only adds new ones? 
     // Usually updates replace or add. If backend creates "productos/{userId}/...", maybe we just send new files. 
     // The prompt says "PUT /api/products/{id} ... accept file uploads in fotos[]".
     // It doesn't say how to delete existing ones via form data. 
     // I'll assume for now we only send new files via fotos[].
  }

  // Append new files
  newFiles.value.forEach(file => {
    formData.append('fotos[]', file)
  })
  
  // Backend spec "PUT /api/products/{id} ... fotos[]: [Select a file]"
  // It doesn't clarify if existing photos are kept. Usually standard HTML forms replace. 
  // But since we can't send "URLs" in file input, we rely on backend logic.
  // I will emit formData.
  
  if (props.isEdit) {
      // Laravel PUT with FormData often requires _method: PUT inside POST
      formData.append('_method', 'PUT')
  }

  emit('submit', formData)
}

onMounted(loadCats)
</script>

<style scoped>
.scale-125 { transform: scale(1.25); }
.form-check-input:checked { background-color: var(--agro-emerald); border-color: var(--agro-emerald); }
</style>
