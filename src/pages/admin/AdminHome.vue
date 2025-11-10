<template>
  <div class="container-fluid">
    <!-- KPIs -->
    <div class="row g-3 mb-3">
      <div class="col-12 col-sm-6 col-xl-3">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body">
            <div class="text-secondary small">Categorías</div>
            <div class="fw-bold fs-3" v-if="!loading">{{ kpis.categorias }}</div>
            <div v-else class="placeholder-glow"><span class="placeholder col-6"></span></div>
          </div>
        </div>
      </div>
      <div class="col-12 col-sm-6 col-xl-3">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body">
            <div class="text-secondary small">Convocatorias</div>
            <div class="fw-bold fs-3" v-if="!loading">{{ kpis.convocatorias }}</div>
            <div v-else class="placeholder-glow"><span class="placeholder col-6"></span></div>
          </div>
        </div>
      </div>
      <div class="col-12 col-sm-6 col-xl-3">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body">
            <div class="text-secondary small">Inscripciones (hoy)</div>
            <div class="fw-bold fs-3">{{ kpis.inscripcionesHoy }}</div>
          </div>
        </div>
      </div>
      <div class="col-12 col-sm-6 col-xl-3">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body">
            <div class="text-secondary small">Administradores</div>
            <div class="fw-bold fs-3">{{ kpis.admins }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Panel: Convocatorias por categoría (desde un solo endpoint) -->
    <div class="card border-0 shadow-sm">
      <div class="card-body">
        <div class="d-flex align-items-center justify-content-between">
          <h5 class="mb-0">Convocatorias por categoría</h5>
          <RouterLink :to="{ name:'admin-convocatorias-categorias' }" class="small text-decoration-underline">
            Ver todas las categorìas
          </RouterLink>
        </div>

        <div v-if="loading" class="d-flex justify-content-center py-5">
          <div class="spinner-border" role="status"></div>
        </div>

        <div v-else-if="sortedCategorias.length === 0" class="text-secondary small mt-3">
          Sin datos disponibles.
        </div>

        <div v-else class="row g-3 mt-2">
          <div
              class="col-12 col-md-6 col-xl-6"
              v-for="cat in topCategorias"
              :key="cat.idCategoria"
          >
            <div class="border rounded p-3 h-100">
              <div class="d-flex align-items-center justify-content-between">
                <div>
                  <div class="small text-secondary">{{ cat.nombreCategoria }}</div>
                </div>
                <div class="fw-bold fs-4">{{ cat.total }}</div>
              </div>

              <!-- Listado compacto de convocatorias (máx. 3) -->
              <ul class="list-group list-group-flush mt-3" v-if="cat.convocatorias?.length">
                <li
                    v-for="cv in cat.convocatorias.slice(0,3)"
                    :key="cv.idConvocatoria"
                    class="list-group-item px-0"
                >
                  <RouterLink
                      :to="{
                      name:'admin-convocatoria-detalle',
                      params: { idCategoria: cat.idCategoria, idConvocatoria: cv.idConvocatoria }
                    }"
                      class="small text-decoration-none"
                  >
                    • {{ cv.nombreConvocatoria }}
                  </RouterLink>
                </li>
              </ul>

              <div class="mt-3 text-end">
                <RouterLink
                    :to="{
                    name:'admin-convocatorias-list',
                    params: { idCategoria: cat.idCategoria },
                    query: { nombre: cat.nombreCategoria }
                  }"
                    class="small text-decoration-underline"
                >
                  Ver detalle
                </RouterLink>
              </div>
            </div>
          </div>
        </div>

        <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { fetchAllConvocatoriasSummary } from '@/services/convocatorias.api'

const loading = ref(true)
const error = ref('')
const categorias = ref([])

const kpis = ref({
  categorias: 0,
  convocatorias: 0,
  inscripcionesHoy: 0, // TODO: ENDPOINT QUE DEVUELVA EL NUMERO DE INSCRIPCIONES HOY
  admins: 0            // TODO: ENDPOINT QUE DEVUELVA EL NUMERO DE ADMINISTRADORES
})

const sortedCategorias = computed(() =>
    [...categorias.value].sort((a, b) => (b.total ?? 0) - (a.total ?? 0))
)
const topCategorias = computed(() => sortedCategorias.value.slice(0, categorias.value.length))

onMounted(async () => {
  try {
    const res = await fetchAllConvocatoriasSummary()
    // res: { categorias:[{ idCategoria, nombreCategoria, convocatorias:[...], total }], totalCategorias, totalConvocatorias }
    categorias.value = Array.isArray(res?.categorias) ? res.categorias : []
    kpis.value.categorias = Number(res?.totalCategorias ?? categorias.value.length)
    kpis.value.convocatorias = Number(res?.totalConvocatorias ?? 0)
  } catch (e) {
    error.value = e?.response?.data?.message || e?.message || 'Error al cargar el dashboard'
  } finally {
    loading.value = false
  }
})
</script>
