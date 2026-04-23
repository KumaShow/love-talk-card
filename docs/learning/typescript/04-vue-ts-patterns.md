# 04 — Vue 3 + TypeScript 常見模式

> 最後更新：YYYY-MM-DD
> 對應專案範圍：`src/composables/**`、`src/stores/**`、`src/components/**`、`src/views/**`

## 本章學什麼

- `ref<T>()` 的型別為什麼要手動指定、什麼時候可省略。
- `computed<T>` 與自動推導的差異。
- Pinia setup store 的型別推導特性（不需要手寫大型 interface）。
- `defineProps` 的 TS 寫法（型別版 vs runtime 版）。

## 專案裡的例子

### 例 1：`ref<Card[]>` —— 為陣列初始化 `[]` 補上型別

`src/composables/useDeck.ts:15-16`

```ts
const deck = ref<Card[]>([])
const drawnCardIds = ref<string[]>([])
```

**為什麼要寫 `<Card[]>`？**

`ref([])` 會被推導成 `Ref<never[]>`——因為 TypeScript 不知道你之後要放什麼。後續 `deck.value = [someCard]` 會報錯（`Card` 不能指派給 `never`）。

**規則**：空陣列、空物件、`null` 初始化時，顯式補上型別。基本型別（`ref(false)`、`ref('hello')`、`ref(0)`）可以讓它自動推導。

### 例 2：`computed<Card | null>` —— 明確可為 null 的 computed

`src/stores/gameStore.ts:34-39`

```ts
const currentCard = computed<Card | null>(
  () => deck.value[drawnCardIds.value.length] ?? null,
)
const lastDrawnCard = computed<Card | null>(
  () => deck.value[drawnCardIds.value.length - 1] ?? null,
)
```

**觀察**：

- 自動推導也能得到 `Card | undefined`（因為陣列索引越界回 undefined）。
- 這裡顯式寫 `Card | null` 是為了讓 **API 契約一致**——回傳值永遠是 `Card` 或 `null`，呼叫端不用同時處理 undefined 與 null。
- `?? null` 把 undefined 轉成 null，呼應型別聲明。

### 例 3：Pinia setup store —— 靠回傳物件自動推導型別

`src/stores/settingsStore.ts:17-63`

```ts
export const useSettingsStore = defineStore('settings', () => {
  const secondaryLang = ref<SecondaryLang>('en')
  const intimateMode = ref(false)
  // ...

  function toggleIntimateMode(): void { /* ... */ }
  function setSecondaryLang(lang: SecondaryLang): void { /* ... */ }

  return {
    secondaryLang,
    intimateMode,
    // ...
    toggleIntimateMode,
    setSecondaryLang,
  }
})
```

**要點**：

- Setup store 不需要像 options store 那樣寫一大包 `state`、`getters`、`actions` 的 interface。
- Store 的對外型別由 `return` 的物件決定；加欄位只要加到 return，型別自動更新。
- **陷阱**：如果忘了 return 某個 ref，呼叫端就拿不到。

### 例 4：`setTimeout` 的 timerId 型別

`src/composables/useCard.ts:17`

```ts
let timerId: ReturnType<typeof setTimeout> | null = null
```

**為什麼不直接寫 `number | null`？**

- 瀏覽器環境 `setTimeout` 回傳 `number`。
- Node.js 環境回傳 `NodeJS.Timeout` 物件。
- 用 `ReturnType<typeof setTimeout>` 讓型別隨環境自動正確，提升跨環境相容性。

### 例 5：`defineProps` 型別版（可於本專案 components 找例子後補）

```ts
// Vue 3.3+ 推薦：純型別寫法
const props = defineProps<{
  card: Card
  isFlipped?: boolean
}>()

// 或帶預設值
const props = withDefaults(
  defineProps<{ card: Card; isFlipped?: boolean }>(),
  { isFlipped: false },
)
```

（請在 `src/components/` 挑一個 .vue 檔對照並補到這裡。）

## 觀念拆解

### `ref` 的型別推導規則

| 寫法 | 推導結果 | 建議 |
| --- | --- | --- |
| `ref(0)` | `Ref<number>` | OK |
| `ref('hi')` | `Ref<string>` | OK |
| `ref<string \| null>(null)` | `Ref<string \| null>` | 初始 null 一定要標 |
| `ref([])` | `Ref<never[]>` | **要標** `ref<T[]>([])` |
| `ref({})` | `Ref<{}>` | **要標** `ref<T>({ ... })` |

### `computed` 的型別推導

- 大多數情況可自動推導：`computed(() => 42)` → `ComputedRef<number>`。
- 手動標 `computed<T>(fn)`：為了對外 API 契約穩定（例如本專案 `Card | null`）。

### Pinia setup vs options

| 面向 | Setup store | Options store |
| --- | --- | --- |
| 型別 | 自動由 return 推導 | 要寫 State / Getters / Actions |
| 感受 | 像寫 composable | 像 Vuex |
| 本專案 | 全部用 setup | — |

### `defineProps` 兩種寫法

- **型別版（專案建議）**：`defineProps<{ x: string }>()`，純型別，預設值走 `withDefaults`。
- **Runtime 版**：`defineProps({ x: { type: String, default: '' } })`，同時有 runtime validation。

型別版更簡潔，runtime 版有 prop validator（但 Vue 3 多數驗證都被 TS 取代）。

## 容易搞混的地方

| 寫法 | 問題 |
| --- | --- |
| `ref([] as Card[])` | 可用但不推薦，不如 `ref<Card[]>([])` 清楚 |
| `computed(() => ...)` 沒寫型別 | 推導出 `Card \| undefined`，可能不是你想要的 |
| Setup store 忘了 return | 呼叫端拿不到，Vue devtools 也看不到 |
| `defineProps({ x: String })` | runtime 寫法，純 TS 專案推薦用型別版 |

## 延伸練習

- 練習 1：閱讀 `src/components/CardFace.vue`（或其他元件），把 props 寫法抄一段到這裡、用自己的話解釋。
- 練習 2：試著把 `gameStore` 裡 `currentCard` 的 `Card | null` 改成 `Card | undefined`，跑 `npm run type-check` 看哪些呼叫端會壞、思考為什麼 null 更好。
- 練習 3：寫一個假想的 composable `useToggle(initial?: boolean)`，回傳 `{ value, toggle, set }`，練習 Pinia 以外的 setup 風格型別。

## 面試題模擬

### Q1：`ref<T>()` 什麼時候要手動標型別，什麼時候可以省略？

**答題思路**：空陣列 / 空物件 / null 初始化 → 必標；primitive 初始化 → 可省。

**答案**：
（預留：引用 `useDeck.ts:15-16` 為例。）

### Q2：Pinia setup store 跟 options store 選哪個？為什麼？

**答題思路**：型別推導、可讀性、跟 Vue Composition API 風格一致。

### Q3：`defineProps<{ ... }>()` 跟 `defineProps({ ... })` 差在哪？

**答題思路**：純型別 vs runtime，專案優先選哪個。

## 延伸閱讀

- [Vue 3 TypeScript with Composition API](https://vuejs.org/guide/typescript/composition-api.html)
- [Pinia — Setup Stores](https://pinia.vuejs.org/core-concepts/#Setup-Stores)
- 本專案相關：`src/composables/**`、`src/stores/**`、`src/components/**`
