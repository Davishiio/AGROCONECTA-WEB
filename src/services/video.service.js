import api from '@/utils/http'
import axios from 'axios'

export default {
    getVideosValidados() {
        return api.get('/admin/solicitudes/validadas-tipo14')
    },

    // RUTA ESPECÍFICA PARA MENTORÍA
    analyzeVideo(params) {
        // params: { url: '...' }
        return axios.post('http://192.168.3.21:8000/analizar/mentor', params)
    },

    saveAnalysis(data) {
        return api.post('/video-analisis', data)
    },

    getAnalysis(idDocumento) {
        return api.get(`/video-analisis/${idDocumento}`)
    }
}