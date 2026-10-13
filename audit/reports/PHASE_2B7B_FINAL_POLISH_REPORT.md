# Phase 2B.7B: final visual consistency and data-integrity polish

Local polish only. Nothing was deployed. WordPress, FTP, DNS, analytics and email were not touched. Page structures were not rebuilt. Production copy, titles, meta, canonicals, URLs, FAQ answers and article text were not rewritten.

**Status: data-integrity and conversion-stack gates pass. Stop here for human review.**

| Item | Value |
| --- | --- |
| Production build | http://localhost:3010 |
| BUILD_ID | `x9O8bpkaSjLtTUjG6XqmD` |
| Stat audit | `audit/reports/PHASE_2B7B_STAT_SOURCE_AUDIT.json` |
| Counters traced | 80 |
| UNVERIFIED_STATISTICS | **0** |

## A. Header typography

Desktop nav is 13px at 1280 (the only width where 14px collapsed the row), **14px from 1366**, **15px from 1600**, **16px from 1800**. That is +1px to +2px versus the previous 13 / 14 / 15 ramp on every width that can hold it.

Verified one row, no wrap, no hamburger at **1920, 1600, 1440, 1366 and 1280**. The desktop breakpoint is still 1280. WhatsApp in the header stays hidden until 1800 so the larger type fits; it remains on floating controls and in conversion blocks.

## B. Phone CTA

The outlined pill is unchanged in role (secondary to the gold quote button). Contrast is stronger (`border-2 border-white/75`), the handset icon is 18px, padding is comfortable, hover/focus uses the gold ring. Visible number `052-500-55-73`, href `tel:0525005573`.

## C. Hero / post-hero CTA deduplication

The previous Pattern B (hero with conversion stripped, then a large CTA band) is gone.

Rule now: if a CTA strip sits immediately under the hero (first block, or after a short intro), **the strip is dropped** and the hero keeps conversion actions (source buttons, or quote + phone).

Sample after the change (next section is never `cta-strip`):

| URL | Next section |
| --- | --- |
| Office moves | `cards-image` |
| Apartment moves | `prose` |
| Storage | `prose` |

QA metric **HERO_CTA_STACK = 0** on all 68 pages. Mid-page strips on long pages remain.

## D. Dropdown sizing

Width follows **item count**, not a forced mega panel:

| Menu | Children | Size | Columns | Max width |
| --- | --- | --- | --- | --- |
| Quote | 2 | compact | 1 | 280px |
| Storage | 4 | compact | 1 | 280px |
| Areas | 9 | medium | 2 | 520px |
| Services | 11 | medium | 2 | 520px |
| Tips | 16 | mega | 3 | 780px |

RTL, wrapping, hover/focus unchanged. Areas no longer open a 900px empty mega panel.

## E. Statistic source audit

The numbers 685+ / 33% / 1103+ / 5+ were **mid-animation frames** of the real source values (ease-out of 2000 / 97 / 3225 / 15), plus a risk of reading Elementor’s live inner text (`0` or a snapshot like `4,036`) instead of `data-to-value`.

Counters now use **only** `data-to-value`. Inner text is never used. No interpolation, no shared company-stat invention, no display when the attribute is missing.

Every rendered counter is in `PHASE_2B7B_STAT_SOURCE_AUDIT.json` with URL, label, source value, rendered value, location (`elementor-counter data-to-value`) and `verified: true`.

Examples of page-specific source values (not one global set):

- Small moves: 15+ · 3,225+ · 97% · 2,000+
- Apartment: 15+ · 3,450+ · 97% · 2,900+
- Pallet moves: 15+ · 3,225+ · 97% · 25,000+
- Quote page: 6,702 · 93 · 15 · 22

**UNVERIFIED_STATISTICS = 0.**

## F. Counter implementation

Shared `AnimatedCounter` (same component as the approved homepage implementation):

- SSR prints the exact source value
- Counts up once on first viewport entry
- Last frame sets the exact value
- Keeps `+` / `%` / grouping
- `prefers-reduced-motion` skips the animation
- Does not run on prices, dates, phone numbers, table cells or prose

## G. Logo marquee

Pages whose source has a logo carousel use the **homepage** `ClientLogoMarquee` (same cell size, gap, triple track, reduced-motion static row). Logos are not injected on pages without that source section.

## H. Heading / icon alignment

Centered for stats, benefit/icon grids, service-card grids, FAQ intros, logos, conversion strips and short trust modules. Start-aligned for long prose, image/text splits, articles. Centered icon cards now share one axis: icon → heading → text (`items-center text-center`).

## I. Card normalization

