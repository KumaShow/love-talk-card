import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import AdultContentNotice from '@/components/ui/AdultContentNotice.vue'
import zhTw from '@/i18n/zh-TW.json'

afterEach(() => {
  document.body.innerHTML = ''
})

function mountNotice() {
  return mount(AdultContentNotice, {
    attachTo: document.body,
  })
}

describe('AdultContentNotice', () => {
  it('未完成年齡聲明確認時，不應發出 confirm 導航事件', async () => {
    const wrapper = mountNotice()

    await wrapper.find('[data-test="adult-notice-continue"]').trigger('click')

    expect(wrapper.emitted('confirm')).toBeUndefined()
  })

  it('完成年齡聲明確認後，點繼續應發出 confirm', async () => {
    const wrapper = mountNotice()

    await wrapper.find('[data-test="adult-notice-age"]').setValue(true)
    await wrapper.find('[data-test="adult-notice-continue"]').trigger('click')

    expect(wrapper.emitted('confirm')).toHaveLength(1)
  })

  it('返回、backdrop 與 ESC 都應發出 dismiss 且不發出 confirm', async () => {
    const wrapper = mountNotice()

    await wrapper.find('[data-test="adult-notice-back"]').trigger('click')
    await wrapper.find('[data-test="adult-notice-backdrop"]').trigger('click')
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('dismiss')).toHaveLength(3)
    expect(wrapper.emitted('confirm')).toBeUndefined()
  })

  it('標題、內文、年齡聲明與按鈕文字皆應取自 i18n', () => {
    const wrapper = mountNotice()
    const text = wrapper.text()

    expect(text).toContain(zhTw.notice.adult.title)
    expect(text).toContain(zhTw.notice.adult.body)
    expect(text).toContain(zhTw.notice.adult.ageConfirm)
    expect(text).toContain(zhTw.notice.adult.continue)
    expect(text).toContain(zhTw.notice.adult.back)
  })

  it('確認與返回按鈕應具備至少 44px 觸控目標 class', () => {
    const wrapper = mountNotice()

    expect(wrapper.find('[data-test="adult-notice-continue"]').classes()).toContain('min-h-11')
    expect(wrapper.find('[data-test="adult-notice-back"]').classes()).toContain('min-h-11')
  })
})
