"use client";
// Client: owns the open/closed state of the navigation below sm.

import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";

const NAV_ID = "site-nav";

export function MobileMenu({ children }: { children: ReactNode }) {
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
        className="absolute inset-x-0 top-14 hidden border-b border-border-subtle bg-bg px-4 py-2 peer-aria-expanded:block sm:static sm:block sm:border-0 sm:bg-transparent sm:p-0"
      >
        {children}
      </nav>
    </>
  );
}
