import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// Bootstrap (si lo usas)
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './assets/login.css'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)

// 👉 Guards después de instalar Pinia y Router
import { useAuthStore } from '@/stores/auth'
router.beforeEach(async (to) => {
    const auth = useAuthStore()

    if (to.meta?.guestOnly && auth.isAuthenticated) {
        return { name: auth.isAdmin ? 'admin-home' : 'beneficiario-home' }
    }

    if (to.meta?.requiresAuth) {
        if (!auth.isAuthenticated) {
            if (to.meta?.requiresAdmin) return { name: 'admin-login' }
            if (to.meta?.requiresBeneficiario) return { name: 'beneficiario-login' }
            // por defecto, enviamos al login de beneficiario
            return { name: 'beneficiario-login' }
        }

        // Opcional: validación con backend (si te estaba rompiendo, coméntalo por ahora)
        try {
            await auth.checkStatus()
        } catch {
            return { name: to.meta?.requiresAdmin ? 'admin-login' : 'beneficiario-login' }
        }

        if (to.meta?.requiresAdmin && !auth.isAdmin) return { name: 'admin-login' }
        if (to.meta?.requiresBeneficiario && !auth.isBeneficiario) return { name: 'beneficiario-login' }
    }
})

app.mount('#app')
