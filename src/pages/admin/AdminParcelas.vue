<template>
  <div class="container-fluid h-100 d-flex flex-column">

    <!-- Header y Tabs -->
    <div class="d-flex justify-content-between align-items-center mb-3 flex-shrink-0">
      <div>
        <h3 class="fw-bold text-agro-navy mb-1">Gestión de Parcelas</h3>
        <p class="text-muted mb-0">Valida nuevos registros o visualiza el padrón activo.</p>
      </div>

      <!-- Selector de Vistas -->
      <div class="bg-white p-1 rounded-pill border shadow-sm d-flex">
        <button
            class="btn btn-sm rounded-pill px-3 fw-bold transition-all"
            :class="view === 'revision' ? 'btn-agro-primary' : 'text-muted'"
            @click="view = 'revision'"
        >
          <i class="bi bi-list-check me-2"></i> Por Revisar
        </button>
        <button
            class="btn btn-sm rounded-pill px-3 fw-bold transition-all"
            :class="view === 'mapa' ? 'btn-agro-primary' : 'text-muted'"
            @click="initMapTab"
        >
          <i class="bi bi-map-fill me-2"></i> Mapa Global
        </button>
      </div>
    </div>

    <!-- VISTA 1: LISTA DE REVISIÓN -->
    <div v-if="view === 'revision'" class="flex-grow-1 overflow-auto animate-fade-in">
      <div v-if="loadingRevision" class="text-center py-5">
        <div class="spinner-border text-secondary" role="status"></div>
      </div>

      <div v-else-if="pendientes.length === 0" class="text-center py-5 bg-white rounded-4 shadow-sm">
        <i class="bi bi-check-circle-fill text-success fs-1"></i>
        <h5 class="mt-3">¡Todo al día!</h5>
        <p class="text-muted">No hay parcelas pendientes de validación.</p>
      </div>

      <div v-else class="row g-3">
        <!-- Iteramos sobre 'item' que contiene {parcela, beneficiario} -->
        <div class="col-md-6 col-xl-4" v-for="(item, index) in pendientes" :key="index">
          <div class="card border-0 shadow-sm rounded-4 h-100">
            <div class="card-body p-4">
              <div class="d-flex justify-content-between mb-3">
                <span class="badge bg-warning text-dark bg-opacity-25 border border-warning">
                  {{ item.parcela.statusParcela || 'Pendiente' }}
                </span>
                <small class="text-muted">{{ formatDate(item.parcela.fecha_registro) }}</small>
              </div>

              <h5 class="fw-bold text-agro-navy mb-1">{{ item.parcela.nombreParcela }}</h5>
              <p class="text-muted small mb-3">
                ID Geo: <strong>{{ item.parcela.idParcelaGeo }}</strong>
              </p>

              <div class="d-flex align-items-center gap-2 mb-3 bg-light p-2 rounded">
                <i class="bi bi-person-circle text-muted fs-5"></i>
                <div class="lh-sm">
                  <div class="fw-bold small text-dark">{{ item.beneficiario.nombre }}</div>
                  <div class="text-muted x-small">Comunidad: {{ item.beneficiario.comunidad }}</div>
                </div>
              </div>

              <!-- Botones de Documento -->
              <div class="d-flex gap-2 mb-3">
                <!-- Usamos la URL dinámica que viene en el JSON -->
                <a :href="item.parcela.doc_tipo_8_url" target="_blank" class="btn btn-sm btn-outline-secondary flex-grow-1 text-truncate">
                  <i class="bi bi-file-earmark-pdf"></i> Ver Documento
                </a>
                <!-- Botón que abre el Modal de Mapa Individual -->
                <button class="btn btn-sm btn-outline-primary" @click="verMapaIndividual(item.parcela)">
                  <i class="bi bi-geo-alt-fill"></i>
                </button>
              </div>

              <!-- Acciones de Validación -->
              <div class="d-grid grid-cols-2 gap-2 mt-auto pt-3 border-top">
                <!-- CORRECCIÓN: Enviamos 'Validado' en lugar de 'Aprobado' para coincidir con DB -->
                <button
                    class="btn btn-success btn-sm fw-bold"
                    @click="validar(item.parcela.idParcela, item.parcela.idDocumento, 'Validado')"
                >
                  <i class="bi bi-check-lg"></i> Aprobar
                </button>
                <button
                    class="btn btn-danger btn-sm fw-bold"
                    @click="validar(item.parcela.idParcela, item.parcela.idDocumento, 'Rechazado')"
                >
                  <i class="bi bi-x-lg"></i> Rechazar
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- VISTA 2: MAPA GLOBAL -->
    <div v-show="view === 'mapa'" class="flex-grow-1 bg-white rounded-4 shadow-sm overflow-hidden position-relative border animate-fade-in" style="height: 75vh;">
      <div id="global-map" class="w-100 h-100 z-0 bg-light"></div>

      <div v-if="loadingMap" class="position-absolute top-0 start-0 w-100 h-100 bg-white bg-opacity-75 d-flex flex-column align-items-center justify-content-center z-3">
        <div class="spinner-border text-agro-emerald" style="width: 3rem; height: 3rem;"></div>
        <p class="mt-3 fw-bold text-agro-navy">Cargando cartografía...</p>
      </div>

      <div class="position-absolute top-0 end-0 m-3 bg-white p-3 rounded-3 shadow border z-2" style="max-width: 280px;">
        <h6 class="fw-bold text-agro-navy mb-2 small text-uppercase">Filtros de Mapa</h6>

        <div class="mb-3">
          <select v-model="mapFilter" class="form-select form-select-sm border-success text-agro-navy fw-bold">
            <option value="parcelas">🌱 Parcelas Activas</option>
            <option value="plagas">🪲 Plagas Detectadas</option>
          </select>
        </div>

        <div class="d-flex align-items-center gap-2 mb-1" v-if="mapFilter === 'parcelas'">
          <div class="rounded-1" style="width: 15px; height: 15px; background: rgba(32, 201, 151, 0.5); border: 2px solid #ffc107;"></div>
          <small class="text-muted">Parcelas Activas ({{ activeCount || 0 }})</small>
        </div>

        <div v-else>
          <div class="mb-3 border-bottom pb-3">
            <label class="form-label x-small fw-bold text-muted text-uppercase">Filtros Avanzados</label>

            <select v-model="pestFilters.nombre_plaga" class="form-select form-select-sm mb-2">
              <option value="">Todas las Plagas</option>
              <option v-for="plaga in catalogoPlagas" :key="plaga.id" :value="plaga.nombre_comun">
                {{ plaga.nombre_comun }}
              </option>
            </select>

            <select v-model="pestFilters.nivel_peligrosidad" class="form-select form-select-sm mb-2">
              <option value="">Nivel de Peligrosidad</option>
              <option value="Alto">Alta</option>
              <option value="Medio">Media</option>
              <option value="Bajo">Baja</option>
            </select>
            <button class="btn btn-sm btn-agro-primary w-100 fw-bold" @click="applyPestFilters">
              <i class="bi bi-funnel-fill me-1"></i> Aplicar Filtros
            </button>
          </div>

          <div class="d-flex align-items-center gap-2 mb-1">
            <div class="rounded-circle" style="width: 15px; height: 15px; background: rgba(220, 53, 69, 0.2); border: 2px solid #dc3545;"></div>
            <small class="text-muted">Radio de Alerta</small>
          </div>
          <div class="d-flex align-items-center gap-2 mb-1">
            <div class="rounded-1" style="width: 15px; height: 15px; background: rgba(253, 126, 20, 0.5); border: 2px solid #fd7e14;"></div>
            <small class="text-muted">Parcela Afectada</small>
          </div>
          <small class="text-muted d-block mt-1">Total Reportes: {{ activeCount || 0 }}</small>
        </div>

        <small class="d-block text-muted mt-2 fst-italic x-small">
          Toca un elemento para ver detalle.
        </small>
      </div>
    </div>

    <!-- MODAL DE VISUALIZACIÓN DE PARCELA INDIVIDUAL -->
    <div v-if="showMapModal" class="modal-backdrop fade show" style="z-index: 1050;"></div>
    <div v-if="showMapModal" class="modal fade show d-block" tabindex="-1" role="dialog" @click.self="closeMapModal">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <div class="modal-header bg-agro-navy text-white border-0 px-4 py-3">
            <div>
              <h5 class="modal-title fw-bold">
                <i class="bi bi-geo-alt-fill text-danger me-2"></i>
                {{ selectedParcelaForMap?.nombreParcela || 'Sin Nombre' }}
              </h5>
              <p class="mb-0 small opacity-75">ID Geo: {{ selectedParcelaForMap?.idParcelaGeo }}</p>
            </div>
            <button type="button" class="btn-close btn-close-white" @click="closeMapModal"></button>
          </div>
          <div class="modal-body p-0 bg-light">
            <!-- Componente ParcelaMap integrado -->
            <ParcelaMap
                v-if="selectedParcelaForMap?.poligono"
                :poligono="selectedParcelaForMap.poligono"
                :parcela-id="selectedParcelaForMap.idParcela"
            />
            <div v-else class="text-center p-5">
              <i class="bi bi-map text-muted fs-1 opacity-25"></i>
              <p class="text-muted mt-3 fw-bold">No hay datos geográficos para esta parcela.</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TARJETA FLOTANTE DE DETALLE DE REPORTE DE PLAGA -->
    <transition name="slide-fade">
      <div v-if="showReportModal" class="position-absolute top-0 end-0 h-100 p-3" style="z-index: 1060; pointer-events: none; width: 400px; max-width: 100%;">
        <div class="card border-0 shadow-lg rounded-4 h-100 overflow-hidden d-flex flex-column" style="pointer-events: auto;">
          <div class="card-header bg-danger text-white border-0 px-4 py-3 flex-shrink-0">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <h5 class="card-title fw-bold mb-1">
                  <i class="bi bi-exclamation-triangle-fill me-2"></i>
                  Alerta de Plaga
                </h5>
                <p class="mb-0 small opacity-75">Reporte #{{ selectedReport?.id_reporte }}</p>
              </div>
              <button type="button" class="btn-close btn-close-white" @click="closeReportModal"></button>
            </div>
          </div>
          
          <div class="card-body p-4 bg-light overflow-auto flex-grow-1">
            <div class="card border-0 shadow-sm mb-3">
              <div class="card-body">
                <h6 class="fw-bold text-agro-navy mb-2">Información de la Plaga</h6>
                <div class="d-flex justify-content-between mb-1">
                  <span class="text-muted small">Nombre Común:</span>
                  <span class="fw-bold text-danger">{{ selectedReport?.plaga_confirmada?.nombre_comun }}</span>
                </div>
                <div class="d-flex justify-content-between mb-1">
                  <span class="text-muted small">Científico:</span>
                  <span class="fst-italic">{{ selectedReport?.plaga_confirmada?.nombre_cientifico }}</span>
                </div>
                <div class="d-flex justify-content-between">
                  <span class="text-muted small">Peligrosidad:</span>
                  <span class="badge" :class="getPeligrosidadClass(selectedReport?.plaga_confirmada?.nivel_peligrosidad)">
                            {{ selectedReport?.plaga_confirmada?.nivel_peligrosidad }}
                        </span>
                </div>
              </div>
            </div>

            <div class="card border-0 shadow-sm mb-3">
              <div class="card-body">
                <h6 class="fw-bold text-agro-navy mb-2">Ubicación y Reporte</h6>
                <div class="mb-2">
                  <small class="text-muted d-block">Reportado por:</small>
                  <span class="fw-bold">{{ selectedReport?.reportado_por?.nombre }}</span>
                  <span class="text-muted x-small ms-2">({{ selectedReport?.reportado_por?.curp }})</span>
                </div>
                <div class="mb-2">
                  <small class="text-muted d-block">Parcela:</small>
                  <span>ID: {{ selectedReport?.parcela?.idParcela }}</span>
                </div>
                <div v-if="selectedReport?.alerta">
                  <small class="text-muted d-block">Radio de Alerta:</small>
                  <span class="text-danger fw-bold">{{ selectedReport?.alerta?.radio_km }} km</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import adminService from '@/services/admin.service'
