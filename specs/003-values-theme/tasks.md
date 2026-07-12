# Tasks: Values Theme Technical Integration & Gameplay Flow

**Input**: [spec.md](./spec.md)、[plan.md](./plan.md)、[data-model.md](./data-model.md)、[contracts/values-theme.schema.json](./contracts/values-theme.schema.json)、[quickstart.md](./quickstart.md)
**Scope**: 第 6 主題註冊、25 張資料契約、無 intimate 分層、畫面／路由／抽牌／結束流程與技術驗證。卡牌文案內容不屬於本次 SDD 範圍。

## Format: `[ID] [P?] [Story] Description`

- **[P]**：可平行處理（不同檔案、無未完成相依）。
- **[Story]**：僅使用者故事任務標示 `[US1]` 或 `[US2]`。
- `[X]` 代表已完成且仍屬 003 技術範圍；Out of Scope 項目一律不以完成狀態計入。

## Phase 1: Setup（共用前置）

- [X] T001 確認 `003-values-theme` helper 指向正確 feature，並在 [quickstart.md](./quickstart.md) 記錄結果。
- [X] T002 盤點 types、data、validators、schema、i18n、views、tests 與文件的技術整合落點，對照 [plan.md](./plan.md)。
- [X] T003 執行基線 `npm run type-check` 與 `npm run test`，在 [quickstart.md](./quickstart.md) 記錄技術基線。

## Phase 2: Foundational（資料契約與主題識別碼）

- [X] T004 [P] 在 `tests/unit/data/values-theme-contract.test.ts` 以 AJV 驗證契約接受恰 25 張 `val-###`，並拒絕 24／26 張、錯誤 id 與缺少四語欄位的資料。
- [X] T005 [P] 在 `tests/unit/utils/cards-schema.test.ts` 驗證 `ThemeCardSchema` 接受 `val-001`，並拒絕 `val-1`、`val-0001`、`val-001-base` 與 `att-001`。
- [X] T006 在 `tests/unit/utils/cards-schema.test.ts` 驗證 `values` 卡可省略 `isIntimate`，且 `attraction` 省略時仍失敗。
- [X] T007 [P] 在 `tests/unit/data/cards-data.test.ts` 以個別主題卡數斷言保護既有四主題與 `desire` 各 20 張、values 25 張，避免共用 20／100 限制。
- [X] T008 [P] 在 `tests/unit/composables/useDeck.test.ts` 驗證 `buildDeck('values', ..., false/true)` 皆回傳同一組 25 張卡。
- [X] T009 在 `src/data/validators.ts` 接受 `val-\d{3}` 並拒絕 values 的 base／intimate 後綴。
- [X] T010 在 `src/data/validators.ts` 讓 `values` 省略 `isIntimate`，不改前四主題規則。
- [X] T011 在 `src/types/index.ts` 將 `values` 加入 `VALID_THEME_IDS`。
- [X] T012 在 `tests/unit/utils/cardsData.spec.ts` 與 `tests/unit/utils/cards-schema.test.ts` 同步 id 正則。

## Phase 3: User Story 1 - 顯示並選擇 values 主題（Priority: P1）

**Goal**: values 可由資料聚合進入首頁與主題預覽，並可開始遊戲。

**Independent Test**: 首頁／預覽 unit test 及 E2E 均可找到 values 並開始 `/game/values`。

- [X] T013 [P] [US1] 在 `tests/unit/data/values-theme.test.ts` 驗證 values 通過 `ThemeFileSchema`、總數 25、id 為 `val-001` 至 `val-025`、level 合法且無 `isIntimate`。
- [X] T014 [P] [US1] 在 `tests/unit/data/values-theme.test.ts` 驗證 25 張卡的 `text.zh`、`text.en`、`text.th`、`text.ja` 均非空（僅結構檢查）。
- [X] T015 [P] [US1] 在 `tests/unit/composables/useI18n.test.ts` 驗證 `theme.values` 所需 i18n 結構存在且非空。
- [X] T016 [P] [US1] 在 `tests/unit/components/ThemePreview.test.ts` 驗證預覽可讀取並顯示 values 的外部化主題資料，不驗收文案內容。
- [X] T017 [P] [US1] 在 `tests/unit/components/ThemeCardDeck.test.ts` 驗證首頁主題清單包含 values，且資料由既有外部化來源提供。
- [X] T018 [US1] 建立 `src/data/themes/values.json` 的 25 張結構化 values 資料、必要主題欄位與四語欄位；不以本任務驗收文案品質。
- [X] T019 [US1] 在 `src/data/index.ts` 聚合 `values.json` 至 `themeFiles`。
- [X] T020 [P] [US1] 在 `src/i18n/zh-TW.json` 新增 `theme.values` 結構並移除首頁描述的固定主題數假設。
- [X] T021 [P] [US1] 在 `src/i18n/en.json` 新增 `theme.values` 結構並移除首頁描述的固定主題數假設。
- [X] T022 [US1] 驗證 `src/views/HomeView.vue` 與 `src/components/home/ThemeCardDeck.vue` 的資料驅動流程可顯示 values。
- [X] T023 [US1] 驗證 `src/components/home/ThemePreview.vue` 可顯示 values 的外部化資料，無主題數硬編分支。

