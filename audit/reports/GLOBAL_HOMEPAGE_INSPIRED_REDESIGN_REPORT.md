# Global homepage-inspired content-page redesign: final report

Local redesign and QA only. Nothing was deployed. WordPress, FTP production files, DNS, analytics and email were not touched. The homepage (`/`) was not modified.

Runtime under test: local production build at `http://localhost:3010` (see section T).

---

## A. Visual system

- **Palette:** the homepage brand green (`brand-50…950`) with gold accent `#CFBD1A` (`accent`), plus the existing `card`, `soft` and `elevated` shadows from `tailwind.config.ts`. No new colours were added.
- **Typography:**
  - H1 sits in the dark hero with a gold underline bar.
  - Section H2s have an eyebrow with a gold rule and use the brand-900 colour.
  - Headings over 110 characters automatically use a smaller size.
  - Body copy is 16–17px with a line height of about 1.85.
- **Section rhythm (`assignTones`):**
  - Dark hero, then white and light green ("mist") alternating.
  - Stats and review bands are dark, CTA strips inherit the previous section's tone, and a light conversion section sits before the footer.
  - Dark green is limited to the hero, stats/reviews and CTA strips.
- **Widths:**
  - Designed sections ≈1180–1280px.
  - Standard content ≈1000–1160px.
  - Prose and article body ≈760–900px.
- **Motion:**
  - `ScrollReveal` fade-up per section and image reveal, with a small stagger on card grids.
  - Area heroes crossfade between their source slides (`.hero-slide`).
  - All motion respects `prefers-reduced-motion`. Paragraphs are not animated individually.
- **Images:**
  - The hero uses the page's own source image: the first-section slideshow or background, or the hero widget image.
  - That image is never repeated directly below the hero.
  - Split sections are two-column, with a gold offset frame on the image.

## B. Components (new: `src/components/redesign/*`, `src/lib/redesign/*`)

| Component | Role |
| --- | --- |
| `lib/redesign/parse-elementor.ts` | Parses Elementor or editor HTML into typed widgets and rich blocks (p, h, list, table, img, quote); rewrites hrefs and media to local paths |
| `lib/redesign/compose.ts` | Composer: source sections become `Block`s (prose, split, cards, stats, faq, cta, logos, reviews, map, priceList, calculator, video, links, sitemap, posts), plus `HeroModel` and `ConversionCopy` |
| `lib/redesign/archetype.ts` | Assigns each path to an archetype (service, area, storage, about, contact, faq, quote, information, legal, utility) |
| `lib/redesign/article.ts` | Article body parsed into editorial parts (prose, headings with TOC ids, CTA button rows, FAQ) |
| `RedesignPageRenderer.tsx` | One renderer for all WordPress pages: hero, toned blocks, then a single `RedesignConversion` |
| `RedesignHero.tsx` | Compact green/gold hero: breadcrumbs, eyebrow, H1, subtitles, lead, source buttons, linked badges, source image or contact panel, optional background slides |
| `Section.tsx` | `RedesignSection` (tone, width, padding, `data-section-type`) and `SectionHeader` |
| `BlockViews.tsx` | One view per block type (cards, split, stats band, FAQ, CTA strip, logos, map, price list, calculator, video, link chips, sitemap, reviews) |
| `RichContent.tsx`, `RichFaq.tsx`, `CtaButtons.tsx`, `VideoFacade.tsx`, `RecentPostsView.tsx` | Shared primitives |
| `RedesignConversion.tsx` | The single final conversion: copy, phone and WhatsApp on the right (RTL first column); form on the left |
| `article/ArticleBody.tsx`, `article/ArticleHero.tsx` | Editorial article body and dark article hero |
| `content/ArchivePageLayout.tsx` | Category, tag and author archives: compact hero plus a card grid |

Route wiring: `ServicePageLayout`, `StandardPageLayout` and `BlogIndexLayout` now return `<RedesignPageRenderer>`. `ArticlePageLayout` uses `ArticleBody` and adds the conversion section.

Raw `sanitizedHtml` is no longer the final layout anywhere. The QA counted 0 raw Elementor class nodes inside `<main>` on all 69 URLs.

