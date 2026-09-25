/**
 * The contact page — the conversion point of the site. Everything else is
 * upstream of this form.
 *
 * The one thing it says that a standard contact page does not: inquiries
 * reach Steve’s team, not an agency. That is the whole competitive argument
 * against a bureau listing, and it only works if it is stated above the form.
 */
export const contactPage = {
  eyebrow: "Booking",
  heading: "This goes straight to Steve’s team.",
  body: "No agency, no bureau fee, no three-week relay. Tell us the date, who is in the room, and what the session needs to accomplish — you will normally hear back within two business days.",
  formHeading: "Inquiry form",
  email: { heading: "Prefer email?" },
  helps: {
    heading: "What helps most",
    items: [
      "The date, or the window you are working in",
      "Who is in the room and how many",
      "What should be different when they walk out",
      "Your budget range — it gets you a straight answer faster",
    ],
  },
  alsoAvailable: {
    heading: "Also available for",
    body: "A selected number of podcasts and media interviews. Mention the show and format in your message.",
  },
  faqHeading: "Before you write",
  /** How many of content/faq.ts's questions this page shows — the booking
      ones. The schema follows whatever is shown. */
  faqCount: 5,
};
