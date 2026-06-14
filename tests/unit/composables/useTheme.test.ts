import { afterEach, describe, expect, it } from 'vitest'

import { useTheme } from '@/composables/useTheme'
import { cardsData } from '@/data'
import type { CardsData, ThemeId } from '@/types'

/**
 * T059：useTheme composable 單元測試。
 *
 * 涵蓋：
 * - applyTheme(themeId, themes) 會在 document.documentElement 寫入 6 個 CSS 變數
 * - 切換主題時 6 個變數皆會同步更新（不殘留上一個主題）
 * - resetTheme() 會清除 inline style 中的 6 個變數（回退至 :root 預設）
 * - applyTheme 傳入未知 themeId 時應安全 no-op，不破壞現有變數
 */
describe('useTheme', () => {
  const dataset = cardsData as CardsData
  const themeVarNames = [
    '--color-surface',
    '--color-surface-end',
    '--color-brand',
    '--color-accent',
    '--color-ink',
    '--color-card',
    '--color-card-surface',
  ] as const

  afterEach(() => {
    // 每則測試後清空 documentElement 的 inline CSS 變數，避免互相污染
    themeVarNames.forEach((name) => {
      document.documentElement.style.removeProperty(name)
    })
  })

  function findTheme(themeId: ThemeId) {
    const theme = dataset.themes.find((entry) => entry.id === themeId)
    if (!theme) {
      throw new Error(`cards.json 缺少主題 ${themeId}，測試資料不完整`)
    }
    return theme
  }

  it('applyTheme 會在 documentElement 寫入 6 個 CSS 變數', () => {
    const { applyTheme } = useTheme()
    const attraction = findTheme('attraction')

    applyTheme('attraction', dataset.themes)

    const root = document.documentElement
    expect(root.style.getPropertyValue('--color-surface')).toBe(attraction.colors.background)
    expect(root.style.getPropertyValue('--color-surface-end')).toBe(attraction.colors.backgroundEnd)
    expect(root.style.getPropertyValue('--color-brand')).toBe(attraction.colors.primary)
    expect(root.style.getPropertyValue('--color-accent')).toBe(attraction.colors.secondary)
    expect(root.style.getPropertyValue('--color-ink')).toBe(attraction.colors.text)
    expect(root.style.getPropertyValue('--color-card')).toBe(attraction.colors.cardBack)
  })

  it('切換主題時應同步更新全部 6 個 CSS 變數', () => {
    const { applyTheme } = useTheme()
    const trust = findTheme('trust')

    applyTheme('attraction', dataset.themes)
    applyTheme('trust', dataset.themes)

    const root = document.documentElement
    expect(root.style.getPropertyValue('--color-surface')).toBe(trust.colors.background)
    expect(root.style.getPropertyValue('--color-surface-end')).toBe(trust.colors.backgroundEnd)
    expect(root.style.getPropertyValue('--color-brand')).toBe(trust.colors.primary)
    expect(root.style.getPropertyValue('--color-accent')).toBe(trust.colors.secondary)
    expect(root.style.getPropertyValue('--color-ink')).toBe(trust.colors.text)
    expect(root.style.getPropertyValue('--color-card')).toBe(trust.colors.cardBack)
  })

  it('resetTheme 應清除 inline 寫入的 6 個 CSS 變數', () => {
    const { applyTheme, resetTheme } = useTheme()

    applyTheme('attraction', dataset.themes)
    resetTheme()

    const root = document.documentElement
    themeVarNames.forEach((name) => {
      expect(root.style.getPropertyValue(name)).toBe('')
    })
  })

  it('淺底主題的卡面襯底維持白色（--color-card-surface = #ffffff）', () => {
    const { applyTheme } = useTheme()

    applyTheme('attraction', dataset.themes)

    const root = document.documentElement
    // attraction 為深字淺底主題，卡面沿用白卡，確保不影響既有四主題外觀
    expect(root.style.getPropertyValue('--color-card-surface')).toBe('#ffffff')
  })

  it('深底主題 desire 的卡面襯底改用主題 cardBack 深色，避免淺字白卡看不清', () => {
    const { applyTheme } = useTheme()
    const desire = findTheme('desire')

    applyTheme('desire', dataset.themes)

    const root = document.documentElement
    // desire 為淺字深底主題，卡面須用 cardBack 深色襯底（與淺色 ink 形成可讀對比）
    expect(root.style.getPropertyValue('--color-card-surface')).toBe(desire.colors.cardBack)
  })

  it('由深底主題切回淺底主題時，卡面襯底須復原為白色（不殘留深色）', () => {
    const { applyTheme } = useTheme()

    applyTheme('desire', dataset.themes)
    applyTheme('attraction', dataset.themes)

    const root = document.documentElement
    expect(root.style.getPropertyValue('--color-card-surface')).toBe('#ffffff')
  })

  it('applyTheme 傳入不存在的 themeId 時應 no-op，不破壞現有變數', () => {
    const { applyTheme } = useTheme()
    const attraction = findTheme('attraction')

    applyTheme('attraction', dataset.themes)
    // 以 type assertion 模擬外部誤傳非法 id；runtime 應安全略過
    applyTheme('does-not-exist' as ThemeId, dataset.themes)

    const root = document.documentElement
    expect(root.style.getPropertyValue('--color-brand')).toBe(attraction.colors.primary)
    expect(root.style.getPropertyValue('--color-surface')).toBe(attraction.colors.background)
  })
})
