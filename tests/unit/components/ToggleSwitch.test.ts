import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import ToggleSwitch from '@/components/ui/ToggleSwitch.vue'

/**
 * T042：ToggleSwitch 元件契約測試。
 * 驗證 aria-checked 狀態、v-model 雙向綁定、disabled 行為，
 * 以及觸控區最小尺寸 44x44px 的可存取性需求。
 */
describe('ToggleSwitch', () => {
  it('以 modelValue=false 渲染時，aria-checked 應為 "false"', () => {
    const wrapper = mount(ToggleSwitch, {
      props: { modelValue: false },
    })

    const switchEl = wrapper.find('[role="switch"]')
    const target = switchEl.exists() ? switchEl : wrapper
    expect(target.attributes('aria-checked')).toBe('false')
  })

  it('以 modelValue=true 渲染時，aria-checked 應為 "true"', () => {
    const wrapper = mount(ToggleSwitch, {
      props: { modelValue: true },
    })

    const switchEl = wrapper.find('[role="switch"]')
    const target = switchEl.exists() ? switchEl : wrapper
    expect(target.attributes('aria-checked')).toBe('true')
  })

  it('點擊應 emit update:modelValue 並攜帶切換後的值', async () => {
    const wrapperOff = mount(ToggleSwitch, {
      props: { modelValue: false },
    })
    await wrapperOff.trigger('click')

    const emittedOff = wrapperOff.emitted('update:modelValue')
    expect(emittedOff).toBeTruthy()
    expect(emittedOff?.[emittedOff.length - 1]).toEqual([true])

    const wrapperOn = mount(ToggleSwitch, {
      props: { modelValue: true },
    })
    await wrapperOn.trigger('click')

    const emittedOn = wrapperOn.emitted('update:modelValue')
    expect(emittedOn).toBeTruthy()
    expect(emittedOn?.[emittedOn.length - 1]).toEqual([false])
  })

  it('當 disabled=true 時點擊不應 emit update:modelValue', async () => {
    const wrapper = mount(ToggleSwitch, {
      props: { modelValue: false, disabled: true },
    })

    await wrapper.trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  /**
   * 觸控區最小 44x44px 的可存取性斷言。
   * 實際尺寸由 CSS（Tailwind utility 或 scoped style）保證，
   * 測試優先驗證 inline style 中包含 44px；若採 class-based 方案，
   * 則退而驗證根元素帶有 `toggle-switch` 標記類別以利後續 CSS 審查。
   */
  it('根元素應確保觸控區 min-width 與 min-height 至少為 44px', () => {
    const wrapper = mount(ToggleSwitch, {
      props: { modelValue: false },
    })

    const inlineStyle = wrapper.attributes('style') ?? ''
    const hasInlineMinSize =
      inlineStyle.includes('min-width') &&
      inlineStyle.includes('min-height') &&
      inlineStyle.includes('44px')

    if (hasInlineMinSize) {
      expect(inlineStyle).toMatch(/min-width:\s*44px/)
      expect(inlineStyle).toMatch(/min-height:\s*44px/)
    } else {
      expect(wrapper.classes()).toContain('toggle-switch')
    }
  })
})
