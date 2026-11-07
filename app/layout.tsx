import type { Metadata } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SITE, SITE_URL } from "@/lib/site";
import {
  DEFAULT_THEME,
  LIGHT_THEME,
  THEMES,
  THEME_STORAGE_KEY,
} from "@/lib/themes";
import "./globals.css";

const geist = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

// Every route must prerender completely; the build fails otherwise.
// https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config/ensureStatic
export const ensureStatic = "navigation";

// Defaults for every route. Pages set a `title`, which the template extends,
// and a relative canonical, which metadataBase makes absolute. A page without
// a description inherits this one; Open Graph inherits title and description.
// https://nextjs.org/docs/app/api-reference/functions/generate-metadata
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { template: `%s · ${SITE.name}`, default: SITE.name },
  description: SITE.role,
  openGraph: { type: "website", siteName: SITE.name },
};

// Runs while the HTML is parsed, before first paint: the stored theme if it
// is still a known one, otherwise the OS colour-scheme preference.
// https://nextjs.org/docs/app/guides/preventing-flash-before-hydration#themes
const themeScript = `(function () {
  try {
    var themes = ${JSON.stringify(THEMES)};
    var theme = localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
    if (themes.indexOf(theme) === -1) {
      var light = matchMedia("(prefers-color-scheme: light)").matches;
      theme = light ? ${JSON.stringify(LIGHT_THEME)} : ${JSON.stringify(DEFAULT_THEME)};
    }
    document.documentElement.setAttribute("data-theme", theme);
  } catch (e) {}
})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme={DEFAULT_THEME}
      className={`${geist.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col">
        <SiteHeader />
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 sm:px-6">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
