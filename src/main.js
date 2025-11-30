import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './assets/login.css'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)

import { useAuthStore } from '@/stores/auth'

router.beforeEach((to) => {
    const auth = useAuthStore()

    // 1. Si el usuario ya está logueado y trata de ir al login, mándalo a su home
    if (to.meta?.guestOnly && auth.isAuthenticated) {
        return { name: auth.isAdmin ? 'admin-home' : 'beneficiario-home' }
    }

    // 2. Rutas protegidas
    if (to.meta?.requiresAuth) {
        // A) No tiene token -> Al login correspondiente
        if (!auth.isAuthenticated) {
            if (to.meta?.requiresAdmin) return { name: 'admin-login' }
            // Por defecto al de beneficiario
            return { name: 'beneficiario-login' }
        }

        // B) Tiene token, validamos roles
        if (to.meta?.requiresAdmin && !auth.isAdmin) {
            // Si intenta entrar a admin pero no es admin
            return { name: 'beneficiario-home' }
        }
        if (to.meta?.requiresBeneficiario && !auth.isBeneficiario) {
            // Si intenta entrar a beneficiario pero es admin
            return { name: 'admin-home' }
        }

    }
})

app.mount('#app')