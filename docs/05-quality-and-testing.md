# 05 — Quality and Testing

A static portfolio has very little behaviour to unit-test and a great deal of
build-time correctness to verify. The strategy follows from that: mechanical
gates that run on every commit, plus a small end-to-end check of the deployed
result. No unit test framework in v1.

## 1. The gates

| Gate       | Command                  | Catches                                                                                                    | When   |
| ---------- | ------------------------ | ---------------------------------------------------------------------------------------------------------- | ------ |
| typecheck  | `npm run typecheck`      | bad props, missing fields, wrong types in `.ts`/`.tsx`                                                     | T1     |
| lint       | `npm run lint`           | `eslint-config-next` rules: a11y basics, `next/image`, hooks                                               | T1     |
| format     | `npm run format:check`   | drift from Prettier + Tailwind class order                                                                 | T1     |
| build      | `npm run build`          | rendering errors, `ensureStatic` violations, broken MDX, invalid `meta`, incomplete `generateStaticParams` | T1     |
| smoke      | `npm run test:e2e`       | routes 200, title present, theme toggles, no console errors                                                | M4 T13 |
| lighthouse | CI job, see `docs/07 §3` | regressions below the §2 budgets                                                                           | M4 T13 |

`package.json` scripts, fixed at T1:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "start:standalone": "cp -r public .next/standalone/ && cp -r .next/static .next/standalone/.next/ && HOSTNAME=0.0.0.0 node .next/standalone/server.js",
    "lint": "eslint",
    "typecheck": "next typegen && tsc --noEmit",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "test:e2e": "playwright test",
    "check": "npm run typecheck && npm run lint && npm run format:check && npm run build"
  }
}
```

Two details worth knowing. `lint` has no path argument because ESLint 9
with a flat config lints the working directory by default; this is what
`create-next-app` writes. `typecheck` runs `next typegen` first because
`next-env.d.ts` and the route types in `.next/types/` are generated and
git-ignored, so on a clean checkout `tsc` alone would fail before it ever
reached our code. `start:standalone` runs the server the image runs:
`.next/standalone` leaves out `public/` and `.next/static`, so they are
copied in first, and `HOSTNAME` is set as the Dockerfile sets it. `next
start` warns that it does not work with `output: 'standalone'`, so nothing
that tests the build uses it.

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
add 0.9 kB. `next/image` adds 5.8 kB, and it reaches every route that
loads an MDX module, `/` included: each module imports
`mdx-components.tsx`, which maps `Figure`. `/` and `/about` also render
a photo directly. A generated image route in the root
segment (`app/opengraph-image.tsx`) adds 1.0 kB to every route: none of
it is image code; Turbopack moves the layout's client components into a
chunk of their own. A committed static PNG would cost nothing, but the
card is generated (`docs/02 §8`). The theme re-apply in `ThemeToggle`
(`docs/03 §5`) adds 0.1 kB, and the nav links rendered by `MobileMenu`
so it can mark the current page add 0.2 kB. Those parts were each
measured when they landed. First load, measured as a whole, is 145.9 kB
on `/`, `/about`, `/projects` and `/projects/[slug]`, and 140.3 kB on
`/contact` and `/_not-found`, which leaves about 4 kB under the ceiling.
The numbers are re-baselined when Next.js is upgraded.

`next build` no longer prints bundle sizes (removed in Next 16), but it
writes the first-load chunks of every route to
`.next/diagnostics/route-bundle-stats.json`. After a build, this prints the
gzipped total per route:

```
node -e 'const z=require("zlib"),fs=require("fs");for(const r of require("./.next/diagnostics/route-bundle-stats.json")){const b=r.firstLoadChunkPaths.reduce((t,p)=>t+z.gzipSync(fs.readFileSync(p)).length,0);console.log(r.route,(b/1000).toFixed(1)+" kB gzipped")}'
```

Run it when a task touches anything client-side. The `lighthouse` job
(`docs/07 §3`) also guards the ceiling, with
`resource-summary:script:size`. That is bytes on the wire, HTTP headers
included: 148.7 kB against the standalone server and 149.7 kB through
Cloudflare, so the job turns red about 1.3 kB before the gzipped total above
reaches the ceiling. Lighthouse has no audit for the largest image; the job
asserts total image bytes under the same limit, which is stricter. The
stats file is a build diagnostic, not a documented interface;
if it moves, `npx next analyze` shows the same chunks, and what is inside
them, in an interactive view.

## 3. Build-time checks that matter most

- **Static-ness.** `app/layout.tsx` exports `ensureStatic = 'navigation'`
  (ADR-0004), so the build fails if any page or layout needs uncached or
  request-time data, or a dynamic route lacks a complete
  `generateStaticParams`. The route table still shows every page as `○`
  and only `/api/health` as `ƒ`; the difference is that this is now
  enforced rather than eyeballed. Image routes sit outside the rule
  (`docs/03 §3`): check that `opengraph-image` stays `○` and each
  case-study image `●`.
- **Content validation.** `lib/project-module.ts` throws at build if a
  file's `meta` is missing a required field, has a field of the wrong type
  or has an unknown one, and the error names the file and the field
  (ADR-0005). `tsc` cannot do this: it does not read `.mdx`. A bad MDX
  file cannot produce a deployed page.
- **Link integrity.** Internal links use typed route strings from
  `lib/routes.ts` (added when there are more than five). Until then, the
  smoke test covers it.

## 4. The smoke test (M4)

Playwright, one spec file (`tests/smoke.spec.ts`), Chromium only, run
against the standalone server in CI and against the production URL manually
after deploy:

1. Each of the five routes returns 200 and has an `h1`.
2. `/nope` returns 404 with the themed page.
3. Pressing `T` changes `html[data-theme]` and the value survives a reload.
4. No `console.error` on any of the five routes. `/nope` is left out:
   Chrome logs every `404` response as a console error.
5. Every `a[href^="http"]` has `rel="noopener"`.

Five assertions, under thirty seconds. It is not a test suite; it is a
tripwire.

```
npm run build && npm run test:e2e
PLAYWRIGHT_BASE_URL=https://samir.swadestack.com npm run test:e2e
```

Playwright starts the standalone server itself unless
`PLAYWRIGHT_BASE_URL` is set. A failing smoke job stops the image from being
built (`docs/07 §3`).

## 5. Accessibility review — the non-mechanical part

Once per milestone, by hand:

- Keyboard-only walk of every page. Tab order makes sense; nothing is
  trapped; the skip link works. Shift+Tab back up a long page: focus
  never disappears under the sticky header. Code blocks take focus and
  scroll with the arrow keys.
- Screen reader pass (Orca on Linux) of the home page and one case study.
- Contrast check of every token pair in both themes with a contrast tool.
- Zoom to 200%. Nothing overflows horizontally.
- Lighthouse Accessibility, mobile profile, against the standalone server
  or production, every route in both themes. Lighthouse does not score a `404` response; check
  the two not-found pages by hand, in both themes. An automated contrast
  check of `/projects/<unknown>` must wait for the page's transitions to
  finish: it fades from the browser's blank canvas to the theme
  (`docs/03 §3`), and mid-fade Tokyo Night text fails against a background
  that is still light.

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
npm run build && npm run start:standalone   # when touching anything in docs/07
npm run test:e2e     # after a build
```

Neovim: `typescript-language-server` + `eslint` + `tailwindcss-language-server`
via `nvim-lspconfig`; Prettier on save through `conform.nvim` or the ESLint
LSP's fix-all. Formatting on save keeps `format:check` green without
thinking about it.
