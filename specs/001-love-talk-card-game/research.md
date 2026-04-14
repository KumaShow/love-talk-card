# Research: Love Talk Card Game

**Phase**: 0 — Outline & Research
**Branch**: `001-love-talk-card-game`
**Date**: 2025-07-18

---

## R-001: Vue 3 + Vite + TypeScript SPA 架構

**Decision**: Vue 3 Composition API + Vite 5.x + TypeScript 5.x

**Rationale**:
Vue 3 的 Composition API 讓核心邏輯（`useDeck`、`useCard`、`useAudio`）以可獨立測試的 composable 函式封裝，與 Vitest 完美搭配，符合 TDD 要求。Vite 提供極快的 HMR、原生 ESM 開發伺服器，以及 Rollup 為基礎的生產 build，tree-shaking 能力優異，確保 bundle ≤ 200KB gzip 目標可達。TypeScript 嚴格型別在多語言卡牌資料結構（`CardText`）中防止 i18n key 錯誤，並提升 IDE 開發體驗。

**Alternatives considered**:
- React 18 + Next.js：SSR 對純靜態 SPA 不必要，增加 GitHub Pages 部署複雜度；Context API 在跨元件狀態管理上較 Pinia 繁瑣
- Svelte 5 + SvelteKit：生態系較小，Playwright 整合文件成熟度略遜；團隊學習曲線
- Nuxt 3：SSR overhead 與 GitHub Pages 靜態導出配置複雜；對純靜態遊戲過度設計

---

## R-002: Tailwind CSS 樣式策略

**Decision**: Tailwind CSS 4.x，utility-first，搭配 CSS custom property 管理主題色；字體使用系統 serif 字體堆疊（無需外部載入）

**Rationale**:
Tailwind 的 JIT 編譯確保未使用的類別完全不進入 bundle，壓縮後 CSS 極小。主題色以 CSS 自訂變數（`--color-theme-bg`、`--color-theme-primary` 等）管理，主題切換只需在根元素更新 CSS 變數值，搭配 `transition` 實現 300–500ms 平滑過渡，無需 JavaScript 重新計算樣式。觸控目標 `min-w-[44px] min-h-[44px]` 可直接以 Tailwind utility class 強制執行，WCAG 合規性易於驗證。字體採系統 serif 堆疊（`font-family: ui-serif, Georgia, 'Times New Roman', serif`），零外部請求，PWA 離線完整相容。

**Alternatives considered**:
- UnoCSS：生態系較新，與 Vitest + vite-plugin-pwa 整合案例較少
- CSS Modules + CSS Variables：難以快速實現 design token 主題切換；缺乏 utility-first 的開發速度優勢
- Styled Components / Emotion：Vue 生態系中非主流，與 Tailwind 相比維護成本高

---

## R-003: CSS 3D 翻牌動畫實作

**Decision**: 純 CSS 3D transform（`rotateY`），500ms ease-in-out，`will-change: transform`，Vue `<Transition>` 觸發翻面切換

**Rationale**:
不依賴 GSAP 或任何外部動畫庫，節省約 30–50KB+ bundle 空間。CSS GPU 加速（`transform: rotateY(180deg)` + `perspective`）在主流行動瀏覽器（iOS Safari 16+、Android Chrome 108+）可穩定維持 60fps。`will-change: transform` 提前提示瀏覽器分配獨立 GPU composite layer。`isAnimating` flag 在動畫進行中（500ms）封鎖所有點擊事件，防止快速連點造成狀態不一致。

**CSS 實作要點**:
```css
/* 卡牌容器 */
.card-wrapper {
  perspective: 1000px;
}

/* 翻轉內層 */
.card-inner {
  transition: transform 500ms ease-in-out;
  transform-style: preserve-3d;
  will-change: transform;
}

/* 翻面狀態 */
.card-inner.is-flipped {
  transform: rotateY(180deg);
}

/* 正反面共用 */
.card-face,
.card-back {
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden; /* iOS Safari */
}

/* 正面朝上 */
.card-face {
  transform: rotateY(180deg);
}
```

**Alternatives considered**:
- GSAP：功能強大但 ~27KB gzip，在 200KB bundle 預算下佔比過高；對 500ms 翻牌動畫屬殺雞用牛刀
- @vueuse/motion（Framer Motion 移植）：增加額外依賴；CSS-only 方案已足夠且效能更可預測
- Web Animations API：瀏覽器支援良好，但不如純 CSS 宣告式易於維護與測試

