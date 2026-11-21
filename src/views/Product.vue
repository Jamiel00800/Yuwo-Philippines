
<script setup>
import { computed, ref } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import {
  Check,
  Truck,
  ShieldCheck,
  ChevronRight,
  Plus,
  Minus
} from 'lucide-vue-next'

import FAQ from '../components/FAQ.vue'
import { products, money, faqs } from '../data/store'

const props = defineProps({
  addToCart: Function
})

const route = useRoute()

const product = computed(() =>
  products.find(p => p.slug === route.params.slug) || products[0]
)

const selected = ref(0)
const qty = ref(1)

const variant = computed(() =>
  product.value.variants?.[selected.value] || {
    name: 'Standard set',
    price: product.value.price
  }
)

const productFaq = [
  faqs[0],
  faqs[5],
  faqs[7],
  faqs[8]
]
</script>

<template>
  <div class="container product-page">
    <div class="breadcrumbs">
      <RouterLink to="/">Home</RouterLink>
      <ChevronRight />

      <RouterLink to="/collections/all">
        Sinks & Faucets
      </RouterLink>

      <ChevronRight />
      <span>{{ product.name }}</span>
    </div>

    <div class="product-detail">
      <div class="product-gallery">
        <div class="main-product-image">
          <img
            :src="product.image"
            :alt="product.name"
          >
        </div>

        <div class="gallery-caption">
          YUWO · Made for Filipino families
        </div>
      </div>

      <div class="product-buy">
        <div class="eyebrow">
          {{ product.category }} · {{ product.size }}
        </div>

        <h1>{{ product.name }}</h1>

        <p class="product-description">
          {{ product.short }} Made with brand-new 304 stainless
          steel and designed with practical accessories for
          everyday kitchen use.
        </p>

        <div class="product-price">
          <strong>{{ money(variant.price) }}</strong>
          <del>{{ money(product.compareAt) }}</del>

          <span>
            Save {{ money(product.compareAt - variant.price) }}
          </span>
        </div>

        <div class="payment-note">
          Promo price · GCash or bank transfer
        </div>

        <label class="field-label">Choose your set</label>

        <div class="variant-list">
          <button
            v-for="(v, i) in product.variants"
            :key="v.name"
            :class="{ chosen: selected === i }"
            @click="selected = i"
          >
            <span class="radio-dot"></span>
            <span>{{ v.name }}</span>
            <b>{{ money(v.price) }}</b>
          </button>
        </div>

        <label class="field-label">Quantity</label>

        <div class="qty large">
          <button @click="qty = Math.max(1, qty - 1)">
            <Minus />
          </button>

          {{ qty }}

          <button @click="qty++">
            <Plus />
          </button>
        </div>

        <button
          class="btn primary full add-btn"
          @click="props.addToCart(product, variant, qty)"
        >
          Add to cart
          <span>· {{ money(variant.price * qty) }}</span>
        </button>

        <p class="no-payment">
          No payment yet. We call you to confirm availability
          and delivery fee.
        </p>

        <div class="benefit-list">
          <span>
            <Check />
            100% quality inspection before shipping
          </span>

          <span>
            <ShieldCheck />
            Factory defect replacement within 15 days
          </span>

          <span>
            <Truck />
            Nationwide delivery
          </span>

          <span>
            <Check />
            We guide your installer by phone
          </span>
        </div>

        <div class="project-note">
          Buying 3 or more?

          <RouterLink to="/pages/for-professionals">
            Ask about project pricing →
          </RouterLink>
        </div>
      </div>
    </div>

    <section class="product-content">
      <div>
        <div class="eyebrow">EVERYTHING IN THE BOX</div>

        <h2>
          More function.<br>
          Less counter clutter.
        </h2>

        <p>
          Workstation accessories help you wash, prep and drain
          in one convenient space.
        </p>
      </div>

      <ul class="included-list">
        <li>Sink basin in 304 stainless steel</li>
        <li>Solid wood chopping board</li>
        <li>304 stainless drain basket</li>
        <li>Small basin and sink grid</li>
        <li>Drain, fittings and hoses</li>
        <li>Installation manual and cutting template</li>
        <li>Pull-out faucet, if selected</li>
      </ul>
    </section>

    <section class="specs-section">
      <div>
        <div class="eyebrow">PRODUCT DETAILS</div>
        <h2>Specifications</h2>
      </div>

      <div class="spec-table">
        <div>
          <span>Product</span>
          <b>{{ product.name }}</b>
        </div>

        <div>
          <span>Size</span>
          <b>{{ product.size }}</b>
        </div>

        <div>
          <span>Material</span>
          <b>TRUE 304 stainless steel</b>
        </div>

        <div>
          <span>Finish</span>
          <b>YUWO anti-scratch finish</b>
        </div>

        <div>
          <span>Installation</span>
          <b>
            {{ product.category }} · Flush mount may be possible
          </b>
        </div>
      </div>
    </section>

    <section class="product-faq">
      <div>
        <div class="eyebrow">NEED A HAND?</div>

        <h2>
          Questions about<br>
          your sink?
        </h2>

        <p>
          Send us a photo of your counter and our team can help
          you check the fit.
        </p>

        <a href="https://m.me/" class="text-link">
          Message YUWO →
        </a>
      </div>

      <FAQ :items="productFaq" />
    </section>
  </div>
</template>
