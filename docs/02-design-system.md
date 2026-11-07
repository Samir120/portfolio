# 02 — Design System

The visual language is terminal-inspired: two typefaces, hairline borders,
no rounded corners, mono paths and title bars, and themes named after
terminal colour schemes. The default palette is Tokyo Night; token values
below are exact hex values from that scheme, not approximations. Page
structure is a one-scroll home and list-based about, projects and contact
pages. This document is the spec; `app/globals.css` implements it.

## 1. Principles

1. **Flat.** No shadows, no gradients, no rounded corners. Depth comes from
   1px borders and background steps (`bg-deep` → `bg` → `surface`).
2. **Typography does the work.** Two families with fixed roles, one small
   scale (§2), generous measure. Decoration is a hover state.
3. **Themeable by construction.** Components only reference semantic tokens.
   A theme is a block of CSS variables; adding one touches nothing else.
   Photos are tinted by tokens too (§5.1).
4. **Dark first, light equal.** Both themes get the same contrast checks.
5. **The one flourish** is the theme picker (`T`). Everything else is still.

## 2. Typography

| Role          | Family                    | Loaded via                            |
| ------------- | ------------------------- | ------------------------------------- |
| `--font-sans` | Geist (variable)          | `next/font/google` → `Geist`          |
| `--font-mono` | JetBrains Mono (variable) | `next/font/google` → `JetBrains_Mono` |

Both are exposed as CSS variables from `app/layout.tsx` (`variable:
'--font-sans'` / `'--font-mono'`) and mapped in Tailwind as `font-sans` and
`font-mono`.

**Roles.** Mono is the body face: running text, nav, buttons, links, lists,
prose and code. Geist is the heading face: `h1`–`h6`, plus a few titles
that are not headings (book titles, the footer name). Both rules are base
styles in `globals.css`; headings also take `text-wrap: balance`, and
running text (`p`, `li`, `dd`) takes `text-wrap: pretty`. Labels are told
apart from body text by size, case and colour, not by family.

**Scale.** Six steps, nothing larger than the page title:

| Step       | Size (mobile → `sm`) | Classes                                                      | Used for                              |
| ---------- | -------------------- | ------------------------------------------------------------ | ------------------------------------- |
| Page title | 24px → 30px          | `text-2xl sm:text-3xl font-semibold tracking-tight`          | every `h1`                            |
| Section    | 18px → 20px          | `text-lg sm:text-xl font-semibold tracking-tight`            | section `h2`s, case-study `h2`s       |
| Item title | 16px                 | `text-base font-semibold`                                    | card and list titles, prose `h3`      |
| Body       | 15px                 | `text-[15px] leading-relaxed`                                | paragraphs, summaries, prose          |
| Small      | 14px                 | `text-sm`                                                    | nav, buttons, link rows, footer       |
| Label      | 12px                 | `font-mono text-xs uppercase tracking-wider text-text-muted` | paths, dates, meta, chips, title bars |

Inline code in prose scales from the body (`0.875em`). Prose headings are
set to the section and item-title steps, not the plugin's own ratios.

Section headings end with a period on the about, projects and contact
pages ("About Me.", "Projects.", "Contact."). Home section headings do not.

## 3. Colour tokens

Semantic layer, the only names components may use:

```
bg-deep        footer band, title bars
bg             page background
surface        code blocks
surface-2      hover backgrounds
border-subtle  default 1px borders
border-strong  emphasised dividers, hover frames
text           primary
text-secondary
text-muted
brand          accent: current page, primary button, focus ring
brand-soft     12% brand, for tinted backgrounds
brand-ink      text on a brand-filled surface
selection      ::selection background
photo-shadow   darkest colour of a tinted photo
photo-light    lightest colour of a tinted photo
```

### 3.1 Tokyo Night (default, dark)

```css
[data-theme="tokyo-night"] {
  --t-bg-deep: #0f0f14;
  --t-bg: #16161e;
  --t-surface: #1a1b26;
  --t-surface-2: #292e42;
  --t-border-subtle: #24283b;
  --t-border-strong: #414868;
  --t-text: #c0caf5;
  --t-text-secondary: #a9b1d6;
  --t-text-muted: #9aa5ce;
  --t-brand: #9ece6a;
  --t-brand-soft: #9ece6a1f;
  --t-brand-ink: #0c0e10;
  --t-selection: #292e42;
  --t-photo-shadow: #16161e;
  --t-photo-light: #c0caf5;
  color-scheme: dark;
}
```

`bg` is the scheme's darker background (`bg_dark`); `surface` is its
standard one. `text-muted` is the scheme's editor foreground.

