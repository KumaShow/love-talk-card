# Tasks: Values & Future Theme

**Input**: Design documents from `/specs/003-values-theme/`
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: 本專案憲章強制 TDD。每個會改變契約、型別、資料規則、資料內容、i18n 或使用者流程的任務，皆先寫可失敗的契約 / 型別 / 資料驗證 / 單元測試，再做實作，最後才做 UI 與整合驗證。

**Organization**: 任務依 Phase 與 User Story 分組，並支撐落地順序：先讓資料規則支援 `values` 25 張，再補 `values` 內容與四語文案，再接首頁 / 主題預覽 / 遊戲流程 / 結束畫面，最後驗證完整遊玩流程與內容邊界。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可平行執行（不同檔案、無相依）
- **[Story]**: 所屬使用者故事（US1-US4）；Setup / Foundational / Polish 不加故事標籤
- 描述須包含檔案類型與精確檔案路徑

## Path Conventions

單一 Vue SPA：原始碼於 `src/`，測試於 `tests/`，Spec Kit 文件於 `specs/003-values-theme/`。路徑別名 `@/* -> src/*`。

---

## Phase 1: Setup（共用前置）

**Purpose**: 確認 `003-values-theme` 的實作基線、現有檔案落點與 hooks 狀態。

- [X] T001 確認 `003-values-theme` helper 指向正確 feature：執行 `.specify/scripts/powershell/setup-tasks.ps1 -Json`，確認 `FEATURE_DIR` 為 `specs/003-values-theme`，並在 [specs/003-values-theme/quickstart.md](./quickstart.md) 驗收區記錄結果。
- [X] T002 盤點受影響檔案落點（types / constants、data / themes / validators、schema / contracts、i18n、views / components、unit tests / e2e tests、docs / content rules），對照 [specs/003-values-theme/plan.md](./plan.md) §Project Structure 確認檔案存在或將新增。
- [X] T003 執行基線驗證 `npm run type-check` 與 `npm run test`，將目前測試狀態與覆蓋率摘要記錄於 [specs/003-values-theme/quickstart.md](./quickstart.md) 的驗收清單。

---

## Phase 2: Foundational（阻塞性前置：契約 / 型別 / 資料規則）

**Purpose**: 先以 TDD 放寬 values 所需的最小資料規則，讓 `val-###`、25 張單一牌池、`isIntimate` 省略與非固定 20 張假設成為可驗證的共用基礎。

**CRITICAL**: 本階段完成前，不得開始 `values.json` 內容、i18n 或 UI 整合。

- [X] T004 [P] 新增 schema / contracts 測試：以 AJV 驗證 [specs/003-values-theme/contracts/values-theme.schema.json](./contracts/values-theme.schema.json) 接受 25 張 `val-###` 且拒絕 24 / 26 張、`val-001-base`、缺四語文案的測試資料，測試放在 `tests/unit/data/values-theme-contract.test.ts`。
- [X] T005 [P] 擴充 unit tests：在 `tests/unit/utils/cards-schema.test.ts` 新增 `ThemeCardSchema` 接受 `val-001` 並拒絕 `val-1`、`val-0001`、`val-001-base`、`att-001` 的紅燈測試。
- [X] T006 擴充 unit tests：在 `tests/unit/utils/cards-schema.test.ts` 新增 `ThemeFileSchema` 接受 `id: "values"` 且所有卡省略 `isIntimate` 的紅燈測試，並保留 `attraction` 省略 `isIntimate` 仍失敗的既有行為。（與 T005 共動 `cards-schema.test.ts`，須接續 T005、不可平行，故不標 [P]）
- [X] T007 [P] 擴充 unit tests：在 `tests/unit/data/cards-data.test.ts` 新增「逐主題個別斷言卡數」的紅燈測試（主題無 declared-count 欄位，卡數即各自 `cards` 陣列長度，執行期亦無全站卡數常數）：明確驗證既有四主題各 20 張、`desire` 20 張、未來 `values` 25 張，且不得以全站 100 張或每主題 20 張的共用常數阻擋（對齊 F7）。
- [X] T008 [P] 擴充 unit tests：在 `tests/unit/composables/useDeck.test.ts` 新增 `buildDeck('values', allCards, false)` 與 `buildDeck('values', allCards, true)` 都回傳同一組 25 張 `values` 卡的紅燈測試，驗證 values 不走 intimateMode / `isIntimate` 過濾。
- [X] T009 演進 data / themes / validators：在 `src/data/validators.ts` 將卡牌 id 正則放寬為接受 `val-\d{3}`，並拒絕 `val-###-{base|intimate}` 後綴；只修改 values 所需最小規則。
- [X] T010 演進 data / themes / validators：在 `src/data/validators.ts` 的 `ThemeFileSchema.superRefine` 將 `values` 與 `desire` 一樣豁免 `isIntimate` 必填，且不移除前四主題 intimate 規則。
- [X] T011 演進 types / constants：在 `src/types/index.ts` 的 `VALID_THEME_IDS` 加入 `'values'`，讓 `ThemeId`、`isValidThemeId`、router guard 與資料聚合可共同接受第 6 主題。
- [X] T012 同步 unit tests：在 `tests/unit/utils/cardsData.spec.ts` 與 `tests/unit/utils/cards-schema.test.ts` 同步內嵌 id 正則，確保全資料掃描接受 `des-###`、`val-###` 與既有 `{prefix}-###-{base|intimate}`。（因與 T005 / T006 共動 `cards-schema.test.ts`，不與其平行，故不標 [P]）

