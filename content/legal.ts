/**
 * Legal pages.
 *
 * THE TERMS are transcribed from the WordPress export. They carry real
 * obligations, so nothing was paraphrased, summarised, or "improved": the text
 * is the site's own, flattened into headings, paragraphs and list items so it
 * can be rendered without injecting raw HTML.
 *
 * THE TERMS WERE MISSING THEIR PARAGRAPHS UNTIL 2026-11-11. The export stores
 * each paragraph as a bare <span> between blank lines, not a <p>, and the first
 * transcription kept only the headings and list items. The live page showed
 * fourteen headings with nothing under them, and never named who operates the
 * site. All 29 paragraphs were restored that day from the same export.
 *
 * SEVEN THINGS DIFFER FROM THE ORIGINAL TERMS, all on Steve's instructions of
 * 2026-11-11:
 *   1. The opening names Shark Skin Management, LLC, a Texas limited liability
 *      company. The original named Welch Phoenixville, LLC, of Pennsylvania.
 *   2. "LAST MODIFIED" is the date of that change.
 *   3. The copyright line names the new entity, without the old "2007".
 *   4. "(LOCATED HERE)" was a link; it now spells out the privacy page's address.
 *   5. The Terms are governed by the laws of Texas, not Pennsylvania.
 *   6. Venue is "the state and federal courts located in the State of Texas".
 *      The original named a Pennsylvania federal district and a Philadelphia
 *      court. Steve gave the governing law; no Texas district or county was
 *      given, so none is named. Name one here if he supplies it.
 *   7. The contact address is steve@stevewelch.com, the only address the site
 *      has. The original gave info@.
 *
 * THE PRIVACY POLICY IS A REWRITE, NOT A TRANSCRIPTION (2026-11-11). The
 * WordPress one was dated 1 July 2024, had lost its headings and paragraphs
 * in the same way, and described sweepstakes, text messages and lookalike
 * audiences that this site has never used. Steve settled the facts in the new
 * one that day: the operator (Shark Skin Management, LLC, of Texas), Supabase
 * as the store, three years' retention, and that the Foundation form follows
 * the same rules.
 *
 * It describes the site as it will work once inquiries are stored and the
 * speaking campaign runs. Three statements are ahead of the build on purpose
 * and must stay true as it lands: the booking step (Google Calendar and Meet),
 * the two follow-up emails and their stop rules, and the hashed email address
 * sent to Google for advertising measurement ("may").
 *
 * It makes two promises in Steve's name: an answer to a request about
 * someone's information within 30 days, and deletion on request.
 *
 * NOT IN IT YET: a mailing address. Add it to "Who we are" and "Contact" when
 * the PO box exists.
 */

export type LegalBlock = { kind: "heading" | "p" | "li"; text: string };

