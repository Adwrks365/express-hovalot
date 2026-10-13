# Phase 2B.7: global polish, SEO and interaction pass

Local polish only. Nothing was deployed. WordPress, FTP, DNS, analytics and email delivery were not touched; production was only read (HTTP GET) for comparison. The site was not rebuilt from scratch. The homepage remains the visual reference and production WordPress remains the content reference.

**Status: every acceptance metric is 0 and every gate passes, with two reported exceptions that need a human decision (section V).** The work stops here for human review.

| Item | Value |
| --- | --- |
| Production build server | http://localhost:3010, listening PID 33308 (started by npx wrapper PID 11464) |
| BUILD_ID | `-MGbCJeBa026sQcCqnd3a` |
| Pages in QA | 68 (69 contract URLs minus the 2 WordPress 404 templates, plus the homepage) |
| QA script | `scripts/phase-2b7-qa.ts` → `audit/reports/PHASE_2B7_QA.json` |
| Link graph | `scripts/link-graph.ts` → `PRODUCTION_INTERNAL_LINK_GRAPH.json`, `PHASE_2B7_INTERNAL_LINK_PARITY.json` |

The brief counts 69 valid URLs. The contract lists 69 page URLs, but 2 of them are the WordPress 404 templates (`/שגיאה-404-1/` and `/שגיאה-404-2/`), which the brief excludes. The QA therefore covers the other 67 contract URLs plus the homepage, for 68 pages.

## Final QA metrics (final build, 1440 and 390)

| Metric | Result |
| --- | --- |
| HEADER_OVERLAP | 0 |
| BROKEN_IMAGES | 0 |
| UNRELATED_MEDIA | 0 |
| HORIZONTAL_OVERFLOW | 0 |
| DUPLICATE_SAME_PAGE_BLOCKS | 0 |
| ORPHAN_CORE_URLS (commercial) | 0 |
| DUPLICATE_FAQ | 0 |
| ORPHAN_PAGE_FORMS | 0 |
| H1_COUNT_INVALID | 0 |
| MALFORMED_TEL_LINKS | 0 |

The QA script also checks HERO_CTA_STACK, STALE_FAQ_SCHEMA, FIXED_CONTROL_OVERLAP, SMALL_MOBILE_HEADER_TAP_TARGETS, MENU_CONTROLS_VISIBLE, TOC_MISMATCH, HEADING_ORDER_WARNINGS, DESIGN_SYSTEM_INJECTED_CROSS_PAGE and the title, description, canonical, robots and H1 comparisons against production. All of these are 0.

A separate browser pass at 375 and 360 (all 68 pages, 136 page/width combinations) found no overflow, floating-control overlap, small header tap targets, header overlap or broken images.

---

## A. Header typography

- Desktop nav text is larger and steps up by width: 13px below 1366, 14px from 1440 and 15px from 1800. Link padding and row gaps also grow with width.
- The desktop nav appears from 1280 (`xl`). It is checked at 1920, 1600, 1440, 1366 and 1280: one line with no collisions, logo on the physical right, actions on the physical left and nav in the center.
- If anything still collides at runtime (`nav.scrollWidth > nav.clientWidth`), the header switches to the responsive menu instead of shrinking the text.
- To fit the larger text between 1280 and 1599, the header WhatsApp icon is hidden at those widths and shown from 1600. WhatsApp stays available in the floating controls and in every conversion block.

## B. Phone CTA

- New `pill` variant in `PhoneCta`: a rounded, bordered pill showing `052-500-55-73`, href `tel:0525005573`.
- Header action priority, reading from the centre outwards, is Quote (gold, most prominent), then Phone, then WhatsApp.
- The same Quote > Phone > WhatsApp > link order is applied to every button row through a shared priority map in `CtaButtons`.

## C. Hero/CTA dedupe

