import type { Metadata } from "next";
import { ExternalLink } from "@/components/external-link";
import { PageHeader } from "@/components/page-header";
import { displayUrl } from "@/lib/display-url";
import { SITE } from "@/lib/site";

const LABEL = "font-mono text-xs tracking-wider text-text-muted uppercase";
const ROW =
  "grid gap-1 border-b border-border-subtle px-4 py-4 last:border-b-0 sm:grid-cols-[8rem_1fr] sm:items-baseline sm:gap-6 sm:px-6";
const LINK =
  "text-text underline decoration-border-strong underline-offset-4 wrap-anywhere hover:decoration-brand";

// The layout's template appends the name; the description is inherited.
export const metadata: Metadata = {
  title: "Contact",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <section className="py-12 sm:py-16">
      <PageHeader
        path="~/contact"
        title="Contact."
        lead="I’m glad to discuss new projects, roles or anything you’ve seen here, and I look forward to hearing from you."
      />
      <dl className="mt-10 border border-border-subtle">
        <div className={ROW}>
          <dt className={LABEL}>Email</dt>
          <dd>
            {/* A plain anchor: mailto: is not a route for next/link, and
                ExternalLink would open an empty tab (docs/04 §3). */}
            <a href={`mailto:${SITE.email}`} className={LINK}>
              {SITE.email}
            </a>
          </dd>
        </div>
        {SITE.socials.map((social) => (
          <div key={social.href} className={ROW}>
            <dt className={LABEL}>{social.label}</dt>
            <dd>
              <ExternalLink href={social.href} className={LINK}>
                {displayUrl(social.href)}
              </ExternalLink>
            </dd>
          </div>
        ))}
        <div className={ROW}>
          <dt className={LABEL}>Location</dt>
          <dd className="text-text-secondary">{SITE.location}</dd>
        </div>
      </dl>
    </section>
  );
}
