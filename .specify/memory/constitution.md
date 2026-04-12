<!--
  Sync Impact Report
  ===================
  Version change: N/A → 1.0.0 (initial creation)
  Modified principles: None (all new)
  Added sections:
    - Core Principles (4 principles)
    - Project Constraints & Standards
    - Development Workflow
    - Governance
  Removed sections: None
  Templates requiring updates:
    - .specify/templates/plan-template.md ✅ verified compatible
    - .specify/templates/spec-template.md ✅ verified compatible
    - .specify/templates/tasks-template.md ✅ verified compatible
    - .specify/templates/checklist-template.md ✅ verified compatible
    - .specify/templates/agent-file-template.md ✅ verified compatible
  Follow-up TODOs: None
  ZH-TW mirror: .specify/memory/constitution_zh-tw.md ✅ created
-->

# Love Talk Card Constitution

## Core Principles

### I. Code Quality

All source code MUST adhere to clean code standards that prioritize
maintainability, readability, and consistency.

- Every function and module MUST have a single, clear responsibility.
- Code comments MUST be written in Traditional Chinese (ZH-TW).
- Variable, function, and component names MUST be descriptive and
  self-documenting. Abbreviations are prohibited unless universally
  recognized (e.g., `i18n`, `URL`, `ID`).
- Dead code, unused imports, and commented-out code blocks MUST be
  removed before merging.
- All files MUST use LF line endings. CRLF is prohibited.
- Linting and formatting tools MUST be configured and enforced in CI.
  Code that fails lint checks MUST NOT be merged.
- Complex logic MUST include inline ZH-TW comments explaining the
  *why*, not the *what*.

**Rationale**: A romantic card game with i18n support requires a
codebase that any contributor can navigate quickly. Strict readability
rules reduce onboarding time and prevent subtle bugs in UI-facing
logic.

### II. Testing Standards (NON-NEGOTIABLE)

Test-Driven Development (TDD) is the mandatory development methodology
for all feature work.

- The Red-Green-Refactor cycle MUST be followed: write a failing test
  first, implement the minimum code to pass, then refactor.
- Every user-facing feature MUST have corresponding unit tests and at
  least one integration test covering the primary user journey.
- Test coverage MUST meet or exceed 80% for all new code. Critical
  paths (card drawing, state management, i18n switching) MUST reach
  95% coverage.
- Tests MUST be deterministic and isolated. No test may depend on
  execution order, network availability, or external state.
- Flaky tests MUST be fixed or quarantined within 24 hours of
  detection. A quarantined test MUST have a tracking issue.
- Test descriptions MUST clearly state the scenario under test using
  the pattern: `[unit] [action] [expected result]`.

**Rationale**: The card game relies on randomized state (shuffled
decks, intimate mode toggling). TDD ensures correctness of these
stateful interactions before the UI is built, preventing regressions
that degrade the couple's experience.

### III. User Experience Consistency

All UI/UX patterns MUST be consistent, accessible, and responsive
across every screen and interaction.

- The design MUST follow a Mobile-First approach, optimized for
  portrait orientation and single-hand operation.
- Interactive elements (buttons, cards, toggles) MUST meet a minimum
  touch target of 44×44 CSS pixels.
- Color contrast MUST meet WCAG 2.1 AA standards (minimum 4.5:1 for
  normal text, 3:1 for large text).
- Theme transitions (background color changes per topic) MUST use
  smooth CSS transitions with duration between 300ms and 500ms.
- Card flip animations MUST complete within 600ms and MUST NOT block
  user interaction after completion.
- The application MUST support internationalization (i18n) with at
  minimum Traditional Chinese (ZH-TW) and English (en). The default
  display language is ZH-TW.
- All user-facing strings MUST be externalized into translation files.
  Hardcoded display strings in source code are prohibited.
- The default timezone for all date/time operations MUST be
  Asia/Taipei (UTC+8).
- The UI MUST be fully functional offline via PWA technology once
  initial assets are cached.

**Rationale**: This is an intimate, atmosphere-driven experience.
Inconsistent UI, jarring animations, or broken layouts on mobile
destroy the romantic mood the product is designed to create.

### IV. Performance Requirements

The application MUST load fast and render efficiently to maintain an
immersive, uninterrupted experience.

