import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { adminCopy } from "@/content/admin";
import { adminConfig, adminSession } from "@/lib/crm/session";
import { AdminCard, cardButtonPrimary, cardText } from "@/components/admin/AdminCard";

/**
 * /admin/sign-in/ — the only CRM page a stranger can see.
 *
 * It says the place is private and offers one button. The button is a plain
 * link to the route that sends the visitor to Google; there is no form and no
 * password field, because this site never sees a password.
 *
 * Two smaller states share the card. Until the four sign-in settings exist
 * the button is replaced by a line saying sign-in is not set up, so a
 * half-configured deployment says so instead of failing at Google. And when a
 * sign-in was started and did not finish, a line above the button says that.
 *
 * Someone already signed in is sent straight on to /admin/.
 */
export const metadata: Metadata = { title: adminCopy.signIn.title };
export const dynamic = "force-dynamic";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ problem?: string }>;
}) {
  if (await adminSession()) redirect("/admin/");

  const { signIn } = adminCopy;
  const { problem } = await searchParams;

  return (
    <AdminCard heading={signIn.heading}>
      <p className={cardText}>{signIn.body}</p>
      {adminConfig() === null ? (
        <p role="status" className={`${cardText} font-semibold text-navy`}>
          {signIn.notSetUp}
        </p>
      ) : (
        <>
          {problem ? (
            <p role="alert" className={`${cardText} border-l-4 border-action bg-tint px-3 py-2 text-navy`}>
              {signIn.problem}
            </p>
          ) : null}
          {/* A plain link, not <Link>: it leads to a route that redirects to
              Google, and must be a full navigation with nothing prefetched. */}
          <a href="/api/admin/auth/start/" className={cardButtonPrimary}>
            {signIn.action}
          </a>
        </>
      )}
    </AdminCard>
  );
}
