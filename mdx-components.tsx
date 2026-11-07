import type { MDXComponents } from "mdx/types";
import { Figure } from "@/components/figure";

// Required by @next/mdx in the App Router. Global element-to-component
// mappings for every MDX body go here.
// https://nextjs.org/docs/app/api-reference/file-conventions/mdx-components
const components: MDXComponents = {
  // <Figure src alt width height label /> in a body, no import needed.
  Figure,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
