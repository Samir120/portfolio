import Image from "next/image";

type FigureProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  label: string;
  index?: string;
  sizes?: string;
  preload?: boolean;
};

// A photo or screenshot in a hairline border with one mono meta line below
// (docs/02 §5.1). `not-prose` keeps the typography plugin's image and
// caption styles off it inside an MDX body.
// https://nextjs.org/docs/app/api-reference/components/image
export function Figure({
  src,
  alt,
  width,
  height,
  label,
  index,
  sizes = "(min-width: 48rem) 48rem, 100vw",
  preload = false,
}: FigureProps) {
  return (
    <figure className="not-prose">
      <div className="border border-border-subtle">
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes={sizes}
          preload={preload}
          className="h-auto w-full saturate-[.85]"
        />
      </div>
      <figcaption className="mt-2 flex justify-between gap-4 font-mono text-xs tracking-wider text-text-muted uppercase">
        <span>{label}</span>
        {index && <span>{index}</span>}
      </figcaption>
    </figure>
  );
}
