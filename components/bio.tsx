import { ExternalLink } from "@/components/external-link";

const LINK_CLASS =
  "underline decoration-border-strong underline-offset-4 hover:decoration-brand";

export function Bio() {
  return (
    <p className="text-[15px] leading-relaxed sm:text-base">
      TODO: write two or three sentences about what you build and where, with a
      link to{" "}
      <ExternalLink href="https://swadestack.com" className={LINK_CLASS}>
        a project
      </ExternalLink>{" "}
      or two.
    </p>
  );
}
