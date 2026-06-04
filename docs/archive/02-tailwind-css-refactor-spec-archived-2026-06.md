---
status: archived
reason: Tailwind CSS 重構已完成並已落地到實作，原文件保留作為歷史執行規格。
superseded_by:
  - src/assets/main.css
  - src/composables/useTheme.ts
  - src/components
  - src/views
---

# Tailwind CSS 重構規格（給 Codex 執行）

> 本文件是一份**執行規格**，目標是把 Love Talk Card 全部 17 個 `.vue` 元件從原生 scoped CSS 重構為 **Tailwind v4 utility-first + 集中式設計令牌（design tokens）**，並建立一個「設定全域樣式參數的唯一入口」。
>
> 執行者：Codex。請逐節遵守，特別是 **§3 核心原理**、**§8 不可破壞的不變量**、**§9 分批執行順序**。

---

## 1. 背景與目標

- 專案規格（`specs/001-love-talk-card-game/research.md` R-002、`plan.md`）明定採用 **utility-first Tailwind CSS v4**。
- Tailwind v4 工具鏈已正確安裝（`@tailwindcss/vite`、`src/assets/main.css` 第 1 行 `@import 'tailwindcss'`），但**目前 17 個元件全部用 `<style scoped>` + BEM 自訂 class，零 utility class**，等同未啟用 Tailwind。
- 本次目標：
  1. 建立**集中式設計令牌**（`@theme`）作為全域樣式參數的單一入口。
  2. 把**靜態樣式**（佈局、間距、色彩、字級、圓角）改為 utility class。
  3. **保留**無法用 utility 良好表達的複雜樣式（3D 翻牌、Vue `<Transition>`、`color-mix()`、動態 CSS 變數注入）於 scoped CSS，但改吃全域 token。
  4. 將 CSS 變數**語義化重新命名**。

### 採用策略（已與專案擁有者確認）

| 決策 | 選擇 |
|---|---|
| 重構程度 | **混合策略**：靜態改 utility，複雜動畫保留 scoped |
| Token 範圍 | **全套設計令牌**：顏色 + 字型 + 圓角 + 陰影 + 緩動曲線 + 動畫時長 |
| 變數命名 | **語義化重新命名** |

---

## 2. 現況盤點

- 主題色為**執行時動態注入**：`src/composables/useTheme.ts` 的 `applyTheme()` 以 `document.documentElement.style.setProperty('--color-xxx', …)` 寫入 6 個色票；`resetTheme()` 用 `removeProperty` 還原。
- 主題色資料來源：`src/data/themes/{attraction,trust,self,interaction}.json` 的 `colors` 欄位（`primary` / `secondary` / `background` / `backgroundEnd` / `text` / `cardBack`）。**本次不改 JSON 資料層欄位名稱。**
- 全域樣式：`src/assets/main.css` 定義 `:root` 6 個預設色、全域 reset、`#app` 漸層與 300–500ms 過場。`main.ts` 第 1 行 `import './assets/main.css'`。
- `tailwind.config.ts` 目前僅擴充 `fontFamily.serif`，**未使用 `@theme`**。

---

## 3. 核心原理：Tailwind v4 `@theme` 與動態主題完全相容

這是本重構的技術基石，**務必理解後再動手**：

1. `@theme { --color-brand: #e8a0bf; }` 會做兩件事：
   - 把 `--color-brand` 輸出成 `:root` 的真實 CSS 變數；
   - 生成對應 utility（`bg-brand` / `text-brand` / `border-brand` …），編譯結果為 `background-color: var(--color-brand)`（**走 `var()`，不內聯數值**）。
2. `useTheme.applyTheme()` 在執行時於 `<html>`（documentElement）的 **inline style** 上覆寫 `--color-brand`。inline style 優先級高於 stylesheet 的 `:root`，因此**所有 `bg-brand` utility 會自動跟著主題色變化**，動態主題機制完整保留。
3. `resetTheme()` 的 `removeProperty` 移除 inline 覆寫後，值自然回退到 `@theme` 的預設，行為與現況一致。

