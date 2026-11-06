import type { MDXComponents } from "mdx/types";

// Required by @next/mdx in the App Router. Global element-to-component
// mappings for every MDX body go here.
// https://nextjs.org/docs/app/api-reference/file-conventions/mdx-components
const components: MDXComponents = {};

export function useMDXComponents(): MDXComponents {
  return components;
}
