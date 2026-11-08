# 07 — Release Engineering

How a commit becomes a page at the subdomain. The shape is the SwadeStack
pipeline with one app, one environment and no database: quality gates →
image on GHCR tagged by commit SHA → a one-line change in `swadestack-k8s` →
Argo CD syncs → Traefik serves it → Cloudflare tunnel exposes it.

CI (§3) exists from T1, the image (§4) from T11, and the deployment (§5–§8)
from T12.

## 1. Versioning

- `main` is the only long-lived branch and is always deployable.
- The deployable unit is the commit SHA. Image tags are the full 40-character
  SHA, never `latest`, never a branch name.
- Git tags `v1.0.0`, `v1.1.0`… mark milestones for humans. Nothing in the
  pipeline reads them.
- Node is pinned in `.node-version`; Next, React and Tailwind in
  `package.json`. All are bumped deliberately in their own `chore:` commits.

## 2. Scaffold (T1)

```sh
npx create-next-app@latest portfolio \
  --typescript --tailwind --eslint --app \
  --no-src-dir --import-alias "@/*" --use-npm \
  --no-agents-md --no-agent-feedback --disable-git
cd portfolio
git init -b main
```

Accept the defaults for anything it still asks (Cache Components on, React
Compiler off). `--disable-git` is there so the first commit carries the
message below rather than the generator's own. The scaffold goes in as the
first commit (`chore: scaffold with create-next-app`) with one line added to
`next.config.ts`, `agentRules: false`, so that every later diff is
reviewable against the official starting point and nothing is ever
generated into the tree (`docs/03 §2`). The tooling from `docs/05 §1`
follows in a second commit.

Node: the current **Active LTS** from nodejs.org at T1, which was 26.
Pinned once:

```
# .node-version
26
```

`setup-node` reads this file; the Dockerfile repeats the major in
`ARG NODE_VERSION` — the one place it is duplicated, so a Node bump touches
both files.

## 3. CI — `.github/workflows/ci.yml`

Runs on every push and pull request. Six jobs in parallel: four quality
gates, `smoke` and `lighthouse`. The image job (M4) waits for the gates and
`smoke`, and runs on `main` only.

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

permissions:
  contents: read

env:
  NEXT_PUBLIC_SITE_URL: https://samir.swadestack.com

jobs:
  typecheck:
    name: typecheck
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v7
        with:
          node-version-file: .node-version
          cache: npm
      - run: npm ci
      - run: npm run typecheck

  lint:
    name: lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v7
        with:
          node-version-file: .node-version
          cache: npm
      - run: npm ci
      - run: npm run lint

  format:
    name: format
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v7
        with:
          node-version-file: .node-version
          cache: npm
      - run: npm ci
      - run: npm run format:check

  build:
    name: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v7
        with:
          node-version-file: .node-version
          cache: npm
      - run: npm ci
      - run: npm run build
```

Added in M4, after the four gates:

- `build-image` — `needs: [typecheck, lint, format, build, smoke]`, `main`
  only.
  `docker/setup-buildx-action`, `docker/login-action` (GHCR, `GITHUB_TOKEN`,
  with `packages: write` at job level; job-level `permissions` replace the
  workflow's, so `contents: read` is repeated),
  `docker/build-push-action` with `tags: ghcr.io/samir120/portfolio:${{
github.sha }}` and `cache-from`/`cache-to: type=gha`. See §4.
- `deploy` — `needs: build-image`. Seds `newTag` in `swadestack-k8s` and
  pushes with the rebase loop. See §5.
- `smoke` — `npm run build`, `npx playwright install --with-deps chromium`,
  `npm run test:e2e` against the standalone server. `docs/05 §4`. It gates
  `build-image`.
- `lighthouse` — `npm run build`, then `treosh/lighthouse-ci-action@v12` with
  `configPath: ./lighthouserc.json` and `uploadArtifacts: true`.
  `startServerCommand` in that file starts the standalone server; its
  assertions are the `docs/05 §2` budgets on `/` and `/projects/swadestack`,
  mobile, three runs, Performance on the median run. `budgetPath` stays unset:
  the action ignores the file's assertions if it is set. The job does not gate
  `build-image`: a red score fails the run, but a score from a shared runner
  is too noisy to hold back a deploy.

Action major versions match the ones already in use in the SwadeStack
workflows (`checkout@v6`, `setup-node@v7`, `setup-buildx-action@v4`,
`login-action@v4`, `build-push-action@v7`). Keep the two repos on the same
majors so a Dependabot bump in one is a hint for the other.

Required checks on `main`: the four quality jobs and `smoke`. `build-image`
does not run on pull requests, so requiring it would leave them waiting.
`lighthouse` is noisy, so it is not required either. Enable branch
protection once T1 is green, without enforcing it for administrators, or
direct pushes to `main` are rejected.

## 4. Container image (T11)

`next.config.ts` sets `output: 'standalone'` (ADR-0001). The Dockerfile is
the official `with-docker` example from the Next.js repository at the
installed version, with four changes: the `26-alpine` base, the npm branch
of its lockfile conditional only, telemetry off, and the site URL as a build
argument.

```dockerfile
# The official Next.js with-docker example, on alpine for the image budget
# (docs/01 §5.2) and with the site URL as a build argument. A Node bump
# changes this line and .node-version.
ARG NODE_VERSION=26-alpine

