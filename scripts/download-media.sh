#!/usr/bin/env bash
#
# Download every media file from the WordPress site into public/media/.
#
# WHY THIS EXISTS: WordPress has no "export media library" button, and the
# WXR export records only the URLs, not the bytes. But every one of these files
# is still served publicly by the live site, so a plain download works — no
# plugin, no FTP, no hosting login. Run this from your own machine (which can
# reach stevewelch.com) while the WordPress site is still up.
#
# THIS IS ALSO THE BACKUP. Some of these originals exist nowhere else. Run it
# BEFORE cancelling the IONOS hosting, and keep a copy somewhere off this repo.
#
# Usage:
#   cd stevewelch-site
#   bash scripts/download-media.sh
#
# Re-running is safe: existing files are skipped, so an interrupted run resumes.

set -uo pipefail
DEST="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/public/media"
mkdir -p "$DEST"

ok=0; skip=0; fail=0
failed_list=""

fetch() {
  local url="$1" name="$2"
  if [ -s "$DEST/$name" ]; then
    skip=$((skip+1)); return
  fi
  # --fail so an HTML 404 page is never saved as if it were an image.
  if curl -fsSL --retry 3 --retry-delay 2 -o "$DEST/$name" "$url"; then
    ok=$((ok+1)); printf '.'
  else
    fail=$((fail+1)); failed_list="$failed_list\n  $url"
    rm -f "$DEST/$name"
  fi
}

echo "Downloading 155 files into $DEST"
echo

