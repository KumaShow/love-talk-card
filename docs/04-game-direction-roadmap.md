# 04 - 遊戲方向調整需求草案

> status: draft
> purpose: 整理「價值觀與未來」新主題、卡牌數量上限解除、移除 intimate 區別、Mix 牌堆等方向，作為後續 Speckit 規格與實作排序依據。
> scope: 尚未改動 `src/data/themes/*.json` 或程式碼；本文件用於對焦需求、影響範圍與優先順序。

---

## 一、背景與目標

目前遊戲已具備多主題卡牌、主題預覽、抽牌、結束訊息、四語卡牌文案與 `desire` 單一牌池經驗。接下來的產品方向會從「固定主題 + intimate 開關」轉向「更多主題內容 + 以 level 表示深度 + 更自由的混合抽牌」。

本輪已完成新主題「價值觀與未來」的技術整合：`values` 使用 25 張單一牌池，並把「靈魂共振」放入卡面或首頁描述，作為該主題的情緒記憶點。後續仍可評估解除其他主題的卡牌數量固定、移除既有四主題 intimate 區別，最後新增 Mix 牌堆。

---

## 二、需求概述

### 1. 新主題：價值觀與未來

新增第 6 主題，主題核心是伴侶彼此的價值排序、金錢觀、家庭觀、生活方向、承諾觀與未來想像。

建議暫定：

| 項目 | 建議 |
|---|---|
| theme id | `values` |
| zh-TW 名稱 | 價值觀與未來 |
| en 名稱 | Values & Future |
| th 名稱 | ค่านิยมและอนาคต |
| ja 名稱 | 価値観と未来 |
| 描述語氣 | 在生活選擇裡，看見彼此的靈魂共振 |
| intimate 分層 | 不使用 |
| 深度控制 | 使用 `level 1` / `level 2` / `level 3` |
| 初版卡牌數 | 25 張 |
| 卡牌 id | `val-001` 至 `val-025`，不使用 `base` / `intimate` 後綴 |

內容面向建議：

| 面向 | 目的 | 建議張數 |
|---|---|---:|
| 價值排序 | 了解彼此重視什麼、哪些價值最難妥協 | 4 |
| 金錢與安全感 | 了解消費、儲蓄、風險與生活品質選擇 | 4 |
| 家庭與親密邊界 | 了解家庭互動、家人介入程度與伴侶邊界 | 4 |
| 生活方向 | 了解理想生活、工作節奏、居住選擇與人生步調 | 4 |
| 承諾與未來 | 了解長期關係期待、共同規劃與未來取捨 | 4 |
| 社交與邊界 | 了解朋友、社交頻率、私人空間與外部人際界線 | 5 |

`values` 不獨立設置「衝突觀與修復信念」面向，避免與 `interaction` 的溝通、誤解、修復主題重疊。若需要觸及「地雷」或 `red flag`，應改寫成「底線」「不可妥協」「需要停下來重新想想的狀況」，並分散放入價值排序、社交與邊界、承諾與未來，不以審判或測驗語氣呈現。

### 2. 重置卡牌數量規則

現況中，`values` 已採 25 張；其他主題仍維持既有 20 張牌池。若未來各主題可逐步擴充，就需要把「每主題固定 20 張」改成「每主題至少有可遊玩的卡牌數，沒有硬性上限」。

建議新的產品規則：

| 規則 | 建議 |
|---|---|
| 每主題卡牌數 | 不再限制最多 20 張 |
| 最低可遊玩數 | 需另行決定，建議至少 15 張 |
| 單次遊玩牌堆 | 預設使用該主題全部卡牌 |
| 未來擴充 | 若單主題超過 30 張，再評估抽樣或分組機制 |

### 3. 移除前四主題 intimate 區別

目前 `attraction`、`self`、`interaction`、`trust` 各有 `15 base + 5 intimate`，首頁提供 `intimateMode` 開關。新方向希望取消 intimate 類別，改由 `level` 表示題目深度。

建議新的內容規則：

| 舊規則 | 新規則 |
|---|---|
| `isIntimate: true/false` 決定是否納入牌堆 | 全部卡牌皆納入牌堆 |
| 首頁 `intimateMode` 開關控制是否加 5 張 | 移除首頁開關 |
| `base/intimate` 後綴表示類型 | 新卡建議不再依賴後綴；既有 id 是否改名待決 |
| intimate 卡較深 | 使用 `level 2` / `level 3` 表示較深 |

