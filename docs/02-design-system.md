# 02 — Design System

The visual language is terminal-inspired: two typefaces, hairline borders,
no rounded corners, and themes named after terminal colour schemes. The
default palette is Tokyo Night; token values below are the exact hex
values, not approximations. Page structure is a one-scroll home and
list-based about, projects and contact pages. This document is the spec;
`app/globals.css` implements it.

## 1. Principles

1. **Flat.** No shadows, no gradients, no rounded corners. Depth comes from
   1px borders and background steps (`bg` → `surface`).
2. **Typography does the work.** Two families, a small scale, generous
   measure. Decoration is a hover state.
3. **Themeable by construction.** Components only reference semantic tokens.
   A theme is a block of CSS variables; adding one touches nothing else.
4. **Dark first, light equal.** Both themes get the same contrast checks.
5. **The one flourish** is the theme picker (`T`). Everything else is still.

## 2. Typography

| Role          | Family                    | Loaded via                            |
| ------------- | ------------------------- | ------------------------------------- |
| `--font-sans` | Geist (variable)          | `next/font/google` → `Geist`          |
| `--font-mono` | JetBrains Mono (variable) | `next/font/google` → `JetBrains_Mono` |

Both are exposed as CSS variables from `app/layout.tsx` (`variable:
'--font-sans'` / `'--font-mono'`) and mapped in Tailwind as `font-sans` and
`font-mono`. Mono is used for: eyebrow labels, dates, stack tags, `kbd`
hints, figure meta lines, the footer location stamp, and code.

Scale (Tailwind classes; nothing custom):

| Element              | Classes                                                      |
| -------------------- | ------------------------------------------------------------ |
| Page title (H1)      | `text-3xl sm:text-4xl font-semibold tracking-tight`          |
| Section heading (H2) | `text-2xl sm:text-[1.75rem] font-semibold tracking-tight`    |
| Sub-heading (H3)     | `text-lg font-semibold`                                      |
| Body                 | `text-[15px] sm:text-base leading-relaxed`                   |
| Secondary            | `text-[15px] text-text-secondary leading-relaxed`            |
| Label / meta         | `font-mono text-xs uppercase tracking-wider text-text-muted` |
| Nav link             | `text-sm text-text-secondary hover:text-text`                |

Section headings end with a period on the about, projects and contact
pages ("About Me.", "Projects.", "Contact."). Home section headings do not.

## 3. Colour tokens

Semantic layer, the only names components may use:

```
bg-deep   page edges / footer band
bg        page background
surface   cards, header when scrolled
surface-2 hover backgrounds
border-subtle  default 1px borders
border-strong  inputs, emphasised dividers
text      primary
text-secondary
text-muted
brand     accent: links on hover, primary button, focus ring
brand-soft 12% brand, for tinted backgrounds
brand-ink text on a brand-filled surface
selection ::selection background
```

### 3.1 Tokyo Night (default, dark)

