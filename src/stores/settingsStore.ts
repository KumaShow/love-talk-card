import { defineStore } from 'pinia'
import { ref } from 'vue'

import { useGameStore } from '@/stores/gameStore'
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

  /**
   * 切換私密模式；僅在未開始 session 時可切換，符合 data-model.md §4 業務規則：
   * 「`intimateMode` 切換僅在 HomeView 有效；進入 GameView 後，
   * `gameStore.intimateModeAtStart` 固化，`settingsStore.intimateMode` 的後續變更
   * 不影響當前 session 的牌組」。
   *
   * 實作細節：
   * - 以 `gameStore.themeId === null` 代表尚未開始 session（HomeView 狀態）。
   * - 僅在 action 函式內呼叫 `useGameStore()`，而非在模組 top-level，
   *   避免 Pinia 尚未安裝時循環解析導致錯誤。
   * - 當已有 session 時不做任何事（no-op）；避免意外影響正在進行的牌組固化狀態。
   */
  function toggleIntimateMode(): void {
    const gameStore = useGameStore()
    if (gameStore.themeId !== null) {
      // 有進行中的 session，依規則不可切換。
      return
    }
    intimateMode.value = !intimateMode.value
  }

  /**
   * 設定卡牌副語言；變更僅限 session（不寫入 localStorage），且立即具反應性。
   * 與 intimateMode 不同，副語言切換在 GameView 進行中也允許 —
   * 副語言僅影響 CardFace 的次要文字渲染，不會影響牌組組成。
   */
  function setSecondaryLang(lang: SecondaryLang): void {
    secondaryLang.value = lang
  }

  return {
    secondaryLang,
    intimateMode,
    audioEnabled,
    musicEnabled,
    showRemainingCount,
    toggleIntimateMode,
    setSecondaryLang,
  }
})
