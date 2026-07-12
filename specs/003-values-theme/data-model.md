# Phase 1 Data Model: Values & Future Theme

**Feature**: `003-values-theme` | **Date**: 2026-07-08

沿用既有型別（`src/types/index.ts`），values 不引入新型別。以下描述 values 在既有實體下的具體約束。

## 1. Theme（主題）

`cardsData.themes` 由 `themeFiles.map` 聚合。values 主題檔根結構（`ThemeFileSchema`）：

| 欄位 | 型別 / 約束 | values 值 |
|---|---|---|
| `id` | `string.min(1)`；聚合後為 `ThemeId` | `"values"` |
| `name` | `{ zh, en }` 皆 `min(1)` | zh/en 真實 |
| `description` | `{ zh, en }` 皆 `min(1)` | 需點出六面向精神 + 靈魂共振記憶點（FR-003） |
| `colors` | 6 個 `^#[0-9A-Fa-f]{6}$`：primary/secondary/background/backgroundEnd/text/cardBack | values 專屬色票（與其他五主題可辨識區隔） |
| `endMessage` | `{ zh, en }` 皆 `min(1)` | values 專屬結束語 |
| `cards` | `array(ThemeCardSchema).min(1)`；契約另限 25 | 25 張 |

> 色票經 `useTheme.applyTheme` 注入 `--color-*` CSS 變數；`text` 明暗會決定卡面襯底（`useTheme` 的 `resolveCardSurface`），撰稿色票時需確保 `text` 對 `cardBack` 對比 ≥ 4.5:1（沿用 `wcag-contrast` 測試精神）。

## 2. Card（卡牌）— values 專屬約束

`ThemeCardSchema`（省略 theme，由 index.ts 注入）：

| 欄位 | 既有型別 | values 約束 |
|---|---|---|
| `id` | `string` + 正則 | `^val-\d{3}$`（`val-001`～`val-025`，無 base/intimate 後綴，FR-006） |
| `isIntimate` | `boolean` optional | **省略**（比照 desire，FR-005；validator superRefine 豁免 values） |
| `level` | `1 \| 2 \| 3` | 內容深度（情緒暴露／承諾重量），與敏感度脫鉤（FR-007） |
| `text` | `{ zh, en, th, ja }` 皆 `min(1)` | zh/en 真實；th 比照現況、ja 鏡射 en（FR-011） |

**不變量**：

- 總數 **恰好 25**（唯一硬檢 count）。
- 全部 25 張皆無 `isIntimate === true` → values 為單一牌池，intimateMode 不改變其組成。
- id 在全資料集唯一（既有 `cards-schema.test.ts` 唯一性檢查涵蓋）。

## 3. Content Facet（內容面向，規劃用，不出現在資料欄位）

25 張以六面向規劃覆蓋，**分配為規劃目標，容許撰稿 ±1，測試不硬檢逐面向**：

| 面向 | 目標張數 | 精神 |
|---|---|---|
| 價值排序 value ranking | 4 | 什麼對我最重要、如何排序 |
| 金錢與安全感 money & security | 4 | 金錢觀、安全感來源，非審判花錢/存錢 |
| 家庭與親密邊界 family & intimacy boundaries | 4 | 家庭觀、是否要小孩、原生家庭距離 |
| 生活方向 life direction | 4 | 事業、地點、生活型態的取捨 |
| 承諾與未來 commitment & future | 4 | 承諾重量、共同未來想像 |
| 社交與邊界 social & boundaries | 5 | 社交圈、界線、不可妥協原則 |

> facet 僅用於撰稿覆蓋規劃，不作為資料欄位、不對使用者顯示為分類。

## 4. 牌組建立流程（values 情境）

`useDeck.buildDeck('values', allCards, intimateMode)`：

1. 過濾 `card.theme === 'values'` → 25 張。
2. `!intimateMode && card.isIntimate`：values 卡 `isIntimate` 為 `undefined` → 條件恆 falsy → **25 張全保留**（intimateMode true/false 皆同）。
3. `shuffleArray` 一次性洗牌 → 固化到 `gameStore.deck`。

session 快照 `GameSessionSnapshot`（既有型別）以 `deckOrder`（25 個 id）還原，不重新洗牌。

## 5. 內容邊界（CB-001～CB-005，維護與審查依據）

| 主題 | 主要對話任務 | 與 values 的界線 |
|---|---|---|
| `self` | 自我覺察、個人情緒模式與成長（內省） | 焦點內省 → self；焦點共同價值取捨 → values |
| `interaction` | 日常互動、分工、相處節奏 | 焦點互動習慣 → interaction |
| `trust` | 可靠、情緒安全、脆弱、修復 | 焦點安全/修復 → trust；焦點未來生活方向取捨 → values |
| `desire` | 成人身體親密與同意協商 | 身體親密 → desire，values 不吸納 |
| `values` | 價值排序、金錢與安全感、家庭與親密邊界、生活方向、承諾與未來、社交與邊界 | 不成為所有「認真話題」的總集合；主要任務明顯屬他主題時讓位 |

**語氣不變量（FR-008 / US4）**：非審判、非測驗、允許差異、可保留（「這題現在還不想回答」）、可再談；不得包裝成相容性評分或對錯審判。此以內容審查落實，非自動化語氣測試。
