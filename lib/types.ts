// Shapes of the metadata each content file exports. MDX cannot be
// type-checked, so lib/content.ts validates every `meta` against these at
// build time (ADR-0005).

export type ProjectLinks = {
  live?: string;
  code?: string;
};

export type ProjectMeta = {
  title: string;
  summary: string;
  year: number;
  stack: readonly string[];
  links: ProjectLinks;
  featured: boolean;
  order?: number;
};
