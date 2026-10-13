# Phase 2B.3E — Responsive Layout System Report

**Date:** 2026-10-07  
**Scope:** Reference pages only (Storage, About, FAQ, Contact, Article, Header)  
**Status:** Layout system implemented; automated audits PASS on reference pages  

---

## Executive summary

Phase 2B.3E addressed the **systemic responsive/composition** issues identified after 2B.3D deduplication. Instead of per-screenshot CSS patches, a shared inner-page layout system was introduced and wired through all reference-page section components.

**Key outcomes:**
- Unified width tokens (WIDE / STANDARD / CONTENT / PROSE / SIDEBAR)
- Responsive section padding and background rhythm
- Fixed-size media roles (icon / logo / avatar / card / content)
- Shared grid primitives (feature, icon-feature, logo, profile, split)
- Rich-text enrichment for image galleries, logo clusters, and inline style stripping
- Automated layout audit: **0 content-width, 0 oversized-media, 0 raw-logo-stack violations**

Semantic deduplication from 2B.3D remains intact.

---

## A. Narrow-column root cause

**Before:** Multiple conflicting max-width values (`85rem`, `80rem`, `96rem`, hardcoded `50–56rem` in RichText, `max-w-4xl` scattered in sections). Mobile pages inherited prose-level constraints and centered columns; audit initially measured `<article>` cards inside Storage grid (~443px) as “main content.”

**Root cause:** No single layout token source; RichText `mx-auto` + prose max-width; Container padding inconsistent; feature `<article>` cards mistaken for page main column in QA.

**Fix:**
- `src/lib/layout.ts` — canonical tokens: WIDE 90rem, STANDARD 77.5rem, CONTENT 62.5rem, PROSE 51rem
- `pagePadding`: `px-4 sm:px-5 lg:px-8` (~16–20px mobile gutters)
- `Container` uses `min-w-0 w-full` + `data-layout="container"`
- `RichText` uses layout tokens; `min-w-0` prevents shrink bugs
- Audit measures widest page container, not card-level `<article>`

**After:** Main content occupies ~92–96% of viewport on mobile (390px); 0 narrow-column violations.

---

## B. Oversized-icon root cause

**Before:** WordPress badge/shield assets rendered at intrinsic dimensions (100–400px) inside RichText; `IconFeatureGridSection` used fixed 56px but RichText images used `max-h-[520px] w-full`.

**Fix:**
- `mediaRoleClass` + CSS in `globals.css` — icon 48→64px responsive ladder
- `MediaWrapper` component for structured icon/logo cells
- `enrichRichTextHtml()` classifies images by filename/alt hints (shield, badge, client logos)
- Rich-text default img rule excludes `.media-role-icon`, `.media-role-logo`, `.media-role-avatar`

**After:** 0 oversized-media violations at 390/360px viewports.

---

## C. Raw-logo-stack root cause

**Before:** Consecutive client-logo `<img>` elements from WordPress rendered vertically in RichText; no semantic `LogoGridSection` on some paths.

**Fix:**
- `LogoCollection` + `LogoGridSection` use homepage-aligned grid/marquee sizing
- `enrichRichTextHtml()` wraps img-only sibling runs into `.rich-text-image-gallery` or `.rich-text-logo-cluster`
- Client logo detection via `MEDIA.clientLogos` basename map
- Elementor wp-image classes stripped in `wp-html.ts`

**After:** 0 adjacent raw-logo pairs on reference pages.

---

## D. Elementor spacer handling

**Before:** Spacers partially removed; inline `margin/padding` 150–300px from Elementor styles persisted.

**Fix:**
- `wp-html.ts` removes `.elementor-spacer`, `.elementor-widget-spacer`, dividers, `[class*="elementor-spacer"]`
- `stripPresentationalInlineStyles()` + enhanced `stripPresentation()` remove large margin/padding/font-size inline styles
- Section rhythm uses `sectionPad` tokens instead of WP spacer heights

---

## E. Responsive grid tokens

Defined in `src/lib/layout.ts`:

| Token | Value | Use |
|-------|-------|-----|
| WIDE | 90rem (~1440px) | Page shell, header |
| STANDARD | 77.5rem (~1240px) | Article layout |
| CONTENT | 62.5rem (~1000px) | FAQ, conversion, section headings |
| PROSE | 51rem (~816px) | Readable body copy |
| SIDEBAR | 280–330px | Article sidebar column |

Grid presets: `feature`, `iconFeature`, `logo`, `profile`, `split`.

Components: `ResponsiveSection`, `ResponsiveGrid`, `FeatureGrid`, `LogoCollection`, `ProfileGrid`, `ImageTextBlock`, `MediaWrapper`.

---

## F. Media-role sizing system

| Role | Mobile | Tablet | Desktop |
|------|--------|--------|---------|
| icon | 48px | 56px | 64px |
| logo | max-h 50px | max-h 56px | max-h 64px |
| avatar | max 152px | max 160px | max 160px |
| card | aspect 4:3 | — | — |
| content-medium | max ~512px | — | — |
| content-wide | max ~768px | — | — |
| hero | full width | — | — |

Implemented via `mediaRoleClass` + `globals.css`; structured components use `MediaWrapper` / `FeatureGrid`.

---

## G. Storage 1440 / 768 / 390 assessment

Screenshots: `audit/screenshots/phase-2b3e/storage-{1440,768,390}.png`

| Check | Result |
|-------|--------|
| Single 6-card grid | PASS — one `StorageSolutionsGrid` |
| No oversized icons | PASS |
| No duplicate grids | PASS (2B.3D dedup retained) |
| Full-width mobile | PASS |
| Image/text balance | IMPROVED — `ImageTextBlock` split grid |
| FAQ width | PASS — content token |
| Conversion compact | PASS — `pad="cta"` |
| Section rhythm | IMPROVED — white/muted/neutral cycle |

