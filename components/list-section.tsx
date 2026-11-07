import type { ReactNode } from "react";
import { SectionHeading } from "@/components/section-heading";

// An h2 and a hairline list of `ListItem`s (docs/02 §5). `id` makes the
// section a link target; `scroll-mt-20` keeps its heading clear of the
// sticky header after the jump.
export function ListSection({
  title,
  id,
  children,
}: {
  title: string;
  id?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20">
      <SectionHeading title={title} />
      <ul className="mt-6 border-t border-border-subtle">{children}</ul>
    </section>
  );
}
