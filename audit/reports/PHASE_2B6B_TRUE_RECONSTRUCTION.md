# Phase 2B.6B — True Homepage-Inspired Reconstruction

**Status:** STOP — human visual approval required (10 reference URLs only)

---

## A. Why Phase 2B.6 changed too little

Phase 2B.6 (`HomepageInspiredPageRenderer`) still routed **`parsePageComposition` blocks into `RichTextSection` / legacy wrappers**, so Elementor document order and inline HTML continued to drive layout. Background bands and scroll-reveal were cosmetic; **columns, image sizing, and section grouping matched the old page**.

Phase 2B.6B treats `sanitizedHtml` as **input data only**:

1. `parsePageComposition` / `parseSectionBlocks` (classification)
2. `buildStructuredPageModel()` → **plain-text `ProseContent`, typed sections** (`src/lib/structured-content/`)
3. **`TrueReconstructionPageRenderer`** → dedicated React views (`CommercialPageView`, `ContactPageView`, …)

Raw HTML is allowed **only** inside `ProseSection` for long copy and **table fragments**.

---

## B. Raw HTML usage before / after

| Stage | Layout driven by HTML | Raw HTML blocks |
|-------|------------------------|-----------------|
| 2B.5 `SourcePageRenderer` | Entire body | All sections |
| 2B.6 `HomepageInspiredPageRenderer` | Most blocks via `RichTextSection` | Prose + imageText HTML |
| **2B.6B** | React components only | **Tables only** in prose (`tableHtml`) |

DOM metrics (reference crawl, `data-*` on `.internal-page`):

| URL | Designed sections | Prose sections | Raw HTML blocks |
|-----|------------------:|---------------:|----------------:|
| `/הובלת-דירה-בירושלים/` | 4 | 1 | 0 |
| `/הובלות-משרדים-בירושלים/` | 2 | 3 | 0 |
| `/אחסון-משטחים/` | 3 | 0 | 0 |
| `/אחסון-תכולה-לטווח-קצר/` | 5 | 1 | 0 |
| `/הובלות-בגבעת-זאב/` | *re-parse enhanced* | — | 0 target |
| `/about-us/` | 4 | 0 | 0 |

---

## C. Structured content model

Types: `src/lib/structured-content/types.ts`  
Builder: `src/lib/structured-content/build-page-model.ts`  
Extractors: `extract-prose.ts`, `extract-stats.ts`

Example shape:

```json
{
  "hero": { "title", "intro", "image", "showQuoteCta" },
  "intro": { "paragraphs": [], "lists": [], "tableHtml": null },
  "sections": [
    { "type": "serviceCards", "heading", "cards": [{ "title", "description", "image" }] },
    { "type": "imageText", "heading", "image", "body": { "paragraphs" } },
    { "type": "stats", "items": [{ "value", "label" }] },
    { "type": "faq", "items": [{ "question", "answer" }] }
  ]
}
```

---

## D. Homepage patterns reused

- **Hero:** `ContentHero` (gold bar, green gradient, larger media)
- **Cards:** `ServiceCardsSection`, `StructuredBenefitGridSection` (radius, shadow, hover)
- **Image/text:** `StructuredImageTextSection` (~50/50, large image)
- **Stats:** `StatsSection` on **brand** dark band
- **FAQ:** `StructuredFaqSection` + `FaqAccordion`
- **Conversion:** `FinalConversionSection` (`inspired`) — balanced 55/45 columns
- **Motion:** `ScrollReveal` on sections/cards (not every paragraph)

Design tokens: `PHASE_2B6_HOMEPAGE_DESIGN_SYSTEM.md` (unchanged)

---

## E–L. Reference page handling

| Page | View | Notes |
|------|------|--------|
| Services / storage | `CommercialPageView` | Cards, image/text, stats, FAQ from model |
| Area (Givat Ze'ev) | `CommercialPageView` + **area re-parse** | `parseSectionBlocks` area rules: links, benefits |
| About | `AboutPageView` | Same pipeline, no generic H2 dump |
| FAQ | `FaqPageView` | Merged accordion; full-page FAQ extract |
| Contact | `ContactPageView` | **Dedicated** 2-col details + form (not generic renderer) |
| Quote | `QuotePageView` | Prose + **prominent form band**; no duplicate final CTA |
| Article | `ArticlePageLayout` | Editorial body unchanged; inspired scroll on reference path only |

**Homepage:** not modified.

---

## M. Before / after screenshots

| Baseline | Path |
|----------|------|
| 2B.5 production | `audit/screenshots/phase-2b5-production/` |
| 2B.5 / 2B.6 local | `audit/screenshots/phase-2b5-local/`, `phase-2b6-local/` |
| **2B.6B local** | `audit/screenshots/phase-2b6b-local/` |

Capture: `node scripts/phase-2b6b-reference-screenshots.mjs http://localhost:3010`

---

## N. Source parity

Content still sourced from production `sanitizedHtml` via existing parser + global-media filters. **Wording, FAQ, tables, and links** are extracted—not rewritten. Visual grouping may change; re-run `scripts/phase-2b5-exact-parity.mjs` on reference paths before rollout.

---

## O. Mobile QA

Manual pass at **390 / 375 / 360** still required (explicit mobile rules in new components).

---

## P–R. Quality gates

| Gate | Result |
|------|--------|
| `npm run lint` | PASS |
| `npx tsc --noEmit` | PASS |
| `npm run build` | PASS |

**BUILD_ID:** `G3R394rNrLA2sBGqygIzM` (restart `next start -p 3010` after pull)

---

## S. Remaining visual weaknesses

1. **Givat Ze'ev** — may still skew prose-heavy if source lacks h3/link clusters; tune area heuristics after review
2. **Contact / quote** — depend on intro fallback when widgets stripped; verify copy completeness vs production
3. **FAQ page** — stats block + accordion merge may need heading polish
4. **Article** — chrome only lightly updated; not full `ContentHero`
5. **Mobile** — not automated in this pass

---

## Rollout

Only the **10 reference paths** in `src/lib/homepage-inspired/reference-paths.ts` use `TrueReconstructionPageRenderer`. All other URLs remain **2B.5 `SourcePageRenderer`**.

Disable: `NEXT_PUBLIC_HOMEPAGE_INSPIRED=false`

**STOP** — await human approval before site-wide propagation.
