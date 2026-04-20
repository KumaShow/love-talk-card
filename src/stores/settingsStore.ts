import { defineStore } from 'pinia'
import { ref } from 'vue'

import type { SecondaryLang } from '@/types'

/**
 * settingsStore：session 內使用者偏好設定。
 *
 * 依 data-model.md §4 SettingsState：
 * - secondaryLang：卡牌副語言顯示。
 * - intimateMode：私密模式（僅在 HomeView 切換；GameView 固化使用 gameStore.intimateModeAtStart）。
 * - audioEnabled：翻牌音效開關。
 * - musicEnabled：背景音樂開關（預設關閉）。
 * - showRemainingCount：剩餘牌數顯示開關。
 */
export const useSettingsStore = defineStore('settings', () => {
  const secondaryLang = ref<SecondaryLang>('en')
  const intimateMode = ref(false)
  const audioEnabled = ref(true)
  const musicEnabled = ref(false)
  const showRemainingCount = ref(true)

  return {
    secondaryLang,
    intimateMode,
    audioEnabled,
    musicEnabled,
    showRemainingCount,
  }
})
