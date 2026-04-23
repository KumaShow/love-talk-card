import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

import { describe, expect, it } from 'vitest'
import Ajv from 'ajv'

import cardsData from '@/data/cards.json'

/**
 * T077：cards.json 結構契約測試。
 * 以 ajv 驗證資料是否符合 contracts/card-data.schema.json，
 * 並補強幾項 schema 無法單獨涵蓋的業務約束（每主題 15+5、ID 前綴一致、zh 非空）。
 */
const __dirname = dirname(fileURLToPath(import.meta.url))
const schemaPath = resolve(
  __dirname,
  '../../../specs/001-love-talk-card-game/contracts/card-data.schema.json',
)
const cardSchema = JSON.parse(readFileSync(schemaPath, 'utf-8')) as Record<string, unknown>

describe('cards.json 契約驗證', () => {
  const ajv = new Ajv({ allErrors: true, strict: false })
  const validate = ajv.compile(cardSchema)

  it('應通過 card-data.schema.json 全部欄位驗證', () => {
    const ok = validate(cardsData)
    if (!ok) {
      // 發生失敗時把 ajv 細節輸出，方便定位
      console.error(validate.errors)
    }
    expect(ok).toBe(true)
  })

  it('總計 80 張卡牌且覆蓋 4 個主題', () => {
    expect(cardsData.cards).toHaveLength(80)
    expect(cardsData.themes).toHaveLength(4)
  })

  it('每個主題皆含 15 張基礎牌 + 5 張私密牌', () => {
    for (const theme of cardsData.themes) {
      const themeCards = cardsData.cards.filter((card) => card.theme === theme.id)
      const base = themeCards.filter((card) => !card.isIntimate)
      const intimate = themeCards.filter((card) => card.isIntimate)
      expect(base).toHaveLength(15)
      expect(intimate).toHaveLength(5)
    }
  })

  it('所有卡牌 ID 符合 {prefix}-{000}-{base|intimate} 格式', () => {
    const pattern = /^[a-z]+-\d{3}-(base|intimate)$/
    for (const card of cardsData.cards) {
      expect(card.id).toMatch(pattern)
    }
  })

  it('所有卡牌 text.zh 皆為非空字串', () => {
    for (const card of cardsData.cards) {
      expect(typeof card.text.zh).toBe('string')
      expect(card.text.zh.length).toBeGreaterThan(0)
    }
  })

  it('卡牌 ID 在資料集內唯一', () => {
    const ids = cardsData.cards.map((card) => card.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
