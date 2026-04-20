<template>
  <section class="end-message" data-test="end-message">
    <p class="end-message__eyebrow">{{ eyebrow }}</p>
    <h2 class="end-message__zh">{{ theme.endMessage.zh }}</h2>
    <p class="end-message__en">{{ theme.endMessage.en }}</p>
    <button
      type="button"
      class="end-message__cta"
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
.end-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  border-radius: 2rem;
  background: rgba(255, 255, 255, 0.85);
  text-align: center;
  color: var(--color-text);
  box-shadow: 0 18px 40px -22px rgba(0, 0, 0, 0.25);
}

.end-message__eyebrow {
  font-size: 0.75rem;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--color-primary);
}

.end-message__zh {
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.6;
}

.end-message__en {
  font-size: 1rem;
  line-height: 1.6;
  color: color-mix(in srgb, var(--color-text) 75%, transparent);
}

.end-message__cta {
  min-width: 44px;
  min-height: 44px;
  padding: 0.75rem 1.75rem;
  border: none;
  border-radius: 999px;
  background: var(--color-primary);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: filter 200ms ease;
}

.end-message__cta:hover,
.end-message__cta:focus-visible {
  filter: brightness(1.05);
  outline: none;
}
</style>
