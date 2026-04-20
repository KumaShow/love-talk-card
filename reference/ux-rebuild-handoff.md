# UX 重塑交接文件：卡堆主題 + 扇形抽牌

> **交接日期**：2026-04-20
> **文件位置**：`reference/ux-rebuild-handoff.md`
> **原始計畫檔**：`C:\Users\user\.claude\plans\serene-questing-sutton.md`（plan mode 產出，與本文件同步）
> **適用對象**：接手完成此次 UX 重塑（POC 轉正 + 規格同步）的後續開發者或 AI Agent

---

## 1. 專案現況快照

### 1.1 Git 狀態
- **當前分支**：`poc/fan-deck-ux`
- **基準 commit**：`704fcee feat(us2): 完成私密模式開關與抽牌整合（T041–T048）`（main）
- **POC 開發尚未 commit**：4 個新檔 + router 修改（見 §2.2）
- **根目錄 unstaged 檔**：`Love Talk Spec.md`、`reference/*.md`（Phase 4 之前的既有變更，與 POC 無關）

### 1.2 里程碑完成度
| Phase | 任務範圍 | 狀態 | 備註 |
|-------|---------|------|------|
| 1 | 建置 | ✅ commit 490d6b8 | Vite/Vue/Pinia/Vitest/Playwright |
| 2 | 基礎層 | ✅ commit 490d6b8 | types/cards.json/router/stores 骨架 |
| 3 | US1 核心抽牌 | ✅ commit 94abeec | 單張翻面 MVP |
| 4 | US2 私密模式 | ✅ commit 704fcee | ToggleSwitch + 浮水印 |
| 5 | US3 語言切換 | ⏸ 未開始 | |
| 6 | US4 主題氛圍 | ⏸ 未開始 | |
| 7 | US5 PWA | ⏸ 未開始 | |
| 8 | 優化跨切面 | ⏸ 未開始 | |
| **9（新）** | **UX 重塑轉正** | 🟡 規格待更新 + POC 待轉正 | 本次交接重點 |

### 1.3 測試狀態
- **單元**：14 files / 56 tests GREEN（含 POC 後驗證）
- **E2E**：3 tests GREEN（US1 + US2，POC route 未納入 E2E）
- **type-check**：`npm run type-check` 通過

---

## 2. POC 成果（已驗證手感通過）

