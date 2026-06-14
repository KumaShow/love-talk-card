# Tasks: Desire Theme

**Input**: Design documents from `/specs/002-desire-theme/`
**Prerequisites**: [plan.md](./plan.md)（必要）、[spec.md](./spec.md)（user stories）、[research.md](./research.md)、[data-model.md](./data-model.md)、[contracts/](./contracts/)、[quickstart.md](./quickstart.md)

**Tests**: 本專案憲章強制 TDD（Red→Green→Refactor，新增 composable/store/schema 先寫失敗測試），故任務清單包含測試任務，且測試任務排在對應實作之前。

**Organization**: 任務依使用者故事分組，使每個故事可獨立實作與驗證。`desire` 為**加法**整合進既有 Vue 3 + Pinia 靜態資料架構，既有四主題與 intimate 模式行為完全不變。

## Format: `[ID] [P?] [Story] Description`

- **[P]**：可平行執行（不同檔案、無相依）
- **[Story]**：所屬使用者故事（US1–US4）；無標記者為 Setup / Foundational / Polish
- 描述含精確檔案路徑

## Path Conventions

單一 Vue SPA：原始碼於 `src/`、測試於 `tests/`（`tests/unit/`、`tests/e2e/playwright/`）。路徑別名 `@/* → src/*`。

---

## Phase 1: Setup（共用前置）

**Purpose**: 確認工作基線，建立後續可定位的檔案落點。

- [X] T001 確認 `002-desire-theme` 分支測試基線為綠燈：執行 `npm run test`、`npm run type-check`，記錄目前覆蓋率（整體 ≥ 80%、`composables`/`stores` ≥ 95%）作為演進前基準。
- [X] T002 對照 [plan.md](./plan.md) §Project Structure 確認受影響檔案落點（NEW：`src/data/themes/desire.json`、`src/components/ui/AdultContentNotice.vue`、desire 暫態確認 helper（`src/router/index.ts` 內或小型 helper 模組）、相關測試檔；MODIFY：`src/types/index.ts`、`src/data/validators.ts`、`src/data/index.ts`、`src/stores/gameStore.ts`、`src/i18n/{zh-TW,en}.json`、`src/router/index.ts`、`src/views/HomeView.vue`、`src/components/home/ThemePreview.vue`）。

Phase 1 基線記錄（2026-06-09）：
- `type-check`：通過（以 `vue-tsc --noEmit` 執行）
- `test`：27 個測試檔、159 個測試皆通過
- 覆蓋率：Statements 93.94%、Branches 86.99%、Functions 91.66%、Lines 94.71%
- 關鍵門檻：`src/composables` 99.3% / 98.11% / 100% / 100%，`src/stores` 100% / 95.23% / 100% / 100%
- 受影響檔案落點已確認存在；`src/data/themes/desire.json`、`src/components/ui/AdultContentNotice.vue` 與對應 desire 測試檔為後續新增目標

---

## Phase 2: Foundational（阻塞性前置）⚠️ 先於所有 User Story

**Purpose**: 落實 Clarify Q1 / research R-004 的**共用卡牌 schema/型別演進**——`isIntimate` 改選填、卡牌 id 正規式放寬。這是 `desire.json` 能通過驗證的前提，所有 User Story 皆依賴此階段。

**⚠️ CRITICAL**: 本階段完成前，任何 User Story 都不能開始。

