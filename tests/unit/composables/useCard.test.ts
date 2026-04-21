import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useCard } from '@/composables/useCard'

/**
 * T023：useCard composable 單元測試。
 * 翻牌動畫時序控管，500ms 內禁止連點。
 */
describe('useCard', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('flipCard() 應將 isFlipped 設為 true', () => {
    const card = useCard()

    card.flipCard()

    expect(card.isFlipped.value).toBe(true)
  })

  it('flipCard() 觸發後 isAnimating 應為 true，500ms 後重設為 false', () => {
    const card = useCard()

    card.flipCard()
    expect(card.isAnimating.value).toBe(true)

    vi.advanceTimersByTime(499)
    expect(card.isAnimating.value).toBe(true)

    vi.advanceTimersByTime(1)
    expect(card.isAnimating.value).toBe(false)
  })

  it('動畫中呼叫 flipCard() 應被阻擋（不重新啟動計時）', () => {
    const card = useCard()

    card.flipCard()
    vi.advanceTimersByTime(200)
    card.flipCard()
    vi.advanceTimersByTime(300)

    expect(card.isAnimating.value).toBe(false)
  })

  it('canFlip 應在動畫進行中為 false，動畫結束後為 true', () => {
    const card = useCard()

    expect(card.canFlip.value).toBe(true)
    card.flipCard()
    expect(card.canFlip.value).toBe(false)

    vi.advanceTimersByTime(500)
    expect(card.canFlip.value).toBe(true)
  })

  it('resetCard() 應將 isFlipped 與 isAnimating 同時重設', () => {
    const card = useCard()

    card.flipCard()
    vi.advanceTimersByTime(500)

    card.resetCard()

    expect(card.isFlipped.value).toBe(false)
    expect(card.isAnimating.value).toBe(false)
  })

  it('動畫未完成時 resetCard() 應 clearTimeout 並立即允許再次翻面', () => {
    const card = useCard()

    card.flipCard()
    // 動畫時鎖尚未解除（< 500ms）
    vi.advanceTimersByTime(100)
    expect(card.isAnimating.value).toBe(true)

    card.resetCard()

    expect(card.isFlipped.value).toBe(false)
    expect(card.isAnimating.value).toBe(false)
    expect(card.canFlip.value).toBe(true)

    // 確認 reset 已取消原 timer（再等原本 500ms 狀態不會被二次切換）
    vi.advanceTimersByTime(500)
    expect(card.isAnimating.value).toBe(false)
  })
})
