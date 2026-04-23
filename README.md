# Love Talk Card 💞

情侶／伴侶在手機上抽牌的對話卡牌遊戲。80 張靜態卡牌（4 主題 × 20 張，每主題含 5 張私密牌），純前端、無帳號、Mobile-First Portrait、可安裝為 PWA 離線遊玩。

> 「每一張卡牌，是一次願意靠近彼此的邀請。」

---

## 截圖

*（截圖待補，可於 iPhone 14 DevTools 390×844 viewport 下開啟 `http://localhost:5173` 拍攝 Home / Preview / FanDeck / PickedCardView / End 五個關鍵畫面。）*

---

## 技術堆疊

| 類別 | 使用技術 |
| --- | --- |
| 核心框架 | Vue 3.5（`<script setup>` + Composition API）、Vue Router 4（`createWebHashHistory`）、Pinia 2 |
| 建構 | Vite 7、TypeScript 5.6、Tailwind CSS 4、`vite-plugin-pwa` |
| 測試 | Vitest + `@vue/test-utils`（單元 + 整合）、Playwright（E2E，iPhone 14 portrait 模擬）、ajv（契約驗證） |
| 品質 | ESLint 9、Prettier 3、Husky + 自訂 commit-msg hook（Conventional Commits） |
| 部署 | GitHub Pages（`gh-pages` 分支）+ GitHub Actions CI/CD |

---

## 前置需求

| 工具 | 最低版本 |
| --- | --- |
| Node.js | 20.x LTS |
| npm | 10.x（隨 Node 20 附帶） |
| Git | 2.40+ |
| 瀏覽器 | Chrome 108+ / Safari 16+ / Firefox 115+ |

---

## 快速開始

```bash
# 1. 安裝依賴
npm install

# 2. 啟動開發伺服器（http://localhost:5173，HMR 已啟用）
npm run dev
```

在行動裝置模擬中操作：Chrome DevTools → `Ctrl+Shift+M` → 選 iPhone 14（390×844）。

> PWA Service Worker 於開發模式預設停用，以免干擾 HMR。若要驗證離線能力請用 `npm run build && npm run preview`。

---

## 測試

```bash
# 單元 + 整合（Vitest，含 v8 覆蓋率）
# 門檻：整體 ≥80%；src/composables 與 src/stores ≥95%
npm run test
npm run test:watch          # TDD 監聽

# E2E（Playwright；iPhone 14 portrait，config 會自動起 dev server 於 5174）
npm run test:e2e

# 單元 + E2E 一次跑完
npm run test:all

# 單支測試
npx vitest run tests/unit/stores/gameStore.test.ts
npx playwright test tests/e2e/playwright/us1-core-gameplay.spec.ts
```

品質檢查：

```bash
npm run type-check   # vue-tsc --noEmit
npm run lint         # ESLint（.vue, .ts）；繁體中文註解規則 zh-tw/zh-tw-comment
npm run lint:fix
npm run format       # Prettier src/
```

Husky 於每次提交自動執行：`pre-commit`（eslint）與 `commit-msg`（Conventional Commits header 格式）。

---

## 建置與預覽

```bash
# 生產建構（vue-tsc --noEmit 會阻擋型別錯誤）
# 輸出至 dist/；bundle 預算 ≤200KB gzip（目前 ≈65KB gzip）
npm run build

# 本地預覽（含 Service Worker，http://localhost:4173）
npm run preview
```

---

## 部署

自動部署：推送到 `main` → GitHub Actions（`.github/workflows/deploy.yml`）依序執行 `lint → type-check → test → build → deploy`，透過 `peaceiris/actions-gh-pages` 把 `dist/` 推送到 `gh-pages` 分支。

手動部署：`npm run build` 後將 `dist/` 上傳到任何靜態主機；因路由採 `createWebHashHistory`，無需額外 rewrite 設定。

---

## 專案結構

```text
love-talk-card/
├── src/
│   ├── components/        # Vue 元件（home/, card/, layout/, ui/）
│   ├── composables/       # 可測試邏輯（useCard, useDeck, useTheme, useAudio, useI18n, useOrientation）
│   ├── data/cards.json    # 80 張卡牌靜態資料
│   ├── i18n/              # UI 字串（zh-TW、en）
│   ├── stores/            # Pinia（gameStore, settingsStore）
│   ├── types/index.ts     # TypeScript 型別總入口
│   ├── utils/             # 純函式工具（shuffle, theme, card-text）
│   └── views/             # 路由頁（HomeView, GameView, EndView）
├── tests/
│   ├── unit/              # Vitest 單元與元件測試
│   └── e2e/playwright/    # Playwright E2E
├── specs/001-love-talk-card-game/   # Speckit 規格文件
└── .specify/memory/       # 專案憲章（constitution）
```

---

## 專案規格文件

- [spec.md](./specs/001-love-talk-card-game/spec.md) — 使用者故事、驗收條件
- [plan.md](./specs/001-love-talk-card-game/plan.md) — 實作計劃與技術決策
- [tasks.md](./specs/001-love-talk-card-game/tasks.md) — Phase 1–9 任務清單與修訂紀錄
- [data-model.md](./specs/001-love-talk-card-game/data-model.md) — 實體、型別、狀態機
- [research.md](./specs/001-love-talk-card-game/research.md) — 技術研究決策
- [quickstart.md](./specs/001-love-talk-card-game/quickstart.md) — 開發快速上手
- [contracts/](./specs/001-love-talk-card-game/contracts/) — JSON Schema 合約
- [constitution_zh-tw.md](./.specify/memory/constitution_zh-tw.md) — 專案憲章（繁中為準）

---

## 設計規則重點（憲章）

- 所有程式碼註解使用**繁體中文**（ESLint `zh-tw/zh-tw-comment` 強制）。
- 所有檔案使用 **LF** 換行（`.gitattributes` 強制）。
- Commit 使用 **Conventional Commits**，由 `commit-msg` hook 檢查。
- 遵循 **TDD**（Red → Green → Refactor）。
- UI 字串一律來自 `src/i18n/` 或 `cards.json`，不在元件內硬編碼。
- 觸控目標 ≥44×44 CSS px；主題轉場 300–500ms；翻牌動畫 ≤600ms 且不阻擋互動。
- 時區預設 **Asia/Taipei**（UTC+8）。

---

## 授權條款

尚未指定公開授權。在作者發佈前，請勿將本專案或其衍生作品用於公開散佈、商業用途或再授權；個人學習、技術探索或貢獻 PR 歡迎隨意進行。如需商業授權或再使用，請先透過 Issue 聯繫作者。
