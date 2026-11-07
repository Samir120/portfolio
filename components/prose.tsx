import type { ReactNode } from "react";

// Typography for MDX bodies: the plugin's `prose` styles, coloured by the
// site tokens (`prose-tokens` in globals.css) and adjusted to docs/02.
// https://github.com/tailwindlabs/tailwindcss-typography
export function Prose({ children }: { children: ReactNode }) {
  return (
    <div className="prose max-w-none prose-tokens prose-headings:font-semibold prose-headings:tracking-tight prose-a:font-normal prose-a:decoration-border-strong prose-a:underline-offset-4 prose-a:hover:decoration-brand prose-pre:rounded-none prose-pre:border prose-pre:border-border-subtle">
      {children}
    </div>
  );
}
