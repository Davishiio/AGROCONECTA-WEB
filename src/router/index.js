import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth' // Importar el store para usarlo en beforeEach

// Lazy imports
const AdminLogin                = () => import('@/pages/AdminLogin.vue')
const BeneficiarioLogin         = () => import('@/pages/BeneficiarioLogin.vue')
const BeneficiarioRegister      = () => import('@/pages/BeneficiarioRegister.vue') // <-- IMPORTAR AQUÍ
const AdminLayout               = () => import('@/pages/admin/AdminLayout.vue')
const AdminHome                 = () => import('@/pages/admin/AdminHome.vue')
const ConvocatoriasCategories   = () => import('@/pages/admin/ConvocatoriasCategories.vue')
const ConvocatoriasList         = () => import('@/pages/admin/ConvocatoriasList.vue')
const ConvocatoriaDetalle       = () => import('@/pages/admin/ConvocatoriaDetalle.vue')
const BeneficiarioHome          = () => import('@/pages/beneficiario/BeneficiarioHome.vue')

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            redirect: '/login'
        },
        // Ruta de login Admin
        {
            path: '/admin/login',
            name: 'admin-login',
            component: AdminLogin,
            meta: { guestOnly: true },
        },
        // Login de beneficiario
        {
            path: '/login',
            name: 'beneficiario-login',
            component: BeneficiarioLogin,
            meta: { guestOnly: true },
        },
        // --- NUEVA RUTA DE REGISTRO ---
        {
            path: '/registro',
            name: 'beneficiario-register',
            component: BeneficiarioRegister,
            meta: { guestOnly: true },
        },

        // Admin Area
        {
            path: '/admin',
            component: AdminLayout,
            children: [
                { path: '', name: 'admin-home', component: AdminHome, meta: { requiresAuth: true, requiresAdmin: true } },
                { path: 'convocatorias', name: 'admin-convocatorias-categorias', component: ConvocatoriasCategories, meta: { requiresAuth: true, requiresAdmin: true } },
                { path: 'convocatorias/:idCategoria', name: 'admin-convocatorias-list', component: ConvocatoriasList, props: true, meta: { requiresAuth: true, requiresAdmin: true } },
                { path: 'convocatorias/:idCategoria/:idConvocatoria', name: 'admin-convocatoria-detalle', component: ConvocatoriaDetalle, props: true, meta: { requiresAuth: true, requiresAdmin: true } },
            ],
        },

        // Dashboard de beneficiario
        {
            path: '/beneficiario',
            name: 'beneficiario-home',
            component: BeneficiarioHome,
            meta: { requiresAuth: true, requiresBeneficiario: true },
        },
    ],
})

// Guard Global (Ejemplo simple, asegúrate de tener algo similar)
router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore()

    // Si la ruta requiere guest (login/registro) y ya estamos logueados
    if (to.meta.guestOnly && authStore.token) {
        if (authStore.isAdmin) return next('/admin')
        if (authStore.isBeneficiario) return next('/beneficiario')
    }

    // Si requiere auth y no hay token
    if (to.meta.requiresAuth && !authStore.token) {
        return next('/login')
    }

    next()
})

export default router