- [X] T003 [P] 在 `tests/unit/utils/cards-schema.test.ts` 新增**失敗測試（Red）**：以 `ThemeCardSchema` 直接驗證一張 `des-001` 形狀卡牌（`level`、四語系 `text`、**省略 `isIntimate`**）應 `success === true`；並驗證放寬後的 id 正規式仍拒絕非法 id（如 `Des-1`、`des-01`、`des-0001`）。此時應為紅燈。
- [X] T004 演進 `src/data/validators.ts`：`ThemeCardSchema.isIntimate` 改為 `z.boolean().optional()`；id 正規式由 `/^[a-z]+-\d{3}-(base|intimate)$/` 調整為 `/^(des-\d{3}|(?!des-)[a-z]+-\d{3}-(base|intimate))$/`（`des-NNN` 僅供 desire 使用；既有四主題仍必須保留 `*-base`/`*-intimate` 後綴）。
- [X] T005 演進 `src/types/index.ts`：`Card.isIntimate` 改為 `isIntimate?: boolean`（既有四主題卡維持顯式布林；desire 卡省略）。**註**：`VALID_THEME_IDS` 加入 `'desire'` 留待 US1（與 `desire.json` 同時落地，避免懸空 union 成員）。
- [X] T006 同步調整**兩處**測試的硬編碼 id 正規式為 `/^(des-\d{3}|(?!des-)[a-z]+-\d{3}-(base|intimate))$/`：(a) `tests/unit/utils/cards-schema.test.ts` 既有「所有卡牌 ID 符合 …base|intimate 格式」測試；(b) `tests/unit/utils/cardsData.spec.ts:15`「所有卡牌都應具備合法 ID 與完整四語言文字」測試（此處同時掃四語系，是 desire 卡四語系的真正守門員）。既有四主題卡仍符合調整後 pattern；執行 `npx vitest run tests/unit/utils/cards-schema.test.ts tests/unit/utils/cardsData.spec.ts` 轉綠（Green）。

**Checkpoint**: 共用 schema/型別已可承接 `des-NNN`、無 `isIntimate` 的卡牌；既有四主題驗證不受影響。User Story 可開始。

---

## Phase 3: User Story 1 - 將 desire 理解為成人親密主題 (Priority: P1) 🎯 MVP

**Goal**: 首頁出現第 5 個主題 `desire`，使用者在進入前能透過名稱、簡述、預覽提示與**進入前攔截式確認**辨識其為成人親密主題；確認後才載入遊戲，且可隨時返回、每次進入皆需重新確認。所有進入路徑（首頁卡堆、預覽 CTA、深連結／重整）一致受攔截，且 desire session 的 `intimateModeAtStart` 恆為 `false`（SC-009）。

**Independent Test**: 啟動 `npm run dev`，首頁可見第 5 主題 desire；選擇 desire 出現攔截式成人內容確認（含年齡聲明、繼續、返回）；確認後進入 `/game/desire`；返回鈕可退出留在首頁；**直連 `/game/desire`（未確認）被導回首頁並自動開啟 notice**；即使先開啟 intimate 模式，進入 desire 後內容與牌數不變。

### Tests for User Story 1（先寫，確保 Red）⚠️

- [X] T007 [P] [US1] 新增 `tests/unit/data/desire-theme.test.ts`：`desire.json` 通過 `ThemeFileSchema`；恰 **20 張**卡；**無任何 `isIntimate === true`**；所有 id 符合 `^des-\d{3}$`；每張卡四語系 `zh`/`en`/`th`/`ja` 皆非空（對應 contracts/desire-theme.schema.json）。
- [X] T008 [P] [US1] 新增 `tests/unit/components/AdultContentNotice.test.ts`：未確認時不發出導航事件；完成年齡聲明確認後發出「繼續」事件；「返回」/backdrop/ESC 發出關閉事件且不導航；標題／內文／年齡聲明／按鈕文字全部取自 i18n（無硬碼）；確認與返回鈕觸控目標 ≥ 44×44px。
- [X] T009 [P] [US1] 新增 `tests/unit/router/desire-guard.test.ts`：導航至 `/game/desire` 且暫態確認旗標未設定（`consumeDesireAcknowledgement()` 回傳 false）時，守衛應重導 `home` 且 redirect 帶 `query.notice='desire'`（供 HomeView 開啟 notice）；**驗證 `query.notice='desire'` 本身不被視為已確認**（僅 `acknowledgeDesireOnce()` 設定旗標後才放行）；放行後旗標被消費（再次進入需重新確認）；既有四主題與其他路由不受守衛新分支影響。
- [X] T010 [P] [US1] 新增 `tests/unit/stores/gameStore.desire.test.ts`：**鎖死 SC-009 / data-model §6**——`startSession('desire', true)` 後 `intimateModeAtStart === false` 且 `deck` 仍為 20 張（desire 牌組不因傳入 intimate 而改變）；既有四主題 `startSession('attraction', true)` 行為不變（`intimateModeAtStart === true`、20 張含 5 張 intimate）。此測試模擬「深連結守衛放行後／restore 失敗 fallback」會走到的 `startSession` 路徑（即 GameView `ensureSession` 以 `settingsStore.intimateMode` 啟動 desire 的情境）。此時應為紅燈。
- [X] T011 [P] [US1] 在既有 `tests/unit/components/ThemePreview.test.ts` 新增 desire 案例：預覽主題為 desire 時顯示成人內容提示、且提示文案取自 i18n（無硬碼）；預覽主題為非 desire（如 attraction）時**不**顯示該提示。此時應為紅燈。

