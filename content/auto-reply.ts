import { site } from "@/content/site";

/*
 * The instant reply an organizer gets the moment they submit the booking form.
 *
 * WHY THIS EXISTS. Responding within five minutes makes a lead 21× more likely
 * to qualify than responding within thirty (MIT / InsideSales). 78% of B2B
 * buyers purchase from whoever answers first, and the first responder takes
 * roughly half of competitive deals. The site previously promised a reply
 * "within two business days" — roughly 400× slower than the threshold that
 * wins, against organizers who are emailing three to five speakers the same
 * afternoon.
 *
 * Steve answers personally, which is the best thing for close rates and the
 * worst thing for guaranteed speed. This resolves that: the clock stops in
 * about thirty seconds, and Steve's own reply becomes a strong second touch
 * instead of a late first one.
 *
 * WHAT MAKES IT WORK. Not "thanks, we got it" — that buys nothing. It answers
 * the three things the organizer was going to email next (what it costs, what
 * you need in order to confirm a date, what happens now), so the exchange
 * moves forward while they are still at their desk.
 *
 * WRITE IT AS STEVE. It is sent from his address and replies come back to him.
 * Marketing voice here would be worse than no auto-reply at all.
 */

type Fields = {
  name: string;
  organization: string;
  eventName?: string;
  eventDate?: string;
};

const firstName = (full: string) => full.trim().split(/\s+/)[0] || "there";

export function autoReplySubject(f: Fields): string {
  if (f.eventName) return `Re: ${f.eventName} — got your note`;
  if (f.eventDate) return `Got your note about ${f.eventDate}`;
  return `Got your note — ${site.name}`;
}

export function autoReplyText(f: Fields): string {
  const dateLine = f.eventDate
    ? `You mentioned ${f.eventDate}. I'll check that against my calendar and come back either way.`
    : `Send me the date when you have it and I'll check it against my calendar.`;

  /* Only offered when the links actually exist — see site.booking. */
  const watch = site.booking.reelUrl
    ? `\nIf it's useful while you wait, here's me on stage: ${site.booking.reelUrl}\n`
    : "";
  const call = site.booking.calendarUrl
    ? `\nIf it's easier to talk it through, grab fifteen minutes here: ${site.booking.calendarUrl}\n`
    : "";

  return `Hi ${firstName(f.name)},

Thanks for getting in touch about ${f.organization}. This is an automatic note so you know it arrived — I read every one of these myself and will come back to you personally.

A few things you were probably going to ask next:

• What it costs. ${site.fee.label} The final figure depends on the date, location, format and how much tailoring the session needs. Travel outside North America is quoted separately.

• What I need to confirm a date. ${dateLine}

• What happens next. I'll reply with availability and a straight answer on fee — not a negotiation. If it's a fit we'll set up a short call before the event so the talk is built for your audience rather than delivered at them.
${watch}${call}
Speak soon,
Steve

--
${site.name}
${site.url.replace(/^https?:\/\//, "")}
`;
}

export function autoReplyHtml(f: Fields): string {
  /* Same words, lightly marked up. Plain text is the fallback for clients
     that refuse HTML, and both must say the same thing. */
  const esc = (v: string) =>
    v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const dateLine = f.eventDate
    ? `You mentioned <strong>${esc(f.eventDate)}</strong>. I'll check that against my calendar and come back either way.`
    : `Send me the date when you have it and I'll check it against my calendar.`;

  const watch = site.booking.reelUrl
    ? `<p style="margin:18px 0 0">If it's useful while you wait, <a href="${site.booking.reelUrl}">here's me on stage</a>.</p>`
    : "";
  const call = site.booking.calendarUrl
    ? `<p style="margin:10px 0 0">If it's easier to talk it through, <a href="${site.booking.calendarUrl}">grab fifteen minutes here</a>.</p>`
    : "";

  return `<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#042e43;max-width:36rem">
  <p>Hi ${esc(firstName(f.name))},</p>
  <p>Thanks for getting in touch about <strong>${esc(f.organization)}</strong>. This is an automatic note so you know it arrived — I read every one of these myself and will come back to you personally.</p>
  <p style="margin-top:20px">A few things you were probably going to ask next:</p>
  <p style="margin:14px 0 0"><strong>What it costs.</strong> ${esc(site.fee.label)} The final figure depends on the date, location, format and how much tailoring the session needs. Travel outside North America is quoted separately.</p>
  <p style="margin:14px 0 0"><strong>What I need to confirm a date.</strong> ${dateLine}</p>
  <p style="margin:14px 0 0"><strong>What happens next.</strong> I'll reply with availability and a straight answer on fee — not a negotiation. If it's a fit we'll set up a short call before the event so the talk is built for your audience rather than delivered at them.</p>
  ${watch}${call}
  <p style="margin-top:22px">Speak soon,<br>Steve</p>
  <p style="margin-top:22px;padding-top:14px;border-top:1px solid #d9e6ee;font-size:13px;color:#7b8b98">
    ${esc(site.name)} · <a href="${site.url}" style="color:#7b8b98">${esc(site.url.replace(/^https?:\/\//, ""))}</a>
  </p>
</div>`;
}
