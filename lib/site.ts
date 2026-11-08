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

// Absolute origin for canonical URLs, Open Graph and the sitemap. CI passes
// NEXT_PUBLIC_SITE_URL at build time, where it is inlined (docs/07 §6); the
// fallback is the default subdomain from docs/06 Q1.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://samir.swadestack.com";

export const SITE = {
  name: "Samir Alami",
  role: "Full-stack developer with a högskoleingenjör degree in computer engineering from KTH.",
  location: "Stockholm",
  email: "samiralami132@gmail.com",
  socials: [
    { label: "GitHub", href: GITHUB },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/samir-alami" },
  ],
  pillars: [
    {
      title: "Engineering",
      summary:
        "Most of my own work lives on GitHub, and I try to build it the way I’d want to find it as a reader. Each project starts with a short written plan of what it should do and why, and the larger design decisions are recorded along the way. I let the tools carry part of the responsibility. In Rust, the type system keeps invalid data from being represented at all. In C++, tests run under sanitizers and formatting and static analysis are enforced automatically. Every push goes through a pipeline that checks it before it’s merged, so problems are found early, while they’re still small and easy to fix.",
      link: { label: "GitHub", href: GITHUB },
    },
    {
      title: "Infrastructure",
      summary:
        "SwadeStack runs on a single-node k3s cluster that I set up and maintain myself. When I push to main, GitHub Actions checks and builds the frontend and backend, packages them as container images, and updates a separate GitOps repository. Argo CD then brings the staging environment in line with what’s in Git, while releasing to production stays a deliberate, manual step. Secrets are kept encrypted with Sealed Secrets, and public traffic reaches the cluster through a Cloudflare Tunnel. Prometheus and Grafana keep an eye on uptime, the database and disk space, and I’m notified by email if the site goes down, a certificate is close to expiring or a backup is missed. The database and uploaded files are backed up every night, and the steps to rebuild the cluster from scratch are written down.",
      link: { label: "swadestack-k8s", href: `${GITHUB}/swadestack-k8s` },
    },
    {
      title: "Learning",
      summary:
        "Reading technical books is a habit of mine, and it’s still how I learn most things. I read a book through, work the examples on my own machine, and then put what I’ve learned to use in a project of my own. C++ and Rust came to me this way, and later Kubernetes, Terraform, Argo CD and GitHub Actions. Next.js I learned from its official documentation, and this site is the result. At the moment I’m learning Go and working through Sebastian Raschka’s book on machine learning with PyTorch and scikit-learn. The reading list collects the books that have shaped how I work, along with what I’m reading now.",
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
  reading: [
    {
      title: "Machine Learning with PyTorch and Scikit-Learn",
      by: "Sebastian Raschka, Yuxi Liu, Vahid Mirjalili",
      year: 2026,
    },
    { title: "Next.js Documentation", by: "Vercel", year: 2026 },
    { title: "The Linux Command Line", by: "William Shotts", year: 2026 },
    {
      title: "Argo CD: Up and Running",
      by: "Andrew Block, Christian Hernandez",
      year: 2026,
    },
    { title: "Learning GitHub Actions", by: "Brent Laster", year: 2026 },
    {
      title: "Kubernetes: Up and Running",
      by: "Brendan Burns, Joe Beda, Kelsey Hightower, Lachlan Evenson",
      year: 2026,
    },
    { title: "Terraform: Up & Running", by: "Yevgeniy Brikman", year: 2026 },
    {
      title: "Hacking: The Art of Exploitation",
      by: "Jon Erickson",
      year: 2026,
    },
    {
      title: "C++ Primer",
      by: "Stanley B. Lippman, Josée Lajoie, Barbara E. Moo",
      year: 2025,
    },
    { title: "C++ Crash Course", by: "Josh Lospinoso", year: 2025 },
    {
      title: "The Rust Programming Language",
      by: "Steve Klabnik, Carol Nichols, Chris Krycho",
      year: 2024,
    },
    {
      title: "Programming Rust",
      by: "Jim Blandy, Jason Orendorff, Leonora F. S. Tindall",
      year: 2024,
    },
    { title: "Rust in Action", by: "Tim McNamara", year: 2024 },
  ],
} as const satisfies Site;
