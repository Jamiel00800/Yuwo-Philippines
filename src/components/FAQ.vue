
<script setup>
import { ref } from 'vue'
import { ChevronDown } from 'lucide-vue-next'

defineProps({
  items: Array
})

const active = ref(0)
</script>

<template>
  <div class="faq-list">
    <div
      v-for="(item, i) in items"
      :key="item[0]"
      class="faq-item"
      :class="{ active: active === i }"
    >
      <button @click="active = active === i ? -1 : i">
        <span>{{ item[0] }}</span>
        <ChevronDown :size="18" />
      </button>

      <div v-if="active === i" class="faq-answer">
        {{ item[1] }}
      </div>
    </div>
  </div>
</template>
