import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

import PickedCardView from '@/components/card/PickedCardView.vue'
import cardsData from '@/data/cards.json'
import type { Card, CardsData } from '@/types'

/**
 * T094：PickedCardView overlay 元件測試（TDD Red）。
 *
 * PickedPhase = 'idle' | 'flipping' | 'reading' | 'dismissing'
 * 驗證重點：
 * - idle：picked/backdrop 皆不顯示
 * - flipping：picked + backdrop 顯示、CTA 尚未顯示、進入後觸發翻面（is-flipped）
 * - reading：CTA 顯示
 * - dismissing：picked 帶 is-dismissing class
 * - 點 CTA 觸發 dismiss
 * - 點 backdrop 在 reading 觸發 dismiss；在 flipping 不觸發
 */

function getSampleCard(): Card {
  const dataset = cardsData as CardsData
  return dataset.cards.find((c) => c.theme === 'attraction' && !c.isIntimate) as Card
}

describe('PickedCardView', () => {
  beforeEach(() => {
    // CardFace 在 T057 後依賴 settingsStore.secondaryLang 計算次要文字，
    // 因此本元件測試必須先掛上 Pinia 才能完成子元件初始化。
    setActivePinia(createPinia())
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('phase=idle 時不顯示 picked-view 與 backdrop', () => {
    const card = getSampleCard()
    const wrapper = mount(PickedCardView, {
      props: { card, phase: 'idle' },
    })

    expect(wrapper.find('[data-test="picked-view"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="picked-backdrop"]').exists()).toBe(false)
  })

  it('phase=flipping 時顯示 picked-view 與 backdrop；CTA 尚未出現', () => {
    const card = getSampleCard()
    const wrapper = mount(PickedCardView, {
      props: { card, phase: 'flipping' },
    })

    expect(wrapper.find('[data-test="picked-view"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="picked-backdrop"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="picked-next"]').exists()).toBe(false)
  })

  it('phase=reading 時 CTA 下一張按鈕出現', async () => {
    const card = getSampleCard()
    const wrapper = mount(PickedCardView, {
      props: { card, phase: 'reading' },
    })
    await vi.runAllTimersAsync()
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-test="picked-next"]').exists()).toBe(true)
  })

  it('phase=dismissing 時 picked-view 帶 is-dismissing class', () => {
    const card = getSampleCard()
    const wrapper = mount(PickedCardView, {
      props: { card, phase: 'dismissing' },
    })

    const picked = wrapper.find('[data-test="picked-view"]')
    expect(picked.exists()).toBe(true)
    expect(picked.classes()).toContain('is-dismissing')
  })

  it('card=null 時（即使 phase 非 idle）不顯示 picked-view', () => {
    const wrapper = mount(PickedCardView, {
      props: { card: null, phase: 'flipping' },
    })

    expect(wrapper.find('[data-test="picked-view"]').exists()).toBe(false)
  })

  it('點擊 CTA 下一張 → emit dismiss', async () => {
    const card = getSampleCard()
    const wrapper = mount(PickedCardView, {
      props: { card, phase: 'reading' },
    })
    await vi.runAllTimersAsync()
    await wrapper.vm.$nextTick()

    await wrapper.find('[data-test="picked-next"]').trigger('click')
    expect(wrapper.emitted('dismiss')).toHaveLength(1)
  })

  it('reading 階段點 backdrop → emit dismiss', async () => {
    const card = getSampleCard()
    const wrapper = mount(PickedCardView, {
      props: { card, phase: 'reading' },
    })

    await wrapper.find('[data-test="picked-backdrop"]').trigger('click')
    expect(wrapper.emitted('dismiss')).toHaveLength(1)
  })

  it('flipping 階段點 backdrop 不應 emit dismiss（保護翻面動畫）', async () => {
    const card = getSampleCard()
    const wrapper = mount(PickedCardView, {
      props: { card, phase: 'flipping' },
    })

    await wrapper.find('[data-test="picked-backdrop"]').trigger('click')
    expect(wrapper.emitted('dismiss')).toBeUndefined()
  })

  it('進入 flipping 後經 nextTick + rAF，inner 應帶 is-flipped class', async () => {
    const card = getSampleCard()
    const wrapper = mount(PickedCardView, {
      props: { card, phase: 'idle' },
    })

    await wrapper.setProps({ card, phase: 'flipping' })
    await vi.runAllTimersAsync()
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    const inner = wrapper.find('.picked__inner')
    expect(inner.exists()).toBe(true)
    expect(inner.classes()).toContain('is-flipped')
  })

  it('從非 idle 回到 idle 時 is-flipped 應被清除', async () => {
    const card = getSampleCard()
    const wrapper = mount(PickedCardView, {
      props: { card, phase: 'flipping' },
    })
    await vi.runAllTimersAsync()
    await wrapper.vm.$nextTick()

    await wrapper.setProps({ card: null, phase: 'idle' })
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-test="picked-view"]').exists()).toBe(false)
  })
})
