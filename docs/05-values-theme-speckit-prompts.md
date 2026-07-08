# 05 - Values 主題 Speckit 提示詞建議

> status: draft
> purpose: 為 P1「價值觀與未來」新主題整理一套可直接複製使用的 Speckit 各階段提示詞。
> reference: 依據 `docs/04-game-direction-roadmap.md`，並參考 `docs/archive/desire-theme-speckit-prompts.md` 的流程格式。

---

## 1. 使用前共識

本次功能建議視為**新主題新增 + 最小必要資料規則放寬**，適合走 Speckit 主流程：

`/speckit.specify -> /speckit.clarify -> /speckit.plan -> /speckit.analyze -> /speckit.tasks -> /speckit.implement`

與 Desire 主題不同，這次建議在 `plan` 後補跑一次 `/speckit.analyze`。原因是 `values` 初版預計 25 張，會直接碰到既有「每主題最多 20 張」的資料驗證、契約與測試假設；先做跨文件一致性檢查，可以降低 implement 階段反覆返工。

### 本次 P1 範圍

1. 新增第 6 主題 `values / 價值觀與未來 / Values & Future`。
2. 初版卡牌數為 25 張，卡牌 id 使用 `val-001` 至 `val-025`。
3. `values` 不使用 `base` / `intimate` 後綴，也不使用 intimate 分層。
4. 題目深度以 `level 1` / `level 2` / `level 3` 表示。
5. 主題描述語氣包含「在生活選擇裡，看見彼此的靈魂共振」這類情緒記憶點。
6. 同步處理讓 `values` 25 張可通過的最小必要 schema、契約、測試與資料假設調整。

### 本次明確不做

1. 不在本階段新增 Mix 牌堆。
2. 不在本階段移除前四主題的 intimate 模式。
3. 不在本階段重新命名既有 `*-base` / `*-intimate` 卡牌 id。
4. 不在本階段把首頁 intimate 開關改成全新的深度選擇器。
5. 不順手重構整個卡牌資料架構；只處理 `values` 上線需要的最小穩定變更。

### 建議預設決策

若尚未跑 `clarify`，建議先採以下預設，避免 spec、plan、tasks 反覆漂移：

1. 正式 theme id 使用 `values`。
2. `values` 初版固定為 25 張，不再壓回 20 張。
3. 內容面向採 6 類：價值排序 4、金錢與安全感 4、家庭與親密邊界 4、生活方向 4、承諾與未來 4、社交與邊界 5。
4. 不獨立設「衝突觀與修復信念」面向，避免與 `interaction` 重疊。
5. 題目若碰到 `red flag` 或地雷，改以「底線」「不可妥協」「需要停下來重新想想的狀況」描述，避免審判或測驗口吻。
6. 四語卡牌文案需完整：繁中、英文、泰文、日文；UI/i18n 至少維持既有繁中與英文外部化格式。
7. 20 張上限放寬只做到支援 `values` 25 張，不擴大到抽樣、分組或 Mix 策略。

---

## 2. `/speckit.specify` 提示詞

用途：先定義 WHAT / WHY / 驗收條件，不談 HOW，也不急著列實作檔案。

建議直接使用：

```text
/speckit.specify

請為 love-talk-card 規劃一個新的第 6 主題功能：「values / 價值觀與未來 / Values & Future」。

背景：
- 目前遊戲已有 attraction、self、interaction、trust、desire 等主題。
- 下一步產品方向要先新增「價值觀與未來」主題，讓伴侶可以討論彼此的價值排序、金錢觀、家庭觀、生活方向、承諾觀、社交邊界與未來想像。
- 這個主題的情緒記憶點是「在生活選擇裡，看見彼此的靈魂共振」。
- 本次只做 P1：新增 values 主題，並處理 values 初版 25 張所需的最小資料規則放寬。
- 本次不做 Mix 牌堆、不移除前四主題 intimate 模式、不重新命名既有卡牌 id。

請把這次需求定義成一個新的功能規格，重點包含：
1. 為什麼需要新增 values 主題，而不是把價值觀題目分散進既有 self / interaction / trust
2. values 的產品定位、目標使用情境與適合的伴侶對話深度
3. values 與 self / interaction / trust / desire 的主題邊界差異
4. values 初版 25 張卡牌的內容面向與題數分配：
   - 價值排序 4 張
   - 金錢與安全感 4 張
   - 家庭與親密邊界 4 張
   - 生活方向 4 張
   - 承諾與未來 4 張
   - 社交與邊界 5 張
5. values 不使用 intimate 分層，也不使用 base / intimate 後綴；卡牌 id 採 val-001 至 val-025
6. 題目深度使用 level 1 / level 2 / level 3 表示
7. 若需要觸及底線或不可妥協議題，應以溫和、非審判、非測驗語氣呈現
8. 使用者在首頁、主題預覽或卡面中，應如何理解這是關於價值選擇與未來想像的主題
9. 成功條件：使用者能明確辨識 values 主題價值、25 張卡牌可正常遊玩、資料與測試不再因 20 張上限阻擋本主題

請用 Speckit spec.md 風格輸出，聚焦 WHAT / WHY / 驗收條件，不要先談實作細節、檔案路徑或具體程式方案。
```

