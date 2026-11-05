import Link from "next/link";
import { MobileMenu } from "@/components/mobile-menu";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 bg-bg/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          aria-label="Home"
          className="font-mono text-text hover:text-brand"
        >
          /
        </Link>
        <div className="flex items-center gap-4 sm:gap-6">
          <MobileMenu>
            <ul className="flex flex-col sm:flex-row sm:gap-6">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block py-2 text-sm text-text-secondary hover:text-text sm:py-0"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </MobileMenu>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
