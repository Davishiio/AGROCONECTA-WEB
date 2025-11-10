<template>
  <div class="card border-0 shadow-sm mb-4">
    <div class="card-body">
      <div class="d-flex align-items-center justify-content-between mb-3">
        <h5 class="mb-0">Nueva categoría</h5>
      </div>

      <form @submit.prevent="onSubmit" novalidate>
        <div class="row g-3">
          <div class="col-12 col-md-6">
            <label class="form-label">Nombre</label>
            <input
                v-model.trim="form.nombreCategoria"
                type="text"
                class="form-control"
                required
                placeholder="Ej. Apicultura"
            >
          </div>

          <div class="col-12 col-md-3">
            <label class="form-label">Orden</label>
            <input
                v-model.number="form.orden"
                type="number"
                min="0"
                class="form-control"
                required
            >
          </div>

          <div class="col-12">
            <label class="form-label">Descripción</label>
            <textarea
                v-model.trim="form.descripcionCategoria"
                rows="3"
                class="form-control"
                placeholder="Descripción breve..."
            ></textarea>
          </div>

          <div class="col-12 col-md-6">
            <label class="form-label">Imagen (.png)</label>
            <input
                ref="fileInput"
                @change="onFile"
                type="file"
                accept="image/png"
                class="form-control"
                required
            >
            <div class="form-text">
              Se guardará en <code>icono</code> solo el nombre del archivo (sin .png).
            </div>
            <div v-if="icono" class="small mt-1">
              icono a enviar: <code>{{ icono }}</code>
            </div>
            <div v-if="fileError" class="text-danger small mt-1">{{ fileError }}</div>
          </div>

          <div class="col-12 col-md-6" v-if="preview">
            <label class="form-label d-block">Previsualización</label>
            <img :src="preview" class="img-fluid rounded border" alt="preview">
          </div>
        </div>

        <div class="d-flex gap-2 mt-4">
          <button class="btn btn-brand" type="submit" :disabled="submitting || !isValid">
            {{ submitting ? 'Guardando...' : 'Guardar categoría' }}
          </button>
          <button class="btn btn-outline-secondary" type="button" @click="resetForm" :disabled="submitting">
            Limpiar
          </button>
        </div>

        <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>
        <div v-if="success" class="alert alert-success mt-3">Categoría creada.</div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { createCategoria } from '@/services/convocatorias.api.js'

const emit = defineEmits(['created'])

// Estado del formulario
const form = ref({
  nombreCategoria: '',
  descripcionCategoria: '',
  orden: 0,
})

// Archivo/preview/icono
const fileInput = ref(null)
const preview = ref('')
const icono = ref('') // nombre del archivo sin extensión
const fileError = ref('')

// Estados de envío
const submitting = ref(false)
const error = ref('')
const success = ref(false)

// Utils
const normalizeKey = (s) =>
    s?.toString().trim().toUpperCase()
        .normalize('NFD').replace(/\p{Diacritic}/gu, '')
        .replace(/[^A-Z0-9]/g, '')

const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

// Manejo de archivo
const onFile = async (e) => {
  fileError.value = ''
  preview.value = ''
  icono.value = ''

  const file = e.target.files?.[0]
  if (!file) return

  if (file.type !== 'image/png') {
    fileError.value = 'Solo se permite formato PNG.'
    e.target.value = ''
    return
  }

  const name = file.name || ''
  if (!name.toLowerCase().endsWith('.png')) {
    fileError.value = 'El archivo debe terminar en .png'
    e.target.value = ''
    return
  }

  // icono: nombre sin extensión
  icono.value = name.replace(/\.png$/i, '')

  try {
    const b64 = await toBase64(file)
    const key = 'cat_img_' + normalizeKey(icono.value)
    localStorage.setItem(key, b64)
    preview.value = b64
  } catch {
    fileError.value = 'No se pudo leer la imagen.'
  }
}

const isValid = computed(() =>
    form.value.nombreCategoria?.length > 0 &&
    String(form.value.orden).length > 0 &&
    !fileError.value &&
    icono.value.length > 0
)

const resetForm = () => {
  form.value = { nombreCategoria: '', descripcionCategoria: '', orden: 0 }
  preview.value = ''
  icono.value = ''
  error.value = ''
  success.value = false
  if (fileInput.value) fileInput.value.value = ''
}

const onSubmit = async () => {
  if (!isValid.value) return
  submitting.value = true
  error.value = ''
  success.value = false

  try {
    const payload = {
      nombreCategoria: form.value.nombreCategoria,
      descripcionCategoria: form.value.descripcionCategoria,
      icono: icono.value, // solo el nombre, sin .png
      orden: Number(form.value.orden),
    }

    await createCategoria(payload)
    success.value = true
    emit('created', payload)
    resetForm()
  } catch (e) {
    error.value = e?.response?.data?.message || 'No se pudo crear la categoría'
  } finally {
    submitting.value = false
  }
}
</script>
