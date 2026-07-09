import { describe, expect, it } from 'vitest'

import { cardsData } from '@/data'
import { ThemeCardSchema, ThemeFileSchema } from '@/data/validators'
import attraction from '@/data/themes/attraction.json'
import self_ from '@/data/themes/self.json'
import interaction from '@/data/themes/interaction.json'
import trust from '@/data/themes/trust.json'
import desire from '@/data/themes/desire.json'

/**
 * 主題 JSON 檔 Zod 結構驗證。
 * 以 ThemeFileSchema 驗證各主題資料，並補強幾項 schema 無法單獨涵蓋的業務約束。
 */
describe('主題 JSON 檔 Zod 結構驗證', () => {
  const themeFiles = [attraction, self_, interaction, trust, desire]

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

  it('所有卡牌 ID 符合 des-###、val-### 或其餘主題的 {prefix}-{000}-{base|intimate} 格式', () => {
    const pattern = /^(des-\d{3}|val-\d{3}|(?!des-|val-)[a-z]+-\d{3}-(base|intimate))$/
    for (const card of cardsData.cards) {
      expect(card.id).toMatch(pattern)
    }
  })

  it('desire 卡牌可省略 isIntimate 並使用 des-### ID 格式', () => {
    const result = ThemeCardSchema.safeParse({
      id: 'des-001',
      level: 1,
      text: {
        zh: '描述一個讓你感到安全的親密邀請方式。',
        en: 'Describe an intimate invitation that helps you feel safe.',
        th: 'Describe an intimate invitation that helps you feel safe.',
        ja: 'Describe an intimate invitation that helps you feel safe.',
      },
    })

    expect(result.success).toBe(true)
  })

  it('values 卡牌可省略 isIntimate 並使用 val-### ID 格式', () => {
    const result = ThemeCardSchema.safeParse({
      id: 'val-001',
      level: 1,
      text: {
        zh: '聊聊你最想守住的一個生活選擇。',
        en: 'Share one life choice you most want to protect.',
        th: 'Share one life choice you most want to protect.',
        ja: 'Share one life choice you most want to protect.',
      },
    })

    expect(result.success).toBe(true)
  })

  it.each(['val-1', 'val-0001', 'val-001-base', 'val-001-intimate'])(
    '拒絕不符合 val-### 規則的卡牌 ID：%s',
    (id) => {
      const result = ThemeCardSchema.safeParse({
        id,
        level: 1,
        text: {
          zh: '測試文字',
          en: 'Test text',
          th: 'Test text',
          ja: 'Test text',
        },
      })

      expect(result.success).toBe(false)
    },
  )

  it('values 主題檔所有卡牌省略 isIntimate 仍應通過 ThemeFileSchema 驗證', () => {
    const valuesThemeFile = {
      id: 'values',
      name: { zh: '價值觀與未來', en: 'Values & Future' },
      description: {
        zh: '在生活選擇裡看見彼此靈魂共振',
        en: 'See your souls resonate in life choices',
      },
      colors: {
        primary: '#4A5D7E',
        secondary: '#8FA3C8',
        background: '#1F2A44',
        backgroundEnd: '#2E3C5C',
        text: '#F5F7FB',
        cardBack: '#31406B',
      },
      endMessage: {
        zh: '謝謝你們聊完這些選擇',
        en: 'Thank you for talking through these choices',
      },
      cards: [
        {
          id: 'val-001',
          level: 1,
          text: {
            zh: '聊聊你最想守住的一個生活選擇。',
            en: 'Share one life choice you most want to protect.',
            th: 'Share one life choice you most want to protect.',
            ja: 'Share one life choice you most want to protect.',
          },
        },
        {
          id: 'val-002',
          level: 2,
          text: {
            zh: '你想像中的五年後生活是什麼樣子？',
            en: 'What does life look like for you five years from now?',
            th: 'What does life look like for you five years from now?',
            ja: 'What does life look like for you five years from now?',
          },
        },
      ],
    }

    const result = ThemeFileSchema.safeParse(valuesThemeFile)

    expect(result.success).toBe(true)
  })

  it('非 desire 主題若省略 isIntimate，應無法通過 ThemeFileSchema 驗證', () => {
    const invalidAttraction = {
      ...attraction,
      cards: attraction.cards.map((card, index) =>
        index === 0 ? { id: card.id, level: card.level, text: card.text } : card,
      ),
    }

    const result = ThemeFileSchema.safeParse(invalidAttraction)

    expect(result.success).toBe(false)
  })

  it.each(['Des-1', 'des-01', 'des-0001', 'att-001', 'des-001-base'])(
    '仍拒絕非法卡牌 ID：%s',
    (id) => {
      const result = ThemeCardSchema.safeParse({
        id,
        level: 1,
        text: {
          zh: '測試文字',
          en: 'Test text',
          th: 'Test text',
          ja: 'Test text',
        },
      })

      expect(result.success).toBe(false)
    },
  )
})
