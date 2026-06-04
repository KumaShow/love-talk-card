<template>
  <div
    class="fan-card absolute bottom-0 left-1/2 aspect-[3/4] w-[40vw] max-w-[11rem] max-[23rem]:w-[38vw]"
    :data-active="isActive ? 'true' : 'false'"
    :style="computedStyle"
    :tabindex="isActive ? 0 : -1"
    :role="isActive ? 'button' : undefined"
    :aria-label="isActive ? '翻開中央這張牌' : undefined"
    :data-test="isActive ? 'fan-card-active' : `fan-card-${index}`"
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
/*
 * 扇形卡：transform 帶動態 --angle、自訂 transform-origin 與緩動曲線，
 * 並以 data-active 屬性取代原本的 .is-active modifier 驅動作用態與 hover。
 * 這些動態變數與多屬性 transition 不易用 utility 表達，保留 scoped。
 */
.fan-card {
  transform: translateX(-50%) rotate(var(--angle));
  transform-origin: 50% 120%;
  transition:
    transform var(--duration-fan) var(--ease-card),
    opacity 300ms ease;
  pointer-events: none;
  opacity: 0.88;
  filter: brightness(0.92);
}

.fan-card[data-active='true'] {
  pointer-events: auto;
  cursor: pointer;
  opacity: 1;
  filter: brightness(1);
}

.fan-card[data-active='true']:hover {
  transform: translateX(-50%) rotate(var(--angle)) translateY(-0.625rem);
}

.fan-card:focus-visible {
  outline: 0.1875rem solid var(--color-brand);
  outline-offset: 0.25rem;
  border-radius: var(--radius-card);
}
</style>
