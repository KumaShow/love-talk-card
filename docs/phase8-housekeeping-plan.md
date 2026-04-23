# Phase 8 收尾後的維護規劃（Post-T088 Housekeeping）

## Context

`specs/001-love-talk-card-game/` 的 T001–T098（Phase 1–9）已全部完成並部署上線（workflow run #11 綠、`https://kumashow.github.io/love-talk-card/` HTTP 200 + SW 就緒）。但開發過程中有 6 項以 **placeholder 收案** 的暫時性妥協寫在 tasks.md 修訂紀錄中，另外使用者預告未來可能會做 **文案翻譯微調 / 動畫樣式調整** 等日常維護工作。

本文件的目的：

1. 把 6 項 placeholder 按「可否當下獨力完成」分批，給出明確可執行步驟與 PR 策略。
2. 為日常維護（文案、動畫、UX 微調）提供一套不用再走 `/speckit.specify` 重流程的 lightweight workflow。
3. 確保所有改動仍滿足憲章硬約束（bundle ≤200KB gzip、觸控 ≥44×44、WCAG AA、LF 換行、繁中註解、Conventional Commits、進 main 一律走 PR）。

## 當前 repo 基準

- 本地 `main` == remote `main` == `19a2dc5`（PR #9 `docs/t088-closure` merge commit）
- `docs/t088-closure` 已合併清除
- 工作區仍有 2 支 untracked 文件：`docs/speckit-sdd-cheatsheet.md`、`docs/speckit-sdd-workflow.md`（使用者未處理）
- 最新 lint：0 error、1 warning（`tests/e2e/playwright/a11y-touch-targets.spec.ts` 的 `playwright/no-eval`）

---

## Batch A — 無外部依賴、當下一支 PR 可收

**建議分支名**：`chore/phase8-housekeeping`
**預估工作量**：30–60 分鐘（不含截圖拍攝）

### A1. 補 License 宣告（`package.json` + 根目錄 `LICENSE.md`）

**動機**：目前 `package.json` 無 `license` 欄位、根目錄無 `LICENSE*`、`README.md` 的「## 授權條款」只是一段說明。對任何自動化工具（SPDX 掃描、npm publish、GitHub sidebar）而言等於未授權。

**執行**：

- `package.json` → 加 `"license": "UNLICENSED"`（SPDX 標準，表示「保留所有權利、未對外公開授權」；與 README 現況一致）。
- 根目錄新增 `LICENSE.md`，內容複製 `README.md` 的「## 授權條款」段落文字（保留作者選擇未來何時開源的彈性）。
- `README.md` 的「## 授權條款」段改為一行導向 `LICENSE.md`。

**關鍵檔案**：

- `package.json`
- `README.md`（135–139 行「授權條款」段）
- 新增 `LICENSE.md`

### A2. 清掉 `playwright/no-eval` warning

**動機**：`tests/e2e/playwright/a11y-touch-targets.spec.ts:26` 的 `page.$$eval()` 觸發 eslint plugin 警告。Copilot 沒提但一併收乾淨，讓 CI 日誌完全乾淨。

**執行**：把 `page.$$eval('button, [role="button"], a', ...)` 改成：

```ts
const locator = page.locator('button, [role="button"], a')
const rects = await locator.evaluateAll((nodes) => nodes.map((node) => { /* 原 callback 不變 */ }))
```

`locator().evaluateAll()` 在 Playwright ESLint 規則中視為合法（它的 DOM 查詢已先過 auto-wait），等於把 `no-eval` 從 anti-pattern 清單移除。

**關鍵檔案**：

- `tests/e2e/playwright/a11y-touch-targets.spec.ts:22–52`

### A3. README 截圖補齊

**動機**：`README.md:9–11` 標記「截圖待補」，拍 5 張即完成。

**執行**：

- Chrome DevTools → `Ctrl+Shift+M` → 選 iPhone 14（390×844）→ `npm run dev`。
- 依序對 5 個畫面拍 PNG：
  1. `home-idle.png`：首頁 2×2 卡堆
  2. `home-preview.png`：點心動瞬間卡堆後的預覽浮層
  3. `game-fan-deck.png`：扇形抽牌（未點卡）
  4. `game-picked-view.png`：中央卡翻開後的 overlay
  5. `end-message.png`：結束畫面
