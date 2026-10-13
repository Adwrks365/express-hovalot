# Phase 2B.4C — Runtime Visual Proof Report

Generated: 2026-10-07T13:08:00Z  
**Status: NOT COMPLETE — human review required**

Phase 2B.4C proves the structured renderer **is mounted** in the production build, but **does not** prove visible structural improvement on service/area commercial pages. Completion criteria from the phase brief are **not met**.

---

## A. Port 3010 runtime verification

See `PHASE_2B4C_RUNTIME_VERIFICATION.md`.

- Fresh clean production build confirmed on port **3010**
- PID **43852**, startup **2026-10-07T13:01:35Z**
- BUILD_ID **UhSWSfEzZ0spotGqyM6z0**
- Prior server on 3010 stopped before rebuild

---

## B. Clean rebuild confirmation

| Step | Result |
|------|--------|
| Stop old 3010 listener | Done (PID 39192) |
| Remove `.next/` | Done |
| `npm run build` | PASS |
| `next start -p 3010` | Running (PID 43852) |
| Static generation | All routes pre-rendered at build time via `generateStaticParams()` — no stale ISR cache involved |

---

## C. Renderer map

Full table: `PHASE_2B4C_RUNTIME_RENDERER_MAP.md`  
Machine-readable: `phase-2b4c-runtime-map.json`

| URL | Archetype | Expected renderer | Actual renderer | Blocks | rawFallback | Status |
|-----|-----------|-------------------|-----------------|--------|-------------|--------|
| /הובלת-דירה-בירושלים/ | MOVING_SERVICE | StructuredPageRenderer | StructuredPageRenderer | 8 | false | PASS |
| /הובלות-משרדים-בירושלים/ | MOVING_SERVICE | ArchetypePageRenderer | ArchetypePageRenderer | 1 | false | **FAIL visual** |
| /חברת-אריזה-והובלה-בירושלים/ | PACKING_SERVICE | ArchetypePageRenderer | ArchetypePageRenderer | 1 | false | **FAIL visual** |
| /אחסון-תכולה-לטווח-קצר/ | STORAGE_SERVICE | StructuredPageRenderer | StructuredPageRenderer | 6 | false | PASS (curated) |
| /אחסון-משטחים/ | STORAGE_SERVICE | StructuredPageRenderer | StructuredPageRenderer | 6 | false | PASS (curated) |
| /הובלות-באזור-ירושלים/ | AREA_PAGE | ArchetypePageRenderer | ArchetypePageRenderer | **0** | **true** | **FAIL** |
| /הובלות-בגבעת-זאב/ | AREA_PAGE | ArchetypePageRenderer | ArchetypePageRenderer | **0** | **true** | **FAIL** |
| /הובלות-במבשרת-ציון/ | AREA_PAGE | ArchetypePageRenderer | ArchetypePageRenderer | **0** | **true** | **FAIL** |
| /הובלות-בבית-שמש/ | AREA_PAGE | ArchetypePageRenderer | ArchetypePageRenderer | **0** | **true** | **FAIL** |
| /הצעת-מחיר/ | PRICING_PAGE | StructuredPageRenderer | StructuredPageRenderer | 2 | false | PASS (curated) |

**Core commercial URLs using `WordPressContent` fallback: 0** ✓  
**Core commercial URLs with semantic composition: FAIL** — area pages render 0 blocks; service pages render FAQ-only.

---

## D. Fallback pages found

No commercial URL uses `data-renderer="WordPressContent"`.

However, **4/4 sampled area pages** report `data-raw-fallback="true"` with **0 structured blocks** — the parser treats them as all-prose fallback internally and renders **no body content**.

Service pages (`office-moving`, `packing`) parse to a **single FAQ block** only (~65k chars of source HTML discarded).

---

## E. Auto-generation overwrite findings

| Script | Runs during `npm run build`? | Overwrites curated data? |
|--------|------------------------------|--------------------------|
| `next build` only | Yes | No |
| `scripts/phase-2b4b-build-structured-pages.mjs` | **No** (manual) | Skips 7 `CURATED_PATHS` when run |
| `scripts/phase-2b4-build-page-archetypes.mjs` | **No** (manual) | Writes `page-archetypes.json` only when run |
| `scripts/import-content.mjs` | **No** (manual) | Would overwrite `pages.json` if run |

