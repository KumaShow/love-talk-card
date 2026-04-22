import { describe, expect, it } from 'vitest'

import type { Card } from '@/types'
import { getCardText } from '@/utils/card-text'

/**
 * T051：getCardText() 語言回退鏈單元測試。
 *
 * 回退規則（data-model.md §4 / spec FR-013）：
 *   選定副語言文字 → 為空時回退 en → en 也為空時回退 zh。
 *
 * 此邏輯為防禦性實作，schema 已要求所有副語言文字 minLength=1，
 * 但仍保留回退鏈以避免人為資料缺漏時 UI 整段空白。
 */
function makeCard(overrides: Partial<Card['text']> = {}): Card {
  return {
    id: 'att-001-base',
    theme: 'attraction',
    isIntimate: false,
    level: 1,
    text: {
      zh: '中文題目',
      en: 'English question',
      th: 'คำถามภาษาไทย',
      ja: '日本語の質問',
      ...overrides,
    },
  }
}

describe('getCardText', () => {
  it('副語言文字非空時回傳該語言文字', () => {
    const card = makeCard()

    expect(getCardText(card, 'th')).toBe('คำถามภาษาไทย')
    expect(getCardText(card, 'ja')).toBe('日本語の質問')
    expect(getCardText(card, 'en')).toBe('English question')
  })

  it('指定語言為空時回退到 en', () => {
    const card = makeCard({ th: '' })

    expect(getCardText(card, 'th')).toBe('English question')
  })

  it('日文為空時回退到 en（不直接落到 zh）', () => {
    const card = makeCard({ ja: '' })

    expect(getCardText(card, 'ja')).toBe('English question')
  })

  it('指定語言與 en 皆為空時最終回退到 zh', () => {
    const card = makeCard({ th: '', en: '' })

    expect(getCardText(card, 'th')).toBe('中文題目')
  })

  it('全部空白字串時仍回傳 zh 主語言文字（保證 UI 不為空）', () => {
    const card = makeCard({ ja: '', en: '' })

    expect(getCardText(card, 'ja')).toBe('中文題目')
  })
})
