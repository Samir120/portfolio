import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { OgCard } from "@/components/og-card";
import { getProject, listProjects } from "@/lib/content";
import { SITE, SITE_URL } from "@/lib/site";

// One card per case study, replacing the root card on that route. An image
// route is a Route Handler, so the page's generateStaticParams does not
// cover it; it lists the slugs itself to be generated at build. An unknown
// slug is rejected as in the page.
// https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image#params

export const alt = `Case study card from ${SITE.name}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const FONTS_DIR = path.join(process.cwd(), "assets/fonts");
const geistRegular = await readFile(path.join(FONTS_DIR, "Geist-Regular.ttf"));
const geistSemiBold = await readFile(
  path.join(FONTS_DIR, "Geist-SemiBold.ttf"),
);

export async function generateStaticParams() {
  const projects = await listProjects();
  return projects.map(({ slug }) => ({ slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();
  const { meta } = project;

  return new ImageResponse(
    <OgCard
      eyebrow={`Projects · ${meta.year}`}
      title={meta.title}
      description={meta.summary}
      footer={`${SITE.name} · ${new URL(SITE_URL).host}`}
    />,
    {
      ...size,
      fonts: [
        { name: "Geist", data: geistRegular, weight: 400, style: "normal" },
        { name: "Geist", data: geistSemiBold, weight: 600, style: "normal" },
      ],
    },
  );
}
