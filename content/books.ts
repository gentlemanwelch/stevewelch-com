/**
 * Books — copy transcribed from stevewelch.com/books/ and /books/restore/.
 *
 * Restore keeps its own page at /books/restore/ because that URL exists and is
 * indexed on the original; the other book gets the same treatment.
 *
 * REVIEW: `buyUrl` is empty on both. The original renders a "Buy the Book"
 * button, but the export stores the label without a resolvable destination.
 * Add the retailer links and the buttons switch on everywhere at once.
 */

export type Book = {
  slug: string;
  title: string;
  subtitle?: string;
  role: string;
  blurb: string;
  description: string[];
  buyUrl?: string;
};

export const books: Book[] = [
  {
    slug: "we-are-all-born-entrepreneurs",
    title: "We Are All Born Entrepreneurs",
    role: "Author",
    blurb:
      "Why so many of us have a deep-rooted desire to be entrepreneurs — and how so many have succeeded in the face of adversity.",
    description: [
      "We Are All Born Entrepreneurs explains why so many of us have a deep-rooted desire to be entrepreneurs, while using vivid examples of how so many entrepreneurs have succeeded in the face of adversity.",
      "Written by a successful entrepreneur in the biotech field, WAABE demonstrates that there is no single path to follow to achieve one's dreams — and in fact every path is different.",
      "Through hundreds of interviews Steve uses his story and those from a vast array of other entrepreneurs to explain what drives them, while sharing lessons learned from the successes — and the failures — of entrepreneurs.",
    ],
    // buyUrl: "", // REVIEW: add retailer link
  },
  {
    slug: "restore",
    title: "Restore",
    subtitle: "The Life-Changing Power of Right-Away Wellness",
    role: "Co-author, with Jim Donnelly",
    blurb:
      "Pain, disease, and the complications of aging are universal problems — and far more addressable than most people realize.",
    description: [
      "Pain, disease, and complications of aging are universal problems, but addressing these challenges is far easier and more accessible than many people realize.",
      "In The Life-Changing Power of Right-Away Wellness, Jim Donnelly and Steve Welch share real-life success stories of how people used hyper-wellness therapies to drive change to their happiness, health, and productivity.",
    ],
    // buyUrl: "", // REVIEW: add retailer link
  },
];

export function getBook(slug: string): Book | undefined {
  return books.find((b) => b.slug === slug);
}

/**
 * The featured book block, as it appears on the homepage and elsewhere. On the
 * original this is a theme-level block with the same content everywhere, which
 * is why the page export carried no data for it.
 */
export const featuredBook = {
  eyebrow: "About the Book",
  title: "Restore:",
  subtitle: "The Life-Changing Power of Right Away Wellness",
  body: "Pain, disease, and complications of aging are universal problems, but addressing these challenges is far easier and more accessible than many people realize. In The Life-Changing Power of Right-Away Wellness, Jim Donnelly and Steve Welch share real-life success stories of how people used hyper-wellness therapies to drive change to their happiness, health, and productivity.",
  learnMoreHref: "/books/restore/",
  slug: "restore",
};

export const freeChapter = {
  heading:
    "Sign up and get a free chapter of Restore: The Life Changing Power of Right-Away Wellness",
  cta: "Get the free chapter",
  /**
   * The chapter itself, which came down with the media and had been sitting
   * unused while the opt-in promised it. Linking straight to it delivers the
   * thing immediately.
   *
   * DECISION: no email gate. The original puts a Gravity Form here and captures
   * an address first. That is a defensible trade, and it is available whenever
   * you want it — but an ungated PDF earns a Google Ads landing page a better
   * Landing Page Experience score than a form wall does, and this site's
   * revenue comes from bookings rather than from a mailing list. Say the word
   * and it becomes a form.
   */
  pdfHref: "/media/RestoreChapter1_HyperWellness.pdf",
};
