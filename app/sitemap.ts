import type { MetadataRoute } from "next";
import { listProjects } from "@/lib/content";
import { SITE_URL } from "@/lib/site";

// Every public page and one entry per case study, from the same list the
// pages use, so a new MDX file is in the sitemap without a code change.
// Sitemap URLs must be absolute; metadataBase does not apply here.
// https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap#generating-a-sitemap-using-code-js-ts

const PAGES = ["", "/about", "/projects", "/contact"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await listProjects();
  const paths = [...PAGES, ...projects.map(({ slug }) => `/projects/${slug}`)];
  return paths.map((path) => ({ url: `${SITE_URL}${path}` }));
}
