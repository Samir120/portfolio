# ADR-0001 — Ship a `standalone` Node server, not a static export

Status: accepted · 2026-11-03 · image size corrected to the measured value at T11

## Context

Every route on the site is prerendered at build time (`docs/03 §3`). Next.js
offers two ways to ship that: `output: 'export'`, which writes plain HTML
and assets to `out/` and needs no Node at runtime, and `output:
'standalone'`, which traces the build into a minimal Node server for
Docker. The existing SwadeStack frontend ships as static files behind
nginx, so `export` would be the consistent choice.

## Decision

`output: 'standalone'`, served by Node in the container, using the official
`with-docker` example as the Dockerfile.

## Consequences

- Every Next.js feature stays available: `next/image` optimisation without a
  custom loader, `next/og` image generation, route handlers (`/api/health`),
  `generateMetadata`, future server actions if a contact form is ever
  built. `export` disables or complicates each of these.
- The project exercises the framework the way it is used in production
  elsewhere, which is the learning goal. A static export would teach less.
- The image is 78 MB compressed and 225 MB unpacked, measured at T11, against
  about 40 MB for nginx and static files, and uses ~60 MB RAM instead of
  ~5 MB. On a cluster that already runs PostgreSQL and a Node backend this is
  noise.
- A health endpoint is needed for probes; nginx would have answered on `/`.
- Pages are still static files inside `.next/`; the server only streams
  them. Nothing is computed per request.

## Alternatives rejected

- **`output: 'export'` behind nginx**, matching SwadeStack. Rejected for the
  feature loss above and because the one thing it optimises (image size) is
  not a constraint.
- **Vercel hosting.** Zero-ops and free, but the point of this project is
  the self-hosted pipeline; the deployment is part of the portfolio.
- **Cloudflare Pages / OpenNext.** Would use the zone already in place, but
  adds an adapter layer that departs from the documented Next.js path and
  from the k3s/Argo workflow the rest of the platform uses.
