import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import ThemeCardDeck from '@/components/home/ThemeCardDeck.vue'
import cardsData from '@/data/cards.json'
import type { CardsData, Theme } from '@/types'

/**
 * T094：ThemeCardDeck（首頁主題卡堆）元件測試（TDD Red）。
 *
 * 驗證重點：
 * - 顯示主題中文名稱（theme.name.zh）
 * - aria-label 包含主題中文名稱以利螢幕閱讀器
 * - inline style 注入 --color-card-back（來自 theme.colors.cardBack）
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

  it('inline style 應注入 --color-card-back 為 theme.colors.cardBack', () => {
    const theme = getAttractionTheme()
    const wrapper = mount(ThemeCardDeck, { props: { theme } })

    const style = wrapper.attributes('style') ?? ''
    expect(style).toMatch(/--color-card-back:\s*#C76D8E/i)
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

    expect(style).toMatch(/--color-card-back:\s*#5BA4C0/i)
  })
})
