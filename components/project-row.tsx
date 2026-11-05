import Link from "next/link";

type ProjectRowProps = {
  href: string;
  title: string;
  summary: string;
  year: number;
};

export function ProjectRow({ href, title, summary, year }: ProjectRowProps) {
  return (
    <li className="border-b border-border-subtle">
      <Link
        href={href}
        className="group flex flex-wrap items-baseline gap-x-4 gap-y-1 py-4"
      >
        <span className="font-medium group-hover:text-brand">{title}</span>
        <span className="order-last w-full text-[15px] leading-relaxed text-text-secondary sm:order-none sm:w-auto sm:flex-1">
          {summary}
        </span>
        <span className="ml-auto font-mono text-xs tracking-wider text-text-muted">
          {year}
        </span>
      </Link>
    </li>
  );
}
