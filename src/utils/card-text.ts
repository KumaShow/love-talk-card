import type { Card, SecondaryLang } from '@/types'

/**
 * 取得卡牌指定副語言文字，缺漏時依序回退：lang → en → zh。
 *
 * 卡牌資料 schema 已要求所有語言 minLength=1，此回退鏈為防禦性實作，
 * 確保未來若有資料缺漏（例如 i18n 翻譯尚未補齊），UI 仍能顯示可讀內容
 * 而非整段空白。
 */
export function getCardText(card: Card, lang: SecondaryLang): string {
  const candidate = card.text[lang]
  if (typeof candidate === 'string' && candidate.length > 0) {
    return candidate
  }
  if (card.text.en.length > 0) {
    return card.text.en
  }
  return card.text.zh
}
