import { defineStore } from 'pinia'
import api from '@/utils/http'

// ¡IMPORTANTE! NO importamos router aquí para evitar el ciclo infinito.

export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: localStorage.getItem('token') || null,
        user: JSON.parse(localStorage.getItem('user') || 'null'),
        role: localStorage.getItem('last_role') || null
    }),
    getters: {
        isAuthenticated: (s) => !!s.token,
        isAdmin: (s) => s.role === 'admin',
        isBeneficiario: (s) => s.role === 'beneficiario',
    },
    actions: {
        // Login Admin
        async login(email, password) {
            const { data } = await api.post('/admin/login', { email, password })
            // Guardamos sesión pero NO redirigimos aquí
            this.setSession(data.token, data.user, 'admin')
            return true
        },

        // Login Beneficiario
        async loginBeneficiario(CURP, password) {
            const { data } = await api.post('/login', { CURP, password })
            const user = { ...data, role: 'beneficiario' } // Ajuste por si el back no manda rol
            this.setSession(data.token, user, 'beneficiario')
            return true
        },

        // Registro
        async registerBeneficiario(payload) {
            const { data } = await api.post('/register', payload)
            if (data.token) {
                const user = { ...data, role: 'beneficiario' }
                this.setSession(data.token, user, 'beneficiario')
                return true
            }
            return false
        },

        logout() {
            this.token = null
            this.user = null
            this.role = null
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            localStorage.removeItem('last_role')
        },

        setSession(token, user, roleName) {
            this.token = token
            this.user = user
            this.role = roleName
            localStorage.setItem('token', token)
            localStorage.setItem('user', JSON.stringify(user))
            localStorage.setItem('last_role', roleName)
        }
    },
})