---

## R-004: Vue Router Hash Mode + GitHub Pages 部署

**Decision**: Vue Router 4，`createWebHashHistory`（Hash mode），GitHub Pages 根目錄部署，GitHub Actions 自動化 CI/CD

**Rationale**:
GitHub Pages 為純靜態檔案伺服器，不支援 SPA History mode 的伺服器端路由回退（任意路徑返回 `index.html`）。Hash mode URL（如 `/#/game/attraction`）完全在客戶端處理，無需伺服器配置，且天然相容 GitHub Pages。GitHub Actions workflow 在 `main` push 時自動執行 lint → test → build → deploy，部署至 `gh-pages` branch。

**路由設計**:
```
/#/           → HomeView（主題選擇）
/#/game/:themeId  → GameView（遊戲畫面）
/#/end/:themeId   → EndView（結束訊息）
```

**Alternatives considered**:
- History mode + 404.html 重導技巧：URL 中的 `?/` 醜陋；refresh 仍有閃爍；脆弱
- History mode + GitHub Actions 404 hack：維護成本高，Edge Cases 多
- 靜態預渲染（vite-plugin-ssr）：對無 SEO 需求的遊戲 APP 過度設計

---

## R-005: Pinia 狀態管理策略

**Decision**: Pinia 2.x 管理全域狀態；Composition API `ref`/`computed` 管理元件局部狀態

**Rationale**:
Pinia 是 Vue 3 官方推薦的狀態管理方案，提供優秀的 TypeScript 支援與 Vue DevTools 整合。`gameStore` 維護當前主題、完整牌組（洗牌後）、已抽牌 ID 陣列、動畫封鎖旗標——並在每次抽牌後序列化核心欄位至 `sessionStorage`，實現同一瀏覽器工作階段內的進度保留。`settingsStore` 維護副語言、音效開關、私密模式、剩餘牌數顯示——均為 session-only，**不**寫入 `localStorage`（關閉頁面即消失）。

**sessionStorage 策略**:
- Key: `love-talk-game-session`
- 序列化欄位: `{ themeId, drawnCardIds, intimateModeAtStart }`
- 觸發時機: 每次成功抽牌後（`useDeck.drawCard()` 呼叫後）
- 恢復時機: `gameStore` 初始化時讀取；`themeId` 相符則還原進度

**Alternatives considered**:
- Vuex 4：boilerplate 較多，官方已建議 Vue 3 新專案改用 Pinia
- Composable-only（無 Pinia）：跨多層元件的狀態共享需手動 provide/inject，測試難度增加，devtools 整合缺失
- localStorage：用戶資料不應在不同使用情境間持久化（隱私考量）

---

## R-006: PWA 離線支援策略

**Decision**: `vite-plugin-pwa` + Workbox `generateSW` 模式，預先快取（precache）所有靜態資產

**Rationale**:
所有遊戲資源（HTML、CSS、JS chunks、`cards.json`、字體、圖示、音效）均為靜態不變的資產，適合 precache 策略——Service Worker 安裝時一次性快取全部，後續請求全走 cache-first，離線體驗與線上完全一致。`vite-plugin-pwa` 自動整合 Vite 的 asset hash 命名，生成精確的 precache manifest，避免手動維護 cache list 的錯誤風險。

**Precache 資產清單（分類）**:
- 核心：`index.html`、`manifest.webmanifest`
- JS/CSS chunks：Vite 自動 hash 命名，全量 precache
- 資料：`/src/data/cards.json`
- 音效：`flip.ogg`、`flip.mp3`（背景音樂待後期補入）
- 圖示：PWA icons（72/96/128/144/152/192/384/512px PNG）

**vite-plugin-pwa 關鍵設定**:
```typescript
// vite.config.ts
VitePWA({
  registerType: 'autoUpdate',
  workbox: {
    globPatterns: ['**/*.{js,css,html,json,png,svg,ogg,mp3}'],
  },
  manifest: {
    display: 'standalone',
    orientation: 'portrait',
    // ...（完整規格見 contracts/pwa-manifest.json）
  },
})
```

