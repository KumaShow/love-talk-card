# 面試題：前端測試

> 最後更新：YYYY-MM-DD

## Q1: 說說你對測試金字塔的理解，你在專案怎麼實踐？

**考點**：理不理解 E2E / 整合 / 單元的定位差異與成本。

**30 秒版答案**：
（預留：金字塔形狀 → 單元多 / 整合中 / E2E 少 → 理由：速度與成本。本專案單元測覆蓋 composable/store 95%，E2E 保留給核心使用者路徑。）

**可能追問**：
- 為什麼不做反過來的 ice cream cone（E2E 多、單元少）？
- 元件測試（mount）算哪一層？

---

## Q2: 你怎麼測 Pinia store？

**考點**：實務經驗。

**30 秒版答案**：
（預留：`setActivePinia(createPinia())` 每測重建 → 測 action 後的狀態 → 驗 sessionStorage 副作用。舉 `gameStore.startSession` 為例。）

**2 分鐘版答案**：
（預留：補 cross-store 互動測試、狀態固化驗證、錯誤分支的重要性。）

**可能追問**：
- 為什麼每測都要重建 Pinia？
- 跨 store 的 action 怎麼測（如 settingsStore 讀 gameStore）？

---

## Q3: 單元測試裡有 `setTimeout` / `setInterval` 怎麼辦？

**考點**：fake timers。

**30 秒版答案**：
（預留：`vi.useFakeTimers()` + `vi.advanceTimersByTime()`；舉 `useCard` 500ms 翻牌鎖的測試為例。）

**可能追問**：
- `vi.runAllTimers()` 跟 `advanceTimersByTime` 差在哪？
- 沒關 fake timers 會怎樣？

---

## Q4: 測試裡有隨機 `Math.random()` 怎麼辦？

**考點**：隨機性測試的兩種思路。

**30 秒版答案**：
（預留：兩種策略——多次統計驗分布 OR spy mock Math.random；舉洗牌 intimate 卡分布測試為例。）

**可能追問**：
- 統計法會不會 flaky？要跑幾次才穩？
- 加 seed 把洗牌變 deterministic 是更好的做法嗎？

---

## Q5: 覆蓋率 100% 能保證 code 沒 bug 嗎？

**考點**：基本觀念，陷阱題。

**30 秒版答案**：
（預留：不能。覆蓋率只代表程式碼被執行，不代表斷言正確。舉「缺 assertion」的反例。）

**可能追問**：
- 你們怎麼訂覆蓋率門檻？
- 覆蓋率以外還有什麼 metric 可以參考？

---

## Q6: 什麼時候該 mock，什麼時候不該？

**考點**：過度 mock 的反模式意識。

**30 秒版答案**：
（預留：該 mock——I/O、時間、隨機、昂貴副作用；不該 mock——純函式、small utils、real data。過度 mock 會變成「測 mock 不是測 code」。）

**可能追問**：
- 你覺得什麼叫「過度 mock」？
- 有遇過 refactor 後所有 mock 都壞掉的經驗嗎？

---

## Q7: E2E 跟單元測試怎麼取捨？

**考點**：設計決策。

**30 秒版答案**：
（預留：單元測試覆蓋邏輯與分支，E2E 覆蓋使用者路徑與跨整合（PWA、router、service worker）。舉本專案 US1 核心流程走 E2E、US2 各分支走單元為例。）

**可能追問**：
- E2E flaky 怎麼處理？
- 有沒有一種功能只有 E2E 能測，單元做不到？

---

## Q8: TDD（Red-Green-Refactor）你怎麼實踐？有什麼好處或痛點？

**考點**：能不能談出深度。

**30 秒版答案**：
（預留：流程——先寫失敗測試、讓它過、重構；好處：設計壓力 + 重構安全網；痛點：前期慢、需要明確規格。）

**可能追問**：
- 什麼情境 TDD 反而不適合？
- 你真的每次都先寫測試嗎？

---

## Q9: Playwright 的 locator 你會優先用哪種？

**考點**：測試穩定性的敏感度。

**30 秒版答案**：
（預留：`getByRole` → `getByLabel` → `getByText` → `getByTestId` → CSS selector。盡量貼近使用者看得到的屬性，class / id 最脆弱。）

**可能追問**：
- 為什麼不推薦 CSS selector？
- i18n 專案 text selector 會壞嗎？

---

## Q10: CI 上測試 flaky 你怎麼處理？

**考點**：工程問題解決能力。

**30 秒版答案**：
（預留：先定位根因——環境 / 非決定性 / race → 用 trace 重播 → 修根因不用 retry 掩蓋。提 Playwright `trace: 'on-first-retry'`。）

**可能追問**：
- retry 2 次 pass 算不算 flaky？
- 你會容許多少 flaky rate？

---

## 未成形題目區

- 你怎麼測元件（mount）？
- 快照測試（snapshot）你用嗎？
- 怎麼測 Vue 的 `watch` / `watchEffect`？
- 怎麼測 Vue Router？（navigation guards、beforeEach）
- 怎麼測 composable 裡的 `onMounted`?
