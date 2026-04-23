# Speckit SDD Cheatsheet

> 快速查找指令與使用情境。完整說明見 [speckit-sdd-workflow.md](./speckit-sdd-workflow.md)。

---

## 主幹流程（一眼版）

```
/speckit.constitution   # 首次：建立憲章
       ↓
/speckit.specify "…"    # 1. 寫 spec.md（WHAT，不談 HOW）
       ↓ (可選) /speckit.clarify        ← spec 有模糊點就跑
/speckit.plan           # 2. 寫 plan + research + data-model + contracts + quickstart
       ↓ (可選) /speckit.analyze        ← 大型功能跨檔一致性檢查
/speckit.tasks          # 3. 寫 tasks.md（Phase × UserStory）
       ↓ (可選) /speckit.checklist      ← 正式交付前品質自檢
/speckit.implement      # 4. 依 tasks 逐條 TDD 實作
       ↓ (可選) /speckit.taskstoissues  ← 多人協作同步 GitHub Issues
```

---

## 斜線指令速查

| 指令 | 使用情境 | 產出 |
|---|---|---|
| `/speckit.constitution` | 首次建專案、或要改核心原則時 | `.specify/memory/constitution*.md` |
| `/speckit.specify "功能描述"` | 每個新功能的起點（只談 WHAT/WHY） | `specs/###-xxx/spec.md` + feature branch |
| `/speckit.clarify` | spec 出現 `[NEEDS CLARIFICATION]`、user story 有歧義 | 更新 `spec.md` |
| `/speckit.plan` | spec 定稿後產技術計劃 | `plan.md` + `research.md` + `data-model.md` + `contracts/` + `quickstart.md` |
| `/speckit.analyze` | 4+ user story / 多 entity / 技術 context 複雜 | 跨檔一致性分析報告 |
| `/speckit.tasks` | plan 完成後切任務 | `tasks.md`（Phase 分組、TDD 排序、`[P]` `[USn]` 標記） |
| `/speckit.checklist` | 正式 PR / stakeholder 交付前 | `checklists/requirements.md` |
| `/speckit.implement` | 開始逐條寫 code（Red-Green-Refactor） | 實際程式碼 + 勾選 `tasks.md` |
| `/speckit.taskstoissues` | 團隊 ≥2 人、要對外報告進度 | GitHub Issues |

## git 擴充（多數自動觸發）

| 指令 | 觸發時機 |
|---|---|
| `speckit.git.initialize` | 首次 `/speckit.constitution` 前自動跑 |
| `speckit.git.feature` | `/speckit.specify` 前自動建 `###-feature-name` 分支 |
| `speckit.git.validate` | 手動驗證分支命名 |
| `speckit.git.remote` | 偵測 GitHub remote（給 `taskstoissues` 用） |
| `speckit.git.commit` | 各階段 before/after hook 自動觸發（可關） |

---

## 情境決策

| 我要… | 該做什麼 |
|---|---|
| 開新專案 | `/speckit.constitution` → `/speckit.specify` → 後續主幹 |
| 加新功能（獨立 user story） | 新開 `specs/###-xxx/`，完整跑一輪 |
| 小修 bug | **不走 speckit**，直接改 code + 補 regression test |
| 重構（行為不變） | **不走 speckit**，直接改 + 確保測試綠 |
| 效能優化（行為不變） | **不走 speckit**，直接改 + benchmark |
| UX 表層重塑（邏輯不動） | 在原 `tasks.md` 加新 Phase + 修訂紀錄（本專案 Phase 9 模式） |
| 技術選型變更 | 跑 `/speckit.constitution` 改憲章 → 再 `/speckit.specify` 新開 |
| 大型跨功能架構改動 | 先改憲章 → 再新開 spec |

---

## 產出檔速查

| 檔案 | 寫什麼 | 不寫什麼 |
|---|---|---|
| `spec.md` | User Story、FR、Success Criteria、Edge Cases、Assumptions | 技術選型、API 路徑、檔案路徑 |
| `plan.md` | Technical Context、Constitution Check、Project Structure | 逐行實作、測試細節 |
| `research.md` | R-### 格式：Decision / Rationale / Alternatives considered | 單純列選項不解釋 |
| `data-model.md` | 實體、欄位、型別、狀態機、不變量 | SQL DDL（放 migration） |
| `contracts/*.json` | JSON Schema、OpenAPI、protobuf | TypeScript 型別（放 src/） |
| `quickstart.md` | 前置條件、install/dev/test/build、手動驗證、FAQ | 架構解釋（放 plan/research） |
| `tasks.md` | Phase × UserStory 原子任務、TDD 順序、Checkpoint | 設計討論 |

