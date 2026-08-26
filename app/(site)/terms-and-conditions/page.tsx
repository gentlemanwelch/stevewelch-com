import type { Metadata } from "next";
import { termsAndConditions } from "@/content/legal";
import { LegalPage } from "@/components/LegalPage";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...buildMetadata({
    title: "Terms and Conditions",
    description: "The terms governing use of stevewelch.com.",
    path: "/terms-and-conditions/",
  }),
  robots: { index: false, follow: true },
};

export default function Page() {
  return (
    <LegalPage
      title="Terms and Conditions"
      path="/terms-and-conditions/"
      blocks={termsAndConditions}
    />
  );
}
