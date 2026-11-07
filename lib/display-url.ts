// A link's address as people read it: no scheme, no "www.", no trailing
// slash. "https://www.linkedin.com/in/x/" becomes "linkedin.com/in/x".
export function displayUrl(href: string): string {
  return href.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
}
