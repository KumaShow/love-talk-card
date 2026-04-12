# Implementation Plan: Love Talk Card Game

**Branch**: `001-love-talk-card-game` | **Date**: 2025-07-18 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-love-talk-card-game/spec.md`

## Summary

Web-based 情侶對話卡牌遊戲，包含 80 張靜態卡牌（4 主題 × 20 張，其中 5 張為私密牌），支援 3D 翻牌動畫、私密模式、多語言顯示（ZH-TW / EN / TH / JA）、PWA 離線支援，以及 Mobile-first Portrait 優化 UI。技術棧：Vue 3 + Vite + TypeScript + Tailwind CSS + Pinia，部署至 GitHub Pages（Hash Mode）並透過 GitHub Actions 自動化 CI/CD。

## Technical Context

**Language/Version**: TypeScript 5.x + Node.js 20 LTS
**Primary Dependencies**: Vue 3.4+, Vite 5.x, Vue Router 4（Hash mode）, Pinia 2.x, Tailwind CSS 4.x, vite-plugin-pwa
**Storage**: sessionStorage（遊戲進度保留，session-only）；無後端、無帳號、無資料庫
**Testing**: Vitest（Unit/Integration，覆蓋率 ≥ 80%，核心路徑 95%）+ Playwright（E2E）
**Target Platform**: 現代行動瀏覽器（iOS Safari / Android Chrome），GitHub Pages 靜態部署
**Project Type**: Web Application (SPA) — PWA
**Performance Goals**: FCP < 1.5s（4G 行動網路）、TTI < 3s（中階裝置）、卡牌翻轉 60fps < 600ms
**Constraints**: 初始 bundle ≤ 200KB gzip（不含 PWA 快取資產）；無 SSR；無第三方動畫庫；無 vue-i18n 框架（自製 composable）
**Scale/Scope**: 80 張靜態卡牌、4 主題、1 SPA、3 路由視圖、1 靜態 JSON 資料檔

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | 規範要求 | 狀態 | 備註 |
|------|---------|------|------|
| 程式碼注釋語言 | 繁體中文（ZH-TW） | ✅ PASS | ESLint 自訂規則 + PR Review 強制執行 |
| Commit 訊息語言 | 繁體中文（ZH-TW） | ✅ PASS | commitlint 設定強制 |
| TDD 強制 | Red-Green-Refactor 週期 | ✅ PASS | Vitest + Playwright 已選定，CI 強制執行 |
| 測試覆蓋率 | 整體 ≥ 80%，核心路徑 ≥ 95% | ✅ PASS | Vitest coverage thresholds 設定中強制 |
| FCP < 1.5s | 4G 行動網路 | ✅ PASS | 靜態 SPA + PWA cache-first 策略，無 SSR overhead |
| TTI < 3s | 中階裝置 | ✅ PASS | Vue 3 tree-shaking，無重型依賴，bundle 精簡 |
| Bundle ≤ 200KB gzip | 不含 PWA 快取資產 | ✅ PASS | 無動畫庫、無 i18n 框架，風險可控 |
| 卡牌翻轉動畫 60fps < 600ms | CSS 3D transform | ✅ PASS | 500ms，`will-change: transform`，GPU 加速 |
| 觸控目標 ≥ 44×44px | 所有互動元素 | ✅ PASS | Tailwind `min-w-[44px] min-h-[44px]` 強制 |
| WCAG 2.1 AA | 色彩對比 ≥ 4.5:1 | ✅ PASS | 主題色碼設計時以工具驗證 |
| 主題切換 300–500ms | CSS transition | ✅ PASS | CSS custom property transition，500ms |
| 字串外部化 | 無硬碼 display 字串 | ✅ PASS | 卡牌內容在 cards.json；UI 字串在 i18n/*.json |
| LF 換行 | .gitattributes 強制 | ✅ PASS | 專案初始化時設定 .gitattributes |
| CI 強制 lint + test | 失敗阻擋 merge | ✅ PASS | GitHub Actions workflow 設計中納入 |

**Constitution Gate（Phase 0 前）**: ✅ ALL PASS — 可進入 Phase 0

**Constitution Gate（Phase 1 後，重新確認）**:

| Gate | 重新確認重點 | 狀態 |
|------|------------|------|
| Bundle ≤ 200KB gzip | 確認無 vue-i18n、無動畫庫後，Vite bundle 分析估算 | ✅ PASS |
| 觸控目標 | contracts 中 UI 元件規格明確列出 44px 最小值 | ✅ PASS |
| 字串外部化 | data-model 確認所有 UI 字串路徑 | ✅ PASS |
| 離線支援 | PWA precache 清單覆蓋 cards.json、字體、音效 | ✅ PASS |

## Project Structure

### Documentation (this feature)

```text
specs/001-love-talk-card-game/
├── plan.md              # 本文件（/speckit.plan 輸出）
├── research.md          # Phase 0 輸出
├── data-model.md        # Phase 1 輸出
├── quickstart.md        # Phase 1 輸出
├── contracts/           # Phase 1 輸出
│   ├── card-data.schema.json       # cards.json JSON Schema
│   ├── game-session.schema.json    # sessionStorage 序列化 Schema
│   └── pwa-manifest.json           # PWA Web App Manifest 規格
└── tasks.md             # Phase 2 輸出（/speckit.tasks 命令產生，非本命令輸出）
```

### Source Code (repository root)

```text
love-talk-card/                     # 專案根目錄
├── public/
│   ├── icons/                      # PWA 圖示（72/96/128/144/152/192/384/512px PNG）
│   └── sounds/                     # 音效（flip.ogg, flip.mp3, bgm.ogg, bgm.mp3）
├── src/
│   ├── assets/
│   │   ├── fonts/                  # Playfair Display WOFF2
│   │   └── images/                 # 卡背 SVG、愛心浮水印 SVG
│   ├── components/
│   │   ├── card/
│   │   │   ├── CardStack.vue       # 牌堆容器，管理點擊事件與動畫封鎖
│   │   │   ├── CardFace.vue        # 卡牌正面：題目文字、私密指示器
│   │   │   └── CardBack.vue        # 卡牌背面：統一卡背設計
│   │   ├── layout/
│   │   │   ├── AppHeader.vue       # 頂部列（語言切換、剩餘牌數、返回）
│   │   │   └── OrientationGuard.vue # 橫屏遮罩覆蓋層
│   │   └── ui/
│   │       ├── ToggleSwitch.vue    # 私密模式 / 音效開關
│   │       ├── LanguageSelector.vue # EN / TH / JA 切換
│   │       ├── ConfirmModal.vue    # 離開確認彈窗（≥8 張時）
│   │       └── EndMessage.vue      # 主題專屬結束訊息
│   ├── composables/
│   │   ├── useCard.ts              # 翻牌邏輯、isAnimating 封鎖
│   │   ├── useDeck.ts              # 洗牌（Fisher-Yates）、抽牌、進度追蹤
│   │   ├── useAudio.ts             # 翻牌音效（Web Audio API）、背景音樂（<audio>）
│   │   ├── useOrientation.ts       # 橫屏偵測（matchMedia + screen.orientation）
│   │   └── useI18n.ts              # 輕量 UI 字串 i18n（無外部框架）
│   ├── data/
│   │   └── cards.json              # 80 張卡牌靜態資料（版本化）
│   ├── i18n/
│   │   ├── zh-TW.json              # 繁體中文 UI 字串
│   │   └── en.json                 # 英文 UI 字串
│   ├── router/
│   │   └── index.ts                # Vue Router 4，Hash mode
│   ├── stores/
│   │   ├── gameStore.ts            # Pinia：主題、牌組、已抽牌、動畫狀態
│   │   └── settingsStore.ts        # Pinia：語言、音效、私密模式、剩餘牌數顯示
│   ├── types/
│   │   └── index.ts                # Card、Theme、GameSession TypeScript 型別
│   ├── views/
│   │   ├── HomeView.vue            # 首頁（主題選擇、模式設定）
│   │   ├── GameView.vue            # 遊戲畫面（抽牌主介面）
│   │   └── EndView.vue             # 結束訊息畫面
│   └── main.ts                     # 應用進入點（Vue app、Pinia、Router、PWA）
├── tests/
│   ├── unit/
│   │   ├── composables/            # useCard、useDeck、useAudio 單元測試
│   │   ├── stores/                 # gameStore、settingsStore 單元測試
│   │   └── utils/                  # 洗牌演算法、i18n fallback 測試
│   └── e2e/
│       └── playwright/             # 完整遊戲流程 E2E 測試
├── .github/
│   └── workflows/
│       └── deploy.yml              # GitHub Actions：lint + test + build + deploy
├── index.html
├── vite.config.ts                  # Vite + vite-plugin-pwa 設定
├── tailwind.config.ts
├── playwright.config.ts
├── vitest.config.ts                # 覆蓋率 thresholds 設定
├── .gitattributes                  # LF 換行強制
└── tsconfig.json
```

**Structure Decision**: 單一 Vue SPA 專案（無 backend）。所有卡牌資料以靜態 JSON 存放於 `src/data/`，PWA 全量預先快取。Composables 模式將核心邏輯（翻牌、洗牌、音效、橫屏）抽離為可獨立測試的函式單元，符合 TDD 要求。視圖層（HomeView / GameView / EndView）保持薄型，業務邏輯集中於 composables 與 stores。
