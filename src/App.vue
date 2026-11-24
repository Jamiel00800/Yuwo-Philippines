<script setup>
import { ref, computed, watch } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { ShoppingBag, Menu, X, Phone, Trash2, Plus, Minus } from 'lucide-vue-next'
import { money } from './data/store'

const route = useRoute()
const isAdminRoute = computed(() => route.path.startsWith('/admin'))
const menu = ref(false)
const cartOpen = ref(false)
const cart = ref(JSON.parse(localStorage.getItem('yuwo-cart') || '[]'))

watch(cart, value => localStorage.setItem('yuwo-cart', JSON.stringify(value)), { deep: true })
const count = computed(() => cart.value.reduce((sum, item) => sum + item.qty, 0))
const subtotal = computed(() => cart.value.reduce((sum, item) => sum + item.price * item.qty, 0))

function add(item, variant, qty = 1) {
  const name = variant?.name || 'Standard set'
  const price = variant?.price ?? item.price
  const key = item.id + '-' + name
  const found = cart.value.find(cartItem => cartItem.key === key)
  if (found) found.qty += qty
  else cart.value.push({ key, id: item.id, name: item.name, variant: name, price, qty, image: item.image || '' })
  cartOpen.value = true
}

function change(item, difference) {
  item.qty += difference
  if (item.qty < 1) cart.value = cart.value.filter(cartItem => cartItem.key !== item.key)
}

function checkout() {
  const lines = cart.value.map(item => `${item.name} — ${item.variant} × ${item.qty} — ${money(item.price * item.qty)}`).join('\n')
  const message = encodeURIComponent(`Hello YUWO! I would like to inquire about this order:\n${lines}\nSubtotal: ${money(subtotal.value)}\nPlease confirm availability and delivery fee.`)
  window.open(`https://wa.me/639985412344?text=${message}`, '_blank')
}
</script>

