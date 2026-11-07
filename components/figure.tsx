import Image from "next/image";
import { Duotone } from "@/components/duotone";

type FigureProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  label: string;
  sizes?: string;
  preload?: boolean;
};

// A photo in the theme's two photo colours, in a hairline frame, with its
// meta line in a mono band underneath (docs/02 §5.1). `not-prose` keeps the
// typography plugin's styles off it inside an MDX body.
// https://nextjs.org/docs/app/api-reference/components/image
export function Figure({
  src,
  alt,
  width,
  height,
  label,
  sizes = "(min-width: 48rem) 48rem, 100vw",
  preload = false,
}: FigureProps) {
  return (
    <figure className="not-prose border border-border-subtle">
      <Duotone>
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes={sizes}
          preload={preload}
          className="block h-auto w-full"
        />
      </Duotone>
      <figcaption className="border-t border-border-subtle bg-bg-deep px-4 py-2 font-mono text-xs tracking-wider text-text-muted uppercase">
        {label}
      </figcaption>
    </figure>
  );
}
