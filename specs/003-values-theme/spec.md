# Feature Specification: Values & Future Theme

**Feature Branch**: `003-values-theme`

**Created**: 2026-07-08

**Status**: Draft

**Input**: User description: "為 love-talk-card 規劃第 6 主題「values / 價值觀與未來 / Values & Future」。本次只做 P1：新增 values 主題並處理初版 25 張所需的最小資料規則放寬。讓伴侶討論價值排序、金錢觀、家庭觀、生活方向、承諾觀、社交邊界與未來想像。情緒記憶點是『在生活選擇裡，看見彼此的靈魂共振』。不做 Mix 牌堆、不移除前四主題 intimate 模式、不重新命名既有卡牌 id。"

## Clarifications

### Session 2026-07-08

- Q: 為什麼要獨立成 values 主題，而不是把價值觀題目分散進 self / interaction / trust？ → A: 這三個既有主題的對話任務都不是「協商共同的生活選擇與未來承諾」；分散會讓題目失去焦點、削弱情緒記憶點，也讓使用者無法在單一入口進行完整的價值對齊。values 需要獨立成主題。
- Q: values 是否沿用「15 base + 5 intimate」的分層？ → A: 否。values 不使用 intimate 分層，也不使用 `base` / `intimate` 後綴；全部為單一牌池。
- Q: values 卡牌 id 格式為何？ → A: 採 `val-001` 至 `val-025`，比照 desire 的 `des-###` 模式，不帶 base/intimate 後綴。
- Q: 題目深度如何表示？ → A: 使用 level 1 / level 2 / level 3 三級深度，由淺入深。
- Q: 觸及底線或不可妥協議題時的語氣？ → A: 以溫和、非審判、非測驗、可保留、可再談的語氣呈現；不得把差異包裝成對錯評分或相容性測驗。
- Q: 本次的資料規則放寬邊界為何？ → A: 只放寬 values 初版 25 張所需的「最小」規則（允許 `val-###` id、允許省略 isIntimate、允許主題卡數不等於 20），不動 Mix 牌堆、不移除前四主題 intimate 模式、不重新命名既有卡牌 id。
- Q: values 的多語系文本要求？ → A: 沿用既有主題模式——真實 `zh` / `en`，`th` 可比照現況、`ja` 以英文鏡射作為 placeholder；核心 UI 與主題文案於發佈前須具備繁中與英文。
- Q: values 25 張要放寬「每主題 20 張 / 全站 100 張」到什麼程度？ → A: 改為以「各主題自身宣告的張數」為驗證基準，不再硬編 20/100；未來新主題自動適用（對齊 DR-003 / SC-001）。
- Q: 25 張與六面向 4/4/4/4/4/5 分配的定案程度？ → A: 總數 25 鎖定、測試硬檢；六面向分配為規劃目標，容許撰稿時 ±1 微調，測試不硬檢逐面向數量。
- Q: values「無 intimate 分層」在卡牌資料上如何呈現？ → A: 完全省略 `isIntimate` 欄位（比照 desire），深度僅以 level 表達。
- Q: level 1/2/3 邊界如何定義以免退化成 intimate 敏感度分層？ → A: 以「情緒暴露程度／承諾重量」由淺入深，與題材敏感度脫鉤；level 3 不等於最敏感題材，任一面向皆可出現在任一 level。
- Q: 「在生活選擇裡看見彼此靈魂共振」記憶點的顯示範圍？ → A: 出現在首頁描述與主題預覽文案；卡面題目維持邀請語氣，不逐張複述此句。
- Q: 是否確認排除 Mix 牌堆、移除前四主題 intimate、重命名既有 id，並列為未來功能？ → A: 確認三者本階段皆不做，並於 spec 記為 future backlog（對齊 DR-004）。

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 把 values 理解為「價值觀與未來」主題 (Priority: P1)

一對伴侶打開首頁時，除了既有五個主題外，也能看到第 6 個主題「values / 價值觀與未來 / Values & Future」。他們在選擇前就能理解：這不是談吸引力、認識自我、日常互動、信任修復或身體親密，而是專門承接「彼此的價值排序、金錢與安全感、家庭與親密邊界、生活方向、承諾與未來、社交與邊界」的對話，目標是在一個個生活選擇裡，看見彼此的靈魂是否共振。

