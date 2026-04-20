# 任務：Love Talk Card Game

**功能**：`001-love-talk-card-game`
**輸入**：來自 `/specs/001-love-talk-card-game/` 的設計文件
**前置條件**：plan.md ✅、spec.md ✅、research.md ✅、data-model.md ✅、contracts/ ✅、quickstart.md ✅
**測試**：已包含 — 專案憲章與 plan.md 明確要求 TDD（Red-Green-Refactor）。Vitest 單元測試（整體覆蓋率 ≥80%、核心路徑 ≥95%）+ Playwright E2E。

**組織方式**：依使用者故事分組，方便各故事獨立實作與測試。

## 格式：`[ID] [P?] [Story] 說明`

- **[P]**：可平行執行（不同檔案、且不依賴未完成任務）
- **[Story]**：此任務所屬的使用者故事（US1–US5）
- 檔案路徑皆以儲存庫根目錄為準

---

## Phase 1：建置（共用基礎）

**目的**：初始化 Vue 3 + Vite + TypeScript 專案並設定所有開發工具。

- [x] T001 在儲存庫根目錄使用 `npm create vue@latest` 初始化 Vue 3 + Vite 5 + TypeScript 專案，並選取 Pinia、Vue Router、TypeScript、Vitest 選項
- [x] T002 [P] 在 package.json 設定所有必要依賴：vue@3.4+、vite@5、vue-router@4、pinia@2、tailwindcss@4、@tailwindcss/vite、vite-plugin-pwa、@vitejs/plugin-vue、typescript@5、vitest、@vitest/coverage-v8、@vue/test-utils、@playwright/test、eslint、@vue/eslint-config-typescript、prettier
- [x] T003 [P] 設定 tsconfig.json 的嚴格 TypeScript 選項（strict: true、noUncheckedIndexedAccess: true），並為所有匯入設定路徑別名 `@` → `src/`
- [x] T004 [P] 設定 .gitattributes，依憲章要求強制所有來源檔（*.ts、*.vue、*.json、*.md）使用 LF 換行
- [x] T005 [P] 在 eslint.config.js 設定 .vue 與 .ts 檔案的 ESLint 規則；新增規則以標記英文為主的行內註解（依憲章，程式碼註解必須使用正體中文）
- [x] T006 [P] 在 .prettierrc 設定一致的格式化規則；並在 package.json 新增 `format` 腳本：`prettier --write src/`
- [x] T007 [P] 新增 Husky commit-msg hook，檢查 commit 訊息是否符合 Conventional Commits 格式；若由 AI 產生建議，請以繁體中文撰寫內容
- [x] T008 [P] 在 tailwind.config.ts 設定 Tailwind CSS 4.x，content 路徑涵蓋 `./src/**/*.{vue,ts}`，並使用系統襯線字型堆疊：`ui-serif, Georgia, 'Times New Roman', serif`（不載入外部字型）
- [x] T009 [P] 在 vitest.config.ts 設定 Vitest 與 coverage provider v8，覆蓋率門檻：全域 lines/branches/functions ≥80%；另外將 src/composables/ 與 src/stores/ 的門檻提高至 ≥95%
- [x] T010 [P] 在 playwright.config.ts 設定 Playwright：baseURL `http://localhost:5173`、行動裝置 viewport 預設為 iPhone 14 直向（390×844px）、webServer 指向 `npm run dev`
- [x] T011 在 .github/workflows/deploy.yml 建立 GitHub Actions workflow：push 到 `main` 觸發，依序執行 lint → type-check → test → build → deploy，透過 `peaceiris/actions-gh-pages` 部署到 `gh-pages` 分支

---

## Phase 2：基礎層（阻塞前置）

**目的**：所有使用者故事都依賴的核心型別、靜態內容、路由與 store 骨架。

**⚠️ 關鍵**：此階段完成前，不可開始任何使用者故事工作。