### Implementation for User Story 1

- [X] T012 [US1] 在 `src/types/index.ts` 將 `'desire'` 加入 `VALID_THEME_IDS`（衍生 `ThemeId`、`utils/theme.ts` 的 `validThemeIds`、`isValidThemeId`、router 守衛自動涵蓋 `/game/desire`、`/end/desire`）。
- [X] T013 [US1] 新增 `src/data/themes/desire.json`：`id: "desire"`、雙語 `name`/`description`/`endMessage`（成人親密定位、尊重語氣）、research R-002 六色票（`#7A2E4A`/`#B5546F`/`#2A1620`/`#3E1E2E`/`#F7E9EF`/`#5C2238`）、20 張 `des-001`…`des-020`（**先放佔位文案**，四語系皆非空、`level` 1–3、不含 `isIntimate`；真實內容於 US4 補實）。
- [X] T014 [US1] 在 `src/data/index.ts` `import desire from './themes/desire.json'` 並加入 `themeFiles` 陣列（cardsData 自動聚合 desire 主題與卡牌；`cardsData.spec.ts` 的全資料掃描自動涵蓋 desire 卡）。
- [X] T015 [US1] 在 `tests/unit/utils/cards-schema.test.ts` 的 `themeFiles` 陣列加入 `desire`，使其納入 `ThemeFileSchema` 驗證；執行 T007 與本檔測試轉綠（Green）。
- [X] T016 [P] [US1] `src/i18n/zh-TW.json`：新增 `theme.desire.{name,description}`、`home` 區 desire 預覽提示鍵、`notice.adult.{title,body,ageConfirm,continue,back}`（對應 contracts/adult-content-notice.md）；並更新 `home.description`／`home.startHint` 等「四個主題」字樣以涵蓋第 5 主題。
- [X] T017 [P] [US1] `src/i18n/en.json`：鏡像 T016 全部新增／更新鍵的英文版（FR-008/SC-004：核心 UI 與主題文案須 zh+en 齊備）。
- [X] T018 [US1] 新增 `src/components/ui/AdultContentNotice.vue`：攔截式 overlay，含標題／內文／年齡聲明確認／繼續／返回（全走 i18n）；發出 `confirm`/`dismiss` 事件；焦點管理、ESC 等同返回、backdrop 可關閉；確認鈕為主色 CTA、返回鈕次要，皆 `min-h-[44px]`（樣式遵循 Tailwind utility-first，僅難以表達者用單一語義 class 於 `<style scoped>`）。使 T008 轉綠。
- [X] T019 [US1] 在 `src/router/index.ts`（或同層小型 helper 模組）建立並**明確匯出**desire 暫態確認 API：`acknowledgeDesireOnce()`（設定模組級暫態旗標為 true，不寫入任何 storage）與 `consumeDesireAcknowledgement(): boolean`（讀取後立即重置）。`beforeEach` 中當 `to.name === 'game'` 且 `themeId === 'desire'` 時，呼叫 `consumeDesireAcknowledgement()`：為 true 才放行，否則重導 `{ name: 'home', query: { notice: 'desire' } }`（對齊 contract「導向首頁並開啟 notice」）。**`query.notice` 僅用於觸發 HomeView 開 notice，不得作為確認依據**（守衛只認 `consumeDesireAcknowledgement()`）。使 T009 轉綠。
- [X] T020 [US1] 在 `src/stores/gameStore.ts` `startSession` 鎖死 desire 的 intimate 固化：當 `nextThemeId === 'desire'` 時，無論傳入值為何，皆以 `intimateMode = false` 建牌與固化 `intimateModeAtStart`（單一真實來源，使 HomeView 確認、守衛放行後、`GameView.ensureSession` 以 `settingsStore.intimateMode` fallback、restore 失敗重啟等所有路徑皆恆為 false，符合 data-model §6 / SC-009）。使 T010 轉綠。
- [X] T021 [US1] 在 `src/views/HomeView.vue` 整合 AdultContentNotice：(a) 選到 desire 時不直接導航，改開啟 notice；(b) **消費守衛附帶狀態**——偵測 `route.query.notice === 'desire'` 時自動開啟 notice（深連結被導回首頁的收尾；query 僅觸發 UI，不代表已確認）；(c) 確認 → 呼叫 `acknowledgeDesireOnce()` + `applyTheme('desire')` + `gameStore.startSession('desire', false)`（顯式傳 false，與 T020 store 保底雙重保險）+ `router.push` 至 `/game/desire`；(d) 返回 → 關閉 notice 留在首頁（既有四主題的選取／預覽流程不變）。
- [X] T022 [US1] 在 `src/components/home/ThemePreview.vue` 為 desire 加入成人內容提示（分層提示之一）：當預覽主題為 desire 時，以 i18n 文案在預覽卡顯示溫和但清楚的成人親密提示（與既有四主題預覽共用版型，僅條件式呈現提示）。使 T011 轉綠。
- [X] T023 [US1] 新增 E2E `tests/e2e/playwright/us-desire-entry.spec.ts`（`data-test` selector、iPhone 14 直向）：首頁可見第 5 主題 → 預覽含成人提示 → 攔截確認 → 進入 `/game/desire`；返回路徑可退出；**直連 `/game/desire` 未確認 → 被導回首頁且 notice 自動開啟**；先開 intimate 模式再進 desire，牌數仍為 20（SC-009 端對端佐證）。

