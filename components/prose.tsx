import type { ReactNode } from "react";

// Typography for MDX bodies: the plugin's `prose` styles, coloured by the
// site tokens (`prose-tokens` in globals.css) and adjusted to docs/02.
// `text-[15px] leading-relaxed` replaces the plugin's 1rem base so bodies
// match the rest of the site. Headings use the site's scale (h2 as a
// section heading, h3 as an item title) instead of the plugin's ratios, and
// each h2 opens with a hairline, so a long case study reads in sections.
// https://github.com/tailwindlabs/tailwindcss-typography
export function Prose({ children }: { children: ReactNode }) {
  return (
    <div className="prose max-w-none text-[15px] leading-relaxed prose-tokens prose-headings:font-semibold prose-headings:tracking-tight prose-h2:mt-14 prose-h2:border-t prose-h2:border-border-subtle prose-h2:pt-10 prose-h2:text-lg prose-h2:first:mt-0 prose-h2:first:border-t-0 prose-h2:first:pt-0 sm:prose-h2:text-xl prose-h3:text-base prose-a:font-normal prose-a:decoration-border-strong prose-a:underline-offset-4 prose-a:hover:decoration-brand prose-pre:rounded-none prose-pre:border prose-pre:border-border-subtle">
      {children}
    </div>
  );
}