import plagasService from '@/services/plagas.service'
import ParcelaMap from '@/pages/beneficiario/ParcelaMap.vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import '@/assets/agro-theme.css'

const view = ref('revision')
const loadingRevision = ref(false)
const loadingMap = ref(false)
const pendientes = ref([])
const activeCount = ref(0)
let map = null
let layerGroup = null
let radarLayer = null

// Estados del Modal Individual
const showMapModal = ref(false)
const selectedParcelaForMap = ref(null)

// Estados del Modal de Reporte
const showReportModal = ref(false)
const selectedReport = ref(null)

const mapFilter = ref('parcelas') // 'parcelas' | 'plagas'
const pestFilters = ref({ nombre_plaga: '', nivel_peligrosidad: '' })
const catalogoPlagas = ref([])

const boundsQR = [[17.8, -89.5], [21.8, -86.5]]

const loadPendientes = async () => {
  loadingRevision.value = true
  try {
    const { data } = await adminService.getParcelasPorRevisar()
    // Tu endpoint devuelve: { total: 2, data: [...] }
    const lista = (data && data.data) ? data.data : data
    pendientes.value = Array.isArray(lista) ? lista : []
  } catch (e) {
    console.error("Error pendientes:", e)
    pendientes.value = []
  }
  finally { loadingRevision.value = false }
}

