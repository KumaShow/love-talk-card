# Data Model: Love Talk Card Game

**Phase**: 1 — Design & Contracts
**Branch**: `001-love-talk-card-game`
**Date**: 2025-07-18

---

## 實體關係概覽

```
CardsData（cards.json 根物件）
├── themes: Theme[]          ── 4 個主題（靜態）
└── cards: Card[]            ── 80 張卡牌（靜態）

Theme
├── id: ThemeId              ── 主題識別碼
├── name: LocalizedText      ── 多語言名稱
├── description: LocalizedText
├── colors: ThemeColors      ── 主題視覺色彩
└── endMessage: EndMessage   ── 主題專屬結束語

Card
├── id: string               ── UUID v4，全域唯一
├── theme: ThemeId           ── 所屬主題（FK → Theme.id）
├── isIntimate: boolean      ── 是否為私密牌
├── level: CardLevel         ── 問題深度（1–3）
└── text: CardText           ── 多語言題目文字

GameSession（執行期，Pinia gameStore）
├── themeId: ThemeId | null
├── deck: Card[]             ── 洗牌後完整牌組（不序列化）
├── drawnCardIds: string[]   ── 已抽出卡牌 ID 列表（有序）
├── intimateModeAtStart: boolean
├── isAnimating: boolean     ── 動畫封鎖旗標（不序列化）
└── isComplete: boolean      ── 是否已抽完全部牌

SettingsState（執行期，Pinia settingsStore，session-only）
├── secondaryLang: SecondaryLang
├── intimateMode: boolean
├── audioEnabled: boolean
├── musicEnabled: boolean
└── showRemainingCount: boolean
```

---

## 1. Card（卡牌）

靜態資料，儲存於 `src/data/cards.json`，version controlled。

### 欄位定義

| 欄位 | TypeScript 型別 | 限制 | 說明 |
|------|----------------|------|------|
| `id` | `string` | 可讀格式：`{prefix}-{序號}-{base\|intimate}`，全域唯一 | 卡牌識別碼 |
| `theme` | `ThemeId` | 枚舉值之一 | 所屬主題 |
| `isIntimate` | `boolean` | — | 是否為私密牌 |
| `level` | `CardLevel` | 整數 1、2 或 3 | 問題深度等級 |
| `text` | `CardText` | 所有語言欄位必填 | 多語言題目文字 |

### CardText 結構

| 欄位 | 型別 | 說明 |
|------|------|------|
| `zh` | `string` | 繁體中文（主語言，必填，不得為空） |
| `en` | `string` | 英文（必填，語言回退的最終目標） |
| `th` | `string` | 泰文（必填，可暫時與 en 相同） |
| `ja` | `string` | 日文（必填，可暫時與 en 相同） |

### 驗證規則

- `id` 必須符合可讀格式 `{prefix}-{序號:3位數}-{base|intimate}`，且在整個 `cards.json` 中唯一
- `text.zh` 不得為空字串（主語言不允許空缺）
- 各語言回退順序：`selectedLang → en → zh`
- 每主題基礎牌（`isIntimate: false`）恰好 **15** 張
- 每主題私密牌（`isIntimate: true`）恰好 **5** 張
- 全資料集共 **80** 張（4 主題 × 20 張）

---

## 2. Theme（主題）

靜態設定資料，嵌入 `src/data/cards.json` 頂層 `themes` 陣列。

### 欄位定義

| 欄位 | TypeScript 型別 | 說明 |
|------|----------------|------|
| `id` | `ThemeId` | 主題識別碼（枚舉） |
| `name` | `LocalizedText` | 主題名稱（ZH-TW + EN） |
| `description` | `LocalizedText` | 主題描述（ZH-TW + EN） |
| `colors` | `ThemeColors` | 主題視覺色彩（CSS hex 值） |
| `endMessage` | `EndMessage` | 主題專屬結束語（ZH-TW + EN） |

### ThemeId 枚舉

```typescript
type ThemeId = 'attraction' | 'self' | 'interaction' | 'trust'
```

| 值 | 中文名稱 | 英文名稱 |
|----|---------|---------|
| `attraction` | 心動瞬間 | Attraction & Sparks |
| `self` | 自我探索 | Self & Exploration |
| `interaction` | 互動理解 | Interaction & Understanding |
| `trust` | 信任成長 | Trust & Growth |

### ThemeColors 結構

| 欄位 | 型別 | 說明 |
|------|------|------|
| `primary` | `string` | 主色（CSS hex，用於按鈕、強調） |
| `secondary` | `string` | 副色（用於卡牌邊框、裝飾） |
| `background` | `string` | 背景漸層起始色 |
| `backgroundEnd` | `string` | 背景漸層結束色 |
| `text` | `string` | 前景文字色（確保 WCAG AA 對比） |
| `cardBack` | `string` | 卡背主色 |