- Initial page load (First Contentful Paint) MUST complete within
  1.5 seconds on a 4G mobile connection.
- Time to Interactive MUST be under 3 seconds on mid-range devices.
- The total initial bundle size MUST NOT exceed 200 KB (gzipped),
  excluding cached PWA assets.
- Card flip animations MUST maintain 60 fps with no dropped frames.
- Image and asset files MUST be optimized: use WebP/AVIF for images,
  SVG for icons, and WOFF2 for fonts.
- Lazy loading MUST be applied to assets not required for the initial
  viewport.
- The Service Worker MUST implement a cache-first strategy for static
  assets and card data to ensure offline performance parity with
  online usage.

**Rationale**: Couples use this app in low-connectivity settings
(camping, flights, remote cabins). Slow loading or stuttering
animations break immersion and reduce the likelihood of continued
engagement.

## Project Constraints & Standards

The following constraints apply to all development activities and are
enforced alongside the core principles.

- **Language of Code Comments**: All code comments MUST be in
  Traditional Chinese (ZH-TW).
- **Commit Messages**: All Git commit messages MUST be written in
  Traditional Chinese (ZH-TW).
- **Line Endings**: All files in the repository MUST use LF (`\n`)
  line endings. A `.gitattributes` file MUST enforce this.
- **Internationalization**: The application MUST support at minimum
  Traditional Chinese (ZH-TW) and English (en). Third-language
  support (Thai, Japanese) is a planned extension.
- **Timezone**: The default timezone for all date, time, and
  scheduling operations MUST be Asia/Taipei (UTC+8).
- **Externalization**: All user-facing text MUST be externalized into
  translation resource files. No display string may be hardcoded in
  component or service code.
- **Constitution Mirroring**: This constitution (English) MUST be
  kept in sync with the authoritative ZH-TW version at
  `.specify/memory/constitution_zh-tw.md`. When conflicts exist, the
  ZH-TW version is the canonical source of truth.

## Development Workflow

All contributors MUST follow this workflow to ensure quality gates
are met consistently.

1. **Branch Creation**: Create a feature branch from `main` following
   the naming convention `###-feature-name`.
2. **TDD Cycle**: For every task, write failing tests first, implement
   code to pass, then refactor. Commit after each green phase.
3. **Lint & Format**: Run linting and formatting checks locally before
   pushing. CI MUST enforce these checks as a merge gate.
4. **Code Review**: Every pull request MUST be reviewed before merge.
   Reviewers MUST verify compliance with all four core principles.
5. **Constitution Compliance**: Reviewers MUST check that:
   - Code comments are in ZH-TW.
   - Commit messages are in ZH-TW.
   - All new user-facing strings are externalized.
   - New components meet accessibility and performance thresholds.
6. **Continuous Integration**: The CI pipeline MUST run the full test
   suite, lint checks, and build verification on every push. Failing
   CI MUST block merge.
7. **Commit Granularity**: Each commit MUST represent a single logical
   change. Squash commits are permitted for cleanup but MUST preserve
   meaningful history.

## Governance

This constitution is the supreme governing document for the Love Talk
Card project. It supersedes all other conventions, guidelines, or
informal practices.

- **Amendment Process**: Any change to this constitution MUST be
  proposed via a pull request with a clear rationale. The change MUST
  be reviewed and approved before merge.
- **Versioning Policy**: The constitution follows Semantic Versioning:
  - MAJOR: Removal or incompatible redefinition of a core principle.
  - MINOR: Addition of a new principle, section, or material
    expansion of existing guidance.
  - PATCH: Clarifications, typo fixes, or non-semantic refinements.
- **Compliance Review**: All pull requests and code reviews MUST
  verify compliance with the active constitution version. Violations
  MUST be resolved before merge.
- **Bilingual Maintenance**: Both `constitution.md` (English) and
  `constitution_zh-tw.md` (Traditional Chinese) MUST be updated in
  the same commit. The ZH-TW version is authoritative.
- **Guidance Reference**: Use `AGENTS.md` for runtime development
  guidance specific to AI-assisted development workflows.

**Version**: 1.0.0 | **Ratified**: 2026-04-12 | **Last Amended**: 2026-04-12
