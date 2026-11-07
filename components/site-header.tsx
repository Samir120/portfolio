import Link from "next/link";
import { MobileMenu } from "@/components/mobile-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { SITE } from "@/lib/site";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/contact", label: "Contact" },
] as const;

// Sticky bar: the wordmark (a brand slash and the name), the navigation and
// the theme button, set apart by a hairline.
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-border-subtle bg-bg/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="group flex items-baseline gap-2 font-mono text-sm text-text"
        >
          <span aria-hidden="true" className="text-brand">
            /
          </span>
          <span className="group-hover:text-brand">{SITE.name}</span>
        </Link>
        <div className="flex items-center gap-4 sm:gap-6">
          <MobileMenu items={NAV_ITEMS} />
          <div className="border-l border-border-subtle pl-4 sm:pl-6">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
