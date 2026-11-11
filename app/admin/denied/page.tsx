import type { Metadata } from "next";
import { site } from "@/content/site";
import { adminCopy } from "@/content/admin";
import { AdminCard, cardButtonOutline, cardText } from "@/components/admin/AdminCard";

/**
 * /admin/denied/ — signed in to Google, but not as the owner.
 *
 * Says so plainly, points a lost visitor at the real site, and offers the
 * account chooser again for the owner who picked the wrong account. It names
 * nobody and shows nothing: not the account that was tried, not the one that
 * is allowed.
 */
export const metadata: Metadata = { title: adminCopy.denied.title };

export default function DeniedPage() {
  const { denied } = adminCopy;
  const address = site.url.replace(/^https?:\/\//, "");

  return (
    <AdminCard heading={denied.heading}>
      <p className={cardText}>
        {denied.body}{" "}
        <a href={site.url} className="font-semibold text-action underline underline-offset-2">
          {address}
        </a>
        .
      </p>
      <a href="/api/admin/auth/start/" className={cardButtonOutline}>
        {denied.action}
      </a>
    </AdminCard>
  );
}
