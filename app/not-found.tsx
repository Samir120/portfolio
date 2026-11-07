import Link from "next/link";
import { PageHeader } from "@/components/page-header";

export default function NotFound() {
  return (
    <section className="py-12 sm:py-16">
      <PageHeader path="404" title="Not found." />
      <p className="mt-8 text-[15px] leading-relaxed">
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
