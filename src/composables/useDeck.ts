import { computed, ref } from 'vue'

import { shuffleArray } from '@/utils/shuffle'
import type { Card, ThemeId } from '@/types'

/**
 * useDeck：建立、管理與抽取某主題牌堆。
 *
 * - buildDeck()：依主題與私密模式過濾後洗牌，回傳建立完成的 Card[]。
 * - setDeck()：讓外部（如 gameStore）注入已排序的牌堆（支援 session 還原）。
 * - drawCard()：推進索引並將卡牌 ID 紀錄到 drawnCardIds。
 * - remainingCount / isComplete：Pinia store 與 View 可直接綁定的 getter。
 */
export function useDeck() {
  const deck = ref<Card[]>([])
  const drawnCardIds = ref<string[]>([])

  /** 建立主題牌堆：私密模式開啟時額外納入 5 張 intimate 卡並重新洗牌。 */
  function buildDeck(themeId: ThemeId, allCards: Card[], intimateMode: boolean): Card[] {
    const filtered = allCards.filter((card) => {
      if (card.theme !== themeId) {
        return false
      }
      if (!intimateMode && card.isIntimate) {
        return false
      }
      return true
    })

    return shuffleArray(filtered)
  }

  /** 注入已決定順序的牌堆（session 還原或測試）。 */
  function setDeck(nextDeck: Card[], drawnIds: string[] = []): void {
    deck.value = nextDeck
    drawnCardIds.value = [...drawnIds]
  }

  /** 抽下一張牌；若牌堆已抽完回傳 null。 */
  function drawCard(): Card | null {
    const nextIndex = drawnCardIds.value.length
    const card = deck.value[nextIndex] ?? null
    if (card === null) {
      return null
    }
    drawnCardIds.value = [...drawnCardIds.value, card.id]
    return card
  }

  /** 清空牌堆與抽牌紀錄。 */
  function reset(): void {
    deck.value = []
    drawnCardIds.value = []
  }

  const remainingCount = computed(() => deck.value.length - drawnCardIds.value.length)
  const isComplete = computed(
    () => deck.value.length > 0 && drawnCardIds.value.length === deck.value.length,
  )

  return {
    deck,
    drawnCardIds,
    remainingCount,
    isComplete,
    buildDeck,
    setDeck,
    drawCard,
    reset,
  }
}
