import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "@/components/external-link";
import { SCREENSHOT_SIZE } from "@/lib/project-module";
import type { ProjectMeta } from "@/lib/types";

const LINK_CLASS = "text-text-secondary hover:text-text";

// A hairline list item; with a screenshot it becomes a bordered card with
// the image edge-to-edge (docs/02 §4, §6.3).
export function ProjectCard({
  slug,
  meta,
}: {
  slug: string;
  meta: ProjectMeta;
}) {
  const { image } = meta;
  const separator = (
    <span aria-hidden="true" className="text-text-muted">
      ·
    </span>
  );

  return (
    <li
      className={
        image
          ? "my-6 border border-border-subtle"
          : "border-b border-border-subtle py-6"
      }
    >
      {image && (
        <Image
          src={image.src}
          alt={image.alt}
          width={SCREENSHOT_SIZE.width}
          height={SCREENSHOT_SIZE.height}
          sizes="(min-width: 48rem) 48rem, 100vw"
          className="h-auto w-full border-b border-border-subtle"
        />
      )}
      <div className={image ? "p-4 sm:p-6" : undefined}>
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-lg font-semibold">
            <Link href={`/projects/${slug}`} className="hover:text-brand">
              {meta.title}
            </Link>
          </h2>
          <span className="font-mono text-xs tracking-wider text-text-muted">
            {meta.year}
          </span>
        </div>
        <p className="mt-2 text-[15px] leading-relaxed text-text-secondary">
          {meta.summary}
        </p>
        <ul
          aria-label="Stack"
          className="mt-3 flex flex-wrap gap-x-3 gap-y-1 font-mono text-xs tracking-wider text-text-muted uppercase"
        >
          {meta.stack.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
        <p className="mt-3 flex flex-wrap items-baseline gap-x-2 text-sm">
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
