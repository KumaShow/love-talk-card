# Feature Specification: Love Talk Card Game

**Feature Branch**: `001-love-talk-card-game`  
**Created**: 2025-07-18  
**Status**: Draft  
**Input**: User description: "A web-based card game designed for couples and romantic partners. Players choose from four relationship themes, draw and flip cards with conversation prompts, toggle an intimate mode for private questions, switch between multiple display languages, and enjoy an immersive mobile-first experience with offline support."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Choose a Theme and Draw Cards (Priority: P1)

A couple opens the game on their phone and sees four face-down theme decks on the homepage — Attraction & Sparks, Self & Exploration, Interaction & Understanding, and Trust & Growth. Each deck uses its theme-specific card-back color, creating a stronger sense of ritual before the game begins. They tap one deck, and a preview overlay slides up with a sample card, a short theme description, and a clear "Start Conversation" CTA. After confirming, they enter the game and see the remaining deck presented as a fan of up to five face-down cards. Only the center card is interactive. They tap it, an enlarged overlay appears from the center of the screen, the card performs a 3D flip, and the prompt is revealed for them to read aloud and discuss together. When they continue, the card exits to the right, the fan closes in, and the next card automatically moves into the center. When they finish the deck, the game shows a warm closing message and guides them back to the homepage.

**Why this priority**: This is the core gameplay loop. Without the ability to select a theme, preview it, draw cards, and see prompts, no other feature has value. This alone delivers a complete, usable product.

**Independent Test**: Can be fully tested by selecting any theme deck, opening the preview overlay, entering the game, drawing all cards from the fan layout, and verifying prompts appear without duplication until the end-state message is shown.

**Acceptance Scenarios**:

1. **Given** the user is on the homepage, **When** they view the theme selection area, **Then** they see four face-down theme decks labeled in Traditional Chinese and styled with each theme's card-back color.
2. **Given** the user taps a theme deck, **When** the theme preview opens, **Then** a slide-up preview overlay appears with a darkened backdrop, the theme description, and a "Start Conversation" CTA.
3. **Given** the preview overlay is open, **When** the user taps the "Start Conversation" CTA, **Then** they are taken to the card-drawing screen showing a fan of up to five face-down cards for that theme.
4. **Given** the user is on the card-drawing screen, **When** they tap the center card in the fan, **Then** an enlarged overlay appears and the selected card flips with a smooth 3D animation revealing the conversation prompt.
5. **Given** the user has finished reading the revealed prompt, **When** they tap the "Next Card" action or the backdrop, **Then** the revealed card exits to the right and the next card automatically fills the center position in the fan.
6. **Given** all 15 cards in the theme have been drawn, **When** the user completes the final card, **Then** a warm closing message is displayed together with a CTA that guides the user back to the homepage.

---

### User Story 2 - Toggle Intimate Mode (Priority: P2)

Before selecting a theme, one partner notices the "Intimate / Tipsy Mode" toggle on the homepage. They switch it on. Now, when they enter a theme, 5 additional private cards are shuffled into the deck (bringing it to 20 cards). When a private card is flipped, it shows a subtle visual indicator (such as a decorative heart watermark) so both players know it's a special intimate question.

**Why this priority**: Intimate mode adds depth and replayability by introducing a second layer of content. It is the key differentiator that elevates the game from casual conversation starter to a meaningful couples' experience.

**Independent Test**: Can be fully tested by enabling the toggle, entering a theme, drawing all 20 cards, and confirming the 5 intimate cards appear with their visual indicator.

**Acceptance Scenarios**:

1. **Given** the user is on the homepage, **When** they enable the "Intimate / Tipsy Mode" toggle, **Then** the toggle state is visually confirmed as active.
2. **Given** intimate mode is enabled, **When** the user enters any theme, **Then** the deck contains 20 cards (15 base + 5 intimate).
3. **Given** intimate mode is enabled and a private card is drawn, **When** the card flips over in the enlarged reading overlay, **Then** a subtle visual indicator (e.g., decorative heart watermark) is visible on the revealed card face within that overlay.
4. **Given** intimate mode is disabled, **When** the user enters a theme, **Then** the deck contains only 15 base cards and no intimate cards appear.

---

### User Story 3 - Switch Display Language (Priority: P3)

A bilingual couple wants to play together but one partner is more comfortable reading in Thai. On the card-drawing screen, they tap the language-switch button. The secondary text on the card (below the primary Traditional Chinese) changes from English to Thai. They can switch back at any time.

**Why this priority**: Multi-language support broadens the audience significantly and is essential for cross-cultural couples, but the game is fully functional in its default bilingual (Chinese + English) layout.

**Independent Test**: Can be fully tested by drawing a card, switching the language toggle, and verifying the secondary text changes to the selected language while the primary Chinese text remains unchanged.

