/**
 * Endorsements.
 *
 * REAL, and named — recovered from the testimonial slider on
 * stevewelch.com/books/restore/. The first rebuild left this file empty on
 * principle, because inventing a testimonial is the fastest way to lose a
 * booking when someone checks. It no longer needs to be empty.
 *
 * These endorse the BOOK rather than a speaking engagement, and they are
 * labelled that way wherever they appear. Presenting a book blurb as though a
 * conference organizer said it would be the same dishonesty in a smaller coat.
 *
 * STILL WORTH DOING: collect endorsements from event organizers. A booker
 * choosing between two speakers at the same fee decides on evidence that
 * someone else booked you and was glad. Ask the week after each event, and get
 * a name, a title, and an organization.
 */

export type Testimonial = {
  quote: string;
  name: string;
  title: string;
  /** What is being endorsed — so nothing is implied that was not said. */
  subject: "book";
};

export const testimonials: Testimonial[] = [
  {
    quote:
      "Restore: The Life-changing Power of Right-away Wellness by Jim Donnelly and Steve Welch, is a quick and practical guide on how to improve one's health. Presented by two successful entrepreneurs who have built the largest retail health company in the country, this book provides an amazing roadmap for what to do today to have a better life tomorrow. The authors took the complexities of our health and wellness and boiled them down into an understandable journey.",
    name: "Jake Arrieta",
    title:
      "Former Major League Baseball Pitcher, World Series Champion, & Cy Young Winner",
    subject: "book",
  },
  {
    quote:
      "Restore: The Life-changing Power of Right-away Wellness by Jim Donnelly and Steve Welch, presents a groundbreaking approach to health and well-being, encompassing a diverse range of individuals, from professional athletes to everyday people facing various health challenges. The authors explore the potential benefits of immediate interventions, offering insights into how they can contribute to overall wellness and alleviate suffering. Backed by expert insights and inspiring stories, this book invites readers to consider the potential impact of immediate wellness strategies on their lives.",
    name: "John Day, M.D.",
    title: 'Author of "The A-Fib Cure" and "The Longevity Plan"',
    subject: "book",
  },
  {
    quote:
      "Restore: The Life-changing Power of Right-away Wellness is a practical guide to achieving a state of hyper wellness. Jim Donnelly and Steve Welch's approach is both insightful and practical, providing actionable steps to unlock the body's full potential for health and vitality. The book is filled with evidence-based information on nutrition, exercise, and mindfulness, all aimed at helping individuals take charge of their well-being. I recommend Restore for anyone seeking to design a roadmap to optimal health.",
    name: "Tom Hale",
    title: "CEO of Oura Ring",
    subject: "book",
  },
];
