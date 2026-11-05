export const THEMES = ["tokyo-night", "white"] as const;

export type Theme = (typeof THEMES)[number];

export const THEME_LABELS: Record<Theme, string> = {
  "tokyo-night": "Tokyo Night",
  white: "White",
};

export const DEFAULT_THEME: Theme = "tokyo-night";

// Used when nothing is stored and the OS asks for a light colour scheme.
export const LIGHT_THEME: Theme = "white";

export const THEME_STORAGE_KEY = "theme";