## Phase 4: User Story 2 - 完成 values 的單一牌池遊玩流程（Priority: P1）

**Goal**: values 在兩種 intimate mode 下均以相同 25 張卡完成抽牌、路由與結束流程。

**Independent Test**: store／router unit test 與完整流程 E2E 均通過；不包含任何文案內容判定。

- [X] T025 [P] [US2] 在 `tests/unit/data/values-theme.test.ts` 驗證 values 的 level 僅為 1／2／3，且不以 level 推導 intimate 或牌組篩選。
- [X] T026 [P] [US2] 在 `tests/unit/components/CardFace.test.ts` 驗證 values 卡面可依目前語言讀取四語資料，且不依賴 `isIntimate` 徽章或提示。

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: 完成首頁／預覽、抽牌與完整遊玩流程、25 張與 deckOrder、路由／結束頁、WCAG、文件治理與最終技術驗收。

- [X] T039 [P] 在 `tests/e2e/playwright/us-values-theme.spec.ts` 驗證首頁顯示 values、可開啟預覽、可進入 `/game/values` 並抽牌。
- [X] T040 [P] 在 `tests/e2e/playwright/us-values-complete-flow.spec.ts` 驗證 values 可完成 25 張遊玩流程並進入 `src/views/EndView.vue` 的 values 結束畫面。
- [X] T041 [P] 在 `tests/unit/stores/gameStore.values.test.ts` 驗證兩種 `startSession('values', intimateMode)` 的 `deckOrder` 均為相同 25 張。
- [X] T042 [P] 在 `tests/unit/router/router.test.ts` 驗證 `/game/values` 與 `/end/values` 有效，且不走 desire 成人確認守衛。
- [X] T043 [P] 在 `tests/unit/utils/wcag-contrast.test.ts` 驗證 values 的 `text`／`background`／`backgroundEnd`／`cardBack` 色票符合 WCAG AA。
- [X] T044 [P] 更新 `CLAUDE.md`、`README.md` 與其他直接指引開發的文件，使主題與卡數敘述反映第 6 主題及 values 25 張；未涉及憲章，無需同步雙語版本。
- [X] T045 掃描 `docs/` 的有效開發文件，更新與主題數／卡數現況衝突的架構與路線圖 Markdown；歷史提示與封存文件維持歷史脈絡。
- [X] T046 依 [quickstart.md](./quickstart.md) 執行 type-check、unit test、lint、build，並記錄結果。
- [X] T047 執行指定 values Playwright E2E，確認首頁、預覽、抽牌、25 張完成與結束畫面。
- [X] T048 對照 [spec.md](./spec.md) 的 SC-001 至 SC-008，於 [quickstart.md](./quickstart.md) 記錄最終技術驗收；未引用 `content-review.md`。

## Out of Scope / Not Applicable

下列任務不屬於 003 的完成度，不是未完成工作，也不標示為已完成。原因：**本功能聚焦主題註冊、25 張資料、正確抽卡與遊玩流程；卡牌文案內容不屬於本次 SDD 範圍。**

- [ ] T024 原「禁用語氣／相容性評分」內容規則測試：不納入 003。
- [ ] T027 原「撰寫四語卡牌文案」任務：不納入 003；僅保留四語欄位非空的技術契約。
- [ ] T028 原「六面向內容覆蓋」審查：不納入 003。
- [ ] T029 原「文案一致性」校對：不納入 003。
- [ ] T030 原建立 `content-review.md` 的逐張審查：不納入 003。
- [ ] T031 原 values 與其他主題的候選題分類測試：不納入 003。
- [ ] T032 原 values 與其他主題的文字邊界測試：不納入 003。
- [ ] T033 原主題邊界表與候選題乾跑：不納入 003。
- [ ] T034 原依主題邊界調整卡牌內容：不納入 003。
- [ ] T035 原逐張禁用語氣掃描：不納入 003。
- [ ] T036 原可保留／可再談語氣線索驗證：不納入 003。
- [ ] T037 原依語氣規則改寫卡牌內容：不納入 003。
- [ ] T038 原 `content-review.md` 逐張語氣審查：不納入 003。

## Dependencies & Execution Order

- Phase 1 → Phase 2 → Phase 3／Phase 4：先完成主題識別碼、validator 與資料契約，再驗證畫面與遊玩流程。
- T039～T043 可平行補齊；T046／T047 依賴其對應測試；T048 最後記錄所有技術驗收。
- T044／T045 可與測試撰寫平行，但必須在 T048 前完成。
- T024、T027～T038 沒有 003 相依關係，亦不得阻塞 Phase 7。

## Implementation Strategy

1. 已完成的 Phase 1～4 提供主題註冊、資料結構與單一牌池基礎。
2. 完成 Phase 7 的 store／router／WCAG／E2E 與品質關卡，證明 values 可完整遊玩。
3. 將卡牌創作、潤稿、翻譯品質與內容邊界留給後續一般 Plan 模式，不走 Speckit SDD。
