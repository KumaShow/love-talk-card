# Phase 1 Data Model: Desire Theme

**Feature**: 002-desire-theme | **Date**: 2026-06-08
**Input**: [spec.md](./spec.md)、[research.md](./research.md)

本文件定義 desire 功能對既有資料模型的**演進**。原則：加法、向後相容、不為成人內容另立一套結構（FR-009 / SC-001）。

---

## 1. ThemeId（型別演進）

`src/types/index.ts`

```ts
export const VALID_THEME_IDS = ['attraction', 'self', 'interaction', 'trust', 'desire'] as const
export type ThemeId = (typeof VALID_THEME_IDS)[number]
```

- **影響**：`utils/theme.ts` 的 `validThemeIds`、router `beforeEach`、`isValidThemeId` 全部由此衍生，加入 `'desire'` 後**自動**涵蓋 `/game/desire`、`/end/desire` 的路由合法性，無需各別改碼。

## 2. Card（型別演進：isIntimate 改選填）

```ts
export interface Card {
  id: string
  theme: ThemeId
  isIntimate?: boolean   // 演進：改選填。desire 卡省略；既有四主題維持顯式布林
  level: CardLevel
  text: CardText         // 四語系維持必填（見 §5）
}
```

- **業務規則**：
  - desire 卡**不帶** `isIntimate`（省略，視為非 intimate）。既有四主題卡維持原樣（顯式 `true`/`false`）。
  - 任何讀取 `isIntimate` 的判斷以「`=== true` 為 intimate，否則非 intimate」為準；`undefined` 即非 intimate。
  - `useDeck.buildDeck` 的過濾條件 `!intimateMode && card.isIntimate` 對 `undefined` 自然為 falsy，**行為不變**。

## 3. Desire 卡牌 id 規則（演進）

- **格式**：`des-NNN`（三位數，無 `-base`/`-intimate` 後綴），例：`des-001` … `des-020`。
- **驗證**（`src/data/validators.ts`，`ThemeCardSchema`）：

  ```ts
  // 由：/^[a-z]+-\d{3}-(base|intimate)$/
  // 改為：後綴可選，兼容既有 *-base / *-intimate 與新 des-NNN
  id: z.string().regex(/^[a-z]+-\d{3}(-(base|intimate))?$/),
  isIntimate: z.boolean().optional(),
  ```

- **唯一性**：沿用既有「資料集內 id 唯一」不變量（`cards-schema.test.ts` 既有斷言）。

## 4. Theme（desire 主題資料）

`src/data/themes/desire.json` 結構沿用 `ThemeFileSchema`（不變更主題層 schema）：

| 欄位 | 型別 | desire 值 | 來源 |
|------|------|-----------|------|
| `id` | string | `"desire"` | FR-013 |
| `name` | `{zh,en}` | zh/en 主題名（成人親密定位） | FR-008 |
| `description` | `{zh,en}` | zh/en 簡述（傳達成人、同意、可選擇） | FR-001/US1 |
| `colors` | 6×hex | research R-002 色票 | Key Entities |
| `endMessage` | `{zh,en}` | zh/en 結束訊息（尊重、安全語氣） | 既有結構 |
| `cards` | Card[]（無 theme） | 20 張 `des-NNN`（research R-001） | FR-014 |

- **註**：主題層的 `name`/`description`/`endMessage` 維持雙語（zh+en），與既有四主題一致；UI 字串另由 i18n `theme.desire` 提供（與既有四主題慣例相同）。

## 5. CardText（四語系，維持必填）

```ts
export interface CardText { zh: string; en: string; th: string; ja: string }
```

- **不變更**。desire 卡四語系皆非空（`CardTextSchema` 四語 `min(1)`）。
- **內容策略**（research R-005）：`zh`/`en`/`th` 真實，`ja` = `en` 佔位。

## 6. Adult Content Notice（新狀態，非持久化）

成人內容確認**不進入 sessionStorage 快照**（`GameSessionSnapshot` 不變）。其狀態為導覽生命週期暫態旗標：

| 概念 | 範圍 | 持久化 | 規則 |
|------|------|--------|------|
| `desireAcknowledged`（暫態） | 單次導覽 | 否 | 進入 `/game/desire` 前須為 true；返回或重整即重置 → 每次進入皆需重新確認（FR-004） |

- **實作位置**：以 router 守衛可讀取的暫態來源（如模組級 `ref` 或導覽 meta）標記，確認後立即消費並導航；不寫入任何 storage。
- **GameSessionSnapshot**：維持 `{ themeId, deckOrder, drawnCardIds, intimateModeAtStart }` 原結構。desire session 的 `intimateModeAtStart` 恆為 `false`（desire 不使用 intimate 分層，SC-009）。

## 7. 牌組建立流程（desire 特例說明，演算法不變）

`useDeck.buildDeck(themeId='desire', allCards, intimateMode)`：

1. filter：`card.theme === 'desire'`（desire 無 `isIntimate:true` 卡，`!intimateMode && card.isIntimate` 永不命中 → 不排除任何 desire 卡）。
2. shuffle：對 20 張整體 Fisher-Yates 洗牌。
3. 結果：20 張單一牌池，與 intimateMode 設定無關（呼叫端對 desire 應固定傳 `false`）。

- **不變量**：desire 的牌組大小與內容**不受 settingsStore.intimateMode 影響**（SC-009：啟用 intimate 後選 desire 不會更露骨、不會多出卡）。

## 8. 受影響的既有測試（資料模型面）

| 測試 | 變更 |
|------|------|
| `tests/unit/utils/cards-schema.test.ts` | `themeFiles` 陣列加入 desire；id 格式測試的 pattern 同步放寬為 `^[a-z]+-\d{3}(-(base|intimate))?$` |
| `tests/unit/data/cards-data.test.ts` | 「每個主題至少含一張基礎牌」對 desire 仍成立（desire 卡 `isIntimate` 省略 → 計為非 intimate）；如需語意精確，可加註 desire 無 intimate 分層 |
| `tests/unit/utils/card-text.test.ts` | desire 卡納入四語系完整性檢查（含 ja 佔位非空） |

## 9. 新增測試（資料模型面）

| 測試 | 重點 |
|------|------|
| `tests/unit/data/desire-theme.test.ts` | desire 通過 `ThemeFileSchema`；恰 20 張；無任何 `isIntimate === true`；id 皆 `des-NNN`；四語系非空 |
| `tests/unit/composables/useDeck.test.ts`（擴充） | desire 牌組為 20 張且不受 intimateMode 影響 |
