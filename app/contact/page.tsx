import { ListItem } from "@/components/list-item";
import { ListSection } from "@/components/list-section";
import { SITE } from "@/lib/site";

const PARAGRAPH = "text-[15px] leading-relaxed sm:text-base";

export default function ContactPage() {
  return (
    <section className="py-12 sm:py-16">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Contact.
      </h1>
      <p className={`mt-6 ${PARAGRAPH}`}>
        I’m glad to discuss new projects, roles or anything you’ve seen here,
        and I look forward to hearing from you.
      </p>
      <p className="mt-6">
        {/* A plain anchor: mailto: is not a route for next/link, and
            ExternalLink would open an empty tab (docs/04 §3). */}
        <a
          href={`mailto:${SITE.email}`}
          className="font-mono text-xl wrap-anywhere underline decoration-border-strong underline-offset-4 hover:decoration-brand sm:text-2xl"
        >
          {SITE.email}
        </a>
      </p>
      <div className="mt-12 sm:mt-16">
        <ListSection title="Socials.">
          {SITE.socials.map((social) => (
            <ListItem
              key={social.href}
              title={social.label}
              href={social.href}
            />
          ))}
        </ListSection>
      </div>
    </section>
  );
}
