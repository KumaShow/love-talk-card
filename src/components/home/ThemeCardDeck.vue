<template>
  <button
    type="button"
    class="theme-card flex w-full cursor-pointer flex-col items-center gap-[0.55rem] rounded-[var(--radius-panel)] border-0 bg-transparent px-2 pb-3 pt-2 text-ink"
    :style="{ '--color-card': theme.colors.cardBack }"
    :data-test="`theme-deck-${theme.id}`"
    :aria-label="`${zhName} 主題卡堆`"
    @click="$emit('select', theme)"
  >
    <div class="relative aspect-[3/4] w-full" aria-hidden="true">
      <span class="stack-card stack-deep">
        <img class="h-full w-full object-fill" :src="cardVisual.background" alt="" />
      </span>
      <span class="stack-card stack-mid">
        <img class="h-full w-full object-fill" :src="cardVisual.background" alt="" />
      </span>
      <span class="stack-card stack-top">
        <img
          class="absolute inset-0 h-full w-full object-fill"
          :src="cardVisual.background"
          alt=""
          data-test="theme-card-background"
        />
        <img
          class="absolute inset-0 h-full w-full object-fill"
          :src="cardVisual.frame"
          alt=""
          data-test="theme-card-frame"
        />
      </span>
    </div>
    <span class="font-serif text-[1.05rem] font-semibold text-ink">{{ zhName }}</span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { CARD_VISUALS } from '@/assets/card-images'
import type { Theme } from '@/types'

const props = defineProps<{ theme: Theme }>()

defineEmits<{
  select: [theme: Theme]
}>()

const zhName = computed(() => props.theme.name.zh)
const cardVisual = computed(() => CARD_VISUALS[props.theme.id])
</script>

<style scoped>
/* 卡堆按鈕的 hover/active 微浮起與預設主色，保留 scoped */
.theme-card {
  --color-card: #c76d8e;
  transition: transform 200ms ease;
}

.theme-card:hover {
  transform: translateY(-0.1875rem);
}

.theme-card:active {
  transform: translateY(-0.0625rem);
}

/*
 * 三層堆疊卡背：共用漸層／陰影／置中為內聚裝飾視覺（color-mix 漸層），保留 scoped；
 * 後兩張以 transform 微幅錯位 + 旋轉製造牌堆厚度感。
 */
.stack-card {
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
  overflow: hidden;
}

.stack-deep {
  transform: translate(0.375rem, 0.375rem) rotate(2deg);
  filter: brightness(0.88);
}

.stack-mid {
  transform: translate(0.1875rem, 0.1875rem) rotate(1deg);
  filter: brightness(0.94);
}

.stack-top {
  transform: translate(0, 0) rotate(0);
}

</style>