## C. Service pages (13)

Pages: `/שירותי-הובלה`, `/הובלת-דירה-בירושלים`, `/הובלות-קטנות-בירושלים`, `/הובלת-בית-בירושלים`, `/הובלות-משרדים-בירושלים`, `/הובלות-מנוף-בירושלים`, `/הובלות-מיוחדות-בירושלים`, `/הובלות-דחופות-בירושלים`, `/חברת-אריזה-והובלה-בירושלים`, `/הובלת-פריט-בודד-בירושלים`, `/הובלת-משטחים-בירושלים`, `/הובלת-משטחים-במרכז`, `/דף-נחיתה`.

Each page follows this order: hero, intro, benefits as cards, explanation and image/text splits, related service cards (exact href and anchor text), a dark stats band (only where the source has counters), FAQ accordion, pricing table where the source has one, the final conversion, then the footer.

## D. Area / city pages (12)

Pages: `/הובלות-באזור-ירושלים`, `/מוביל-בירושלים-והסביבה`, `/הובלת-דירה-מירושלים`, plus Beit Shemesh, Abu Gosh, Modiin, Givat Ze'ev, Mevaseret Zion, Pisgat Ze'ev, Gush Etzion, Beitar Illit and Ma'ale Adumim.

- **Hero:** the source slideshow background with 3 crossfading slides, plus the 3 source shield badges linked to their source hrefs.
- **Body:** local intro CTA strip, local service cards with "קרא עוד" (read more) actions, why-us section, local SEO prose, related links, and the conversion section.

## E. Storage pages (5)

Pages: `/אחסון-תכולת-דירה`, `/אחסון-תכולה-בירושלים`, `/אחסון-תכולה-לטווח-ארוך`, `/אחסון-תכולה-לטווח-קצר`, `/אחסון-משטחים`.

They use the same block system with storage-specific source content (feature cards, FAQ accordions of 7–9 items, and stats). Cards with no image show the source badge instead of a stock image.

## F. About (`/about-us`)

- Hero with the source subtitle and lead.
- Intro CTA strip.
- "מי אנחנו?" (who we are) split with the source truck photo.
- Stats, the 8-item FAQ, and source client logos (grayscale grid, source logos only).
- The source video section uses a click-to-play facade with its source poster image. This restores the previously missing poster media.
- Final conversion.

## G. Contact (`/צרו-קשר`)

A dedicated layout:

- Compact hero.
- Intro copy, with phone and WhatsApp tiles.
- Address card ("כתובת"), "עקוב אחרינו" (follow us) social icons, and a contact form card ("טופס יצירת קשר", including email).
- The source office map ("משרדי החברה"), followed by the remaining source blocks.

The contact form is the page's single conversion (`id="contact"`, `data-final-conversion`).

## H. FAQ (`/שאלות-נפוצות`)

Compact hero, intro, and a single accordion with 10/10 source items and no duplicates. The final conversion follows.

## I. Pricing / quote (3)

- **`/הצעת-מחיר` and `/מחירי-הובלת-דירות`:** hero, explanation, the source price table (styled, exact cells), stats, client logos, the source calculator (reused component), prose, then the final conversion form.
  - These two pages show 2 forms each: the calculator and the conversion form. Both come from the source.
- **`/מחיר-אחסון-תכולה-בירושלים`:** pricing prose, cards and a 7-item FAQ, then the conversion form.

## J. Articles (16 posts)

- **Hero:** dark green, with breadcrumbs, a gold category pill, the title, published/updated/author metadata, and the featured image beside the title.
- **Body:** structured `ArticleBody` instead of raw HTML. It contains:
  - prose and source images;
  - H2/H3 headings with anchor ids that drive the table of contents;
  - source CTA button rows, with responsive duplicates removed;
  - source FAQ widgets as an accordion (6/6 and 4/4 on the two posts that have them);
  - source tables.
- **Sidebar:** recent posts and categories. The old orphan sidebar form was replaced by a phone, WhatsApp and "השאירו פרטים" (leave details) card that links to `#contact`.
- **After the body:** the about-author block and previous/next links, then one final conversion.
- No marketing cards were added to articles.

