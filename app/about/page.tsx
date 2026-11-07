import type { Metadata } from "next";
import Link from "next/link";
import { Figure } from "@/components/figure";
import { ListItem } from "@/components/list-item";
import { ListSection } from "@/components/list-section";
import { PageHeader } from "@/components/page-header";
import { ReadingList } from "@/components/reading-list";
import { SITE } from "@/lib/site";

const PARAGRAPH = "text-[15px] leading-relaxed";

// The layout's template appends the name; the description is inherited.
export const metadata: Metadata = {
  title: "About",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <article className="py-12 sm:py-16">
      <PageHeader path="~/about" title="About Me." />
      <div className="mt-8 space-y-4">
        <p className={PARAGRAPH}>
          In my day-to-day work, I build web features that run in production,
          where it matters that things keep working for the people using them.
          In my own projects, I try to give the same care to everything around
          the code: how it’s built, tested and deployed, and how it can be
          restored if something goes wrong. I like to think through the design
          before I begin, keep the core logic separate from the rest, and add
          tests and automated checks early on, so small mistakes are caught
          before they reach anyone. Over time, this way of working has led me
          toward infrastructure and systems programming.
        </p>
        <div className="py-4">
          <Figure
            src="/figures/samir-2.webp"
            alt="Samir standing with one hand on his hip in front of wooden wall bars at a gym."
            width={1500}
            height={1000}
            label="Stockholm · 2023"
          />
        </div>
        <p className={PARAGRAPH}>
          My path into software started with programming and web development
          courses in upper secondary school, and a summer startup program in
          2020 where I built my first online shop. I went on to study computer
          engineering at KTH, working part-time as a consultant alongside my
          studies, and graduated in 2025 with a degree project on real-time
          energy monitoring and anomaly detection in IoT systems. Much of what I
          know beyond my education I’ve learned the same way: reading books,
          working through the examples, and then building something of my own.
          That’s how I picked up C++, Rust, Kubernetes and Terraform, and more
          recently Next.js and Go.
        </p>
      </div>
      <div className="mt-12 space-y-12 sm:mt-16 sm:space-y-16">
        <ListSection title="Focus.">
          {SITE.pillars.map((pillar) => (
            <ListItem
              key={pillar.title}
              title={pillar.title}
              href={pillar.link.href}
              meta={pillar.link.label}
            >
              {pillar.summary}
            </ListItem>
          ))}
        </ListSection>
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
        <ReadingList title="Reading." id="reading" books={SITE.reading} />
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