### 3.2 White (light)

```css
[data-theme="white"] {
  --t-bg-deep: #f5f5f5;
  --t-bg: #ffffff;
  --t-surface: #ffffff;
  --t-surface-2: #f5f5f5;
  --t-border-subtle: #e8e8e8;
  --t-border-strong: #c0c0c0;
  --t-text: #000000;
  --t-text-secondary: #383838;
  --t-text-muted: #4a4a4a;
  --t-brand: #555555;
  --t-brand-soft: #5555551f;
  --t-brand-ink: #ffffff;
  --t-selection: #c0c0c0;
  --t-photo-shadow: #1a1a1a;
  --t-photo-light: #f5f5f5;
  color-scheme: light;
}
```

### 3.3 Mapping into Tailwind v4

Tailwind v4 is configured in CSS, not `tailwind.config.js`. The semantic
names become utilities through `@theme inline`, which keeps them live
references to the `--t-*` variables so a theme switch is a single attribute
change with no re-render:

```css
@import "tailwindcss";

@theme inline {
  --font-sans: var(--font-sans);
  --font-mono: var(--font-mono);

  --color-bg-deep: var(--t-bg-deep);
  --color-bg: var(--t-bg);
  --color-surface: var(--t-surface);
  --color-surface-2: var(--t-surface-2);
  --color-border-subtle: var(--t-border-subtle);
  --color-border-strong: var(--t-border-strong);
  --color-text: var(--t-text);
  --color-text-secondary: var(--t-text-secondary);
  --color-text-muted: var(--t-text-muted);
  --color-brand: var(--t-brand);
  --color-brand-soft: var(--t-brand-soft);
  --color-brand-ink: var(--t-brand-ink);
  --color-photo-shadow: var(--t-photo-shadow);
  --color-photo-light: var(--t-photo-light);

  --radius-*: initial; /* no rounded corners anywhere */
}
```

Usage is then plain Tailwind: `bg-bg text-text border-border-subtle
hover:bg-surface-2`.

**Contrast.** Every text token reaches 7:1 (WCAG AAA) on `bg`, `bg-deep`
and `surface` in both themes. The lowest pairs are Tokyo Night
`text-muted` at 7.0:1 on `surface` and White `text-muted` at 8.1:1 on
`bg-deep`. Tokyo Night `text-muted` on `surface-2` is 5.5:1, which passes
AA; `surface-2` is a hover background only. Button text on `brand` is
10.6:1 (Tokyo Night) and 7.5:1 (White). A new token pair is measured
before it is used.

The typography plugin that styles MDX bodies is coloured the same way:
`@utility prose-tokens` in `globals.css` sets its `--tw-prose-*` variables
to the semantic tokens (body `text-secondary`, headings and links `text`,
code blocks on `surface`). `prose-invert` is never used; a theme switch
recolours prose through the tokens.

Further themes (Catppuccin, Nord, Gruvbox…) are additional `[data-theme]`
blocks and an entry in `lib/themes.ts`. Not in v1.

## 4. Layout

- **Measure:** `max-w-3xl` (48rem) for all reading content, centred,
  `px-4 sm:px-6`.
- **Header:** sticky, `h-14`, `max-w-3xl` inner, `bg-bg/90 backdrop-blur`
  with a bottom hairline. Left: the wordmark, a `brand` slash and the name
  in mono `text-sm`, linking home. Right: Home · About · Projects ·
  Contact, then a vertical hairline, then the theme button with a `kbd`
  showing `T`. The current page's nav link is `text` with a 2px `brand`
  underline (§7).
- **Skip link:** the first focusable element on every page, a plain
  fragment link `Skip to content` that targets `<main id="main">`. Hidden
  until focused, then shown top-left over the header in `text-sm` on `bg`.
- **Scroll offset:** `<html>` carries `scroll-pt-20`, so whatever the
  browser scrolls into view (a focused link, an anchor, the skip target)
  lands clear of the sticky header. Elements take no `scroll-mt-*` of
  their own.
- **Footer:** `border-t border-border-subtle`, `bg-bg-deep`, two tiers.
  Top: the name in Geist with the role line under it, and the social
  links. Then a hairline and a colophon in the label style: `© <year>
<name>` and `<location> · Built with Next.js`.
- **Page header:** every page but home opens with `PageHeader`: a mono
  path (`~/about`, `~/projects/leta`, `404`), the `h1`, an optional lead
  paragraph, and a closing hairline.
- **Section spacing:** `py-12 sm:py-16` per page; one section gap between
  the home hero and its projects; `space-y-12 sm:space-y-16` between list
  sections.
