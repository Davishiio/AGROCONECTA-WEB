import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
})

// se usa localStorage aquí;
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

api.interceptors.response.use(
    (r) => r,
    (error) => {
        if ([401, 403, 419].includes(error?.response?.status)) {
            // fallback seguro sin store (evita dependencia circular)
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            // redirige al login según último rol
            const lastRole = localStorage.getItem('last_role')
            const target = lastRole === 'beneficiario' ? '/login' : '/admin/login'
            if (window.location.pathname !== target) {
                window.location.href = target
            }
        }
        return Promise.reject(error)
    }
)

export default api
