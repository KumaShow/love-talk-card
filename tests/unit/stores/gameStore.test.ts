import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { useGameStore } from '@/stores/gameStore'
import type { GameSessionSnapshot } from '@/types'

/**
 * T024：gameStore 單元測試。
 * 驗證 session 啟動、抽牌、sessionStorage 快照、恢復邏輯與 getters。
 */
const SESSION_KEY = 'love-talk-game-session'

describe('useGameStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    sessionStorage.clear()
  })

  describe('startSession', () => {
    it('應依主題建立 15 張基礎牌堆（private 模式關閉）', () => {
      const store = useGameStore()

      store.startSession('attraction', false)

      expect(store.themeId).toBe('attraction')
      expect(store.deck).toHaveLength(15)
      expect(store.deck.every((card) => !card.isIntimate)).toBe(true)
      expect(store.intimateModeAtStart).toBe(false)
    })

    it('應在 private 模式開啟時建立 20 張牌堆（含 5 張私密）', () => {
      const store = useGameStore()

      store.startSession('self', true)

      expect(store.deck).toHaveLength(20)
      expect(store.deck.filter((card) => card.isIntimate)).toHaveLength(5)
      expect(store.intimateModeAtStart).toBe(true)
    })

    it('應將快照寫入 sessionStorage', () => {
      const store = useGameStore()

      store.startSession('trust', false)
      const raw = sessionStorage.getItem(SESSION_KEY)

      expect(raw).not.toBeNull()
      const snapshot = JSON.parse(raw ?? '{}') as GameSessionSnapshot
      expect(snapshot.themeId).toBe('trust')
      expect(snapshot.deckOrder).toHaveLength(15)
      expect(snapshot.drawnCardIds).toEqual([])
      expect(snapshot.intimateModeAtStart).toBe(false)
    })
  })

  describe('drawCard', () => {
    it('應將抽到的卡牌 ID 加入 drawnCardIds 並寫入 sessionStorage', () => {
      const store = useGameStore()
      store.startSession('interaction', false)

      const card = store.drawCard()

      expect(card).not.toBeNull()
      expect(store.drawnCardIds).toContain(card?.id)
      const snapshot = JSON.parse(
        sessionStorage.getItem(SESSION_KEY) ?? '{}',
      ) as GameSessionSnapshot
      expect(snapshot.drawnCardIds).toEqual(store.drawnCardIds)
    })

    it('牌堆抽完後再次呼叫應回傳 null 且不破壞狀態', () => {
      const store = useGameStore()
      store.startSession('attraction', false)

      for (let index = 0; index < 15; index += 1) {
        store.drawCard()
      }

      const result = store.drawCard()
      expect(result).toBeNull()
      expect(store.drawnCardIds).toHaveLength(15)
      expect(store.isComplete).toBe(true)
    })
  })

  describe('restoreSession', () => {
    it('應依 sessionStorage 中的 deckOrder 重建牌堆（不重新洗牌）', () => {
      const store = useGameStore()
      store.startSession('attraction', false)
      store.drawCard()
      store.drawCard()
      const originalDeckOrder = store.deck.map((card) => card.id)
      const originalDrawnIds = [...store.drawnCardIds]

      const restoredStore = (() => {
        setActivePinia(createPinia())
        return useGameStore()
      })()
      const restored = restoredStore.restoreSession()

      expect(restored).toBe(true)
      expect(restoredStore.themeId).toBe('attraction')
      expect(restoredStore.deck.map((card) => card.id)).toEqual(originalDeckOrder)
      expect(restoredStore.drawnCardIds).toEqual(originalDrawnIds)
    })

    it('sessionStorage 為空時應回傳 false 且維持初始狀態', () => {
      const store = useGameStore()

      const restored = store.restoreSession()

      expect(restored).toBe(false)
      expect(store.themeId).toBeNull()
      expect(store.deck).toEqual([])
    })

    it('sessionStorage 內容損毀時應回傳 false 且清除壞資料', () => {
      sessionStorage.setItem(SESSION_KEY, '{ not-valid-json')
      const store = useGameStore()

      const restored = store.restoreSession()

      expect(restored).toBe(false)
      expect(sessionStorage.getItem(SESSION_KEY)).toBeNull()
    })

    it('snapshot themeId 非合法 ThemeId 時應清除資料並回傳 false', () => {
      sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify({
          themeId: 'not-a-theme',
          deckOrder: ['a', 'b'],
          drawnCardIds: [],
          intimateModeAtStart: false,
        }),
      )
      const store = useGameStore()

      const restored = store.restoreSession()

      expect(restored).toBe(false)
      expect(sessionStorage.getItem(SESSION_KEY)).toBeNull()
    })

    it('snapshot deckOrder 非陣列時應清除資料並回傳 false', () => {
      sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify({
          themeId: 'attraction',
          deckOrder: 'oops-not-array',
          drawnCardIds: [],
          intimateModeAtStart: false,
        }),
      )
      const store = useGameStore()

      const restored = store.restoreSession()

      expect(restored).toBe(false)
      expect(sessionStorage.getItem(SESSION_KEY)).toBeNull()
    })

    it('snapshot drawnCardIds 非陣列時應清除資料並回傳 false', () => {
      sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify({
          themeId: 'attraction',
          deckOrder: ['a', 'b'],
          drawnCardIds: 'not-array',
          intimateModeAtStart: false,
        }),
      )
      const store = useGameStore()

      const restored = store.restoreSession()

      expect(restored).toBe(false)
      expect(sessionStorage.getItem(SESSION_KEY)).toBeNull()
    })

    it('snapshot deckOrder 含不存在的卡牌 id 時應清除資料並回傳 false', () => {
      const invalidSnapshot: GameSessionSnapshot = {
        themeId: 'attraction',
        deckOrder: ['card-not-exist-xyz', 'also-fake'],
        drawnCardIds: [],
        intimateModeAtStart: false,
      }
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(invalidSnapshot))
      const store = useGameStore()

      const restored = store.restoreSession()

      expect(restored).toBe(false)
      expect(sessionStorage.getItem(SESSION_KEY)).toBeNull()
    })
  })

  describe('drawCard 邊界', () => {
    it('未 startSession 時 drawCard 應回傳 null 且不寫入 snapshot', () => {
      const store = useGameStore()

      const result = store.drawCard()

      expect(result).toBeNull()
      expect(sessionStorage.getItem(SESSION_KEY)).toBeNull()
    })
  })

  describe('$reset', () => {
    it('應清除 themeId、deck、drawnCardIds 與 sessionStorage', () => {
      const store = useGameStore()
      store.startSession('attraction', true)
      store.drawCard()

      expect(sessionStorage.getItem(SESSION_KEY)).not.toBeNull()

      store.$reset()

      expect(store.themeId).toBeNull()
      expect(store.deck).toEqual([])
      expect(store.drawnCardIds).toEqual([])
      expect(store.intimateModeAtStart).toBe(false)
      expect(sessionStorage.getItem(SESSION_KEY)).toBeNull()
    })
  })

  describe('getters', () => {
    it('remainingCount、currentCard、lastDrawnCard、isComplete 應正確反映狀態', () => {
      const store = useGameStore()
      store.startSession('self', false)

      expect(store.remainingCount).toBe(15)
      expect(store.currentCard?.id).toBe(store.deck[0]?.id)
      expect(store.lastDrawnCard).toBeNull()
      expect(store.isComplete).toBe(false)

      const drawn = store.drawCard()
      expect(store.remainingCount).toBe(14)
      expect(store.lastDrawnCard?.id).toBe(drawn?.id)
      expect(store.currentCard?.id).toBe(store.deck[1]?.id)
    })
  })

  describe('$reset', () => {
    it('重設後應清除 sessionStorage 並恢復初始狀態', () => {
      const store = useGameStore()
      store.startSession('attraction', false)
      store.drawCard()

      store.$reset()

      expect(store.themeId).toBeNull()
      expect(store.deck).toEqual([])
      expect(store.drawnCardIds).toEqual([])
      expect(sessionStorage.getItem(SESSION_KEY)).toBeNull()
    })
  })
})
