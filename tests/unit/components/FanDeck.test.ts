import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import FanCard from '@/components/card/FanCard.vue'
import FanDeck from '@/components/card/FanDeck.vue'
import cardsData from '@/data/cards.json'
import type { Card, CardsData } from '@/types'

/**
 * T094：FanDeck 扇形牌堆元件測試（TDD Red）。
 *
 * 驗證重點：
 * - visibleCards 切片永遠取 deck[drawnCount .. drawnCount + 5]（不做 swipe shift）
 * - 張數少於 5 時角度收窄、centerIndex 取中位
 * - z-index 以中央為最高、向兩側遞減
 * - 僅中央那張 isActive（其他 pointer-events: none）
 * - canInteract=false 時所有 FanCard.isActive 皆 false
 * - 點擊中央卡轉發為 draw-center event
 */

function getDeck(size: number): Card[] {
  const dataset = cardsData as CardsData
  const cards = dataset.cards.filter((card) => card.theme === 'attraction' && !card.isIntimate)
  return cards.slice(0, size)
}

const CARD_BACK = '#c76d8e'

describe('FanDeck', () => {
  it('drawnCount=0 且 deck 大於 5 張時，僅取前 5 張為 visibleCards', () => {
    const deck = getDeck(15)
    const wrapper = mount(FanDeck, {
      props: { deck, drawnCount: 0, cardBack: CARD_BACK, canInteract: true },
    })

    const fanCards = wrapper.findAllComponents(FanCard)
    expect(fanCards).toHaveLength(5)
  })

  it('drawnCount 推進時 visibleCards window 同步推進（切片固定為 5 張）', () => {
    const deck = getDeck(15)
    const wrapper = mount(FanDeck, {
      props: { deck, drawnCount: 3, cardBack: CARD_BACK, canInteract: true },
    })

    const fanCards = wrapper.findAllComponents(FanCard)
    expect(fanCards).toHaveLength(5)
    expect(fanCards[0].props('index')).toBe(0)
  })

  it('deck 剩 3 張時僅顯示 3 張且 centerIndex=1', () => {
    const deck = getDeck(3)
    const wrapper = mount(FanDeck, {
      props: { deck, drawnCount: 0, cardBack: CARD_BACK, canInteract: true },
    })

    const fanCards = wrapper.findAllComponents(FanCard)
    expect(fanCards).toHaveLength(3)

    const activeIndices = fanCards
      .map((c, i) => (c.props('isActive') ? i : -1))
      .filter((i) => i >= 0)
    expect(activeIndices).toEqual([1])
  })

  it('5 張滿扇形時 angles 以 0° 為中心對稱展開（邊緣 ±24°）', () => {
    const deck = getDeck(5)
    const wrapper = mount(FanDeck, {
      props: { deck, drawnCount: 0, cardBack: CARD_BACK, canInteract: true },
    })

    const fanCards = wrapper.findAllComponents(FanCard)
    const angles = fanCards.map((c) => c.props('angle') as number)

    expect(angles[0]).toBeCloseTo(-24, 5)
    expect(angles[2]).toBeCloseTo(0, 5)
    expect(angles[4]).toBeCloseTo(24, 5)
  })

  it('張數少於 5 時角度收窄（3 張時 ±≈14.4°）', () => {
    const deck = getDeck(3)
    const wrapper = mount(FanDeck, {
      props: { deck, drawnCount: 0, cardBack: CARD_BACK, canInteract: true },
    })

    const fanCards = wrapper.findAllComponents(FanCard)
    const angles = fanCards.map((c) => c.props('angle') as number)

    // 角度展開公式 spread = 24 * 3/5 = 14.4（張數越少越收窄）
    expect(angles[0]).toBeCloseTo(-14.4, 5)
    expect(angles[1]).toBeCloseTo(0, 5)
    expect(angles[2]).toBeCloseTo(14.4, 5)
  })

  it('z-index 中央最高、向兩側遞減（5 張時 8,9,10,9,8）', () => {
    const deck = getDeck(5)
    const wrapper = mount(FanDeck, {
      props: { deck, drawnCount: 0, cardBack: CARD_BACK, canInteract: true },
    })

    const fanCards = wrapper.findAllComponents(FanCard)
    const zs = fanCards.map((c) => c.props('zIndex') as number)

    expect(zs).toEqual([8, 9, 10, 9, 8])
  })

  it('canInteract=true 時僅中央卡 isActive=true、其他皆 false', () => {
    const deck = getDeck(5)
    const wrapper = mount(FanDeck, {
      props: { deck, drawnCount: 0, cardBack: CARD_BACK, canInteract: true },
    })

    const fanCards = wrapper.findAllComponents(FanCard)
    const actives = fanCards.map((c) => c.props('isActive') as boolean)

    expect(actives).toEqual([false, false, true, false, false])
  })

  it('canInteract=false 時所有 FanCard.isActive 皆為 false', () => {
    const deck = getDeck(5)
    const wrapper = mount(FanDeck, {
      props: { deck, drawnCount: 0, cardBack: CARD_BACK, canInteract: false },
    })

    const fanCards = wrapper.findAllComponents(FanCard)
    const actives = fanCards.map((c) => c.props('isActive') as boolean)

    expect(actives.every((a) => a === false)).toBe(true)
  })

  it('中央 FanCard 觸發 activate 時 FanDeck 應轉發為 draw-center', async () => {
    const deck = getDeck(5)
    const wrapper = mount(FanDeck, {
      props: { deck, drawnCount: 0, cardBack: CARD_BACK, canInteract: true },
    })

    const fanCards = wrapper.findAllComponents(FanCard)
    const centerCard = fanCards[2]
    centerCard.vm.$emit('activate')
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('draw-center')).toHaveLength(1)
  })

  it('deck 已抽完（visibleCards 為空）應顯示空狀態訊息', () => {
    const deck = getDeck(3)
    const wrapper = mount(FanDeck, {
      props: { deck, drawnCount: 3, cardBack: CARD_BACK, canInteract: true },
    })

    expect(wrapper.findAllComponents(FanCard)).toHaveLength(0)
    expect(wrapper.text()).toContain('已抽完')
  })
})