**Why this priority**: 這是新增第 6 主題的核心價值。價值觀對話是伴侶關係走向長期承諾前最關鍵、也最容易被日常迴避的一塊；若沒有一個清楚命名的入口，這類題目只會被稀釋進「認識自我 / 互動 / 信任」，失去焦點與情緒記憶點。使用者若在進入前無法辨識 values 的定位，主題獨立就失去意義。

**Independent Test**: 可透過首頁、主題預覽與卡面獨立測試：使用者不需開始遊戲，就能從主題名稱、簡述與預覽文字辨識 values 是關於「價值選擇與未來想像」的主題，並理解它與其他五個主題的差異。

**Acceptance Scenarios**:

1. **Given** 使用者位於首頁，**When** 使用者瀏覽主題列表，**Then** 系統應顯示第 6 個主題 values，且其名稱與簡述明確傳達「價值觀與未來」而非一般戀愛聊天或身體親密。
2. **Given** 使用者尚未進入 values 主題，**When** 使用者開啟 values 主題預覽，**Then** 系統應以溫和的語氣說明此主題涵蓋價值排序、金錢觀、家庭觀、生活方向、承諾觀與社交邊界，並傳達「在生活選擇裡看見彼此靈魂共振」的記憶點。
3. **Given** 使用者正在比較不同主題，**When** 使用者閱讀 values 的介紹，**Then** 使用者應能理解 values 是獨立的第 6 主題，而不是 self、interaction 或 trust 的延伸或加強版。
4. **Given** 使用者想進行一次「認真談未來」的對話，**When** 使用者在首頁尋找合適主題，**Then** 使用者能明確判斷 values 是最適合此情境的入口。

---

### User Story 2 - 在首頁、預覽與卡面理解這是價值選擇與未來想像的主題 (Priority: P2)

使用者在首頁看到主題名稱與簡述、在主題預覽讀到面向說明、在遊戲中翻開卡面看到題目時，三個層次都應一致傳達 values 是「價值選擇與未來想像」的主題。卡面題目本身即應讓使用者感覺是在被邀請說出自己重視什麼、如何排序、想像什麼樣的共同未來，而非被考試或被要求證明相容。

**Why this priority**: 主題價值要能被感知，必須在使用者實際會看到的三個接觸點（首頁、預覽、卡面）一致落地。若只有名稱到位、卡面卻像心理測驗或財務盤問，使用者對主題的理解與信任會斷裂。

**Independent Test**: 可透過首頁文案、主題預覽文案與卡牌題目審查獨立測試：三個層次的措辭一致指向「價值與未來」，且卡面題目讀起來是邀請分享與想像，而非審判或評分。

**Acceptance Scenarios**:

1. **Given** 使用者在首頁，**When** 使用者看到 values 的名稱與簡述，**Then** 文案應以「價值觀與未來」為核心，並與其他主題明顯區隔。
2. **Given** 使用者開啟 values 預覽，**When** 使用者閱讀主題說明，**Then** 說明應點出六個內容面向（價值排序、金錢與安全感、家庭與親密邊界、生活方向、承諾與未來、社交與邊界）的精神，而非逐條列出題目。
3. **Given** 使用者在 values 主題中翻牌，**When** 使用者閱讀任一卡面題目，**Then** 題目應讀起來像邀請分享價值與想像未來，而非要求填寫資料、證明立場或接受相容性評分。
4. **Given** 使用者切換次要語言，**When** 使用者閱讀 values 的核心 UI 與主題文案，**Then** 繁中與英文皆應可用且語氣一致。

---

### User Story 3 - 依主題邊界一致判斷題目歸屬 (Priority: P3)

內容編輯者或產品維護者在新增卡牌時，可依 values 與 self / interaction / trust / desire 的邊界，一致判斷題目歸屬。若題目重點是「自我覺察與個人模式」屬 self；「日常互動與相處節奏」屬 interaction；「安全感、承諾與信任修復」屬 trust；「成人身體親密與同意協商」屬 desire；「彼此的價值排序、生活選擇與共同未來的對齊」則屬 values。

**Why this priority**: values 與 self / trust 天然相鄰（都可能談到內在與承諾），若沒有清楚邊界，卡牌資料會逐漸漂移，導致使用者預期不穩、內容審查困難、資料可維護性下降。

**Independent Test**: 可透過內容歸類清單獨立測試：給定一批候選題目，維護者能一致判斷哪些應進入 values、哪些應留在 self / interaction / trust / desire。

