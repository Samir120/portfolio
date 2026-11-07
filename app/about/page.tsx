import Link from "next/link";
import { FigureGrid } from "@/components/figure-grid";
import { ListItem } from "@/components/list-item";
import { ListSection } from "@/components/list-section";
import { SITE } from "@/lib/site";

const PARAGRAPH = "text-[15px] leading-relaxed sm:text-base";

export default function AboutPage() {
  return (
    <article className="py-12 sm:py-16">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        About Me.
      </h1>
      <div className="mt-6 space-y-4">
        <p className={PARAGRAPH}>
          TODO: first paragraph of the long bio — who you are and what you
          build.
        </p>
        <div className="py-4">
          <FigureGrid
            figures={[
              {
                src: "/figures/placeholder-1.webp",
                alt: "TODO: describe the first photo",
                label: "TODO: place · year",
                index: "01",
              },
              {
                src: "/figures/placeholder-2.webp",
                alt: "TODO: describe the second photo",
                label: "TODO: place · year",
                index: "02",
              },
            ]}
          />
        </div>
        <p className={PARAGRAPH}>TODO: second paragraph — how you got here.</p>
      </div>
      <div className="mt-12 space-y-12 sm:mt-16 sm:space-y-16">
        {SITE.pillars.map((pillar) => (
          <ListSection key={pillar.title} title={`${pillar.title}.`}>
            <ListItem title={pillar.link.label} href={pillar.link.href}>
              {pillar.summary}
            </ListItem>
          </ListSection>
        ))}
        <ListSection title="Experience.">
          {SITE.experience.map((position) => (
            <ListItem
              key={`${position.company}-${position.years}`}
              title={position.role}
              subtitle={`${position.company}, ${position.location}`}
              meta={position.years}
            >
              {position.summary}
            </ListItem>
          ))}
        </ListSection>
        <ListSection title="Education.">
          {SITE.education.map((degree) => (
            <ListItem
              key={degree.school}
              title={degree.school}
              subtitle={degree.degree}
              meta={degree.years}
            />
          ))}
        </ListSection>
        <ListSection title="Reading." id="reading">
          {SITE.reading.map((item) => (
            <ListItem
              key={item.title}
              title={item.title}
              subtitle={item.by}
              meta={String(item.year)}
            />
          ))}
        </ListSection>
      </div>
      <p className="mt-12 border-t border-border-subtle pt-8 text-sm">
        <Link
          href="/projects"
          className="underline decoration-border-strong underline-offset-4 hover:decoration-brand"
        >
          Continue to Projects
          <span aria-hidden="true"> →</span>
        </Link>
      </p>
    </article>
  );
}
