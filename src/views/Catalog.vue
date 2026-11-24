<script setup>
import { ref, computed, onMounted } from 'vue'
import { Search } from 'lucide-vue-next'
import ProductCard from '../components/ProductCard.vue'
import { supabase } from '../lib/supabase'
import { fetchPublishedProducts } from '../lib/catalog'

const products = ref([])
const loading = ref(true)
const error = ref('')
const filter = ref('All')
const search = ref('')
const sort = ref('featured')

const shown = computed(() => {
  const list = products.value.filter(product =>
    (filter.value === 'All' || product.category === filter.value) &&
    `${product.name} ${product.size}`.toLowerCase().includes(search.value.toLowerCase())
  )
  if (sort.value === 'low') list.sort((a, b) => a.price - b.price)
  if (sort.value === 'high') list.sort((a, b) => b.price - a.price)
  if (sort.value === 'featured') list.sort((a, b) => Number(b.tag !== '') - Number(a.tag !== ''))
  return list
})

async function loadProducts() {
  loading.value = true
  error.value = ''
  try {
    if (!supabase) throw new Error('The product catalog is temporarily unavailable.')
    products.value = await fetchPublishedProducts(supabase)
  } catch (err) {
    error.value = err.message || 'Unable to load products right now.'
  } finally {
    loading.value = false
  }
}

onMounted(loadProducts)
</script>

<template>
  <section class="bg-yuwo-navy px-6 py-16 text-white lg:px-8 lg:py-20"><div class="mx-auto max-w-7xl"><div class="mb-4 text-[10px] font-bold tracking-[.18em] text-yuwo-gold">THE YUWO COLLECTION</div><h1 class="font-display text-4xl font-extrabold leading-tight tracking-[-.05em] sm:text-6xl">Find your perfect<br><em class="font-medium">kitchen sink.</em></h1><p class="mt-5 max-w-xl text-sm leading-7 text-blue-100">Complete 304 stainless steel sink sets. Thoughtful details, practical accessories and support from order to after-sales.</p></div></section>
  <section class="mx-auto max-w-7xl px-5 py-14 sm:py-20 lg:px-8">
    <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><div class="text-[10px] font-bold tracking-[.18em] text-[#a17c20]">SINKS & FAUCETS</div><h2 class="mt-2 font-display text-3xl font-bold">Explore all products</h2><p class="mt-2 text-xs text-yuwo-muted">Choose a style, compare sizes and find the right fit for your kitchen.</p></div><div class="text-xs text-yuwo-muted">{{ shown.length }} products</div></div>
    <div class="my-7 flex flex-col justify-between gap-4 border-y border-yuwo-line py-4 sm:flex-row sm:items-center"><div class="flex gap-2"><button v-for="category in ['All','Undermount','Topmount']" :key="category" :class="filter===category ? 'border-yuwo-navy bg-yuwo-navy text-white' : 'border-yuwo-line bg-white text-yuwo-ink'" class="border px-4 py-2.5 text-[10px] font-semibold" @click="filter=category">{{ category }}</button></div><div class="flex gap-2"><label class="flex min-w-0 flex-1 items-center gap-2 border border-yuwo-line px-3 sm:flex-none"><Search :size="16" class="text-yuwo-muted"/><input v-model="search" class="w-full py-2.5 text-xs outline-none sm:w-36" placeholder="Search sinks"></label><select v-model="sort" aria-label="Sort products" class="max-w-44 border border-yuwo-line bg-white px-3 text-xs"><option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></div></div>
    <div v-if="loading" class="py-16 text-center text-sm text-yuwo-muted">Loading products…</div>
    <div v-else-if="error" role="alert" class="border border-red-200 bg-red-50 p-5 text-sm text-red-700">{{ error }}</div>
    <div v-else-if="shown.length" class="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6"><ProductCard v-for="product in shown" :key="product.id" :product="product"/></div>
    <div v-else class="py-16 text-center"><h3 class="font-display text-xl font-bold">Our collection is being prepared.</h3><p class="mt-2 text-sm text-yuwo-muted">New YUWO products will appear here as soon as they are published.</p></div>
  </section>
</template>
