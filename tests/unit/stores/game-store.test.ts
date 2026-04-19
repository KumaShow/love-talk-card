import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useGameStore } from '@/stores/gameStore'

/** 驗證遊戲 store 骨架的初始狀態。 */
describe('useGameStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('提供預期的初始狀態欄位', () => {
    const store = useGameStore()

    expect(store.themeId).toBeNull()
    expect(store.deck).toEqual([])
    expect(store.drawnCardIds).toEqual([])
    expect(store.intimateModeAtStart).toBe(false)
    expect(store.isAnimating).toBe(false)
  })
})