**Checkpoint**: US1 完整可獨立驗證——desire 在首頁可見、所有進入路徑（含深連結）一致攔截確認、可選可避、每次進入皆需確認、intimate 不影響 desire（MVP 達成，對應 SC-006/SC-007/SC-009）。

---

## Phase 4: User Story 2 - 維持既有主題清楚且相容 (Priority: P2)

**Goal**: 既有 attraction/self/interaction/trust 與其 intimate 模式定位、牌組組成完全不變；直接成人身體親密內容只出現在 desire；僅針對疑似越界的既有 intimate 卡做必要調整。

**Independent Test**: 既有四主題仍通過驗證；intimate 模式抽牌數（15 base / 20 含 5 intimate）不變；desire 牌組為 20 張且不受 `intimateMode` 影響；不選 desire 時遊玩四主題不會遇到超出原定位的成人內容。

### Tests for User Story 2（先寫，確保 Red）⚠️

- [X] T024 [P] [US2] 在 `tests/unit/composables/useDeck.test.ts` 新增 desire 案例：`buildDeck('desire', allCards, false)` 與 `buildDeck('desire', allCards, true)` 皆回傳 **20 張**且 `theme === 'desire'`、無 `isIntimate === true`（desire 牌組不受 `intimateMode` 影響，data-model §7/§9、SC-009）。
- [X] T025 [P] [US2] 在 `tests/unit/data/cards-data.test.ts` 補強：既有四主題 intimate 牌仍 `level ≥ 2`、各主題仍至少一張基礎牌（desire 因省略 `isIntimate` 計為非 intimate，斷言仍成立）；加註 desire 無 intimate 分層的語意說明。

### Implementation / Verification for User Story 2

