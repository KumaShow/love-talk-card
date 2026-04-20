<template>
  <main class="poc-game">
    <AppHeader
      :back-label="zhTw.actions.back"
      :remaining-label="`${zhTw.labels.remaining} `"
      :remaining-count="remainingCount"
      :show-remaining="settingsStore.showRemainingCount"
      :require-confirm="requireConfirm"
      @back="handleBack"
      @request-confirm-back="confirmOpen = true"
    />

    <section class="poc-game__inner" :style="themeStyle">
      <header class="poc-game__meta">
        <p class="poc-game__eyebrow">{{ zhTw.labels.theme }}</p>
        <h1 class="poc-game__title">{{ currentTheme?.name.zh ?? '（主題）' }}</h1>
        <p class="poc-game__hint">點擊中央牌翻開內容</p>
      </header>

      <PocFanDeck
        :deck="gameStore.deck"
        :drawn-count="gameStore.drawnCardIds.length"
        :card-back="themeCardBack"
        :can-interact="phase === 'idle'"
        @draw-center="handleDrawCenter"
      />
    </section>

    <PocPickedCardView :card="pickedCard" :phase="phase" @dismiss="handleDismiss" />

    <ConfirmModal
      :open="confirmOpen"
      :title="zhTw.modal.leaveTitle"
      :description="zhTw.modal.leaveDescription"
      :confirm-label="zhTw.actions.confirm"
      :cancel-label="zhTw.actions.cancel"
      @confirm="confirmLeave"
      @cancel="confirmOpen = false"
    />
  </main>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import AppHeader from '@/components/layout/AppHeader.vue'
import ConfirmModal from '@/components/ui/ConfirmModal.vue'
import PocFanDeck from '@/components/poc/PocFanDeck.vue'
import PocPickedCardView, {
  type PickedPhase,
} from '@/components/poc/PocPickedCardView.vue'
import cardsData from '@/data/cards.json'
import zhTw from '@/i18n/zh-TW.json'
import { useGameStore } from '@/stores/gameStore'
import { useSettingsStore } from '@/stores/settingsStore'
import type { Card, CardsData, ThemeId } from '@/types'
import { isValidThemeId } from '@/utils/theme'

const FLIP_DURATION_MS = 650
const DISMISS_DURATION_MS = 460

const route = useRoute()
const router = useRouter()
const gameStore = useGameStore()
const settingsStore = useSettingsStore()

const dataset = cardsData as CardsData
const confirmOpen = ref(false)
const phase = ref<PickedPhase>('idle')
const pickedCard = ref<Card | null>(null)

const routeThemeId = computed<string | undefined>(() => {
  const raw = route.params.themeId
  return Array.isArray(raw) ? raw[0] : raw
})

const currentTheme = computed(() => {
  const id = routeThemeId.value
  if (!isValidThemeId(id)) {
    return null
  }
  return dataset.themes.find((theme) => theme.id === id) ?? null
})

const themeCardBack = computed(() => currentTheme.value?.colors.cardBack ?? '#c76d8e')

const themeStyle = computed(() => {
  const colors = currentTheme.value?.colors
  if (!colors) {
    return {}
  }
  // 以 inline CSS variables 注入主題色，讓 AppHeader / CTA / focus ring 在 POC 內顯示該主題色
  return {
    '--color-primary': colors.primary,
    '--color-secondary': colors.secondary,
  } as Record<string, string>
})

const remainingCount = computed(() => gameStore.remainingCount)
const requireConfirm = computed(() => gameStore.drawnCardIds.length >= 8 && !gameStore.isComplete)

function ensureSession(targetThemeId: ThemeId) {
  if (gameStore.themeId === targetThemeId) {
    return
  }
  const restored = gameStore.restoreSession()
  if (restored && gameStore.themeId === targetThemeId) {
    return
  }
  gameStore.$reset()
  gameStore.startSession(targetThemeId, settingsStore.intimateMode)
}

onMounted(() => {
  const id = routeThemeId.value
  if (!isValidThemeId(id)) {
    void router.replace({ name: 'poc-home' })
    return
  }
  ensureSession(id)
})

/**
 * 使用者點擊扇形中央卡 → 進入 flipping phase。
 *
 * 依 plan：drawCard 於 flipping 起始即呼叫（不等翻面動畫結束），
 * 讓 gameStore.drawnCardIds 立即推進；PickedCardView 以獨立 overlay 渲染被翻的 card。
 */
function handleDrawCenter() {
  if (phase.value !== 'idle') {
    return
  }
  const card = gameStore.currentCard
  if (card === null) {
    return
  }
  pickedCard.value = card
  phase.value = 'flipping'
  gameStore.drawCard()
  window.setTimeout(() => {
    if (phase.value === 'flipping') {
      phase.value = 'reading'
    }
  }, FLIP_DURATION_MS)
}

/**
 * 使用者點「下一張」CTA 或 backdrop → 卡片飛出右側並歸零 phase。
 * 若已抽完最後一張，導向既有 EndView。
 */
function handleDismiss() {
  if (phase.value !== 'reading') {
    return
  }
  phase.value = 'dismissing'
  window.setTimeout(() => {
    phase.value = 'idle'
    pickedCard.value = null
    if (gameStore.isComplete && gameStore.themeId !== null) {
      void router.replace({ name: 'end', params: { themeId: gameStore.themeId } })
    }
  }, DISMISS_DURATION_MS)
}

function handleBack() {
  gameStore.$reset()
  void router.push({ name: 'poc-home' })
}

function confirmLeave() {
  confirmOpen.value = false
  handleBack()
}

onBeforeUnmount(() => {
  confirmOpen.value = false
})
</script>

<style scoped>
.poc-game {
  min-height: 100vh;
  padding: 1rem 1.25rem 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.poc-game__inner {
  max-width: 30rem;
  margin: 0 auto;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.poc-game__meta {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.poc-game__eyebrow {
  font-size: 0.7rem;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--color-primary);
}

.poc-game__title {
  font-family: ui-serif, Georgia, 'Times New Roman', serif;
  font-size: 1.75rem;
  font-weight: 600;
  margin: 0;
}

.poc-game__hint {
  font-size: 0.85rem;
  color: color-mix(in srgb, var(--color-text) 60%, transparent);
  margin: 0;
}
</style>
