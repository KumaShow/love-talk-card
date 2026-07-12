# Quickstart: values 主題技術整合驗證

**Feature**: `003-values-theme` | **Updated**: 2026-07-12

本文件只記錄 values 的技術整合驗證：第 6 主題註冊、25 張資料契約、無 intimate 分層、畫面／路由與完整遊玩流程。它不驗收卡牌文案、翻譯品質、主題邊界、語氣或 `content-review.md`。

## 前置

```bash
npm install
```

## 資料與單元驗證

```bash
npm run type-check
npm run test
npm run lint
```

預期結果：

- `values` 是有效 ThemeId，並已聚合至主題資料。
- `values.json` 與 values schema 通過；共有恰 25 張 `val-001` 至 `val-025`。
- 每張 values 卡的 `zh`／`en`／`th`／`ja` 欄位存在且非空；此為資料格式驗證，不是翻譯或文案品質驗收。
- values 不使用 `isIntimate`，intimate mode 開或關均建立相同 25 張牌組。
- 既有五個主題的測試持續通過。

## E2E：首頁到結束畫面

```bash
npx playwright test tests/e2e/playwright/us-values-theme.spec.ts tests/e2e/playwright/us-values-complete-flow.spec.ts
```

預期結果：

1. 首頁顯示 values，且可開啟主題預覽。
2. 使用者可進入 `/game/values`、抽牌並完成 25 張流程。
3. 完成後抵達 `/end/values`，且 values 不套用 desire 成人確認守衛。

## Build

```bash
npm run build
```

預期結果：建置成功，沒有因第 6 主題、values 資料或路由造成型別／打包錯誤。

## Final Technical Acceptance Record

| 項目 | 指令或證據 | 結果 | 日期／備註 |
|---|---|---|---|
| 第 6 主題註冊與資料聚合 | unit test | 通過 | 2026-07-12；全量 251 tests 通過 |
| 25 張、id、四語非空與無 intimate 分層 | schema + unit test | 通過 | 2026-07-12；values 專屬測試通過 |
| intimate mode 雙模式 deckOrder | store + useDeck test | 通過 | 2026-07-12；false／true 均為 25 張 |
| 首頁、預覽、遊戲、路由與結束畫面 | E2E + router test | 通過 | 2026-07-12；指定 E2E 2/2 通過 |
| WCAG AA 色彩對比 | `wcag-contrast` test | 通過 | 2026-07-12；values 三組色票均 ≥4.5:1 |
| 文件治理 | T044／T045 | 通過 | 2026-07-12；README、CLAUDE、learning architecture、roadmap 已同步 |
| type-check、unit test、lint、build | 對應 npm 指令 | 通過 | 2026-07-12；type-check、251 tests、lint、build 通過；lint 僅既有 a11y `page.$$eval` warning |

## 最終技術驗收（SC-001～SC-008）

2026-07-12 完成對照：`values` 已註冊並可由首頁進入；資料契約維持 25 張 `val-001`～`val-025`、四語欄位非空且無 intimate 分層；兩種 intimate mode 建立相同牌組；`/game/values` 與 `/end/values` 有效且不觸發 desire 成人守衛；25 張完整流程、WCAG AA 與既有回歸測試均通過。此驗收只涵蓋技術整合，不引用 `content-review.md`。

## 已知基線記錄

- 2026-07-09：Phase 1～4 的主題註冊、資料契約與基礎 unit test 已有驗收記錄。003 收斂後，這些記錄只作技術基線，不代表任何卡牌文案或內容審查已通過。