- [X] T026 [US2] 執行 T024/T025 與既有回歸測試（`gameStore.intimate`、`session-snapshot`、`settingsStore`），確認既有四主題與 intimate 模式行為零變更（FR-002/FR-003/FR-011），轉綠。
- [X] T027 [US2] 內容邊界審查（CB-006/US2-5）：檢視既有四主題 **intimate 卡**，依 [quickstart.md](./quickstart.md) §4 判斷是否有主要任務已變成「成人身體親密協商」的越界卡；若有，依 CB-006 決策移至 desire／改寫回原尺度／暫緩，並記錄結論（無越界則明確記載「審查通過、無需調整」）。

**Checkpoint**: US1 + US2 同時成立——既有四主題與 intimate 模式不被升尺度，成人內容收斂於 desire。

---

## Phase 5: User Story 3 - 有信心地判斷主題邊界 (Priority: P3)

**Goal**: 內容維護者能依 desire 與其他主題的邊界一致判斷候選題目歸屬（attraction/self/interaction/trust/desire），對應 SC-002 的 ≥ 90% 可分類目標。

**Independent Test**: 給定一批候選題目，維護者依文件中的分類清單能一致判斷落點。

- [X] T028 [US3] 將 [quickstart.md](./quickstart.md) §4「主題邊界分類清單」確立為權威來源（對齊 spec CB-001…006 與 US3 四個 acceptance scenario），確保「主要對話任務」判斷要訣完整（self vs desire 的內省 vs 身體協商、trust vs desire 的同意/界線歸屬、既有 intimate 卡越界處理）。
- [X] T029 [US3] 以一組代表性候選題目（含 attraction/self/interaction/trust/desire 各數題與數題刻意模糊者）對照分類清單做一次乾跑，驗證 ≥ 90% 可一致歸類（SC-002）；將結果摘要記錄於 spec 資料夾（如 quickstart 末段或審查記錄）。

**Checkpoint**: 邊界分類準則可操作，未來新增卡牌不會讓 desire 邊界漂移。

---

## Phase 6: User Story 4 - 維持安全、以同意為核心的成人內容 (Priority: P4)

**Goal**: desire 20 張卡的真實內容上線：可更直接討論身體親密，但語氣尊重、可拒絕、可暫停，以雙方同意與安全為核心；通過完整安全審查（FR-006/SC-005）。

**Independent Test**: 每張 desire 卡逐項通過 [quickstart.md](./quickstart.md) §3 安全審查清單（成人但非露骨指令、非強迫揭露、無 FR-006 禁止項目）。

- [X] T030 [US4] 撰寫 desire 20 張卡真實內容，取代 T013 佔位：`zh`/`en`/`th` 為真實文案、`ja` = `en` 佔位（research R-005）；題材涵蓋碰觸偏好、性需求表達、理想親密頻率、邀請方式、同意、安全感、身體界線、步調、可拒絕與 aftercare 式安撫（FR-005）；以 `level` 1–3 標記節奏深度（R-006）。寫入 `src/data/themes/desire.json`。
- [X] T031 [US4] 對 T030 的 20 張卡逐張套用 §3 安全審查清單（FR-006/US4/SC-005）：鼓勵描述偏好/界線而非要求行動；頻率題允許差異協商、不暗示義務；邀請題含可拒絕/可暫停/可改天；**排除**未成年、非自願、脅迫、酒醉失能、羞辱貶低、暴力傷害、露骨技巧教學、醫療建議；非測驗式評分、非強迫揭露。記錄每張審查結論。
- [X] T032 [US4] 確認 desire 卡四語系完整性由 `tests/unit/utils/cardsData.spec.ts`（掃 `cardsData.cards` 的 `zh`/`en`/`th`/`ja` 非空 + 放寬後 id regex）涵蓋並轉綠；`ja` 佔位非空亦通過。（**註**：`tests/unit/utils/card-text.test.ts` 是 `getCardText` 回退鏈的 utility 測試，使用合成卡、不掃 `cardsData`，故非此處守門員、無需更動。）
- [X] T033 [US4] 泰文（th）翻譯品質關卡：確認 th 文案保留「成人、同意、安全、可拒絕」語氣，不因語言轉換更露骨或更含糊（Edge Case）。

