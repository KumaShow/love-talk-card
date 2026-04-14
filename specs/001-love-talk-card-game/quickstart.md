# Quickstart: Love Talk Card Game

**Branch**: `001-love-talk-card-game`
**Date**: 2025-07-18

---

## 前置條件

| 工具 | 最低版本 | 說明 |
|------|---------|------|
| Node.js | 20.x LTS | 開發與建構環境 |
| npm | 10.x | 套件管理（隨 Node.js 附帶） |
| Git | 2.40+ | 版本控制 |
| 現代瀏覽器 | Chrome 108+ / Safari 16+ / Firefox 115+ | 開發測試環境 |

---

## 快速開始

### 1. 克隆專案並安裝依賴

```bash
git clone https://github.com/<your-username>/love-talk-card.git
cd love-talk-card

# 切換至功能分支
git checkout 001-love-talk-card-game

# 安裝所有依賴
npm install
```

### 2. 啟動開發伺服器

```bash
npm run dev
```

開發伺服器預設在 `http://localhost:5173` 啟動，支援 HMR（熱模組替換）。

> **注意**：PWA Service Worker 在開發模式下預設停用，避免干擾 HMR。若需測試 PWA 功能，請參考下方「PWA 離線測試」章節。

### 3. 執行測試

```bash
# 執行所有單元測試（含覆蓋率報告）
npm run test

# 監聽模式（TDD 開發時使用）
npm run test:watch

# 查看覆蓋率報告（HTML 格式）
npm run test:coverage

# 執行 E2E 測試（需先啟動開發伺服器）
npm run test:e2e

# 執行所有測試（Unit + E2E）
npm run test:all
```

### 4. 程式碼品質

```bash
# ESLint 檢查
npm run lint

# ESLint 自動修復
npm run lint:fix

# TypeScript 型別檢查
npm run type-check

# 格式化（Prettier + Tailwind class 排序）
npm run format
```

### 5. 生產建構

```bash
# 建構生產版本（輸出至 dist/）
npm run build

# 預覽生產建構（本地伺服器，含 Service Worker）
npm run preview
```

---

## 完整 npm scripts 清單

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "preview": "vite preview",
    "test": "vitest run --coverage",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage --reporter=html",
    "test:e2e": "playwright test",
    "test:all": "npm run test && npm run test:e2e",
    "lint": "eslint . --ext .vue,.ts,.tsx",
    "lint:fix": "eslint . --ext .vue,.ts,.tsx --fix",
    "type-check": "vue-tsc --noEmit",
    "format": "prettier --write src/"
  }
}
```

---

## 專案結構快速導覽

```text
love-talk-card/
├── src/
│   ├── components/     ← Vue 元件（card/, layout/, ui/）
│   ├── composables/    ← 可測試邏輯單元（useCard, useDeck, useAudio...）
│   ├── data/
│   │   └── cards.json  ← 80 張卡牌靜態資料（修改此檔案更新卡牌內容）
│   ├── i18n/
│   │   ├── zh-TW.json  ← UI 字串（繁體中文）
│   │   └── en.json     ← UI 字串（英文）
│   ├── stores/
│   │   ├── gameStore.ts      ← 遊戲狀態（主題、牌組、已抽牌）
│   │   └── settingsStore.ts  ← 設定狀態（語言、音效、私密模式）
│   ├── types/
│   │   └── index.ts    ← 所有 TypeScript 型別定義（從這裡開始理解資料結構）
│   └── views/
│       ├── HomeView.vue   ← 首頁路由
│       ├── GameView.vue   ← 遊戲畫面路由
│       └── EndView.vue    ← 結束畫面路由
├── tests/
│   ├── unit/           ← Vitest 單元測試
│   └── e2e/            ← Playwright E2E 測試
└── specs/              ← 規格文件（不進入 bundle）
    └── 001-love-talk-card-game/
        ├── spec.md         ← 功能規格
        ├── plan.md         ← 實作計劃（本文件所在目錄）
        ├── research.md     ← 技術研究決策
        ├── data-model.md   ← 資料模型
        └── contracts/      ← JSON Schema 合約
```

---

## 核心開發流程（TDD）

### 新增卡牌內容

1. 編輯 `src/data/cards.json`
2. 確認符合 `specs/001-love-talk-card-game/contracts/card-data.schema.json` 規範
3. 執行 `npm run test` 驗證資料驗證測試通過

### 新增 / 修改 Composable 邏輯

遵循 **Red-Green-Refactor** 週期：

```bash
# 1. 先在 tests/unit/composables/ 寫失敗的測試
# 2. 執行確認失敗（紅燈）
npm run test:watch

