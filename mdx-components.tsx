import type { MDXComponents } from "mdx/types";
import { Figure } from "@/components/figure";
import { FigureGrid } from "@/components/figure-grid";

// Required by @next/mdx in the App Router. Global element-to-component
// mappings for every MDX body go here.
// https://nextjs.org/docs/app/api-reference/file-conventions/mdx-components
const components: MDXComponents = {
  // <Figure src alt width height label /> in a body, no import needed.
  Figure,
  // <FigureGrid figures={[{ src, alt, label }, …]} /> with two or three.
  FigureGrid,
  // A code block scrolls sideways when a line is wider than the measure;
  // tabIndex lets a keyboard user focus it and scroll with the arrow keys.
  pre: (props) => <pre {...props} tabIndex={0} />,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
