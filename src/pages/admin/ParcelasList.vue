<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 class="fw-bold text-agro-navy mb-1">Validación de Parcelas</h4>
        <p class="text-muted small mb-0">Verifica la documentación de propiedad de los predios registrados.</p>
      </div>
      <button class="btn btn-agro-primary btn-sm shadow-sm" @click="cargarDatos">
        <i class="bi bi-arrow-clockwise"></i> Actualizar
      </button>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-agro-emerald" role="status"></div>
    </div>

    <div v-else class="row g-3">
      <div v-for="p in parcelas" :key="p.id" class="col-md-6 col-xl-4">
        <div class="card border-0 shadow-sm h-100 rounded-4 transition-hover">
          <div class="card-body p-4">
            <div class="d-flex justify-content-between mb-3">
              <span class="badge bg-light text-secondary border">ID: {{ p.idGeo }}</span>
              <span class="badge bg-warning text-dark bg-opacity-75">Por Validar</span>
            </div>

            <h5 class="fw-bold text-agro-navy mb-1">{{ p.nombre }}</h5>
            <div class="text-muted small mb-3"><i class="bi bi-person me-1"></i> {{ p.propietario }}</div>

            <div class="bg-light p-3 rounded-3 mb-3 d-flex align-items-center gap-3 border border-dashed">
              <i class="bi bi-file-earmark-pdf fs-3 text-danger"></i>
              <div class="overflow-hidden">
                <div class="fw-bold small text-truncate">Documento_Propiedad.pdf</div>
                <a href="#" class="x-small text-decoration-underline text-agro-emerald">Ver Archivo</a>
              </div>
            </div>

            <div class="d-flex gap-2 pt-2 border-top">
              <button class="btn btn-success flex-grow-1 btn-sm fw-bold" @click="aprobar(p.id)">
                Aprobar
              </button>
              <button class="btn btn-outline-danger flex-grow-1 btn-sm fw-bold" @click="rechazar(p.id)">
                Rechazar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="parcelas.length === 0" class="col-12 text-center py-5 text-muted">
        No hay parcelas pendientes de validación.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { fetchParcelas, aprobarParcela, rechazarParcela } from '@/services/admin.api'
import '@/assets/agro-theme.css'

const loading = ref(true)
const parcelas = ref([])

// Mock Data
const mockData = [
  { id: 1, idGeo: '105', nombre: 'Parcela Santa Maria', propietario: 'Juan Pérez' },
  { id: 2, idGeo: '202', nombre: 'Terreno Norte', propietario: 'Ana García' }
]

const cargarDatos = async () => {
  loading.value = true
  try {
    // parcelas.value = await fetchParcelas()
    await new Promise(r => setTimeout(r, 600))
    parcelas.value = mockData
  } catch (e) { console.error(e) } finally { loading.value = false }
}

const aprobar = async (id) => {
  if(!confirm("¿Validar este predio?")) return
  try {
    // await aprobarParcela(id)
    parcelas.value = parcelas.value.filter(p => p.id !== id)
  } catch(e) { alert("Error") }
}

const rechazar = async (id) => {
  if(!confirm("¿Rechazar este predio?")) return
  try {
    // await rechazarParcela(id, 'Documento ilegible')
    parcelas.value = parcelas.value.filter(p => p.id !== id)
  } catch(e) { alert("Error") }
}

onMounted(cargarDatos)
</script>

<style scoped>
.border-dashed { border-style: dashed !important; }
.transition-hover:hover { transform: translateY(-3px); box-shadow: 0 .5rem 1rem rgba(0,0,0,.1)!important; transition: all 0.3s ease; }
.x-small { font-size: 0.75rem; }
</style>