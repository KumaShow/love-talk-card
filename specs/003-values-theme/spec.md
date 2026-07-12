# Feature Specification: Values Theme Technical Integration & Gameplay Flow

**Feature Branch**: `003-values-theme`
**Created**: 2026-07-08
**Updated**: 2026-07-12
**Status**: Draft — scope refined

## Scope Refinement

003 現正式聚焦於 `values` 主題的技術整合與可遊玩流程：主題註冊、25 張資料的結構驗證、牌組建立、畫面與路由整合，以及自動化驗證。本規格不定義、創作、潤稿或驗收卡牌文案品質。

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 從首頁選擇並預覽第 6 個 values 主題 (Priority: P1)

使用者在首頁可看到第 6 個 `values` 主題，開啟主題預覽後可正常進入遊戲。主題名稱、描述等既有外部化資料會依目前應用程式的資料驅動機制顯示；本故事只驗證顯示與導向，不驗收文案內容或主題邊界。

**Independent Test**: 單元測試與 E2E 可確認首頁主題清單、預覽與 `/game/values` 導向皆可用。

**Acceptance Scenarios**:

1. **Given** 使用者位於首頁，**When** 瀏覽主題列表，**Then** 可看到第 6 個 `values` 主題。
2. **Given** 使用者開啟 `values` 預覽，**When** 選擇開始，**Then** 可進入 `/game/values`，且預覽所需的外部化欄位可被讀取與顯示。
3. **Given** 使用者使用既有五個主題，**When** 新增 `values` 後，**Then** 既有主題的選擇與顯示行為維持不變。

---

### User Story 2 - 以任一 intimate mode 設定完成 values 的 25 張遊玩流程 (Priority: P1)

使用者開始 `values` 遊戲時，系統從單一 25 張牌池建立牌組。無論開始時 intimate mode 為開或關，牌組都必須包含相同的 `val-001` 至 `val-025`，可正常抽牌、完成流程並抵達結束畫面。

**Independent Test**: 單元測試可驗證兩種 mode 的 `deckOrder` 都有 25 張 values 卡；E2E 可驗證抽完 25 張後抵達 `/end/values`。

**Acceptance Scenarios**:

1. **Given** `values` 的資料檔有效，**When** 使用者以 intimate mode 關閉或開啟開始遊戲，**Then** 每次皆建立由同一組 25 張 values 卡構成的牌組。
2. **Given** 使用者正在玩 values，**When** 依序完成牌組中的全部卡牌，**Then** 系統可正常抽牌、維持遊戲狀態，並顯示 values 結束畫面。
3. **Given** 使用者直接開啟 `/game/values` 或 `/end/values`，**When** router 驗證主題識別碼，**Then** 路由有效且不套用 `desire` 的成人確認守衛。

---

### Edge Cases

- 若 values 卡數不是 25、id 缺號或格式不符，資料 schema／單元測試必須失敗。
- 若任一張卡缺少 `zh`、`en`、`th` 或 `ja` 欄位，資料 schema／單元測試必須失敗；本項只檢查欄位非空與格式，不檢查翻譯品質。
- 若 values 卡帶有 `base`／`intimate` 後綴或 `isIntimate: true`，資料驗證必須拒絕或測試必須失敗。
- 若 intimate mode 使 values 牌數改變，牌組與遊戲狀態測試必須失敗。
- 若既有五個主題的資料、intimate 行為或既有卡牌 id 因本功能改變，回歸測試必須失敗。

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 系統 MUST 將 `values` 註冊為第 6 個正式主題識別碼，供資料聚合、i18n、路由、測試與文件共同使用。
- **FR-002**: 系統 MUST 載入 `values` 主題資料，並在首頁主題列表與主題預覽的既有資料驅動流程中顯示。
- **FR-003**: 系統 MUST 建立並驗證恰好 25 張 values 卡，id 必須完整為 `val-001` 至 `val-025`。
- **FR-004**: 每張 values 卡 MUST 保有既有資料契約的 `id`、`level` 與四語 `text.zh`／`text.en`／`text.th`／`text.ja` 非空欄位；本功能只驗證結構、格式與非空，不驗收卡牌內容、翻譯或語氣品質。
- **FR-005**: `values` MUST 不使用 intimate 分層：卡牌不得使用 `base`／`intimate` id 後綴，且資料應省略 `isIntimate`。
- **FR-006**: 以 intimate mode 開啟或關閉開始 `values` 時，系統 MUST 建立相同的 25 張 values 牌組；`level` 不得成為篩選條件。
- **FR-007**: 系統 MUST 支援 `/game/values` 與 `/end/values` 的正常流程，且 values 不得套用 `desire` 成人確認守衛。
- **FR-008**: 系統 MUST 允許使用者抽完 values 的 25 張牌並完成既有結束流程。
- **FR-009**: 系統 MUST 保留既有五個主題的行為：前四主題的 intimate mode、`desire` 的單一牌池，以及所有既有卡牌 id 都不得因本功能變更。
- **FR-010**: values 的首頁、預覽、遊戲與結束畫面整合 MUST 符合既有可近用性要求；values 色票的文字對比須達 WCAG 2.1 AA。

