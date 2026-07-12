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

  it('逐主題個別斷言卡數：既有四主題與 desire 各 20 張、values 25 張', () => {
    // 主題沒有 declared-count 欄位、執行期也沒有全站卡數常數；
    // 卡數即各主題 cards 陣列長度，因此逐主題明確列出期望值（對齊 F7），
    // 不得以「全站 100 張」或「每主題 20 張」的共用常數斷言。
    const expectedCardCounts: Record<string, number> = {
      attraction: 20,
      self: 20,
      interaction: 20,
      trust: 20,
      desire: 20,
      values: 25,
    }

    const actualThemeIds = cardsData.themes.map((theme) => theme.id).sort()
    expect(actualThemeIds).toEqual(Object.keys(expectedCardCounts).sort())

    for (const [themeId, expectedCount] of Object.entries(expectedCardCounts)) {
      const themeCards = cardsData.cards.filter((card) => card.theme === themeId)
      expect(themeCards, `主題 ${themeId} 的卡數應為 ${expectedCount}`).toHaveLength(expectedCount)
    }
  })

  it('既有四主題維持私密牌規則，desire 不使用私密分層', () => {
    const existingThemeIds = ['attraction', 'self', 'interaction', 'trust']

    for (const themeId of existingThemeIds) {
      const themeCards = cardsData.cards.filter((card) => card.theme === themeId)
      const intimateCards = themeCards.filter((card) => card.isIntimate === true)

      expect(themeCards.some((card) => card.isIntimate !== true)).toBe(true)
      expect(intimateCards).toHaveLength(5)
      expect(intimateCards.every((card) => card.level >= 2)).toBe(true)
    }

    const desireCards = cardsData.cards.filter((card) => card.theme === 'desire')

    expect(desireCards).toHaveLength(20)
    expect(desireCards.every((card) => card.isIntimate !== true)).toBe(true)
  })
})
