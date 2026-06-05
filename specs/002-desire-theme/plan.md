# Implementation Plan: Desire Theme

**Branch**: `002-desire-theme` | **Date**: 2026-06-05 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-desire-theme/spec.md`

## Summary

新增第 5 主題 `desire`，定位為成人伴侶的慾望、身體親密、同意、界線與安全感對話。技術策略是保留現有 Vue SPA、靜態 JSON 主題檔、Pinia session 與自製 i18n 架構，只做最小穩定擴充：加入 `desire` 主題資料、讓 schema 與測試不再假設固定 4 主題或 80 張卡、用主題 metadata 表達成人提示與是否支援 intimate mode，並在首頁、主題預覽與進入遊戲前提供清楚但不驚嚇的成人內容提示。

本功能不重做整個卡牌資料架構，不新增後端，不改 PWA 基礎管線，也不把既有四主題的 intimate 尺度提高。既有四主題仍維持 `15 base + 5 intimate` 的溫和私密定位；`desire` 是獨立成人親密主題，不使用自己的 base/intimate 分層。

## Technical Context

**Language/Version**: TypeScript 5.6 + Node.js 20 LTS
**Primary Dependencies**: Vue 3.5、Vite 7、Vue Router 4、Pinia 2、Tailwind CSS v4、Zod
**Storage**: 靜態 JSON 主題檔；sessionStorage 保存遊戲進度；無後端、無資料庫
**Testing**: Vitest（unit/integration）+ Playwright（E2E）
**Target Platform**: Mobile-first SPA / PWA，GitHub Pages 靜態部署
**Project Type**: Web Application (SPA)
**Performance Goals**: 不新增重型依賴；維持既有 FCP、TTI、翻牌動畫與 bundle 約束
**Constraints**: ZH-TW 為預設語氣；核心 UI 與主題文案至少支援 zh-TW/en；所有顯示字串外部化；Tailwind v4 utility-first；程式碼註解使用繁體中文；LF 換行
**Scale/Scope**: 由 4 個主題擴充為 5 個主題；卡牌總數不再用固定 80 作為驗證標準

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | 規範要求 | 狀態 | 本功能落點 |
|------|---------|------|------------|
| 程式碼註解語言 | 繁體中文 | PASS | 新增或修改註解皆用 ZH-TW |
| TDD | 先測試再實作 | PASS | 先改資料/schema/store/view 測試，再加 desire 實作 |
| 字串外部化 | 不硬碼顯示字串 | PASS | 成人提示、注意事項、CTA、主題描述進 i18n 或 theme JSON |
| i18n | 至少 zh-TW/en | PASS | desire 核心 UI 與 theme copy 先交付 zh/en；卡牌文字仍沿現有四語言欄位 |
| Mobile-first / 觸控 | 44px 互動目標、直式優先 | PASS | 成人提示用既有浮層/按鈕模式，不新增小型密集控制 |
| Tailwind v4 | utility-first | PASS | UI 變更以 utility class 為主，僅保留既有允許的 scoped CSS 類型 |
| 效能 | 不增加重型依賴 | PASS | 不引入 modal/i18n/動畫函式庫 |
| LF 換行 | 全檔 LF | PASS | 新增 spec 與程式碼均維持 LF |

**Constitution Gate（Phase 0 前）**: PASS。此功能可用現有架構完成，無需憲章例外。

**Constitution Gate（Phase 1 後重新確認）**: 實作前需確認新增 metadata 與 notice copy 皆已外部化，且 Playwright 覆蓋 desire 進入前提示與既有四主題不受影響。

## Project Structure

### Documentation (this feature)

```text
specs/002-desire-theme/
├── spec.md              # 已存在：功能需求與內容邊界
├── plan.md              # 本文件
├── data-model.md        # 後續若進入 /speckit.tasks 前補齊資料模型差異
├── quickstart.md        # 後續補測試與人工驗收流程
└── contracts/           # 後續補 schema/contract 更新，例如 theme-file schema 摘要
```

### Source Code (repository root)

```text
src/
├── data/
│   ├── index.ts                     # 匯入 desire.json 並組裝 cardsData
│   ├── validators.ts                # Theme/Card schema 放寬固定 base/intimate 假設
│   └── themes/
│       ├── attraction.json
│       ├── self.json
│       ├── interaction.json
│       ├── trust.json
│       └── desire.json              # 新增成人親密主題
├── types/index.ts                   # ThemeId、Theme metadata、Card id kind
├── utils/theme.ts                   # validThemeIds / isValidThemeId
├── composables/useDeck.ts           # 依 theme metadata 判斷 intimate mode 是否適用
├── views/
│   ├── HomeView.vue                 # 第 5 主題、成人提示入口
│   ├── GameView.vue                 # 進入前確認或已確認狀態
│   └── EndView.vue                  # desire 結束訊息正常顯示
├── components/home/
│   ├── ThemeCardDeck.vue            # 成人提示標記
│   └── ThemePreview.vue             # desire preview notice + start confirm
└── i18n/
    ├── zh-TW.json                   # 首頁/預覽/進入提示/成人標記
    └── en.json