### EndMessage 結構

| 欄位 | 型別 | 說明 |
|------|------|------|
| `zh` | `string` | 繁體中文結束語 |
| `en` | `string` | 英文結束語 |

---

## 3. GameSession（遊戲 Session）

執行期狀態，由 `gameStore`（Pinia）管理，核心欄位序列化至 `sessionStorage`。

### 欄位定義

| 欄位 | TypeScript 型別 | 初始值 | 序列化 | 說明 |
|------|----------------|--------|--------|------|
| `themeId` | `ThemeId \| null` | `null` | ✅ | 當前選擇主題 |
| `deck` | `Card[]` | `[]` | ❌ | 洗牌後完整牌組（可由 themeId + drawnCardIds 重建） |
| `drawnCardIds` | `string[]` | `[]` | ✅ | 已抽出卡牌 ID 列表（有序） |
| `intimateModeAtStart` | `boolean` | 當下 settings 值 | ✅ | Session 開始時的私密模式狀態（不隨設定變更） |
| `isAnimating` | `boolean` | `false` | ❌ | 翻牌動畫進行中旗標（不持久化） |
| `isComplete` | `boolean` | `false` | ❌ | 是否已抽完全部牌（可衍生計算） |

### 衍生計算屬性

```typescript
// Pinia getters
remainingCount: deck.length - drawnCardIds.length
currentCard: deck[drawnCardIds.length] ?? null     // 待抽的下一張（牌堆頂）
lastDrawnCard: deck[drawnCardIds.length - 1] ?? null  // 最後翻面的牌（已展示）
isComplete: drawnCardIds.length === deck.length && deck.length > 0
```

### sessionStorage 序列化格式

Key: `love-talk-game-session`

```json
{
  "themeId": "attraction",
  "drawnCardIds": ["uuid-1", "uuid-2", "uuid-3"],
  "intimateModeAtStart": false
}
```

### Session 恢復邏輯

`gameStore` 初始化時（`onMounted` 或 plugin init）：
1. 讀取 `sessionStorage['love-talk-game-session']`
2. 若存在且 `themeId` 有效 → 依 `themeId` + `intimateModeAtStart` 重建 `deck`（需重新洗牌至相同狀態，或儲存 `deckOrder`）
3. 過濾 `deck` 排除 `drawnCardIds` 中的已抽牌
4. 恢復到 `drawnCardIds` 對應的進度點

> **注意**：洗牌後 `deck` 順序在 session 恢復時需可重建。方案：序列化 `deckOrder`（洗牌後 ID 陣列）取代重新洗牌，確保恢復後卡牌順序一致。

**更新後序列化格式**:
```json
{
  "themeId": "attraction",
  "deckOrder": ["uuid-5", "uuid-12", "uuid-3", "..."],
  "drawnCardIds": ["uuid-5"],
  "intimateModeAtStart": false
}
```

### 狀態機

```
[初始狀態]
null
  │
  ├─[選擇主題]──────────────────────────> ACTIVE
  │                                         │
  │                              ┌──────────┤
  │                              │          │
  │                         [抽一張牌]    [返回首頁]
  │                              │          │
  │                              ▼          ├─ drawnCount < 8 ──> null（直接清除）
  │                          ACTIVE         │
  │                              │          ├─ drawnCount >= 8 ──> [ConfirmModal]
  │                         [最後一張]       │                         │
  │                              │          │                    確認 ──> null
  │                              ▼          │                    取消 ──> ACTIVE
  │                          COMPLETE       │
  │                              │          │
  │                         [返回首頁]      │
  │                              │          │
  └──────────────────────────────┴──────────┘
                                 │
                               null
```

---

## 4. SettingsState（設定狀態）

Session-only，由 `settingsStore`（Pinia）管理，**不**持久化至任何 Storage。

### 欄位定義

| 欄位 | TypeScript 型別 | 初始值 | 說明 |
|------|----------------|--------|------|
| `secondaryLang` | `SecondaryLang` | `'en'` | 卡牌副語言顯示選擇 |
| `intimateMode` | `boolean` | `false` | 私密模式開關（僅在 HomeView 可切換） |
| `audioEnabled` | `boolean` | `true` | 翻牌音效開關 |
| `musicEnabled` | `boolean` | `false` | 背景音樂開關（預設靜音） |
| `showRemainingCount` | `boolean` | `true` | 剩餘牌數顯示/隱藏 |

### SecondaryLang 枚舉

```typescript
type SecondaryLang = 'en' | 'th' | 'ja'
```

### 業務規則

- `intimateMode` 切換僅在 **HomeView** 有效；進入 GameView 後，`gameStore.intimateModeAtStart` 固化，`settingsStore.intimateMode` 的後續變更不影響當前 session 的牌組
- `secondaryLang` 切換即時生效，適用於後續所有卡牌顯示（包括已翻面的當前牌）
- `audioEnabled = false` 時翻牌不播放音效；`musicEnabled = false` 時背景音樂靜音

