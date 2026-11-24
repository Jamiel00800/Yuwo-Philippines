<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { Check, Truck, ShieldCheck, ChevronRight, ChevronLeft, Plus, Minus } from 'lucide-vue-next'
import { supabase } from '../lib/supabase'
import { mapProduct } from '../lib/catalog'
import { money } from '../data/store'

const props = defineProps({ addToCart: Function })
const route = useRoute()
const product = ref(null)
const loading = ref(true)
const error = ref('')
const selected = ref(0)
const galleryIndex = ref(0)
const qty = ref(1)
const galleryImages = computed(() => product.value?.images || [])
const activeImage = computed(() => galleryImages.value[galleryIndex.value] || galleryImages.value[0] || null)
function changeGallery(direction) {
  const count = galleryImages.value.length
  if (count) galleryIndex.value = (galleryIndex.value + direction + count) % count
}
const variant = computed(() => product.value?.variants?.[selected.value] || {
  name: 'Standard set',
  price: product.value?.price || 0
})

async function loadProduct(slug) {
  loading.value = true
  error.value = ''
  product.value = null
  selected.value = 0
  galleryIndex.value = 0
  qty.value = 1
  try {
    if (!supabase) throw new Error('Product information is temporarily unavailable.')
    const { data, error: queryError } = await supabase
      .from('products')
      .select('*, product_variants(*), product_images(*)')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle()
    if (queryError) throw queryError
    if (!data) throw new Error('This product is unavailable or is no longer published.')
    product.value = mapProduct(data)
  } catch (err) {
    error.value = err.message || 'Unable to load this product.'
  } finally {
    loading.value = false
  }
}

watch(() => route.params.slug, loadProduct, { immediate: true })
</script>

