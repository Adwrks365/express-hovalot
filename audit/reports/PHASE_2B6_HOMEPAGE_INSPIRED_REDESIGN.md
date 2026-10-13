# Phase 2B.6 — Homepage-Inspired Redesign (Reference Pass)

**Status:** STOP — human review of 10 reference URLs before site-wide rollout  
**Homepage:** unchanged (design reference only)

---

## A. Homepage design-system extraction

See `audit/reports/PHASE_2B6_HOMEPAGE_DESIGN_SYSTEM.md`.

---

## B. Shared content components

| Component | Location |
|-----------|----------|
| `ContentHero` | `src/components/content-page/ContentHero.tsx` |
| `IntroSection` | `src/components/content-page/IntroSection.tsx` |
| Barrel exports (`FeatureCards`, `BenefitGrid`, `FaqSection`, …) | `src/components/content-page/index.ts` |
| Block renderer (prose, imageText, FAQ, grids, …) | `src/components/homepage-inspired/render-composition-block.tsx` |
| Reference-page orchestrator | `src/components/homepage-inspired/HomepageInspiredPageRenderer.tsx` |

Existing homepage-aligned sections reused: `FeatureGridSection`, `IconFeatureGridSection`, `FaqSectionBlock`, `ImageTextSection`, `AreaLinksSection`, `LogoGridSection`, `FinalConversionSection`.

---

## C–J. Reference pages redesigned (10 URLs)

Enabled via `isHomepageInspiredRedesignEnabled(path)` — list in `src/lib/homepage-inspired/reference-paths.ts`.

| Page | Path |
|------|------|
| Service — apartment | `/הובלת-דירה-בירושלים/` |
| Service — offices | `/הובלות-משרדים-בירושלים/` |
| Storage — pallets | `/אחסון-משטחים/` |
| Storage — short term | `/אחסון-תכולה-לטווח-קצר/` |
| Area — Givat Ze'ev | `/הובלות-בגבעת-זאב/` |
| About | `/about-us/` |
| FAQ | `/שאלות-נפוצות/` |
| Contact | `/צרו-קשר/` |
| Article | `/מעבר-דירה-בירושלים/` |
| Quote / pricing | `/הצעת-מחיר/` |

**Routing:** `ServicePageLayout` / `StandardPageLayout` → `HomepageInspiredPageRenderer` when path is in the list. All other URLs remain **Phase 2B.5** `SourcePageRenderer`.

**Article:** `ArticlePageLayout` — scroll-reveal on body for reference path only; full production HTML unchanged.

Disable redesign globally: `NEXT_PUBLIC_HOMEPAGE_INSPIRED=false`.

---

## K. Source parity retained

- No curated JSON on reference routes.
- Body: `parsePageComposition(sanitizedHtml, archetype)` + coverage/remaining fallbacks from 2B.4D/E.
- Hero image: `heroSideImage || featuredImage` only — no invented media.
- Non-reference pages untouched (plain source fidelity).

Recommend: run parity script on the 10 paths before approving rollout.

---

## L. Screenshots

- **2B.6 local:** `audit/screenshots/phase-2b6-local/` (10 PNGs, script `scripts/phase-2b6-reference-screenshots.mjs`)
- **Production / 2B.5 baselines:** `audit/screenshots/phase-2b5-production/`, `phase-2b5-local/`
- **Review index:** `audit/reports/PHASE_2B6_VISUAL_REFERENCE_REVIEW.md`

---

## M. Mobile QA

Not automated in this pass — rated **NEEDS_POLISH** pending manual checks at 390 / 375 / 360 px.

---

## N–P. Quality gates

| Gate | Result |
|------|--------|
| `npm run lint` | PASS |
| `npx tsc --noEmit` | PASS |
| `npm run build` | PASS |

**Runtime:** http://localhost:3010  
**BUILD_ID:** `k0EeGFXFmUW1s6d3NEWJf`  
**PID:** 45464

---

## Q. Remaining polish items

1. Mobile viewport QA on all 10 references
2. Numeric parity re-check on reference subset (`phase-2b5-exact-parity.mjs`)
3. Article hero — optional `ContentHero`-style band (currently editorial hero)
4. Pricing page — section rhythm / form placement fine-tuning
5. Area pages — optional stats/trust blocks only when present in source
6. After approval: propagate `HomepageInspiredPageRenderer` beyond allowlist (or merge flags)

---

## Stop condition

**Do not** apply to remaining ~60 URLs until human approval of this reference pass.

**Do not** modify homepage, deploy, or enable form delivery.