**Acceptance Scenarios**:

1. **Given** the user is on the card-drawing screen with default language settings, **When** they view a card, **Then** the card displays Traditional Chinese as primary text and English as secondary text.
2. **Given** a card is displayed, **When** the user taps the language-switch button and selects Thai, **Then** the secondary text area switches from English to Thai.
3. **Given** the user has switched to Thai, **When** they draw a new card, **Then** the new card also displays Thai as the secondary language.
4. **Given** the user has switched to a third language, **When** they tap the language-switch button again and select English, **Then** the secondary text reverts to English.

---

### User Story 4 - Immersive Theme Ambiance (Priority: P4)

A couple playing late at night selects the "Trust & Growth" theme. The background smoothly transitions to a deep warm tone. The preview overlay, CTA button, focus ring, and supporting hint text also inherit the active theme's primary and secondary colors, so the atmosphere feels cohesive from homepage selection to in-game reading. When they go back and switch to "Attraction & Sparks," the background and supporting UI accents transition together to a soft pink. The ambiance changes give each theme a distinct emotional atmosphere.

**Why this priority**: Visual immersion enhances the emotional experience and differentiates themes, but the game is fully playable without it.

**Independent Test**: Can be fully tested by navigating between different themes and verifying that the background color/ambiance transitions smoothly to match each theme's identity.

**Acceptance Scenarios**:

1. **Given** the user selects the "Attraction & Sparks" theme, **When** the preview or card-drawing screen loads, **Then** the background displays the theme's associated warm/pink color palette.
2. **Given** the user is in one theme, **When** they navigate back and select a different theme, **Then** the background color transitions smoothly to the new theme's palette.
3. **Given** a theme is active, **When** the user views the preview overlay, CTA button, focus ring, or supporting hint text, **Then** those UI accents inherit the theme's primary and secondary colors.
4. **Given** the user is on a mobile device, **When** viewing any theme, **Then** the ambiance and layout are optimized for portrait (vertical) orientation and single-hand operation.

---

### User Story 5 - Play Offline (Priority: P5)

A couple is on a camping trip with no cell signal. They had previously visited the game on their phone while still online. Now, they open the game from their home screen, select a theme, and draw cards — all without any internet connection.

**Why this priority**: Offline support fulfills important real-world use cases (camping, flights, travel) but requires the core game to exist first.

**Independent Test**: Can be fully tested by loading the game once while online, going offline, reopening it, and completing a full game session.

**Acceptance Scenarios**:

1. **Given** the user has previously visited the game while online, **When** they open the game without internet connectivity, **Then** the game loads fully and is interactive.
2. **Given** the user is offline, **When** they select a theme and draw cards, **Then** all cards display correctly with text in all supported languages.
3. **Given** the game is installed on the user's home screen, **When** they launch it, **Then** it opens in a standalone app-like experience (no browser navigation bar).

---

### Edge Cases

