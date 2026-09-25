import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { JsonLd } from "@/components/primitives";
import { Analytics } from "@/components/Analytics";
import { AttributionCapture } from "@/components/AttributionCapture";
import { TrackEvents } from "@/components/TrackEvents";
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
  // 800 was added for the Built for Change display type — the hero headline
  // and the one-statement slides. At 96px, 700 reads as bold text; 800 reads
  // as a slide.
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-body-family",
});

const isPreview = process.env.VERCEL_ENV === "preview";

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
  /*
   * PREVIEW BUILDS ARE NEVER INDEXED.
   *
   * The redesign is being built on a branch and reviewed at a Vercel preview
   * URL. A preview link that leaks into search results would compete with the
   * real site for its own name.
   *
   * It fails SAFE: only a build Vercel explicitly labels "preview" is hidden.
   * A production build, a local build, or a build where the variable is
   * somehow missing all stay indexable — so there is no configuration in
   * which this can take the real site out of Google.
   */
  robots: isPreview
    ? { index: false, follow: false }
    : {
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
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-[var(--radius-base)] focus:bg-navy focus:px-5 focus:py-3 focus:text-[0.9375rem] focus:font-bold focus:text-white"
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

        {/* Renders nothing until the measurement IDs are set in Vercel. */}
        <Analytics />

        {/* Records a paid click on arrival, on any page, so it survives the
            walk to the booking form. Renders nothing. */}
        <AttributionCapture />

        {/* One delegated listener for every tracked CTA on the site. Renders
            nothing, and no-ops until GA4 is configured. */}
        <TrackEvents />
      </body>
    </html>
  );
}
