import { describe, expect, it } from 'vitest'

import cardsData from '@/data/cards.json'

describe('cards.json', () => {
  it('應提供四個主題與八十張卡牌', () => {
    expect(cardsData.themes).toHaveLength(4)
    expect(cardsData.cards).toHaveLength(80)
  })

  it('每個主題應符合基礎牌與私密牌數量規格', () => {
    for (const theme of cardsData.themes) {
      const cards = cardsData.cards.filter((card) => card.theme === theme.id)
      const baseCards = cards.filter((card) => !card.isIntimate)
      const intimateCards = cards.filter((card) => card.isIntimate)

      expect(baseCards).toHaveLength(15)
      expect(intimateCards).toHaveLength(5)

      const baseLevels = baseCards.map((card) => card.level)
      expect(baseLevels.filter((level) => level === 1)).toHaveLength(5)
      expect(baseLevels.filter((level) => level === 2)).toHaveLength(6)
      expect(baseLevels.filter((level) => level === 3)).toHaveLength(4)
      expect(intimateCards.every((card) => card.level >= 2)).toBe(true)
    }
  })

  it('所有卡牌都應具備合法 ID 與完整四語言文字', () => {
    const cardIdPattern = /^[a-z]+-\d{3}-(base|intimate)$/

    for (const card of cardsData.cards) {
      expect(card.id).toMatch(cardIdPattern)
      expect(card.text.zh.length).toBeGreaterThan(0)
      expect(card.text.en.length).toBeGreaterThan(0)
      expect(card.text.th.length).toBeGreaterThan(0)
      expect(card.text.ja.length).toBeGreaterThan(0)
    }
  })
})
