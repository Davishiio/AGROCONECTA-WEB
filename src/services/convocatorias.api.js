// src/services/convocatorias.api.js
import api from '@/utils/http.js'

let _summaryCache = null
let _summaryCacheAt = 0
let _summaryController = null
const TTL = 60_000

export async function fetchAllConvocatoriasSummary({ force = false, signal } = {}) {
    const now = Date.now()
    if (!force && _summaryCache && (now - _summaryCacheAt) < TTL) return _summaryCache

    if (_summaryController) {
        try { _summaryController.abort() } catch {}
        _summaryController = null
    }
    const controller = new AbortController()
    _summaryController = controller
    const effectiveSignal = signal || controller.signal

    const { data } = await api.get('/convocatorias/allConvocatorias', { signal: effectiveSignal })
    _summaryCache = data
    _summaryCacheAt = now
    _summaryController = null
    return data
}

export async function fetchCategorias() {
    const { data } = await api.get('/categorias')
    return data
}

export async function fetchConvocatoriasActivasByCategoria(idCategoria) {
    const { data } = await api.get(`/convocatorias/${idCategoria}/convocatorias-activas`)
    return {
        items: data?.convocatorias ?? data?.items ?? [],
        total: data?.total ?? (Array.isArray(data?.convocatorias) ? data.convocatorias.length : 0),
    }
}

/**
 * Obtiene el detalle completo de una convocatoria.
 * Maneja el caso donde el backend devuelve un array [{...}] en lugar de un objeto directo.
 */
export async function fetchConvocatoriaDetalle(idConvocatoria) {
    // Endpoint: /api/modalidades/{id}/convocatorias
    try {
        const { data } = await api.get(`/modalidades/${idConvocatoria}/convocatorias`)

        // Si es un array y tiene elementos, devolvemos el primero
        if (Array.isArray(data) && data.length > 0) {
            return data[0]
        }
        // Si ya es un objeto, lo devolvemos
        if (data && !Array.isArray(data)) {
            return data
        }

        throw new Error('Formato de respuesta no reconocido')
    } catch (error) {
        // Fallback opcional por si la ruta de modalidades falla
        console.warn("Intentando ruta alternativa de detalle...", error)
        // Aquí podrías poner el fallback a /convocatorias/{idCategoria}/... si tuvieras el idCategoria a mano
        throw error
    }
}

export async function createCategoria(payload) {
    const { data } = await api.post('/categorias-programa', payload)
    return data
}

/**
 * Obtiene las convocatorias aplicables para la comunidad del beneficiario.
 * @param {Number} idComunidad
 */
export async function fetchConvocatoriasAplicables(idComunidad) {
    // Endpoint: /api/convocatorias/aplicables?comunidad=15
    const { data } = await api.get('/convocatorias/aplicables', {
        params: { comunidad: idComunidad }
    })
    return data
}
/**
 * Obtiene los requisitos específicos de una convocatoria para subir archivos.
 * Endpoint: /api/convocatorias/{id}/requisitos
 */

export async function fetchRequisitosConvocatoria(idConvocatoria) {
    const { data } = await api.get(`/convocatorias/${idConvocatoria}/requisitos`)
    return data
}

/**
 * Envía la postulación con los archivos adjuntos.
 * Se usa FormData para enviar archivos binarios.
 */
export async function submitPostulacion(idConvocatoria, archivosMap) {
    // 1. Validación preventiva
    if (!idConvocatoria) {
        throw new Error("El ID de la convocatoria es inválido o nulo.");
    }

    const formData = new FormData()

    // Agregamos el ID también al cuerpo por si acaso el backend lo busca ahí
    formData.append('idConvocatoria', idConvocatoria)

    // 2. Iteramos los archivos y los agregamos con la clave correcta: documentos[ID]
    Object.keys(archivosMap).forEach(idRequisito => {
        const file = archivosMap[idRequisito]
        // Esta clave debe coincidir con lo que tu Controller de Laravel espera (validate 'documentos.*')
        formData.append(`documentos[${idRequisito}]`, file)
    })

    // Debug: Ver qué estamos enviando
    console.log(`[API] Enviando POST a: /convocatorias/${idConvocatoria}/aplicar`)

    // 3. Petición POST
    const { data } = await api.post(`/convocatorias/${idConvocatoria}/aplicar`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
    return data
}