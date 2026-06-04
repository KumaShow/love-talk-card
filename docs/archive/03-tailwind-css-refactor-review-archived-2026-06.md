---
status: archived
reason: 對 Tailwind CSS 重構規格的審查任務已完成，保留作為歷史審查記錄。
superseded_by:
  - docs/archive/002-tailwind-css-refactor-spec-archived-2026-06.md
  - src/assets/main.css
---

# Tailwind CSS 重構計劃審查建議

以下為對 `docs/tailwind-css-refactor-spec.md` 的審查結果與修正建議。

## 結論

這份重構計劃方向正確，主軸也合理：

- `@theme`（非 `@theme inline`）搭配執行時 CSS 變數覆寫
- 靜態樣式改用 Tailwind utility
- 複雜動畫與 3D 效果保留 scoped CSS

但在正式執行前，**建議先修正**下列幾點，避免落地時出現漏項或驗收條件失準。

## 審查發現與建議

| 項目 | 問題 | 建議 |
|---|---|---|
| 元件盤點不完整 | 文件宣稱要處理 17 個 `.vue` 元件，但逐元件指引只列出 16 個，漏了 `src/components/ui/LanguageSelector.vue`。 | 補進 §7 的逐元件指引與批次安排，並明確標示哪些樣式保留 scoped、哪些可轉 utility。 |
| 完成檢查條件過寬 | §10 的全域搜尋條件包含文件本身會用到的舊變數名，若直接做 repo-wide 搜尋會天然失敗。 | 將搜尋範圍限制為 `src/**/*.{vue,ts,css}`，或註明「僅檢查實作檔，不含 docs/spec」。 |
| 可存取性驗收不足 | 計劃提到 44px、ARIA、`data-test`，但未明確驗證 focus-visible、鍵盤操作、對比與 forced-colors。 | 在 §8 或 §10 補上可存取性驗收條件，至少涵蓋 `ToggleSwitch`、`LanguageSelector`、返回鍵與 CTA 按鈕。 |

## 建議修正優先順序

1. 補上 `LanguageSelector.vue`。
2. 修正完成檢查的搜尋範圍。
3. 補強可存取性驗收條件。

## 總評

這份計劃**不需要重寫**，但上述項目最好先修正後再執行。  
否則容易出現「文件宣稱全數處理，但實際漏掉元件」或「驗收條件本身無法通過」的問題。
