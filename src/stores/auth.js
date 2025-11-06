// src/stores/auth.js
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
        isAdmin: (s) => s.user?.role === 'admin',
    },
    actions: {
        async login(email, password) {
            const { data } = await api.post('/admin/login', { email, password })
            this.token = data.token
            this.user  = data.user
            localStorage.setItem('token', this.token)
            localStorage.setItem('user', JSON.stringify(this.user))
            router.replace('/admin')
        },
        async checkStatus() {
            if (!this.token) throw new Error('No token')
            const { data } = await api.get('/admin/check-status')
            if (!data.valid) throw new Error('invalid')
            this.user = data.user
            localStorage.setItem('user', JSON.stringify(this.user))
            return true
        },
        logout() {
            this.token = null
            this.user  = null
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            router.replace('/admin/login')
        },
    },
})
