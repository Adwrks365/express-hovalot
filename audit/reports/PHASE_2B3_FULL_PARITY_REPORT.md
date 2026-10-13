# Phase 2B.3 — Full Parity Report (In Progress)

Generated: 2026-10-07

## Status

Phase 2B.3 correction pass **started**. Core navigation, hero, structured layouts, and article template foundations are implemented. Full section-by-section parity for all 59 URLs and complete media/browser validation remain in progress.

---

## A. Navigation

| Metric | Production | Local (after 2B.3) |
|--------|----------:|-------------------:|
| Top-level items | 9 | 9 |
| Submenu parents | 5 | 5 |
| Total submenu links | 42 | 42 |

**Before:** Missing entire "הובלות באזור ירושלים" branch, "צרו קשר", wrong labels ("בלוג" vs "טיפים ומידע"), flat "מחירון" instead of under "הצעת מחיר", incomplete service children.

**After:** `src/config/navigation.ts` matches production audit (`audit/reports/production-navigation-parity.json`).

**Parity:** MATCH (hierarchy + hrefs)

---

## B. Menu interaction

- Desktop: state-based `desktopOpen` (not CSS-only), hover + click toggle, outside click + Escape close, submenu closes on navigation
- Mobile: chevron expand/collapse, child link closes drawer + submenu
- Route change resets all menu state

---

## C. Breadcrumbs

- Added `variant="onDark"` for dark hero: links `text-white/90`, current page `text-accent-300` (gold), visible separator
- Schema preserved

---

## D. Page archetypes

See `audit/reports/INNER_PAGE_ARCHETYPES.md`

| Archetype | URLs |
|-----------|-----:|
| service-landing | 14 |
| location | 10 |
| storage-landing | 6 |
| article | 16 |
| standard | 8 |
| pricing / about / quote / faq / contact / blog-archive | 1 each |

---

## E. Reference page — אחסון תכולה לטווח קצר

- **Renderer:** `StructuredPageLayout` (H2-section split + FAQ accordion detection)
- **Hero:** Elementor background image extraction + side image from content
- **Section parity table:** pending detailed production-vs-local screenshot pass (`audit/screenshots/phase-2b3/`)

---

## F–G. Media

- Filename fallback added in `wpUrlToLocal()` for mapped assets (fixes partial logo paths)
- Full semantic media parity script: **pending**

---

## H. Articles

- `ArticlePageLayout`: sidebar TOC, related articles, author block, prev/next
- Author from schema: **צוות אקספרס הובלות** / `guest_2020`
- TOC from H2/H3 with stable IDs

---

## I–J. Links / SEO

- Re-validation pending after server restart with 2B.3 build

---

## K. Responsive QA

- Pending full breakpoint sweep + phase-2b3 screenshots

---

## L. Quality gates

| Gate | Result |
|------|--------|
| lint | PASS |
| tsc | PASS |
| build | PASS |
| content parity (updated script) | 26 PASS / 33 REVIEW / 0 FAIL |

REVIEW flags are primarily H1 title vs source first-H1 wording differences (hero uses page title by design), not content deletion.

---

## Changed source files

- `src/config/navigation.ts`
- `src/components/layout/Header.tsx`
- `src/components/content/Breadcrumbs.tsx`
- `src/components/internal/InternalHero.tsx`
- `src/components/internal/StructuredPageLayout.tsx`
- `src/components/internal/ServicePageLayout.tsx`
- `src/components/internal/StandardPageLayout.tsx`
- `src/components/internal/ArticlePageLayout.tsx`
- `src/components/article/TableOfContents.tsx`
- `src/components/article/ArticleSidebar.tsx`
- `src/lib/content-sections.ts`
- `src/lib/content-registry.ts`
- `src/lib/media.ts`
- `src/lib/article-utils.ts`
- `scripts/phase-2b3-production-nav.mjs`
- `scripts/phase-2b3-archetypes.mjs`
- `scripts/phase-2b-content-parity.mjs`

---

## M. Human decisions still required

- Missing logo assets (tabol, modil, cibit, castro) — map or HUMAN_REVIEW
- `/שגיאה-404-1/` `/שגיאה-404-2/` — unchanged MANUAL_DECISION

## N. Production safety

Production WordPress untouched. Read-only audits only.
