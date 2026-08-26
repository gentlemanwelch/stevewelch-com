import type { Metadata } from "next";
import { privacyPolicy } from "@/content/legal";
import { LegalPage } from "@/components/LegalPage";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...buildMetadata({
    title: "Privacy Policy",
    description: "How stevewelch.com collects, uses, and protects your information.",
    path: "/privacy-policy/",
  }),
  // Legal boilerplate has no business competing with the commercial pages for
  // crawl budget or appearing in results, but it must stay reachable and
  // followable so the links out of it still count.
  robots: { index: false, follow: true },
};

export default function Page() {
  return <LegalPage title="Privacy Policy" path="/privacy-policy/" blocks={privacyPolicy} />;
}
