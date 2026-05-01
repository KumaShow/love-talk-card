import { describe, expect, it } from 'vitest'

import { cardsData } from '@/data'
import { ThemeFileSchema } from '@/data/validators'
import attraction from '@/data/themes/attraction.json'
import self_ from '@/data/themes/self.json'
import interaction from '@/data/themes/interaction.json'
import trust from '@/data/themes/trust.json'

/**
 * 主題 JSON 檔 Zod 結構驗證。
 * 以 ThemeFileSchema 驗證各主題資料，並補強幾項 schema 無法單獨涵蓋的業務約束。
 */
describe('主題 JSON 檔 Zod 結構驗證', () => {
  const themeFiles = [attraction, self_, interaction, trust]

  it.each(themeFiles)('$id 主題應通過 ThemeFileSchema 驗證', (themeFile) => {
    const result = ThemeFileSchema.safeParse(themeFile)
    expect(result.success).toBe(true)
  })

  it('所有主題至少含一張卡牌', () => {
    for (const theme of cardsData.themes) {
      const cards = cardsData.cards.filter((c) => c.theme === theme.id)
      expect(cards.length).toBeGreaterThan(0)
    }
  })

  it('所有卡牌 ID 在資料集內唯一', () => {
    const ids = cardsData.cards.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('所有卡牌 text.zh 為非空字串', () => {
    for (const card of cardsData.cards) {
      expect(card.text.zh.length).toBeGreaterThan(0)
    }
  })

  it('所有卡牌 ID 符合 {prefix}-{000}-{base|intimate} 格式', () => {
    const pattern = /^[a-z]+-\d{3}-(base|intimate)$/
    for (const card of cardsData.cards) {
      expect(card.id).toMatch(pattern)
    }
  })
})
