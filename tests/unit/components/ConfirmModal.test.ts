import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import ConfirmModal from '@/components/ui/ConfirmModal.vue'

/**
 * T083 覆蓋缺口補強：ConfirmModal 獨立單元測試。
 *
 * 驗證重點：
 * - open=false 時不渲染 dialog（avoid Teleport 殘留）
 * - open=true 時渲染 title / description / 兩顆按鈕
 * - 點 confirm / cancel / backdrop 分別 emit 對應事件
 * - description 未傳入時不渲染 description 段落
 */

afterEach(() => {
  // Teleport 掛到 body，測試間必須清空避免殘留
  document.body.innerHTML = ''
})

function mountModal(props: Partial<InstanceType<typeof ConfirmModal>['$props']> = {}) {
  return mount(ConfirmModal, {
    attachTo: document.body,
    props: {
      open: true,
      title: '確認返回首頁？',
      confirmLabel: '確認',
      cancelLabel: '取消',
      ...props,
    },
  })
}

describe('ConfirmModal', () => {
  it('open=false 時不渲染 dialog', () => {
    mountModal({ open: false })
    expect(document.querySelector('[data-test="confirm-modal"]')).toBeNull()
  })

  it('open=true 時渲染 title / 兩顆按鈕', () => {
    mountModal({ title: '確認返回首頁？' })
    expect(document.querySelector('[data-test="confirm-modal"]')).not.toBeNull()
    expect(document.querySelector('[data-test="confirm-modal-confirm"]')).not.toBeNull()
    expect(document.querySelector('[data-test="confirm-modal-cancel"]')).not.toBeNull()
    expect(document.body.textContent).toContain('確認返回首頁？')
  })

  it('傳入 description 時渲染描述段落；未傳入時不渲染', () => {
    const wrapper = mountModal({ description: '目前進度會遺失' })
    expect(document.body.textContent).toContain('目前進度會遺失')

    wrapper.unmount()
    document.body.innerHTML = ''
    mountModal()
    expect(document.querySelector('.confirm-modal__description')).toBeNull()
  })

  it('點 confirm 按鈕 → emit confirm', async () => {
    const wrapper = mountModal()
    const btn = document.querySelector<HTMLButtonElement>(
      '[data-test="confirm-modal-confirm"]',
    )
    btn?.click()
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('confirm')).toHaveLength(1)
    expect(wrapper.emitted('cancel')).toBeUndefined()
  })

  it('點 cancel 按鈕 → emit cancel', async () => {
    const wrapper = mountModal()
    const btn = document.querySelector<HTMLButtonElement>(
      '[data-test="confirm-modal-cancel"]',
    )
    btn?.click()
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('cancel')).toHaveLength(1)
    expect(wrapper.emitted('confirm')).toBeUndefined()
  })

  it('點 backdrop 等同 cancel（語意上視為放棄操作）', async () => {
    const wrapper = mountModal()
    const backdrop = document.querySelector<HTMLDivElement>('.confirm-modal__backdrop')
    backdrop?.click()
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })
})
