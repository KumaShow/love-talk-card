# 04 — Mock、Spy 與 Fake Timers

> 最後更新：YYYY-MM-DD
> 對應專案範圍：`tests/unit/composables/useCard.test.ts`、`tests/unit/stores/gameStore.intimate.test.ts`

## 本章學什麼

- `vi.fn()`、`vi.spyOn()`、`vi.mock()` 各自解決什麼問題。
- `vi.useFakeTimers()` 怎麼控制 `setTimeout`。
- 專案怎麼測「500ms 翻牌動畫鎖」與「洗牌後的隨機分布」。
- 什麼情況不該 mock。

## 專案裡的例子

### 例 1：Fake timers 測 `useCard` 的 500ms 鎖

`src/composables/useCard.ts:21-35`

```ts
function flipCard(): boolean {
  if (isAnimating.value) return false
  isFlipped.value = true
  isAnimating.value = true
  timerId = setTimeout(() => {
    isAnimating.value = false
    timerId = null
  }, FLIP_DURATION_MS)
  return true
}
```

**要測**：
1. 第一次 `flipCard()` 回傳 true，`isAnimating` 為 true。
2. 在 500ms 內第二次呼叫回傳 false。
3. 時間推進 500ms 後 `isAnimating` 自動變 false。

**典型寫法**：

```ts
import { useCard } from '@/composables/useCard'
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'

describe('useCard.flipCard', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('呼叫後 500ms 內再次呼叫應被鎖住', () => {
    const card = useCard()

    expect(card.flipCard()).toBe(true)
    expect(card.isAnimating.value).toBe(true)

    expect(card.flipCard()).toBe(false)

    vi.advanceTimersByTime(500)
    expect(card.isAnimating.value).toBe(false)
  })
})
```

（請對照 `tests/unit/composables/useCard.test.ts` 實際寫法補細節。）

### 例 2：Mock `Math.random` 測洗牌分布

洗牌依賴 `Math.random`，測試不穩定怎麼辦？兩種策略：

**策略 A：多次跑 + 統計驗證**

跑洗牌 1000 次，統計 intimate 卡的平均位置，驗證在中間附近（不是集中在尾端）。不 mock，但斷言用機率區間。

**策略 B：Spy 並 mock `Math.random`**

```ts
const randSpy = vi.spyOn(Math, 'random').mockReturnValue(0.5)
// 跑洗牌 → 結果變固定
randSpy.mockRestore()
```

本專案用哪種？請對照 `tests/unit/stores/gameStore.intimate.test.ts` 案例 2 的實作方式並補到此。

### 例 3：Spy 驗證函式被呼叫幾次

```ts
const spy = vi.spyOn(sessionStorage, 'setItem')
gameStore.startSession('self', false)
expect(spy).toHaveBeenCalledTimes(1)
expect(spy).toHaveBeenCalledWith('love-talk-game-session', expect.any(String))
```

**何時用**：驗證「持久化」這類可觀察的副作用。

## 觀念拆解

### `vi.fn()` — 憑空造一個 mock 函式

```ts
const cb = vi.fn()
cb('hi')
expect(cb).toHaveBeenCalledWith('hi')

// 指定回傳值
const fetcher = vi.fn().mockResolvedValue({ ok: true })
```

用在需要「假 callback」的場合。

### `vi.spyOn(obj, 'method')` — 監聽既有方法

```ts
const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
// 被測 code 呼叫 console.error 不會真的印出
expect(spy).toHaveBeenCalled()
```

**特色**：
- 默認保留原行為，除非你 `.mockImplementation(...)` / `.mockReturnValue(...)`。
- 可 `spy.mockRestore()` 還原。
- `vi.restoreAllMocks()` 一次還原所有 spy（本專案 `useDeck.test.ts:14-16` 的 `afterEach` 就是這樣）。

### `vi.mock('module')` — 整個模組換掉

```ts
vi.mock('@/data/cards.json', () => ({
  default: { version: '1', themes: [], cards: [] },
}))
```

**慎用**：
- 會影響整個檔案所有 `it`。
- 容易讓測試變「測 mock 而不是測 code」。
- 本專案大多用真實 `cards.json`，反而更貼近生產行為。

### Fake timers：`vi.useFakeTimers()` 的幾個方法

| 方法 | 作用 |
| --- | --- |
| `vi.useFakeTimers()` | 開啟假時鐘 |
| `vi.useRealTimers()` | 恢復真實 timers |
| `vi.advanceTimersByTime(ms)` | 推進 N 毫秒 |
| `vi.runAllTimers()` | 跑完所有待排 timers（小心無限循環的 setInterval） |
| `vi.runOnlyPendingTimers()` | 只跑當下已排的 timers |

### 什麼時候 **不該** mock

- 純函式、小工具（直接傳真實輸入就好）。
- Pinia store 的相依（直接 useStore()）。
- JSON 資料（除非測「檔案錯誤」情境）。

**反過來，什麼時候該 mock**：
- I/O（fetch、WebSocket、storage 的錯誤情境）。
- 時間相關（setTimeout、Date.now）。
- 隨機（Math.random）。
- 昂貴的副作用（音訊播放、硬體權限）。

## 容易搞混的地方

| 寫法 | 問題 |
| --- | --- |
| `vi.spyOn(...)` 沒 restore | 污染下個測試；用 `vi.restoreAllMocks()` |
| `vi.useFakeTimers()` 沒關 | 其他檔案測試的 `setTimeout` 會卡住 |
| Mock 太多 | 測 mock 而不是測行為，重構就壞 |
| `vi.mock` 放 `beforeEach` 裡 | `vi.mock` 是 hoisted，要放 top-level |

## 延伸練習

- 練習 1：用 fake timers 測 `useCard.resetCard()`：先 flip → 在 250ms 中 reset → 推進到 500ms → `isAnimating` 應該已是 false 且 `isFlipped` 也是 false。
- 練習 2：用 `vi.spyOn(sessionStorage, 'setItem')` 驗證每次 `drawCard` 都寫入一次 snapshot。
- 練習 3：想想如果 `useAudio` 呼叫 `audio.play()`，測試要怎麼 mock `HTMLAudioElement.prototype.play`。

## 面試題模擬

### Q1：`vi.fn()`、`vi.spyOn()`、`vi.mock()` 差在哪？什麼時候用哪個？

**答題思路**：三者的作用範圍（值 / 方法 / 模組）與生命週期。

### Q2：怎麼測跟 `setTimeout` 有關的 code？

**答題思路**：fake timers 流程、`advanceTimersByTime`。

**答案（引用本專案）**：
（預留：以 `useCard` 500ms 鎖為例。）

### Q3：測試中有個隨機函式怎麼辦？

**答題思路**：兩種策略（統計 vs mock Math.random）。以洗牌為例說明專案怎麼做。

### Q4：你覺得什麼時候不該 mock？

**答題思路**：過度 mock 的反模式、測到 mock 而不是行為。

## 延伸閱讀

- [Vitest — Mocking](https://vitest.dev/guide/mocking.html)
- [Vitest — Fake Timers API](https://vitest.dev/api/vi.html#vi-usefaketimers)
- 本專案相關：`tests/unit/composables/useCard.test.ts`、`tests/unit/stores/gameStore.intimate.test.ts`
