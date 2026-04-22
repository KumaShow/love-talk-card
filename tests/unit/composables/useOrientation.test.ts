import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'

import { useOrientation } from '@/composables/useOrientation'

/**
 * T067：useOrientation composable 單元測試。
 *
 * 涵蓋：
 * - 初始 matches=true 時 isLandscape 為 true
 * - 監聽 matchMedia change 事件並反應式更新 isLandscape
 * - 元件 unmount 時會移除事件監聽器（避免記憶體洩漏）
 */
describe('useOrientation', () => {
  type ChangeListener = (event: { matches: boolean }) => void

  let matchesState = false
  let listeners: ChangeListener[] = []
  let addEventListenerSpy: ReturnType<typeof vi.fn>
  let removeEventListenerSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    matchesState = false
    listeners = []

    addEventListenerSpy = vi.fn((event: string, cb: ChangeListener) => {
      if (event === 'change') listeners.push(cb)
    })
    removeEventListenerSpy = vi.fn((event: string, cb: ChangeListener) => {
      if (event === 'change') {
        listeners = listeners.filter((existing) => existing !== cb)
      }
    })

    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation((query: string) => ({
        matches: matchesState,
        media: query,
        addEventListener: addEventListenerSpy,
        removeEventListener: removeEventListenerSpy,
        onchange: null,
        dispatchEvent: () => false,
      })),
    )
    vi.stubGlobal('window', {
      ...globalThis,
      matchMedia: globalThis.matchMedia,
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('matchMedia 命中 landscape 時 isLandscape 初值為 true', () => {
    matchesState = true
    const Host = defineComponent({
      setup() {
        const { isLandscape } = useOrientation()
        return { isLandscape }
      },
      render() {
        return h('span', this.isLandscape ? 'landscape' : 'portrait')
      },
    })

    const wrapper = mount(Host)

    expect(wrapper.text()).toBe('landscape')
    wrapper.unmount()
  })

  it('MediaQueryList change 事件觸發時應反應式更新 isLandscape', async () => {
    const Host = defineComponent({
      setup() {
        const { isLandscape } = useOrientation()
        return { isLandscape }
      },
      render() {
        return h('span', this.isLandscape ? 'landscape' : 'portrait')
      },
    })

    const wrapper = mount(Host)
    expect(wrapper.text()).toBe('portrait')

    listeners.forEach((cb) => cb({ matches: true }))
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toBe('landscape')
    wrapper.unmount()
  })

  it('unmount 時應移除 change 事件監聽器', () => {
    const Host = defineComponent({
      setup() {
        useOrientation()
        return {}
      },
      render() {
        return h('span')
      },
    })

    const wrapper = mount(Host)
    expect(addEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function))

    wrapper.unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function))
  })
})