> ### ⚠️ 紅線：必須用普通 `@theme`，**絕對不可用 `@theme inline`**
> `@theme inline` 會把變數值**內聯**進 utility（不再走 `var()`），這會使 `useTheme` 的執行時覆寫**完全失效**，主題切換會壞掉。本專案 6 個主題色一律用普通 `@theme`。

---

## 4. 全域設計令牌規格（全域樣式參數的唯一入口）

把下列 `@theme` 區塊寫入 `src/assets/main.css`（取代現有 `:root` 6 個色票）。**這就是「設定全域樣式參數的地方」**——日後調整全站視覺只改這裡。

```css
@import 'tailwindcss';

/* ─────────────────────────────────────────────
 * 全域設計令牌（design tokens）
 * 這是全站樣式參數的單一入口。調整視覺請優先改這裡。
 * 注意：色彩令牌會被 useTheme 於執行時動態覆寫，
 *       因此必須使用普通 @theme（非 @theme inline），讓 utility 走 var()。
 * ───────────────────────────────────────────── */
@theme {
  /* 色彩：預設值＝心動瞬間（attraction）主題；執行時由 useTheme 覆寫 */
  --color-surface: #fff7fa;      /* 背景起始色（原 --color-bg） */
  --color-surface-end: #ffe8f0;  /* 背景漸層終點（原 --color-bg-end） */
  --color-brand: #e8a0bf;        /* 主題主色（原 --color-primary） */
  --color-accent: #ffd6e0;       /* 主題次色（原 --color-secondary） */
  --color-ink: #4a1528;          /* 文字色（原 --color-text） */
  --color-card: #c76d8e;         /* 卡牌背面色（原 --color-card-back） */

  /* 字型：取代 tailwind.config.ts 的 fontFamily.serif */
  --font-serif: ui-serif, Georgia, 'Times New Roman', serif;

  /* 圓角 */
  --radius-card: 1.75rem;        /* 卡牌/大面板（card-back、card-face、picked、preview 頂部） */
  --radius-panel: 1.5rem;        /* 中型面板（modal dialog、theme card、preview card） */
  --radius-pill: 999px;          /* 膠囊（按鈕、toggle、badge） */

  /* 陰影 */
  --shadow-card: 0 18px 40px -18px rgb(0 0 0 / 0.35);   /* 卡牌/end-message */
  --shadow-modal: 0 25px 60px -20px rgb(0 0 0 / 0.35);  /* confirm-modal dialog */
  --shadow-sheet: 0 -22px 44px -24px rgb(0 0 0 / 0.28); /* preview 底部抽屜（向上投影） */

  /* 緩動曲線（對應現有 cubic-bezier） */
  --ease-card: cubic-bezier(0.2, 0.8, 0.2, 1);    /* 翻面、扇形、進場主曲線 */
  --ease-dismiss: cubic-bezier(0.55, 0, 0.6, 1);  /* 卡片飛出 */

  /* 動畫時長（對齊憲章與 GameView 的 FLIP_DURATION_MS / DISMISS_DURATION_MS） */
  --duration-flip: 600ms;        /* 3D 翻面（≤600ms，憲章硬上限） */
  --duration-dismiss: 460ms;     /* 卡片飛出 */
  --duration-fan: 400ms;         /* 扇形卡轉場 */
  --duration-theme: 500ms;       /* #app 主題漸層過場（300–500ms 區間） */
}
```

### 4.1 間距與字級策略（不具名，沿用 Tailwind token 系統）

- **間距**：優先用 Tailwind 預設 scale（`gap-4`=1rem、`p-5`=1.25rem、`p-7`=1.75rem、`p-8`=2rem、`gap-3`=0.75rem…）。非標準值（如 `0.55rem`、`0.9rem`、`0.15rem`）用 arbitrary value（`gap-[0.55rem]`）。
- **字級**：常見值對到預設（`text-sm`=0.875rem 近似、`text-base`=1rem、`text-lg`=1.125rem、`text-xl`=1.25rem、`text-2xl`=1.5rem）。特殊值用 arbitrary（如標題 `text-[clamp(1.75rem,6vw,2.25rem)]`、`text-[0.72rem]`）。
- **字距/行高**：用 arbitrary（`tracking-[0.3em]`、`leading-[1.6]`）。

