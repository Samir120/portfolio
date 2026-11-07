# 03 — Architecture

## 1. The one idea

The portfolio is a **static site that happens to be served by Next.js**.
Every route is prerendered at build time from files in the repository. The
Node server in the container exists because `output: 'standalone'` is the
framework's supported Docker path (ADR-0001), not because anything is
computed per request. If the server crashed on every request after the first
byte, nobody would notice, because there is no second request that matters.

This is enforced, not assumed. The root layout exports
`ensureStatic = 'navigation'` (ADR-0004), so `next build` fails if any page
or layout ever needs uncached or request-time data.

Consequences:

- No database, no environment-dependent behaviour, no secrets at runtime.
  The image for commit `abc123` behaves identically everywhere.
- The content pipeline is the architecture. Get `content/` → typed metadata →
  pages right, and the rest is layout.
- Performance is a build-time property. Measure it from the build output
  (`docs/05 §2`) and with Lighthouse, not with APM.

## 2. Repository layout

```
portfolio/
├── app/                      # Next.js App Router — routes and route-level files only
│   ├── layout.tsx            # root: fonts, theme script, header, footer, ensureStatic
│   ├── page.tsx              # /
│   ├── globals.css           # tokens, @theme inline, base styles
│   ├── icon.svg              # favicon (file convention)
│   ├── opengraph-image.tsx   # default OG image (file convention)
│   ├── sitemap.ts            # file convention
│   ├── robots.ts             # file convention
│   ├── not-found.tsx
│   ├── about/page.tsx
│   ├── contact/page.tsx
│   ├── projects/
│   │   ├── page.tsx
│   │   └── [slug]/
│   │       ├── page.tsx      # generateStaticParams + dynamic MDX import
│   │       └── opengraph-image.tsx
│   ├── writing/              # M3, ships hidden
│   └── api/health/route.ts   # GET 200 for k8s probes (M4)
├── components/               # shared UI, flat; one component per file
│   ├── site-header.tsx
│   ├── mobile-menu.tsx       # 'use client'
│   ├── site-footer.tsx
│   ├── section-heading.tsx
│   ├── list-section.tsx
│   ├── list-item.tsx
│   ├── project-row.tsx
│   ├── project-card.tsx
│   ├── bio.tsx
│   ├── figure.tsx
│   ├── figure-grid.tsx
│   ├── prose.tsx
│   ├── theme-toggle.tsx      # 'use client'
│   ├── kbd.tsx
│   └── external-link.tsx
├── content/                  # the site's data — MDX and TS, no JSX layout
│   ├── projects/
│   │   ├── swadestack.mdx
│   │   └── …
│   └── writing/
├── lib/                      # pure TS, no React
│   ├── site.ts               # name, role, socials, location, email
│   ├── content.ts            # readdir + import + sort; the only fs user
│   ├── project-module.ts     # validates an imported MDX module (ADR-0005)
│   ├── themes.ts             # theme ids and labels
│   └── types.ts              # ProjectMeta, PostMeta
├── public/
│   ├── projects/*.webp
│   ├── figures/*.webp
│   └── cv.pdf
├── docs/                     # these documents, public
├── .github/workflows/ci.yml
├── Dockerfile                # M4
├── next.config.ts
├── mdx-components.tsx        # required by @next/mdx, root level
├── package.json
├── tsconfig.json
├── eslint.config.mjs
├── prettier.config.mjs
├── .node-version
├── .editorconfig
├── LICENSE
└── README.md
```

Rules that keep this layout honest:

- `app/` contains only what the router needs: `page`, `layout`, file
  conventions. Anything reusable goes to `components/`.
- `components/` is flat. If it needs subfolders, the site has grown past a
  portfolio and that is a separate decision.
- `lib/` imports nothing from React. It is testable with plain Node.
- `content/` is data. It never imports from `components/`; MDX bodies get
  their components from `mdx-components.tsx`.
