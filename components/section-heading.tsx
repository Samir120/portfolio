import Link from "next/link";

type SectionAction = { href: string; label: string };

export function SectionHeading({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: SectionAction;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-[1.75rem]">
          {title}
        </h2>
        {action && (
          <Link
            href={action.href}
            className="shrink-0 text-sm text-text-secondary hover:text-text"
          >
            {action.label}
            <span aria-hidden="true"> →</span>
          </Link>
        )}
      </div>
      {description && (
        <p className="mt-2 text-[15px] leading-relaxed text-text-secondary">
          {description}
        </p>
      )}
    </div>
  );
}
