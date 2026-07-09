# Phase 1 Quickstart: 新增 values 主題

**Feature**: `003-values-theme` | **Date**: 2026-07-08

以 TDD（紅→綠→重構）落地。以下為最小步驟與驗收清單；實際任務拆解由 `/speckit.tasks` 產出。

## 前置

```bash
npm run test:watch   # TDD 監聽
```

## 步驟（依序）

### 1. 先寫失敗測試（RED）

- 新增 `tests/unit/data/values-theme.test.ts`（比照 `desire-theme.test.ts`）：
  - `values.json` 通過 `ThemeFileSchema`。
  - `cards` 長度 **恰 25**。
  - 每張 id 符合 `^val-\d{3}$`；四語 `zh/en/th/ja` 皆非空。
- 擴充 `tests/unit/utils/cards-schema.test.ts`：
  - 內嵌 id 正則加入 `val-\d{3}` 分支（否則遍歷全卡的斷言會因 val 卡轉紅）。
  - 新增接受案例：`val-001` 可通過、可省略 `isIntimate`。
  - 新增拒絕案例：`val-1`、`val-0001`、`val-001-base`（維持無後綴不變量）；確認 `att-001` 仍被拒。

此時測試應為紅（validator 尚未放寬、values.json 尚未建立）。

### 2. 最小實作使其轉綠（GREEN）

- `src/data/validators.ts`（兩處）：
  - id 正則 → `^(des-\d{3}|val-\d{3}|(?!des-|val-)[a-z]+-\d{3}-(base|intimate))$`
  - superRefine → `if (themeFile.id === 'desire' || themeFile.id === 'values') return`
- `src/types/index.ts`：`VALID_THEME_IDS` 末端加 `'values'`。
- `src/data/index.ts`：`import values from './themes/values.json' with { type: 'json' }`；`themeFiles` 加 `values`。
- `src/data/themes/values.json`：新增 25 張（四語、`colors`、`endMessage`），對照 `contracts/values-theme.schema.json`。

### 3. i18n 與文案

- `src/i18n/zh-TW.json` 與 `en.json`：新增 `theme.values`（`name` / `englishShortName` / `description`，zh + en 真實）。
- 修正硬編數字：兩檔 `home.description` 改為與主題數無關的措辭。

### 4. 文件治理

- 更新 `CLAUDE.md` 第 7 行「100 張＝5 主題×20」敘述，改述 6 主題、values 25 張、以各主題自身宣告張數為準。
- 核對 `constitution_zh-tw.md`（實測未硬編此數，預期免改；若動到則雙語同步）。

## Phase 1 Setup 驗收記錄（T001–T003，2026-07-09）

- **T001**：`.specify/scripts/powershell/setup-tasks.ps1 -Json` 回傳 `FEATURE_DIR = D:\my-project\love-talk-card\specs\003-values-theme`，指向正確 feature。✅
- **T002**：檔案落點盤點完成——`src/types/index.ts`、`src/data/index.ts`、`src/data/validators.ts`、`src/i18n/{zh-TW,en}.json`、`tests/unit/utils/cards-schema.test.ts`、`tests/unit/utils/cardsData.spec.ts`、`tests/unit/data/cards-data.test.ts`、`tests/unit/composables/useDeck.test.ts` 皆存在；`src/data/themes/values.json`、`tests/unit/data/values-theme-contract.test.ts` 為新增檔；契約 `contracts/values-theme.schema.json` 已存在；`ajv@8` 已在 devDependencies。與 plan.md §Project Structure 一致。✅
- **T003**：基線驗證——`npm run type-check` 通過；`npm run test` 為 209/210 通過。唯一失敗為 `tests/unit/router/router.test.ts >「將無效的 themeId 導回首頁」`，於全量 coverage 執行時 5000ms timeout、單獨執行（`npx vitest run tests/unit/router/router.test.ts`）穩定通過，屬既有環境負載 flaky，與本 feature 無關；全量失敗時 vitest 未輸出覆蓋率總表。⚠️ 已知基線問題，另列後續任務處理。

## Phase 2 Foundational 驗收記錄（T004–T012，2026-07-09）

- **T004**：新增 `tests/unit/data/values-theme-contract.test.ts`，以 AJV 驗證契約接受 25 張 `val-###`、拒絕 24/26 張、`val-001-base` 與缺任一語系文案的資料。✅ 全綠。
- **T005/T006**：擴充 `cards-schema.test.ts`——`val-001` 接受、`val-1`/`val-0001`/`val-001-base`/`val-001-intimate` 拒絕、values 主題檔省略 `isIntimate` 通過、attraction 省略仍失敗。先確認紅燈（含舊正則誤放行 `val-001-base` 的案例）再轉綠。✅
- **T007**：`cards-data.test.ts` 新增逐主題卡數斷言（四主題與 desire 各 20、values 25，無共用常數）。🔴 依 TDD 保持紅燈，待 T018/T019 建立並聚合 `values.json` 後轉綠。
- **T008**：`useDeck.test.ts` 新增 `buildDeck('values', …, false/true)` 皆回傳同組 25 張的斷言。🔴 同上，待 T018/T019 轉綠。
- **T009/T010**：`src/data/validators.ts` id 正則改為 `^(des-\d{3}|val-\d{3}|(?!des-|val-)[a-z]+-\d{3}-(base|intimate))$`；`superRefine` 豁免 `values`（與 desire 並列），前四主題 intimate 規則不變。✅
- **T011**：`src/types/index.ts` 的 `VALID_THEME_IDS` 加入 `'values'`。✅
- **T012**：`cards-schema.test.ts` 與 `cardsData.spec.ts` 內嵌正則已與 validator 同步。✅
- **驗證結果**：`npm run type-check` ✅、`npm run lint` ✅（僅既有 e2e 警告）、`npm run test` 224/226——僅剩 T007/T008 兩個等待 Phase 3 資料的預期紅燈；router flaky 於本輪通過。

