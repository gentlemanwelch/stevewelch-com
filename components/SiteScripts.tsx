import { JsonLd } from "@/components/primitives";
import { Analytics } from "@/components/Analytics";
import { AttributionCapture } from "@/components/AttributionCapture";
import { TrackEvents } from "@/components/TrackEvents";
import { personSchema, websiteSchema } from "@/lib/jsonld";

/**
 * What every PUBLIC page carries besides its content: the entity markup, the
 * analytics tag, and the two listeners.
 *
 * These used to sit in the root layout, which wraps every page on the site.
 * They moved here when the private CRM arrived at /admin, because the root
 * layout wraps that too, and analytics on a CRM page would report the page's
 * address and title to Google — and a lead's page is titled with the lead's
 * name. A layout cannot remove what its parent rendered, so the only way to
 * keep these off /admin is for the root layout not to render them.
 *
 * So each public layout renders this instead: app/(site)/layout.tsx,
 * app/lp/layout.tsx, and app/not-found.tsx (which draws its own chrome). A NEW
 * PUBLIC LAYOUT MUST RENDER IT TOO, or its pages lose their markup and their
 * tracking without anything looking broken.
 *
 *   JsonLd            Person and WebSite schema, so every page confirms the
 *                     same entity. Page-specific schema is added on top.
 *   Analytics         Renders nothing until the measurement IDs are set.
 *   AttributionCapture  Records a paid click on arrival, on any page, so it
 *                     survives the walk to the booking form. Renders nothing.
 *   TrackEvents       One delegated listener for every tracked CTA. Renders
 *                     nothing, and no-ops until GA4 is configured.
 */
export function SiteScripts() {
  return (
    <>
      <JsonLd data={personSchema()} />
      <JsonLd data={websiteSchema()} />
      <Analytics />
      <AttributionCapture />
      <TrackEvents />
    </>
  );
}