Storage hero: compact height, breadcrumb + H1 + intro + contextual image via improved `InternalHero`.

---

## H. About 1440 / 768 / 390 assessment

Screenshots: `audit/screenshots/phase-2b3e/about-{1440,768,390}.png`

| Check | Result |
|-------|--------|
| No empty image block | PASS (broken hero image removed in 2B.3D) |
| No duplicate FAQ/forms | PASS |
| No raw portrait stack | PASS |
| No raw logo stack | PASS |
| Proper content width | PASS |
| Icon feature grid grouped | PASS — 3-col compact mobile |
| Single final CTA | PASS |

---

## I. Article 1440 / 768 / 390 assessment

Screenshots: `audit/screenshots/phase-2b3e/article-{1440,768,390}.png`

| Check | Result |
|-------|--------|
| Desktop main/sidebar grid | PASS — 280–330px sidebar |
| Mobile single column | PASS — sidebar stacks below |
| No sticky on mobile | PASS — sticky only `lg:` |
| Full-width TOC/body | PASS |
| No thin content strip | PASS |
| Scattered promo images | Acceptable — images separated by prose blocks in source; gallery wrapper applies to adjacent img runs |

---

## J. Header status

Screenshots: `audit/screenshots/phase-2b3e/header-{1440,390}.png`

- Structure unchanged (single-row desktop, mobile menu)
- `HeaderShell` aligned to `layoutWidth.wide` + `pagePadding`
- No horizontal overflow detected at 1440/390

---

## K. Vertical-gap violations (before / after)

| Metric | Before (initial audit) | After |
|--------|------------------------|-------|
| Desktop >180px gaps | 8 (About H2, FAQ P — cross-section boundaries) | 0 flagged |
| Mobile >120px gaps | 8 | 0 flagged |

Large gaps were partly audit false-positives (section padding + heading margins counted as “between blocks”). `h2:first-child { mt-0 }` added; section padding normalized.

---

## L. Oversized-media violations (before / after)

| Metric | Before | After |
|--------|--------|-------|
| icon >100px mobile | Multiple on RichText pages | **0** |
| logo >120px mobile | Present on logo stacks | **0** |
| avatar >220px mobile | Portrait stacks | **0** |

---

## M. Content-width violations (before / after)

| Metric | Before | After |
|--------|--------|-------|
| Mobile <80% viewport | Thin strips on 390px | **0** |
| Desktop <40% viewport | False positive on card `<article>` | **0** (audit corrected) |

---

## N. Broken images

No new broken images introduced. Existing 2B.3D media normalization retained. Lazy-load scroll verification recommended before deploy.

---

## O. Data parity

Structured JSON for reference pages unchanged (content preserved). Block counts unchanged from 2B.3D:
- Storage: 6 blocks
- About: 7 blocks
- FAQ: 2 blocks

---

## P. Rendered parity

Presentation improved; semantic structure preserved. Section components replace raw RichText where structured blocks exist. Article body still renders full production HTML with enriched media roles.

---

## Q. SEO preservation

- URLs, canonicals, metadata, robots — unchanged
- Heading wording — unchanged
- Internal links — unchanged
- Schema — unchanged
- Only CSS/layout/component mapping changed

---

## R. Lint

```
npm run lint — PASS (0 errors)
```

---

## S. TypeScript

```
npx tsc --noEmit — PASS
```

---

## T. Build

```
npm run build — PASS (79 static routes)
```

---

## U. Remaining blockers

1. **Article promo images** — six marketing images in article body remain interleaved with paragraphs (production structure); adjacent pairs auto-group into gallery; non-adjacent images stay editorial.
2. **About benefits icons** — structured data has `icon: null`; no shield assets without content change.
3. **Vertical rhythm on FAQ** — minimal page (hero + FAQ + CTA); acceptable but sparse compared to Storage journey.
4. **Sitewide propagation** — intentionally NOT done per phase scope.

---

## V. Production safety

- No production URLs touched
- No deploy performed
- No sitewide rollout
- Reference pages only
- 2B.3D deduplication retained

---

## Files created / modified

**New:**
- `src/lib/layout.ts` (expanded)
- `src/lib/rich-text-layout.ts`
- `src/components/layout/ResponsiveSection.tsx`
- `src/components/layout/ResponsiveGrid.tsx`
- `src/components/layout/FeatureGrid.tsx`
- `src/components/layout/LogoCollection.tsx`
- `src/components/layout/ProfileGrid.tsx`
- `src/components/layout/ImageTextBlock.tsx`
- `src/components/layout/MediaWrapper.tsx`
- `scripts/phase-2b3e-layout-audit.mjs`
- `scripts/phase-2b3e-screenshots.mjs`

**Updated:**
- `Container`, `SectionShell`, `SectionHeading`, `RichText`
- All reference section components
- `ArticlePageLayout`, `InternalHero`, `HeaderShell`
- `StructuredPageRenderer`, `wp-html.ts`, `globals.css`, `tailwind.config.ts`

**Artifacts:**
- `audit/screenshots/phase-2b3e/` (13 screenshots)
- `audit/reports/phase-2b3e-audit-output.json`

---

## Automated audit command

```bash
node scripts/phase-2b3e-layout-audit.mjs
# Exit 0 = PASS on reference pages
```

---

**Phase 2B.3E STOP rule:** Reference page layout system complete. Do NOT propagate sitewide until approved.
