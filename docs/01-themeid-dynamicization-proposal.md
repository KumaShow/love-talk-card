# ThemeId 動態化實作草案（偏方案 B）

## 目標

將新增主題時的修改點，從目前至少需要同步修改：

- `src/data/index.ts`
- `src/types/index.ts`
- `src/utils/theme.ts`

收斂為：

1. 新增 `src/data/themes/*.json`
2. 執行一次產生器腳本
3. 讓型別、資料入口、驗證名單自動同步

這份草案偏向「建置期動態，編譯期保留強型別」的方案 B。

## 目前痛點

目前專案雖然已完成「每主題一檔」的資料拆分，但主題識別碼仍不是完全資料驅動：

- `src/data/index.ts` 仍需手動 import 每個主題檔
- `src/types/index.ts` 仍手寫 `VALID_THEME_IDS`
- 新增主題時，資料與型別來源沒有單一權威入口

這代表資料結構已經主題化，但主題註冊流程仍是手動的。

## 建議方向

新增一個建置期產生器，掃描 `src/data/themes/*.json`，自動產生單一權威檔案，例如：

- `src/generated/theme-manifest.ts`

這個檔案負責輸出：

- `VALID_THEME_IDS`
- `ThemeId`
- `themeFiles`

如此一來：

- `src/types/index.ts` 不再手寫主題 ID
- `src/data/index.ts` 不再手寫 import 清單
- `src/utils/theme.ts` 可直接重用 `VALID_THEME_IDS`

## 建議檔案結構

```text
scripts/
  generate-theme-manifest.mjs

src/
  data/
    themes/
      attraction.json
      self.json
      interaction.json
      trust.json
  generated/
    theme-manifest.ts
```

## 建議流程

### 1. 建立產生器腳本

新增 `scripts/generate-theme-manifest.mjs`：

- 掃描 `src/data/themes/*.json`
- 讀取每個 JSON 的 `id`
- 驗證：
  - 每個檔案都有 `id`
  - `id` 不可重複
  - 檔名與 `id` 最好一致
- 產出 `src/generated/theme-manifest.ts`

### 2. 產出的 manifest 內容

範例：

```ts
import attraction from '@/data/themes/attraction.json' with { type: 'json' }
import interaction from '@/data/themes/interaction.json' with { type: 'json' }
import self_ from '@/data/themes/self.json' with { type: 'json' }
import trust from '@/data/themes/trust.json' with { type: 'json' }

export const VALID_THEME_IDS = ['attraction', 'interaction', 'self', 'trust'] as const

export type ThemeId = (typeof VALID_THEME_IDS)[number]

export const themeFiles = [attraction, interaction, self_, trust] as const
```

重點：

- `VALID_THEME_IDS` 由主題檔自動產生
- `ThemeId` 由 `VALID_THEME_IDS` 推導
- `themeFiles` 也由同一來源自動產生

### 3. 調整 `src/types/index.ts`

目前：

```ts
export const VALID_THEME_IDS = ['attraction', 'self', 'interaction', 'trust'] as const
export type ThemeId = (typeof VALID_THEME_IDS)[number]
```

建議改成：

```ts
export { VALID_THEME_IDS, type ThemeId } from '@/generated/theme-manifest'
```

其餘型別維持不變。

### 4. 調整 `src/data/index.ts`

目前手動 import 四個 JSON，再組成 `themeFiles`。

建議改成直接使用產生結果：

```ts
import type { CardsData, ThemeId } from '@/types'
import { themeFiles } from '@/generated/theme-manifest'
```

後續組裝 `cardsData` 的邏輯可以大致維持原樣，只把手寫 imports 移除。

### 5. 調整 `src/utils/theme.ts`

改成直接重用生成結果：

```ts
import type { ThemeId } from '@/types'
import { VALID_THEME_IDS } from '@/generated/theme-manifest'
```

如此 `isValidThemeId()` 仍保有型別守衛能力，且不需再手動同步。

## 建議 npm scripts

可新增：

```json
{
  "scripts": {
    "generate:themes": "node scripts/generate-theme-manifest.mjs",
    "prebuild": "npm run generate:themes",
    "pretest": "npm run generate:themes",
    "pretype-check": "npm run generate:themes"
  }
}
```

若不想每次都跑，也可以先只接：

```json
{
  "scripts": {
    "generate:themes": "node scripts/generate-theme-manifest.mjs"
  }
}
```

再由開發流程或 CI 強制檢查 generated 檔是否最新。

## 驗證與測試建議

### 單元測試

新增或調整以下測試：

- `tests/unit/data/theme-manifest.test.ts`
  - `VALID_THEME_IDS` 與 `themeFiles.map((t) => t.id)` 一致
  - `VALID_THEME_IDS` 無重複值
- `tests/unit/utils/cards-schema.test.ts`
  - 不再假設固定主題數量
  - 改驗證每個主題檔都通過 `ThemeFileSchema`

### 產生器測試

若要更穩，可以替 `generate-theme-manifest.mjs` 補一個腳本層測試，驗證：

- 依檔名排序輸出，避免 manifest 順序不穩定
- `self.json` 對應變數名需避開保留字，可自動轉成 `self_`
- 若 JSON 缺少 `id`，腳本應直接失敗

## 排序規則建議

為了降低 diff noise，產生器建議固定排序：

1. 先依檔名排序
2. 再輸出 import、`VALID_THEME_IDS`、`themeFiles`

這樣即使不同人新增主題，manifest 也比較穩定。

## 與純動態載入方案的取捨

相比 `import.meta.glob()` 的純執行期動態方案，這個方案的優點是：

- 保留 `ThemeId` 的編譯期 union 型別
- 路由參數、store、測試的型別提示更完整
- `isValidThemeId()` 仍可保有窄化效果

代價是：

- 需要多一個 generated 檔與產生器腳本
- 開發流程要確保 manifest 沒有過期

對這個專案來說，我認為這個代價是值得的，因為目前本來就重視：

- TypeScript 型別約束
- Zod 資料驗證
- 測試穩定性

## 建議落地順序

1. 新增 `scripts/generate-theme-manifest.mjs`
2. 產生 `src/generated/theme-manifest.ts`
3. 修改 `src/types/index.ts` 改吃 generated manifest
4. 修改 `src/data/index.ts` 改吃 generated manifest
5. 修改 `src/utils/theme.ts` 改吃 generated manifest
6. 補上 manifest 與產生器相關測試
7. 視團隊習慣決定是否掛入 `prebuild` / `pretest`

## 建議決策

如果你要開始真正實作，我建議先走這個最小可落地版本：

1. 先做 `generate-theme-manifest.mjs`
2. 先讓 `src/data/index.ts` 與 `src/utils/theme.ts` 改吃 generated manifest
3. 再把 `src/types/index.ts` 切過去

原因是這樣可以先確保資料入口與驗證名單一致，再收斂型別來源，重構風險比較低。
