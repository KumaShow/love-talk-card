# 02 — Union、Literal Types 與 `as const`

> 最後更新：YYYY-MM-DD
> 對應專案範圍：`src/types/index.ts`、`src/data/cards.json`、`src/utils/theme.ts`

## 本章學什麼

- 什麼是「字面量型別（literal type）」，為什麼 `'attraction' | 'self' | ...` 比 `string` 好。
- Union（聯合）與 Intersection（交集）的差異與用法。
- `as const` 的威力：把陣列變成 readonly tuple、把物件變成 readonly literal。

## 專案裡的例子

### 例 1：`ThemeId`、`SecondaryLang`、`CardLevel` 字面量 union

`src/types/index.ts:1-8`

```ts
export type ThemeId = 'attraction' | 'self' | 'interaction' | 'trust'
export type SecondaryLang = 'en' | 'th' | 'ja'
export type CardLevel = 1 | 2 | 3
```

**這段在做什麼？**

- 用 literal union 限定值只能是這幾個。
- 編譯器會：
  - 不讓你傳 `'other'` 給期待 `ThemeId` 的函式。
  - 在 `switch (themeId)` 時提示有哪幾個 case（exhaustive check）。
  - IDE 自動補全四個字串。

**為什麼比 `string` 好？**

- 如果改用 `type ThemeId = string`，typo（`'atraction'`）不會被編譯器擋下。
- literal union 把「業務上只允許這四種」的規則下放到型別層級。

### 例 2：`Card` interface 組合多個 literal union

`src/types/index.ts:19-25`

```ts
export interface Card {
  id: string
  theme: ThemeId
  isIntimate: boolean
  level: CardLevel
  text: CardText
}
```

**要點**：`Card.theme` 的型別自動繼承 `ThemeId` 的 union；改 `ThemeId` 會全專案連動更新。

### 例 3：`validThemeIds` 想保持 readonly（進階）

`src/utils/theme.ts:4`

```ts
export const validThemeIds: ThemeId[] = ['attraction', 'self', 'interaction', 'trust']
```

**觀察**：這樣寫會編譯通過，但：
- `validThemeIds.push('foo')` 會被擋下（因為只接受 `ThemeId`）。
- `validThemeIds[0] = 'other'` 也會被擋。
- 但陣列本身還是可變的——可以 `validThemeIds.length = 0` 清空。

**改用 `as const` 的版本**：

```ts
export const validThemeIds = ['attraction', 'self', 'interaction', 'trust'] as const
// 型別變成 readonly ['attraction', 'self', 'interaction', 'trust']
```

這樣連修改陣列都被擋下，且不需要手寫 `ThemeId[]`——`as const` 會自動推導出 literal tuple。可以用 `typeof validThemeIds[number]` 反推 `ThemeId`。

## 觀念拆解

### 字面量型別

```ts
type A = 'hello'          // string literal type
type B = 42               // number literal type
type C = true             // boolean literal type
```

單獨一個 literal 沒什麼用；組 union 才強大。

### Union `|` vs Intersection `&`

```ts
type U = A | B    // 是 A 或 B（值域取聯集）
type I = A & B    // 同時是 A 也是 B（型別屬性取交集）
```

Union 在日常最常見（參數、回傳值、狀態）；Intersection 多見於擴充型別（`type Props = BaseProps & { extra: X }`）。

### `as const` 的三個效果

1. 字串 `'foo' as const` → 型別不是 `string` 而是 `'foo'`。
2. 陣列 `[1, 2] as const` → 型別是 `readonly [1, 2]`（tuple）。
3. 物件 `{ a: 1 } as const` → 型別是 `{ readonly a: 1 }`。

### 由陣列反推 union（常見慣用法）

```ts
const validThemeIds = ['attraction', 'self', 'interaction', 'trust'] as const
type ThemeId = typeof validThemeIds[number]  // 'attraction' | 'self' | 'interaction' | 'trust'
```

好處：**新增主題只要改陣列一個地方**，型別自動跟上。本專案目前分兩處寫（`types/index.ts` + `utils/theme.ts`），是筆記後段可以討論的重構題材。

## 容易搞混的地方

| 寫法 | 意義 |
| --- | --- |
| `let x: 'a' \| 'b' = 'a'` | x 是 union 型別，值目前是 'a'，可以再指派成 'b' |
| `const x = 'a'` | x 的型別被推導為字面量 `'a'`（因為是 const 且 primitive） |
| `const arr = ['a', 'b']` | 推導為 `string[]`，不是 `readonly ['a', 'b']` |
| `const arr = ['a', 'b'] as const` | 推導為 `readonly ['a', 'b']` |

## 延伸練習

- 練習 1：把 `validThemeIds` 改成 `as const` 版本，並反推 `ThemeId`；觀察能不能刪掉 `types/index.ts` 裡的重複定義。
- 練習 2：為新增功能「難度篩選」寫一個 `CardDifficulty = 'easy' | 'medium' | 'hard'`，並寫對應的 guard。
- 練習 3：研究 `Extract<T, U>` / `Exclude<T, U>` 這兩個 utility type，用 `Extract<ThemeId, 'self' | 'trust'>` 看會得到什麼。

## 面試題模擬

### Q1：什麼是 literal type？跟 `string` 比差別是什麼？

**答題思路**：定義 → 例子 → 用在哪 → 跟 enum 的取捨。

**答案**：
（預留：用 `ThemeId` 為例說明，並對比 TS enum 為什麼很多人選擇不用 enum 而用 literal union。）

**可能追問**：為什麼你們沒用 TypeScript `enum`？

### Q2：`as const` 用過嗎？用在什麼情況？

**答題思路**：提 readonly、literal 推導、config 物件不可變。

### Q3：Union 跟 Intersection 的差別？舉一個實際例子。

## 延伸閱讀

- [TypeScript Handbook — Everyday Types（Literal Types）](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#literal-types)
- [TypeScript Handbook — Unions and Intersections](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#union-types)
- [TypeScript Handbook — `as const`](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#const-assertions)
