export type Project = {
  slug: string;
  title: string;
  summary: string;
  year: number;
};

export const PROJECTS = [
  {
    slug: "swadestack",
    title: "SwadeStack",
    summary:
      "Self-hosted e-commerce platform with Stripe payments, two-factor auth and English/Swedish support, deployed on k3s through a GitOps pipeline.",
    year: 2026,
  },
  {
    slug: "nazerauto",
    title: "NazerAuto",
    summary:
      "Car service booking platform built with React, TypeScript, Node.js and PostgreSQL.",
    year: 2026,
  },
  {
    slug: "leta",
    title: "Leta",
    summary:
      "Typo-tolerant search server for product catalogs, written in C++20. In progress.",
    year: 2026,
  },
  {
    slug: "kontera",
    title: "Kontera",
    summary:
      "Rust library that turns e-commerce events into balanced Swedish bookkeeping verifications with SIE 4I export. In progress.",
    year: 2026,
  },
] as const satisfies readonly Project[];
