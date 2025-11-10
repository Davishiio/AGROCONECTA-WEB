<template>
  <div>
    <CategoriaCreateModal v-if="showCreateCard" @created="reload"/>
    <div class="d-flex align-items-center justify-content-between mb-3">
      <h4 class="mb-0">Convocatorias — Categorías</h4>
      <div class="d-flex align-items-center gap-3">
        <button class="btn btn-primary" @click="showCreateCard = !showCreateCard">
          <i class="bi bi-plus"></i>
          Añadir categoría
        </button>
        <span class="text-secondary small" v-if="meta.count !== null">
          {{ meta.count }} categorías
        </span>
      </div>
    </div>

    <div v-if="loading" class="d-flex justify-content-center py-5">
      <div class="spinner-border" role="status"></div>
    </div>

    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <div v-else>
      <div v-if="categorias.length === 0" class="alert alert-info">
        No hay categorías disponibles.
      </div>

      <div class="row g-3">
        <div
            class="col-12 col-md-6 col-lg-4"
            v-for="cat in categorias"
            :key="cat.idCategoria"
        >
          <div class="card h-100 shadow-sm border-0 category-card"
               @click="goToCategoria(cat.idCategoria, cat.nombreCategoria)" style="cursor: pointer;">
            <!-- Media con fade -->
            <div class="card-media position-relative">
              <img
                  class="cat-img"
                  :src="getCatImg(cat.nombreCategoria)"
                  :alt="cat.nombreCategoria"
                  loading="lazy"
              />
              <div class="media-gradient"></div>
            </div>

            <!-- Contenido que aparece con el desvanecido -->
            <div class="card-body d-flex flex-column">
              <p class="card-text text-secondary small flex-grow-1 mb-3">
                {{ cat.descripcionCategoria || '—' }}
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import {onMounted, ref} from 'vue'
import {useRouter} from 'vue-router'
import {fetchCategorias} from '@/services/convocatorias.api.js'
import CategoriaCreateModal from './CategoriaCreateModal.vue'

const router = useRouter()
const loading = ref(true)
const error = ref('')
const categorias = ref([])
const meta = ref({count: null})
const showCreateCard = ref(false)

// Mapea nombre de categoría -> ruta del PNG en /public/img/categorias
const categoryImages = {
  AGRICULTURA: '/img/categorias/AGRICULTURA.png',
  DESARROLLORURAL: '/img/categorias/DESARROLLO_RURAL.png',
  GANADERIA: '/img/categorias/GANADERIA.png',
  PESCAYACUACULTURA: '/img/categorias/ACUACULTURA.png',
  COORDINACIONEINFRAESTRUCTURA: '/img/categorias/COORDINACIONEINFRAESTRUCTURA.png',
  FINANCIAMIENTO: '/img/categorias/FINANCIAMIENTO.png',
}
// Sirve archivos de /public respetando el base de Vite
const withBase = (p) => (import.meta.env.BASE_URL || '/') + p.replace(/^\/+/, '')

const normalizeKey = (s) => s
    ?.toString().trim().toUpperCase()
    .normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .replace(/[^A-Z0-9]/g, '') // quita espacios y símbolos

const getCatImg = (nombre) => {
  const key = normalizeKey(nombre)
  // 1) Primero intenta desde localStorage (cuando la imagen aún no está en /public)
  const local = localStorage.getItem('cat_img_' + key)
  if (local) return local

  // 2) Si no hay en localStorage, usa el archivo de /public
  const rel = categoryImages[key] || 'img/categorias/AGRICULTURA.png'
  return withBase(rel)
}

onMounted(async () => {
  try {
    const res = await fetchCategorias()
    categorias.value = res.data ?? []
    meta.value.count = res.count ?? categorias.value.length
  } catch (e) {
    error.value = e?.response?.data?.message || 'Error al cargar categorías'
  } finally {
    loading.value = false
  }
})

const goToCategoria = (idCategoria, nombre) => {
  router.push({name: 'admin-convocatorias-list', params: {idCategoria}, query: {nombre}})
}

const goToAddCategoria = () => {
  router.push({name: 'admin-addcategoria'})
}
const reload = async () => {
  loading.value = true
  try {
    const res = await fetchCategorias()
    categorias.value = res.data ?? []
    meta.value.count = res.count ?? categorias.value.length
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.category-card .card-media {
  position: relative;
  overflow: hidden;
}

.category-card .cat-img {
  width: 100%;
  height: 310px; /* ajusta si quieres */
  object-fit: cover;
  display: block;
  transition: transform .35s ease, filter .35s ease, opacity .35s ease;
}

.category-card .media-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, .78) 95%);
  opacity: .85;
  transition: opacity .35s ease;
}

.category-card .media-title {
  pointer-events: none;
}

.category-card .card-body {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
  transition: max-height .35s ease, opacity .35s ease;
}

/* Efecto: al pasar el mouse, "se desvanece hacia abajo" y aparece contenido */
.category-card:hover .cat-img {
  transform: scale(1.03);
  filter: brightness(.9);
}

.category-card:hover .media-gradient {
  opacity: .35;
}

.category-card:hover .card-body {
  max-height: 260px;
  opacity: 1;
}

/* En dispositivos táctiles (sin hover) mostramos siempre el contenido */
@media (hover: none) {
  .category-card .card-body {
    max-height: 400px;
    opacity: 1;
  }

  .category-card .media-gradient {
    opacity: .5;
  }
}
</style>