import api from '@/utils/http.js'

/**
 * Obtiene la lista de todos los municipios del estado.
 */
export async function fetchMunicipios() {
    const { data } = await api.get('/municipios')
    return data
}

/**
 * Obtiene las comunidades pertenecientes a un municipio específico.
 * @param {Number|String} idMunicipio
 */
export async function fetchComunidadesByMunicipio(idMunicipio) {
    if (!idMunicipio) return []
    const { data } = await api.get(`/municipios/${idMunicipio}/comunidades`)
    return data
}