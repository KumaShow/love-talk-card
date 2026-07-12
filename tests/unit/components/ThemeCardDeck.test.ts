import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import ThemeCardDeck from '@/components/home/ThemeCardDeck.vue'
import { cardsData } from '@/data'
import type { CardsData, Theme } from '@/types'

/**
 * T094：ThemeCardDeck（首頁主題卡堆）元件測試（TDD Red）。
 *
 * 驗證重點：
 * - 顯示主題中文名稱（theme.name.zh）
 * - aria-label 包含主題中文名稱以利螢幕閱讀器
 * - inline style 注入 --color-card（來自 theme.colors.cardBack）
 * - data-test 命名 theme-deck-{themeId}
 * - 點擊觸發 select 事件並攜帶 theme 物件
 */

function getAttractionTheme(): Theme {
  const dataset = cardsData as CardsData
  return dataset.themes.find((t) => t.id === 'attraction') as Theme
}

describe('ThemeCardDeck', () => {
  it('應顯示 theme.name.zh 作為卡堆名稱', () => {
    const theme = getAttractionTheme()
    const wrapper = mount(ThemeCardDeck, { props: { theme } })

    expect(wrapper.text()).toContain(theme.name.zh)
  })

  it('根元素 aria-label 應包含主題中文名稱', () => {
    const theme = getAttractionTheme()
    const wrapper = mount(ThemeCardDeck, { props: { theme } })

    const label = wrapper.attributes('aria-label') ?? ''
    expect(label).toContain(theme.name.zh)
  })

  it('data-test 應為 theme-deck-{themeId}', () => {
    const theme = getAttractionTheme()
    const wrapper = mount(ThemeCardDeck, { props: { theme } })

    expect(wrapper.find('[data-test="theme-deck-attraction"]').exists()).toBe(true)
  })

  it('inline style 應注入 --color-card 為 theme.colors.cardBack', () => {
    const theme = getAttractionTheme()
    const wrapper = mount(ThemeCardDeck, { props: { theme } })

    const style = wrapper.attributes('style') ?? ''
    expect(style).toMatch(/--color-card:\s*#C76D8E/i)
  })

  it('點擊應 emit select 並攜帶完整 theme 物件', async () => {
    const theme = getAttractionTheme()
    const wrapper = mount(ThemeCardDeck, { props: { theme } })

    await wrapper.trigger('click')

    const events = wrapper.emitted('select')
    expect(events).toHaveLength(1)
    expect(events?.[0]?.[0]).toEqual(theme)
  })

  it('不同主題應各自帶入自己的 cardBack 色票', () => {
    const dataset = cardsData as CardsData
    const selfTheme = dataset.themes.find((t) => t.id === 'self') as Theme

    const wrapper = mount(ThemeCardDeck, { props: { theme: selfTheme } })
    const style = wrapper.attributes('style') ?? ''

    expect(style).toMatch(/--color-card:\s*#5BA4C0/i)
  })

  /**
   * T017：首頁主題清單包含第 6 主題 values。
   * 名稱由主題資料（values.json 的 name.zh）外部化取得，
   * 卡面背景與外框需有可用資源（初版可暫代既有視覺，故不硬檢特定檔名）。
   */
  it('首頁主題清單應包含第 6 主題 values，且名稱由主題資料外部化取得', () => {
    const dataset = cardsData as CardsData
    const valuesTheme = dataset.themes.find((t) => t.id === 'values')
    expect(valuesTheme).toBeDefined()

    const wrapper = mount(ThemeCardDeck, { props: { theme: valuesTheme as Theme } })

    expect(wrapper.find('[data-test="theme-deck-values"]').exists()).toBe(true)
    expect(wrapper.text()).toContain((valuesTheme as Theme).name.zh)
    expect(wrapper.text()).toContain('價值觀與未來')
    expect(wrapper.find('[data-test="theme-card-background"]').attributes('src')).toBeTruthy()
    expect(wrapper.find('[data-test="theme-card-frame"]').attributes('src')).toBeTruthy()
  })

  it.each([
    ['attraction', 'attraction-bg-v1.webp', 'attraction-frame-v1.png'],
    ['self', 'self-bg-v1.webp', 'self-frame-v1.png'],
    ['interaction', 'interaction-bg-v1.webp', 'interaction-frame-v1.png'],
    ['trust', 'trust-bg-v1.webp', 'trust-frame-v1.png'],
    ['desire', 'desire-bg-v3.webp', 'desire-frame-v3.png'],
  ])('%s 首頁卡堆應顯示指定背景與外框', (themeId, backgroundName, frameName) => {
    const dataset = cardsData as CardsData
    const theme = dataset.themes.find((item) => item.id === themeId) as Theme
    const wrapper = mount(ThemeCardDeck, { props: { theme } })

    expect(wrapper.find('[data-test="theme-card-background"]').attributes('src')).toContain(
      backgroundName,
    )
    expect(wrapper.find('[data-test="theme-card-frame"]').attributes('src')).toContain(frameName)
  })
})