**Checkpoint**: 共用 schema / 型別 / validator 已可承接 `values` 25 張、`val-###`、省略 `isIntimate`，且既有五主題規則不退化。

---

## Phase 3: User Story 1 - 把 values 理解為「價值觀與未來」主題（Priority: P1）MVP

**Goal**: 首頁與主題預覽能顯示第 6 主題 `values`，使用者在開始遊戲前可辨識這是價值選擇與共同未來的主題，且與 self / interaction / trust / desire 明確區隔。

**Independent Test**: 不需開始遊戲即可在首頁與主題預覽看到 `values` 名稱、簡述與「在生活選擇裡看見彼此靈魂共振」記憶點；資料驗證確認 `values` 25 張可被聚合為第 6 主題。

### Tests for User Story 1（先寫，確保 Red）

- [X] T013 [P] [US1] 新增 data / themes 單元測試：`tests/unit/data/values-theme.test.ts` 驗證 `src/data/themes/values.json` 通過 `ThemeFileSchema`、總數恰 25、id 為 `val-001` 至 `val-025`、`level` 只為 1/2/3、所有卡省略 `isIntimate`。
- [X] T014 [P] [US1] 新增 data / themes 單元測試：在 `tests/unit/data/values-theme.test.ts` 驗證 25 張 values 卡的 `text.zh`、`text.en`、`text.th`、`text.ja` 皆非空（結構檢查）。`zh` / `en` 之真實文案（非 placeholder）驗證移至 US2 的 T024，避免 US1 MVP 依賴 US2 內容（見 F4）。
- [X] T015 [P] [US1] 新增 i18n 單元測試：在 `tests/unit/composables/useI18n.test.ts` 驗證 `theme.values.name`、`theme.values.englishShortName`、`theme.values.description` 於 `src/i18n/zh-TW.json` 與 `src/i18n/en.json` 皆存在且非空。**來源界定（F2）**：預覽實際渲染的是 `zh-TW.json` 的 `theme.values.englishShortName`（必備）；`name` / `description` 於 i18n 僅為結構對齊，values 名稱／描述／記憶點的單一真實來源為 `src/data/themes/values.json`（見 T016 / T023 / T029）。
- [X] T016 [P] [US1] 擴充 components 單元測試：在 `tests/unit/components/ThemePreview.test.ts` 驗證 values 預覽顯示價值排序、金錢與安全感、家庭與親密邊界、生活方向、承諾與未來、社交與邊界的精神，並顯示靈魂共振記憶點（來源為 `src/data/themes/values.json` 的 `description.zh`，即 `ThemePreview` 實際渲染欄位）。
- [X] T017 [P] [US1] 擴充 components 單元測試：在 `tests/unit/components/ThemeCardDeck.test.ts` 驗證首頁主題清單包含第 6 主題 values，且名稱 / 簡述可從 i18n 與主題資料外部化取得。