## Phase 3 US1 驗收記錄（T013–T023，2026-07-09）

- **T013/T014**：新增 `tests/unit/data/values-theme.test.ts`——通過 `ThemeFileSchema`、恰 25 張、id 依序 `val-001`～`val-025`、level 僅 1/2/3、全卡省略 `isIntimate`、四語非空。✅
- **T015**：`useI18n.test.ts` 驗證 zh-TW / en 的 `theme.values.{name,englishShortName,description}` 存在且非空。✅
- **T016**：`ThemePreview.test.ts` 驗證 values 預覽標題「價值觀與未來（Values）」、描述取自 `values.json` `description.zh`、涵蓋六面向關鍵字與「在生活選擇裡看見彼此靈魂共振」記憶點、不顯示成人提示。✅
- **T017**：`ThemeCardDeck.test.ts` 驗證首頁清單含 values、名稱外部化、卡面圖資源存在。✅
- **T018**：新增 `src/data/themes/values.json`——25 張（六面向 4/4/4/4/4/5：價值排序 001–004、金錢與安全感 005–008、家庭與親密邊界 009–012、生活方向 013–016、承諾與未來 017–020、社交與邊界 021–025）；level 分布 9/10/6；zh/en 為真實文案、th/ja 暫以英文鏡射佔位（th 真實文案於 T027 處理）；夜空靛紫色票通過 WCAG AA（text 對 background/backgroundEnd/cardBack、primary 對 text 皆 ≥4.5:1）。
- **T019**：`src/data/index.ts` import values 並加入 `themeFiles`。✅
- **T020/T021**：i18n 新增 `theme.values`；`home.description` 去除「五個主題」/「five relationship themes」硬編（全域掃描無殘留）。✅
- **T022/T023**：HomeView（`v-for cardsData.themes`）、ThemeCardDeck（`name.zh`）、ThemePreview（`description.zh` + i18n `englishShortName`）皆資料驅動，0 元件邏輯改動。另補 `src/assets/card-images/index.ts` 的 `values` 卡面映射（暫以 trust 視覺代用，避免 `Record<ThemeId, CardVisual>` 缺 key 造成首頁執行期錯誤）——**後續需求：values 專屬卡面美術**。
- **驗證結果**：`npm run test` 全綠 238/238（Phase 2 保留的 T007/T008 紅燈已轉綠）、覆蓋率門檻通過、`npm run lint` ✅。
- **既有問題記錄（非本 feature）**：`npm run type-check`（`vue-tsc --noEmit` 搭配 references-only 根 tsconfig）實為 no-op，未檢查任何檔案；改以 `-p tsconfig.app.json` 實測，本 feature 相關型別乾淨，但暴露既有錯誤：`useTheme.ts` TS18048×3、`utils/shuffle.ts` TS2322×2（`noUncheckedIndexedAccess`）、`data/index.ts` TS2322（JSON id 寬化為 string）。建議另開任務修復 type-check script 與既有型別錯誤。

## 驗收清單（對應 Success Criteria）

- [ ] `npm run test` 全綠且覆蓋率達門檻（SC-002 / SC-003）。
- [ ] `values-theme.test.ts` 硬檢總數 25、id、四語（SC-002）。
- [ ] `npm run dev`：首頁出現第 6 主題 values，名稱/簡述傳達「價值觀與未來」且與其他主題可辨識（SC-004）。
- [ ] 進入 values 可抽完 25 張、翻牌正常，intimateMode 開關不改變其 25 張組成（SC-003 / SC-008）。
- [ ] 切換副語言，values 的 UI 與主題文案 zh + en 皆可用（SC-007）。
- [ ] 既有五主題不變：前四主題各 5 張 intimate、desire 20 張單一牌池、無既有 id 被改名（SC-008）——既有測試維持綠。
- [ ] `npm run lint`（繁中註解）、`npm run type-check`、`npm run build` 全過。

## 常見陷阱

- **別動卡數上限**：runtime 沒有上限，改它是多餘。
- **別把 val 卡 append 尾端**：`useDeck` 一次性洗牌已涵蓋；values 無 intimate，本就無此風險。
- **別為 values 加 isIntimate 欄位**：省略即可，superRefine 已豁免。
- **level 不是篩選開關**：勿在 `useDeck` 依 level 過濾。
- **cards-schema.test.ts 的內嵌正則要同步**：它與 validator 是兩份字面量，忘了同步會誤紅。