> 取捨理由：Tailwind v4 的間距由單一 `--spacing` 乘數驅動，具名間距 token 反而割裂系統；字級加上 letter-spacing/line-height 後語義過細，arbitrary value 更直觀且零維護成本。

### 4.2 `tailwind.config.ts` 瘦身

`fontFamily.serif` 已由 `@theme` 的 `--font-serif` 承載（生成 `font-serif` utility）。`content` 設定保留。`theme.extend.fontFamily` 可移除。

---

## 5. CSS 變數語義化命名映射

**JSON `colors` key 不變**，只改 CSS 變數名稱與其引用點。

| JSON colors key（不動） | 舊 CSS 變數 | 新語義化 CSS 變數 | 代表性 utility |
|---|---|---|---|
| `background`    | `--color-bg`        | `--color-surface`     | `bg-surface` |
| `backgroundEnd` | `--color-bg-end`    | `--color-surface-end` | `bg-surface-end` |
| `primary`       | `--color-primary`   | `--color-brand`       | `bg-brand` / `text-brand` / `border-brand` |
| `secondary`     | `--color-secondary` | `--color-accent`      | `bg-accent` / `text-accent` |
| `text`          | `--color-text`      | `--color-ink`         | `text-ink` |
| `cardBack`      | `--color-card-back` | `--color-card`        | `bg-card` |

### 5.1 連帶修改點（重命名波及面，務必全數同步）

1. **`src/composables/useTheme.ts`** — `CSS_VAR_MAP` 的 6 個 value：
   ```ts
   const CSS_VAR_MAP = {
     background: '--color-surface',
     backgroundEnd: '--color-surface-end',
     primary: '--color-brand',
     secondary: '--color-accent',
     text: '--color-ink',
     cardBack: '--color-card',
   } as const
   ```
   （key 維持，對應 `ThemeColors` 欄位；註解一併更新。）

2. **`src/assets/main.css`** — `:root` 6 色票移進 `@theme`；`body` 的 `color` 改 `var(--color-ink)`、`font-family` 改 `var(--font-serif)`；`#app` 漸層改 `var(--color-surface)` / `var(--color-surface-end)`，`color` 改 `var(--color-ink)`，過場時長改 `var(--duration-theme)`。

3. **全部元件的 `var(--color-*)` 引用**全面換新名（見 §7 各元件）。

4. **inline `:style` 注入的鍵名**也要改：
   - `src/components/card/FanCard.vue`：`'--color-card-back'` → `'--color-card'`。
   - `src/components/home/ThemeCardDeck.vue`：`:style="{ '--color-card-back': … }"` → `'--color-card'`；scoped 內 `--color-card-back: #c76d8e` 預設宣告同步。
   - `src/components/home/ThemePreview.vue`：`themeStyle` 的 `'--color-card-back'`/`'--color-primary'`/`'--color-secondary'` → `'--color-card'`/`'--color-brand'`/`'--color-accent'`。

5. **fallback 寫法**：`OrientationGuard.vue` 的 `var(--color-primary, #e8a0bf)` → `var(--color-brand, #e8a0bf)`。

6. **註解中的舊變數名**：`LanguageSelector.vue:8` 的註解「啟用按鈕以 `var(--color-primary)` 作為主題化視覺提示」其實與實作不符（實作用白色玻璃感、不吃主題色）。重命名時把此處 `--color-primary` 更新為 `--color-brand`（或修正註解使其符合實作），避免殘留舊名。

