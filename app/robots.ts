import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Everything is public; the file exists to point crawlers at the sitemap.
// https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots#generate-a-robots-file
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
