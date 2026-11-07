// Shapes of the metadata each content file exports. MDX cannot be
// type-checked, so lib/content.ts validates every `meta` against these at
// build time (ADR-0005).

export type ProjectLinks = {
  live?: string;
  code?: string;
};

// A screenshot in public/projects/, 1600×1000 WebP (docs/02 §8).
export type ProjectImage = {
  src: string;
  alt: string;
};

export type ProjectMeta = {
  title: string;
  summary: string;
  year: number;
  stack: readonly string[];
  links: ProjectLinks;
  featured: boolean;
  order?: number;
  image?: ProjectImage;
};
