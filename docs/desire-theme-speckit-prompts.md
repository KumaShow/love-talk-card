# 新增 Desire 主題的 Speckit 提示詞建議

> 適用情境：在 `love-talk-card` 專案中，新增第 5 個主題 `desire`（暫名：慾望與身體親密），並維持既有 Speckit 工作流。
>
> 建議策略：本次屬於**結構性功能新增**，建議走 **輕量 Speckit**：
>
> ` /speckit.specify -> /speckit.clarify -> /speckit.plan -> /speckit.tasks -> /speckit.implement `
>
> 一般情況下，本次可先**不跑** `/speckit.analyze`、`/speckit.checklist`、`/speckit.taskstoissues`。

---

## 1. 使用前共識

本次新主題建議先採以下產品前提，避免後續 spec 漂移：

1. 新增第 5 個主題 `desire`，定位為成人伴侶的身體親密與性需求對話主題。
2. 原有四主題 `attraction`、`self`、`interaction`、`trust` 保持存在。
3. 原有四主題的 `intimate` 仍維持「溫和私密」定位，不直接升級成露骨性話題。
4. `desire` 主題內可以談碰觸偏好、性需求表達、理想親密頻率、同意與安全感，但不得包含羞辱、脅迫、非自願或未成年內容。
5. 本次變更會影響主題數、資料模型、型別、schema、UI 文案與測試假設，因此建議走 Speckit。

---

## 2. `/speckit.specify` 提示詞

用途：先定義 WHAT / WHY，不談 HOW。

建議直接使用：

```text
/speckit.specify

請為 love-talk-card 新增一個第 5 主題功能，暫名為「desire / 慾望與身體親密」。

背景：
- 目前專案有 4 個主題：attraction、self、interaction、trust。
- 原有 intimate 模式定位偏溫和私密，不適合承接更直接的成人身體親密與性需求話題。
- 我希望將較直接的碰觸偏好、性需求表達、理想親密頻率、邀請方式、同意與安全感等內容，獨立成一個新主題，而不是直接混入既有四主題。

請把這次需求定義成一個新的功能規格，重點包含：
1. 為什麼需要第 5 主題，而不是只提升 intimate 尺度
2. 新主題 desire 的產品定位與目標使用情境
3. desire 與 attraction / self / interaction / trust 的邊界差異
4. desire 主題允許談哪些內容、不允許談哪些內容
5. 使用者在首頁或主題預覽時，應如何被告知這是成人親密主題
6. 對現有四主題與原本 intimate 模式的相容策略
7. 成功條件：新增 desire 後，主題邊界更清楚、使用者預期更明確、資料結構仍一致可維護

請用 Speckit spec.md 風格輸出，聚焦 WHAT / WHY / 驗收條件，不要先談實作細節。
```

---

## 3. `/speckit.clarify` 提示詞

用途：把高風險決策先收斂，避免後面 plan 與 tasks 反覆重寫。

建議直接使用：

```text
/speckit.clarify

請只針對「新增 desire 主題」這個功能規格中，最容易影響後續實作與資料結構的模糊點追問。

請優先聚焦以下幾類問題，並且每題提供 2 到 3 個合理選項讓我選：

1. desire 主題是否沿用每主題 20 張、15 base + 5 intimate 的固定配比
2. 原有四主題的 intimate 是否完全維持現狀，或需要小幅重寫描述文案
3. desire 主題在首頁是否預設直接顯示，或需要額外提示成人內容
4. desire 主題的命名是否用 desire / physical / chemistry 其一
5. desire 主題的 Success Criteria 要偏產品清晰度、內容邊界一致性，還是技術可擴充性
6. 是否需要在 spec 階段就明確要求「維持雙語與可外部化」

請避免問過度細碎的 UI 視覺問題，也不要進入具體實作方案。
我的目標是讓 spec 可以順利進入 plan。
```

---

## 4. `/speckit.plan` 提示詞

用途：把 WHAT 翻成 HOW，列出技術影響面與落地策略。

建議直接使用：

