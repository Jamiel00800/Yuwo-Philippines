<script setup>
import { computed, ref } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { Check, Truck, ShieldCheck, ChevronRight, Plus, Minus } from 'lucide-vue-next'
import FAQ from '../components/FAQ.vue'
import { products, money, faqs } from '../data/store'

const props = defineProps({ addToCart: Function })
const route = useRoute()
const product = computed(() => products.find(p => p.slug === route.params.slug) || products[0])
const selected = ref(0)
const qty = ref(1)
const variant = computed(() => product.value.variants?.[selected.value] || { name: 'Standard set', price: product.value.price })
const productFaq = [faqs[0], faqs[5], faqs[7], faqs[8]]
</script>

<template>
  <div class="mx-auto max-w-7xl px-5 pb-16 lg:px-8 lg:pb-24">
    <div class="flex flex-wrap items-center gap-2 py-7 text-[10px] text-[#8b949f]">
      <RouterLink to="/" class="hover:text-yuwo-navy">Home</RouterLink><ChevronRight :size="12"/>
      <RouterLink to="/collections/all" class="hover:text-yuwo-navy">Sinks & Faucets</RouterLink><ChevronRight :size="12"/><span>{{ product.name }}</span>
    </div>
    <div class="grid gap-9 pb-14 md:grid-cols-[1.1fr_.9fr] md:gap-16">
      <div><div class="h-[330px] bg-[#f4f4f3] sm:h-[480px] lg:h-[540px]"><img :src="product.image" :alt="product.name" class="h-full w-full object-contain"></div><div class="mt-3 text-[9px] uppercase tracking-[.13em] text-[#8b949f]">YUWO · Made for Filipino families</div></div>
      <div class="pt-2">
        <div class="text-[10px] font-bold uppercase tracking-widest text-[#a17c20]">{{ product.category }} · {{ product.size }}</div>
        <h1 class="mt-3 font-display text-3xl font-extrabold leading-tight tracking-[-.04em] sm:text-4xl">{{ product.name }}</h1>
        <p class="mt-4 text-xs leading-7 text-yuwo-muted">{{ product.short }} Made with brand-new 304 stainless steel and designed with practical accessories for everyday kitchen use.</p>
        <div class="my-6 flex flex-wrap items-center gap-3"><strong class="font-display text-2xl">{{ money(variant.price) }}</strong><del class="text-sm text-[#9ca4ac]">{{ money(product.compareAt) }}</del><span class="bg-[#f5edda] px-2 py-1.5 text-[9px] text-[#9b741b]">Save {{ money(product.compareAt - variant.price) }}</span></div>
        <p class="mb-6 text-[10px] text-yuwo-muted">Promo price · GCash or bank transfer</p>
        <label class="mb-3 block text-[11px] font-bold">Choose your set</label>
        <div class="grid gap-2"><button v-for="(v, i) in product.variants" :key="v.name" :class="selected === i ? 'border-yuwo-navy bg-[#f4f7fb]' : 'border-yuwo-line bg-white'" class="flex items-center gap-3 border p-3 text-left text-[10px]" @click="selected = i"><span :class="selected === i ? 'border-[4px] border-yuwo-navy' : 'border border-[#a9b1ba]'" class="h-3.5 w-3.5 shrink-0 rounded-full"></span><span>{{ v.name }}</span><b class="ml-auto text-[11px]">{{ money(v.price) }}</b></button></div>
        <label class="mb-3 mt-5 block text-[11px] font-bold">Quantity</label>
        <div class="flex w-max items-center gap-6 border border-yuwo-line px-4 py-2.5 text-xs"><button @click="qty = Math.max(1, qty - 1)"><Minus :size="16"/></button>{{ qty }}<button @click="qty++"><Plus :size="16"/></button></div>
        <button class="mt-5 w-full bg-yuwo-navy px-5 py-4 text-xs font-bold text-white hover:bg-yuwo-deep" @click="props.addToCart(product, variant, qty)">Add to cart <span class="font-normal">· {{ money(variant.price * qty) }}</span></button>
        <p class="mt-3 text-center text-[10px] text-yuwo-muted">No payment yet. We call you to confirm availability and delivery fee.</p>
        <div class="mt-6 grid grid-cols-1 gap-3 border-t border-yuwo-line pt-5 sm:grid-cols-2"><span class="flex items-center gap-2 text-[10px] text-[#596574]"><Check class="shrink-0 text-[#a27d22]"/>100% quality inspection before shipping</span><span class="flex items-center gap-2 text-[10px] text-[#596574]"><ShieldCheck class="shrink-0 text-[#a27d22]"/>Factory defect replacement within 15 days</span><span class="flex items-center gap-2 text-[10px] text-[#596574]"><Truck class="shrink-0 text-[#a27d22]"/>Nationwide delivery</span><span class="flex items-center gap-2 text-[10px] text-[#596574]"><Check class="shrink-0 text-[#a27d22]"/>We guide your installer by phone</span></div>
        <div class="mt-5 bg-yuwo-soft p-4 text-[10px]">Buying 3 or more? <RouterLink to="/pages/for-professionals" class="font-bold text-yuwo-navy">Ask about project pricing →</RouterLink></div>
      </div>
    </div>
    <section class="grid gap-8 border-t border-yuwo-line py-12 md:grid-cols-2 md:gap-16"><div><div class="text-[10px] font-bold tracking-widest text-[#a17c20]">EVERYTHING IN THE BOX</div><h2 class="mt-3 font-display text-3xl font-bold">More function.<br>Less counter clutter.</h2><p class="mt-4 max-w-sm text-xs leading-7 text-yuwo-muted">Workstation accessories help you wash, prep and drain in one convenient space.</p></div><ul class="grid grid-cols-2 content-center gap-4 text-[11px]"><li v-for="item in ['Sink basin in 304 stainless steel','Solid wood chopping board','304 stainless drain basket','Small basin and sink grid','Drain, fittings and hoses','Installation manual and cutting template','Pull-out faucet, if selected']" :key="item" class="border-b border-yuwo-line py-3 before:mr-2 before:font-bold before:text-[#a17c20] before:content-['✓']">{{ item }}</li></ul></section>
    <section class="grid gap-8 border-t border-yuwo-line py-12 md:grid-cols-2 md:gap-16"><div><div class="text-[10px] font-bold tracking-widest text-[#a17c20]">PRODUCT DETAILS</div><h2 class="mt-3 font-display text-3xl font-bold">Specifications</h2></div><div class="divide-y divide-yuwo-line text-[11px]"><div v-for="row in [['Product', product.name], ['Size', product.size], ['Material', 'TRUE 304 stainless steel'], ['Finish', 'YUWO anti-scratch finish'], ['Installation', product.category + ' · Flush mount may be possible']]" :key="row[0]" class="flex justify-between gap-5 py-4"><span class="text-yuwo-muted">{{ row[0] }}</span><b class="text-right">{{ row[1] }}</b></div></div></section>
    <section class="grid gap-8 border-t border-yuwo-line pt-12 md:grid-cols-2 md:gap-16"><div><div class="text-[10px] font-bold tracking-widest text-[#a17c20]">NEED A HAND?</div><h2 class="mt-3 font-display text-3xl font-bold">Questions about<br>your sink?</h2><p class="my-4 text-xs leading-7 text-yuwo-muted">Send us a photo of your counter and our team can help you check the fit.</p><a href="https://m.me/" class="text-xs font-bold text-yuwo-navy">Message YUWO →</a></div><FAQ :items="productFaq"/></section>
  </div>
</template>