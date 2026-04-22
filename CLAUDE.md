# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Love Talk Card 是一款 Vue 3 + Vite + TypeScript 的 PWA 單頁應用，提供情侶/伴侶在手機上抽牌的對話卡牌遊戲。80 張靜態卡牌（4 主題 × 20 張，每主題含 5 張私密牌）、無後端、無帳號、Mobile-First Portrait、部署到 GitHub Pages（Vue Router Hash mode）。

## Commands

```bash
npm run dev                 # Vite 開發伺服器（http://localhost:5173）
npm run build               # vue-tsc --noEmit + vite build（型別檢查會阻擋建構）
npm run preview             # 本地預覽生產建構（含 Service Worker）

npm run lint                # ESLint（.vue, .ts）；會強制要求註解為繁體中文（自訂 zh-tw 規則）
npm run lint:fix
npm run type-check          # vue-tsc --noEmit
npm run format              # Prettier（src/）

npm run test                # Vitest 單元測試 + v8 coverage（CI 與本地皆含覆蓋率）
npm run test:watch          # TDD 監聽模式
npm run test:e2e            # Playwright E2E（配置會自動 spawn npm run dev）
npm run test:all            # Unit + E2E

# 執行單一測試檔／單一 test case：
npx vitest run tests/unit/stores/gameStore.test.ts
npx vitest run -t "startSession 固化 intimateMode"
npx playwright test tests/e2e/playwright/us1-core-gameplay.spec.ts
```

覆蓋率門檻（`vitest.config.ts`）：整體 80%；`src/composables/**` 與 `src/stores/**` 皆 95%。未達門檻 `npm run test` 會失敗。

Husky hooks：`pre-commit` 跑 `eslint`；`commit-msg` 跑 `scripts/validate-commit-message.mjs`（強制 Conventional Commits header 格式）。

## Architecture

### 資料流與分層
- **靜態資料**：`src/data/cards.json`（依 `specs/001-love-talk-card-game/contracts/card-data.schema.json` 驗證）；四語文本（`zh`、`en`、`th`、`ja`）與主題色彩寫在此檔。UI 字串另外放 `src/i18n/{zh-TW,en}.json`，不可於元件內硬編碼。
- **Pinia stores**（`src/stores/`）：
  - `gameStore`：執行期遊戲狀態。`startSession(themeId, intimateMode)` 會呼叫 `useDeck().buildDeck()` 建立並**一次性洗牌**後固化到 `deck`，並把 `intimateMode` 固化為 `intimateModeAtStart`，寫入 `sessionStorage`（key: `love-talk-game-session`）。`restoreSession()` 以 `deckOrder` 直接重建牌堆、**不重新洗牌**。
  - `settingsStore`：使用者偏好（secondaryLang、intimateMode、audio/music flags）。`toggleIntimateMode()` 僅在 `gameStore.themeId === null`（HomeView）時才作用——已開始的 session 不可改變牌組組成。
- **Composables**（`src/composables/`）：`useDeck` 封裝 filter→shuffle→draw；`useCard` 管理翻牌動畫與 500ms 動畫鎖。邏輯集中於此層以便單元測試，views 保持薄型。
- **Utils**：`shuffle.ts`（Fisher-Yates，獨立以便測試）、`theme.ts`（`validThemeIds`、`isValidThemeId` 型別守衛；router `beforeEach` 用它把無效 `themeId` 路由導回首頁）。

### 關鍵不變量
- **Filter 後再 Shuffle**：`useDeck.buildDeck` 先依 `themeId` + `intimateMode` 過濾，再對整體陣列洗牌。intimate 卡必須與基礎卡均勻混洗，絕對不可 append 到尾端（有對應的分布測試）。
- **Session 固化**：進入 GameView 後 `gameStore.intimateModeAtStart` 與 `deckOrder` 決定一切；`settingsStore.intimateMode` 的後續變更不影響當前 session。
- **Router**：`createWebHashHistory`（GitHub Pages 需求）；`/game/:themeId`、`/end/:themeId` 的 `meta.requiresValidThemeId` 交給 `beforeEach` 檢查。

### 路徑別名
`@/*` → `src/*`（`vite.config.ts` 與 `tsconfig` 已設定，優先使用）。

### 測試慣例
- E2E selector 使用 `data-test`（不是 `data-testid`）——Playwright 已設定 `testIdAttribute: 'data-test'`，Vue 元件請一致採用。
- Playwright 預設模擬 iPhone 14 Portrait（390×844）。

## Project Conventions（憲章強制）

權威來源：`.specify/memory/constitution_zh-tw.md`（繁中為準，英文 `constitution.md` 需同步）。硬性規則：

- **所有程式碼註解使用繁體中文**。ESLint `zh-tw/zh-tw-comment` rule 會把「只有英文字母、無 CJK」的註解判為 error（URL、`eslint`、`<reference` 開頭例外）。
- **所有檔案使用 LF 換行**（`.gitattributes` 強制）。
- **Commit 訊息使用 Conventional Commits**；AI 產生的訊息內容用繁體中文撰寫（例：`feat(us2): 完成私密模式開關`）。`commit-msg` hook 會擋掉不合格式的 header。
- **TDD 必要**：Red→Green→Refactor。新增 composable/store 先寫失敗測試。
- **UI 字串外部化**：所有 display 字串走 `src/i18n/*.json` 或 `cards.json`，元件內不寫死。
- **時區**：所有日期/時間預設 `Asia/Taipei`（UTC+8）。
- **觸控目標 ≥ 44×44 CSS px**；主題背景過渡 300–500ms；翻牌動畫 ≤ 600ms 且不阻擋互動。

Speckit 流程：功能規格放 `specs/###-feature-name/`，使用 `.github/prompts/speckit.*.prompt.md` 的斜線命令驅動（`/speckit.specify` → `/speckit.plan` → `/speckit.tasks` → `/speckit.implement`）。修改 `constitution.md` 時必須同步 `constitution_zh-tw.md`（以繁中為準翻成英文）。