const validar = async (idParcela, idDoc, status) => {
  // Validación preventiva: idDoc es crucial
  if (!idDoc) {
    alert("Error crítico: No se encontró el ID del documento para validar. Contacte a soporte.")
    return
  }

  if(!confirm(`¿Estás seguro de marcar este documento como ${status}?`)) return
  try {
    await adminService.validarParcela(idParcela, idDoc, status)
    loadPendientes()
  } catch (e) {
    console.error(e)
    const errors = e.response?.data?.errors;
    const msg = errors ? Object.values(errors).flat().join('\n') : (e.response?.data?.message || e.message);
    alert("Error al actualizar estatus:\n" + msg)
  }
}

// Abrir Modal Individual
const verMapaIndividual = (parcela) => {
  selectedParcelaForMap.value = parcela
  showMapModal.value = true
}

const closeMapModal = () => {
  showMapModal.value = false
  selectedParcelaForMap.value = null
}

const formatDate = (date) => {
  if(!date) return ''
  return new Date(date).toLocaleDateString()
}

// --- MAPA GLOBAL ---
const initMapTab = async () => {
  view.value = 'mapa'
  await nextTick()
  setTimeout(() => {
    if (!map) {
      iniciarLeaflet()
    } else {
      map.invalidateSize()
    }
  }, 300)
}