- **Pattern A** (hero with CTA, then content) is used on 18 pages. **Pattern B** (hero without CTA, then a compact strip directly after) is used on 18 pages. No page has both: HERO_CTA_STACK = 0.
- `dedupeOpeningCta` moves the hero's conversion buttons into the opening strip when the source opens with a CTA, so the buttons don't appear twice at the top.
- `foldDuplicateConversionPrompt` removes a mid-page strip whose heading or eyebrow repeats the final-conversion prompt. That copy becomes the final conversion's title and body, so it is shown once instead of twice.
- Strips that sit within two blocks of another CTA, or among the last two blocks, render as a "quiet" variant: a light band with light buttons. There are 3 quiet strips sitewide.
- Totals: 36 source CTA strips (at most 3 on a page, only on long pages) and 58 final conversions. Archives, the site map and utility pages have none.
- The hero contact panel now shows only phone and the gold quote button (WhatsApp removed) and appears from `lg` up.

## D. Same-page duplication

- Output: `audit/reports/PHASE_2B7_DUPLICATE_CONTENT_AUDIT.json`.
- **ACCIDENTAL = 0.** The 11 remaining same-page repeats also repeat in the production source. They are classified SOURCE_REPEAT_PRESERVED and left unchanged.
- Fixed this phase:
  - **Single-item moving page:** "רוצים לקבל הצעת מחיר מהירה?" appeared twice. The fold now matches strip eyebrows as well as headings.
  - **Repeated FAQ side images:** removed when the same image already appears in the hero, split, cards or gallery.
  - **Homepage FAQ intro box:** removed.

## E. Cross-page duplication

- 14 GLOBAL_BUSINESS_COPY items: business facts that repeat on production too, such as phone, hours, areas and guarantees. All are kept.
- 2 GLOBAL_CONVERSION_COMPONENT_COPY items: the final-conversion default text ("ספרו לנו כמה פרטים…") and the footer mini-form text ("השאירו פרטים…"). These are global component copy and are kept.
- DESIGN_SYSTEM_INJECTED = 0 and PARTIAL_SOURCE_COPY = 0.

## F. Homepage links

- Every production homepage body link was inventoried and restored with its original anchor text through the new `LinkedText` component. This covers the about paragraphs, the service-area experience text, service card titles, the services "קרא עוד »" link to `/שירותי-הובלה/`, and the FAQ answers.
- The production hero subtitle is shown in the hero on desktop and in the services intro on phones, matching production at each breakpoint.
- No city links were added in bulk.

## G. Sitewide link audit

Production has 9,238 links, of which 8,910 are meaningful; local has 8,948.

| Bucket | EXACT | EQUIVALENT | CHANGED | MISSING | Intentionally excluded |
| --- | --- | --- | --- | --- | --- |
| Body | 536 | 289 | 1 | **0** | 86 |
| Navigation | 3,417 | 70 | 0 | **0** | 0 |
| Footer | 4,221 | 134 | 0 | **0** | 136 |
| Breadcrumb | 0 | 8 | 0 | **0** | 0 |
| Form | 12 | 0 | 0 | **0** | 0 |

- Malformed local hrefs: 0. Local hrefs without a trailing slash: 0. Every internal link points directly at its canonical URL.
- **EQUIVALENT** means the same destination with different but faithful anchor text. Examples: the logo link is labelled "אקספרס הובלות בירושלים - דף הבית" instead of an empty image link; the breadcrumb says "דף הבית" instead of "ראשי"; article cards include the date in the anchor; category counts appear as "(15)".
- **The one CHANGED link is an intentional fix.** In production, "שירותי אריזה" on `/הובלות-בירושלים-המדריך-למעבר-דירה/` points to a malformed, truncated percent-encoded URL (`…%d7%9%D7%94…`). Locally the same anchor points to the canonical `/חברת-אריזה-והובלה-בירושלים/`.
- Fixed this phase:
  - **Archive pagination:** the production "2" pager links on `/category/moving-tips/`, `/category/moving-services/` and `/author/guest_2020/` were missing. A shared numbered pager now covers page 1 and page 2. The old page-2 "back" link was hard-coded to `/category/…`, which was wrong for the author archive; the pager replaces it.
  - **Terms-of-use link:** the opening heading's inline link to the homepage was lost because promoted rich-text headings were flattened to plain text. Headings now keep inline link HTML.
