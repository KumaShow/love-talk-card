import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { useGameStore } from '@/stores/gameStore'
import { useSettingsStore } from '@/stores/settingsStore'
import type { GameSessionSnapshot } from '@/types'

/**
 * T041：US2 私密模式 gameStore 單元測試。
 *
 * 本檔案對應 Phase 4 (US2) 的 TDD Red-wave，驗證以下三個核心案例：
 *   1. `startSession(themeId, true)` 會建立 20 張牌堆，其中恰好 5 張
 *      `card.isIntimate === true`（本測試驗證 `'self'` 主題）。
 *   2. 隨機分布：連跑 ≥10 次 `startSession('attraction', true)`，驗證 5 張
 *      intimate 卡的索引不會每一次都全部落在最後 5 個位置，避免
 *      「洗牌前就 append」的 bug；至少有一次出現 intimate 卡 index < 15。
 *   3. 固化模式：`startSession('trust', true)` 之後改變
 *      `useSettingsStore().intimateMode = false`，再次讀取 sessionStorage
 *      `love-talk-game-session` 解析後的 `intimateModeAtStart` 仍為 `true`，
 *      同步驗證 `gameStore.intimateModeAtStart === true`。
 */
const SESSION_KEY = 'love-talk-game-session'

describe('useGameStore（私密模式 US2）', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    sessionStorage.clear()
  })

  describe('案例 1：牌堆組成', () => {
    it('應在 private 模式開啟且主題為 self 時建立 20 張牌堆，並恰好包含 5 張 isIntimate=true 的卡', () => {
      const store = useGameStore()

      store.startSession('self', true)

      expect(store.deck).toHaveLength(20)
      const intimateCards = store.deck.filter((card) => card.isIntimate)
      expect(intimateCards).toHaveLength(5)
      // 所有 intimate 卡牌的 theme 必須與指定主題一致
      expect(intimateCards.every((card) => card.theme === 'self')).toBe(true)
      expect(store.intimateModeAtStart).toBe(true)
    })
  })

  describe('案例 2：intimate 卡的隨機分布', () => {
    it('連跑 12 次 startSession(attraction,true) 後，intimate 卡至少有一次出現在前 15 張之內（排除「先 append 再不洗牌」的 bug）', () => {
      const runs = 12
      let foundIntimateInFirst15AtLeastOnce = false
      // 紀錄每次 intimate 卡的 index 集合，方便除錯與觀察分布
      const intimateIndexSamples: number[][] = []

      for (let attempt = 0; attempt < runs; attempt += 1) {
        setActivePinia(createPinia())
        sessionStorage.clear()
        const store = useGameStore()
        store.startSession('attraction', true)

        const indices: number[] = []
        store.deck.forEach((card, index) => {
          if (card.isIntimate) {
            indices.push(index)
          }
        })
        intimateIndexSamples.push(indices)

        expect(indices).toHaveLength(5)
        if (indices.some((idx) => idx < 15)) {
          foundIntimateInFirst15AtLeastOnce = true
        }
      }

      // 若 12 次裡 intimate 卡全都落在 [15,16,17,18,19] 尾段，
      // 強烈暗示「filter 後 append、未經過洗牌」的 bug。
      // 在真正洗牌的實作下，全部都落尾段的機率 ≈ (C(5,5)/C(20,5))^12，幾乎為 0。
      expect(
        foundIntimateInFirst15AtLeastOnce,
        `intimate 卡在 ${runs} 次測試中每次都落在索引 15–19，疑似 append 未洗牌。樣本: ${JSON.stringify(intimateIndexSamples)}`,
      ).toBe(true)
    })
  })

  describe('案例 3：intimateModeAtStart 於 session 期間固化', () => {
    it('startSession(trust,true) 後即使切換 settingsStore.intimateMode=false，sessionStorage 中的 intimateModeAtStart 仍為 true，且 gameStore.intimateModeAtStart 不變', () => {
      const gameStore = useGameStore()
      const settingsStore = useSettingsStore()

      // 啟動 session 時模擬使用者在 HomeView 已開啟 intimateMode
      settingsStore.intimateMode = true
      gameStore.startSession('trust', true)

      // 使用者於 session 中（或於設定頁）把 intimateMode 關掉
      settingsStore.intimateMode = false

      // gameStore 內部狀態應保持不變
      expect(gameStore.intimateModeAtStart).toBe(true)

      // sessionStorage 快照也應保持不變
      const raw = sessionStorage.getItem(SESSION_KEY)
      expect(raw).not.toBeNull()
      const snapshot = JSON.parse(raw ?? '{}') as GameSessionSnapshot
      expect(snapshot.intimateModeAtStart).toBe(true)
      expect(snapshot.themeId).toBe('trust')
      expect(snapshot.deckOrder).toHaveLength(20)
    })
  })
})
