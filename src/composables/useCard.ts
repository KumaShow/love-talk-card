import { computed, ref } from 'vue'

/** 翻牌動畫時長（毫秒）。 */
const FLIP_DURATION_MS = 500

/**
 * useCard：控管單張卡牌翻轉狀態與動畫時序。
 *
 * - flipCard()：若動畫未進行則翻面，並在 500ms 內鎖定 isAnimating。
 * - isAnimating：動畫期間為 true，可阻擋連點。
 * - canFlip：供模板綁定：非動畫中時才可觸發新翻牌。
 * - resetCard()：同時重置翻面與動畫狀態（換下一張牌時使用）。
 */
export function useCard() {
  const isFlipped = ref(false)
  const isAnimating = ref(false)
  let timerId: ReturnType<typeof setTimeout> | null = null

  const canFlip = computed(() => !isAnimating.value)

  function flipCard(): boolean {
    if (isAnimating.value) {
      return false
    }

    isFlipped.value = true
    isAnimating.value = true

    timerId = setTimeout(() => {
      isAnimating.value = false
      timerId = null
    }, FLIP_DURATION_MS)

    return true
  }

  function resetCard(): void {
    if (timerId !== null) {
      clearTimeout(timerId)
      timerId = null
    }
    isFlipped.value = false
    isAnimating.value = false
  }

  return {
    isFlipped,
    isAnimating,
    canFlip,
    flipCard,
    resetCard,
  }
}