- **Borders over boxes.** A list item is `border-b border-border-subtle
py-4`, not a card. Boxes are reserved for windows: project cards, the
  case-study spec sheet and the contact list, each `border
border-border-subtle`; project cards add a mono title bar on `bg-deep`.
- **Mobile:** single column always. Below `sm` the header collapses to
  wordmark + a text "Menu" toggle + theme button; no hamburger icon. The
  toggle opens the same nav list in a panel under the header.

## 5. Components

| Component        | Purpose                                                                        |
| ---------------- | ------------------------------------------------------------------------------ |
| `SiteHeader`     | Sticky bar: wordmark, nav, theme button                                        |
| `SiteFooter`     | Two-tier footer, as above                                                      |
| `PageHeader`     | Mono path, `h1`, optional lead, hairline                                       |
| `SectionHeading` | H2 + optional one-line description + optional right-side action link           |
| `ListSection`    | Heading + list of `ListItem`                                                   |
| `ListItem`       | title (optionally a link) · meta (mono, right) · subtitle · one paragraph      |
| `ReadingList`    | The reading list as a timeline: one row per year, newest first                 |
| `ProjectRow`     | Home: index · name · summary · year on a fixed grid                            |
| `Bio`            | Home: the short bio, 2–3 sentences, written as JSX                             |
| `ProjectCard`    | Projects page: a window with title bar, name, summary, stack chips, links      |
| `Prose`          | Typography wrapper for MDX bodies (`@tailwindcss/typography` mapped to tokens) |
| `Portrait`       | Home: square tinted photo beside the name (§5.1)                               |
| `Figure`         | A tinted photo in a hairline frame with a mono meta band below (§5.1)          |
| `Duotone`        | Tints a photo in the theme's two photo colours (§5.1)                          |
| `ThemeToggle`    | Client component. Button + `T` key. Persists to `localStorage`.                |
| `MobileMenu`     | Client component. The nav list, the current page, the "Menu" button below `sm` |
| `Kbd`            | Inline keyboard hint in mono                                                   |
| `ExternalLink`   | `<a>` with `rel="noopener noreferrer"` and a trailing `↗`                      |
| `OgCard`         | Open Graph card rendered by `next/og` (§8)                                     |

Every component is a Server Component unless listed as client. Only
`ThemeToggle` and `MobileMenu` are client components.

### 5.1 Photos

Photos belong to the theme. Each one is rendered in two colours of the
active palette, and a theme switch re-tints it with the rest of the page.

- **`Duotone`:** wraps an `<Image>`. The image is greyscaled and multiplied
  onto `photo-light`; a `photo-shadow` layer is then blended in with
  `lighten`. Shadows become `photo-shadow`, highlights `photo-light`. In
  Tokyo Night that is navy and lavender; in White, a soft black and white.
- **`Portrait`:** the home photo, a square (`size-20 sm:size-24`) in a
  hairline frame beside the eyebrow and name. The image is `next/image`
  `fill` with `object-cover`, so any source crops to the centre. It is the
  only image beside the `h1`, and it carries no meta line.
- **`Figure`:** a photo at its own ratio in a hairline frame, with one
  meta line below it in a `bg-deep` band in the label style
  (`STOCKHOLM · 2023`). Explicit `width` and `height`, lazy by default;
  `preload` is for an LCP image only. It carries `not-prose`, so the
  typography plugin leaves it alone inside an MDX body, where it is mapped
  in `mdx-components.tsx`.
- **Rhythm:** home shows the portrait only; about shows one `Figure` after
  the first paragraph of the long bio. No photo in project cards or case
  studies: projects are shown through their content (§6.3). A figure never
  exceeds the `max-w-3xl` measure.

## 6. Pages

### 6.1 Home `/`

1. Hero row: `Portrait`, then the eyebrow `Hi there, I'm` and the name as
   `h1`, vertically centred on each other
2. The role line from `lib/site.ts`, secondary, which is also the default
   description and the line on the Open Graph card
3. Bio, 2–3 sentences
4. Actions: `Get in touch` (brand fill, square) · `About me →` (text link)
5. `Selected projects` — 3–4 `ProjectRow`s, action link `All projects →`
6. `Writing` — `ListItem`s with date right-aligned; hidden until 2 posts
7. Footer

The bio here stays at 2–3 sentences; the long bio is on the about page.

### 6.2 About `/about`

`PageHeader` (`~/about`, `About Me.`), then the long bio: two to four
paragraphs with one `Figure` after the first.

Then the sections, each ending in a period:

- `Focus.` — Engineering, Infrastructure, Learning: one `ListItem` each,
  the title linking to GitHub, swadestack-k8s and the reading list, the
  link's label in the meta slot. Learning jumps to `Reading.`
- `Experience.` — role as the title, company and location as the
  subtitle, years as meta, one paragraph
- `Education.` — school, degree as the subtitle, years as meta
- `Reading.` — `ReadingList`: a row per year, the year in mono on the
  left, that year's books on the right, titles in Geist and authors in
  mono below
- Closing CTA: `Continue to Projects →`

The section data comes from `lib/site.ts` (`docs/03 §6`); the long bio and
its figure are JSX in the page.

### 6.3 Projects `/projects` and `/projects/[slug]`

`PageHeader` (`~/projects`, `Projects.`), then one `ProjectCard` per
project, newest first; within a year, the order in `docs/03 §4`. Every card
is the same window: a mono title bar on `bg-deep` with the index and path
(`01  ~/projects/swadestack`) and the year; then the name as `h2`, the
summary, the stack as hairline mono chips, and `Live ↗` · `Code ↗` ·
`Case study →`, the first two only when the link exists. The frame darkens
to `border-strong` on hover.

Case study page: `PageHeader` with the project's path, title and summary
as the lead; then a spec sheet, a bordered `<dl>` with Year, Stack (chips),
and Live and Code as readable addresses, each link row only when the link
exists; then the MDX body. Each body `h2` after the first opens with a
hairline. Bodies use fixed headings in this order where they fit:
**Problem · Architecture · Decisions · Results · What I'd change**.
Closing CTA: `Continue to Contact →`.

### 6.4 Contact `/contact`

`PageHeader` (`~/contact`, `Contact.`, the contact sentence as the lead),
then one bordered `<dl>`: Email (a `mailto:` link that breaks anywhere
rather than overflow, `docs/04 §3`), one row per social link showing its
address, and Location. Labels are mono, in a fixed column from `sm` and
above their value below it. No form (`docs/06` Q5).

### 6.5 404

Same chrome. `PageHeader` with `404` as the path and `Not found.` as the
title, then a link home.

## 7. Interaction

- Links: `underline-offset-4 decoration-border-strong hover:decoration-brand`
  in prose and value links; nav links have no underline, colour change
  only, except the current page.
- Current page: the nav link whose section contains the path carries
  `aria-current="page"` and is styled `text` with a 2px `brand` underline.
  `/projects/leta` marks Projects.
- Focus: a 2px `brand` outline with a 2px offset on `:focus-visible`, set
  once as a base rule in `globals.css`. Never remove outlines.
- Buttons keep the pointer cursor (a base rule; Tailwind v4's preflight
  gives buttons the default one).
- Theme switch: `data-theme` on `<html>`, set before paint by an inline
  script in `layout.tsx` (reads `localStorage`, falls back to
  `prefers-color-scheme`). `T` cycles themes; the button does the same.
  `transition-colors duration-150` on `body` only.
- Theme button name: it starts with the visible word and ends with the
  theme it switches to (`Theme, switch to White`), so voice control can
  target it by what it shows. The `kbd` is `aria-hidden`;
  `aria-keyshortcuts="T"` announces the shortcut.
- Code blocks in MDX bodies scroll sideways when a line is wider than the
  measure, so each `pre` takes `tabIndex={0}` and scrolls with the arrow
  keys.
- Motion respects `prefers-reduced-motion`. There is almost none to respect.

## 8. Assets

- Favicon: the `/` glyph, a `brand` slash on a Tokyo Night `bg` square, as
  `app/icon.svg` (Next file convention). There is no `favicon.ico`.
- Open Graph image: 1200×630, generated at build with `next/og`, always
  Tokyo Night, no photo. `app/opengraph-image.tsx` is the default card:
  location eyebrow, name, role line, host.
  `app/projects/[slug]/opengraph-image.tsx` replaces it on case studies:
  `Projects · <year>` eyebrow, title, summary, name and host. Both render
  `components/og-card.tsx`: a hairline frame, a `brand` `/` before the
  eyebrow, the title in Geist SemiBold and the rest in Geist Regular. Its
  colours repeat §3.1, because the renderer cannot read CSS variables.
- OG fonts: `next/og` needs font data as TTF or OTF, which `next/font`
  cannot supply, so static Geist Regular and SemiBold TTFs are committed in
  `assets/fonts/` with their OFL licence (`OFL.txt`) and read with
  `readFile` at build. Nothing is fetched.
- Photos: WebP, at most 100 kB each, in `public/figures/`, served through
  `next/image` with a `sizes` value and lazy loading (the `next/image`
  default). There are no project screenshots.