- [x] T012 在 src/types/index.ts 建立所有 TypeScript 型別定義：`ThemeId`、`SecondaryLang`、`CardLevel`、`CardText`、`Card`、`LocalizedText`、`ThemeColors`、`EndMessage`、`Theme`、`CardsData`、`GameSessionSnapshot` — 完全對應 data-model.md 第 5 節的介面
- [x] T013 [P] 建立專案目錄結構：src/components/card/、src/components/layout/、src/components/ui/、src/composables/、src/data/、src/i18n/、src/stores/、src/types/、src/utils/、src/assets/images/、tests/unit/composables/、tests/unit/stores/、tests/unit/utils/、tests/unit/components/、tests/e2e/playwright/
- [x] T014 [P] 建立 UI 字串檔 src/i18n/zh-TW.json 與 src/i18n/en.json，涵蓋約 30 個 UI 標籤：主題名稱/描述、按鈕文字（抽牌/Draw、返回/Back、確認/Confirm、取消/Cancel）、私密模式切換標籤、語言選擇器標籤（EN/ไทย/日）、橫向提示訊息、剩餘張數標籤、結束畫面 CTA
- [x] T015 建立 src/data/cards.json，包含全部 80 個對話提示：4 個主題 ×（15 張基礎 + 5 張私密）卡牌；每張卡牌包含 `id`（格式：`{prefix}-{000}-{base|intimate}`）、`theme`、`isIntimate`、`level`（1–3）與 `text`（{zh, en, th, ja}）；各主題基礎卡牌的 level 分布為：L1×5、L2×6、L3×4；私密卡牌僅為 L2–3；必須符合 contracts/card-data.schema.json
- [x] T016 [P] 建立 src/router/index.ts，使用 Vue Router 4 hash mode（`createWebHashHistory`）：3 條路由 — `/#/` → HomeView、`/#/game/:themeId` → GameView、`/#/end/:themeId` → EndView；導覽守衛需驗證 themeId 是否為 4 個有效 ThemeId 列舉值之一
- [x] T017 [P] 建立 src/utils/shuffle.ts，實作 Fisher-Yates `shuffleArray<T>(array: T[]): T[]`（建立副本、純函式、O(n)、無副作用）；依程式碼風格要求加入正體中文 JSDoc 註解區塊
- [x] T018 [P] 建立 Pinia store 檔案骨架：src/stores/gameStore.ts 與 src/stores/settingsStore.ts，內容先為空的 `defineStore` setup 函式，僅宣告有型別的 state refs，不加入任何商業邏輯
- [x] T019 建立 src/main.ts：建立 Vue app、安裝 Pinia、安裝 Vue Router、掛載到 `#app`；並建立 index.html，內容包含 `<html lang="zh-TW">`、title "Love Talk — 對話卡牌"，以及 `<div id="app">`
- [x] T020 [P] 建立 vite.config.ts，加入 `@vitejs/plugin-vue`、路徑別名 `@/` → `src/`，以及與 hash 相容的 base：`'./'`；PWA 外掛將於 Phase 7（US5）加入

**檢查點**：基礎已就緒 — 型別、cards.json、路由、store 骨架與工具設定皆完成。現在可以開始使用者故事階段。

---

## Phase 3：使用者故事 1 — 選擇主題並抽牌（優先順序：P1）🎯 MVP

**目標**：交付完整核心遊戲流程：首頁選主題 → 背面牌堆 → 3D 翻牌動畫 → 對話提示 → 結束訊息 → 返回首頁。

**獨立測試**：選擇 "Attraction & Sparks"，依序點擊 15 張卡牌並確認不會出現重複，且每次點擊都會播放 3D 翻牌動畫；動畫進行中快速點擊會被阻擋；牌堆抽完後顯示結束訊息；返回首頁按鈕可導回首頁。

### 使用者故事 1 的測試（TDD — 必須先寫，先確認失敗再實作）

- [x] T021 [P] [US1] 在 tests/unit/utils/shuffle.test.ts 撰寫會失敗的 shuffleArray() 單元測試：分布均勻（每個元素皆只出現一次）、回傳新陣列（原陣列不變）、處理空陣列 → []、處理單一元素陣列 → [element]
- [x] T022 [P] [US1] 在 tests/unit/composables/useDeck.test.ts 撰寫會失敗的 useDeck composable 單元測試：`buildDeck(themeId, cards, false)` 回傳 15 張卡、`drawCard()` 會把 ID 加入 drawnCardIds 並推進索引、同一場 session 不會重複出現相同 card ID、當 drawnCardIds.length === deck.length 時 `isComplete` 為 true
- [x] T023 [P] [US1] 在 tests/unit/composables/useCard.test.ts 撰寫會失敗的 useCard composable 單元測試：`flipCard()` 會設為 isFlipped=true、`isAnimating` 在 500ms 期間為 true、動畫中第二次呼叫 `flipCard()` 會被忽略/阻擋、500ms 後 isAnimating 會重設為 false
- [x] T024 [P] [US1] 在 tests/unit/stores/gameStore.test.ts 撰寫會失敗的 gameStore 單元測試：`startSession(themeId, false)` 會設定 themeId 並建立 15 張牌堆、`drawCard()` 會更新 drawnCardIds 並寫入 sessionStorage key `love-talk-game-session`、`restoreSession()` 會依 stored deckOrder 重建牌堆而不重新洗牌、以及 `remainingCount`、`currentCard`、`isComplete` getters
- [x] T025 [P] [US1] 在 tests/unit/components/CardStack.test.ts 撰寫會失敗的 CardStack 元件測試：單次點擊會觸發 draw event 並顯示翻轉卡片；動畫中第二次點擊會被吃掉；動畫結束後新的點擊可以被接受

### 使用者故事 1 的實作