7. **⚠️ 測試檔同步（重命名的硬性連帶，絕不可漏）**：以下測試**直接斷言舊 CSS 變數名**，重命名後若不同步更新，`npm run test` 與 `npm run test:e2e` **必定失敗**。這些斷言反映的是「動態主題注入正確的變數」這個**行為**，故須隨變數名一起改，屬於正當的同步而非「篡改測試」：
   - `tests/unit/composables/useTheme.test.ts` — `themeVarNames` 陣列（6 個）+ 三個 `it` 內的 `getPropertyValue('--color-*')` 共約 14 處。
   - `tests/e2e/playwright/us4-theme-ambiance.spec.ts` — `CSS_VAR_NAMES` 陣列（6 個）+ `toEqual({...})` 物件鍵 + `afterReset['--color-bg']`。
   - `tests/unit/components/ThemePreview.test.ts` — `toMatch(/--color-card-back…/)`、`/--color-primary…/`、`/--color-secondary…/` 共 3 處（含 `new RegExp` 動態版本）與測試說明註解。
   - `tests/unit/components/ThemeCardDeck.test.ts` — `toMatch(/--color-card-back…/)` 2 處與測試說明註解。

---

## 6. 混合策略規則

### 6.1 保留在 scoped CSS（**不要硬轉 utility**，但顏色/時長改吃 token）

| 類別 | 元件與位置 |
|---|---|
| **3D 翻牌** | `PickedCardView.vue`（`perspective`、`transform-style: preserve-3d`、`rotateY(180deg)`、`.is-flipped`、`translate(-50%,-50%)` 定位）、`CardFace.vue`（`transform: rotateY(180deg)` + `backface-visibility`）、`CardBack.vue`（`backface-visibility`） |
| **Vue `<Transition>` 進離場 class** | `PickedCardView.vue`（`picked-backdrop-*`、`picked-shell-*`、`picked-cta-*`）、`ThemePreview.vue`（`preview-backdrop-*`、`preview-slide-*`、`preview-card-*`，含 `rotateY` 與 180ms delay）、`OrientationGuard.vue`（`orientation-guard-*`） |
| **動態 CSS 變數注入** | `FanCard.vue`（`--angle`、`transform-origin: 50% 120%`、`:hover` translateY、多屬性 transition） |
| **複雜漸層 / `color-mix()`** | `CardBack.vue`、`CardFace.vue`、`ThemeCardDeck.vue`、`ThemePreview.vue`、`PickedCardView.vue` 的 `linear/radial-gradient` 與 `color-mix(in srgb …)` |

> 上述保留項中，凡出現 `cubic-bezier(0.2,0.8,0.2,1)` 改 `var(--ease-card)`、`cubic-bezier(0.55,0,0.6,1)` 改 `var(--ease-dismiss)`、`600ms`→`var(--duration-flip)`、`460ms`→`var(--duration-dismiss)`、`400ms`→`var(--duration-fan)`；顏色 `var(--color-*)` 全部換新名。

### 6.2 可安全轉為 utility

- 純佈局/間距/對齊：`flex`/`grid`/`gap-*`/`items-*`/`justify-*`/`max-w-*`/`mx-auto`/`p-*`。
- 背景/文字/圓角/陰影：`bg-surface`/`text-ink`/`text-brand`/`rounded-[var(--radius-card)]`/`shadow-[var(--shadow-card)]`。
- `display:none` → `hidden`；`min-width/height:44px` inline style → `min-w-[44px] min-h-[44px]`。

### 6.3 `backdrop-filter` 轉換（可選，需逐一驗證 blur 值）

可改 utility，但**務必比對 blur 值**：`blur(3px)`→`backdrop-blur-[3px]`、`blur(4px)`→`backdrop-blur-sm`(≈4px) 或 `backdrop-blur-[4px]`、`blur(6px)`/`blur(8px)`/`blur(14px)` 用 arbitrary。若不確定一致性，**保留 scoped 較安全**。涉及元件：`PickedCardView`、`ConfirmModal`、`LanguageSelector`、`ThemePreview`、`OrientationGuard`。

---

## 7. 逐元件重構指引（17 檔）

> 標示：🟢 全轉 utility ｜ 🟡 部分轉換（含保留）｜ 🔴 以保留為主（僅換 token）
> 所有 `data-test` 屬性與 template DOM 結構**不得更動**。