**Conclusion:** The clean build did **not** overwrite structured JSON or archetype data. Runtime classification uses **`classifyPageArchetype()`** in code, not `page-archetypes.json`.

---

## F. Before/after comparison

See `PHASE_2B4C_BEFORE_AFTER.md`.

**Key finding:** 6 representative pages are **byte-identical** PNGs between Phase 2B.4B and 2B.4C (office moving, packing, apartment, givat ze'ev, about, contact). No measurable visual improvement.

---

## G. Service page proof

### DOM evidence — `/הובלות-משרדים-בירושלים/`

```
data-renderer="ArchetypePageRenderer"
data-page-archetype="MOVING_SERVICE"
data-structured-block-count="1"
data-semantic-block-types="faq"
data-raw-fallback="false"
```

| Metric | Value | Expected after 2B.4B |
|--------|------:|---------------------|
| Semantic sections | 1 | >3 |
| featureGrid / benefitGrid | 0 | ≥1 |
| imageText | 0 | ≥1 |
| Main body text length | ~708 chars | full page content |
| Final conversion | 1 | 1 ✓ |
| Orphan forms | 0 | 0 ✓ |

**Acceptance:** FAIL — page still appears as hero + FAQ + final CTA, not structured service composition.

Screenshot: `audit/screenshots/phase-2b4c/office-moving-desktop.png` — **identical** to 2B.4B.

---

## H. Area page proof

### DOM evidence — `/הובלות-בגבעת-זאב/`

```
data-renderer="ArchetypePageRenderer"
data-page-archetype="AREA_PAGE"
data-structured-block-count="0"
data-raw-fallback="true"
```

| Metric | Value |
|--------|------:|
| Main `<p>` count | 3 |
| Main body text | ~578 chars |
| Source contentHtml | 65,350 chars |
| H2 in sanitized HTML | 10 |
| Parsed blocks | **0** |

**Acceptance:** FAIL — page is not a structured area layout; it is an SEO-content **void** (hero + conversion only).

### Root cause (proven)

`parsePageComposition()` splits sections only on **direct child `<h2>`** of the sanitized HTML root. After `sanitizeWordPressHtml()`, content is wrapped in a single outer `<div>`:

```
root direct children: text, div, text
h2 total (nested): 10
blocks parsed: 0
```

Reproduction: `node scripts/test-parse-debug.mjs`

**Acceptance:** FAIL — area pages do not show local intro, service grouping, benefits, or area links.

---

## I. FinalConversionSection proof

| Page type | `data-final-conversion` count | Composition |
|-----------|------------------------------:|-------------|
| Office moving | 1 | Branded card, 2-col grid (RTL), phone + WhatsApp + quote + QuoteForm |
| Area (givat) | 1 | Same |
| Curated apartment | 1 | Same |
| Pricing (curated) | 0 | Uses ConversionSection in JSON instead |
| About | 0 | Hero QuoteForm + ConversionSection |
| Contact | 0 | FormBlockSection |

Commercial service/area pages: **PASS** — one integrated final conversion section, no gap/orphan body form.

Component: `src/components/sections/FinalConversionSection.tsx` — `data-final-conversion` on section wrapper.

---

## J. Orphan-form scan

Direct form component usages in renderers:

| Location | Component | Context |
|----------|-----------|---------|
| `FinalConversionSection.tsx` | QuoteForm | Intended final CTA |
| `ConversionSection.tsx` | QuoteForm / ContactForm | FAQ, About, Pricing curated |
| `FormBlockSection.tsx` | QuoteForm / ContactForm | Contact curated page |
| `AboutPageHero.tsx` | QuoteForm | About hero (curated) |
| `HeroSection.tsx` | QuoteForm | Homepage (frozen) |
| `SidebarContactForm.tsx` | — | Articles only |
| Footer | FooterMiniForm | Global (after main) |

**Commercial service/area pages sampled:** orphan forms = **0** ✓

About page reports 2 forms outside final conversion — **expected** (hero + conversion section). Not a service/area regression.

---

## K. Route data source trace (end-to-end)

### SERVICE example — `/הובלות-משרדים-בירושלים/`

```
src/app/[...slug]/page.tsx
  → resolveRoute("/הובלות-משרדים-בירושלים")
  → content-registry.enrichItem() — sanitizedHtml from contentHtml via sanitizeWordPressHtml()
  → classifyPageTemplate() → "service"
  → ServicePageLayout
      → getStructuredPage() → null (not in 7 curated paths)
      → classifyPageArchetype() → MOVING_SERVICE  [NOT page-archetypes.json]
      → isCommercialArchetype() → true
      → ArchetypePageRenderer
          → parsePageComposition(sanitizedHtml, MOVING_SERVICE) → 1 faq block
          → InternalHero + blocks + FinalConversionSection
```

### AREA example — `/הובלות-בגבעת-זאב/`

Same chain through `ServicePageLayout` (template `location`), archetype `AREA_PAGE`, renderer `ArchetypePageRenderer`. Parser returns **0 blocks** due to nested H2 structure → **no body rendered**.

### STORAGE example — `/אחסון-תכולה-לטווח-קצר/`

```
ServicePageLayout
  → getStructuredPage() → src/content/structured/אחסון-תכולה-לטווח-קצר.json
  → StructuredPageRenderer (curated blocks from JSON)
  → data-renderer="StructuredPageRenderer"
```

`page-archetypes.json` is audit/inventory only — runtime uses `classifyPageArchetype()` in `src/lib/structured-pages/page-archetypes.ts`.

---

## L. Screenshots

Directory: `audit/screenshots/phase-2b4c/`

| Slug | Desktop | Mobile |
|------|---------|--------|
| moving-apartment | ✓ | ✓ |
| office-moving | ✓ | ✓ |
| packing | ✓ | ✓ |
| storage-short | ✓ | ✓ |
| storage-pallets | ✓ | ✓ |
| area-region | ✓ | ✓ |
| area-givat | ✓ | ✓ |
| area-mevaseret | ✓ | ✓ |
| area-beit-shemesh | ✓ | ✓ |
| pricing | ✓ | ✓ |
| about | ✓ | ✓ |
| contact | ✓ | ✓ |

---

## M. Lint

```
npm run lint  →  PASS (eslint .)
```

---

## N. TypeScript

```
npx tsc --noEmit  →  PASS
```

---

## O. Build

```
npm run build  →  PASS (clean build before server start)
```

---

## P. Remaining blockers (STOP for human review)

1. **Parser section split bug** — H2 headings nested inside post-sanitize wrapper div; area pages produce 0 blocks and lose all SEO body content.
2. **Service pages** — parser emits FAQ-only; no featureGrid, imageText, or prose sections from ~50k source HTML.
3. **No visible before/after improvement** — byte-identical screenshots for office moving, packing, givat ze'ev, apartment, about, contact.
4. **rawFallback=true on all area pages** — semantic composition not achieved despite correct renderer mount.
5. **Human-reviewed URLs still broken** — same pages flagged in 2B.4B review (`/הובלות-משרדים-בירושלים/`, `/הובלות-בגבעת-זאב/`, `/הובלות-במבשרת-ציון/`, `/הובלות-בבית-שמש/`, `/חברת-אריזה-והובלה-בירושלים/`) show no structural improvement.

### Required before phase approval

- Fix `parsePageComposition` to find H2 sections regardless of wrapper nesting
- Verify non-zero structured blocks on area/service pages
- Re-run before/after screenshots showing grids, image/text sections, full body content
- Confirm `data-raw-fallback="false"` on area pages with block count > 0

---

## Phase 2B.4C completion checklist

| Criterion | Met? |
|-----------|------|
| 3010 = newest clean production build | ✓ |
| Correct renderer in DOM on commercial URLs | ✓ |
| 0 core commercial URLs on WordPressContent | ✓ |
| Before/after shows structural improvement | **✗** |
| Service pages not raw WP stacks | **✗** |
| Area pages not narrow SEO dumps | **✗** (worse: empty) |
| Final form integrated | ✓ |
| No orphan bottom form on commercial pages | ✓ |

**Phase 2B.4C: NOT APPROVED — runtime proof collected; visual/structural goals unmet.**
