# love-talk-card Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-04-13

## Active Technologies

- TypeScript 5.x + Node.js 20 LTS + Vue 3.4+, Vite 5.x, Vue Router 4（Hash mode）, Pinia 2.x, Tailwind CSS 4.x, vite-plugin-pwa (001-love-talk-card-game)

## Project Structure

```text
src/
tests/
```

## Commands

npm test && npm run lint

## Code Style

TypeScript 5.x + Node.js 20 LTS: Follow standard conventions

## Recent Changes

- 001-love-talk-card-game: Added TypeScript 5.x + Node.js 20 LTS + Vue 3.4+, Vite 5.x, Vue Router 4（Hash mode）, Pinia 2.x, Tailwind CSS 4.x, vite-plugin-pwa

<!-- MANUAL ADDITIONS START -->

## Styling

- Use Tailwind v4 utility-first. **Do NOT use BEM** (`block__element--modifier`).
- Write static styles (layout, spacing, color, typography, radius, responsive) as utility classes, including arbitrary variants such as `max-[23rem]:`.
- Keep only hard-to-express styles in `<style scoped>` — `color-mix()`/gradients, 3D flip (`preserve-3d` / `rotateY` / `backface-visibility` / `perspective`), dynamic CSS-variable transforms, and Vue `<Transition>` enter/leave classes — and name them with a single semantic class (e.g. `.card-back`, `.picked-cta`), never BEM.
- Drive component state via `data-*` attribute selectors (e.g. `[data-flipped='true']`) or conditional utility classes instead of BEM modifiers.
- Global design tokens live in `src/assets/main.css` (`@theme`); change site-wide visuals there.

<!-- MANUAL ADDITIONS END -->
