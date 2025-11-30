import api from '@/utils/http'

export default {
    // Dashboard resumen
    getResumen() {
        return api.get('/admin/resumen')
    },

    // Solicitudes
    getSolicitudes() {
        return api.get('/admin/solicitudes')
    },

    // Parcelas pendientes de validación
    getParcelasPorRevisar() {
        return api.get('/admin/parcelas/no-activas')
    },

    // Mapa Global
    getParcelasActivasGeo() {
        return api.get('/parcelas/activas-geo')
    },

    // Obtener detalle completo (Beneficiario + Datos) al hacer click
    getDetalleParcela(id) {
        return api.get(`/parcelas/${id}/beneficiario`)
    },

    /**
     * Validar Parcela/Documento
     * CORRECCIÓN FINAL:
     * 1. Ruta correcta: '/parcelas/validar' (ya confirmamos que llega al controlador).
     * 2. Llaves en camelCase (idParcela, idDocumento) para coincidir con $request->validate() de Laravel.
     */
    validarParcela(idParcela, idDocumento, status, observaciones = '') {
        return api.post('/parcelas/validar', {
            idParcela: idParcela,     // Corrección: camelCase para coincidir con el backend
            idDocumento: idDocumento, // Corrección: camelCase para coincidir con el backend
            status: status,
            observaciones: observaciones
        })
    },

    getDocumentosBeneficiario(curp) {
        return api.get(`/admin/beneficiarios/${curp}/documentos`)
    },

    updateDocumentosStatus(updates) {
        return api.patch('/documentos/estados', { updates })
    }
}