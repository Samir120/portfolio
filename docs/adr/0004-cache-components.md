# ADR-0004 — Adopt Cache Components; enforce static output with `ensureStatic`

Status: accepted · 2026-11-04

## Context

`create-next-app` 16.4 scaffolds `next.config.ts` with `cacheComponents:
true` and `partialPrefetching: true` as its recommended default, and the
Next.js docs state that both become mandatory in the next major release.
ADR-0001 and `docs/03 §3` were written against the previous rendering model,
where a route is static unless it touches a dynamic API and the build's
route table is the only check. Under Cache Components the model inverts:
every route is a prerendered static shell, uncached or request-time work
must be cached (`'use cache'`), deferred behind `<Suspense>`, or explicitly
made request-time, and the build validates this.

The portfolio has no request-time work at all. The question is only how to
express "every route is static" in the new model so that it is enforced
rather than observed.

## Decision

- Keep the scaffold defaults: `cacheComponents: true`,
  `partialPrefetching: true`.
- `app/layout.tsx` exports `ensureStatic = 'navigation'`. On the root layout
  it applies to every page and layout in the app. `next build` and
  `next dev` fail if any route needs uncached or runtime data, if a dynamic
  route lacks a complete `generateStaticParams`, or if a `'use cache'` scope
  has a lifetime too short to prerender.
- `lib/content.ts` reads the content directory once at module scope
  (`readdirSync`) and loads bodies with bundler-resolved dynamic
  `import()`. Both are "predictable values" in the Next.js sense and
  prerender without a cache directive. If the `'navigation'` validation
  still reports a read as uncached data, that read moves into a
  `'use cache'` function with `cacheLife('max')`.
- `app/api/health/route.ts` calls `await connection()` before responding.
  Route handlers do not participate in layouts, so `ensureStatic` does not
  cover them; `connection()` is the documented way to make a `GET` handler
  run per request.

## Consequences

- Static-ness becomes a build gate instead of a reading of the route table
  (`docs/05 §3`). A `fetch`, `cookies()` or `headers()` added anywhere under
  the root layout is a failed build, with a source-mapped error in `dev`.
- Route segment config (`export const dynamic`, `revalidate`) is not used.
  The controls in this model are `'use cache'`, `<Suspense>`,
  `connection()` and `ensureStatic`.
- Any `'use cache'` directive is paired with `cacheLife`; an `expire` under
  five minutes fails `'navigation'` validation.
- `ensureStatic` is new in 16.4.0 and the opt-out flags disappear in 17.
  Versions are pinned at what the scaffold installed (`package.json`,
  `.node-version`) and bumped deliberately.
- ADR-0001 is unchanged: the container still runs the standalone Node
  server, which now serves fully prerendered shells.

## Alternatives rejected

- **`--no-cache-components`.** Matches ADR-0001 and `docs/03` as first
  written and costs nothing now. Rejected because the flag is scheduled for
  removal and the migration would land later, with more code to move.
- **Cache Components without `ensureStatic`.** Works, but "every route is
  static" would again be a convention checked by eye in the build table.