**Acceptance Scenarios**:

1. **Given** 一張卡牌主要詢問「我如何理解自己的情緒模式或成長」，**When** 編輯者判斷主題，**Then** 若焦點是內省而非共同價值取捨，應歸入 self 而非 values。
2. **Given** 一張卡牌主要詢問「我們日常如何分工、如何相處」，**When** 編輯者判斷主題，**Then** 若焦點是互動習慣而非價值排序，應歸入 interaction 而非 values。
3. **Given** 一張卡牌主要詢問「受傷後如何重建信任」，**When** 編輯者判斷主題，**Then** 若焦點是安全與修復而非未來生活方向的取捨，應歸入 trust 而非 values。
4. **Given** 一張卡牌主要詢問「我們如何排序金錢、家庭、事業與自由，並想像共同的未來」，**When** 編輯者判斷主題，**Then** 該卡牌應歸入 values。
5. **Given** 一張卡牌主要詢問成人身體親密的同意與界線，**When** 編輯者判斷主題，**Then** 該卡牌應歸入 desire 而非 values。

---

### User Story 4 - 以溫和、非審判的語氣觸及底線與不可妥協議題 (Priority: P4)

伴侶在 values 主題中可能觸及底線議題（例如金錢安全感、是否要小孩、與原生家庭的距離、社交邊界、不可妥協的原則）。這些題目應以溫和、非審判、非測驗的語氣呈現，允許雙方有差異、可以保留、可以改天再談，並把差異視為需要理解的資訊，而非需要分出對錯或相容分數的考試。

**Why this priority**: 價值差異是伴侶關係最敏感的地帶；若題目語氣像審判或相容性測驗，會讓使用者防衛、迴避或受傷，直接破壞主題調性與使用者信任。安全的語氣是 values 能被好好談的前提。

**Independent Test**: 可透過 values 候選卡牌審查獨立測試：每張卡牌都能通過「非審判、非測驗、允許差異、可保留、可再談」檢查。

**Acceptance Scenarios**:

1. **Given** values 卡牌觸及金錢或安全感，**When** 使用者閱讀題目，**Then** 題目應邀請描述自己的重視與擔憂，而非評斷對方花錢或存錢的對錯。
2. **Given** values 卡牌觸及家庭或是否要小孩，**When** 使用者閱讀題目，**Then** 題目應允許不同想像與尚未確定的答案，而非預設某一種家庭型態才正確。
3. **Given** values 卡牌觸及不可妥協的原則或底線，**When** 使用者閱讀題目，**Then** 題目應以理解彼此界線為目的，並允許「這題我現在還不想回答」的空間。
4. **Given** 候選內容把價值差異包裝成相容性評分、對錯審判、逼迫表態或說服對方改變，**When** 進行內容審查，**Then** 該內容不得納入 values 主題。

---

### Edge Cases

