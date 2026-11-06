# ADR-0005 — MDX metadata is plain JavaScript, validated at build

Status: accepted · 2026-11-06 · amends ADR-0002

## Context

ADR-0002 has each MDX file export its metadata typed with `satisfies`, so
that a malformed `meta` would be a TypeScript error. That cannot work with
`@next/mdx`. MDX parses the `import` and `export` blocks of a file with
acorn, a JavaScript parser, so TypeScript syntax is a compile error: with
`@next/mdx` 16.4.5, both `import type { ProjectMeta }` and
`satisfies ProjectMeta` fail with "Could not parse import/exports with
acorn". `tsc` does not read `.mdx` files at all, and the dynamic `import()`
with a template string that the Next.js MDX guide uses is typed `any`.
There is no compile-time check of `meta` on this path.

## Decision

- An MDX file exports `meta` as a plain JavaScript object literal. No
  imports and no TypeScript syntax in MDX.
- `lib/content.ts` receives each imported module as `unknown` and narrows
  it with a hand-written type guard: a `meta` that is a `ProjectMeta`, and
  a default export that is an MDX component. No schema library.
- The guard rejects a missing required field, a field of the wrong type,
  an unknown field (at the top level of `meta` and inside `links`) and a
  missing default export.
- Every validation error names the file and the field, for example
  `content/projects/leta.mdx: meta.year must be an integer`.
- `meta.order` is an optional integer. Among projects of the same year,
  those with `order` come first, lowest first; those without it follow in
  title order. `year` still decides "newest first".
- The error is thrown while the build prerenders, so `next build` fails
  and a bad file cannot reach a green `main`.
- `ProjectMeta` stays in `lib/types.ts` as the one definition of the
  shape. The guard is the only code that turns content into values of
  that type.

## Consequences

- The guarantee ADR-0002 wanted is kept, but it moves from the typecheck
  gate to the build gate. `npm run check` still fails on a bad `meta`,
  one step later.
- Rejecting unknown fields catches a misspelt `featured`, the case
  `satisfies` was meant to catch.
- No type hints while editing an MDX file. The build error is the
  feedback, and it points at the file and field.
- `ProjectMeta` and its guard change together. Adding a field is an edit
  to both, in the same commit.
- The guard narrows with `typeof`, `Number.isInteger` and `Array.isArray`,
  so the rules in `docs/04 §2` hold: no `any`, no `as unknown as`.
- The rest of ADR-0002 stands: MDX in the repository, `@next/mdx`, one
  file per project, slug from the filename, no frontmatter.

## Alternatives rejected

- **A typed sibling file per project** (`content/projects/<slug>.ts`
  exporting `meta satisfies ProjectMeta`, the MDX holding only the body).
  `tsc` would check the shape, but each project becomes two files, and the
  loader would still need a runtime check that every pair exists. Rejected
  because "adding a project is adding a file" is worth more than editor
  hints.
- **A schema library** (Zod, Valibot). Well-tested and terse, but a
  dependency for seven fields, and `docs/04 §10` presumes such additions
  unnecessary. A guard of this size is short enough to own.
- **Frontmatter with `remark-mdx-frontmatter`.** Untyped YAML plus two
  dependencies; already rejected in ADR-0002 for the same reasons.
- **JSDoc `@type` annotations in the MDX export.** `tsc` does not read
  `.mdx`, so they would check nothing.