---

## tasks.md 標記

```
- [ ] T021 [P] [US1] 在 tests/... 撰寫會失敗的測試
      ↑    ↑   ↑
      |    |   └── [USn] 所屬 user story
      |    └────── [P] 可平行（不同檔案、無未完成相依）
      └─────────── 任務序號（三位數）
```

| 標記 | 意義 |
|---|---|
| `[ ]` / `[x]` | 未完成 / 已完成 |
| `[P]` | 可平行給不同 agent / 開發者 |
| `[USn]` | 對應 spec.md 的 User Story n |
| `~~刪除線~~` | 偏離原規格，保留歷史 |
| `**Checkpoint**:` | user story 獨立驗證點，下一 story 開工前必過 |

---

## TDD 順序（tasks.md 內部硬規則）

每個 user story 區塊必須這樣排：

```
### Tests for User Story N (TDD — 必須先寫)
- [ ] TxxA [P] [USn] 寫 failing test A
- [ ] TxxB [P] [USn] 寫 failing test B

### Implementation for User Story N
- [ ] TxxC [USn] 實作 A，使 TxxA 通過
- [ ] TxxD [USn] 實作 B，使 TxxB 通過

**Checkpoint**: US N 完整可用，執行 npm run test -- --grep usN
```

---

## 常見地雷（最怕踩到）

1. **spec.md 寫技術選型** — 抓到就打回。技術選型只能在 `plan.md`。
2. **User Story 沒 Independent Test** — 違反 MVP-first 原則。
3. **Success Criteria 不可量化**（「app should be fast」） — 改成「FCP < 1.5s on 4G」。
4. **Implementation 排在 Tests 前面** — 違反 TDD。
5. **跨 user story 依賴**（US3 需要 US1 某個檔案才能動） — 該檔案應放 Phase 2 Foundational。
6. **憲章改了沒升版** — 未來 reviewer 無法對照版本。
7. **偏離原規格不寫修訂紀錄** — 未來看不出為什麼跟 spec 不一樣。
8. **Display 字串硬編碼** — 違反字串外部化原則，i18n 擴展會爆炸。

---

## Prompt 精簡範本

```
/speckit.specify
<一段需求描述，說明 WHAT/WHY；至少切出 P1 MVP story，
 每個 story 附 Independent Test 與 Given/When/Then>

/speckit.plan
技術選型：<語言 / 框架 / 資料儲存 / 測試工具>
約束：<效能 / bundle / 平台>
請先跑 Constitution Check，通過後進 Phase 0 research，
再 Phase 1 design & contracts。

/speckit.tasks
依 spec.md 的 N 個 user story 分 Phase：
- Phase 1 Setup、Phase 2 Foundational
- Phase 3–N 每個 story 先 TDD tests 再 implementation
- 最後 Phase 加 Polish（schema 驗證、覆蓋率、a11y、perf、docs、deploy）
strictly follow TDD: tests 任務必須排在 implementation 前。

/speckit.implement T0xx T0yy
依 Red-Green-Refactor 執行指定任務：
1. 先寫 failing test → RED → 回報
2. 確認後實作 → GREEN
3. Refactor + commit（Conventional Commits + 繁中）
```

---

## 關鍵原則（隨時記住）

- **先問 WHY，再談 HOW** — spec 是 WHAT，plan 才是 HOW
- **規格可獨立測試** — 每個 user story 單獨就是 MVP
- **優先級即執行順序** — P1 是 MVP、P2–Pn 是漸進增強
- **憲章凌駕實作** — 違反就填 Complexity Tracking 說明
- **修訂紀錄優於靜默偏離** — 發現 spec 不對，留紀錄再改

---

**短版結束。完整方法論、反面教材、多語言適配、FAQ 見 [speckit-sdd-workflow.md](./speckit-sdd-workflow.md)。**