- 若使用者的價值觀在某題明顯衝突，主題應如何避免變成吵架或評分？題目與主題調性應把差異定位為「需要被理解的資訊」，允許保留與再談，不提供對錯或相容分數。
- 若某張卡牌同時涉及自我覺察與共同價值，應如何歸類？以題目的主要對話任務判斷；若重點是兩人共同取捨與未來對齊，歸入 values；若重點是個人內省，歸入 self。
- 若使用者只想輕鬆聊、還沒準備好談未來，應如何協助？首頁簡述與預覽應清楚傳達 values 偏向認真對話，讓使用者能自行選擇時機。
- 若 values 文案被翻譯成英文或其他語言，應如何維持語氣一致？翻譯應保留「溫和、非審判、允許差異」的語氣，不因語言轉換而變得說教或審問。
- 若未來新增更多主題，values 的邊界應如何避免漂移？任何新主題都以主要對話任務判斷，不應把 values 擴張成所有「認真話題」的總集合。
- 若 values 為 25 張而其他主題為 20 張，遊玩與資料檢查應如何不被固定張數假設卡住？資料與測試應以「主題自身宣告的卡數」為準，而非硬編碼每主題 20 張或全站 100 張。

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST define `values` as the sixth relationship theme, positioned around value priorities, money and security, family and intimacy boundaries, life direction, commitment and future, and social boundaries, with the emotional anchor of "seeing whether two souls resonate through everyday life choices."
- **FR-002**: System MUST preserve the existing five themes (`attraction`, `self`, `interaction`, `trust`, `desire`) unchanged, including keeping the intimate mode of the first four themes and NOT renaming any existing card ids.
- **FR-003**: System MUST make the value of `values` recognizable before entry across homepage name/description and theme preview, so users can tell `values` is about value choices and imagining a shared future rather than romance chat, self-discovery, daily interaction, trust repair, or physical intimacy. The emotional anchor ("seeing whether two souls resonate through everyday life choices") MUST surface in the homepage description and theme preview copy; individual card prompts keep an inviting tone but are NOT required to restate the anchor phrase literally.
- **FR-004**: System MUST ship the initial `values` set as exactly 25 cards. The 25 cards SHOULD cover six content facets using this distribution as a planning target — value ranking (4), money & security (4), family & intimacy boundaries (4), life direction (4), commitment & future (4), and social & boundaries (5) — but per-facet counts MAY be adjusted by a small margin (±1) during authoring as long as the total stays exactly 25; only the total of 25 is a hard, testable invariant.
- **FR-005**: System MUST NOT use intimate layering for `values`, and MUST NOT use `base` / `intimate` id suffixes; `values` is a single card pool with no intimate split (mirroring how `desire` avoids intimate layering).
- **FR-006**: System MUST identify `values` cards with the id pattern `val-001` through `val-025`, without base/intimate suffixes.
- **FR-007**: System MUST express card depth using three levels — level 1, level 2, level 3 — progressing from lighter to deeper, where depth is defined by emotional exposure and the weight of commitment a prompt asks for, decoupled from topic sensitivity. Level 3 MUST NOT become a de facto "most sensitive topics" tier (it MUST NOT recreate an intimate-style sensitivity layer); any content facet MAY appear at any level.
- **FR-008**: System MUST present bottom-line or non-negotiable topics in `values` with a gentle, non-judgmental, non-test tone that allows difference, allows deferring ("I'm not ready to answer this yet"), and treats differences as information to understand rather than something to score or prove compatibility on.
- **FR-009**: System MUST keep `values` card prompts couple-oriented, conversational, and answerable within the card-game format, inviting sharing and imagining rather than requesting data, demanding a stance, or persuading the partner to change.
- **FR-010**: System MUST define content classification boundaries so maintainers can decide whether a card belongs to `values`, `self`, `interaction`, `trust`, or `desire`.
- **FR-011**: System MUST keep core user-facing `values` UI labels, theme description, and preview copy externalizable and available in Traditional Chinese and English before release; full card copy MUST remain externalizable and be completed through planned content tasks. `values` card text MUST satisfy the existing four-locale card schema (`zh`/`en`/`th`/`ja`) by following the established pattern — real `zh`/`en`, with `th`/`ja` allowed to mirror the current placeholder approach — so that `zh`+`en` remain the authoritative locales and no new missing-locale fallback logic is introduced.
- **FR-012**: System MUST use `values` as the formal theme identifier for planning, data, i18n keys, tests, and documentation.

### Data Rule Relaxation Requirements

- **DR-001**: The shared card data rules MUST allow a `val-###` id pattern in addition to the existing `des-###` and `{prefix}-###-{base|intimate}` patterns, so `values` cards validate without a base/intimate suffix.
- **DR-002**: The shared card data rules MUST allow `values` cards to omit the intimate flag (as `desire` already does), rather than requiring every non-desire theme to carry it.
- **DR-003**: Data and test expectations MUST NOT assume a fixed 20 cards per theme or a fixed 100 cards site-wide; per-theme card counts MUST be validated against each theme's own declared size so a 25-card `values` theme is valid.
- **DR-004**: This relaxation MUST be the minimum needed for the initial `values` 25-card set only; it MUST NOT introduce a Mix deck, MUST NOT remove intimate mode from the first four themes, and MUST NOT rename existing card ids.
- **DR-005**: Existing per-theme invariants MUST remain intact where they still apply: the first four themes keep exactly 5 intimate cards each, and `desire` keeps its existing single-pool structure.

### Content Boundary Requirements

