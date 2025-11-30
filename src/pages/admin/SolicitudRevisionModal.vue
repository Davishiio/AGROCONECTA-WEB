<script setup>
import { ref, computed, watch } from 'vue'
import adminApi from '@/services/admin.service'

const props = defineProps({
  show: Boolean,
  solicitud: Object
})

const emit = defineEmits(['close', 'success'])

// Estados locales
const submitting = ref(false)
const docReviews = ref([]) // Copia local para editar estados y observaciones

// Inicializar datos cuando cambia la solicitud
watch(() => props.solicitud, (newVal) => {
  if (newVal && newVal.requisitos) {
    console.log("Cargando solicitud en modal:", newVal); // DEBUG: Ver qué llega
    // Mapeamos solo los requisitos que tienen archivo cargado
    docReviews.value = newVal.requisitos
        .filter(r => r.archivo_cargado)
        .map(r => ({
          idRequisito: r.requisito.id,
          nombreRequisito: r.requisito.nombre,
          obligatorio: r.requisito.obligatorio,
          // Datos del documento (Aseguramos que idDocumento sea número)
          idDocumento: Number(r.archivo_cargado.idDocumento || r.archivo_cargado.id || 0),
          nombreArchivo: r.archivo_cargado.nombre_archivo || r.archivo_cargado.nombre_original || 'Archivo',
          url: r.archivo_cargado.url || r.archivo_cargado.ruta_archivo,
          // Estado editable
          estado: r.archivo_cargado.estado || 'Pendiente',
          // CAMBIO: Usamos 'comentarios' en lugar de 'observaciones'
          comentarios: r.archivo_cargado.comentarios || '',
          // Control de UI
          isModified: false
        }))
  } else {
    docReviews.value = []
  }
}, { immediate: true })

// Acciones de UI
const setStatus = (doc, status) => {
  doc.estado = status
  doc.isModified = true
  // Limpiar comentarios si se valida
  if (status === 'Validado') {
    doc.comentarios = '' // CAMBIO: Usamos 'comentarios'
  }
}

const abrirDocumento = (url) => {
  if (url) window.open(url, '_blank')
}