---

## 5. TypeScript 型別定義總覽

```typescript
// src/types/index.ts

// ── 枚舉型別 ──────────────────────────────────────────────────

/** 主題識別碼 */
export type ThemeId = 'attraction' | 'self' | 'interaction' | 'trust'

/** 副語言選項（不含主語言 zh） */
export type SecondaryLang = 'en' | 'th' | 'ja'

/** 卡牌難度等級 */
export type CardLevel = 1 | 2 | 3

// ── 卡牌相關 ──────────────────────────────────────────────────

/** 卡牌多語言文字 */
export interface CardText {
  zh: string   // 繁體中文（主語言，必填）
  en: string   // 英文
  th: string   // 泰文
  ja: string   // 日文
}

/** 單張卡牌 */
export interface Card {
  id: string           // 可讀格式：{prefix}-{序號}-{base|intimate}，全域唯一
  theme: ThemeId       // 所屬主題
  isIntimate: boolean  // 是否為私密牌
  level: CardLevel     // 問題深度（1–3）
  text: CardText       // 多語言題目文字
}

// ── 主題相關 ──────────────────────────────────────────────────

/** 雙語文字（ZH-TW + EN） */
export interface LocalizedText {
  zh: string
  en: string
}

/** 主題視覺色彩（CSS hex 值） */
export interface ThemeColors {
  primary: string       // 主色（按鈕、強調）
  secondary: string     // 副色（邊框、裝飾）
  background: string    // 背景漸層起始色
  backgroundEnd: string // 背景漸層結束色
  text: string          // 前景文字色
  cardBack: string      // 卡背主色
}

/** 主題專屬結束語 */
export interface EndMessage {
  zh: string
  en: string
}

/** 主題 */
export interface Theme {
  id: ThemeId
  name: LocalizedText
  description: LocalizedText
  colors: ThemeColors
  endMessage: EndMessage
}

// ── 資料集根物件 ──────────────────────────────────────────────

/** cards.json 根物件結構 */
export interface CardsData {
  version: string   // semver，e.g., "1.0.0"
  themes: Theme[]   // 4 個主題
  cards: Card[]     // 80 張卡牌
}

// ── 執行期狀態 ────────────────────────────────────────────────

/** sessionStorage 序列化格式 */
export interface GameSessionSnapshot {
  themeId: ThemeId
  deckOrder: string[]           // 洗牌後卡牌 ID 序列（完整牌組順序）
  drawnCardIds: string[]        // 已抽出卡牌 ID（有序）
  intimateModeAtStart: boolean
}
```

---

## 6. UI State Machine（Phase 9）

Phase 9 的 UX 重塑保留既有 `gameStore`、`useDeck`、`useCard` 與 `GameSessionSnapshot` schema，不新增 store 層持久化欄位；扇形牌堆與閱讀 overlay 的互動狀態僅存在於 `GameView`（或轉正後對應 View）實例內。

### PickedPhase 定義

```typescript
type PickedPhase = 'idle' | 'flipping' | 'reading' | 'dismissing'
```

| 狀態 | 說明 |
|------|------|
| `idle` | 尚未點擊扇形中央卡；牌堆可互動 |
| `flipping` | 已捕捉本次抽取卡片，overlay 進場並執行 3D 翻面 |
| `reading` | 翻面完成，使用者正在閱讀題目內容 |
| `dismissing` | 使用者確認進入下一張，overlay 卡片飛出右側 |

### 狀態轉移

```text
idle
  → [使用者點扇形中央卡]
  → flipping（capture pickedCard = currentCard、呼叫 drawCard()）

flipping
  → [rotateY 600ms 動畫結束]
  → reading

reading
  → [使用者點「下一張」CTA 或 backdrop]
  → dismissing

dismissing
  → [飛出動畫 460ms 結束]
  → idle（若 isComplete 則導向 EndView）
```

### 核心規則

1. `drawCard()` 必須在進入 `flipping` 時立即呼叫，而不是等到翻面動畫結束後才推進。
2. 這個時機點可確保 `drawnCardIds` 與 overlay 顯示的 `pickedCard` 同步，`remainingCount` 也會立即反映到 AppHeader。
3. `visibleStart`（若 View 內有扇形 windowing 或等價 UI state）不得寫入 sessionStorage；重整後一律依 `drawnCount` 重新計算 next-to-draw 中央位置。
4. `PickedPhase` 為純 UI state，不進 Pinia store，也不納入 `GameSessionSnapshot`。
5. 若使用者在 `reading` 期間重整瀏覽器，session 只還原已抽進度，不還原 overlay；重新進入後直接看到下一張待抽卡位於扇形中央。

---