- 放到 `docs/screenshots/`（新目錄）。
- `README.md:9–11` 改寫成 Markdown 圖片引用（用相對路徑 `./docs/screenshots/*.png`）。

**關鍵檔案**：

- `README.md:9–11`
- 新增 `docs/screenshots/*.png`（5 張）

### A4. untracked `docs/speckit-sdd-*.md` 處理（**待確認**）

**狀況**：工作區有兩支使用者自己建立的 Speckit SDD 參考文件，不屬 Phase 8 產物但已存在多次 session。三個選擇：

- **(a) 納入 Batch A PR**：`git add` 這兩檔放進同一支 PR。
- **(b) 另開 `docs/speckit-notes` PR**：純文件類型分開 merge。
- **(c) 刪掉**：若僅為個人草稿、不打算進 repo。

預設推薦 **(b)**，因為這兩檔與 license/lint/截圖沒內容關聯，分 PR 讓 commit history 更乾淨。最終由使用者選擇。

---

## Batch B — 需外部資源，到位後各自開獨立 PR

這些項目現在不動；等資源到位時，每項開一支 PR。

### B1. th / ja 翻譯補齊（TH 約 79% 英文佔位、JA 100% 英文）

**分支**：`content/i18n-translations-th-ja`
**執行時機**：有可信的泰文 / 日文譯稿到位時。

**步驟**：

- 編輯 `src/data/cards.json` 全部 80 張卡的 `text.th` 與 `text.ja`。
- 跑 `npm run test -- cards-schema` 確認 schema 仍綠（T077）。
- 跑 `npx playwright test us3` 確認語言切換 E2E（T058）仍綠。
- tasks.md 修訂紀錄補一筆「翻譯補齊，取代 2026-04-22 記載的英文佔位」。

**關鍵檔案**：

- `src/data/cards.json`
- `tests/unit/utils/cards-schema.test.ts`（不必改，它已驗 `minLength: 1`）

### B2. 音效素材升級

**分支**：`chore/audio-real-assets`
**執行時機**：翻牌音效 + 背景音樂的 ogg/mp3 素材（需授權）到位。

**步驟**：

- 放入 `public/sounds/flip.{ogg,mp3}`、`public/sounds/bgm.{ogg,mp3}`。
- `useAudio.ts` 的 fallback 鏈 `[ogg, mp3, wav]` 已就緒，**不需改程式**；瀏覽器自動挑最先成功者。
- 保留 `flip.wav` / `bgm.wav` 作為絕對 fallback（老瀏覽器、授權過期等）。
- tasks.md 修訂紀錄補一筆「T073 placeholder 正式素材就緒」。
- （可選）驗證 `vite.config.ts` 的 `globPatterns` 已含 `ogg,mp3`，SW precache 會自動納入。

**關鍵檔案**：

- `public/sounds/`（新增 4 檔）
- `src/composables/useAudio.ts`（**不動**，僅驗證 fallback）
- `vite.config.ts:26`（`globPatterns` 已含 ogg/mp3）

### B3. PWA icons 向量稿替換

**分支**：`chore/pwa-icons-vector`
**執行時機**：設計師交付向量原稿時。

**步驟**：

- 用正式向量稿匯出 8 個尺寸（72/96/128/144/152/192/384/512）PNG 覆蓋 `public/icons/`。
- （可選）刪除 `scripts/generate-pwa-icons.mjs` 或保留作為應急 fallback。
- 重 build 驗 `dist/manifest.webmanifest` 引用正確、Lighthouse Installability 綠。
- tasks.md 修訂紀錄補一筆「T074 向量稿就緒」。

**關鍵檔案**：

- `public/icons/`（8 個 PNG）
- `scripts/generate-pwa-icons.mjs`（考慮是否保留）

---

## Batch C — 日常維護 workflow（沒事件就不動）

這是給「未來某天想改文案 / 微調動畫」的 **輕量流程範本**，不是現在要執行。避免每次微調都重開 speckit feature spec。

### C1. 文案 / 翻譯微調

**觸發**：想調主題 `endMessage`、UI 字串（例：返回按鈕文字）、卡牌措辭。

**流程**：

