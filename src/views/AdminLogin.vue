<script setup>
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { supabase } from "../lib/supabase";

const route = useRoute();
const router = useRouter();
const username = ref("");
const password = ref("");
const loading = ref(false);
const error = ref("");

async function signIn() {
  error.value = "";
  if (!supabase) {
    error.value =
      "Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to your environment.";
    return;
  }
  const normalizedUsername = username.value.trim().toLowerCase();
  if (!/^[a-z0-9][a-z0-9._-]{2,23}$/.test(normalizedUsername)) {
    error.value = "Enter a valid username (3–24 letters, numbers, dots, underscores or hyphens).";
    return;
  }

  loading.value = true;
  const { error: authError } = await supabase.auth.signInWithPassword({
    email: `${normalizedUsername}@users.yuwo.invalid`,
    password: password.value,
  });
  loading.value = false;
  if (authError) {
    error.value = "Invalid username or password.";
    return;
  }
  const destination =
    typeof route.query.redirect === "string" ? route.query.redirect : "/admin";
  router.replace(destination);
}
</script>

<template>
  <main class="flex min-h-screen items-center justify-center bg-[#f5f6f7] px-5 py-12">
    <section class="w-full max-w-md border border-yuwo-line bg-white p-7 shadow-sm sm:p-10">
      <RouterLink to="/" class="inline-flex flex-col leading-none text-yuwo-navy">
        <span class="font-display text-3xl font-extrabold tracking-[-.08em]">YUWO</span>
        <small class="mt-1 text-[8px] font-bold tracking-[.22em]">ADMINISTRATION</small>
      </RouterLink>
      <p class="mt-10 text-[10px] font-bold tracking-[.18em] text-[#a17c20]">SECURE ACCESS</p>
      <h1 class="mt-2 font-display text-3xl font-bold text-yuwo-ink">Admin sign in</h1>
      <p class="mt-2 text-sm leading-6 text-yuwo-muted">Sign in with your YUWO username and password.</p>

      <form class="mt-8 grid gap-5" @submit.prevent="signIn">
        <label class="grid gap-2 text-xs font-semibold text-yuwo-ink">
          Username
          <input v-model="username" type="text" autocomplete="username" required maxlength="24"
            class="w-full border border-yuwo-line px-3 py-3 text-sm outline-yuwo-navy"
            placeholder="Enter your username" />
        </label>
        <label class="grid gap-2 text-xs font-semibold text-yuwo-ink">
          Password
          <input v-model="password" type="password" autocomplete="current-password" required
            class="w-full border border-yuwo-line px-3 py-3 text-sm outline-yuwo-navy"
            placeholder="Your password" />
        </label>
        <p v-if="error" role="alert" class="border border-red-200 bg-red-50 px-3 py-3 text-xs leading-5 text-red-700">{{ error }}</p>
        <button :disabled="loading" class="w-full bg-yuwo-navy px-5 py-4 text-xs font-bold text-white disabled:cursor-wait disabled:opacity-60">
          {{ loading ? "Signing in…" : "Sign in to dashboard" }}
        </button>
      </form>
      <RouterLink to="/" class="mt-7 inline-block text-xs font-semibold text-yuwo-muted hover:text-yuwo-navy">← Back to storefront</RouterLink>
    </section>
  </main>
</template>
