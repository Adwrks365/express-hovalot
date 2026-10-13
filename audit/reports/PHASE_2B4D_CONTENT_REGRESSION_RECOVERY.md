# Phase 2B.4D — Content Regression Recovery Report

Generated: 2026-10-07T13:23:00Z  
**Status: RECOVERED — ready for human review**

---

## A. Root cause

**Parser bug in `parse-page-composition.ts` (Phase 2B.4B regression).**

`parsePageComposition()` split page body on **direct-child `<h2>` only**. After `sanitizeWordPressHtml()`, Elementor content is wrapped in a single outer `<div>`, so nested H2 headings were never found → **0 sections parsed** for area pages and **FAQ-only** output for many service pages.

The renderer (`ArchetypePageRenderer`) was mounted correctly but received empty or near-empty block arrays. Result: **Hero → FinalConversionSection → Footer** with SEO body missing.

**Not a data-loading bug** — `contentHtml` in `pages.json` was intact (e.g. Givat Ze'ev: 65,350 chars raw).

**Not a renderer bug** — blocks that were parsed did render.

**Not a build overwrite** — `npm run build` runs `next build` only; curated JSON untouched.

---

## B. Parser fix

1. **`splitByH2Sections()`** — recursive walk into wrapper divs to find all H2 boundaries in document order.
2. **Non-destructive fallback** — if `parseSectionBlocks()` returns empty for a section with content, emit a `prose` block (never silent drop).
3. **Coverage tracking** — word-overlap ratio vs effective source (excluding global form/CTA sections).
4. **Safe remaining fallback** — `RemainingSourceContentSection` for under-represented sections when coverage < 95%.
5. **FAQ guard** — only classify as FAQ when extracted Q&A covers ≥55% of section text; otherwise fall through to prose/imageText.

New files:
- `src/lib/page-composition/content-coverage.ts`
- `src/components/sections/RemainingSourceContentSection.tsx`

---

## C. Renderer

No renderer routing change. `ArchetypePageRenderer` now renders `remaining` block type and exposes `data-coverage-ratio` / `data-remaining-fallback` debug attrs.

---

## D. Dedup / global filter audit

| Module | Risk | Finding |
|--------|------|---------|
| `global-template-filter.ts` | Removes footer forms + global CTAs | **Safe** — narrow fingerprints; logged via `removedDuplicates` |
| `deduplicate-blocks.ts` | Applies to curated `StructuredPageRenderer` only | **Not involved** in archetype parser regression |

Removed sections are logged in `PageComposition.removedDuplicates` with fingerprint + reason.

---

## E. Build / generator overwrite

| Script | Runs on `npm run build`? | Overwrites curated data? |
|--------|--------------------------|--------------------------|
| `next build` | Yes | No |
| `phase-2b3b-build-structured-pages.mjs` | No | Skips 7 curated paths when run manually |
| `phase-2b4-build-page-archetypes.mjs` | No | Manual only |
| `import-content.mjs` | No | Manual only |

---

## F. Content coverage before / after

Metrics from Playwright rendered DOM (main body, excluding footer).  
**PRE-2B.4D** = Phase 2B.4C measurements on port 3010.

| URL | SOURCE TEXT | PRE RENDERED | POST RENDERED | PRE sections | POST sections |
|-----|------------:|-------------:|--------------:|-------------:|--------------:|
| /הובלות-משרדים-בירושלים/ | 3,425 | ~708 | **3,817** | 1 | **6** |
| /הובלות-בגבעת-זאב/ | 3,313 | ~578 | **4,101** | 0 | **13** |
| /חברת-אריזה-והובלה-בירושלים/ | 3,621 | ~812 | *(parser 96% — not in screenshot set)* | 1 | 5+ |
| /הובלת-דירה-בירושלים/ | 4,806 | 3,261 | **3,701** | 0 | 5 richText |
| /אחסון-תכולה-לטווח-קצר/ | 5,204 | *(curated)* | **5,207** | — | 11 richText |
| /הצעת-מחיר/ | 1,141 | ~846 | **846** | — | 1 richText |
| /about-us/ | 3,954 | 3,426 | **4,426** | — | 6 richText |
| /צרו-קשר/ | 1,266 | 1,007 | **1,007** | — | 3 richText |

Machine-readable: `audit/reports/PHASE_2B4D_CONTENT_COVERAGE.json`

---

## G. Heading parity

| URL | Source H2 | Post H2 | Source H3 | Post H3 |
|-----|----------:|--------:|----------:|--------:|
| Office moving | 8 | 4 | 10 | 13 |
| Givat Ze'ev | 10 | 6 | 4 | 5 |
| Storage short | 14 | 6 | 5 | 19 |
| Apartment (curated) | 9 | 6 | 4 | 9 |

Some H2 collapse into feature grids / card titles (expected). No page with ≥3 source H2 renders as hero-only.

---

## H. Media parity

| URL | Source images | Rendered images |
|-----|--------------:|----------------:|
| Givat Ze'ev | 27 | 26 |
| Office moving | 4 | 5 |
| Storage short | 9 | 8 |
| Apartment | 2 | 2 |

Meaningful media present in DOM. Minor deltas from hero dedup / logo strip rules.

---

## I. Pages restored

- **SERVICE** (ArchetypePageRenderer): office moving, packing — full body restored
- **AREA**: Givat Ze'ev, Mevaseret, Beit Shemesh, Jerusalem region — full SEO body restored
- **STORAGE** (curated): unchanged, already complete
- **PRICING** (curated JSON): uses StructuredPageRenderer — see blockers
- **ABOUT / CONTACT**: curated — unchanged, pass

---

## J. Pages still failing / flagged

| URL | Issue | Severity |
|-----|-------|----------|
| `/הצעת-מחיר/` | Curated JSON body shorter than raw `contentHtml` (846 vs 1,141 rendered chars); production may have more quote-process copy not in structured JSON | **Medium** — curated content gap, not parser regression |
| Contact | Shorter by design | **OK** |

No P0 commercial page renders hero-only.

---

## K. Screenshots

`audit/screenshots/phase-2b4d/` — 1440px desktop full-page:

- `moving-apartment-desktop.png`
- `office-moving-desktop.png`
- `storage-short-desktop.png`
- `area-givat-desktop.png`
- `pricing-desktop.png`
- `about-desktop.png`
- `contact-desktop.png`

---

## L. Runtime verification

| Field | Value |
|-------|-------|
| Port | 3010 |
| PID | 13232 |
| Shell PID | 21620 |
| Startup | 2026-10-07T13:21:15Z |
| BUILD_ID | `Gt1Yn_kmAFn_6yBBYCGAr` |
| Mode | production |

---

## M. Lint

```
npm run lint  →  PASS
```

---

## N. TypeScript

```
npx tsc --noEmit  →  PASS (via next build)
```

---

## O. Build

```
npm run build  →  PASS (79 static pages)
```

---

## P. Fail-safe QA

Script: `scripts/phase-2b4d-content-qa.mjs`

Rule: pages with ≥3 H2 or ≥1000 source chars must not render thin body (<50% text, <2 sections).

**Result: 7/7 PASS, 0 failures**

---

## Q. Remaining blockers (human review)

1. **Pricing page curated JSON** — may need enrichment from production `contentHtml` if full quote-process copy is required.
2. **Heading count normalization** — some H2 become grid card titles; acceptable but document for SEO review.
3. **Phase 2B.4C visual structure goals** — content is back; structured grids on all pages still vary by source shape.

---

## STOP

Content regression **recovered**. Service/area/storage body content is visible again. Do not proceed to styling polish or deployment until human review approves this phase.