- **BROKEN = 2**, both pre-existing. See section V.
- New local body links: 81. Of these:
  - 61 are article-card and previous/next rows that show related articles.
  - 15 are article bylines linking to the author archive.
  - 2 are homepage quote CTAs.
  - 2 are article links whose production href was malformed and now resolves.
  - 1 is a CTA.

## H. Orphans

- Output: `audit/reports/PHASE_2B7_ORPHAN_URLS.md`.
- **Commercial orphans: 0.** No URL lost a production body source.
- The 3 full orphans are the tag archives (`/tag/הובלות-בירושלים/`, `/tag/הובלות-קטנות/`, `/tag/מעבר-דירה/`). They have no inbound links on production either, so they are preserved as-is rather than given new links.
- Body inbound links increased on 18 URLs and decreased on none. The increases come from the author bylines, archive cards, pagination and the corrected packing link.

## I. Counter

- New shared `AnimatedCounter` component, used for statistics only via `StatsView`.
- Server rendering outputs the exact final value. It counts up once, the first time it enters the viewport (IntersectionObserver, threshold 0.4, 1.4s ease-out).
- With `prefers-reduced-motion` or a non-numeric value, it shows the final value without animating. Comma formatting is kept and the last frame sets the exact value.

## J. Marquee

- `ClientLogoMarquee` now accepts a `logos` prop and a tone-matched edge fade.
- Content pages use it only when the source has a logo section with at least 5 logos; smaller sets stay in a static grid. No logos were added where the source has none.

## K. Alignment

- Section headings and short intros are centered; prose stays start-aligned.
- Icon-only feature grids (no photo, no actions, short single-paragraph body) center their icons and text.
- Short list-only bodies are centered as a block with start-aligned items.
- Card grids use equal-height cards. Phone numbers inside strip headings never break across lines.

## L. FinalConversion and footer

- The final conversion takes its title and body from the source strip it replaces, so there is one cohesive closing block per page.
- The footer mini form is now a compact utility: a bordered, translucent panel with dark fields and an outline submit button.
- The quote forms gained a required consent checkbox that links to `/privacy-policy/`.

## M. Mobile

- Every mobile header control is at least 44×44 px. The logo link was 40px tall and is now 44px.
- CTA rows stack with the gold quote button first.
- Floating controls step aside (fade out and become non-interactive) while forms, CTA strips, the final conversion, `#contact` or the footer occupy the bottom of the viewport. Hidden buttons also leave the tab order.
- The accessibility widget follows the same rule but stays visible whenever its panel is open. All floating controls are hidden while the mobile menu is open.
- QA found 0 overlaps at 1440, 390, 375 and 360.

## N. Heading hierarchy

- Exactly one H1 on all 68 pages.
- `normalizeHeadingLevels` clamps any heading that skips a level. Articles clamp inside `parseArticleBody`. HEADING_ORDER_WARNINGS = 0.
- Article tables of contents match the rendered headings (TOC_MISMATCH = 0).
- HEADER_OVERLAP = 0: after scrolling to `#contact` or the first table-of-contents anchors, the target sits below the sticky header (`--header-offset: 6rem`).

## O. FAQ and schema

- 158 visible FAQ items, with 0 duplicates.
- FAQPage schema matches the visible items exactly (STALE_FAQ_SCHEMA = 0).

## P. SEO

- Title, description, canonical, robots and H1 match production on all 68 pages.
- Fixed: the layout title template was appending a suffix to 67 titles. Titles are now absolute.
- Archive titles use the production term names.
- Schema types are reported per page in `PHASE_2B7_QA.json`.

