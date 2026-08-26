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

export type Video = { title: string; youtubeId: string; url: string };

export const videos: Video[] = [
  {
    title: "DreamIt Health Philadelphia 2013: Closing Remarks",
    youtubeId: "m5oykqwZjUU",
    url: "https://www.youtube.com/watch?v=m5oykqwZjUU",
  },
  {
    title: "Ted Mann 'DreamIt Impact'",
    youtubeId: "quMjtYvSMaw",
    url: "https://www.youtube.com/watch?v=quMjtYvSMaw",
  },
  {
    title: "Trendkite: The DreamIt Difference",
    youtubeId: "L_zurcj4ceo",
    url: "https://www.youtube.com/watch?v=L_zurcj4ceo",
  },
];

export type Appearance = {
  outlet: string;
  title: string;
  url: string;
  /** Label on the link, matching the original page. */
  action: string;
};

export const podcasts: Appearance[] = [
  {
    outlet: "Myers Detox",
    title: "Restoring Hyper Wellness with Cryotherapy and Saunas with Steve Welch",
    url: "https://myersdetox.com/stevewelch/",
    action: "Listen Now",
  },
  {
    outlet: "Power Athlete",
    title: "Tales of Recovery Resilience",
    url: "https://powerathletehq.com/ep-751-tales-of-recovery-resilience/",
    action: "Listen Now",
  },
  {
    outlet: "Beyond 7 Figures",
    title: "The Passion to Driving Innovation in Wellness feat. Steve Welch",
    url: "https://podcasts.apple.com/us/podcast/the-passion-to-driving-innovation-in-wellness-feat/id1476094077?i=1000653692442",
    action: "Listen Now",
  },
  {
    outlet: "Live Long and Master Aging",
    title: "What It Means to Be Hyper Well",
    url: "https://www.llamapodcast.com/steve-welch/",
    action: "Listen Now",
  },
];

export const publications: Appearance[] = [
  {
    outlet: "Homes & Gardens",
    title:
      "David Beckham's cold plunge embodies a wellness design trend with important health benefits",
    url: "https://www.homesandgardens.com/celebrity-style/david-beckham-cold-plunge-pool",
    action: "Read Article",
  },
  {
    outlet: "The Washington Post",
    title:
      "The new cure-all for vacation excess: The IV drip — IV therapy has moved from hospitals to luxury spas, hotels and Airbnb house calls",
    url: "https://www.washingtonpost.com/travel/2024/05/04/iv-therapy-hotel-spa-las-vegas/",
    action: "Read Article",
  },
  {
    outlet: "Athletech News",
    title: "Wellness Therapies Like Red Light Show Promise, Restore Study Finds",
    url: "https://athletechnews.com/wellness-therapies-like-red-light-show-promise-restore-study/",
    action: "Read Article",
  },
  {
    outlet: "MarketScale",
    title:
      "With Walmart Health shuttering its doors, retail healthcare has to rethink its role and strategy in primary care",
    url: "https://marketscale.com/industries/healthcare/with-walmart-health-shuttering-its-doors-retail-healthcare-has-to-rethink-its-role-strategy-in-primary-care/",
    action: "Read Article",
  },
];

export const expertTalks: Appearance[] = [
  {
    outlet: "Myers Detox",
    title: "What is Retail Healthcare's value proposition?",
    url: "https://myersdetox.com/stevewelch/",
    action: "Watch Now",
  },
];

export const podcastNote = "Steve is available for select podcast opportunities.";