// Guardar cambios (Dictaminar)
const handleSave = async () => {
  // 1. Preparamos el array de cambios, asegurando tipos de datos correctos
  const listaCambios = docReviews.value.map(d => ({
    idDocumento: Number(d.idDocumento),
    estado: d.estado,
    // CAMBIO: Enviamos el campo 'comentarios' al backend
    comentarios: d.comentarios || null
  }))

  if (listaCambios.length === 0) {
    emit('close')
    return
  }

  // DEBUG: Ver qué estamos enviando exactamente
  // Enviamos el array directo para evitar doble wrapping si el servicio ya lo hace
  console.log("Enviando payload (Array Directo):", JSON.stringify(listaCambios, null, 2));

  submitting.value = true
  try {
    // CORRECCIÓN: Enviamos el arreglo directo.
    // Asegúrate de que tu admin.service.js o el backend manejen este payload correctamente.

    await adminApi.updateDocumentosStatus(listaCambios)

    emit('success')
    emit('close')
  } catch (error) {
    console.error("Error al dictaminar:", error)

    // MEJORA: Mostrar errores de validación específicos del Backend
    if (error.response && error.response.status === 422 && error.response.data.errors) {
      const errores = error.response.data.errors;
      let mensaje = "Error de validación:\n";
      // Recorremos los errores para mostrarlos claramente
      Object.keys(errores).forEach(key => {
        // Limpiamos el nombre del campo para que sea más legible (updates.0.idDocumento -> Documento 1)
        const campo = key.replace('updates.', 'Ítem ').replace('.idDocumento', ' ID');
        mensaje += `- ${campo}: ${errores[key][0]}\n`;
      });
      alert(mensaje);
    } else {
      const msg = error.response?.data?.message || "Hubo un error al guardar la revisión."
      alert(msg)
    }
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div v-if="show" class="modal-backdrop fade show" style="z-index: 1050;"></div>

  <div v-if="show" class="modal fade show d-block" tabindex="-1" role="dialog" style="z-index: 1055;">
    <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content border-0 shadow-lg rounded-4">

        <!-- Header -->
        <div class="modal-header border-bottom px-4 py-3 bg-light rounded-top-4">
          <div>
            <h5 class="modal-title fw-bold text-agro-navy">
              <i class="bi bi-clipboard-check me-2"></i>Dictaminar Expediente
            </h5>
            <div class="text-muted small mt-1" v-if="solicitud?.beneficiario">
              Solicitante: <strong>{{ solicitud.beneficiario.nombre }}</strong> | Folio: #{{ solicitud.idSolicitud }}
            </div>
          </div>
          <button type="button" class="btn-close" @click="$emit('close')" :disabled="submitting"></button>
        </div>

        <!-- Body -->
        <div class="modal-body p-0 bg-light bg-opacity-10">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="bg-light text-secondary small text-uppercase">
              <tr>
                <th class="ps-4 py-3" style="width: 25%;">Requisito</th>
                <th style="width: 20%;">Documento</th>
                <th style="width: 25%;">Dictamen</th>
                <th class="pe-4" style="width: 30%;">Observaciones</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="doc in docReviews" :key="doc.idDocumento" :class="{'bg-warning bg-opacity-10': doc.estado === 'Pendiente'}">

                <!-- Columna Requisito -->
                <td class="ps-4">
                  <div class="fw-bold text-dark mb-1">{{ doc.nombreRequisito }}</div>
                  <span v-if="doc.obligatorio" class="badge bg-secondary bg-opacity-10 text-secondary border">Obligatorio</span>
                  <!-- DEBUG ID -->
                  <div class="text-muted x-small opacity-50">ID Doc: {{ doc.idDocumento }}</div>
                </td>

                <!-- Columna Archivo -->
                <td>
                  <div class="d-flex align-items-center gap-2">
                    <button class="btn btn-sm btn-outline-primary bg-white" @click="abrirDocumento(doc.url)" title="Ver archivo">
                      <i class="bi bi-eye"></i>
                    </button>
                    <div class="text-truncate small" style="max-width: 150px;" :title="doc.nombreArchivo">
                      {{ doc.nombreArchivo }}
                    </div>
                  </div>
                </td>

                <!-- Columna Estado (Botones) -->
                <td>
                  <div class="btn-group btn-group-sm w-100 shadow-sm" role="group">
                    <!-- Validar -->
                    <input type="radio" class="btn-check" :name="'status-'+doc.idDocumento" :id="'val-'+doc.idDocumento"
                           :checked="doc.estado === 'Validado'" @change="setStatus(doc, 'Validado')">
                    <label class="btn btn-outline-success" :for="'val-'+doc.idDocumento">
                      <i class="bi bi-check-lg"></i>
                    </label>

                    <!-- Subsanar -->
                    <input type="radio" class="btn-check" :name="'status-'+doc.idDocumento" :id="'sub-'+doc.idDocumento"
                           :checked="doc.estado === 'Subsanar'" @change="setStatus(doc, 'Subsanar')">
                    <label class="btn btn-outline-warning" :for="'sub-'+doc.idDocumento" title="Solicitar corrección">
                      <i class="bi bi-arrow-counterclockwise"></i>
                    </label>

                    <!-- Rechazar -->
                    <input type="radio" class="btn-check" :name="'status-'+doc.idDocumento" :id="'rec-'+doc.idDocumento"
                           :checked="doc.estado === 'Rechazado'" @change="setStatus(doc, 'Rechazado')">
                    <label class="btn btn-outline-danger" :for="'rec-'+doc.idDocumento">
                      <i class="bi bi-x-lg"></i>
                    </label>
                  </div>

                  <div class="mt-1 text-center">
                        <span class="badge rounded-pill"
                              :class="{
                            'bg-success': doc.estado === 'Validado',
                            'bg-warning text-dark': doc.estado === 'Subsanar',
                            'bg-danger': doc.estado === 'Rechazado',
                            'bg-secondary': doc.estado === 'Pendiente'
                          }">
                          {{ doc.estado }}
                        </span>
                  </div>
                </td>

                <!-- Columna Observaciones / Comentarios -->
                <td class="pe-4">
                  <!-- CAMBIO: v-model apuntando a doc.comentarios -->
                  <textarea
                      v-if="doc.estado !== 'Validado'"
                      v-model="doc.comentarios"
                      class="form-control form-control-sm"
                      rows="2"
                      placeholder="Motivo del rechazo o corrección..."
                  ></textarea>
                  <span v-else class="text-muted small fst-italic">
                      <i class="bi bi-check-circle-fill text-success me-1"></i> Documento correcto
                    </span>
                </td>
              </tr>

              <!-- Fallback si no hay documentos cargados -->
              <tr v-if="docReviews.length === 0">
                <td colspan="4" class="text-center py-5 text-muted">
                  No hay documentos cargados para revisar en esta solicitud.
                </td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Footer -->
        <div class="modal-footer bg-light border-top-0 rounded-bottom-4">
          <button type="button" class="btn btn-light text-secondary fw-medium" @click="$emit('close')" :disabled="submitting">
            Cancelar
          </button>
          <button type="button" class="btn btn-primary px-4 fw-bold shadow-sm" @click="handleSave" :disabled="submitting || docReviews.length === 0">
            <span v-if="submitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            <span v-else><i class="bi bi-save me-2"></i> Guardar Dictamen</span>
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop { opacity: 0.5; background-color: #000; }
textarea.form-control { resize: none; font-size: 0.85rem; }
.x-small { font-size: 0.7rem; }
</style>