1. 分支：`content/<短描述>`（例：`content/adjust-trust-end-message`）。
2. 改 `src/data/cards.json` 或 `src/i18n/{zh-TW,en}.json`。
3. 本地跑：`npm run test -- cards-schema cards-data` + 相關 E2E（`us3-language-switch`）。
4. 開 PR → CI 綠 → Copilot review → merge。
5. 不需改 tasks.md（只有結構 / 規格層級變更才記修訂紀錄）。

### C2. 動畫 / CSS 樣式微調

**觸發**：想調 flip 時長、dismiss 方向、扇形角度、backdrop 透明度等。

**流程**：

1. 分支：`refactor(us<N>)/<短描述>`（例：`refactor(us1)/flip-duration-tune`）。
2. 改 `src/components/card/PickedCardView.vue`、`FanDeck.vue`、`FanCard.vue` 等 scoped `<style>`。
3. **同步改對應測試的 duration assertion**：
   - `tests/e2e/playwright/perf.spec.ts:133–135` 的 `expect(flipDurationMs).toBe(600)` / `expect(dismissDurationMs).toBe(460)` 必須同步新值。
   - 沒同步 → CI 會擋（這是設計）。
4. 開 PR → iPhone 14 DevTools 手動 smoke → Copilot review → merge。
5. tasks.md 修訂紀錄補一筆「T085 assertion 更新為 XXXms」。

### C3. 大幅改動（超出單檔或影響 state machine）

**觸發**：重做 overlay 互動、改路由、加新使用者故事、加第五種語言。

**流程**：回到正式 Speckit 流程——`/speckit.specify` → `/speckit.plan` → `/speckit.tasks` → `/speckit.implement`。產新 spec 資料夾 `specs/00X-<feature>/`，不改動 `001-love-talk-card-game/` 內容。

---

## 優先順序建議

```text
當下：Batch A（一支 PR 收 A1/A2/A3，A4 依使用者選擇）
 ↓
等外部資源（平行、無依賴，到位再做）：
  - B1 翻譯  B2 音效  B3 icons
 ↓
日常維護（沒觸發就不動）：
  C1 文案微調  C2 動畫微調  C3 大幅改動走 speckit
```

## 待使用者確認

| # | 問題 | 預設建議 |
|---|---|---|
| 1 | `docs/speckit-sdd-*.md` 怎麼處理？ | 獨立 `docs/speckit-notes` PR |
| 2 | Batch A 是否現在就執行？還是先留著、等要發佈時再動？ | 現在執行，收乾淨 |
| 3 | License 選 `UNLICENSED` 還是直接上 MIT？ | `UNLICENSED`（保留日後開源彈性） |
| 4 | README 截圖是否要我拍？（我可啟 dev server，但最終品質由使用者審） | 先拍一版草稿，使用者 review 後再替換 |

## Verification（執行 Batch A 後）

- `npm run lint` → **0 error、0 warning**（no-eval 已清、no-wait-for-timeout 已於 PR #8 清除）
- `npm run type-check` → 乾淨
- `npm run test` → 150+ 綠（新增 LICENSE / 截圖不影響測試）
- `npm run build` → bundle 仍 ≤200KB gzip（README 截圖放 `docs/`，不進 bundle）
- PR merge 後：workflow run 綠 + `https://kumashow.github.io/love-talk-card/` HTTP 200 + SPDX 掃描認得 license
- GitHub repo 側邊欄顯示 "UNLICENSED"（或 "No license"，均合法標示）

## 關鍵檔案速查

| 用途 | 路徑 |
|---|---|
| License 三件套 | `package.json`、`README.md:135–139`、新增 `LICENSE.md` |
| lint warning | `tests/e2e/playwright/a11y-touch-targets.spec.ts:22–52` |
| README 截圖段 | `README.md:9–11` |
| 截圖目錄 | 新增 `docs/screenshots/` |
| 翻譯 | `src/data/cards.json`（80 張 `text.th` / `text.ja`） |
| 音效 | `public/sounds/`、`src/composables/useAudio.ts`（不改） |
| PWA icons | `public/icons/`、`scripts/generate-pwa-icons.mjs` |
| 動畫 duration 測試 | `tests/e2e/playwright/perf.spec.ts:133–135` |
| Bundle 預算紀錄 | `vite.config.ts:17–25`（註解） |
| 修訂紀錄入口 | `specs/001-love-talk-card-game/tasks.md:10–18` |
