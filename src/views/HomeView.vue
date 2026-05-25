<template>
  <main class="min-h-screen px-5 pb-12 pt-8">
    <section class="mx-auto flex max-w-[30rem] flex-col gap-6">
      <header class="flex flex-col gap-[0.55rem] text-center">
        <p class="text-[0.72rem] uppercase tracking-[0.28em] text-brand">{{ zhTw.app.title }}</p>
        <h1 class="font-serif text-[clamp(1.75rem,6vw,2.25rem)] font-semibold">
          {{ zhTw.home.title }}
        </h1>
        <p class="home-view__description">{{ zhTw.home.description }}</p>
      </header>

      <div
        class="flex min-h-[44px] flex-col gap-[0.35rem] rounded-[1.25rem] bg-white/75 px-4 py-[0.9rem]"
      >
        <ToggleSwitch
          :model-value="settingsStore.intimateMode"
          data-test="intimate-toggle"
          :label="zhTw.home.intimateMode"
          @update:model-value="handleToggleIntimate"
        />
        <p class="home-view__toggle-hint">{{ zhTw.home.intimateModeHint }}</p>
      </div>

      <ul class="m-0 grid list-none grid-cols-2 gap-4 p-0" data-test="theme-deck-grid">
        <li v-for="theme in cardsData.themes" :key="theme.id">
          <ThemeCardDeck :theme="theme" @select="handleSelect" />
        </li>
      </ul>

      <footer class="home-view__footer">{{ zhTw.home.startHint }}</footer>
    </section>

    <ThemePreview :theme="selectedTheme" @start="handleStart" @dismiss="selectedTheme = null" />
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import ThemeCardDeck from '@/components/home/ThemeCardDeck.vue'
import ThemePreview from '@/components/home/ThemePreview.vue'
import ToggleSwitch from '@/components/ui/ToggleSwitch.vue'
import { useTheme } from '@/composables/useTheme'
import { cardsData } from '@/data'
import zhTw from '@/i18n/zh-TW.json'
import { useGameStore } from '@/stores/gameStore'
import { useSettingsStore } from '@/stores/settingsStore'
import type { Theme } from '@/types'

const router = useRouter()
const gameStore = useGameStore()
const settingsStore = useSettingsStore()
const { applyTheme, resetTheme } = useTheme()

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
  // 先 applyTheme 再 router.push：CSS 變數在 route 切換前就改值，
  // #app 上的 transition 會開始漸變，GameView 掛載時氛圍色已在過場途中，
  // 視覺上比等 GameView.onMounted 才動手更連貫（對應 tasks.md T062 原意）。
  applyTheme(theme.id, cardsData.themes)
  gameStore.startSession(theme.id, settingsStore.intimateMode)
  void router.push({ name: 'game', params: { themeId: theme.id } })
}
</script>

<style scoped>
.home-view__description {
  font-size: 0.95rem;
  line-height: 1.6;
  color: color-mix(in srgb, var(--color-ink) 70%, transparent);
}

.home-view__toggle-hint {
  margin: 0;
  font-size: 0.8rem;
  line-height: 1.5;
  color: color-mix(in srgb, var(--color-ink) 70%, transparent);
}

.home-view__footer {
  text-align: center;
  font-size: 0.8rem;
  color: color-mix(in srgb, var(--color-ink) 60%, transparent);
}
</style>
