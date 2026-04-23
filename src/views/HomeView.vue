<template>
  <main class="home-view">
    <section class="home-view__inner">
      <header class="home-view__header">
        <p class="home-view__eyebrow">{{ zhTw.app.title }}</p>
        <h1 class="home-view__title">{{ zhTw.home.title }}</h1>
        <p class="home-view__description">{{ zhTw.home.description }}</p>
      </header>

      <div class="home-view__toggle">
        <ToggleSwitch
          :model-value="settingsStore.intimateMode"
          data-test="intimate-toggle"
          :label="zhTw.home.intimateMode"
          @update:model-value="handleToggleIntimate"
        />
        <p class="home-view__toggle-hint">{{ zhTw.home.intimateModeHint }}</p>
      </div>

      <ul class="home-view__deck-grid" data-test="theme-deck-grid">
        <li v-for="theme in dataset.themes" :key="theme.id">
          <ThemeCardDeck :theme="theme" @select="handleSelect" />
        </li>
      </ul>

      <footer class="home-view__footer">{{ zhTw.home.startHint }}</footer>
    </section>

    <ThemePreview
      :theme="selectedTheme"
      @start="handleStart"
      @dismiss="selectedTheme = null"
    />
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import ThemeCardDeck from '@/components/home/ThemeCardDeck.vue'
import ThemePreview from '@/components/home/ThemePreview.vue'
import ToggleSwitch from '@/components/ui/ToggleSwitch.vue'
import { useTheme } from '@/composables/useTheme'
import cardsData from '@/data/cards.json'
import zhTw from '@/i18n/zh-TW.json'
import { useGameStore } from '@/stores/gameStore'
import { useSettingsStore } from '@/stores/settingsStore'
import type { CardsData, Theme } from '@/types'

const router = useRouter()
const gameStore = useGameStore()
const settingsStore = useSettingsStore()
const { resetTheme } = useTheme()

const dataset = cardsData as CardsData
const selectedTheme = ref<Theme | null>(null)

/**
 * 首頁採中性預設色（main.css :root 寫死的粉色），避免殘留上一場主題氛圍。
 * 使用者選主題後由 GameView onMounted 透過 applyTheme 接手。
 */
onMounted(() => {
  resetTheme()
})

/**
 * 依商業規則（data-model.md §4），`intimateMode` 切換僅在 HomeView 有效；
 * 進入 GameView 後會固化為 `gameStore.intimateModeAtStart`。
 * 因此此處不直接覆寫 `settingsStore.intimateMode`，而是呼叫 action，
 * 由 store 內部判斷「有 session 時 no-op」。
 */
function handleToggleIntimate(): void {
  settingsStore.toggleIntimateMode()
}

function handleSelect(theme: Theme): void {
  selectedTheme.value = theme
}

function handleStart(theme: Theme): void {
  gameStore.startSession(theme.id, settingsStore.intimateMode)
  void router.push({ name: 'game', params: { themeId: theme.id } })
}
</script>

<style scoped>
.home-view {
  min-height: 100vh;
  padding: 2rem 1.25rem 3rem;
}

.home-view__inner {
  max-width: 30rem;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.home-view__header {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.home-view__eyebrow {
  font-size: 0.72rem;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--color-primary);
}

.home-view__title {
  font-family: ui-serif, Georgia, 'Times New Roman', serif;
  font-size: clamp(1.75rem, 6vw, 2.25rem);
  font-weight: 600;
}

.home-view__description {
  font-size: 0.95rem;
  line-height: 1.6;
  color: color-mix(in srgb, var(--color-text) 70%, transparent);
}

.home-view__toggle {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 0.9rem 1rem;
  min-height: 44px;
  border-radius: 1.25rem;
  background: rgba(255, 255, 255, 0.75);
}

.home-view__toggle-hint {
  margin: 0;
  font-size: 0.8rem;
  line-height: 1.5;
  color: color-mix(in srgb, var(--color-text) 70%, transparent);
}

.home-view__deck-grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.home-view__footer {
  text-align: center;
  font-size: 0.8rem;
  color: color-mix(in srgb, var(--color-text) 60%, transparent);
}
</style>
