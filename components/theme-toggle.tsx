"use client";
// Client: reads and writes data-theme and localStorage, and listens for the T key.

import { useEffect, useSyncExternalStore } from "react";
import { Kbd } from "@/components/kbd";
import {
  DEFAULT_THEME,
  THEMES,
  THEME_LABELS,
  THEME_STORAGE_KEY,
  type Theme,
} from "@/lib/themes";

function readTheme(): Theme {
  const value = document.documentElement.dataset.theme;
  return THEMES.find((theme) => theme === value) ?? DEFAULT_THEME;
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

  return (
    <button
      type="button"
      onClick={cycleTheme}
      aria-label={`Switch to ${THEME_LABELS[nextTheme(theme)]} theme`}
      aria-keyshortcuts="T"
      className="flex items-center gap-2 text-sm text-text-secondary hover:text-text"
    >
      Theme
      <Kbd>T</Kbd>
    </button>
  );
}
