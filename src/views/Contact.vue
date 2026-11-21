
<script setup>
import { ref } from 'vue'

const form = ref({
  name: '',
  phone: '',
  email: '',
  message: ''
})

function submit() {
  const m = encodeURIComponent(
    `Hello YUWO, I have an inquiry.
Name: ${form.value.name}
Phone: ${form.value.phone}
Email: ${form.value.email}
Message: ${form.value.message}`
  )

  window.open(
    `https://wa.me/639985412344?text=${m}`,
    '_blank'
  )
}
</script>

<template>
  <section class="page-hero">
    <div class="eyebrow light-eyebrow">WE'RE HERE TO HELP</div>

    <h1>
      Let's talk<br />
      <em>about your kitchen.</em>
    </h1>

    <p>
      From choosing the right size to planning installation, kasama mo kami.
    </p>
  </section>

  <section class="container contact-page">
    <div class="contact-info">
      <div class="eyebrow">GET IN TOUCH</div>

      <h2>
        Need help choosing<br />
        your sink?
      </h2>

      <p>
        Tell us what you're planning. Our team can help you find the right size
        and set.
      </p>

      <a href="tel:+639985412344" class="contact-row">
        <span>PHONE / TEXT</span>
        <b>0998 541 2344</b>
      </a>

      <a href="mailto:yuwophilippines@gmail.com" class="contact-row">
        <span>EMAIL</span>
        <b>yuwophilippines@gmail.com</b>
      </a>

      <a href="https://m.me/" class="contact-row">
        <span>MESSENGER</span>
        <b>Chat with YUWO ↗</b>
      </a>

      <div class="showroom-card">
        <div class="eyebrow">VISIT OUR SHOWROOM</div>

        <b>
          B14 L21 Acacia St., Vista Verde South, Bacoor, Cavite
        </b>

        <p>
          Monday to Saturday<br />
          11:00 AM – 5:00 PM
        </p>

        <a
          href="https://maps.google.com/?q=B14+L21+Acacia+St+Vista+Verde+South+Bacoor+Cavite"
          target="_blank"
        >
          Get directions ↗
        </a>
      </div>
    </div>

    <form class="contact-form" @submit.prevent="submit">
      <h3>Send us a message</h3>

      <label>
        Your name
        <input
          v-model="form.name"
          required
          placeholder="Full name"
        />
      </label>

      <label>
        Phone number
        <input
          v-model="form.phone"
          required
          placeholder="09XX XXX XXXX"
        />
      </label>

      <label>
        Email address
        <input
          v-model="form.email"
          type="email"
          placeholder="you@example.com"
        />
      </label>

      <label>
        How can we help?
        <textarea
          v-model="form.message"
          rows="5"
          required
          placeholder="Tell us what you need..."
        ></textarea>
      </label>

      <button class="btn primary full">
        Continue to WhatsApp →
      </button>

      <small>
        You'll be able to review your message before sending.
      </small>
    </form>
  </section>
</template>
