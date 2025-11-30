<template>
  <div class="map-wrapper">
    <div :id="mapId" class="map-container rounded-4 shadow-sm border"></div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, nextTick } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const props = defineProps({
  poligono: {
    type: Object,
    required: true
  },
  parcelaId: {
    type: [Number, String],
    default: 'default'
  }
});

let map = null;
const mapId = `map-parcela-${props.parcelaId}`;

const initMap = () => {
  if (map) return;

  // 1. Inicializar mapa
  map = L.map(mapId, { zoomControl: false }).setView([19.5, -88.0], 8); // Vista genérica QR
  L.control.zoom({ position: 'bottomright' }).addTo(map);

  // 2. Capa Híbrida de Google (Satelite + Calles)
  L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
    attribution: 'Google Satellite',
    maxZoom: 20
  }).addTo(map);

  // 3. Dibujar Polígono con Corrección de Coordenadas
  if (props.poligono) {
    const layer = L.geoJSON(props.poligono, {
      style: {
        color: '#ffc107', // Amarillo
        weight: 3,
        opacity: 1,
        fillColor: '#20c997', // Verde Agro
        fillOpacity: 0.4
      },
      // --- IMPORTANTE ---
      // Tu JSON trae: [20.133, -87.581] -> [Lat, Lon]
      // Leaflet espera: [Lon, Lat] por defecto en GeoJSON.
      // Esta función fuerza a Leaflet a leerlo como [Lat, Lon].
      coordsToLatLng: function (coords) {
        // coords[0] es Latitud, coords[1] es Longitud
        return new L.LatLng(coords[0], coords[1]);
      }
    }).addTo(map);

    // 4. Centrar en el polígono
    const bounds = layer.getBounds();
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }
};

onMounted(() => {
  // Esperar a que el modal termine de abrir
  nextTick(() => {
    setTimeout(initMap, 300);
  });
});

onUnmounted(() => {
  if (map) {
    map.remove();
    map = null;
  }
});
</script>

<style scoped>
.map-wrapper { width: 100%; position: relative; }
.map-container {
  width: 100%;
  height: 450px;
  background-color: #e9ecef;
  z-index: 1;
}
</style>