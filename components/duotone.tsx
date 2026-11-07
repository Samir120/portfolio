import type { ReactNode } from "react";

// Renders a photo in two colours of the active theme: shadows in
// `photo-shadow`, highlights in `photo-light`. The image is greyscaled and
// multiplied onto the light colour, then the shadow colour is lightened in
// on top, so a theme switch re-tints every photo with the rest of the page.
// https://developer.mozilla.org/en-US/docs/Web/CSS/mix-blend-mode
export function Duotone({ children }: { children: ReactNode }) {
  return (
    <div className="relative isolate size-full bg-photo-light [&_img]:mix-blend-multiply [&_img]:contrast-110 [&_img]:grayscale">
      {children}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-photo-shadow mix-blend-lighten"
      />
    </div>
  );
}