```css
[data-theme="tokyo-night"] {
  --t-bg-deep: #13141c;
  --t-bg: #1a1b26;
  --t-surface: #1f2230;
  --t-surface-2: #292e42;
  --t-border-subtle: #24283b;
  --t-border-strong: #414868;
  --t-text: #c0caf5;
  --t-text-secondary: #a9b1d6;
  --t-text-muted: #8b93b8;
  --t-brand: #9ece6a;
  --t-brand-soft: #9ece6a1f;
  --t-brand-ink: #0c0e10;
  --t-selection: #292e42;
  color-scheme: dark;
}
```

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
  --t-brand: #6e6e6e;
  --t-brand-soft: #6e6e6e1f;
  --t-brand-ink: #ffffff;
  --t-selection: #c0c0c0;
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

  --radius-*: initial; /* no rounded corners anywhere */
}
```

Usage is then plain Tailwind: `bg-bg text-text border-border-subtle
hover:bg-surface-2`. Contrast: every `text-*` on every `bg-*` pair used must
pass 4.5:1 in both themes. Tokyo Night `text-muted` measures 5.7:1 on `bg`,
5.2:1 on `surface` and 4.45:1 on `surface-2`. The last one fails, so muted
text never sits on a `surface-2` background; don't make the token lighter.

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
  at all times; it only shows once content scrolls under it. Left: `/`
  wordmark (home link, mono, brand colour on hover). Right: Home · About ·
  Projects · Contact · theme button with a `kbd` showing `T`.
- **Skip link:** the first focusable element on every page, a plain
  fragment link `Skip to content` that targets `<main id="main">`. Hidden
  until focused, then shown top-left over the header in `text-sm` on `bg`.
- **Scroll offset:** `<html>` carries `scroll-pt-20`, so whatever the
  browser scrolls into view (a focused link, an anchor, the skip target)
  lands clear of the sticky header. Elements take no `scroll-mt-*` of
  their own.
- **Footer:** `border-t border-border-subtle`, `bg-bg-deep`. Name · © year ·
  "Built with Next.js" · social links · location stamp `STOCKHOLM` in mono
  uppercase.
- **Section spacing:** `py-12 sm:py-16` between home sections; `space-y-4`
  inside a list section.
- **Borders over boxes.** A list item is `border-b border-border-subtle
py-4`, not a card. Cards exist only for project screenshots, and are
  `border border-border-subtle` with the image edge-to-edge and the text in
  `p-4 sm:p-6` below it; `my-6` keeps a card's border clear of its hairline
  neighbours. Photos use `Figure` (§5.1), which follows the same rule.
- **Mobile:** single column always. Below `sm` the header collapses to
  wordmark + a text "Menu" toggle + theme button; no hamburger icon. The
  toggle opens the same nav list in a panel under the header.

## 5. Components

| Component        | Purpose                                                                        |
| ---------------- | ------------------------------------------------------------------------------ |
| `SiteHeader`     | Sticky nav, wordmark, theme button                                             |
| `SiteFooter`     | As above                                                                       |
| `SectionHeading` | H2 + optional one-line description + optional right-side action link           |
| `ListSection`    | Heading + list of `ListItem`                                                   |
| `ListItem`       | title (optionally a link) · meta (mono, right) · subtitle · one paragraph      |
| `ProjectRow`     | Home: name — one line — year                                                   |
| `Bio`            | Home: the short bio, 2–3 sentences, written as JSX                             |
| `ProjectCard`    | Projects page: name, year, summary, stack, links; screenshot when one exists   |
| `Prose`          | Typography wrapper for MDX bodies (`@tailwindcss/typography` mapped to tokens) |
| `Figure`         | Photo or screenshot in a hairline border with a mono meta line below (§5.1)    |
| `FigureGrid`     | Two or three photos as panes in one hairline frame (§5.1)                      |
| `ThemeToggle`    | Client component. Button + `T` key. Persists to `localStorage`.                |
| `MobileMenu`     | Client component. "Menu" button below `sm`; shows the header's nav list.       |
| `Kbd`            | Inline keyboard hint in mono                                                   |
| `ExternalLink`   | `<a>` with `rel="noopener noreferrer"` and a trailing `↗`                      |

Every component is a Server Component unless listed as client. Only
`ThemeToggle` and `MobileMenu` are client components.

### 5.1 Figures

Photos are shown as labelled figures, built from the same tokens as
everything else.

- **`Figure`:** `next/image` with hard corners inside
  `border border-border-subtle`, the image edge-to-edge inside the border.
  Below it sits one meta line in the label style of §2, left-aligned, for
  example `STOCKHOLM · 2024`, with an optional right-aligned index such as
  `01` (the `label` and `index` props). No captions in prose, no shadows,
  no radius, no hover effects. It carries `not-prose`, so inside an MDX
  body the typography plugin leaves it alone. Images load lazily; only an
  LCP image above the fold passes `preload`.
- **`FigureGrid`:** two or three photos as panes in one frame, like a
  tiled window. It renders its own cells rather than nesting `Figure`,
  whose border would double every hairline. The frame is
  `border border-border-subtle` with `gap-px bg-border-subtle`; each cell
  is `bg-bg`, so only the 1px gaps show and every edge is a single line.
  A cell is the image, then the meta line inside the pane (`px-3 py-2`,
  label style, optional right-aligned index). One column on mobile.
  Heights are equal because a grid has one fixed aspect ratio
  (`aspect-[3/2]` by default, `aspect-square` as the option): each image
  is `next/image` `fill` in a `relative` aspect box, `object-cover`, with a
  `sizes` value for one cell's width. It also carries `not-prose`.
- **Treatment:** a uniform `saturate-[.85]`, so photos from different years
  and cameras sit together in both themes. Tokyo Night may add
  `brightness-[.95]`. No grayscale and no colour on hover; the site stays
  still.
- **Rhythm:** at most one `Figure` or `FigureGrid` per section, never two
  in a row, never above the H1 and never in the home hero. A figure never
  exceeds the `max-w-3xl` measure.
- **MDX:** both are mapped in `mdx-components.tsx`, so case studies use the
  same components.

## 6. Pages

### 6.1 Home `/`

1. Eyebrow, mono: `Hi there, I'm`
2. H1: name
3. One line, secondary: the role line from `lib/site.ts`, which is also the
   default description and the line on the Open Graph card