- Path alias `@/*` → repo root (create-next-app default). No relative
  `../../` imports across top-level folders.
- Nothing in the tree is generated. `next-env.d.ts` and `.next/` are
  git-ignored and recreated by `next typegen` / `next build`;
  `agentRules: false` in `next.config.ts` keeps `next dev` from writing
  anything else into the repository.

## 3. Rendering model

Cache Components is on (`cacheComponents: true`, ADR-0004). Every route is
rendered to a static shell at build time; anything that cannot be
prerendered has to be cached, deferred, or explicitly made request-time.

| Route                                  | Rendering                             | Why                                |
| -------------------------------------- | ------------------------------------- | ---------------------------------- |
| `/`, `/about`, `/contact`, `/projects` | Static, build time                    | Content is in the repo             |
| `/projects/[slug]`                     | Static via `generateStaticParams`     | One page per MDX file              |
| `/api/health`                          | Request-time via `await connection()` | Probes need a live 200, not a file |
| `opengraph-image`                      | Static per route                      | `next/og` at build                 |
| `sitemap.xml`, `robots.txt`            | Static                                | File conventions                   |

All pages are Server Components. There is no `fetch()` anywhere. The two
client components (`ThemeToggle`, `MobileMenu`) receive no data: the first
touches `document` and `localStorage`, the second holds the menu's open
state. The only other client code is the framework's: `next/image` ships
its own client component (`docs/05 §2`).

One value is cached: the copyright year in `SiteFooter`. A prerendered
route may not read the clock, so the year comes from a `'use cache'`
function with `cacheLife('max')`. The footer is in the root layout, so the
build's route table lists every page with `Revalidate 30d` and `Expire 1y`.
Pages are still prerendered; the server refreshes them in the background at
most once every 30 days, which is also how the year rolls over without a
deploy.

`app/layout.tsx` exports `ensureStatic = 'navigation'`. On the root layout
it covers every page and layout: `next build` and `next dev` fail if a
route reads uncached data, runtime data (`cookies()`, `headers()`,
`searchParams`), or lacks a complete `generateStaticParams`. Route handlers
sit outside the layout tree, which is why `/api/health` can opt into
request-time rendering with `connection()` without touching the rule.

`dynamicParams` is route segment config and is not available under Cache
Components, so `/projects/[slug]` rejects an unknown slug by calling
`notFound()` in the page. That request renders once, returns `404` with
`noindex`, and is cached like any other path. The not-found UI for it
arrives in the RSC payload, so without JavaScript the response body is
empty; the top-level 404 (`/_not-found`) is prerendered and unaffected.

## 4. Content pipeline (ADR-0002, ADR-0005)

```
content/projects/swadestack.mdx
  export const meta = { title, summary, year, stack, links, featured, order?, image? }
  # Problem … ## Architecture … (body)
        │
        ▼
lib/content.ts
  readdirSync at module scope → slugs, and public/projects/ → screenshots
  listProjects()   dynamic import of each file → parseProjectModule → sort
  getProject(slug) dynamic import of one file → { meta, Body }
        │
        ▼
app/projects/[slug]/page.tsx
  generateStaticParams() ← listProjects()
  generateMetadata()     ← meta
  default export         ← <Figure> (meta.image) + <Prose><Body /></Prose>
```

- Metadata is a **named export from the MDX file**, a plain JavaScript
  object: MDX cannot contain TypeScript syntax and `tsc` does not read
  `.mdx`. `lib/project-module.ts` narrows each imported module from
  `unknown` to a `ProjectMeta` and an MDX body, and throws with the file
  and field on a missing, mistyped or unknown field, so a typo fails the
  build instead of leaving a missing line on the page (ADR-0005). No
  frontmatter, no `gray-matter`, no remote MDX. This is the pattern
  documented under "Using dynamic imports" on the Next.js MDX page.
