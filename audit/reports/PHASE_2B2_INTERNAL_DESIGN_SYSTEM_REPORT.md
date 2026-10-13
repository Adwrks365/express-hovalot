# Phase 2B.2 — Internal Design System Report

Generated: 2026-10-07  
Status: **COMPLETE** (presentation rebuild; no cutover)

---

## A. Page families discovered

| Family | Template / route | Layout component |
|--------|------------------|------------------|
| Homepage | `/` (frozen 2A.20) | `src/app/page.tsx` — unchanged body |
| Service | `service` classification | `ServicePageLayout` |
| Location / service area | `location` | `ServicePageLayout` |
| Standard informational | default pages | `StandardPageLayout` |
| Quote / contact / FAQ / about | template-specific | `StandardPageLayout` (CTA rules vary) |
| Blog index | `/blog/` | `BlogIndexLayout` |
| Article / post | `article` | `ArticlePageLayout` |
| Category / tag / author archives | archive routes | `ArchivePageLayout` |
| Pricing | `/מחירי-הובלת-דירות/` | `StandardPageLayout` + table styles |
| Storage | `/אחסון-*` | `ServicePageLayout` or `StandardPageLayout` |
| Legal / utility | privacy, terms, sitemap | `StandardPageLayout` |
| 404 | Next.js `not-found.tsx` | Branded Express 404 (no migration notes) |

---

## B. Components created / reused

### Created (`src/components/internal/`)

- `InternalPageShell` — white page wrapper
- `InternalHero` — dark-green hero, breadcrumb, H1, optional excerpt + image
- `ContentSection` — section rhythm + optional ScrollReveal
- `RichText` — controlled HTML column (standard / article / wide)
- `InternalCTA` — branded quote / phone / WhatsApp block
- `ArticleCard` — blog archive card
- `BlogIndexLayout` — blog grid
- `ArticlePageLayout` — editorial article template
- `ServicePageLayout` — service landing flow
- `StandardPageLayout` — default internal pages

### Reused from Phase 2A.20

- `Header`, `Footer`, `Logo`, `Container`, `Button`
- `Breadcrumbs`, `PhoneCta`, `WhatsAppCta`
- `ScrollReveal`, `ScrollRevealGroup` (homepage)
- Homepage sections — **not duplicated**

---

## C. Legacy Elementor presentation rules removed / neutralized

Implemented in `src/lib/wp-html.ts`:

- Unwrap Elementor sections, containers, columns, widget wraps (6 passes)
- Remove spacers, dividers, scripts, iframes, forms, inline `<style>`
- Strip `data-elementor-*`, inline `style`, legacy width/height on images
- Remove empty presentation-only wrappers
- Optional `stripDuplicateH1` when hero renders semantic H1
- Rewrite internal hrefs + media to local paths
- Wrap tables in `.rich-text-table-wrap`
- Tag CTA anchors with `.rich-text-cta-link`
- Detect logo clusters → `.rich-text-logo-cluster` grid

**Preserved:** paragraphs, headings, lists, links, images, tables, blockquotes, FAQ text, anchors/IDs.

---

## D. Internal Hero implementation

- Dark brand green (`bg-brand-950`) with subtle gold radial gradient
- Breadcrumb row (RTL), single H1, optional excerpt from source `excerptHtml` only (no invented copy)
- Optional featured image: 4:3, max ~240px desktop, rounded-xl, `object-cover`
- Two-column grid when image exists; compact single column on mobile
- Controlled padding: `py-8` → `py-12` desktop (no giant min-heights)

---

## E. Typography / content-width system

Global `.rich-text` in `globals.css`:

| Token | Value |
|-------|-------|
| Body desktop | 18px (`1.125rem`) |
| Body mobile | 17px (`1.0625rem`) |
| Line height | 1.8 |
| Standard column | max ~800px (`50rem`) |
| Article column | max ~840px (`52.5rem`) |
| Wide / service | max ~896px (`56rem`) |
| Section container | `Container` ~1180–1240px |

H2: border-bottom section separators. H3: subsection weight. Strong hierarchy without changing heading text.

---

## F. Service-page treatment

`ServicePageLayout`: Hero → wide RichText body → `InternalCTA`. Natural editorial flow; no card-per-paragraph. Featured image in hero when available.

---

## G. Blog archive treatment

`/blog/` rebuilt as responsive card grid (1 / 2 / 3 columns). Each card: featured image, title, date, source excerpt (truncated), "קראו עוד". Subtle border, rounded image, hover lift. ScrollReveal stagger on cards.

---

## H. Article treatment

`ArticlePageLayout`: breadcrumb + hero H1, publication date, optional 16:9 featured image, article-width RichText, responsive tables, `InternalCTA` footer block.

---

## I. Images / media treatment

- Legacy width/height stripped; `max-width: 100%`, `height: auto`, `max-height: 520px`
- Rounded-xl corners, lazy loading
- Logo clusters: responsive grid (not broken vertical stacks)
- Featured images via Next.js `Image` in hero/article templates

---

## J. Table / list / FAQ treatment

- Tables: dark-green header row, alternating rows, rounded wrapper, horizontal scroll on mobile
- Lists: RTL spacing, disc/decimal styling
- FAQ: source HTML preserved in RichText (accordion deferred — answers remain SSR/indexable)

---

## K. CTA treatment

- Inline source CTAs tagged `.rich-text-cta-link` (gold button styling)
- Page-end `InternalCTA` reuses exact phrase "רוצים לקבל הצעת מחיר מהירה?" with `/הצעת-מחיר/`, `tel:`, WhatsApp destinations unchanged

---

## L. Header submenu structure

From `src/config/navigation.ts` (audit-derived, not guessed):