POC 於 `poc/fan-deck-ux` 分支上以 **獨立 /poc/* 路由** 隔離實作，零破壞既有程式與測試。使用者實測通過三個 checkpoint（卡堆、預覽、扇形翻面）。

### 2.1 POC 新增路由（`src/router/index.ts`）
```
/#/poc/home             → PocHomeView（2×2 主題卡堆 + ToggleSwitch）
/#/poc/fan/:themeId     → PocGameView（扇形 + 翻面 overlay）
```

### 2.2 POC 新增檔案清單（8 個，共 ~700 行）
```
src/views/PocHomeView.vue                      （120 行）
src/views/PocGameView.vue                      （150 行）
src/components/poc/PocThemeCard.vue            （100 行）
src/components/poc/PocHomePreview.vue          （250 行，含 backdrop/slide-up/翻卡 transition）
src/components/poc/PocFanCard.vue              （80 行）
src/components/poc/PocFanDeck.vue              （80 行）
src/components/poc/PocPickedCardView.vue       （210 行）
```
**未建立**：`usePocFanGesture.ts`（POC 簡化版未做 swipe，見 §3 設計定案）

### 2.3 測試狀態
POC 未寫測試（依 plan 屬於手感驗證階段），data-test 使用 `poc-*` 命名空間。既有 56 單元 + 3 E2E 全部保持 GREEN（零破壞驗證）。

---

## 3. 設計定案（使用者於 POC 實測後確認）

### 3.1 互動決策
| 項目 | 決策 |
|------|------|
| HomeView 主題選擇 | **預覽式**：2×2 卡堆 → 點擊 → 浮層顯示描述 + CTA → 點 CTA 進遊戲 |
| GameView 牌堆 | **扇形全蓋牌**：5 張以 `-24° ~ +24°` 展開，pivot 在螢幕底部外 |
| 可點範圍 | **僅中央那張**（其他卡 `pointer-events: none`） |
| 翻面呈現 | **獨立 overlay**：從螢幕中央 scale 彈出、3D rotateY 180° 翻面、backdrop 暗化 |
| 翻完後 | 使用者點「下一張」或 backdrop → **飛出右側**（translateX(130vw) rotate(22°) 460ms） |
| 下一張補位 | 扇形 CSS transition 自動推進（角度變化 400ms） |
| Swipe windowing | **暫不做**（理由見 §3.2） |

### 3.2 為何不做 swipe windowing（關鍵取捨）

原 plan 設想「swipe 切 visibleStart 左右滑動瀏覽剩餘牌」。POC 實作時發現語意衝突：

- 若 swipe 改變了 window，**視覺中央卡** 的 ID 會 ≠ `gameStore.drawCard()` 實際抽取的卡 ID（store 固定從 `deck[drawnCount]` 抽）
- 使用者點中央會「以為抽的是看到的那張」，但實際系統抽了別的卡 → 穿幫

兩種解法，皆暫緩：
- (A) 動 `gameStore` 支援「抽任意 deck 位置」→ 需動 schema + 測試，成本高
- (B) 保留 swipe 僅作「瀏覽」，點中央永遠抽 `deck[drawnCount]`，視覺與行為分離 → UX 混亂

**POC 決定**：window 固定為「未抽 deck 前 5 張」，不做 swipe。若後續有強需求，再走選項 A。

### 3.3 資料層決策
- **不動 `gameStore` / `useDeck` / `useCard`**：POC 完全只讀使用
- **不擴 sessionStorage schema**：`visibleStart` 為純 UI state 不持久化
- **不引入手勢套件**：@vueuse/gesture / hammerjs 皆不裝，原生 pointer events 已足夠

### 3.4 已驗證的動畫常數
| 動畫 | 時長 | 緩動 |
|------|------|------|
| 預覽浮層 slide-up | 420ms | `cubic-bezier(.2,.8,.2,1)` |
| 示意卡 rotateY 翻入 | 520ms + 180ms delay | 同上 |
| 扇形卡角度轉場 | 400ms | 同上 |
| 翻面 overlay scale 進場 | 420ms | 同上 |
| 翻面 rotateY 180° | 600ms | 同上 |
| Dismissing 飛出 | 460ms | `cubic-bezier(.55,0,.6,1)` |

---

## 4. 接手任務：UX 重塑轉正

### 4.1 Scope
1. **規格文件更新**（spec.md 為最正確來源）
2. **POC 程式轉正**（搬家、重命名、取代既有 View、補測試、改 E2E）
3. **commit + PR** 回 main

### 4.2 Out of Scope
- Phase 5（US3 語言切換）— 留待後續
- Phase 6（US4 主題氛圍）— 留待後續；POC 已部分預埋 CSS vars
- Phase 7 / 8 — 留待後續

---

## 5. 詳細執行步驟

### 步驟 0：分支準備

```bash
# 確認當前在 poc/fan-deck-ux 且 POC 工作樹已全部驗證通過
git status

# 先將 POC 成果 commit（交接人做，或由前手交接前做）
git add src/router/index.ts src/views/PocHomeView.vue src/views/PocGameView.vue src/components/poc/
git commit -m "feat(poc): UX 重塑 POC — 卡堆主題選擇 + 扇形抽牌（/#/poc/*）"

# 從 POC 分支開出轉正分支
git checkout -b feat/ux-rebuild
```

**產出**：`feat/ux-rebuild` 分支，head 含 POC commit。

### 步驟 1：檢視根目錄文件狀態

```bash
git diff "Love Talk Spec.md"   # 看現有 unstaged 修改
```
確認現有修改內容與 UX 重塑段是否衝突；若僅是文字排版無關，可與 §6.3 的更新合併一次提交。

### 步驟 2：規格文件更新（手動 Edit，為最正確來源）

依 §6 的內容分別修改下列三份：
- `specs/001-love-talk-card-game/spec.md`（最核心；US1 改寫、FR-002/003 改寫、新增 FR-017~020、Edge Cases 新增 3 項、SC-009 新增、US4 擴寫）
- `specs/001-love-talk-card-game/data-model.md`（新增「UI State Machine」章節）
- `Love Talk Spec.md`（根目錄概要版；同步卡牌互動機制段）

**先不改 plan.md / tasks.md** — 留給步驟 3 的 analyze 報告指引要改什麼。

### 步驟 3：第一次 `/speckit.analyze`（baseline 掃描）

```
/speckit.analyze
```
此時 spec 已更新但 plan/tasks 尚未，預期會回報：
- 新 FR-017~020 無對應 tasks
- US1 改寫後的敘事與既有 tasks.md 描述不一致
- 新 SC-009 無驗證 task

**把 analyze 報告記錄下來**，作為步驟 4 的 checklist。

### 步驟 4：更新 plan.md + tasks.md

依 analyze 報告補強：
- `specs/001-love-talk-card-game/plan.md`：新增「Phase 9 — UX 重塑」章節（見 §7）
- `specs/001-love-talk-card-game/tasks.md`：
  - 頂部新增「修訂紀錄」段，說明 MVP（Phase 3-4）完成後進入 Phase 9 UX 重塑
  - **不動** T001–T088（作為交付史實，保留可追溯性）
  - 新增 Phase 9 任務 T089–T098（見 §8）

### 步驟 5：第二次 `/speckit.analyze`（驗收一致）

```
/speckit.analyze
```
若 clean（無 blocking warnings）→ 進步驟 6 實作；若仍報不一致 → 回頭修。

### 步驟 6：Phase 9 實作（T089–T098）

可以：
- **手動逐項做**（推薦，可精準掌控命名與搬家）
- 或 `/speckit.implement`（自動依 tasks.md 順序）

**關鍵要點**（見 §8 任務清單）：
- T089 搬家 + 重命名（`Poc*` → 正式命名）
- T090–T091 替換既有 `HomeView.vue` / `GameView.vue`
- T092 刪除 `CardStack.vue` 與 `/poc/*` 路由
- T093 data-test 重命名（`poc-*` → 正式）
- T094 補單元測試
- T095–T096 改寫兩支 E2E spec
- T097 更新 quickstart.md
- T098 smoke test

### 步驟 7：完整驗證

```bash
npm run type-check           # TypeScript 檢查
npm run test                 # Vitest 單元測試（目標：全 GREEN + 新增測試）
npx playwright test          # E2E（目標：3 tests 維持 GREEN，spec 已改寫）
npm run dev                  # 手動冒煙：/#/ 進入卡堆 → 預覽 → 扇形 → 翻面 → 結束
```

### 步驟 8：PR + merge

```bash
git push -u origin feat/ux-rebuild
gh pr create --title "feat(ux): 重塑互動語言 — 卡堆主題選擇 + 扇形抽牌" --body <<EOF
## Summary
- 規格 US1 重寫為卡堆 + 預覽浮層 + 扇形抽牌 + overlay 翻面
- 新增 FR-017~020 與 SC-009
- Phase 9 轉正 POC 元件，取代既有 HomeView/GameView/CardStack

## Test plan
- [x] type-check
- [x] vitest（56+ 測試 GREEN）
- [x] playwright（us1 / us2 改寫後 GREEN）
- [x] 手動冒煙（iPhone 14 viewport）
EOF
```

---

## 6. 規格文件修改細節

### 6.1 `specs/001-love-talk-card-game/spec.md`

#### US1 改寫（整段替換）
原 US1「Choose a Theme and Draw Cards」的敘事與 4 個 Acceptance Scenarios 需完整重寫：

**新敘事重點**：
1. 首頁呈現 4 副 face-down 牌堆（每副使用該主題 `cardBack` 色）
2. 點擊任一牌堆 → 預覽浮層浮出（示意卡翻入 + 主題描述 + 「開始對話」CTA）
3. 點 CTA → 進入扇形抽牌畫面
4. 扇形展開 5 張蓋牌（單窗；剩餘 < 5 張收縮）
5. 點中央卡 → overlay 翻面 → 讀完點「下一張」→ 飛出右側、下一張補位
6. 抽完最後一張 → 結束訊息

**Acceptance Scenarios（改寫為 5-6 個）**：
1. 首頁顯示 4 副牌堆 + 主題名稱（中文），每副以該主題 cardBack 色票呈現
2. 點牌堆 → 預覽浮層 slide-up 顯示主題描述 + CTA + backdrop 暗化
3. 點「開始對話」CTA → 導航至抽牌畫面 + 扇形 5 張展開
4. 點扇形中央卡 → overlay 翻面顯示 prompt 文字
5. 讀完點「下一張」→ overlay 飛出右側、下一張自動補位至中央
6. 抽完最後一張 → 結束訊息與回首頁 CTA

#### FR 調整
**改寫**：
- **FR-002**（原：stack of face-down cards）→ 「扇形展開剩餘牌堆，單窗最多 5 張蓋牌；剩餘卡數少於 5 時角度收窄」
- **FR-003**（原：tap top card 翻面）→ 「僅扇形中央位置可被點擊觸發翻面，翻面以獨立 overlay 呈現 3D rotateY 動畫」

**新增**：
- **FR-017**：首頁以四副卡堆視覺呈現主題，每副採用該主題 `theme.colors.cardBack` 色票
- **FR-018**：選擇主題後先顯示預覽浮層（主題描述 + 「開始對話」CTA + 暗色 backdrop），點 CTA 才進入抽牌畫面
- **FR-019**：扇形中除中央卡外，其他 4 張卡禁用點擊（`pointer-events: none`）
- **FR-020**：翻面 overlay 顯示期間，使用者確認後卡片飛出螢幕右側，扇形自動補位下一張；若已抽完最後一張，導向結束訊息

#### Edge Cases 新增
- 扇形剩餘卡數少於 5 張時，扇形角度動態收窄（3 張 → ±16°、2 張 → ±8°、1 張 → 0°）
- 翻面 overlay 顯示期間使用者按返回：保持 reading phase，ConfirmModal 的出現仍依 `drawnCount >= 8` 條件
- Reading phase 期間使用者重新整理瀏覽器：sessionStorage 保留已抽狀態，但 overlay 不還原（`drawnCount` 已在 flipping 時 +1，使用者看到下一張已在扇形中）

#### Success Criteria 新增
- **SC-009**：扇形 5 張展開與翻面 overlay 動畫在中階 iOS（Safari）維持 60fps，600ms 翻面與 460ms 飛出過程無掉 frame

#### US4 擴寫
原 US4 只涵蓋「背景色隨主題漸層」。新增：**CTA 按鈕、focus ring、hint 文字、預覽浮層** 皆繼承當前主題的 `primary`/`secondary` 色（透過 CSS custom properties 注入）。

#### US2 註記
US2「私密模式」核心不變，但 Acceptance Scenario 3 的「浮水印顯示於翻面後的卡面」需註記：**浮水印現在出現於 PickedCardView overlay 上**（非原 CardStack 內的 CardFace），使用者觀察點相同。

### 6.2 `specs/001-love-talk-card-game/data-model.md`

新增章節「§6 UI State Machine（Phase 9）」：
```
PickedPhase = 'idle' | 'flipping' | 'reading' | 'dismissing'

轉移：
idle
  → [使用者點扇形中央卡] → flipping（capture pickedCard = currentCard、呼叫 drawCard() 推進 drawnCount）
flipping
  → [rotateY 600ms 動畫結束] → reading
reading
  → [使用者點下一張 CTA 或 backdrop] → dismissing
dismissing
  → [飛出動畫 460ms 結束] → idle（若 isComplete 則導向 end view）

說明：
- drawCard 於 flipping 起始即呼叫（非翻完後），確保 drawnCount 與 overlay 顯示同步
- visibleStart（扇形 windowing）不進入 sessionStorage snapshot，重整後從 drawnCount 起跳
- phase 狀態僅存在於 PocGameView（或轉正後的 GameView）實例內，不進 store
```

### 6.3 根目錄 `Love Talk Spec.md`

更新「💻 核心功能規格 → 1. 卡牌互動機制」段：

**舊**：
```
* 牌堆呈現：畫面中央顯示疊放的卡牌堆。
* 點擊抽卡與翻牌：點擊牌堆最上方卡片後，觸發 3D 翻轉動畫。
```

**新**：
```
* 主題卡堆選擇：首頁以四副面朝下的卡堆呈現主題，點擊任一副以預覽浮層揭露主題描述，確認後進入抽牌。
* 扇形抽牌呈現：抽牌畫面以扇形展開剩餘牌堆（單窗 5 張），僅中央位置可被點擊翻面。
* 翻面 overlay：點擊中央卡後以獨立大圖 overlay 呈現 3D 翻面動畫，閱讀完畢後卡片飛出右側、下一張自動補位。
* 防重複機制：同既有邏輯；抽完牌堆顯示溫馨提示並引導回首頁。
* 私密題視覺彩蛋：浮水印呈現於翻面 overlay 上（不變動視覺規則，僅位置改至 overlay）。
```

---

## 7. plan.md 新增章節（Phase 9）

在 `specs/001-love-talk-card-game/plan.md` 末尾新增：

```
## Phase 9 — UX 重塑（依據 US1 v2 互動重寫）

### 動機
Phase 3/4 交付的 MVP 使用「條列主題清單 + 單張翻面」互動；使用者實測後回饋
「沒有抽卡的儀式感」。於 poc/fan-deck-ux 分支驗證「卡堆選擇 + 扇形抽牌 + overlay
翻面」三層互動後，使用者確認方向可行，進入轉正階段。

### 範圍
- HomeView：條列 → 2×2 卡堆 + 預覽浮層
- GameView：單張 CardStack → 扇形 PocFanDeck + PickedCardView overlay
- 保留 gameStore / useDeck / useCard / cards.json / 既有 session snapshot schema
- 新增 UI state machine（PickedPhase，純 View 內 state）

### 技術決策
- 不引入手勢套件（@vueuse/gesture / hammerjs）— 原生 pointer events 足夠
- 不做 swipe windowing（語意衝突；詳見交接文件 §3.2）
- 不擴 sessionStorage schema（visibleStart 為純 UI state）
- 遵循既有 Constitution：scoped CSS + CSS custom properties 注入主題色

### Constitution Check
- ✅ Mobile-first：所有動畫在 iPhone 14 viewport 驗證 60fps
- ✅ TDD：新元件轉正後補單元測試（T094）
- ✅ 繁體中文註解：POC 元件已遵循，轉正時保留
- ✅ 無 vue-i18n：POC 仍用 inline 中文，轉正時外部化至 zh-TW.json
- ✅ 無外部動畫函式庫：POC 僅用 CSS transform/transition
```

---

## 8. tasks.md 新增 Phase 9（T089–T098）

在 `specs/001-love-talk-card-game/tasks.md` 頂部新增「修訂紀錄」段，並在末尾新增 Phase 9：

### 修訂紀錄範例
```
## 修訂紀錄

- **2026-04-20**：Phase 3-4 MVP 於 commit 704fcee 交付後，依使用者實測回饋啟動
  Phase 9 UX 重塑。T001–T088 保留作為交付史實，不改；新增 T089–T098 於 Phase 9
  執行 POC 轉正。部分舊任務對應的元件將於 T090–T092 被取代（CardStack.vue 刪除、
  HomeView.vue / GameView.vue 重寫），屬於 v2 演進而非舊任務失效。
```

### Phase 9 任務清單

```
## Phase 9：UX 重塑（T089–T098）

T089 [P] 將 POC 元件搬到正式目錄並重命名
     - src/components/poc/PocThemeCard.vue → src/components/home/ThemeCardDeck.vue
     - src/components/poc/PocHomePreview.vue → src/components/home/ThemePreview.vue
     - src/components/poc/PocFanCard.vue → src/components/card/FanCard.vue
     - src/components/poc/PocFanDeck.vue → src/components/card/FanDeck.vue
     - src/components/poc/PocPickedCardView.vue → src/components/card/PickedCardView.vue
     - 同步更新檔內相對路徑 import
     - 註解中任何「POC」字樣改為正式描述

T090 替換 src/views/HomeView.vue 為卡堆 + 預覽浮層版本
     - 以原 PocHomeView.vue 內容為基礎
     - 保留既有 data-test="intimate-toggle"、theme-grid → 改為 theme-deck-grid
     - 新增 data-test="theme-deck-{themeId}"、"home-preview"、"preview-cta"
     - i18n 字串由 inline 改為 @/i18n/zh-TW.json 鍵值（需 zh-TW.json 新增 home.preview.*）

T091 替換 src/views/GameView.vue 為扇形版本
     - 以原 PocGameView.vue 內容為基礎
     - 繼續使用既有 AppHeader / ConfirmModal
     - 新增 data-test="fan-deck"、"fan-card-{i}"、"picked-view"、"picked-next"
     - 保留既有 route (/game/:themeId)，不再需要 /poc/fan/:themeId

T092 刪除 src/components/card/CardStack.vue + 移除 POC route
     - 刪除檔案
     - src/router/index.ts 移除 /poc/home 與 /poc/fan/:themeId 兩條 route 與 import
     - 刪除 tests/unit/components/CardStack.test.ts（由 T094 新測試取代）

T093 data-test 屬性正式化
     - 所有 poc-* 前綴改為正式命名
     - 保留既有 intimate-watermark、intimate-indicator（E2E 繼續使用）

T094 [P] 補單元測試
     - tests/unit/components/FanDeck.test.ts：visibleCards 切片、角度計算、z-index、canInteract
     - tests/unit/components/PickedCardView.test.ts：phase 狀態轉移、翻面 class 變化
     - tests/unit/components/ThemeCardDeck.test.ts：色票注入、emit select
     - 目標：單元覆蓋率維持 ≥95% (composables/stores)、≥80% (overall)

T095 改寫 tests/e2e/playwright/us1-core-gameplay.spec.ts
     - 新流程：
       1. 首頁 → 看到 4 副 theme-deck-*
       2. 點 theme-deck-attraction → home-preview 出現
       3. 點 preview-cta → 導向 /#/game/attraction
       4. 看到 fan-deck（5 張扇形）
       5. 迴圈：點 picked-view 中央 → 看到 picked-view overlay → 讀文字 → 點 picked-next
          重複 15 次（驗證文字無重複）
       6. 第 15 張抽完 → 結束訊息
     - 注意：中央卡點擊 selector 為 fan-deck 內層（或額外加 fan-card-center）

T096 改寫 tests/e2e/playwright/us2-intimate-mode.spec.ts
     - 浮水印偵測 selector：原本在 fan card 上改至 picked-view overlay 內的 intimate-watermark
     - 統計邏輯不變（20 張中 5 張有浮水印、15 張無）

T097 更新 specs/001-love-talk-card-game/quickstart.md
     - 手動驗證步驟依新 UX 改寫

T098 完整 smoke
     - npm run type-check
     - npm run test（全 GREEN）
     - npx playwright test（全 GREEN）
     - npm run dev 手動冒煙（iPhone 14 viewport）
```

---

## 9. 測試影響清單

### 必改
- `tests/e2e/playwright/us1-core-gameplay.spec.ts`（T095；點擊流程從「單張 card-stack」→「卡堆 → 預覽 → 扇形 → overlay」）
- `tests/e2e/playwright/us2-intimate-mode.spec.ts`（T096；浮水印 selector 移至 overlay）
- `tests/unit/components/CardStack.test.ts`（T092 刪除，由 T094 的 FanDeck/PickedCardView 測試取代）

### 必新增（T094）
- `tests/unit/components/FanDeck.test.ts`
- `tests/unit/components/PickedCardView.test.ts`
- `tests/unit/components/ThemeCardDeck.test.ts`

### 不動
- `tests/unit/stores/gameStore*.test.ts`（store 邏輯未變）
- `tests/unit/stores/settingsStore.test.ts`（不變）
- `tests/unit/composables/useDeck.test.ts`、`useCard.test.ts`（不變）
- `tests/unit/utils/shuffle.test.ts`（不變）
- `tests/unit/components/app.test.ts`（不變）

---

## 10. Gotchas / 已知陷阱

### 10.1 CardBack + CardFace 3D 翻面 pattern（重要）
`CardFace.vue` 自帶 `transform: rotateY(180deg)` + `backface-visibility: hidden`，設計為**嵌在翻轉容器內**使用。若在外層 wrapper 再加 `rotateY(180deg)`（總和 360°）會導致翻面後仍顯示背面。

**正確 pattern**（參考 `CardStack.vue` 與 `PocPickedCardView.vue`）：
```vue
<div class="inner" :class="{ 'is-flipped': isFlipped }">
  <CardBack />        <!-- 朝前，inner flip 後朝後 -->
  <CardFace :card />  <!-- 自帶 rotateY(180)，inner flip 後朝前 -->
</div>
```
inner 本身 `transform-style: preserve-3d; transition: transform 600ms;`，切 `is-flipped` 時 `rotateY(180deg)`。兩個 children 的朝向由它們自己的 CSS 決定。**不要為 CardFace 的外層 wrapper 加任何 rotateY**。

### 10.2 翻面 transition 觸發時機
`PocPickedCardView.vue` 用 `useCard()` 控制 `isFlipped`，並在 phase=flipping 時以 `nextTick + requestAnimationFrame` 雙層延遲觸發 `flipCard()`，確保 DOM 先以 rotateY(0) mount 後再切 is-flipped class，讓 CSS transition 能觸發。若移除雙層延遲會導致首次翻面跳過動畫。

### 10.3 gameStore.drawCard 時機
在 phase 進入 `flipping` 時**立即**呼叫 `drawCard()`（非翻面動畫結束後），理由：
- 確保 `drawnCardIds` 與 overlay 顯示的 `pickedCard` 同步
- `remainingCount` 立即更新（AppHeader 反映正確）
- 扇形下一輪 window 的計算不會延遲

### 10.4 sessionStorage 不擴充
`visibleStart` 不進 snapshot（使用者重整後扇形從 drawnCount 起跳，視覺上中央仍是 next-to-draw）。若強行擴充會破壞 `contracts/game-session.schema.json` 並牽動 Phase 3 的 gameStore 測試。

### 10.5 Intimate 浮水印可見位置改變
POC 前：浮水印隨 CardStack 內的 CardFace 翻面時顯示。
POC 後：浮水印隨 PickedCardView overlay 的 CardFace 翻面時顯示。
E2E spec T096 需改 selector。視覺結果對使用者相同。

### 10.6 dev server 需重啟場合
新增 route 或修改 `router/index.ts` 的 import 時，Vite HMR 偶爾不會正確處理，建議 T092 刪除 POC route 後重啟 dev。

---

## 11. 關鍵檔案索引

### 規格
- `specs/001-love-talk-card-game/spec.md`（§6.1 修改）
- `specs/001-love-talk-card-game/data-model.md`（§6.2 修改）
- `specs/001-love-talk-card-game/plan.md`（§7 修改）
- `specs/001-love-talk-card-game/tasks.md`（§8 修改）
- `specs/001-love-talk-card-game/quickstart.md`（T097 修改）
- `Love Talk Spec.md`（根目錄；§6.3 修改）

### POC 原始檔（待搬家/重命名）
- `src/components/poc/PocThemeCard.vue`
- `src/components/poc/PocHomePreview.vue`
- `src/components/poc/PocFanCard.vue`
- `src/components/poc/PocFanDeck.vue`
- `src/components/poc/PocPickedCardView.vue`
- `src/views/PocHomeView.vue`
- `src/views/PocGameView.vue`

### 既有受影響檔
- `src/views/HomeView.vue`（T090 取代）
- `src/views/GameView.vue`（T091 取代）
- `src/components/card/CardStack.vue`（T092 刪除）
- `src/router/index.ts`（T092 清 POC route）
- `src/i18n/zh-TW.json`（T090 新增 preview.* 鍵）
- `tests/unit/components/CardStack.test.ts`（T092 刪除）
- `tests/e2e/playwright/us1-core-gameplay.spec.ts`（T095 改寫）
- `tests/e2e/playwright/us2-intimate-mode.spec.ts`（T096 改寫）

### 不動
- `src/stores/gameStore.ts` / `settingsStore.ts`
- `src/composables/useDeck.ts` / `useCard.ts`
- `src/utils/shuffle.ts` / `theme.ts` / `card-text.ts`
- `src/components/card/CardBack.vue` / `CardFace.vue`
- `src/components/layout/AppHeader.vue`
- `src/components/ui/ConfirmModal.vue` / `EndMessage.vue` / `ToggleSwitch.vue`
- `src/data/cards.json`
- `contracts/*.json`

---

## 12. 驗證清單（接手人完成時勾選）

- [ ] 步驟 0：`feat/ux-rebuild` 分支建立，POC commit 存在
- [ ] 步驟 2：三份 spec 文件更新完成
- [ ] 步驟 3：第一次 `/speckit.analyze` 報告已記錄
- [ ] 步驟 4：plan.md + tasks.md 更新完成
- [ ] 步驟 5：第二次 `/speckit.analyze` 無 blocking 警告
- [ ] T089 檔案搬家完成（5 個元件 + 2 個 View）
- [ ] T090 / T091 既有 HomeView / GameView 已替換
- [ ] T092 CardStack.vue 刪除、POC route 移除
- [ ] T093 data-test 正式命名
- [ ] T094 3 支新單元測試全 GREEN
- [ ] T095 / T096 E2E spec 改寫並 GREEN
- [ ] T097 quickstart.md 更新
- [ ] T098 完整 smoke test pass
- [ ] PR 建立、CI GREEN

---

## 13. 聯絡與溯源

- **設計決策來源**：2026-04-20 使用者與 AI agent 於 plan mode 三輪 QA（分支策略、翻面歸位、可點範圍）
- **POC 實測截圖與決策紀錄**：保存於本次對話歷史（Claude Code session），如需可由使用者調閱
- **Constitution 原則**：`.specify/memory/constitution.md`（如存在）
- **本文件原始位置**：`C:\Users\user\.claude\plans\serene-questing-sutton.md`（由 AI agent 於 plan mode 產出）
