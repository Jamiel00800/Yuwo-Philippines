
<script setup>
import { ref, computed, watch } from 'vue'
import { RouterLink, RouterView } from 'vue-router'

import {
  ShoppingBag,
  Menu,
  X,
  Phone,
  Trash2,
  Plus,
  Minus
} from 'lucide-vue-next'

import { products, money } from './data/store'

// State
const menu = ref(false)
const cartOpen = ref(false)

const cart = ref(
  JSON.parse(localStorage.getItem('yuwo-cart') || '[]')
)

// Persist cart data
watch(
  cart,
  (value) => {
    localStorage.setItem('yuwo-cart', JSON.stringify(value))
  },
  { deep: true }
)

// Computed properties
const count = computed(() =>
  cart.value.reduce((sum, item) => sum + item.qty, 0)
)

const subtotal = computed(() =>
  cart.value.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  )
)

// Add product to cart
function add(item, variant, qty = 1) {
  const name = variant?.name || 'Standard set'
  const price = variant?.price || item.price
  const key = item.id + '-' + name

  const found = cart.value.find(
    (item) => item.key === key
  )

  if (found) {
    found.qty += qty
  } else {
    cart.value.push({
      key,
      id: item.id,
      name: item.name,
      variant: name,
      price,
      qty,
      image: item.image
    })
  }

  cartOpen.value = true
}

// Change cart quantity
function change(item, d) {
  item.qty += d

  if (item.qty < 1) {
    cart.value = cart.value.filter(
      (x) => x.key !== item.key
    )
  }
}

// Checkout through WhatsApp
function checkout() {
  const lines = cart.value
    .map(
      (item) =>
        `${item.name} — ${item.variant} × ${item.qty} — ${money(item.price * item.qty)}`
    )
    .join('\n')

  const msg = encodeURIComponent(
    `Hello YUWO! I would like to inquire about this order:\n${lines}\nSubtotal: ${money(subtotal.value)}\nPlease confirm availability and delivery fee.`
  )

  window.open(
    `https://wa.me/639985412344?text=${msg}`,
    '_blank'
  )
}
</script>

<template>
  <!-- Announcement Bar -->
  <div class="announcement">
    Nationwide Delivery
    <span>·</span>
    Real 304 Stainless Steel
    <span>·</span>
    Call or text
    <a href="tel:+639985412344">0998 541 2344</a>
  </div>

  <!-- Header / Navigation -->
  <header class="header">
    <div class="nav-wrap">
      <button
        class="icon-btn mobile-only"
        @click="menu = !menu"
        aria-label="Toggle menu"
      >
        <Menu v-if="!menu" />
        <X v-else />
      </button>

      <RouterLink to="/" class="brand">
        <span>YUWO</span>
        <small>EUROPEAN TECHNOLOGY</small>
      </RouterLink>

      <nav :class="{ open: menu }">
        <RouterLink @click="menu = false" to="/">
          Home
        </RouterLink>

        <RouterLink
          @click="menu = false"
          to="/collections/all"
        >
          All Products
        </RouterLink>

        <RouterLink
          @click="menu = false"
          to="/blogs/articles"
        >
          Articles
        </RouterLink>

        <RouterLink
          @click="menu = false"
          to="/pages/for-professionals"
        >
          For Professionals
        </RouterLink>

        <RouterLink
          @click="menu = false"
          to="/pages/contact"
        >
          Contact
        </RouterLink>
      </nav>

      <div class="nav-actions">
        <a class="phone-link" href="tel:+639985412344">
          <Phone :size="16" />
          0998 541 2344
        </a>

        <button
          class="cart-trigger"
          @click="cartOpen = true"
          aria-label="Open cart"
        >
          <ShoppingBag :size="20" />
          <span>{{ count }}</span>
        </button>
      </div>
    </div>
  </header>

  <!-- Main Content -->
  <main>
    <RouterView
      :products="products"
      :add-to-cart="add"
    />
  </main>

  <!-- Footer -->
  <footer class="footer">
    <div class="footer-grid">
      <div>
        <RouterLink to="/" class="brand light">
          <span>YUWO</span>
          <small>EUROPEAN TECHNOLOGY</small>
        </RouterLink>

        <p>
          Made for Filipino families.<br>
          High quality raw materials from Switzerland,
          Spain & PRC.
        </p>
      </div>

      <div>
        <h4>Explore</h4>

        <RouterLink to="/collections/all">
          All products
        </RouterLink>

        <RouterLink to="/blogs/articles">
          Kitchen guides
        </RouterLink>

        <RouterLink to="/pages/for-professionals">
          For professionals
        </RouterLink>
      </div>

      <div>
        <h4>Get in touch</h4>

        <a href="tel:+639985412344">
          0998 541 2344
        </a>

        <a href="mailto:yuwophilippines@gmail.com">
          yuwophilippines@gmail.com
        </a>

        <a href="https://m.me/" target="_blank">
          Facebook Messenger ↗
        </a>
      </div>

      <div>
        <h4>Showroom</h4>

        <p>
          B14 L21 Acacia St., Vista Verde South,
          Bacoor, Cavite<br>
          Mon–Sat · 11am–5pm
        </p>
      </div>
    </div>

    <div class="footer-bottom">
      © {{ new Date().getFullYear() }} YUWO Philippines

      <span>
        European Technology · Made with Filipino Families
      </span>
    </div>
  </footer>

  <!-- Shopping Cart Overlay -->
  <div
    v-if="cartOpen"
    class="overlay"
    @click.self="cartOpen = false"
  >
    <aside class="cart-drawer">

      <!-- Cart Header -->
      <div class="drawer-head">
        <h3>Your cart ({{ count }})</h3>

        <button
          class="icon-btn"
          @click="cartOpen = false"
          aria-label="Close cart"
        >
          <X />
        </button>
      </div>

      <!-- Empty Cart -->
      <div v-if="!cart.length" class="empty-cart">
        <ShoppingBag :size="42" />

        <h3>Your cart is empty</h3>

        <p>Find the right sink for your kitchen.</p>

        <RouterLink
          class="btn primary"
          to="/collections/all"
          @click="cartOpen = false"
        >
          Shop sinks
        </RouterLink>
      </div>

      <!-- Cart Items -->
      <div v-else class="cart-lines">
        <div
          v-for="item in cart"
          :key="item.key"
          class="cart-line"
        >
          <img
            :src="item.image"
            :alt="item.name"
          >

          <div class="cart-line-info">
            <b>{{ item.name }}</b>
            <small>{{ item.variant }}</small>
            <strong>{{ money(item.price) }}</strong>

            <div class="qty">
              <button @click="change(item, -1)">
                <Minus :size="13" />
              </button>

              {{ item.qty }}

              <button @click="change(item, 1)">
                <Plus :size="13" />
              </button>
            </div>
          </div>

          <button
            class="remove"
            @click="cart = cart.filter(x => x.key !== item.key)"
            aria-label="Remove item"
          >
            <Trash2 :size="16" />
          </button>
        </div>
      </div>

      <!-- Cart Footer -->
      <div v-if="cart.length" class="cart-foot">
        <div class="subtotal">
          <span>Subtotal</span>
          <b>{{ money(subtotal) }}</b>
        </div>

        <p>
          No payment yet. We will confirm your order
          and delivery fee.
        </p>

        <button
          class="btn primary full"
          @click="checkout"
        >
          Send order inquiry
          <span>↗</span>
        </button>

        <small>
          Checkout opens a WhatsApp inquiry.
          No online payment is collected.
        </small>
      </div>

    </aside>
  </div>
</template>
