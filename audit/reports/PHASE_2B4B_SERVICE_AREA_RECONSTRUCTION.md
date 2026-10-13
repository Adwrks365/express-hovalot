# Phase 2B.4B — Service & Area Page Reconstruction Report

**Generated:** 2026-10-07  
**Review target:** http://localhost:3010

---

## A. Root Cause — Broken Service Pages

Phase 2B.4 applied H2-splitting via `StructuredPageLayout`, but still rendered most body content as sequential `RichTextSection` blocks. This preserved text while producing:

- Narrow ~600–1000px prose columns for entire sections
- Standalone images stacked vertically (img → text → img → text)
- Shield icons and feature items as unstyled lists
- Separate CTA card + orphan form widget before Footer
- No semantic grouping into cards, benefit grids, or image/text pairs

**Root cause:** Generic RichText-as-layout, not semantic composition.

---

## B. Root Cause — Broken Area Pages

Area/city pages (`/הובלות-ב*`) suffered the same fallback. Long geographic SEO copy appeared as uninterrupted prose dumps without:

- Local section grouping
- Related area link grids
- Image/text pairs for local logistics content
- Unified conversion treatment

---

## C. Pages Previously Using Generic Fallback

| Category | Count |
|----------|------:|
| Commercial URLs (SERVICE + STORAGE + AREA + PRICING) | **32** |
| Using generic `StructuredPageLayout` (2B.4) | **25** |
| Using curated `StructuredPageRenderer` | **7** |

---

## D. Pages Now Using Structured Archetypes

| Renderer | Count | Scope |
|----------|------:|-------|
| `ArchetypePageRenderer` (semantic composition parser) | **25** | All non-curated commercial pages |
| `StructuredPageRenderer` (curated JSON + FinalConversion) | **7** | Reference pages |
| **Total commercial structured** | **32** | 100% of core money pages |

Generic RichText fallback restricted to `STANDARD_INFORMATION` pages only.

---

## E. Service Archetype Implementation

**Files:** `src/lib/page-composition/parse-page-composition.ts`, `src/components/archetype/ArchetypePageRenderer.tsx`

Parser classifies each H2 section into:

- `prose` — wide RichTextSection (full container width)
- `imageText` — 50/50 ImageTextSection with alternating sides
- `benefitGrid` — IconFeatureGridSection
- `featureGrid` — FeatureGridSection (service cards)
- `faq` — FaqSectionBlock
- `ctaTop` — one compact InternalCTA near top
- `logoGrid` — LogoGridSection

Flow: Hero → intro → optional top CTA → semantic blocks → **FinalConversionSection**

---

## F. Area Archetype Implementation

Same `ArchetypePageRenderer` with `AREA_PAGE` archetype. Additional detection:

- `areaLinks` — compact chip grid for nearby area/service internal links (3+ area hrefs)
- Preserves unique city headings and local SEO paragraphs in semantic sections
- Does NOT duplicate content across cities

---

## G. ImageTextSection Usage

Consecutive img+text patterns in source HTML are split into `ImageTextSection` blocks with:

- Desktop 50/50 grid via `ImageTextBlock`
- Alternating `imagePosition` start/end
- Hero duplicate image stripped via `stripHeroDuplicateImage`

---

## H. BenefitGrid Usage

Sections matching `/למה לבחור|יתרונות|מומח|ביטוח/i` with 3+ h3/li benefit items render as `IconFeatureGridSection` cards instead of raw bullet stacks.

---

## I. RelatedAreaLinks Implementation

**File:** `src/components/sections/AreaLinksSection.tsx`

Renders internal area links as RTL chip grid with preserved href + anchor text.

---

## J. FinalConversionSection Implementation

**File:** `src/components/sections/FinalConversionSection.tsx`

Unified conversion unit (`data-final-conversion`):

- **Right (RTL):** headline, subtitle, phone, WhatsApp, quote CTA
- **Left:** compact QuoteForm in branded card
- Single rounded container (~1000px max-width)
- Mobile: stacked single column

Applied to all commercial pages (curated + archetype). FAQ/Contact/About retain bespoke conversion blocks.

---

## K. Orphan Form Removal

- Global footer forms stripped from body parsing (`isFormOrGlobalWidget`)
- Curated `conversionSection` / `formBlock` replaced by `FinalConversionSection` on service/storage/moving pages
- QA verifies **0 orphan forms** in `.internal-page` outside `[data-final-conversion]`

---

## L. CTA Deduplication

- Maximum **one** `ctaTop` block per page
- Body CTA/form sections removed from parser output
- No separate InternalCTA + standalone form before Footer

---

## M. Desktop Screenshots (1440)

`audit/screenshots/phase-2b4b/*-desktop.png`

- moving-apartment, moving-small, moving-office, packing
- storage-short, special-crane
- area-region, area-givat-zeev, area-mevaseret, area-beit-shemesh
- about, faq, contact, article

---

## N. Mobile Screenshots (390)

`audit/screenshots/phase-2b4b/*-mobile.png` — same URL set

---

## O. Content Parity

All unique production headings, paragraphs, lists, FAQ, and internal links preserved in parsed blocks. No summarization or deletion.

---

## P. Media Parity

Images routed through semantic components with role-appropriate sizing. Hero dedup active.

---

## Q. Link Parity

Area link hrefs and anchor text preserved exactly in `AreaLinksSection`.

---

## R. SEO Parity

URLs, titles, canonical paths unchanged. Heading wording preserved in block HTML.

---

## S. Remaining Generic Fallback Pages

Only `INFORMATION` and utility pages use `StructuredPageLayout`. **0 core commercial pages** on generic fallback.

---

## T. Lint

```
npm run lint → PASS
```

---

## U. TypeScript

```
npx tsc --noEmit → PASS
```

---

## V. Build

```
npm run build → PASS
```

---

## W. Remaining Blockers

1. **Human visual approval** required — automated QA cannot verify semantic grouping quality for all 32 commercial pages
2. **Parser edge cases** — some pages with unusual Elementor structure may still render partial prose blocks; flag via `rawFallbackUsed` heuristic for manual review
3. **Footer mini-form** remains in global Footer (by design, after FinalConversionSection)
4. **Section-aware parity matrix** fields (ARCHETYPE_RENDERER, RAW_FALLBACK_USED) — recommend adding in next QA iteration

---

## QA Gate

`scripts/phase-2b4b-qa.mjs` — **23/23 PASS**

- Final conversion present on all sampled service/area pages
- No orphan body forms
- No excessive narrow columns

**Phase 2B.4B complete. Awaiting human visual approval. No forms/analytics/deployment.**
