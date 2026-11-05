# 06 — Roadmap

Four milestones, fourteen tasks, one task at a time. A milestone is "done"
when every task in it is committed and CI is green; a task is "done" when
its exit criteria hold on `main`. Weeks assume evenings and weekends; they
are an ordering, not a deadline.

Each task below lists the files it touches so it can be scoped from this
document alone. Open questions are collected at the end; a task that
decides one says so.

## M1 · Weeks 1–2 — Scaffold and chrome

Goal: an empty but _finished-looking_ site. Header, footer, theme, fonts,
tokens, CI. Nothing to read yet.

### T1 — Repo, scaffold, tooling, CI skeleton

- `create-next-app` per `docs/07 §2`; commit the scaffold first.
- Prettier + Tailwind plugin, `typecheck` and `check` scripts, `.node-version`,
  `.editorconfig`, `tsconfig` strict additions.
- `.github/workflows/ci.yml` with typecheck, lint, format, build.
- README from `docs/`, MIT LICENSE, `docs/` itself.
- Exit: `npm run check` green locally and in CI.

### T2 — Design tokens, fonts, layout, header, footer, theme toggle

- `app/globals.css` per `docs/02 §3`; `app/layout.tsx` with `next/font`,
  theme script, `suppressHydrationWarning`, and
  `export const ensureStatic = 'navigation'` (ADR-0004).
- `components/site-header.tsx`, `mobile-menu.tsx`, `site-footer.tsx`,
  `theme-toggle.tsx`, `kbd.tsx`, `external-link.tsx`; `lib/themes.ts`,
  `lib/site.ts`.
- `app/not-found.tsx`.
- Exit: both themes render, `T` toggles, no flash on reload, keyboard
  reachable, contrast verified. Build passes the `ensureStatic` validation.

### T3 — Home page

- `app/page.tsx` composed from `components/section-heading.tsx`,
  `project-row.tsx`, `bio.tsx`; data from `lib/site.ts` and a temporary
  `lib/projects.ts` array (replaced in T4).
- Decide Q2 (photo).
- Exit: home matches `docs/02 §6.1` with `TODO:` copy. First-load JS under
  budget.

## M2 · Weeks 3–4 — Content

Goal: the real pages, with the real pipeline.

### T4 — MDX pipeline and projects list

- `next.config.ts` with `@next/mdx`, `mdx-components.tsx`, `lib/types.ts`,
  `lib/content.ts` (`listProjects`, `getProject`, validation). Reads per
  ADR-0004: directory listing at module scope, bodies via `import()`;
  `'use cache'` + `cacheLife('max')` only if the `ensureStatic` validation
  asks for it.
- `content/projects/*.mdx` stubs with `meta` for every project.
- `app/projects/page.tsx`, `components/project-card.tsx`; home switches to
  `listProjects({ featured: true })`; delete `lib/projects.ts`.
- Decide Q3 (rows vs cards).
- Exit: adding an MDX file adds a project everywhere without code changes;
  a bad `meta` fails the build.

### T5 — Case study route and the SwadeStack write-up

- `app/projects/[slug]/page.tsx` with `generateStaticParams`,
  `generateMetadata`; `components/prose.tsx` with
  `@tailwindcss/typography` mapped to tokens.
- `content/projects/swadestack.mdx` written in full: Problem, Architecture,
  Decisions, Results, What I'd change. Screenshot in `public/projects/`.
- `components/figure.tsx` per `docs/02 §5.1`, mapped in
  `mdx-components.tsx`; the case study's screenshot is its first use.
- Exit: `/projects/swadestack` static, readable, under budget.

### T6 — About page

- `app/about/page.tsx`, `components/list-section.tsx`, `list-item.tsx`;
  long bio and sections per `docs/02 §6.2`.
- `components/figure-grid.tsx` per `docs/02 §5.1`, mapped in
  `mdx-components.tsx`; placeholder photos in `public/figures/`.
- Exit: all sections present; copy may be `TODO:` except Experience and
  Education.

### T7 — Contact page

- `app/contact/page.tsx`; `mailto:` link, socials from `lib/site.ts`.
- Exit: page complete. Q5 closed.

## M3 · Weeks 5–6 — Polish

Goal: everything a search engine, a link preview, or a screen reader needs.

### T8 — Metadata, OG images, sitemap, robots

- `metadata` on every route with canonical URLs from `NEXT_PUBLIC_SITE_URL`.
- `app/opengraph-image.tsx` and `app/projects/[slug]/opengraph-image.tsx`
  via `next/og`; `app/sitemap.ts`, `app/robots.ts`, `app/icon.svg`.
- Exit: a shared link to any route shows a correct card; `/sitemap.xml`
  lists every page.

### T9 — Accessibility and responsive pass

- Keyboard walk, screen reader pass, contrast audit, 200% zoom, mobile menu
  behaviour. Fix everything found.
- `prefers-reduced-motion` honoured.
- Exit: Lighthouse Accessibility 100 locally on all routes.

### T10 — Writing route (hidden) and copy pass

- `app/writing/page.tsx`, `[slug]/page.tsx` sharing the MDX pipeline;
  excluded from nav and sitemap until two posts exist.
