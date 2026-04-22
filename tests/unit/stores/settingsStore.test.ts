import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { useGameStore } from '@/stores/gameStore'
import { useSettingsStore } from '@/stores/settingsStore'

/**
 * T030 契約測試：settingsStore 初始狀態。
 * 依 data-model.md §4 欄位：secondaryLang / intimateMode / audioEnabled / musicEnabled / showRemainingCount。
 */
describe('useSettingsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    sessionStorage.clear()
  })

  it('應提供預設初始值：secondaryLang=en、intimateMode=false、audioEnabled=true、musicEnabled=false、showRemainingCount=true', () => {
    const store = useSettingsStore()

    expect(store.secondaryLang).toBe('en')
    expect(store.intimateMode).toBe(false)
    expect(store.audioEnabled).toBe(true)
    expect(store.musicEnabled).toBe(false)
    expect(store.showRemainingCount).toBe(true)
  })

  /**
   * T044：toggleIntimateMode action 行為測試。
   * 依 data-model.md §4 業務規則：
   *   intimateMode 僅在 HomeView（gameStore.themeId === null）可切換；
   *   進入 GameView 後固化於 gameStore.intimateModeAtStart，不隨 settingsStore 變動。
   */
  describe('toggleIntimateMode', () => {
    it('無 session（gameStore.themeId = null）時應可連續切換 false → true → false → true', () => {
      const settingsStore = useSettingsStore()
      const gameStore = useGameStore()

      expect(gameStore.themeId).toBeNull()
      expect(settingsStore.intimateMode).toBe(false)

      settingsStore.toggleIntimateMode()
      expect(settingsStore.intimateMode).toBe(true)

      settingsStore.toggleIntimateMode()
      expect(settingsStore.intimateMode).toBe(false)

      settingsStore.toggleIntimateMode()
      expect(settingsStore.intimateMode).toBe(true)
    })

    it('有進行中 session（startSession 之後）時呼叫 toggleIntimateMode 應為 no-op，不改變 intimateMode', () => {
      const settingsStore = useSettingsStore()
      const gameStore = useGameStore()

      // 啟動 session 以模擬使用者進入 GameView
      gameStore.startSession('attraction', false)
      expect(gameStore.themeId).toBe('attraction')

      const before = settingsStore.intimateMode
      settingsStore.toggleIntimateMode()
      expect(settingsStore.intimateMode).toBe(before)

      // 再次呼叫仍維持 no-op
      settingsStore.toggleIntimateMode()
      expect(settingsStore.intimateMode).toBe(before)
    })

    it('session 結束（gameStore.$reset）後 toggleIntimateMode 應恢復可切換', () => {
      const settingsStore = useSettingsStore()
      const gameStore = useGameStore()

      gameStore.startSession('trust', true)
      // 在 session 中切換應 no-op
      const locked = settingsStore.intimateMode
      settingsStore.toggleIntimateMode()
      expect(settingsStore.intimateMode).toBe(locked)

      // 結束 session 後 themeId 回到 null，切換應生效
      gameStore.$reset()
      expect(gameStore.themeId).toBeNull()

      settingsStore.toggleIntimateMode()
      expect(settingsStore.intimateMode).toBe(!locked)
    })
  })

  /**
   * T054：setSecondaryLang action 行為測試。
   * 副語言切換不受 session 狀態影響（與 intimateMode 不同），
   * 進入 GameView 後仍可切換並反應到 CardFace 次要文字渲染。
   */
  describe('setSecondaryLang', () => {
    it('呼叫 setSecondaryLang 應更新 secondaryLang 且立即可讀', () => {
      const settingsStore = useSettingsStore()

      expect(settingsStore.secondaryLang).toBe('en')

      settingsStore.setSecondaryLang('th')
      expect(settingsStore.secondaryLang).toBe('th')

      settingsStore.setSecondaryLang('ja')
      expect(settingsStore.secondaryLang).toBe('ja')

      settingsStore.setSecondaryLang('en')
      expect(settingsStore.secondaryLang).toBe('en')
    })

    it('進行中 session 時呼叫 setSecondaryLang 仍應生效（與 intimateMode 規則不同）', () => {
      const settingsStore = useSettingsStore()
      const gameStore = useGameStore()

      gameStore.startSession('attraction', false)
      expect(gameStore.themeId).toBe('attraction')

      settingsStore.setSecondaryLang('th')
      expect(settingsStore.secondaryLang).toBe('th')
    })
  })
})