Image cards: 4/3 media, `p-5 sm:p-6`, title then body then actions, equal height. Icon cards: same padding, 14×14 icon well, accent bar, equal height.

## J. Mid-page CTA cleanup

Immediate post-hero strips removed (section C). Remaining strips sit on long pages, with compact (not tight) vertical padding, and still go “quiet” when they sit next to another conversion.

## K. Final conversion polish

Form and contact panel are an even `lg:grid-cols-2`. Padding is matched. Extra bottom padding (`pb-16 sm:pb-20 lg:pb-24`) separates the block from the footer. Footer mini form stays a compact utility (`data-footer-utility-form`), not a second full conversion.

## L. Same-page duplicate audit

Re-ran `scripts/phase-2b7-qa.ts` static pass. **ACCIDENTAL_SAME_PAGE_DUPLICATION = 0.** Source repeats that also exist in production are left in place.

## M. Production internal-link preservation

`scripts/link-graph.ts` against this build:

| | Count |
| --- | --- |
| MISSING | **0** |
| BROKEN (local) | **2** (the two WordPress 404-template URLs on the site map — unchanged from 2B.7) |
| malformed hrefs | 0 |
| missing trailing slash | 0 |
| CHANGED | 1 (intentional: truncated packing URL → canonical packing page) |

Body / navigation / footer remain separate buckets. Navigation and footer still do not substitute for a lost body link.

## N. Homepage link parity

Homepage production body links were restored in 2B.7 (`LinkedText`, service titles, “קרא עוד »”). This phase did not add keyword links.

## O. Orphan URL status

**Commercial orphans: 0.** The three tag archives still have no inbound links on production or locally; they were not given new links.

## P. Map browser verification

On `/צרו-קשר/` in a real Chromium session (not a headless blank screenshot):

- Content map iframes load from `maps.google.com/maps?q=…&output=embed` (320–400px tall, full content width)
- Footer embed loads `google.com/maps/embed?pb=…`
- No horizontal overflow
- Src is a normal Google Maps embed URL (no empty `src`)

Headless screenshot greyness of the tile layer is not treated as failure.

## Q. Mobile collision QA

Checked at **390, 375 and 360**.

- Header tap targets stay ≥44px
- Horizontal overflow: 0
- Right-side phone/WhatsApp **yield** over main forms, CTA strips, the final conversion and the footer mini form
- Left-side accessibility + scroll-to-top **stay visible at the end of the page** (the previous “both vanish in the footer” bug)
- Accessibility icon is the standard person-with-arms mark, not the broken blob
- Footer legal bar has extra inline-end padding so those two buttons have a dock

Full-width FAQ rows and footer accordion labels can still pass through that 44×44 dock while you scroll. That is reserved overlay UI, not a second conversion control sitting on a submit button. See V.

## R. SEO / content parity

No copy, title, description, canonical, URL, FAQ answer or article-text edits in this phase. Static SEO mismatches vs production: **0**.

## S. Lint

`npm run lint`: 0 errors, 0 warnings.

## T. TypeScript

`npx tsc --noEmit`: 0 errors.

## U. Build

`npm run build`: pass. 79 static routes. Server on 3010, BUILD_ID `x9O8bpkaSjLtTUjG6XqmD`.

## V. Remaining issues

1. **Site-map → 404 templates** (same as 2B.7): two links to `/שגיאה-404-1/` and `/שגיאה-404-2/` are still 404 by the earlier empty-template decision.
2. **1280px nav size:** 14px collapsed the desktop row at 1280, so that width stays 13px. From 1366 the type is +1px to +2px as requested.
3. **Floating dock vs full-width lists:** accessibility / scroll-to-top occupy the bottom-left 44×44 corner for the whole visit (except over forms/CTAs). They can intersect FAQ and footer accordion rows. Hiding them at the footer was rejected after screenshot review.
4. **Tag archives** still have no inbound links, matching production.

## QA totals (static, 68 pages)

| Metric | Result |
| --- | --- |
| HEADER_COLLISION (1280–1920 one row) | 0 |
| BROKEN_IMAGES | 0 |
| UNRELATED_MEDIA | 0 |
| UNVERIFIED_STATISTICS | 0 |
| HORIZONTAL_OVERFLOW | 0 |
| ACCIDENTAL_SAME_PAGE_DUPLICATION | 0 |
| BROKEN_INTERNAL_LINKS (meaningful, excluding the two 404 templates) | 0 |
| ORPHAN_COMMERCIAL_URLS | 0 |
| INVALID_TEL_LINKS | 0 |
| HERO_CTA_STACK | 0 |
