# 面試題：TypeScript

> 最後更新：YYYY-MM-DD

## Q1: Type guard 是什麼？你在專案裡用過嗎？

**考點**：懂不懂 narrowing、能不能舉實例。

**30 秒版答案**：
（預留：用 `src/utils/theme.ts:7` 的 `isValidThemeId` 為例，提 `value is ThemeId` type predicate 會讓編譯器 narrow。）

**2 分鐘版答案**：
（預留：補 control flow analysis、對比 `as` 斷言、提專案 `restoreSession` 的 guard 鏈。）

**可能追問**：
- `value is X` 跟 `asserts value is X` 差在哪？
- 為什麼不直接 `as ThemeId`？
- 遇到比較複雜的 schema（巢狀物件），手刻 guard 會不會太笨？（→ 介紹 Zod 這類 schema lib）

**我答不出的時候**：
（預留）

---

## Q2: Literal type 跟 `string` 比差別？什麼時候用 `as const`？

**考點**：對型別精確度的敏感度。

**30 秒版答案**：
（預留：用 `ThemeId = 'attraction' | 'self' | 'interaction' | 'trust'` 為例。）

**2 分鐘版答案**：
（預留：補 `as const` 把陣列變 readonly tuple、用 `typeof validThemeIds[number]` 反推 union 的 DRY 技巧。）

**可能追問**：
- 為什麼不用 TS `enum`？
- `as const` 能用在物件嗎？
- literal union 會讓 API 變脆？未來新增值是 breaking change 嗎？

---

## Q3: 泛型用過嗎？舉一個例子說明你為什麼用泛型。

**考點**：泛型的動機（保留型別資訊 vs 用 any 失去資訊）。

**30 秒版答案**：
（預留：`shuffleArray<T>(array: T[]): T[]` 為例。）

**2 分鐘版答案**：
（預留：補「為什麼不寫 `any[]` 或 `unknown[]`」、泛型約束 `extends`、推導 vs 明寫型別參數。）

**可能追問**：
- 什麼情況不該用泛型？（函式內部根本沒用到 T 時）
- `ReadonlyArray<T>` 跟 `readonly T[]` 有差嗎？

---

## Q4: `ref<T>()` 什麼時候要手動標型別？

**考點**：熟不熟 Vue + TS 的細節坑。

**30 秒版答案**：
（預留：空陣列 / 空物件 / null 初始化必標，primitive 初始化可省。用 `ref<Card[]>([])` 舉例。）

**可能追問**：
- `computed<T>` 也要手動標嗎？
- `ref(0 as const)` 會怎樣？

---

## Q5: Pinia 怎麼跟 TypeScript 整合？Setup store 跟 options store 你選哪個？

**考點**：Vue 3 + TS 實務偏好。

**30 秒版答案**：
（預留：setup store 靠 return 自動推導型別；options store 要手寫 state/getters/actions interface。專案一律用 setup。）

**可能追問**：
- 你怎麼讓 store 的某個 action 只能內部呼叫？
- `storeToRefs` 什麼時候需要？

---

## Q6: 你遇到過最棘手的 TS 型別問題是什麼？怎麼解的？

**考點**：問題解決能力、誠實度。

**答題思路**：
- 選一個真的遇過、有感的案例（不要硬編）。
- 描述：問題情境 → 試過什麼 → 最後怎麼解 → 學到什麼。
- 即使最後是「問了同事 / 改了 design」也 OK，面試官要看思考過程不是背答案。

**我的案例**：
（預留：等你累積到有感案例再填。）

---

## Q7: 你怎麼處理從後端 / localStorage / URL 來的外部資料的型別安全？

**考點**：信任邊界觀念。

**30 秒版答案**：
（預留：外部資料型別永遠是 unknown / any；要寫 guard 或用 schema 驗證（Zod/Valibot/Yup）把它 narrow 成精確型別。舉 `restoreSession` 的 guard 鏈為例。）

**可能追問**：
- 你用過 Zod 嗎？跟手刻 guard 比優缺？
- API response 你會在哪一層驗？

---

## 未成形題目區（想到什麼先丟進來）

- TS 的 utility types（`Pick / Omit / Partial / Required / Record`）你常用哪個？
- `unknown` 跟 `any` 差在哪？
- Vue 3 `defineProps<T>()` 跟 `defineProps({...})` 的差別？
- Discriminated union 是什麼？舉例。
- Generic constraint（`T extends ...`）的實際用途？
