# Implementation Plan: Values & Future Theme（第 6 主題 values）

**Branch**: `003-values-theme` | **Date**: 2026-07-08 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/003-values-theme/spec.md`

## Summary

新增第 6 個關係主題 `values`（價值觀與未來 / Values & Future），初版單一牌池 25 張（id `val-001`～`val-025`），承接「價值排序、金錢與安全感、家庭與親密邊界、生活方向、承諾與未來、社交與邊界」六面向，情緒記憶點為「在生活選擇裡看見彼此靈魂共振」。

技術取徑刻意收斂為 **values 上線所需的最小穩定變更**，不重做卡牌資料架構：

- 主題白名單 `VALID_THEME_IDS` 加入 `'values'`、`src/data/index.ts` 加一組 import 與 `themeFiles` 項；下游 `useTheme` / router guard / `useDeck` / `isValidThemeId` 皆由 `VALID_THEME_IDS` 或 `themes` 陣列衍生，**無需個別修改**。
- Zod validator 僅動兩處：id 正則新增 `val-\d{3}` 分支、`superRefine` 將 `values` 一併豁免 `isIntimate` 必填。**卡數上限本就不存在**（`cards.min(1)`，無 max），故不需要放寬任何上限。
- 新增資料檔 `src/data/themes/values.json`（25 張、四語 schema）與契約 `contracts/values-theme.schema.json`。
- 顯示層以資料驅動為主：i18n 新增 `theme.values` 鍵、修正硬編數字（首頁「五個主題」）；GameView / EndView / 主題選單預期 **0 元件邏輯改動**。
- 文件治理：更新 CLAUDE.md 中「100 張＝5×20」敘述（憲章文件目前未硬編此數，僅需核對）。

明確排除（記為 future backlog，對齊 DR-004）：Mix 牌堆、移除前四主題 intimate、重新命名既有卡牌 id。

## Technical Context

**Language/Version**: TypeScript 5.x、Vue 3（`<script setup>`）、Vite

**Primary Dependencies**: Vue Router（Hash mode）、Pinia、Zod（執行期資料驗證）、Tailwind CSS v4、Vitest + Playwright

**Storage**: 靜態 JSON（`src/data/themes/*.json`）；執行期狀態存 `sessionStorage`。無後端。

**Testing**: Vitest（單元 + v8 覆蓋率）、Playwright（E2E，iPhone 14 Portrait）。覆蓋率門檻：整體 80%、`composables/**` 與 `stores/**` 95%。

**Target Platform**: Mobile-First Portrait PWA，部署 GitHub Pages。

**Project Type**: 單一前端 SPA（single project）。

**Performance Goals**: 沿用憲章——FCP < 1.5s（4G）、TTI < 3s、翻牌 60fps、初始 bundle < 200KB gzipped。本功能僅新增 25 張靜態資料，對 bundle 影響極小。

**Constraints**: 觸控目標 ≥ 44×44px；主題背景過渡 300–500ms；翻牌 ≤ 600ms 不阻擋互動；四語 schema 必填；LF 換行；程式碼註解繁體中文；UI 字串外部化並具備 zh-TW + en。

**Scale/Scope**: 主題 5 → 6；卡牌 100 → 125。本功能無新增元件、無新增路由、無新增 store。

## Constitution Check

*GATE：Phase 0 前必須通過；Phase 1 後重新檢查。*

權威來源：`.specify/memory/constitution_zh-tw.md`（v1.0.0）。

| 憲章要求 | 本計劃如何滿足 | 判定 |
|---|---|---|
| 一、程式碼品質：註解繁體中文、LF、無死碼、單一職責 | 僅微調 `validators.ts`（2 行）與資料檔；所有新增註解繁中；`.gitattributes` 已強制 LF | ✅ PASS |
| 二、測試標準（不可妥協）：TDD 紅→綠→重構、關鍵路徑 95% | 先寫失敗測試：`values-theme.test.ts`（25 張/id/四語）、擴充 `cards-schema.test.ts` 的 id 正則與 `val-###` 接受/拒絕案例；再改 `validators.ts` 使其轉綠 | ✅ PASS |
| 三、UX 一致性：i18n zh-TW + en、字串外部化、觸控/動畫門檻 | `theme.values` 文案入 i18n（zh-TW + en 真實）、卡文入 `values.json`；不新增硬編字串；不動動畫與觸控 | ✅ PASS |
| 四、效能：bundle < 200KB、cache-first | 僅 +25 張 JSON 文本，體積影響微小；沿用既有 SW 快取策略 | ✅ PASS |
| 專案標準：Conventional Commits（繁中內容） | 提交遵循既有規範（commit-msg hook 已強制）；不附 AI 署名 | ✅ PASS |
| Tailwind v4 utility-first、禁 BEM | 本功能無新樣式；主題色透過 `values.json` 的 `colors` 由 `useTheme` 注入 CSS 變數，符合單一資料來源 | ✅ PASS |
| 憲章鏡像同步（constitution.md ↔ zh-tw） | 若 constitution 需改（實測未硬編 100/5×20，故預期免改；僅 CLAUDE.md 需更新），若動到 constitution 必雙語同步 | ✅ PASS |
| 文件治理：docs/ 現況一致、封存規則 | 更新 CLAUDE.md「100 張＝5×20」敘述列為 tasks 階段治理任務 | ✅ PASS |

**結論**：無憲章違反，Complexity Tracking 無需填寫。本計劃刻意最小化抽象，未引入本階段用不到的規則或牌堆策略。

## Project Structure

### Documentation (this feature)

```text
specs/003-values-theme/
├── spec.md              # 既有功能規格
├── plan.md              # 本檔（/speckit.plan 產出）
├── research.md          # Phase 0：決策與現況佐證
├── data-model.md        # Phase 1：Theme / Card / values 實體
├── quickstart.md        # Phase 1：新增與驗收步驟
├── contracts/
│   └── values-theme.schema.json   # Phase 1：values.json 結構契約
└── tasks.md             # Phase 2（/speckit.tasks 產出，非本命令）
```

### Source Code (repository root)

```text
src/
├── types/index.ts               # [改] VALID_THEME_IDS 加 'values'
├── data/
│   ├── index.ts                 # [改] import values + themeFiles 加項
│   ├── validators.ts            # [改] id 正則加 val-\d{3}；superRefine 豁免 values
│   └── themes/
│       └── values.json          # [新] 25 張、四語、主題色與 endMessage
├── i18n/
│   ├── zh-TW.json               # [改] 加 theme.values；修正 home.description 硬編數字
│   └── en.json                  # [改] 加 theme.values；修正 home.description 硬編數字
├── composables/useTheme.ts      # [不動] 資料驅動，自動吃到 values 色票
├── composables/useDeck.ts       # [不動] 僅以 theme + intimateMode 過濾；不看 level
├── utils/theme.ts               # [不動] validThemeIds / isValidThemeId 由 VALID_THEME_IDS 衍生
├── router/                      # [不動] beforeEach 用 isValidThemeId，自動接受 values
└── views/{GameView,EndView,HomeView}.vue  # [預期不動] 主題選單/預覽為資料驅動

tests/
├── unit/data/values-theme.test.ts     # [新] 25 張 / val-### / 四語非空
├── unit/utils/cards-schema.test.ts    # [改] id 正則加 val；新增 val-### 接受/拒絕案例
└── （其餘既有測試維持不動——見 research.md「測試盤點」）
```

**Structure Decision**：沿用既有 single-project 前端結構。新增主題完全落在既有「資料 + i18n + validator」三處擴充點內，無新增分層、元件或路由。

## 逐項技術決策（對應 spec 需求）

> 完整佐證與現況引用見 [research.md](./research.md)；資料契約見 [data-model.md](./data-model.md) 與 [contracts/values-theme.schema.json](./contracts/values-theme.schema.json)。

### 1. 主題註冊（FR-001 / FR-012 / SC-001）

- `src/types/index.ts`：`VALID_THEME_IDS` 陣列末端加入 `'values'`。`ThemeId` union 自動含 `values`。
- `src/data/index.ts`：新增 `import values from './themes/values.json' with { type: 'json' }`，並把 `values` 加入 `themeFiles` 陣列。
- **下游確認免改**：`utils/theme.ts` 的 `validThemeIds`/`isValidThemeId` 直接參照 `VALID_THEME_IDS`；router `beforeEach` 用 `isValidThemeId`；`useTheme.applyTheme(themeId, themes)` 以 `themes.find` 定位色票；`useDeck.buildDeck` 以 `card.theme === themeId` 過濾。全部資料驅動，加入白名單即自動生效。

### 2. values.json 資料完整性（FR-006 / FR-011）

- 結構比照 `desire.json`：主題層 `name`/`description`/`endMessage` 為 `{zh,en}` 雙語、`colors` 六個 hex；`cards` 為 25 張。
- 每張卡 `{ id, level, text }`，**省略 `isIntimate`**（比照 desire）。
- `text` 四語必填非空：`zh`/`en` 真實內容，`th` 可比照現況、`ja` 以英文鏡射作 placeholder（沿用既有模式，不新增缺語系 fallback 邏輯）。
- 通過 `ThemeFileSchema`（見決策 3 的最小 validator 改動）與 `contracts/values-theme.schema.json`。

### 3. 卡數約束的真正所在與最小改法（DR-001 / DR-002 / DR-003 / SC-003）

**現況實測**：`validators.ts` 的 `cards` 僅 `z.array(ThemeCardSchema).min(1)`，**沒有 `.max()`**。所謂「每主題 20 張」不在 runtime validator，而是散落在：①契約 schema 的 `minItems/maxItems`、②特定主題硬編測試斷言（attraction/self/desire）。故 **runtime 不需放寬卡數上限**。

`validators.ts` 只需兩處最小改動：

- **id 正則**：`^(des-\d{3}|(?!des-)[a-z]+-\d{3}-(base|intimate))$`
  → `^(des-\d{3}|val-\d{3}|(?!des-|val-)[a-z]+-\d{3}-(base|intimate))$`
  （新增 `val-\d{3}` 分支；並在負向前瞻加入 `val-`，確保 `val-001-base` 這類帶後綴 id 仍被拒絕，維持 values「不用 base/intimate 後綴」不變量。）
- **superRefine**：`if (themeFile.id === 'desire') return`
  → `if (themeFile.id === 'desire' || themeFile.id === 'values') return`
  （將 values 一併豁免「非 desire 必填 isIntimate」規則。）

**新增契約** `contracts/values-theme.schema.json`：比照 `desire-theme.schema.json`，但 `id` const 為 `"values"`、卡 id `^val-\d{3}$`、`cards` 的 `minItems`/`maxItems` 皆 25、`isIntimate` 省略（若出現必為 false）。**唯一 runtime 下限仍是 `min(1)`，本階段不新增最低可遊玩數常數。**

### 4. 避免被誤套進舊 base/intimate 規則（FR-005 / DR-005）

- 重點就是決策 3 的兩處：id 正則的 `val-` 分支與負向前瞻、superRefine 的 desire+values 豁免。
- `CardText`（四語）與 `CardLevel`（1|2|3）型別已具備，`isIntimate` 已是 optional，型別層無需改。
- 既有「非 desire 省略 isIntimate 應驗證失敗」測試（`cards-schema.test.ts`）仍以 `attraction` 為對象，**維持有效**——values 走另一條豁免路徑，兩者不衝突。

### 5. level 維持為「內容深度」而非遊玩篩選（FR-007）

- **實測**：`useDeck.buildDeck` 只用 `theme` + `intimateMode` 過濾，**從不讀 `level`**。values 無 `isIntimate`，`!intimateMode && card.isIntimate` 恆為 falsy → 25 張無論 intimateMode 皆全數入堆。
- 因此「私密牌 level ≥ 2」規則（`cards-data.test.ts`，以 `card.isIntimate` 為過濾條件）**不套用於 values**——values 沒有任何 `isIntimate === true` 的卡。
- level 僅為撰稿深度標記（情緒暴露／承諾重量，與題材敏感度脫鉤），不得成為新的遊玩開關。

### 6. 顯示層變更（拆兩類）

**(a) 純資料 / i18n 新增：**

- `src/data/themes/values.json`（決策 2）。
- i18n 新增 `theme.values`：`name` / `englishShortName` / `description`（zh-TW 與 en 皆真實）。
  - **來源界定（F2）**：主題預覽描述實際由 `ThemePreview.vue` 渲染 `values.json` 的 `description.zh`（**非** i18n）；i18n 的 `theme.values.name` / `description` 目前全站無渲染出口，僅為結構對齊，故 values 名稱／描述／記憶點的**單一真實來源為 `values.json`**，i18n 不重複作為文案來源以免飄移。唯一被預覽渲染的 i18n 鍵是 `zh-TW.json` 的 `theme.values.englishShortName`（必備）。
- 硬編數字修正（已全域掃描）：
  - `src/i18n/zh-TW.json` `home.description`「五個主題，五副蓋著的卡牌…」→ 改為與主題數無關的措辭（如「挑一副蓋著的卡牌，開始今晚的對話」），避免未來新增主題又要改字。
  - `src/i18n/en.json` `home.description`「Pick one of five relationship themes…」→ 同上，改為主題數中性措辭。
  - 保留不動：`intimateModeHint`「加入 5 張…／Add 5 prompts」屬 intimate 模式語意（僅前四主題），與主題總數無關，正確不需改。

**(b) 元件邏輯改動：預期 0。** HomeView 主題清單、ThemePreview、GameView、EndView 皆以 `cardsData.themes` / i18n 鍵渲染，加入 values 後自動出現。

- **首頁定位（F1）**：`ThemeCardDeck.vue` 首頁主題卡只渲染 `name.zh`（不顯示每主題描述），與既有五主題一致；values 的六面向描述與「靈魂共振」記憶點落在主題預覽（`ThemePreview.vue` 渲染 `values.json.description`），對齊修訂後的 FR-003 / US1 AS#1，**首頁不新增描述區塊、不改元件**。
- 若 tasks 階段實測發現任一元件對「主題數」或「每主題 20 張」有硬編假設，才在 tasks 逐項列出並說明理由；本計劃預設不改元件。

### 7. 既有測試盤點（區分兩類）

**全站級假設 → 已前向相容，維持不動：**

- `cards-data.test.ts`：明列「不假設固定數量」，各檢查以 `> 0`、逐主題 filter 為準；其「既有四主題 + desire」段落以顯式 id 清單檢查，不觸及 values。維持不動。

**特定主題斷言 → 維持不動：**

- `desire-theme.test.ts`（20 張 des-###）、`useDeck.test.ts` / `gameStore.test.ts` / `gameStore.intimate.test.ts` / `gameStore.desire.test.ts` / `session-snapshot.test.ts`（皆 attraction/desire 情境的 `toHaveLength(20)`）、`FanDeck` 等——對象皆為既有主題，不受 values 影響。

**真正必須改／新增：**

- `cards-schema.test.ts`：其第 41–46 行內嵌 id 正則會 **遍歷全部卡牌**（含 val-###），必須與 validator 同步加入 `val-\d{3}`；並新增「`val-001` 接受、`val-1`/`val-0001`/`val-001-base` 拒絕」與「values 卡可省略 isIntimate」案例。`att-001` 仍應被拒（不在 des|val 白名單且無後綴）。
- 新增 `values-theme.test.ts`（比照 `desire-theme.test.ts`）：硬檢**總數 25**、每張 id `^val-\d{3}$`、四語非空；**不硬檢逐面向數量**（六面向 4/4/4/4/4/5 為規劃目標，容許 ±1）。

### 8. 內容邊界維護（CB-001～CB-005，SC-005 / SC-006）

- 邊界定義（values vs self / interaction / trust / desire）落在 spec 的 CB-001～CB-005 與 data-model 的「內容邊界」節，作為撰稿與審查依據。
- 落實機制：撰稿以 six-facet 規劃表對照；審查以 spec US3/US4 的 Acceptance 檢查（非審判、非測驗、允許差異、可保留、可再談）。此為內容審查流程，不以自動化測試逐張語氣判定（測試僅硬檢結構與總數）。

### 9. Future backlog 與文件治理（DR-004）

- **明確留待未來**：Mix 牌堆、移除前四主題 intimate、重命名既有卡牌 id——本階段皆不做，spec 已記為 future backlog。
- **文件治理任務（憲章強制，程式碼與文件須一致）**：
  - 更新 `CLAUDE.md` 第 7 行「100 張靜態卡牌（5 主題 × 20 張…）」→ 反映 6 主題、values 25 張、每主題以自身宣告張數為準。
  - 核對 `.specify/memory/constitution_zh-tw.md`：實測其為原則導向、**未硬編「100 張＝5×20」**，預期免改；若日後發現有硬編數字，須同步 `constitution.md`（雙語）。
  - 其餘 `docs/`（learning、roadmap、copywriting prompts）多為歷程或教學，非「目前仍可直接指引開發」的權威來源，可於後續批次更新，不阻擋本功能上線。

## Complexity Tracking

> 無憲章違反，無需填寫。本計劃未新增分層、抽象、牌堆策略或新規則；所有變更均為既有擴充點的最小填充。
