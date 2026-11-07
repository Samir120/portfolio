import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "@/components/external-link";
import { PageHeader } from "@/components/page-header";
import { Prose } from "@/components/prose";
import { displayUrl } from "@/lib/display-url";
import { getProject, listProjects } from "@/lib/content";

const LABEL = "font-mono text-xs tracking-wider text-text-muted uppercase";
const ROW =
  "grid gap-2 border-b border-border-subtle px-4 py-4 last:border-b-0 sm:grid-cols-[8rem_1fr] sm:items-baseline sm:gap-6 sm:px-6";
const LINK =
  "text-text underline decoration-border-strong underline-offset-4 wrap-anywhere hover:decoration-brand";

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

  return (
    <article className="py-12 sm:py-16">
      <PageHeader
        path={`~/projects/${slug}`}
        title={meta.title}
        lead={meta.summary}
      />
      <dl className="mt-10 border border-border-subtle">
        <div className={ROW}>
          <dt className={LABEL}>Year</dt>
          <dd className="font-mono text-sm text-text-secondary">{meta.year}</dd>
        </div>
        <div className={ROW}>
          <dt className={LABEL}>Stack</dt>
          <dd>
            <ul className="flex flex-wrap gap-2">
              {meta.stack.map((tag) => (
                <li
                  key={tag}
                  className="border border-border-subtle px-2 py-0.5 font-mono text-xs tracking-wider text-text-secondary uppercase"
                >
                  {tag}
                </li>
              ))}
            </ul>
          </dd>
        </div>
        {meta.links.live && (
          <div className={ROW}>
            <dt className={LABEL}>Live</dt>
            <dd>
              <ExternalLink href={meta.links.live} className={LINK}>
                {displayUrl(meta.links.live)}
              </ExternalLink>
            </dd>
          </div>
        )}
        {meta.links.code && (
          <div className={ROW}>
            <dt className={LABEL}>Code</dt>
            <dd>
              <ExternalLink href={meta.links.code} className={LINK}>
                {displayUrl(meta.links.code)}
              </ExternalLink>
            </dd>
          </div>
        )}
      </dl>
      <div className="mt-14">
        <Prose>
          <Body />
        </Prose>
      </div>
      <p className="mt-14 border-t border-border-subtle pt-8 text-sm">
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
