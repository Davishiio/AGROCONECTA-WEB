import api from '@/utils/http.js'

/**
 * Obtiene la lista actualizada de parcelas del beneficiario.
 * Endpoint: GET /mis-parcelas
 * Retorna: Array de objetos parcela.
 */
export async function fetchMisParcelas() {
    try {
        const { data } = await api.get('/mis-parcelas')
        // La API retorna: { count: 1, data: [ ... ] }
        // Axios entrega el cuerpo en 'data', así que accedemos a data.data
        return data.data || []
    } catch (error) {
        console.error("Error obteniendo parcelas:", error)
        return []
    }
}

/**
 * Registra una nueva parcela asociada al beneficiario.
 * Requiere FormData para el archivo.
 * * Payload esperado:
 * - idParcelaGeo (int)
 * - nombreParcela (string)
 * - documento (File)
 */
export async function registrarParcela(payload) {
    const formData = new FormData()

    // Compatibilidad de nombres de campos esperados por el backend
    const idGeo = Number(payload.idParcelaGeo)
    const nombre = payload.nombreParcela
    const archivo = payload.documento

    // IDs posibles
    if (idGeo) {
        formData.append('idParcelaGeo', String(idGeo))
        formData.append('id_parcela_geo', String(idGeo)) // alias frecuente en Laravel
    }
    // Nombre posibles
    if (nombre) {
        formData.append('nombreParcela', nombre)
        formData.append('nombre', nombre)
    }
    // Archivo posibles
    if (archivo) {
        formData.append('documento', archivo)
        formData.append('archivo', archivo)
        formData.append('file', archivo)
    }

    const { data } = await api.post('/parcela/registrar', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
    return data
}