<template>
  <div v-if="loading" class="mx-auto max-w-7xl px-5 py-24 text-center text-sm text-yuwo-muted">Loading product…</div>
  <div v-else-if="error" class="mx-auto max-w-3xl px-5 py-24 text-center"><h1 class="font-display text-3xl font-bold">Product unavailable</h1><p class="mt-3 text-sm text-yuwo-muted">{{ error }}</p><RouterLink to="/collections/all" class="mt-7 inline-block bg-yuwo-navy px-6 py-4 text-xs font-bold text-white">Back to all products</RouterLink></div>
  <div v-else-if="product" class="mx-auto max-w-7xl px-5 pb-16 lg:px-8 lg:pb-24">
    <div class="flex flex-wrap items-center gap-2 py-7 text-[10px] text-[#8b949f]"><RouterLink to="/" class="hover:text-yuwo-navy">Home</RouterLink><ChevronRight :size="12"/><RouterLink to="/collections/all" class="hover:text-yuwo-navy">Sinks & Faucets</RouterLink><ChevronRight :size="12"/><span>{{ product.name }}</span></div>
    <div class="grid gap-9 pb-14 md:grid-cols-[1.1fr_.9fr] md:gap-16">
      <div>
        <div class="group relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden bg-[#f4f4f3]">
          <img v-if="activeImage" :src="activeImage.image_url" :alt="activeImage.alt_text || product.name" class="h-full w-full object-contain p-4 sm:p-7">
          <span v-else class="text-xs text-yuwo-muted">Product image coming soon</span>
          <template v-if="galleryImages.length > 1">
            <button type="button" aria-label="Previous product image" @click="changeGallery(-1)" class="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-yuwo-navy shadow transition hover:bg-white"><ChevronLeft :size="20"/></button>
            <button type="button" aria-label="Next product image" @click="changeGallery(1)" class="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-yuwo-navy shadow transition hover:bg-white"><ChevronRight :size="20"/></button>
            <span class="absolute bottom-3 right-3 bg-white/90 px-3 py-1.5 text-[10px] font-semibold text-yuwo-ink">{{ galleryIndex + 1 }} / {{ galleryImages.length }}</span>
          </template>
        </div>
        <div v-if="galleryImages.length > 1" class="mt-3 grid grid-cols-5 gap-2">
          <button v-for="(image, index) in galleryImages" :key="image.id || image.image_url" type="button" @click="galleryIndex = index" :aria-label="'View product image ' + (index + 1)" :class="galleryIndex === index ? 'border-yuwo-navy ring-1 ring-yuwo-navy' : 'border-yuwo-line'" class="aspect-[4/3] overflow-hidden border bg-[#f4f4f3]">
            <img :src="image.image_url" :alt="image.alt_text || product.name" class="h-full w-full object-contain p-1">
          </button>
        </div>
        <div class="mt-3 text-[9px] uppercase tracking-[.13em] text-[#8b949f]">YUWO · Made for Filipino families</div>
      </div>
      <div class="pt-2"><div class="text-[10px] font-bold uppercase tracking-widest text-[#a17c20]">{{ product.category }} · {{ product.size }}</div><h1 class="mt-3 font-display text-3xl font-extrabold leading-tight tracking-[-.04em] sm:text-4xl">{{ product.name }}</h1><p class="mt-4 text-xs leading-7 text-yuwo-muted">{{ product.short || product.description }}</p>
        <div class="my-6 flex flex-wrap items-center gap-3"><strong class="font-display text-2xl">{{ money(variant.price) }}</strong><del v-if="variant.compareAt || product.compareAt" class="text-sm text-[#9ca4ac]">{{ money(variant.compareAt || product.compareAt) }}</del><span v-if="(variant.compareAt || product.compareAt) > variant.price" class="bg-[#f5edda] px-2 py-1.5 text-[9px] text-[#9b741b]">Save {{ money((variant.compareAt || product.compareAt) - variant.price) }}</span></div>
        <p class="mb-6 text-[10px] text-yuwo-muted">Promo price · GCash or bank transfer</p>
        <template v-if="product.variants.length"><label class="mb-3 block text-[11px] font-bold">Choose your set</label><div class="grid gap-2"><button v-for="(item, index) in product.variants" :key="item.id || item.name" :class="selected === index ? 'border-yuwo-navy bg-[#f4f7fb]' : 'border-yuwo-line bg-white'" class="flex items-center gap-3 border p-3 text-left text-[10px]" @click="selected = index"><span :class="selected === index ? 'border-[4px] border-yuwo-navy' : 'border border-[#a9b1ba]'" class="h-3.5 w-3.5 shrink-0 rounded-full"></span><span>{{ item.name }}</span><b class="ml-auto text-[11px]">{{ money(item.price) }}</b></button></div></template>
        <label class="mb-3 mt-5 block text-[11px] font-bold">Quantity</label><div class="flex w-max items-center gap-6 border border-yuwo-line px-4 py-2.5 text-xs"><button @click="qty = Math.max(1, qty - 1)"><Minus :size="16"/></button>{{ qty }}<button @click="qty++"><Plus :size="16"/></button></div>
        <button class="mt-5 w-full bg-yuwo-navy px-5 py-4 text-xs font-bold text-white hover:bg-yuwo-deep" @click="props.addToCart(product, variant, qty)">Add to cart <span class="font-normal">· {{ money(variant.price * qty) }}</span></button><p class="mt-3 text-center text-[10px] text-yuwo-muted">No payment yet. We call you to confirm availability and delivery fee.</p>
        <div class="mt-6 grid grid-cols-1 gap-3 border-t border-yuwo-line pt-5 sm:grid-cols-2"><span class="flex items-center gap-2 text-[10px] text-[#596574]"><Check class="shrink-0 text-[#a27d22]"/>100% quality inspection before shipping</span><span class="flex items-center gap-2 text-[10px] text-[#596574]"><ShieldCheck class="shrink-0 text-[#a27d22]"/>Factory defect replacement within 15 days</span><span class="flex items-center gap-2 text-[10px] text-[#596574]"><Truck class="shrink-0 text-[#a27d22]"/>Nationwide delivery</span><span class="flex items-center gap-2 text-[10px] text-[#596574]"><Check class="shrink-0 text-[#a27d22]"/>We guide your installer by phone</span></div>
        <div class="mt-5 bg-yuwo-soft p-4 text-[10px]">Buying 3 or more? <RouterLink to="/pages/for-professionals" class="font-bold text-yuwo-navy">Ask about project pricing →</RouterLink></div>
      </div>
    </div>
    <section class="grid gap-8 border-t border-yuwo-line py-12 md:grid-cols-2 md:gap-16"><div><div class="text-[10px] font-bold tracking-widest text-[#a17c20]">PRODUCT DETAILS</div><h2 class="mt-3 font-display text-3xl font-bold">Specifications</h2><p class="mt-4 text-xs leading-7 text-yuwo-muted">{{ product.description }}</p></div><div class="divide-y divide-yuwo-line text-[11px]"><div v-for="row in [['Product', product.name], ['Size', product.size], ['Category', product.category]]" :key="row[0]" class="flex justify-between gap-5 py-4"><span class="text-yuwo-muted">{{ row[0] }}</span><b class="text-right">{{ row[1] || '—' }}</b></div></div></section>
    <section class="grid gap-8 border-t border-yuwo-line pt-12 md:grid-cols-2 md:gap-16"><div><div class="text-[10px] font-bold tracking-widest text-[#a17c20]">NEED A HAND?</div><h2 class="mt-3 font-display text-3xl font-bold">Questions about<br>your sink?</h2><p class="my-4 text-xs leading-7 text-yuwo-muted">Send us a photo of your counter and our team can help you check the fit.</p><a href="https://m.me/" class="text-xs font-bold text-yuwo-navy">Message YUWO →</a></div><div class="bg-yuwo-soft p-6 text-xs leading-7 text-yuwo-muted">Our team can help you choose a size, installation style and accessory set. <RouterLink to="/pages/contact" class="font-bold text-yuwo-navy">Contact YUWO →</RouterLink></div></section>
  </div>
</template>