- **CB-001**: `self` SHOULD focus on self-awareness, personal emotional patterns, needs, and growth from an introspective angle; it SHOULD NOT become the home for negotiating shared value trade-offs and a common future.
- **CB-002**: `interaction` SHOULD focus on daily habits, communication style, playfulness, division of labour, and shared rhythms; it SHOULD NOT host value-ranking or future-direction prompts unless the main task is everyday interaction.
- **CB-003**: `trust` SHOULD focus on reliability, emotional safety, vulnerability, and repair; it MAY overlap with commitment, but choosing and aligning on future life direction and value priorities SHOULD belong to `values`.
- **CB-004**: `desire` SHOULD remain the home for adult physical intimacy and consent negotiation; `values` SHOULD NOT absorb physical-intimacy prompts.
- **CB-005**: `values` SHOULD focus on value priorities, money and security, family and intimacy boundaries, life direction, commitment and future, and social boundaries; it SHOULD NOT become a catch-all for every "serious" topic, and SHOULD defer to the more specific theme when a prompt's main task clearly fits `self`, `interaction`, `trust`, or `desire`.

### Key Entities *(include if feature involves data)*

- **Theme**: A relationship topic category. With this feature the available themes become `attraction`, `self`, `interaction`, `trust`, `desire`, and `values`. Each theme has a name, description, preview copy, visual identity, and cards.
- **Values Theme**: A sixth theme dedicated to value priorities and imagining a shared future. It is opt-in via normal theme selection, uses `values` as its formal identifier, contains no intimate layer, ships an initial 25-card single pool, and is bounded by a non-judgmental tone.
- **Card**: A conversation prompt belonging to exactly one theme. A `values` card uses the same maintainable card structure as other themes, uses a `val-###` id with no base/intimate suffix, carries no intimate flag, and declares a depth level of 1, 2, or 3.
- **Content Facet**: One of six thematic groupings that shape the 25-card set — value ranking, money & security, family & intimacy boundaries, life direction, commitment & future, and social & boundaries — used to plan coverage, not surfaced to end users as literal categories.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The theme model, identifiers, i18n keys, and tests can support `values` as a sixth theme without a one-off structure, and without assuming a fixed 20-cards-per-theme or 100-cards-total invariant.
- **SC-002**: The initial `values` set contains exactly 25 cards (the only hard-checked count), each with a depth level of 1, 2, or 3. The six content facets — value ranking, money & security, family & intimacy boundaries, life direction, commitment & future, and social & boundaries — are covered using a 4 / 4 / 4 / 4 / 4 / 5 target that MAY vary by ±1 per facet during authoring; the test suite hard-checks only the total of 25, not each per-facet count.
- **SC-003**: All 25 `values` cards can be drawn and played end-to-end just like other themes, and neither data validation nor the test suite fails because a theme has more than 20 cards.
- **SC-004**: First-time users can identify, before entering gameplay, that `values` is about value choices and imagining a shared future — distinct from `self`, `interaction`, `trust`, and `desire`.
- **SC-005**: Content reviewers can classify at least 90% of candidate prompts into `values`, `self`, `interaction`, `trust`, or `desire` using the documented boundaries without needing additional implementation context.
- **SC-006**: 100% of accepted `values` prompts pass a non-judgmental, non-test, allows-difference, allows-deferral tone review, with no prompt framing value differences as a compatibility score or a right/wrong judgment.
- **SC-007**: 100% of core `values` user-facing UI copy (label, theme description, preview) is externalizable and available in at least Traditional Chinese and English before release.
- **SC-008**: Existing five-theme gameplay is unchanged: the first four themes keep intimate mode and exactly 5 intimate cards each, `desire` keeps its structure, and no existing card id is renamed.

## Assumptions

- `values` is intended for couples willing to have a more intentional, forward-looking conversation; the product remains a conversation card game, not counseling, therapy, financial advice, or a compatibility test.
- Traditional Chinese is the source language for product tone, with English maintained as a required supported language for core UI and theme copy in this feature; `th`/`ja` may follow the existing placeholder pattern.
- The initial release scope is P1: add the `values` theme plus the minimum data-rule relaxation needed for its 25-card set. A Mix deck, removing intimate mode from the first four themes, and renaming existing card ids are explicitly out of scope.
- Project documentation that currently states a fixed "100 cards = 5 themes × 20" invariant (including CLAUDE.md and the constitution) will need to be updated to reflect a sixth theme with 25 cards; that documentation update is a downstream task, not a change to this spec's intent.
- `values` uses `values` as its formal theme identifier and `val-###` as its card id pattern, with no base/intimate split.
