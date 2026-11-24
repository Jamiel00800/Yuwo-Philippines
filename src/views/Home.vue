<script setup>
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { ArrowRight, ShieldCheck, Truck, HeartHandshake, Ruler, Check } from 'lucide-vue-next'
import ProductCard from '../components/ProductCard.vue'
import { supabase } from '../lib/supabase'
import { mapProduct } from '../lib/catalog'

const featured = ref([])
const reviews = ref([])
const loadingProducts = ref(true)
const loadingReviews = ref(true)

async function loadFeaturedProducts() {
  try {
    if (!supabase) return
    const { data, error } = await supabase
      .from('products')
      .select('*, product_variants(*), product_images(*)')
      .eq('status', 'published')
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(4)
    if (error) throw error
    featured.value = (data || []).map(mapProduct)
  } catch (error) {
    console.error('Unable to load featured products:', error.message)
  } finally {
    loadingProducts.value = false
  }
}

async function loadReviews() {
  try {
    if (!supabase) return
    const { data, error } = await supabase
      .from('reviews')
      .select('id, customer_name, location, review_text, rating, image_url')
      .eq('status', 'published')
      .order('display_order', { ascending: true })
      .limit(6)
    if (error) throw error
    reviews.value = data || []
  } catch (error) {
    console.error('Unable to load customer reviews:', error.message)
  } finally {
    loadingReviews.value = false
  }
}

onMounted(() => {
  loadFeaturedProducts()
  loadReviews()
})
</script>

