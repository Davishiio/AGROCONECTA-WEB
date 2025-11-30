
template>
  <aside class="border-end bg-white" style="width:260px">
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
</template>

<script setup>
// No necesita script
</script>
