# 05 — 覆蓋率（Coverage）與門檻

> 最後更新：YYYY-MM-DD
> 對應專案範圍：`vitest.config.ts`、`coverage/`、`src/stores/gameStore.ts`

## 本章學什麼

- Coverage 的四個維度：lines / statements / branches / functions，差別是什麼。
- 專案為什麼訂「整體 80% / composable+store 95%」兩段式門檻。
- `/* c8 ignore */` 何時該用、何時是在騙自己。
- 如何讀 HTML coverage report 找到未測到的分支。

## 專案裡的例子

### 例 1：專案的 coverage 設定

`vitest.config.ts:12-34`

```ts
coverage: {
  provider: 'v8',
  include: ['src/**/*.{ts,vue}'],
  exclude: ['src/main.ts', 'src/types/**', 'src/data/**', 'src/i18n/**'],
  reporter: ['text', 'html'],
  thresholds: {
    lines: 80,
    branches: 80,
    functions: 80,
    statements: 80,
    'src/composables/**/*.ts': {
      lines: 95, branches: 95, functions: 95, statements: 95,
    },
    'src/stores/**/*.ts': {
      lines: 95, branches: 95, functions: 95, statements: 95,
    },
  },
}
```

**設計理由**：
- **`provider: 'v8'`**：Node 內建 V8 原生 coverage，快且不需要 instrument。
- **`exclude`**：純宣告型別檔、靜態資料、i18n JSON 不計入（測也測不出什麼）。
- **兩段式門檻**：專案核心（composable + store）95%，周邊（View/Components）80%。
- **`reporter: ['text', 'html']`**：terminal 顯示摘要 + `coverage/index.html` 詳細報告。

### 例 2：`/* c8 ignore */` 明確排除無法觸發的防禦分支

`src/stores/gameStore.ts:43-48`

```ts
function persistSnapshot(): void {
  /* c8 ignore start -- 防禦性分支：公開 API 都在 themeId 設定後才呼叫，此支無法由外部觸發 */
  if (themeId.value === null) {
    sessionStorage.removeItem(SESSION_KEY)
    return
  }
  /* c8 ignore stop -- 防禦性分支結束 */
  // ...
}
```

**什麼時候可以 c8 ignore？**
- 真實無法從公開 API 觸發的防禦（例如這裡：只有在 `themeId` 設定後才會呼叫 persist）。
- 附註原因，讓下一個人讀得懂。

**什麼時候不可以？**
- 「這條測試很難寫」—— 那通常是設計有問題，改 code 或改測試，不要 ignore。
- 「覆蓋率不夠就用 ignore 湊」—— 自欺欺人。

## 觀念拆解

### 四個維度

| 維度 | 定義 | 例子 |
| --- | --- | --- |
| **Lines** | 每行是否跑過 | 一條 `if` 行只要跑過就算過 |
| **Statements** | 每個 statement 是否跑過 | 一行兩句 `a; b;` 算兩個 |
| **Branches** | 每個分支（true / false）是否都跑過 | `if (x)` 的 true 跑了、false 沒跑 → 50% branches |
| **Functions** | 每個函式是否至少被呼叫一次 | 沒被叫到的 function 會計入未覆蓋 |

**重點**：Lines 100% 不代表 Branches 100%。本專案設四個都 95%，就是要逼開發者連 else 分支都要測。

### V8 provider vs Istanbul provider

| 項目 | v8 | istanbul |
| --- | --- | --- |
| 速度 | 快（原生） | 較慢（要 instrument） |
| 精度 | statement 粒度稍粗（源碼 → bytecode 映射） | 更精確 |
| Source map | 良好 | 非常好 |
| 專案選擇 | v8 | — |

本專案用 v8 是常見預設，追求速度。

### 為什麼 composable / store 要 95%

回顧 `00-project-architecture.md`：composable 和 store 是專案邏輯核心。

- 它們好測（純函式 / 薄副作用）。
- 壞了影響面大。
- 設高門檻會 push 你：
  - 把不好測的 code 拆乾淨。
  - 測到 error path / 防禦分支。
  - 不隨便 `/* c8 ignore */`。

### 解讀 HTML report

1. 跑 `npm run test`。
2. 瀏覽器開 `coverage/index.html`。
3. 點進某檔案：
   - 綠底：已執行。
   - 紅底：未執行。
   - 黃底：分支沒完全覆蓋（例如 `if` 的 true 跑了 false 沒跑）。
4. 左側 function 區塊可看到每個 function 被呼叫次數。

## 容易搞混的地方

| 問題 | 解法 |
| --- | --- |
| Lines 100% 但 branches 80% | 補「另一條分支」的測試 |
| 新增防禦就 c8 ignore | 思考是否真的不可觸發；是 → 加註；否 → 寫測試 |
| 為了覆蓋率補爛測試 | 測試應該真的斷言行為；無意義的 `expect(true).toBe(true)` 拿去道歉 |
| 覆蓋率 95% 但 bug 還在 | 覆蓋率 ≠ 正確性；還需要 E2E + 手動測試 |

## 延伸練習

- 練習 1：跑 `npm run test`，開 `coverage/src/composables/useCard.ts.html`，找一個紅 / 黃底行，寫測試把它轉綠。
- 練習 2：把 `vitest.config.ts` 的 stores 門檻暫時改成 100%，跑一次測試看哪裡不達標；思考是該補測試還是該加 `c8 ignore`。
- 練習 3：故意在 `useDeck.ts` 加一段 `if (allCards.length === 0) return []`，觀察 branch coverage 掉多少；寫測試把它補滿。

## 面試題模擬

### Q1：覆蓋率 100% 能保證 code 沒 bug 嗎？

**答題思路**：不能。覆蓋率只代表「跑到了」，不代表「測得對」；舉缺 assertion 的反例。

### Q2：你怎麼決定覆蓋率門檻？

**答題思路**：風險加權（核心邏輯高 / 周邊低）。以本專案 95% / 80% 兩段為例。

### Q3：遇到一段防禦性 code 測不到怎麼辦？

**答題思路**：先確認是否真不可觸發 → 評估是否該移除 → 加 ignore 註解需有理由。

### Q4：Lines 跟 Branches 差在哪？

**答題思路**：一行多分支、else 被漏測 → branches 掉。

## 延伸閱讀

- [Vitest — Coverage](https://vitest.dev/guide/coverage.html)
- [c8 ignore directive](https://github.com/bcoe/c8#ignoring-uncovered-lines-functions-and-blocks)
- 本專案 `vitest.config.ts`、`coverage/index.html`
