<script setup>
import { RouterLink } from 'vue-router'
import { money } from '../data/store'

defineProps({ product: Object })
</script>

<template>
  <article class="group min-w-0 bg-white">
    <RouterLink :to="'/products/' + product.slug" class="relative block aspect-[4/3] w-full overflow-hidden bg-yuwo-soft">
      <img v-if="product.image" :src="product.image" :alt="product.name" loading="lazy" class="h-full w-full object-contain p-3 transition-transform duration-500 group-hover:scale-[1.03]">
      <div v-else class="flex h-full items-center justify-center text-xs text-yuwo-muted">Image coming soon</div>
      <span v-if="product.tag" class="absolute left-3 top-3 bg-white px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-yuwo-navy shadow-sm">{{ product.tag }}</span>
      <span class="absolute inset-x-0 bottom-0 translate-y-full bg-yuwo-navy/95 px-3 py-3 text-center text-[10px] font-bold text-white transition-transform duration-200 group-hover:translate-y-0">View details ↗</span>
    </RouterLink>
    <div class="px-px py-4">
      <div class="flex items-center justify-between gap-2 text-[9px] uppercase tracking-widest text-[#8a929c]"><span>{{ product.category }}</span><span>{{ product.size }}</span></div>
      <RouterLink :to="'/products/' + product.slug" class="mt-2 block font-display text-[15px] font-bold leading-snug text-yuwo-ink hover:text-yuwo-navy">{{ product.name }}</RouterLink>
      <p class="mb-3 mt-1 min-h-9 text-[11px] leading-relaxed text-yuwo-muted">{{ product.short }}</p>
      <div class="flex items-center gap-2"><strong class="text-[15px] font-bold text-yuwo-ink">{{ money(product.price) }}</strong><del v-if="product.compareAt" class="text-[11px] text-[#9ba2aa]">{{ money(product.compareAt) }}</del></div>
      <RouterLink :to="'/products/' + product.slug" class="mt-3 inline-flex items-center gap-2 text-[11px] font-bold text-yuwo-navy hover:gap-3">Choose options <span>→</span></RouterLink>
    </div>
  </article>
</template>
