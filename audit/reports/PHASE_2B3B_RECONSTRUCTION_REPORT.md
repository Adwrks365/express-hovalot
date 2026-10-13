# Phase 2B.3B — Reconstruction Report

**Status: Stage A–C executed. NOT complete for full-site propagation.**

Generated: 2026-10-07

---

## A. Root cause — broken article

**Primary:** `ScrollReveal` used `IntersectionObserver` with `threshold: 0.15`. Article `.rich-text-article` height ~12,000px; only ~500px visible in viewport → intersection ratio ~4% < 15% → never received `.scroll-revealed` → parent stayed `opacity: 0`.

**Evidence:** Playwright showed `revealOpacity: 0`, `revealHasClass: false`, `richInnerHTMLLen: 37505`, `visibleTextLen: 0` (before fix). After fix: ~16,298 visible chars.

**Secondary:** Sidebar sticky on outer `<aside>` with long related list did not cause content loss but contributed to layout confusion.

**Fixes:** `src/components/ui/ScrollReveal.tsx`, `src/components/internal/RichText.tsx` (no reveal on articles), `ArticlePageLayout.tsx`, `ArticleSidebar.tsx`, `InternalCTA.tsx` (`animate={false}` in sidebar).

---

## B. Generic H2-splitting removed as primary mechanism

- `StructuredPageLayout` now renders **one** `RichText` block (fallback for non-reference pages)
- Reference pages use `StructuredPageRenderer` + production Elementor inventory
- `parseContentSections()` retained in codebase but **not used** for layout

---

## C. Reference page results

| Archetype | Path | Renderer | Visual QA |
|-----------|------|----------|-----------|
| Storage/service | `/אחסון-תכולה-לטווח-קצר` | StructuredPageRenderer (14 blocks) | FAIL — 3 broken images |
| Contact | `/צרו-קשר` | StructuredPageRenderer | **PASS** |
| FAQ | `/שאלות-נפוצות` | StructuredPageRenderer | **PASS** |
| Article | `/כמה-עולה-הובלת-דירה-בירושלים-ב-2026` | ArticlePageLayout | FAIL — 4 broken images, content visible |
| Quote | `/הצעת-מחיר` | StructuredPageRenderer | **PASS** |

Screenshots: `audit/screenshots/phase-2b3b/`  
Comparison: `PHASE_2B3B_VISUAL_COMPARISON.md`

---

## D. Production vs local structural comparison

Pipeline:

1. `scripts/phase-2b3b-extract-elementor-structure.mjs` → `audit/reports/elementor-structure/*.json`
2. `scripts/phase-2b3b-build-structured-pages.mjs` → `src/content/structured/*.json`
3. `StructuredPageRenderer` maps block types → section components

Storage page: 15 Elementor sections → 14 render blocks (hero extracted separately).

---

## E. Visible content parity

- **Data parity:** Existing `npm run parity:2b` (unchanged)
- **Rendered parity:** `scripts/phase-2b3b-rendered-parity.mjs` (added; run separately — slow, 59 URLs)
- **Reference article:** ~16,298 visible chars vs ~16,810 source plain text ≈ **97% visible** (PASS for content presence)

---

## F. Media parity

- Filename normalization for `-150x150` variants in `src/lib/media.ts`
- Storage hero now maps to `/media/2571-storage-2.webp`
- Remaining broken images on reference pages: thumb/unmapped logos (tabol, etc.) — **HUMAN_REVIEW**

---

## G. Navigation parity

No nav changes in 2B.3B. Prior audit: `audit/reports/production-navigation-parity.json` (9 top / 5 parents / 42 children).

---

## H. Article system

- Hero + meta + featured image
- Grid: content ~840px + sidebar 280–320px
- TOC from H2/H3 (`addHeadingIds`)
- Author block + prev/next at article end
- No ScrollReveal on body

---

## I. FAQ system

- Production toggle widgets → `FaqSectionBlock` + `FaqAccordion`
- Exact Q&A text preserved from extraction

---

## J. Page archetypes

Reference pages only use structured renderer. All other pages: monolithic RichText fallback until Stage D propagation.

---

## K. Whitespace QA

`scripts/phase-2b3b-visual-qa.mjs` checks visible text length, hidden reveals, broken images, overflow.

Article blank-region issue **resolved**. Storage no longer shows giant empty article-style void.

---

## L. Responsive QA

Mobile screenshots captured for all 5 reference pages (see screenshot folder).

---

## M. SEO preservation

No changes to URLs, canonicals, titles, robots, or sitemap.

---

## N. lint / tsc / build

```
npm run build  — PASS (2026-10-07)
```

---

## O. Unresolved issues

1. Storage page: 3 broken images; not full production landing parity (counters, extra CTA strips)
2. Article: 4 broken inline images
3. Quote: production-specific client logos not fully mapped
4. Rendered parity script not run to completion for all 59 URLs in this session
5. Nav click-to-close Playwright test not re-run
6. **Stage D NOT started** — no propagation to remaining 54 pages

---

## P. Files changed (main)

| Area | Files |
|------|-------|
| ScrollReveal fix | `src/components/ui/ScrollReveal.tsx` |
| Article | `ArticlePageLayout.tsx`, `RichText.tsx`, `ArticleSidebar.tsx`, `InternalCTA.tsx` |
| Structured pipeline | `scripts/phase-2b3b-*.mjs`, `src/content/structured/*.json` |
| Section library | `src/components/sections/*`, `src/components/structured/StructuredPageRenderer.tsx` |
| Layout routing | `ServicePageLayout.tsx`, `StandardPageLayout.tsx`, `StructuredPageLayout.tsx` |
| Media | `src/lib/media.ts` |
| Reports | `audit/reports/PHASE_2B3B_*.md`, `audit/screenshots/phase-2b3b/` |

---

## Q. Production safety

Production WordPress not modified. All extraction read-only from migrated JSON + public HTML snapshots.

---

## Completion rule

**Phase 2B.3B is NOT marked complete.** Reference set partially passes visual QA. Do not mass-propagate until storage + article media gaps closed and full screenshot sign-off.
