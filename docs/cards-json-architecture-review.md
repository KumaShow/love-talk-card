# cards.json 架構審查

## 審查結論

目前 `src\data\cards.json` 採用：

- `themes`：主題中繼資料
- `cards`：全部卡牌的扁平陣列

這種設計在目前 4 個主題、80 張卡的規模下可正常運作，效能也不是問題；但從內容維護與未來擴充角度來看，確實有改善空間。  
**真正的主要風險不只在於 `cards` 未依主題分組，而是「主題數量與主題 ID 被多處寫死」**，因此未來新增主題時，會同時影響資料、型別、驗證、路由與測試。

## 現況分析

### 1. 資料結構現況

`cards.json` 目前將主題資訊與卡牌內容分開：

- `themes[]`：保存主題名稱、描述、顏色與結束語
- `cards[]`：保存所有主題的卡牌，每張卡用 `theme` 欄位標示所屬主題

這代表資料是**正規化**的，但不是**以維護內容為導向**的結構。  
當要編修單一主題的所有題目時，維護者需要在大陣列中靠 `theme` 與 `id` 搜尋，閱讀與整理成本較高。

### 2. 執行期使用方式

目前程式主要透過扁平陣列篩選主題卡牌：

- `src\composables\useDeck.ts`
  - `buildDeck(themeId, allCards, intimateMode)` 會使用 `card.theme === themeId` 過濾卡牌
  - 再依 `intimateMode` 決定是否排除私密卡，最後整體洗牌
- `src\stores\gameStore.ts`
  - `startSession()` 直接使用 `cardsDataset.cards`
  - `restoreSession()` 會從 `cardsDataset.cards` 建立 `Map<id, card>`
- `src\views\HomeView.vue`、`GameView.vue`、`EndView.vue`
  - 都直接 import `cards.json`
  - 主要使用 `dataset.themes`

結論是：  
**目前系統能正常工作，但資料使用入口分散，View、Store、Composable 都直接依賴原始 JSON。**

### 3. 真正的耦合點

除了 `cards` 是扁平陣列之外，主題也被固定在多個地方：

- `src\types\index.ts`
  - `ThemeId` 是固定 union：`'attraction' | 'self' | 'interaction' | 'trust'`
- `src\utils\theme.ts`
  - `validThemeIds` 寫死四個值
- `specs\001-love-talk-card-game\contracts\card-data.schema.json`
  - `themes` 的 `minItems/maxItems` 固定為 4
  - `ThemeId` enum 固定四個主題
- 多個測試檔
  - 直接驗證 `4 個主題 / 80 張卡`

這代表新增主題時，不只要加資料，還要同步修改：

1. 型別
2. schema 契約
3. 路由驗證
4. 測試案例

因此目前的高耦合點是：

- **內容資料結構**
- **主題識別碼的靜態定義**
- **測試與契約對固定主題數量的假設**

## 維護風險

### 1. 單一主題內容不易集中維護

現在若要調整某主題的題目順序、檢查題目覆蓋程度、補新增題目，必須在同一個大型 `cards[]` 中搜尋。  
隨著題目數量增長，這會讓編輯、校稿與審核效率下降。

### 2. 新增主題的修改面過大

未來若加入第 5 個主題，不是只在 `cards.json` 增加資料即可，而是要連帶修改多個檔案。  
這會提高漏改風險，也降低資料驅動擴充的能力。

### 3. 原始 JSON 被多層直接引用

目前 View、Store、Composable 都直接 import `cards.json`。  
如果未來想把資料格式改成巢狀結構，或拆成多個檔案，會有較大的連動修改成本。

## 建議改善方向

## 優先建議：先抽出資料存取層

最推薦先做的不是直接重寫 `cards.json`，而是新增一層集中式資料存取模組，例如：

- `src\data\cardCatalog.ts`

建議由這個模組統一提供：

- `getThemes()`
- `getThemeById(themeId)`
- `getCardsByTheme(themeId)`
- `getDeckCards(themeId, intimateMode)`
- `getCardMapById()`

好處：

- View、Store、Composable 不再直接依賴 `cards.json`
- 之後若要改資料格式，改動可集中在一處
- 測試也可逐步轉成測這層介面，而不是測原始 JSON 結構

**這一步是低風險、高報酬的最佳切入點。**

## 第二階段：把卡牌資料改成依主題聚合

當資料存取層完成後，再考慮重構 `cards.json`。

### 方案 A：單一檔案、依主題巢狀化

範例：

```json
{
  "version": "1.1.0",
  "themes": [
    {
      "id": "attraction",
      "name": { "zh": "...", "en": "..." },
      "description": { "zh": "...", "en": "..." },
      "colors": {
        "primary": "#E8A0BF",
        "secondary": "#FFD6E0",
        "background": "#FFF0F5",
        "backgroundEnd": "#FFE0EC",
        "text": "#4A1528",
        "cardBack": "#C76D8E"
      },
      "endMessage": { "zh": "...", "en": "..." },
      "cards": {
        "base": [],
        "intimate": []
      }
    }
  ]
}
```

優點：

- 單一主題資料集中
- 編輯與審稿比較直覺
- 可直接看出每主題 base / intimate 結構

缺點：

- 若仍需全域搜尋所有卡牌，需先展平
- schema 與型別需要一起調整

### 方案 B：每個主題拆成獨立檔案

例如：

- `src\data\themes\attraction.json`
- `src\data\themes\self.json`
- `src\data\themes\interaction.json`
- `src\data\themes\trust.json`

再由入口檔組裝成資料集。

優點：

- 最適合未來新增主題
- 最能降低多人協作時的 merge conflict
- 每個主題可獨立維護、校稿與審核

缺點：

- 載入與 schema 驗證流程會稍微複雜一些
- 需要建立統一的彙整入口

如果預期未來主題會持續增加，**方案 B 長期更好**。  
如果近期只是想先改善內容維護體驗，**方案 A 已足夠**。

## 第三階段：把主題定義改為資料驅動

若未來確實要支援新增主題，建議同步調整：

1. `ThemeId`
  - 不再手寫固定四值 union
  - 可改成由常數資料推導，或在執行期用型別守衛處理
2. `validThemeIds`
  - 改為由資料集生成，而不是手寫固定陣列
3. `card-data.schema.json`
  - 移除 `themes` 固定 4 筆的限制
  - Theme enum 改為較通用的字串格式驗證
4. 測試策略
  - 從「固定 4 主題 / 80 張卡」改成
  - 「每個主題都符合 base/intimate 規則」
  - 「資料整體符合契約與內容分布規則」

## 建議實施順序

### 短期（最建議）

1. 新增 `cardCatalog` 資料存取層
2. 將 `HomeView`、`GameView`、`EndView`、`gameStore`、`useDeck` 改由這層取資料

### 中期

1. 將 `cards.json` 改成依主題聚合的結構
2. 同步更新 schema、型別與測試

### 長期

1. 把主題 ID 與主題數量從固定寫死改成 data-driven
2. 降低新增主題時的全專案修改面

## 最終建議

你的判斷沒有錯：  
**把所有卡牌都放在單一 `cards[]` 陣列，對內容維護確實不夠友善。**

但若只重構 `cards.json`，卻不先處理資料存取層與主題寫死問題，後續仍會有高耦合成本。  
因此最合理的改善路線是：

1. **先抽資料存取層**
2. **再改 cards 組織方式**
3. **最後把主題定義改成資料驅動**

這樣能以最低風險逐步改善架構，同時保留現有功能穩定性。