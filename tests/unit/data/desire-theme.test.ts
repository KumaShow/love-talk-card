import { describe, expect, it } from 'vitest'

import { ThemeFileSchema } from '@/data/validators'
import desire from '@/data/themes/desire.json'

describe('desire 主題資料', () => {
  it('應通過 ThemeFileSchema 驗證', () => {
    const result = ThemeFileSchema.safeParse(desire)

    expect(result.success).toBe(true)
  })

  it('應剛好包含 20 張 des-NNN 卡牌，且不含 intimate 分層', () => {
    expect(desire.cards).toHaveLength(20)

    for (const card of desire.cards) {
      expect(card.id).toMatch(/^des-\d{3}$/)
      expect(card.isIntimate).not.toBe(true)
    }
  })

  it('每張卡的四語系文字皆應非空', () => {
    for (const card of desire.cards) {
      expect(card.text.zh.trim()).not.toHaveLength(0)
      expect(card.text.en.trim()).not.toHaveLength(0)
      expect(card.text.th.trim()).not.toHaveLength(0)
      expect(card.text.ja.trim()).not.toHaveLength(0)
    }
  })
})
