<template>
  <div>
    <div class="d-flex align-items-center justify-content-between mb-3">
      <div>
        <h4 class="mb-0">{{ data?.nombreConvocatoria || 'Convocatoria' }}</h4>
        <small class="text-secondary">
          Categoría: {{ categoriaNombre || ('ID ' + idCategoria) }}
        </small>
      </div>
      <button class="btn btn-outline-secondary" @click="$router.back()">
        <i class="bi bi-arrow-left-short"></i> Volver
      </button>
    </div>

    <div v-if="loading" class="d-flex justify-content-center py-5">
      <div class="spinner-border" role="status"></div>
    </div>

    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <div v-else>
      <!-- Resumen -->
      <div class="card border-0 shadow-sm mb-3">
        <div class="card-body">
          <p class="text-secondary mb-3" v-if="data?.descripcionConvocatoria">
            {{ data.descripcionConvocatoria }}
          </p>
          <div class="d-flex flex-wrap gap-2">
            <span class="badge bg-success-subtle text-success border">Inicio: {{ formatDate(data?.fechaInicio) }}</span>
            <span class="badge bg-danger-subtle text-danger border">Cierre: {{ formatDate(data?.fechaCierre) }}</span>
            <span class="badge bg-light text-secondary border" v-if="diasRestantes !== null">
              Días restantes: {{ diasRestantes }}
            </span>
          </div>
        </div>
      </div>

      <!-- Tabs simples -->
      <ul class="nav nav-tabs" role="tablist">
        <li class="nav-item"><button class="nav-link" :class="{active: tab==='objetivo'}" @click="tab='objetivo'">Objetivo / Población</button></li>
        <li class="nav-item"><button class="nav-link" :class="{active: tab==='requisitos'}" @click="tab='requisitos'">Requisitos</button></li>
        <li class="nav-item"><button class="nav-link" :class="{active: tab==='criterios'}" @click="tab='criterios'">Criterios</button></li>
        <li class="nav-item"><button class="nav-link" :class="{active: tab==='monto'}" @click="tab='monto'">Monto / Apoyo</button></li>
        <li class="nav-item"><button class="nav-link" :class="{active: tab==='registro'}" @click="tab='registro'">Registro</button></li>
        <li class="nav-item"><button class="nav-link" :class="{active: tab==='resultados'}" @click="tab='resultados'">Resultados</button></li>
      </ul>

      <div class="card border-0 shadow-sm">
        <div class="card-body">
          <section v-show="tab==='objetivo'">
            <h6 class="mb-2">Objetivo general</h6>
            <p class="text-secondary">{{ data?.objetivoGeneral || '—' }}</p>
            <h6 class="mb-2">Población objetivo</h6>
            <p class="text-secondary">{{ data?.poblacionObjetivo || '—' }}</p>
          </section>

          <section v-show="tab==='requisitos'">
            <h6 class="mb-3">Requisitos</h6>
            <ol class="mb-0">
              <li v-for="(val, idx) in requisitosList" :key="idx">{{ val }}</li>
            </ol>
          </section>

          <section v-show="tab==='criterios'">
            <div class="row g-3">
              <div class="col-md-6">
                <h6 class="mb-2">Criterios generales</h6>
                <ul class="mb-0">
                  <li v-for="(c,i) in (data?.criteriosElegibilidad?.generales || [])" :key="i">{{ c }}</li>
                </ul>
              </div>
              <div class="col-md-6">
                <h6 class="mb-2">Criterios específicos</h6>
                <ul class="mb-0">
                  <li v-for="(c,i) in (data?.criteriosElegibilidad?.especificos || [])" :key="i">{{ c }}</li>
                </ul>
              </div>
            </div>
          </section>

          <section v-show="tab==='monto'">
            <h6 class="mb-2">Descripción del apoyo</h6>
            <p class="text-secondary">{{ data?.descripcionMontoApoyo || '—' }}</p>
          </section>

          <section v-show="tab==='registro'">
            <h6 class="mb-2">Horario</h6>
            <p class="text-secondary">{{ data?.procesoRegistro?.horario || '—' }}</p>

            <h6 class="mb-2">Documentos</h6>
            <p class="text-secondary">{{ data?.procesoRegistro?.documentos || '—' }}</p>

            <h6 class="mb-2">Módulos</h6>
            <ul class="mb-0">
              <li v-for="(val, key) in (data?.procesoRegistro?.modulos || {})" :key="key">
                <strong class="text-capitalize">{{ key.replace('_',' ') }}:</strong> {{ val }}
              </li>
            </ul>

            <div class="mt-3" v-if="data?.procesoRegistro?.publicacion_web">
              <a class="btn btn-outline-primary btn-sm" :href="data.procesoRegistro.publicacion_web" target="_blank" rel="noopener">
                Abrir sitio de registro
              </a>
            </div>
          </section>

          <section v-show="tab==='resultados'">
            <h6 class="mb-2">Publicación de resultados</h6>
            <p class="text-secondary">{{ data?.publicacionResultados || '—' }}</p>
            <div class="d-flex flex-wrap gap-2">
              <span class="badge bg-light text-secondary border" v-if="data?.diasPublicacionResultados != null">
                Días hábiles después del cierre: {{ data.diasPublicacionResultados }}
              </span>
              <a v-if="data?.urlPublicacionResultados" :href="data.urlPublicacionResultados" target="_blank" rel="noopener" class="btn btn-outline-primary btn-sm">
                Ver publicación
              </a>
            </div>
            <div class="mt-3" v-if="data?.informes">
              <h6 class="mb-2">Informes</h6>
              <p class="text-secondary mb-0">{{ data.informes }}</p>
            </div>
          </section>
        </div>
      </div>

      <div class="d-flex justify-content-between mt-3">
        <a v-if="data?.urlConvocatoria" :href="data.urlConvocatoria" target="_blank" rel="noopener" class="btn btn-outline-success">
          Ver convocatoria oficial
        </a>
        <div></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { fetchConvocatoriaDetalle } from '@/services/convocatorias.api'

