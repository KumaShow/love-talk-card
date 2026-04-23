# 面試題：Vue 3 架構與 Pinia

> 最後更新：YYYY-MM-DD

這一章偏向你已熟的 Vue 生態，重點在「怎麼用本專案講自己的設計思考」。

## Q1: 為什麼要把邏輯抽成 composable？

**考點**：Composition API 的價值觀。

**30 秒版答案**：
（預留：重用 + 可測試 + 取代 mixins 的命名衝突問題。以 `useDeck`、`useCard` 為例。）

**可能追問**：
- Composable 跟 mixin 差在哪？
- Composable 裡能用 `onMounted` 嗎？有限制嗎？

---

## Q2: Pinia setup store 跟 options store 選哪個？為什麼？

**考點**：實務偏好與理由。

**30 秒版答案**：
（預留：setup store——型別推導好、跟 Composition API 一致、沒有 this；本專案一律用 setup。）

**可能追問**：
- 從 Vuex 搬過來要注意什麼？
- `$reset` 在 setup store 怎麼做？（本專案 `gameStore.ts:130-136` 手動實作）

---

## Q3: `ref` 跟 `reactive` 選哪個？

**考點**：Composition API 細節。

**30 秒版答案**：
（預留：ref 通用、reactive 限物件；ref 對 primitive 友善、對物件也可以；本專案一律用 ref。理由：一致性 + `.value` 明顯表示響應式讀取。）

**可能追問**：
- `reactive` 有什麼坑？（解構會失去響應性）
- `toRefs` 什麼時候用？

---

## Q4: Vue Router 的 navigation guard 你用過嗎？

**考點**：路由守衛實務。

**30 秒版答案**：
（預留：用過，以本專案 `router.beforeEach` 搭配 `meta.requiresValidThemeId` + `isValidThemeId` 守衛；非法路由直接導回首頁。）

**可能追問**：
- `beforeEach` 裡 `next()` 的三種用法（OK / false / 新路由）？
- 守衛能 async 嗎？需要注意什麼？

---

## Q5: 這個專案為什麼用 `createWebHashHistory` 而不是 `createWebHistory`？

**考點**：部署相關思考。

**30 秒版答案**：
（預留：GitHub Pages 靜態 host 不能做 SPA history fallback（沒有後端路由），所以用 hash mode。用 history mode 需要 server 配合。）

**可能追問**：
- 那 SEO 怎麼辦？
- 如果後來搬到 Vercel / Netlify 要怎麼切換？

---

## Q6: 這個專案有一個概念叫「狀態固化」，可以解釋一下嗎？

**考點**：你對自己 code 的理解深度（很常見的面試手法——挑一個專案細節追問）。

**30 秒版答案**：
（預留：進入 GameView 時把 `intimateMode` 跟 `deckOrder` 固化到 `gameStore`，之後 `settingsStore.intimateMode` 再變動也不影響當前 session。業務動機：使用者途中改設定，不該讓牌組中途變動。）

**2 分鐘版答案**：
（預留：補「為什麼要用 sessionStorage」、「重新整理後如何還原」、「不變量 2 + 3 如何互補」。）

**可能追問**：
- 為什麼不重洗牌？
- sessionStorage 壞了怎麼辦？
- 如果要做 localStorage 跨 session 保存，設計會怎麼改？

---

## Q7: 說說這個專案的整體架構。

**考點**：能不能一分鐘把架構畫出來。

**答題結構**：
1. 一句話定位：Vue 3 + Vite + TS 的 PWA 單頁應用，無後端。
2. 分層：Views → Composables → Stores → Utils → Data/Types。
3. 資料流：cards.json（靜態） → useDeck（filter→shuffle） → gameStore（固化 + sessionStorage） → GameView。
4. 關鍵不變量（挑 1–2 個）。
5. 部署：GitHub Pages + hash router + Service Worker（PWA 離線）。

**答案**：
（預留：照上面五步展開。）

---

## Q8: 你在這個專案遇過最難的設計決策是什麼？

**考點**：主動思考 + 誠實。

**答題思路**：
- 選一個真的有兩難的點（不要硬編）。
- 描述選項、trade-off、最後選擇與理由。
- 即使後來發現選錯也 OK，說「如果重來我會……」才加分。

**候選題材**：
- Filter 後 shuffle vs shuffle 後 filter（業務需求：intimate 卡不能集中在尾端）
- intimateMode 固化的時機（startSession 還是 persist 時）
- PWA 快取策略（CacheFirst / NetworkFirst / StaleWhileRevalidate 選哪個）
- i18n 字串放 `cards.json` 還是 `src/i18n/*.json`（目前兩者併存）

---

## 未成形題目區

- Vue 3 的 `provide` / `inject` 你用過嗎？跟 Pinia 怎麼選？
- `watch` vs `watchEffect` 差在哪？
- `nextTick` 什麼時候要用？
- `teleport` 的實際用途？
- SSR 的 hydration mismatch 遇過嗎？
- 這個專案如果要加 SSR 要改哪些地方？
