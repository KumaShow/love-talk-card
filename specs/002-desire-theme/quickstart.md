# Quickstart: Desire Theme

**Feature**: 002-desire-theme | **Date**: 2026-06-08
**Input**: [plan.md](./plan.md)、[data-model.md](./data-model.md)、[contracts/](./contracts/)

本文件提供 desire 功能的實作切入點、驗證步驟，以及內容維護者用的**主題邊界分類清單**。

---

## 1. 實作順序（TDD：每步先寫 failing test）

1. **型別與 schema 演進**（[data-model.md](./data-model.md) §2–§3）
   - `types/index.ts`：`VALID_THEME_IDS` 加 `'desire'`；`Card.isIntimate` 改選填。
   - `data/validators.ts`：`isIntimate` 選填、id 正規式放寬。
   - 先改 `tests/unit/utils/cards-schema.test.ts`（id pattern + themeFiles）→ red → green。
2. **desire 資料檔**（[contracts/desire-theme.schema.json](./contracts/desire-theme.schema.json)）
   - `data/themes/desire.json`：主題 meta（R-002 色票）+ 20 張 `des-NNN`（先放佔位文案，內容任務補實）。
   - `data/index.ts`：import 並加入 `themeFiles`。
   - 新增 `tests/unit/data/desire-theme.test.ts`。
3. **i18n**：`i18n/zh-TW.json` 與 `en.json` 加 `theme.desire`、`home.desire*`、`notice.adult.*`。
4. **攔截式 notice + 守衛**（[contracts/adult-content-notice.md](./contracts/adult-content-notice.md)）
   - `components/ui/AdultContentNotice.vue`、`router/index.ts` 守衛、`views/HomeView.vue` 與 `components/home/ThemePreview.vue` 觸發點。
   - 新增 `tests/unit/components/AdultContentNotice.test.ts`、`tests/unit/router/desire-guard.test.ts`。
5. **E2E**：`tests/e2e/playwright/us-desire-entry.spec.ts`（首頁→預覽提示→攔截確認→進入；返回路徑；直連被攔截）。
6. **內容 + 審查**：補實 20 張 desire 卡（zh/en/th 真實、ja=en 佔位），逐張過 §3 安全審查。

## 2. 本地驗證指令

```bash
npm run type-check
npx vitest run tests/unit/data/desire-theme.test.ts
npx vitest run tests/unit/utils/cards-schema.test.ts
npx vitest run tests/unit/components/AdultContentNotice.test.ts
npm run test            # 全量單元 + 覆蓋率門檻
npx playwright test tests/e2e/playwright/us-desire-entry.spec.ts
npm run dev             # 手動驗證：首頁出現第 5 主題、進入前攔截確認、返回可退出
```

## 3. 內容安全審查清單（每張 desire 卡逐項）— 對應 FR-006 / US4 / SC-005

- [ ] 成人但**非露骨技巧教學**；鼓勵描述偏好/界線/慢慢探索，而非要求立即行動（AS US4-1）。
- [ ] 親密頻率題允許差異與協商，**不暗示任一方有義務**滿足對方（US4-2）。
- [ ] 邀請方式題包含**可拒絕、可暫停、可改天**的語氣（US4-3）。
- [ ] **不含**未成年、非自願、脅迫、酒醉失去判斷、羞辱貶低、暴力傷害、露骨技巧教學、醫療性建議（FR-006 / US4-4）。
- [ ] 語氣尊重、可拒絕、以雙方同意與安全為核心；非測驗式評分、非強迫揭露。
- [ ] 翻譯（th）保留「成人、同意、安全、可拒絕」語氣，不因語言轉換更露骨或更含糊（Edge Case）。

## 4. 主題邊界分類清單（候選題目 → 主題）— 對應 FR-010 / US3 / SC-002

依**題目的主要對話任務**判斷，落點唯一：

| 若主要任務是… | 歸入 | 依據 |
|----------------|------|------|
| 火花、心動、魅力、被吸引、浪漫注目 | `attraction` | CB-001 / US3-1 |
| 自我覺察、個人需求、情緒模式、對慾望/界線的**內省** | `self` | CB-002 / US3-2 |
| 日常習慣、溝通風格、玩笑、衝突模式、相處節奏 | `interaction` | CB-003 |
| 可靠、情感安全、脆弱、修復、承諾 | `trust` | CB-004 / US3-4 |
| **成人身體親密、性需求、碰觸偏好、親密頻率、邀請、同意協商** | `desire` | CB-004 例外 / US3-3 |

**判斷要訣**：
- 重點是「**伴侶間身體協商**」→ desire；重點是「**自我理解**」→ self。
- 信任/安全題若主體是「**成人身體親密中的同意與界線**」→ desire；否則留 trust。
- 既有四主題 intimate 卡疑似越界（主要任務變成成人身體親密協商）→ 移至 desire／改寫回原尺度／暫緩（CB-006 / US2-5）。

## 5. 完成判準（對照 Success Criteria）

- SC-001 第 5 主題不需 one-off pipeline、不需 15+5 分層 → 由型別/資料加法達成。
- SC-006/SC-007 進入前可辨識為成人主題、可選可避 → 由分層提示 + 攔截式 notice 達成。
- SC-009 啟用 intimate 後選 desire 不變露骨、不多出卡 → desire 牌組不受 intimateMode 影響（data-model §7）。
