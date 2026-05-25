<template>
  <section
    class="flex flex-col items-center gap-4 rounded-[var(--radius-card)] bg-white/85 p-8 text-center text-ink shadow-[var(--shadow-card)] max-[23rem]:p-6"
    data-test="end-message"
  >
    <p class="text-xs uppercase tracking-normal text-brand">{{ eyebrow }}</p>
    <h2 class="m-0 text-2xl font-semibold leading-[1.6] max-[23rem]:text-[1.3rem]">
      {{ theme.endMessage.zh }}
    </h2>
    <p class="end-message-en m-0 text-base leading-[1.6] max-[23rem]:text-[0.92rem]">
      {{ theme.endMessage.en }}
    </p>
    <button
      type="button"
      class="min-h-11 min-w-11 cursor-pointer rounded-[var(--radius-pill)] border-0 bg-brand px-7 py-3 font-semibold text-white transition duration-200 hover:brightness-105 focus-visible:outline-none focus-visible:brightness-105"
      data-test="end-message-cta"
      @click="emit('back')"
    >
      {{ ctaLabel }}
    </button>
  </section>
</template>

<script setup lang="ts">
import type { Theme } from '@/types'

defineProps<{
  theme: Theme
  eyebrow: string
  ctaLabel: string
}>()

const emit = defineEmits<{
  back: []
}>()
</script>

<style scoped>
/* 副標英文：以 color-mix 調出半透明墨色，不易用 utility 表達故保留 scoped */
.end-message-en {
  color: color-mix(in srgb, var(--color-ink) 75%, transparent);
}
</style>
