# Phase 0 Research: Values & Future Theme

**Feature**: `003-values-theme` | **Date**: 2026-07-08

本研究以「實地確認專案現況」為主，佐證 plan 的最小變更取徑。所有引用皆為當前 `main`/`003-values-theme` 分支實測結果。

## R-001：卡數約束的真正所在（無 runtime 上限）

**Decision**：不放寬任何卡數上限，因為 runtime validator 本就沒有上限。

**Evidence**：`src/data/validators.ts` 的 `ThemeFileSchema.cards` 為 `z.array(ThemeCardSchema).min(1)`，**無 `.max()`**。「每主題 20 張」實際只存在於：

1. 契約 schema `specs/002-desire-theme/contracts/desire-theme.schema.json`：`cards.minItems=20 / maxItems=20`（僅約束 desire 檔）。
2. 特定主題硬編測試：`desire-theme.test.ts:14`、`cards-data.test.ts:47`（desire）、`useDeck.test.ts` / `gameStore*.test.ts` / `session-snapshot.test.ts`（attraction/desire 情境）。

**Rationale**：values 只需新增自己的契約（maxItems=25）與測試（總數 25），既有 20 張斷言都綁定既有主題，天然不受影響。對齊 DR-003：以「各主題自身宣告張數」為驗證基準。

**Alternatives rejected**：新增「全站最低可遊玩數」常數或全域卡數規則——本階段用不到，違反最小範圍原則，捨棄。

## R-002：id 正則與 superRefine 的最小改動

**Decision**：validators.ts 僅改兩處。

**Evidence（現況）**：

```
id: /^(des-\d{3}|(?!des-)[a-z]+-\d{3}-(base|intimate))$/   // 會擋掉 val-###
superRefine: if (themeFile.id === 'desire') return          // 只豁免 desire
```

**改為**：

```
id: /^(des-\d{3}|val-\d{3}|(?!des-|val-)[a-z]+-\d{3}-(base|intimate))$/
superRefine: if (themeFile.id === 'desire' || themeFile.id === 'values') return
```

**Rationale**：`val-\d{3}` 新分支讓 values 卡通過；負向前瞻加 `val-` 確保 `val-001-base` 仍被拒（維持 values 無後綴不變量，DR-001）。superRefine 豁免讓 values 可省略 `isIntimate`（DR-002）。`CardText`/`CardLevel`/`isIntimate?` 型別已足夠，型別層零改動。

## R-003：下游自動衍生（無需個別修改）

**Decision**：只改 `VALID_THEME_IDS` 與 `data/index.ts` 兩處註冊點，下游全部自動生效。

**Evidence**：

- `utils/theme.ts`：`validThemeIds = VALID_THEME_IDS`；`isValidThemeId` 以此判斷。
- router `beforeEach`（`meta.requiresValidThemeId`）：呼叫 `isValidThemeId` → 自動接受 `values` 路由。
- `useTheme.applyTheme(themeId, themes)`：`themes.find(e => e.id === themeId)` → values 色票自動注入 CSS 變數。
- `useDeck.buildDeck`：`card.theme === themeId` 過濾 → values 牌堆自動建立。
- `data/index.ts`：`themeFiles.map/flatMap` 聚合 → 加一項即進 `cardsData.themes` 與 `cardsData.cards`。

## R-004：level 為內容深度、非遊玩篩選

**Decision**：level 僅撰稿深度標記，不影響抽牌。

**Evidence**：`useDeck.buildDeck` 過濾條件只有 `theme` 與 `!intimateMode && card.isIntimate`，**未讀 `level`**。values 無 `isIntimate`，故 25 張無論 intimateMode 皆全數入堆。`cards-data.test.ts:26`「私密牌 level ≥ 2」以 `card.isIntimate` 為過濾，對 values 空集合，不套用。

**Rationale**：對齊 FR-007——level（情緒暴露／承諾重量）與題材敏感度脫鉤，level 3 不等於最敏感題材，任一面向可出現在任一 level。

## R-005：四語文本策略

**Decision**：沿用 desire 既有模式。

**Evidence**：`desire.json` 每張卡 `text` 四語皆有值，其中 `ja` 直接鏡射 `en`；`th` 為真實泰文。`CardTextSchema` 四語皆 `min(1)`。

**Rationale**：對齊 FR-011——`zh`/`en` 為權威真實內容，`th` 比照現況、`ja` 以英文鏡射 placeholder，不引入新的缺語系 fallback 邏輯。

## R-006：硬編數字掃描結果（顯示層影響面）

**Decision**：僅需改 i18n 兩處 `home.description` 與 CLAUDE.md 一處。

**Evidence（全域 grep）**：

- 使用者可見且需改：`src/i18n/zh-TW.json` `home.description`（「五個主題，五副…」）、`src/i18n/en.json` `home.description`（「one of five…」）。
- 無需改（語意正確）：`intimateModeHint`「5 張 / 5 prompts」屬 intimate 模式，非主題總數。
- 文件治理（非阻擋上線）：`CLAUDE.md:7`（100 張＝5×20）需更新；`docs/learning/*`、`docs/04-…roadmap`、`docs/00-…copywriting`、`README.md`（甚至還停在 80 張/4 主題）為歷程/教學，批次跟進即可。
- `constitution_zh-tw.md`：實測未硬編「100 張＝5×20」，預期免改。

## R-007：測試盤點分類

**Decision**：真正必改僅 `cards-schema.test.ts`；新增 `values-theme.test.ts`。其餘不動。

**Evidence**：

- `cards-schema.test.ts:41–46` 內嵌 id 正則遍歷**全部**卡牌 → 必須與 validator 同步加 `val-\d{3}`，否則 values 卡令此測試轉紅。
- `cards-data.test.ts` 已宣告「不假設固定數量」，且以顯式 id 清單處理既有主題 → 前向相容，不動。
- 所有 `toHaveLength(20)` 皆綁定 attraction/desire 情境 → 不動。

**新增**：`values-theme.test.ts` 硬檢總數 25 / `^val-\d{3}$` / 四語非空；不硬檢逐面向數量（規劃目標 ±1）。

## 未解決項

無。所有 spec 的 clarification 已定案，現況佐證完整，無 NEEDS CLARIFICATION。
