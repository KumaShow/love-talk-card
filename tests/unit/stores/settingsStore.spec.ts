import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { useSettingsStore } from '@/stores/settingsStore'

describe('settingsStore 骨架', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('應提供設定相關的型別化初始狀態 refs', () => {
    const store = useSettingsStore()

    expect(store.locale).toBe('zh-TW')
    expect(store.secondaryLang).toBe('en')
    expect(store.isSoundEnabled).toBe(true)
    expect(store.isIntimateModeEnabled).toBe(false)
    expect(store.showRemainingCount).toBe(true)
  })
})
