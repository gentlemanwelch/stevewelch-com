/**
 * Image paths.
 *
 * Every filename here came out of the WordPress export's attachment records, so
 * these match the originals exactly. The files themselves are NOT in the export
 * — WXR stores URLs, not bytes — so fetch them with:
 *
 *     bash scripts/download-media.sh
 *
 * That pulls all 155 files from the live site into public/media/. Until it is
 * run, every component that consumes this file falls back gracefully: no broken
 * image icons, no layout collapse. The site is fully functional without them.
 *
 * FILENAME COLLISIONS: six files were uploaded to WordPress twice, into
 * different month folders, under identical names. The download script gives the
 * EARLIEST upload of each the bare filename and prefixes the later one with its
 * YYYY-MM. Every path below refers to the bare name, which is the copy the
 * original pages reference — `speakingReelPoster` is the case that matters, and
 * it resolves to attachment 1861 (2024/05), the one the speaking page used.
 *
 * If you ever repoint one of these at a `2024-07-`-prefixed file, check the
 * original page first: the two copies are not guaranteed to be identical.
 */

const base = "/media";

export const img = {
  logo: `${base}/steve_welch_logo.svg`,
  logoWhite: `${base}/steve_welch_logo_white.svg`,
  favicon: `${base}/steve_welch_favicon.png`,

  homeHero: `${base}/steve-welch_hero.png`,
  homeHeroMobile: `${base}/steve_hero-mobile-1.png`,
  speakingBg: `${base}/steve-welch_speaking-bg.png`,

  // The /speaking/ hero. Its block names attachment 1932 — speaking_hero-1.png,
  // the shot of Steve on stage — with 1906 (speaking-hero-bg-m.png) as the
  // mobile alternative. The first build pointed the hero at speakingBg, which
  // is a different picture and belongs to the home page's speaking panel.
  speakingHero: `${base}/speaking_hero-1.png`,
  speakingHeroMobile: `${base}/speaking-hero-bg-m.png`,

  investor: `${base}/investor-img.png`,
  executive: `${base}/executive-img.png`,
  speaker: `${base}/speaker-img.png`,

  aboutFamily: `${base}/W19_6514-scaled-aspect-ratio-800-600-scaled.jpg`,
  aboutHimself: `${base}/IMG_1659-scaled-aspect-ratio-800-600-scaled.jpg`,
  aboutWork: `${base}/Restore-36-scaled-aspect-ratio-800-600-2.jpg`,

  speakingReelPoster: `${base}/DSC_0503-scaled.jpg`,

  /*
    Book feature artwork. Each is a full-bleed background: a pale-blue field
    with the 3D cover and its decorative wellness icons sitting on the RIGHT and
    the left two-thirds left empty for the copy to sit in. The mobile variants
    are recomposed portrait, cover above the text — not the same file scaled.
  */
  restoreBookBg: `${base}/restore-book-bg.svg`,
  restoreBookBgMobile: `${base}/restore-book__m.svg`,
  entrepreneursBookBg: `${base}/book-2-bg.svg`,
  entrepreneursBookBgMobile: `${base}/ep-book_mobile.svg`,

  /* The Restore wordmark, which the original uses in place of a text heading. */
  restoreLogo: `${base}/restore_hyper-wellness_logo.svg`,
  /* Two therapy photographs, already composited into one transparent PNG —
     the offset overlap is baked into the file, so it needs no CSS to rebuild. */
  restoreComposite: `${base}/home-restore-img-2.png`,

  /* The About hero. The first build used a Restore studio photo here, which was
     simply the wrong file — the original's hero is this one. */
  aboutHero: `${base}/W19_5845-scaled.jpg`,

  /* Investment vehicle marks, for the two cards on /about/. */
  dreamitLogo: `${base}/dreamIT_logo.svg`,
  sharkSkinLogo: `${base}/shark-skin_logo.svg`,

  /* Sits beside the "sparks off an anvil" quote on /speaking/, which is where
     the original puts it — the line is a Philadelphia Inquirer quote, and the
     masthead is what makes it read as a citation rather than a slogan. */
  inquirerLogo: `${base}/The-Philadelphia-Inquirer-Logo.svg`,

  /* The lead magnet the opt-in has been promising and not delivering. */
  freeChapterPdf: `${base}/RestoreChapter1_HyperWellness.pdf`,
} as const;

export type LogoRef = { name: string; file: string };

/**
 * The three logo walls, in the order the WordPress pages render them.
 *
 * These are real. The first rebuild shipped an empty `pastClients` array
 * because nothing verifiable was available and inventing a logo wall is the
 * fastest way to lose a booking when someone checks. The export settled it —
 * every organization below is one the original site already lists.
 */
export const speakingEngagementLogos: LogoRef[] = [
  { name: "Singtel", file: `${base}/Singtel_logo.svg` },
  { name: "IGNITE", file: `${base}/IGNITElogo.svg` },
  { name: "storeRE", file: `${base}/storeRE-1.svg` },
  { name: "Derma", file: `${base}/derma_green_new.svg` },
  { name: "Texas Medical Center", file: `${base}/texas_medical_center_logo-1.svg` },
  { name: "Penn State", file: `${base}/penn_state.svg` },
  { name: "CNBC", file: `${base}/cnbc_logo.png` },
  { name: "CBS", file: `${base}/cbs_logo.svg` },
  { name: "Children's Hospital of Philadelphia", file: `${base}/Childrens_Hospital_of_Philadelphia_1_Logo.jpg` },
  { name: "National Venture Capital Association", file: `${base}/National-Venture-Capital-Association.jpg` },
];

export const selectedInvestmentLogos: LogoRef[] = [
  { name: "SeatGeek", file: `${base}/Seatgeek-removebg-preview.png` },
  { name: "Level Up", file: `${base}/Level-Up-removebg-preview.png` },
  { name: "Eko", file: `${base}/Eko.png` },
  { name: "Octane", file: `${base}/Octane-removebg-preview.png` },
  { name: "Houseparty", file: `${base}/Houseparty.png` },
  { name: "TrendKite", file: `${base}/Trendkite.png` },
];

export const workedWithLogos: LogoRef[] = [
  { name: "Singtel", file: `${base}/Singtel_logo.svg` },
  { name: "Comcast", file: `${base}/Comcast.png` },
  { name: "Children's Hospital of Philadelphia", file: `${base}/Childrens_Hospital_of_Philadelphia_1_Logo-removebg-preview.png` },
  { name: "Blue Cross Blue Shield", file: `${base}/Blue_Cross_Blue_Shield-removebg-preview.png` },
  { name: "Parker Hannifin", file: `${base}/Parker-Hannifan.png` },
];