- **שירותי הובלה** → 9 service child links
- **אחסון** → 4 storage child links
- Flat items: home, about, quote, pricing, FAQ, blog

---

## M. Desktop dropdown behavior

- Chevron on parent links with children
- Hover + focus-within opens submenu
- Invisible hover bridge (`h-2`) prevents gap-dismiss
- Styled submenu: brand-800 panel, rounded-xl, RTL start-aligned

---

## N. Mobile submenu behavior

- Separate chevron toggle per parent (44px touch target)
- Link navigates; chevron expands/collapses children
- One submenu open at a time (`mobileExpanded` state)

---

## O. Menu-close behavior after navigation

- Pathname change resets `open` + `mobileExpanded` (render-phase reset pattern)
- Link clicks close mobile drawer
- Escape closes menu + restores body scroll
- Desktop dropdown closes on navigation via pathname reset

---

## P. Footer consistency

Approved Phase 2A.20 `Footer` used globally. Migrated WordPress HTML does not emit a second footer. Mobile centered treatment preserved.

---

## Q. ScrollReveal usage

Applied to: RichText blocks, article cards, InternalCTA, archive cards. Not per-paragraph. Respects `prefers-reduced-motion`. Does not affect homepage truck animation.

---

## R. Mobile QA results

Screenshots captured at **390×844** (mobile) and **1440×900** (desktop) for all required page families.

| Check | Result |
|-------|--------|
| Horizontal overflow | None observed in captured pages |
| Hero compact on mobile | Yes — reduced padding, no min-height spacers |
| Blog grid 1-col mobile | Yes |
| Table scroll wrapper | CSS present; full-page pricing mobile screenshot captured |
| Touch targets ≥44px | Header menu buttons, CTAs meet target |
| Phone CTA visible mobile header | Yes — center column |
| Article typography | ~17px body, ~840px max column |

**Note:** Restart local `next start` after latest build to verify submenu + component crops against fresh bundle.

---

## S. Content parity result

**59 / 59 PASS** (`npm run parity:2b`)

- URLs, titles, meta, canonical, H1 wording, body HTML, links, and media references preserved
- Duplicate H1 removed from body only when hero renders page H1 (`stripDuplicateH1: true`)

---

## T. Internal-link validation totals

| Status | Count |
|--------|------:|
| OK (200) | 68 |
| Redirected | 0 |
| Broken | 5 |
| External | 23 |
| Fragment/mailto/tel | 10 |
| **Total unique hrefs** | **106** |

Migration-caused broken: **0**. See `PHASE_2B2_INTERNAL_LINK_VALIDATION.md`.

---

## U. Media reconciliation (192 total)

| Classification | Count |
|----------------|------:|
| Mapped + file OK | 178 |
| Unmapped — source 404 (legacy unused) | 14 |
| Missing required | 0 |
| Duplicate | 0 |
| Inaccessible source | 14 (same as unmapped) |

See `PHASE_2B2_MEDIA_VALIDATION.md`.

---

## V. URL contract status

**73 entries** — **68 PASS**, **2 FAIL** (MANUAL_DECISION 404 test pages), **3 expected difference** (redirects / non-200 by design)

Local indexable pages: **71/73 HTTP 200** (excluding `/שגיאה-404-1/`, `/שגיאה-404-2/`)

---

## W. Lint / TypeScript / build

| Gate | Result |
|------|--------|
| `npm run lint` | PASS |
| `npx tsc --noEmit` | PASS |
| `npm run build` | PASS (79 app static paths + 3 pages-router pagination) |

---

## X. Screenshots produced

Directory: `audit/screenshots/phase-2b2/` (**26 files**)

| File | Description |
|------|-------------|
| `homepage-desktop.png` / `-mobile.png` | Regression check |
| `service-apartment-*` | `/הובלת-דירה-בירושלים/` |
| `services-hub-*` | `/שירותי-הובלה/` |
| `about-*` | `/about-us/` |
| `quote-*` | `/הצעת-מחיר/` |
| `pricing-*` | `/מחירי-הובלת-דירות/` |
| `blog-*` | `/blog/` |
| `article-1-*`, `article-2-*` | Two articles |
| `storage-*` | `/אחסון-תכולה-בירושלים/` |
| `location-*` | `/הובלות-במבשרת-ציון/` |
| `404-*` | Next.js 404 |
| `nav-desktop-dropdown-open.png` | Desktop submenu hover |
| `nav-mobile-open.png` | Mobile drawer |

Pending after server restart: `nav-mobile-submenu-open.png`, `pricing-table-mobile.png`, `internal-cta-component.png`, `logo-cluster-component.png` (selectors require latest build served).

---

## Y. Remaining REAL blockers

1. **Local dev server stale** — port 3000/3001 occupied by pre-build process; restart required for final visual QA of 2B.2 bundle
2. **5 legacy broken hrefs in source HTML** — not migration-caused; need redirect policy at cutover
3. **14 unmapped media assets** — source 404; legacy unused (accepted)
4. **FAQ accordion** — optional polish; FAQ content fully SSR today

---

## Z. Human decisions still required

1. `/שגיאה-404-1/` and `/שגיאה-404-2/` — restore, redirect, or leave excluded?
2. Legacy slug redirects: `פתרונות-אחסנה`, `contact-us`, corrupted packing-company URL
3. Whether to upgrade logo clusters to full homepage marquee on specific pages
4. Form delivery / production cutover — **explicitly out of scope for 2B.2**

---

## Pre-design audit

See `audit/reports/PHASE_2B2_PRE_DESIGN_AUDIT.md` for baseline problems addressed in this phase.

---

**Phase 2B.2 complete. Production WordPress untouched. Homepage Phase 2A.20 body frozen. STOP before cutover / DNS / form delivery.**
