# ADR-0002 — Content is MDX in the repository with typed metadata

Status: accepted · 2026-11-03 · amended by ADR-0005 (`meta` is plain
JavaScript, validated at build; `satisfies` cannot be used in MDX)

## Context

The site has a handful of project write-ups, an about page and, later, a
few posts. Options range from hard-coding JSX, through Markdown files with
frontmatter parsed at build, to a headless CMS fetched at build or request
time.

## Decision

Content lives in `content/**/*.mdx`, compiled by `@next/mdx` (the official
integration). Each file exports its metadata as a typed object:

```ts
export const meta = {
  title: "SwadeStack",
  summary: "…",
  year: 2025,
  stack: ["React", "TypeScript", "Node.js", "PostgreSQL"],
  links: {
    live: "https://swadestack.com",
    code: "https://github.com/Samir120/swadestack",
  },
  featured: true,
} satisfies ProjectMeta;
```

`lib/content.ts` lists files with `fs.readdir` and loads each with a
dynamic `import()`, following the "Using dynamic imports" section of the
Next.js MDX guide. No frontmatter parser, no remote fetch, no CMS.

## Consequences

- Metadata errors are TypeScript errors at build. A missing `year` or a
  misspelled `featured` cannot reach production.
- Content is versioned with the code and reviewed in the same PR. Writing a
  case study is a commit.
- Adding a project is adding a file. No registry to update; the
  listing, sitemap and OG images follow from `readdir`.
- MDX bodies can use React components (figures, callouts) through
  `mdx-components.tsx`, which plain Markdown could not.
- The site cannot be edited without a rebuild. For a personal site with
  one author that is the correct trade.
- Only Server Components may import `lib/content.ts`; it uses `fs`. The
  module boundary is enforced by the `server-only` package import at its
  top.

## Alternatives rejected

- **Markdown + `gray-matter` + `next-mdx-remote`.** The most common
  tutorial pattern. Frontmatter is untyped YAML; errors surface as
  `undefined` on the page. Rejected for the weaker guarantees and the extra
  dependencies.
- **`page.mdx` files directly under `app/projects/<slug>/`.** Also
  official, and simplest for a page or two. Rejected because listing
  pages (`/projects`, home) would have to import every page module by
  hand to read its metadata.
- **Headless CMS (Sanity, Contentful).** Adds an account, a schema, a
  fetch and a token to manage, for a site edited by one person who lives in
  a text editor.
- **A TypeScript array of objects with JSX bodies.** Fine for metadata;
  terrible for prose. Keeping prose in Markdown is non-negotiable.