FROM node:${NODE_VERSION} AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --no-audit --no-fund

FROM node:${NODE_VERSION} AS builder
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Inlined into the bundle at build time (docs/07 §6).
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
RUN npm run build

FROM node:${NODE_VERSION} AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=builder --chown=node:node /app/public ./public
# The server writes its prerender and image caches under .next at runtime.
RUN mkdir .next
RUN chown node:node .next
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
USER node
EXPOSE 3000
CMD ["node", "server.js"]
```

The example defaults to `-slim` and documents alpine as the choice when
image size matters. Slim adds about 100 MB unpacked. The musl builds of
every native dependency are in the lockfile.

`NEXT_PUBLIC_SITE_URL` is required: without it the variable is an empty
string, `new URL("")` throws and the build fails.

```sh
docker build --build-arg NEXT_PUBLIC_SITE_URL=https://samir.swadestack.com -t portfolio:local .
```

`.dockerignore`: `node_modules/`, `.next/`, `.git/`, `.github/`, `docs/`,
`*.md`, `Dockerfile*`, `.dockerignore`, `.env*` and local working files.
`*.md` does not match `.mdx`, and `content/` and `assets/` reach the builder;
both are traced into `.next/standalone` without
`outputFileTracingIncludes`.

The budget is 100 MB compressed (`docs/01 §5.2`). Measured at T11: 77.6 MB
compressed, 225 MB unpacked (`du` inside the image). Docker's
`DISK USAGE` column, 313 MB, also counts the stored compressed layers, so it
is not the number to read.

`build-image` builds `linux/amd64`, the architecture of the cluster's one
node (`homeserver`), natively on the runner, as the SwadeStack images do.
No emulation is involved.

Health: `app/api/health/route.ts` returns `200 {"status":"ok"}`. It is the
single request-time route — made so with `await connection()`, since under
Cache Components a `GET` handler is otherwise prerendered (ADR-0004) — and
the only thing the probes call.

## 5. GitOps — `swadestack-k8s` (T12)

Same repository, same conventions. Added files:

```
apps/portfolio/
├── base/
│   ├── deployment.yaml
│   ├── service.yaml
│   └── kustomization.yaml
└── overlays/production/
    ├── namespace.yaml
    ├── ingress.yaml
    └── kustomization.yaml        # images: newTag: <sha>
argocd/applications/portfolio.yaml  # + entry in argocd/applications/kustomization.yaml
```

`base/deployment.yaml` essentials:

```yaml
containers:
  - name: portfolio
    image: ghcr.io/samir120/portfolio
    ports:
      - containerPort: 3000
        name: http
    readinessProbe:
      httpGet: { path: /api/health, port: http }
      initialDelaySeconds: 3
      periodSeconds: 5
    livenessProbe:
      httpGet: { path: /api/health, port: http }
      initialDelaySeconds: 10
      periodSeconds: 10
    lifecycle:
      preStop:
        sleep: { seconds: 5 }
    resources:
      requests: { cpu: 25m, memory: 48Mi }
      limits: { cpu: 200m, memory: 192Mi }
    securityContext:
      runAsNonRoot: true
      runAsUser: 1000
      allowPrivilegeEscalation: false
      readOnlyRootFilesystem: true
    volumeMounts:
      - { name: next-cache, mountPath: /app/.next/cache }
      - { name: route-cache, mountPath: /app/.next/server/route-cache }
volumes:
  - { name: next-cache, emptyDir: {} }
  - { name: route-cache, emptyDir: {} }