### Data Rule Relaxation Requirements

- **DR-001**: 共用卡牌資料規則 MUST 接受 `val-\d{3}`，並拒絕 `val-###-base` 與 `val-###-intimate`。
- **DR-002**: 共用卡牌資料規則 MUST 允許 `values` 省略 `isIntimate`，但不得放寬前四個主題的既有 intimate 規則。
- **DR-003**: 資料與測試 MUST 不以每主題 20 張或全站 100 張為共用不變量；values 的專屬資料契約 MUST 驗證 25 張。
- **DR-004**: 本次規則放寬 MUST 僅限支援 values；不得新增 Mix 牌堆、移除前四主題 intimate mode，或重新命名既有卡牌 id。
- **DR-005**: values 的 schema MUST 保留主題雙語欄位、六色票與四語卡牌欄位的格式驗證，作為遊戲執行所需的技術契約。

### Explicitly Out of Scope

- 卡牌文案的最終創作、潤稿、逐張語氣審查、翻譯品質與題型重複性審查。
- values 與其他主題的文案邊界、內容覆蓋率與候選題歸類審查。
- 非審判、非測驗、可保留、可再談等文案品質規則。
- `content-review.md` 的建立、更新或內容審查驗收。
- Mix 牌堆、前四主題 intimate 模式調整、既有卡牌 id 重新命名與 values 專屬美術創作。

### Key Entities *(include if feature involves data)*

- **Values Theme**: 正式識別碼為 `values` 的第 6 主題；包含 25 張單一牌池卡牌，並沿用既有主題資料、預覽、遊戲與結束流程。
- **Values Card**: id 為 `val-001` 至 `val-025` 的卡牌；具 `level` 與四語非空 `text` 欄位，不具 intimate 分層。
- **Values Deck**: 由 25 張 values 卡組成的遊玩順序；任何 intimate mode 設定下組成皆相同。

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 型別、主題資料聚合、i18n 與路由均可接受 `values` 作為第 6 主題，且既有五個主題的回歸測試通過。
- **SC-002**: values schema 與資料測試均驗證恰 25 張、完整 `val-001` 至 `val-025`、合法 level、四語欄位非空，以及沒有 intimate 分層。
- **SC-003**: `startSession('values', false)` 與 `startSession('values', true)` 的 `deckOrder` 均含 25 張相同的 values 卡。
- **SC-004**: 首頁與主題預覽的單元／E2E 測試可確認 values 顯示並可導入遊戲。
- **SC-005**: E2E 可確認 values 從 `/game/values` 抽完 25 張後到達 `/end/values`。
- **SC-006**: `/game/values` 與 `/end/values` 為有效路由，且 values 不進入 desire 成人確認守衛。
- **SC-007**: values 色票相關文字對比通過 WCAG 2.1 AA 驗證。
- **SC-008**: 資料驗證、unit test、E2E、lint、type-check 與 build 全部通過，並在 quickstart 的最終技術驗收記錄結果。

## Assumptions

- 003 只負責讓現有 values 資料成為可驗證、可顯示、可遊玩的技術整合成果；資料欄位存在不代表本規格認可其文案品質。
- 後續卡牌文案創作、潤稿與內容審查將以一般 Plan 模式處理，不建立新的 Speckit SDD 規格、計畫或任務。
