# TypeScript 學習章節

> 對象：Vue 前端工程師，專案是第一次正式接觸 TypeScript。

## 章節目標

- 能讀懂專案現有的型別設計（`src/types/index.ts`）。
- 能在新增功能時寫出正確且安全的型別，而非到處 `any`。
- 面試時能用本專案的 code 回答 TS 基礎題。

## 學習順序

建議照編號讀：每一篇都會用到前一篇的觀念。

1. [`01-type-guards.md`](./01-type-guards.md) — 型別守衛與 narrowing
   - 核心例子：`src/utils/theme.ts` 的 `isValidThemeId`
   - 最短、成就感高，適合先讀建立信心。

2. [`02-union-literal-types.md`](./02-union-literal-types.md) — Union、Literal、`as const`
   - 核心例子：`ThemeId`、`SecondaryLang`、`CardLevel`
   - 理解為什麼用字串字面量 union 而不是 `string`。

3. [`03-generics.md`](./03-generics.md) — 泛型
   - 核心例子：`src/utils/shuffle.ts` 的 `shuffleArray<T>`
   - 從最簡單的一元泛型起步。

4. [`04-vue-ts-patterns.md`](./04-vue-ts-patterns.md) — Vue 3 + TS 常見模式
   - 核心例子：`ref<Card[]>`、`computed<Card | null>`、`defineProps`、Pinia setup store 的型別
   - Vue 專屬的型別習慣。

## 跳過什麼

這份筆記不重新寫一份 TS 官方教學，假設你願意在遇到名詞時查 MDN / TypeScript Handbook。這裡只寫「本專案怎麼用」與「為什麼這樣用」。

## 學習提示

- 寫筆記前先開 VSCode，把游標放在型別上看 hover tooltip，很多細節會自動浮現。
- 每讀完一篇，試著在 `src/` 任一處 hover 一個變數，用自己的話解釋那串型別為什麼長那樣。
- 遇到看不懂的型別，直接 grep 專案是否有類似用法；常常比查官方文件更快理解。
