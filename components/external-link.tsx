import type { ReactNode } from "react";

type ExternalLinkProps = {
  href: string;
  className?: string;
  children: ReactNode;
};

// The arrow is drawn: the ↗ character is not in the latin font subset, and
// iOS falls back to its colour emoji for it.
export function ExternalLink({ href, className, children }: ExternalLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {children}
      <svg
        aria-hidden="true"
        viewBox="0 0 12 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="square"
        className="ml-[0.35em] inline-block size-[0.7em]"
      >
        <path d="M3 9 9 3M4.5 3H9v4.5" />
      </svg>
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
