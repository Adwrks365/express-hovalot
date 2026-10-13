# Phase 2B.6 — Visual Reference Review

Compare production (Phase 2B.5 crawl) vs pre-2B.6 plain source vs new homepage-inspired local.

**Viewport:** 1280×720 (full-page screenshots)

---

## Reference URLs

| # | URL | Production (2B.5) | Pre-2B.6 (2B.5 local) | 2B.6 local |
|---|-----|-------------------|------------------------|------------|
| 1 | `/הובלת-דירה-בירושלים/` | `audit/screenshots/phase-2b5-production/` | `audit/screenshots/phase-2b5-local/` | `audit/screenshots/phase-2b6-local/הובלת-דירה-בירושלים.png` |
| 2 | `/הובלות-משרדים-בירושלים/` | same folder | same | `הובלות-משרדים-בירושלים.png` |
| 3 | `/אחסון-משטחים/` | same | same | `אחסון-משטחים.png` |
| 4 | `/אחסון-תכולה-לטווח-קצר/` | same | same | `אחסון-תכולה-לטווח-קצר.png` |
| 5 | `/הובלות-בגבעת-זאב/` | same | same | `הובלות-בגבעת-זאב.png` |
| 6 | `/about-us/` | same | same | `about-us.png` |
| 7 | `/שאלות-נפוצות/` | same | same | `שאלות-נפוצות.png` |
| 8 | `/צרו-קשר/` | same | same | `צרו-קשר.png` |
| 9 | `/מעבר-דירה-בירושלים/` | same | same | `מעבר-דירה-בירושלים.png` |
| 10 | `/הצעת-מחיר/` | same | same | `הצעת-מחיר.png` |

---

## Design consistency ratings (first pass)

| URL | HOMEPAGE_DESIGN_MATCH | SECTION_RHYTHM | TYPOGRAPHY | MEDIA_TREATMENT | CTA_STYLE | FORM_STYLE | MOBILE | SOURCE_PARITY |
|-----|----------------------|------------------|------------|-----------------|-----------|------------|--------|---------------|
| הובלת דירה | PASS | PASS | PASS | PASS | PASS | PASS | NEEDS_POLISH | PASS |
| משרדים | PASS | PASS | PASS | PASS | PASS | PASS | NEEDS_POLISH | PASS |
| אחסון משטחים | PASS | PASS | PASS | PASS | PASS | PASS | NEEDS_POLISH | PASS |
| אחסון קצר | PASS | PASS | PASS | PASS | PASS | PASS | NEEDS_POLISH | PASS |
| גבעת זאב | PASS | NEEDS_POLISH | PASS | PASS | PASS | PASS | NEEDS_POLISH | PASS |
| About | PASS | PASS | PASS | PASS | PASS | N/A | NEEDS_POLISH | PASS |
| FAQ | PASS | PASS | PASS | N/A | PASS | N/A | NEEDS_POLISH | PASS |
| Contact | PASS | PASS | PASS | N/A | PASS | PASS | NEEDS_POLISH | PASS |
| Article | NEEDS_POLISH | PASS | PASS | PASS | N/A | PASS | NEEDS_POLISH | PASS |
| הצעת מחיר | PASS | NEEDS_POLISH | PASS | PASS | PASS | PASS | NEEDS_POLISH | NEEDS_POLISH |

**Notes**

- **SOURCE_PARITY:** Content still driven by `parsePageComposition(record.sanitizedHtml)` — same pipeline as pre-2B.5 structured recovery, not curated JSON. Re-run `scripts/phase-2b5-exact-parity.mjs` on reference subset for numeric scores before full-site rollout.
- **MOBILE:** Manual pass at 390/375/360 recommended before propagating to all 70 URLs.
- **Article:** Hero/chrome already on-brand; inspired flag enables scroll-reveal on body only.

---

## Expected visual deltas vs 2B.5 plain

- Compact **ContentHero** with gold accent bar + optional quote CTA
- Alternating **white / brand-50** section bands
- **Image+text** blocks with border + soft shadow
- **Final conversion** outer gradient band (`inspired` prop)
- Subtle **ScrollReveal** on reference body sections

Content order and copy should match Phase 2B.5 production snapshots unless parser blocks explicitly group FAQ/grids from source HTML.
