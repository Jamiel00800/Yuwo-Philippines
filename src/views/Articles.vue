<script setup>
import { onMounted, ref } from 'vue'
import { supabase } from '../lib/supabase'

const articles = ref([])
const selected = ref(null)
const loading = ref(true)
const error = ref('')

async function loadArticles() {
  try {
    if (!supabase) throw new Error('Articles are temporarily unavailable.')
    const { data, error: queryError } = await supabase
      .from('articles')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
    if (queryError) throw queryError
    articles.value = data || []
  } catch (err) {
    error.value = err.message || 'Unable to load articles.'
  } finally {
    loading.value = false
  }
}

onMounted(loadArticles)
</script>

<template>
  <section class="bg-yuwo-navy px-6 py-16 text-white lg:px-8 lg:py-20"><div class="mx-auto max-w-7xl"><div class="mb-4 text-[10px] font-bold tracking-[.18em] text-yuwo-gold">THE YUWO JOURNAL</div><h1 class="font-display text-4xl font-extrabold leading-tight tracking-[-.05em] sm:text-6xl">Kitchen sink guides<br><em class="font-medium">& useful advice.</em></h1><p class="mt-5 max-w-xl text-sm leading-7 text-blue-100">Simple, honest answers before you buy, from choosing the right size to keeping your sink like new.</p></div></section>
  <section class="mx-auto max-w-7xl px-5 py-14 sm:py-20 lg:px-8">
    <div v-if="loading" class="py-16 text-center text-sm text-yuwo-muted">Loading articles…</div>
    <div v-else-if="error" role="alert" class="border border-red-200 bg-red-50 p-5 text-sm text-red-700">{{ error }}</div>
    <div v-else-if="!selected && !articles.length" class="py-16 text-center"><h2 class="font-display text-2xl font-bold">New guides are coming soon.</h2><p class="mt-2 text-sm text-yuwo-muted">Our team is preparing helpful articles for your kitchen projects.</p></div>
    <div v-else-if="!selected" class="grid gap-6 md:grid-cols-2"><button v-for="article in articles" :key="article.id" class="group overflow-hidden border border-yuwo-line bg-white text-left" @click="selected=article"><img v-if="article.cover_image" :src="article.cover_image" :alt="article.title" class="h-52 w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"><div class="p-6"><small class="text-[9px] font-bold uppercase tracking-widest text-[#a17c20]">{{ article.type }} · {{ article.read_time }}</small><h3 class="mt-3 font-display text-lg font-bold leading-snug">{{ article.title }}</h3><p class="mt-3 text-xs leading-6 text-yuwo-muted">{{ article.excerpt }}</p><span class="mt-4 inline-block text-xs font-bold text-yuwo-navy">Read article →</span></div></button></div>
    <article v-else class="mx-auto max-w-3xl"><button class="mb-8 text-xs font-bold text-yuwo-navy" @click="selected=null">← Back to all guides</button><div class="text-[10px] font-bold uppercase tracking-widest text-[#a17c20]">{{ selected.type }} · {{ selected.read_time }}</div><h1 class="mt-3 font-display text-3xl font-extrabold leading-tight sm:text-4xl">{{ selected.title }}</h1><img v-if="selected.cover_image" :src="selected.cover_image" :alt="selected.title" class="my-6 max-h-[480px] w-full object-cover"><div class="whitespace-pre-line text-sm leading-8 text-yuwo-muted">{{ selected.content || selected.excerpt }}</div></article>
  </section>
</template>
