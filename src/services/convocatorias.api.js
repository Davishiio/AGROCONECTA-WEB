// src/services/convocatorias.api.js
import api from '@/utils/http'

export const fetchCategorias = async () => {
    // GET /api/categorias  -> { count, data: [ ... ] }
    const { data } = await api.get('/categorias')
    return data
}
export const fetchAllConvocatoriasSummary = async () => {
    const { data } = await api.get('/convocatorias/allConvocatorias')
    // data = { categorias: [...], totalCategorias: N, totalConvocatorias: M }
    return data
}
export const fetchConvocatoriasActivasByCategoria = async (idCategoria) => {
    // GET /api/convocatorias/:idCategoria/convocatorias-activas
    const { data } = await api.get(`/convocatorias/${idCategoria}/convocatorias-activas`)
    return {
        items: data.convocatorias ?? [],
        total: data.total ?? (data.convocatorias?.length ?? 0),
    }
}

//GET /api/convocatorias/:idCategoria/convocatoria/:idConvocatoria
export const fetchConvocatoriaDetalle = async (idCategoria, idConvocatoria) => {
    const { data } = await api.get(`/convocatorias/${idCategoria}/convocatoria/${idConvocatoria}`)
    return data
}
export const createCategoria = async (payload) => {
    // payload: { nombreCategoria, descripcionCategoria, icono, orden }
    const { data } = await api.post('/categorias', payload);
    return data;
};