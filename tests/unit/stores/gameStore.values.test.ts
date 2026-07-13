import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { useGameStore } from '@/stores/gameStore'

describe('values game session', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    sessionStorage.clear()
  })

  it.each([false, true])('intimateMode=%s 時仍建立相同 30 張 values deckOrder', (intimateMode) => {
    const store = useGameStore()
    store.startSession('values', intimateMode)

    expect(store.deck).toHaveLength(30)
    expect(store.deck.map((card) => card.id).sort()).toEqual(
      Array.from({ length: 30 }, (_, index) => `val-${String(index + 1).padStart(3, '0')}`),
    )
    expect(store.deck.every((card) => card.isIntimate === undefined)).toBe(true)
  })
})
