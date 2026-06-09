import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { useGameStore } from '@/stores/gameStore'

describe('useGameStore（desire 主題）', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    sessionStorage.clear()
  })

  it('startSession(desire,true) 應固定 intimateModeAtStart=false，且牌組維持 20 張', () => {
    const store = useGameStore()

    store.startSession('desire', true)

    expect(store.intimateModeAtStart).toBe(false)
    expect(store.deck).toHaveLength(20)
    expect(store.deck.every((card) => card.theme === 'desire')).toBe(true)
    expect(store.deck.some((card) => card.isIntimate === true)).toBe(false)
  })

  it('既有四主題 startSession(attraction,true) 行為不變', () => {
    const store = useGameStore()

    store.startSession('attraction', true)

    expect(store.intimateModeAtStart).toBe(true)
    expect(store.deck).toHaveLength(20)
    expect(store.deck.filter((card) => card.isIntimate === true)).toHaveLength(5)
  })
})
