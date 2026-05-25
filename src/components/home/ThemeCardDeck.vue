<template>
  <button
    type="button"
    class="poc-theme-card flex w-full cursor-pointer flex-col items-center gap-[0.55rem] rounded-[var(--radius-panel)] border-0 bg-transparent px-2 pb-3 pt-2 text-ink"
    :style="{ '--color-card': theme.colors.cardBack }"
    :data-test="`theme-deck-${theme.id}`"
    :aria-label="`${zhName} 主題卡堆`"
    @click="$emit('select', theme)"
  >
    <div class="poc-theme-card__stack" aria-hidden="true">
      <span class="poc-theme-card__back poc-theme-card__back--deep"></span>
      <span class="poc-theme-card__back poc-theme-card__back--mid"></span>
      <span class="poc-theme-card__back poc-theme-card__back--top">
        <span class="poc-theme-card__glyph">♥</span>
      </span>
    </div>
    <span class="font-serif text-[1.05rem] font-semibold text-ink">{{ zhName }}</span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import type { Theme } from '@/types'

const props = defineProps<{ theme: Theme }>()

defineEmits<{
  select: [theme: Theme]
}>()

const zhName = computed(() => props.theme.name.zh)
</script>

<style scoped>
.poc-theme-card {
  --color-card: #c76d8e;
  box-sizing: border-box;
  transition: transform 200ms ease;
}

.poc-theme-card:hover {
  transform: translateY(-3px);
}

.poc-theme-card:active {
  transform: translateY(-1px);
}

/* 三層堆疊卡背：後兩張微幅錯位 + 旋轉，製造牌堆厚度感 */
.poc-theme-card__stack {
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 4;
}

.poc-theme-card__back {
  position: absolute;
  inset: 0;
  border-radius: 1.5rem;
  background: linear-gradient(
    145deg,
    color-mix(in srgb, var(--color-card) 82%, white),
    var(--color-card)
  );
  box-shadow: 0 14px 28px -14px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.poc-theme-card__back--deep {
  transform: translate(6px, 6px) rotate(2deg);
  filter: brightness(0.88);
}

.poc-theme-card__back--mid {
  transform: translate(3px, 3px) rotate(1deg);
  filter: brightness(0.94);
}

.poc-theme-card__back--top {
  transform: translate(0, 0) rotate(0);
}

.poc-theme-card__glyph {
  font-size: 2.25rem;
  opacity: 0.85;
  width: 60%;
  aspect-ratio: 1;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(
    circle at 30% 30%,
    rgba(255, 255, 255, 0.25),
    rgba(255, 255, 255, 0) 65%
  );
}
</style>
