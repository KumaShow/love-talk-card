<template>
  <main class="home-view">
    <section class="home-view__inner">
      <header class="home-view__header">
        <p class="home-view__eyebrow">{{ zhTw.app.title }}</p>
        <h1 class="home-view__title">{{ zhTw.home.title }}</h1>
        <p class="home-view__description">{{ zhTw.home.description }}</p>
      </header>

      <!-- T048：以 ToggleSwitch 取代 inline checkbox，並委派給 settingsStore.toggleIntimateMode action。 -->
      <div class="home-view__toggle">
        <ToggleSwitch
          :model-value="settingsStore.intimateMode"
          data-test="intimate-toggle"
          :label="zhTw.home.intimateMode"
          @update:model-value="handleToggleIntimate"
        />
        <p class="home-view__toggle-hint">{{ zhTw.home.intimateModeHint }}</p>
      </div>

      <ul class="home-view__themes" data-test="theme-grid">
        <li v-for="theme in cardsData.themes" :key="theme.id">
          <button
            type="button"
            class="home-view__theme"
            :data-test="`theme-card-${theme.id}`"
            @click="handleStart(theme.id)"
          >
            <span class="home-view__theme-eyebrow">{{ zhTw.labels.theme }}</span>
            <span class="home-view__theme-name">{{ theme.name.zh }}</span>
            <span class="home-view__theme-desc">{{ theme.description.zh }}</span>
            <span class="home-view__theme-cta">{{ zhTw.actions.start }}</span>
          </button>
        </li>
      </ul>

      <footer class="home-view__footer">{{ zhTw.home.startHint }}</footer>
    </section>
  </main>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

import ToggleSwitch from '@/components/ui/ToggleSwitch.vue'
import cardsData from '@/data/cards.json'
import zhTw from '@/i18n/zh-TW.json'
import { useGameStore } from '@/stores/gameStore'
import { useSettingsStore } from '@/stores/settingsStore'
import type { CardsData, ThemeId } from '@/types'

const router = useRouter()
const gameStore = useGameStore()
const settingsStore = useSettingsStore()

const dataset = cardsData as CardsData

/**
 * T048：處理私密模式切換。
 *
 * 依商業規則（data-model.md §4），`intimateMode` 的切換僅在 HomeView 有效；
 * 進入 GameView 後必須固化為 `gameStore.intimateModeAtStart`。
 * 因此此處不直接覆寫 `settingsStore.intimateMode`，而是呼叫 action，
 * 由 store 內部判斷「有 session 時 no-op」。ToggleSwitch emit 的目標值
 * 不需採用，實際切換由 store 決定。
 */
function handleToggleIntimate(): void {
  settingsStore.toggleIntimateMode()
}

function handleStart(themeId: ThemeId) {
  gameStore.startSession(themeId, settingsStore.intimateMode)
  void router.push({ name: 'game', params: { themeId } })
}

void dataset
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
  gap: 0.6rem;
}

.home-view__eyebrow {
  font-size: 0.75rem;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--color-primary);
}

.home-view__title {
  font-size: clamp(1.75rem, 6vw, 2.25rem);
  font-weight: 600;
}

.home-view__description {
  font-size: 1rem;
  line-height: 1.6;
  color: color-mix(in srgb, var(--color-text) 75%, transparent);
}

/* T048：整組私密模式切換容器，保留「標籤 + hint」雙行排版。 */
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

.home-view__themes {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.home-view__theme {
  width: 100%;
  min-height: 44px;
  padding: 1.1rem 1.25rem;
  border: none;
  border-radius: 1.5rem;
  background: rgba(255, 255, 255, 0.85);
  color: var(--color-text);
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  cursor: pointer;
  box-shadow: 0 12px 30px -20px rgba(0, 0, 0, 0.25);
  transition: transform 200ms ease, box-shadow 200ms ease;
}

.home-view__theme:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 36px -22px rgba(0, 0, 0, 0.35);
}

.home-view__theme-eyebrow {
  font-size: 0.7rem;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--color-primary);
}

.home-view__theme-name {
  font-size: 1.4rem;
  font-weight: 600;
}

.home-view__theme-desc {
  font-size: 0.9rem;
  line-height: 1.5;
  color: color-mix(in srgb, var(--color-text) 70%, transparent);
}

.home-view__theme-cta {
  margin-top: 0.4rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-primary);
}

.home-view__footer {
  text-align: center;
  font-size: 0.85rem;
  color: color-mix(in srgb, var(--color-text) 65%, transparent);
}
</style>
