import api from '@/utils/http'

export async function fetchPlagasMap() {
    const { data } = await api.get('/plagas/mapa')
    return data
}

export async function fetchPlagasCatalog() {
    const { data } = await api.get('/plagas/catalogo')
    return data
}
