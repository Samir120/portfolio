import Link from "next/link";
import { Bio } from "@/components/bio";
import { ProjectRow } from "@/components/project-row";
import { SectionHeading } from "@/components/section-heading";
import { listProjects } from "@/lib/content";
import { SITE } from "@/lib/site";

export default async function Home() {
  const projects = await listProjects({ featured: true });

  return (
    <>
      <section className="py-12 sm:py-16">
        <p className="font-mono text-xs tracking-wider text-text-muted uppercase">
          Hi there, I&apos;m
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
          {SITE.name}
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-text-secondary">
          {SITE.role}
        </p>
        <div className="mt-6">
          <Bio />
        </div>
        <div className="mt-8 flex items-center gap-6">
          <Link
            href="/contact"
            className="bg-brand px-4 py-2 text-sm font-medium text-brand-ink hover:bg-text hover:text-bg"
          >
            Get in touch
          </Link>
          <Link
            href="/about"
            className="text-sm underline decoration-border-strong underline-offset-4 hover:decoration-brand"
          >
            About me
            <span aria-hidden="true"> →</span>
          </Link>
        </div>
      </section>
      <section className="py-12 sm:py-16">
        <SectionHeading
          title="Selected projects"
          action={{ href: "/projects", label: "All projects" }}
        />
        <ul className="mt-6 border-t border-border-subtle">
          {projects.map(({ slug, meta }) => (
            <ProjectRow
              key={slug}
              href={`/projects/${slug}`}
              title={meta.title}
              summary={meta.summary}
              year={meta.year}
            />
          ))}
        </ul>
      </section>
    </>
  );
}
