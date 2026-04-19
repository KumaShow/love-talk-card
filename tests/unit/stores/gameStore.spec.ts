import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { useGameStore } from '@/stores/gameStore'

describe('gameStore 骨架', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('應提供型別化的初始狀態 refs', () => {
    const store = useGameStore()

    expect(store.themeId).toBeNull()
    expect(store.deck).toEqual([])
    expect(store.drawnCardIds).toEqual([])
    expect(store.intimateModeAtStart).toBe(false)
    expect(store.isAnimating).toBe(false)
  })
})
