# 01 — Problem and Scope

## 1. Problem statement

A hiring manager, a prospective freelance client, or another developer lands
on a link and has about thirty seconds to answer three questions: who is this,
what has he actually built, and can he explain it. A GitHub profile answers
the second question badly (repositories, not outcomes) and the third not at
all. A CV answers the first and nothing else.

The portfolio exists to answer all three in one scroll, and to be the place
project write-ups live so they can be linked from applications, proposals and
conversations.

### 1.1 The three failure modes this design avoids

1. **The template clone.** A forked portfolio template with the colours
   changed. Recognisable at a glance, says nothing about judgement.
2. **The animation showcase.** WebGL hero, scroll-jacking, 4 MB of JavaScript
   to show a name. Impressive for ten seconds, then unreadable on a phone.
3. **The empty shell.** Beautiful chrome, two projects with one sentence each
   and no links. The content was always the hard part; the chrome was a way
   to avoid it.

## 2. Users

| User                       | What they need in 30 seconds                                    |
| -------------------------- | --------------------------------------------------------------- |
| Recruiter / hiring manager | Role, stack, 2–3 real projects with outcomes, CV one click away |
| Prospective client         | Evidence of shipped, maintained software; a way to reach him    |
| Fellow developer           | Code links, architecture decisions, something worth reading     |

All three read on a phone as often as on a laptop. All three leave if the
page is slow.

## 3. In scope (v1)

- Five routes: `/`, `/about`, `/projects`, `/projects/[slug]`, `/contact`.
- One fully written case study (SwadeStack) and short entries for the other
  projects, each with live and code links where they exist.
- A terminal-inspired design system: Geist + JetBrains Mono, zero border
  radius, hairline borders, a token-driven theme with Tokyo Night (dark,
  default) and White (light), switchable with a button and the `T` key.
- Page structure per `docs/02`: a one-scroll home, list-based about,
  projects and contact pages.
- Static rendering of every route. Correct metadata, Open Graph image,
  sitemap, robots, 404.
- CI on every push: typecheck, lint, format, build. Container image on GHCR.
- Deployment to the k3s cluster via `swadestack-k8s` and Argo CD, reachable at
  a swadestack.com subdomain through the existing Cloudflare tunnel.

## 4. Non-goals (v1)

- A CMS, a database, or any server-side state.
- A contact form. `mailto:` and social links are enough (`docs/06` Q5).
- A blog with a publishing cadence. The `/writing` route may exist but ships
  hidden until there are two posts (`docs/06` Q4).
- Swedish or Persian translations. The layout should not make this hard later,
  but it is not built now.
- Analytics. Can be added in one line later; not a launch concern.
- Animation beyond: theme transition, link hover, focus rings, and at most one
  subtle entrance on the hero.
- A staging environment. Production only.

## 5. Success criteria

### 5.1 The acceptance test

Open the production URL on a phone over a throttled 4G connection. The page is
readable before any JavaScript runs. Within one scroll the reader can see the
name, role, stack, three projects with links, and a way to make contact.
Switching theme does not flash. Every interactive element can be reached and
operated with the keyboard alone.

### 5.2 Measurable exit criteria for v1

- Lighthouse (mobile) ≥ 95 in Performance, Accessibility, Best Practices and
  SEO on `/` and one `/projects/[slug]` page.
- First-load JavaScript for `/` under 100 kB gzipped, as reported by
  `next analyze`.
- Zero ESLint, TypeScript and Prettier findings on `main`. CI green.
- Container image under 200 MB. Pod runs within a 128 Mi memory limit
  without OOM.
- All five routes return 200 through the Cloudflare hostname; `/nope`
  returns a themed 404.

### 5.3 Explicit anti-goals for v1

- No measurement of "engagement". Nobody is being funnelled anywhere.
- No perfection pass on copy. Copy marked `TODO:` is acceptable at the first
  deployment; the site gets better in public.

## 6. Relationship to other projects

The portfolio is one of the projects it describes. SwadeStack is the lead
case study. Kontera and Leta appear as entries once they have something to
show. The portfolio's own repository, CI and GitOps manifests are themselves
evidence for the "can he explain it" question, which is why `docs/` is
public and written carefully.

## 7. Open questions

Tracked at the end of `docs/06`, not here, because they change.
