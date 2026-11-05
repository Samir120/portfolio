import { cacheLife } from "next/cache";
import { ExternalLink } from "@/components/external-link";
import { SITE } from "@/lib/site";

// A prerendered route may not read the clock directly, so the year is read
// inside a cached function and stored with the page.
// https://nextjs.org/docs/app/api-reference/directives/use-cache
async function getCopyrightYear() {
  "use cache";
  cacheLife("max");
  return new Date().getFullYear();
}

export async function SiteFooter() {
  const year = await getCopyrightYear();

  return (
    <footer className="border-t border-border-subtle bg-bg-deep">
      <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-8 text-sm text-text-secondary sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          {SITE.name} · © {year} · Built with Next.js
        </p>
        <ul className="flex gap-4">
          {SITE.socials.map((social) => (
            <li key={social.href}>
              <ExternalLink href={social.href} className="hover:text-text">
                {social.label}
              </ExternalLink>
            </li>
          ))}
        </ul>
        <p className="font-mono text-xs tracking-wider text-text-muted uppercase">
          {SITE.location}
        </p>
      </div>
    </footer>
  );
}