### 批次 ② 簡單元件

- **`src/App.vue`** 🟢
  `.app-bgm { display:none }` → `<audio>` 加 `class="hidden"`，移除 `<style>`。
- **`src/components/layout/AppHeader.vue`** 🟢
  `grid grid-cols-[auto_1fr_auto] items-center gap-3 px-2 py-3`；back 鈕 `inline-flex items-center justify-center w-11 h-11 rounded-[var(--radius-pill)] bg-white/75 text-ink text-[1.2rem]`；remaining badge `bg-white/65 rounded-[var(--radius-pill)]`；count `text-brand font-semibold`。（`w-11/h-11`=44px ✓）
- **`src/components/ui/ToggleSwitch.vue`** 🟡
  容器、label 轉 utility；`:style="{minWidth/minHeight:'44px'}"` → `min-w-[44px] min-h-[44px]`。**track/thumb 的 `transition` 與 `.toggle-switch--on .thumb { translateX(20px) }` 狀態建議保留 scoped**（thumb 位移與 track 配色狀態切換用 scoped 較清晰）；`var(--color-primary)`→`var(--color-brand)`、`var(--color-text)`→`var(--color-ink)`。focus-visible outline 用 `var(--color-brand)`。
- **`src/components/ui/ConfirmModal.vue`** 🟡（`<Teleport to="body">` 保留）
  容器 `fixed inset-0 z-50 flex items-center justify-center p-6`；backdrop `absolute inset-0 bg-[rgb(40_20_30/0.5)]` + backdrop-blur（見 §6.3）；dialog `relative max-w-[22rem] w-full p-7 rounded-[var(--radius-panel)] bg-white text-ink shadow-[var(--shadow-modal)] flex flex-col gap-3`；按鈕 `min-w-[44px] min-h-[44px] rounded-[var(--radius-pill)]`，primary `bg-brand text-white`；ghost 的 `color-mix` border/text **保留 scoped**。
- **`src/components/ui/EndMessage.vue`** 🟡
  容器/eyebrow/標題轉 utility（`bg-white/85`、`shadow-[var(--shadow-card)]`、eyebrow `text-brand`）；CTA `min-w-[44px] min-h-[44px] bg-brand text-white rounded-[var(--radius-pill)]`；`.en` 的 `color-mix` 與 `:hover/:focus-visible { filter: brightness } ` **保留 scoped**。
- **`src/components/ui/LanguageSelector.vue`** 🟡
  此元件渲染在深色 `picked-backdrop` 之上，採**白色玻璃感**（`rgba(255,255,255,…)` + `backdrop-blur`），**刻意不使用主題色 token，重構時白色 rgba 一律保留、不要換成 `bg-brand` 等**。可轉：`:style="{minWidth/minHeight:'44px'}"` → `min-w-[44px] min-h-[44px]`；容器/按鈕的 `inline-flex items-center justify-center`、`rounded-[var(--radius-pill)]`、padding。**保留 scoped**：`bg-white/[0.18]` + `backdrop-blur`（見 §6.3，`blur(8px)`）、`--active` 狀態（`bg-white/[0.28]`）、`:hover`、`:focus-visible`（白色 outline）、多屬性 transition。註解第 8 行的舊變數名依 §5.1 第 6 點處理。

### 批次 ③ Views

- **`src/views/HomeView.vue`** 🟡
  `.home-view`→`min-h-screen px-5 pt-8 pb-12`；`__inner`→`max-w-[30rem] mx-auto flex flex-col gap-6`；`__header`→`text-center flex flex-col gap-[0.55rem]`；`__eyebrow`→`text-[0.72rem] tracking-[0.28em] uppercase text-brand`；`__title`→`font-serif text-[clamp(1.75rem,6vw,2.25rem)] font-semibold`；`__toggle`→`flex flex-col gap-[0.35rem] p-4 min-h-[44px] rounded-[1.25rem] bg-white/75`；`__deck-grid`→`list-none m-0 p-0 grid grid-cols-2 gap-4`；`__description`/`__toggle-hint`/`__footer` 的 `color-mix` **保留 scoped**（或用 `text-ink/70` 近似，需確認視覺）。
