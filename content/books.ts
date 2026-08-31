/**
 * Books — copy transcribed from stevewelch.com/books/ and /books/restore/.
 *
 * Restore keeps its own page at /books/restore/ because that URL exists and is
 * indexed on the original; the other book gets the same treatment.
 *
 * `buyUrl` on both books is the Amazon link the original's own "Buy the Book"
 * button points at, read straight out of the export's block markup. Setting it
 * switches the button on in all four places at once — the homepage feature, the
 * books index, and each book's own page — because every one of them is gated on
 * this field.
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
    buyUrl:
      "https://www.amazon.com/We-Are-All-Born-Entrepreneurs-ebook/dp/B003BNZRC4/",
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
    buyUrl:
      "https://www.amazon.com/Restore-Life-Changing-Power-Right-Away-Wellness/dp/1637745095",
  },
];

/**
 * The second featured-book block, which /books/ carries under the opt-in bar.
 * Transcribed from its own block: the heading breaks after "Born", there is an
 * <hr /> under it, and the only button is "Buy the Book" — no "Learn More",
 * which is why `learnMoreHref` is absent rather than empty.
 */
export const featuredEntrepreneurs = {
  title: "We Are All Born",
  subtitle: "Entrepreneurs",
  body: [
    {
      text:
        "We Are All Born Entrepreneurs explains why so many of us have a deep-rooted desire to be entrepreneurs, while using vivid examples of how so many entrepreneurs have succeeded in the face of adversity. Written by a successful entrepreneur in the biotech field, Steve Welch, WAABE demonstrates that there is no single path to follow to achieve one\u2019s dreams and in fact every path is different. Through hundreds of interviews Steve uses his story and those from a vast array of other entrepreneurs to explain what drives them, while sharing lessons learned from the success \u2014 and failures \u2014 of entrepreneurs.",
    },
  ],
  slug: "we-are-all-born-entrepreneurs",
};

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
  /*
    Three parts so the book title can be set in italic, which is what the
    original does — the export wraps it in <em>. The first build ran it as one
    string and opened the clause with "In", a word that is on no version of the
    page; the live page names the book, "Restore: The Life-Changing Power of
    Right-Away Wellness".
  */
  body: [
    { text: "Pain, disease, and complications of aging are universal problems, but addressing these challenges is far easier and more accessible than many people realize. " },
    { text: "Restore: The Life-Changing Power of Right-Away Wellness", em: true },
    { text: ", Jim Donnelly and Steve Welch share real-life success stories of how people used hyper-wellness therapies to drive change to their happiness, health, and productivity." },
  ],
  learnMoreHref: "/books/restore/",
  slug: "restore",
};

export const freeChapter = {
  /* Two lines: the ask, then the book's title in italic, which is how the
     original sets it — `<em>` inside the same heading. */
  heading: "Sign up and get a free chapter of Restore:",
  headingEm: "The Life Changing Power of Right-Away Wellness",
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
