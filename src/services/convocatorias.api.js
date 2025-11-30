import api from '@/utils/http.js'

let _summaryCache = null
let _summaryCacheAt = 0
let _summaryController = null
const TTL = 60_000

// Dashboard: Resumen de todas las convocatorias
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

// 1. OBTENER CATEGORÍAS
export async function fetchCategorias() {
    try {
        const { data } = await api.get('/categorias')
        return data
    } catch (error) {
        console.error("Error obteniendo categorías:", error)
        return { count: 0, data: [] }
    }
}

// 2. OBTENER CONVOCATORIAS POR CATEGORÍA
export async function fetchConvocatoriasActivasByCategoria(idCategoria) {
    const { data } = await api.get(`/convocatorias/${idCategoria}/convocatorias-activas`)
    return {
        items: data.convocatorias || [],
        total: data.total || 0
    }
}

// 3. DETALLE DE CONVOCATORIA
export async function fetchConvocatoriaDetalle(idConvocatoria) {
    try {
        const { data } = await api.get(`/convocatorias/${idConvocatoria}`)
        if (Array.isArray(data) && data.length > 0) return data[0]
        if (data && !Array.isArray(data)) return data
        throw new Error('Formato no reconocido')
    } catch (error) {
        throw error
    }
}

// --- ACTUALIZADO: AGRUPADO POR CATEGORÍAS ---
export async function fetchConvocatoriasAplicables(idComunidad) {
    const { data } = await api.get('/convocatorias/allConvocatorias');

    // El backend devuelve: { categorias: [ { nombreCategoria: '...', convocatorias: [...] } ] }
    // Procesamos para devolver solo categorías que tengan convocatorias "Abiertas"

    const categoriasConContenido = (data.categorias || [])
        .map(cat => {
            // 1. Filtramos solo las convocatorias abiertas dentro de esta categoría
            const activas = (cat.convocatorias || []).filter(c => c.estatus === 'Abierta');

            // 2. Devolvemos la categoría con su lista filtrada (y inyectamos el nombreCategoria en los hijos por si acaso)
            return {
                ...cat,
                convocatorias: activas.map(c => ({ ...c, nombreCategoria: cat.nombreCategoria }))
            };
        })
        .filter(cat => cat.convocatorias.length > 0); // 3. Eliminamos categorías vacías

    return categoriasConContenido;
}

export async function fetchRequisitosConvocatoria(idConvocatoria) {
    const { data } = await api.get(`/convocatorias/${idConvocatoria}/requisitos`)
    return data
}

export async function submitPostulacion(idConvocatoria, archivosMap, onUploadProgress) {
    if (!idConvocatoria) throw new Error("ID inválido");

    const formData = new FormData()
    formData.append('idConvocatoria', idConvocatoria)

    Object.keys(archivosMap).forEach(idRequisito => {
        const file = archivosMap[idRequisito]
        formData.append(`documentos[${idRequisito}]`, file)
    })

    const { data } = await api.post(`/convocatorias/${idConvocatoria}/aplicar`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
            if (onUploadProgress && progressEvent.total) {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                onUploadProgress(percentCompleted);
            }
        }
    })
    return data
}

export async function fetchMiSolicitudEnConvocatoria(idConvocatoria) {
    const { data } = await api.get(`/convocatorias/${idConvocatoria}/mis-documentos`)
    return data
}