fetch "https://stevewelch.com/wp-content/uploads/2024/04/steve_welch_logo.svg" "steve_welch_logo.svg"
fetch "https://stevewelch.com/wp-content/uploads/2024/04/steve_welch_logo_white.svg" "steve_welch_logo_white.svg"
fetch "https://stevewelch.com/wp-content/uploads/2024/05/2194_333-1.jpg" "2194_333-1.jpg"
fetch "https://stevewelch.com/wp-content/uploads/2024/05/2194_333.jpg" "2194_333.jpg"
fetch "https://stevewelch.com/wp-content/uploads/2024/05/65b17cbb7b3990d7dab5e291_Tom-H-1.jpg" "65b17cbb7b3990d7dab5e291_Tom-H-1.jpg"
fetch "https://stevewelch.com/wp-content/uploads/2024/05/65b17cbb7c01c1b8a3112397_John-D-1.jpg" "65b17cbb7c01c1b8a3112397_John-D-1.jpg"
fetch "https://stevewelch.com/wp-content/uploads/2024/05/65b17cbb968aacd6ef2eb522_Jake-A.jpg" "65b17cbb968aacd6ef2eb522_Jake-A.jpg"
fetch "https://stevewelch.com/wp-content/uploads/2024/05/DSC_0119-scaled.jpg" "DSC_0119-scaled.jpg"
fetch "https://stevewelch.com/wp-content/uploads/2024/05/DSC_0503-scaled.jpg" "DSC_0503-scaled.jpg"
fetch "https://stevewelch.com/wp-content/uploads/2024/05/IGNITElogo.svg" "IGNITElogo.svg"
fetch "https://stevewelch.com/wp-content/uploads/2024/05/LI-4-scaled.jpg" "LI-4-scaled.jpg"
fetch "https://stevewelch.com/wp-content/uploads/2024/05/LI-4-scaled_1600x1200_acf_cropped-1.jpg" "LI-4-scaled_1600x1200_acf_cropped-1.jpg"
fetch "https://stevewelch.com/wp-content/uploads/2024/05/LI-4-scaled_1600x1200_acf_cropped-2.jpg" "LI-4-scaled_1600x1200_acf_cropped-2.jpg"
fetch "https://stevewelch.com/wp-content/uploads/2024/05/LI-4-scaled_1600x1200_acf_cropped-3.jpg" "LI-4-scaled_1600x1200_acf_cropped-3.jpg"
fetch "https://stevewelch.com/wp-content/uploads/2024/05/Restore-36-scaled.jpg" "Restore-36-scaled.jpg"
fetch "https://stevewelch.com/wp-content/uploads/2024/05/Restore-36-scaled_1600x1200_acf_cropped-1.jpg" "Restore-36-scaled_1600x1200_acf_cropped-1.jpg"
fetch "https://stevewelch.com/wp-content/uploads/2024/05/Restore-36-scaled_1600x1200_acf_cropped-2.jpg" "Restore-36-scaled_1600x1200_acf_cropped-2.jpg"
fetch "https://stevewelch.com/wp-content/uploads/2024/05/SDW_5892-scaled.jpg" "SDW_5892-scaled.jpg"
fetch "https://stevewelch.com/wp-content/uploads/2024/05/Singtel_logo.svg" "Singtel_logo.svg"
fetch "https://stevewelch.com/wp-content/uploads/2024/05/Steve-Welch-by-Weston-Carls-75.png" "Steve-Welch-by-Weston-Carls-75.png"
fetch "https://stevewelch.com/wp-content/uploads/2024/05/The-Philadelphia-Inquirer-Logo.svg" "The-Philadelphia-Inquirer-Logo.svg"
fetch "https://stevewelch.com/wp-content/uploads/2024/05/W19_9376.jpg" "W19_9376.jpg"
fetch "https://stevewelch.com/wp-content/uploads/2024/05/Welch-5149-scaled.jpg" "Welch-5149-scaled.jpg"
fetch "https://stevewelch.com/wp-content/uploads/2024/05/Welch-5149-scaled_1600x1200_acf_cropped.jpg" "Welch-5149-scaled_1600x1200_acf_cropped.jpg"
fetch "https://stevewelch.com/wp-content/uploads/2024/05/book-2-bg.svg" "book-2-bg.svg"
fetch "https://stevewelch.com/wp-content/uploads/2024/05/book-cta.svg" "book-cta.svg"
fetch "https://stevewelch.com/wp-content/uploads/2024/05/derma_green_new.svg" "derma_green_new.svg"
fetch "https://stevewelch.com/wp-content/uploads/2024/05/dreamIT_logo.svg" "dreamIT_logo.svg"
fetch "https://stevewelch.com/wp-content/uploads/2024/05/dreamit-video-poster.png" "dreamit-video-poster.png"
fetch "https://stevewelch.com/wp-content/uploads/2024/05/ep-book_mobile.svg" "ep-book_mobile.svg"
fetch "https://stevewelch.com/wp-content/uploads/2024/05/executive-img.png" "executive-img.png"
fetch "https://stevewelch.com/wp-content/uploads/2024/05/hg-2.png" "hg-2.png"
fetch "https://stevewelch.com/wp-content/uploads/2024/05/investor-img.png" "investor-img.png"
fetch "https://stevewelch.com/wp-content/uploads/2024/05/mailing-list-icon.svg" "mailing-list-icon.svg"
fetch "https://stevewelch.com/wp-content/uploads/2024/05/penn_state.svg" "penn_state.svg"
fetch "https://stevewelch.com/wp-content/uploads/2024/05/people.svg" "people.svg"
fetch "https://stevewelch.com/wp-content/uploads/2024/05/placeholder-1.svg" "placeholder-1.svg"
fetch "https://stevewelch.com/wp-content/uploads/2024/05/placeholder.svg" "placeholder.svg"
fetch "https://stevewelch.com/wp-content/uploads/2024/05/process.svg" "process.svg"
fetch "https://stevewelch.com/wp-content/uploads/2024/05/purpose.svg" "purpose.svg"
fetch "https://stevewelch.com/wp-content/uploads/2024/05/quote.svg" "quote.svg"
fetch "https://stevewelch.com/wp-content/uploads/2024/05/restore-book-bg.svg" "restore-book-bg.svg"
fetch "https://stevewelch.com/wp-content/uploads/2024/05/restore-book__m.svg" "restore-book__m.svg"
fetch "https://stevewelch.com/wp-content/uploads/2024/05/restore-hyper-wellness.png" "restore-hyper-wellness.png"
fetch "https://stevewelch.com/wp-content/uploads/2024/05/restore-ipad-tablet.png" "restore-ipad-tablet.png"
fetch "https://stevewelch.com/wp-content/uploads/2024/05/restore_hyper-wellness_logo.svg" "restore_hyper-wellness_logo.svg"
fetch "https://stevewelch.com/wp-content/uploads/2024/05/restore_ipad.png" "restore_ipad.png"
fetch "https://stevewelch.com/wp-content/uploads/2024/05/shark-skin_logo.svg" "shark-skin_logo.svg"
fetch "https://stevewelch.com/wp-content/uploads/2024/05/speaker-img.png" "speaker-img.png"
fetch "https://stevewelch.com/wp-content/uploads/2024/05/speaking-bg-m.png" "speaking-bg-m.png"
fetch "https://stevewelch.com/wp-content/uploads/2024/05/speaking-hero-bg-m.png" "speaking-hero-bg-m.png"
fetch "https://stevewelch.com/wp-content/uploads/2024/05/speaking-people.png" "speaking-people.png"
fetch "https://stevewelch.com/wp-content/uploads/2024/05/speaking-process-1.png" "speaking-process-1.png"
fetch "https://stevewelch.com/wp-content/uploads/2024/05/speaking-purpose-1.png" "speaking-purpose-1.png"
fetch "https://stevewelch.com/wp-content/uploads/2024/05/speaking_hero-1.png" "speaking_hero-1.png"
fetch "https://stevewelch.com/wp-content/uploads/2024/05/steve-welch_hero.png" "steve-welch_hero.png"
fetch "https://stevewelch.com/wp-content/uploads/2024/05/steve-welch_speaking-bg.png" "steve-welch_speaking-bg.png"
fetch "https://stevewelch.com/wp-content/uploads/2024/05/steve_hero-mobile-1.png" "steve_hero-mobile-1.png"
fetch "https://stevewelch.com/wp-content/uploads/2024/05/storeRE-1.svg" "storeRE-1.svg"
fetch "https://stevewelch.com/wp-content/uploads/2024/05/sw_family.png" "sw_family.png"
fetch "https://stevewelch.com/wp-content/uploads/2024/05/sw_himself.png" "sw_himself.png"
fetch "https://stevewelch.com/wp-content/uploads/2024/05/texas_medical_center_logo-1.svg" "texas_medical_center_logo-1.svg"
fetch "https://stevewelch.com/wp-content/uploads/2024/06/539_Website-Thumbnail_Steve-Welch-1.png" "539_Website-Thumbnail_Steve-Welch-1.png"
fetch "https://stevewelch.com/wp-content/uploads/2024/06/626x0w.webp" "626x0w.webp"
fetch "https://stevewelch.com/wp-content/uploads/2024/06/751-Thumbnail.jpg" "751-Thumbnail.jpg"
fetch "https://stevewelch.com/wp-content/uploads/2024/06/Blue-Cross-Blue-Shield.jpg" "Blue-Cross-Blue-Shield.jpg"
fetch "https://stevewelch.com/wp-content/uploads/2024/06/Childrens_Hospital_of_Philadelphia_1_Logo.jpg" "Childrens_Hospital_of_Philadelphia_1_Logo.jpg"
fetch "https://stevewelch.com/wp-content/uploads/2024/06/Comcast.png" "Comcast.png"
fetch "https://stevewelch.com/wp-content/uploads/2024/06/Eko.png" "Eko.png"
fetch "https://stevewelch.com/wp-content/uploads/2024/06/Houseparty.png" "Houseparty.png"
fetch "https://stevewelch.com/wp-content/uploads/2024/06/Level-Up.jpg" "Level-Up.jpg"
fetch "https://stevewelch.com/wp-content/uploads/2024/06/National-Venture-Capital-Association.jpg" "National-Venture-Capital-Association.jpg"
fetch "https://stevewelch.com/wp-content/uploads/2024/06/Nicole-and-kids.jpg" "Nicole-and-kids.jpg"
fetch "https://stevewelch.com/wp-content/uploads/2024/06/Octane.jpg" "Octane.jpg"
fetch "https://stevewelch.com/wp-content/uploads/2024/06/Parker-Hannifan.png" "Parker-Hannifan.png"
fetch "https://stevewelch.com/wp-content/uploads/2024/06/RestoreChapter1_HyperWellness.pdf" "RestoreChapter1_HyperWellness.pdf"
fetch "https://stevewelch.com/wp-content/uploads/2024/06/Screenshot-2024-06-03-at-6.28.09 PM.png" "Screenshot-2024-06-03-at-6.28.09 PM.png"
fetch "https://stevewelch.com/wp-content/uploads/2024/06/Screenshot-2024-06-03-at-6.29.44 PM.png" "Screenshot-2024-06-03-at-6.29.44 PM.png"
fetch "https://stevewelch.com/wp-content/uploads/2024/06/Seatgeek.jpg" "Seatgeek.jpg"
fetch "https://stevewelch.com/wp-content/uploads/2024/06/Steve-Kitesurfing-1.jpg" "Steve-Kitesurfing-1.jpg"
fetch "https://stevewelch.com/wp-content/uploads/2024/06/Steve-Welch-by-Weston-Carls-119-scaled.jpg" "Steve-Welch-by-Weston-Carls-119-scaled.jpg"
fetch "https://stevewelch.com/wp-content/uploads/2024/06/Steve-Welch-by-Weston-Carls-125-scaled.jpg" "Steve-Welch-by-Weston-Carls-125-scaled.jpg"
fetch "https://stevewelch.com/wp-content/uploads/2024/06/Steve-Welch-by-Weston-Carls-180-scaled.jpg" "Steve-Welch-by-Weston-Carls-180-scaled.jpg"
fetch "https://stevewelch.com/wp-content/uploads/2024/06/Steve-Welch-by-Weston-Carls-19-scaled.jpg" "Steve-Welch-by-Weston-Carls-19-scaled.jpg"
fetch "https://stevewelch.com/wp-content/uploads/2024/06/Steve-Welch-by-Weston-Carls-33-scaled.jpg" "Steve-Welch-by-Weston-Carls-33-scaled.jpg"
fetch "https://stevewelch.com/wp-content/uploads/2024/06/Steve-Welch-by-Weston-Carls-50-scaled.jpg" "Steve-Welch-by-Weston-Carls-50-scaled.jpg"
fetch "https://stevewelch.com/wp-content/uploads/2024/06/Steve-Welch-by-Weston-Carls-61-scaled.jpg" "Steve-Welch-by-Weston-Carls-61-scaled.jpg"
fetch "https://stevewelch.com/wp-content/uploads/2024/06/Steve-Welch-by-Weston-Carls-62-scaled.jpg" "Steve-Welch-by-Weston-Carls-62-scaled.jpg"
fetch "https://stevewelch.com/wp-content/uploads/2024/06/Steve-Welch-by-Weston-Carls-65-scaled.jpg" "Steve-Welch-by-Weston-Carls-65-scaled.jpg"
fetch "https://stevewelch.com/wp-content/uploads/2024/06/Steve-Welch-by-Weston-Carls-89-scaled.jpg" "Steve-Welch-by-Weston-Carls-89-scaled.jpg"
fetch "https://stevewelch.com/wp-content/uploads/2024/06/Steve-Welch-by-Weston-Carls-94-scaled.jpg" "Steve-Welch-by-Weston-Carls-94-scaled.jpg"
fetch "https://stevewelch.com/wp-content/uploads/2024/06/Steve-Welch-by-Weston-Carls-familyfoundation.jpg" "Steve-Welch-by-Weston-Carls-familyfoundation.jpg"
fetch "https://stevewelch.com/wp-content/uploads/2024/06/Trendkite.png" "Trendkite.png"
fetch "https://stevewelch.com/wp-content/uploads/2024/06/W19_9376.jpg" "W19_9376.jpg"
fetch "https://stevewelch.com/wp-content/uploads/2024/06/cbs_logo.svg" "cbs_logo.svg"
fetch "https://stevewelch.com/wp-content/uploads/2024/06/cnbc_logo.png" "cnbc_logo.png"
fetch "https://stevewelch.com/wp-content/uploads/2024/06/market-scale.png" "market-scale.png"
fetch "https://stevewelch.com/wp-content/uploads/2024/06/mche-lee-PC91Jm1DlWA-unsplash-scaled.jpg" "mche-lee-PC91Jm1DlWA-unsplash-scaled.jpg"
fetch "https://stevewelch.com/wp-content/uploads/2024/06/sw-by-Weston-Carls.png" "sw-by-Weston-Carls.png"
fetch "https://stevewelch.com/wp-content/uploads/2024/06/twp.png" "twp.png"
fetch "https://stevewelch.com/wp-content/uploads/2024/07/Athletech-News.png" "Athletech-News.png"
fetch "https://stevewelch.com/wp-content/uploads/2024/07/Blue_Cross_Blue_Shield-removebg-preview.png" "Blue_Cross_Blue_Shield-removebg-preview.png"
fetch "https://stevewelch.com/wp-content/uploads/2024/07/Childrens_Hospital_of_Philadelphia_1_Logo-removebg-preview.png" "Childrens_Hospital_of_Philadelphia_1_Logo-removebg-preview.png"
fetch "https://stevewelch.com/wp-content/uploads/2024/07/DSCN1199.jpg" "DSCN1199.jpg"
fetch "https://stevewelch.com/wp-content/uploads/2024/07/DSCN1593.jpg" "DSCN1593.jpg"
fetch "https://stevewelch.com/wp-content/uploads/2024/07/DSCN1645.jpg" "DSCN1645.jpg"
fetch "https://stevewelch.com/wp-content/uploads/2024/07/DSC_0119-scaled-1.jpg" "DSC_0119-scaled-1.jpg"
fetch "https://stevewelch.com/wp-content/uploads/2024/07/DSC_0119-scaled.jpg" "DSC_0119-scaled.jpg"
fetch "https://stevewelch.com/wp-content/uploads/2024/07/DSC_0503-scaled-1.jpg" "DSC_0503-scaled-1.jpg"
fetch "https://stevewelch.com/wp-content/uploads/2024/07/DSC_0503-scaled.jpg" "DSC_0503-scaled.jpg"
fetch "https://stevewelch.com/wp-content/uploads/2024/07/Dreamit-Team-e1723084112124.jpg" "Dreamit-Team-e1723084112124.jpg"
fetch "https://stevewelch.com/wp-content/uploads/2024/07/Foto-015-s022-scaled.jpg" "Foto-015-s022-scaled.jpg"
fetch "https://stevewelch.com/wp-content/uploads/2024/07/HomesAndGardens-e1720753218839.png" "HomesAndGardens-e1720753218839.png"
fetch "https://stevewelch.com/wp-content/uploads/2024/07/IMG_1659-scaled-aspect-ratio-800-600-scaled.jpg" "IMG_1659-scaled-aspect-ratio-800-600-scaled.jpg"
fetch "https://stevewelch.com/wp-content/uploads/2024/07/IMG_1659-scaled.jpg" "IMG_1659-scaled.jpg"
fetch "https://stevewelch.com/wp-content/uploads/2024/07/IMG_1659-scaled_1600x1200_acf_cropped.jpg" "IMG_1659-scaled_1600x1200_acf_cropped.jpg"
fetch "https://stevewelch.com/wp-content/uploads/2024/07/Level-Up-removebg-preview.png" "Level-Up-removebg-preview.png"
fetch "https://stevewelch.com/wp-content/uploads/2024/07/Octane-removebg-preview.png" "Octane-removebg-preview.png"
fetch "https://stevewelch.com/wp-content/uploads/2024/07/Restore-36-scaled-aspect-ratio-800-600-1.jpg" "Restore-36-scaled-aspect-ratio-800-600-1.jpg"
fetch "https://stevewelch.com/wp-content/uploads/2024/07/Restore-36-scaled-aspect-ratio-800-600-2.jpg" "Restore-36-scaled-aspect-ratio-800-600-2.jpg"
fetch "https://stevewelch.com/wp-content/uploads/2024/07/Restore-36-scaled-aspect-ratio-800-600.jpg" "Restore-36-scaled-aspect-ratio-800-600.jpg"
fetch "https://stevewelch.com/wp-content/uploads/2024/07/Restore-36-scaled.jpg" "Restore-36-scaled.jpg"
fetch "https://stevewelch.com/wp-content/uploads/2024/07/Restore-36-scaled_1600x1200_acf_cropped-1.jpg" "Restore-36-scaled_1600x1200_acf_cropped-1.jpg"
fetch "https://stevewelch.com/wp-content/uploads/2024/07/Restore-36-scaled_1600x1200_acf_cropped-2.jpg" "Restore-36-scaled_1600x1200_acf_cropped-2.jpg"
fetch "https://stevewelch.com/wp-content/uploads/2024/07/Restore-36-scaled_1600x1200_acf_cropped.jpg" "Restore-36-scaled_1600x1200_acf_cropped.jpg"
fetch "https://stevewelch.com/wp-content/uploads/2024/07/SDW_8971.jpg" "SDW_8971.jpg"
fetch "https://stevewelch.com/wp-content/uploads/2024/07/Seatgeek-removebg-preview.png" "Seatgeek-removebg-preview.png"
fetch "https://stevewelch.com/wp-content/uploads/2024/07/Steve-Car-Sleeping-1.jpg" "Steve-Car-Sleeping-1.jpg"
fetch "https://stevewelch.com/wp-content/uploads/2024/07/Steve-Car-Sleeping.jpg" "Steve-Car-Sleeping.jpg"
fetch "https://stevewelch.com/wp-content/uploads/2024/07/Steve-Dreamit-Partners.jpg" "Steve-Dreamit-Partners.jpg"
fetch "https://stevewelch.com/wp-content/uploads/2024/07/Steve-Family.jpg" "Steve-Family.jpg"
fetch "https://stevewelch.com/wp-content/uploads/2024/07/Steve-Mitos-1.jpg" "Steve-Mitos-1.jpg"
fetch "https://stevewelch.com/wp-content/uploads/2024/07/Steve-Mitos-Product.jpg" "Steve-Mitos-Product.jpg"
fetch "https://stevewelch.com/wp-content/uploads/2024/07/Steve-Mitos.jpg" "Steve-Mitos.jpg"
fetch "https://stevewelch.com/wp-content/uploads/2024/07/Steve-Restore.jpg" "Steve-Restore.jpg"
fetch "https://stevewelch.com/wp-content/uploads/2024/07/Steve-Wakeboarding.jpg" "Steve-Wakeboarding.jpg"
fetch "https://stevewelch.com/wp-content/uploads/2024/07/Steve-Welch600.jpg" "Steve-Welch600.jpg"
fetch "https://stevewelch.com/wp-content/uploads/2024/07/Steve-and-Nicole-Marriage.jpg" "Steve-and-Nicole-Marriage.jpg"
fetch "https://stevewelch.com/wp-content/uploads/2024/07/TheWashingtonPost-e1720753158751.png" "TheWashingtonPost-e1720753158751.png"
fetch "https://stevewelch.com/wp-content/uploads/2024/07/W16_3327-scaled.jpg" "W16_3327-scaled.jpg"
fetch "https://stevewelch.com/wp-content/uploads/2024/07/W19_2980-scaled.jpg" "W19_2980-scaled.jpg"
fetch "https://stevewelch.com/wp-content/uploads/2024/07/W19_5845-scaled.jpg" "W19_5845-scaled.jpg"
fetch "https://stevewelch.com/wp-content/uploads/2024/07/W19_6514-scaled-aspect-ratio-800-600-scaled.jpg" "W19_6514-scaled-aspect-ratio-800-600-scaled.jpg"
fetch "https://stevewelch.com/wp-content/uploads/2024/07/W19_6514-scaled.jpg" "W19_6514-scaled.jpg"
fetch "https://stevewelch.com/wp-content/uploads/2024/07/W19_6514-scaled_1600x1200_acf_cropped.jpg" "W19_6514-scaled_1600x1200_acf_cropped.jpg"
fetch "https://stevewelch.com/wp-content/uploads/2024/07/athletech-logo.png" "athletech-logo.png"
fetch "https://stevewelch.com/wp-content/uploads/2024/07/home-restore-img-2.png" "home-restore-img-2.png"
fetch "https://stevewelch.com/wp-content/uploads/2024/07/steve_welch_favicon.png" "steve_welch_favicon.png"
fetch "https://stevewelch.com/wp-content/uploads/2024/08/AF302759-0ECC-49A9-BF66-0AA257E0F2A9_1_105_c.jpeg" "AF302759-0ECC-49A9-BF66-0AA257E0F2A9_1_105_c.jpeg"
fetch "https://stevewelch.com/wp-content/uploads/2024/08/dreamit.png" "dreamit.png"
fetch "https://stevewelch.com/wp-content/uploads/2024/08/steve-welch-featured-image-e1723082915340.png" "steve-welch-featured-image-e1723082915340.png"
fetch "https://stevewelch.com/wp-content/uploads/2025/05/IkfcY_znLTBHpqpXYurYLOGrP4njGCdRzg.jpeg" "IkfcY_znLTBHpqpXYurYLOGrP4njGCdRzg.jpeg"
fetch "https://stevewelch.com/wp-content/uploads/2025/05/N58XcIu44uDTfk5xABEo1cHj1rKmRsLuPA.png" "N58XcIu44uDTfk5xABEo1cHj1rKmRsLuPA.png"
fetch "https://stevewelch.com/wp-content/uploads/2025/05/W7iHgeGemmW130DBLNQJGpz2q6JretgSOw.jpeg" "W7iHgeGemmW130DBLNQJGpz2q6JretgSOw.jpeg"
fetch "https://stevewelch.com/wp-content/uploads/2025/05/boUmBooWylhi_hh7Fvam136AyN15WU4GQ.png" "boUmBooWylhi_hh7Fvam136AyN15WU4GQ.png"

echo
echo "----------------------------------------"
echo "  downloaded: $ok"
echo "  already had: $skip"
echo "  failed: $fail"
if [ "$fail" -gt 0 ]; then
  echo
  echo "These did not come down (the file may have been deleted from the server):"
  printf "$failed_list\n"
  echo
  echo "Tell Claude which ones failed — the site is built to degrade gracefully"
  echo "when an image is missing, so nothing breaks."
fi
echo
echo "Now commit them:  git add public/media && git commit -m 'Add media from WordPress'"