- [x] T026 [US1] 在 src/utils/shuffle.ts 實作 Fisher-Yates `shuffleArray<T>()` 使 T021 測試通過；保留正體中文 JSDoc
- [x] T027 [US1] 在 src/composables/useDeck.ts 實作 useDeck composable：`buildDeck(themeId, cards, intimateMode)` 先依主題與 intimateMode 過濾再洗牌，`drawCard()` 將抽到的 card ID 加入 drawnCardIds，並提供 `remainingCount` 與 `isComplete` computed；使 T022 通過
- [x] T028 [US1] 在 src/composables/useCard.ts 實作 useCard composable：`isFlipped` ref、`isAnimating` ref、`flipCard()` 先設 isAnimating=true → 翻牌 → setTimeout 500ms → isAnimating=false，並提供在動畫期間會阻擋的 `canFlip` computed；使 T023 通過
- [x] T029 [US1] 在 src/stores/gameStore.ts 實作 gameStore：`startSession(themeId, intimateModeAtStart)` 透過 useDeck 建立並洗牌牌堆，`drawCard()` 推進牌堆並將 `{themeId, deckOrder, drawnCardIds, intimateModeAtStart}` 序列化至 sessionStorage key `love-talk-game-session`，`restoreSession()` 讀取快照並依 deckOrder 重建牌堆，getters 包含 currentCard、lastDrawnCard、remainingCount、isComplete；使 T024 通過
- [x] T030 [US1] 在 src/stores/settingsStore.ts 實作初始狀態：`secondaryLang: 'en'`、`intimateMode: false`、`audioEnabled: true`、`musicEnabled: false`、`showRemainingCount: true`；僅維持 session 內狀態（不寫入 localStorage）
- [x] T031 [P] [US1] 在 src/components/card/CardBack.vue 實作卡片背面：使用 `var(--color-card-back)` CSS custom property 的統一視覺設計、裝飾圖樣、backface-visibility: hidden、-webkit-backface-visibility: hidden（iOS Safari）
- [x] T032 [P] [US1] 在 src/components/card/CardFace.vue 實作卡片正面：以大字襯線字體顯示 ZH-TW 主要文字、次要語言文字（較小，置於下方）、暫留的私密指示 slot（供 US2 填入）、backface-visibility: hidden、初始 transform: rotateY(180deg)
- [x] T033 [US1] 在 src/components/card/CardStack.vue 實作 CardStack：外層 wrapper 使用 `perspective: 1000px`，內層 `.card-inner` 使用 `transform-style: preserve-3d`、`transition: transform 500ms ease-in-out`、`will-change: transform`，`.is-flipped` 加上 `transform: rotateY(180deg)`；點擊處理會呼叫 useCard.flipCard() 並 emit `draw` 事件；使 T025 通過
- [x] T034 [P] [US1] 在 src/components/ui/EndMessage.vue 實作結束訊息：顯示 `theme.endMessage.zh` 與 `theme.endMessage.en`、使用 CSS custom properties 的主題化樣式、返回首頁按鈕具備 min-w-[44px] min-h-[44px]
- [x] T035 [P] [US1] 在 src/components/ui/ConfirmModal.vue 實作確認對話框：全螢幕背板遮罩、含確認/取消按鈕（≥44×44px）的對話框、當 drawnCardIds.length ≥ 8 且按下返回時顯示、emit `confirm` 與 `cancel` 事件、依主題色彩樣式化
- [x] T036 [US1] 在 src/components/layout/AppHeader.vue 實作 AppHeader：返回按鈕（min-h-[44px]）、剩餘張數顯示（依 settingsStore.showRemainingCount 決定）、左右 slot 版位供未來控制項使用；當 drawnCardIds.length ≥ 8 時，返回按鈕會觸發 ConfirmModal
- [x] T037 [US1] 在 src/views/HomeView.vue 實作 HomeView：以 mobile-first 直向網格顯示 4 張主題卡，每張卡顯示主題名稱（ZH-TW）與描述；點擊後呼叫 `gameStore.startSession(themeId, settingsStore.intimateMode)` 並導向 `/#/game/:themeId`；所有可點擊區域皆 ≥44×44px
- [x] T038 [US1] 在 src/views/GameView.vue 實作 GameView：從 route params 讀取 `themeId`、在 mounted 時驗證 themeId（若無效則導回 /）、渲染 AppHeader + CardStack、將 CardStack 的 `draw` 事件接到 `gameStore.drawCard()`、監聽 `gameStore.isComplete` 並導向 `/#/end/:themeId`
- [x] T039 [US1] 在 src/views/EndView.vue 實作 EndView：從 route params 讀取 `themeId`、使用 cards.json 中的 theme 資料渲染 EndMessage、返回首頁按鈕會呼叫 `gameStore.$reset()` 並導向 `/`
- [x] T040 [US1] 在 tests/e2e/playwright/us1-core-gameplay.spec.ts 撰寫完整 US1 流程的 E2E 測試：iPhone 14 viewport → 開啟 app → 選擇 "Attraction & Sparks" → 抽完 15 張卡 → 驗證沒有重複提示文字 → 驗證結束訊息可見 → 驗證返回首頁會導回 /

**檢查點**：使用者故事 1 完整可用。執行 `npm run test && npm run test:e2e -- --grep us1` 以獨立驗證 MVP。

---

## Phase 4：使用者故事 2 — 切換私密模式（優先順序：P2）

**目標**：首頁的私密模式切換會在牌堆中加入 5 張私密卡（15 → 20 張總數）；私密卡翻面後會顯示裝飾性的愛心浮水印。

