import Link from "next/link";
import { adminCopy } from "@/content/admin";
import { AdminCard, cardButtonOutline, cardText } from "@/components/admin/AdminCard";

/**
 * "Not here", for the private CRM.
 *
 * WHY THE CRM HAS ITS OWN. Without this file a missing lead falls through to
 * the site's public 404 page (app/not-found.tsx). That page is for lost
 * visitors: it draws the site's navigation and loads analytics, and the rule
 * for /admin is that analytics never loads on it. So a wrong lead address
 * gets this plain card instead, with one way back.
 *
 * It says nothing about what was asked for, and it is the same for a lead
 * that never existed and one that has been removed.
 */
export default function AdminNotFound() {
  const { notFound } = adminCopy;
  return (
    <AdminCard heading={notFound.heading}>
      <p className={cardText}>{notFound.body}</p>
      <Link href="/admin/" className={cardButtonOutline}>
        {notFound.action}
      </Link>
    </AdminCard>
  );
}
