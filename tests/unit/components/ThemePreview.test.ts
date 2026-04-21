import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import ThemePreview from '@/components/home/ThemePreview.vue'
import cardsData from '@/data/cards.json'
import type { CardsData, Theme } from '@/types'

/**
 * T094：ThemePreview（主題預覽浮層）元件測試（TDD Red）。
 *
 * 驗證重點：
 * - theme=null 時浮層與 backdrop 皆不顯示
 * - 提供 theme 時顯示 name.zh 與 description.zh
 * - CSS custom properties 注入 --color-card-back / --color-primary / --color-secondary
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

  it('提供 theme 時顯示 name.zh 與 description.zh', () => {
    const theme = getAttractionTheme()
    const wrapper = mount(ThemePreview, { props: { theme } })

    const section = wrapper.find('[data-test="home-preview"]')
    expect(section.exists()).toBe(true)
    expect(section.text()).toContain(theme.name.zh)
    expect(section.text()).toContain(theme.description.zh)
  })

  it('darkened backdrop 應顯示於 theme 提供時', () => {
    const theme = getAttractionTheme()
    const wrapper = mount(ThemePreview, { props: { theme } })

    expect(wrapper.find('[data-test="preview-backdrop"]').exists()).toBe(true)
  })

  it('inline style 注入 --color-card-back / --color-primary / --color-secondary', () => {
    const theme = getAttractionTheme()
    const wrapper = mount(ThemePreview, { props: { theme } })

    const section = wrapper.find('[data-test="home-preview"]')
    const style = section.attributes('style') ?? ''

    expect(style).toMatch(/--color-card-back:\s*#C76D8E/i)
    expect(style).toMatch(/--color-primary:\s*#E8A0BF/i)
    expect(style).toMatch(/--color-secondary:\s*#FFD6E0/i)
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

    expect(style).toMatch(new RegExp(`--color-card-back:\\s*${trustTheme.colors.cardBack}`, 'i'))
    expect(style).toMatch(new RegExp(`--color-primary:\\s*${trustTheme.colors.primary}`, 'i'))
  })
})
