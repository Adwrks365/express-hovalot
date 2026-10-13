# Phase 2B.3F — Archetype Parity Report

Generated: 2026-10-07

## A. Header collision root cause

**Root cause:** The desktop header used a 3-column grid (`logo | nav flex-1 | actions`) but nav links had `flex-shrink: 0` / `shrink-0`, so when the center column was narrower than the sum of nowrap nav labels, items visually bled into the actions column. The phone CTA (first action) collided with **צרו קשר** (last nav link).

**Fix:** Full-width `HeaderShell` (`max-w-[112rem]`), compact xl typography, nav-vs-actions collision detection (last nav link vs first action only), and automatic fallback to mobile/tablet header when collision is detected.

## B. Header breakpoint strategy

| Width | Mode | Collisions |
|------:|------|------------|
| 1920 | Desktop single row | 0 |
| 1600 | Desktop single row | 0 |
| 1536 | Desktop single row | 0 |
| 1440 | Desktop single row | 0 |
| 1366 | Desktop single row | 0 |
| 1280 | Desktop single row | 0 |
| 1200 | Mobile/tablet | — |
| 1024 | Mobile/tablet | — |

Desktop breakpoint: `xl` (1280px). WhatsApp hidden below 1400px to reduce action-column pressure.

## C. Dropdown clipping root cause

**Root cause:** (1) `white-space: nowrap` on long article titles in mega menu; (2) absolute positioning anchored to nav item without viewport clamping; (3) `mouseEnter` on parent wrapper did not reliably open menus from child links in automated/hover contexts.

## D. Mega-menu fix

- `HeaderDropdown`: mega width `min(900px, calc(100vw - 2rem))`, 2–3 columns, `white-space: normal`, `overflow-wrap: anywhere`
- Fixed positioning with viewport clamp (`left >= 16px`, `right <= viewport - 16px`)
- CSS `group-hover` visibility for reliable hover open
- Reposition on `mouseenter`, resize, scroll

## E. About production section inventory

See `audit/reports/ABOUT_PAGE_STRUCTURE_PARITY.md` — 13 production Elementor sections mapped; 3 responsive duplicates intentionally skipped.

## F. About local section inventory

1. `AboutPageHero` — H1/H2/intro + inline quote form + team background
2. `who-we-are` imageText
3. `expertise` richText + service links
4. `why-choose` richText
5. `benefits` iconFeatureGrid (4 items)
6. `faq` accordion (8 items)
7. `trust-experience` imageText
8. `final-cta` conversionSection

## G. Missing About sections restored

- Rich hero with production headline hierarchy and hero form
- מי אנחנו image/text
- המומחיות service list
- Benefits grid (4 items)
- Trust / experience truck section
- Final CTA (deduped from duplicate production forms)

**MISSING: 0**

## H. Storage pallets root cause

Auto-build from Elementor produced linear 14-block output with duplicate feature grids, broken thumb paths (`/wp-content/uploads/thumbs/...`), oversized logo-as-hero, and raw WordPress linear stacking.

## I. Storage archetype implementation

Curated `src/content/structured/אחסון-משטחים.json` as **STORAGE_SERVICE** reference:

- Hero (storage-2 image, not 150×150 thumb)
- `storageSolutionsGrid` (3 deduped cards with correct `/media/` paths)
- `imageText` warehouse section
- `stats` (single block)
- `faq`
- closing richText with internal links
- `conversionSection`

Registered in `registry.ts` + `page-archetypes.ts`.

## J. Media-role mapping

| Asset | Role | Path |
|-------|------|------|
| storage-2 | Hero | `/media/2571-storage-2.webp` |
| Small_3 | Service card | `/media/2313-Small_3.webp` |
| paltte | Service card | `/media/2399-paltte.webp` |
| 6-1 | Warehouse / card | `/media/2594-6-1.webp` |
| about team | Hero bg | `MEDIA.aboutTeam` |
| truck action | Trust section | `/media/3517-...webp` |

## K. Missing media final count

Reference pages: **MISSING = 0** (curated paths verified in build)

## L. Page archetype system

Created `src/lib/structured-pages/page-archetypes.ts` with:

`SERVICE_LANDING`, `STORAGE_SERVICE`, `MOVING_SERVICE`, `PACKING_SERVICE`, `AREA_PAGE`, `PRICING_PAGE`, `ABOUT`, `CONTACT`, `FAQ`, `ARTICLE`, `ARCHIVE`, `STANDARD_INFORMATION`

## M. Structural parity per page

| Page | Status |
|------|--------|
| `/about-us` | PASS — see ABOUT_PAGE_STRUCTURE_PARITY.md |
| `/אחסון-תכולה-לטווח-קצר` | PASS — curated 6-block STORAGE_SERVICE (restored from auto-build regression) |
| `/אחסון-משטחים` | PASS — curated STORAGE_SERVICE reference |
| `/שאלות-נפוצות` | PASS (unchanged reference) |
| `/צרו-קשר` | PASS (unchanged reference) |
| Article sample | PASS (ArticlePageLayout) |

## N. Content parity

All unique production content preserved in curated JSON. Duplicate Elementor responsive blocks (mobile CTA strips, duplicate FAQ/grids) deduped per 2B.3D rules.

## O. SEO safety

- No URL changes
- No production changes
- No sitewide propagation
- Homepage frozen

## P. Screenshots

- `audit/screenshots/phase-2b3f/header-{width}.png`
- `audit/screenshots/phase-2b3f/dropdown-tips-mega.png`
- `audit/screenshots/phase-2b3f/about-{prod,local}-{desktop,mobile}.png`
- `audit/screenshots/phase-2b3f/storage-pallets-{prod,local}-{desktop,mobile}.png`
- `audit/screenshots/phase-2b3f/storage-short-{prod,local}-{desktop,mobile}.png`

## Q. lint

**PASS** (`npm run lint`)

## R. TypeScript

**PASS** (`npx tsc --noEmit`)

## S. build

**PASS** (`npm run build`)

## T. Remaining weaknesses

1. Full 70-URL parity matrix requires extended run: `node scripts/phase-2b3f-parity-matrix.mjs` (~30–60 min)
2. Non-reference service pages still use generic renderer until archetype rollout (intentionally not propagated this phase)
3. Playwright hover required CSS `group-hover` for dropdown QA reliability

## U. Production safety

- No production deploy
- No production URL/content changes
- Curated structured JSON protected from auto-build overwrite via `CURATED_PATHS` in build script

## Automated QA results

`audit/reports/phase-2b3f-header-qa.json` — **PASS**

- Header nav/actions collisions: **0** at 1280–1920
- Dropdown horizontal overflow: **0**
- Mega menu in viewport: **PASS**
