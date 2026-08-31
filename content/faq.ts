/**
 * Booking FAQ.
 *
 * This does two jobs at once. For search, these are the long-tail questions
 * organizers type verbatim ("how much does it cost to book a keynote speaker",
 * "how far in advance do you book speakers"), and the page is marked up as
 * FAQPage structured data so the answers can surface directly in results.
 *
 * For humans, every question answered here is an email that does not need to
 * be sent — which is the actual reason a direct-booking site can compete with
 * a bureau. The bureau's whole value proposition is that they answer these.
 *
 * NOTE ON WORDING: these say the inquiry reaches Steve's TEAM, never Steve
 * personally. Cutting out the bureau is the claim; implying he answers his own
 * booking mail is a different one, and it is not true. Keep the distinction.
 */

export type Faq = {
  question: string;
  answer: string;
};

export const faqs: Faq[] = [
  {
    question: "How do I book Steve Welch to speak at my event?",
    answer:
      "Send the details through the booking form on the contact page — date, city, audience, and what you need the session to accomplish. Inquiries go directly to Steve’s team, not to an agency, and you will normally hear back within two business days.",
  },
  {
    question: "What does it cost to book Steve as a keynote speaker?",
    answer:
      "Fees depend on the date, location, format, and whether the event is corporate, association, or nonprofit. Share your budget range in the inquiry and you will get a straight answer quickly rather than a negotiation.",
  },
  {
    question: "What topics does Steve speak on?",
    answer:
      "Steve speaks about driving change through purpose, people, and process. Purpose — why value creation is the north star every stakeholder can rally behind. People — balancing diverse perspectives against functional expertise, and why the right team is the whole advantage. Process — quick iteration cycles and frameworks that let teams prioritize. Underneath all three is hyper wellness: the energy leaders need to drive change at all. Each has its own page, and every session is tailored to the audience before delivery.",
  },
  {
    question: "How long is a typical keynote?",
    answer:
      "Most are 45 to 60 minutes, with or without Q&A. Half-day workshops, executive team sessions, fireside chats, and moderated interviews are all available — the format is chosen to fit the outcome you need, not the other way around.",
  },
  {
    question: "Does Steve travel internationally?",
    answer:
      "Yes. He has spoken to audiences on multiple continents and takes international engagements, with travel arranged as part of the agreement.",
  },
  {
    question: "How far in advance should we book?",
    answer:
      "Three to six months is typical and gives the most room for tailoring the session. Shorter timelines are worth asking about — dates open up, and a direct inquiry gets an answer the same week.",
  },
  {
    question: "Can the talk be customized for our audience?",
    answer:
      "Yes, and it always is. Every engagement includes a call before the event to understand the audience, the moment the organization is in, and what the room needs to do differently afterward. Examples and framing are adjusted from there.",
  },
  {
    question: "Is Steve available for podcasts and interviews?",
    answer:
      "He takes a selected number of podcast and media appearances. Use the same contact form and mention the show, the audience, and the format.",
  },
];
