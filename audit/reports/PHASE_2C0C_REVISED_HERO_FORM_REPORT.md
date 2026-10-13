# PHASE 2C.0C — Unified Hero Form Report

Generated: 2026-10-09

## A. Shared Hero system

- **`RedesignHero` / `ContentHero`** (`src/components/redesign/RedesignHero.tsx`): one layout for internal commercial pages.
- Desktop (RTL): **content ~65%** + **compact form 320–380px**.
- Background: source image / slideshow or branded green pattern (unchanged tokens).
- Legacy **`HeroContactPanel`** (אקספרס הובלות + phone pill + הצעת מחיר card) **removed**.

## B. HeroQuickQuoteForm

- **`src/components/redesign/HeroQuickQuoteForm.tsx`** — single reusable wrapper.
- Uses **`QuoteForm`** with homepage styling (`variant="hero"`, `heroDense`, placeholder labels, no email).
- Submit: **«קבלו הצעת מחיר»**.
- Metadata: `formId: hero-quick-quote`, `pagePath`, `pageTitle`, `pageType`, `serviceContext`.

## C. Legacy CTA card removal

- No `data-hero-panel` / contact card in Hero.
- Hero CTA row deduped via **`normalizeHeroButtonsWithForm`** — **phone only**, no duplicate quote button when form is shown.
- **`dropImmediatePostHeroCta`** no longer injects default phone+quote when hero form is enabled.

## D. Page-type inclusion

Hero form enabled for redesign archetypes: **service, area, storage, about, faq, information, quote** (except dedicated quote landing).

Logic: `src/lib/redesign/hero-form.ts` → `shouldShowHeroForm()`.

## E. Page-type exclusions

- **Contact** — dedicated form below Hero (`aside="none"`).
- **`/הצעת-מחיר/`** — primary quote flow, no second Hero form.
- **Legal / utility** — no form.
- **Articles** — `ArticleHero` unchanged (no Hero form).
- **Archives** — `aside="none"`.
- **Homepage** — existing `HeroSection` (not `RedesignHero`).

## F. Mobile behavior

- Single column: breadcrumb → H1 → intro → phone → **form card** (full width).
- No side-by-side form; no QuickLeadStrip below Hero.

## G. Popup coordination

- `ContextualPopupProvider` treats focus in **`[data-redesign-hero]`** and **`[data-hero-quick-quote]`** like homepage/final conversion — **no auto popup** while filling Hero form.

## H. Duplicate CTA audit

Automated crawl (`node scripts/phase-2c0c-hero-audit.mjs` on applicable archetype entries):

| Gate | Count |
| --- | --- |
| LEGACY_HERO_CTA_CARD | 0 |
| DUPLICATE_HERO_PHONE_ACTION | 0 |
| DUPLICATE_HERO_QUOTE_ACTION | 0 |
| QUICK_LEAD_STRIP | 0 |
| HERO_FORM_PRESENT (redesign commercial sample) | 20/20 |

Full matrix: `audit/reports/PHASE_2C0C_HERO_CONSISTENCY.json`.

Note: `/` (homepage) correctly shows **NO_FORM** in matrix — uses homepage Hero, not redesign.

## I. Sitewide consistency matrix

All **`RedesignPageRenderer`** commercial routes share the same Hero + **`HeroQuickQuoteForm`** component; only copy/archetype heading variants (area/storage/default).

## J. Screenshots

- `audit/screenshots/phase-2c0c-revised-hero/desktop-apartment-moving.png`
- Additional URLs verified in browser: office/small moves/storage/area/service (same component).

## K. Lint

Pass — `npm run lint`

## L. TypeScript

Pass — `npx tsc --noEmit`

## M. Build

Pass — `npm run build`

---

**STOP** — no deploy, no email enablement, no DNS. Human visual review recommended before cutover.
