# 02 — Pinia Store 測試

> 最後更新：YYYY-MM-DD
> 對應專案範圍：`tests/unit/stores/gameStore.test.ts`、`gameStore.intimate.test.ts`、`settingsStore.test.ts`、`src/stores/**`

## 本章學什麼

- 每個測試前要重新建立 Pinia instance，為什麼？
- 怎麼測 store 的 action、getter、狀態變化。
- 怎麼測「狀態固化」（intimateModeAtStart、deckOrder）。
- sessionStorage 交互如何驗證。

## 專案裡的例子

### 例 1：`setActivePinia(createPinia())` —— 每次測試一個全新 store

（請打開 `tests/unit/stores/gameStore.test.ts` 的頂部、把 setup 區塊貼到這裡並解釋）

典型寫法：

```ts
import { setActivePinia, createPinia } from 'pinia'
import { beforeEach } from 'vitest'

beforeEach(() => {
  setActivePinia(createPinia())
  sessionStorage.clear()
})
```

**為什麼每次要重新建？**

- Pinia store 是 singleton，第一個測試留下的狀態會污染下一個測試。
- `createPinia()` + `setActivePinia()` 建一個全新容器；後續 `useGameStore()` 會得到乾淨 store。
- 還要額外 `sessionStorage.clear()`，因為 jsdom 的 sessionStorage 是跨測試共享的全域物件。

### 例 2：測 `startSession` 的核心副作用

（用本專案 `gameStore.test.ts` 中測 startSession 的片段，補 Arrange/Act/Assert 三段）

**要測的行為**：
- 呼叫後 `themeId` 被設定。
- `deck` 長度符合 intimateMode（15 或 20）。
- `intimateModeAtStart` 被固化成當下的 intimateMode。
- `sessionStorage[love-talk-game-session]` 內容有被寫入且 shape 正確。

### 例 3：測固化不變量（不變量 2：session 開始後 intimateMode 不影響 deck）

`tests/unit/stores/gameStore.intimate.test.ts`（案例 2 的隨機分布測試 + 固化測試）

典型斷言：

```ts
// 啟動 session（intimate=false）
gameStore.startSession('self', false)
const deckLenBefore = gameStore.deck.length

// 之後 settings 切換 intimateMode
settingsStore.toggleIntimateMode() // 已有 session → 應為 no-op

// 斷言牌組沒變
expect(gameStore.deck.length).toBe(deckLenBefore)
expect(gameStore.intimateModeAtStart).toBe(false)
```

### 例 4：測 `restoreSession` 能從 sessionStorage 還原

關鍵斷言：
- 預先塞合法 snapshot → `restoreSession()` 回 true、`deck` 順序與 `deckOrder` 相同。
- 塞壞掉的 JSON → `restoreSession()` 回 false、sessionStorage 被清掉。
- 塞合法 JSON 但 `themeId` 非法 → 同上被清掉。

**為什麼要測錯誤路徑？**
這些分支對應 `gameStore.ts:94-109` 的防禦；如果不測，覆蓋率達不到 95%，也沒驗證「壞資料不會污染」。

## 觀念拆解

### 單元測試 store 的三種層次

| 層次 | 測什麼 | 例子 |
| --- | --- | --- |
| 狀態變化 | action 呼叫後狀態對不對 | `startSession` 後 `themeId` 變了 |
| 不變量 | 業務規則有被守住 | intimateModeAtStart 固化 |
| 副作用 | 有寫入 storage / 打 API | snapshot 寫到 sessionStorage |

### 跨 store 互動

本專案 `settingsStore.toggleIntimateMode` 會 `useGameStore()` 問狀態。測這種互動：

```ts
const gameStore = useGameStore()
const settingsStore = useSettingsStore()

gameStore.startSession('self', false)
settingsStore.toggleIntimateMode() // 應 no-op
expect(settingsStore.intimateMode).toBe(false)
```

### `storeToRefs` 在測試中通常不需要

測試環境直接讀 `gameStore.themeId` 即可，不用 `storeToRefs` 展成 ref——後者主要是在元件模板中保持響應式。

### 斷言 sessionStorage

```ts
const raw = sessionStorage.getItem('love-talk-game-session')
expect(raw).not.toBeNull()
const snapshot = JSON.parse(raw!)
expect(snapshot.themeId).toBe('self')
expect(snapshot.intimateModeAtStart).toBe(false)
```

**小技巧**：別過度斷言整個 snapshot object；挑關鍵欄位即可。過度 snapshot 會讓 shape 小改就測試全壞。

## 容易搞混的地方

| 問題 | 解法 |
| --- | --- |
| 忘了 `setActivePinia` | `useStore()` 會丟錯「no active Pinia」 |
| 兩個測試共用 store 狀態 | 放 `beforeEach` 重建 |
| sessionStorage 殘留 | `beforeEach` 或 `afterEach` 加 `sessionStorage.clear()` |
| 測內部實作細節 | 改測對外行為；內部重構才不會被打爆 |

## 延伸練習

- 練習 1：為 `settingsStore.toggleIntimateMode` 加一個測試：「進行中的 session 下呼叫不改變 intimateMode」。（若尚無）
- 練習 2：模擬 `restoreSession` 遇到 storage 裡 `deckOrder` 含不存在的 id 的情境；驗證會清掉 storage 並回傳 false。
- 練習 3：斷言 `persistSnapshot` 被正確呼叫 N 次（需搭配 spy，見第 04 章）。

## 面試題模擬

### Q1：你怎麼測 Pinia store？

**答題思路**：setActivePinia → 測狀態/getter/action → 驗證副作用 → 注意每測隔離。

**答案（引用本專案）**：
（預留：用 `gameStore.startSession` + sessionStorage 斷言為例。）

### Q2：為什麼每個測試前要 `setActivePinia(createPinia())`？

**答題思路**：Singleton 模式 → 狀態污染 → 隔離。

### Q3：你會如何測「一個狀態在特定時機被固化、之後不受外部變更影響」？

**答題思路**：設計 fixture（先固化 → 改外部來源 → 斷言內部不變）。直接對應本專案 intimateModeAtStart。

## 延伸閱讀

- [Pinia — Testing](https://pinia.vuejs.org/cookbook/testing.html)
- [Vitest — setup files](https://vitest.dev/config/#setupfiles)（可把 `setActivePinia` 做全域化）
- 本專案 `tests/unit/stores/**`
