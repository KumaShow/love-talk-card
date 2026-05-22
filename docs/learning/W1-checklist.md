# W1 Checklist — 建地圖週

> 最後更新：2026-05-18
> 對應專案範圍：`00-project-architecture.md`、`src/stores/`、`src/composables/useDeck.ts`、`src/router/index.ts`、`src/types/index.ts`

> 目標：跑得動專案、讀懂 `00-project-architecture.md`、能用自己的話講清四個不變量。
> 預估投入：3–5 小時（可分 2–3 天）。

---

## Day 1：環境暖機 + 感受產品（約 60 分）

### Block 1 — 確認專案能跑（15 分）

- [ ] `npm run dev` 啟動，瀏覽器開 `http://localhost:5173`
- [ ] `npm run test` 跑完，看到 coverage 報告（記下整體 % 與 `composables/`、`stores/` 的 %）
- [ ] `npm run lint` 無錯誤
- [ ] **驗收**：以上三個指令都綠燈，沒有跳出未安裝套件

### Block 2 — 用使用者視角玩一輪（20 分）

開 Chrome DevTools → Application → Session Storage → 留意 `love-talk-game-session` 這個 key。

- [ ] 從首頁選一個主題 → 觀察 sessionStorage 出現 snapshot
- [ ] 翻牌 3 張 → 觀察 `drawnCardIds` 是否多 3 個 id
- [ ] **F5 重新整理頁面** → 確認牌堆順序沒變、已抽過的牌沒重來
- [ ] 抽完整副牌 → 跳到 EndView → 觀察 sessionStorage 是否還在
- [ ] 回首頁開另一個主題 → 觀察 snapshot 是否被覆蓋
- [ ] **驗收**：能用一句話解釋「重新整理為什麼牌不會重洗」（答案在不變量 2）

### Block 3 — 開私密模式對照（25 分）

- [ ] 首頁打開「私密模式」開關 → 選主題 → 進入 GameView
- [ ] 一張一張翻，數一下 20 張裡 intimate 卡（5 張）出現的位置
- [ ] **進到 GameView 後嘗試切換私密模式** → 確認牌組沒變化（不變量 3）
- [ ] 試試直接在網址列輸入 `http://localhost:5173/#/game/foo` → 應該被導回首頁（不變量 4）
- [ ] **驗收**：能講出「為什麼 GameView 中切私密模式不會生效」

---

## Day 2：精讀架構文件 + 對照 source code（約 90 分）

### Block 4 — 精讀 `00-project-architecture.md`（30 分）

- [ ] 把 `docs/learning/00-project-architecture.md` 開頭的 `YYYY-MM-DD` 改成 `2026-05-18`
- [ ] 讀完整篇，把看不懂的詞或設計動機列成清單（先不要查，列出來就好）
- [ ] **驗收**：能在白紙上憑印象畫出「分層總覽」的 6 層方塊圖

### Block 5 — 對照 `src/types/index.ts`（15 分）

`src/types/index.ts:1-71`

- [ ] 在 VSCode 把游標 hover 在 `ThemeId`、`SecondaryLang`、`CardLevel` 上看 tooltip
- [ ] 找出哪個型別是「字串字面量 union」、哪個是「interface」、哪個是「數字字面量 union」
- [ ] 想一下：為什麼 `CardLevel` 不直接用 `number`？
- [ ] **驗收**：能說出 `interface` vs `type alias` 在這個專案各自用在哪

### Block 6 — 對照 `gameStore.ts` 跑一次資料流（45 分）

對照 `00-project-architecture.md` 的「資料流（一次抽牌會發生什麼）」，逐步驗證：

- [ ] `src/stores/gameStore.ts:66-72` `startSession()` — 找出哪一行「固化」了 intimateMode
- [ ] `src/composables/useDeck.ts:32-45` `buildDeck()` — 找出 filter 與 shuffle 的順序（**這是不變量 1**）
- [ ] `src/stores/gameStore.ts:41-56` `persistSnapshot()` — 找出寫進 sessionStorage 的四個欄位
- [ ] `src/stores/gameStore.ts:87-127` `restoreSession()` — 找出「為什麼不重新洗牌」的關鍵兩行
- [ ] `src/stores/settingsStore.ts:36-43` `toggleIntimateMode()` — 找出「HomeView 才能切換」的判斷條件（**不變量 3**）
- [ ] `src/router/index.ts:34-46` `beforeEach` — 找出怎麼擋下非法 themeId（**不變量 4**）
- [ ] **驗收**：能在 source code 裡用滑鼠精準指出四個不變量各自的「實作位置」

---

## Day 3：產出與驗收（約 60 分）

### Block 7 — 用自己的話寫一遍（30 分）

開一份新檔（或直接寫在 `00-project-architecture.md` 末尾），照下面格式各寫 2–3 句：

- [ ] **不變量 1（Filter → Shuffle）**：用自己的話解釋為什麼順序很重要
- [ ] **不變量 2（Session 固化）**：為什麼 F5 後牌堆不重洗？要解釋 `deckOrder` 的角色
- [ ] **不變量 3（HomeView 才能改 intimateMode）**：為什麼這條跟不變量 2 互補？
- [ ] **不變量 4（Hash Router + 路由守衛）**：Hash mode 跟 History mode 差在哪？為什麼這個專案非 hash 不可？
- [ ] **驗收**：每條都能引用至少一個 `file:line`

### Block 8 — 跑單一測試確認理解（20 分）

- [ ] `npx vitest run tests/unit/stores/gameStore.intimate.test.ts` → 讀測試標題，預測它在驗什麼
- [ ] `npx vitest run -t "startSession 固化 intimateMode"` → 對應到不變量 2
- [ ] 隨便挑一個 test case，在 source code 改壞它（例如把 `buildDeck` 的 shuffle 拿掉），看哪個測試會紅
- [ ] **記得改回來** `git checkout src/composables/useDeck.ts`
- [ ] **驗收**：能說出「哪個測試守住哪個不變量」

### Block 9 — 寫進 interview-qa（10 分）

開 `docs/learning/interview-qa/vue-architecture.md`，補一題：

- [ ] **Q：跟我說說你的專案是怎麼設計遊戲狀態持久化的？**
  - 寫 30 秒版（3–4 句，講重點）
  - 列 2 個可能的追問（例：「為什麼用 sessionStorage 不用 localStorage？」、「為什麼 F5 不重洗牌？」）

---

## W1 完成判準

下列三題能在 60 秒內口述回答，就算完成 W1：

1. 從點擊首頁主題到看到第一張牌，資料流經過哪些檔案？（至少講出 store、composable、view 三層）
2. 為什麼私密卡不會集中在牌堆尾端？對應的測試在哪？
3. 重新整理頁面後，牌堆順序為什麼跟刷新前一致？哪一行 code 保證了這件事？

---

## 給你的小提醒

- **不要追求一次到位**：Block 7 寫不出來就先跳 Block 8，跑過測試後常常會回頭想通。
- **遇到看不懂的型別**：先 hover、再 grep 專案、最後才查 TS handbook。
- **W1 不碰 TS 細節**：型別守衛 / 泛型留到 W2，現在只要知道「有這些東西保護資料」就好。

## 延伸閱讀

- [`00-project-architecture.md`](./00-project-architecture.md) — 本週主要閱讀對象
- [`README.md`](./README.md) — 完整 4 週學習路徑（W1→W4）
- `.specify/memory/constitution_zh-tw.md` — 專案憲章（不變量背後的需求依據）
