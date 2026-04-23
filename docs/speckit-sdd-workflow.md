# Speckit SDD 開發流程參考文件

> **目的**：提供一份可供未來新專案參考的 Speckit Spec-Driven Development（SDD）完整流程指南。內容結合通用方法論（A）與本專案（`love-talk-card`）實戰心得（B），範例可直接對照 `specs/001-love-talk-card-game/` 的產出。
>
> **適用讀者**：準備以 Speckit 起一個新專案的開發者、要接手既有 speckit 專案的協作者、撰寫 AI 輔助 prompt 的工程師。
>
> **最後更新**：2026-04-23

---

## 目錄

1. [SDD 是什麼](#1-sdd-是什麼)
2. [Speckit 專案目錄架構](#2-speckit-專案目錄架構)
3. [完整斜線命令流程](#3-完整斜線命令流程)
4. [每個產出檔的深度解析](#4-每個產出檔的深度解析)
5. [憲章（Constitution）](#5-憲章constitution)
6. [Prompt 範例](#6-prompt-範例)
7. [新增第二個與後續功能](#7-新增第二個與後續功能)
8. [TDD 與 tasks.md 的嚴謹關係](#8-tdd-與-tasksmd-的嚴謹關係)
9. [修訂紀錄（Revision Log）模式](#9-修訂紀錄revision-log模式)
10. [反面教材（Anti-patterns）](#10-反面教材anti-patterns)
11. [多專案適配建議](#11-多專案適配建議)
12. [常見問題 FAQ](#12-常見問題-faq)
13. [附錄 A：命令速查表](#附錄-a命令速查表)
14. [附錄 B：產出檔一覽](#附錄-b產出檔一覽)
15. [附錄 C：標記語法](#附錄-c標記語法)

---

## 1. SDD 是什麼

**Speckit Spec-Driven Development**（簡稱 SDD）是由 GitHub 提出的 Spec Kit 方法論的實踐框架，核心理念是：

> **「規格（spec）是專案的唯一真相來源（single source of truth）。所有實作、測試、文件、決策都從規格派生，而非反向倒推。」**

### 1.1 與 TDD / BDD 的關係

| 方法論 | 核心循環 | 真相來源 | 擅長場景 |
|---|---|---|---|
| TDD | Red → Green → Refactor | 測試 | 單元行為 |
| BDD | Given–When–Then | 情境（Scenario） | 使用者行為 |
| SDD | Specify → Plan → Tasks → Implement | 規格文件 | 全功能生命週期 |

SDD **包含並延伸** TDD：它在 TDD 之上加了一層「為什麼要做這個功能」「做到什麼程度算完成」的規格契約，並用 AI 可讀的結構化 markdown 把整個開發流程拆成可驗證的階段。

### 1.2 SDD 的五個核心信條

1. **先問 WHY，再談 HOW**：`spec.md` 嚴格禁止談實作語言、框架、API；`plan.md` 才允許。
2. **規格可獨立測試**：每個 user story 必須能獨立交付一個 MVP 切片，而不是「完成 A 才能用 B」。
3. **優先級即執行順序**：P1 必須能獨立成為 MVP；P2、P3 是漸進增強。
4. **憲章凌駕實作**：任何技術選型都要通過憲章的品質閘門（Constitution Check）。
5. **AI 可讀、AI 可寫、AI 可驗**：所有文件結構一致、含足夠上下文，讓 AI agent（如 Claude Code、Copilot）能正確執行斜線命令。

### 1.3 與傳統「先寫 PRD、再寫 code」的差異

傳統 PRD 常見問題：
- PRD 是 Word/Confluence 文件，和程式碼分離，會漂移失準
- 沒有強制的技術決策依據（research.md）
- 沒有可驗證的任務切分（tasks.md）
- 缺少端對端手動驗證步驟（quickstart.md）

Speckit 把這些痛點全部解進一個 markdown 樹狀結構，和程式碼放在同一個 repo，隨 commit 一起演進。

---

## 2. Speckit 專案目錄架構

```text
<project-root>/
├── .specify/                          # Speckit 引擎與設定（不要直接編輯）
│   ├── memory/
│   │   ├── constitution.md            # 英文憲章（鏡像）
│   │   └── constitution_zh-tw.md      # 繁體中文憲章（權威版本）
│   ├── templates/                     # 各產出檔的 template
│   │   ├── spec-template.md
│   │   ├── plan-template.md
│   │   ├── tasks-template.md
│   │   ├── checklist-template.md
│   │   ├── constitution-template.md
│   │   └── agent-file-template.md
│   ├── extensions/                    # 可選擴充（目前內建 git extension）
│   │   └── git/
│   ├── integrations/                  # AI agent 整合（copilot、claude 等）
│   ├── scripts/                       # 跨平台腳本（bash、powershell）
│   ├── extensions.yml                 # hooks 設定（before_specify、after_plan 等）
│   ├── feature.json
│   ├── init-options.json
│   └── integration.json
│
├── .github/prompts/                   # 斜線命令的 prompt 定義
│   ├── speckit.specify.prompt.md
│   ├── speckit.plan.prompt.md
│   ├── speckit.tasks.prompt.md
│   ├── speckit.implement.prompt.md
│   ├── speckit.clarify.prompt.md
│   ├── speckit.analyze.prompt.md
│   ├── speckit.checklist.prompt.md
│   ├── speckit.constitution.prompt.md
│   ├── speckit.taskstoissues.prompt.md
│   └── speckit.git.*.prompt.md
│
├── specs/                             # 功能規格（每個功能一個資料夾）
│   ├── 001-<feature-name>/
│   │   ├── spec.md                    # Phase: Specify
│   │   ├── plan.md                    # Phase: Plan
│   │   ├── research.md                # Phase: Plan（Phase 0）
│   │   ├── data-model.md              # Phase: Plan（Phase 1）
│   │   ├── quickstart.md              # Phase: Plan（Phase 1）
│   │   ├── contracts/                 # Phase: Plan（Phase 1）
│   │   │   ├── *.schema.json
│   │   │   └── *.openapi.yaml
│   │   ├── tasks.md                   # Phase: Tasks
│   │   └── checklists/
│   │       └── requirements.md        # Phase: Checklist（可選）
│   ├── 002-<next-feature>/
│   └── 003-<another-feature>/
│
└── <source code>/                     # 實際程式碼，依 plan.md 的 Project Structure 決定
    ├── src/
    └── tests/
```

### 2.1 `.specify/` 資料夾的角色

| 子路徑 | 用途 | 會更動嗎？ |
|---|---|---|
| `memory/constitution*.md` | 憲章（專案最高治理文件） | `/speckit.constitution` 修改，手動同步雙語 |
| `templates/*.md` | 所有產出檔的模板 | **一般不動**；只有跨多個專案想客製時才改 |
| `extensions/git/` | Git 擴充（自動 branch、自動 commit） | 設定檔 `git-config.yml` |
| `integrations/copilot/` | VS Code Copilot 整合檔 | 依 agent 自動生成 |
| `scripts/bash|powershell/` | 跨平台執行腳本 | 不動 |
| `extensions.yml` | hooks 設定（before/after 各階段） | 可依團隊需求調整 auto-commit 行為 |

### 2.2 hooks 的運作模式（摘自 `extensions.yml`）

每個斜線命令前後都會觸發 hook：

```
/speckit.specify
  ├─ before_specify → speckit.git.feature（必跑，建 feature branch）
  ├─ （真正的 specify 工作）
  └─ after_specify → speckit.git.commit（可選，commit 產出）
```

其他命令（clarify / plan / tasks / implement / checklist / analyze / taskstoissues）都有對應的 `before_*` 與 `after_*` auto-commit hook，預設為「詢問」（optional），可依團隊風格改成自動無問答。

### 2.3 `specs/` 編號規則

- 格式：`<三位序號>-<kebab-case-feature-name>/`
- 序號由 git extension 的 `speckit.git.feature` 自動分配，兩種策略：
  - **sequential**（預設）：001、002、003…，適合穩定維護、history 清楚
  - **timestamp**：`20260423-143022-<name>`，適合高併發多人開發、避免序號衝突
- 功能分支名稱會和資料夾同名：`001-love-talk-card-game`

---

## 3. 完整斜線命令流程

Speckit 共有 9 個核心斜線命令 + 5 個 git 擴充命令。主幹流程如下：

```
┌─────────────────────────────────────────────────────────────────┐
│ 0. /speckit.constitution                                        │
│    → 首次建立或修改專案憲章（.specify/memory/constitution*.md） │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│ 1. /speckit.specify "功能描述"                                  │
│    → 建 feature branch（git hook）                              │
│    → 產出 specs/###-xxx/spec.md                                 │
└──────────────────────────────┬──────────────────────────────────┘
                               │
         （可選 2）────────────┤
                               │
┌──────────────────────────────┴──────────────────────────────────┐
│ 2. /speckit.clarify（可選，但強烈建議）                         │
│    → 針對 spec.md 裡的 [NEEDS CLARIFICATION] 或疑點追問         │
│    → 更新 spec.md，收斂模糊性                                   │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. /speckit.plan                                                │
│    → 產出 plan.md（技術選型 + Constitution Check）              │
│    → 產出 research.md（Phase 0：技術決策）                      │
│    → 產出 data-model.md（Phase 1：實體、型別、狀態機）          │
│    → 產出 contracts/*.json/yaml（Phase 1：資料格式合約）        │
│    → 產出 quickstart.md（Phase 1：新人上手 + 手動驗證步驟）     │
└──────────────────────────────┬──────────────────────────────────┘
                               │
         （可選 4）────────────┤
                               │
┌──────────────────────────────┴──────────────────────────────────┐
│ 4. /speckit.analyze（可選）                                     │
│    → 跨 spec/plan/research/data-model/contracts 一致性檢查      │
│    → 指出衝突、遺漏、冗餘                                       │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. /speckit.tasks                                               │
│    → 產出 tasks.md                                              │
│    → 依 user story 分 Phase、標記 [P]、[USn]、排序 TDD          │
└──────────────────────────────┬──────────────────────────────────┘
                               │
         （可選 6）────────────┤
                               │
┌──────────────────────────────┴──────────────────────────────────┐
│ 6. /speckit.checklist（可選）                                   │
│    → 產出 specs/###-xxx/checklists/requirements.md              │
│    → spec completeness / testability / measurability 自檢       │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│ 7. /speckit.implement                                           │
│    → 依 tasks.md 逐條 TDD 實作                                  │
│    → 每條任務：先寫 failing test → 實作 → refactor → 提交       │
└──────────────────────────────┬──────────────────────────────────┘
                               │
         （可選 8）────────────┤
                               │
┌──────────────────────────────┴──────────────────────────────────┐
│ 8. /speckit.taskstoissues（可選）                               │
│    → 把 tasks.md 同步成 GitHub Issues                           │
│    → 適合多人協作、要追蹤工時                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 3.1 什麼時候要跑可選命令？

| 命令 | 何時跑 | 何時可跳過 |
|---|---|---|
| `/speckit.clarify` | spec 有任何 `[NEEDS CLARIFICATION]` 標記、user story 有歧義、驗收條件不清楚 | spec 已經非常具體，所有 FR-### 都有可量化驗收條件 |
| `/speckit.analyze` | 大型功能、多 user story（≥4）、跨多 entity、technical context 複雜 | 小功能（單一 user story、3 個以內 FR） |
| `/speckit.checklist` | 正式交付前、PR 要 reviewer 看品質 | 純 prototype、POC |
| `/speckit.taskstoissues` | 團隊 ≥2 人、有 sprint 計畫、要對外 stakeholder 報告 | 單人專案 |

### 3.2 git extension 命令

| 命令 | 觸發時機 | 可手動呼叫 |
|---|---|---|
| `speckit.git.initialize` | 首次跑 `/speckit.constitution` 前 | `specify extension add git` |
| `speckit.git.feature` | 跑 `/speckit.specify` 前，自動建 `###-feature-name` 分支 | 直接呼叫也行 |
| `speckit.git.validate` | CI 或本地驗證當前分支命名 | 手動 |
| `speckit.git.remote` | 偵測 GitHub remote，供 `taskstoissues` 使用 | 手動 |
| `speckit.git.commit` | 各階段 after/before hook 自動呼叫 | 手動 |

---

## 4. 每個產出檔的深度解析

### 4.1 `spec.md`（功能規格）

**使命**：回答「做什麼、給誰、為什麼、做到什麼程度算完成」。**不討論怎麼做**。

**必備章節**（template 強制）：

```markdown
# Feature Specification: [功能名稱]

**Feature Branch**: `###-feature-name`
**Created**: YYYY-MM-DD
**Status**: Draft | Review | Approved
**Input**: User description: "原始需求敘述"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - [標題] (Priority: P1)
[日常語言描述這個使用者旅程]

**Why this priority**: [為什麼是 P1 / P2 / P3]

**Independent Test**: [這個 story 單獨存在時，要怎麼驗證它有價值]

**Acceptance Scenarios**:
1. **Given** [初始狀態], **When** [動作], **Then** [預期結果]
2. ...

### User Story 2 - [標題] (Priority: P2) ...

### Edge Cases
- [邊界條件 1]
- [異常流程 1]

## Requirements *(mandatory)*

### Functional Requirements
- **FR-001**: System MUST ...
- **FR-002**: Users MUST be able to ...

### Key Entities *(if feature involves data)*
- **[Entity]**: [代表什麼、關鍵屬性，不談實作]

## Success Criteria *(mandatory)*

### Measurable Outcomes
- **SC-001**: [可量化、技術無關的指標]

## Assumptions
- [預設與範圍界線]
```

**本專案範例**（`specs/001-love-talk-card-game/spec.md` 節錄）：

- 5 個 user story（P1–P5），每個都有 Independent Test
- 16 個 Functional Requirements（FR-001 ~ FR-016）
- 8 個 Success Criteria（全部可量化：如 FCP < 1.5s、bundle ≤ 200KB）
- 5 個 Edge Cases
- 7 個 Assumptions

**硬性規則**：
- **禁止** 寫技術選型（`React`、`PostgreSQL`、`Vue 3`）
- **禁止** 寫 API 路徑（`/api/v1/users`）
- **禁止** 寫檔案路徑（`src/stores/gameStore.ts`）
- 所有模糊處用 `[NEEDS CLARIFICATION: 問題]` 標記，等 `/speckit.clarify` 收斂

### 4.2 `plan.md`（實作計劃）

**使命**：把 spec.md 的 WHAT 翻譯成 HOW，但只到「技術選型 + 架構骨架」層級。

**必備章節**：

```markdown
# Implementation Plan: [功能名稱]

## Summary
[spec 主要需求 + 技術方向]

## Technical Context
**Language/Version**: 例 Python 3.11 / TypeScript 5.x
**Primary Dependencies**: 例 FastAPI, Vue 3.4+, Vite 5
**Storage**: 例 PostgreSQL / sessionStorage / N/A
**Testing**: 例 pytest / Vitest + Playwright
**Target Platform**: 例 iOS 15+ / Linux server
**Project Type**: web-service | mobile-app | library | SPA
**Performance Goals**: 例 FCP < 1.5s、1000 req/s
**Constraints**: 例 bundle ≤ 200KB gzip、offline-capable
**Scale/Scope**: 例 10k users / 50 screens

## Constitution Check
| Gate | 規範要求 | 狀態 | 備註 |
|---|---|---|---|
| 程式碼註解語言 | 繁中 | PASS | ESLint 規則強制 |
| TDD | Red-Green-Refactor | PASS | Vitest CI 強制 |
| ...

**Constitution Gate（Phase 0 前）**: ALL PASS → 可進 Phase 0
**Constitution Gate（Phase 1 後重新確認）**: ...

## Project Structure
### Documentation (this feature)
### Source Code (repository root)
[完整目錄樹]

**Structure Decision**: [說明選了哪個專案結構]

## Complexity Tracking
[只有 Constitution Check 違規時才填]
| Violation | Why Needed | Simpler Alternative Rejected Because |
```

**本專案範例**：Constitution Check 通過 14 個 gate（見 plan.md 第 22–53 行），從程式碼註解、commit 格式、TDD、覆蓋率到效能預算全部 PASS。

**關鍵原則**：
- 技術選型要有 **重新確認閘門**：Phase 0 前跑一次、Phase 1 完成後再跑一次
- `Complexity Tracking` 表格空著沒關係；有填代表有東西違反憲章，必須說明理由
- `Project Structure` 要把實際目錄樹畫完整，不要只寫 `src/`、`tests/`

### 4.3 `research.md`（技術決策）

**使命**：記錄每個技術選擇背後的 **Decision / Rationale / Alternatives considered**，讓未來的讀者能還原決策脈絡。

**格式（本專案慣例）**：

```markdown
## R-001: [主題]

**Decision**: [結論 - 選了什麼]

**Rationale**: [為什麼選這個 - 2–4 段]

**Alternatives considered**:
- 方案 A：[為什麼沒選]
- 方案 B：[為什麼沒選]

---

## R-002: [下一個主題]
...
```

**本專案範例**（`research.md`）涵蓋：
- R-001: Vue 3 + Vite + TypeScript 選型
- R-002: Tailwind CSS 樣式策略
- R-003: CSS 3D 翻牌動畫實作
- R-004: Pinia 狀態管理
- R-005: PWA / Service Worker
- R-006: 無後端、無帳號、sessionStorage
- R-007: i18n 策略（無 vue-i18n）
- R-008: 測試分層（Vitest + Playwright）
- ...

**常見陷阱**：
- 只寫 Decision 不寫 Rationale → 未來看不出「為什麼不能改」
- Alternatives 寫太淺（「沒選 React 因為用 Vue」）→ 要具體到「SSR 對 SPA 不必要、Context API 比 Pinia 繁瑣」

### 4.4 `data-model.md`（資料模型）

**使命**：所有 entity、欄位、型別、狀態機、不變量（invariants）的 single source of truth。

**必備內容**：

1. **實體關係圖**（ASCII 或 Mermaid）
2. **每個 entity 的欄位表**：欄位 / 型別 / 限制 / 說明
3. **關鍵型別**（TypeScript interface / Python TypedDict / Go struct）
4. **狀態機**（若有）：合法狀態、合法轉移、狀態不變量
5. **業務規則 / 不變量**：如「session 開始後 `intimateModeAtStart` 不可變」

**本專案範例片段**：

```markdown
## 1. Card（卡牌）

| 欄位 | TypeScript 型別 | 限制 | 說明 |
|---|---|---|---|
| id | string | `^[a-z]+-\d{3}-(base|intimate)$` | 卡牌識別碼 |
| theme | ThemeId | 枚舉值之一 | 所屬主題 |
| isIntimate | boolean | — | 是否為私密牌 |
| level | CardLevel | 1 \| 2 \| 3 | 問題深度 |
| text | CardText | 所有語言欄位必填 | 多語言題目 |

## 關鍵不變量
- Filter 後再 Shuffle：intimate 卡必須均勻混入基礎卡
- Session 固化：`intimateModeAtStart` 決定整個 session 的牌組組成
```

### 4.5 `contracts/`（資料格式合約）

**使命**：把 data-model 的型別定義編碼成可驗證的 schema，讓 runtime 與 CI 都能檢查。

**常見格式**：
- JSON Schema（draft-07 / 2020-12）——用於 JSON 資料檔、sessionStorage、LocalStorage
- OpenAPI 3.1（YAML）——用於 HTTP API
- Protocol Buffers（.proto）——用於 gRPC / 二進位協定
- GraphQL SDL——用於 GraphQL API

**本專案範例**：
- `card-data.schema.json` — `cards.json` 檔案結構（80 張卡、4 主題、ID pattern）
- `game-session.schema.json` — sessionStorage 序列化格式
- `pwa-manifest.json` — PWA Web App Manifest 規格

**重要**：contracts 不是文件，是 **可執行的驗證規則**。tasks.md 會產生「用 ajv 驗證 cards.json 符合 schema」這種測試任務。

### 4.6 `quickstart.md`（新人上手 + 手動驗證）

**使命**：讓一個 **第一天加入專案的人** 在 30 分鐘內跑起 dev server、跑測試、完整走一次 user journey。

**標準結構**：

1. 前置條件（Node 版本、Git、瀏覽器等）
2. Clone + install + run 三步驟
3. 完整 npm scripts / make targets 清單
4. 專案結構導覽（只標「從哪裡開始讀」）
5. 核心開發流程（TDD、新增功能的 SOP）
6. **手動驗證步驟**（最重要）：對照 spec.md 的每個 user story 走一遍
7. 部署步驟
8. 常見問題 FAQ
9. 相關文件連結

**關鍵價值**：當 AI agent 說「我實作完了」，人類 reviewer 照 quickstart.md 手動走一遍就能驗證，不用自己猜步驟。

### 4.7 `tasks.md`（任務清單）

**使命**：把 plan + data-model + contracts 攤開成「一條一條可執行、可勾選、可追蹤」的原子任務。

**組織原則**（template 強制）：

```markdown
## Phase 1: Setup (Shared Infrastructure)
[T001–T0xx] 專案初始化、工具設定

## Phase 2: Foundational (Blocking Prerequisites)
[T0xx–T0yy] 所有 user story 都依賴的基礎
⚠️ 此階段完成前，不可開始任何 user story

## Phase 3: User Story 1 - [Title] (Priority: P1) - MVP
### Tests for User Story 1 (TDD - 必須先寫)
- [ ] T0xx [P] [US1] 在 tests/... 寫會失敗的測試
### Implementation for User Story 1
- [ ] T0yy [US1] 實作 ...
**Checkpoint**: US1 完整可用

## Phase 4: User Story 2 (P2)
## Phase 5: User Story 3 (P3)
...

## Phase N: Polish & Cross-Cutting Concerns
[品質驗證、無障礙、效能、文件]
```

**任務格式**：

```
- [ ] T001 [P] [US1] 說明文字
       ^    ^   ^
       |    |   └─ [USn] 標記所屬 user story（可選）
       |    └──── [P] 可平行執行（不同檔案、不依賴未完成任務）
       └───────── T### 任務序號
```

**本專案實例**（`specs/001-love-talk-card-game/tasks.md`）：
- Phase 1: T001–T011（建置）
- Phase 2: T012–T020（基礎層）
- Phase 3: T021–T040（US1 — 核心抽牌）
- Phase 4: T041–T049（US2 — 私密模式）
- Phase 5: T050–T058（US3 — 副語言切換）
- Phase 6: T059–T065（US4 — 主題氛圍）
- Phase 7: T066–T076（US5 — PWA / 離線）
- Phase 8: T077–T088（Polish — 品質閘）
- Phase 9: T089–T098（UX 重塑，後補）

**TDD 在 tasks 的排序鐵則**：
1. 先列該 user story 的所有 `### Tests for User Story X` 任務（標記 `[P]` 可平行）
2. 再列 `### Implementation for User Story X` 任務
3. 測試必須 **先 RED** 才能開始寫實作
4. 每個 user story 結尾必有 `**Checkpoint**: ...` 驗證點

### 4.8 `checklists/requirements.md`（品質自檢）

**使命**：在進入 `/speckit.plan` 前，確認 spec.md 夠完整、夠可測試、夠可量化。

**本專案範例**（13 項全 pass）：

```markdown
## Content Quality
- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

## Requirement Completeness
- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Success criteria are technology-agnostic
- [x] All acceptance scenarios are defined
- [x] Edge cases are identified
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

## Feature Readiness
- [x] All functional requirements have clear acceptance criteria
- [x] User scenarios cover primary flows
- [x] Feature meets measurable outcomes in Success Criteria
- [x] No implementation details leak into spec
```

---

## 5. 憲章（Constitution）

### 5.1 角色

憲章是 **專案治理的最高文件**。它 override 所有其他慣例、風格指南、非正式約定。任何 `/speckit.plan` 都必須通過憲章的 **Constitution Check Gate**，違反就要在 `Complexity Tracking` 表格說明為什麼不得不違反。

### 5.2 結構（本專案實例）

`specs/001-love-talk-card-game` 的憲章（`.specify/memory/constitution_zh-tw.md`）涵蓋：

**核心原則（Core Principles）**
- **一、程式碼品質**：乾淨程式碼、繁中註解、描述性命名、LF 換行、CI 強制 lint
- **二、測試標準（不可妥協）**：TDD 強制、覆蓋率 ≥ 80%（核心 95%）、測試確定性、flaky test 24h 內修復
- **三、使用者體驗一致性**：Mobile-First、44×44 觸控區、WCAG AA、翻牌動畫 ≤ 600ms、字串外部化
- **四、效能要求**：FCP < 1.5s、TTI < 3s、bundle ≤ 200KB gzip、60fps 動畫

**專案限制與標準**
- 註解語言、commit 格式、換行符、i18n、時區、外部化、憲章雙語同步

**開發工作流程**
- 分支命名、TDD 循環、lint/format、code review、憲章合規、CI 強制、提交粒度

**治理**
- 修訂流程、Semantic Versioning、合規審查、雙語維護、指引參考

### 5.3 Semantic Versioning

| 變更類型 | 版本遞增 | 範例 |
|---|---|---|
| 移除 / 不相容地重新定義核心原則 | MAJOR | 1.0.0 → 2.0.0 |
| 新增原則、章節，或重大擴充 | MINOR | 1.0.0 → 1.1.0 |
| 澄清、錯字、非語意性改善 | PATCH | 1.0.0 → 1.0.1 |

### 5.4 雙語同步

本專案慣例：**繁中為權威版本**，英文版（`constitution.md`）作為鏡像。兩者必須在同一次 commit 內更新。若跨專案只用單一語言，可簡化為單檔。

### 5.5 Constitution Check 實際操作

在 `plan.md` 中列一張表，每個原則對應一個 gate，填「PASS / FAIL / N/A + 備註」：

```markdown
| Gate | 規範要求 | 狀態 | 備註 |
|---|---|---|---|
| TDD 強制 | Red-Green-Refactor | PASS | Vitest + Playwright 已選定 |
| Bundle ≤ 200KB gzip | 不含 PWA 資產 | PASS | 無動畫庫、無 i18n 框架 |
| 所有文字外部化 | i18n / data 檔 | PASS | cards.json + i18n/*.json |
```

如果某條 FAIL，**不要改憲章**，而是在 `Complexity Tracking` 表說明：

```markdown
| Violation | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| 引入 GSAP（增加 27KB） | 需要 bezier path 動畫 | CSS 無法實作這個曲線 |
```

---

## 6. Prompt 範例

以下範例示範「在 Claude Code / Copilot 裡實際要怎麼下斜線命令」。

### 6.1 `/speckit.constitution`（首次建立憲章）

```
/speckit.constitution

本專案是一款 Vue 3 + TypeScript 的 PWA 對話卡牌遊戲。請依以下原則建立憲章：

核心原則：
1. 程式碼品質：乾淨程式碼，所有註解使用繁體中文（ZH-TW），變數命名描述性、禁止縮寫
2. 測試標準：TDD 強制，覆蓋率整體 80%、核心 composable/store 95%
3. UX 一致性：Mobile-First、44×44 觸控區、WCAG AA、翻牌動畫 ≤ 600ms
4. 效能：FCP < 1.5s、TTI < 3s、bundle ≤ 200KB gzip

專案限制：
- commit 訊息使用 Conventional Commits，AI 建議先用繁中
- 所有檔案 LF 換行，.gitattributes 強制
- i18n 至少支援 zh-TW 與 en；時區預設 Asia/Taipei
- 憲章需維護繁中（權威）與英文（鏡像）雙版本

請以繁體中文撰寫，雙版本同步，版本 1.0.0，ratified 今日。
```

### 6.2 `/speckit.specify`（建立功能規格）

```
/speckit.specify

一款情侶對話卡牌遊戲。功能：
- 首頁可選 4 個主題（心動瞬間、自我探索、互動理解、信任成長）
- 每主題 15 張基礎題，可選擇啟用「私密模式」多加 5 張私密題（總 20 張）
- 3D 翻牌動畫，翻到題目後情侶對談，點「下一張」進到下一張
- 支援切換卡片次要語言（預設中英雙語，可切到 Thai / Japanese）
- 每個主題有專屬背景漸層
- 完整 PWA：離線可用、可加到主畫面
- 抽完所有卡片顯示主題專屬結束語

請切出至少 5 個優先級分明的 user story（P1 就是 MVP：選主題 + 翻牌 + 結束），
每個 story 要有 Independent Test 與 Given/When/Then acceptance scenarios。

目標平台：iOS Safari / Android Chrome，iPhone 14 Portrait 優先。
```

### 6.3 `/speckit.clarify`（收斂模糊點）

```
/speckit.clarify

請針對 specs/001-xxx/spec.md 中以下模糊點追問：
1. 抽到 8 張以上按返回鍵會不會丟失進度？是否需要確認對話框？
2. 私密模式在 session 中途切換會不會影響當前牌組？
3. 次要語言若翻譯缺漏，回退順序是什麼（th → en → zh 還是其他）？

每個問題請提出 2–3 個合理選項讓我選，我選完後更新 spec.md。
```

### 6.4 `/speckit.plan`（產出實作計劃）

```
/speckit.plan

技術選型：
- Vue 3.4+ Composition API + Vite 5 + TypeScript 5
- Pinia 2（狀態管理）、Vue Router 4（hash mode 以支援 GitHub Pages）
- Tailwind CSS 4（無外部字體）
- Vitest（unit + coverage）、Playwright（E2E，iPhone 14 viewport）
- vite-plugin-pwa（Service Worker 與 manifest）
- 不使用 vue-i18n、不使用動畫庫（GSAP / Framer Motion）

儲存：無後端、無帳號、僅 sessionStorage
部署：GitHub Pages + GitHub Actions
效能目標：FCP < 1.5s、bundle ≤ 200KB gzip

請先跑 Constitution Check，通過後進 Phase 0 research，再 Phase 1 design & contracts。
contracts 需包含 cards.json schema、game-session schema、PWA manifest。
```

### 6.5 `/speckit.tasks`（產出任務清單）

```
/speckit.tasks

請依 spec.md 的 5 個 user story 分 Phase 產出 tasks.md：
- Phase 1: Setup（建置、工具設定）
- Phase 2: Foundational（types、路由、store 骨架、cards.json）
- Phase 3–7: US1–US5，每個 story 先列 TDD failing tests，再列實作
- Phase 8: Polish（schema 驗證、WCAG 對比、bundle 預算、覆蓋率補洞、a11y、perf、README、deploy）

每個任務需包含：
- 任務 ID（T001、T002…）
- [P] 若可平行
- [USn] 標記 user story
- 具體檔案路徑
- 簡短說明

strictly follow TDD: 同一 user story 的 tests 任務必須排在 implementation 任務前面。
```

### 6.6 `/speckit.implement`（執行實作）

```
/speckit.implement T021 T022 T023

請依 TDD 流程執行 T021–T023（US1 的 shuffle、useDeck、useCard 測試）：
1. 先在指定路徑建立 failing 測試檔
2. 執行 npm run test:watch 確認 RED
3. 暫停並回報測試失敗訊息，等我確認後再進 T026–T028 實作
4. 每個任務完成後 commit（Conventional Commits，繁中訊息）
```

或「逐階段」模式：

```
/speckit.implement

依序執行 Phase 3（US1）所有任務 T021–T040。
每完成 5 個任務回報進度並暫停，等我確認後繼續。
遇到憲章違規（例如需要引入非計畫內的依賴）立刻暫停詢問。
```

### 6.7 `/speckit.taskstoissues`（同步 GitHub Issues）

```
/speckit.taskstoissues

把 specs/001-xxx/tasks.md 的所有未完成任務同步成 GitHub Issues：
- 每個任務一個 issue
- Label 使用 [USn] 作為標籤（us1、us2…）與 phase 作為 milestone
- Body 包含 Independent Test 與 Acceptance Scenarios 的對應段落
- 忽略已完成（[x]）的任務
```

---

## 7. 新增第二個與後續功能

### 7.1 新功能 vs 既有功能擴充

| 情境 | 作法 |
|---|---|
| 全新獨立功能（不影響現有 user story） | 新開 `specs/002-xxx/`，完整跑一輪斜線命令 |
| 對 P1 user story 的 **表層互動重塑** | 可在原 `tasks.md` 末尾加新 Phase，加「修訂紀錄」說明 |
| 修 bug / 小調整 | 不走 speckit，直接改 code + 寫測試 |
| 憲章層級的架構改動 | 先跑 `/speckit.constitution` 改憲章，再新開 `specs/###-xxx/` |

### 7.2 本專案 Phase 9 的實例

Phase 3–4 交付 MVP 後，使用者實測回饋希望改「扇形抽牌 + overlay 翻面」。這屬於 **表層互動重塑**，不改 `gameStore` / `useDeck` / session schema，因此選擇「在原 tasks.md 末尾加 Phase 9」：

```markdown
## 修訂紀錄
- 2026-04-20：Phase 3-4 MVP 於 commit `704fcee` 交付後，依使用者實測回饋啟動 Phase 9 UX 重塑。
  T001–T088 保留作為交付史實，不改；新增 T089–T098 於 Phase 9 執行 POC 轉正。
  部分舊任務對應的元件將於 T090–T092 被取代（CardStack.vue 刪除、HomeView/GameView 重寫），
  屬於 v2 演進而非舊任務失效。
```

**這個模式的好處**：
- 不拆新 spec.md，避免兩份規格漂移
- 保留交付史實，review 時仍能追溯原始任務
- 新增 Phase 同樣走 TDD（T094 failing tests 先寫）

**什麼時候該另開 `002-xxx/` 而不是加 Phase**：
- 新功能需要新的 user story（新的 Given/When/Then）
- 需要改 data model（新 entity、新欄位）
- 需要新 contracts（新 schema）
- 技術選型變更（Vue 3 → Vue 4）

### 7.3 新功能的完整流程

```bash
# 1. 確保當前在 main、pull 最新
git checkout main && git pull

# 2. 跑 /speckit.specify（會自動建 feature branch 002-xxx）
/speckit.specify "新功能描述..."

# 3. 檢視 specs/002-xxx/spec.md，有模糊點就 /speckit.clarify
/speckit.clarify

# 4. 跑 /speckit.plan（會產出 plan / research / data-model / contracts / quickstart）
/speckit.plan [技術提示...]

# 5. （可選）跨檔一致性檢查
/speckit.analyze

# 6. 產出 tasks.md
/speckit.tasks

# 7. （可選）品質自檢
/speckit.checklist

# 8. 開始實作
/speckit.implement

# 9. 定期對照 quickstart.md 的手動驗證步驟
# 10. PR 合併回 main
```

---

## 8. TDD 與 tasks.md 的嚴謹關係

### 8.1 Red–Green–Refactor 在 tasks 層面的體現

每個 user story 的 tasks 區塊分兩半：

```markdown
### Tests for User Story 1 (TDD - 必須先寫，先確認失敗再實作)

- [x] T021 [P] [US1] 在 tests/unit/utils/shuffle.test.ts 撰寫會失敗的測試
- [x] T022 [P] [US1] 在 tests/unit/composables/useDeck.test.ts 撰寫會失敗的測試
- [x] T023 [P] [US1] 在 tests/unit/composables/useCard.test.ts 撰寫會失敗的測試

### Implementation for User Story 1

- [x] T026 [US1] 在 src/utils/shuffle.ts 實作 Fisher-Yates 使 T021 通過
- [x] T027 [US1] 在 src/composables/useDeck.ts 實作 useDeck 使 T022 通過
- [x] T028 [US1] 在 src/composables/useCard.ts 實作 useCard 使 T023 通過
```

**對應關係明確**：每個實作任務都標註「使 T0xx 通過」，把 TDD 紅綠關係寫進任務描述。

### 8.2 `[P]` 平行任務的紀律

`[P]` 代表 **可以同時開給不同 agent / 不同開發者**，條件是：
- 任務涉及 **不同檔案**
- 不依賴同階段其他未完成的任務

**反例**（這樣不能標 `[P]`）：

```
- [ ] T050 [P] [US3] 實作 useI18n.ts
- [ ] T051 [P] [US3] 更新 CardFace.vue 用 useI18n  ← 依賴 T050，不能平行
```

**正例**：

```
- [ ] T050 [P] [US3] 寫 useI18n.test.ts（失敗測試）
- [ ] T051 [P] [US3] 寫 card-text.test.ts（失敗測試）
- [ ] T052 [P] [US3] 寫 LanguageSelector.test.ts（失敗測試）
```

三者都是獨立測試檔，可平行產出。

### 8.3 Checkpoint 的角色

每個 user story 結尾必有：

```markdown
**Checkpoint**: 使用者故事 1 完整可用。執行 `npm run test && npm run test:e2e -- --grep us1` 以獨立驗證 MVP。
```

這行話的意義：
- **獨立驗證**：此 user story 不依賴後續 story 就能 demo
- **命令明確**：reviewer 可以照著跑
- **阻塞決策點**：下一個 user story 開工前，這個 Checkpoint 必須 pass

### 8.4 MVP-First 策略

`tasks-template.md` 明確鼓勵的實作順序：

```
1. 完成 Phase 1（Setup）
2. 完成 Phase 2（Foundational）
3. 完成 Phase 3（User Story 1 - P1）
4. STOP & VALIDATE → 這就是 MVP，已經能 demo
5. 依需要再加 US2、US3、...
```

**為什麼這個順序**：
- 每個 user story 都是 Independent Test 的，單獨一個 P1 就有使用者價值
- 能在最短時間對外 demo，收回饋再決定 US2 要不要做、要不要改
- 避免「全部做完才能上線」導致規格漂移

---

## 9. 修訂紀錄（Revision Log）模式

### 9.1 為什麼需要

Speckit 的文件是 **活的**：隨著實作推進、使用者回饋、技術發現，spec / plan / tasks 都可能偏離原規劃。若直接改動內容而不留痕跡：
- 未來 reviewer 看不出「為什麼跟當初規格不一樣」
- AI agent 再回頭解讀時會 confuse
- 後續功能擴充找不到歷史決策

### 9.2 寫在哪

依偏離的層級決定：

| 偏離層級 | 寫在哪 |
|---|---|
| spec.md 本身改動（user story 新增、FR 調整） | `spec.md` 頂部加 `## 修訂紀錄` |
| plan.md 技術選型變更 | `plan.md` 頂部加 `## 修訂紀錄` |
| tasks 實作期間的偏離（本專案大量採用） | `tasks.md` 頂部加 `## 修訂紀錄` |
| 憲章版本升級 | `constitution.md` 頂部 `<!-- 同步影響報告 -->` 註解 |

### 9.3 本專案實例（`tasks.md` 前幾條）

```markdown
## 修訂紀錄

- **2026-04-20**：Phase 3-4 MVP 於 commit `704fcee` 交付後，依使用者實測回饋
  啟動 Phase 9 UX 重塑。T001–T088 保留作為交付史實，不改；新增 T089–T098...

- **2026-04-22**：Phase 9 UX 重塑全部完成並隨 PR #2 合併進 `main`...

- **2026-04-22**：Phase 5 US3 副語言切換完成（T050–T058）。實作期間發現原規格
  T056「LanguageSelector 放 AppHeader 右側 slot」會在 iPhone 14 直向 viewport
  （390px 寬）擠到中文直書，故採 A+C 方案：(A) AppHeader 返回鈕去文字只留 ←；
  (C) LanguageSelector 移到 PickedCardView CTA 下方，僅 reading phase 顯示...

- **2026-04-23**：Phase 6 US4 沉浸式主題氛圍完成（T059–T065）。useTheme 以
  document.documentElement inline style 注入 6 個 CSS 變數；全站 transition
  由 #app 承載（body 移除 gradient 以避免雙層疊色）...

- **2026-04-23（PR #7 第二輪 Copilot review）**：T061 原規格寫「body, #app 雙選擇器
  加 transition」但實作只保留 #app，以 strike through 方式在任務文字中明示偏移...
```

### 9.4 格式慣例

```markdown
- **YYYY-MM-DD**：[一句話結論]。[2–5 句背景 + 動機 + 結果]。
```

**寫作要點**：
- 日期用 ISO 8601
- 結論要包含「哪個 Phase / 哪個任務」「是什麼層級的改動」
- 背景解釋「原規格是什麼、為什麼要改、改成什麼」
- 對具體任務偏離的，在任務本身文字用 `~~刪除線~~` 或「原規格：…　實作改為：…」雙軌標示
- 若是 Copilot / reviewer 回饋觸發的改動，標注 PR 編號與 review 輪次

---

## 10. 反面教材（Anti-patterns）

### 10.1 Spec 寫了技術細節

**錯誤**：
```markdown
**FR-003**: System MUST use Vue 3 Composition API with Pinia to manage game state.
```

**正確**：
```markdown
**FR-003**: System MUST persist the user's game progress within a single session
so that a browser refresh restores the deck order and drawn cards.
```

→ 技術選型寫在 `plan.md` 的 Technical Context，不寫在 spec。

### 10.2 User Story 沒有 Independent Test

**錯誤**：
```markdown
### User Story 3 - 語言切換 (Priority: P3)

User can switch between languages.
```

**正確**：
```markdown
### User Story 3 - 語言切換 (Priority: P3)

**Independent Test**: Can be fully tested by drawing a card, tapping the
language switch button, selecting Thai, and verifying the secondary text
changes from English to Thai while the primary Chinese text remains unchanged.
```

→ Independent Test 是 story 能不能單獨 demo 的契約。

### 10.3 Success Criteria 不可量化

**錯誤**：`SC-001: App should be fast.`

**正確**：`SC-001: FCP < 1.5s on 4G mobile network; TTI < 3s on mid-tier Android device.`

### 10.4 Plan 忽略 Constitution Check

把 `## Constitution Check` 章節留空或只寫 `All pass`，未來 reviewer 無法驗證。

**正確**：逐條列出憲章的每個原則對應的 gate、狀態、備註（見本專案 plan.md 第 22–53 行）。

### 10.5 Tasks 跨 user story 建立相依

**錯誤**：
```markdown
## Phase 5: User Story 3 (P3)
- [ ] T050 [US3] 需要先完成 T035（US1 的 ConfirmModal）才能開始
```

→ 這違反「user story Independent」原則。真正有跨 story 依賴的應該歸到 Phase 2（Foundational）或 User Story 1。

### 10.6 Implementation 任務排在 Tests 前面

```markdown
### Implementation for User Story 1
- [ ] T025 [US1] 實作 useDeck
### Tests for User Story 1
- [ ] T026 [US1] 寫 useDeck.test.ts
```

→ 違反 TDD。Tests 必須排在 Implementation 前。

### 10.7 Timestamp branch 卻不維護編號

使用 timestamp 策略（`20260423-143022-xxx`）看起來能避免衝突，但如果 `specs/` 資料夾名稱也跟著用 timestamp，未來找 spec 會非常痛苦（無法從檔名知道是第幾個 feature）。

**建議**：即使 branch 用 timestamp，specs 資料夾仍用遞增序號。

### 10.8 把 display 字串硬編碼到元件

**錯誤**：
```vue
<button>開始對話</button>
```

**正確**：
```vue
<button>{{ t('home.preview.startCta') }}</button>
```

→ 這是憲章「字串外部化」原則。違反會讓 i18n 擴展變成大改版。

### 10.9 在 commit 訊息裡不寫 Conventional Commits

**錯誤**：`fix the bug`

**正確**：`fix(useDeck): 修正 intimateMode 切換時牌組未重新洗牌的問題`

→ 本專案 `commit-msg` hook 會擋掉不合規的 commit。

### 10.10 憲章改了卻不升版

改了原則的語意卻維持 `1.0.0`，未來 PR 讀者無法判斷「我看到的版本是哪一版的憲章」。

**正確**：依 SemVer 升版，在憲章頂部加「同步影響報告」註解說明影響的 template / 產出檔。

---

## 11. 多專案適配建議

Speckit 原本設計偏 Web App / SPA，但方法論本身與語言、框架無關。以下是常見情境的適配建議。

### 11.1 語言適配

| 語言 | Technical Context 示例 | Testing | Contracts 格式 |
|---|---|---|---|
| TypeScript + Vue/React | Node 20 LTS, Vite, TS 5 | Vitest / Jest + Playwright | JSON Schema |
| Python | Python 3.11, FastAPI, SQLAlchemy | pytest + httpx | OpenAPI 3.1 |
| Go | Go 1.22, gin/echo | `go test` + testify | OpenAPI / protobuf |
| Rust | Rust 1.75, axum/actix | cargo test | OpenAPI / protobuf |
| C# / .NET | .NET 8, ASP.NET Core | xUnit + Testcontainers | OpenAPI / JSON Schema |
| Swift | Swift 5.9, SwiftUI | XCTest + Xcode UI Test | JSON Schema |

### 11.2 Project Type 對應的 Structure

`plan-template.md` 提供三個選項，擇一後刪除其他兩個：

**Option 1: Single project（預設，適合 library / CLI / SPA）**
```
src/
├── models/
├── services/
├── cli/
└── lib/
tests/
├── contract/
├── integration/
└── unit/
```

**Option 2: Web application（frontend + backend）**
```
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/
frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/
```

**Option 3: Mobile + API**
```
api/ (same as backend)
ios/ or android/
└── [feature modules, UI flows, platform tests]
```

**本專案**選 Option 1（純前端 SPA、無後端），Project Structure 寫得非常完整（見 plan.md 第 70 行起），連每個資料夾放什麼都列出來。

### 11.3 Monorepo 適配

若使用 pnpm workspace / nx / turborepo：

- `specs/` 仍放 repo root
- `plan.md` 的 Project Structure 列出各 package：`packages/core/`、`packages/web/`、`packages/mobile/`
- `contracts/` 可共用，各 package 引用
- tasks.md 的檔案路徑寫絕對於 repo root（如 `packages/web/src/...`）

### 11.4 有後端 + DB 的專案

需要額外重視的段落：

1. **research.md**：DB 選型、ORM、migration 策略
2. **data-model.md**：除了 entity 欄位，列出 DB schema、索引、關聯
3. **contracts/**：OpenAPI 規格、DB migration 檔案、環境變數清單
4. **quickstart.md**：local DB 啟動步驟（docker-compose）、seed data、migration 指令
5. **tasks.md**：Phase 2 Foundational 要包含 migration framework、auth middleware、DB connection pool

### 11.5 無測試預算的 POC / MVP

Speckit 的 `tasks-template.md` 明確允許：

> **Tests**: The examples below include test tasks. Tests are OPTIONAL - only
> include them if explicitly requested in the feature specification.

但 **本專案憲章把 TDD 定為不可妥協**，所以即使是 prototype 也要寫測試。新專案若允許先做 POC，建議：

- POC 階段憲章放寬（MAJOR 版本升級後再收緊）
- POC → production 轉正時，用類似本專案 Phase 9 的「POC 轉正」模式，補齊 failing tests 再搬移元件

### 11.6 AI-heavy 專案（LLM 整合）

額外考量：

- `research.md` 加入 model 選型決策（Opus 4.7 / Sonnet 4.6 / Haiku 4.5 / GPT-5）
- `contracts/` 加入 prompt schema、tool schema、response schema
- `data-model.md` 加入 prompt cache 策略、context window 預算
- `plan.md` 的 Constraints 要寫清楚 token / 成本預算
- tasks 要涵蓋 prompt regression test（prompt 改動後 LLM 輸出是否仍符合 schema）

---

## 12. 常見問題 FAQ

### Q1: Spec 改了要回頭改 tasks 嗎？

**答**：依改動層級決定。

| spec 改動 | tasks 處理 |
|---|---|
| 新增 user story（例如 P6） | 在 tasks.md 加新的 Phase |
| 修改現有 user story 的 FR | 找出相關任務，在任務描述補「修訂紀錄」，原任務文字用刪除線 |
| 調整 user story 優先級 | 可以重排 Phase 順序，但序號（T001、T002）**不要改** |
| user story 廢棄 | 對應任務加註「DEPRECATED」與原因，不刪除 |

**本專案 T056 就是實例**：原規格寫「LanguageSelector 放 AppHeader 右側 slot」，實作時發現 iPhone 14 窄螢幕擠到中文直書，tasks 裡用 `~~原規格：...~~ 實作改為：...` 雙軌保留。

### Q2: 有多個 feature 同時在跑怎麼辦？

**答**：每個 feature 各自 feature branch + 各自 `specs/###-xxx/`，互不干擾。但要注意：

- 憲章變更會同時影響所有 feature → 憲章改動要開獨立 PR，feature branch 各自 rebase
- `data-model` 若有重疊（如兩個 feature 都要改 User entity）→ 先合併較早的 feature，後面的 rebase 跟進
- tasks.md 的序號各自獨立（feature A 從 T001、feature B 也從 T001）

### Q3: 憲章一定要 versioning 嗎？

**答**：單人 / 短期專案可以不用嚴格 SemVer，但至少要有 **修改日期**，避免「改了卻沒人知道」。多人 / 長期專案強烈建議 SemVer。

### Q4: `/speckit.clarify` 什麼時候該跑？

**答**：三個觸發點：

1. spec 裡有 `[NEEDS CLARIFICATION]` 標記
2. `/speckit.checklist` 指出 testability / measurability 不足
3. 要進 `/speckit.plan` 前自己覺得 spec 還不夠聚焦

跑的頻率：spec 大改時每次都跑、小調整可以跳過。

### Q5: tasks.md 裡「實作某個檔案」需要拆到多細？

**答**：原則是「一個任務 ≤ 一次 commit 的份量」。太粗（「實作 gameStore」）會讓 PR 難 review；太細（「宣告 themeId ref」）會讓 tasks.md 爆炸。

**本專案慣例**：一個任務對應一個檔案的主要職責。例如：

```
T029 [US1] 在 src/stores/gameStore.ts 實作 gameStore：
  startSession() 透過 useDeck 建立並洗牌；
  drawCard() 推進牌堆並寫 sessionStorage；
  restoreSession() 讀取快照並依 deckOrder 重建；
  getters: currentCard, lastDrawnCard, remainingCount, isComplete；
  使 T024 通過
```

→ 一條任務涵蓋整個 store，但描述已經把 action、state、getter 全列清楚。

### Q6: AI agent 執行 `/speckit.implement` 時卡住了怎麼辦？

**答**：

1. 檢查卡在哪個 Phase / 哪條任務
2. 手動 `git diff` 看 agent 寫到哪
3. 若測試 RED 但實作卡住，確認測試本身是否合理（有時 failing test 本身有 bug）
4. 若超出憲章允許（如試圖引入非計畫依賴），把「暫停並詢問」寫回 prompt
5. 最後手段：把該任務退回「tests 先 commit、implementation 另開子 PR」

### Q7: `contracts/` 能用 TypeScript / Zod / Pydantic 模型代替嗎？

**答**：可以，但建議同時保留一份 schema（JSON Schema / OpenAPI）作為 **語言無關的合約**。理由：

- JSON Schema 可以跨語言驗證（front / back 共用）
- 未來接第三方（webhook、外部 API）會需要 schema 描述
- 某些 AI 工具（ajv、OpenAPI generator）只吃 schema

**本專案作法**：TypeScript types 放 `src/types/index.ts`（程式碼層），JSON Schema 放 `specs/###/contracts/`（規格層），兩者雙向驗證。

### Q8: hook 自動 commit 是不是太吵？

**答**：預設是「每個 after_xxx 都會詢問」，可以在 `.specify/extensions/git/git-config.yml` 改成：

```yaml
auto_commit:
  default: false          # 全部預設不自動
  after_specify:
    enabled: true
    message: "[Spec Kit] Add specification"
```

或全部關閉，自己手動 commit。

### Q9: 小修改要不要走 speckit？

**答**：判斷原則：

| 情境 | 走 speckit | 直接改 code |
|---|---|---|
| 新功能 / user story | Yes | No |
| 修 bug | No | Yes（但寫 regression test） |
| 重構（行為不變） | No | Yes |
| 效能優化（行為不變） | No | Yes |
| 大型 UX 重塑 | Yes（可加 Phase 或新 spec） | No |
| 換框架 / 技術選型 | Yes（憲章 + 新 spec） | No |

### Q10: Speckit 是不是太繁瑣？

**答**：對一次性 POC 確實是 overhead；對長期維護的產品，前期投資能防止：
- 規格漂移（code 跟文件不符）
- 歷史決策遺忘（為什麼選了 X 而不是 Y）
- 新人上手慢（quickstart.md 省下一週 onboarding）
- PR review 爭議（有 Independent Test 與 Success Criteria 可對照）

**拿捏建議**：
- 個人 side project 且生命週期 < 1 個月 → 簡化，只跑 specify + tasks
- 團隊 ≥ 2 人 / 生命週期 ≥ 3 個月 → 完整流程

---

## 附錄 A：命令速查表

| 命令 | 階段 | 前置 | 產出 | 是否必跑 |
|---|---|---|---|---|
| `/speckit.constitution` | 治理 | （首次） | `.specify/memory/constitution*.md` | 首次必跑 |
| `/speckit.specify "…"` | 1. Specify | 憲章存在 | `specs/###-xxx/spec.md` + feature branch | 必跑 |
| `/speckit.clarify` | 1.5 | spec.md 存在 | 更新 spec.md | 可選（建議） |
| `/speckit.plan` | 2. Plan | spec.md 存在 | plan.md + research.md + data-model.md + contracts/ + quickstart.md | 必跑 |
| `/speckit.analyze` | 2.5 | plan 輸出齊全 | 分析報告（stdout 或 `analysis.md`） | 可選 |
| `/speckit.tasks` | 3. Tasks | plan 輸出齊全 | tasks.md | 必跑 |
| `/speckit.checklist` | 3.5 | tasks.md 存在 | `checklists/requirements.md` 等 | 可選 |
| `/speckit.implement` | 4. Implement | tasks.md 存在 | 實際程式碼 + 勾選 tasks.md | 必跑 |
| `/speckit.taskstoissues` | 5. Sync | tasks.md 存在 | GitHub Issues | 可選 |
| `speckit.git.initialize` | hook | 首次 | `.git/` | 自動觸發 |
| `speckit.git.feature` | hook | specify 前 | feature branch | 自動觸發 |
| `speckit.git.validate` | 維運 | 任何時候 | 分支命名檢查 | 手動 |
| `speckit.git.remote` | 維運 | 需 GitHub remote | 偵測 remote URL | 手動 |
| `speckit.git.commit` | hook | 各階段前後 | commit | 自動觸發（可詢問） |

---

## 附錄 B：產出檔一覽

| 檔案路徑 | 階段 | 內容摘要 |
|---|---|---|
| `.specify/memory/constitution_zh-tw.md` | 治理 | 專案最高治理文件（繁中權威） |
| `.specify/memory/constitution.md` | 治理 | 憲章英文鏡像 |
| `specs/###-xxx/spec.md` | Specify | User Story、FR、SC、Edge Cases、Assumptions |
| `specs/###-xxx/plan.md` | Plan | Technical Context、Constitution Check、Project Structure |
| `specs/###-xxx/research.md` | Plan Phase 0 | 技術決策（R-### Decision/Rationale/Alternatives） |
| `specs/###-xxx/data-model.md` | Plan Phase 1 | 實體關係、欄位、型別、狀態機、不變量 |
| `specs/###-xxx/contracts/*.json` | Plan Phase 1 | 資料格式合約（JSON Schema） |
| `specs/###-xxx/contracts/*.yaml` | Plan Phase 1 | API 合約（OpenAPI / protobuf） |
| `specs/###-xxx/quickstart.md` | Plan Phase 1 | 新人上手 + 手動驗證 + FAQ |
| `specs/###-xxx/tasks.md` | Tasks | 依 Phase / US 分組的原子任務 |
| `specs/###-xxx/checklists/requirements.md` | Checklist | Spec 品質自檢 |

---

## 附錄 C：標記語法

### 任務標記

| 標記 | 意義 | 範例 |
|---|---|---|
| `[ ]` | 未完成 | `- [ ] T001 ...` |
| `[x]` | 已完成 | `- [x] T001 ...` |
| `[P]` | 可平行（不同檔案、無未完成相依） | `- [ ] T021 [P] [US1] ...` |
| `[USn]` | 所屬 user story | `- [ ] T021 [P] [US1] ...` |
| `~~文字~~` | 偏離原規格，保留歷史 | `~~原規格：...~~ 實作改為：...` |

### Spec 標記

| 標記 | 意義 |
|---|---|
| `[NEEDS CLARIFICATION: 問題]` | 需要 `/speckit.clarify` 追問 |
| `*(mandatory)*` | template 強制章節 |
| `*(include if feature involves data)*` | 條件章節 |

### Constitution 標記

| 標記 | 意義 |
|---|---|
| `<!-- 同步影響報告 -->` | 憲章升版時的影響分析註解 |
| `MUST` / `MUST NOT` / `SHOULD` | RFC 2119 關鍵字，定義強制等級 |

---

## 附錄 D：本專案 Speckit 實戰指標

以 `specs/001-love-talk-card-game/` 為例，可供未來專案參考的規模基準：

| 指標 | 數值 |
|---|---|
| User Stories | 5（P1–P5） |
| Functional Requirements | 16 |
| Success Criteria | 8 |
| Edge Cases | 5 |
| Assumptions | 7 |
| Technical Context 條目 | 9 |
| Constitution Check Gates | 14 |
| Research 決策（R-###） | 8+ |
| Contracts | 3（cards-schema、session-schema、pwa-manifest） |
| Tasks 總數 | 98（Phase 1 × 11 + Phase 2 × 9 + US1 × 20 + US2 × 9 + US3 × 9 + US4 × 7 + US5 × 11 + Polish × 12 + Phase 9 × 10） |
| tasks.md 行數 | ~380 |
| spec.md 行數 | ~400 |
| plan.md 行數 | ~300 |
| 修訂紀錄條目 | 5 條（涵蓋 Phase 9 POC 轉正、Phase 5 US3 改版、Phase 6 US4 調整、兩輪 Copilot review 回饋） |

**對照新專案**：若新專案規模類似（4–6 個 user story、10–20 個 FR），可以預期產出規模接近。若差距很大（如 2 個 user story、5 個 FR），flows 可以簡化為 specify → plan → tasks → implement，跳過 clarify / analyze / checklist。

---

## 結語

Speckit SDD 的價值不在於「流程繁瑣」，而在於把 **AI 協作** 與 **人類審查** 拉進同一個 markdown 結構：
- AI agent 能讀懂所有產出檔、執行斜線命令、自動推進 Phase
- 人類 reviewer 能對照 spec → plan → tasks 驗證決策連貫性
- 未來維護者能從 research.md / 修訂紀錄還原歷史脈絡

**動手前先寫規格、動工前先過憲章、動刀前先寫測試** — 這是 SDD 的三個紀律。遵守它，專案才能長期維持品質與可維護性。

當方法論違反直覺時回頭看這份文件；當方法論與現實衝突時（如本專案 T056 的 UX 發現、T061 的 body/app 雙層疊色），**修訂紀錄** 是讓規格繼續保持權威的關鍵工具。
