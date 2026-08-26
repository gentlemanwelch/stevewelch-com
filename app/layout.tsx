import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { JsonLd } from "@/components/primitives";
import { personSchema, websiteSchema } from "@/lib/jsonld";
import { site } from "@/content/site";

/*
 * Fonts are self-hosted by next/font at build time — no request to Google at
 * runtime, no layout shift, no third-party cookie. `display: swap` means text
 * paints in the fallback immediately, which protects Largest Contentful Paint,
 * a Core Web Vital and therefore a ranking input.
 */
/*
 * Poppins is the theme's typeface — `font-family: "Poppins",sans-serif` in the
 * WordPress custom CSS, at weight 700 for buttons. Weights are pinned to the
 * four actually used so the font payload stays small; Poppins is not a
 * variable font, so every weight listed here is a separate file.
 */
const body = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-body-family",
});

export const metadata: Metadata = {
  /**
   * metadataBase turns every relative image path in page metadata into an
   * absolute URL. Without it, Open Graph images silently break when a link is
   * shared — the one place where a broken tag is visible to exactly the people
   * you most want to impress.
   */
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  alternates: { canonical: site.url },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={body.variable}>
      <body>
        {/*
          Person and WebSite schema go in the layout rather than on the
          homepage, so that every page confirms the same entity. Page-specific
          schema is added by each page on top of this.
        */}
        <JsonLd data={personSchema()} />
        <JsonLd data={websiteSchema()} />

        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-[var(--color-ink)] focus:px-5 focus:py-2 focus:text-sm focus:text-white"
        >
          Skip to content
        </a>

        {/*
          No header or footer here on purpose. Site chrome lives in
          app/(site)/layout.tsx so that /lp/ landing pages can render without
          it — see that file. The root layout carries only what every page
          needs: fonts, the entity markup, and the skip link.
        */}
        {children}
      </body>
    </html>
  );
}
