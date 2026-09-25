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
  mailingListIcon: `${base}/mailing-list-icon.svg`,

  /* Welch Family Foundation. The three partner logos come out of WordPress
     under opaque generated filenames, so they are named here by what they
     actually are — rendered and identified rather than guessed from the file. */
  foundationHero: `${base}/Steve-Welch-by-Weston-Carls-familyfoundation.jpg`,
  foundationStory: `${base}/Steve-Welch-by-Weston-Carls-125-scaled.jpg`,
  foundationClassroom: `${base}/Nicole-and-kids.jpg`,
  foundationWhatWeDoBg: `${base}/IkfcY_znLTBHpqpXYurYLOGrP4njGCdRzg.jpeg`,
  foundationLogoDestinationImagination: `${base}/boUmBooWylhi_hh7Fvam136AyN15WU4GQ.png`,
  foundationLogoUatx: `${base}/N58XcIu44uDTfk5xABEo1cHj1rKmRsLuPA.png`,
  foundationLogoIsTexas: `${base}/W7iHgeGemmW130DBLNQJGpz2q6JretgSOw.jpeg`,

  /*
    The About-page timeline, in order. Each name is the attachment_url the
    export records for the id the timeline block references — NOT the `url`
    inside the block's own JSON, which for Dreamit is stale: it says
    Dreamit-Team.jpg where the attachment is Dreamit-Team-e1723084112124.jpg,
    WordPress's edited copy. Trusting the inline url would have shipped one
    broken image out of eleven.
  */
  timelinePennState: `${base}/AF302759-0ECC-49A9-BF66-0AA257E0F2A9_1_105_c.jpeg`,
  timelineMitosFounded: `${base}/DSCN1593.jpg`,
  timelineSaratoga: `${base}/DSCN1199.jpg`,
  timelineWedding: `${base}/Foto-015-s022-scaled.jpg`,
  timelineMitosSold: `${base}/DSCN1645.jpg`,
  timelineDreamitStart: `${base}/DSC_0503-scaled.jpg`,
  timelineDreamitTeam: `${base}/Dreamit-Team-e1723084112124.jpg`,
  timelineHealth: `${base}/SDW_8971.jpg`,
  timelineRestoreStart: `${base}/W16_3327-scaled.jpg`,
  timelineRestoreScaled: `${base}/DSC_0119-scaled.jpg`,
  timelineFamilyToday: `${base}/W19_2980-scaled.jpg`,

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
  sharkSkinLogo: `${base}/shark-skin_ventures.svg`,

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
export const speakingEngagementLogos: SizedLogo[] = [
  { name: "Singtel", file: `${base}/Singtel_logo.svg`, ratio: 1.82 },
  { name: "IGNITE", file: `${base}/IGNITElogo.svg`, ratio: 3.2 },
  { name: "storeRE", file: `${base}/storeRE-1.svg`, ratio: 4.76 },
  { name: "Derma", file: `${base}/derma_green_new.svg`, ratio: 4.7 },
  { name: "Texas Medical Center", file: `${base}/texas_medical_center_logo-1.svg`, ratio: 3.16 },
  { name: "Penn State", file: `${base}/penn_state.svg`, ratio: 3.19 },
  { name: "CNBC", file: `${base}/cnbc_logo.png`, ratio: 1.31 },
  { name: "CBS", file: `${base}/cbs_logo.svg`, ratio: 3.54 },
  // The transparent cut of the same mark, so it sits on any band without a
  // white box. Same organization, same logo, as the original page.
  { name: "Children's Hospital of Philadelphia", file: `${base}/Childrens_Hospital_of_Philadelphia_1_Logo-removebg-preview.png`, ratio: 4.76 },
  { name: "National Venture Capital Association", file: `${base}/National-Venture-Capital-Association.jpg`, ratio: 3.06 },
];

export const selectedInvestmentLogos: LogoRef[] = [
  { name: "SeatGeek", file: `${base}/Seatgeek-removebg-preview.png` },
  { name: "Level Up", file: `${base}/Level-Up-removebg-preview.png` },
  { name: "Eko", file: `${base}/Eko.png` },
  { name: "Octane", file: `${base}/Octane-removebg-preview.png` },
  { name: "Houseparty", file: `${base}/Houseparty.png` },
  { name: "TrendKite", file: `${base}/Trendkite.png` },
];

export const workedWithLogos: SizedLogo[] = [
  { name: "Singtel", file: `${base}/Singtel_logo.svg`, ratio: 1.82 },
  { name: "Comcast", file: `${base}/Comcast.png`, ratio: 2.89 },
  { name: "Children's Hospital of Philadelphia", file: `${base}/Childrens_Hospital_of_Philadelphia_1_Logo-removebg-preview.png`, ratio: 4.76 },
  { name: "Blue Cross Blue Shield", file: `${base}/Blue_Cross_Blue_Shield-removebg-preview.png`, ratio: 5.14 },
  { name: "Parker Hannifin", file: `${base}/Parker-Hannifan.png`, ratio: 4.76 },
];

