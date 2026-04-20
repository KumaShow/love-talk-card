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

  /**
   * 建立主題牌堆（對應 data-model.md §4 牌組建立流程）。
   *
   * 流程：
   * 1. 先以 `themeId` 與 `intimateMode` 過濾 `allCards`：
   *    - `intimateMode = false`：排除 `isIntimate: true` 的卡（基礎 15 張）。
   *    - `intimateMode = true`：保留該主題全部 20 張（含 5 張 intimate）。
   * 2. 對過濾後的整體陣列執行一次 `shuffleArray`；
   *    因此 `intimateMode = true` 時，5 張 intimate 卡會與 15 張基礎卡
   *    **一起洗牌**、均勻分布，而不是「append 到尾端後再顯示」。
   *
   * 此順序（filter → shuffle）是避免「intimate 卡永遠落在最後 5 格」bug 的關鍵，
   * 對應 tests/unit/stores/gameStore.intimate.test.ts 案例 2 的隨機分布驗證。
   */
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

    // 對包含 intimate 卡的整體陣列洗牌，確保隨機分布（而非尾端 append）。
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
