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
  // The menu is open only on the path it was opened on, so following a link
  // closes it without an effect.
  const [openedOn, setOpenedOn] = useState<string | null>(null);
  const isOpen = openedOn === pathname;

  return (
    <>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={NAV_ID}
        onClick={() => setOpenedOn(isOpen ? null : pathname)}
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