<template>
  <RouterView v-if="isAdminRoute"/>
  <template v-else>
    <!-- ANNOUNCEMENT BAR -->
    <div class="flex flex-wrap items-center justify-center gap-x-2 bg-yuwo-navy px-3 py-2 text-center text-[10px] font-semibold tracking-wide text-white sm:text-xs">Nationwide Delivery <span class="text-yuwo-gold">·</span> Real 304 Stainless Steel <span class="text-yuwo-gold">·</span> Call or text <a href="tel:+639985412344" class="underline underline-offset-2">0998 541 2344</a></div>
    <!-- TOP NAVIGATION -->
    <header class="sticky top-0 z-40 border-b border-yuwo-line bg-white/95 backdrop-blur">
      <div class="mx-auto flex h-[76px] max-w-7xl items-center justify-between gap-4 px-5 lg:px-8">
        <button class="text-yuwo-navy md:hidden" @click="menu = !menu" aria-label="Toggle menu"><Menu v-if="!menu"/><X v-else/></button>
        <RouterLink to="/" class="flex shrink-0 flex-col leading-none text-yuwo-navy"><span class="font-display text-3xl font-extrabold tracking-[-.08em]">YUWO</span><small class="mt-1 text-[8px] font-bold tracking-[.22em]">EUROPEAN TECHNOLOGY</small></RouterLink>
        <nav :class="menu ? 'absolute left-0 right-0 top-full flex flex-col gap-5 border-b border-yuwo-line bg-white px-6 py-6 shadow-lg md:static md:flex-row md:items-center md:border-0 md:bg-transparent md:p-0 md:shadow-none' : 'hidden items-center gap-7 md:flex'">
          <RouterLink @click="menu = false" to="/" class="text-xs font-semibold">Home</RouterLink><RouterLink @click="menu = false" to="/collections/all" class="text-xs font-semibold">All Products</RouterLink><RouterLink @click="menu = false" to="/blogs/articles" class="text-xs font-semibold">Articles</RouterLink><RouterLink @click="menu = false" to="/pages/for-professionals" class="text-xs font-semibold">For Professionals</RouterLink><RouterLink @click="menu = false" to="/pages/contact" class="text-xs font-semibold">Contact</RouterLink>
        </nav>
        <div class="ml-auto flex items-center gap-4"><a class="hidden items-center gap-2 text-xs font-semibold lg:flex" href="tel:+639985412344"><Phone :size="16"/>0998 541 2344</a><button class="relative flex items-center gap-2 text-yuwo-navy" @click="cartOpen = true" aria-label="Open cart"><ShoppingBag :size="21"/><span class="flex h-5 min-w-5 items-center justify-center rounded-full bg-yuwo-navy px-1 text-[10px] font-bold text-white">{{ count }}</span></button></div>
      </div>
    </header>
    <main><RouterView :add-to-cart="add"/></main>
    <!-- FOOTER -->
    <footer class="bg-[#101f33] px-6 pb-5 pt-14 text-[#e8edf4] lg:px-8"><div class="mx-auto grid max-w-7xl grid-cols-2 gap-9 pb-10 md:grid-cols-4">
      <div class="col-span-2 md:col-span-1"><RouterLink to="/" class="flex flex-col text-white"><span class="font-display text-3xl font-extrabold tracking-[-.08em]">YUWO</span><small class="text-[8px] font-bold tracking-[.22em]">EUROPEAN TECHNOLOGY</small></RouterLink><p class="mt-5 max-w-xs text-xs leading-7 text-[#b9c3d1]">Made for Filipino families. High quality raw materials from Switzerland, Spain & PRC.</p></div>
      <div class="flex flex-col items-start gap-3"><h4 class="text-xs font-bold text-white">Explore</h4><RouterLink class="text-xs text-[#b9c3d1]" to="/collections/all">All products</RouterLink><RouterLink class="text-xs text-[#b9c3d1]" to="/blogs/articles">Kitchen guides</RouterLink><RouterLink class="text-xs text-[#b9c3d1]" to="/pages/for-professionals">For professionals</RouterLink></div>
      <div class="flex flex-col items-start gap-3"><h4 class="text-xs font-bold text-white">Get in touch</h4><a class="text-xs text-[#b9c3d1]" href="tel:+639985412344">0998 541 2344</a><a class="text-xs text-[#b9c3d1]" href="mailto:yuwophilippines@gmail.com">yuwophilippines@gmail.com</a><a class="text-xs text-[#b9c3d1]" href="https://m.me/" target="_blank">Facebook Messenger ↗</a></div>
      <div><h4 class="mb-3 text-xs font-bold">Showroom</h4><p class="text-xs leading-7 text-[#b9c3d1]">B14 L21 Acacia St., Vista Verde South, Bacoor, Cavite<br>Mon–Sat · 11am–5pm</p></div>
    </div><div class="mx-auto flex max-w-7xl flex-col gap-2 border-t border-white/15 pt-5 text-[10px] text-[#8e9aab] sm:flex-row sm:justify-between"><span>© {{ new Date().getFullYear() }} YUWO Philippines</span><span>European Technology · Made for Filipino families</span></div></footer>
    <!-- CART DRAWER -->
    <div v-if="cartOpen" class="fixed inset-0 z-50 flex justify-end bg-[#07182c]/50" @click.self="cartOpen = false"><aside class="flex h-full w-full max-w-[460px] flex-col bg-white p-6 shadow-2xl">
      <div class="flex items-center justify-between border-b border-yuwo-line pb-5"><h3 class="font-display text-xl font-bold">Your cart ({{ count }})</h3><button @click="cartOpen = false" aria-label="Close cart"><X/></button></div>
      <div v-if="!cart.length" class="flex flex-1 flex-col items-center justify-center text-center text-yuwo-muted"><ShoppingBag :size="42"/><h3 class="mt-5 font-display text-xl font-bold text-yuwo-ink">Your cart is empty</h3><p class="mb-6 mt-2 text-xs">Find the right sink for your kitchen.</p><RouterLink class="bg-yuwo-navy px-6 py-3 text-xs font-bold text-white" to="/collections/all" @click="cartOpen = false">Shop sinks</RouterLink></div>
      <div v-else class="flex-1 overflow-auto"><div v-for="item in cart" :key="item.key" class="flex gap-4 border-b border-yuwo-line py-5"><img v-if="item.image" :src="item.image" :alt="item.name" class="h-[85px] w-[85px] object-cover"><div class="flex flex-1 flex-col items-start gap-1"><b class="text-xs">{{ item.name }}</b><small class="text-[10px] text-yuwo-muted">{{ item.variant }}</small><strong class="text-xs">{{ money(item.price) }}</strong><div class="mt-1 flex items-center gap-4 border border-yuwo-line px-3 py-2 text-xs"><button @click="change(item,-1)"><Minus :size="13"/></button>{{ item.qty }}<button @click="change(item,1)"><Plus :size="13"/></button></div></div><button @click="cart = cart.filter(cartItem => cartItem.key !== item.key)" aria-label="Remove item"><Trash2 :size="16"/></button></div></div>
      <div v-if="cart.length" class="border-t border-yuwo-line pt-5"><div class="flex justify-between text-sm"><span>Subtotal</span><b>{{ money(subtotal) }}</b></div><p class="my-3 text-[10px] text-yuwo-muted">No payment yet. We will confirm your order and delivery fee.</p><button class="w-full bg-yuwo-navy px-5 py-4 text-xs font-bold text-white" @click="checkout">Send order inquiry ↗</button><small class="mt-3 block text-center text-[10px] text-yuwo-muted">Checkout opens a WhatsApp inquiry. No online payment is collected.</small></div>
    </aside></div>
  </template>
</template>