### Implementation for User Story 1

- [X] T018 [US1] 新增 data / themes：建立 `src/data/themes/values.json`，含 `id: "values"`、雙語 `name` / `description` / `endMessage`、6 個 hex 色票、25 張 `val-001` 至 `val-025` 卡、四語 `text`、`level` 1/2/3，且不寫入 `isIntimate`。
- [X] T019 [US1] 演進 data / themes：在 `src/data/index.ts` import `src/data/themes/values.json` 並加入 `themeFiles`，使 `cardsData.themes` 與 `cardsData.cards` 自動聚合 values。
- [X] T020 [P] [US1] 演進 i18n：在 `src/i18n/zh-TW.json` 新增 `theme.values` 的 `name`、`englishShortName`、`description`，並將 `home.description` 中「五個主題」改為不硬編主題數的繁中文案。
- [X] T021 [P] [US1] 演進 i18n：在 `src/i18n/en.json` 新增 `theme.values` 的 `name`、`englishShortName`、`description`，並將 `home.description` 中 `five relationship themes` 改為不硬編主題數的英文文案。
- [X] T022 [US1] 驗證 views / components：確認 `src/views/HomeView.vue` 與 `src/components/home/ThemeCardDeck.vue` 以 `cardsData.themes` / i18n 資料驅動顯示 values；若發現主題數硬編，改為資料驅動並保留 Tailwind v4 utility-first。
- [X] T023 [US1] 驗證 views / components：確認 `src/components/home/ThemePreview.vue` 對 values 使用外部化文案——主題描述取自 `values.json` 的 `description.zh`（實際渲染欄位）、英文短名取自 i18n `theme.values.englishShortName`；若發現 hardcoded 主題分支，改為資料驅動。

**Checkpoint**: US1 可獨立驗證為 MVP：第 6 主題已註冊、資料通過 25 張規則、首頁名稱與主題預覽能辨識 values 定位（記憶點於預覽呈現）。

---

## Phase 4: User Story 2 - 在首頁、預覽與卡面理解價值選擇與未來想像（Priority: P2）

**Goal**: values 的首頁文案、主題預覽與 25 張卡面題目一致傳達「價值選擇與未來想像」，卡牌語氣是邀請分享與想像，而非測驗、審判或相容性評分。

**Independent Test**: 檢查 `values.json` 與 i18n 即可驗證 25 張四語文案完整、zh/en 語氣一致，首頁 / 預覽 / 卡面三層文案不漂移。

### Tests for User Story 2（先寫，確保 Red）

- [X] T024 [P] [US2] 新增 content rules 單元測試：在 `tests/unit/data/values-theme.test.ts` 驗證 25 張 values 卡 `text.zh` / `text.en` 為真實文案（非 placeholder，承接自 T014 移出的斷言），且不含相容性分數、對錯評分、命令伴侶改變、逼迫表態等禁用措辭關鍵字（禁用字集與 T035 共用同一常數，見 F8）。
- [X] T025 [P] [US2] 新增 content rules 單元測試：在 `tests/unit/data/values-theme.test.ts` 驗證 values 卡 `level` 1/2/3 皆有分布，且測試不以 level 推導 intimate 或敏感題材分類。
- [X] T026 [P] [US2] 擴充 card UI 單元測試：在 `tests/unit/components/CardFace.test.ts` 驗證 values 卡面可顯示四語文字來源中的目前語言文案，且不依賴 `isIntimate` 徽章或 intimate 提示。

### Implementation for User Story 2

