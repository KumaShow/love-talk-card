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

/**
 * T025（US2）：values level 分布。
 * 驗證 level 1 / 2 / 3 皆有卡；並刻意「不」以 level 推導 intimate 或敏感題材分類，
 * values 無 intimate 分層，level 僅代表對話深度。
 */
describe('values level 分布（US2 / T025）', () => {
  it('level 1 / 2 / 3 皆應有卡牌分布', () => {
    const levels = new Set(values.cards.map((card) => card.level))

    expect(levels.has(1), '缺少 level 1 卡').toBe(true)
    expect(levels.has(2), '缺少 level 2 卡').toBe(true)
    expect(levels.has(3), '缺少 level 3 卡').toBe(true)
  })

  it('level 不作為 intimate 或敏感題材的推導依據（所有卡皆省略 isIntimate）', () => {
    // 即使含 level 3 深度題，values 仍不標記 isIntimate；深度與 intimate 是兩件事。
    for (const card of values.cards) {
      expect('isIntimate' in card, `${card.id} 不應帶 isIntimate`).toBe(false)
    }
  })
})
