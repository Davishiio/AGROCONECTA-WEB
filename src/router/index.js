import { createRouter, createWebHistory } from 'vue-router'

// Lazy imports
const AdminLogin       = () => import('@/pages/AdminLogin.vue')
const AdminLayout      = () => import('@/pages/admin/AdminLayout.vue')
const AdminHome        = () => import('@/pages/admin/AdminHome.vue')
const ConvocCategories = () => import('@/pages/admin/ConvocatoriasCategories.vue')
const ConvocList       = () => import('@/pages/admin/ConvocatoriasList.vue')

const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', redirect: '/admin/login' },

        { path: '/admin/login', name: 'admin-login', component: AdminLogin, meta: { guestOnly: true } },

        {
            path: '/admin',
            component: AdminLayout,
            meta: { requiresAuth: true, requiresAdmin: true },
            children: [
                { path: '', name: 'admin-home', component: AdminHome },
                { path: 'convocatorias/categorias', name: 'admin-convocatorias-categories', component: ConvocCategories },
                { path: 'convocatorias/:idCategoria', name: 'admin-convocatorias-list', component: ConvocList, props: true },
                {
                    path: 'convocatorias/:idCategoria/detalle/:idConvocatoria',
                    name: 'admin-convocatoria-detalle',
                    component: () => import('../pages/admin/ConvocatoriaDetalle.vue'),
                    props: true
                },

            ]
        },

        { path: '/:pathMatch(.*)*', redirect: '/admin/login' }
    ]
})

export default router