## K. Archives (8 archives + `/blog`)

- **Category, tag and author archives:** compact hero plus a card grid of posts (`ArticleCard`).
- **Bug fix:** Hebrew tag archives were empty before this pass because the stored slugs are percent-encoded. `src/lib/archives.ts` now decodes slugs before comparing them.
- **`/blog`:** information archetype. It shows the source intro, all posts as cards, and the conversion section.

## L. Content parity (`scripts/redesign-parity.ts`, output in `audit/reports/redesign-parity.json`)

For all 67 URLs that return 200:

- **Text:** 100% of source text segments are present (sentence pieces of at least 3 words, normalised). Text inside shared chrome (reviews, posts grids, article sidebar, previous/next) is excluded so it can't mask real gaps.
- **Headings:** 0 missing.
- **Links:** 0 missing. This includes the "קרא עוד" read-more links, card heading links, badge links, and 66/66 sitemap links.
- **FAQ:** rendered count equals source count on every page.
- **Tables:** rendered count equals source count on every page.
- **Copy:** no text was rewritten, summarised or invented. Default UI labels (for example "השאירו פרטים", "WhatsApp" and the phone number) appear only on generated buttons and in the conversion panel.

## M. Media fidelity

- **Source images:** all rendered. This includes first-section slideshow and background images and the featured image, which is resolved by media ID.
- **Unrelated media:** 0 on every page. Shared chrome is excluded from the count.
- **No substitutes:** no stock or substitute images, and no invented testimonials, portraits, logos or stats.
- **Video:** the about-page video poster is now rendered through the click-to-play facade.

## N. Mobile QA

- The automated pass at 390, 375 and 360 found 0px horizontal overflow on all 69 URLs.
- Pages checked by eye at 390/375/360 (service, area, FAQ and article):
  - the hero stacks;
  - the contact panel collapses when the hero has its own source buttons;
  - cards go to a single column;
  - tables scroll horizontally inside their card;
  - the conversion section stacks with the copy first and the form below.

## O. Screenshots

There are 276 full-page PNGs in `audit/screenshots/global-redesign/`: 69 URLs at widths 1440, 390, 375 and 360. Files are named `NN-<slug>-<width>.png`.

Lazy images are forced to load before capture. Per-URL metrics are in `audit/reports/redesign-screenshots.json`.

The per-URL review is in `audit/reports/GLOBAL_CONTENT_PAGE_VISUAL_REVIEW.md`: 67 PASS, 0 NEEDS_POLISH, 0 FAIL, and 2 N/A (404 pages).

## P. Lint

`npm run lint` (`eslint .`) passed with 0 errors and 0 warnings.

## Q. TypeScript

`npx tsc --noEmit` passed with exit code 0.

## R. Build

`npm run build` (Next.js 16.3.8) succeeded. All 69 content routes were prerendered as SSG.

## S. Remaining failures / known items

1. `/שגיאה-404-1` and `/שגיאה-404-2` are WordPress 404-template pages. They return HTTP 404 locally and have no content to redesign, so they are marked N/A, not PASS.
2. Source phone links contain trailing encoded spaces (`tel:0525005573%20%20`). They previously rendered as wrong numbers (`tel:05250055732020`). This is now fixed: all rendered `tel:` links are `0525005573`.
3. The site footer's existing quick name/phone form is shared chrome, unchanged and also on the homepage. It is outside `<main>` and not treated as a page form.
4. Google Maps iframes on `/צרו-קשר` show blank in headless screenshots. This is a capture limitation; the embed src is the source embed.
5. Forms submit to the existing `/api/contact` stub (`emailSent: false`). Production email remains disabled, as required.

No commercial page renders as raw WordPress. Unrelated media is 0, orphan page forms are 0, there is no content loss, and mobile has no overflow at any tested width.

## T. Runtime

- Server: `next start -p 3010` (local production build)
- Listener PID: **30100**
- `.next/BUILD_ID`: **fNXUkJANTPBq_199m4_9M**
- The dev server used during iteration (port 3031) has been stopped.
- Not deployed. Stopped after local redesign and QA, as instructed.
