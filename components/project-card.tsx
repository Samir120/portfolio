import Link from "next/link";
import { ExternalLink } from "@/components/external-link";
import type { ProjectMeta } from "@/lib/types";

const LINK_CLASS = "text-text-secondary hover:text-text";

type ProjectCardProps = {
  slug: string;
  index: number;
  meta: ProjectMeta;
};

// A project as a terminal-style window: a mono title bar with the index,
// path and year, then the title, summary, stack and links (docs/02 §6.3).
// Every card has the same shape; screenshots live on the case study.
export function ProjectCard({ slug, index, meta }: ProjectCardProps) {
  const separator = (
    <span aria-hidden="true" className="text-text-muted">
      ·
    </span>
  );

  return (
    <li className="border border-border-subtle hover:border-border-strong">
      <div className="flex items-baseline justify-between gap-4 border-b border-border-subtle bg-bg-deep px-4 py-2 font-mono text-xs tracking-wider text-text-muted sm:px-6">
        <span aria-hidden="true" className="truncate">
          {String(index).padStart(2, "0")}
          <span className="ml-3">~/projects/{slug}</span>
        </span>
        <span className="shrink-0">{meta.year}</span>
      </div>
      <div className="p-4 sm:p-6">
        <h2 className="text-base font-semibold">
          <Link href={`/projects/${slug}`} className="hover:text-brand">
            {meta.title}
          </Link>
        </h2>
        <p className="mt-2 text-[15px] leading-relaxed text-text-secondary">
          {meta.summary}
        </p>
        <ul aria-label="Stack" className="mt-4 flex flex-wrap gap-2">
          {meta.stack.map((tag) => (
            <li
              key={tag}
              className="border border-border-subtle px-2 py-0.5 font-mono text-xs tracking-wider text-text-secondary uppercase"
            >
              {tag}
            </li>
          ))}
        </ul>
        <p className="mt-5 flex flex-wrap items-baseline gap-x-2 text-sm">
          {meta.links.live && (
            <>
              <ExternalLink href={meta.links.live} className={LINK_CLASS}>
                Live<span className="sr-only">, {meta.title}</span>
              </ExternalLink>
              {separator}
            </>
          )}
          {meta.links.code && (
            <>
              <ExternalLink href={meta.links.code} className={LINK_CLASS}>
                Code<span className="sr-only">, {meta.title}</span>
              </ExternalLink>
              {separator}
            </>
          )}
          <Link href={`/projects/${slug}`} className={LINK_CLASS}>
            Case study<span className="sr-only">, {meta.title}</span>
            <span aria-hidden="true"> →</span>
          </Link>
        </p>
      </div>
    </li>
  );
}
