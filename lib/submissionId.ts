/*
 * The id a form gives a submission, so a retry is the same inquiry.
 *
 * Both booking forms call this the first time they are sent and keep the
 * result for as long as the form is on screen. A double click, or "Send"
 * pressed again after an error, therefore carries the same id, and the server
 * treats it as the inquiry it already has rather than a second one: one
 * record in the CRM however many times it is sent. (Whether the EMAILS are
 * sent again is the attempt number's job — a double click is one attempt, a
 * retry after an error is a new one. See `sendOnce` in lib/crm/resend.ts.)
 *
 * Called from the submit handler, never during render. An id generated while
 * rendering would differ between the server's HTML and the browser's.
 *
 * `crypto.randomUUID` needs a secure page (https, or localhost) and a browser
 * from 2022 or later. Where it is missing this returns undefined, the form
 * sends without an id, and the server makes one — that submission simply is
 * not protected against a double send, which is how every submission behaved
 * before this existed.
 */
export function newSubmissionId(): string | undefined {
  try {
    return crypto.randomUUID();
  } catch {
    return undefined;
  }
}