# 3. 在 src/composables/ 實作最小代碼通過測試（綠燈）
# 4. 重構並確認測試仍通過
# 5. 提交（繁體中文 commit message）
git commit -m "feat(useDeck): 實作 Fisher-Yates 洗牌演算法"
```

### 新增 Vue 元件

1. 在 `tests/unit/` 建立對應測試檔
2. 使用 `@vue/test-utils` 撰寫元件行為測試
3. 實作元件（`src/components/`）
4. 確認觸控目標 ≥ 44×44px（使用 `min-w-[44px] min-h-[44px]` Tailwind class）
5. 確認所有 display 字串從 i18n 檔案讀取，無硬碼

---

## 路由結構

| 路徑 | 視圖 | 說明 |
|------|------|------|
| `/#/` | `HomeView.vue` | 主題選擇、模式設定（私密模式、語言） |
| `/#/game/:themeId` | `GameView.vue` | 遊戲主介面（抽牌、翻牌、剩餘計數） |
| `/#/end/:themeId` | `EndView.vue` | 結束訊息（主題專屬結束語、返回首頁） |

---

## 主題色彩規格

| 主題 | ID | Primary | Background | CardBack |
|------|-----|---------|-----------|---------|
| 心動瞬間 | `attraction` | `#E8A0BF` | `#FFF0F5` | `#C76D8E` |
| 自我探索 | `self` | `#A8D8EA` | `#F0F8FF` | `#5BA4C0` |
| 互動理解 | `interaction` | `#B8E0B8` | `#F0FFF0` | `#5BA05B` |
| 信任成長 | `trust` | `#D4A8E8` | `#F8F0FF` | `#8B5BB5` |

> **完整色碼規格**請參閱 `src/data/cards.json` 中各主題的 `colors` 欄位。

---

## PWA 離線測試

```bash
# 1. 建構生產版本
npm run build

# 2. 啟動本地預覽伺服器（Service Worker 已啟用）
npm run preview
# → http://localhost:4173

# 3. 在 Chrome DevTools > Application > Service Workers
#    確認 Service Worker 已安裝並啟用

# 4. 在 Network 面板切換為 Offline 模式

# 5. 重新整理頁面，確認遊戲完整可用
```

---

## 部署

### GitHub Actions 自動部署（推薦）

推送到 `main` branch 即自動觸發：

```bash
git push origin main
# → GitHub Actions 自動執行：lint → type-check → test → build → deploy to gh-pages
```

### 手動部署（測試用）

```bash
npm run build
# dist/ 目錄即為完整靜態網站，可上傳至任何靜態伺服器
```

---

## 常見問題

### Q: 翻牌動畫在 iOS Safari 卡頓？

確認卡牌元素有設定 `transform: translateZ(0)` 或 `will-change: transform` 強制 GPU 加速。iOS Safari 14 以下需加 `-webkit-backface-visibility: hidden` 前綴。

### Q: sessionStorage 恢復進度時牌序不一致？

`GameSessionSnapshot` 儲存 `deckOrder`（洗牌後完整卡牌 ID 序列），恢復時直接依此序列重建 `deck`，不重新洗牌。確認 `gameStore` 的 `restoreSession()` 方法使用 `deckOrder` 而非重新呼叫 `shuffleArray()`。

### Q: 背景音樂無法自動播放？

符合設計預期。瀏覽器的 Autoplay Policy 要求音頻需由使用者互動觸發。`<audio>` 元素預設 `muted`，使用者點擊音樂開關按鈕後呼叫 `audio.unmute()` + `audio.play()`。

### Q: 如何新增第五種語言（如韓文）？

1. 在 `src/types/index.ts` 的 `SecondaryLang` 型別新增 `'ko'`
2. 在 `cards.json` 所有卡牌物件的 `text` 欄位新增 `ko` 屬性
3. 更新 `contracts/card-data.schema.json` 的 `CardText` 定義
4. 在 `src/components/ui/LanguageSelector.vue` 新增選項
5. 在相關 i18n 檔案新增語言名稱字串

---

## 相關文件

- [功能規格](./spec.md) — 使用者故事、驗收條件
- [技術研究](./research.md) — 所有技術決策依據
- [資料模型](./data-model.md) — 實體、型別定義、狀態機
- [JSON Schema 合約](./contracts/) — 資料格式驗證規範
- [專案 Constitution](../../.specify/memory/constitution.md) — 編碼標準與架構原則
