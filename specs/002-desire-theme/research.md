# Phase 0 Research: Desire Theme

**Feature**: 002-desire-theme | **Date**: 2026-06-08
**Input**: [spec.md](./spec.md)（含 Clarify Session 2026-06-08）、[plan.md](./plan.md)、現有程式碼

本文件解決規劃級未知數。Clarify 已定案的三項高影響決策（資料表示法、攔截式 notice、卡牌語系）在此承接並落實為設計細節；其餘 spec 明確「留待規劃」的項目（卡牌張數、配色、難度等級）在此定案。

---

## R-001：desire 卡牌張數

- **Decision**：初版 **20 張**單一牌池（無 base/intimate 分層），對應 id `des-001` … `des-020`。
- **Rationale**：
  - 與既有四主題（各 20 張）對齊，使 FanDeck 扇形抽牌的視覺密度與牌堆厚度一致，避免為 desire 特例調整版面。
  - `useDeck` 牌組大小無硬編碼依賴，20 張不需改演算法。
  - 內容任務可分批產出（如 3 個 level 各約 6–7 張），但資料檔結構一次定案 20 槽位。
- **Alternatives considered**：
  - **較小 MVP（10–12 張）**：成人內容需謹慎審查（FR-006/US4），少量較好把關；但牌數過少會讓 FanDeck 看起來單薄、與其他主題不一致，且 SC-001「不需 one-off pipeline」更傾向結構對齊。可作為「先上線、後續補滿」的階段策略，但目標槽位仍定 20。
  - **更多（30+）**：增加審查與翻譯負擔，無對應產品需求，否決。

## R-002：desire 主題配色（6 個 hex）

- **Decision**：採深酒紅／梅紫色系，與 attraction 的粉紅明顯區隔，傳達「成人、私密、慎重」而非「甜美曖昧」。初版色票：

  | token | hex | 用途 |
  |-------|-----|------|
  | primary | `#7A2E4A` | 主色（CTA、強調） |
  | secondary | `#B5546F` | 次色（hint、focus ring） |
  | background | `#2A1620` | 背景起始（深色，氛圍沉穩） |
  | backgroundEnd | `#3E1E2E` | 背景漸層終點 |
  | text | `#F7E9EF` | 內文（深底上的高對比淺色） |
  | cardBack | `#5C2238` | 卡背 |

- **Rationale**：深色基底 + 高明度文字使一般文字對比 ≥ 4.5:1（WCAG AA）；色相與既有四主題（粉、藍綠、橙、青）區隔，符合 US1「一眼辨識為成人主題」。
- **驗證待辦（Phase 2 task）**：以對比工具確認 `text` 對 `background`/`backgroundEnd`、`primary` 對 `text` 皆達 AA；未達標則微調明度。
- **Alternatives considered**：亮粉／紅（與 attraction 混淆、過於「甜」）；純黑灰（過冷、削弱親密溫度）。

## R-003：進入前攔截式成人內容確認（Clarify Q2 落實）

- **Decision**：新增 `AdultContentNotice.vue`（`components/ui/`）為**攔截式 overlay**，內容含：成人內容說明、年齡聲明勾選/確認（「我已年滿 18 歲並理解此主題包含成人親密內容」）、**繼續**與**返回**兩鈕。確認後才導航至 `/game/desire`；返回則關閉並留在首頁。以**導覽生命週期暫態旗標**標記「本次已確認」，**不持久化**（每次進入皆需，符合 FR-004）。
- **觸發點（分層提示之一致收斂）**：
  1. HomeView 選到 desire 卡堆 → 不直接導航，先開 notice。
  2. ThemePreview 的「開始對話」CTA（desire）→ 同樣先開 notice。
  3. **深連結守衛**：直接造訪 `/game/desire`（書籤/重整）時，router `beforeEach` 檢查暫態「已確認」旗標；未確認則導向首頁並開啟 notice，避免繞過。