---

## 3. `/speckit.clarify` 提示詞

用途：收斂最會影響資料形狀、測試與範圍邊界的決策。

建議直接使用：

```text
/speckit.clarify

請只針對「新增 values / 價值觀與未來主題」這個功能規格中，最容易影響後續實作、資料結構與測試策略的模糊點追問。

請優先聚焦以下幾類問題，並且每題提供 2 到 3 個合理選項讓我選：

1. values 主題初版是否確認使用 25 張，而不是為了相容舊規則壓回 20 張
2. values 的 6 個內容面向與題數分配是否定案，或是否需要保留微調空間
3. values 是否完全不使用 isIntimate / base / intimate，並以 level 表示深度
4. level 1 / level 2 / level 3 的語氣邊界應如何定義，避免變成新的 intimate 分層
5. 20 張上限要在本階段放寬到什麼程度：只支援 values 25 張、或改成所有主題無硬性上限
6. values 是否需要四語卡牌文案一次到位，或先以繁中與英文完成 MVP
7. 「靈魂共振」要出現在首頁描述、主題預覽、卡面引導，還是只作為內部文案方向
8. 本階段是否明確排除 Mix、前四主題 intimate 移除、既有 id 重新命名，並把它們列為未來功能

請避免問過度細碎的 UI 視覺問題，也不要進入具體實作方案。
我的目標是讓 spec 可以順利進入 plan。
```

---

## 4. `/speckit.plan` 提示詞

用途：把已定稿的 WHAT 翻成 HOW，列出技術影響面、資料契約與測試策略。

建議直接使用：

```text
/speckit.plan

請針對「新增第 6 主題 values / 價值觀與未來」產出技術計劃，並以本專案現況為前提：

- 現有卡牌資料來源是 src/data/themes/*.json
- 現有資料、測試或契約中可能仍有每主題最多 20 張、15 base + 5 intimate、固定主題數等假設
- values 初版需要 25 張卡牌，id 為 val-001 至 val-025
- values 不使用 intimate 分層，也不使用 base / intimate 後綴
- values 使用 level 1 / level 2 / level 3 表示題目深度
- 本次只處理 values 上線需要的最小穩定變更，不做 Mix，不移除前四主題 intimate，不重新命名既有卡牌 id
- 開發需維持繁中優先、雙語 UI 外部化、四語卡牌文案、Tailwind v4 utility-first、TDD

請在 plan 中特別涵蓋：
1. ThemeId、validThemeIds、theme 資料來源加入 values 的調整策略
2. src/data/themes/ 新增 values 主題資料時，25 張卡牌與四語文案如何通過資料完整性驗證
3. schema / contracts / validators 如何放寬每主題 20 張上限，同時保留最低可遊玩數與資料品質規則
4. values 不使用 isIntimate 時，資料模型、型別與測試如何避免誤把它套入舊 base/intimate 規則
5. level 欄位如何定義為內容深度，而不是新的遊玩篩選開關
6. 首頁、主題預覽、GameView、EndView、i18n 文案需要支援哪些 values 顯示內容
7. 既有測試中哪些是假設固定 20 張、固定主題數、固定 base/intimate 配比，應如何最小改寫
8. values 與 self / interaction / trust / desire 的內容邊界，應在哪些文件或資料驗證中維護
9. 本階段如何明確留下 Mix 與移除前四主題 intimate 的 future work，而不在本計劃內實作

請先執行 Constitution Check，確認本專案繁中註解、TDD、i18n、Tailwind v4 與文件治理要求都被納入。
請避免過度擴大範圍，不要順便重做整個卡牌資料架構。
```

