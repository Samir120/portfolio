import Link from "next/link";

type ProjectRowProps = {
  href: string;
  index: number;
  title: string;
  summary: string;
  year: number;
};

// One home row on a fixed grid, so every column lines up whatever the
// title's length: index · title · summary · year. Below `sm` the summary
// takes its own line under the title.
export function ProjectRow({
  href,
  index,
  title,
  summary,
  year,
}: ProjectRowProps) {
  return (
    <li className="border-b border-border-subtle">
      <Link
        href={href}
        className="group grid grid-cols-[2rem_1fr_auto] items-baseline gap-x-4 gap-y-1 py-4 sm:grid-cols-[2rem_8rem_1fr_auto]"
      >
        <span
          aria-hidden="true"
          className="font-mono text-xs tracking-wider text-text-muted"
        >
          {String(index).padStart(2, "0")}
        </span>
        <span className="font-medium text-text group-hover:text-brand">
          {title}
          <span
            aria-hidden="true"
            className="opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
          >
            {" →"}
          </span>
        </span>
        <span className="col-span-2 col-start-2 row-start-2 text-[15px] leading-relaxed text-text-secondary sm:col-span-1 sm:col-start-3 sm:row-start-1">
          {summary}
        </span>
        <span className="col-start-3 row-start-1 font-mono text-xs tracking-wider text-text-muted sm:col-start-4">
          {year}
        </span>
      </Link>
    </li>
  );
}