const route = useRoute()
const idCategoria = computed(() => Number(route.params.idCategoria))
const idConvocatoria = computed(() => Number(route.params.idConvocatoria))
const categoriaNombre = computed(() => route.query?.nombre || '')

const loading = ref(true)
const error = ref('')
const data = ref(null)
const tab = ref('objetivo')

async function loadDetalle() {
  loading.value = true
  error.value = ''
  data.value = null
  try {
    // LOGS para depuración
    console.log('[DETALLE] GET', `/convocatorias/${idCategoria.value}/convocatoria/${idConvocatoria.value}`)
    const res = await fetchConvocatoriaDetalle(idCategoria.value, idConvocatoria.value)
    console.log('[DETALLE] RES', res)
    data.value = res
  } catch (e) {
    console.error('[DETALLE] ERROR', e)
    error.value = e?.response?.data?.message || e?.message || 'Error al cargar la convocatoria'
  } finally {
    loading.value = false
  }
}

onMounted(loadDetalle)

watch(() => [route.params.idCategoria, route.params.idConvocatoria], loadDetalle)

const requisitosList = computed(() => {
  if (!data.value?.requisitos) return []
  const entries = Object.entries(data.value.requisitos).sort((a,b) => Number(a[0]) - Number(b[0]))
  return entries.map(([,v]) => v)
})

const formatDate = (iso) => {
  if (!iso) return '—'
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('es-MX', { year:'numeric', month:'long', day:'2-digit' })
}

const diasRestantes = computed(() => {
  if (!data.value?.fechaCierre) return null
  const hoy = new Date()
  const cierre = new Date(data.value.fechaCierre + 'T23:59:59')
  const diff = Math.ceil((cierre - hoy) / (1000*60*60*24))
  return diff < 0 ? 0 : diff
})
</script>
