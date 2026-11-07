import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "@/components/external-link";
import { Figure } from "@/components/figure";
import { Prose } from "@/components/prose";
import { getProject, listProjects } from "@/lib/content";
import { SCREENSHOT_SIZE } from "@/lib/project-module";

const LINK_CLASS = "text-text-secondary hover:text-text";

// One page per MDX file. The list is complete, so every case study is
// prerendered and ensureStatic accepts the route.
// https://nextjs.org/docs/app/api-reference/functions/generate-static-params
export async function generateStaticParams() {
  const projects = await listProjects();
  return projects.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();
  return {
    title: project.meta.title,
    description: project.meta.summary,
    alternates: { canonical: `/projects/${slug}` },
  };
}

// `dynamicParams = false` is not available under Cache Components; an
// unknown slug is rejected here instead.
// https://nextjs.org/docs/app/guides/migrating-to-cache-components#dynamicparams-is-not-supported
export default async function ProjectPage({
  params,
}: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();
  const { meta, Body } = project;

  const separator = (
    <span aria-hidden="true" className="text-text-muted">
      ·
    </span>
  );

  return (
    <article className="py-12 sm:py-16">
      <header className="border-b border-border-subtle pb-8">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {meta.title}
        </h1>
        <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1 font-mono text-xs tracking-wider text-text-muted uppercase">
          <span>{meta.year}</span>
          <ul aria-label="Stack" className="flex flex-wrap gap-x-3 gap-y-1">
            {meta.stack.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
        </div>
        {(meta.links.live || meta.links.code) && (
          <p className="mt-3 flex flex-wrap items-baseline gap-x-2 text-sm">
            {meta.links.live && (
              <ExternalLink href={meta.links.live} className={LINK_CLASS}>
                Live
              </ExternalLink>
            )}
            {meta.links.live && meta.links.code && separator}
            {meta.links.code && (
              <ExternalLink href={meta.links.code} className={LINK_CLASS}>
                Code
              </ExternalLink>
            )}
          </p>
        )}
      </header>
      {meta.image && (
        <div className="mt-10">
          <Figure
            src={meta.image.src}
            alt={meta.image.alt}
            width={SCREENSHOT_SIZE.width}
            height={SCREENSHOT_SIZE.height}
            label={`${meta.title} · ${meta.year}`}
            preload
          />
        </div>
      )}
      <div className="mt-10">
        <Prose>
          <Body />
        </Prose>
      </div>
      <p className="mt-12 border-t border-border-subtle pt-8 text-sm">
        <Link
          href="/contact"
          className="underline decoration-border-strong underline-offset-4 hover:decoration-brand"
        >
          Continue to Contact
          <span aria-hidden="true"> →</span>
        </Link>
      </p>
    </article>
  );
}
