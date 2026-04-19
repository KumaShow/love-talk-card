import { describe, expect, it } from 'vitest'
import cardsData from '@/data/cards.json'

/** 靜態卡牌資料檢查，確保 Phase 2 基礎資料完整。 */
describe('cards data', () => {
  it('包含 4 個主題與 80 張卡牌', () => {
    expect(cardsData.themes).toHaveLength(4)
    expect(cardsData.cards).toHaveLength(80)
  })

  it('每個主題都有 15 張基礎牌與 5 張私密牌', () => {
    for (const theme of cardsData.themes) {
      const themeCards = cardsData.cards.filter((card) => card.theme === theme.id)
      const baseCards = themeCards.filter((card) => !card.isIntimate)
      const intimateCards = themeCards.filter((card) => card.isIntimate)

      expect(baseCards).toHaveLength(15)
      expect(intimateCards).toHaveLength(5)
    }
  })
})
