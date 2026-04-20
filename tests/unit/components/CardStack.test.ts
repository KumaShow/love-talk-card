import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

import CardStack from '@/components/card/CardStack.vue'
import { useGameStore } from '@/stores/gameStore'

/**
 * T025：CardStack 元件測試。
 * 驗證點擊翻牌、動畫期間 debounce、3D 翻轉視覺套用。
 */
describe('CardStack', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    sessionStorage.clear()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('首次點擊應 emit draw 事件並顯示翻面的卡片', async () => {
    const store = useGameStore()
    store.startSession('attraction', false)

    const wrapper = mount(CardStack)
    await wrapper.find('[data-test="card-stack"]').trigger('click')

    expect(wrapper.emitted('draw')).toHaveLength(1)
    expect(wrapper.find('.is-flipped').exists()).toBe(true)
  })

  it('動畫中第二次點擊應被吃掉（只 emit 一次 draw）', async () => {
    const store = useGameStore()
    store.startSession('attraction', false)

    const wrapper = mount(CardStack)
    const stack = wrapper.find('[data-test="card-stack"]')

    await stack.trigger('click')
    await stack.trigger('click')
    await stack.trigger('click')

    expect(wrapper.emitted('draw')).toHaveLength(1)
  })

  it('動畫結束後應可接受新的點擊', async () => {
    const store = useGameStore()
    store.startSession('attraction', false)

    const wrapper = mount(CardStack)
    const stack = wrapper.find('[data-test="card-stack"]')

    await stack.trigger('click')
    vi.advanceTimersByTime(500)
    await wrapper.vm.$nextTick()
    await stack.trigger('click')

    expect(wrapper.emitted('draw')).toHaveLength(2)
  })

  it('牌堆抽完後不應再 emit draw', async () => {
    const store = useGameStore()
    store.startSession('attraction', false)
    for (let index = 0; index < 15; index += 1) {
      store.drawCard()
    }

    const wrapper = mount(CardStack)
    await wrapper.find('[data-test="card-stack"]').trigger('click')

    expect(wrapper.emitted('draw')).toBeUndefined()
  })
})
