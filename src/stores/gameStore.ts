import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { useDeck } from '@/composables/useDeck'
import cardsData from '@/data/cards.json'
import type { Card, CardsData, GameSessionSnapshot, ThemeId } from '@/types'
import { isValidThemeId } from '@/utils/theme'

/** sessionStorage 存放遊戲快照的 key。 */
const SESSION_KEY = 'love-talk-game-session'

const cardsDataset = cardsData as CardsData

/**
 * gameStore：遊戲執行期狀態。
 *
 * - startSession()：依主題與私密模式建立牌堆並寫入 sessionStorage 快照。
 * - drawCard()：推進索引、回傳卡牌並同步 sessionStorage。
 * - restoreSession()：從 sessionStorage 還原，依 deckOrder 重建（不重新洗牌）。
 * - $reset()：清空狀態與 sessionStorage。
 */
export const useGameStore = defineStore('game', () => {
  const deckController = useDeck()

  const themeId = ref<ThemeId | null>(null)
  const intimateModeAtStart = ref(false)
  const isAnimating = ref(false)

  const deck = computed(() => deckController.deck.value)
  const drawnCardIds = computed(() => deckController.drawnCardIds.value)
  const remainingCount = computed(() => deckController.remainingCount.value)
  const isComplete = computed(() => deckController.isComplete.value)

  const currentCard = computed<Card | null>(
    () => deck.value[drawnCardIds.value.length] ?? null,
  )
  const lastDrawnCard = computed<Card | null>(
    () => deck.value[drawnCardIds.value.length - 1] ?? null,
  )

  /** 依當下狀態寫入 sessionStorage 快照。 */
  function persistSnapshot(): void {
    /* c8 ignore start -- 防禦性分支：公開 API 都在 themeId 設定後才呼叫，此支無法由外部觸發 */
    if (themeId.value === null) {
      sessionStorage.removeItem(SESSION_KEY)
      return
    }
    /* c8 ignore stop -- 防禦性分支結束 */
    const snapshot: GameSessionSnapshot = {
      themeId: themeId.value,
      deckOrder: deck.value.map((card) => card.id),
      drawnCardIds: [...drawnCardIds.value],
      intimateModeAtStart: intimateModeAtStart.value,
    }
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(snapshot))
  }

  /**
   * 啟動新 session，建立並洗牌牌堆。
   *
   * 依 data-model.md §4 業務規則，`intimateMode` 於此處**固化**為
   * `intimateModeAtStart`，並隨 sessionStorage snapshot 序列化；
   * 進入 GameView 後即使 `settingsStore.intimateMode` 有變動，
   * 也不會影響當前 session 的牌組內容或 snapshot 內容。
   */
  function startSession(nextThemeId: ThemeId, intimateMode: boolean): void {
    const built = deckController.buildDeck(nextThemeId, cardsDataset.cards, intimateMode)
    deckController.setDeck(built)
    themeId.value = nextThemeId
    intimateModeAtStart.value = intimateMode
    persistSnapshot()
  }

  /** 抽下一張牌。 */
  function drawCard(): Card | null {
    if (themeId.value === null) {
      return null
    }
    const card = deckController.drawCard()
    if (card !== null) {
      persistSnapshot()
    }
    return card
  }

  /** 依 sessionStorage 快照恢復 session，deckOrder 不重新洗牌。 */
  function restoreSession(): boolean {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (raw === null) {
      return false
    }

    let snapshot: GameSessionSnapshot | null = null
    try {
      snapshot = JSON.parse(raw) as GameSessionSnapshot
    } catch {
      sessionStorage.removeItem(SESSION_KEY)
      return false
    }

    if (
      snapshot === null ||
      typeof snapshot.themeId !== 'string' ||
      !isValidThemeId(snapshot.themeId) ||
      !Array.isArray(snapshot.deckOrder) ||
      !Array.isArray(snapshot.drawnCardIds)
    ) {
      sessionStorage.removeItem(SESSION_KEY)
      return false
    }

    const cardById = new Map(cardsDataset.cards.map((card) => [card.id, card]))
    const rebuilt: Card[] = []
    for (const id of snapshot.deckOrder) {
      const card = cardById.get(id)
      if (card === undefined) {
        sessionStorage.removeItem(SESSION_KEY)
        return false
      }
      rebuilt.push(card)
    }

    themeId.value = snapshot.themeId
    intimateModeAtStart.value = Boolean(snapshot.intimateModeAtStart)
    deckController.setDeck(rebuilt, snapshot.drawnCardIds)
    return true
  }

  /** 重設遊戲狀態並清除 sessionStorage。 */
  function $reset(): void {
    deckController.reset()
    themeId.value = null
    intimateModeAtStart.value = false
    isAnimating.value = false
    sessionStorage.removeItem(SESSION_KEY)
  }

  return {
    themeId,
    deck,
    drawnCardIds,
    intimateModeAtStart,
    isAnimating,
    remainingCount,
    currentCard,
    lastDrawnCard,
    isComplete,
    startSession,
    drawCard,
    restoreSession,
    $reset,
  }
})
