import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import ThemePreview from '@/components/home/ThemePreview.vue'
import { cardsData } from '@/data'
import zhTw from '@/i18n/zh-TW.json'
import type { CardsData, Theme } from '@/types'

/**
 * T094：ThemePreview（主題預覽浮層）元件測試（TDD Red）。
 *
 * 驗證重點：
 * - theme=null 時浮層與 backdrop 皆不顯示
 * - 提供 theme 時顯示中文名稱、英文短名稱與中文描述
 * - CSS custom properties 注入 --color-card / --color-brand / --color-accent
 * - 點 CTA → emit start(theme)
 * - 點 backdrop 或 dismiss 按鈕 → emit dismiss
 * - darkened backdrop 存在（data-test=preview-backdrop）
 */

function getAttractionTheme(): Theme {
  const dataset = cardsData as CardsData
  return dataset.themes.find((t) => t.id === 'attraction') as Theme
}

describe('ThemePreview', () => {
  it('theme=null 時不顯示 home-preview 與 backdrop', () => {
    const wrapper = mount(ThemePreview, { props: { theme: null } })

    expect(wrapper.find('[data-test="home-preview"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="preview-backdrop"]').exists()).toBe(false)
  })

  it('提供 theme 時以「中文名稱（英文短名稱）」顯示標題與中文描述', () => {
    const theme = getAttractionTheme()
    const wrapper = mount(ThemePreview, { props: { theme } })

    const section = wrapper.find('[data-test="home-preview"]')
    expect(section.exists()).toBe(true)
    expect(wrapper.find('[data-test="preview-title"]').text()).toBe(
      `${theme.name.zh}（${zhTw.theme.attraction.englishShortName}）`,
    )
    expect(section.text()).toContain(theme.description.zh)
  })

  it.each([
    ['self', '自我探索（Self）'],
    ['interaction', '互動理解（Interaction）'],
    ['trust', '信任成長（Trust）'],
    ['desire', '慾望與身體親密（Desire）'],
  ] as const)('%s 主題應顯示對應的雙語標題', (themeId, expectedTitle) => {
    const dataset = cardsData as CardsData
    const theme = dataset.themes.find((item) => item.id === themeId) as Theme
    const wrapper = mount(ThemePreview, { props: { theme } })

    expect(wrapper.find('[data-test="preview-title"]').text()).toBe(expectedTitle)
  })

  it('darkened backdrop 應顯示於 theme 提供時', () => {
    const theme = getAttractionTheme()
    const wrapper = mount(ThemePreview, { props: { theme } })

    expect(wrapper.find('[data-test="preview-backdrop"]').exists()).toBe(true)
  })

  it('inline style 注入 --color-card / --color-brand / --color-accent', () => {
    const theme = getAttractionTheme()
    const wrapper = mount(ThemePreview, { props: { theme } })

    const section = wrapper.find('[data-test="home-preview"]')
    const style = section.attributes('style') ?? ''

    expect(style).toMatch(/--color-card:\s*#C76D8E/i)
    expect(style).toMatch(/--color-brand:\s*#E8A0BF/i)
    expect(style).toMatch(/--color-accent:\s*#FFD6E0/i)
  })

  it('點 CTA 開始對話 → emit start 並攜帶 theme 物件', async () => {
    const theme = getAttractionTheme()
    const wrapper = mount(ThemePreview, { props: { theme } })

    await wrapper.find('[data-test="preview-cta"]').trigger('click')

    const events = wrapper.emitted('start')
    expect(events).toHaveLength(1)
    expect(events?.[0]?.[0]).toEqual(theme)
  })

  it('點 backdrop → emit dismiss', async () => {
    const theme = getAttractionTheme()
    const wrapper = mount(ThemePreview, { props: { theme } })

    await wrapper.find('[data-test="preview-backdrop"]').trigger('click')

    expect(wrapper.emitted('dismiss')).toHaveLength(1)
  })

  it('點 dismiss 收起按鈕 → emit dismiss', async () => {
    const theme = getAttractionTheme()
    const wrapper = mount(ThemePreview, { props: { theme } })

    const dismissBtn = wrapper.find('[data-test="preview-dismiss"]')
    expect(dismissBtn.exists()).toBe(true)
    await dismissBtn.trigger('click')

    expect(wrapper.emitted('dismiss')).toHaveLength(1)
  })

  it('不同主題應各自帶入自己的色票', () => {
    const dataset = cardsData as CardsData
    const trustTheme = dataset.themes.find((t) => t.id === 'trust') as Theme

    const wrapper = mount(ThemePreview, { props: { theme: trustTheme } })
    const section = wrapper.find('[data-test="home-preview"]')
    const style = section.attributes('style') ?? ''

    expect(style).toMatch(new RegExp(`--color-card:\\s*${trustTheme.colors.cardBack}`, 'i'))
    expect(style).toMatch(new RegExp(`--color-brand:\\s*${trustTheme.colors.primary}`, 'i'))
  })

  it('預覽 desire 主題時應顯示成人內容提示，且文案取自 i18n', () => {
    const dataset = cardsData as CardsData
    const desireTheme = dataset.themes.find((t) => t.id === 'desire') as Theme

    const wrapper = mount(ThemePreview, { props: { theme: desireTheme } })

    expect(wrapper.find('[data-test="preview-adult-hint"]').exists()).toBe(true)
    expect(wrapper.text()).toContain(zhTw.home.preview.adultHint)
  })

  it('預覽非 desire 主題時不應顯示成人內容提示', () => {
    const theme = getAttractionTheme()
    const wrapper = mount(ThemePreview, { props: { theme } })

    expect(wrapper.find('[data-test="preview-adult-hint"]').exists()).toBe(false)
  })
})