**獨立測試**：開啟私密切換、進入任一主題、抽完 20 張卡，確認剛好有 5 張顯示愛心浮水印，15 張基礎卡沒有浮水印，且在 session 中途切換不會影響目前牌堆。

### 使用者故事 2 的測試（TDD — 必須先寫，先確認失敗再實作）

- [x] T041 [P] [US2] 在 tests/unit/stores/gameStore.intimate.test.ts 撰寫會失敗的私密模式邏輯單元測試：`startSession(themeId, true)` 會建立 20 張卡牌堆並包含 5 張私密卡、私密卡會隨機分布（不會全部排在最後）、即使之後切換開關，sessionStorage 快照中的 `intimateModeAtStart` 仍會反映 session 開始時的模式
- [x] T042 [P] [US2] 在 tests/unit/components/ToggleSwitch.test.ts 撰寫會失敗的 ToggleSwitch 元件測試：正確渲染 aria-checked 狀態、點擊會 emit `update:modelValue` 並切換布林值、disabled 屬性會阻止點擊事件、觸控區域 ≥44×44px

### 使用者故事 2 的實作

- [x] T043 [US2] 在 src/components/ui/ToggleSwitch.vue 實作 ToggleSwitch：動畫膠囊式切換、`v-model` 搭配 `modelValue: boolean`、label slot、`disabled` 屬性、aria-checked 屬性、min-w-[44px] min-h-[44px] 觸控區域；使 T042 通過
- [x] T044 [US2] 更新 src/stores/settingsStore.ts：新增 `toggleIntimateMode()` action — 只有在 `gameStore.themeId === null`（沒有進行中的 session）時才可作用，符合 data-model.md 的商業規則
- [x] T045 [US2] 更新 src/composables/useDeck.ts：當 `intimateModeAtStart=true` 時，將 `card.isIntimate === true` 的卡牌納入 `buildDeck()` 結果，再對全部 20 張卡一起執行 `shuffleArray()`；使 T041 通過
- [x] T046 [US2] 更新 src/stores/gameStore.ts：在 `startSession()` 被呼叫的當下，精準擷取 `settingsStore.intimateMode` 作為 `intimateModeAtStart`；並將 `intimateModeAtStart` 納入 sessionStorage 快照；使 T041 通過
- [x] T047 [US2] 更新 src/components/card/CardFace.vue：新增愛心浮水印 `<img>` 或內嵌 SVG（Heroicons heart，opacity-15），僅在 `card.isIntimate === true` 時顯示；作為裝飾性背景覆蓋層，不遮擋主要文字
- [x] T048 [US2] 更新 src/views/HomeView.vue：加入 ToggleSwitch 元件，透過 `toggleIntimateMode()` action 綁定 `settingsStore.intimateMode`；標籤："私密模式 / Intimate Mode"；放在主題網格上方
- [x] T049 [US2] 在 tests/e2e/playwright/us2-intimate-mode.spec.ts 撰寫 E2E 測試：開啟切換 → 選擇主題 → 抽 20 張卡 → 驗證有 5 張卡具有愛心浮水印 class/element → 驗證其餘 15 張沒有 → 不開啟切換重新開始 session → 驗證仍為 15 張牌堆

**檢查點**：使用者故事 1 與 2 都可運作。執行 `npm run test && npm run test:e2e -- --grep us2`。

---

## Phase 5：使用者故事 3 — 切換顯示語言（優先順序：P3）

**目標**：遊戲標頭中的語言切換控制可在英文、泰文與日文之間切換卡片次要文字；切換立即生效並持續影響後續所有卡片；若翻譯為空則回退英文。

**獨立測試**：抽一張卡（次要語言為英文），點泰文 → 目前卡片的次要文字在 1 秒內切換為泰文；抽下一張卡 → 泰文仍持續；點英文 → 回復英文。

### 使用者故事 3 的測試（TDD — 必須先寫，先確認失敗再實作）

- [ ] T050 [P] [US3] 在 tests/unit/composables/useI18n.test.ts 撰寫會失敗的 useI18n composable 單元測試：`t('home.title')` 會從 zh-TW.json 回傳 ZH-TW 字串、切換 locale 為 `'en'` 後會回傳英文、缺少 key 時回傳 key 字串（不崩潰）、composable 具備反應性（locale 變更時模板會重新渲染）
- [ ] T051 [P] [US3] 在 tests/unit/utils/card-text.test.ts 撰寫會失敗的語言回退單元測試：`getCardText(card, 'th')` 會回傳 `card.text.th`、當 `card.text.th === ''` 時回傳 `card.text.en`、當 ja 為空時 `getCardText(card, 'ja')` 會回傳 `card.text.en`、最終回退為 `card.text.zh`

### 使用者故事 3 的實作

