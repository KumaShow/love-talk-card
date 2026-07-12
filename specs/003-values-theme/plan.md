# Implementation Plan: Values Theme Technical Integration & Gameplay Flow

**Branch**: `003-values-theme` | **Date**: 2026-07-12 | **Spec**: [spec.md](./spec.md)

## Summary

本計畫將第 6 個 `values` 主題整合進既有資料驅動架構，驗證 25 張 `val-001` 至 `val-025`、無 intimate 分層的牌池，並確認首頁、預覽、遊戲、結束頁與路由流程。計畫只處理可運行的資料契約與遊玩流程；不包含卡牌文案創作、翻譯品質、語氣、主題邊界或 `content-review.md` 驗收。

## Technical Context

**Language/Version**: TypeScript 5.6、Vue 3、Vite 7
**Primary Dependencies**: Pinia、Vue Router、Zod、Tailwind CSS v4
**Data Validation**: Zod 與 AJV schema
**Testing**: Vitest（unit／coverage）、Playwright（E2E，iPhone 14 Portrait）
**Quality Gates**: `npm run type-check`、`npm run test`、`npm run lint`、`npm run build`、指定 Playwright E2E
**Constraints**: ZH-TW／en 外部化、LF、Tailwind v4、WCAG 2.1 AA、TDD；不修改 values 卡牌文案。

## Constitution Check

| 原則 | 本計畫的落實方式 | 結果 |
|---|---|---|
| 程式碼品質 | 沿用既有型別、資料與路由擴充點；文件保持 LF 與 ZH-TW 說明 | ✅ PASS |
| 測試標準 | 資料契約、牌組、router、元件、E2E 與全量品質關卡均列入任務 | ✅ PASS |
| UX 一致性 | 驗證首頁、預覽、遊戲、結束頁與 WCAG AA 色彩；不以內容品質規則取代可用性驗證 | ✅ PASS |
| 效能要求 | 不新增執行期服務、牌堆策略或元件分層；以既有資料驅動流程整合 | ✅ PASS |

## Project Structure

```text
specs/003-values-theme/
├── spec.md
├── plan.md
├── tasks.md
├── quickstart.md
├── data-model.md
└── contracts/values-theme.schema.json

src/
├── types/index.ts                 # ThemeId / VALID_THEME_IDS
├── data/index.ts                  # themeFiles 聚合
├── data/validators.ts             # val id 與 isIntimate 資料規則
├── data/themes/values.json        # 25 張 values 資料（本次不改文案）
├── router/                         # 既有 isValidThemeId guard
└── views/{HomeView,GameView,EndView}.vue

tests/
├── unit/data/values-theme*.test.ts
├── unit/composables/useDeck.test.ts
├── unit/stores/gameStore*.test.ts
├── unit/router/router.test.ts
└── e2e/playwright/us-values-*.spec.ts
```

## Technical Design

### 1. 主題註冊與資料聚合（FR-001、FR-002）

- `VALID_THEME_IDS` 納入 `values`，讓 `ThemeId`、`isValidThemeId` 與 router 共用相同來源。
- `src/data/index.ts` 載入 `values.json` 並加入 `themeFiles`；既有首頁與預覽以聚合資料顯示，不新增主題專用元件分支。
- 驗證首頁與預覽取得外部化資料欄位；不以其措辭、語氣或主題邊界作驗收。

### 2. 資料契約與 25 張牌（FR-003、FR-004、DR-001～DR-005）

- `values-theme.schema.json` 專屬契約驗證固定 25 張、`^val-\d{3}$`、level 1/2/3、主題雙語欄位、六色票與卡牌四語欄位非空。
- Zod validator 接受 `val-\d{3}`，拒絕 values 的 base/intimate 後綴；`values` 與 `desire` 一樣可省略 `isIntimate`。
- 卡數檢查以各主題資料陣列與 values 專屬 schema 為準，絕不建立「每主題 20 張」或「全站 100 張」共用限制。
- 四語欄位驗證只確保資料可供既有 i18n／卡面流程讀取；不判斷文案真實性、翻譯品質或語氣。

### 3. 單一牌池與遊戲狀態（FR-005、FR-006、FR-008）

- `useDeck.buildDeck('values', allCards, intimateMode)` 依主題選取 25 張；values 無 `isIntimate`，兩種 mode 均不得篩掉卡牌。
- `gameStore` 以 25 個 id 保存 `deckOrder`；流程不重新洗牌，抽完後進入既有結束畫面。
- `level` 僅保留既有資料欄位，不參與 intimate 或牌組篩選。

### 4. 路由、畫面與可近用性（FR-002、FR-007、FR-010）

- Home／ThemePreview／Game／End 使用既有資料驅動路徑；驗證 values 可被顯示、選擇與完成。
- router 以 `isValidThemeId` 接受 values；確認不套用 desire 成人確認守衛。
- 對 values `text`、`background`、`backgroundEnd`、`cardBack` 色票執行 WCAG 2.1 AA 對比驗證。

### 5. 既有行為回歸與文件治理（FR-009、SC-008）

- 既有四個 intimate 主題、`desire` 單一牌池與既有 id 由既有測試與全量驗證保護。
- 更新仍直接指引開發且有過時主題／卡數資訊的文件；封存文件時遵守 `docs/archive/` 的 metadata 規則。
- 最終技術驗收只對照 [spec.md](./spec.md) 的技術需求與成功條件，不讀取或建立 `content-review.md`。

## Removed Content-Review Phase

原計畫的內容邊界、逐張語氣、非審判／非測驗規則、內容覆蓋與翻譯品質審查，已自 003 的設計與相依關係移除。這些工作若有需要，將以一般 Plan 模式另行處理，且不建立 Speckit SDD 產物。

## Validation Strategy

1. 先以 schema 與 unit test 驗證 id、25 張、四語非空、無 intimate 分層與雙 mode 牌組。
2. 驗證首頁／預覽、router 與 store 的 values 整合。
3. 以兩個 E2E 情境驗證可進入、抽牌、完成 25 張與結束畫面。
4. 執行 WCAG 對比、文件治理掃描、type-check、unit test、lint、build，並記錄最終結果。

## Complexity Tracking

無需新增抽象、牌堆策略、元件分層或路由類型。values 以既有擴充點整合；本次不執行內容審查階段。