const iniciarLeaflet = async () => {
  map = L.map('global-map', {
    zoomControl: false,
    maxBounds: boundsQR,
    maxBoundsViscosity: 0.8,
    minZoom: 7
  }).setView([19.6, -88.0], 8)

  L.control.zoom({ position: 'bottomright' }).addTo(map)

  L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
    attribution: 'Google Satellite',
    maxZoom: 20
  }).addTo(map)

  await loadMapData()
  
  // Listener para actualizar radar al hacer zoom
  map.on('zoomend', () => {
    if (radarLayer) updateRadarSize()
  })
}

watch(mapFilter, (newVal) => {
  if (newVal === 'plagas') {
    if (catalogoPlagas.value.length === 0) loadCatalogo()
    addRadar()
  } else {
    removeRadar()
  }
  loadMapData()
})

// Filtros Exclusivos
watch(() => pestFilters.value.nombre_plaga, (newVal) => {
  if (newVal) pestFilters.value.nivel_peligrosidad = ''
  applyPestFilters()
})

watch(() => pestFilters.value.nivel_peligrosidad, (newVal) => {
  if (newVal) pestFilters.value.nombre_plaga = ''
  applyPestFilters()
})

// Watcher para modo enfoque del radar
watch(showReportModal, (newVal) => {
  if (radarLayer) updateRadarSize()
})