**Checkpoint**: desire 全部 20 張卡為通過安全審查的真實內容（SC-005 100%）。

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: 跨故事的收尾、無障礙驗證與文件同步。

- [X] T034 [P] WCAG 對比驗證（research R-002 待辦）：在 `tests/unit/utils/wcag-contrast.test.ts` 加入 desire 色票，驗證 `text` 對 `background`/`backgroundEnd`、`primary` 對 `text` 等關鍵組合 ≥ AA 4.5:1；未達標則微調 `desire.json` 色值並回歸。
- [X] T035 文件同步（憲章文件治理）：(a) 更新 `CLAUDE.md` 專案概述的卡牌數與主題數（80 張 / 4 主題 → 100 張 / 5 主題、desire 為成人親密主題且無 intimate 分層）；(b) 掃描 **active docs** 中仍作為「現況指引」且寫死「四主題 / 80 張 / `src/data/cards.json` 來源」的敘述（如 `docs/learning/00-project-architecture.md` 等），更新為五主題 / 100 張 / `src/data/themes/*.json`，或加註 desire 例外。**範圍排除**：`docs/archive/**`（已封存歷史快照，不動）、`docs/llm-prompt-runs/**`（LLM 執行歷史記錄，反映當時狀態）、純內容/素材生成 prompt 模板（如 `docs/00-llm-card-copywriting-prompts.md`、`docs/bgm-prompt-template.md`、`docs/card-image-generation/**`，除非要新增 desire 生成段落）。逐檔判斷「是否仍被當成現況指引」再決定更新或加註，避免改動歷史檔。
- [X] T036 執行 [quickstart.md](./quickstart.md) §2 全套本地驗證：`npm run type-check`、`npm run test`（全量單元 + 覆蓋率門檻 ≥ 80%、`composables`/`stores` ≥ 95%）、`npx playwright test tests/e2e/playwright/us-desire-entry.spec.ts`、`npm run dev` 手動驗證五主題與攔截確認。
- [X] T037 對照 [plan.md](./plan.md) Constitution Check 與 spec Success Criteria（SC-001…SC-009）逐項確認達成；`npm run lint`（含 zh-tw 註解規則）通過。

Phase 7 驗證記錄（2026-06-10）：
- `npx vitest run tests/unit/utils/wcag-contrast.test.ts`：通過（9 tests），desire `text/background`、`text/backgroundEnd`、`text/cardBack`、`primary/text` 皆 ≥ 4.5:1，無需調整色值。
- `npm run type-check`：通過。
- `npm run test`：31 個測試檔、187 個測試通過；Statements 90.46%、Branches 82.79%、Functions 88.15%、Lines 91.06%；`src/composables` 99.3% / 98.11% / 100% / 100%，`src/stores` 100% / 95.65% / 100% / 100%。
- `npx playwright test tests/e2e/playwright/us-desire-entry.spec.ts`：兩個案例分別單跑皆顯示通過（12.3s、8.6s），但 Playwright CLI 在 Windows 本機於測試完成後未自動結束，最後由 timeout 停止；另以 `npm run dev -- --host 127.0.0.1 --port 5174` 搭配 Playwright 腳本手動驗證首頁五主題、desire 預覽成人提示、notice 年齡確認、進入 `/game/desire` 20 張、直連 `/game/desire` 導回首頁並自動開 notice，皆通過。
- `npm run lint`：通過，僅既有 `tests/e2e/playwright/a11y-touch-targets.spec.ts` 的 `playwright/no-eval` warning，無 error。
- `npm run build`：通過（`vue-tsc --noEmit` + `vite build`）。
- SC-001～SC-009 對照：資料模型/型別/i18n/測試支援第 5 主題；quickstart 已記錄 12/12（100%）分類乾跑與 20/20 desire 卡安全審查；既有四主題與 intimate 模式回歸通過；核心 UI 與主題文案外部化於 zh-TW/en；首頁、預覽、entry notice 與深連結守衛皆可辨識、可選可避；desire 不受 intimate mode 加辣或增卡。

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**：無相依，可立即開始。
- **Foundational (Phase 2)**：依賴 Setup；**阻塞所有 User Story**（schema/型別演進是 desire.json 驗證前提）。
- **User Stories (Phase 3–6)**：皆依賴 Foundational 完成。
  - US1 (P1) 建立 desire 資料與進入流程（含守衛、notice、確認 API、SC-009 鎖定），是 MVP，US2–US4 在實務上於其資料基礎上驗證/補實。
  - US2 (P2) 可在 Foundational 後獨立驗證「既有四主題不受影響」（不需等 desire 內容補實）。
  - US3 (P3) 為文件/分類準則，與程式碼解耦，可平行進行。
  - US4 (P4) 補實 US1 佔位卡為真實內容並做安全審查。
