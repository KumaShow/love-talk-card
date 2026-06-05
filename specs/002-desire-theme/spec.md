# Feature Specification: Desire Theme

**Feature Branch**: `002-desire-theme`  
**Created**: 2026-06-04  
**Status**: Draft  
**Input**: User description: "請為 love-talk-card 新增一個第 5 主題功能，暫名為「desire / 慾望與身體親密」。將較直接的碰觸偏好、性需求表達、理想親密頻率、邀請方式、同意與安全感等內容獨立成一個新主題，而不是直接混入既有四主題或只提升 intimate 尺度。"

## Clarifications

### Session 2026-06-05

- Q: Should the new `desire` theme follow the existing `15 base + 5 intimate` card split? → A: No. `desire` is an adult intimacy theme and does not use an internal intimate split.
- Q: Should existing four-theme intimate cards be rewritten? → A: Only review and adjust cards that appear to cross the new boundary; do not perform a full rewrite by default.
- Q: How should `desire` appear on the homepage? → A: Show it as the fifth theme, but require a clear adult-content notice before entry.
- Q: What is the formal theme ID/name for planning? → A: Use `desire`.
- Q: What should Success Criteria prioritize? → A: Technical extensibility first, then product clarity.
- Q: Should bilingual and externalizable copy be release-blocking at spec stage? → A: Require core UI and theme copy to support Traditional Chinese and English first; full card copy can be completed in planned content tasks.
- Q: Where should adult-content notice appear? → A: Use layered notice across homepage name/copy, theme preview, and before entry.
- Q: How should `desire` interact with intimate mode? → A: `desire` does not use intimate layering, preventing the expectation of a "double-spicy" mode.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Understand Desire as an Adult Intimacy Theme (Priority: P1)

一對成年伴侶打開首頁時，除了既有四個主題外，也能看到第 5 個主題「desire / 慾望與身體親密」。他們在選擇前就能理解這不是一般曖昧、認識彼此或情感信任主題，而是專門承接更直接的成人身體親密、性需求表達、碰觸偏好、親密頻率、邀請方式、同意與安全感對話。

**Why this priority**: 這是新增第 5 主題的核心價值。若使用者不能在進入前理解 desire 的成人親密定位，主題獨立就無法降低誤觸風險，也無法建立清楚預期。

**Independent Test**: 可透過首頁、主題預覽與進入前提示獨立測試：使用者不需要開始遊戲，就能從主題名稱、簡述與提示文字辨識 desire 是成人親密主題，並理解其內容尺度高於既有 intimate 模式。

**Acceptance Scenarios**:

1. **Given** 使用者位於首頁，**When** 使用者瀏覽主題列表，**Then** 系統應顯示第 5 個主題 desire，且其名稱與簡述明確傳達「成人身體親密」而非一般戀愛聊天。
2. **Given** 使用者尚未進入 desire 主題，**When** 使用者開啟 desire 主題預覽，**Then** 系統應以溫和但清楚的方式提示此主題涉及成人親密、身體界線、性需求與同意。
3. **Given** 使用者正在比較不同主題，**When** 使用者閱讀 desire 的介紹，**Then** 使用者應能理解 desire 與原本 intimate 模式不同，是獨立主題而不是既有四主題的加辣版本。
4. **Given** 使用者不想進行成人身體親密對話，**When** 使用者看到 desire 的首頁提示、預覽提示或進入前提示，**Then** 使用者應能在開始遊戲前做出不選擇此主題的決定。
5. **Given** 使用者選擇 desire 主題，**When** 使用者即將進入遊戲，**Then** 系統應先顯示成人內容、同意與可退出提示，而不是只依賴首頁名稱暗示。

---

### User Story 2 - Keep Existing Themes Clear and Compatible (Priority: P2)

使用者仍可照常選擇 attraction、self、interaction、trust 四個既有主題，並使用原本的 intimate 模式。新增 desire 後，既有四主題不應被迫升高尺度；原本 intimate 模式仍維持溫和私密定位，負責加深情感、脆弱性與親密感，但不承接更直接的成人身體親密與性需求對話。

**Why this priority**: desire 的目的不是讓整款遊戲變得更露骨，而是把較直接的成人親密內容從既有主題中分離，讓不同使用情境各有安全、清楚的入口。