const loadMapData = async () => {
  loadingMap.value = true
  if(layerGroup) {
    layerGroup.clearLayers()
  } else {
    layerGroup = L.featureGroup().addTo(map)
  }

  try {
    if (mapFilter.value === 'parcelas') {
      await loadParcelasLayer()
    } else {
      await loadPlagasLayer()
    }
  } catch (error) {
    console.error("Error cargando mapa:", error)
  } finally {
    loadingMap.value = false
  }
}

const loadParcelasLayer = async () => {
  const { data } = await adminService.getParcelasActivasGeo()
  const listaParcelas = (data && data.data) ? data.data : (Array.isArray(data) ? data : [])
  activeCount.value = data.count || listaParcelas.length

  if (listaParcelas.length > 0) {
    listaParcelas.forEach(p => {
      if (p.poligono) {
        const idParaFetch = p.idParcela || p.idParcelaGeo;

        L.geoJSON(p.poligono, {
          style: {
            color: '#ffc107',
            weight: 3,
            opacity: 1,
            fillColor: '#20c997',
            fillOpacity: 0.4
          },
          coordsToLatLng: function (coords) {
            return new L.LatLng(coords[0], coords[1])
          },
          onEachFeature: (feature, layer) => {
            layer.bindPopup(`<div class="text-center p-3"><div class="spinner-border spinner-border-sm text-success mb-1"></div><div class="small text-muted">Consultando datos...</div></div>`);

            layer.on('popupopen', async () => {
              try {
                const resp = await adminService.getDetalleParcela(idParaFetch);
                if (!resp.data) throw new Error("Datos vacíos");

                const info = (resp.data && resp.data.parcela) ? resp.data : (resp.data.data || resp.data);

                const nombreParcela = info.parcela?.nombreParcela || 'Sin Nombre';
                const nombreMuni = info.parcela?.municipio?.nombreMunicipio || 'Municipio desconocido';
                const nombreBene = info.beneficiario?.nombreCompleto || '<span class="text-danger">Sin beneficiario</span>';
                const curp = info.beneficiario?.curp || '---';
                const tel = info.beneficiario?.telefono || '--';

                const content = `
                    <div class="text-start p-1 font-sans" style="min-width: 240px;">
                      <h6 class="fw-bold text-agro-navy mb-1 text-uppercase small ls-1">${nombreParcela}</h6>
                      <div class="d-flex align-items-center gap-1 mb-2">
                        <i class="bi bi-geo-alt-fill text-danger small"></i>
                        <span class="text-muted x-small">${nombreMuni}</span>
                      </div>
                      <hr class="my-2 border-secondary opacity-25">
                      <div class="d-flex align-items-start gap-2 mb-2">
                        <div class="rounded-circle bg-light p-2 d-flex align-items-center justify-content-center" style="width:35px; height:35px">
                           <i class="bi bi-person-fill text-agro-emerald"></i>
                        </div>
                        <div>
                          <span class="d-block text-muted x-small fw-bold">BENEFICIARIO</span>
                          <span class="text-dark fw-bold small d-block lh-1 mb-1">${nombreBene}</span>
                          <span class="badge bg-light text-secondary border x-small">CURP: ${curp}</span>
                        </div>
                      </div>
                      <div class="d-flex justify-content-between align-items-center mt-2 pt-2 border-top border-light">
                         <span class="text-muted x-small"><i class="bi bi-telephone me-1"></i>${tel}</span>
                         <span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25">Activa</span>
                      </div>
                    </div>
                  `;
                layer.setPopupContent(content);
              } catch (err) {
                let msg = "No se pudo cargar la información.";
                if (err.response && err.response.status === 500) msg = "Error interno del servidor.";

                layer.setPopupContent(`
                    <div class="text-center p-2 text-danger">
                        <i class="bi bi-exclamation-triangle-fill fs-5 mb-1"></i>
                        <div class="small fw-bold">${msg}</div>
                        <div class="x-small text-muted mt-1">ID: ${idParaFetch}</div>
                    </div>
                  `);
              }
            });
          }
        }).addTo(layerGroup)
      }
    })
  }
}

