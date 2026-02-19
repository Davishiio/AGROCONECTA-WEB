import api from '@/utils/http.js'

// 1. Listar Productos (General)
export async function fetchProducts(params = {}) {
    const { data } = await api.get('/products', { params })
    return data
}

// 1.1 Mis Productos (Endpoint dedicado)
export async function fetchMyProducts() {
    const { data } = await api.get('/my-products')
    return data
}

// 2. Detalle de Producto
export async function fetchProductDetail(id) {
    const { data } = await api.get(`/products/${id}`)
    return data
}

// 3. Publicar Producto
export async function createProduct(payload) {
    const { data } = await api.post('/products', payload)
    return data
}

// 4. Actualizar Producto
export async function updateProduct(id, payload) {
    if (payload instanceof FormData) {
        payload.append('_method', 'PUT')
        const { data } = await api.post(`/products/${id}`, payload)
        return data
    }
    const { data } = await api.put(`/products/${id}`, payload)
    return data
}

// 5. Eliminar Producto
export async function deleteProduct(id) {
    const { data } = await api.delete(`/products/${id}`)
    return data
}

// 6. Mi Perfil de Vendedor
export async function fetchMyVendorProfile() {
    const { data } = await api.get('/my-vendor-profile')
    return data
}

export async function updateMyVendorProfile(payload) {
    // User specified POST for update with Multipart
    const { data } = await api.post('/my-vendor-profile', payload)
    return data
}

// 7. Categorías
export async function fetchCategories() {
    const { data } = await api.get('/categories')
    return data
}

// 8. Municipios (Proxy a existente o directo)
export async function fetchMunicipios(params = {}) {
    const { data } = await api.get('/municipios', { params })
    return data
}
