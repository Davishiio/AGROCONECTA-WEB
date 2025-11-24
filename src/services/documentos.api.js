import api from '@/utils/http.js'

/**
 * Obtiene todos los documentos del beneficiario logueado.
 * Endpoint: GET /api/misDocumentos
 */
export async function fetchMisDocumentos() {
    const { data } = await api.get('/misDocumentos')
    // La respuesta es { total_documentos: 6, data: [...] }
    return data.data || []
}