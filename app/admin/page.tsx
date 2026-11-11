import type { Metadata } from "next";
import { adminCopy } from "@/content/admin";
import { requireAdmin } from "@/lib/crm/session";
import { AdminHeading, AdminPanel, AdminShell } from "@/components/admin/AdminShell";

/**
 * /admin/ — Leads.
 *
 * For now this is the door and nothing behind it: the frame, and a line
 * saying the list comes next. Its job in this step is to be the page that
 * only the owner can reach.
 */
// `absolute`, because a layout's title template applies to the segments BELOW
// it and not to the page beside it: without this the tab would read
// "Leads | Steve Welch", the public site's template.
export const metadata: Metadata = {
  title: { absolute: `${adminCopy.leads.title} | ${adminCopy.product}` },
};
export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  await requireAdmin();
  const { leads } = adminCopy;

  return (
    <AdminShell current="/admin/">
      <AdminHeading heading={leads.heading} summary={leads.summary} />
      <AdminPanel heading={leads.pendingHeading}>
        <p>{leads.pendingBody}</p>
      </AdminPanel>
    </AdminShell>
  );
}
