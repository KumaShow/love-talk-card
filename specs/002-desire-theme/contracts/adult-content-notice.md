# Contract: Adult Content Notice（攔截式成人內容確認）

**Feature**: 002-desire-theme | **Date**: 2026-06-08
**來源需求**: FR-004、US1 AS-5、Edge Cases、SC-006/SC-007
**Clarify**: Session 2026-06-08 — 攔截式確認，每次進入皆需，可返回，不持久化

本契約定義進入 `desire` 主題前的攔截式確認元件與守衛行為。屬 UI 契約（本專案無對外 API）。

## 元件：`AdultContentNotice.vue`（`src/components/ui/`）

### 顯示內容（全部走 i18n，禁止硬碼）

| 區塊 | i18n 鍵（建議） | 說明 |
|------|----------------|------|
| 標題 | `notice.adult.title` | 例：「成人親密主題」 |
| 內文 | `notice.adult.body` | 說明本主題涉及成人身體親密、同意與身體界線；尊重、非驚嚇語氣 |
| 年齡聲明 | `notice.adult.ageConfirm` | 例：「我已年滿 18 歲，並理解此主題包含成人親密內容」 |
| 繼續鈕 | `notice.adult.continue` | 主色 CTA；確認後導航 |
| 返回鈕 | `notice.adult.back` | 次要；關閉並留在首頁 |

### 行為

1. **攔截**：在導航至 `/game/desire` 之前顯示；使用者未明確確認前**不得**載入 desire 遊戲畫面。
2. **確認（繼續）**：使用者完成年齡聲明確認動作後，標記導覽暫態旗標 `desireAcknowledged = true`，導航至 `/game/desire`，並立即消費（重置）旗標。
3. **返回**：關閉 overlay，停留於首頁，**不**導航。
4. **每次進入皆需**：旗標為導覽生命週期暫態，不寫入 sessionStorage/localStorage；返回首頁、重整、或下次再選 desire 都須重新確認（FR-004）。
5. **可退出**：overlay 必須提供明確返回路徑（返回鈕 +／或 backdrop/ESC 關閉），等同「不選擇此主題」。

### 觸發點（所有進入路徑一致受攔截）

| 進入路徑 | 行為 |
|----------|------|
| HomeView 選 desire 卡堆 | 開啟 notice（不直接導航） |
| ThemePreview 「開始對話」（desire） | 開啟 notice（不直接導航） |
| 深連結／重整 `/game/desire` | router `beforeEach` 偵測 `desireAcknowledged` 非 true → 導向首頁並開啟 notice |

## 守衛：`router/index.ts` `beforeEach`（演進）

```text
若 to = /game/desire 或 /end/desire 鏈路：
  既有：requiresValidThemeId 檢查（desire 已是合法 themeId）
  新增：若 to.name === 'game' 且 themeId === 'desire' 且 desireAcknowledged !== true
        → 重導 { name: 'home', （附帶觸發 notice 的狀態）}
```

- **不破壞既有行為**：四主題與既有守衛邏輯不受影響；新增分支僅作用於 `game` + `desire` 且未確認的情況。

## 無障礙（憲章）

- 確認／返回鈕觸控目標 ≥ 44×44 CSS px。
- overlay 文字對 desire 背景對比 ≥ WCAG AA 4.5:1。
- 焦點管理：開啟時聚焦於 notice、可鍵盤操作、ESC 等同返回。

## 驗收對應

| 驗收 | 來源 |
|------|------|
| 進入前顯示須主動確認才能繼續的攔截式提示，並提供返回 | US1 AS-5 |
| 每次進入皆需重新確認（不記住） | FR-004 / Clarify |
| 直連 `/game/desire` 亦受攔截 | 深連結守衛 |
| 不選 desire 可正常使用既有主題與 intimate 模式 | SC-007 |
