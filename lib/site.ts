// Every fact about the person lives here. Pages and components import it
// instead of hard-coding copy.

type SocialLink = { label: string; href: string };

type Site = {
  name: string;
  role: string;
  location: string;
  email: string;
  socials: readonly SocialLink[];
};

export const SITE = {
  name: "Samir",
  role: "Developer",
  location: "Stockholm",
  email: "samiralami132@gmail.com",
  socials: [
    { label: "GitHub", href: "https://github.com/Samir120" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/samir-alami" },
  ],
} as const satisfies Site;