- [X] T027 [US2] 撰寫 data / themes 四語卡牌文案：完成 `src/data/themes/values.json` 25 張 values 卡，`zh` / `en` 為真實文案，`th` 比照現況填入可用文案或既有 placeholder 策略，`ja` 依既有模式以英文鏡射佔位。
- [X] T028 [US2] 校對 data / themes 內容覆蓋：在 `src/data/themes/values.json` 確認六面向皆有覆蓋（價值排序、金錢與安全感、家庭與親密邊界、生活方向、承諾與未來、社交與邊界），總數 25 為唯一硬檢，逐面向 4/4/4/4/4/5 僅作 ±1 規劃目標。
- [X] T029 [US2] 校對文案一致性：values 名稱與「靈魂共振」記憶點的權威來源為 `src/data/themes/values.json`（`description`，預覽渲染）；校對 `src/i18n/zh-TW.json`、`src/i18n/en.json` 的 `theme.values.name` / `englishShortName` 與 `home.description` 一致傳達「價值觀與未來」且無硬編主題總數。首頁主題卡僅顯示名稱（不含描述），故記憶點一致性以 `values.json` 與預覽為準（對齊 F1 / F2）。
- [X] T030 [US2] 建立 docs / content rules 審查記錄：新增 `specs/003-values-theme/content-review.md`，逐張記錄 25 張 values 卡通過「非審判、非測驗、允許差異、可保留、可再談」檢查。

**Checkpoint**: values 25 張卡牌與四語文案已可支撐卡面體驗，且首頁 / 預覽 / 卡面語氣一致。

---

## Phase 5: User Story 3 - 依主題邊界一致判斷題目歸屬（Priority: P3）

**Goal**: 內容維護者能以明確邊界判斷 values 與 self / interaction / trust / desire 的差異，避免 values 與其他主題過度重疊或變成所有認真話題的集合。

**Independent Test**: 透過內容歸類清單與候選題乾跑，可達成至少 90% 可一致分類。

### Tests for User Story 3（先寫，確保 Red）

- [ ] T031 [P] [US3] 新增 docs / content rules 驗證：在 `tests/unit/data/values-content-boundary.test.ts` 建立候選題分類測試資料，驗證 self / interaction / trust / desire / values 的代表題能依主要對話任務被歸入正確主題。
- [ ] T032 [P] [US3] 新增 data / themes 邊界測試：在 `tests/unit/data/values-content-boundary.test.ts` 驗證 `src/data/themes/values.json` 的 25 張卡不含成人身體親密協商、信任修復主軸、自我內省主軸或日常互動分工主軸的明顯越界措辭。

### Implementation for User Story 3

- [ ] T033 [US3] 完成 docs / content rules：在 `specs/003-values-theme/content-review.md` 加入 values vs self / interaction / trust / desire 的邊界表與候選題乾跑結果，記錄至少 90% 可一致分類。
- [ ] T034 [US3] 調整 data / themes 邊界：依 T031 / T032 結果微調 `src/data/themes/values.json` 中過度貼近 self / interaction / trust / desire 的題目，保留 values 的主要任務為共同價值取捨與未來對齊。

**Checkpoint**: values 內容邊界可操作，且 25 張初版卡不與其他主題過度重疊。

---

## Phase 6: User Story 4 - 以溫和、非審判語氣觸及底線與不可妥協議題（Priority: P4）

**Goal**: values 可以談金錢、安全感、家庭、是否要小孩、社交邊界與不可妥協原則，但語氣不變成審判、測驗或逼迫表態。

**Independent Test**: 每張 values 卡皆通過語氣審查；使用者可以保留、暫停或改天再談，不會被要求分出對錯或相容分數。

### Tests for User Story 4（先寫，確保 Red）

- [ ] T035 [P] [US4] 新增 content rules 單元測試：在 `tests/unit/data/values-tone.test.ts` 以 values 25 張卡跑禁用語氣掃描，拒絕「你應該」「證明」「分數」「正確答案」「必須接受」等審判或測驗式表述。**去重（F8）**：禁用字集抽為單一共用常數（如 `tests/unit/data/values-forbidden-phrases.ts`），供 T024 與 T035 共同引用，避免兩處清單分歧。
- [ ] T036 [P] [US4] 新增 content rules 單元測試：在 `tests/unit/data/values-tone.test.ts` 驗證觸及底線 / 不可妥協議題的 values 卡含有允許差異、可保留或可再談的語氣線索。

### Implementation for User Story 4

