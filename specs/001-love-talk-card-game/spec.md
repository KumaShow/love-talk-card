# Feature Specification: Love Talk Card Game

**Feature Branch**: `001-love-talk-card-game`  
**Created**: 2025-07-18  
**Status**: Draft  
**Input**: User description: "A web-based card game designed for couples and romantic partners. Players choose from four relationship themes, draw and flip cards with conversation prompts, toggle an intimate mode for private questions, switch between multiple display languages, and enjoy an immersive mobile-first experience with offline support."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Choose a Theme and Draw Cards (Priority: P1)

A couple opens the game on their phone. They browse four relationship themes on the homepage — Attraction & Sparks, Self & Exploration, Interaction & Understanding, and Trust & Growth — and pick the one that fits their current mood. Once inside, they see a stack of face-down cards. They tap the top card, watch it flip over with a smooth animation, read the conversation prompt aloud, and discuss it together. They keep drawing cards one at a time. When they finish the deck, the game shows a warm closing message and guides them back to the homepage.

**Why this priority**: This is the core gameplay loop. Without the ability to select a theme, draw cards, and see prompts, no other feature has value. This alone delivers a complete, usable product.

**Independent Test**: Can be fully tested by selecting any theme, drawing all cards in the deck, and verifying prompts appear — delivers the core conversational experience.

**Acceptance Scenarios**:

1. **Given** the user is on the homepage, **When** they select the "Attraction & Sparks" theme, **Then** they are taken to the card-drawing screen showing a stack of face-down cards for that theme.
2. **Given** the user is on the card-drawing screen, **When** they tap the top card, **Then** the card flips over with a smooth animation revealing the conversation prompt on the front.
3. **Given** a card has been drawn, **When** the user draws additional cards, **Then** previously drawn cards do not reappear in the same session.
4. **Given** all 15 cards in the theme have been drawn, **When** the user attempts to draw again, **Then** a warm closing message is displayed and the user is guided back to the homepage.

---

### User Story 2 - Toggle Intimate Mode (Priority: P2)

Before selecting a theme, one partner notices the "Intimate / Tipsy Mode" toggle on the homepage. They switch it on. Now, when they enter a theme, 5 additional private cards are shuffled into the deck (bringing it to 20 cards). When a private card is flipped, it shows a subtle visual indicator (such as a decorative heart watermark) so both players know it's a special intimate question.

**Why this priority**: Intimate mode adds depth and replayability by introducing a second layer of content. It is the key differentiator that elevates the game from casual conversation starter to a meaningful couples' experience.

**Independent Test**: Can be fully tested by enabling the toggle, entering a theme, drawing all 20 cards, and confirming the 5 intimate cards appear with their visual indicator.

**Acceptance Scenarios**:

1. **Given** the user is on the homepage, **When** they enable the "Intimate / Tipsy Mode" toggle, **Then** the toggle state is visually confirmed as active.
2. **Given** intimate mode is enabled, **When** the user enters any theme, **Then** the deck contains 20 cards (15 base + 5 intimate).
3. **Given** intimate mode is enabled and a private card is drawn, **When** the card flips over, **Then** a subtle visual indicator (e.g., decorative heart watermark) is visible on the card face.
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

A couple playing late at night selects the "Trust & Growth" theme. The background smoothly transitions to a deep warm tone. When they go back and switch to "Attraction & Sparks," the background transitions to a soft pink. The ambiance changes give each theme a distinct emotional atmosphere.

**Why this priority**: Visual immersion enhances the emotional experience and differentiates themes, but the game is fully playable without it.

**Independent Test**: Can be fully tested by navigating between different themes and verifying that the background color/ambiance transitions smoothly to match each theme's identity.

**Acceptance Scenarios**:

1. **Given** the user selects the "Attraction & Sparks" theme, **When** the card-drawing screen loads, **Then** the background displays the theme's associated warm/pink color palette.
2. **Given** the user is in one theme, **When** they navigate back and select a different theme, **Then** the background color transitions smoothly to the new theme's palette.
3. **Given** the user is on a mobile device, **When** viewing any theme, **Then** the ambiance and layout are optimized for portrait (vertical) orientation and single-hand operation.

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

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST present four distinct relationship themes on the homepage: Attraction & Sparks, Self & Exploration, Interaction & Understanding, and Trust & Growth.
- **FR-002**: System MUST display a stack of face-down cards after the user selects a theme, with all card backs showing a unified visual design.
- **FR-003**: System MUST play a 3D flip animation when the user taps the top card, revealing the conversation prompt on the card face.
- **FR-004**: System MUST track drawn cards within a single game session and prevent any card from appearing more than once per session.
- **FR-005**: System MUST display a warm closing message and provide navigation back to the homepage when all cards in a theme's deck have been drawn.
- **FR-006**: System MUST provide an "Intimate / Tipsy Mode" toggle on the homepage that adds 5 private cards to each theme's deck when enabled (15 base → 20 total).
- **FR-007**: System MUST shuffle intimate cards randomly into the deck so their position is unpredictable.
- **FR-008**: System MUST display a subtle visual indicator (e.g., decorative heart watermark) on intimate cards when they are flipped face-up.
- **FR-009**: System MUST display card content with Traditional Chinese as the primary (large) text and a secondary language (default English) in smaller text below.
- **FR-010**: System MUST provide a language-switch control that allows the user to change the secondary display language among English, Thai, and Japanese.
- **FR-011**: System MUST apply the selected secondary language to all subsequently drawn cards within the same session.
- **FR-012**: System MUST transition the background color/ambiance smoothly when switching between themes, with each theme having a distinct visual identity.
- **FR-013**: System MUST be optimized for mobile portrait orientation, with touch-friendly tap targets suitable for single-hand use.
- **FR-014**: System MUST support offline usage after the initial load, allowing users to play the full game without an active internet connection.
- **FR-015**: System MUST be installable to the user's home screen and launch in a standalone app-like mode without browser navigation chrome.
- **FR-016**: System MUST contain a total of 80 conversation prompts: 15 base cards + 5 intimate cards per theme × 4 themes.

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

## Assumptions

- Users access the game primarily on mobile phones in portrait orientation; desktop and landscape are secondary concerns.
- No user accounts or login are required; the game is anonymous and sessionless (no data is stored beyond the current play session).
- All 80 conversation prompts (content in Traditional Chinese, English, Thai, and Japanese) will be provided as static content — no user-generated content or dynamic content fetching is needed.
- The game is a single-player (single-device) experience where two people share one screen; there is no multiplayer or remote pairing feature.
- The initial set of supported secondary languages is English, Thai, and Japanese. Additional languages may be added in the future but are out of scope for this version.
- Performance targets assume standard modern mobile browsers (Safari on iOS, Chrome on Android) released within the last 3 years.
- No analytics, tracking, or third-party integrations are required for the initial version.