---

## 5. `/speckit.analyze` 提示詞

用途：在 plan 後、tasks 前做一致性檢查，尤其檢查 25 張與舊 20 張假設是否互相打架。

建議直接使用：

```text
/speckit.analyze

請檢查「新增 values / 價值觀與未來主題」的 spec、plan、research、data-model、contracts 與 quickstart 是否一致。

請特別檢查：
1. 是否仍殘留每主題最多 20 張、固定 15 base + 5 intimate、固定主題數等舊假設
2. values 是否在所有相關文件中都使用正式 theme id values，而不是暫名或混用中文名
3. values 25 張、val-001 至 val-025、6 個內容面向、level 1/2/3 是否在 spec 與 plan 中一致
4. 是否有任何文件把 values 誤寫成需要 isIntimate、base/intimate 後綴或 intimateMode 控制
5. 是否不小心把 Mix、移除前四主題 intimate、既有卡牌 id 重新命名納入本階段
6. Success Criteria、Functional Requirements、資料模型、契約與 tasks 前置條件是否能互相追溯
7. TDD、i18n、四語文案、Tailwind v4 與文件治理要求是否被 plan 正確承接

請輸出阻塞問題、建議修正順序與可直接回補到 spec / plan 的文字。
```

---

## 6. `/speckit.tasks` 提示詞

用途：把 plan 拆成可執行任務，並守住 TDD 與範圍邊界。

建議直接使用：

```text
/speckit.tasks

請依「新增第 6 主題 values / 價值觀與未來」的 spec、plan 與 analyze 結果，產出可執行的 tasks.md。

要求：
1. 依 Phase 與 User Story 分組
2. 維持 TDD 順序：先契約 / 型別 / 資料驗證 / 單元測試，再資料、i18n、UI，最後整合驗證
3. 任務粒度以「一次 commit 可完成」為原則，不要過粗也不要過細
4. 明確標出會修改的檔案類型，例如：
   - types / constants
   - data / themes / validators
   - schema / contracts
   - i18n
   - views / components
   - unit tests / e2e tests
   - docs / content rules
5. 包含 values 25 張卡牌資料與四語文案任務
6. 包含放寬 20 張上限的最小必要測試與契約任務
7. 包含驗證 values 不走 intimateMode / isIntimate 過濾的測試任務
8. 包含首頁、主題預覽、遊戲流程與結束畫面的 values 顯示驗證
9. 包含內容邊界檢查：避免 values 與 interaction 的衝突修復題、desire 的身體親密題過度重疊
10. 明確把 Mix、移除前四主題 intimate、既有 id 重新命名列為非本階段任務，不要產生實作 task

我希望最後的 tasks 能支撐「先讓資料規則支援 values 25 張，再補 values 內容與文案，再接 UI，最後驗證完整遊玩流程」這條落地順序。
```

---

## 7. `/speckit.implement` 提示詞

用途：開始實作時，控制 agent 嚴格依 tasks 前進，避免一次把 P3 / P4 也做掉。

若要整批執行：

```text
/speckit.implement

請依 tasks.md 逐條實作「新增第 6 主題 values / 價值觀與未來」。

執行原則：
1. 嚴格依 tasks 順序進行
2. 優先完成型別、資料模型、schema、contracts 與測試，再做資料內容與 UI
3. values 主題文案需維持繁中優先、四語卡牌資料完整、UI 字串外部化
4. values 不使用 intimateMode / isIntimate / base-intimate 後綴
5. 只放寬 values 25 張所需的最小必要卡牌數規則，不實作 Mix，不移除前四主題 intimate
6. 程式碼註解使用繁體中文；樣式遵守 Tailwind v4 utility-first
7. 每完成一批任務就回報影響檔案與驗證結果
```

若要分批執行：