這項會改變既有遊玩體驗：原本不開私密模式時只有 15 張，改完後前四主題預設會變成 20 張全部可抽。

### 4. 新增 Mix 牌堆

新增一個可選牌堆，將所有主題卡牌混合後隨機抽取。它不一定是一般主題，可能更像「特殊牌堆」或「模式」。

待決方向：

| 問題 | 可能做法 |
|---|---|
| Mix 是否顯示為首頁第 7 張主題卡 | 是，作為「混合牌堆」出現 |
| Mix 是否有自己的主題色與結束訊息 | 建議有，避免 UI 缺資料 |
| Mix 是否包含 `desire` | 預計支援，但需由 Mix 模式中的額外開關控制；未開啟時不加入 `desire` 卡牌 |
| Mix 是否包含未來 `values` | 建議包含 |
| Mix 是否一次納入全部卡牌 | 初期可全部納入；若張數過多再做抽樣 |
| Mix 是否保留各卡原本主題背景 | 建議保留，抽到哪張就呈現該卡原主題視覺 |

Mix 的 `desire` 控制可延續目前 intimate 開關的產品語意：預設混合牌堆不放入成人親密內容；使用者需主動開啟「包含 desire」之類的控制，才會把 `desire` 卡加入 Mix 候選池。此控制只影響 Mix，不重新引入既有四主題的 intimate 分層。

---

## 三、可能影響範圍

### 資料與型別

| 範圍 | 影響 |
|---|---|
| `src/data/themes/*.json` | 新增 `values.json`；既有四主題可能移除或忽略 `isIntimate` |
| `src/data/index.ts` | 新增主題資料匯入；未來若 Mix 是虛擬牌堆，可能不能單純由 theme files 組裝 |
| `src/types/index.ts` | `ThemeId` 需加入 `values`，若 Mix 作為路由目標也需納入 |
| `src/data/validators.ts` | 需放寬卡牌數量與 `isIntimate` 規則；id 命名規則需重定 |
| `specs/*/contracts/*.json` | `deckOrder maxItems: 20` 等舊契約需更新或標記過時 |

### 抽牌與狀態

| 範圍 | 影響 |
|---|---|
| `src/composables/useDeck.ts` | 移除依 `intimateMode` 過濾一般主題的核心邏輯；新增 Mix 過濾規則，並支援 Mix 是否包含 `desire` |
| `src/stores/gameStore.ts` | `startSession(themeId, intimateMode)` 參數可能改名或移除；snapshot 的 `intimateModeAtStart` 可能需遷移；Mix 可能需要記錄 `includeDesireInMix` |
| session restore | 舊 session 若含 `intimateModeAtStart`，需決定相容策略 |
| EndView / remaining count | 牌堆長度可變後，剩餘張數與完成判斷需確認不依賴固定 15/20 |

### UI 與 i18n

| 範圍 | 影響 |
|---|---|
| `src/views/HomeView.vue` | 移除一般 intimate 開關；新增 `values` 與 Mix 入口；Mix 需要「是否包含 desire」控制 |
| `src/i18n/{zh-TW,en}.json` | 移除或停用一般 intimate 文案；新增 `values`、Mix、Mix 包含 desire 控制文案 |
| `src/components/home/ThemePreview.vue` | 顯示新主題描述；Mix 可能需要特殊說明 |
| `src/components/card/CardFace.vue` | 若移除 intimate 水印，需調整顯示邏輯與測試 |
| `src/assets/card-images/index.ts` | 新增 `values` 視覺資產；Mix 是否需要專屬資產待決 |

### 測試

| 範圍 | 影響 |
|---|---|
| `tests/unit/composables/useDeck.test.ts` | 需改寫 intimate 過濾測試，新增可變張數、`values` 25 張與 Mix 是否包含 `desire` 的測試 |
| `tests/unit/stores/gameStore*.test.ts` | 移除 `intimateModeAtStart` 相關不變量，或改成相容測試 |
| `tests/unit/data/*` | 放寬每主題 20 張、前四主題 5 張 intimate 的斷言 |
| `tests/unit/views/views.test.ts` | 移除首頁 toggle 與 `startSession` 傳參 expectations |
| `tests/e2e/playwright/us2-intimate-mode.spec.ts` | 需刪除、封存或改寫成 level / full deck 行為測試 |
| `tests/e2e/playwright/us-desire-entry.spec.ts` | 若 Mix 包含 desire，需補成人內容提示邏輯測試 |

