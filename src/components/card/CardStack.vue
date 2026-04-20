<template>
  <div
    class="card-stack"
    :class="{ 'is-empty': !hasCurrentCard }"
    data-test="card-stack"
    role="button"
    tabindex="0"
    :aria-disabled="isDisabled"
    :aria-label="ariaLabel"
    @click="handleClick"
    @keydown.enter.prevent="handleClick"
    @keydown.space.prevent="handleClick"
  >
    <div class="card-stack__viewport">
      <div class="card-stack__inner" :class="{ 'is-flipped': isFlipped }">
        <CardBack class="card-stack__face" />
        <CardFace
          v-if="visibleCard"
          :card="visibleCard"
          :secondary-text="secondaryText"
          class="card-stack__face card-stack__face--front"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

import CardBack from '@/components/card/CardBack.vue'
import CardFace from '@/components/card/CardFace.vue'
import { useCard } from '@/composables/useCard'
import { useGameStore } from '@/stores/gameStore'

withDefaults(
  defineProps<{
    ariaLabel?: string
    /** 卡牌副語言文字（由父層根據 settings 計算後注入；Phase 3 暫不使用）。 */
    secondaryText?: string
  }>(),
  {
    ariaLabel: '翻開下一張卡牌',
    secondaryText: '',
  },
)

const emit = defineEmits<{
  draw: [cardId: string]
}>()

const gameStore = useGameStore()
const { isFlipped, canFlip, flipCard } = useCard()

/** 正在顯示的卡牌：動畫中為剛抽到的，未開始時為牌堆頂。 */
const lastDrawnCardId = ref<string | null>(null)
const visibleCard = computed(() => {
  if (lastDrawnCardId.value === null) {
    return gameStore.currentCard
  }
  return gameStore.lastDrawnCard ?? gameStore.currentCard
})

const hasCurrentCard = computed(() => gameStore.currentCard !== null)
const isDisabled = computed(() => !hasCurrentCard.value || !canFlip.value)

function handleClick() {
  if (!canFlip.value) {
    return
  }
  if (gameStore.isComplete) {
    return
  }
  if (gameStore.currentCard === null) {
    return
  }

  const targetId = gameStore.currentCard.id
  if (!flipCard()) {
    return
  }
  const drawn = gameStore.drawCard()
  lastDrawnCardId.value = drawn?.id ?? targetId
  emit('draw', lastDrawnCardId.value)
}
</script>

<style scoped>
.card-stack {
  position: relative;
  width: 100%;
  max-width: 22rem;
  margin: 0 auto;
  aspect-ratio: 3 / 4;
  perspective: 1000px;
  cursor: pointer;
  user-select: none;
}

.card-stack[aria-disabled='true'] {
  cursor: not-allowed;
  opacity: 0.75;
}

.card-stack__viewport {
  position: absolute;
  inset: 0;
}

.card-stack__inner {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 500ms ease-in-out;
  will-change: transform;
}

.card-stack__inner.is-flipped {
  transform: rotateY(180deg);
}

.card-stack__face {
  position: absolute;
  inset: 0;
}
</style>
