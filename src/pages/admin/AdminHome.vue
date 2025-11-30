<script setup>
import { ref, onMounted, computed } from 'vue'
import adminApi from '@/services/admin.service'
import { useAuthStore } from '@/stores/auth' // Necesario para el nombre del usuario

const authStore = useAuthStore()
const loading = ref(true)
const stats = ref(null)

// Computado para el saludo
const adminName = computed(() => authStore.user?.nombre || 'Administrador')
// Fecha formateada bonita
const currentDate = new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

const fetchData = async () => {
  try {
    const { data } = await adminApi.getResumen()
    stats.value = data.conteos
  } catch (error) {
    console.error('Error cargando resumen', error)
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)
</script>

<template>
  <div>
    <!-- Hero / Welcome Section -->
    <div class="bg-white rounded-4 shadow-sm p-4 mb-4 border-start border-5 border-success position-relative overflow-hidden">
      <div class="position-relative z-1">
        <h2 class="h4 fw-bold text-dark mb-1">¡Hola, {{ adminName }}! 👋</h2>
        <p class="text-secondary mb-0 text-capitalize">{{ currentDate }}</p>
      </div>

      <!-- Elemento decorativo de fondo: Mazorca (SVG) -->
      <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          class="position-absolute text-success opacity-10"
          style="height: 10rem; width: 10rem; right: -20px; bottom: -40px; transform: rotate(-15deg);"
      >
        <path d="M5.566 4.314A15.96 15.96 0 003.045 11.5a16.037 16.037 0 002.553 8.163c.69-.379 1.487-.272 2.102.164.636.45 1.018 1.18 1.018 1.956 0 .584-.22 1.155-.615 1.597.747.337 1.527.604 2.333.788.175-.436.474-.81.862-1.085.636-.451 1.429-.558 2.12-.271a3.75 3.75 0 012.982-2.31 3.823 3.823 0 011.602.112c.111-.795.163-1.601.163-2.417a16.03 16.03 0 00-1.898-7.616c-.66.36-1.42.275-2.02-.15a2.25 2.25 0 01-.983-1.833c0-.66.248-1.285.683-1.764a15.972 15.972 0 00-6.864-2.836 2.247 2.247 0 01-1.482.387 2.25 2.25 0 01-1.5-.783z" />
        <path d="M7.5 11.25a.75.75 0 111.5 0 .75.75 0 01-1.5 0zM9 13.5a.75.75 0 111.5 0 .75.75 0 01-1.5 0zM10.5 15.75a.75.75 0 111.5 0 .75.75 0 01-1.5 0zM12 18a.75.75 0 111.5 0 .75.75 0 01-1.5 0zM7.5 15a.75.75 0 111.5 0 .75.75 0 01-1.5 0zM9 17.25a.75.75 0 111.5 0 .75.75 0 01-1.5 0zM10.5 12a.75.75 0 111.5 0 .75.75 0 01-1.5 0zM12 14.25a.75.75 0 111.5 0 .75.75 0 01-1.5 0zM13.5 16.5a.75.75 0 111.5 0 .75.75 0 01-1.5 0zM12 10.5a.75.75 0 111.5 0 .75.75 0 01-1.5 0zM13.5 12.75a.75.75 0 111.5 0 .75.75 0 01-1.5 0zM15 15a.75.75 0 111.5 0 .75.75 0 01-1.5 0zM13.5 9a.75.75 0 111.5 0 .75.75 0 01-1.5 0zM15 11.25a.75.75 0 111.5 0 .75.75 0 01-1.5 0zM16.5 13.5a.75.75 0 111.5 0 .75.75 0 01-1.5 0z" />
      </svg>

    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-success" role="status"></div>
      <p class="text-muted mt-2 small">Cargando indicadores...</p>
    </div>

    <div v-else-if="stats">
      <!-- Tarjetas de Métricas -->
      <div class="row g-4 mb-5">
        <!-- Parcelas por revisar (Priority) -->
        <div class="col-md-6 col-xl-4">
          <div class="card border-0 shadow-sm h-100 card-hover-effect">
            <div class="card-body p-4">
              <div class="d-flex justify-content-between align-items-start mb-3">
                <div class="icon-box bg-warning bg-opacity-10 text-warning rounded-4 p-3">
                  <i class="bi bi-exclamation-triangle-fill fs-4"></i>
                </div>
                <div class="dropdown">
                  <button class="btn btn-light btn-sm rounded-circle" type="button"><i class="bi bi-three-dots-vertical"></i></button>
                </div>
              </div>
              <h6 class="text-muted small fw-bold text-uppercase mb-1">Atención Requerida</h6>
              <h2 class="display-6 fw-bold text-dark mb-0">{{ stats.parcelas.por_revisar }}</h2>
              <p class="text-secondary small mb-3">Parcelas pendientes de validación</p>

              <router-link to="/admin/parcelas" class="btn btn-warning btn-sm w-100 fw-bold text-dark rounded-pill">
                <i class="bi bi-search me-1"></i> Revisar ahora
              </router-link>
            </div>
          </div>
        </div>

        <!-- Total Solicitudes -->
        <div class="col-md-6 col-xl-4">
          <div class="card border-0 shadow-sm h-100 card-hover-effect">
            <div class="card-body p-4">
              <div class="d-flex justify-content-between align-items-start mb-3">
                <div class="icon-box bg-primary bg-opacity-10 text-primary rounded-4 p-3">
                  <i class="bi bi-file-earmark-text-fill fs-4"></i>
                </div>
              </div>
              <h6 class="text-muted small fw-bold text-uppercase mb-1">Total Solicitudes</h6>
              <!-- Sumamos el total de las categorías para tener un número global -->
              <h2 class="display-6 fw-bold text-dark mb-0">
                {{ stats.solicitudes_por_categoria.reduce((acc, curr) => acc + curr.total, 0) }}
              </h2>
              <p class="text-secondary small mb-3">Expedientes recibidos</p>

              <router-link to="/admin/solicitudes" class="btn btn-outline-primary btn-sm w-100 fw-bold rounded-pill">
                Ver todas
              </router-link>
            </div>
          </div>
        </div>

        <!-- Parcelas Activas -->
        <div class="col-md-6 col-xl-4">
          <div class="card border-0 shadow-sm h-100 card-hover-effect">
            <div class="card-body p-4">
              <div class="d-flex justify-content-between align-items-start mb-3">
                <div class="icon-box bg-success bg-opacity-10 text-success rounded-4 p-3">
                  <i class="bi bi-geo-alt-fill fs-4"></i>
                </div>
              </div>
              <h6 class="text-muted small fw-bold text-uppercase mb-1">Predios Activos</h6>
              <h2 class="display-6 fw-bold text-dark mb-0">{{ stats.parcelas.activas }}</h2>
              <p class="text-secondary small mb-3">Validados y geolocalizados</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Sección Principal de Datos -->
      <div class="row g-4">
        <!-- Tabla de Convocatorias -->
        <div class="col-lg-8">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-header bg-white border-bottom-0 pt-4 px-4 pb-0 d-flex justify-content-between align-items-center">
              <h5 class="card-title mb-0 fw-bold text-dark">Solicitudes por Convocatoria</h5>
              <router-link to="/admin/convocatorias" class="btn btn-link text-decoration-none btn-sm fw-bold">Gestión <i class="bi bi-arrow-right"></i></router-link>
            </div>
            <div class="card-body p-0">
              <div class="table-responsive p-3">
                <table class="table table-hover align-middle mb-0 custom-table">
                  <thead class="bg-light text-uppercase small text-muted">
                  <tr>
                    <th class="ps-3 border-0 rounded-start">Convocatoria</th>
                    <th class="border-0">Categoría</th>
                    <th class="text-center border-0">Total</th>
                    <th class="text-end pe-3 border-0 rounded-end"></th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr v-for="item in stats.solicitudes_por_convocatoria" :key="item.idConvocatoria">
                    <td class="ps-3 fw-medium text-dark">
                      <div class="d-flex align-items-center">
                        <div class="rounded-circle bg-light p-2 me-2 d-flex justify-content-center align-items-center" style="width:32px; height:32px">
                          <i class="bi bi-hash small text-secondary"></i>
                        </div>
                        <span class="text-truncate" style="max-width: 250px;" :title="item.nombreConvocatoria">{{ item.nombreConvocatoria }}</span>
                      </div>
                    </td>
                    <td><span class="badge bg-light text-secondary border fw-normal">{{ item.nombreCategoria }}</span></td>
                    <td class="text-center">
                      <span class="fw-bold fs-6">{{ item.total }}</span>
                    </td>
                    <td class="text-end pe-3">
                      <router-link :to="{ name: 'admin-solicitudes', query: { convocatoria: item.idConvocatoria } }" class="btn btn-icon btn-light text-primary rounded-circle shadow-sm" title="Ver Solicitudes">
                        <i class="bi bi-arrow-right-short fs-5"></i>
                      </router-link>
                    </td>
                  </tr>
                  <tr v-if="stats.solicitudes_por_convocatoria.length === 0">
                    <td colspan="4" class="text-center py-4 text-muted small">No hay datos registrados aún.</td>
                  </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Resumen por Sector -->
        <div class="col-lg-4">
          <div class="card border-0 shadow-sm h-100 bg-agro-gradient text-white position-relative overflow-hidden">
            <!-- Decorative circle -->
            <div class="position-absolute top-0 end-0 bg-white opacity-10 rounded-circle" style="width: 150px; height: 150px; margin-right: -50px; margin-top: -50px;"></div>

            <div class="card-header bg-transparent border-0 pt-4 px-4 pb-2">
              <h5 class="card-title mb-0 fw-bold">Resumen por Sector</h5>
              <p class="opacity-75 small mb-0">Distribución de apoyos</p>
            </div>
            <div class="card-body px-4">
              <div class="d-flex flex-column gap-3">
                <div v-for="cat in stats.solicitudes_por_categoria" :key="cat.idCategoria" class="bg-white bg-opacity-10 rounded-3 p-3 d-flex align-items-center justify-content-between backdrop-blur">
                  <div class="d-flex align-items-center gap-3">
                    <div class="bg-white text-success rounded-circle p-2 d-flex justify-content-center align-items-center" style="width:36px; height:36px">
                      <i class="bi bi-pie-chart-fill"></i>
                    </div>
                    <span class="fw-medium">{{ cat.nombreCategoria }}</span>
                  </div>
                  <span class="fs-4 fw-bold">{{ cat.total }}</span>
                </div>

                <div v-if="stats.solicitudes_por_categoria.length === 0" class="text-center py-3 opacity-50">
                  Sin actividad reciente
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Gradient para el card de sectores */
.bg-agro-gradient {
  background: linear-gradient(135deg, #198754 0%, #0f5132 100%);
}

.backdrop-blur {
  backdrop-filter: blur(5px);
}

/* Efecto hover suave para tarjetas */
.card-hover-effect {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.card-hover-effect:hover {
  transform: translateY(-5px);
  box-shadow: 0 .5rem 1.5rem rgba(0,0,0,.08)!important;
}

.btn-icon {
  width: 32px;
  height: 32px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* Tabla personalizada */
.custom-table th {
  font-weight: 600;
  letter-spacing: 0.5px;
}
.custom-table tr:hover td {
  background-color: var(--bs-light);
}
</style>