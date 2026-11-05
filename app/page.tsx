import { SITE } from "@/lib/site";

export default function Home() {
  return (
    <section className="py-12 sm:py-16">
      <p className="font-mono text-xs tracking-wider text-text-muted uppercase">
        Hi there, I&apos;m
      </p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
        {SITE.name}
      </h1>
      <p className="mt-4 text-[15px] leading-relaxed text-text-secondary">
        {SITE.role}
      </p>
    </section>
  );
}
