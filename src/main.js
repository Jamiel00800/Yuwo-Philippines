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
import AdminDashboard from './views/AdminDashboard.vue'

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
    { path: '/admin', component: AdminDashboard, meta: { requiresAdmin: true } },
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

  return true
})

createApp(App)
  .use(router)
  .mount('#app')
