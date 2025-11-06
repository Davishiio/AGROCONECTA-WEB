<script setup>
import { onMounted, ref, computed } from 'vue'
import { fetchConvocatoriasActivasByCategoria } from '@/services/convocatorias.api'
import { useRoute, useRouter } from 'vue-router'
const route = useRoute()
const router = useRouter()
const idCategoria = computed(() => Number(route.params.idCategoria))
const categoriaNombre = computed(() => route.query?.nombre || '')

const loading = ref(true)
const error = ref('')
const convocatorias = ref([])
const total = ref(0)

onMounted(async () => {
  try {
    const res = await fetchConvocatoriasActivasByCategoria(idCategoria.value)
    convocatorias.value = res.items
    total.value = res.total
    // Debug opcional
    // console.log('URL llamada:', `/convocatorias/${idCategoria.value}/convocatorias-activas`)
    // console.log('Res:', res)
  } catch (e) {
    error.value = e?.response?.data?.message || 'Error al cargar convocatorias'
  } finally {
    loading.value = false
  }
})

const verDetalle = (item) => {
  router.push({
    name: 'admin-convocatoria-detalle',
    params: {
      idCategoria: Number(route.params.idCategoria),
      idConvocatoria: item.idConvocatoria
    },
    query: { nombre: categoriaNombre.value }
  })
}
</script>

<template>
  <div>
    <div class="d-flex align-items-center justify-content-between mb-3">
      <div>
        <h4 class="mb-0">Convocatorias activas</h4>
        <small class="text-secondary">
          Categoría: {{ categoriaNombre || ('ID ' + idCategoria) }} — Total: {{ total }}
        </small>
      </div>
      <button class="btn btn-outline-secondary" @click="$router.back()">
        <i class="bi bi-arrow-left-short"></i> Volver
      </button>
    </div>

    <div v-if="loading" class="d-flex justify-content-center py-5">
      <div class="spinner-border" role="status"></div>
    </div>

    <div v-else-if="error" class="alert alert-danger">{{ error }}</div>

    <div v-else>
      <div v-if="convocatorias.length === 0" class="alert alert-info">
        No hay convocatorias activas para esta categoría.
      </div>

      <div class="row g-3" v-else>
        <div class="col-12" v-for="item in convocatorias" :key="item.idConvocatoria">
          <div class="card border-0 shadow-sm">
            <div class="card-body d-flex justify-content-between align-items-start gap-3">
              <div class="flex-grow-1">
                <h5 class="mb-1">
                  {{ item.nombreConvocatoria || item.titulo || ('Convocatoria #' + item.idConvocatoria) }}
                </h5>
              </div>
              <div>
                <button class="btn btn-outline-primary btn-sm" @click="verDetalle(item)">Ver detalle</button>
              </div>
            </div>
          </div>
        </div>
      </div><!-- row -->
    </div>
  </div>
</template>
