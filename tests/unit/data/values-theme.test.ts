import { describe, expect, it } from 'vitest'

import { ThemeFileSchema } from '@/data/validators'
import values from '@/data/themes/values.json'

/**
 * T013 / T014：values 主題資料單元測試。
 * 驗證 values.json 通過 ThemeFileSchema、總數恰 25、id 為 val-001～val-025、
 * level 僅 1/2/3、所有卡省略 isIntimate，且四語文字皆非空（結構檢查）。
 * zh / en 真實文案（非 placeholder）之內容檢查屬 US2（T024），不在本檔。
 */
describe('values 主題資料', () => {
  it('應通過 ThemeFileSchema 驗證', () => {
    const result = ThemeFileSchema.safeParse(values)

    expect(result.success).toBe(true)
  })

  it('應剛好包含 25 張卡牌，id 依序為 val-001 至 val-025', () => {
    expect(values.cards).toHaveLength(25)

    const expectedIds = Array.from(
      { length: 25 },
      (_, index) => `val-${String(index + 1).padStart(3, '0')}`,
    )
    expect(values.cards.map((card) => card.id)).toEqual(expectedIds)
  })

  it('每張卡的 level 僅能為 1、2 或 3', () => {
    for (const card of values.cards) {
      expect([1, 2, 3]).toContain(card.level)
    }
  })

  it('所有卡牌皆省略 isIntimate（values 不使用 intimate 分層）', () => {
    for (const card of values.cards) {
      expect('isIntimate' in card).toBe(false)
    }
  })

  it('每張卡的四語系文字皆應非空', () => {
    for (const card of values.cards) {
      expect(card.text.zh.trim()).not.toHaveLength(0)
      expect(card.text.en.trim()).not.toHaveLength(0)
      expect(card.text.th.trim()).not.toHaveLength(0)
      expect(card.text.ja.trim()).not.toHaveLength(0)
    }
  })
})