4. Bio, 2–3 sentences
5. Actions: `Get in touch` (brand fill, square) · `About me →` (text link)
6. `Selected projects` — 3–4 `ProjectRow`s, action link `All projects →`
7. `Writing` — `ListItem`s with date right-aligned; hidden until 2 posts
8. Footer

The hero is text-only: no photo anywhere on the home page (`docs/06` Q2).
The bio here stays at 2–3 sentences; the long bio is on the about page.

### 6.2 About `/about`

H1 `About Me.` then the long bio: an unheaded block of two to four
paragraphs directly under the H1. One `FigureGrid` may sit inside it, after
the first or second paragraph and nowhere else in the block.

Then `ListSection`s, each ending in a period:

- `Engineering.` / `Infrastructure.` / `Learning.` — three pillars, one
  paragraph each, a link each (GitHub, swadestack-k8s, reading list).
  Each pillar is a `ListSection` with one `ListItem` whose title is the
  link; the reading list link jumps to the `Reading.` section.
- `Experience.` — role as the title, company and location as the
  subtitle, years as meta, one paragraph
- `Education.` — school, degree as the subtitle, years as meta
- `Reading.` — books/courses with author and year, one line each
- Closing CTA: `Continue to Projects →`

The section data comes from `lib/site.ts` (`docs/03 §6`); the long bio and
its figures are JSX in the page.

Photos appear on this page only as `Figure` or `FigureGrid`, under the
rhythm rule in §5.1.

### 6.3 Projects `/projects` and `/projects/[slug]`

H1 `Projects.` List of `ProjectCard`, newest first; within a year, the
order in `docs/03 §4`. Each: name, year, one paragraph, stack tags in mono,
`Live ↗` · `Code ↗` · `Case study →`, the first two only when the link
exists. A project without a screenshot is a hairline list item like any
other; with one (`meta.image`), its card gains the image and the border of
§4. The image is not a link; the title and `Case study →` already are.

Case study page: H1, meta line (year · stack · links), the screenshot as a
`Figure` when the project has one (meta line `<TITLE> · <YEAR>`, preloaded
as the page's LCP image), then MDX body with fixed headings in this order:
**Problem · Architecture · Decisions · Results · What I'd change**. Closing
CTA: `Continue to Contact →`.

### 6.4 Contact `/contact`

H1 `Contact.` One sentence. The email from `lib/site.ts` as a large mono
`mailto:` link that breaks anywhere rather than overflow (`docs/04 §3`).
Optional one-liner on freelance availability. Then `ListSection`
`Socials.`, one `ListItem` per social link (GitHub, LinkedIn, …). No form
(`docs/06` Q5).

### 6.5 404

Same chrome. Mono `404` as eyebrow, H1 `Not found.`, link home.

## 7. Interaction

- Links: `underline-offset-4 decoration-border-strong hover:decoration-brand`
  in prose; nav links have no underline, colour change only.
- Focus: a 2px `brand` outline with a 2px offset on `:focus-visible`, set
  once as a base rule in `globals.css`. Never remove outlines.
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
  eyebrow, the title in Geist SemiBold and the rest in Geist Regular.
- OG fonts: `next/og` needs font data as TTF or OTF, which `next/font`
  cannot supply, so static Geist Regular and SemiBold TTFs are committed in
  `assets/fonts/` with their OFL licence (`OFL.txt`) and read with
  `readFile` at build. Nothing is fetched.
- Project screenshots: 1600×1000 WebP, under 150 kB each, in
  `public/projects/<slug>.webp`, served through `next/image`. A project
  declares its screenshot as `meta.image` (`src`, `alt`); the build fails
  if the file is missing.
- Photos: WebP, at most 100 kB each, in `public/figures/`, served through
  `next/image` with a `sizes` value and lazy loading (the `next/image`
  default). `Figure` passes explicit `width` and `height`; `FigureGrid`
  uses `fill` inside its fixed aspect box. Until the real photos exist,
  placeholder files stand in and their meta lines read `TODO:`.
