<script setup>
import { ref } from 'vue'
import { ChevronDown } from 'lucide-vue-next'

defineProps({
  items: Array
})

const active = ref(0)
</script>

<template>
  <div class="divide-y divide-yuwo-line">
    <div
      v-for="(item, i) in items"
      :key="item[0]"
      class="py-1"
    >
      <button
        class="flex w-full items-center justify-between gap-4 py-4 text-left text-sm font-bold text-yuwo-ink"
        :aria-expanded="active === i"
        @click="active = active === i ? -1 : i"
      >
        <span>{{ item[0] }}</span>
        <ChevronDown
          :size="18"
          class="shrink-0 text-[#9b7a29] transition-transform duration-200"
          :class="{ 'rotate-180': active === i }"
        />
      </button>

      <div
        v-if="active === i"
        class="max-w-3xl pb-5 pr-9 text-xs leading-7 text-yuwo-muted"
      >
        {{ item[1] }}
      </div>
    </div>
  </div>
</template>