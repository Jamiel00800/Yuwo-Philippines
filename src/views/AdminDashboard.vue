<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'

const router = useRouter()
const signingOut = ref(false)
async function signOut() {
  signingOut.value = true
  if (supabase) await supabase.auth.signOut()
  router.replace('/admin/login')
}
</script>

<template>
  <div class="min-h-screen bg-[#f5f6f7]">
    <header class="border-b border-yuwo-line bg-white">
      <div class="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8">
        <RouterLink to="/" class="flex flex-col leading-none text-yuwo-navy">
          <span class="font-display text-2xl font-extrabold tracking-[-.08em]">YUWO</span>
          <small class="mt-1 text-[8px] font-bold tracking-[.22em]">ADMINISTRATION</small>
        </RouterLink>
        <div class="flex items-center gap-4">
          <span class="hidden text-xs font-semibold text-yuwo-muted sm:inline">Admin workspace</span>
          <button @click="signOut" :disabled="signingOut" class="border border-yuwo-line px-4 py-2 text-xs font-bold text-yuwo-navy disabled:opacity-50">
            {{ signingOut ? 'Signing out…' : 'Sign out' }}
          </button>
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
      <p class="text-[10px] font-bold tracking-[.18em] text-[#a17c20]">YUWO PHILIPPINES</p>
      <h1 class="mt-2 font-display text-3xl font-extrabold text-yuwo-ink sm:text-4xl">Admin dashboard</h1>
      <p class="mt-3 max-w-2xl text-sm leading-6 text-yuwo-muted">Your storefront management workspace. Choose a section to manage the content customers see on the website.</p>

      <section class="mt-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <RouterLink to="/admin/products" class="border border-yuwo-line bg-white p-6 transition hover:border-yuwo-gold hover:shadow-sm">
          <div class="flex items-start justify-between gap-3">
            <h2 class="font-display text-xl font-bold text-yuwo-ink">Products</h2>
            <span class="shrink-0 bg-[#edf7ef] px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-green-700">Manage now</span>
          </div>
          <p class="mt-3 text-xs leading-6 text-yuwo-muted">Create, edit, publish and archive products, manage variants and upload product images.</p>
          <p class="mt-5 text-[10px] font-bold text-yuwo-navy">Open product management →</p>
        </RouterLink>
        <article v-for="item in [
          { title: 'Reviews', detail: 'Review and publish customer testimonials.', status: 'Planned' },
          { title: 'Articles', detail: 'Create and update kitchen guides and blog posts.', status: 'Planned' },
          { title: 'FAQs', detail: 'Update common customer questions and answers.', status: 'Planned' },
          { title: 'Homepage content', detail: 'Manage banners, featured products and homepage sections.', status: 'Planned' },
          { title: 'Admin users', detail: 'Manage access for owners, admins and editors.', status: 'Owner only · planned' }
        ]" :key="item.title" class="border border-yuwo-line bg-white p-6">
          <div class="flex items-start justify-between gap-3">
            <h2 class="font-display text-xl font-bold text-yuwo-ink">{{ item.title }}</h2>
            <span class="shrink-0 bg-[#f5f6f7] px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-yuwo-muted">{{ item.status }}</span>
          </div>
          <p class="mt-3 text-xs leading-6 text-yuwo-muted">{{ item.detail }}</p>
        </article>
      </section>
      <p class="mt-8 border-l-2 border-yuwo-gold bg-white px-5 py-4 text-xs leading-6 text-yuwo-muted">
        Access is protected by Supabase Auth and your existing role-based database policies. Product changes are saved to your existing Supabase catalog.
      </p>
    </main>
  </div>
</template>
