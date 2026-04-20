import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { useSettingsStore } from '@/stores/settingsStore'

/**
 * T030 契約測試：settingsStore 初始狀態。
 * 依 data-model.md §4 欄位：secondaryLang / intimateMode / audioEnabled / musicEnabled / showRemainingCount。
 */
describe('useSettingsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('應提供預設初始值：secondaryLang=en、intimateMode=false、audioEnabled=true、musicEnabled=false、showRemainingCount=true', () => {
    const store = useSettingsStore()

    expect(store.secondaryLang).toBe('en')
    expect(store.intimateMode).toBe(false)
    expect(store.audioEnabled).toBe(true)
    expect(store.musicEnabled).toBe(false)
    expect(store.showRemainingCount).toBe(true)
  })
})
