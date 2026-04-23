# 00 — 專案架構導讀

> 最後更新：YYYY-MM-DD
> 對應專案範圍：全專案

> 目的：先在腦中建立「地圖」，後面 TS / 測試章節才知道每個觀念落在哪一層。

## 本章學什麼

- Love Talk Card 整體資料流：`cards.json` → Pinia store → composable → Vue View。
- 哪些狀態「固化」、哪些狀態「即時」；為什麼要這樣切。
- 關鍵不變量（filter→shuffle、session 固化、hash router）以及它們背後的需求原因。

## 分層總覽

```
┌─────────────────────────────────────────────┐
│  Views (src/views/)                         │  UI 組裝、路由端點
├─────────────────────────────────────────────┤
│  Components (src/components/)               │  可重用的純 UI
├─────────────────────────────────────────────┤
│  Composables (src/composables/)             │  可測試的邏輯單位
│  - useDeck, useCard, useI18n, useOrientation│
├─────────────────────────────────────────────┤
│  Stores (Pinia) (src/stores/)               │  跨元件狀態
│  - gameStore (執行期), settingsStore (偏好) │
├─────────────────────────────────────────────┤
│  Utils (src/utils/)                         │  純函式工具
│  - shuffle, theme (type guard), card-text   │
├─────────────────────────────────────────────┤
│  Data / Types (src/data/, src/types/)       │  靜態資料 + 型別契約
└─────────────────────────────────────────────┘
```

## 關鍵檔案一覽

| 檔案 | 角色 |
| --- | --- |
| `src/data/cards.json` | 80 張靜態卡牌（4 主題 × 20 張，含 5 張 intimate） |
| `src/types/index.ts` | 全域型別契約（`ThemeId`, `Card`, `GameSessionSnapshot` 等） |
| `src/utils/theme.ts` | `validThemeIds` + `isValidThemeId` 型別守衛 |
| `src/utils/shuffle.ts` | Fisher-Yates 洗牌（獨立以便單測） |
| `src/composables/useDeck.ts` | 封裝 filter → shuffle → draw 流程 |
| `src/composables/useCard.ts` | 翻牌動畫與 500ms 鎖 |
| `src/stores/gameStore.ts` | 執行期遊戲狀態、sessionStorage 固化 |
| `src/stores/settingsStore.ts` | 使用者偏好（副語言、intimateMode） |
| `src/router/index.ts` | Hash mode + beforeEach 驗 themeId |

## 資料流（一次抽牌會發生什麼）

1. 使用者在 HomeView 點主題 → 進 `/game/:themeId`。
2. `gameStore.startSession(themeId, intimateMode)`：
   - 呼叫 `useDeck().buildDeck(...)`：**filter → shuffle** 後回傳牌堆。
   - 固化 `intimateModeAtStart = intimateMode`。
   - 寫入 `sessionStorage[love-talk-game-session]`。
3. GameView 顯示 `currentCard` → 使用者點擊 → `useCard.flipCard()` 鎖 500ms。
4. 翻完再點 → `gameStore.drawCard()` → 推進索引、更新 snapshot。
5. 重新整理頁面 → `restoreSession()` 讀 snapshot、依 `deckOrder` 重建（**不重洗牌**）。

## 四個關鍵不變量（務必記住）

### 不變量 1：Filter 後再 Shuffle

`src/composables/useDeck.ts:32-45`

先依 `themeId` + `intimateMode` 過濾，**再** 整體洗牌。不可 filter 後 append intimate 到尾端——intimate 卡必須與基礎卡均勻混洗。

**為什麼重要**：這是業務需求（私密卡要隨機分布在整副牌中，不是集中在最後）。有對應的分布測試在 `tests/unit/stores/gameStore.intimate.test.ts`。

### 不變量 2：Session 固化

`src/stores/gameStore.ts:66-72`

進入 GameView 後，`intimateModeAtStart` 與 `deckOrder` 決定一切；後續 `settingsStore.intimateMode` 再怎麼切換都不影響當前 session 的牌組。

**為什麼重要**：使用者途中切換模式，牌組應該保持一致（避免中途牌數驟變或出現未抽過的私密卡打斷體驗）。

### 不變量 3：HomeView 才能改 intimateMode

`src/stores/settingsStore.ts:36-43`

`settingsStore.toggleIntimateMode()` 只在 `gameStore.themeId === null`（HomeView）時才作用。

**為什麼重要**：與不變量 2 互補——如果允許進行中改設定，固化就形同虛設。

### 不變量 4：Hash Router + themeId 路由守衛

`src/router/index.ts`（`beforeEach` + `meta.requiresValidThemeId`）

Hash mode 因 GitHub Pages 部署限制；非法 `themeId` 會被 `isValidThemeId` 擋下並導回首頁。

**為什麼重要**：部署到靜態 host 必須 hash；URL 直連必須防呆。

## 路徑別名

- `@/*` → `src/*`（`vite.config.ts` 與 `tsconfig.json` 已設定）
- 寫 import 時優先用別名，不寫 `../../../`。

## 憲章硬性規則（與學習主題相關）

- 所有程式碼註解必須是繁體中文（ESLint 自訂 rule 會擋）。
- TDD：新增 composable / store 先寫失敗測試。
- Coverage 門檻：整體 80%、`composables/**` 與 `stores/**` 皆 95%。
- UI 字串必須外部化到 `src/i18n/*.json` 或 `cards.json`。

## 延伸閱讀

- `.specify/memory/constitution_zh-tw.md` — 專案憲章（權威來源）
- `specs/001-love-talk-card-game/` — 規格書、資料模型、契約測試
- 本學習系列的後續章節會反覆引用本檔的不變量編號，寫新筆記時請呼叫「不變量 N」避免重複解釋。
