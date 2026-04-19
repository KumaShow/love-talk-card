import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useSettingsStore } from '@/stores/settingsStore'

/** 驗證設定 store 骨架的初始狀態。 */
describe('useSettingsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('提供 session 內使用的預設設定值', () => {
    const store = useSettingsStore()

    expect(store.locale).toBe('zh-TW')
    expect(store.secondaryLang).toBe('en')
    expect(store.isIntimateModeEnabled).toBe(false)
    expect(store.isSoundEnabled).toBe(true)
    expect(store.showRemainingCount).toBe(true)
  })
})
