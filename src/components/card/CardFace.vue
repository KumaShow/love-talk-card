<template>
  <article class="card-face" data-test="card-face">
    <!-- T047：私密牌裝飾浮水印，opacity 0.15，不影響可讀性（pointer-events:none、z-index:0） -->
    <div
      v-if="card.isIntimate"
      class="card-face__watermark"
      data-test="intimate-watermark"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        role="presentation"
        focusable="false"
      >
        <!-- 自刻 heart-solid path，與 Heroicons 風格相近 -->
        <path
          d="M12 21s-7.5-4.5-9.5-10.2C1.2 6.7 4.1 3 8 3c2 0 3.3 1 4 2.2C12.7 4 14 3 16 3c3.9 0 6.8 3.7 5.5 7.8C19.5 16.5 12 21 12 21z"
        />
      </svg>
    </div>
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
  position: relative;
  z-index: 1;
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
  position: relative;
  z-index: 1;
  font-family: ui-serif, Georgia, 'Times New Roman', serif;
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.5;
}

.card-face__secondary {
  position: relative;
  z-index: 1;
  font-size: 1rem;
  line-height: 1.5;
  color: color-mix(in srgb, var(--color-text) 75%, transparent);
}

/* T047：私密牌裝飾浮水印覆蓋層，填滿卡面、置中、半透明，且不可點擊 */
.card-face__watermark {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.15;
  pointer-events: none;
  color: var(--color-primary);
  z-index: 0;
}

.card-face__watermark svg {
  width: min(60%, 240px);
  height: auto;
}
</style>
