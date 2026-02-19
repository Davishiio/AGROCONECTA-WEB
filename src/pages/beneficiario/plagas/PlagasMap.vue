<template>
  <div class="d-flex flex-column h-100 position-relative">
      <div id="map" class="h-100 w-100" style="min-height: 70vh; z-index: 1; border-radius: 1rem; overflow: hidden;"></div>
      
      <!-- Loading Overlay -->
      <div v-if="loading" class="position-absolute top-0 start-0 w-100 h-100 bg-white bg-opacity-75 d-flex align-items-center justify-content-center" style="z-index: 1000; border-radius: 1rem;">
          <div class="spinner-border text-agro-emerald" role="status">
              <span class="visually-hidden">Cargando mapa...</span>
          </div>
      </div>
  
      <!-- Detail Modal (Custom impl or Bootstrap) -->
      <PlagaDetailModal 
          v-if="selectedPlaga" 
          :plaga="selectedPlaga" 
          @close="selectedPlaga = null" 
      />
  </div>
</template>

<script setup>
import { onMounted, ref, onUnmounted } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { fetchPlagasMap } from '@/services/plagas.api'
import PlagaDetailModal from './components/PlagaDetailModal.vue'

const map = ref(null)
const loading = ref(true)
const selectedPlaga = ref(null)
const plagas = ref([])

// Default center (Quintana Roo aprox) or get from user loc
const defaultCenter = [19.5, -88.0] 
const defaultZoom = 8

const initMap = () => {
    map.value = L.map('map').setView(defaultCenter, defaultZoom)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map.value)
}

const loadPlagas = async () => {
    loading.value = true
    try {
        const data = await fetchPlagasMap()
        plagas.value = data
        
        // Add markers/circles
        data.forEach(item => {
            if (item.ubicacion && item.ubicacion.latitud && item.ubicacion.longitud) {
                // API returns latitud/longitud but they may be swapped
                // The API sends: latitud = longitude value, longitud = latitude value
                const lat = item.ubicacion.longitud
                const lng = item.ubicacion.latitud
                const radioKm = item.ubicacion.radio_km
                
                // Circle representing the alert radius
                const color = getPeligrosidadColor(item.plaga.nivel_peligrosidad)
                const circle = L.circle([lat, lng], {
                    color: color,
                    fillColor: color,
                    fillOpacity: 0.3,
                    radius: (radioKm || 1) * 1000 // Convert km to meters
                }).addTo(map.value)
                
                // Click event to show details
                circle.on('click', () => {
                    selectedPlaga.value = item
                })
                
                // Marker in center with popup
                const marker = L.marker([lat, lng]).addTo(map.value)
                marker.bindPopup(`<b>${item.plaga.nombre_comun}</b><br>${item.alerta.mensaje}`)
                marker.on('click', () => {
                    selectedPlaga.value = item
                })
            }
        })

        // Auto-fit bounds if there are reports
        if (data.length > 0) {
            const bounds = L.latLngBounds(
                data
                    .filter(i => i.ubicacion?.latitud && i.ubicacion?.longitud)
                    .map(i => [i.ubicacion.longitud, i.ubicacion.latitud])
            )
            if (bounds.isValid()) {
                map.value.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 })
            }
        }
        
    } catch (e) {
        console.error("Error loading plagas map", e)
    } finally {
        loading.value = false
    }
}

const getPeligrosidadColor = (level) => {
    const lowerLevel = String(level).toLowerCase()
    if (lowerLevel.includes('alto') || lowerLevel === 'high') return '#e74c3c'
    if (lowerLevel.includes('medio') || lowerLevel === 'medium') return '#f39c12'
    return '#2ecc71'
}

onMounted(() => {
    initMap()
    loadPlagas()
})

onUnmounted(() => {
    if (map.value) {
        map.value.remove()
    }
})
</script>

<style scoped>
/* Leaflet fix for some bundlers */
:deep(.leaflet-pane) { z-index: 10 !important; }
:deep(.leaflet-bottom) { z-index: 20 !important; }
</style>
