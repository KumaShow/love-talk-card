<template>
  <section
    class="flex flex-col items-center gap-4 rounded-[var(--radius-card)] bg-white/85 p-8 text-center text-ink shadow-[var(--shadow-card)]"
    data-test="end-message"
  >
    <p class="text-xs uppercase tracking-[0.3em] text-brand">{{ eyebrow }}</p>
    <h2 class="text-2xl font-semibold leading-[1.6]">{{ theme.endMessage.zh }}</h2>
    <p class="end-message__en">{{ theme.endMessage.en }}</p>
    <button
      type="button"
      class="end-message__cta min-h-[44px] min-w-[44px] cursor-pointer rounded-[var(--radius-pill)] border-0 bg-brand px-7 py-3 font-semibold text-white"
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
.end-message__en {
  font-size: 1rem;
  line-height: 1.6;
  color: color-mix(in srgb, var(--color-ink) 75%, transparent);
}

.end-message__cta {
  transition: filter 200ms ease;
}

.end-message__cta:hover,
.end-message__cta:focus-visible {
  filter: brightness(1.05);
  outline: none;
}
</style>
