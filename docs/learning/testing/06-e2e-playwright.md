# 06 — E2E 測試（Playwright）

> 最後更新：YYYY-MM-DD
> 對應專案範圍：`playwright.config.ts`、`tests/e2e/playwright/**`

## 本章學什麼

- E2E 跟單元 / 整合測試的定位差異：什麼時候該寫 E2E。
- Playwright 的基本結構與 `data-test` selector 慣例。
- 本專案怎麼模擬 iPhone 14 Portrait。
- PWA 離線場景怎麼測（US5）。

## 專案裡的例子

### 例 1：`testIdAttribute: 'data-test'`

（查 `playwright.config.ts`，把設定片段貼進來並解釋）

```ts
// playwright.config.ts 片段
use: {
  testIdAttribute: 'data-test',
  // ...
}
```

**為什麼用 `data-test` 不用 `data-testid`？**

- Playwright 預設是 `data-testid`；本專案統一成 `data-test` 是團隊慣例（短一個字元，寫得快）。
- 只要 Vue 元件跟測試都寫 `data-test`，兩邊就對得上。
- 寫法：`page.getByTestId('theme-attraction')` → 尋找 `[data-test="theme-attraction"]` 元素。

### 例 2：模擬 iPhone 14 Portrait（390×844）

（查 `playwright.config.ts` 的 devices 或 viewport 設定，貼進來。）

```ts
// 示意
use: {
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 3,
  isMobile: true,
}
```

**為什麼？** 專案是 Mobile-First Portrait，E2E 以真實目標裝置測才有意義。

### 例 3：US1 核心抽牌流程

`tests/e2e/playwright/us1-core-gameplay.spec.ts`

典型結構：

```ts
test('抽完 15 張基礎卡應進入 EndView', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('theme-attraction').click()
  await expect(page).toHaveURL(/\/game\/attraction/)

  for (let i = 0; i < 15; i += 1) {
    await page.getByTestId('card').click()       // 翻牌
    await page.waitForTimeout(600)               // 等動畫
    await page.getByTestId('card').click()       // 下一張
  }

  await expect(page).toHaveURL(/\/end\/attraction/)
})
```

（對照實際檔案、補上真正的 selector 與 assertions。）

### 例 4：PWA 離線測試（US5）

`tests/e2e/playwright/us5-offline-pwa.spec.ts`

重點技巧：

```ts
await context.setOffline(true)
await page.reload()
// 仍可看到內容 → service worker 有生效
```

（請讀實際檔案補完整測試案例與斷言。）

## 觀念拆解

### E2E 該測什麼 / 不該測什麼

**該測**：
- 使用者完整路徑（登入、下單、抽完一副牌）。
- 跨元件 / 跨路由的互動。
- PWA / service worker / offline 這種只有真實瀏覽器能驗證的東西。

**不該測**：
- 單一 util / composable 的各種分支（那是單元測試的事）。
- 太多邊緣情境（E2E 慢，不適合 exhaustive 測試）。

### Locator 策略（Playwright 建議順序）

| 優先序 | 方法 | 用在 |
| --- | --- | --- |
| 1 | `getByRole` | 按角色（button、link、heading） |
| 2 | `getByLabel` | 表單欄位 |
| 3 | `getByText` | 文字按鈕、標題 |
| 4 | `getByTestId` | 無法靠語意找到的元素 |
| 最後 | CSS selector | 盡量避開 |

本專案普遍用 `data-test` 是為了穩定：a11y 的 role / label 可能因 i18n 變動，testId 可控。

### `npm run test:e2e` 的 auto-start

`playwright.config.ts` 裡有 `webServer: { command: 'npm run dev', ... }`。跑 E2E 時 Playwright 自己 spawn dev server，不用另開終端。

### 錄製與除錯

```bash
npx playwright test --ui          # UI mode，逐步執行
npx playwright test --debug       # 斷點 debug
npx playwright codegen http://localhost:5173  # 自動產生測試 code
```

`codegen` 對新手極友善：網頁操作 → 自動產生 selector + action code。

### 截圖 / trace 在 CI

CI 壞掉難 debug？打開 trace：

```ts
use: { trace: 'on-first-retry' }
```

CI 上第一次 retry 會產 `trace.zip`，本地 `npx playwright show-trace trace.zip` 可逐步重播。

## 容易搞混的地方

| 問題 | 解法 |
| --- | --- |
| `await` 忘寫 | 測試提早結束、誤判 pass |
| `page.waitForTimeout(500)` 滿天飛 | 寫死的等待 fragile；優先 `await expect(...).toBeVisible()` 或 `waitFor` |
| selector 用 class / id | class 改名就壞；用 `data-test` 或 role |
| 單元測試能做的硬塞 E2E | 測試變慢且不穩 |

## 延伸練習

- 練習 1：為 US2「開 intimate 模式應得 20 張牌」寫 E2E，但先思考：這件事需要 E2E 嗎？還是單元測試已經夠？
- 練習 2：跑 `npx playwright test --ui`，在 UI mode 逐步執行 `us1-core-gameplay`，觀察每步 DOM 與網路。
- 練習 3：故意斷開 service worker（或用 DevTools offline toggle），看 `us5-offline-pwa` 測試會怎麼失敗。

## 面試題模擬

### Q1：E2E 測試跟單元測試你怎麼取捨？

**答題思路**：測試金字塔 → 速度 / 成本 / 真實度 → 舉本專案具體例子。

### Q2：Playwright 的 locator 你會優先用哪種？為什麼？

**答題思路**：role → label → text → testId；穩定性與維護成本。

### Q3：PWA 離線行為怎麼測？

**答題思路**：`context.setOffline(true)` + 重載；驗 service worker 是否 serve 過 cached response。

**答案（引用本專案）**：
（預留：以 `us5-offline-pwa.spec.ts` 為例。）

### Q4：E2E 測試很慢、很不穩怎麼辦？

**答題思路**：
- 定位根因：是等待策略不對，還是真的 flaky？
- Fix：優先 `expect().toBeVisible()` / `waitFor`，不用 `waitForTimeout`。
- CI：trace + retry 一次，不要無限 retry 掩蓋真問題。

## 延伸閱讀

- [Playwright 官方文件](https://playwright.dev/)
- [Playwright — Best Practices](https://playwright.dev/docs/best-practices)
- 本專案 `tests/e2e/playwright/**`
