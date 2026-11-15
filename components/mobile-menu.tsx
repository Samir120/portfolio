"use client";
// Client: owns the open/closed state of the navigation below sm, and reads
// the pathname to mark the current page.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV_ID = "site-nav";

type NavItem = { href: string; label: string };

// A section's own pages count as current too: /projects/leta is under
// Projects.
function isCurrent(pathname: string, href: string) {
  return href === "/"
    ? pathname === "/"
    : pathname === href || pathname.startsWith(`${href}/`);
}

export function MobileMenu({ items }: { items: readonly NavItem[] }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Any navigation closes the menu, whichever link caused it: a menu link,
  // the wordmark, or the browser's back button. The state is reset while
  // rendering, when the pathname differs from the last one seen, instead of
  // in an effect.
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setIsOpen(false);
  }

  return (
    <>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={NAV_ID}
        onClick={() => setIsOpen(!isOpen)}
        className="peer text-sm text-text-secondary hover:text-text sm:hidden"
      >
        Menu
      </button>
      <nav
        id={NAV_ID}
        aria-label="Main"
        className="absolute inset-x-0 top-14 hidden border-y border-t-border-subtle border-b-border-strong bg-bg-deep px-4 py-2 peer-aria-expanded:block sm:static sm:block sm:border-0 sm:bg-transparent sm:p-0"
      >
        <ul className="flex flex-col sm:flex-row sm:gap-6">
          {items.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={
                  isCurrent(pathname, item.href) ? "page" : undefined
                }
                className="block py-2 text-sm text-text-secondary underline-offset-[6px] hover:text-text aria-[current=page]:text-text aria-[current=page]:underline aria-[current=page]:decoration-brand aria-[current=page]:decoration-2 sm:py-0"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