**Independent Test**: 可透過主題說明與卡牌內容審查獨立測試：既有四主題與其 intimate 卡仍維持原定位；直接身體親密與性需求內容只出現在 desire 主題，且僅針對疑似越界的既有卡牌進行必要調整。

**Acceptance Scenarios**:

1. **Given** 使用者選擇既有四主題之一，**When** intimate 模式未啟用，**Then** 系統應維持該主題原本的基礎對話尺度。
2. **Given** 使用者在既有四主題啟用 intimate 模式，**When** 使用者抽到 intimate 卡，**Then** 內容應偏向溫和私密、情感靠近、脆弱分享或關係探索，而非直接性需求或身體技巧對話。
3. **Given** 內容涉及碰觸偏好、理想親密頻率、性需求表達、邀請方式、同意與安全感，**When** 系統判斷其主題歸屬，**Then** 該內容應優先歸入 desire，而不是混入 attraction、self、interaction 或 trust。
4. **Given** 使用者不選擇 desire，**When** 使用者遊玩既有四主題，**Then** 使用者不應遇到超出原本四主題定位的直接成人身體親密內容。
5. **Given** 既有四主題 intimate 卡牌疑似越過 desire 邊界，**When** 內容審查發現該卡主要任務已變成成人身體親密協商，**Then** 該卡應被移至 desire、改寫回原主題尺度，或暫緩收錄。

---

### User Story 3 - Navigate Theme Boundaries with Confidence (Priority: P3)

內容編輯者或產品維護者在新增卡牌時，可以依據 desire 與其他主題的邊界判斷題目歸屬。若題目重點是吸引力與心動，它屬於 attraction；若重點是自我理解，它屬於 self；若重點是互動習慣，它屬於 interaction；若重點是安全、承諾與信任修復，它屬於 trust；若重點是成人身體親密、性需求、碰觸偏好與同意協商，它屬於 desire。

**Why this priority**: 新主題若沒有清楚邊界，後續卡牌資料會逐漸混亂，導致使用者預期不穩、內容審查困難，並降低資料結構可維護性。

**Independent Test**: 可透過內容歸類清單獨立測試：給定一批候選題目，維護者能一致判斷哪些應進入 desire、哪些應留在既有主題。

**Acceptance Scenarios**:

1. **Given** 一張卡牌主要詢問「我什麼時候最讓你心動」，**When** 編輯者判斷主題，**Then** 該卡牌應歸入 attraction，而不是 desire。
2. **Given** 一張卡牌主要詢問「我如何理解自己的慾望、界線或害羞」，**When** 編輯者判斷主題，**Then** 若焦點是自我覺察而非伴侶間身體協商，該卡牌應歸入 self。
3. **Given** 一張卡牌主要詢問「我們如何開口邀請身體親密才讓彼此安心」，**When** 編輯者判斷主題，**Then** 該卡牌應歸入 desire。
4. **Given** 一張卡牌主要詢問「受傷後如何重新建立安全感」，**When** 編輯者判斷主題，**Then** 該卡牌應歸入 trust，除非其主要內容是成人身體親密中的同意與界線協商。

---

### User Story 4 - Preserve Safe, Consent-Centered Adult Content (Priority: P4)

成年伴侶進入 desire 後，看到的問題可以更直接地討論身體親密，但語氣仍應尊重、可拒絕、可暫停，並以雙方同意與安全感為核心。內容不應變成露骨技巧指令、羞辱、壓迫、測驗式評分，或任何讓使用者覺得必須揭露、配合或表現的要求。

**Why this priority**: desire 的價值在於讓成人親密對話更可被好好談，而不是追求刺激或露骨。安全邊界會直接影響使用者信任與產品調性。

**Independent Test**: 可透過 desire 候選卡牌審查獨立測試：每張卡牌都能通過成人、同意、安全、尊重、非露骨指令與非強迫揭露檢查。

**Acceptance Scenarios**:

1. **Given** desire 卡牌詢問碰觸偏好，**When** 使用者閱讀題目，**Then** 題目應鼓勵描述喜歡、猶豫、界線或想慢慢探索的方向，而非要求立即行動。
2. **Given** desire 卡牌詢問親密頻率，**When** 使用者閱讀題目，**Then** 題目應允許差異、協商與尊重，而非暗示某一方有義務滿足另一方。
3. **Given** desire 卡牌涉及邀請方式，**When** 使用者閱讀題目，**Then** 題目應包含可拒絕、可暫停、可改天再談的語氣。
4. **Given** 候選內容涉及未成年人、非自願、脅迫、酒醉失去判斷能力、羞辱貶低、暴力傷害、露骨技巧教學或醫療性建議，**When** 進行內容審查，**Then** 該內容不得被納入 desire 主題。

---

### Edge Cases

- 如果使用者已啟用 intimate 模式後再選擇 desire，系統應如何避免使用者誤解為「雙重加辣」？使用者預期應維持清楚：desire 本身即是成人親密主題，且不使用 intimate 分層；既有 intimate 模式不應進一步提高 desire 的內容尺度。
- 如果某張卡牌同時包含情感信任與身體親密，系統應如何歸類？應以題目的主要對話任務判斷；若重點是身體親密中的同意、界線或需求協商，歸入 desire。
- 如果使用者只想要浪漫但不想談性，系統應如何協助避開 desire？首頁名稱與簡述、主題預覽、進入前提示應以不同層級提供足夠清楚的成人親密提示。
- 如果 desire 的文案被翻譯成英文或其他語言，系統應如何維持尺度一致？翻譯應保留「成人、同意、安全、可拒絕」的語氣，不得因語言轉換而變得更露骨或更含糊。
- 如果未來新增更多主題，desire 的邊界應如何避免漂移？任何新主題都應以主要對話任務判斷，不應把 desire 擴張成所有高親密內容的總集合。

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST define `desire` as the fifth relationship theme, positioned around adult physical intimacy, desire, consent, safety, invitation, body boundaries, touch preferences, and intimacy frequency.
- **FR-002**: System MUST preserve the existing four themes: `attraction`, `self`, `interaction`, and `trust`, without requiring their baseline or intimate content to become more sexually direct.
- **FR-003**: System MUST distinguish `desire` from intimate mode: intimate mode remains a gentler private layer within the existing four themes, while `desire` is a standalone adult intimacy theme and does not use its own base/intimate split.
- **FR-004**: System MUST communicate before entry that `desire` contains adult intimacy topics, using clear, respectful, non-alarmist language across homepage copy, theme preview, and an entry notice.
- **FR-005**: System MUST allow `desire` content to discuss touch preferences, sexual needs, desired intimacy frequency, ways to invite intimacy, consent, emotional safety, body boundaries, pacing, refusal, and aftercare-style reassurance.
- **FR-006**: System MUST NOT allow `desire` content involving minors, non-consent, coercion, intoxication that removes consent capacity, threats, humiliation, violent harm, explicit technique instruction, medical diagnosis, or content that pressures users to disclose or perform.
- **FR-007**: System MUST keep `desire` content couple-oriented, conversational, consent-centered, and answerable within the card-game format.
- **FR-008**: System MUST keep core user-facing `desire` UI labels, theme descriptions, notices, and entry copy externalizable and available in Traditional Chinese and English before release; full card and closing-message copy MUST remain externalizable and be completed through planned content tasks.
- **FR-009**: System MUST maintain a consistent theme data model so `desire` can be added without creating a separate one-off structure for adult content.
- **FR-010**: System MUST define content classification boundaries so maintainers can decide whether a card belongs to `desire`, `attraction`, `self`, `interaction`, or `trust`.
- **FR-011**: System MUST ensure users who do not select `desire` can continue playing the existing themes without unexpectedly encountering direct adult physical intimacy prompts.
- **FR-012**: System SHOULD treat `desire` as optional and opt-in through normal theme selection, not as a hidden escalation of existing mode settings.
- **FR-013**: System MUST use `desire` as the formal theme identifier for planning, data, i18n keys, tests, and documentation.
- **FR-014**: System MUST NOT require `desire` cards to follow the existing `15 base + 5 intimate` distribution; accepted desire cards belong to the standalone desire theme without internal intimate categorization.

### Content Boundary Requirements