- **Rationale**：集中在單一 notice 元件 + 單一守衛，確保所有進入路徑（卡堆、預覽、深連結）一致受攔截；暫態旗標滿足「每次進入皆需」且零持久化複雜度（與 Clarify Q2 選 A 而非 C 的理由一致）。
- **Alternatives considered**：
  - 獨立路由 `/notice/desire`：可行但多一個視圖與路由狀態；overlay 元件更輕、與既有 ConfirmModal 模式一致。
  - 以 sessionStorage 記住確認（Clarify 選項 C）：已於 clarify 否決（每次進入皆需重新確認）。

## R-004：卡牌 schema/型別演進（Clarify Q1 落實）

- **Decision**：
  - `types/index.ts`：`Card.isIntimate` 改為 `isIntimate?: boolean`（desire 卡省略；既有四主題維持顯式布林）。
  - `data/validators.ts`：
    - `ThemeCardSchema.isIntimate` → `z.boolean().optional()`。
    - id 正規式由 `^[a-z]+-\d{3}-(base|intimate)$` 放寬為 `^[a-z]+-\d{3}(-(base|intimate))?$`，使 `des-001` 合法、同時不破壞既有 `att-001-base` 等。
  - 消費端安全性：`useDeck.buildDeck` 的 `!intimateMode && card.isIntimate` 對 `undefined` 為 falsy，**行為不變**；其餘讀取 `isIntimate` 處以 `=== true` 或 falsy 視為非 intimate。
- **Rationale**：最小、向後相容的演進；desire 卡確實不帶 intimate 標記（符合 FR-014），而非以 `-base` 後綴假裝（Clarify 選 B 的理由）。
- **Alternatives considered**：新增 `kind` 欄位（Clarify 選項 C，改動面大）；維持後綴硬塞（Clarify 選項 A，語意牴觸 FR-014）。皆已否決。

## R-005：desire 卡牌語系策略（Clarify Q3 落實）

- **Decision**：每張 desire 卡 `text` 仍含四語系 `zh`/`en`/`th`/`ja`（沿用 `CardTextSchema` 四語必填）。`zh`/`en`/`th` 為真實內容；`ja` 沿用既有四主題慣例，以英文佔位（值 = `en`）。`zh`+`en` 為權威語系。
- **Rationale**：滿足現行四語系 schema、與既有資料一致、免新增缺語系 fallback 邏輯；符合 FR-008/SC-004 對 zh+en 的承諾。
- **品質關卡（content task）**：泰文翻譯須保留「成人、同意、安全、可拒絕」語氣（Edge Case：翻譯不得更露骨或更含糊）。
- **Alternatives considered**：放寬 schema 為僅 zh+en（需新增 UI fallback，已於 clarify 否決）；要求完整四語真譯（成人內容翻譯風險高，否決）。

## R-006：desire 是否沿用三段難度 level

- **Decision**：沿用既有 `level: 1 | 2 | 3` 欄位作為 desire 卡的節奏/深度標記（1 較輕、3 較深入）。
- **Rationale**：型別與既有資料模型一致（`CardLevel` 不變），利於內容分批與未來可能的漸進式排序；對 `useDeck` 無影響（目前不依 level 排序，僅洗牌）。
- **Alternatives considered**：desire 不分 level（需讓 `level` 對 desire 變選填，增加型別分支，無對應收益），否決。
- **注意**：既有測試「私密牌難度 ≥ 2」僅作用於 `isIntimate` 卡；desire 無 intimate 卡，不受該斷言約束，desire 可自由使用 level 1。

## R-007：主題邊界分類準則的權威來源

- **Decision**：以 spec 的 Content Boundary Requirements（CB-001…006）與 US3 為準，於 [quickstart.md](./quickstart.md) 收斂成一份「候選題目 → 主題」可操作判斷清單，供內容維護者使用（對應 SC-002 的 ≥90% 可分類目標）。
- **Rationale**：把分類準則放在 quickstart 便於內容任務直接引用，避免散落於程式碼。
- **Alternatives considered**：寫入程式碼註解（不適合內容判斷）；獨立 docs（quickstart 已是規格內文件，足夠）。

---

## 未解決事項

無。所有 NEEDS CLARIFICATION 與規劃級未知數已解決，可進入 Phase 1 設計。
