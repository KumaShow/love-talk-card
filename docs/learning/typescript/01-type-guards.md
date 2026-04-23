# 01 — 型別守衛與 Narrowing

> 最後更新：YYYY-MM-DD
> 對應專案範圍：`src/utils/theme.ts`、`src/stores/gameStore.ts`、`src/router/index.ts`

## 本章學什麼

- 什麼是「型別守衛（type guard）」、什麼是「型別縮窄（narrowing）」。
- 為什麼 `isValidThemeId(x): x is ThemeId` 比 `return typeof x === 'string'` 強大。
- 在哪些專案場景用到它。

## 專案裡的例子

### 例 1：`isValidThemeId`（使用者自訂型別守衛）

`src/utils/theme.ts:1-9`

```ts
import type { ThemeId } from '@/types'

export const validThemeIds: ThemeId[] = ['attraction', 'self', 'interaction', 'trust']

export function isValidThemeId(value: unknown): value is ThemeId {
  return typeof value === 'string' && (validThemeIds as string[]).includes(value)
}
```

**這段在做什麼？**

- 接受任意 `unknown`，判斷是不是合法的 `ThemeId`。
- 回傳型別是 `value is ThemeId`（型別謂詞，type predicate）——不只是 `boolean`，還告訴編譯器「回傳 true 時，參數就是 ThemeId」。

**為什麼這樣寫？**

- 外部輸入（URL 參數、sessionStorage、使用者輸入）型別是 `unknown` 或 `string`，需要一個「安全閘門」變成精確的 `ThemeId`。
- 用 `value is ThemeId` 後，呼叫端在 `if (isValidThemeId(x))` 區塊裡，`x` 就被自動 narrow 成 `ThemeId`，不需要 cast。

### 例 2：用守衛驗 sessionStorage 反序列化內容

`src/stores/gameStore.ts:101-110`

```ts
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
```

**要點**：`JSON.parse` 回傳 `any`，所以要一層層驗才能信任；`isValidThemeId` 是其中一道閘門。

### 例 3：router guard 用守衛擋非法 themeId

（檢查 `src/router/index.ts` 中 `beforeEach` 的 `isValidThemeId` 呼叫——自己去讀一次並補例子在這裡）

## 觀念拆解

### 型別謂詞 `value is X`

- 寫法：`function f(v: unknown): v is X`
- 回傳 `true` → 編譯器在 `if (f(v)) { … }` 內把 `v` narrow 成 `X`。
- 回傳 `false` → `v` 在 `else` 分支 narrow 成「排除 X 的其他型別」。

### 內建 narrowing

TypeScript 內建幾種常見守衛，不用自己寫：

- `typeof v === 'string' | 'number' | 'boolean' | 'object'`
- `v instanceof ClassName`
- `Array.isArray(v)`
- `'key' in obj`
- `v === null / undefined`

本專案 `gameStore` 例子裡 `typeof snapshot.themeId !== 'string'` 就是 typeof narrowing。

### Narrowing 的值在「控制流分析」

TypeScript 編譯器會做「control flow analysis」：在 `if/else` 與 early return 後，變數型別會自動變窄。所以寫 guard clauses 時順序很重要。

## 容易搞混的地方

| 寫法 | 問題 |
| --- | --- |
| `function f(v): boolean` | 只告訴你真假，不 narrow 型別，呼叫端還是要 cast |
| `return v as ThemeId` | 強制斷言，編譯過但 runtime 可能爆 |
| `if (v) { … }` | truthy 檢查不等於型別檢查（`0`、`''` 會誤判） |

## 常見變化

| 變化 | 範例 | 用在哪 |
| --- | --- | --- |
| 自訂 guard | `isValidThemeId` | 外部輸入驗證 |
| `in` 檢查 | `'intimate' in card` | 辨識 discriminated union |
| Discriminated union + `switch` | `switch (action.type)` | Redux / state machine |
| `asserts v is X`（assertion function） | `assertIsThemeId(v)` | 驗證失敗直接 throw |

## 延伸練習

- 練習 1：寫一個 `isValidSecondaryLang(v: unknown): v is SecondaryLang`。
- 練習 2：把 `gameStore.restoreSession` 裡一大串 `if` 拆成多個小 guard 函式，看可讀性如何。
- 練習 3：研究 `asserts` 關鍵字（assertion function），試寫 `assertIsThemeId`，比較它與 type predicate 的差異。

## 面試題模擬

### Q1：TypeScript 的 type guard 是什麼？你在專案有用過嗎？

**答題思路**：定義 → 為什麼需要 → 舉例 → 優缺點。

**答案（引用本專案）**：
（預留：之後用 `src/utils/theme.ts` 與 `gameStore.restoreSession` 為例填寫。）

**可能追問**：
- `value is X` 跟 `asserts value is X` 的差別？
- 為什麼不直接用 `as ThemeId` 斷言？

### Q2：你怎麼處理從外部（API / localStorage / URL）進來的資料的型別安全？

**答題思路**：信任邊界 → 輸入驗證 → 推薦的模式（手刻 guard、Zod 等 schema 驗證庫）。

**答案**：
（預留。先用本專案 `restoreSession` 的 JSON.parse 後層層驗證為例。）

### Q3：什麼是 TypeScript 的「控制流分析（control flow analysis）」？

**答題思路**：提到 narrowing、early return 如何影響型別。

## 延伸閱讀

- [TypeScript Handbook — Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- [TypeScript Handbook — Type Predicates](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates)
- 本專案相關：`src/utils/theme.ts`、`src/stores/gameStore.ts`、`src/router/index.ts`
