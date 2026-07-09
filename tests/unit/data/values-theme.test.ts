import { describe, expect, it } from 'vitest'

import { ThemeFileSchema } from '@/data/validators'
import values from '@/data/themes/values.json'
import { VALUES_FORBIDDEN_PHRASES } from './values-forbidden-phrases'

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
 * T024（US2）：values 內容真實性與禁用措辭掃描。
 * 承接自 T014 移出的 zh / en 真實文案（非 placeholder）斷言，
 * 並驗證 25 張卡不含相容性分數、對錯評分、命令伴侶改變、逼迫表態等禁用措辭。
 * th / ja 屬英文鏡射佔位策略（見 T027），故此處不對其做真實性斷言。
 */
describe('values 內容真實性與語氣（US2 / T024）', () => {
  /** placeholder 佔位字樣：真實文案不應出現 */
  const PLACEHOLDER_PATTERN = /\b(?:TODO|PLACEHOLDER|LOREM|IPSUM|TBD|FIXME|XXX)\b|待補|佔位/i

  it('每張卡 zh 為真實中文文案（含 CJK、具長度、非 placeholder）', () => {
    for (const card of values.cards) {
      expect(card.text.zh, `${card.id} zh 應含中文字`).toMatch(/[一-鿿]/)
      expect(card.text.zh.trim().length, `${card.id} zh 過短，疑為佔位`).toBeGreaterThanOrEqual(10)
      expect(card.text.zh, `${card.id} zh 含 placeholder 字樣`).not.toMatch(PLACEHOLDER_PATTERN)
    }
  })

  it('每張卡 en 為真實英文文案（含拉丁字母、非 placeholder、不沿用 zh、不含 CJK）', () => {
    for (const card of values.cards) {
      expect(card.text.en, `${card.id} en 應含英文字母`).toMatch(/[A-Za-z]/)
      expect(card.text.en.trim().length, `${card.id} en 過短，疑為佔位`).toBeGreaterThanOrEqual(10)
      expect(card.text.en, `${card.id} en 含 placeholder 字樣`).not.toMatch(PLACEHOLDER_PATTERN)
      expect(card.text.en, `${card.id} en 不應直接沿用 zh`).not.toBe(card.text.zh)
      expect(card.text.en, `${card.id} en 不應含中文字（疑為未翻譯佔位）`).not.toMatch(
        /[一-鿿]/,
      )
    }
  })

  it('zh / en 文案皆不含審判、測驗、相容性評分或逼迫措辭', () => {
    for (const card of values.cards) {
      for (const { pattern, reason } of VALUES_FORBIDDEN_PHRASES) {
        expect(card.text.zh, `${card.id} zh 命中禁用措辭（${reason}）`).not.toMatch(pattern)
        expect(card.text.en, `${card.id} en 命中禁用措辭（${reason}）`).not.toMatch(pattern)
      }
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