tests/
├── unit/
│   ├── data/cards-data.test.ts
│   ├── utils/cards-schema.test.ts
│   ├── stores/gameStore*.test.ts
│   ├── components/ThemeCardDeck.test.ts
│   ├── components/ThemePreview.test.ts
│   └── views/views.test.ts
└── e2e/playwright/
    ├── us1-core-gameplay.spec.ts
    ├── us2-intimate-mode.spec.ts
    ├── us4-theme-ambiance.spec.ts
    └── desire-theme.spec.ts         # 新增 desire opt-in / notice / route 流程
```

**Structure Decision**: 維持單一 Vue SPA。主題仍以 `src/data/themes/*.json` 為外部化資料來源，由 `src/data/index.ts` 組裝為 `cardsData`。不新增資料庫、CMS、遠端設定或 runtime 檔案掃描。

## Data And Schema Strategy

### 1. ThemeId、validThemeIds、theme 資料來源

- `src/types/index.ts`
  - 將 `VALID_THEME_IDS` 從 `['attraction', 'self', 'interaction', 'trust']` 擴充為 `['attraction', 'self', 'interaction', 'trust', 'desire'] as const`。
  - `ThemeId` 仍由 `VALID_THEME_IDS[number]` 衍生，保留路由、Store、資料組裝的編譯期保護。
  - 這不是要永久支援任意 runtime 主題，而是先移除「固定四主題」的產品假設；未來新增主題仍需明確加入型別與資料檔。
- `src/utils/theme.ts`
  - `validThemeIds` 繼續引用 `VALID_THEME_IDS`，讓 route guard 與 snapshot 驗證自動接受 `desire`。
- `src/data/index.ts`
  - 新增 `import desire from './themes/desire.json' with { type: 'json' }`。
  - `themeFiles = [attraction, self_, interaction, trust, desire]`。
  - `cardsData.themes` 與 `cardsData.cards` 繼續由 `themeFiles.map/flatMap` 組裝，避免在 View 中手寫主題清單。
- UI、測試與文件不再寫「四個主題」或「80 張卡」作為通用描述；需要提到既有主題時明確稱「既有四主題」。

### 2. Schema / contract 從固定 4 主題改成可容納第 5 主題

- `ThemeFileSchema`
  - `id` 應驗證為 `VALID_THEME_IDS` 之一，而不是任意非空字串；這可避免 `desire` 拼錯仍通過資料驗證。
  - 新增可選或必填 metadata，建議採必填以降低 UI 判斷分歧：
    - `supportsIntimateMode: boolean`
    - `contentNotice?: { zh: string; en: string }`
    - `entryNotice?: { zh: string; en: string }`
    - `badges?: Array<{ key: string; label: { zh: string; en: string } }>` 或更小的 `adultOnly: boolean`
- `Theme`
  - 加入對應 metadata；既有四主題設定 `supportsIntimateMode: true`、`adultOnly: false`。
  - `desire` 設定 `supportsIntimateMode: false`、`adultOnly: true`，並提供 preview/entry notice。
- `ThemeCardSchema`
  - 現有 regex `^[a-z]+-\d{3}-(base|intimate)$` 會強迫 desire 使用 base/intimate 語意。建議最小放寬為 `^[a-z]+-\d{3}-(base|intimate|standard)$`。
  - 既有四主題維持 `base/intimate`；`desire` 使用 `des-001-standard` 且 `isIntimate: false`。
  - 保留 `isIntimate` 欄位，避免重構 CardFace、Deck、Store 與既有資料；但加上資料驗證規則：`supportsIntimateMode === false` 的主題不得包含 `isIntimate: true`。
- contract 更新方向
  - `specs/001-love-talk-card-game/contracts/game-session.schema.json` 的 `themeId.enum` 加入 `desire`。
  - 不新增 session 欄位；成人提示是否已確認可不持久化，若需要防止重整後繞過，僅使用 route entry flow 或 session-only UI state，不寫入長期儲存。

### 3. `src/data/themes/desire.json` 與入口資料集組裝

- `desire.json` 使用與既有主題檔相同根結構：`id/name/description/colors/endMessage/cards`。
- 加入主題 metadata，最小建議：
  - `supportsIntimateMode: false`
  - `adultOnly: true`
  - `contentNotice.zh/en`
  - `entryNotice.zh/en`
- cards 使用同一張卡牌結構：
  - `id: "des-001-standard"`
  - `isIntimate: false`
  - `level: 1 | 2 | 3`
  - `text.zh/en/th/ja`
- `src/data/index.ts` 組裝時不為 desire 做特殊分支，只把 metadata 一併 map 進 `cardsData.themes`，並照現有邏輯將 `theme: 'desire'` 注入每張卡。
- `useDeck.buildDeck(themeId, allCards, intimateMode)` 應接收或查詢該主題的 `supportsIntimateMode`：
  - 支援 intimate 的既有四主題：維持現行 filter 規則。
  - 不支援 intimate 的 desire：忽略 `intimateMode`，回傳該主題全部 `standard` 卡，不顯示也不產生「雙重加辣」語意。

## UI And I18n Plan

### 4. 首頁、主題預覽、GameView、EndView、i18n 調整

- 首頁 `HomeView.vue`
  - `cardsData.themes` 已動態渲染，主要改文案：`home.description` 不再寫「四個主題」。
  - 私密模式提示需改成「適用於部分主題」或在選到 `desire` 時提示 desire 不使用私密模式。
  - 可在 `ThemeCardDeck` 上用 `theme.adultOnly` 顯示小型成人提示標記。
- `ThemeCardDeck.vue`
  - 支援 metadata badge，例如 `adultOnly` 時顯示 i18n 的「成人親密」/ "Adult intimacy" 標記。
  - 標記文字由 i18n 或 theme metadata 提供，不硬碼在元件。
- `ThemePreview.vue`
  - 若 `theme.adultOnly`，在描述下方顯示 `theme.contentNotice.zh`。
  - Start CTA 可維持同一文字，但點擊後交由 HomeView 開啟 entry notice；或在 preview 內顯示二段確認。建議 HomeView 控制，以避免 ThemePreview 承擔遊戲啟動規則。
- `GameView.vue`
  - 不建議在 GameView 才第一次提示，因為使用者已經進入路由與 session。GameView 只需處理直接 URL 進入 `/game/desire` 的情況：
    - 若無既有 desire session，先導回 HomeView 或顯示 entry notice 後才 startSession。
    - 若已有 desire session，正常恢復。
  - 最小方案：在 `HomeView.handleStart()` 對 adultOnly 主題先開啟 ConfirmModal/專用 notice；直接 URL 進入則 `GameView` 顯示同一 notice 元件後再建立 session。
- `EndView.vue`
  - 主要依 `cardsData.themes.find()` 顯示，不需特殊邏輯。
  - `desire.endMessage` 必須在 theme JSON 中提供 zh/en。
- `src/i18n/zh-TW.json` / `src/i18n/en.json`
  - 更新 `home.description`、`home.intimateModeHint`。
  - 新增成人提示共用字串：badge label、entry notice title、confirm/cancel CTA、可退出提示。
  - 若 `theme.name/description/contentNotice/entryNotice` 已在 theme JSON，i18n 只放 UI 框架文字，不重複放主題內容。

## Testing Strategy

### 5. 既有固定四主題 / 80 張卡假設與改寫方式

- `tests/unit/utils/cards-schema.test.ts`
  - 目前手動 import 四個 theme JSON，需加入 `desire`，或改由共用 `themeFiles`/`cardsData.themes` 驅動。
  - ID regex 需接受 `standard`。
  - 新增規則：`supportsIntimateMode=false` 的主題不得有 `isIntimate=true`。
- `tests/unit/stores/gameStore.test.ts`
  - 現有 `15` / `20` 可以保留於「支援 intimate 的既有四主題」測試，但名稱要避免泛稱所有主題。
  - 新增 desire 測試：不論 `intimateMode` true/false，牌組大小等於 desire cards 總數，且不含 intimate card。
- `tests/unit/stores/gameStore.intimate.test.ts`
  - 維持四主題 intimate 的 15+5 規則。
  - 新增或補充「不支援 intimate 的主題不受 intimateMode 影響」。
- `tests/unit/stores/session-snapshot.test.ts`
  - `themeId` schema enum 加入 `desire`。
  - desire snapshot 的 `deckOrder.length` 不應用 15 或 20，而應等於 `cardsData.cards.filter(c => c.theme === 'desire').length`。
- `tests/e2e/playwright/us1-core-gameplay.spec.ts`
  - `DECK_SIZE=15` 是 attraction base 流程測試，可保留，但描述要改成「attraction 非私密流程」而非通用核心所有主題。
- `tests/e2e/playwright/us2-intimate-mode.spec.ts`
  - 保留既有四主題 intimate 行為；新增 desire 開啟 intimate toggle 後仍不增加額外卡與不出現私密標記。
- `tests/e2e/playwright/us4-theme-ambiance.spec.ts`
  - 註解與 describe 的「四個主題」改成「所有主題」。
  - 目前 `THEME_IDS = cardsData.themes.map((t) => t.id)` 已接近正確，只需文案與 desire route 期待同步。
- `tests/unit/views/views.test.ts`
  - 新增 `theme-deck-desire` 渲染與 adult notice 流程。
  - 既有 startSession spy 對 attraction/self 的測試可保留。
- `tests/e2e/playwright/desire-theme.spec.ts`
  - 新增獨立 E2E：首頁看得到 desire 成人提示、preview 顯示 notice、確認後進入 `/game/desire`、結束頁正常顯示。

### 6. 測試策略是否改成每個主題驗證 base/intimate 規則

需要調整，但不是把所有主題都套同一個 15/5 規則。建議改為「依主題能力驗證」：

- 對 `supportsIntimateMode=true` 的主題：
  - base cards 數量為 15。
  - intimate cards 數量為 5。
  - intimate cards `level >= 2`。
  - `intimateMode=false` 只抽 base；`true` 抽 base + intimate。
- 對 `supportsIntimateMode=false` 的主題：
  - cards 至少 1 張，全部 `isIntimate=false`。
  - `intimateMode` true/false 產生同一張數規則。
  - UI 不顯示「私密牌」或「雙重加辣」語意。

這樣測試不再依賴固定主題數或固定總卡數，但仍保留既有四主題的產品規則。

## Content Governance

### 7. desire 主題內容邊界維護位置

- `specs/002-desire-theme/spec.md`
  - 作為功能需求與驗收標準來源，維持 FR/CB/SC。
- `docs/00-llm-card-copywriting-prompts.md`
  - 加入 desire 的卡牌發想與審查規則，方便後續 LLM 產生資料時使用。
- `.codex/skills/love-talk-card-copy-editor/references/theme-boundaries.md`
  - 加入第五主題的內容邊界，讓日後 copy review、跨主題歸類與翻譯 QA 有一致準則。
- 如產生候選卡審查紀錄，依文件治理放在 `docs/archive/`，並加上 `status: archived` 等狀態註記；仍可直接指引開發的版本保留在 `docs/`。

### 8. 成人提示訊號應由哪一層持有

成人提示的 canonical signal 應在資料層，由 theme metadata 持有：

- 資料層：`theme.adultOnly`、`theme.supportsIntimateMode`、`theme.contentNotice`、`theme.entryNotice` 是主題事實。
- i18n：持有通用 UI 框架字串，例如提示標題、確認/取消按鈕、成人標記 fallback；不作為是否成人主題的判斷來源。
- UI：只讀取資料層 metadata 決定是否顯示 badge、preview notice、entry notice；不硬碼 `theme.id === 'desire'`，除非是測試案例或資料遷移檢查。

### 9. 是否支援額外 metadata

需要，但應保持小而明確。建議第一版只新增：

```ts
interface Theme {
  supportsIntimateMode: boolean
  adultOnly: boolean
  contentNotice?: LocalizedText
  entryNotice?: LocalizedText
}
```

暫不新增泛用 `metadata: Record<string, unknown>`，避免型別保護下降。若未來需要「注意事項文案」「禁忌提醒」「建議遊玩情境」，再擴充為具名欄位，例如 `cautions?: LocalizedText[]`。

## Implementation Phases

### Phase 0 — 現況與契約確認

1. 對照 `specs/002-desire-theme/spec.md`，確認 desire 不使用 intimate split。
2. 確認目前固定點：`VALID_THEME_IDS`、`themeFiles`、`ThemeCardSchema`、i18n 首頁文案、Store/E2E 的 15/20 假設。
3. 決定 metadata 欄位名稱並更新 tests 的預期。

### Phase 1 — 資料模型與測試先行

1. 先新增/修改 Vitest：
   - theme schema 支援 `standard` card id。
   - `supportsIntimateMode=false` 主題不受 intimate mode 影響。
   - 所有 theme metadata 都完整且 zh/en 非空。
2. 更新 TypeScript 型別與 Zod schema。
3. 新增 `desire.json` 的最小可用資料與主題色。

### Phase 2 — UI 提示流程

1. 更新首頁與 preview 文案。
2. 在 theme card/preview 顯示 adult notice。
3. 建立進入前確認流程；處理直接 URL 進入 `/game/desire`。
4. 確保 EndView 不需特殊分支即可顯示 desire 結束訊息。

### Phase 3 — E2E 與內容治理補齊

1. 新增 desire E2E。
2. 更新既有四主題 intimate E2E 描述與斷言。
3. 補內容邊界文件到 `docs/00-llm-card-copywriting-prompts.md` 與 copy-editor skill reference。
4. 執行 `npm run test`、`npm run test:e2e`、`npm run build`。

## Risks And Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| UI 只用 `theme.id === 'desire'` 判斷成人提示 | 未來新增成人主題時需到處改 | 以 `adultOnly` metadata 驅動 |
| desire 使用 `isIntimate=true` | 造成「雙重加辣」或 intimate toggle 誤解 | desire 全部卡 `isIntimate=false`，並用 `supportsIntimateMode=false` 驗證 |
| 測試仍假設總數 80 | 加入第五主題後測試脆弱 | 改成依 `cardsData.themes` 與每主題能力驗證 |
| 成人提示文案散落在元件 | 難以翻譯與維護 | 主題文案放 JSON；UI 框架文案放 i18n |
| desire 邊界只寫在 spec | 後續 copy review 不會看 spec | 同步到 LLM prompts 與 copy-editor theme-boundaries |

## Complexity Tracking

無憲章違規；不需新增複雜度例外。