- [ ] T037 [US4] 調整 data / themes 語氣：依 T035 / T036 結果改寫 `src/data/themes/values.json` 中金錢、安全感、家庭、承諾、社交邊界與不可妥協題目，使其溫和、非審判、非測驗。
- [ ] T038 [US4] 更新 docs / content rules 審查：在 `specs/003-values-theme/content-review.md` 逐張標記 US4 語氣檢查結果，確認 25/25 張通過。

**Checkpoint**: values 可觸及深層議題，但不以對錯、評分或逼迫立場破壞安全感。

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: 完成首頁、主題預覽、遊戲流程、結束畫面與既有主題回歸驗證；同步目前仍會直接指引開發的文件。

- [ ] T039 [P] 新增 e2e tests：在 `tests/e2e/playwright/us-values-theme.spec.ts` 驗證首頁顯示 values、主題預覽顯示 values 記憶點、進入 `/game/values` 可看到 values 卡面、抽牌流程可進行。
- [ ] T040 [P] 新增 e2e tests：在 `tests/e2e/playwright/us-values-complete-flow.spec.ts` 驗證 values 可完成 25 張遊玩流程並進入 `src/views/EndView.vue` 對應的 values 結束畫面文案。
- [ ] T041 [P] 擴充 unit tests：在 `tests/unit/stores/gameStore.test.ts` 或新增 `tests/unit/stores/gameStore.values.test.ts` 驗證 `startSession('values', false)` 與 `startSession('values', true)` 的 `deckOrder` 皆為 25 張，且 `intimateModeAtStart` 不會讓 values 增減牌。
- [ ] T042 [P] 擴充 router / views 測試：在 `tests/unit/router/router.test.ts` 或 `tests/unit/router/index.spec.ts` 驗證 `/game/values` 與 `/end/values` 是有效主題路由，且不走 desire 成人確認守衛。
- [ ] T043 [P] WCAG 色彩驗證：在 `tests/unit/utils/wcag-contrast.test.ts` 加入 values 色票組合，驗證 `src/data/themes/values.json` 的 `text` / `background` / `backgroundEnd` / `cardBack` 對比達 WCAG AA。
- [ ] T044 [P] 文件治理：更新 `CLAUDE.md` 中固定「100 張 / 5 主題 × 20 張」敘述，以及 `README.md`（repo 根，現仍為「80 張 / 4 主題 × 20 張」，見 F6），改為 6 主題、values 25 張、每主題以自身宣告張數為準；若發現 `.specify/memory/constitution_zh-tw.md` 有硬編數字，依 AGENTS.md 同步翻譯回 `.specify/memory/constitution.md`（實測未硬編，預期免改）。
- [ ] T045 文件治理：掃描 `docs/` 仍可直接指引開發的 Markdown，更新或封存與「5 主題 / 100 張 / 每主題 20 張」衝突的文件；若移入 `docs/archive/`，在檔首補 `status: archived`、`reason`、`superseded_by`。
- [ ] T046 執行整合驗證：依 [specs/003-values-theme/quickstart.md](./quickstart.md) 跑 `npm run type-check`、`npm run test`、`npm run lint`、`npm run build`，並記錄結果。
- [ ] T047 執行 e2e 驗證：跑 `npx playwright test tests/e2e/playwright/us-values-theme.spec.ts tests/e2e/playwright/us-values-complete-flow.spec.ts`，確認首頁、主題預覽、遊戲流程與結束畫面的 values 顯示皆通過。
- [ ] T048 對照 [specs/003-values-theme/spec.md](./spec.md) Success Criteria SC-001-SC-008 與 [specs/003-values-theme/content-review.md](./content-review.md)，逐項確認達成並在 [specs/003-values-theme/quickstart.md](./quickstart.md) 補上最終驗收記錄。

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 Setup**: 無相依，可立即開始。
- **Phase 2 Foundational**: 依賴 Setup，阻塞所有 User Story；必須先完成契約 / 型別 / validator / 卡數規則 / intimate 過濾測試。
- **Phase 3 US1 (P1)**: 依賴 Foundational；建立 values 資料、i18n 與首頁 / 預覽可識別的 MVP。
- **Phase 4 US2 (P2)**: 依賴 US1 的 values 資料檔；補齊 25 張四語文案與首頁 / 預覽 / 卡面一致性。
- **Phase 5 US3 (P3)**: 依賴 US2 的候選內容；可與 US4 部分平行，但最終改稿需合併審查。
- **Phase 6 US4 (P4)**: 依賴 US2 的真實內容；聚焦底線題與語氣安全。
- **Phase 7 Polish**: 依賴目標 User Stories 完成後執行全量驗證與文件治理。

