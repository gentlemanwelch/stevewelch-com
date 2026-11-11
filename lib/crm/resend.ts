import "server-only";
import { createHash } from "node:crypto";

/*
 * Sending one email through Resend, at most once.
 *
 * THE PROBLEM. A form can be sent twice: a double click, a retry after a slow
 * response, a browser that resends on reconnect. Each used to produce a second
 * inquiry email to Steve and a second "got your note" to the organizer.
 *
 * Resend accepts an `Idempotency-Key` header and remembers it for 24 hours:
 * the same key with the same message returns the first answer without sending
 * again. The key here is the caller's scope (which names the submission) plus
 * a fingerprint of the exact message, so:
 *
 *   - the same message for the same submission is sent once;
 *   - a CHANGED message for the same submission is sent again, which is right:
 *     an organizer who fixes their email address after an error should not
 *     have the corrected inquiry swallowed as a duplicate.
 *
 * Because the fingerprint is part of the key, Resend can never see one key
 * with two different messages. The only conflict left is "that key is being
 * sent right now" — an identical twin request a moment ahead of this one.
 *
 * A FAILED SEND IS NEVER REPLAYED. Resend's documentation promises "the same
 * response" for a repeated key and does not say whether that includes a
 * failure. If it did, one bad moment at Resend would block every retry of
 * that inquiry for a day. So the caller's scope must change after a failure:
 * the inquiry route puts the form's attempt number in it, and the form raises
 * that number each time it shows the organizer an error. The price is a
 * second copy of an email in one rare case — the first send worked and its
 * answer was lost on the way back — which is the right way round to be wrong.
 *
 * NEVER THROWS. A network failure comes back as `ok: false` like any other,
 * so callers decide what a failed send means without a try/catch around each.
 */

export type SendResult =
  | { ok: true; id: string | null }
  | { ok: false; status: number; detail: string };

/** How long to wait for the twin request to finish before asking again. */
const TWIN_WAIT_MS = 1200;

export async function sendOnce(
  apiKey: string,
  message: Record<string, unknown>,
  scope: string,
): Promise<SendResult> {
  const body = JSON.stringify(message);
  const fingerprint = createHash("sha256").update(body).digest("hex").slice(0, 32);
  const key = `${scope}/${fingerprint}`;

  for (let attempt = 0; attempt < 2; attempt++) {
    let res: Response;
    try {
      res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "Idempotency-Key": key,
        },
        body,
      });
    } catch (err) {
      return { ok: false, status: 0, detail: err instanceof Error ? err.message : "network error" };
    }

    if (res.ok) {
      const data = (await res.json().catch(() => ({}))) as { id?: unknown };
      return { ok: true, id: typeof data.id === "string" ? data.id : null };
    }

    const detail = (await res.text().catch(() => "")).slice(0, 500);

    /*
     * 409 with this name means an identical request is in flight. Wait once
     * and ask again: by then Resend has the twin's answer and returns it. If
     * the twin is STILL in flight, it is the one delivering this message, and
     * reporting a failure here would tell an organizer their inquiry was lost
     * while it was on its way.
     */
    if (res.status === 409 && detail.includes("concurrent_idempotent_requests")) {
      if (attempt === 0) {
        await new Promise((resolve) => setTimeout(resolve, TWIN_WAIT_MS));
        continue;
      }
      return { ok: true, id: null };
    }

    return { ok: false, status: res.status, detail };
  }

  // Unreachable: the loop returns on every path. Here so the function is total.
  return { ok: false, status: 0, detail: "send was not attempted" };
}

/**
 * Who an email written for a lead is actually sent to.
 *
 * On the live site, the lead. ANYWHERE ELSE — a preview, a laptop — the
 * owner, always. A preview build is a real website with a real form, and
 * typing a colleague's or a customer's address into it while testing must not
 * put an email in their inbox. This is the one place that rule lives; every
 * email the CRM sends to a lead takes its recipient from here.
 */
export function leadRecipient(
  leadEmail: string,
  ownerEmail: string,
  environment: string,
): { to: string; redirectedFrom: string | null } {
  if (environment === "production") return { to: leadEmail, redirectedFrom: null };
  return { to: ownerEmail, redirectedFrom: leadEmail };
}