const loadPlagasLayer = async () => {
  let reportes = []

  // Si hay filtros activos, usar endpoint filtrado
  if (pestFilters.value.nombre_plaga || pestFilters.value.nivel_peligrosidad) {
    const { data } = await plagasService.getReportesFiltrados(pestFilters.value)
    reportes = (data && data.data) ? data.data : (Array.isArray(data) ? data : [])
  } else {
    // Si no, traer todos los validados
    const { data } = await plagasService.getReportesValidados()
    reportes = (data && data.data) ? data.data : (Array.isArray(data) ? data : [])
  }

  activeCount.value = reportes.length

  if (reportes.length > 0) {
    reportes.forEach(rep => {
      // 1. Dibujar Polígono de la Parcela Afectada
      if (rep.parcela && rep.parcela.poligono) {
        L.geoJSON(rep.parcela.poligono, {
          style: {
            color: '#fd7e14', // Naranja
            weight: 3,
            opacity: 1,
            fillColor: '#fd7e14',
            fillOpacity: 0.5
          },
          coordsToLatLng: function (coords) {
            return new L.LatLng(coords[0], coords[1])
          },
          onEachFeature: (feature, layer) => {
            // Click para abrir modal
            layer.on('click', () => {
              selectedReport.value = rep
              showReportModal.value = true
            })
          }
        }).addTo(layerGroup)
      }

      // 2. Dibujar Círculo de Alerta (si existe alerta)
      if (rep.alerta && rep.alerta.latitud && rep.alerta.longitud) {
        const lat = parseFloat(rep.alerta.latitud)
        const lng = parseFloat(rep.alerta.longitud)

        let finalLat = lat
        let finalLng = lng

        // Simple heurística para México
        if (lat < -80 && lng > 0) {
          finalLat = lng
          finalLng = lat
        }

        const radioKm = parseFloat(rep.alerta.radio_km) || 0
        const radioMetros = radioKm * 1000

        L.circle([finalLat, finalLng], {
          color: '#dc3545',
          fillColor: '#dc3545',
          fillOpacity: 0.1,
          radius: radioMetros,
          interactive: false // No bloquear clicks a la parcela
        }).addTo(layerGroup)
      }
    })
  }
}

const addRadar = () => {
  if (!map) return
  if (radarLayer) map.removeLayer(radarLayer)

  // Crear el icono inicialmente (tamaño se ajustará)
  const radarIcon = L.divIcon({
    className: 'radar-icon',
    html: '<div class="radar-pulse"></div><div class="radar-scan"></div>',
    iconSize: [100, 100], // Valor inicial dummy
    iconAnchor: [50, 50]
  })

  radarLayer = L.marker([19.6, -88.0], { icon: radarIcon, zIndexOffset: -1000 }).addTo(map)
  
  // Ajustar tamaño inmediatamente
  updateRadarSize()
}

