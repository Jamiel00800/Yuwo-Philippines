<script setup>
import { useRoute } from 'vue-router'
import { Construction } from 'lucide-vue-next'
const route=useRoute()
const descriptions={
 articles:'Create, edit, and publish kitchen guides and blog articles.',
 reviews:'Moderate customer reviews and choose which testimonials appear on the storefront.',
 faqs:'Manage frequently asked questions and their display order.',
 homepage:'Manage homepage banners, featured sections, and promotional content.'
}
</script>
<template><div><p class="text-[10px] font-bold uppercase tracking-[.18em] text-[#a17c20]">Content management</p><h1 class="mt-2 font-display text-3xl font-extrabold">{{route.meta.title}}</h1><p class="mt-2 text-sm text-slate-500">{{descriptions[route.meta.module]}}</p><div class="mt-8 rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center"><Construction :size="30" class="mx-auto text-slate-400"/><h2 class="mt-4 font-display text-lg font-bold">This management module is next in the build</h2><p class="mx-auto mt-2 max-w-xl text-xs leading-6 text-slate-500">The admin navigation and access structure are ready. This module will be connected to the existing Supabase content tables in a later step.</p></div></div></template>