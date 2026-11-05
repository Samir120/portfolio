import Link from "next/link";

export default function NotFound() {
  return (
    <section className="py-12 sm:py-16">
      <p className="font-mono text-xs tracking-wider text-text-muted uppercase">
        404
      </p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
        Not found.
      </h1>
      <p className="mt-4 text-[15px] leading-relaxed sm:text-base">
        <Link
          href="/"
          className="underline decoration-border-strong underline-offset-4 hover:decoration-brand"
        >
          Back to home
        </Link>
      </p>
    </section>
  );
}
