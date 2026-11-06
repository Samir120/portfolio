import { ProjectCard } from "@/components/project-card";
import { listProjects } from "@/lib/content";

export default async function ProjectsPage() {
  const projects = await listProjects();

  return (
    <section className="py-12 sm:py-16">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Projects.
      </h1>
      <ul className="mt-8 border-t border-border-subtle">
        {projects.map(({ slug, meta }) => (
          <ProjectCard key={slug} slug={slug} meta={meta} />
        ))}
      </ul>
    </section>
  );
}
