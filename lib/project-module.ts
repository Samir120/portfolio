// Narrows an imported content/projects/*.mdx module from `unknown` to a
// validated meta and body. Every error names the file and the field
// (ADR-0005).
import type { MDXContent } from "mdx/types";
import type { ProjectImage, ProjectLinks, ProjectMeta } from "@/lib/types";

const META_KEYS = [
  "title",
  "summary",
  "year",
  "stack",
  "links",
  "featured",
  "order",
  "image",
];
const LINK_KEYS = ["live", "code"];
const IMAGE_KEYS = ["src", "alt"];
const IMAGE_SRC = /^\/projects\/[a-z0-9-]+\.webp$/;

// Every screenshot is exported at this size (docs/02 §8).
export const SCREENSHOT_SIZE = { width: 1600, height: 1000 } as const;

function fail(file: string, field: string, problem: string): never {
  throw new Error(`${file}: ${field} ${problem}`);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// A function is all that can be checked at runtime; @next/mdx compiles
// every .mdx default export to an MDXContent component.
function isMDXContent(value: unknown): value is MDXContent {
  return typeof value === "function";
}

function readRecord(
  value: unknown,
  allowed: readonly string[],
  file: string,
  field: string,
): Record<string, unknown> {
  if (!isRecord(value)) fail(file, field, "must be an object");
  for (const key of Object.keys(value)) {
    if (!allowed.includes(key)) {
      fail(file, `${field}.${key}`, "is not a known field");
    }
  }
  return value;
}

function readString(value: unknown, file: string, field: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    fail(file, field, "must be a non-empty string");
  }
  return value;
}

function readInteger(value: unknown, file: string, field: string): number {
  if (typeof value !== "number" || !Number.isInteger(value)) {
    fail(file, field, "must be an integer");
  }
  return value;
}

function readLinks(value: unknown, file: string): ProjectLinks {
  const links = readRecord(value, LINK_KEYS, file, "meta.links");
  const result: ProjectLinks = {};
  if (links.live !== undefined) {
    result.live = readString(links.live, file, "meta.links.live");
  }
  if (links.code !== undefined) {
    result.code = readString(links.code, file, "meta.links.code");
  }
  return result;
}

// Checks the shape only; lib/content.ts checks that the file exists.
function readImage(value: unknown, file: string): ProjectImage {
  const image = readRecord(value, IMAGE_KEYS, file, "meta.image");
  const src = readString(image.src, file, "meta.image.src");
  if (!IMAGE_SRC.test(src)) {
    fail(file, "meta.image.src", "must look like /projects/<name>.webp");
  }
  return { src, alt: readString(image.alt, file, "meta.image.alt") };
}

// Builds a new object from narrowed fields, so the compiler checks the
// result against ProjectMeta instead of trusting a signature.
function readMeta(value: unknown, file: string): ProjectMeta {
  const meta = readRecord(value, META_KEYS, file, "meta");
  const { stack, featured } = meta;
  if (!Array.isArray(stack) || stack.length === 0) {
    fail(file, "meta.stack", "must be a non-empty array");
  }
  if (typeof featured !== "boolean") {
    fail(file, "meta.featured", "must be true or false");
  }
  const result: ProjectMeta = {
    title: readString(meta.title, file, "meta.title"),
    summary: readString(meta.summary, file, "meta.summary"),
    year: readInteger(meta.year, file, "meta.year"),
    stack: stack.map((tag: unknown, index) =>
      readString(tag, file, `meta.stack[${index}]`),
    ),
    links: readLinks(meta.links, file),
    featured,
  };
  if (meta.order !== undefined) {
    result.order = readInteger(meta.order, file, "meta.order");
  }
  if (meta.image !== undefined) {
    result.image = readImage(meta.image, file);
  }
  return result;
}

export function parseProjectModule(
  value: unknown,
  file: string,
): { meta: ProjectMeta; Body: MDXContent } {
  if (!isRecord(value)) fail(file, "module", "did not load");
  if (!isMDXContent(value.default)) {
    fail(file, "default export", "must be an MDX body");
  }
  return { meta: readMeta(value.meta, file), Body: value.default };
}