<template>
  <!-- HERO -->
  <section id="hero" class="grid bg-yuwo-navy text-white lg:min-h-[590px] lg:grid-cols-2">
    <div class="flex flex-col justify-center px-6 py-14 sm:px-12 lg:py-20 xl:px-20">
      <div class="mb-5 flex items-center gap-2 text-[10px] font-bold tracking-[.18em] text-yuwo-gold"><span class="h-1.5 w-1.5 rounded-full bg-yuwo-gold"></span>MADE FOR FILIPINO FAMILIES</div>
      <h1 class="font-display text-5xl font-extrabold leading-[1.08] tracking-[-.05em] sm:text-6xl">Perfect for your<br><em class="font-medium">dream kitchen.</em></h1>
      <p class="mt-6 max-w-lg text-sm leading-7 text-blue-100">Thoughtfully designed workstation sinks that make every kitchen feel more spacious, functional and beautiful.</p>
      <div class="mt-8 flex flex-wrap gap-3"><RouterLink to="/collections/all" class="inline-flex items-center gap-3 bg-yuwo-gold px-6 py-4 text-xs font-bold text-[#172b45]">Shop sink sets <ArrowRight :size="17"/></RouterLink><a href="https://m.me/" class="border border-white/40 px-6 py-4 text-xs font-semibold text-white">Ask us on Messenger</a></div>
      <div class="mt-9 flex flex-wrap gap-x-5 gap-y-3 text-[10px] text-blue-100"><span class="flex items-center gap-1.5"><Check :size="14" class="text-yuwo-gold"/>Real 304 stainless steel</span><span class="flex items-center gap-1.5"><Check :size="14" class="text-yuwo-gold"/>Anti-scratch finish</span><span class="flex items-center gap-1.5"><Check :size="14" class="text-yuwo-gold"/>Lifetime after-sales support</span></div>
    </div>
    <div class="relative min-h-[320px] lg:min-h-full"><img src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=90" alt="Modern kitchen with stainless sink" class="absolute inset-0 h-full w-full object-cover"><div class="absolute bottom-6 right-6 flex flex-col bg-white/95 px-6 py-5 text-center text-yuwo-navy shadow-xl sm:bottom-10 sm:right-10"><b class="font-display text-3xl font-extrabold tracking-[-.08em]">YUWO</b><span class="text-[8px] font-bold tracking-[.2em]">EUROPEAN TECHNOLOGY</span><small class="mt-2 text-[9px] text-yuwo-muted">Quality for everyday living</small></div></div>
  </section>

  <!-- TRUST / BENEFITS STRIP -->
  <section class="grid grid-cols-2 gap-6 bg-[#f6f7f8] px-5 py-7 sm:grid-cols-4 sm:px-8 lg:px-12">
    <div class="flex flex-col items-start gap-2"><ShieldCheck class="text-yuwo-navy"/><b class="text-[11px]">Real 304 stainless steel</b><small class="text-[10px] text-yuwo-muted">Brand-new quality material</small></div>
    <div class="flex flex-col items-start gap-2"><Ruler class="text-yuwo-navy"/><b class="text-[11px]">Made to fit your space</b><small class="text-[10px] text-yuwo-muted">Multiple sizes available</small></div>
    <div class="flex flex-col items-start gap-2"><Truck class="text-yuwo-navy"/><b class="text-[11px]">Nationwide delivery</b><small class="text-[10px] text-yuwo-muted">We confirm your delivery fee</small></div>
    <div class="flex flex-col items-start gap-2"><HeartHandshake class="text-yuwo-navy"/><b class="text-[11px]">After-sales support</b><small class="text-[10px] text-yuwo-muted">Here when you need us</small></div>
  </section>

  <!-- FEATURED CUSTOMER REVIEWS: Supabase reviews with status=published -->
  <section v-if="reviews.length" id="featured-reviews" class="mx-auto max-w-7xl px-5 py-16 sm:py-24 lg:px-8">
    <div class="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><div class="text-[10px] font-bold tracking-[.18em] text-[#a17c20]">REAL KITCHENS, REAL CUSTOMERS</div><h2 class="mt-3 font-display text-3xl font-bold leading-tight sm:text-4xl">Made for the heart<br>of your home.</h2></div><p class="max-w-sm text-xs leading-7 text-yuwo-muted">From the first rinse to the last dish, make everyday kitchen moments a little better.</p></div>
    <div class="grid gap-4 md:grid-cols-3"><article v-for="(review, index) in reviews.slice(0, 3)" :key="review.id" class="relative flex min-h-40 flex-col border border-yuwo-line p-6"><div class="text-sm tracking-widest text-[#c39a3b]">{{ '★'.repeat(Math.max(0, Math.min(5, Number(review.rating || 5)))) }}</div><blockquote class="mt-4 text-sm font-medium leading-7">{{ review.review_text }}</blockquote><small class="mt-auto pt-5 text-[10px] text-yuwo-muted">{{ review.customer_name }}<span v-if="review.location"> · {{ review.location }}</span></small><span class="absolute bottom-5 right-5 text-xs text-[#c8cdd3]">0{{ index + 1 }}</span></article></div>
  </section>

  <!-- FEATURED PRODUCTS: Supabase products with is_featured=true and status=published -->
  <section v-if="featured.length" id="featured-products" class="mx-auto max-w-7xl px-5 py-16 sm:py-24 lg:px-8">
    <div class="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><div class="text-[10px] font-bold tracking-[.18em] text-[#a17c20]">THE YUWO COLLECTION</div><h2 class="mt-3 font-display text-3xl font-bold leading-tight sm:text-4xl">Find the right sink<br>for your kitchen.</h2></div><RouterLink to="/collections/all" class="inline-flex items-center gap-2 text-xs font-bold text-yuwo-navy">View all products <ArrowRight/></RouterLink></div>
    <div class="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6"><ProductCard v-for="product in featured" :key="product.id" :product="product"/></div>
  </section>

  <!-- UNDERMOUNT VS TOPMOUNT -->
  <section id="installation-styles" class="bg-yuwo-soft px-5 py-16 sm:py-20"><div class="mx-auto max-w-7xl"><div class="mx-auto mb-10 max-w-xl text-center"><div class="text-[10px] font-bold tracking-[.18em] text-[#a17c20]">FIND YOUR FIT</div><h2 class="mt-3 font-display text-3xl font-bold sm:text-4xl">Undermount or topmount?</h2><p class="mt-3 text-xs leading-6 text-yuwo-muted">Both are good choices. It depends on the look you like and your counter.</p></div>
    <div class="grid gap-6 md:grid-cols-2"><article class="overflow-hidden bg-white"><img src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=85" alt="Undermount kitchen sink" class="h-56 w-full object-cover"><div class="p-6 sm:p-8"><span class="text-[9px] font-bold tracking-widest text-[#a17c20]">CLEAN & SEAMLESS</span><h3 class="mt-2 font-display text-2xl font-bold">Undermount</h3><p class="mt-3 text-xs leading-6 text-yuwo-muted">The sink sits under the counter for a smooth, uninterrupted look.</p><ul class="mt-4 list-inside list-disc space-y-2 text-xs text-yuwo-muted"><li>Wipe crumbs straight into the sink</li><li>Clean, seamless counter edge</li><li>Countertop needs a fitted cut-out</li></ul></div></article>
      <article class="overflow-hidden bg-white"><img src="https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1000&q=85" alt="Topmount kitchen sink" class="h-56 w-full object-cover"><div class="p-6 sm:p-8"><span class="text-[9px] font-bold tracking-widest text-[#a17c20]">EASY & PRACTICAL</span><h3 class="mt-2 font-display text-2xl font-bold">Topmount</h3><p class="mt-3 text-xs leading-6 text-yuwo-muted">The sink sits on top of the counter for a classic, practical fit.</p><ul class="mt-4 list-inside list-disc space-y-2 text-xs text-yuwo-muted"><li>Faucet and soap holes on the sink</li><li>Simple to install and replace</li><li>Visible rim around the sink edge</li></ul></div></article></div>
    <p class="mt-6 text-center text-[10px] text-yuwo-muted">Want flush mount, or another way? Ask your installer first. <a class="font-bold text-yuwo-navy" href="https://m.me/">Send us a photo of your counter ↗</a></p>
  </div></section>

  <!-- MORE THAN JUST A SINK -->
  <section id="workstation-sink" class="grid bg-yuwo-deep text-white md:grid-cols-2"><div class="min-h-[280px]"><img src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=90" alt="Kitchen workstation" class="h-full min-h-[280px] w-full object-cover"></div><div class="flex flex-col justify-center px-6 py-14 sm:px-12 lg:px-16"><div class="text-[10px] font-bold tracking-[.18em] text-yuwo-gold">MORE THAN JUST A SINK</div><h2 class="mt-4 font-display text-4xl font-extrabold leading-tight">What is a<br><em class="font-medium">workstation sink?</em></h2><p class="mt-4 text-xs leading-7 text-blue-100">A sink with a built-in ledge. Fit it with custom accessories and turn your sink into a practical prep station.</p><div class="my-7 space-y-5"><div v-for="step in [{n:'01',t:'Wash',d:'Room for your largest pots and pans.'},{n:'02',t:'Cut',d:'Chop on the board. Scraps go straight in.'},{n:'03',t:'Drain',d:'Let plates and vegetables drip dry over the sink.'}]" :key="step.n" class="flex gap-4"><b class="font-display text-xl text-yuwo-gold">{{ step.n }}</b><span><strong class="block text-xs">{{ step.t }}</strong><small class="mt-1 block text-[10px] text-blue-100">{{ step.d }}</small></span></div></div><RouterLink to="/collections/all" class="inline-flex w-max items-center gap-3 bg-yuwo-gold px-5 py-4 text-xs font-bold text-[#172b45]">Explore workstation sinks <ArrowRight/></RouterLink></div></section>

  <!-- PROFESSIONALS -->
  <section id="professionals" class="flex flex-col justify-between gap-9 bg-[#102d55] px-6 py-14 text-white sm:px-12 lg:flex-row lg:items-center lg:px-20"><div><div class="text-[10px] font-bold tracking-[.18em] text-yuwo-gold">FOR CONTRACTORS & DESIGNERS</div><h2 class="mt-4 font-display text-4xl font-bold leading-tight">Sinks your clients<br>will love.</h2><p class="mt-3 text-xs text-blue-100">Small or big projects, we're your partner from quote to after-sales.</p><RouterLink to="/pages/for-professionals" class="mt-6 inline-flex items-center gap-3 bg-yuwo-gold px-5 py-4 text-xs font-bold text-[#172b45]">Get project pricing <ArrowRight/></RouterLink></div><div class="grid gap-4 sm:grid-cols-2"><span v-for="item in ['Project pricing for 3 or more sets','Spec sheet and cutting template','Reserve stock for your timeline','Lifetime after-sales support']" :key="item" class="flex items-center gap-2 text-[11px] text-blue-100"><Check :size="15" class="text-yuwo-gold"/>{{ item }}</span></div></section>

  <!-- FINAL CALL TO ACTION -->
  <section id="contact-cta" class="bg-yuwo-navy px-5 py-16 text-center text-white sm:py-20"><div class="text-[10px] font-bold tracking-[.18em] text-yuwo-gold">LET'S FIND YOUR PERFECT FIT</div><h2 class="mt-4 font-display text-4xl font-extrabold leading-tight sm:text-5xl">A better kitchen<br>starts at the sink.</h2><p class="mx-auto mt-4 max-w-md text-xs leading-7 text-blue-100">Tell us about your kitchen. We'll help you choose the right one.</p><div class="mt-7 flex flex-wrap justify-center gap-3"><RouterLink to="/collections/all" class="bg-yuwo-gold px-6 py-4 text-xs font-bold text-[#172b45]">Shop all sinks <ArrowRight class="ml-2 inline"/></RouterLink><a href="tel:+639985412344" class="border border-white/40 px-6 py-4 text-xs font-semibold">Call 0998 541 2344</a></div></section>
</template>
