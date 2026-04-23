# 01 — Vitest 基本結構

> 最後更新：YYYY-MM-DD
> 對應專案範圍：`tests/unit/**/*.test.ts`、`vitest.config.ts`

## 本章學什麼

- `describe` / `it` / `expect` 的角色。
- `beforeEach` / `afterEach` / `beforeAll` / `afterAll` 的差異與用時機。
- Vitest 與 Jest 在這層幾乎同義（本章觀念可互通）。

## 專案裡的例子

### 例 1：最基本的測試結構

`tests/unit/composables/useDeck.test.ts:11-26`

```ts
describe('useDeck', () => {
  const allCards = cardsData.cards as Card[]

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('buildDeck(themeId, cards, false) 應回傳 15 張基礎卡（不含私密）', () => {
    const deck = useDeck()
    const built = deck.buildDeck('attraction', allCards, false)

    expect(built).toHaveLength(15)
    expect(built.every((card) => card.theme === 'attraction')).toBe(true)
    expect(built.some((card) => card.isIntimate)).toBe(false)
  })
})
```

**這段在做什麼？**

- `describe('useDeck', ...)`：一個邏輯分組；通常對應一個模組 / 類別。
- `it('應…', ...)` 或 `test(...)`：單一測試案例；敘述「期望的行為」。
- `expect(actual).toXxx(expected)`：斷言。
- `afterEach` 在每個 `it` 跑完後執行清理。

### 例 2：Arrange / Act / Assert 三段式

`tests/unit/composables/useDeck.test.ts:37-47`

```ts
it('drawCard() 應將卡牌 ID 加入 drawnCardIds 並推進索引', () => {
  // Arrange：準備測試資料與物件
  const deck = useDeck()
  const built = deck.buildDeck('interaction', allCards, false)
  deck.setDeck(built)

  // Act：執行被測行為
  const drawn = deck.drawCard()

  // Assert：驗證結果
  expect(drawn).not.toBeNull()
  expect(deck.drawnCardIds.value).toContain(drawn?.id)
  expect(deck.drawnCardIds.value).toHaveLength(1)
})
```

**這是測試最重要的模式**：每個 `it` 都該明確分三段，不要混在一起。

## 觀念拆解

### 生命週期鉤子

| 鉤子 | 時機 | 常見用途 |
| --- | --- | --- |
| `beforeAll` | 整個 `describe` 只跑一次（前） | 建立昂貴 fixture（DB 連線） |
| `beforeEach` | 每個 `it` 前 | 建立新 Pinia、重置資料 |
| `afterEach` | 每個 `it` 後 | 清理 mock、清除 sessionStorage |
| `afterAll` | 整個 `describe` 只跑一次（後） | 關閉連線 |

**原則**：優先用 `beforeEach` 而非 `beforeAll`，避免測試間互相污染。

### 常見 matcher

| Matcher | 用途 |
| --- | --- |
| `toBe(x)` | 嚴格相等（`===`） |
| `toEqual(x)` | 深層相等（物件 / 陣列） |
| `toHaveLength(n)` | 陣列 / 字串長度 |
| `toContain(x)` | 陣列 / 字串包含 |
| `toBeNull()` / `toBeUndefined()` / `toBeDefined()` | null / undefined |
| `toBeTruthy()` / `toBeFalsy()` | 轉 boolean |
| `toThrow()` | 函式執行應丟錯 |
| `not.` 前綴 | 反向斷言 |

### Test naming

- 中文敘述行為：「應 + 動詞 + 情境」。本專案採這個習慣。
- 不要用「test1 / test2」這種沒敘述性的名字。
- 一個 `it` 只斷言一個行為（多個 `expect` 沒關係，但它們要都服務同一個 assertion）。

### Vitest 專屬：`vi` namespace

- `vi.fn()` — 建 mock 函式。
- `vi.spyOn(obj, 'method')` — 監聽既有方法。
- `vi.useFakeTimers()` / `vi.useRealTimers()` — 假時鐘。
- `vi.restoreAllMocks()` — 還原所有 spy（不會清除 `vi.fn` 建的 mock）。
- 詳見第 04 章。

## 容易搞混的地方

| 寫法 | 問題 |
| --- | --- |
| `expect(a).toBe({ x: 1 })` | 物件用 `toBe` 比較參考，一定 false；應該用 `toEqual` |
| 把 arrange 寫在 `describe` 頂層 | 多個 `it` 共享同一個 instance，狀態會污染 |
| `it('test 1')` | 命名無意義，壞掉也不知道測什麼 |
| 忘記 `await` async expect | 測試可能永遠 pass |

## 延伸練習

- 練習 1：打開 `tests/unit/stores/settingsStore.test.ts`，找一個 `it`，用自己的話寫出 Arrange/Act/Assert 三段。
- 練習 2：為 `shuffleArray` 寫一個「陣列長度為 0 應回傳空陣列」的測試。
- 練習 3：故意改壞 `useDeck.buildDeck` 的過濾邏輯，跑 `npm run test:watch`，觀察哪些測試會紅。

## 面試題模擬

### Q1：`beforeEach` 和 `beforeAll` 的差別？你怎麼選？

**答題思路**：時機差異 → 狀態污染風險 → 通常選 beforeEach。

### Q2：什麼是 Arrange / Act / Assert？為什麼要分？

**答題思路**：可讀性、失敗定位、重構友善。

### Q3：`toBe` 跟 `toEqual` 有什麼差別？

**答題思路**：參考相等 vs 結構相等。用 object literal 為例。

## 延伸閱讀

- [Vitest 官方文件](https://vitest.dev/)
- [Testing Library — Common mistakes with React Testing Library](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)（觀念可轉移到 Vue）
- 本專案所有 `tests/unit/**/*.test.ts`
