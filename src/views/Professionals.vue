
<script setup>
import { ref } from 'vue'
import {
  Check,
  FileText,
  Handshake,
  Truck
} from 'lucide-vue-next'

const form = ref({
  name: '',
  company: '',
  email: '',
  phone: '',
  quantity: '3–5 sets',
  message: ''
})

function submit() {
  const text = encodeURIComponent(
    `YUWO project pricing inquiry
Name: ${form.value.name}
Company: ${form.value.company}
Email: ${form.value.email}
Phone: ${form.value.phone}
Quantity: ${form.value.quantity}
Project: ${form.value.message}`
  )

  window.open(
    `https://wa.me/639985412344?text=${text}`,
    '_blank'
  )
}
</script>

<template>
  <!-- Page Hero -->
  <section class="page-hero">
    <div class="eyebrow light-eyebrow">
      YUWO FOR PROFESSIONALS
    </div>

    <h1>
      Sinks your clients<br />
      <em>will love.</em>
    </h1>

    <p>
      For contractors, builders, architects and interior designers.
      Your partner from quote to after-sales.
    </p>
  </section>

  <!-- Professionals Section -->
  <section class="container professional-page">
    <div class="pro-intro">
      <div>
        <div class="eyebrow">BUILT FOR YOUR PROJECTS</div>

        <h2>
          Good products.<br />
          Reliable support.
        </h2>

        <p>
          Whether you're working on one home or a larger development,
          we'll help you specify the right sink and plan your order.
        </p>
      </div>

      <div class="pro-benefits">
        <span>
          <Check />
          Project pricing for 3 or more sets
        </span>

        <span>
          <Check />
          Discount from your 4th order
        </span>

        <span>
          <FileText />
          Spec sheet and cutting template
        </span>

        <span>
          <Truck />
          Reserve stock for your timeline
        </span>

        <span>
          <Handshake />
          Lifetime after-sales support
        </span>
      </div>
    </div>

    <!-- Project Inquiry Panel -->
    <div class="inquiry-panel">
      <div>
        <div class="eyebrow">
          LET'S TALK ABOUT YOUR PROJECT
        </div>

        <h2>Request project pricing.</h2>

        <p>
          Share a few details and our team will get back to you
          to discuss your requirements.
        </p>

        <p class="form-note">
          Submitting opens a WhatsApp message for your review.
          No details are sent automatically.
        </p>
      </div>

      <form @submit.prevent="submit">
        <label>
          Your name
          <input
            v-model="form.name"
            required
            placeholder="Full name"
          />
        </label>

        <label>
          Company / business
          <input
            v-model="form.company"
            placeholder="Company name"
          />
        </label>

        <label>
          Email address
          <input
            v-model="form.email"
            type="email"
            required
            placeholder="you@example.com"
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
          Estimated quantity
          <select v-model="form.quantity">
            <option>3–5 sets</option>
            <option>6–10 sets</option>
            <option>11–25 sets</option>
            <option>More than 25 sets</option>
          </select>
        </label>

        <label>
          Tell us about your project
          <textarea
            v-model="form.message"
            rows="3"
            placeholder="Project location, timeline, preferred sizes..."
          ></textarea>
        </label>

        <button class="btn primary full">
          Request a project quote →
        </button>
      </form>
    </div>
  </section>
</template>
