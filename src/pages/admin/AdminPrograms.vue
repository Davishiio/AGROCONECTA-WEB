<template>
  <div class="container-fluid">
    <!-- Header -->
    <div class="d-flex align-items-center justify-content-between mb-4">
      <div>
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-1 small">
            <li class="breadcrumb-item">
              <a href="#" @click.prevent="$router.push({name: 'admin-convocatorias-categorias'})" class="text-decoration-none text-muted">Atrás</a>
            </li>
            <li class="breadcrumb-item active text-primary fw-bold" aria-current="page">{{ categoriaNombre || 'Programas' }}</li>
          </ol>
        </nav>
        <h4 class="mb-0 fw-bold text-dark">Programas Disponibles</h4>
        <small class="text-secondary">
          Gestiona los programas de esta categoría
        </small>
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-outline-secondary btn-sm px-3" @click="$router.back()">
          <i class="bi bi-arrow-left me-1"></i> Volver
        </button>
        <button class="btn btn-primary btn-sm px-3 fw-bold shadow-sm" @click="openModal()">
          <i class="bi bi-plus-lg me-1"></i> Nuevo Programa
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="d-flex justify-content-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="alert alert-danger shadow-sm border-0">
      <i class="bi bi-exclamation-triangle-fill me-2"></i> {{ error }}
    </div>

    <!-- Empty State -->
    <div v-else-if="programas.length === 0" class="text-center py-5 bg-white rounded-3 shadow-sm">
      <div class="mb-3 text-secondary opacity-25">
        <i class="bi bi-inbox" style="font-size: 3rem;"></i>
      </div>
      <h5 class="text-secondary fw-bold">No hay programas disponibles</h5>
      <p class="text-muted small">Crea el primer programa para esta categoría.</p>
      <button class="btn btn-primary btn-sm mt-2" @click="openModal()">
        Crear Programa
      </button>
    </div>

    <!-- List -->
    <div v-else class="row g-4">
      <div class="col-12 col-md-6 col-lg-4" v-for="prog in programas" :key="prog.idPrograma">
        <div 
          class="card h-100 border-0 shadow-sm hover-card"
        >
          <div class="card-body p-4 cursor-pointer" @click="goToModalidades(prog)">
            <div class="d-flex align-items-center mb-3">
              <div class="icon-box bg-primary-subtle text-primary rounded-circle p-3 me-3">
                <i class="bi bi-layers-fill fs-4"></i>
              </div>
              <div class="flex-grow-1">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <small class="text-muted d-block uppercase-text" style="font-size: 0.7rem;">PROGRAMA</small>
                        <h5 class="fw-bold text-dark mb-0">{{ prog.nombrePrograma }}</h5>
                    </div>
                </div>
              </div>
            </div>
            
            <p class="text-secondary small mb-0 line-clamp-3" v-if="prog.descripcion">
              {{ prog.descripcion }}
            </p>
            <p class="text-muted fst-italic small mb-0" v-else>Sin descripción disponible.</p>
            
            <div class="mt-3 d-flex gap-2 flex-wrap" v-if="prog.tipoApoyo || prog.presupuesto">
                <span class="badge bg-light text-secondary border" v-if="prog.tipoApoyo">
                    {{ prog.tipoApoyo }}
                </span>
                 <span class="badge bg-light text-secondary border" v-if="prog.presupuesto">
                    ${{ Number(prog.presupuesto).toLocaleString() }}
                </span>
            </div>
          </div>
          <div class="card-footer bg-white border-0 pt-0 pb-3 px-4 d-flex justify-content-between align-items-center">
            <button class="btn btn-sm btn-outline-secondary p-1 px-2" @click.stop="openModal(prog)" title="Editar Programa">
                <i class="bi bi-pencil"></i> Editar
            </button>
            <span class="text-primary fw-medium small cursor-pointer" @click="goToModalidades(prog)">
                Ver modalidades <i class="bi bi-arrow-right ms-1"></i>
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Create/Edit -->
    <div v-if="showModal" class="modal-backdrop fade show" style="z-index: 1050;"></div>
    <div v-if="showModal" class="modal fade show d-block" tabindex="-1" role="dialog" style="z-index: 1055;" @click.self="closeModal">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4">
          <div class="modal-header border-bottom-0 pt-4 px-4">
            <h5 class="modal-title fw-bold text-agro-navy">
              {{ isEditing ? 'Editar Programa' : 'Nuevo Programa' }}
            </h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body p-4">
             <form @submit.prevent="submitForm">
                <div class="mb-3">
                    <label class="form-label small fw-bold text-secondary">Nombre del Programa <span class="text-danger">*</span></label>
                    <input type="text" class="form-control" v-model="form.nombrePrograma" required maxlength="120" placeholder="Ej. Apoyo a la Innovación">
                </div>
                <div class="mb-3">
                    <label class="form-label small fw-bold text-secondary">Descripción</label>
                    <textarea class="form-control" v-model="form.descripcion" rows="3" placeholder="Breve descripción del objetivo..."></textarea>
                </div>
                <div class="row g-3 mb-3">
                    <div class="col-md-6">
                        <label class="form-label small fw-bold text-secondary">Tipo de Apoyo</label>
                        <input type="text" class="form-control" v-model="form.tipoApoyo" placeholder="Ej. Económico" maxlength="80">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label small fw-bold text-secondary">Vigencia</label>
                        <input type="date" class="form-control" v-model="form.vigencia">
                    </div>
                </div>
                <div class="mb-3">
                    <label class="form-label small fw-bold text-secondary">Presupuesto</label>
                    <div class="input-group">
                        <span class="input-group-text">$</span>
                        <input type="number" step="0.01" class="form-control" v-model="form.presupuesto" placeholder="0.00">
                    </div>
                </div>

                <div v-if="formError" class="alert alert-danger small py-2">
                    {{ formError }}
                </div>

                <div class="d-flex justify-content-end gap-2 mt-4">
                    <button type="button" class="btn btn-light" @click="closeModal">Cancelar</button>
                    <button type="submit" class="btn btn-primary px-4 fw-bold" :disabled="formLoading">
                        <span v-if="formLoading" class="spinner-border spinner-border-sm me-1"></span>
                        {{ isEditing ? 'Guardar Cambios' : 'Crear Programa' }}
                    </button>
                </div>
             </form>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchProgramasByCategoria, createPrograma, updatePrograma } from '@/services/convocatorias.api'

