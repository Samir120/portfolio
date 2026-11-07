import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { OgCard } from "@/components/og-card";
import { SITE, SITE_URL } from "@/lib/site";

// The default card for every route that has no opengraph-image of its own.
// Generated once at build; the fonts are read from the repository, never
// fetched (docs/02 §8).
// https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image#generate-images-using-code-js-ts-tsx

export const alt = `${SITE.name}. ${SITE.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const FONTS_DIR = path.join(process.cwd(), "assets/fonts");
const geistRegular = await readFile(path.join(FONTS_DIR, "Geist-Regular.ttf"));
const geistSemiBold = await readFile(
  path.join(FONTS_DIR, "Geist-SemiBold.ttf"),
);

export default function Image() {
  return new ImageResponse(
    <OgCard
      eyebrow={SITE.location}
      title={SITE.name}
      description={SITE.role}
      footer={new URL(SITE_URL).host}
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
