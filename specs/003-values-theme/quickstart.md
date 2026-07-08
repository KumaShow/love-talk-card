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