### 文件

| 範圍 | 影響 |
|---|---|
| `docs/00-llm-card-copywriting-prompts.md` | 需更新「每主題 20 張」「15 base + 5 intimate」提示詞 |
| `docs/03-three-values-coverage-review.md` | 需補充決策：採新增第 6 主題，不再用替換題作為主路線 |
| `docs/learning/*` | 多處教學仍描述 `intimateMode` 與 20 張不變量，需後續同步 |
| `specs/001-*` / `specs/002-*` | 既有完成規格可保留歷史，但新規格需明確宣告新規則取代哪些舊不變量 |

---

## 四、需要對焦的問題

以下問題建議在正式實作前先確認，尤其是會影響資料結構與測試的項目。

1. `values` 已決定初版 25 張，題庫分配採 6 個面向：價值排序 4、金錢與安全感 4、家庭與親密邊界 4、生活方向 4、承諾與未來 4、社交與邊界 5。
2. `values` 已決定完全不使用 `isIntimate`，並採 `val-001` 至 `val-025` 的無後綴 id。
3. 前四主題移除 intimate 後，既有 `*-intimate` 卡的 id 要保留，還是重新命名成無後綴格式？
4. `isIntimate` 欄位是立即從所有資料移除，還是先保留但 UI/抽牌邏輯忽略？
5. 首頁 intimate 開關移除後，是否需要給使用者新的「深度選擇」或完全不需要？
6. Mix 已預計可包含 `desire`，但預設不加入；需確認開啟「包含 desire」後是否仍要顯示成人內容提示。
7. Mix 抽到卡牌時，卡面與背景要使用原主題視覺，還是 Mix 統一視覺？
8. Mix 是否使用全部卡牌，或限制每輪抽固定數量？
9. 舊 session snapshot 要直接清除，還是做向後相容轉換？

---

## 五、建議優先順序

### P1：新主題「價值觀與未來」

先開發 `values` 是最適合的第一步，因為它能先交付新內容價值，也能用較小範圍驗證「單一牌池、不分 intimate、可能超過 20 張」的新方向。

建議 P1 範圍：

| 項目 | 建議 |
|---|---|
| 新增 `values` 主題 | 是 |
| 卡牌數 | 25 |
| intimate | 不使用 |
| id 格式 | `val-001` 至 `val-025` |
| 內容面向 | 6 面向；不設衝突/修復面向；底線題以溫和價值觀語氣分散納入 |
| Mix | 不在本階段做 |
| 移除舊 intimate | 不在本階段做 |
| 20 張上限 | 為 `values` 25 張放寬必要測試與契約 |

### P2：解除卡牌數量上限

因 `values` 已決定初版 25 張，此項需與 P1 同步處理最小必要範圍：放寬資料驗證、牌堆建立、session schema 與測試中「最多 20 張」的假設。

### P3：移除前四主題 intimate 區別

這是高影響重構，會改變首頁、抽牌、資料、測試與既有使用者體驗。建議在 `values` 穩定後獨立成一個 Speckit feature，不要混在新主題第一階段。

### P4：新增 Mix 牌堆

Mix 依賴前面決策，尤其是「Mix 預設排除 desire、開啟後才加入 desire」與「既有四主題是否已移除 intimate」。建議最後做，因為它需要一套清楚的主題混合規則、成人內容告知與 UI 控制。

---

## 六、建議階段切分

| 階段 | 目標 | 產出 |
|---|---|---|
| Phase 1 | 開發 `values` 主題 | 規格、25 張題庫、四語文案、主題 UI、測試 |
| Phase 2 | 放寬卡牌數量限制 | schema / tests / docs 更新，不再假設最多 20 張 |
| Phase 3 | 移除 intimate 模式 | 移除首頁開關、抽牌過濾、watermark、相關狀態與測試 |
| Phase 4 | 新增 Mix 牌堆 | Mix 入口、混合抽牌策略、desire 處理、視覺與測試 |

---

## 七、初步建議

建議先把 `values` 當成一個獨立 feature 開發，並明確寫入「25 張、`val-001` 無後綴、不分 intimate、以 level 控制深度」。因 `values` 已決定初版使用 25 張，需在同一輪最小幅度放寬卡牌數量限制；但不要同時移除前四主題 intimate 與新增 Mix，避免一次改動太多核心不變量。