- **`src/views/GameView.vue`** 🟡
  `.game-view`→`min-h-screen px-5 pt-4 pb-10 flex flex-col gap-4`；`__inner`→`max-w-[30rem] mx-auto w-full flex flex-col gap-5`；`__meta`→`text-center flex flex-col gap-[0.3rem]`；`__eyebrow`→`text-[0.7rem] tracking-[0.3em] uppercase text-brand`；`__title`→`font-serif text-[1.75rem] font-semibold`；`__hint` 的 `color-mix` 保留 scoped。
- **`src/views/EndView.vue`** 🟢
  `.end-view`→`min-h-screen px-5 pt-10 pb-12 flex items-center justify-center`；`__inner`→`max-w-md w-full flex flex-col items-center gap-4`；`__eyebrow`→`text-brand text-xs tracking-[0.3em] uppercase`；`__title`→`text-[1.8rem] font-semibold text-center`。

### 批次 ④ 卡牌與動畫元件（以保留為主）

- **`src/components/card/CardBack.vue`** 🔴
  外層 flex 置中可轉 utility；但 `linear-gradient(... color-mix ...)`、`backface-visibility`、`box-shadow`、`__ornament` radial-gradient **全部保留 scoped**；`border-radius:1.75rem`→可用 `var(--radius-card)`；`var(--color-card-back)`→`var(--color-card)`；`box-shadow`→`var(--shadow-card)`。
- **`src/components/card/CardFace.vue`** 🔴
  `transform: rotateY(180deg)` + `backface-visibility` + `color-mix` 文字色 + watermark `position:absolute`/`min(60%,240px)` **保留 scoped**；佈局（flex col、gap、padding）可轉 utility；`var(--color-text)`→`var(--color-ink)`、`var(--color-primary)`→`var(--color-brand)`；圓角/陰影改 token。
- **`src/components/card/FanCard.vue`** 🔴
  幾乎全保留：`transform: translateX(-50%) rotate(var(--angle))`、`transform-origin`、多屬性 transition、`:hover`、`:focus-visible`。改：`var(--color-card-back)`→`var(--color-card)`（含 `computedStyle` 的鍵名）、`var(--color-primary)`→`var(--color-brand)`、`400ms`→`var(--duration-fan)`、`cubic-bezier(0.2,0.8,0.2,1)`→`var(--ease-card)`。
- **`src/components/card/FanDeck.vue`** 🟡
  `.poc-fan-deck` 的 `position:relative w-full h-[58vh] max-h-[520px]` 可轉 utility（或保留）；`__empty` 的 `color-mix` 保留 scoped。
- **`src/components/card/PickedCardView.vue`** 🔴
  **核心 3D 與 4 組 Transition 全保留**。僅換 token：`perspective` 保留；`var(--color-primary)`→`var(--color-brand)`；CTA 漸層/`color-mix`/`box-shadow` 保留 scoped；`transition` 內 `460ms`→`var(--duration-dismiss)`、`600ms`→`var(--duration-flip)`、`cubic-bezier(0.2,0.8,0.2,1)`→`var(--ease-card)`、`cubic-bezier(0.55,0,0.6,1)`→`var(--ease-dismiss)`。backdrop-blur 見 §6.3。
- **`src/components/home/ThemeCardDeck.vue`** 🔴
  三層堆疊 `transform: translate()+rotate()`、`filter: brightness`、漸層、radial-glyph **全保留**；外層 button flex 佈局可轉 utility；`:style` 與 scoped 預設的 `--color-card-back`→`--color-card`；`var(--color-text)`→`var(--color-ink)`；`200ms` hover transition 保留。