```text
/speckit.implement T0xx T0yy T0zz

本批只處理 values 主題的指定任務。
請只完成這批 task，避免擴散到 Mix、前四主題 intimate 移除、既有卡牌 id 重新命名或非必要重構。

完成後回報：
1. 修改了哪些檔案
2. 哪些測試已新增或更新
3. 執行了哪些驗證指令
4. 還剩哪些後續 task
```

---

## 8. 可選流程提示詞

### `/speckit.checklist`

建議在 tasks 完成後、正式 implement 前，或接近 PR 前使用。

```text
/speckit.checklist

請針對「新增 values / 價值觀與未來主題」建立 requirements checklist。

重點檢查：
1. 使用者是否能理解 values 是討論價值排序、金錢觀、家庭觀、生活方向、承諾觀與社交邊界的主題
2. values 與 self / interaction / trust / desire 的主題邊界是否清楚
3. 25 張、val-001 至 val-025、6 個內容面向、level 1/2/3 是否都可被驗收
4. values 是否沒有誤用 intimateMode、isIntimate、base/intimate 後綴
5. 20 張上限是否已被最小必要地放寬，且沒有引入 Mix 或其他未來功能
6. UI 字串是否外部化，卡牌文案是否符合四語資料要求
7. 測試是否覆蓋資料完整性、牌堆建立、主題入口與完整遊玩流程
```

### `/speckit.taskstoissues`

只有多人協作或需要 GitHub Issues 追蹤時再使用。

```text
/speckit.taskstoissues

請把「新增 values / 價值觀與未來主題」的 tasks.md 轉成 GitHub Issues。

請保留 Phase、User Story、TDD 順序與相依關係，並在 issue 內容中標明：
1. 本階段只做 values 與 25 張最小必要支援
2. Mix、移除前四主題 intimate、既有 id 重新命名不是本階段範圍
3. 每個 issue 的驗收條件與建議測試指令
```

---

## 9. 建議執行順序

### 尚未跑 `specify`

1. `/speckit.specify`
2. `/speckit.clarify`
3. 人工檢查 `spec.md` 是否已鎖定 values、25 張、不使用 intimate、P1 範圍邊界
4. `/speckit.plan`
5. `/speckit.analyze`
6. 依 analyze 結果修正 spec / plan
7. `/speckit.tasks`
8. 人工檢查 `tasks.md` 是否符合 TDD、沒有擴散到 P3 / P4
9. `/speckit.implement`
10. 接近完成時視情況補 `/speckit.checklist`

### 已跑過 `specify`

1. 先人工檢查現有 `spec.md`
2. 若仍有 20 張、intimate、Mix 或主題邊界模糊問題，先跑 `/speckit.clarify`
3. `/speckit.plan`
4. `/speckit.analyze`
5. 修正不一致處
6. `/speckit.tasks`
7. 人工檢查 tasks 後再 `/speckit.implement`

### `spec.md` 人工檢查重點

1. 是否清楚說明 values 為何不能只併入 self / interaction / trust。
2. 是否明確寫出 values 的 6 個內容面向與題數分配。
3. 是否明確寫出 25 張、`val-001` 至 `val-025`。
4. 是否明確寫出 values 不使用 intimate 分層與 base/intimate 後綴。
5. 是否清楚定義 level 1 / 2 / 3 的產品語氣，而不是實作方案。
6. 是否把 Mix、移除前四主題 intimate、既有 id 重新命名排除在本階段外。
7. 是否包含雙語 UI 外部化與四語卡牌文案的驗收要求。

---

## 10. 一句話版本

如果只想先快速開局，可直接用這句：

```text
/speckit.specify

請為 love-talk-card 規劃新的第 6 主題「values / 價值觀與未來 / Values & Future」：它要承接伴侶之間關於價值排序、金錢觀、家庭觀、生活方向、承諾觀、社交邊界與未來想像的對話，初版 25 張，id 為 val-001 至 val-025，不使用 intimate 分層或 base/intimate 後綴，使用 level 1/2/3 表示題目深度；本階段只做 values 與 25 張所需的最小資料規則放寬，不做 Mix、不移除前四主題 intimate、不重新命名既有卡牌 id。請聚焦產品定位、主題邊界、驗收條件與成功標準，不要先談實作細節。
```