**Alternatives considered**:
- 手寫 Service Worker：彈性高但維護成本大，Workbox cache invalidation 邏輯複雜
- Offline.js：僅偵測網路狀態，不提供資產快取能力
- Next.js PWA plugin：需換框架

---

## R-007: 多語言（i18n）實作策略

**Decision**: 自製輕量 `useI18n` composable（無 vue-i18n 框架）；卡牌多語言文字直接嵌入 `cards.json`

**Rationale**:
UI 顯示字串量極少（約 25–30 個 key，含按鈕、標題、提示文字），引入 vue-i18n（~14KB gzip）增加 bundle overhead 不合理。自製 composable 讀取 `src/i18n/zh-TW.json`（繁中 UI 字串）與 `src/i18n/en.json`（英文 UI 字串），以 Vue reactive store 切換顯示語言，程式碼總量 < 50 行。卡牌本身的多語言文字（`text.zh`、`text.en`、`text.th`、`text.ja`）直接存放於卡牌資料物件，渲染時由 `settingsStore.secondaryLang` 選取對應欄位，無需複雜的路徑查找機制。

**語言回退邏輯**:
若某張卡牌的 `text[selectedLang]` 為空字串或 undefined，自動回退至 `text.en`（英文）。

**Alternatives considered**:
- vue-i18n 9.x：14KB+ 對 30 個 key 過度設計；增加學習成本與配置複雜度
- i18next：框架中立但 bundle 更大（~29KB gzip）；Vue 整合需額外插件

---

## R-008: 音效實作策略

**Decision**: Web Audio API（`AudioContext`）載入並播放翻牌音效（低延遲）；背景音樂使用 `<audio loop>` HTML 元素，預設 `muted`

**Rationale**:
Web Audio API 提供低延遲音效觸發（< 10ms），翻牌瞬間播放不會有明顯 lag。提供 OGG + MP3 雙格式確保跨瀏覽器支援（Safari 優先 MP3，Firefox 優先 OGG）。背景音樂使用 `<audio loop muted>` 元素，預設靜音避免觸犯瀏覽器自動播放政策（Autoplay Policy），使用者明確點擊音樂按鈕後才解除 mute；`settingsStore.musicEnabled` 控制開關狀態。

**音效檔案清單**:
- `public/sounds/flip.ogg` + `public/sounds/flip.mp3`（翻牌音效，< 0.5s）
- `public/sounds/bgm.ogg` + `public/sounds/bgm.mp3`（背景輕音樂，循環播放）

**Alternatives considered**:
- Howler.js：功能完整（~9KB gzip）但對翻牌音效 + 背景音樂此用途過重
- 純 `<audio>` 標籤播放翻牌音效：每次 `play()` 前需 reset `currentTime`，高頻呼叫時延遲明顯
- Tone.js：音樂創作框架，對遊戲音效完全過度設計

---

## R-009: 橫屏遮罩實作

**Decision**: `useOrientation` composable 監聽 `window.matchMedia('(orientation: landscape)')` 媒體查詢，橫屏時顯示全螢幕覆蓋層（固定定位，z-index 最高）

**Rationale**:
遊戲版面完全針對直屏優化，橫屏時卡牌高寬比失衡、文字溢出。覆蓋層顯示旋轉手機圖示與提示文字（ZH-TW + EN），**不**中斷底層遊戲狀態——恢復直屏後遮罩消失，遊戲繼續。使用 `matchMedia` 而非 `screen.orientation.type` 因其相容性更佳（特別是桌面瀏覽器測試環境）。

**Alternatives considered**:
- CSS only（`@media (orientation: landscape)`）：無法在 Vue 中動態控制遮罩的 ARIA 屬性與焦點管理
- `screen.orientation.addEventListener('change')`：iOS Safari 14 以下相容性問題

---

## R-010: 結束訊息與離開確認策略

**Decision**:
- **離開確認彈窗**：已抽 ≥ 8 張時，點擊返回首頁觸發自製 `ConfirmModal.vue`（非 `window.confirm`）
- **結束訊息**：各主題專屬結束語（ZH-TW + EN）存放於 `cards.json` 的 `themes[].endMessage` 欄位，EndView 路由讀取並顯示

