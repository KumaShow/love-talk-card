<template>
  <article class="card-face" data-test="card-face">
    <div class="card-face__meta">
      <span class="card-face__level">Lv.{{ card.level }}</span>
      <span v-if="card.isIntimate" class="card-face__intimate" data-test="intimate-indicator">
        <slot name="intimate-indicator">♥</slot>
      </span>
    </div>
    <p class="card-face__primary" data-test="card-primary-text">
      {{ card.text.zh }}
    </p>
    <p v-if="secondaryText" class="card-face__secondary" data-test="card-secondary-text">
      {{ secondaryText }}
    </p>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import type { Card } from '@/types'

const props = defineProps<{
  card: Card
  /** 副語言預覽文字。由父層（US3 實作後）注入；為空時僅顯示主語言。 */
  secondaryText?: string
}>()

const secondaryText = computed(() => props.secondaryText?.trim() || '')
</script>

<style scoped>
.card-face {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  padding: 1.75rem;
  border-radius: 1.75rem;
  background: #ffffff;
  color: var(--color-text);
  box-shadow: 0 18px 40px -18px rgba(0, 0, 0, 0.3);
  transform: rotateY(180deg);
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.card-face__meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--color-text) 60%, transparent);
}

.card-face__intimate {
  font-size: 1.25rem;
  color: var(--color-primary);
}

.card-face__primary {
  font-family: ui-serif, Georgia, 'Times New Roman', serif;
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.5;
}

.card-face__secondary {
  font-size: 1rem;
  line-height: 1.5;
  color: color-mix(in srgb, var(--color-text) 75%, transparent);
}
</style>
