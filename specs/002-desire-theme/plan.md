# Implementation Plan: Desire Theme

**Branch**: `002-desire-theme` | **Date**: 2026-06-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-desire-theme/spec.md`

## Summary

在既有 4 主題（attraction / self / interaction / trust）之外，新增第 5 個成人親密主題 `desire`，承接身體親密、性需求表達、碰觸偏好、親密頻率、邀請方式、同意與安全感對話。技術上以**加法**整合進現有 Vue 3 + Pinia 靜態資料架構：新增 `src/data/themes/desire.json`、把 `desire` 納入 `VALID_THEME_IDS`，並針對 Clarify 的三項決策做最小幅度演進——(1) 卡牌 schema/型別讓 `isIntimate` 變為選填、`desire` 卡採 `des-###` 無 base/intimate 後綴的 id；(2) 進入 `desire` 前加入**攔截式成人內容確認**（每次進入皆需、可返回）；(3) 卡牌維持四語系 schema，`zh`/`en`/`th` 為真實內容、`ja` 沿用英文佔位。既有四主題與 intimate 模式行為完全不變。

## Technical Context

**Language/Version**: TypeScript 5.x + Node.js 20 LTS（沿用既有）
**Primary Dependencies**: Vue 3.4+, Vue Router 4（Hash mode）, Pinia 2.x, Tailwind CSS 4.x, Zod（既有 `validators.ts`）, vite-plugin-pwa — 本功能**不新增執行期相依**
**Storage**: sessionStorage（既有遊戲快照）；成人內容確認狀態為**導覽生命週期內的暫態旗標**，不持久化（FR-004：每次進入皆需確認）
**Testing**: Vitest（Unit/Integration，覆蓋率 ≥ 80%，`composables`/`stores` ≥ 95%）+ Playwright（E2E）
**Target Platform**: 現代行動瀏覽器（iOS Safari / Android Chrome），GitHub Pages 靜態部署
**Project Type**: Web Application (SPA) — PWA（單一 Vue 專案，無 backend）
**Performance Goals**: 沿用憲章門檻；新增 `desire` 為靜態 JSON，bundle 增量極小（純文字資料 + 少量 UI 元件）
**Constraints**: 初始 bundle ≤ 200KB gzip；無新外部相依；成人內容文案須通過 FR-006 安全審查；新 `desire` 配色與 notice 須符合 WCAG 2.1 AA
**Scale/Scope**: +1 主題、+20 張 `desire` 卡（research R-001 決策）、+1 攔截式 notice 元件、+1 router 守衛、i18n 增量（zh-TW + en）

**NEEDS CLARIFICATION**: 無。三項高影響歧義已於 `/speckit.clarify`（Session 2026-06-08）解決；其餘規劃級決策（卡牌張數、配色、難度等級）於 Phase 0 research.md 定案。

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | 規範要求 | 狀態 | 備註 |
|------|---------|------|------|
| 程式碼註解語言 | 繁體中文（ZH-TW） | ✅ PASS | 沿用 ESLint `zh-tw` 規則 |
| Commit 訊息格式 | Conventional Commits；AI 建議繁中 | ✅ PASS | Husky commit-msg hook |
| TDD 強制 | Red-Green-Refactor | ✅ PASS | schema 變更、desire 牌組、notice 守衛皆先寫 failing test |
| 測試覆蓋率 | 整體 ≥ 80%，`composables`/`stores` ≥ 95% | ✅ PASS | 牌組過濾、notice 守衛邏輯納入單元測試 |
| i18n（至少 zh-TW + en） | 顯示字串外部化 | ✅ PASS | `theme.desire`、notice 文案放 i18n；卡牌文字放 desire.json |
| 字串外部化 | 無硬碼 display 字串 | ✅ PASS | notice 標題／按鈕／年齡聲明全走 i18n |
| WCAG 2.1 AA | 對比 ≥ 4.5:1 | ✅ PASS（待設計驗證） | research R-002 desire 配色以對比工具驗證 |
| 觸控目標 ≥ 44×44px | 互動元素 | ✅ PASS | notice 確認／返回鈕沿用 `min-h-[44px]` 規範 |
| 主題切換 300–500ms | CSS transition | ✅ PASS | desire 沿用既有 `useTheme` CSS 變數過場 |
| 卡牌翻轉 ≤ 600ms 不阻擋 | CSS 3D | ✅ PASS | desire 沿用既有 FanDeck / PickedCardView |
| 時區 Asia/Taipei | 日期時間 | ✅ N/A | 本功能無日期時間邏輯 |
| LF 換行 | .gitattributes | ✅ PASS | 新檔沿用 |
| CI lint + test 阻擋 merge | — | ✅ PASS | 沿用既有 workflow |
| 憲章雙語同步 | constitution 中英同步 | ✅ N/A | 本功能不修改憲章 |

**新增功能特有關卡（spec 衍生）**：

| Gate | 來源 | 狀態 | 備註 |
|------|------|------|------|
| 成人內容安全審查 | FR-006 / US4 / SC-005 | ⏳ 內容階段 | 每張 desire 卡須通過同意／安全／非露骨指令／非強迫揭露審查（content task 關卡） |
| 進入前攔截式確認 | FR-004 / US1 AS-5 | ✅ PASS | research R-003 設計 notice 元件 + 守衛，每次進入皆需、可返回 |
| 主題邊界可分類 | FR-010 / SC-002 | ✅ PASS | data-model + quickstart 提供分類準則 |

