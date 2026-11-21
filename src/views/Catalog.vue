
<script setup>
import { ref, computed } from 'vue'
import { Search, SlidersHorizontal } from 'lucide-vue-next'
import ProductCard from '../components/ProductCard.vue'
import { products } from '../data/store'

const filter = ref('All')
const search = ref('')
const sort = ref('featured')

const shown = computed(() => {
  let a = products.filter(
    (p) =>
      (filter.value === 'All' || p.category === filter.value) &&
      `${p.name} ${p.size}`
        .toLowerCase()
        .includes(search.value.toLowerCase())
  )

  if (sort.value === 'low') {
    a.sort((x, y) => x.price - y.price)
  }

  if (sort.value === 'high') {
    a.sort((x, y) => y.price - x.price)
  }

  return a
})
</script>

<template>
  <section class="page-hero">
    <div class="eyebrow light-eyebrow">THE YUWO COLLECTION</div>

    <h1>
      Find your perfect<br />
      <em>kitchen sink.</em>
    </h1>

    <p>
      Complete 304 stainless steel sink sets. Thoughtful details, practical
      accessories and support from order to after-sales.
    </p>
  </section>

  <section class="container catalog-wrap">
    <div class="catalog-intro">
      <div>
        <div class="eyebrow">SINKS & FAUCETS</div>

        <h2>Explore all products</h2>

        <p>
          Choose a style, compare sizes and find the right fit for your kitchen.
        </p>
      </div>

      <div class="catalog-count">
        {{ shown.length }} products
      </div>
    </div>

    <div class="catalog-tools">
      <div class="filter-pills">
        <button
          v-for="f in ['All', 'Undermount', 'Topmount']"
          :key="f"
          :class="{ selected: filter === f }"
          @click="filter = f"
        >
          {{ f }}
        </button>
      </div>

      <div class="catalog-controls">
        <label class="search-box">
          <Search :size="17" />

          <input
            v-model="search"
            placeholder="Search sinks"
          />
        </label>

        <select v-model="sort" aria-label="Sort products">
          <option value="featured">Featured</option>
          <option value="low">Price: low to high</option>
          <option value="high">Price: high to low</option>
        </select>
      </div>
    </div>

    <div class="product-grid">
      <ProductCard
        v-for="p in shown"
        :key="p.id"
        :product="p"
      />
    </div>

    <div v-if="!shown.length" class="empty-state">
      No products match your search.
    </div>
  </section>
</template>