- **`src/components/home/ThemePreview.vue`** 🔴
  **底部抽屜 + 3 組 Transition（含 `rotateY` 翻卡與 180ms delay）全保留**；`themeStyle` 鍵名換新名；`var(--color-primary/secondary/card-back)` → 新名；漸層/`color-mix`/`box-shadow`/`perspective` 保留；`box-shadow` 向上投影可用 `var(--shadow-sheet)`；transition 的 cubic-bezier/時長換 token；backdrop-blur 見 §6.3。
- **`src/components/layout/OrientationGuard.vue`** 🟡
  容器佈局可轉 utility（`fixed inset-0 z-[9999] flex items-center justify-center p-6`）；`bg-[rgb(8_4_10/0.88)]` + backdrop-blur（§6.3）；`__icon` 的 `var(--color-primary, #e8a0bf)`→`var(--color-brand, #e8a0bf)`；`orientation-guard-*` Transition class 保留 scoped。

---

## 8. 不可破壞的不變量（驗收紅線）

1. **動畫時長**：翻牌 ≤ 600ms、主題過場 300–500ms（憲章）。`PickedCardView` 的 600ms/460ms 必須與 `GameView.vue` 的 `FLIP_DURATION_MS=600`、`DISMISS_DURATION_MS=460` 持平——**改用 token 後數值不可變**。
2. **觸控目標 ≥ 44×44 CSS px**：所有按鈕/toggle。`w-11 h-11`=44px、`min-w-[44px] min-h-[44px]`。
3. **`data-test` 屬性**：一律保留，**禁止改名或刪除**（E2E selector 依賴；Playwright `testIdAttribute: 'data-test'`）。
4. **DOM 結構與 ARIA**：`role`、`aria-*`、`<Teleport>`、`<Transition name="…">` 的 name 不可改（改 name 會讓 enter/leave class 對不上）。
5. **動態主題**：`useTheme` 注入 6 變數的行為、`@theme`（非 inline）相容性不可破壞。
6. **註解繁體中文**（ESLint `zh-tw/zh-tw-comment`）、**檔案 LF 換行**（`.gitattributes`）。
7. **視覺像素級接近**：混合策略本就為此；`color-mix`/漸層保留即為避免色偏。
8. **可存取性回歸**（重構不得弄丟既有行為）：
   - `:focus-visible` 焦點環必須保留——`ToggleSwitch`、`LanguageSelector`、`FanCard`、`EndMessage`、返回鍵與各 CTA。轉 utility 時若移除了原 scoped 的 `outline`，須以 `focus-visible:outline-*` 補回等效樣式。
   - 鍵盤操作：`FanCard`（Enter/Space 觸發）、`ToggleSwitch`（role="switch" + tabindex）、`LanguageSelector` 按鈕群、返回/確認流程，行為與重構前一致。
   - `aria-*` / `role` / `aria-pressed` / `aria-checked` 不可變動。
   - **超出本次範圍**：`forced-colors`（Windows 高對比）支援為**新功能**，專案現況未實作；本重構維持現況，不在此引入，如需支援另開議題。

---

## 9. 分批執行順序與每批驗收

> 風險由低到高，逐批開分支 + PR。**進 main 一律走分支 + PR，不直接 push main。**

| 批次 | 範圍 | 重點 |
|---|---|---|
| **①** | `main.css` 建 `@theme` + 全域重命名 + `useTheme.ts` `CSS_VAR_MAP` + `tailwind.config.ts` 瘦身 + **同步 §5.1 第 7 點的 4 個測試檔斷言** | 一次到位，先讓全站變數可運作（此時元件仍用舊變數會壞，故①需連同所有 `var()` 引用一起改名，或分兩步：先加新 token 並保留舊 alias，再逐批移除）。**測試斷言須與變數名一起改，否則本批 `npm run test`/`test:e2e` 直接紅燈。** |
| **②** | `App` / `AppHeader` / `ToggleSwitch` / `ConfirmModal` / `EndMessage` / `LanguageSelector` | 簡單元件，建立 utility 風格範例（共 6 檔） |
| **③** | `HomeView` / `GameView` / `EndView` | Views 佈局 |
| **④** | `CardBack` / `CardFace` / `FanCard` / `FanDeck` / `PickedCardView` / `ThemeCardDeck` / `ThemePreview` / `OrientationGuard` | 3D 與動畫，最高風險（共 8 檔） |

