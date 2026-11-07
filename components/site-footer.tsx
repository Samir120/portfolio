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

// Two tiers: name, role line and socials; then a hairline and the colophon
// in the label style.
export async function SiteFooter() {
  const year = await getCopyrightYear();

  return (
    <footer className="border-t border-border-subtle bg-bg-deep">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-sans font-semibold text-text">{SITE.name}</p>
            <p className="mt-1 max-w-sm text-sm leading-relaxed text-text-secondary">
              {SITE.role}
            </p>
          </div>
          <ul className="flex gap-6 text-sm">
            {SITE.socials.map((social) => (
              <li key={social.href}>
                <ExternalLink
                  href={social.href}
                  className="text-text-secondary hover:text-text"
                >
                  {social.label}
                </ExternalLink>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-8 flex flex-col gap-2 border-t border-border-subtle pt-6 font-mono text-xs tracking-wider text-text-muted uppercase sm:flex-row sm:justify-between">
          <p>
            © {year} {SITE.name}
          </p>
          <p>{SITE.location} · Built with Next.js</p>
        </div>
      </div>
    </footer>
  );
}
