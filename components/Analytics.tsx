import Script from "next/script";
import { GA_ID, ADS_ID, analyticsEnabled } from "@/lib/analytics";

/**
 * Loads gtag.js once for both GA4 and Google Ads.
 *
 * One tag serves both products — that is what the `config` calls below are
 * for. Loading two separate snippets is a common and costly mistake: they
 * fight over the same dataLayer and conversions go missing.
 *
 * `afterInteractive` rather than `beforeInteractive`: nothing on this site
 * depends on analytics to render, and the booking form must never wait on a
 * third-party script. Largest Contentful Paint feeds both organic ranking and
 * the Landing Page Experience half of Ads Quality Score, so the measurement
 * must not degrade the thing it measures.
 *
 * Renders nothing at all when no IDs are configured, which is the state the
 * site ships in until they are set in Vercel.
 */
export function Analytics() {
  if (!analyticsEnabled) return null;

  // Either ID can bootstrap the library; GA4 first when both are present.
  const bootstrapId = GA_ID ?? ADS_ID;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${bootstrapId}`}
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          ${GA_ID ? `gtag('config', '${GA_ID}');` : ""}
          ${ADS_ID ? `gtag('config', '${ADS_ID}');` : ""}
        `}
      </Script>
    </>
  );
}