- [ ] T052 [US3] 在 src/composables/useI18n.ts 實作 useI18n composable：反應式 `currentLocale` ref（預設為 'zh-TW'）、`t(key: string): string` 從載入的 JSON 讀取、`switchLocale(locale)` 更新 currentLocale；總實作少於 50 行；不依賴 vue-i18n；使 T050 通過
- [ ] T053 [US3] 建立 src/utils/card-text.ts，提供 `getCardText(card: Card, lang: SecondaryLang): string`：若 `card.text[lang]` 為非空字串則回傳該值，否則回退到 `card.text.en`，再否則回退 `card.text.zh`；使 T051 通過
- [ ] T054 [US3] 更新 src/stores/settingsStore.ts：新增 `setSecondaryLang(lang: SecondaryLang)` action 以更新 `secondaryLang` ref；此變更僅限 session 且立即具備反應性
- [ ] T055 [US3] 在 src/components/ui/LanguageSelector.vue 實作 LanguageSelector：3 顆按鈕群組（EN / ไทย / 日）、啟用中的按鈕以主題 primary 色彩樣式化、每個按鈕 ≥44×44px、aria-pressed 屬性、emit `select` 並帶出 SecondaryLang 值
- [ ] T056 [US3] 更新 src/components/layout/AppHeader.vue：將 LanguageSelector 整合到右側 slot，並連接到 `settingsStore.setSecondaryLang()`
- [ ] T057 [US3] 更新 src/components/card/CardFace.vue：次要文字改由 `getCardText(props.card, settingsStore.secondaryLang)` 計算；具反應性 — 在語言切換時（包含目前正在顯示的卡片）會立即更新
- [ ] T058 [US3] 在 tests/e2e/playwright/us3-language-switch.spec.ts 撰寫 E2E 測試：抽卡時為 EN → 次要文字為英文 → 點 ไทย 按鈕 → 次要文字在 1 秒內變成泰文 → 抽下一張卡 → 泰文仍持續 → 點 EN → 回復英文 → 抽出 Thai 為空文字的卡片 → 回退為英文

**檢查點**：使用者故事 1、2、3 都可運作。執行 `npm run test && npm run test:e2e -- --grep us3`。

---

## Phase 6：使用者故事 4 — 沉浸式主題氛圍（優先順序：P4）

**目標**：每個主題都會以 CSS 變數驅動的背景漸層套用其獨特色票；切換主題時會觸發平滑的 300–500ms 過場。

**獨立測試**：在 4 個主題間切換，確認每個背景漸層都符合 cards.json 中 theme.colors 規格；來回切換時過場平順、不會突然跳切。

### 使用者故事 4 的測試（TDD — 必須先寫，先確認失敗再實作）

- [ ] T059 [P] [US4] 在 tests/unit/composables/useTheme.test.ts 撰寫會失敗的 useTheme composable 單元測試：`applyTheme('attraction', themes)` 會在 `document.documentElement` 上設定 `--color-bg`、`--color-bg-end`、`--color-primary`、`--color-secondary`、`--color-text`、`--color-card-back` 這 6 個 CSS custom properties；切換主題時會更新全部 6 個屬性；cleanup 函式會重設為預設值

### 使用者故事 4 的實作

- [ ] T060 [US4] 在 src/composables/useTheme.ts 實作 useTheme composable：`applyTheme(themeId: ThemeId, themes: Theme[])` 依 id 找到主題並在 `document.documentElement` 上設定 6 個 CSS custom properties；`resetTheme()` 清除這些屬性；使 T059 通過
- [ ] T061 [US4] 在 src/assets/main.css（由 main.ts 匯入）新增全域 CSS 過場：`body, #app { transition: background-color 500ms ease-in-out, background 500ms ease-in-out; }`，並在 `#app` 上設定 `background: linear-gradient(to bottom, var(--color-bg), var(--color-bg-end));`
- [ ] T062 [US4] 更新 src/views/HomeView.vue：在 mount 時呼叫 `useTheme().resetTheme()`（中性預設色）；點擊主題卡時以 `applyTheme(selectedThemeId)` 套用主題色供路由轉場使用（桌面端可選擇性增加 hover 預覽作為漸進增強，但非核心需求）
- [ ] T063 [US4] 更新 src/views/GameView.vue：在 mounted 時依 route params 中的 themeId 呼叫 `applyTheme()` 套用對應主題色（themeId 有效性已由 T016 導覽守衛與 T038 驗證邏輯確保，無效時導回首頁而非套用預設主題）；離開時不主動清除（由目標頁面自行處理）
- [ ] T064 [US4] 更新 src/views/EndView.vue：在 mounted 時依 route params 中的 themeId 呼叫 `applyTheme()` 維持對應主題色（themeId 有效性同樣由導覽守衛確保）；從外部連結或瀏覽器重新整理直接進入時，守衛驗證通過後主題色仍正確套用；返回首頁時由 HomeView 的 `resetTheme()` 處理重設
- [ ] T065 [US4] 新增 tests/e2e/playwright/us4-theme-ambiance.spec.ts E2E 測試：驗證 4 個主題切換時背景漸層正確且過場平滑（transition duration 介於 300–500ms）；至少涵蓋：(1) 首頁選擇主題後進入 GameView 時背景色正確、(2) 返回首頁改選其他主題後背景色更新、(3) 以有效 themeId URL 直接進入 GameView 時主題色正確套用、(4) 以有效 themeId URL 直接進入 EndView 時主題色正確套用、(5) 以無效 themeId URL 進入時被導回首頁而非顯示預設主題

