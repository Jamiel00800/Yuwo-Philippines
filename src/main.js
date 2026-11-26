import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from './lib/supabase'

import App from './App.vue'
import Home from './views/Home.vue'
import Catalog from './views/Catalog.vue'
import Product from './views/Product.vue'
import Articles from './views/Articles.vue'
import Professionals from './views/Professionals.vue'
import Contact from './views/Contact.vue'
import AdminLogin from './views/AdminLogin.vue'
import AdminLayout from './components/AdminLayout.vue'
import AdminDashboard from './views/AdminDashboard.vue'
import AdminProducts from './views/AdminProducts.vue'
import AdminFinance from './views/AdminFinance.vue'
import AdminForms from './views/AdminForms.vue'
import AdminUsers from './views/AdminUsers.vue'

import './style.css'

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    { path: '/', component: Home },
    { path: '/collections/all', component: Catalog },
    { path: '/products/:slug', component: Product },
    { path: '/blogs/articles', component: Articles },
    { path: '/pages/for-professionals', component: Professionals },
    { path: '/pages/contact', component: Contact },
    { path: '/admin/login', component: AdminLogin },
    {
      path: '/admin',
      component: AdminLayout,
      meta: { requiresAdmin: true },
      children: [
        { path: '', component: AdminDashboard, meta: { title: 'Dashboard' } },
        { path: 'products', component: AdminProducts, meta: { title: 'Products' } },
        { path: 'forms', component: AdminForms, meta: { title: 'Forms & inquiries' } },
        { path: 'finance', component: AdminFinance, meta: { title: 'Financial overview', allowedRoles: ['owner', 'admin'] } },
        { path: 'users', component: AdminUsers, meta: { title: 'Users', allowedRoles: ['owner'] } },
        { path: 'articles', redirect: '/admin' },
        { path: 'reviews', redirect: '/admin' },
        { path: 'faqs', redirect: '/admin' },
        { path: 'homepage', redirect: '/admin' }
      ]
    },
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ]
})

router.beforeEach(async to => {
  if (!to.meta.requiresAdmin) return true
  if (!supabase) return { path: '/admin/login', query: { reason: 'config' } }

  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  if (sessionError || !session) {
    return { path: '/admin/login', query: { redirect: to.fullPath } }
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .maybeSingle()

  if (profileError || !profile || !['owner', 'admin', 'editor'].includes(profile.role)) {
    await supabase.auth.signOut()
    return { path: '/admin/login', query: { reason: 'unauthorized' } }
  }

  const allowedRoles = to.meta.allowedRoles
  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    return { path: '/admin', query: { reason: 'forbidden' } }
  }

  return true
})

createApp(App)
  .use(router)
  .mount('#app')
