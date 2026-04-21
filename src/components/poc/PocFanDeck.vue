<template>
  <div class="poc-fan-deck" data-test="poc-fan-deck">
    <p v-if="visibleCards.length === 0" class="poc-fan-deck__empty">已抽完所有牌</p>
    <PocFanCard
      v-for="(card, i) in visibleCards"
      :key="card.id"
      :index="i"
      :angle="angles[i] ?? 0"
      :z-index="zIndices[i] ?? 0"
      :is-active="i === centerIndex && canInteract"
      :card-back="cardBack"
      @activate="$emit('draw-center')"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import PocFanCard from './PocFanCard.vue'
import type { Card } from '@/types'

const WINDOW_SIZE = 5
const MAX_SPREAD_DEG = 24

const props = defineProps<{
  deck: Card[]
  drawnCount: number
  cardBack: string
  canInteract: boolean
}>()

defineEmits<{ 'draw-center': [] }>()

/**
 * POC CP3 簡化：window 固定為「未抽 deck 的前 5 張」，不做 swipe window shift。
 * 理由：避免「中央卡 ID」與 gameStore.drawCard() 實際拉取的卡 ID 不一致。
 */
const visibleCards = computed(() => props.deck.slice(props.drawnCount, props.drawnCount + WINDOW_SIZE))

const centerIndex = computed(() => Math.floor((visibleCards.value.length - 1) / 2))

// 張數少於 5 時角度收窄（例如剩 3 張用 -16 ~ +16）
const angles = computed(() => {
  const n = visibleCards.value.length
  if (n === 0) return []
  if (n === 1) return [0]
  const spread = MAX_SPREAD_DEG * (n / WINDOW_SIZE)
  return Array.from({ length: n }, (_, i) => -spread + (spread * 2 * i) / (n - 1))
})

// z-index：中間最大，兩側遞減
const zIndices = computed(() => {
  const n = visibleCards.value.length
  const center = centerIndex.value
  return Array.from({ length: n }, (_, i) => 10 - Math.abs(i - center))
})
</script>

<style scoped>
.poc-fan-deck {
  position: relative;
  width: 100%;
  height: 58vh;
  max-height: 520px;
  overflow: visible;
}

.poc-fan-deck__empty {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: color-mix(in srgb, var(--color-text) 70%, transparent);
  font-size: 1rem;
}
</style>