## Q. Performance

Measured locally at 390 with no throttling, so treat these as indicative. Sizes are uncompressed.

| Page | LCP | CLS | DOM nodes | JS | CSS | Images |
| --- | --- | --- | --- | --- | --- | --- |
| Home | 344 ms | 0 | 1,059 | 559 KB | 118 KB | 58 KB |
| Apartment service | 112 ms | 0 | 793 | 559 KB | 118 KB | 21 KB |
| Article | 172 ms | 0 | 1,231 | 559 KB | 118 KB | 51 KB |

- No new libraries were added.
- The counter uses IntersectionObserver and requestAnimationFrame only.
- `reveal-subtle` no longer animates, so paragraphs, tables and prose are never hidden or animated.

## R. Screenshots

All are in `audit/screenshots/phase-2b7/`, at 1440 and 390, as full-page shots (`{page}-{width}.png`) and first-viewport shots (`{page}-{width}-top.png`). The pages are:

- home, about, apartment, office, small-moves, storage
- area-beit-shemesh, pricing, faq, contact, article

All 22 captures returned HTTP 200.

## S. Lint

`npm run lint` (ESLint): passed with 0 errors and 0 warnings.

## T. TypeScript

`npx tsc --noEmit`: passed with 0 errors.

## U. Build

`npm run build`: passed. 79 static pages were generated, and the production server was restarted on 3010 with BUILD_ID `-MGbCJeBa026sQcCqnd3a`.

Content parity (`scripts/redesign-parity.ts`) did not regress. All 69 contract URLs show 100% text coverage and 0 missing headings, media, links, FAQ items or tables, with 0 unrelated media.

## V. Remaining issues (need a human decision)

1. **Two broken site-map links.**
   - `/site-map/` lists `/שגיאה-404-1/` and `/שגיאה-404-2/`, as production does.
   - The contract expects those two URLs to return 200. The previous phase deliberately serves them as 404 because they are empty WordPress 404 templates.
   - Options:
     - (a) Keep as-is: preserved links, 2 broken.
     - (b) Remove them from the site map: 2 links intentionally dropped.
     - (c) Serve them as 200 pages.
   - I did not change this because it reverses an earlier decision.
2. **Tag archives have no inbound links**, on production or locally. They are preserved. Linking them, for example from article footers, would add links that production doesn't have.

## Files changed in this phase

- **Header and floating controls:** `Header.tsx`, `PhoneCta.tsx`, `Logo.tsx`, `FixedControls.tsx`, `globals.css`
- **Redesign renderer:** `RedesignPageRenderer.tsx`, `RedesignHero.tsx`, `RedesignConversion.tsx`, `BlockViews.tsx`, `CtaButtons.tsx`, `Section.tsx`, `RichContent.tsx`
- **Content model:** `heading-levels.ts` (new), `blocks.ts`, `types.ts`, `compose.ts`, `article.ts`, `parse-elementor.ts`
- **Shared components:** `AnimatedCounter.tsx` (new), `LinkedText.tsx` (new), `ClientLogoMarquee.tsx`, `SectionHeading.tsx`
- **Homepage:** `HeroSection`, `AboutSection`, `ServicesSection`, `ServiceAreasSection`, `CtaSection`, `CalculatorSection`, `FaqAccordion`, `FaqSection`, `homepage-content.ts`
- **Forms and footer:** `QuoteForm.tsx`, `FooterMiniForm.tsx`, `Footer.tsx`, `FooterAccordionGroup.tsx`, `footer-content.ts`
- **Articles and archives:** `ArticlePageLayout.tsx`, `ArticleCard.tsx`, `ArticleBody.tsx`, `article-utils.ts`, `ArchivePageLayout.tsx`, `archives.ts`
- **SEO:** `seo.ts`
- **Scripts:** `scripts/phase-2b7-qa.ts` (new), `scripts/link-graph.ts`