- **Polish (Phase 7)**：依賴所需 User Story 完成。

### 關鍵相依鏈

- T003 → T004 → T006（Red→Green：validators 演進 + 兩處測試 regex 同步放寬）
- T004/T005 → T013（desire.json 需放寬後的 schema/型別）
- T012 + T013 + T014 → T015（desire 納入聚合與 schema 驗證）
- T010 → T020（先紅燈鎖 SC-009，再於 store 強制 desire intimate=false 轉綠）
- T009 → T019 → T021（守衛測試 → 守衛匯出確認 API + 帶狀態重導 → HomeView 呼叫 `acknowledgeDesireOnce()`／消費 `query.notice` 開 notice）
- T011 → T022（ThemePreview desire 提示先紅燈 → 實作轉綠）
- T018 → T021（HomeView 整合 notice 元件）
- T019/T020/T022 → T023（守衛 + SC-009 + 預覽提示 → E2E 端對端驗證，含深連結被導回開 notice、intimate 不影響 desire）
- T013 → T030（真實內容取代佔位）

### 各故事內部順序

- 測試先寫並失敗（Red），再實作至轉綠（Green），最後重構。
- 型別/schema → 資料 → 聚合與驗證 → UI/守衛/store → E2E。

### Parallel Opportunities

- T003 與其他 Foundational 撰寫可平行；T004/T005 為不同檔案可平行。
- US1 測試 T007/T008/T009/T010/T011 為不同檔案，可平行撰寫。
- i18n T016（zh-TW）與 T017（en）為不同檔案可平行。
- US3（文件，T028/T029）可與 US1/US2 程式工作平行。
- Polish 的 T034/T035 可平行。

---

## Implementation Strategy

### MVP First（僅 User Story 1）

1. 完成 Phase 1 Setup。
2. 完成 Phase 2 Foundational（schema/型別演進，阻塞關卡）。
3. 完成 Phase 3 US1：desire 上首頁 + 攔截式確認 + 守衛（含確認 API）+ SC-009 鎖定（佔位內容即可驗證流程）。
4. **STOP and VALIDATE**：獨立驗證 US1（首頁第 5 主題、所有路徑攔截、可選可避、每次需確認、intimate 不影響 desire）。

### Incremental Delivery

1. Setup + Foundational → 基礎就緒。
2. US1 → 獨立驗證 → MVP（desire 可見、攔截確認、SC-009 鎖定）。
3. US2 → 驗證既有四主題與 intimate 模式不受影響。
4. US3 → 邊界分類準則可操作。
5. US4 → 補實 20 張真實內容並通過安全審查。
6. Polish → WCAG、文件、全量回歸。

---

## Notes

- `[P]` = 不同檔案、無相依，可平行。
- `[Story]` 標記對應使用者故事，利於追溯。
- 每個 User Story 應可獨立完成與測試。
- 實作前先確認測試失敗（Red）。
- 每完成一個任務或邏輯群組即 commit（Conventional Commits、AI 訊息用繁中、不附 Co-Authored-By）。
- 進 main 一律走分支 + PR，不直接 push。
- 所有程式碼註解使用繁體中文；顯示字串一律外部化至 i18n / desire.json，元件內不硬碼。