**檢查點**：4 個使用者故事皆可運作。執行 `npm run test && npm run test:e2e -- --grep us4`，確認 T059 單元測試與 T065 E2E 測試皆通過。

---

## Phase 7：使用者故事 5 — 離線遊玩 / PWA（優先順序：P5）

**目標**：透過 Service Worker 對所有資產做預快取，實現完整離線能力；可安裝為獨立首頁應用；提供橫向螢幕提示遮罩。

**獨立測試**：建置 → 先在線載入一次（Service Worker 已安裝）→ 離線 → 重新開啟 app → 選擇主題 → 在 3 種次要語言下抽完所有卡 → 確認所有文字在沒有網路的情況下仍正常顯示。

### 使用者故事 5 的測試（TDD — 必須先寫，先確認失敗再實作）

- [ ] T066 [P] [US5] 在 tests/unit/composables/useAudio.test.ts 撰寫會失敗的 useAudio composable 單元測試：`playFlipSound()` 會呼叫 `AudioContext.createBufferSource()` 並開始播放（以 mock AudioContext），當 `audioEnabled=false` 時 `playFlipSound()` 不做任何事，背景音樂 `<audio>` 元素預設為 muted
- [ ] T067 [P] [US5] 在 tests/unit/composables/useOrientation.test.ts 撰寫會失敗的 useOrientation composable 單元測試：當 `matchMedia('(orientation: landscape)')` 命中（mock）時 `isLandscape` 為 true、`isLandscape` 具反應性並會在 MediaQueryList change 事件時更新、unmount 時會移除事件監聽器

### 使用者故事 5 的實作

- [ ] T068 [US5] 在 src/composables/useAudio.ts 實作 useAudio composable：第一次使用者互動時才懶載入 `AudioContext`、以 `fetch()` 與 `decodeAudioData()` 載入 flip.ogg（若無則回退 flip.mp3）、`playFlipSound()` 需遵守 `settingsStore.audioEnabled`；另提供由 `settingsStore.musicEnabled` 控制的 `<audio loop muted>` 背景音樂元素；使 T066 通過
- [ ] T069 [US5] 在 src/composables/useOrientation.ts 實作 useOrientation composable：`const mq = window.matchMedia('(orientation: landscape)')`、`isLandscape` 為反應式 `ref(mq.matches)`、加入 `change` 事件監聽器更新 ref、`onUnmounted` cleanup 移除監聽器；使 T067 通過
- [ ] T070 [US5] 在 src/components/layout/OrientationGuard.vue 實作 OrientationGuard：當 `useOrientation().isLandscape === true` 時顯示 fixed-position 全螢幕遮罩（z-index: 9999）；內容包含手機旋轉 SVG 圖示與雙語提示（"請旋轉手機 / Please rotate your device"）；且不會中斷底下的遊戲狀態
- [ ] T071 [US5] 在 src/components/card/CardStack.vue 整合 useAudio：在呼叫 `useCard.flipCard()` 後立刻呼叫 `useAudio().playFlipSound()`（於翻牌處理函式內）；音效與動畫同時進行
- [ ] T072 [US5] 在 src/App.vue 將 OrientationGuard 整合為 `<RouterView>` 的持續性 overlay sibling：`<OrientationGuard />` 會顯示在所有 route view 之上
- [ ] T073 [US5] 新增音效資源：public/sounds/flip.ogg + public/sounds/flip.mp3（0.5 秒內、免版稅的卡片翻牌音效）；public/sounds/bgm.ogg + public/sounds/bgm.mp3（環境循環音樂占位）；並在 README 加入來源註記
- [ ] T074 [US5] 在 public/icons/ 產生並加入 PWA icon：72×72、96×96、128×128、144×144、152×152、192×192、384×384、512×512 PNG 檔，來源為一個 SVG（愛心/卡牌主題、透明背景單色）
- [ ] T075 [US5] 更新 vite.config.ts 加入 vite-plugin-pwa：`registerType: 'autoUpdate'`、Workbox `generateSW` 模式、`globPatterns: ['**/*.{js,css,html,json,png,svg,ogg,mp3}']`、manifest 屬性取自 contracts/pwa-manifest.json（name、short_name、display: 'standalone'、orientation: 'portrait'、background_color、theme_color、icons list）
- [ ] T076 [US5] 在 tests/e2e/playwright/us5-offline-pwa.spec.ts 撰寫 E2E 測試：`npm run build && npm run preview` → 開啟 app → 等待 Service Worker 進入 `activated` 狀態 → 將瀏覽器設為離線 → 導向 / → 選擇主題 → 抽 5 張卡 → 驗證卡片文字在 zh 與 th 都可渲染 → 驗證 console 沒有 network errors

**檢查點**：5 個使用者故事全部完成。執行 `npm run test:all` 進行完整驗證。

