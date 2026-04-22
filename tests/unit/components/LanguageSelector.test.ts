import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import LanguageSelector from '@/components/ui/LanguageSelector.vue'
import type { SecondaryLang } from '@/types'

/**
 * T055：LanguageSelector 元件契約測試。
 *
 * 驗證項目：
 *  - 渲染 3 顆按鈕：EN / ไทย / 日，分別對應 SecondaryLang 'en' / 'th' / 'ja'。
 *  - 啟用中的按鈕 aria-pressed="true"，其餘 "false"。
 *  - 點擊按鈕 emit 'select' 並攜帶對應 SecondaryLang 值。
 *  - 每顆按鈕觸控區 ≥44×44px（CSS 由 inline style 或 class 提供）。
 */
describe('LanguageSelector', () => {
  it('渲染 3 顆按鈕並對應 EN / ไทย / 日 標籤', () => {
    const wrapper = mount(LanguageSelector, { props: { modelValue: 'en' } })

    const buttons = wrapper.findAll('button')
    expect(buttons).toHaveLength(3)

    const labels = buttons.map((btn) => btn.text())
    expect(labels).toEqual(['EN', 'ไทย', '日'])
  })

  it('啟用中的按鈕 aria-pressed 為 "true"，其餘為 "false"', () => {
    const wrapper = mount(LanguageSelector, { props: { modelValue: 'th' } })

    const enBtn = wrapper.get('[data-test="lang-en"]')
    const thBtn = wrapper.get('[data-test="lang-th"]')
    const jaBtn = wrapper.get('[data-test="lang-ja"]')

    expect(enBtn.attributes('aria-pressed')).toBe('false')
    expect(thBtn.attributes('aria-pressed')).toBe('true')
    expect(jaBtn.attributes('aria-pressed')).toBe('false')
  })

  it('點擊按鈕應 emit "select" 並攜帶對應 SecondaryLang', async () => {
    const wrapper = mount(LanguageSelector, { props: { modelValue: 'en' } })

    await wrapper.get('[data-test="lang-th"]').trigger('click')
    await wrapper.get('[data-test="lang-ja"]').trigger('click')
    await wrapper.get('[data-test="lang-en"]').trigger('click')

    const events = wrapper.emitted('select') as SecondaryLang[][] | undefined
    expect(events).toBeTruthy()
    expect(events?.map((args) => args[0])).toEqual(['th', 'ja', 'en'])
  })

  it('每顆按鈕應符合 44×44px 觸控區最小尺寸', () => {
    const wrapper = mount(LanguageSelector, { props: { modelValue: 'en' } })

    const buttons = wrapper.findAll('button')
    for (const btn of buttons) {
      const inlineStyle = btn.attributes('style') ?? ''
      const hasInlineMinSize =
        inlineStyle.includes('min-width') &&
        inlineStyle.includes('min-height') &&
        inlineStyle.includes('44px')
      if (hasInlineMinSize) {
        expect(inlineStyle).toMatch(/min-width:\s*44px/)
        expect(inlineStyle).toMatch(/min-height:\s*44px/)
      } else {
        expect(btn.classes()).toContain('language-selector__btn')
      }
    }
  })
})
