<template>
  <div class="d-flex min-vh-100 bg-light font-sans">

    <!-- Sidebar -->
    <aside class="sidebar bg-white border-end shadow-sm d-flex flex-column transition-all"
           :class="collapsed ? 'sidebar-collapsed' : 'sidebar-expanded'">

      <!-- Logo -->
      <div class="p-4 border-bottom d-flex align-items-center justify-content-between">
        <div v-if="!collapsed" class="d-flex align-items-center gap-2 text-agro-emerald fw-bold fs-5">
          <i class="bi bi-flower1 fs-3"></i>
          AgroAdmin
        </div>
        <i v-else class="bi bi-flower1 fs-3 text-agro-emerald mx-auto"></i>

        <button v-if="!collapsed" class="btn btn-sm btn-link text-secondary" @click="collapsed = true">
          <i class="bi bi-chevron-left"></i>
        </button>
      </div>

      <!-- Menú -->
      <nav class="nav flex-column p-3 gap-2 flex-grow-1 overflow-hidden">

        <!-- Toggle Button for Mobile/Collapsed recover -->
        <button v-if="collapsed" class="btn btn-link text-secondary mb-3" @click="collapsed = false">
          <i class="bi bi-list fs-4"></i>
        </button>

        <router-link :to="{ name: 'admin-home' }" class="nav-link rounded px-3 d-flex align-items-center" active-class="active-link" title="Dashboard">
          <i class="bi bi-grid-1x2-fill me-3 fs-5"></i>
          <span v-if="!collapsed">Dashboard</span>
        </router-link>

        <div v-if="!collapsed" class="nav-header mt-3 mb-2 px-3 text-uppercase x-small fw-bold text-muted">Gestión</div>

        <router-link :to="{ name: 'admin-solicitudes' }" class="nav-link rounded px-3 d-flex align-items-center" active-class="active-link" title="Solicitudes">
          <i class="bi bi-inbox-fill me-3 fs-5"></i>
          <span v-if="!collapsed">Solicitudes</span>
        </router-link>

        <router-link :to="{ name: 'admin-parcelas' }" class="nav-link rounded px-3 d-flex align-items-center" active-class="active-link" title="Parcelas">
          <i class="bi bi-map-fill me-3 fs-5"></i>
          <span v-if="!collapsed">Parcelas</span>
        </router-link>

        <router-link :to="{ name: 'admin-video-analyzer' }" class="nav-link rounded px-3 d-flex align-items-center" active-class="active-link" title="Analizador de Videos">
          <i class="bi bi-camera-reels-fill me-3 fs-5"></i>
          <span v-if="!collapsed">Laboratorio de IA</span>
        </router-link>

        <router-link :to="{ name: 'admin-plagas' }" class="nav-link rounded px-3 d-flex align-items-center" active-class="active-link" title="Gestión de Plagas">
          <i class="bi bi-bug-fill me-3 fs-5"></i>
          <span v-if="!collapsed">Gestión de Plagas</span>
        </router-link>

        <router-link :to="{ name: 'admin-convocatorias-categorias' }" class="nav-link rounded px-3 d-flex align-items-center" active-class="active-link" title="Convocatorias">
          <i class="bi bi-megaphone-fill me-3 fs-5"></i>
          <span v-if="!collapsed">Convocatorias</span>
        </router-link>

      </nav>

      <!-- Footer User -->
      <div class="p-3 border-top bg-light">
        <div class="d-flex align-items-center gap-3 px-2 mb-3" :class="collapsed ? 'justify-content-center' : ''">
          <div class="avatar bg-agro-navy text-white rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 shadow-sm" style="width: 38px; height: 38px;">
            {{ userInitial }}
          </div>
          <div v-if="!collapsed" class="overflow-hidden">
            <p class="mb-0 fw-bold text-agro-navy text-truncate small">{{ userName }}</p>
            <small class="text-muted x-small">Administrador</small>
          </div>
        </div>
        <button v-if="!collapsed" @click="handleLogout" class="btn btn-outline-danger w-100 btn-sm fw-bold">
          <i class="bi bi-box-arrow-right me-2"></i> Cerrar Sesión
        </button>
        <button v-else @click="handleLogout" class="btn btn-outline-danger btn-sm rounded-circle p-0" style="width:32px; height:32px;">
          <i class="bi bi-power"></i>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-grow-1 d-flex flex-column h-100 overflow-hidden">
      <!-- Mobile Header -->
      <div class="d-md-none bg-white p-3 shadow-sm d-flex justify-content-between align-items-center">
        <span class="fw-bold text-agro-emerald">AgroAdmin</span>
        <button class="btn btn-link text-dark" @click="collapsed = !collapsed"><i class="bi bi-list fs-4"></i></button>
      </div>

      <div class="flex-grow-1 overflow-auto bg-light position-relative">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import '@/assets/agro-theme.css'

const router = useRouter()
const auth = useAuthStore()
const collapsed = ref(false)

const userName = computed(() => auth.user?.nombre || 'Admin')
const userInitial = computed(() => userName.value ? userName.value.charAt(0).toUpperCase() : 'A')

const handleLogout = () => {
  auth.logout()
  router.push({ name: 'admin-login' })
}
</script>

<style scoped>
.sidebar-expanded { width: 260px; }
.sidebar-collapsed { width: 80px; }
.transition-all { transition: all 0.3s ease; }

.nav-link { color: #64748b; font-weight: 500; transition: all 0.2s; position: relative; }
.nav-link:hover { background-color: rgba(32, 201, 151, 0.08); color: var(--agro-emerald); }

.active-link {
  background-color: rgba(32, 201, 151, 0.15) !important;
  color: var(--agro-emerald) !important;
  font-weight: 700 !important;
}
.active-link::before {
  content: ''; position: absolute; left: 0; top: 10%; height: 80%; width: 4px;
  background-color: var(--agro-emerald); border-radius: 0 4px 4px 0;
}

.x-small { font-size: 0.75rem; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>