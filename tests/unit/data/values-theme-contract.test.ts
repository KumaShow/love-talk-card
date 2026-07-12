import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

import { describe, expect, it } from 'vitest'
import Ajv from 'ajv'

/**
 * T004：values 主題契約測試。
 * 以 ajv 驗證 contracts/values-theme.schema.json 能接受 25 張 val-### 的合法資料，
 * 並拒絕 24 / 26 張、帶 base 後綴的卡牌 id 與缺四語文案的測試資料。
 */
const __dirname = dirname(fileURLToPath(import.meta.url))
const schemaPath = resolve(
  __dirname,
  '../../../specs/003-values-theme/contracts/values-theme.schema.json',
)
const valuesSchema = JSON.parse(readFileSync(schemaPath, 'utf-8')) as Record<string, unknown>

/** 產生一張合法的 values 測試卡（id 依序 val-001 起算） */
function makeCard(index: number): Record<string, unknown> {
  const serial = String(index + 1).padStart(3, '0')
  return {
    id: `val-${serial}`,
    level: (index % 3) + 1,
    text: {
      zh: `測試卡 ${serial} 的中文文案`,
      en: `Test card ${serial} in English`,
      th: `Test card ${serial} in Thai placeholder`,
      ja: `Test card ${serial} in Japanese placeholder`,
    },
  }
}

/** 產生指定張數的 values 主題測試資料（結構比照 contracts 契約） */
function makeValuesThemeFile(cardCount: number): Record<string, unknown> {
  return {
    id: 'values',
    name: { zh: '價值觀與未來', en: 'Values & Future' },
    description: { zh: '在生活選擇裡看見彼此靈魂共振', en: 'See your souls resonate in life choices' },
    endMessage: { zh: '謝謝你們聊完這些選擇', en: 'Thank you for talking through these choices' },
    colors: {
      primary: '#4A5D7E',
      secondary: '#8FA3C8',
      background: '#1F2A44',
      backgroundEnd: '#2E3C5C',
      text: '#F5F7FB',
      cardBack: '#31406B',
    },
    cards: Array.from({ length: cardCount }, (_, index) => makeCard(index)),
  }
}

describe('values-theme.schema.json 契約驗證', () => {
  const ajv = new Ajv({ allErrors: true, strict: false })
  const validate = ajv.compile(valuesSchema)

  it('接受 25 張 val-### 且四語文案完整的資料', () => {
    const ok = validate(makeValuesThemeFile(25))
    if (!ok) {
      console.error(validate.errors)
    }
    expect(ok).toBe(true)
  })

  it.each([24, 26])('拒絕 %i 張卡牌的資料（總數必須恰為 25）', (cardCount) => {
    expect(validate(makeValuesThemeFile(cardCount))).toBe(false)
  })

  it('拒絕帶 base 後綴的卡牌 id（val-001-base）', () => {
    const themeFile = makeValuesThemeFile(25)
    const cards = themeFile.cards as Array<Record<string, unknown>>
    cards[0] = { ...cards[0], id: 'val-001-base' }

    expect(validate(themeFile)).toBe(false)
  })

  it.each(['zh', 'en', 'th', 'ja'] as const)('拒絕缺 %s 文案的卡牌', (lang) => {
    const themeFile = makeValuesThemeFile(25)
    const cards = themeFile.cards as Array<Record<string, unknown>>
    const text = { ...(cards[0].text as Record<string, string>) }
    delete text[lang]
    cards[0] = { ...cards[0], text }

    expect(validate(themeFile)).toBe(false)
  })
})