---

## Phase 8：優化與跨切面事項

**目的**：在所有故事之間進行品質驗證、無障礙、效能檢查與最終整合檢查。

- [ ] T077 [P] 在 Vitest 測試 tests/unit/utils/cards-schema.test.ts 中使用 ajv 驗證 src/data/cards.json 是否符合 contracts/card-data.schema.json：總卡數 80、4 個主題各自皆有 15 張基礎 + 5 張私密、所有 ID 符合 `^[a-z]+-[0-9]{3}-(base|intimate)$`、所有 `text.zh` 皆非空
- [ ] T078 [P] 在 tests/unit/stores/session-snapshot.test.ts 中使用 ajv 驗證 sessionStorage round-trip 是否符合 contracts/game-session.schema.json：開始 session → 抽 3 張卡 → 讀取 sessionStorage → 以 ajv 驗證 JSON 是否符合 schema（deckOrder 15–20 個不重複項目、drawnCardIds ⊆ deckOrder）
- [ ] T079 [P] 在 tests/unit/utils/wcag-contrast.test.ts 驗證所有 4 組主題色票的 WCAG 2.1 AA 色彩對比（≥4.5:1）：使用 WCAG 公式計算每個主題的 `text` 與 `background`、`backgroundEnd` 的對比比率；確認所有比率皆 ≥4.5
- [ ] T080 執行 `npm run build`，再使用 rollup-plugin-visualizer 或 `npx vite-bundle-visualizer` 分析 bundle：確認初始 JS+CSS bundle ≤200KB gzip（不含 PWA 預快取資產）；並在 vite.config.ts 內以註解記錄結果
- [ ] T081 [P] 檢查所有互動元素是否符合最小觸控區域：在 tests/e2e/playwright/a11y-touch-targets.spec.ts 加入 Playwright 無障礙檢查，確認 iPhone 14 viewport 下所有 `button`、`[role=button]`、`a` 元素的 bounding box 皆 ≥44×44px
- [ ] T082 執行 `npm run test:coverage` 並檢視覆蓋率報告：確認 composables/ 與 stores/ 至少 95%、整體專案至少 80%；找出任何未覆蓋的分支
- [ ] T083 [P] 針對 T082 找出的任何缺口補充單元測試 — 優先處理：session restore 邊界情況（損毀的 sessionStorage 資料 → 優雅重置）、CardStack 的快速連點動畫阻擋、語言回退鏈（th → en → zh）、ConfirmModal 取消流程
- [ ] T084 執行完整 Playwright E2E 套件 `npm run test:e2e`，涵蓋全部 5 個 spec 檔（us1 through us5 + a11y）；若有 flaky 測試，透過加入明確的 `waitFor` 斷言修正
- [ ] T085 [P] 效能煙霧測試：在 tests/e2e/playwright/perf.spec.ts 加入 Playwright 測試，使用 `page.evaluate(() => performance.getEntriesByType('navigation'))` 在模擬 4G（150ms latency、1.5Mbps）下測量 FCP < 1500ms；並確認卡片翻牌動畫 CSS duration 為 500ms（以 computed style 檢查）
- [ ] T086 端到端驗證 quickstart.md：完整依照 specs/001-love-talk-card-game/quickstart.md 的每個步驟（clone、checkout、npm install、npm run dev、npm run test、npm run build、npm run preview、PWA 離線測試）；將任何差異記錄為 issue
- [ ] T087 [P] 在儲存庫根目錄建立或更新 README.md：包含專案描述與截圖、技術堆疊、前置需求（Node 20 LTS）、安裝（`npm install`、`npm run dev`）、測試指令、建置與部署說明、specs/001-love-talk-card-game/ 連結、授權條款
- [ ] T088 推送至 `main` 分支並驗證 .github/workflows/deploy.yml 的 GitHub Actions workflow 完整通過所有工作：lint → type-check → test → build → deploy；確認線上網址可載入帶有 Service Worker 的遊戲

---

## 相依性與執行順序

### Phase 相依性

- **建置（Phase 1）**：無相依性 — 可立即開始
- **基礎層（Phase 2）**：相依於 Phase 1 完成 — **會阻塞所有使用者故事**
- **US1（Phase 3）**：相依於 Phase 2 — 不依賴 US2–US5
- **US2（Phase 4）**：相依於 Phase 2 — 會與 US1 元件（CardFace、HomeView、gameStore）整合
- **US3（Phase 5）**：相依於 Phase 2 — 會與 US1 元件（CardFace、AppHeader）整合
- **US4（Phase 6）**：相依於 Phase 2 — 會與 US1 視圖（GameView、HomeView、EndView）整合
- **US5（Phase 7）**：相依於 Phase 2 — 新增 PWA 層；useAudio 會整合到 US1 的 CardStack；OrientationGuard 為獨立元件
- **優化（Phase 8）**：相依於所有預期的使用者故事階段完成

### 使用者故事相依性

