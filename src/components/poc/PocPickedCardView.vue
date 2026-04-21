<template>
  <Transition name="picked-backdrop">
    <div
      v-if="showBackdrop"
      class="picked-backdrop"
      data-test="poc-picked-backdrop"
      aria-hidden="true"
      @click="handleBackdropClick"
    ></div>
  </Transition>

  <Transition name="picked-shell">
    <div
      v-if="card && visible"
      class="picked"
      :class="{ 'is-dismissing': phase === 'dismissing' }"
      data-test="poc-picked-view"
      role="dialog"
      aria-modal="true"
    >
      <div class="picked__inner" :class="{ 'is-flipped': isFlipped }">
        <CardBack class="picked__face" />
        <CardFace :card="card" class="picked__face" />
      </div>

      <Transition name="picked-cta">
        <button
          v-if="phase === 'reading'"
          class="picked__cta"
          type="button"
          data-test="poc-picked-next"
          @click="$emit('dismiss')"
        >
          下一張
        </button>
      </Transition>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, nextTick, watch } from 'vue'

import CardBack from '@/components/card/CardBack.vue'
import CardFace from '@/components/card/CardFace.vue'
import { useCard } from '@/composables/useCard'
import type { Card } from '@/types'

export type PickedPhase = 'idle' | 'flipping' | 'reading' | 'dismissing'

const props = defineProps<{
  card: Card | null
  phase: PickedPhase
}>()

const emit = defineEmits<{ dismiss: [] }>()

const { isFlipped, flipCard, resetCard } = useCard()

const visible = computed(() => props.phase !== 'idle')
const showBackdrop = computed(() => props.phase === 'flipping' || props.phase === 'reading')

/**
 * 進入 flipping 時以 nextTick + rAF 雙層延遲觸發翻面，
 * 確保 DOM 先以 rotateY(0) mount，再由 class 變化 trigger transition。
 */
watch(
  () => props.phase,
  async (next) => {
    if (next === 'flipping') {
      await nextTick()
      requestAnimationFrame(() => {
        flipCard()
      })
    }
    if (next === 'idle') {
      resetCard()
    }
  },
)

function handleBackdropClick() {
  if (props.phase === 'reading') {
    emit('dismiss')
  }
}
</script>

<style scoped>
.picked-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(8, 4, 10, 0.55);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 90;
}

.picked {
  position: fixed;
  left: 50%;
  top: 50%;
  width: 70vw;
  max-width: 22rem;
  aspect-ratio: 3 / 4;
  transform: translate(-50%, -50%);
  perspective: 1600px;
  z-index: 100;
  transition: transform 460ms cubic-bezier(0.55, 0, 0.6, 1), opacity 340ms ease-in;
}

.picked.is-dismissing {
  transform: translate(-50%, -50%) translateX(130vw) rotate(22deg);
  opacity: 0;
}

.picked__inner {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 600ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

.picked__inner.is-flipped {
  transform: rotateY(180deg);
}

/* CardBack / CardFace 自身已設 position:absolute; inset:0; backface-visibility:hidden，
   且 CardFace 自帶 rotateY(180deg)，picked__inner 翻面後兩面自動各自朝向正確。 */
.picked__face {
  /* reserved for future scoped overrides if needed */
}

.picked__cta {
  position: absolute;
  left: 50%;
  top: calc(100% + 1.25rem);
  transform: translateX(-50%);
  min-width: 140px;
  min-height: 48px;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 999px;
  background: linear-gradient(
    135deg,
    var(--color-primary),
    color-mix(in srgb, var(--color-primary) 55%, #1a0a18)
  );
  color: white;
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  box-shadow: 0 10px 22px -10px color-mix(in srgb, var(--color-primary) 60%, #000);
  cursor: pointer;
}

.picked-backdrop-enter-active,
.picked-backdrop-leave-active {
  transition: opacity 280ms ease;
}

.picked-backdrop-enter-from,
.picked-backdrop-leave-to {
  opacity: 0;
}

.picked-shell-enter-active {
  transition: opacity 240ms ease-out, transform 420ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

.picked-shell-leave-active {
  transition: none;
}

.picked-shell-enter-from {
  opacity: 0;
  transform: translate(-50%, -30%) scale(0.85);
}

.picked-cta-enter-active,
.picked-cta-leave-active {
  transition: opacity 240ms ease, transform 260ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

.picked-cta-enter-from,
.picked-cta-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(8px);
}
</style>
