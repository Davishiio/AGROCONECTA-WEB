<template>
  <div>
    <div class="d-flex align-items-center justify-content-between mb-3">
      <h4 class="mb-0">Convocatorias — Categorías</h4>
      <span class="text-secondary small" v-if="meta.count !== null">
        {{ meta.count }} categorías
      </span>
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
        <div class="col-12 col-md-6 col-lg-4" v-for="cat in categorias" :key="cat.idCategoria">
          <div class="card h-100 shadow-sm border-0">
            <div class="card-body d-flex flex-column">
              <div class="d-flex align-items-start gap-2 mb-2">
                <div class="badge bg-success-subtle text-success border border-success-subtle">
                  #{{ cat.idCategoria }}
                </div>
              </div>
              <h5 class="card-title mb-1">{{ cat.nombreCategoria }}</h5>
              <p class="card-text text-secondary small flex-grow-1">
                {{ cat.descripcionCategoria }}
              </p>
              <div class="d-grid">
                <button class="btn btn-brand"
                        @click="goToCategoria(cat.idCategoria, cat.nombreCategoria)">
                  Ver convocatorias
                </button>
              </div>
            </div>
          </div>
        </div>
      </div><!-- row -->
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { fetchCategorias } from '@/services/convocatorias.api.js'

const router = useRouter()
const loading = ref(true)
const error = ref('')
const categorias = ref([])
const meta = ref({ count: null })

onMounted(async () => {
  try {
    const res = await fetchCategorias()
    // res: { count, data: [...] }
    categorias.value = res.data ?? []
    meta.value.count = res.count ?? categorias.value.length
  } catch (e) {
    error.value = e?.response?.data?.message || 'Error al cargar categorías'
  } finally {
    loading.value = false
  }
})

const goToCategoria = (idCategoria, nombre) => {
  router.push({ name: 'admin-convocatorias-list', params: { idCategoria }, query: { nombre } })
}
</script>
