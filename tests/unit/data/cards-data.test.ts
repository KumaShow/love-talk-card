import { describe, expect, it } from 'vitest'
import { cardsData } from '@/data'

/** 靜態卡牌資料結構檢查，確保資料完整性（不假設固定數量）。 */
describe('cards data', () => {
  it('至少包含一個主題', () => {
    expect(cardsData.themes.length).toBeGreaterThan(0)
  })

  it('所有卡牌的 theme 均對應已知主題', () => {
    const themeIds = new Set(cardsData.themes.map((t) => t.id))
    for (const card of cardsData.cards) {
      expect(themeIds.has(card.theme)).toBe(true)
    }
  })

  it('每個主題至少包含一張基礎牌', () => {
    for (const theme of cardsData.themes) {
      const baseCards = cardsData.cards.filter(
        (card) => card.theme === theme.id && !card.isIntimate,
      )
      expect(baseCards.length).toBeGreaterThan(0)
    }
  })

  it('私密牌的難度等級均為 2 或以上', () => {
    const intimateCards = cardsData.cards.filter((card) => card.isIntimate)
    for (const card of intimateCards) {
      expect(card.level).toBeGreaterThanOrEqual(2)
    }
  })
})