**Rationale**:
自製 Modal 套用主題色、動畫、最小觸控目標，符合設計系統一致性。`window.confirm` 樣式無法客製化且在行動瀏覽器上表現不一致。結束語與主題資料共置於 `cards.json`，維護時只需更新一個檔案。

**離開條件邏輯**:
```
drawnCardIds.length < 8  → 直接返回首頁（清除 session）
drawnCardIds.length >= 8 → 顯示 ConfirmModal
  確認 → 清除 session，跳轉 HomeView
  取消 → 關閉 Modal，繼續遊戲
```

**Alternatives considered**:
- Vue Router `beforeEach` 導航守衛：難以在守衛中渲染自製 Modal
- `window.beforeunload`：僅在關閉分頁時觸發，無法處理應用內路由跳轉

---

## R-011: 剩餘牌數顯示策略

**Decision**: 剩餘牌數預設顯示（`settingsStore.showRemainingCount = true`），可點擊切換隱藏；設定 session-only

**Rationale**:
部分玩家希望保持神秘感，享受不知道還剩幾張的未知感。切換按鈕設計為小型圖示（眼睛/眼睛劃掉），放置於 AppHeader，不佔用主要畫面空間。`showRemainingCount` 由 `settingsStore` 管理，session-only，關閉頁面後恢復預設（顯示）。

---

## R-012: 卡牌內容產生策略（80 張）

**Decision**: AI 協助生成四語言卡牌內容，人工審稿，以 JSON 格式維護於 `src/data/cards.json`

**Rationale**:
規格確認卡牌內容（80 張題目的繁中/英/泰/日四語言版本）需協助撰寫。採用 AI 生成初稿可快速覆蓋四個主題與三個難度等級，人工審稿確保語意準確、文化敏感度適當。JSON 格式維護提供版本控制可追蹤性，日後新增語言只需在每張卡牌物件新增欄位。

**主題與卡牌分佈**:
| 主題 ID | 中文名稱 | 英文名稱 | 基礎牌 | 私密牌 | 合計 |
|---------|---------|---------|-------|-------|------|
| `attraction` | 心動瞬間 | Attraction & Sparks | 15 | 5 | 20 |
| `self` | 自我探索 | Self & Exploration | 15 | 5 | 20 |
| `interaction` | 互動理解 | Interaction & Understanding | 15 | 5 | 20 |
| `trust` | 信任成長 | Trust & Growth | 15 | 5 | 20 |
| **合計** | — | — | **60** | **20** | **80** |

**難度等級分佈建議（各主題基礎牌）**:
- Level 1（輕鬆）：5 張——適合暖場，話題安全
- Level 2（深入）：6 張——需要一點思考
- Level 3（深刻）：4 張——觸及核心關係議題

---

## 技術決策摘要表

| 決策 ID | 領域 | 選擇 | 關鍵理由 |
|---------|------|------|---------|
| R-001 | 框架 | Vue 3 + Vite + TS | Composable TDD 友好，tree-shaking 優異 |
| R-002 | 樣式 | Tailwind CSS 4 + CSS 變數 | JIT bundle 最小化，主題切換 CSS-only |
| R-003 | 動畫 | 純 CSS 3D transform 500ms | 無依賴，60fps GPU 加速，bundle 節省 ~30KB |
| R-004 | 路由 | Vue Router Hash mode | GitHub Pages 相容，無伺服器配置 |
| R-005 | 狀態 | Pinia + sessionStorage | session-only 語義，恢復進度，TS 支援優異 |
| R-006 | PWA | vite-plugin-pwa precache | 離線體驗 = 線上，自動 manifest 生成 |
| R-007 | i18n | 自製 composable | 30 個 key 不值得 vue-i18n 14KB 開銷 |
| R-008 | 音效 | Web Audio API + `<audio>` | 低延遲翻牌音、自動播放政策合規 |
| R-009 | 橫屏 | matchMedia composable | 跨瀏覽器相容，不中斷遊戲狀態 |
| R-010 | 離開確認 | 自製 Modal + ≥8 張門檻 | 可客製化樣式，Vue Router 友好 |
| R-011 | 剩餘牌數 | 預設顯示，可切換隱藏 | 尊重玩家偏好，session-only 設定 |
| R-012 | 卡牌內容 | AI 生成 + 人工審稿 | 快速覆蓋 80 張四語言，可版控 |
