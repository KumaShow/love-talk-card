<template>
  <div
    class="card-back absolute inset-0 overflow-hidden rounded-[var(--radius-card)] text-white shadow-[var(--shadow-card)]"
    data-test="card-back"
  >
    <img
      class="absolute inset-0 h-full w-full object-fill"
      :src="cardVisual.background"
      alt=""
      data-test="card-back-background"
      aria-hidden="true"
    />
    <img
      class="absolute inset-0 h-full w-full object-fill"
      :src="cardVisual.frame"
      alt=""
      data-test="card-back-frame"
      aria-hidden="true"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { CARD_VISUALS } from '@/assets/card-images'
import type { ThemeId } from '@/types'

const props = defineProps<{
  themeId: ThemeId
}>()

/** 卡牌背面依主題選取背景與透明外框，映射集中於 card-images。 */
const cardVisual = computed(() => CARD_VISUALS[props.themeId])
</script>

<style scoped>
/* 卡背 3D 背面隱藏不易用 utility 表達，保留 scoped */
.card-back {
  background: var(--color-card);
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}
</style>
