// The only module that reads the filesystem. Lists content/projects/*.mdx
// once at module scope and loads each body with a bundler-resolved
// import() (ADR-0002, ADR-0004).
import "server-only";
import { readdirSync } from "node:fs";
import path from "node:path";
import type { MDXContent } from "mdx/types";
import { parseProjectModule } from "@/lib/project-module";
import type { ProjectMeta } from "@/lib/types";

export type Project = {
  slug: string;
  meta: ProjectMeta;
  Body: MDXContent;
};

const PROJECTS_DIR = "content/projects";

const SLUGS = readdirSync(path.join(process.cwd(), PROJECTS_DIR))
  .filter((file) => file.endsWith(".mdx"))
  .map((file) => file.slice(0, -".mdx".length));

async function loadProject(slug: string): Promise<Project> {
  const loaded: unknown = await import(`@/content/projects/${slug}.mdx`);
  const file = `${PROJECTS_DIR}/${slug}.mdx`;
  return { slug, ...parseProjectModule(loaded, file) };
}

// Newest first. Within a year, projects with `order` come first, lowest
// first; the rest follow in title order (ADR-0005).
function compareProjects(a: Project, b: Project): number {
  if (a.meta.year !== b.meta.year) return b.meta.year - a.meta.year;
  const { order: orderA } = a.meta;
  const { order: orderB } = b.meta;
  if (orderA !== undefined && orderB !== undefined && orderA !== orderB) {
    return orderA - orderB;
  }
  if (orderA !== undefined && orderB === undefined) return -1;
  if (orderA === undefined && orderB !== undefined) return 1;
  return a.meta.title.localeCompare(b.meta.title);
}

export async function listProjects(
  options: { featured?: boolean } = {},
): Promise<Project[]> {
  const projects = await Promise.all(SLUGS.map(loadProject));
  return projects
    .filter(({ meta }) => !options.featured || meta.featured)
    .sort(compareProjects);
}

export async function getProject(slug: string): Promise<Project | undefined> {
  return SLUGS.includes(slug) ? loadProject(slug) : undefined;
}
