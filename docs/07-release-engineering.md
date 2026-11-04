# 07 — Release Engineering

How a commit becomes a page at the subdomain. The shape is the SwadeStack
pipeline with one app, one environment and no database: quality gates →
image on GHCR tagged by commit SHA → a one-line change in `swadestack-k8s` →
Argo CD syncs → Traefik serves it → Cloudflare tunnel exposes it.

CI (§3) exists from T1. CD (§4–§7) is built in M4; until then this document
is the plan and nothing here after §3 is live.

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

Runs on every push and pull request. Four quality jobs in parallel; the
image job (M4) waits for all four and runs on `main` only.

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

permissions:
  contents: read

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
        env:
          NEXT_PUBLIC_SITE_URL: https://TODO.swadestack.com # docs/06 Q1
```

Added in M4, after the four gates:

- `build-image` — `needs: [typecheck, lint, format, build]`, `main` only.
  `docker/setup-buildx-action`, `docker/login-action` (GHCR, `GITHUB_TOKEN`),
  `docker/build-push-action` with `tags: ghcr.io/samir120/portfolio:${{
github.sha }}` and `cache-from`/`cache-to: type=gha`. See §4.
- `deploy` — `needs: build-image`. Seds `newTag` in `swadestack-k8s` and
  pushes with the rebase loop. See §5.
- `smoke` — Playwright against `next start`. `docs/05 §4`.
- `lighthouse` — `treosh/lighthouse-ci-action` against `next start`,
  budgets from `docs/05 §2`.

Action major versions match the ones already in use in the SwadeStack
workflows (`checkout@v6`, `setup-node@v7`, `setup-buildx-action@v4`,
`login-action@v4`, `build-push-action@v7`). Keep the two repos on the same
majors so a Dependabot bump in one is a hint for the other.

Required check on `main`: all four quality jobs. Enable branch protection
once T1 is green.

## 4. Container image (T11)

`next.config.ts` sets `output: 'standalone'` (ADR-0001). The Dockerfile is
the official `with-docker` example from the Next.js repository with the
image bases pinned to the project's Node major:

```dockerfile
# Dockerfile — follows vercel/next.js/examples/with-docker
ARG NODE_VERSION=26

FROM node:${NODE_VERSION}-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
CMD ["node", "server.js"]
```

`.dockerignore`: `node_modules`, `.next`, `.git`, `docs`, `*.md`,
`.github`.

The `build-image` job builds `linux/arm64` only (the cluster is a
Raspberry Pi 5), with `platforms: linux/arm64` and QEMU via
`docker/setup-qemu-action`. Add `linux/amd64` only if the image is ever run
elsewhere.

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
    resources:
      requests: { cpu: 25m, memory: 48Mi }
      limits: { cpu: 200m, memory: 128Mi }
    securityContext:
      runAsNonRoot: true
      allowPrivilegeEscalation: false
      readOnlyRootFilesystem: true
```

`overlays/production/ingress.yaml`:

```yaml
spec:
  ingressClassName: traefik
  rules:
    - host: TODO.swadestack.com # docs/06 Q1
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
three changes: one image, the production overlay path, and no "COUNT -ne 2"
check (expect 1). It uses the same `GITOPS_TOKEN` secret and the same
`concurrency: group: swadestack-gitops-writer` so two workflows never race
on the GitOps repo. No promotion workflow: `main` is production
(`docs/01 §4`).

## 6. Cloudflare

`swadestack.com` is a Cloudflare zone and the cluster is reached through a
`cloudflared` tunnel configured with a token (dashboard-managed). Exposing
the subdomain is therefore a dashboard change, not a manifest:

Zero Trust → Networks → Tunnels → _(the existing tunnel)_ → Public
Hostname → Add: subdomain `<sub>`, domain `swadestack.com`, service
`http://<traefik service>:80` — the same service the `swadestack.com`
hostname already points at. Cloudflare creates the proxied CNAME.

Traefik routes by `Host`, so the Ingress host and the tunnel hostname must
match exactly. TLS terminates at Cloudflare; the tunnel is outbound-only, so
no port is opened and no certificate is managed in the cluster. Set the
zone's SSL mode to Full (it already is for `swadestack.com`).

The chosen subdomain also becomes `NEXT_PUBLIC_SITE_URL` in the build job
and the Dockerfile `--build-arg`, so canonical URLs and OG image links are
absolute and correct.

## 7. Release process (after M4)

1. Commit to `main`. CI runs the four gates.
2. `build-image` pushes `ghcr.io/samir120/portfolio:<sha>` (arm64).
3. `deploy` commits `newTag: <sha>` to `swadestack-k8s`.
4. Argo CD syncs within its poll interval (or immediately via the existing
   GitHub webhook). The Deployment rolls; the readiness probe gates traffic.
5. Verify: `curl -I https://<sub>.swadestack.com/` → 200; `argocd app get
portfolio` → Synced/Healthy.

**Rollback** is `git revert` of the `deploy` commit in `swadestack-k8s`.
Argo CD re-syncs to the previous SHA, whose image is still on GHCR. Nothing
is rebuilt.

**Secrets:** none at runtime. The only secrets are CI's `GITHUB_TOKEN`
(packages: write, automatic) and `GITOPS_TOKEN` (already exists for
SwadeStack). No Sealed Secret is needed for the portfolio.

## 8. Observability

The cluster already runs Prometheus, Grafana and blackbox-exporter for
SwadeStack. T12 adds a blackbox probe target for the subdomain and reuses
the existing alert rule for `probe_success == 0`. No application metrics;
there is nothing to measure that Lighthouse doesn't.