### Key Dependency Chain

- T004-T008 -> T009-T012：先紅燈測試，再放寬 validator / 型別 / 測試 regex。
- T011 + T018 + T019 -> T013-T017：types / data 註冊後，values 主題與 UI 測試才能轉綠。
- T018 -> T027-T030：先建立 25 張 values 資料，再補四語真實內容與內容審查。
- T027-T030 -> T031-T038：內容完整後才能做主題邊界與語氣審查。
- T039-T043 -> T046-T048：首頁 / 預覽 / 遊戲 / 結束畫面與 store / router 驗證完成後，再跑全量整合。

### Parallel Opportunities

- T004、T005、T007、T008 可平行撰寫（分屬 contract、schema、cards-data、useDeck 測試）；T006 與 T012 因與 T005 共動 `tests/unit/utils/cards-schema.test.ts`，須接續、不可與 T005 平行。
- T020 與 T021 可平行處理 zh-TW / en i18n。
- T024-T026 可平行撰寫內容、level、卡面顯示測試。
- T031-T032 與 T035-T036 可由內容審查與語氣審查分工平行。
- T039-T043 可平行補 e2e、store、router、WCAG 測試。

---

## Parallel Example: User Story 1

```text
Task: "T013 [US1] 新增 tests/unit/data/values-theme.test.ts 的 25 張 / val-### / 無 isIntimate 測試"
Task: "T015 [US1] 新增 tests/unit/composables/useI18n.test.ts 的 theme.values zh-TW / en 測試"
Task: "T016 [US1] 擴充 tests/unit/components/ThemePreview.test.ts 的 values 預覽測試"
Task: "T017 [US1] 擴充 tests/unit/components/ThemeCardDeck.test.ts 的首頁 values 顯示測試"
```

## Parallel Example: User Story 2

```text
Task: "T024 [US2] 新增 values 禁用語氣 / 相容性評分掃描測試"
Task: "T025 [US2] 新增 values level 分布且不作 intimate 推導的測試"
Task: "T026 [US2] 擴充 CardFace values 卡面顯示測試"
```

---

## Implementation Strategy

### MVP First（先完成 US1）

1. 完成 Phase 1 Setup。
2. 完成 Phase 2 Foundational：契約 / 型別 / validator / 卡數規則 / values 不走 intimate 過濾。
3. 完成 Phase 3 US1：`values` 第 6 主題註冊、25 張資料骨架、zh-TW / en 主題文案、首頁名稱與預覽可辨識。
4. **STOP and VALIDATE**：只驗證 US1 時，首頁名稱與主題預覽已能看出 values 是「價值觀與未來」，資料規則已支援 25 張（真實卡文於 US2 完成）。

### Incremental Delivery

1. Foundational -> 資料規則支援 `values` 25 張。
2. US1 -> values 主題可見且可被辨識。
3. US2 -> 25 張四語卡牌文案完成，首頁 / 預覽 / 卡面語氣一致。
4. US3 -> 內容邊界不與 self / interaction / trust / desire 過度重疊。
5. US4 -> 底線與不可妥協議題通過溫和、非審判語氣審查。
6. Polish -> 首頁、主題預覽、遊戲流程、結束畫面與全量測試完成。

## Notes

- 每個任務以一次 commit 可完成為原則；若任務內發現超出範圍的新重構，另開後續任務。
- 所有程式碼註解使用繁體中文；所有使用者可見文字外部化到 `src/i18n/*.json` 或 `src/data/themes/values.json`。
- Tailwind v4 utility-first；若 UI 實作需要樣式調整，避免 BEM，僅保留難以 utility 表達的單一語義 scoped class。
- 本功能不做 Mix 牌堆、不移除前四主題 intimate 模式、不重新命名既有卡牌 id。
