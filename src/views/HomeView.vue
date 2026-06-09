<template>
  <main class="min-h-screen px-5 pb-12 pt-8">
    <section class="mx-auto flex max-w-[30rem] flex-col gap-6">
      <header class="flex flex-col gap-[0.55rem] text-center">
        <p class="text-[0.72rem] uppercase tracking-normal text-brand">{{ zhTw.app.title }}</p>
        <h1 class="font-serif text-[2.25rem] font-semibold max-[23rem]:text-[1.75rem]">
          {{ zhTw.home.title }}
        </h1>
        <p class="home-desc text-[0.95rem] leading-[1.6] max-[23rem]:text-[0.9rem]">
          {{ zhTw.home.description }}
        </p>
      </header>

      <div class="flex min-h-11 flex-col gap-[0.35rem] rounded-[1.25rem] bg-white/75 px-4 py-[0.9rem]">
        <ToggleSwitch
          :model-value="settingsStore.intimateMode"
          data-test="intimate-toggle"
          :label="zhTw.home.intimateMode"
          @update:model-value="handleToggleIntimate"
        />
        <p class="home-hint m-0 text-[0.8rem] leading-[1.5] max-[23rem]:text-[0.76rem]">
          {{ zhTw.home.intimateModeHint }}
        </p>
      </div>

      <ul class="m-0 grid list-none grid-cols-2 gap-4 p-0" data-test="theme-deck-grid">
        <li v-for="theme in cardsData.themes" :key="theme.id">
          <ThemeCardDeck :theme="theme" @select="handleSelect" />
        </li>
      </ul>

      <footer class="home-footer text-center text-[0.8rem] max-[23rem]:text-[0.76rem]">
        {{ zhTw.home.startHint }}
      </footer>
    </section>

    <ThemePreview :theme="selectedTheme" @start="handleStart" @dismiss="selectedTheme = null" />
    <AdultContentNotice
      v-if="isAdultNoticeOpen"
      @confirm="handleConfirmDesire"
      @dismiss="handleDismissDesire"
    />
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import ThemeCardDeck from '@/components/home/ThemeCardDeck.vue'
import ThemePreview from '@/components/home/ThemePreview.vue'
import AdultContentNotice from '@/components/ui/AdultContentNotice.vue'
import ToggleSwitch from '@/components/ui/ToggleSwitch.vue'
import { useTheme } from '@/composables/useTheme'
import { cardsData } from '@/data'
import zhTw from '@/i18n/zh-TW.json'
import { acknowledgeDesireOnce } from '@/router'
import { useGameStore } from '@/stores/gameStore'
import { useSettingsStore } from '@/stores/settingsStore'
import type { Theme } from '@/types'

const router = useRouter()
const route = useRoute()
const gameStore = useGameStore()
const settingsStore = useSettingsStore()
const { applyTheme, resetTheme } = useTheme()

const selectedTheme = ref<Theme | null>(null)
const pendingDesireTheme = ref<Theme | null>(null)
const isAdultNoticeOpen = ref(false)

/**
 * 首頁採中性預設色（main.css :root 寫死的粉色），避免殘留上一場主題氛圍。
 * 使用者選主題後由 GameView onMounted 透過 applyTheme 接手。
 */
onMounted(() => {
  resetTheme()
  openNoticeFromRouteQuery()
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
  if (theme.id === 'desire') {
    openDesireNotice(theme)
    return
  }

  startGame(theme, settingsStore.intimateMode)
}

function startGame(theme: Theme, intimateMode: boolean): void {
  // 先 applyTheme 再 router.push：CSS 變數在 route 切換前就改值，
  // #app 上的 transition 會開始漸變，GameView 掛載時氛圍色已在過場途中，
  // 視覺上比等 GameView.onMounted 才動手更連貫（對應 tasks.md T062 原意）。
  applyTheme(theme.id, cardsData.themes)
  gameStore.startSession(theme.id, intimateMode)
  void router.push({ name: 'game', params: { themeId: theme.id } })
}

function getDesireTheme(): Theme | null {
  return cardsData.themes.find((theme) => theme.id === 'desire') ?? null
}

function openDesireNotice(theme: Theme): void {
  pendingDesireTheme.value = theme
  isAdultNoticeOpen.value = true
}

function openNoticeFromRouteQuery(): void {
  if (route.query.notice !== 'desire') {
    return
  }
  const desireTheme = getDesireTheme()
  if (desireTheme !== null) {
    openDesireNotice(desireTheme)
  }
}

function handleConfirmDesire(): void {
  const theme = pendingDesireTheme.value ?? getDesireTheme()
  if (theme === null) {
    return
  }

  acknowledgeDesireOnce()
  isAdultNoticeOpen.value = false
  pendingDesireTheme.value = null
  selectedTheme.value = null
  startGame(theme, false)
}

function handleDismissDesire(): void {
  isAdultNoticeOpen.value = false
  pendingDesireTheme.value = null
  if (route.query.notice === 'desire') {
    void router.replace({ name: 'home' })
  }
}

watch(
  () => route.query.notice,
  () => {
    openNoticeFromRouteQuery()
  },
)
</script>

<style scoped>
/* 以下三處皆為 color-mix 半透明墨色，不易用 utility 表達故保留 scoped */
.home-desc,
.home-hint {
  color: color-mix(in srgb, var(--color-ink) 70%, transparent);
}

.home-footer {
  color: color-mix(in srgb, var(--color-ink) 60%, transparent);
}
</style>
