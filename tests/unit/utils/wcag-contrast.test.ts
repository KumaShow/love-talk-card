import { describe, expect, it } from 'vitest'

import cardsData from '@/data/cards.json'

/**
 * T079：主題色彩 WCAG 2.1 AA 對比驗證。
 * 檢查 4 個主題 `colors.text` 分別對 `colors.background` 與
 * `colors.backgroundEnd` 的相對亮度比是否 ≥4.5:1（AA，一般文字）。
 */

/** 將 #rrggbb hex 轉為 0–1 之間的 sRGB 三元組。 */
function hexToRgb(hex: string): [number, number, number] {
  const m = /^#([\da-f]{6})$/i.exec(hex)
  if (m === null) {
    throw new Error(`非法 hex 色票：${hex}`)
  }
  const value = m[1]
  const r = parseInt(value.slice(0, 2), 16) / 255
  const g = parseInt(value.slice(2, 4), 16) / 255
  const b = parseInt(value.slice(4, 6), 16) / 255
  return [r, g, b]
}

/** WCAG 相對亮度（https://www.w3.org/TR/WCAG21/#dfn-relative-luminance）。 */
function relativeLuminance([r, g, b]: [number, number, number]): number {
  const channel = (c: number): number =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

/** 兩個色票的對比比值（>= 1.0）。 */
function contrastRatio(fg: string, bg: string): number {
  const l1 = relativeLuminance(hexToRgb(fg))
  const l2 = relativeLuminance(hexToRgb(bg))
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

describe('主題色彩 WCAG 2.1 AA 對比', () => {
  it.each(cardsData.themes.map((theme) => [theme.id, theme]))(
    'theme="%s" 的 text 對 background 與 backgroundEnd 皆 ≥4.5:1',
    (_id, theme) => {
      const ratioBg = contrastRatio(theme.colors.text, theme.colors.background)
      const ratioBgEnd = contrastRatio(theme.colors.text, theme.colors.backgroundEnd)
      expect(ratioBg).toBeGreaterThanOrEqual(4.5)
      expect(ratioBgEnd).toBeGreaterThanOrEqual(4.5)
    },
  )
})
