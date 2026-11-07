import Link from "next/link";
import type { ReactNode } from "react";
import { ExternalLink } from "@/components/external-link";

type ListItemProps = {
  title: string;
  href?: string;
  subtitle?: string;
  meta?: string;
  children?: ReactNode;
};

// One hairline row: title (optionally a link), meta on the right, an
// optional subtitle and one paragraph (docs/02 §4, §5).
export function ListItem({
  title,
  href,
  subtitle,
  meta,
  children,
}: ListItemProps) {
  const isExternal = href?.startsWith("http") ?? false;

  return (
    <li className="border-b border-border-subtle py-4">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-base font-semibold">
          {href === undefined ? (
            title
          ) : isExternal ? (
            <ExternalLink href={href} className="hover:text-brand">
              {title}
            </ExternalLink>
          ) : (
            <Link href={href} className="hover:text-brand">
              {title}
            </Link>
          )}
        </h3>
        {meta && (
          <span className="shrink-0 font-mono text-xs tracking-wider text-text-muted uppercase">
            {meta}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>
      )}
      {children && (
        <p className="mt-2 text-[15px] leading-relaxed text-text-secondary">
          {children}
        </p>
      )}
    </li>
  );
}
