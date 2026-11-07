// Every fact about the person lives here. Pages and components import it
// instead of hard-coding copy.

type LabelledLink = { label: string; href: string };

type Pillar = { title: string; summary: string; link: LabelledLink };

type Position = {
  role: string;
  company: string;
  location: string;
  years: string;
  summary: string;
};

type Degree = { school: string; degree: string; years: string };

type ReadingItem = { title: string; by: string; year: number };

type Site = {
  name: string;
  role: string;
  location: string;
  email: string;
  socials: readonly LabelledLink[];
  pillars: readonly Pillar[];
  experience: readonly Position[];
  education: readonly Degree[];
  reading: readonly ReadingItem[];
};

const GITHUB = "https://github.com/Samir120";

export const SITE = {
  name: "Samir",
  role: "Full-stack developer in Stockholm — React, TypeScript, Node.js, PostgreSQL",
  location: "Stockholm",
  email: "samiralami132@gmail.com",
  socials: [
    { label: "GitHub", href: GITHUB },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/samir-alami" },
  ],
  pillars: [
    {
      title: "Engineering",
      summary: "TODO: one paragraph on how you build software.",
      link: { label: "GitHub", href: GITHUB },
    },
    {
      title: "Infrastructure",
      summary: "TODO: one paragraph on the cluster and the pipeline.",
      link: { label: "swadestack-k8s", href: `${GITHUB}/swadestack-k8s` },
    },
    {
      title: "Learning",
      summary: "TODO: one paragraph on what you are learning and how.",
      link: { label: "Reading list", href: "#reading" },
    },
  ],
  experience: [
    {
      role: "Full-Stack Developer",
      company: "Minne24 AB",
      location: "Sundbyberg",
      years: "2025–present",
      summary:
        "I build features for multi-tenant e-commerce platforms, working across the whole stack: React and TypeScript on the front end, ASP.NET Core, Razor and Node.js on the backend, and PostgreSQL for data. Most of my work means taking a feature from the user interface through the business logic down to the database layer, within an established architecture that runs in production.",
    },
    {
      role: "Consultant (part-time)",
      company: "Manpower",
      location: "Stockholm",
      years: "2023–2025",
      summary:
        "Technical assistance and IT-related services for client operations, alongside full-time studies at KTH.",
    },
    {
      role: "IT Assistant & Tutor (part-time)",
      company: "Väsby Library",
      location: "Upplands Väsby",
      years: "2021",
      summary:
        "Tutored students in STEM subjects and helped library visitors with technical questions.",
    },
    {
      role: "Intern, Entrepreneurship Program",
      company: "Rookie Startups",
      location: "Uppsala",
      years: "2020",
      summary:
        "A summer program where I built an online shop and learned the basics of business development and launching a product.",
    },
  ],
  education: [
    {
      school: "KTH Royal Institute of Technology",
      degree:
        "B.Sc. in Engineering, Computer Engineering (högskoleingenjör i datateknik)",
      years: "2021–2025",
    },
  ],
  reading: [{ title: "TODO: book or course", by: "TODO: author", year: 2026 }],
} as const satisfies Site;