const route = useRoute()
const router = useRouter()

const idCategoria = computed(() => Number(route.params.idCategoria))
const categoriaNombre = computed(() => route.query?.nombre || '')

const loading = ref(true)
const error = ref('')
const programas = ref([])

// Form State
const showModal = ref(false)
const formLoading = ref(false)
const formError = ref('')
const isEditing = ref(false)
const editingId = ref(null)

const form = reactive({
    nombrePrograma: '',
    descripcion: '',
    tipoApoyo: '',
    vigencia: '',
    presupuesto: ''
})

const loadProgramas = async () => {
  loading.value = true
  error.value = ''
  try {
    const data = await fetchProgramasByCategoria(idCategoria.value)
    programas.value = Array.isArray(data) ? data : []
  } catch (e) {
    console.error(e)
    error.value = 'Error al cargar los programas.'
  } finally {
    loading.value = false
  }
}

const goToModalidades = (prog) => {
  router.push({
    name: 'admin-modalities',
    params: { idPrograma: prog.idPrograma },
    query: { nombrePrograma: prog.nombrePrograma, categoria: categoriaNombre.value }
  })
}

// Modal Logic
const openModal = (prog = null) => {
    showModal.value = true
    formError.value = ''
    if (prog) {
        isEditing.value = true
        editingId.value = prog.idPrograma
        // Map fields based on API response vs Form expectation
        // API returns: nombrePrograma, descripcion, tipoApoyo, vigencia, presupuesto
        form.nombrePrograma = prog.nombrePrograma
        form.descripcion = prog.descripcion || '' 
        form.tipoApoyo = prog.tipoApoyo || ''
        form.vigencia = prog.vigencia || ''
        form.presupuesto = prog.presupuesto || ''
    } else {
        isEditing.value = false
        editingId.value = null
        form.nombrePrograma = ''
        form.descripcion = ''
        form.tipoApoyo = ''
        form.vigencia = ''
        form.presupuesto = ''
    }
}

const closeModal = () => {
    showModal.value = false
}

const submitForm = async () => {
    formLoading.value = true
    formError.value = ''
    try {
        const payload = {
            idCategoria: idCategoria.value,
            nombrePrograma: form.nombrePrograma,
            descripcion: form.descripcion,
            tipoApoyo: form.tipoApoyo,
            vigencia: form.vigencia,
            presupuesto: form.presupuesto
        }

        if (isEditing.value) {
            await updatePrograma(editingId.value, payload)
        } else {
            await createPrograma(payload)
        }
        
        // Success
        closeModal()
        await loadProgramas() // Refresh list
    } catch (e) {
        console.error(e)
        formError.value = e?.response?.data?.message || 'Error al guardar el programa.'
    } finally {
        formLoading.value = false
    }
}

onMounted(loadProgramas)
</script>

<style scoped>
.hover-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
.hover-card:hover { transform: translateY(-5px); box-shadow: 0 1rem 3rem rgba(0,0,0,.1)!important; }
.uppercase-text { text-transform: uppercase; letter-spacing: 0.5px; }
.cursor-pointer { cursor: pointer; }
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
