import Image from "next/image";
import { Duotone } from "@/components/duotone";

// A square photo beside the name in the home hero, in the theme's two
// photo colours inside a hairline frame (docs/02 §5.1). The image fills a
// fixed square, so any source ratio crops to the centre.
// https://nextjs.org/docs/app/api-reference/components/image#fill
export function Portrait({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative size-20 shrink-0 border border-border-subtle sm:size-24">
      <Duotone>
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(min-width: 40rem) 6rem, 5rem"
          className="object-cover"
        />
      </Duotone>
    </div>
  );
}
