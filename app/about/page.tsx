import type { Metadata } from "next";
import Link from "next/link";
import { FigureGrid } from "@/components/figure-grid";
import { ListItem } from "@/components/list-item";
import { ListSection } from "@/components/list-section";
import { SITE } from "@/lib/site";

const PARAGRAPH = "text-[15px] leading-relaxed sm:text-base";

// The layout's template appends the name; the description is inherited.
export const metadata: Metadata = {
  title: "About",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <article className="py-12 sm:py-16">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        About Me.
      </h1>
      <div className="mt-6 space-y-4">
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
          <FigureGrid
            figures={[
              {
                src: "/figures/samir-1.webp",
                alt: "coding",
                label: "Stockholm · 2022",
                index: "01",
              },
              {
                src: "/figures/samir-2.webp",
                alt: "exercising",
                label: "Stockholm · 2023",
                index: "02",
              },
            ]}
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
