// src/router/index.js  (o donde definas tus rutas)
import { createRouter, createWebHistory } from 'vue-router'

// Lazy imports
const AdminLayout               = () => import('@/pages/admin/AdminLayout.vue')
const AdminHome                 = () => import('@/pages/admin/AdminHome.vue')
const ConvocatoriasCategories   = () => import('@/pages/admin/ConvocatoriasCategories.vue')
const ConvocatoriasList         = () => import('@/pages/admin/ConvocatoriasList.vue')
const ConvocatoriaDetalle       = () => import('@/pages/admin/ConvocatoriaDetalle.vue')

const router = createRouter({
    history: createWebHistory(),
    routes: [
        // ...tus otras rutas (login, público, etc.)

        {
            path: '/admin',
            component: AdminLayout,
            children: [
                { path: '', name: 'admin-home', component: AdminHome },

                // Convocatorias flujo: Categoría -> Lista -> Detalle
                { path: 'convocatorias', name: 'admin-convocatorias-categorias', component: ConvocatoriasCategories },
                { path: 'convocatorias/:idCategoria', name: 'admin-convocatorias-list', component: ConvocatoriasList, props: true },
                { path: 'convocatorias/:idCategoria/:idConvocatoria', name: 'admin-convocatoria-detalle', component: ConvocatoriaDetalle, props: true },
            ],
        },
    ],
})

export default router