- `meta.image` (`src`, `alt`) declares a screenshot. The guard checks its
  shape; `lib/content.ts` fails the build if the file is not in
  `public/projects/`.
- Bodies are CommonMark plus GitHub Flavored Markdown (tables) through
  `remark-gfm`, passed to `createMDX` by name because Turbopack cannot
  receive JavaScript functions.
- Order is newest first by `year`. Within a year, projects with the
  optional `order` field come first, lowest first; the rest follow in
  title order.
- `lib/content.ts` is the only module that reads the filesystem. The
  directory listing happens once at module scope and the bodies are
  bundler-resolved `import()`s, both "predictable values" that Cache
  Components prerenders without a cache directive. Should the
  `ensureStatic` validation report a read as uncached data, that read moves
  into a `'use cache'` function with `cacheLife('max')` (ADR-0004).
- It is imported by Server Components only, never by client code; the
  `server-only` import at its top enforces that.
- Slug = filename. Renaming a file renames the URL; that is intentional and
  the sitemap follows.
- MDX bodies use a fixed heading order for case studies (`docs/02 §6.3`).
  Not enforced mechanically in v1.

## 5. Theming (ADR-0003)

```
<html data-theme="tokyo-night">        set by inline script before first paint
  :root / [data-theme=…] --t-* vars    globals.css
  @theme inline --color-* → var(--t-*) Tailwind utilities
  <ThemeToggle />                      sets data-theme + localStorage; listens for T
```

- The inline script in `layout.tsx` is the only `dangerouslySetInnerHTML` in
  the codebase. It is ~10 lines, has no dependencies, and exists solely to
  avoid a flash of the wrong theme. It reads `localStorage.theme`, falls back
  to `prefers-color-scheme`, and sets the attribute.
- `color-scheme` is set per theme so native form controls and scrollbars
  match.
- `suppressHydrationWarning` on `<html>` is required and documented: the
  server renders the default attribute, the script may change it before
  React hydrates.

## 6. Data flow for `lib/site.ts`

One file holds every fact about the person: name, role line, socials,
location, email, CV path. Every page imports from it. Changing the role
line is a one-line change in one file. Nothing in `app/` contains a
hard-coded personal fact.

The bio is the one exception to "one file". It is prose with inline links,
so it is written as JSX in a Server Component (`components/bio.tsx`)
instead of as strings in `lib/site.ts` that would need a parser. `lib/`
stays free of React.

## 7. What is deliberately absent

- **No state management, no context providers** except what `next/font`
  needs. Theme state lives in the DOM attribute.
- **No `src/` directory.** Flat root is the create-next-app default and the
  repo is small.
- **No barrel files** (`components/index.ts`). They defeat tree-shaking
  signals and make imports vague.
- **No environment variables at runtime.** `NEXT_PUBLIC_SITE_URL` is the one
  build-time variable, used for absolute URLs in metadata and sitemap, with a
  default in `lib/site.ts`.
- **No middleware.** Nothing to redirect, nothing to protect.
- **No route segment config.** `export const dynamic`, `revalidate` and
  friends belong to the previous rendering model. Under Cache Components
  the controls are `'use cache'`, `<Suspense>`, `connection()` and
  `ensureStatic` (ADR-0004).
- **No generated files.** See §2. The repository contains only what was
  written for it.

## 8. Boundaries with the rest of the platform

```
Samir120/portfolio          app code, Dockerfile, CI → ghcr.io/samir120/portfolio:<sha>
Samir120/swadestack-k8s     apps/portfolio/{base,overlays/production} + argocd/applications/portfolio.yaml
Cloudflare (dashboard)      tunnel public hostname <sub>.swadestack.com → Traefik
k3s                         namespace portfolio, 1 replica, 128Mi limit
```

The app repo never contains Kubernetes manifests; the GitOps repo never
contains app code. Same rule as SwadeStack. Details in `docs/07`.
