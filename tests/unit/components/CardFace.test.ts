import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import CardFace from '@/components/card/CardFace.vue'
import { cardsData } from '@/data'
import { useSettingsStore } from '@/stores/settingsStore'
import type { Card } from '@/types'

function findCard(id: string): Card {
  const card = cardsData.cards.find((item) => item.id === id)
  if (card === undefined) {
    throw new Error(`找不到測試卡牌：${id}`)
  }
  return card
}

describe('CardFace', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('短文卡維持 comfortable 文字密度', () => {
    const wrapper = mount(CardFace, {
      props: { card: findCard('des-005') },
    })

    expect(wrapper.find('[data-test="card-face"]').attributes('data-density')).toBe('comfortable')
  })

  it('長文卡搭配泰文副語言時應套用 dense 文字密度', () => {
    const settingsStore = useSettingsStore()
    settingsStore.setSecondaryLang('th')

    const wrapper = mount(CardFace, {
      props: { card: findCard('des-009') },
    })

    expect(wrapper.find('[data-test="card-face"]').attributes('data-density')).toBe('dense')
    expect(wrapper.find('[data-test="card-primary-text"]').classes()).toContain(
      'max-[26rem]:text-[1.05rem]',
    )
    expect(wrapper.find('[data-test="card-secondary-text"]').classes()).toContain(
      'max-[26rem]:text-[0.68rem]',
    )
  })

  it.each([
    ['attraction', 'attraction-bg-v1.webp', 'attraction-frame-v1.png'],
    ['self', 'self-bg-v1.webp', 'self-frame-v1.png'],
    ['interaction', 'interaction-bg-v1.webp', 'interaction-frame-v1.png'],
    ['trust', 'trust-bg-v1.webp', 'trust-frame-v1.png'],
    ['desire', 'desire-bg-v3.webp', 'desire-frame-v3.png'],
  ])('%s 主題應使用指定版本的背景與外框圖片', (themeId, backgroundName, frameName) => {
    const card = cardsData.cards.find((item) => item.theme === themeId)
    if (card === undefined) {
      throw new Error(`找不到測試主題卡牌：${themeId}`)
    }

    const wrapper = mount(CardFace, { props: { card } })

    expect(wrapper.find('[data-test="card-background"]').attributes('src')).toContain(
      backgroundName,
    )
    expect(wrapper.find('[data-test="card-frame"]').attributes('src')).toContain(frameName)
  })

  /**
   * T026（US2）：values 卡面顯示目前語言文案，且不依賴 isIntimate 徽章 / 浮水印。
   * values 無 intimate 分層，卡面不應出現私密指示元素。
   */
  it('values 卡面顯示卡牌 zh 文案，且不出現 intimate 徽章與浮水印', () => {
    const card = findCard('val-001')

    const wrapper = mount(CardFace, { props: { card } })

    expect(wrapper.find('[data-test="card-primary-text"]').text()).toBe(card.text.zh)
    expect(wrapper.find('[data-test="intimate-indicator"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="intimate-watermark"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="values-copy-shade"]').exists()).toBe(false)
  })
})