```text
/speckit.plan

請針對「新增第 5 主題 desire」產出技術計劃，並以本專案現況為前提：

- 現有主題為 attraction / self / interaction / trust
- 現有許多地方仍帶有固定四主題假設
- 需要保留雙語與可外部化資料設計
- 既有四主題的 intimate 仍維持溫和私密定位

請在 plan 中特別涵蓋：
1. ThemeId、validThemeIds、theme 資料來源的調整策略
2. schema / contract 如何從固定 4 主題改成可容納第 5 主題
3. src/data/themes/ 新增 desire 主題檔案時，入口資料集如何組裝
4. 首頁、主題預覽、GameView、EndView、i18n 文案需要調整哪些地方
5. 既有測試中哪些是假設「固定四主題 / 80 張卡」，應如何改寫
6. 是否需要把測試策略從固定主題數，改為驗證每個主題符合 base/intimate 規則
7. desire 主題的內容邊界，應放在哪些文件中維護

請避免過度擴大範圍，不要順便重做整個卡牌資料架構；以最小但穩定的技術變更完成這個功能。
```

---

## 5. `/speckit.tasks` 提示詞

用途：把 plan 拆成可執行任務，並保持 TDD 順序。

建議直接使用：

```text
/speckit.tasks

請依「新增第 5 主題 desire」的 spec 與 plan，產出可執行的 tasks.md。

要求：
1. 依 Phase 與 User Story 分組
2. 維持 TDD 順序：先契約 / 型別 / 測試，再資料與 UI，最後整合驗證
3. 任務粒度以「一次 commit 可完成」為原則，不要過粗也不要過細
4. 明確標出會修改的檔案類型，例如：
   - types / utils
   - data / schema / contracts
   - i18n
   - views / components
   - unit tests / e2e tests
   - docs / content rules
5. 包含 desire 主題卡牌資料與相關文案規格更新
6. 不要把本次需求拆成過多非必要 Phase

我希望最後的 tasks 能支撐「先讓結構支援第 5 主題，再補 desire 內容與文案，再驗證 UI 與測試」這條落地順序。
```

---

## 6. `/speckit.implement` 提示詞

用途：開始實作時，控制 agent 聚焦在當前 task，避免一次改太多。

若要整批執行：

```text
/speckit.implement

請依 tasks.md 逐條實作「新增第 5 主題 desire」。

執行原則：
1. 嚴格依 tasks 順序進行
2. 優先完成型別、資料模型、schema 與測試，再做 UI
3. desire 主題文案需維持繁中優先、可外部化、可翻譯
4. 既有四主題 intimate 不要被順手改成更露骨
5. 每完成一批任務就回報影響檔案與驗證結果
```

若要分批執行：

```text
/speckit.implement T0xx T0yy T0zz

本批只處理第 5 主題 desire 的基礎結構任務。
請只完成這批 task，避免擴散到文案大量改寫或非必要重構。
完成後回報：
1. 修改了哪些檔案
2. 哪些測試已補上或更新
3. 還剩哪些後續 task
```

---

## 7. 本次可選擇略過的流程

### `/speckit.analyze`

這次通常可先略過，除非出現以下情況：

1. spec 已拆出 4 個以上新 user story
2. desire 主題牽動多個資料實體且 plan 出現多條技術分支
3. 你擔心四主題與新主題的邊界會讓規格互相打架

若需要補跑，可用：

```text
/speckit.analyze

請檢查「新增第 5 主題 desire」的 spec、plan、data-model、contracts 是否一致，
特別注意：
1. 是否仍殘留固定四主題假設
2. desire 與原四主題的邊界是否在不同文件中互相矛盾
3. Success Criteria、schema 與 tasks 是否對得上
```

### `/speckit.checklist`

這次可留到真的要開 PR 前再跑。

可用提示詞：

```text
/speckit.checklist

請針對「新增第 5 主題 desire」建立 requirements checklist，
重點檢查：
1. 使用者是否能理解 desire 為成人親密主題
2. 四主題與 desire 的邊界是否清楚
3. 資料結構與測試是否不再依賴固定四主題
4. 文案是否維持雙語、可外部化、可翻譯
```

---

## 8. 建議執行順序

若你要最省力又不失控，建議直接照這個順序：

1. `/speckit.specify`
2. `/speckit.clarify`
3. `/speckit.plan`
4. `/speckit.tasks`
5. 先人工檢查 tasks 是否合理
6. `/speckit.implement`
7. 接近完成時再視情況補 `/speckit.checklist`

---

## 9. 一句話版本

如果你只想先快速開局，可直接用這句：

```text
/speckit.specify

請為 love-talk-card 規劃一個新的第 5 主題「desire / 慾望與身體親密」：它要承接成人伴侶之間較直接的身體親密、性需求、碰觸偏好、理想親密頻率、邀請與同意、安全感等對話內容，同時保留原四主題與其溫和 intimate 模式不變。請聚焦產品定位、主題邊界、可接受與禁止內容、使用者預期管理與成功條件，不要先談實作細節。
```
