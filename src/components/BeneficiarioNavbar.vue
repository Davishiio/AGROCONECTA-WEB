<template>
  <nav class="navbar navbar-expand-lg bg-white shadow-sm mb-4 sticky-top border-bottom border-success border-opacity-25">
    <div class="container-fluid px-4">
      <router-link :to="{ name: 'beneficiario-home' }" class="navbar-brand fw-bold d-flex align-items-center gap-2">
        <img src="/img/logo.svg" onerror="this.style.display='none'" alt="AgroConecta" style="height: 35px; width: auto;">
        <span class="text-agro-emerald">AgroConecta</span>
      </router-link>
      
      <div class="d-flex align-items-center gap-3">
        <!-- Mercado Link -->
         <router-link :to="{ name: 'mercado-list' }" class="btn btn-link text-decoration-none fw-bold text-agro-navy" active-class="text-agro-emerald">
            <i class="bi bi-shop me-1"></i> Mercado
         </router-link>

         <!-- Plagas Link -->
         <router-link :to="{ name: 'beneficiario-plagas' }" class="btn btn-link text-decoration-none fw-bold text-agro-navy" active-class="text-agro-emerald">
            <i class="bi bi-bug me-1"></i> Plagas
         </router-link>

        <div class="d-none d-md-block text-end lh-1 border-start ps-3 ms-2">
          <span class="fw-bold text-agro-navy">{{ userName }}</span>
          <small class="d-block text-muted">{{ nombreComunidad }}</small>
        </div>
        <button class="btn btn-outline-danger btn-sm rounded-circle shadow-sm" style="width: 32px; height: 32px;" @click="handleLogout">
          <i class="bi bi-power"></i>
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const userName = computed(() => auth.user?.nombre || 'Beneficiario')
const nombreComunidad = computed(() => auth.user?.comunidad || 'Comunidad')

const handleLogout = async () => {
  auth.logout()
  router.replace({ name: 'beneficiario-login' })
}
</script>

<style scoped>
.text-agro-emerald { color: var(--agro-emerald); }
.text-agro-navy { color: var(--agro-navy); }
</style>
