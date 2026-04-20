<template>
  <main class="game-view">
    <section class="game-view__inner">
      <AppHeader
        :back-label="zhTw.actions.back"
        :remaining-label="`${zhTw.labels.remaining} `"
        :remaining-count="remainingCount"
        :show-remaining="settingsStore.showRemainingCount"
        :require-confirm="requireConfirm"
        @back="handleBack"
        @request-confirm-back="confirmOpen = true"
      />

      <section class="game-view__meta" aria-live="polite">
        <p class="game-view__eyebrow">{{ zhTw.labels.theme }}</p>
        <h1 class="game-view__title">{{ currentTheme?.name.zh }}</h1>
        <p class="game-view__description">{{ currentTheme?.description.zh }}</p>
      </section>

      <section class="game-view__stack" aria-label="牌堆">
        <CardStack :aria-label="zhTw.actions.draw" @draw="handleDraw" />
        <p class="game-view__hint">{{ zhTw.actions.draw }}</p>
      </section>
    </section>

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
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import AppHeader from '@/components/layout/AppHeader.vue'
import CardStack from '@/components/card/CardStack.vue'
import ConfirmModal from '@/components/ui/ConfirmModal.vue'
import cardsData from '@/data/cards.json'
import zhTw from '@/i18n/zh-TW.json'
import { useGameStore } from '@/stores/gameStore'
import { useSettingsStore } from '@/stores/settingsStore'
import type { CardsData, ThemeId } from '@/types'
import { isValidThemeId } from '@/utils/theme'

const route = useRoute()
const router = useRouter()
const gameStore = useGameStore()
const settingsStore = useSettingsStore()

const dataset = cardsData as CardsData
const confirmOpen = ref(false)

const routeThemeId = computed(() => {
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

const remainingCount = computed(() => gameStore.remainingCount)
const requireConfirm = computed(() => gameStore.drawnCardIds.length >= 8 && !gameStore.isComplete)

/** 若 gameStore 還沒啟動此 session，依 route 建立。 */
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
    void router.replace({ name: 'home' })
    return
  }
  ensureSession(id)
})

watch(
  () => gameStore.isComplete,
  (complete) => {
    if (!complete) {
      return
    }
    const id = gameStore.themeId
    if (id === null) {
      return
    }
    void router.replace({ name: 'end', params: { themeId: id } })
  },
)

function handleDraw(_cardId: string) {
  // 抽牌邏輯已由 CardStack 內部呼叫 gameStore.drawCard()
  // 保留 emit 以利未來埋點、音效整合（US5）
  void _cardId
}

function handleBack() {
  gameStore.$reset()
  void router.push({ name: 'home' })
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
.game-view {
  min-height: 100vh;
  padding: 1rem 1.25rem 2.5rem;
}

.game-view__inner {
  max-width: 30rem;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.game-view__meta {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.game-view__eyebrow {
  font-size: 0.7rem;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--color-primary);
}

.game-view__title {
  font-size: 1.75rem;
  font-weight: 600;
}

.game-view__description {
  font-size: 0.95rem;
  line-height: 1.55;
  color: color-mix(in srgb, var(--color-text) 70%, transparent);
}

.game-view__stack {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.game-view__hint {
  font-size: 0.85rem;
  color: color-mix(in srgb, var(--color-text) 65%, transparent);
}
</style>