- **US1（P1）**：獨立 — 可在 Phase 2 之後立即開始
- **US2（P2）**：獨立 — 會延伸既有 US1 檔案，但不需要等 US1 完成即可開發；合併時也能順利整合
- **US3（P3）**：獨立 — 會延伸 US1 的 CardFace 與 AppHeader；useI18n 與 LanguageSelector 都是新檔案
- **US4（P4）**：獨立 — 新增 useTheme composable；HomeView、GameView、EndView 皆整合 CSS variable 綁定與主題套用；含 E2E 測試
- **US5（P5）**：獨立 — PWA 設定僅限 vite.config.ts；useAudio 與 useOrientation 都是新 composable

### 每個使用者故事內部

1. **先寫測試**：先完成所有 `[USn]` 測試任務 → 執行 `npm run test:watch` → 確認為 RED（失敗）
2. **實作**：寫最少的程式碼讓測試變成 GREEN
3. **重構**：在所有測試通過下整理程式碼
4. **提交**：使用 Conventional Commits 格式（例如：`feat(useDeck): 實作 Fisher-Yates 洗牌`）；若請 AI 代寫，請先用繁體中文構思

### 平行機會

- Phase 1：T003–T010 可在 T001–T002 完成後全部平行執行
- Phase 2：T013、T014、T016、T017、T018、T020 可在 T012（types）完成後平行執行；T015（cards.json）可與 T013 同時開始
- 每個使用者故事：標記為 [P] 的測試撰寫任務可在任何實作前平行執行
- US1 實作內部：T031、T032、T034、T035（元件檔案）可平行執行
- 跨使用者故事（多開發者）：Phase 2 之後，US1、US2、US3、US4 都可同時開發，因為大多觸及不同檔案

---

## 平行範例：使用者故事 1

```bash
# 步驟 1 — 平行啟動所有測試撰寫任務（皆為不同檔案）：
Task: "T021 — tests/unit/utils/shuffle.test.ts"
Task: "T022 — tests/unit/composables/useDeck.test.ts"
Task: "T023 — tests/unit/composables/useCard.test.ts"
Task: "T024 — tests/unit/stores/gameStore.test.ts"
Task: "T025 — tests/unit/components/CardStack.test.ts"
# → 執行 npm run test:watch → 確認全部為 RED（失敗）

# 步驟 2 — 依序實作（部分任務之間有相依）：
#   T026 (shuffle.ts) → T027 (useDeck，依賴 shuffle) → T028 (useCard) → T029 (gameStore，依賴 useDeck)

# 步驟 3 — 平行啟動獨立的元件實作：
Task: "T031 — src/components/card/CardBack.vue"
Task: "T032 — src/components/card/CardFace.vue"
Task: "T034 — src/components/ui/EndMessage.vue"
Task: "T035 — src/components/ui/ConfirmModal.vue"
```

---

## 實作策略

### 先做 MVP（僅使用者故事 1）

1. 完成 Phase 1：建置（T001–T011）
2. 完成 Phase 2：基礎層（T012–T020）— **關鍵阻塞**
3. 完成 Phase 3：使用者故事 1（T021–T040）
4. **停止並驗證**：`npm run test && npm run test:e2e -- --grep us1`
5. Demo：`npm run dev` → 在 DevTools 切換 iPhone 14 viewport → 選擇主題 → 抽完 15 張卡 → 顯示結束訊息 → 返回首頁

### 漸進式交付

1. Phase 1 + Phase 2 → 基礎完成
2. + US1 → **MVP**：核心遊戲可完整遊玩（每個主題 15 張卡，無額外功能）
3. + US2 → 私密模式：增加重玩性與關係深度
4. + US3 → 多語言：擴大至雙語情侶受眾
5. + US4 → 主題氛圍：每個主題都有完整視覺沉浸
6. + US5 → 完整 PWA：離線 + 可安裝到首頁

### 平行團隊策略（3 位開發者，Phase 2 後）

- **Dev A**：US1（T021–T040）— 優先順序最高，能立即支援 Demo
- **Dev B**：US2（T041–T049）— 可與 ToggleSwitch + settingsStore 平行開始
- **Dev C**：US3（T050–T058）— 可與 useI18n + LanguageSelector 平行開始

---

## 備註

- 所有程式碼註解都必須使用 **正體中文（ZH-TW）**
- 所有 git commit 訊息主體都必須使用 **正體中文（ZH-TW）**
- TDD 為強制要求 — 每個實作任務都要遵循 Red-Green-Refactor；在測試失敗前不得先寫程式碼
- `[P]` = 可安全平行執行（不同檔案、且不依賴同階段未完成工作）
- `[USn]` 標記可將每個任務對應到其使用者故事，便於完整追蹤
- Bundle 預算硬上限：**≤200KB gzip**（由 T080 驗證）
- 觸控目標最小尺寸：每個互動元素皆須 **44×44px**（由 T081 驗證）
- 不使用外部動畫函式庫（GSAP 等）— 僅使用純 CSS 3D transforms
- 不使用 vue-i18n — 改用自訂 `useI18n` composable（< 50 行）
- 不寫入 localStorage — 所有狀態僅限 sessionStorage 或記憶體中
