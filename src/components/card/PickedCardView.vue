<template>
  <Transition name="picked-backdrop">
    <div
      v-if="showBackdrop"
      class="fixed inset-0 z-[90] bg-[rgb(8_4_10/0.55)] backdrop-blur-[0.25rem]"
      data-test="picked-backdrop"
      aria-hidden="true"
    ></div>
  </Transition>

  <Transition name="picked-shell">
    <div
      v-if="card && visible"
      class="picked-card"
      :data-dismissing="phase === 'dismissing' ? 'true' : 'false'"
      data-test="picked-view"
      role="dialog"
      aria-modal="true"
    >
      <div
        class="picked-inner relative h-full w-full"
        data-test="picked-inner"
        :data-flipped="isFlipped ? 'true' : 'false'"
      >
        <CardBack :theme-id="card.theme" />
        <CardFace :card="card" />
      </div>
    </div>
  </Transition>

  <Transition name="picked-controls">
    <div
      v-if="card && phase === 'reading'"
      class="picked-controls fixed left-1/2 z-[110] flex -translate-x-1/2 flex-col items-center gap-3 max-[23rem]:gap-[0.55rem]"
      data-test="picked-controls"
    >
      <button
        class="picked-cta min-h-[3.25rem] min-w-[8.75rem] cursor-pointer rounded-[var(--radius-pill)] border-0 px-6 py-3 text-[0.95rem] font-bold tracking-normal text-white max-[23rem]:min-h-11 max-[23rem]:min-w-[7.25rem] max-[23rem]:px-[1.1rem] max-[23rem]:py-[0.58rem] max-[23rem]:text-[0.9rem]"
        type="button"
        data-test="picked-next"
        @click="emit('dismiss')"
      >
        下一張
      </button>
      <LanguageSelector
        :selected-lang="settingsStore.secondaryLang"
        data-test="picked-language-selector"
        @select="settingsStore.setSecondaryLang"
      />
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, nextTick, watch } from 'vue'

import CardBack from '@/components/card/CardBack.vue'
import CardFace from '@/components/card/CardFace.vue'
import LanguageSelector from '@/components/ui/LanguageSelector.vue'
import { useAudio } from '@/composables/useAudio'
import { useCard } from '@/composables/useCard'
import { useSettingsStore } from '@/stores/settingsStore'
import type { Card } from '@/types'

/** PickedCardView 內就近供 LanguageSelector 連動 settingsStore，避免父層多寫一層轉發。 */
const settingsStore = useSettingsStore()

/** 翻面音效；phase 進入 flipping 時與 CSS 翻面動畫同步觸發。 */
const { playFlipSound } = useAudio()

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
        // 與 3D 翻面動畫同步播放翻牌音效；audioEnabled=false 時 useAudio 內部自動 no-op。
        void playFlipSound()
      })
    }
    if (next === 'idle') {
      resetCard()
    }
  },
)

</script>

<style scoped>
/*
 * 卡片浮層：固定置中 + perspective 提供 3D 翻面舞台，dismiss 以 data-dismissing
 * 屬性取代原 .is-dismissing modifier。perspective／translate 置中／自訂緩動
 * transition 不易用 utility 表達，保留 scoped。
 */
.picked-card {
  --picked-card-width: min(72vw, 22rem);
  position: fixed;
  left: 50%;
  top: 50%;
  width: var(--picked-card-width);
  aspect-ratio: 3 / 4;
  transform: translate(-50%, -50%);
  perspective: 100rem;
  z-index: 100;
  transition:
    transform var(--duration-dismiss) var(--ease-dismiss),
    opacity 340ms ease-in;
}

.picked-card[data-dismissing='true'] {
  transform: translate(-50%, -50%) translateX(130vw) rotate(22deg);
  opacity: 0;
}

/* 控制列獨立於卡片飛出動畫；位置用同一張卡的寬高比例推算。 */
.picked-controls {
  --picked-card-width: min(72vw, 22rem);
  top: calc(50% + (var(--picked-card-width) * 2 / 3) + 1.25rem);
}

/*
 * 3D 翻面內層：preserve-3d 與 rotateY 不易用 utility 表達，保留 scoped；
 * 翻面狀態以 data-flipped 屬性取代原 .is-flipped modifier。
 * CardBack / CardFace 自身已設 position:absolute; inset:0; backface-visibility:hidden，
 * 且 CardFace 自帶 rotateY(180deg)，翻面後兩面自動各自朝向正確。
 */
.picked-inner {
  transform-style: preserve-3d;
  transition: transform var(--duration-flip) var(--ease-card);
}

.picked-inner[data-flipped='true'] {
  transform: rotateY(180deg);
}

/* CTA 漸層、文字陰影與光暈（color-mix），不易用 utility 表達，保留 scoped */
.picked-cta {
  background: linear-gradient(
    135deg,
    var(--color-brand),
    color-mix(in srgb, var(--color-brand) 55%, #1a0a18)
  );
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  box-shadow: 0 10px 22px -10px color-mix(in srgb, var(--color-brand) 60%, #000);
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
  transition:
    opacity 240ms ease-out,
    transform 420ms var(--ease-card);
}

.picked-shell-leave-active {
  transition: none;
}

.picked-shell-enter-from {
  opacity: 0;
  transform: translate(-50%, -30%) scale(0.85);
}

.picked-controls-enter-active,
.picked-controls-leave-active {
  transition:
    opacity 240ms ease,
    transform 260ms var(--ease-card);
}

.picked-controls-enter-from,
.picked-controls-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(8px);
}

@media (max-width: 26rem) {
  .picked-card {
    --picked-card-width: min(82vw, 20rem);
  }

  .picked-controls {
    --picked-card-width: min(82vw, 20rem);
    top: calc(50% + (var(--picked-card-width) * 2 / 3) + 0.85rem);
  }
}
</style>
