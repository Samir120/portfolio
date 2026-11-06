import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
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
// default: no route is an MDX file (ADR-0002).
// https://nextjs.org/docs/app/guides/mdx
const withMDX = createMDX({});

export default withMDX(nextConfig);
