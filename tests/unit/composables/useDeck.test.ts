import { afterEach, describe, expect, it, vi } from 'vitest'

import { useDeck } from '@/composables/useDeck'
import { cardsData } from '@/data'
import type { Card } from '@/types'

/**
 * T022：useDeck composable 單元測試。
 * 驗證牌組建立、抽牌推進、私密模式切換、完成判斷。
 */
describe('useDeck', () => {
  const allCards = cardsData.cards as Card[]

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('buildDeck(themeId, cards, false) 應回傳 15 張基礎卡（不含私密）', () => {
    const deck = useDeck()

    const built = deck.buildDeck('attraction', allCards, false)

    expect(built).toHaveLength(15)
    expect(built.every((card) => card.theme === 'attraction')).toBe(true)
    expect(built.some((card) => card.isIntimate)).toBe(false)
  })

  it('buildDeck(themeId, cards, true) 應回傳 20 張卡（含 5 張私密）', () => {
    const deck = useDeck()

    const built = deck.buildDeck('self', allCards, true)

    expect(built).toHaveLength(20)
    expect(built.filter((card) => card.isIntimate)).toHaveLength(5)
  })

  it('buildDeck() 建立 desire 牌組時不受私密模式影響', () => {
    const deck = useDeck()

    const withoutIntimateMode = deck.buildDeck('desire', allCards, false)
    const withIntimateMode = deck.buildDeck('desire', allCards, true)

    for (const built of [withoutIntimateMode, withIntimateMode]) {
      expect(built).toHaveLength(20)
      expect(built.every((card) => card.theme === 'desire')).toBe(true)
      expect(built.some((card) => card.isIntimate === true)).toBe(false)
    }
  })

  it('drawCard() 應將卡牌 ID 加入 drawnCardIds 並推進索引', () => {
    const deck = useDeck()
    const built = deck.buildDeck('interaction', allCards, false)
    deck.setDeck(built)

    const drawn = deck.drawCard()

    expect(drawn).not.toBeNull()
    expect(deck.drawnCardIds.value).toContain(drawn?.id)
    expect(deck.drawnCardIds.value).toHaveLength(1)
  })

  it('同一場 session 不應重複抽到相同 card id', () => {
    const deck = useDeck()
    const built = deck.buildDeck('trust', allCards, false)
    deck.setDeck(built)

    const ids = new Set<string>()
    for (let index = 0; index < built.length; index += 1) {
      const card = deck.drawCard()
      expect(card).not.toBeNull()
      if (card) {
        ids.add(card.id)
      }
    }

    expect(ids.size).toBe(built.length)
  })

  it('當 drawnCardIds.length 等於 deck.length 時 isComplete 應為 true', () => {
    const deck = useDeck()
    const built = deck.buildDeck('attraction', allCards, false)
    deck.setDeck(built)

    expect(deck.isComplete.value).toBe(false)

    for (let index = 0; index < built.length; index += 1) {
      deck.drawCard()
    }

    expect(deck.isComplete.value).toBe(true)
    expect(deck.remainingCount.value).toBe(0)
  })

  it('remainingCount 應在每次抽牌後遞減', () => {
    const deck = useDeck()
    const built = deck.buildDeck('attraction', allCards, false)
    deck.setDeck(built)

    expect(deck.remainingCount.value).toBe(15)
    deck.drawCard()
    expect(deck.remainingCount.value).toBe(14)
    deck.drawCard()
    expect(deck.remainingCount.value).toBe(13)
  })
})