export const privacyPolicy: LegalBlock[] = [
  {
    "kind": "p",
    "text": "Effective November 11, 2026"
  },
  {
    "kind": "heading",
    "text": "Who we are"
  },
  {
    "kind": "p",
    "text": "This website, www.stevewelch.com, is operated by Shark Skin Management, LLC, a Texas limited liability company (“we”, “us”). It is the site of Steve Welch, an entrepreneur, investor and keynote speaker. You can reach us at steve@stevewelch.com."
  },
  {
    "kind": "heading",
    "text": "What we collect"
  },
  {
    "kind": "p",
    "text": "What you give us:"
  },
  {
    "kind": "li",
    "text": "When you send an inquiry: your name, email address, organization, the details of your event, your budget, and anything else you write."
  },
  {
    "kind": "li",
    "text": "When you book a call: your name, your email address and the time you choose. Booking is handled by Google Calendar, and calls take place on Google Meet."
  },
  {
    "kind": "li",
    "text": "When you email us: your message and your email address."
  },
  {
    "kind": "li",
    "text": "When you write to the Welch Family Foundation through this site: your organization, your name, email address, phone number, website and mailing address, and what you tell us about your work."
  },
  {
    "kind": "p",
    "text": "What is collected automatically:"
  },
  {
    "kind": "li",
    "text": "How the site is used: the pages you view, roughly where you are, the kind of device and browser you use, and the site that sent you here. We use Google Analytics for this, which sets cookies."
  },
  {
    "kind": "li",
    "text": "Advertising details: if you arrive by clicking one of our Google advertisements, the ad-click identifier and campaign tags in the link are stored in your browser for up to 90 days and sent to us with your inquiry."
  },
  {
    "kind": "li",
    "text": "Technical records: our hosting provider records your IP address and browser type when you visit."
  },
  {
    "kind": "heading",
    "text": "How we use it"
  },
  {
    "kind": "li",
    "text": "To answer your inquiry, whether about a speaking engagement or the Foundation, and to arrange a call with Steve."
  },
  {
    "kind": "li",
    "text": "To send you up to two follow-up emails about a speaking inquiry. They stop when you reply, book a call, or ask us to stop."
  },
  {
    "kind": "li",
    "text": "To keep a record of your inquiry and what followed."
  },
  {
    "kind": "li",
    "text": "To learn which pages and advertisements lead to inquiries and bookings."
  },
  {
    "kind": "li",
    "text": "To keep the site working and secure, and to meet legal obligations."
  },
  {
    "kind": "p",
    "text": "We do not sell personal information. We do not add you to a newsletter or any other mailing list unless you ask us to."
  },
  {
    "kind": "heading",
    "text": "Automatic replies and artificial intelligence"
  },
  {
    "kind": "p",
    "text": "The first reply to an inquiry is sent automatically. We may use artificial-intelligence software to help read and answer emails about scheduling. Steve takes every call himself, and decisions about engagements are made by a person."
  },
  {
    "kind": "heading",
    "text": "Who we share it with"
  },
  {
    "kind": "p",
    "text": "We share personal information only with companies that provide services to us, and only so that they can provide those services:"
  },
  {
    "kind": "li",
    "text": "Vercel hosts the website."
  },
  {
    "kind": "li",
    "text": "Resend sends our email."
  },
  {
    "kind": "li",
    "text": "Google provides website analytics, advertising measurement, and the calendar and video calls used for booking."
  },
  {
    "kind": "li",
    "text": "IONOS hosts our mailbox."
  },
  {
    "kind": "li",
    "text": "Supabase stores inquiries."
  },
  {
    "kind": "p",
    "text": "Advertising measurement. To learn which advertisement led to an inquiry or a booking, we may send Google the ad-click identifier from your visit and a scrambled (“hashed”) version of your email address. Google uses these to match the result to the advertisement, under its own privacy policy at policies.google.com/privacy."
  },
  {
    "kind": "p",
    "text": "We may also disclose information when the law requires it, to protect our rights or the safety of others, or as part of a sale or transfer of the business."
  },
  {
    "kind": "heading",
    "text": "Cookies and similar technologies"
  },
  {
    "kind": "li",
    "text": "Google Analytics sets cookies to tell one visit from another."
  },
  {
    "kind": "li",
    "text": "Your browser stores the details of an ad click for up to 90 days, as described above."
  },
  {
    "kind": "p",
    "text": "You can block or delete cookies in your browser settings, and Google offers a browser add-on that turns Google Analytics off, at tools.google.com/dlpage/gaoptout. The site works without them. This site does not respond to “Do Not Track” signals."
  },
  {
    "kind": "heading",
    "text": "How long we keep it"
  },
  {
    "kind": "li",
    "text": "Inquiries, bookings and correspondence: three years after our last contact with you."
  },
  {
    "kind": "li",
    "text": "Ad-click details in your browser: up to 90 days."
  },
  {
    "kind": "li",
    "text": "Analytics data: up to 14 months."
  },
  {
    "kind": "li",
    "text": "Hosting records: as set by our hosting provider."
  },
  {
    "kind": "heading",
    "text": "Your choices"
  },
  {
    "kind": "li",
    "text": "Follow-up emails. Every follow-up email includes a way to stop them, or you can reply and say so."
  },
  {
    "kind": "li",
    "text": "Your information. You can ask us for a copy of what we hold about you, to correct it, or to delete it. Email steve@stevewelch.com. We honor these requests wherever you live, and we answer within 30 days."
  },
  {
    "kind": "li",
    "text": "Where you live. Depending on where you live, the law may give you further rights, including the right to complain to a privacy regulator."
  },
  {
    "kind": "li",
    "text": "Canada. If you are in Canada, we email you about your inquiry because you sent it. You can withdraw that consent at any time."
  },
  {
    "kind": "heading",
    "text": "Where your information is processed"
  },
  {
    "kind": "p",
    "text": "We are based in the United States. Our service providers process information in the United States and in other countries."
  },
  {
    "kind": "heading",
    "text": "Security"
  },
  {
    "kind": "p",
    "text": "Access to inquiries is limited to Steve and those who work with him on engagements. We use established providers and reasonable safeguards. No method of storage or transmission is completely secure."
  },
  {
    "kind": "heading",
    "text": "Children"
  },
  {
    "kind": "p",
    "text": "This site is for business audiences. It is not directed to children under 16, and we do not knowingly collect their information."
  },
  {
    "kind": "heading",
    "text": "Changes"
  },
  {
    "kind": "p",
    "text": "If we change this policy, we will post the new version here and update the date at the top."
  },
  {
    "kind": "heading",
    "text": "Contact"
  },
  {
    "kind": "p",
    "text": "Shark Skin Management, LLC. Email: steve@stevewelch.com"
  }
];

