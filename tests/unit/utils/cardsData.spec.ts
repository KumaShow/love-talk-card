import { describe, expect, it } from 'vitest'

import { cardsData } from '@/data'

describe('cardsData', () => {
  it('每個主題至少含一張卡牌', () => {
    expect(cardsData.themes.length).toBeGreaterThan(0)
    for (const theme of cardsData.themes) {
      const cards = cardsData.cards.filter((c) => c.theme === theme.id)
      expect(cards.length).toBeGreaterThan(0)
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
