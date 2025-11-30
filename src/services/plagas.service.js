import api from '@/utils/http'
import axios from 'axios'

export default {
    // --- USUARIO ---

    getCreateOptions() {
        return api.get('/plagas/reportes/create')
    },

    createReport(formData) {
        return api.post('/plagas/reportes', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
    },

    getUserReports() {
        return api.get('/plagas/reportes')
    },

    addFollowUp(reportId, data) {
        return api.post(`/plagas/reportes/${reportId}/seguimiento`, data)
    },

    getAlerts() {
        return api.get('/plagas/alertas')
    },

    // --- ADMIN ---

    getAdminReports(params = {}) {
        return api.get('/plagas/admin/reportes', { params })
    },

    getAdminReportDetails(id) {
        return api.get(`/plagas/admin/reportes/${id}`)
    },

    // NUEVO: Obtener catálogo de plagas para validación
    getCatalogo() {
        return api.get('/plagas/catalogo')
    },

    analyzeReport(id) {
        return api.post(`/plagas/admin/reportes/${id}/analizar`)
    },

    analyzeEvidenceDirect(params) {
        // params: { tipo: 'Foto'|'Texto'..., url: '...', text_content: '...' }
        return axios.post('http://127.0.0.1:8001/analizar', params)
    },

    validateReport(id, data) {
        return api.post(`/plagas/admin/reportes/${id}/validar`, data)
    }
}