export const termsAndConditions: LegalBlock[] = [
  {
    "kind": "p",
    "text": "The website you have entered (stevewelch.com, its sub-domains, affiliated websites and applications, any mobile versions) and any services or Content (as defined below) available therefrom (the “Site”) is a copyrighted work owned and operated by Shark Skin Management, LLC, a Texas limited liability company (“Steve,” “we” or “us”)."
  },
  {
    "kind": "p",
    "text": "LAST MODIFIED: November 11, 2026"
  },
  {
    "kind": "p",
    "text": "BY ACCESSING OR USING THE SITE, YOU HEREBY AFFIRM THAT YOU HAVE THE RIGHT, AUTHORITY, AND CAPACITY TO ENTER INTO THE FOLLOWING TERMS AND CONDITIONS (THE “TERMS”). THESE TERMS TOGETHER WITH THE PRIVACY POLICY (LOCATED AT WWW.STEVEWELCH.COM/PRIVACY-POLICY/) CONSTITUTE A LEGAL AGREEMENT BETWEEN YOU AND STEVE."
  },
  {
    "kind": "p",
    "text": "IF YOU ARE UNDER 18 YEARS OLD, YOUR PARENT OR LEGAL GUARDIAN MUST READ, UNDERSTAND, AND AGREE TO THESE TERMS ON YOUR BEHALF PRIOR TO YOUR ACCESS TO AND USE OF THE SITE. IF YOU DO NOT AGREE TO THESE TERMS OR HAVE NOT OBTAINED YOUR PARENT OR LEGAL GUARDIAN’S CONSENT TO AGREE TO THESE TERMS, DO NOT ACCESS OR USE THE SITE. IN NO EVENT MAY YOU ACCESS OR USE THIS SITE IF YOU ARE UNDER THE AGE OF 13."
  },
  {
    "kind": "p",
    "text": "YOUR ACCESS TO AND USE OF THE SITE CONSTITUTES ACCEPTANCE OF THESE TERMS."
  },
  {
    "kind": "heading",
    "text": "CHANGES TO THE SITE OR TERMS"
  },
  {
    "kind": "p",
    "text": "Steve reserves the right, at any time, to modify, suspend, or discontinue the Site (in whole or in part) at its sole discretion with or without notice to you. You agree that Steve will not be liable to you or to any third party for any modification, suspension, or discontinuation of the Site or any part thereof."
  },
  {
    "kind": "p",
    "text": "Steve further reserves the right, at any time, to revise these Terms or to impose new terms and conditions with respect to access to or use of the Site, the Content, or any other matter, in its sole discretion. Any modification to the Terms shall become effective when posted. ANY ACCESS TO OR USE OF THIS SITE OR ANY CONTENT BY YOU AFTER THE POSTING OF THE REVISED TERMS SHALL CONSTITUTE YOUR AGREEMENT TO SUCH REVISED TERMS. No modification to these Terms shall be valid or enforceable against Steve unless expressly agreed to by Steve in a writing signed by a duly authorized officer of Steve."
  },
  {
    "kind": "heading",
    "text": "TERM AND TERMINATION"
  },
  {
    "kind": "p",
    "text": "These Terms will remain in full force and effect while you access and use the Site. Steve may terminate these Terms or discontinue operation of the Site without notice to you, at any time and for any reason, in our sole discretion, without liability, including but not limited to if you breach any of these Terms. In the event of termination of these Terms with respect to you, you will no longer be authorized to access or use the Site or any Content."
  },
  {
    "kind": "p",
    "text": "In the event of a termination of these Terms or termination of your access to and use of the Site, Sections 3 through 14 of these Terms shall survive and continue in full force and effect. Further, all rights granted by you shall remain in full force and effect and Steve shall be permitted, but shall not have any obligation, to delete any of your personal data collected in the operation of the Site unless otherwise required by law."
  },
  {
    "kind": "heading",
    "text": "LICENSE; SITE CONTENT"
  },
  {
    "kind": "p",
    "text": "License. Subject to these Terms, Steve grants you a non-transferable, non-exclusive, revocable, limited license to use and access the Site solely for your own personal, non-commercial use. Unauthorized access to or use of the Site or the Content is a breach of these Terms and may be a violation of law."
  },
  {
    "kind": "p",
    "text": "Site Content. Unless specifically permitted herein, no information, materials, files, videos, or other content (collectively “Content”) comprising, contained in or distributed through the Site may be reproduced in any form or used by you without the prior written consent of Steve. The Site and the Content found therein are the property of Steve, its licensees and/or licensors. The Site and the Content are protected by copyright laws and international treaty provisions. You acknowledge that Steve or its business partners, licensees or licensors (as applicable) own and shall retain the exclusive right, title and ownership in and to all copyrights, trade secrets, trademarks and other intellectual property and proprietary rights in the Site and all Content. You agree not to use any automated means, including, without limitation, agents, robots, scripts, or spiders, to access, monitor or copy any part of the Site or any of the Content. You agree not to copy, modify, rent, lease, loan, sell, assign, distribute, reverse engineer, disassemble, decompile, attempt to obtain the source code of, grant a security interest in, publicly perform, publicly display, transfer or exploit the Site, the Content, any technology or software relating thereto, or any portion of any of the foregoing. All copyright, trademark, or other proprietary notices on the Site or any Content must be retained and displayed at all times."
  },
  {
    "kind": "heading",
    "text": "DISCLAIMER OF WARRANTIES AND REPRESENTATIONS"
  },
  {
    "kind": "p",
    "text": "THE SITE AND THE CONTENT CONTAINED IN AND DISSEMINATED FROM THE SITE ARE PROVIDED “AS IS,” “AS AVAILABLE,” AND WITHOUT WARRANTY OR REPRESENTATION OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE IMPLIED WARRANTIES OF MERCHANTABILITY, NON-INFRINGEMENT, ACCURACY, AND FITNESS FOR A PARTICULAR PURPOSE (ALL OF SUCH IMPLIED WARRANTIES AND REPRESENTATIONS BEING HEREBY EXPRESSLY DISCLAIMED). YOU ASSUME THE ENTIRE RISK (i) AS TO YOUR ACCESS TO AND USE OF THE SITE, AND YOUR SELECTION AND USE OF ANY CONTENT OBTAINED THROUGH OR FROM THE SITE; AND (ii) THAT THE SITE AND/OR THE CONTENT WILL MEET YOUR REQUIREMENTS, BE ACCURATE OR RELIABLE, HAVE ANY LEVEL OF QUALITY OR MEET YOUR EXPECTATIONS. STEVE MAKES NO WARRANTY OR REPRESENTATION THAT YOUR ACCESS TO AND USE OF THE SITE OR THE CONTENT WILL BE UNINTERRUPTED, VIRUS FREE, ERROR-FREE OR COMPLETELY SECURE. YOU ARE SOLELY RESPONSIBLE FOR ANY DAMAGE TO YOUR COMPUTER SYSTEM HARDWARE OR SOFTWARE, OR FOR ANY LOSS OF DATA OR OTHER DAMAGES, RELATING TO YOUR ACCESS TO AND USE OF THE SITE OR THE SITE OR CONTENT. NO ADVICE, INFORMATION OR CONTENT, WHETHER ORAL OR WRITTEN, OBTAINED BY YOU FROM, THROUGH OR IN CONNECTION WITH YOUR ACCESS TO OR USE OF THE SITE OR THE CONTENT, WILL CREATE OR PROVIDE ANY WARRANTY OR REPRESENTATION ON THE PART OF STEVE OR ANY OF THE STEVE PARTIES (AS HEREINAFTER DEFINED)."
  },
  {
    "kind": "p",
    "text": "Please note that some jurisdictions may not allow the exclusion of implied warranties, so some of the above exclusions may not apply to you. In such jurisdictions, the liability of the Steve Parties shall be limited to the greatest extent permitted by applicable law."
  },
  {
    "kind": "heading",
    "text": "USER CONDUCT; PROHIBITED ACTIVITIES"
  },
  {
    "kind": "p",
    "text": "You agree that you shall not post, publish, submit or otherwise disseminate through the Site any content or other information:"
  },
  {
    "kind": "li",
    "text": "that is known by you to be false, inaccurate or misleading;"
  },
  {
    "kind": "li",
    "text": "that violates, infringes or misappropriates any third party’s copyright, patent, trademark, trade secret, right of privacy, right of publicity or other intellectual property or proprietary right;"
  },
  {
    "kind": "li",
    "text": "that violates any law, statute, regulation, rule or ordinance (including, but not limited to, those governing export control, consumer protection, unfair competition, anti-discrimination or false advertising)"
  },
  {
    "kind": "li",
    "text": "that is, or may reasonably be considered to be, defamatory, libelous, hateful, profane, abusive, racially, religiously, or otherwise biased or offensive, unlawfully threatening or unlawfully harassing to any individual or entity, or otherwise contains foul language;"
  },
  {
    "kind": "li",
    "text": "that contains any computer viruses, worms or other potentially damaging computer programs or files"
  },
  {
    "kind": "p",
    "text": "In addition to the foregoing, you agree not to:"
  },
  {
    "kind": "li",
    "text": "Download or upload any content or material that you know or reasonably should know cannot be legally obtained in such manner;"
  },
  {
    "kind": "li",
    "text": "Restrict or inhibit any other user from using and enjoying any area within the Site;"
  },
  {
    "kind": "li",
    "text": "Collect or store personal information about other users of the Site, or submit personal data on the Site without their express permission and authority to do so;"
  },
  {
    "kind": "li",
    "text": "Attempt to access or use the Site or the Content after your access or use has been terminated;"
  },
  {
    "kind": "li",
    "text": "Affect the way the Site displays Content (including any pages contained therein) other than through adjustments to your browser or display settings to facilitate your personal viewing of the Site;"
  },
  {
    "kind": "li",
    "text": "Use any automated means to access or use the Site or to collect any Content contained therein;"
  },
  {
    "kind": "li",
    "text": "Modify or create variant versions of the Steve or Steve Welch name, trademark, indicia or logos;"
  },
  {
    "kind": "li",
    "text": "Interfere with or disrupt the Site or the infrastructure;"
  },
  {
    "kind": "li",
    "text": "Forge headers or manipulate identifiers or other data in order to disguise the origin of any content transmitted through the Site or to manipulate your presence on the Site;"
  },
  {
    "kind": "li",
    "text": "Take any action that imposes an unreasonably or disproportionately large load on the Site or its infrastructure;"
  },
  {
    "kind": "li",
    "text": "Engage in any acts or omissions that could constitute a violation of applicable laws, statutes, regulations, rules or ordinances."
  },
  {
    "kind": "p",
    "text": "You agree to notify us if you suspect any activity in violation of these Terms and cooperate with our investigation of such violation."
  },
  {
    "kind": "heading",
    "text": "THIRD-PARTY LINKS"
  },
  {
    "kind": "p",
    "text": "The Site may contain links to third-party websites and services for third parties (collectively, “Third-Party Links”). Such Third-Party Links are not under the control of Steve, and Steve is not responsible for any Third-Party Links. Steve provides access to these Third-Party Links only as a convenience to you, and does not review, approve, monitor, endorse, warrant, or make any representations with respect to Third-Party Links. Your interaction with all Third-Party Links is at your own risk. When you click on any of the Third-Party Links, the applicable third party’s terms and policies apply, including the third party’s privacy and data gathering practices."
  },
  {
    "kind": "heading",
    "text": "COPYRIGHT AND TRADEMARK INFORMATION"
  },
  {
    "kind": "p",
    "text": "© Shark Skin Management, LLC. All rights reserved."
  },
  {
    "kind": "p",
    "text": "Your use of any trademarks, service marks, branding, logos, and designs owned or licensed by Steve is prohibited without the prior written consent of Steve or the consent of the third party that owns the trademark."
  },
  {
    "kind": "heading",
    "text": "PRIVACY"
  },
  {
    "kind": "p",
    "text": "Certain information collected from you or about you in the course of your access to or use of the Site is subject to our Privacy Policy, which is incorporated into these Terms by reference and may be revised from time to time as provided therein. You acknowledge, agree and consent to the information collection, distribution and other terms, conditions and matters set forth in the Privacy Policy."
  },
  {
    "kind": "heading",
    "text": "NOTIFICATIONS"
  },
  {
    "kind": "p",
    "text": "We may be required by state or federal law to notify you of certain events. You hereby acknowledge and consent that such notices will be effective upon our posting them on the Site or delivering them to you through email, if you have previously provided your email address to us. If you do not provide us with accurate information, we cannot be held liable if you do not receive notice."
  },
  {
    "kind": "heading",
    "text": "GOVERNING LAW AND JURISDICTION"
  },
  {
    "kind": "p",
    "text": "The Site is controlled and managed by Steve from its offices in the United States and is targeted to the United States. These Terms shall be governed by and construed in accordance with the laws of the State of Texas, without reference to its conflicts of laws principles. By accessing or using the Site, you submit to the exclusive jurisdiction of and venue in the state and federal courts located in the State of Texas to resolve any dispute arising out of or in connection with these Terms, the Site or the Content, and waive any objections thereto including those of inconvenient forum or similar defenses."
  },
  {
    "kind": "p",
    "text": "You must not access or use the Site or the Content in countries where it is restricted, prohibited or limited by local law, regulations, codes or customs. Steve makes no warranty or representation that the Site or the Content is appropriate or available for access or use in locations outside the United States."
  },
  {
    "kind": "heading",
    "text": "USERS OUTSIDE OF THE UNITED STATES"
  },
  {
    "kind": "p",
    "text": "If you (a) are using the Site from a country embargoed by the United States, (b) are on the United States Treasury Department’s list of “Specially Designated Nationals,” or (c) are on the U.S. Commerce Department’s Table of Deny Orders, you agree that you will not conduct any commercial activities using or through the Site and will not otherwise use the Site or any related services in violation of United States export control laws or regulations."
  },
  {
    "kind": "heading",
    "text": "LIMITATION OF LIABILITY"
  },
  {
    "kind": "p",
    "text": "TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL STEVE, ITS SUBSIDIARIES AND AFFILIATES AND/OR THEIR RESPECTIVE OFFICERS, DIRECTORS, TRUSTEES, MEMBERS, MANAGERS, EMPLOYEES, AGENTS, OR REPRESENTATIVES (ALL OF THE FOREGOING, COLLECTIVELY, THE “STEVE PARTIES”) BE LIABLE TO YOU FOR ANY DIRECT, INDIRECT, CONSEQUENTIAL, INCIDENTAL, SPECIAL, PUNITIVE OR EXEMPLARY DAMAGES (INCLUDING WITHOUT LIMITATION, DAMAGES FOR LOSS OF PERSONAL OR BUSINESS PROFITS, BUSINESS INTERRUPTION, LOSS OF PERSONAL OR BUSINESS INFORMATION, OR OTHER LOSS OR DAMAGE) ARISING OUT OF OR RELATED TO THESE TERMS OR ARISING OUT OF THE ACCESS OR USE, OR INABILITY TO ACCESS OR USE THE SITE AND/OR ITS CONTENT, EVEN IF THEY HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES OR IF SUCH DAMAGES ARE OTHERWISE FORESEEABLE, AND REGARDLESS OF THE NATURE OF THE CAUSE OF ACTION OR THEORY ASSERTED (E.G., WHETHER IN CONTRACT, TORT OR OTHERWISE). ACCESS TO, AND USE OF, THE SITE AND CONTENT IS AT YOUR OWN RISK AND DISCRETION AND YOU WILL BE SOLELY RESPONSIBLE FOR ANY DAMAGE TO YOUR DEVICE OR COMPUTER, OR LOSS OF DATA RESULTING THEREFROM. IF, NOTWITHSTANDING THE PROVISIONS OF THE TERMS, ANY OF THE STEVE PARTIES IS FOUND TO BE LIABLE TO YOU FOR ANY DAMAGE OR LOSS WHICH ARISES OUT OF OR IS IN ANY WAY CONNECTED TO YOUR ACCESS TO OR USE OF THE SITE, THE CONTENT OR OTHERWISE, TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE AGGREGATE LIABILITY OF THE STEVE PARTIES SHALL IN NO EVENT EXCEED $100 USD. YOU AGREE TO USE YOUR BEST EFFORTS TO MITIGATE ANY DAMAGES OR LOSSES YOU MAY SUFFER IN CONNECTION WITH YOUR ACCESS TO AND USE OF THE SITE AND THE CONTENT."
  },
  {
    "kind": "p",
    "text": "Because some jurisdictions do not allow the exclusion or limitation of liability for consequential or incidental damages, parts of the above limitation may not apply to you. In such jurisdictions, the liability of the Steve Parties shall be limited to the greatest extent permitted by applicable law. Check your local laws for any restrictions or limitations regarding the limitation of liability for consequential or incidental damages."
  },
  {
    "kind": "heading",
    "text": "INDEMNIFICATION"
  },
  {
    "kind": "p",
    "text": "You agree to defend, indemnify and hold harmless Steve, its affiliates, subsidiaries, licensees, vendors, partners, and each of their respective directors, officers, members, managers, employees, agents and representatives from and against any and all claims, actions, losses, damages, liabilities, judgments, settlements, costs and expenses (including, but not limited to, reasonable attorneys’ fees and court costs) arising out of or relating to (a) your breach of these Terms or any applicable laws or regulations, (b) your access to or use of the Site and/or the Content, (c) your violation, breach or misappropriation of a third party’s copyright, patent, trademark, trade secret, right of privacy, right of publicity, or other intellectual property, proprietary or other right, (d) your tortious acts including, without limitation, defamation, and/or (e) any claims you may raise against third parties relating to third party products or services. We reserve the right to assume, at our expense, the exclusive defense and control of any matter for which you are required to indemnify us, and you agree to cooperate with our defense of such claims. If we assume such defense, we will be responsible solely for our legal fees in connection with such defense and all other losses, damages, liabilities, judgments, settlements, costs and expenses shall be your sole responsibility."
  },
  {
    "kind": "heading",
    "text": "MISCELLANEOUS"
  },
  {
    "kind": "p",
    "text": "These Terms constitute the entire agreement between you and us regarding the access to or use of the Site. Our failure to exercise or enforce any right or provision of these Terms shall not operate as a waiver of such right or provision. The section titles in these Terms are for convenience only and have no legal or contractual effect. If any provision of these Terms is, for any reason, held to be invalid or unenforceable, the other provisions of these Terms will be unimpaired and the invalid or unenforceable provision will be deemed modified so that it is valid and enforceable to the maximum extent permitted by law."
  },
  {
    "kind": "p",
    "text": "If you have questions or comments, please contact us at: steve@stevewelch.com"
  }
];
