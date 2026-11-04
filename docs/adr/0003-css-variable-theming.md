# ADR-0003 — Themes are CSS custom properties on `[data-theme]`

Status: accepted · 2026-11-03

## Context

The design (`docs/02`) is built on a token-driven theme system: one
attribute change restyles the whole page, and themes are named after
terminal colour schemes. The site needs at least Tokyo Night (dark) and
White (light), switchable by button and by the `T` key, with no flash of the
wrong theme on load and no layout shift.

## Decision

- Each theme is a `[data-theme='<id>']` block in `app/globals.css` that
  sets `--t-*` custom properties and `color-scheme`.
- Tailwind v4's `@theme inline` maps semantic names (`--color-bg`,
  `--color-text`, …) to `var(--t-*)`, so utilities like `bg-bg` resolve at
  paint time to whichever theme is active.
- The active theme is the `data-theme` attribute on `<html>`. A ten-line
  inline script in `app/layout.tsx` sets it from `localStorage` (falling
  back to `prefers-color-scheme`) before first paint.
- `ThemeToggle` is the only client component that touches theme state. It
  sets the attribute and `localStorage`, and listens for `T`.
- Components reference semantic tokens only. The `--t-*` names never
  appear outside `globals.css`.

## Consequences

- Adding a theme is one CSS block and one entry in `lib/themes.ts`.
  Catppuccin, Nord and Gruvbox are a post-v1 afternoon.
- No React re-render on theme change; the browser repaints. No context
  provider, no `useTheme` hook, no `next-themes` dependency.
- `suppressHydrationWarning` on `<html>` is required because the inline
  script may change the attribute before hydration. This is documented
  behaviour and the single accepted hydration exception.
- Tailwind's `dark:` variant is **not used**. There is no "dark mode"; there
  are themes, some of which are dark. Components must never branch on
  `dark:`.
- The inline script is the only `dangerouslySetInnerHTML` in the codebase
  and must stay dependency-free and under ~15 lines.

## Alternatives rejected

- **`next-themes`.** Well-made, does the same thing with a provider and a
  hook. Rejected because the mechanism is small enough to own, and owning
  it is the lesson.
- **Tailwind `dark:` variant with `@custom-variant`.** Handles exactly two
  modes. Rejected because the design calls for N named themes, not a
  light/dark pair.
- **CSS-in-JS (styled-components, vanilla-extract).** Adds a runtime or a
  build plugin for a problem custom properties solve natively.
- **Separate stylesheets per theme, swapped by `<link>`.** Causes a flash
  on switch and duplicates every rule.
