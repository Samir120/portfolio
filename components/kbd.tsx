import type { ReactNode } from "react";

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="border border-border-strong px-1.5 py-0.5 font-mono text-xs text-text-muted">
      {children}
    </kbd>
  );
}
