<template>
  <div class="min-vh-100 d-flex">
    <!-- sidebar fijo opcional -->
    <aside class="border-end bg-white" style="width:260px">
      <div class="p-3 border-bottom">
        <strong>Admin</strong>
      </div>
      <ul class="list-unstyled p-3">
        <li><RouterLink to="/admin" class="link-dark text-decoration-none">Dashboard</RouterLink></li>
      </ul>
    </aside>

    <main class="flex-grow-1">
      <header class="border-bottom bg-white d-flex align-items-center justify-content-between px-3" style="height:56px">
        <div class="fw-medium">Panel de administración</div>
        <button class="btn btn-outline-danger btn-sm" @click="logout">Cerrar sesión</button>
      </header>
      <section class="p-3">
        <RouterView />
      </section>
    </main>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
const { logout } = useAuthStore()
</script>

<style scoped>
/* Sin navbar bootstrap => no hay toggler/hamburguesa */
</style>
