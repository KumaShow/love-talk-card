<template>
  <div
    class="poc-fan-card"
    :class="{ 'is-active': isActive }"
    :style="computedStyle"
    :tabindex="isActive ? 0 : -1"
    :role="isActive ? 'button' : undefined"
    :aria-label="isActive ? '翻開中央這張牌' : undefined"
    :data-test="`fan-card-${index}`"
    @click="handleActivate"
    @keydown.enter.prevent="handleActivate"
    @keydown.space.prevent="handleActivate"
  >
    <CardBack />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import CardBack from '@/components/card/CardBack.vue'

const props = defineProps<{
  index: number
  angle: number
  zIndex: number
  isActive: boolean
  cardBack: string
}>()

const emit = defineEmits<{ activate: [] }>()

const computedStyle = computed(
  () =>
    ({
      '--angle': `${props.angle}deg`,
      '--color-card': props.cardBack,
      zIndex: props.zIndex,
    }) as Record<string, string | number>,
)

function handleActivate() {
  if (!props.isActive) {
    return
  }
  emit('activate')
}
</script>

<style scoped>
.poc-fan-card {
  position: absolute;
  left: 50%;
  bottom: 0;
  width: 40vw;
  max-width: 11rem;
  aspect-ratio: 3 / 4;
  transform: translateX(-50%) rotate(var(--angle));
  transform-origin: 50% 120%;
  transition:
    transform var(--duration-fan) var(--ease-card),
    opacity 300ms ease;
  pointer-events: none;
  opacity: 0.88;
  filter: brightness(0.92);
}

.poc-fan-card.is-active {
  pointer-events: auto;
  cursor: pointer;
  opacity: 1;
  filter: brightness(1);
}

.poc-fan-card.is-active:hover {
  transform: translateX(-50%) rotate(var(--angle)) translateY(-10px);
}

.poc-fan-card:focus-visible {
  outline: 3px solid var(--color-brand);
  outline-offset: 4px;
  border-radius: var(--radius-card);
}
</style>