- **CB-001**: `attraction` SHOULD focus on spark, charm, flirting, being drawn to each other, and romantic attention; it SHOULD NOT become the primary home for explicit body intimacy negotiation.
- **CB-002**: `self` SHOULD focus on self-awareness, personal needs, emotional patterns, desire awareness, and boundaries from an introspective angle; it SHOULD NOT replace `desire` when the prompt asks partners to negotiate body intimacy directly.
- **CB-003**: `interaction` SHOULD focus on daily habits, communication style, playfulness, conflict patterns, and shared rhythms; it SHOULD NOT host direct sexual needs or touch-preference prompts unless the main task is non-sexual interaction.
- **CB-004**: `trust` SHOULD focus on reliability, emotional safety, vulnerability, repair, and commitment; it MAY overlap with consent and safety, but direct adult body-intimacy consent conversations SHOULD belong to `desire`.
- **CB-005**: Existing intimate cards SHOULD remain warmer, more private variants of their parent themes; they SHOULD NOT become a substitute for `desire`.
- **CB-006**: Existing intimate cards SHOULD be reviewed only when they appear to cross into direct adult body-intimacy negotiation; broad rewrites of the four existing intimate sets are out of scope unless a concrete boundary issue is found.

### Key Entities *(include if feature involves data)*

- **Theme**: A relationship topic category. With this feature, the available themes become `attraction`, `self`, `interaction`, `trust`, and `desire`. Each theme has a name, description, preview copy, visual identity, and cards.
- **Desire Theme**: A fifth theme dedicated to adult physical intimacy and consent-centered desire conversations. It is opt-in, clearly labeled, uses `desire` as its formal identifier, does not contain a separate intimate layer, and is bounded by safety rules.
- **Card**: A conversation prompt belonging to exactly one theme. A desire card uses the same maintainable card structure as other themes while following stricter adult-content boundary rules, but it is not classified as base or intimate within the desire theme.
- **Intimate Mode**: A mode that adds gentler private cards to the existing four themes. It remains compatible with theme selection but is not redefined as a direct adult sexuality mode and does not further escalate `desire`.
- **Adult Intimacy Notice**: User-facing copy shown across homepage, theme preview, and before entering desire to set expectations about adult content, consent, and optional participation.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The theme model, identifiers, i18n keys, and tests can support `desire` as a fifth theme without a one-off adult-content pipeline or a required `15 base + 5 intimate` split.
- **SC-002**: Content reviewers can classify at least 90% of candidate prompts into `desire`, `attraction`, `self`, `interaction`, or `trust` using the documented boundaries without needing additional implementation context.
- **SC-003**: Existing four-theme gameplay remains understandable and non-surprising for users who do not select `desire`.
- **SC-004**: 100% of core `desire` user-facing UI copy, including labels, theme description, preview notice, and entry notice, is externalizable and available in at least Traditional Chinese and English before release.
- **SC-005**: 100% of accepted `desire` prompts pass consent, safety, adult-only, non-coercion, non-humiliation, and non-explicit-instruction content review.
- **SC-006**: First-time users can identify before entering gameplay that `desire` is an adult intimacy theme, not a general romance or emotional-trust theme.
- **SC-007**: Users can opt into or avoid `desire` from the homepage, theme preview, and entry notice without changing their ability to use existing themes and intimate mode.
- **SC-008**: After adding `desire`, product documentation and theme previews make the difference between `desire` and intimate mode clear enough that maintainers do not need to raise the intimate mode scale to support direct adult intimacy topics.
- **SC-009**: Enabling intimate mode before selecting `desire` does not cause desire content to become more explicit, expose additional intimate-only cards, or communicate a "double-spicy" mode.

## Assumptions

- `desire` is intended for consenting adult partners only.
- The product remains a conversation card game, not sexual instruction, therapy, diagnosis, medical advice, or crisis support.
- The feature should prioritize expectation-setting, consent, and emotional safety over shock value or explicitness.
- Existing four themes and intimate mode are valuable and should be preserved rather than retroactively rewritten into a higher-intensity adult mode; only suspected boundary-crossing intimate cards require targeted review.
- Traditional Chinese is the source language for product tone, with English maintained as a required supported language for core UI and theme copy in this feature.
- `desire` is the formal theme identifier for this feature.
- `desire` does not use a base/intimate card split; its card count and content batching should be planned without assuming the existing `15 base + 5 intimate` ratio.