> 元件總計：批次 ②(6) + ③(3) + ④(8) = **17 檔**，與 §7 一致。批次①為全域基礎建設（含測試同步），不計入元件數。

> **批次①的安全作法**：先在 `@theme` 定義新名 token，並在 `:root` 暫時保留舊名 alias（`--color-primary: var(--color-brand)` 等），讓②③④可漸進遷移；全部元件改完後，最後一個 PR 移除舊 alias 與 `useTheme` 舊鍵。若 Codex 有把握一次全改，亦可省略 alias。

### 每批必過驗收指令

```bash
npm run lint          # ESLint（含繁中註解規則）
npm run type-check    # vue-tsc --noEmit
npm run test          # Vitest + coverage（整體 80%、composables/stores 95%）
npm run build         # vue-tsc + vite build（型別錯誤會擋建構）
npm run test:e2e      # Playwright（iPhone 14 portrait）
```

> **測試處置原則**：
> - **元件樣式測試**（佈局/class 類）原則上不動；若 E2E 因 selector 失敗，**先檢查是否誤改了 `data-test`**，而非改測試。
> - **CSS 變數名斷言**（§5.1 第 7 點的 4 檔）**必須**隨批次①的重命名同步更新——這是反映「主題注入正確變數」的行為斷言，屬正當同步，不是篡改測試。改測試前再次確認新舊變數名一一對應（§5 映射表）。

---

## 10. 完成檢查清單

- [ ] `src/assets/main.css` 以普通 `@theme`（非 `@theme inline`）定義全套 token，`:root` 不再有重複色票。
- [ ] `useTheme.ts` `CSS_VAR_MAP` 改為新語義化變數名，註解同步。
- [ ] 全部 17 元件的 `var(--color-*)` 與 inline `:style` 注入鍵名已換新名，無殘留舊名。**搜尋範圍限 `src/**` 與 `tests/**`**（`grep -rn -- '--color-bg\|--color-primary\|--color-secondary\|--color-text\|--color-card-back' src tests` 應為 0 筆，alias 過渡期除外）。**勿對整個 repo 搜尋**：`docs/`（本規格與審查文件）與 `specs/`（歷史規格）刻意保留舊名作為紀錄，不在清理範圍。
- [ ] §5.1 第 7 點的 4 個測試檔斷言已同步改為新變數名，`npm run test` 與 `npm run test:e2e` 全綠（含 `useTheme.test.ts`、`us4-theme-ambiance.spec.ts`、`ThemePreview.test.ts`、`ThemeCardDeck.test.ts`）。
- [ ] `LanguageSelector.vue:8` 註解的舊變數名已處理，且其白色玻璃感未被誤換成主題 token。
- [ ] 可存取性回歸（§8.8）：focus-visible 焦點環、鍵盤操作、ARIA 屬性與重構前一致。
- [ ] 靜態樣式已轉 utility；3D/Transition/動態變數/`color-mix` 保留 scoped 且改吃 token。
- [ ] 觸控目標 ≥ 44px、動畫時長與常數一致、`data-test` 全保留。
- [ ] `tailwind.config.ts` 的 `fontFamily` 已移除（由 `@theme --font-serif` 承載）。
- [ ] 五項驗收指令全綠。
- [ ] `npm run dev` 逐主題（attraction/trust/self/interaction）人工確認：漸層過場、3D 翻牌手感、扇形展開、私密模式開關、主題預覽抽屜、橫向提示——皆與重構前一致。

---

## 附錄：commit / PR 慣例

- Conventional Commits，內容繁體中文（例：`refactor(ui): ToggleSwitch 改用 Tailwind utility 與設計令牌`）。
- commit message **不加** AI 協作署名（Co-Authored-By）。
- 每批一個 PR，PR 描述列出該批改動元件與驗收結果。