## 7. cards.json 完整結構範例

```json
{
  "version": "1.0.0",
  "themes": [
    {
      "id": "attraction",
      "name": {
        "zh": "心動瞬間",
        "en": "Attraction & Sparks"
      },
      "description": {
        "zh": "探索彼此吸引的起點，回味那些讓心跳加速的時刻",
        "en": "Explore the sparks that drew you together and the moments that made your heart race"
      },
      "colors": {
        "primary": "#E8A0BF",
        "secondary": "#FFD6E0",
        "background": "#FFF0F5",
        "backgroundEnd": "#FFE0EC",
        "text": "#4A1528",
        "cardBack": "#C76D8E"
      },
      "endMessage": {
        "zh": "每一個心動，都是故事的開始。感謝你願意與我分享這一切。✨",
        "en": "Every spark was the beginning of your story. Thank you for sharing it. ✨"
      }
    },
    {
      "id": "self",
      "name": {
        "zh": "自我探索",
        "en": "Self & Exploration"
      },
      "description": {
        "zh": "在關係中認識更真實的自己，也讓對方看見你內心的風景",
        "en": "Discover your authentic self within the relationship and let your partner see your inner world"
      },
      "colors": {
        "primary": "#A8D8EA",
        "secondary": "#D4EEF7",
        "background": "#F0F8FF",
        "backgroundEnd": "#E0F4FF",
        "text": "#1A3A4A",
        "cardBack": "#5BA4C0"
      },
      "endMessage": {
        "zh": "認識自己，是愛人最深的基礎。你今天又更了解自己一點了。🌊",
        "en": "Knowing yourself is the deepest foundation of love. You know yourself a little better today. 🌊"
      }
    },
    {
      "id": "interaction",
      "name": {
        "zh": "互動理解",
        "en": "Interaction & Understanding"
      },
      "description": {
        "zh": "深入彼此的溝通方式與情感需求，讓理解成為連結的橋樑",
        "en": "Dive into each other's communication styles and emotional needs, building bridges of understanding"
      },
      "colors": {
        "primary": "#B8E0B8",
        "secondary": "#D4F0D4",
        "background": "#F0FFF0",
        "backgroundEnd": "#E0FFE0",
        "text": "#1A3A1A",
        "cardBack": "#5BA05B"
      },
      "endMessage": {
        "zh": "真正的理解，從願意傾聽開始。謝謝你今天的坦誠。🌿",
        "en": "True understanding begins with the willingness to listen. Thank you for your honesty today. 🌿"
      }
    },
    {
      "id": "trust",
      "name": {
        "zh": "信任成長",
        "en": "Trust & Growth"
      },
      "description": {
        "zh": "探索共同的未來與深層的信任，在脆弱中建立更深的連結",
        "en": "Explore your shared future and deep trust, building stronger bonds through vulnerability"
      },
      "colors": {
        "primary": "#D4A8E8",
        "secondary": "#E8D4F7",
        "background": "#F8F0FF",
        "backgroundEnd": "#F0E0FF",
        "text": "#2A1A3A",
        "cardBack": "#8B5BB5"
      },
      "endMessage": {
        "zh": "信任是緩慢積累的禮物。感謝你今天選擇了脆弱與勇氣。💜",
        "en": "Trust is a gift built slowly. Thank you for choosing vulnerability and courage today. 💜"
      }
    }
  ],
  "cards": [
    {
      "id": "att-001-base",
      "theme": "attraction",
      "isIntimate": false,
      "level": 1,
      "text": {
        "zh": "你第一次注意到我是什麼時候？當時心裡在想什麼？",
        "en": "When did you first notice me? What were you thinking at that moment?",
        "th": "คุณสังเกตเห็นฉันครั้งแรกเมื่อไหร่? ตอนนั้นคิดอะไรอยู่?",
        "ja": "初めて私に気づいたのはいつ？その時、何を考えていた？"
      }
    }
  ]
}
```

---

## 8. 洗牌演算法

使用 **Fisher-Yates（Knuth）Shuffle** 確保均勻隨機分布，時間複雜度 O(n)：

```typescript
// src/utils/shuffle.ts
/**
 * Fisher-Yates 洗牌演算法
 * 確保陣列中每個元素出現在任意位置的機率相等
 * @param array - 待洗牌的陣列（原地修改副本）
 * @returns 洗牌後的新陣列
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]  // 建立副本，不修改原陣列
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}
```

**牌組建立流程**:
1. 依 `themeId` 過濾 `cards`，取得該主題全部卡牌
2. 若 `intimateModeAtStart = false`，過濾掉 `isIntimate: true` 的卡牌
3. 對過濾後的卡牌陣列執行 `shuffleArray()`
4. 儲存洗牌後的完整 `deck` 及 `deckOrder`（ID 陣列）至 `gameStore` 及 `sessionStorage`
