# 05 — Quality and Testing

A static portfolio has very little behaviour to unit-test and a great deal of
build-time correctness to verify. The strategy follows from that: mechanical
gates that run on every commit, plus a small end-to-end check of the deployed
result. No unit test framework in v1.

## 1. The gates

| Gate       | Command                  | Catches                                                                                    | When   |
| ---------- | ------------------------ | ------------------------------------------------------------------------------------------ | ------ |
| typecheck  | `npm run typecheck`      | wrong `meta` shapes, bad props, missing fields                                             | T1     |
| lint       | `npm run lint`           | `eslint-config-next` rules: a11y basics, `next/image`, hooks                               | T1     |
| format     | `npm run format:check`   | drift from Prettier + Tailwind class order                                                 | T1     |
| build      | `npm run build`          | rendering errors, `ensureStatic` violations, broken MDX, incomplete `generateStaticParams` | T1     |
| smoke      | `npm run test:e2e`       | routes 200, title present, theme toggles, no console errors                                | M4 T13 |
| lighthouse | CI job, see `docs/07 §3` | regressions below the §2 budgets                                                           | M4 T13 |

`package.json` scripts, fixed at T1:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "typecheck": "next typegen && tsc --noEmit",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "check": "npm run typecheck && npm run lint && npm run format:check && npm run build"
  }
}
```

Two details worth knowing. `lint` has no path argument because ESLint 9
with a flat config lints the working directory by default; this is what
`create-next-app` writes. `typecheck` runs `next typegen` first because
`next-env.d.ts` and the route types in `.next/types/` are generated and
git-ignored, so on a clean checkout `tsc` alone would fail before it ever
reached our code.

`npm run check` is what runs before every commit and what CI runs on every
push. The two must stay identical; CI has no extra flags.

## 2. Budgets

Measured on `/` and on `/projects/swadestack`, mobile profile.

| Metric                    | Budget                               |
| ------------------------- | ------------------------------------ |
| Lighthouse Performance    | ≥ 95                                 |
| Lighthouse Accessibility  | ≥ 95 (target 100)                    |
| Lighthouse Best Practices | ≥ 95                                 |
| Lighthouse SEO            | ≥ 95                                 |
| First-load JS, `/`        | < 150 kB gzipped                     |
| Largest image             | < 150 kB                             |
| Fonts                     | 2 families, variable, subset `latin` |

The JS budget is a ceiling on the whole first load, most of which is the
framework. At Next.js 16.4.5 the runtime alone is 138.4 kB gzipped,
measured with both client components removed; the two client components
add 0.9 kB. The ceiling leaves about 11 kB for the site's own client code
and is re-baselined when Next.js is upgraded.

`next build` no longer prints bundle sizes (removed in Next 16), but it
writes the first-load chunks of every route to
`.next/diagnostics/route-bundle-stats.json`. After a build, this prints the
gzipped total per route:

```
node -e 'const z=require("zlib"),fs=require("fs");for(const r of require("./.next/diagnostics/route-bundle-stats.json")){const b=r.firstLoadChunkPaths.reduce((t,p)=>t+z.gzipSync(fs.readFileSync(p)).length,0);console.log(r.route,(b/1000).toFixed(1)+" kB gzipped")}'
```

Run it when a task touches anything client-side, until the Lighthouse job
exists. The stats file is a build diagnostic, not a documented interface;
if it moves, `npx next analyze` shows the same chunks, and what is inside
them, in an interactive view.

## 3. Build-time checks that matter most

- **Static-ness.** `app/layout.tsx` exports `ensureStatic = 'navigation'`
  (ADR-0004), so the build fails if any page or layout needs uncached or
  request-time data, or a dynamic route lacks a complete
  `generateStaticParams`. The route table still shows every page as `○`
  and only `/api/health` as `ƒ`; the difference is that this is now
  enforced rather than eyeballed.
- **Content validation.** `lib/content.ts` throws at build if a file's
  `meta` is missing a required field or has an unknown one. A bad MDX file
  cannot produce a deployed page.
- **Link integrity.** Internal links use typed route strings from
  `lib/routes.ts` (added when there are more than five). Until then, the
  smoke test covers it.

## 4. The smoke test (M4)

Playwright, one spec file, run against `next start` in CI and against the
production URL manually after deploy:

1. Each of the five routes returns 200 and has an `h1`.
2. `/nope` returns 404 with the themed page.
3. Pressing `T` changes `html[data-theme]` and the value survives a reload.
4. No `console.error` on any route.
5. Every `a[href^="http"]` has `rel="noopener"`.

Five assertions, under thirty seconds. It is not a test suite; it is a
tripwire.

## 5. Accessibility review — the non-mechanical part

Once per milestone, by hand:

- Keyboard-only walk of every page. Tab order makes sense; nothing is
  trapped; the skip link works.
- Screen reader pass (Orca on Linux) of the home page and one case study.
- Contrast check of every token pair in both themes with a contrast tool.
- Zoom to 200%. Nothing overflows horizontally.

Findings become tasks, not comments.

## 6. What is not tested

- Component rendering in isolation. The build renders every component on
  every page; a broken component is a broken build.
- Visual regression. Two themes and a dozen components do not justify a
  screenshot pipeline.
- The Kubernetes manifests, beyond `kubectl kustomize` in the GitOps
  workflow (`docs/07 §5`).
- Content accuracy. That is editorial.

## 7. Local workflow

```
npm run dev          # http://localhost:3000, Fast Refresh
npm run check        # before every commit
npm run build && npm run start   # when touching anything in docs/07
```

Neovim: `typescript-language-server` + `eslint` + `tailwindcss-language-server`
via `nvim-lspconfig`; Prettier on save through `conform.nvim` or the ESLint
LSP's fix-all. Formatting on save keeps `format:check` green without
thinking about it.