- Replace every remaining `TODO:` in copy.
- Decide Q4.
- Exit: no `TODO:` left on any public page.

## M4 · Weeks 7–8 — Ship

Goal: running on the cluster at the real domain, with the pipeline that will
deploy every future commit.

### T11 — Dockerfile, health route, image build in CI

- `next.config.ts` `output: 'standalone'`; `Dockerfile` per `docs/07 §4`;
  `.dockerignore`; `app/api/health/route.ts` with `await connection()` so
  the handler runs per request (ADR-0004).
- `ci.yml` gains the `build-image` job: GHCR login, buildx, push
  `:<sha>` on `main` only.
- Exit: image runs locally with `docker run -p 3000:3000`; `/api/health`
  200; image under 200 MB; pushed to GHCR from CI.

### T12 — GitOps: manifests, Argo application, Cloudflare hostname

- In `swadestack-k8s`: `apps/portfolio/base/{deployment,service,
kustomization}.yaml`, `apps/portfolio/overlays/production/{namespace,
ingress,kustomization}.yaml`, `argocd/applications/portfolio.yaml`,
  registered in `argocd/applications/kustomization.yaml`.
- Cloudflare: tunnel public hostname for the chosen subdomain → Traefik.
- `ci.yml` gains the `deploy` job that seds `newTag` in the production
  overlay and pushes with the rebase loop, under the shared
  `swadestack-gitops-writer` concurrency group.
- Decide Q1 (subdomain) before starting.
- Exit: Argo shows `Synced/Healthy`; the five routes return 200 at the
  subdomain; a push to `main` reaches production without manual steps.

### T13 — Smoke test and Lighthouse budget

- Playwright spec per `docs/05 §4`; `lighthouse` job per `docs/07 §3`.
- Exit: both green in CI; budgets from `docs/05 §2` met on production.

### T14 — README, docs reconciliation, v1 tag

- README reflects reality (badges live, status "live", screenshot).
- Every `docs/` file re-read against the code; drift fixed in docs or code.
- `git tag v1.0.0`.
- Exit: `docs/01 §5` criteria all true.

## Ordering rationale

- **Chrome before content (M1 before M2)** because the content pipeline
  needs somewhere to render, and because an empty-but-finished site is
  deployable the moment T11–T12 land — the deploy tasks could be pulled
  forward after M1 if seeing it live would help motivation.
- **Pipeline before pages (T4 before T5–T7)** so that every page written
  afterwards uses the real data path and nothing has to be migrated.
- **Deployment last, not first,** per the stated plan: CD happens once the
  product is ready. The Dockerfile and manifests are unchanged by anything
  in M2–M3, so nothing is lost by waiting. If that changes, T11 moves.
- **Tests last** because the smoke test needs a production-like target and
  the budget needs real content to measure.

## Risk register

| Risk                                                                    | Likelihood | Mitigation                                                                    |
| ----------------------------------------------------------------------- | ---------- | ----------------------------------------------------------------------------- |
| Tailwind v4 / `@theme inline` does not behave as `docs/02 §3.3` expects | Low        | T2 verifies theme switch before anything is built on it                       |
| `ensureStatic` validation rejects the content reads in `lib/content.ts` | Low        | `'use cache'` + `cacheLife('max')` fallback is already decided (ADR-0004)     |
| `@next/mdx` dynamic import pattern changes between Next versions        | Low        | Pin to what `create-next-app` installs; follow the docs page for that version |
| Copy never gets written                                                 | High       | T10 has "no `TODO:`" as its exit; the site is not v1 without it               |
| Cluster/Pi availability during T12                                      | Medium     | Nothing in T12 is destructive; retry when the cluster is up                   |
| Scope creep (blog, i18n, animations)                                    | High       | Non-goals in `docs/01 §4`; candidates list below                              |

## After v1 — candidates, not commitments

- Swedish translation with a header toggle.
- More themes (Catppuccin, Nord, Gruvbox) as `[data-theme]` blocks.
- `/writing` made public once two posts exist.
- `/uses` page (tools, editor config) — cheap and popular with developers.
- A `/now` page.
- Plausible or Umami analytics, self-hosted on the cluster.

## Open questions

Referenced from the other docs as `docs/06 Qn`. Each is closed by the task
that names it; the decision then lives in that task's commit and, if it
changes a rule, in an ADR.

- **Q1 Subdomain.** `samir.swadestack.com` (default) vs
  `portfolio.swadestack.com` vs a `www`-style separate zone. Decide before
  T12; affects nothing before that.
- **Q2 Photo in hero.** No photo in the hero or anywhere on the home page.
  Photos appear on the about page as labelled figures (`docs/02 §5.1`).
  Closed at T3.
- **Q3 Home projects: cards with screenshots or text rows.** Default: text
  rows until screenshots exist, then revisit. Decide at T4.
- **Q4 Writing section.** Ship hidden until two posts exist. Decide at T10.
- **Q5 Contact form vs `mailto:`.** Default: `mailto:` link + socials. A form
  would need an API route and spam handling; not worth it in v1. Closed at
  T7.
