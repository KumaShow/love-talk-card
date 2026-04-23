# 03 — 泛型（Generics）

> 最後更新：YYYY-MM-DD
> 對應專案範圍：`src/utils/shuffle.ts`

## 本章學什麼

- 泛型解決什麼問題（避免「寫一個洗牌函式給 Card、再寫一個給 number」）。
- 最基本的 `function f<T>(arg: T): T`。
- 專案中極簡泛型範例如何推導、呼叫時為什麼不用寫 `<T>`。

## 專案裡的例子

### 例 1：`shuffleArray<T>` —— 教科書級單參數泛型

`src/utils/shuffle.ts:5-14`

```ts
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    ;[shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]]
  }

  return shuffled
}
```

**這段在做什麼？**

- 接受任意陣列 `T[]`，回傳洗過的同型別陣列 `T[]`。
- `T` 是型別變數（type parameter），跟函式的值變數一樣，只是活在型別層。

**為什麼用泛型？**

- 洗牌邏輯跟元素型別無關。如果寫成 `shuffleArray(array: Card[]): Card[]`，就只能洗 `Card`；寫成 `shuffleArray(array: unknown[]): unknown[]` 則失去型別資訊，呼叫端還得自己 cast。
- 泛型讓同一份邏輯對任意型別成立，呼叫端拿回精準型別。

### 例 2：呼叫端不用寫 `<T>`

`src/composables/useDeck.ts:44`

```ts
return shuffleArray(filtered)
```

**觀察**：沒寫 `shuffleArray<Card>(filtered)`——TypeScript 由 `filtered: Card[]` 自動推導 `T = Card`。這叫 **type argument inference**。

## 觀念拆解

### 泛型 = 型別層級的「函式」

```ts
// 值層級：接一個值，回傳同一個值
function identity(x: number): number { return x }

// 型別層級：接一個型別，產出一個型別
function identity<T>(x: T): T { return x }
```

呼叫時：
```ts
identity<number>(42)   // 明確指定
identity(42)           // 自動推導 T = number
```

### 泛型約束 `extends`

```ts
function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b
}
```

`T extends { length: number }` 代表 `T` 必須有 `length` 屬性（字串、陣列都可以）。本專案目前沒用到這個語法，但非常常見。

### 多型別參數

```ts
function pair<A, B>(a: A, b: B): [A, B] { return [a, b] }
pair('hi', 42) // [string, number]
```

### 泛型在 `interface` / `type`

```ts
interface Box<T> { value: T }
type Result<T> = { ok: true; data: T } | { ok: false; error: string }
```

Vue / Pinia 的 `ref<T>`、`computed<T>` 就是這種用法。

## 容易搞混的地方

| 寫法 | 意義 |
| --- | --- |
| `function f<T>(x: T): T` | 呼叫時 T 由呼叫端決定 |
| `function f(x: any): any` | 失去所有型別資訊，呼叫端要自己 cast |
| `function f(x: unknown): unknown` | 比 any 安全，但不連動輸入輸出 |
| `function f<T extends X>(x: T)` | T 必須是 X 的子型別（或 X 本身） |

**常見誤用**：把 `T` 當 `any` 用。泛型的精髓是「輸入型別會決定輸出型別」，如果函式內部只 `console.log(x)`，根本不需要泛型。

## 延伸練習

- 練習 1：為 `useDeck` 加一個 `drawN<T>(deck: T[], n: number): T[]`，用泛型保持型別資訊。
- 練習 2：寫一個 `shuffleDeterministic<T>(array: T[], seed: number): T[]`，讓測試可以用 seed 控制隨機（見 `testing/06-testing-randomness` 章節）。
- 練習 3：研究 `ReadonlyArray<T>` 與 `readonly T[]`，想想 `shuffleArray` 參數改成 `readonly T[]` 有什麼好處（「我不會改這個陣列」的意圖）。

## 面試題模擬

### Q1：為什麼要用泛型？舉一個你寫過的例子。

**答題思路**：DRY + 型別安全；對比沒有泛型會怎樣。

**答案（引用本專案）**：
（預留：以 `shuffleArray<T>` 為例。）

**可能追問**：
- 如果 `shuffleArray` 不用泛型，有什麼替代方案？（`unknown[]` vs `any[]` 的差別）
- 什麼情況下「不該」用泛型？

### Q2：泛型約束 `extends` 怎麼用？

**答題思路**：縮限 T 的能力範圍，舉 `{ length: number }` 的例子。

### Q3：`ref<T>` 的 T 是從哪裡來的？

**答題思路**：Vue runtime 的型別宣告；泛型不只存在函式，也存在 class/interface/type。

## 延伸閱讀

- [TypeScript Handbook — Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)
- Vue 官方：`Ref<T>`、`ComputedRef<T>` 的型別定義（可以在 IDE 按 F12 跳進 `@vue/reactivity` 的 `.d.ts`）
