# 測試學習章節

> 對象：Vue 前端工程師，第一次系統性學習前端測試。

## 章節目標

- 會寫並讀懂專案現有的單元測試與 E2E 測試。
- 理解「為什麼這樣測」而不只是「怎麼呼叫 API」。
- 能回答面試常見測試題：單元 vs 整合 vs E2E、mock 時機、覆蓋率意義、TDD 流程。

## 學習順序

1. [`01-vitest-basics.md`](./01-vitest-basics.md) — Vitest 基本結構
   - `describe / it / expect / beforeEach / afterEach`
2. [`02-pinia-store-testing.md`](./02-pinia-store-testing.md) — 測 Pinia store
   - 核心例子：`tests/unit/stores/gameStore.test.ts`
3. [`03-composable-testing.md`](./03-composable-testing.md) — 測 composable
   - 核心例子：`tests/unit/composables/useDeck.test.ts`、`useCard.test.ts`
4. [`04-mocks-and-timers.md`](./04-mocks-and-timers.md) — Mock、Spy、Fake timers
   - 核心例子：`useCard` 500ms 動畫鎖、`Math.random` mock（洗牌分布測）
5. [`05-coverage-and-thresholds.md`](./05-coverage-and-thresholds.md) — 覆蓋率與門檻
   - v8 provider、`/* c8 ignore */`、95% threshold 的設計動機
6. [`06-e2e-playwright.md`](./06-e2e-playwright.md) — Playwright E2E
   - `data-test` selector、iPhone 14 Portrait 模擬、CI integration

## 測試金字塔概念

```
        ┌─────────┐
        │   E2E   │    少  ← Playwright（整條路徑）
        ├─────────┤
        │  整合   │    中  ← Vitest + mount（多元件協作）
        ├─────────┤
        │  單元   │    多  ← Vitest（純函式 / composable / store）
        └─────────┘
```

- **單元測試**：最便宜、最快，覆蓋邏輯；本專案 `composables/**` 與 `stores/**` 要求 95%。
- **整合測試**：多個模組合作的測試，本專案的 store 測試常常牽動 composable，算廣義整合。
- **E2E**：最貴、最慢、最真實；保留給關鍵路徑（US1 核心抽牌流程、US2 私密模式、US3 語言切換、US5 PWA）。

## 為什麼寫測試

- **重構的安全網**：改完 code 跑一次測試就知道有沒有壞東西。
- **文件效果**：讀測試等於讀「這段 code 被怎麼用」。
- **TDD 的設計壓力**：先寫測試會強迫你想好 API，避免過度耦合。

## 先備知識

- 基本 JS：`describe`、`it`、`expect` 就是一堆函式。
- `async/await`：Playwright 全部是 async。
- 專案資料流（讀 `../00-project-architecture.md` 的四個不變量）。

## 跑測試的常用指令

```bash
npm run test                # 全部單元測試 + coverage
npm run test:watch          # TDD 監聽模式
npx vitest run <path>       # 跑單一檔
npx vitest run -t "<題名>"  # 用題名 filter
npm run test:e2e            # Playwright E2E
npm run test:all            # Unit + E2E
```
