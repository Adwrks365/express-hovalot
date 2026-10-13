# Phase 2B.3C — Reference Fix Report

Generated: 2026-10-07  
Scope: Reference correction pass only — **no sitewide propagation**

---

## A. Article sidebar — before / after

**Before (2B.3B):** Sidebar contained TOC, author card, related articles, InternalCTA, prev/next, and sticky on outer `<aside>` causing jumpy behavior.

**After:** Sidebar contains exactly three groups:
1. מאמרים אחרונים (5 items, compact thumbnails)
2. קטגוריות (WordPress counts)
3. טופס יצירת קשר (name + phone, submission blocked)

Removed from sidebar: TOC, author, prev/next, CTA cards, duplicate metadata.

Files: `ArticleSidebar.tsx`, `ArticlePageLayout.tsx`, `RecentArticleList.tsx`, `CategoryList.tsx`, `SidebarContactForm.tsx`

---

## B. Sidebar exact components

| Component | Source | Notes |
|-----------|--------|-------|
| Recent articles | `posts.json` via `getRecentArticles()` | Excludes current article; chronological desc |
| Categories | `categories.json` via `getSidebarCategories()` | Skips `uncategorized`; shows real counts |
| Contact form | Client component | Compact; no backend delivery this phase |

---

## C. Sticky root cause and fix

**Root cause:** Sticky was previously applied to outer sidebar wrapper inside a grid with competing overflow/animation ancestors; combined with ScrollReveal opacity issues on article body.

**Fix:**
- Only inner wrapper uses `position: sticky` (`lg:sticky lg:top-28 lg:self-start`)
- Outer `<aside>` is normal flow
- No transform animation on sidebar
- Article body no longer depends on ScrollReveal (`variant="article"`)

---

## D. TOC — placement and behavior

- Moved to **main column** top (`TableOfContents.tsx` in `ArticlePageLayout.tsx`)
- Closed by default (desktop + mobile)
- Accessible disclosure: `aria-expanded`, `aria-controls`, keyboard button
- Chevron indicator; H2/H3 from article body (IDs via `addHeadingIds`)
- Smooth scroll with `prefers-reduced-motion` respect
- Header offset via `--header-offset` (5.5rem) + manual scroll calculation (rem-aware)

---

## E. About author / company block

- Position: after article body, before prev/next
- Heading: **אודות המחבר**
- Exact approved copy in `AboutCompanyBlock.tsx` (company name + two paragraphs verbatim)
- Branded card with Express Hovalot logo from `MEDIA.logoDesktop`

---

## F. Previous / next implementation

- `ArticlePrevNext.tsx` — chronological neighbors from `getArticleNeighbors()`
- Labels: מאמר קודם / מאמר הבא
- Optional thumbnails via `featuredMediaId` → `resolveMediaById`
- Desktop: two-column grid; mobile: stack
- Empty slot omitted when neighbor missing

---

## G. Header width / wrap root cause

**Root cause:** Desktop nav forced at `xl` (1280px) inside standard content-width container; many top-level items + CTA cluster caused two-row wrap.

**Fix:**
- `HeaderShell.tsx` — wider max-width (`96rem`)
- Desktop nav only at `2xl` (1536px+)
- Compact font (13–14px), reduced gaps, `whitespace-nowrap`
- Below 1536px: mobile/tablet header (never broken wrapped desktop)

---

## H. Header breakpoint strategy

| Width | Mode |
|-------|------|
| ≥1536px | Single-row desktop nav + dropdowns |
| <1536px | Mobile/tablet header (hamburger + centered phone pill) |

Tested: 1536 desktop (no wrap), 1440/1366 mobile header, 390 mobile header.

---

## I. Production navigation parity

- All URLs and hierarchy preserved in `navigation.ts`
- Parent chevrons on items with children
- Two-column dropdown for large group "טיפים ומידע" (≥10 children)
- Hover + click open; outside click + Escape close

---

## J. FAQ cleanup

- Removed duplicate section heading from `FaqSectionBlock` when intro HTML already contains H2
- Renderer dedupes adjacent identical "חייגו עכשיו" richText blocks
- Hero H1 remains "שאלות נפוצות"; body intro H2 "תשובות לשאלות נפוצות"

---

## K. About page structural improvement

- Added to structured reference set: `/about-us`
- Built from Elementor inventory → `about-us.json` (11 blocks → 10 after duplicate FAQ removal)
- Sections: hero intro, contact form, image+text (מי אנחנו), expertise, benefits icon grid, FAQ, closing CTA, final form/quote block
- Hero uses truck team image + 15+ years intro text
- **Post-pass:** removed duplicate FAQ block (s10)

---

## L. Contact page improvement

- Structured renderer with standard hero variant
- Single form block with production copy preserved
- Bottom InternalCTA with balanced button group + phone nowrap

---

## M. Storage reference page status

- Structured renderer with service hero variant
- **Partial:** 3 broken images in visual QA (media-map filename normalization still incomplete for some assets)

---

## N. CTA no-wrap fixes

- Global `a[href^="tel:"] { white-space: nowrap; }`
- `InternalCTA.tsx` — phone in `<span dir="ltr" className="whitespace-nowrap">`
- `PhoneCta.tsx` — nowrap on all variants
- CTA button order: Quote → WhatsApp → Phone with min-widths

---

## O. Screenshots generated

Directory: `audit/screenshots/phase-2b3c/` (10 files)  
See `PHASE_2B3C_VISUAL_REVIEW.md`

---

## P. Data parity

- No changes to SEO URLs, canonicals, titles, or robots
- Content sourced from existing `pages.json` / `posts.json` / Elementor inventory
- No production writes

---

## Q. Rendered parity

| Page | Visible chars | Broken imgs | Result |
|------|---------------|-------------|--------|
| storage-short | 5834 | 3 | FAIL (images) |
| contact | 1374 | 0 | PASS |
| faq | 1318 | 0 | PASS |
| article-2026 | 16635 | 5 | FAIL (images) |
| quote | 1563 | 0 | PASS |

Content visibility PASS on article (regression fixed); image assets remain open.

---

## R. Lint

`npm run lint` — **PASS**

---

## S. TypeScript

`npx tsc --noEmit` — **PASS**

---

## T. Build

`npm run build` — **PASS** (79 static routes)

---

## U. Remaining weaknesses

1. Broken inline images on reference article (5) and storage page (3)
2. About page: early duplicate contact form block from production structure (s2) still present before main content sections
3. Desktop header unavailable between 1280–1535px (mobile mode) — acceptable per spec but may warrant custom breakpoint tuning
4. Sidebar sticky not covered by automated scroll test (manual verification recommended)
5. Icon feature grid on About lacks production icon assets

---

## V. Production safety

- No production deployment
- No production WordPress changes
- No form email delivery enabled
- Homepage body frozen; shared header/footer improvements only
- **Sitewide propagation NOT started** — reference pages only

---

## Approval status

**NOT approved for sitewide propagation.** Article architecture, header, TOC, sidebar, and QA gates pass; broken media and About/Storage visual polish require a follow-up before sign-off.
