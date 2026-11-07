import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { ProjectCard } from "@/components/project-card";
import { listProjects } from "@/lib/content";

// The layout's template appends the name; the description is inherited.
export const metadata: Metadata = {
  title: "Projects",
  alternates: { canonical: "/projects" },
};

export default async function ProjectsPage() {
  const projects = await listProjects();

  return (
    <section className="py-12 sm:py-16">
      <PageHeader path="~/projects" title="Projects." />
      <ul className="mt-10 space-y-6">
        {projects.map(({ slug, meta }, position) => (
          <ProjectCard
            key={slug}
            slug={slug}
            index={position + 1}
            meta={meta}
          />
        ))}
      </ul>
    </section>
  );
}
