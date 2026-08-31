/**
 * Writings + Media — transcribed from the WordPress export.
 *
 * The first rebuild shipped this list EMPTY because nothing was recoverable and
 * a fabricated back catalogue is worse than an honest blank. The export
 * settled it: every item below is real, with the original's own titles and
 * outbound links.
 */

export const mediaIntro =
  "Learn about Steve through his appearances in expert talks, podcasts, and other media.";

export type Video = {
  title: string;
  youtubeId: string;
  url: string;
  /**
   * The poster frame the original serves for this video.
   *
   * Without one, VideoEmbed falls back to i.ytimg.com — a third-party request
   * on every page load for an image we already own.
   */
  poster?: string;
};

export const videos: Video[] = [
  {
    title: "DreamIt Health Philadelphia 2013: Closing Remarks",
    youtubeId: "m5oykqwZjUU",
    url: "https://www.youtube.com/watch?v=m5oykqwZjUU",
    poster: "/media/speaking-bg-m.png",
  },
  {
    title: "Ted Mann 'DreamIt Impact'",
    youtubeId: "quMjtYvSMaw",
    url: "https://www.youtube.com/watch?v=quMjtYvSMaw",
    poster: "/media/Screenshot-2024-06-03-at-6.28.09-PM.png",
  },
  {
    title: "Trendkite: The DreamIt Difference",
    youtubeId: "L_zurcj4ceo",
    url: "https://www.youtube.com/watch?v=L_zurcj4ceo",
    poster: "/media/Screenshot-2024-06-03-at-6.29.44-PM.png",
  },
];

export type Appearance = {
  outlet: string;
  title: string;
  url: string;
  /** Label on the link, matching the original page. */
  action: string;
  /**
   * Artwork from the original: an episode thumbnail for podcasts, a masthead
   * for publications. All of these were in the media library and unused — the
   * first build rendered these lists as plain text.
   *
   * Where the original referenced a WordPress-generated size variant (a
   * `-300x140` crop), this points at the full-size original instead and lets
   * CSS do the sizing — the variants were never downloaded, and the originals
   * are better source material anyway.
   */
  image?: string;
};

export const podcasts: Appearance[] = [
  {
    outlet: "Myers Detox",
    title: "Restoring Hyper Wellness with Cryotherapy and Saunas with Steve Welch",
    image: "/media/539_Website-Thumbnail_Steve-Welch-1.png",
    url: "https://myersdetox.com/stevewelch/",
    action: "Listen Now",
  },
  {
    outlet: "Power Athlete",
    title: "Tales of Recovery Resilience",
    image: "/media/751-Thumbnail.jpg",
    url: "https://powerathletehq.com/ep-751-tales-of-recovery-resilience/",
    action: "Listen Now",
  },
  {
    outlet: "Beyond 7 Figures",
    title: "The Passion to Driving Innovation in Wellness feat. Steve Welch",
    image: "/media/626x0w.webp",
    url: "https://podcasts.apple.com/us/podcast/the-passion-to-driving-innovation-in-wellness-feat/id1476094077?i=1000653692442",
    action: "Listen Now",
  },
  {
    outlet: "Live Long and Master Aging",
    title: "What It Means to Be Hyper Well",
    image: "/media/Steve-Welch600.jpg",
    url: "https://www.llamapodcast.com/steve-welch/",
    action: "Listen Now",
  },
];

export const publications: Appearance[] = [
  {
    outlet: "Homes & Gardens",
    image: "/media/HomesAndGardens-e1720753218839.png",
    title:
      "David Beckham's cold plunge embodies a wellness design trend with important health benefits",
    url: "https://www.homesandgardens.com/celebrity-style/david-beckham-cold-plunge-pool",
    action: "Read Article",
  },
  {
    outlet: "The Washington Post",
    image: "/media/TheWashingtonPost-e1720753158751.png",
    title:
      "The new cure-all for vacation excess: The IV drip — IV therapy has moved from hospitals to luxury spas, hotels and Airbnb house calls",
    url: "https://www.washingtonpost.com/travel/2024/05/04/iv-therapy-hotel-spa-las-vegas/",
    action: "Read Article",
  },
  {
    outlet: "Athletech News",
    image: "/media/athletech-logo.png",
    title: "Wellness Therapies Like Red Light Show Promise, Restore Study Finds",
    url: "https://athletechnews.com/wellness-therapies-like-red-light-show-promise-restore-study/",
    action: "Read Article",
  },
];

/**
 * DEVIATION FROM THE ORIGINAL, deliberate.
 *
 * This row is labelled "Myers Detox" on stevewelch.com, but it carries the
 * MarketScale logo and links to a MarketScale article — the label is a leftover
 * from a duplicated row. The outlet is corrected here to match the logo and the
 * destination, which is what a reader clicking "Watch Now" actually gets.
 *
 * The same URL was also listed under Media Publications in the first build, so
 * one item appeared twice; it now appears once, here, where the original puts
 * it.
 */
export const expertTalks: Appearance[] = [
  {
    outlet: "MarketScale",
    image: "/media/market-scale.png",
    title: "What is Retail Healthcare's value proposition?",
    url: "https://marketscale.com/industries/healthcare/with-walmart-health-shuttering-its-doors-retail-healthcare-has-to-rethink-its-role-strategy-in-primary-care/",
    action: "Watch Now",
  },
];

export const podcastNote = "Steve is available for select podcast opportunities.";
