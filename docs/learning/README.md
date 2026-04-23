# Love Talk Card 學習筆記

以本專案為載體，系統性學習 TypeScript 與前端測試，並累積可用於面試的具體答題素材。

## 為什麼寫這份筆記

- **以專案為導向**：不背抽象定義，每個觀念都對應到專案實際的 `file:line`。
- **累積面試彈藥**：面試官問「你怎麼測 Pinia store？」時，能從自己寫過的 code 舉例，遠比背教科書有力。
- **加深對專案的理解**：寫筆記會逼你讀懂為什麼這樣寫，而不只是照抄。

## 目錄結構

| 檔案 / 資料夾 | 內容 |
| --- | --- |
| [`TEMPLATE.md`](./TEMPLATE.md) | 統一筆記範本（新增主題時複製） |
| [`00-project-architecture.md`](./00-project-architecture.md) | 專案架構總覽（建議最先讀） |
| [`typescript/`](./typescript/) | TS 觀念（型別守衛、泛型、Vue + TS 模式等） |
| [`testing/`](./testing/) | 前端測試（Vitest、Pinia 測試、Playwright、coverage） |
| [`interview-qa/`](./interview-qa/) | 面試題庫（主題式整理 Q&A） |

## 建議學習路徑

**Phase A：建立地圖（先做）**
1. 讀 `00-project-architecture.md`，把資料流與不變量理解清楚。
2. 對照 `src/types/index.ts`、`src/stores/gameStore.ts`，跑一次 `npm run dev` 感受效果。

**Phase B：TypeScript（邊讀 code 邊補）**
3. `typescript/01-type-guards.md` — 最短、成就感高，適合開場。
4. `typescript/02-union-literal-types.md`
5. `typescript/03-generics.md`
6. `typescript/04-vue-ts-patterns.md`

**Phase C：測試（建議跟 TDD workflow 對齊）**
7. `testing/01-vitest-basics.md`
8. `testing/02-pinia-store-testing.md`
9. `testing/03-composable-testing.md`
10. `testing/04-mocks-and-timers.md`
11. `testing/05-coverage-and-thresholds.md`
12. `testing/06-e2e-playwright.md`

**Phase D：面試題輸出**
13. 把 B、C 學到的每個主題，在 `interview-qa/` 轉成 Q&A 卡。自問自答一次。

## 寫作原則

- **引用 `file:line`**：不要抄完整檔案，只貼最小可理解片段 + 檔案路徑行號。
- **寫「為什麼」**：語法是 MDN 的工作，筆記的價值在解釋「為什麼這個專案這樣寫」。
- **允許不完整**：每次補 1–2 段即可，筆記和 code 一樣會 refactor。
- **日期記號**：在檔案開頭記最後更新日，半年後回看會知道資訊是否還新。

## 維護節奏

- 每完成一個 User Story（US）或 Phase → 花 30–60 分鐘回補當期新學到的主題。
- 筆記本身用 Git 追版本，不用另外做「歷史版本」章節。
- 發現舊筆記寫錯或過時，直接改，別保留錯誤版本。