**Constitution Gate（Phase 0 前）**: ✅ ALL PASS — 可進入 Phase 0
**Constitution Gate（Phase 1 後，重新確認）**: ✅ ALL PASS — 見 Phase 1 末段「Post-Design Constitution Re-Check」

## Project Structure

### Documentation (this feature)

```text
specs/002-desire-theme/
├── plan.md              # 本文件（/speckit.plan 輸出）
├── research.md          # Phase 0 輸出
├── data-model.md        # Phase 1 輸出
├── quickstart.md        # Phase 1 輸出（含 desire 邊界分類準則）
├── contracts/           # Phase 1 輸出
│   ├── desire-theme.schema.json   # desire.json 結構契約（演進後的卡牌 schema）
│   └── adult-content-notice.md    # 攔截式成人內容確認的 UI/行為契約
└── tasks.md             # Phase 2 輸出（/speckit.tasks 產生，非本命令）
```

### Source Code（受影響的真實路徑；標示 NEW / MODIFY）

```text
src/
├── data/
│   ├── themes/
│   │   └── desire.json              # NEW：desire 主題資料（20 張卡，無 intimate 分層；4 語系，ja=en 佔位）
│   ├── index.ts                    # MODIFY：import desire.json 並加入 themeFiles
│   └── validators.ts               # MODIFY：isIntimate 改選填、id 正規式允許 des-### 無後綴
├── types/
│   └── index.ts                    # MODIFY：VALID_THEME_IDS 加 'desire'；Card.isIntimate 改選填
├── i18n/
│   ├── zh-TW.json                  # MODIFY：theme.desire、home.desire notice、notice.* 鍵
│   └── en.json                     # MODIFY：同上英文
├── components/
│   ├── home/
│   │   └── ThemePreview.vue        # MODIFY：desire 預覽顯示成人內容提示（分層提示之一）
│   └── ui/
│       └── AdultContentNotice.vue  # NEW：進入前攔截式確認（年齡聲明 + 繼續/返回）
├── router/
│   └── index.ts                    # MODIFY：守衛攔截前往 /game/desire，未確認則導向確認流程
├── views/
│   └── HomeView.vue                # MODIFY：選到 desire 時觸發 AdultContentNotice，確認後才導航
├── stores/
│   └── gameStore.ts                # MODIFY：startSession 對 desire 強制 intimateMode=false，鎖定 intimateModeAtStart（SC-009）
└── (utils/theme.ts、settingsStore.ts、composables/useDeck.ts 無需改碼，desire 由資料與既有泛型流程自動承接)

tests/
├── unit/
│   ├── utils/cards-schema.test.ts  # MODIFY：themeFiles 加 desire；id 格式測試允許 des-### 無後綴
│   ├── utils/cardsData.spec.ts     # MODIFY：放寬 id 正規式並掃 desire 卡四語系完整性
│   ├── data/cards-data.test.ts     # MODIFY（如需）：base 牌斷言範圍說明 desire 全為非 intimate
│   ├── data/desire-theme.test.ts   # NEW：desire 牌組（20 張、無 isIntimate:true）、四語系完整
│   ├── stores/gameStore.desire.test.ts  # NEW：desire 的 intimateModeAtStart 恆為 false（SC-009）
│   ├── components/AdultContentNotice.test.ts  # NEW：確認/返回行為、年齡聲明、可關閉
│   ├── components/ThemePreview.test.ts  # MODIFY：desire 成人提示來自 i18n、非 desire 不顯示
│   └── router/desire-guard.test.ts # NEW：未確認直連 /game/desire 被攔截並帶開啟 notice 狀態
└── e2e/playwright/
    └── us-desire-entry.spec.ts     # NEW：首頁→預覽提示→攔截確認→進入；返回；深連結被導回開 notice
```

**Structure Decision**: 維持單一 Vue SPA、靜態 JSON 資料的既有架構，以**加法**整合 desire。主題列表（HomeView / ThemeCardDeck）已是資料驅動（由 `cardsData.themes` 渲染），新增 desire 資料即自動出現；路由合法性由 `VALID_THEME_IDS` 衍生的 `validThemeIds` 自動涵蓋。唯四處需要改碼：(1) 卡牌 schema/型別演進（Clarify Q1）；(2) 攔截式 notice 元件 + 守衛（Clarify Q2，含明確匯出的暫態確認 API `acknowledgeDesireOnce()`／`consumeDesireAcknowledgement()`，且 `query.notice=desire` 僅觸發 notice、不得作為確認依據）；(3) `gameStore.startSession` 對 desire 鎖定 `intimateModeAtStart=false`（SC-009，涵蓋 `GameView.ensureSession` 以 `settingsStore.intimateMode` fallback 的路徑）；(4) i18n 與預覽提示文案。`useDeck.buildDeck` 的 filter→shuffle 流程對 desire 天然相容（desire 無 `isIntimate:true` 卡，filter 不排除任何卡，整體洗牌後即為 20 張單一牌池），故**不需改動牌組演算法**。

## Complexity Tracking

> 無憲章違規需要豁免。本功能為既有架構的加法擴充，未引入新相依、新專案或新架構模式。

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| （無） | — | — |
