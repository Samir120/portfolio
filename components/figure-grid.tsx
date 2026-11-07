import Image from "next/image";

type GridFigure = {
  src: string;
  alt: string;
  label: string;
  index?: string;
};

type FigureGridProps = {
  figures:
    | readonly [GridFigure, GridFigure]
    | readonly [GridFigure, GridFigure, GridFigure];
  aspect?: "landscape" | "square";
};

const COLUMNS = { 2: "sm:grid-cols-2", 3: "sm:grid-cols-3" } as const;

const ASPECT = { landscape: "aspect-[3/2]", square: "aspect-square" } as const;

// The rendered width of one cell: the full measure on mobile, a share of
// the 48rem measure from `sm` up.
const SIZES = {
  2: "(min-width: 48rem) 24rem, (min-width: 40rem) 50vw, 100vw",
  3: "(min-width: 48rem) 16rem, (min-width: 40rem) 33vw, 100vw",
} as const;

// Two or three photos as panes in one hairline frame (docs/02 §5.1). The
// frame's background shows through the 1px gaps between `bg-bg` cells, so
// every edge is a single line. One aspect ratio per grid keeps the cells
// level; `fill` with `object-cover` crops each photo to it.
// https://nextjs.org/docs/app/api-reference/components/image#fill
export function FigureGrid({ figures, aspect = "landscape" }: FigureGridProps) {
  const count = figures.length;

  return (
    <div
      className={`not-prose grid gap-px border border-border-subtle bg-border-subtle ${COLUMNS[count]}`}
    >
      {figures.map((figure) => (
        <figure key={figure.src} className="bg-bg">
          <div className={`relative ${ASPECT[aspect]}`}>
            <Image
              src={figure.src}
              alt={figure.alt}
              fill
              sizes={SIZES[count]}
              className="object-cover saturate-[.85]"
            />
          </div>
          <figcaption className="flex justify-between gap-4 px-3 py-2 font-mono text-xs tracking-wider text-text-muted uppercase">
            <span>{figure.label}</span>
            {figure.index && <span>{figure.index}</span>}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
