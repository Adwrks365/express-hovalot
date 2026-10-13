# Phase 2B.3D — Revised Reference Report

Generated: 2026-10-07  
Scope: Reference correction only — **no sitewide propagation**

---

## A. Duplicate-section root cause

Elementor extraction imported **responsive duplicate sections** (desktop/tablet/mobile `imageGrid` splits), **global template fragments** (homepage slideshow section `kpt7ol5`, footer lead forms), and **repeated widget instances** (duplicate FAQ toggles, twin phone CTAs, broken counter stats) as independent page blocks.

The structured renderer treated each extracted section as unique content, producing repeated grids, forms, and CTAs.

---

## B. Global Elementor templates identified

| Fingerprint | Source | Handling |
|-------------|--------|----------|
| Section `kpt7ol5` | Homepage hero slideshow reused on many pages | `global-template-filter.ts` — excluded from body |
| Footer lead form copy | "צריכים הובלה בירושלים והסביבה" | Filtered from page body (Footer renders form) |
| Global CTA copy | "חייגו עכשיו וקבלו מענה מיידי" | Deduplicated / removed from FAQ |
| Responsive `imageGrid` splits | Storage page sections 4–6 | Merged into single `storageSolutionsGrid` |

File: `src/content/migration/global-template-filter.ts`

---

## C. About duplicate sections removed

**Before:** 11 blocks including early form, duplicate FAQ (Elementor sections 9+10), twin phone CTAs, second form block.  
**After:** 7 logical blocks.

| # | Block |
|---|-------|
| 1 | מי אנחנו — image+text (truck) |
| 2 | המומחיות שלנו + service links |
| 3 | למה לבחור באקספרס |
| 4 | Benefits icon grid |
| 5 | ONE FAQ accordion |
| 6 | Trust / field experience copy |
| 7 | ONE conversion section (CTA + quote form) |

Removed: early contact form (s2), duplicate FAQ (s10), phone richText (s11), second form (s12).  
Hero image removed (production About hero is text-only — empty side-image placeholder eliminated).

---

## D. FAQ duplicate sections removed

**Before:** FAQ + 2 phone CTAs + separate contact form + bottom InternalCTA = 4 conversion touchpoints.  
**After:** 2 blocks.

| # | Block |
|---|-------|
| 1 | FAQ with H2 **תשובות לשאלות נפוצות** (H1 remains page title in hero) |
| 2 | ONE `conversionSection` — InternalCTA + integrated contact form |

Removed: richText phone blocks s3/s4, standalone form duplication, redundant bottom CTA.

---

## E. Storage duplicated grid — root cause and fix

**Root cause:** Elementor sections 4, 5, 6 were three responsive splits of the same 6-card storage grid.

**Fix:**
- Curated single `storageSolutionsGrid` with 6 unique cards
- New component `StorageSolutionsGrid.tsx` (3/2/1 columns, deduped titles)
- Removed duplicate featureGrids, twin stats blocks, extra forms/CTA strips, split richText duplicates

**Before:** 15 blocks | **After:** 6 blocks

---

## F. Form duplication handling

- `deduplicateStructuredBlocks()` — one form/conversion block per page
- FAQ/About/Storage use `conversionSection` instead of separate form + InternalCTA
- Contact page: removed duplicate H3 matching section title in body HTML
- Footer/global forms not re-rendered in page body

---

## G. CTA duplication handling

- `conversionSection` consolidates quote + WhatsApp + phone
- Phone-only richText blocks filtered
- Adjacent "חייגו עכשיו" blocks removed on FAQ
- `InternalCTA` no longer appended on reference pages with conversion sections

---

## H. Media fixes

- Rewrote `wpUrlToLocal()` — thumb URL normalization, stem indexing, returns `null` for unmapped wp-content (no broken paths rendered)
- `resolveMediaInHtml()` for article body images
- `normalizeStructuredMedia()` resolves all structured block images
- Image components skip render when URL unresolvable
- `wp-html.ts` removes unmapped `<img>` tags

---

## I. Empty media containers fixed

- About hero: side image removed (no empty box)
- `InternalHero` / `ImageTextSection` / `FeatureGridSection` / `StorageSolutionsGrid` — no image wrapper when URL null
- All reference structured paths use verified `/media/*` local files

---

## J. Header final state

Unchanged from 2B.3C (approved direction preserved):
- Single-row desktop nav at ≥1536px
- Mobile header below that breakpoint
- Dropdown two-column for טיפים ומידע
- Phone nowrap, preserved hierarchy

---

## K. Article final state

Architecture unchanged (approved):
- Main: Hero → TOC (closed) → body → About company → prev/next
- Sidebar: recent articles, categories, contact form only
- Sticky inner sidebar (`lg:sticky lg:top-28`)
- Exact approved About company copy preserved

---

## L. Sidebar final state

Three groups only; sticky on inner wrapper; no TOC/author/CTA in sidebar.

---

## M. Reference page logical section counts

| Page | Production logical | Local after fix | Duplicates removed |
|------|-------------------|-----------------|-------------------|
| About | 8 | 7 (+ hero) | 4 (early form, dup FAQ, phone CTA, 2nd form) |
| FAQ | 2 | 2 | 2 (phone CTAs) + bottom CTA merge |
| Storage | 7 | 6 (+ hero) | 9 (3 grids, 2 stats, extra forms/CTAs) |
| Contact | 1 | 1 | 1 (duplicate heading) |
| Article | 1 body | 1 body | N/A (architecture pass) |

Audit: `audit/reports/PHASE_2B3D_SECTION_DEDUPLICATION.md`

---

## N. Screenshots

Directory: `audit/screenshots/phase-2b3d-revised/` (14 captures)

---

## O. Data parity

**PASS** — URLs, canonicals, robots, titles, meta, unique source text preserved. Duplicate template instances excluded from parity requirement.

---

## P. Rendered unique-content parity

| Page | Visible chars | Broken imgs (after scroll) | Result |
|------|---------------|----------------------------|--------|
| storage-short | 4367 | 0 | PASS |
| contact | 1329 | 0 | PASS |
| faq | 1191 | 0 | PASS |
| article-2026 | 16635 | 0 | PASS |
| quote | 582 | 0 | PASS |

---

## Q. SEO preservation

No URL, canonical, title, meta, or robots changes. Unique headings and FAQ answers preserved.

---

## R. lint — PASS

---

## S. TypeScript — PASS

---

## T. build — PASS

---

## U. Remaining blockers

1. **Human visual approval** still required — automated gates pass but design sign-off pending
2. About benefits icon grid has no production icon assets (text-only cards)
3. Desktop header unavailable 1280–1535px (mobile mode by design)
4. Playwright image QA must scroll lazy-loaded content (fixed in 2B.3D QA scripts)

---

## V. Production safety

- No production WordPress changes
- No deploy
- No form delivery enabled
- **No sitewide propagation**

---

## Visual quality gate (manual)

| Page | Assessment |
|------|------------|
| About | PASS_WITH_INTENTIONAL_MODERNIZATION |
| FAQ | PASS |
| Storage | PASS_WITH_INTENTIONAL_MODERNIZATION |
| Contact | PASS |
| Article | PASS |
| Header | PASS |

**NOT approved for sitewide propagation until human screenshot review confirms.**