/**
 * BUILT FOR CHANGE — the homepage's "Selected Audiences & Organizations"
 * strip, in the packet's order (01_HOMEPAGE_COPY §10): Singtel, Texas Medical
 * Center, Children's Hospital of Philadelphia, NVCA, CNBC.
 *
 * All five are the official files already on the site — nothing redrawn,
 * nothing generated, as the packet requires. CHOP uses the transparent PNG
 * rather than the JPEG so it can sit on any background without a white box.
 * CNBC, CHOP and NVCA are raster; SVGs would be sharper and are worth asking
 * each organization for, but these are genuine.
 *
 * `ratio` is width ÷ height of the MARK AS DRAWN — measured from the pixels,
 * not read off the file. The strip uses it to normalise OPTICAL size —
 * "normalize optical height, not literal pixel height" — by giving every logo
 * the same visual area rather than the same height. At equal heights a 3:1
 * wordmark looks three times the size of a square badge.
 *
 * The distinction matters because several of these files are mostly empty.
 * The CHOP cut-out is 690×361 with the mark in the middle 40% of its height;
 * sized by the file (1.91) it came out at well under half the size of its
 * neighbours. Sized by the mark (4.76), and cropped to it by LogoStrip's
 * object-fit, it matches them. Measure a new logo the same way: the bounding
 * box of its non-white, non-transparent pixels.
 */
export type SizedLogo = LogoRef & { ratio: number };

export const selectedOrganizationLogos: SizedLogo[] = [
  { name: "Singtel", file: `${base}/Singtel_logo.svg`, ratio: 1.82 },
  { name: "Texas Medical Center", file: `${base}/texas_medical_center_logo-1.svg`, ratio: 3.16 },
  { name: "Children's Hospital of Philadelphia", file: `${base}/Childrens_Hospital_of_Philadelphia_1_Logo-removebg-preview.png`, ratio: 4.76 },
  { name: "National Venture Capital Association", file: `${base}/National-Venture-Capital-Association.jpg`, ratio: 3.06 },
  { name: "CNBC", file: `${base}/cnbc_logo.png`, ratio: 1.31 },
];

/**
 * BUILT FOR CHANGE — photography for the new homepage.
 *
 * STAND-INS. The packet names its own images (01–07 in 03_ASSET_MANIFEST) and
 * none of them have been received yet. Until they are, each slot uses the
 * best REAL photograph already on the site — never a stock image, never a
 * generated one, per the packet's asset hierarchy: "1. Real Steve photography.
 * 2. Approved AI-enhanced Steve photography. 3. No stock substitute."
 *
 * Swapping in the packet's file is one line here. The slot each packet file
 * belongs to is noted against it.
 */
export const bfc = {
  /* Steve_Welch_Keynote_Hero_Concept — the hero the revision brief names as
     the preferred asset, supplied by Steve on 2026-09-25. 1536×1024: Steve on
     stage, his slide behind him. Shown whole, "× AI THE MULTIPLIER" included,
     at Steve's direction. A larger original would sharpen it on wide retina
     screens; the page never upscales it past 1536px wide. */
  hero: `${base}/steve-welch-keynote-hero.webp`,
  heroAlt:
    "Steve Welch on stage in front of a slide reading “The fundamentals haven’t changed. Their leverage has.” with Purpose, People, Process and AI",

  /* → 03_mitos_logo_REAL.jpeg. Stand-in: a real Mitos-era photograph with the
     Mitos Technologies banner in frame — the name is shown by the real thing
     rather than by a redrawn logo. */
  mitos: `${base}/DSCN1593.jpg`,
  mitosAlt: "The Mitos Technologies team holding the company banner",

  /* → 04_dreamit_stage_REAL.jpeg. Stand-in: Steve on the Dreamit Ventures
     stage — already a real Dreamit stage photograph. */
  dreamit: `${base}/dreamit-video-poster.png`,
  dreamitAlt: "Steve Welch on stage at a Dreamit Ventures event",

  /* → 05_restore_photo_REAL.jpeg (preferred) or 06_restore_portrait_alt_REAL.
     Stand-in: Steve at a Restore studio opening, in a real Restore location. */
  restore: `${base}/W16_3327-scaled.jpg`,
  restoreAlt: "Steve Welch at the opening of a Restore Hyper Wellness studio",

  /* → 07_portrait_seated_REAL.jpeg. Stand-in: the existing seated portrait. */
  portrait: `${base}/steve-welch_hero.png`,
  portraitAlt: "Steve Welch, seated portrait",

  /* The reel poster: a real speaking frame with the audience in it. Planners
     are told to watch the audience, not the speaker. */
  reelPoster: `${base}/LI-4-scaled.jpg`,

  /* The final CTA band: stage and audience, full width, under a dark wash. */
  closing: `${base}/speaking_hero-1.png`,
} as const;
