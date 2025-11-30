import api from '@/utils/http'
import axios from 'axios'

export default {
    // 1. Obtener lista desde Laravel
    getVideosValidados() {
        return api.get('/admin/solicitudes/validadas-tipo14')
    },

    // 2. Enviar a Python (Puerto 8001)
    // Acepta { url: '...' } o { file_path: '...' }
    analyzeVideo(params) {
        return axios.post('http://127.0.0.1:8001/analizar', params)
    },

    // 3. Guardar resultado en Laravel
    saveAnalysis(data) {
        return api.post('/video-analisis', data)
    }
}