```

`runAsUser` is needed because the image's `USER` is the name `node`, and
Kubernetes cannot verify `runAsNonRoot` against a non-numeric user. The two
volumes hold what the server writes at runtime: optimised images, unknown
slugs and background revalidation. With a read-only root and no volumes
every route still serves, but those writes fail and are logged (Node reports
them as `ENOENT`). Neither path exists in the image, so the mounts hide
nothing. Tested with `docker run --read-only` and a `tmpfs` on each.

The 192 Mi limit is measured. At 128 Mi the pod was OOM-killed by `sharp`
resizing on a cold image cache, with four requests at a time. At 192 Mi, 16
requests at a time across both photos and all 15 default widths peaked at
120 MiB with no restart. Under Docker with 1 GiB available, where the heap
grows more lazily, four at a time reached 155 MiB.

`preStop` keeps the server answering for 5 s after the pod is told to stop,
while routing drops the old endpoint. Without it a request failed or stalled
on both rollouts checked. With it, three rollouts polled four times a second
returned only 200s.

The repository has no `imagePullSecrets`, so the GHCR package must be
public. A new package starts private.

`overlays/production/namespace.yaml` carries
`argocd.argoproj.io/sync-wave: "-3"`, as the SwadeStack overlays do.

`overlays/production/ingress.yaml`:

```yaml
metadata:
  annotations:
    traefik.ingress.kubernetes.io/router.entrypoints: web
spec:
  ingressClassName: traefik
  rules:
    - host: samir.swadestack.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service: { name: portfolio, port: { number: 3000 } }
```

`overlays/production/kustomization.yaml`:

```yaml
resources: [namespace.yaml, ../../base, ingress.yaml]
namespace: portfolio
images:
  - name: ghcr.io/samir120/portfolio
    newTag: 0000000000000000000000000000000000000000 # replaced by CI
```

`argocd/applications/portfolio.yaml` mirrors `swadestack-production.yaml`
with `path: apps/portfolio/overlays/production`, `namespace: portfolio`,
automated sync with `prune` and `selfHeal`, `CreateNamespace=true`.

The `deploy` job in `ci.yml` is the SwadeStack `update-gitops` job with
three changes: one image, the production overlay path, and a count check
that expects one `newTag`, not two. It uses the same `GITOPS_TOKEN` secret.

`concurrency: group: swadestack-gitops-writer` is set on the job, so the four
gates never queue behind it, and it stops two portfolio deploys overlapping.
GitHub applies a concurrency group within one repository, so it does not
serialise against the SwadeStack workflows. The push's rebase-and-retry loop
is what handles a write from the other repository. No promotion workflow:
`main` is production (`docs/01 §4`).

## 6. Cloudflare

`swadestack.com` is a Cloudflare zone and the cluster is reached through a
`cloudflared` tunnel configured with a token (dashboard-managed). Exposing
the subdomain is therefore a dashboard change, not a manifest:

Zero Trust → Networks → Tunnels → _(the existing tunnel)_ → Published
application routes → Add: subdomain `samir`, domain `swadestack.com`, service
URL `http://traefik.traefik.svc.cluster.local:80`, the same service as the
other hostnames. Cloudflare creates the CNAME.

Traefik routes by `Host`, so the Ingress host and the tunnel hostname must
match exactly. TLS terminates at Cloudflare; the tunnel is outbound-only, so
no port is opened and no certificate is managed in the cluster. Set the
zone's SSL mode to Full (it already is for `swadestack.com`).

The subdomain is also `NEXT_PUBLIC_SITE_URL`, set once at the top of
`ci.yml` and passed to the Dockerfile as a build argument, so canonical URLs
and OG image links are absolute and correct. Changing it means a new build.

## 7. Release process (after M4)

1. Commit to `main`. CI runs the four gates, `smoke` and `lighthouse`.
2. `build-image` pushes `ghcr.io/samir120/portfolio:<sha>` (amd64).
3. `deploy` commits `newTag: <sha>` to `swadestack-k8s`.
4. Argo CD syncs within its poll interval (or immediately via the existing
   GitHub webhook). The Deployment rolls; the readiness probe gates traffic.
5. Verify: `curl -I https://samir.swadestack.com/` → 200; `argocd app get
portfolio` → Synced/Healthy.

**Rollback** is `git revert` of the `deploy` commit in `swadestack-k8s`.
Argo CD re-syncs to the previous SHA, whose image is still on GHCR. Nothing
is rebuilt.

**Secrets:** none at runtime. The only secrets are CI's `GITHUB_TOKEN`
(packages: write, automatic) and `GITOPS_TOKEN` (already exists for
SwadeStack). No Sealed Secret is needed for the portfolio.

## 8. Observability

The cluster already runs Prometheus, Grafana and blackbox-exporter for
SwadeStack. A `portfolio` `Probe` in `swadestack-probes.yaml`
(`infrastructure/monitoring/`) checks the public URL every 30 s, so it
covers Cloudflare, the tunnel, Traefik and the pod.

`SwadeStackPortfolioDown` in `swadestack-alerts.yaml` fires when
`probe_success{job="portfolio"}` is 0 for 2 minutes. Availability rules are
per `job`, and Alertmanager only emails alerts named `SwadeStack.*`, so the
rule has its own entry and needs that prefix. The TLS expiry rule has no
`job` filter and covers the subdomain as it stands.

No application metrics; there is nothing to measure that Lighthouse doesn't.
