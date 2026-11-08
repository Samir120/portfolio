import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // A minimal Node server for the container image (ADR-0001).
  output: "standalone",
  cacheComponents: true,
  partialPrefetching: true,
  agentRules: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

// Compiles `.mdx` imports from `content/`. `pageExtensions` is left at its
// default: no route is an MDX file (ADR-0002). Under Turbopack, plugins are
// passed by package name, not imported.
// https://nextjs.org/docs/app/guides/mdx#remark-and-rehype-plugins
const withMDX = createMDX({
  options: {
    remarkPlugins: ["remark-gfm"],
  },
});

export default withMDX(nextConfig);