const updateRadarSize = () => {
  if (!map || !radarLayer) return

  // Radio objetivo: 500km (global) o 50km (enfocado)
  const isFocused = showReportModal.value
  const targetRadiusMeters = isFocused ? 50000 : 500000
  
  const centerLatLng = radarLayer.getLatLng()
  
  // Fórmula: metersPerPixel = 40075016.686 * Math.abs(Math.cos(centerLatLng.lat * Math.PI/180)) / Math.pow(2, map.getZoom() + 8)
  const metersPerPixel = 40075016.686 * Math.abs(Math.cos(centerLatLng.lat * Math.PI / 180)) / Math.pow(2, map.getZoom() + 8)
  
  const diameterPixels = (targetRadiusMeters * 2) / metersPerPixel
  
  const newIcon = L.divIcon({
    className: isFocused ? 'radar-icon focused' : 'radar-icon',
    html: '<div class="radar-pulse"></div><div class="radar-scan"></div>',
    iconSize: [diameterPixels, diameterPixels],
    iconAnchor: [diameterPixels / 2, diameterPixels / 2]
  })
  
  radarLayer.setIcon(newIcon)
}

const removeRadar = () => {
  if (radarLayer && map) {
    map.removeLayer(radarLayer)
    radarLayer = null
  }
}

const closeReportModal = () => {
  showReportModal.value = false
  selectedReport.value = null
}

const getPeligrosidadClass = (nivel) => {
  switch(nivel) {
    case 'Alto': return 'bg-danger text-white'
    case 'Medio': return 'bg-warning text-dark'
    case 'Bajo': return 'bg-success text-white'
    default: return 'bg-secondary text-white'
  }
}

const applyPestFilters = () => {
  loadMapData()
}

const loadCatalogo = async () => {
  try {
    const { data } = await plagasService.getCatalogo()
    catalogoPlagas.value = data || []
  } catch (e) {
    console.error("Error cargando catalogo:", e)
  }
}

onMounted(() => {
  loadPendientes()
})
</script>

<style scoped>
.transition-all { transition: all 0.3s ease; }
.btn-agro-primary { background-color: var(--agro-emerald); color: white; border: none; }
.btn-agro-primary:hover { background-color: var(--agro-navy); }
.animate-fade-in { animation: fadeIn 0.3s ease-in-out; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.x-small { font-size: 0.75rem; }
#global-map { min-height: 500px; background-color: #e9ecef; }

/* Estilos Modal */
.modal-backdrop { background-color: rgba(30, 58, 95, 0.6); backdrop-filter: blur(4px); z-index: 1050; }
.modal { z-index: 1055; }

/* Radar Animation */
:deep(.radar-icon) {
  position: relative;
  width: 100px;
  height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none;
}

:deep(.radar-pulse) {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 2px solid rgba(220, 53, 69, 0.6);
  opacity: 0;
  animation: pulse 2s infinite ease-out;
}

:deep(.radar-scan) {
  position: absolute;
  width: 120%;
  height: 120%;
  border-radius: 50%;
  background: conic-gradient(from 0deg, transparent 0deg, rgba(220, 53, 69, 0.1) 60deg, rgb(255, 195, 73) 90deg, transparent 91deg);
  animation: scan 4s infinite linear;
}

@keyframes pulse {
  0% { transform: scale(0.1); opacity: 1; }
  100% { transform: scale(3); opacity: 0; }
}

@keyframes scan {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Radar Focused State */
:deep(.radar-icon.focused .radar-pulse) {
  border: 4px solid rgba(220, 53, 69, 1);
  animation: pulse-fast 1.5s infinite ease-out;
}

:deep(.radar-icon.focused .radar-scan) {
  background: conic-gradient(from 0deg, transparent 0deg, rgba(220, 53, 69, 0.4) 60deg, rgb(255, 195, 73) 90deg, transparent 91deg);
  animation: scan 2s infinite linear;
}

@keyframes pulse-fast {
  0% { transform: scale(0.1); opacity: 1; }
  100% { transform: scale(1.5); opacity: 0; }
}

/* Transiciones de Vue */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease-out;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}
</style>