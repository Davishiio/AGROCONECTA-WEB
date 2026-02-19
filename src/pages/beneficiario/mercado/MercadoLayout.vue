<template>
  <div class="min-vh-100 bg-light font-sans">
    <BeneficiarioNavbar />
    <router-view />
  </div>
</template>

<script setup>
import BeneficiarioNavbar from '@/components/BeneficiarioNavbar.vue'
</script>

<style>
.font-sans { font-family: 'Inter', sans-serif; }
</style>
