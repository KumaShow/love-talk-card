# 03 — Composable 測試

> 最後更新：YYYY-MM-DD
> 對應專案範圍：`tests/unit/composables/**`、`src/composables/**`

## 本章學什麼

- Composable 為什麼好測試：它們是純函式（或接近純函式）。
- 不需要 mount 元件就能測 composable。
- 測 `ref` / `computed` 的反應性行為。
- 專案 composable 覆蓋率要求 95% 的實務意義。

## 專案裡的例子

### 例 1：測 `useDeck` —— 邏輯完全可脫離 Vue 元件

`tests/unit/composables/useDeck.test.ts:37-47`

```ts
it('drawCard() 應將卡牌 ID 加入 drawnCardIds 並推進索引', () => {
  const deck = useDeck()
  const built = deck.buildDeck('interaction', allCards, false)
  deck.setDeck(built)

  const drawn = deck.drawCard()

  expect(drawn).not.toBeNull()
  expect(deck.drawnCardIds.value).toContain(drawn?.id)
  expect(deck.drawnCardIds.value).toHaveLength(1)
})
```

**要點**：

- 直接呼叫 `useDeck()` 回傳一般物件；不用掛載元件。
- 存取 ref 要 `.value`：`deck.drawnCardIds.value`。
- `computed` 也要 `.value`：`deck.remainingCount.value`。

### 例 2：測完整循環 —— 抽到牌堆結束

`tests/unit/composables/useDeck.test.ts:66-79`

```ts
it('當 drawnCardIds.length 等於 deck.length 時 isComplete 應為 true', () => {
  const deck = useDeck()
  const built = deck.buildDeck('attraction', allCards, false)
  deck.setDeck(built)

  expect(deck.isComplete.value).toBe(false)

  for (let index = 0; index < built.length; index += 1) {
    deck.drawCard()
  }

  expect(deck.isComplete.value).toBe(true)
  expect(deck.remainingCount.value).toBe(0)
})
```

**觀察**：

- computed 的反應性在測試裡照樣運作——`drawnCardIds` 改變後 `isComplete.value` 會跟著變。
- 這是「整合級」的單元測試：一次測多個 getter 的連動。

### 例 3：測 `useCard` 的動畫鎖（需要 fake timers）

`src/composables/useCard.ts:29-33`：

```ts
timerId = setTimeout(() => {
  isAnimating.value = false
  timerId = null
}, FLIP_DURATION_MS)
```

**要測**：
- 呼叫 `flipCard()` 後 `isAnimating` 立即為 true。
- 500ms 前再呼叫一次 `flipCard()` 回傳 false（被鎖住）。
- 500ms 後 `isAnimating` 自動變回 false。
- `resetCard()` 可中斷 timer。

細節見 `04-mocks-and-timers.md`。

## 觀念拆解

### 為什麼 composable 比元件好測

| 元件測試 | Composable 測試 |
| --- | --- |
| 需要 mount | 直接呼叫函式 |
| 測 DOM 與事件 | 測 ref / computed / 函式 |
| 慢 | 快 |
| 容易跟 UI 細節綁死 | 專注邏輯 |

**結論**：把可以抽出的邏輯放 composable，測試就很便宜。專案目前 `useDeck` / `useCard` / `useI18n` / `useOrientation` 都符合這個原則。

### 反應性在測試中的行為

- `ref.value` 可同步讀寫；測試中直接操作即可。
- `computed` 自動追蹤依賴；依賴變了下一次讀 `.value` 就會重算。
- 若要跨 microtask 觀察 effect（例如 `watch`），需 `await nextTick()`：

```ts
import { nextTick } from 'vue'

// ... 改變 ref
await nextTick()
// ... 此時 watch callback 已跑過
```

### 純函式 vs 有副作用的 composable

- 純：`useDeck.buildDeck` — 輸入決定輸出，超好測。
- 半純：`useCard.flipCard` — 動到 ref 與 setTimeout，需要 fake timer。
- 雜：`useAudio`、`useOrientation` — 依賴瀏覽器 API，需要更多 mock（見第 04 章）。

### 覆蓋率 95% 的設計動機

`vitest.config.ts:22-27`：

```ts
'src/composables/**/*.ts': {
  lines: 95, branches: 95, functions: 95, statements: 95,
},
```

**為什麼特別高**：
- Composable 是專案邏輯的核心，壞了影響面大。
- 它們好測、該被充分測試。
- 分支（branches）95%：防止 `if` 分支只有快樂路徑被測。

## 容易搞混的地方

| 問題 | 解法 |
| --- | --- |
| 忘了 `.value` 讀 ref | `expect(ref)` 永遠不等於 primitive |
| Composable 直接讀全域 storage | 難測；應該把 storage 當參數注入，或在測試前清空 |
| 測太多「內部呼叫 N 次」的細節 | 改測對外可觀察行為 |
| `computed` 依賴 mock 的值沒觸發重算 | 確認 mock 的是 ref 本身還是某個方法 |

## 延伸練習

- 練習 1：為 `useOrientation` 寫一個測試：改變 `window.innerWidth` / `innerHeight` 後 `isLandscape.value` 正確切換。（需 mock window 尺寸 + dispatch event）
- 練習 2：為 `useI18n` 寫測試：切換 locale 後 `t('key')` 回傳對應語言。
- 練習 3：想想 `useAudio` 依賴 `HTMLAudioElement`，要怎麼測？（會帶入 mock 主題，見第 04 章）

## 面試題模擬

### Q1：為什麼 Vue 3 專案要把邏輯抽成 composable？

**答題思路**：重用、可測試、跟 Options API `mixins` 對比。

### Q2：你怎麼測 composable 的反應性？

**答題思路**：ref / computed / nextTick / watch 的觀察點。

### Q3：Composable 依賴 setTimeout / setInterval / fetch 要怎麼測？

**答題思路**：fake timers / spy / 抽依賴成參數（dependency injection）。

## 延伸閱讀

- [Vue 官方：Composables](https://vuejs.org/guide/reusability/composables.html)
- [Vitest — Fake Timers](https://vitest.dev/api/vi.html#vi-usefaketimers)
- 本專案相關：`tests/unit/composables/**`
