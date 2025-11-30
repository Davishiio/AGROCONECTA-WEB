import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// --- Lazy Imports ---

// Auth & Public
const AdminLogin = () => import('@/pages/AdminLogin.vue')
const BeneficiarioLogin = () => import('@/pages/BeneficiarioLogin.vue')
const BeneficiarioRegister = () => import('@/pages/BeneficiarioRegister.vue')

// Admin Panel
const AdminLayout = () => import('@/pages/admin/AdminLayout.vue')
const AdminHome = () => import('@/pages/admin/AdminHome.vue')
const AdminSolicitudes = () => import('@/pages/admin/AdminSolicitudes.vue')
const AdminParcelas = () => import('@/pages/admin/AdminParcelas.vue')
const ConvocatoriasCategories = () => import('@/pages/admin/ConvocatoriasCategories.vue')
const ConvocatoriasList = () => import('@/pages/admin/ConvocatoriasList.vue')
const ConvocatoriaDetalle = () => import('@/pages/admin/ConvocatoriaDetalle.vue')
const VideoAnalyzer = () => import('@/pages/admin/VideoAnalyzer.vue')
const AdminPlagas = () => import('@/pages/admin/AdminPlagas.vue')

// Beneficiario Panel
const BeneficiarioHome = () => import('@/pages/beneficiario/BeneficiarioHome.vue')

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            redirect: '/login'
        },
        // --- AUTH ROUTES ---
        {
            path: '/admin/login',
            name: 'admin-login',
            component: AdminLogin,
            meta: { guestOnly: true },
        },
        {
            path: '/login',
            name: 'beneficiario-login',
            component: BeneficiarioLogin,
            meta: { guestOnly: true },
        },
        {
            path: '/registro',
            name: 'beneficiario-register',
            component: BeneficiarioRegister,
            meta: { guestOnly: true },
        },

        // --- ADMIN AREA ---
        {
            path: '/admin',
            component: AdminLayout,
            meta: { requiresAuth: true, requiresAdmin: true }, // Protege todo el layout
            children: [
                // Dashboard General
                {
                    path: '',
                    name: 'admin-home',
                    component: AdminHome
                },
                // Nuevas Secciones
                {
                    path: 'solicitudes',
                    name: 'admin-solicitudes',
                    component: AdminSolicitudes
                },
                {
                    path: 'parcelas',
                    name: 'admin-parcelas',
                    component: AdminParcelas
                },
                {
                    path: 'video-analyzer',
                    name: 'admin-video-analyzer',
                    component: VideoAnalyzer
                },
                {
                    path: 'plagas',
                    name: 'admin-plagas',
                    component: AdminPlagas
                },
                // Gestión de Convocatorias (Rutas existentes)
                {
                    path: 'convocatorias',
                    name: 'admin-convocatorias-categorias',
                    component: ConvocatoriasCategories
                },
                {
                    path: 'convocatorias/:idCategoria',
                    name: 'admin-convocatorias-list',
                    component: ConvocatoriasList,
                    props: true
                },
                {
                    path: 'convocatorias/:idCategoria/:idConvocatoria',
                    name: 'admin-convocatoria-detalle',
                    component: ConvocatoriaDetalle,
                    props: true
                },
            ],
        },

        // --- BENEFICIARIO AREA ---
        {
            path: '/beneficiario',
            name: 'beneficiario-home',
            component: BeneficiarioHome,
            meta: { requiresAuth: true, requiresBeneficiario: true },
        },
    ],
})

// --- GLOBAL GUARDS ---
router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore()

    // 1. Redirigir si ya está logueado e intenta entrar a login/registro
    if (to.meta.guestOnly && authStore.token) {
        if (authStore.isAdmin) return next('/admin')
        if (authStore.isBeneficiario) return next('/beneficiario')
    }

    // 2. Proteger rutas que requieren autenticación
    if (to.matched.some(record => record.meta.requiresAuth)) {
        if (!authStore.token) {
            // Si intenta entrar a admin sin token, va al login de admin
            if (to.matched.some(record => record.meta.requiresAdmin)) {
                return next('/admin/login')
            }
            return next('/login')
        }

        // 3. Validar Roles
        if (to.matched.some(record => record.meta.requiresAdmin) && !authStore.isAdmin) {
            return next('/beneficiario') // No tiene permiso, va a su home
        }
        if (to.matched.some(record => record.meta.requiresBeneficiario) && !authStore.isBeneficiario) {
            return next('/admin') // No tiene permiso, va a su home
        }
    }

    next()
})

export default router