- What happens when the user rapidly taps the card stack multiple times before the flip animation completes? The system should queue or ignore additional taps until the current animation finishes to prevent skipping cards.
- What happens when the user navigates back to the homepage mid-session and returns to the same theme? The session state (already-drawn cards) should be preserved so they resume where they left off.
- What happens when the user toggles intimate mode while a game session is already in progress? The toggle should only take effect for the next theme entry, not mid-session.
- How does the system handle the language switch if a card has no translation available for the selected language? The system should fall back to English for the secondary text.
- What happens if the user switches themes without finishing the previous deck? The previous session is discarded and a fresh deck is dealt for the new theme.
- What happens when fewer than five cards remain in the fan deck? The fan angle should dynamically narrow as the remaining card count decreases (for example, 3 cards → ±16°, 2 cards → ±8°, 1 card → 0°) so the layout remains visually centered.
- What happens if the user presses back while the revealed-card overlay is visible? The system should remain in the reading phase, and the leave-confirmation modal should still follow the existing `drawnCount >= 8` rule.
- What happens if the user refreshes the browser during the revealed-card reading phase? The session should preserve already-drawn progress in sessionStorage, but the reading overlay should not be restored; instead, the next-to-draw card should appear centered in the fan based on the updated drawn count.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST present four distinct relationship themes on the homepage: Attraction & Sparks, Self & Exploration, Interaction & Understanding, and Trust & Growth.
- **FR-002**: System MUST display the remaining deck as a fan of up to five face-down cards after the user starts a theme, and the fan angle MUST narrow automatically when fewer than five cards remain.
- **FR-003**: System MUST allow only the center card in the fan to trigger card reading, and MUST present the reveal as a dedicated overlay with a 3D rotateY flip animation.
- **FR-004**: System MUST track drawn cards within a single game session and prevent any card from appearing more than once per session.
- **FR-005**: System MUST display a warm closing message and provide navigation back to the homepage when all cards in a theme's deck have been drawn.
- **FR-006**: System MUST provide an "Intimate / Tipsy Mode" toggle on the homepage that adds 5 private cards to each theme's deck when enabled (15 base → 20 total).
- **FR-007**: System MUST shuffle intimate cards randomly into the deck so their position is unpredictable.
- **FR-008**: System MUST display a subtle visual indicator (e.g., decorative heart watermark) on intimate cards when they are flipped face-up.
- **FR-009**: System MUST display card content with Traditional Chinese as the primary (large) text and a secondary language (default English) in smaller text below.
- **FR-010**: System MUST provide a language-switch control that allows the user to change the secondary display language among English, Thai, and Japanese.
- **FR-011**: System MUST apply the selected secondary language to all subsequently drawn cards within the same session.
- **FR-012**: System MUST transition the background color/ambiance smoothly when switching between themes, with each theme having a distinct visual identity, and MUST apply the active theme's primary/secondary colors to related UI accents such as preview overlays, CTA buttons, focus rings, and hint text.
- **FR-013**: System MUST be optimized for mobile portrait orientation, with touch-friendly tap targets suitable for single-hand use.
- **FR-014**: System MUST support offline usage after the initial load, allowing users to play the full game without an active internet connection.
- **FR-015**: System MUST be installable to the user's home screen and launch in a standalone app-like mode without browser navigation chrome.
- **FR-016**: System MUST contain a total of 80 conversation prompts: 15 base cards + 5 intimate cards per theme × 4 themes.
- **FR-017**: System MUST present the four homepage themes as face-down deck visuals, and each deck MUST use that theme's `theme.colors.cardBack` palette.
- **FR-018**: System MUST show a theme preview overlay before entering gameplay, including the theme description, a "Start Conversation" CTA, and a darkened backdrop.
- **FR-019**: System MUST disable pointer interaction on all non-center cards within the fan layout.
- **FR-020**: System MUST dismiss the revealed-card overlay by animating the card off-screen to the right and automatically advancing the fan to the next card; after the final card, the system MUST transition to the end-of-deck message flow.

### Key Entities

- **Theme**: A relationship topic category. Has a name, description, associated visual ambiance (color palette), and a collection of cards. There are exactly four themes.
- **Card**: A conversation prompt belonging to a theme. Has content in multiple languages (Traditional Chinese, English, Thai, Japanese), a flag indicating whether it is an intimate card, and belongs to exactly one theme.
- **Game Session**: A transient play-through within a single theme. Tracks which cards have been drawn, the intimate mode state at session start, and the current secondary language preference. Exists only during active play and is discarded when the user exits the theme.
- **Language Setting**: The user's selected secondary display language. Persists across card draws within a session and defaults to English.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can start a game session (select theme → draw first card) within 10 seconds of opening the app.
- **SC-002**: Card flip animation completes smoothly without visible stutter on mid-range mobile devices.
- **SC-003**: 100% of conversation prompts in the deck are reachable (no card is skipped or duplicated) in a single session.
- **SC-004**: Users can switch the secondary language and see the change reflected on the next card drawn within 1 second.
- **SC-005**: The game is fully playable (theme selection, card drawing, language switching) without an internet connection after one initial online visit.
- **SC-006**: The intimate mode toggle correctly modifies deck size from 15 to 20 cards per theme, and intimate cards are visually distinguishable.
- **SC-007**: 90% of first-time users can complete a full round (draw all cards in a theme) without confusion or needing external instructions.
- **SC-008**: Background ambiance transitions between themes complete smoothly within 1 second without jarring visual breaks.
- **SC-009**: The five-card fan layout and revealed-card overlay animations maintain 60fps on mid-range iOS Safari devices, with the flip animation completing in 600ms and the dismissal animation completing in 460ms without visible dropped frames.

## Assumptions

- Users access the game primarily on mobile phones in portrait orientation; desktop and landscape are secondary concerns.
- No user accounts or login are required; the game is anonymous and sessionless (no data is stored beyond the current play session).
- All 80 conversation prompts (content in Traditional Chinese, English, Thai, and Japanese) will be provided as static content — no user-generated content or dynamic content fetching is needed.
- The game is a single-player (single-device) experience where two people share one screen; there is no multiplayer or remote pairing feature.
- The initial set of supported secondary languages is English, Thai, and Japanese. Additional languages may be added in the future but are out of scope for this version.
- Performance targets assume standard modern mobile browsers (Safari on iOS, Chrome on Android) released within the last 3 years.
- No analytics, tracking, or third-party integrations are required for the initial version.
