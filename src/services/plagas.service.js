import api from '@/utils/http'
import axios from 'axios'

// Configuración de la URL de la IA
// Asegúrate de que esta IP sea la de tu máquina backend
const AI_SERVER_URL = 'http://192.168.3.21:8001';

export default {
    // ===========================
    // --- USUARIO (Reportes) ---
    // ===========================

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

    // ===========================
    // --- ADMIN (Gestión) ---
    // ===========================

    getAdminReports(params = {}) {
        return api.get('/plagas/admin/reportes', { params })
    },

    getAdminReportDetails(id) {
        return api.get(`/plagas/admin/reportes/${id}`)
    },

    getCatalogo() {
        return api.get('/plagas/catalogo')
    },

    // ===========================
    // --- ANÁLISIS (IA) ---
    // ===========================

    analyzeReport(id) {
        return api.post(`/plagas/admin/reportes/${id}/analizar`)
    },

    // Conexión directa al servidor de IA (Python/FastAPI)
    analyzeEvidenceDirect(params) {
        // params: { tipo: 'Foto'|'Texto'|'Video', url: '...', text_content: '...' }
        // CORREGIDO: Apuntar explícitamente al puerto 8001 definido en Python
        return axios.post(`${AI_SERVER_URL}/analizar/plagas`, params)
    },

    validateReport(id, data) {
        return api.post(`/plagas/admin/reportes/${id}/validar`, data)
    },

    // ===========================
    // --- MAPA (Visualización) ---
    // ===========================

    getReportesValidados() {
        return api.get('/plagas/reportes-validados')
    },

    getReportesFiltrados(params) {
        return api.get('/plagas/reportes-filtrados', { params })
    }
}