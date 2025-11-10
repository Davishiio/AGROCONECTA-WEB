<template>
  <div class="min-vh-100 d-flex">

    <!-- ===== Sidebar (LG y arriba) ===== -->
    <aside class="d-none d-lg-block border-end bg-white" style="width:260px">
      <div class="p-3 border-bottom">
        <strong>AgroConecta Admin</strong>
      </div>
      <ul class="list-unstyled p-3">
        <li class="mb-1">
          <RouterLink :to="{ name:'admin-home' }" class="link-dark text-decoration-none">Dashboard</RouterLink>
        </li>
        <li class="mb-1">
          <RouterLink :to="{ name:'admin-convocatorias-categorias' }" class="link-dark text-decoration-none">
            Convocatorias (por categoría)
          </RouterLink>
        </li>
      </ul>
    </aside>

    <!-- ===== Sidebar móvil (off-canvas simple) ===== -->
    <transition name="fade">
      <div
          v-if="sidebarOpen"
          class="position-fixed top-0 start-0 bottom-0 end-0 bg-dark bg-opacity-50 d-lg-none"
          @click="sidebarOpen = false"
          style="z-index:1040"
      />
    </transition>
    <transition name="slide">
      <aside
          v-if="sidebarOpen"
          class="position-fixed top-0 start-0 bottom-0 bg-white border-end d-lg-none"
          style="width:260px; z-index:1041"
      >
        <div class="p-3 border-bottom d-flex align-items-center justify-content-between">
          <strong>AgroConecta Admin</strong>
          <button class="btn btn-sm btn-outline-secondary" @click="sidebarOpen=false" aria-label="Cerrar menú">×</button>
        </div>
        <ul class="list-unstyled p-3">
          <li class="mb-1">
            <RouterLink :to="{ name:'admin-home' }" class="link-dark text-decoration-none" @click="sidebarOpen=false">Dashboard</RouterLink>
          </li>
          <li class="mb-1">
            <RouterLink :to="{ name:'admin-convocatorias-categorias' }" class="link-dark text-decoration-none" @click="sidebarOpen=false">
              Convocatorias (por categoría)
            </RouterLink>
          </li>
        </ul>
      </aside>
    </transition>

    <!-- ===== Contenido ===== -->
    <main class="flex-grow-1">
      <header class="border-bottom bg-white d-flex align-items-center justify-content-between px-3" style="height:56px">
        <div class="d-flex align-items-center gap-2">
          <!-- Hamburguesa móvil -->
          <button class="btn btn-outline-secondary d-lg-none" @click="sidebarOpen = true" aria-label="Abrir menú">
            ☰
          </button>
          <div class="fw-medium">Panel de administración</div>
        </div>
        <button class="btn btn-outline-danger btn-sm" @click="logout">Cerrar sesión</button>
      </header>

      <section class="p-3">
        <RouterView />
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const { logout } = useAuthStore()
const sidebarOpen = ref(false)
</script>

<style scoped>
.fade-enter-active,.fade-leave-active{ transition: opacity .15s linear; }
.fade-enter-from,.fade-leave-to{ opacity: 0; }

.slide-enter-active,.slide-leave-active{ transition: transform .2s ease; }
.slide-enter-from{ transform: translateX(-100%); }
.slide-leave-to{ transform: translateX(-100%); }
</style>
