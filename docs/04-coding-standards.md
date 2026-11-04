# 04 — Coding Standards

These are the habits the project is meant to build. They are written as
rules so that they never have to be re-decided.

## 1. The governing principle

**Prefer the framework's way, in the framework's words.** When Next.js,
React, Tailwind or TypeScript document a pattern, use it exactly, and link
the page in the commit or the file header. Cleverness that departs from the
documented way must be an ADR. A reader who knows the Next.js docs should be
able to read this repo without surprises.

## 2. TypeScript

- `strict: true` (create-next-app default) plus `noUncheckedIndexedAccess:
true` and `noImplicitOverride: true`.
- No `any`. No `as unknown as`. No `@ts-ignore`; `@ts-expect-error` with a
  reason comment only when a library's types are wrong, and then an issue
  link.
- Types over interfaces for data shapes (`type ProjectMeta = {…}`);
  interfaces only when something is meant to be implemented or extended.
- `satisfies` to type literal objects without widening (`export const meta
= {…} satisfies ProjectMeta`).
- Named exports everywhere except where a file convention requires default
  (`page.tsx`, `layout.tsx`, `route.ts`, MDX bodies).
- No enums. Union of string literals plus a `const` array when iteration is
  needed: `export const THEMES = ['tokyo-night', 'white'] as const; type
Theme = (typeof THEMES)[number]`.

## 3. React and Next.js

- **Server Components by default.** A file gets `'use client'` only if it
  uses state, effects, event handlers, or browser APIs. The directive is
  followed by a one-line comment saying which of those it is.
- **Push client boundaries to the leaves.** `SiteHeader` is a Server
  Component that renders a client `ThemeToggle`; not the other way round.
- **No data fetching in components.** Data comes from `lib/` functions
  called in `page.tsx` and passed down as props.
- **Props are typed inline** for components with ≤ 3 props, as a named
  `type XProps` above the component otherwise.
- **Metadata** via the `metadata` export or `generateMetadata`; never
  `<head>` tags in JSX.
- **Links** via `next/link` for internal routes, `ExternalLink` for external
  ones. Never a bare `<a href="/about">`.
- **Images** via `next/image` with explicit `width`/`height` or `fill`, and
  `sizes` whenever `fill` is used. No `<img>`.
- **Fonts** via `next/font` only. No `<link>` to Google Fonts.
- **No `useEffect` for derived data.** If it can be computed from props,
  compute it. Effects are for subscriptions (the `T` keydown listener) and
  nothing else.
- File names: `kebab-case.tsx`. Component names: `PascalCase`. One component
  per file, named the same as the file.

## 4. Tailwind

- Tokens only. `bg-bg`, `text-text-muted`, `border-border-subtle`. Never a
  raw colour utility (`bg-slate-900`) or an arbitrary hex (`bg-[#1a1b26]`)
  in a component.
- Class order is Prettier's (`prettier-plugin-tailwindcss`). Don't fight it.
- Long class lists stay on one line; readability comes from small
  components, not from line breaks inside `className`.
- `cn()` helper (`clsx` + `tailwind-merge`) only when classes are
  conditional. Don't wrap static strings in it.
- No `@apply` except in `globals.css` for base element styles. Components
  own their classes.
- No `!important`. If a utility needs overriding, the component is wrong.

## 5. MDX and content

- One MDX file per project or post, filename is the slug, lowercase
  kebab-case.
- `export const meta` at the top, typed with `satisfies`. Nothing else is
  exported.
- Headings start at `##` in the body; the page supplies the `h1`.
- Prose is plain Markdown. Custom components (callouts, figures) go through
  `mdx-components.tsx` and get a one-line doc comment.
- Images in MDX use the `Figure` component mapped in `mdx-components.tsx`,
  never raw `![]()` for anything above an inline icon.

## 6. CSS

- `globals.css` has four sections, in order: Tailwind import, `@theme
inline`, `[data-theme]` blocks, base element rules. Nothing else.
- No other `.css` files. No CSS Modules. No styled-jsx.
- Values that appear in two places become a token.

## 7. Naming

- Routes and slugs: kebab-case.
- Variables and functions: `camelCase`; booleans read as predicates
  (`isFeatured`, `hasLiveUrl`).
- Constants that are truly constant: `SCREAMING_CASE` (`THEMES`,
  `SITE_URL`).
- Files in `lib/` are named for what they export: `content.ts` exports
  `listProjects`, `getProject`.
- No abbreviations in identifiers except `id`, `url`, `href`, `src`.

## 8. Comments and docs

- A file header comment only when the file's role is not obvious from its
  path and name. `app/page.tsx` needs none; `lib/content.ts` gets three
  lines.
- Comments explain _why_, never _what_. If a comment restates the code,
  delete one of them.
- Link the Next.js docs page when a pattern is taken from it, once, at the
  point of first use.
- `TODO:` is allowed only for copy and only with an owner-less imperative
  ("TODO: write SwadeStack results paragraph"). Never `TODO: fix later`.

## 9. Git

- Conventional commits, lower-case, imperative, no period:
  `feat: add theme toggle`, `chore: pin node version`, `docs: add ADR-0003`,
  `fix: prevent theme flash on first paint`, `ci: add format check`.
- One logical change per commit. Tooling and feature changes are separate
  commits even if made in the same round.
- `main` is always green and always deployable. There are no long-lived
  branches; a task may use a short branch if it spans more than one commit,
  merged with a fast-forward.
- Never commit `.env*` or anything under `node_modules/` or `.next/`.
  Everything `.gitignore` lists stays ignored.

## 10. Dependencies

- Each `npm install` of a new package is accompanied by one sentence in the
  commit body saying what it replaces or enables.
- Allowed by default: `next`, `react`, `react-dom`, `tailwindcss`,
  `@tailwindcss/turbopack`, `@tailwindcss/typography`, `@next/mdx`,
  `@mdx-js/loader`, `@mdx-js/react`, `@types/mdx`, `server-only`, `clsx`,
  `tailwind-merge`, `typescript`, `eslint`, `eslint-config-next`,
  `prettier`, `prettier-plugin-tailwindcss`; in M4 also `@playwright/test`.
- Needs justification: anything else. Animation libraries, icon packs with
  hundreds of icons, UI kits, state managers, and date libraries are
  presumed unnecessary for this site.
- Exact versions in `package.json` are fine as installed; the lockfile is
  committed and `npm ci` is used everywhere except local `npm install`.

## 11. Accessibility

- Every page has exactly one `h1`. Heading levels do not skip.
- Every interactive element is a `button` or an `a`. No `div onClick`.
- Icon-only controls carry `aria-label`. The theme button announces the
  theme it will switch to.
- Focus is visible on every element, in both themes.
- Contrast is checked for every new token pair before it is used.
- `prefers-reduced-motion` disables the one or two transitions that exist.

## 12. What not to do — reflexes from other stacks

- No `index.ts` barrels. Import from the file.
- No `utils.ts` dumping ground. A helper gets a file named for what it does,
  or lives next to its single caller.
- No wrapping `next/link` in a custom `Link` "for consistency". Use the
  real one; style with classes.
- No fetching JSON from `public/` at runtime. Data is imported at build.
- No `useState` for the theme. The DOM attribute is the state.
- No giant `page.tsx`. A page composes sections; sections are components.
