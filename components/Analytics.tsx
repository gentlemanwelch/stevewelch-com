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
 *
 * THE INTERNAL-VISIT SWITCH. Open the site once with `?internal=on` and that
 * browser is remembered (localStorage `swc_internal`) as the owner's:
 * every later visit is sent to GA4 with `traffic_type: 'internal'`, the
 * parameter GA4's built-in internal-traffic data filter keys on, and
 * `trackInquiry` in lib/analytics.ts never fires the Google Ads conversion
 * from it. `?internal=off` undoes it. The answer is exposed as
 * `window.swcInternal` so the rest of the code asks one place.
 *
 * WHY A SWITCH AND NOT AN ADDRESS FILTER: GA4 can also define internal traffic
 * by IP address, but a laptop that travels changes address — home, office,
 * hotel, phone hotspot — and every new one counts as a visitor until somebody
 * remembers to add it. A campaign judged on a few dozen conversions is
 * distorted badly by its owner's own form tests. The switch follows the
 * browser instead, wherever it is.
 *
 * Storage is wrapped because private browsing makes the accessor itself throw,
 * and the tag must load regardless. When it does throw, `?internal=on` still
 * marks the page it arrived on; it just cannot be remembered.
 *
 * It must run BEFORE the `config` calls: `config` is what sends the first
 * page view, so a flag set afterwards would miss it.
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
          window.swcInternal = (function () {
            var asked = null;
            try {
              asked = new URLSearchParams(window.location.search).get('internal');
              if (asked === 'on') localStorage.setItem('swc_internal', '1');
              if (asked === 'off') localStorage.removeItem('swc_internal');
              return localStorage.getItem('swc_internal') === '1';
            } catch (e) {
              return asked === 'on';
            }
          })();
          ${GA_ID ? `gtag('config', '${GA_ID}', window.swcInternal ? { traffic_type: 'internal' } : {});` : ""}
          ${ADS_ID ? `gtag('config', '${ADS_ID}');` : ""}
        `}
      </Script>
    </>
  );
}
