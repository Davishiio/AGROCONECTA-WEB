<template>
  <div class="d-flex flex-column min-vh-100 bg-light">
    <BeneficiarioNavbar />
    
    <div class="container py-4 flex-grow-1">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
           <h2 class="fw-bold text-agro-navy mb-0">Gestión de Plagas</h2>
           <p class="text-muted mb-0">Consulta el catálogo de referencias y el mapa de reportes activos.</p>
        </div>
      </div>

      <!-- Tabs Navigation -->
      <ul class="nav nav-pills nav-fill bg-white shadow-sm rounded-pill p-1 mb-4" id="plagasTab" role="tablist">
        <li class="nav-item" role="presentation">
          <button 
            class="nav-link rounded-pill fw-bold" 
            :class="{ active: currentTab === 'catalogo' }"
            @click="currentTab = 'catalogo'"
            type="button"
          >
            <i class="bi bi-book me-2"></i>Catálogo de Referencia
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button 
            class="nav-link rounded-pill fw-bold" 
            :class="{ active: currentTab === 'mapa' }"
            @click="currentTab = 'mapa'"
            type="button"
          >
            <i class="bi bi-map me-2"></i>Mapa de Calor
          </button>
        </li>
      </ul>

      <!-- Content -->
      <div class="tab-content" id="plagasTabContent">
        <!-- Catalog Tab -->
        <div v-if="currentTab === 'catalogo'" class="fade show active">
            <PlagasCatalog />
        </div>

        <!-- Map Tab -->
        <div v-if="currentTab === 'mapa'" class="fade show active">
            <div class="card border-0 shadow-sm rounded-4">
                <div class="card-body p-0">
                    <PlagasMap />
                </div>
            </div>
            <div class="mt-3 text-center text-muted small">
                <i class="bi bi-info-circle me-1"></i> Los círculos representan el radio de alerta de los reportes validados.
            </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import BeneficiarioNavbar from '@/components/BeneficiarioNavbar.vue'
import PlagasCatalog from './PlagasCatalog.vue'
import PlagasMap from './PlagasMap.vue'

const currentTab = ref('catalogo')
</script>

<style scoped>
.nav-pills .nav-link {
    color: #495057;
    transition: all 0.3s ease;
}
.nav-pills .nav-link.active {
    background-color: var(--agro-emerald, #20c997);
    color: white;
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(32, 201, 151, 0.25);
}
</style>
