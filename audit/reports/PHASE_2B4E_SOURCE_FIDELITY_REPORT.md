# Phase 2B.4E — Source Fidelity Report

Generated: 2026-10-07T13:35:00Z  
**Status: SOURCE FIDELITY RECOVERED — human visual review required**

---

## A. Root cause — unrelated person images

Person portraits (**rina.webp**, **shyli.webp**, **eran.webp**) and client logo strips (**adidas**, **aldo**, etc.) exist in WordPress `contentHtml` as **global Elementor template widgets** embedded in every inner page export.

Phase 2B.4B–D parser **promoted** these into prominent layout components:

| Mechanism | Effect |
|-----------|--------|
| `prevAll("img")` in `extractFeatureCards` | Pulled distant images from prior sections into feature cards |
| `mergeServiceSectionRuns` | Converted area H2 sections into feature grids with cross-section images |
| `splitImageTextPairs` | Created large **imageText** sections for 300×300 testimonial portraits |
| `extractLogoGrid` | Rendered global client logo strip as **logoGrid** on area pages |

Production HTML contains these assets in the DOM, but they are **global sitewide widgets**, not page-specific content. Local site incorrectly elevated them into the main body composition.

---

## B. Media ownership system

**File:** `audit/reports/page-media-ownership.json` (44 pages)

**Module:** `src/lib/page-composition/page-media-ownership.ts`

Each entry records:
- `mediaKey`, `mediaUrl`, `localPath`
- `role`: content | featured | global-testimonial | global-logo
- `productionRendered`, `sharedGlobal`, `allowedOnPage`

**Global fingerprints:** `src/content/migration/global-media-filter.ts`

---

## C. Cross-page media leakage found

| Media | WP ID | Source | Was rendered as |
|-------|------:|--------|-----------------|
| rina.webp | 2790 | Global testimonial widget | imageText (portrait) |
| shyli.webp | 2789 | Global testimonial widget | imageText (portrait) |
| eran.webp | 2788 | Global testimonial widget | imageText (portrait) |
| adidas–tobol logos | 2354–2365 | Global client strip | logoGrid |

**Post-fix unrelated media in body: 0** (verified on 14 URLs)

---

## D. Area pages corrected

Parser changes for `AREA_PAGE`:

- Strip global media sections **before** composition (`strip-global-media.ts`)
- **Disable** `mergeServiceSectionRuns` (no auto featureGrid from H2 runs)
- **Disable** `logoGrid`, `benefitGrid`, h3 `featureGrid` inference
- **Disable** `prevAll("img")` — sibling images only
- Default: **prose per H2 section** preserving source order

| URL | Pre-2B.4E issue | Post-2B.4E |
|-----|-----------------|------------|
| /הובלות-בגבעת-זאב/ | 3 portrait imageText + logoGrid + featureGrid | 10 prose sections, 0 portraits |
| /הובלות-במבשרת-ציון/ | Same pattern | 10 sections, 0 unrelated media |
| /הובלות-בבית-שמש/ | Same pattern | 14 sections, 0 unrelated media |
| /הובלות-במעלה-אדומים/ | Same pattern | 10 sections, 0 unrelated media |

Rendered body text (Givat Ze'ev): **3,757 chars** (was ~578 in 2B.4C broken state; portraits removed from prominent layout)

---

## E. Service pages corrected

| URL | Change |
|-----|--------|
| /הובלות-משרדים-בירושלים/ | Media filtered; no cross-section img assignment; 6 semantic sections |
| /חברת-אריזה-והובלה-בירושלים/ | FAQ guard + media filter |
| /הובלות-קטנות-בירושלים/ | 7 sections, 0 unrelated media |

Reference page `/הובלת-דירה-בירושלים/` (curated StructuredPageRenderer) unchanged — design reference for Hero, icon grids, stats, FAQ, final conversion.

---

## F. Section parity

**File:** `audit/reports/PHASE_2B4E_SECTION_PARITY.json`

Area pages: production H2 count preserved via prose sections (one block per H2). Semantic inference reduced to avoid invented structure.

---

## G. Media parity

**Script:** `scripts/phase-2b4e-media-fidelity.mjs`  
**Result:** 14/14 PASS — no global testimonial or client-logo media in page body

| Page | Body images | Unrelated |
|------|------------:|----------:|
| Area samples (5) | 7–13 | 0 |
| Service samples | 2–4 | 0 |

---

## H. Content parity

Phase 2B.4D coverage protections **retained**.

**Script:** `scripts/phase-2b4d-content-qa.mjs` — 7/7 PASS

| URL | Coverage ratio | Status |
|-----|---------------:|--------|
| /הובלות-בגבעת-זאב/ | 0.984 | PASS |
| /הובלות-משרדים-בירושלים/ | 1.000 | PASS |

---

## I. Visual quality classification

**File:** `audit/reports/PHASE_2B4E_VISUAL_COMPARISON.md`

| Classification | Pages |
|----------------|------:|
| NEEDS_POLISH | 11 (structure restored; design polish vs apartment reference pending) |
| FAIL_SOURCE_FIDELITY | 1 (`/הצעת-מחיר/` — curated JSON shorter than raw source) |
| APPROVED | 0 (awaiting human review) |

---

## J. FinalConversionSection polish

Updated `FinalConversionSection.tsx`:
- Balanced grid: `lg:grid-cols-[1.05fr_0.95fr]`
- Vertically centered columns
- Larger form padding (`p-5 sm:p-6 lg:p-7`)

RTL: heading/CTA column first (start/right), form column second (left).

---

## K. Screenshots

| Set | Path |
|-----|------|
| Production (from audit) | `audit/screenshots/phase-2b4e/production/` |
| Local (fresh build) | `audit/screenshots/phase-2b4e/local/` |

13 page pairs captured at 1440px.

---

## L. Lint

```
npm run lint  →  PASS
```

---

## M. TypeScript

```
npx tsc --noEmit  →  PASS
```

---

## N. Build

```
npm run build  →  PASS
BUILD_ID: sh9gLoDifBBZZvB5GNLu4
PID: 20440 (port 3010)
```

---

## O. Remaining blockers (human review)

1. **Visual polish** — area/service pages classified NEEDS_POLISH vs apartment reference design language (icon grids, stats, section backgrounds).
2. **Pricing page** — curated JSON may need enrichment from production `contentHtml`.
3. **Section parity** — H2→prose mapping preserves content but not all production visual groupings (image-box rows remain inline in prose).

---

## Files added/changed

| File | Purpose |
|------|---------|
| `src/content/migration/global-media-filter.ts` | Global media fingerprints |
| `src/lib/page-composition/strip-global-media.ts` | Pre-parse global strip |
| `src/lib/page-composition/page-media-ownership.ts` | Ownership inventory |
| `src/lib/page-composition/parse-page-composition.ts` | Source-faithful parsing |
| `scripts/phase-2b4e-media-fidelity.mjs` | Media QA |
| `scripts/phase-2b4e-visual-qa.mjs` | Screenshots + parity |
| `scripts/phase-2b4e-build-media-ownership.mjs` | Ownership JSON builder |

---

**STOP — Phase 2B.4E complete pending human review on http://localhost:3010**
