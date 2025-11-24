import { defineStore } from 'pinia'
import api from '@/utils/http'
import router from '@/router'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: localStorage.getItem('token') || null,
        user: JSON.parse(localStorage.getItem('user') || 'null'),
    }),
    getters: {
        isAuthenticated: (s) => !!s.token,
        isAdmin: (s) => s.user?.role === 'admin' || s.user?.nombreRol === 'admin',
        isBeneficiario: (s) => s.user?.nombreRol === 'beneficiario' || s.user?.role === 'beneficiario',
    },
    actions: {
        async login(email, password) {
            const { data } = await api.post('/admin/login', { email, password })
            this.setSession(data.token, data.user, 'admin')
            router.replace('/admin')
        },
        async loginBeneficiario(CURP, password) {
            const { data } = await api.post('/login', { CURP, password })
            // Ajuste: si el backend devuelve user flat, lo estructuramos
            const user = { ...data, role: data.nombreRol || 'beneficiario' }
            this.setSession(data.token, user, 'beneficiario')
            router.replace('/beneficiario')
        },
        // --- NUEVA ACCIÓN DE REGISTRO ---
        async registerBeneficiario(payload) {
            // payload trae: nombre, apellidos, curp, idComunidad, etc.
            const { data } = await api.post('/register', payload)

            // Opcional: Si el backend devuelve token al registrar, logueamos directo.
            // Si no, redirigimos al login.
            if (data.token) {
                const user = { ...data, role: 'beneficiario' }
                this.setSession(data.token, user, 'beneficiario')
                router.replace('/beneficiario')
            } else {
                // Si requiere confirmación o solo devuelve "ok"
                router.replace('/login')
                return true // indicamos éxito
            }
        },
        async checkStatus() {
            if (!this.token) throw new Error('No token')
            if (this.isAdmin) {
                const { data } = await api.get('/admin/check-status')
                if (!data.valid) throw new Error('invalid')
                this.user = data.user
                localStorage.setItem('user', JSON.stringify(this.user))
                return true
            }
            return true
        },
        logout() {
            this.token = null
            this.user  = null
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            const lastRole = localStorage.getItem('last_role')
            if (lastRole) localStorage.removeItem('last_role')
            router.replace(lastRole === 'beneficiario' ? '/login' : '/admin/login')
        },
        // Helper interno para no repetir código
        setSession(token, user, roleName) {
            this.token = token
            this.user = user
            localStorage.setItem('token', token)
            localStorage.setItem('user', JSON.stringify(user))
            localStorage.setItem('last_role', roleName)
        }
    },
})