"use client";
// Client: reads and writes data-theme and localStorage, and listens for the T key.

import { useEffect, useLayoutEffect, useSyncExternalStore } from "react";
import { Kbd } from "@/components/kbd";
import {
  DEFAULT_THEME,
  LIGHT_THEME,
  THEMES,
  THEME_LABELS,
  THEME_STORAGE_KEY,
  type Theme,
} from "@/lib/themes";

function readTheme(): Theme {
  const value = document.documentElement.dataset.theme;
  return THEMES.find((theme) => theme === value) ?? DEFAULT_THEME;
}

// The same choice as the inline script in app/layout.tsx.
function preferredTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    const theme = THEMES.find((known) => known === stored);
    if (theme) return theme;
  } catch {
    // Storage can be blocked; fall back to the OS preference.
  }
  const isLight = matchMedia("(prefers-color-scheme: light)").matches;
  return isLight ? LIGHT_THEME : DEFAULT_THEME;
}

function nextTheme(theme: Theme): Theme {
  return THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length] ?? DEFAULT_THEME;
}

function cycleTheme() {
  const theme = nextTheme(readTheme());
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Storage can be blocked; the theme still changes for this page view.
  }
}

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

function isTyping(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
  );
}

export function ThemeToggle() {
  // The attribute on <html> is the state; this only reads it for the label.
  const theme = useSyncExternalStore(subscribe, readTheme, () => DEFAULT_THEME);

  // Where React renders the whole document in the browser (an unknown
  // case-study slug, docs/03 §3) the inline script never runs. Re-apply its
  // choice before paint; everywhere else this sets the value already there.
  // https://nextjs.org/docs/app/guides/preventing-flash-before-hydration#re-applying-attributes-in-development
  useLayoutEffect(() => {
    document.documentElement.dataset.theme = preferredTheme();
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() !== "t" || event.repeat) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (isTyping(event.target)) return;
      cycleTheme();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // The accessible name starts with the visible word, so "click Theme"
  // works in voice control; the key hint is announced by aria-keyshortcuts.
  return (
    <button
      type="button"
      onClick={cycleTheme}
      aria-keyshortcuts="T"
      className="flex items-center gap-2 text-sm text-text-secondary hover:text-text"
    >
      <span>
        Theme
        <span className="sr-only">
          , switch to {THEME_LABELS[nextTheme(theme)]}
        </span>
      </span>
      <span aria-hidden="true">
        <Kbd>T</Kbd>
      </span>
    </button>
  );
}
