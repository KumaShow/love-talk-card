import { afterEach, describe, expect, it } from 'vitest'

import { useTheme } from '@/composables/useTheme'
import cardsData from '@/data/cards.json'
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
    '--color-bg',
    '--color-bg-end',
    '--color-primary',
    '--color-secondary',
    '--color-text',
    '--color-card-back',
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
    expect(root.style.getPropertyValue('--color-bg')).toBe(attraction.colors.background)
    expect(root.style.getPropertyValue('--color-bg-end')).toBe(attraction.colors.backgroundEnd)
    expect(root.style.getPropertyValue('--color-primary')).toBe(attraction.colors.primary)
    expect(root.style.getPropertyValue('--color-secondary')).toBe(attraction.colors.secondary)
    expect(root.style.getPropertyValue('--color-text')).toBe(attraction.colors.text)
    expect(root.style.getPropertyValue('--color-card-back')).toBe(attraction.colors.cardBack)
  })

  it('切換主題時應同步更新全部 6 個 CSS 變數', () => {
    const { applyTheme } = useTheme()
    const trust = findTheme('trust')

    applyTheme('attraction', dataset.themes)
    applyTheme('trust', dataset.themes)

    const root = document.documentElement
    expect(root.style.getPropertyValue('--color-bg')).toBe(trust.colors.background)
    expect(root.style.getPropertyValue('--color-bg-end')).toBe(trust.colors.backgroundEnd)
    expect(root.style.getPropertyValue('--color-primary')).toBe(trust.colors.primary)
    expect(root.style.getPropertyValue('--color-secondary')).toBe(trust.colors.secondary)
    expect(root.style.getPropertyValue('--color-text')).toBe(trust.colors.text)
    expect(root.style.getPropertyValue('--color-card-back')).toBe(trust.colors.cardBack)
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

  it('applyTheme 傳入不存在的 themeId 時應 no-op，不破壞現有變數', () => {
    const { applyTheme } = useTheme()
    const attraction = findTheme('attraction')

    applyTheme('attraction', dataset.themes)
    // 以 type assertion 模擬外部誤傳非法 id；runtime 應安全略過
    applyTheme('does-not-exist' as ThemeId, dataset.themes)

    const root = document.documentElement
    expect(root.style.getPropertyValue('--color-primary')).toBe(attraction.colors.primary)
    expect(root.style.getPropertyValue('--color-bg')).toBe(attraction.colors.background)
  })
})
