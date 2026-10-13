# Phase 2A.18 — Visual Motion & Mobile Polish Report

**Date:** 2026-10-07  
**Scope:** Mobile service cards, phone icon RTL fix, footer mobile centering, client logo grid, scroll reveals  
**Status:** COMPLETE — Phase 2B NOT started

---

## A. Mobile Service Card — Before/After

**Before (2A.17):** Badge anchored to corner (`start-[calc(5%+0.25rem)]`), text left-aligned on mobile, card read as desktop layout shrunk.

**After (2A.18):** Mobile-only centered composition:
- Badge centered above image, overlapping top edge (`justify-center`, `-mb-7`, `z-10`)
- Image ~90% card width, centered (`w-[90%]`, `mx-auto`)
- Title, description, and "קראו עוד ←" centered (`text-center`, `justify-center`)
- Desktop preserved via `lg:` overrides (corner badge, `text-start`)

**Screenshots:** `audit/screenshots/phase-2a18/services-390.png`, `services-360.png`, `services-1440.png`

---

## B. Badge Position and Size

| Viewport | Badge width | Offset from card center | Image width % | Title align |
|----------|-------------|-------------------------|---------------|-------------|
| 390px    | 64px        | 0px (centered)          | 89%           | center      |
| 1440px   | ~66px       | corner (desktop)        | ~90%          | start       |

Target 60–68px mobile: **PASS** (64px measured).

---

## C. Phone Icon Audit + Direction Fix

Central component: `src/components/ui/PhoneHandsetIcon.tsx` — single SVG with `-scale-x-100` (RTL mirror). Text and button layout unchanged.

| Location | Implementation | Before | After | Visible number | href |
|----------|----------------|--------|-------|----------------|------|
| Desktop header | `PhoneCta` → `PhoneHandsetIcon` | LTR handset | Mirrored | 052-500-55-73 | tel:0525005573 |
| Mobile header | `MobileHeaderPhone` → `PhoneHandsetIcon` | LTR handset | Mirrored | 052-500-55-73 | tel:0525005573 |
| Hero CTA | `HeroSection` → `PhoneHandsetIcon` | LTR handset | Mirrored | 052-500-55-73 | tel:0525005573 |
| Final CTA | `CtaSection` `Button` | Text only (no icon) | Text only | 052-500-55-73 | tel:0525005573 |
| Floating FAB | `FixedControls` → `PhoneHandsetIcon` | LTR handset | Mirrored | (aria-label) | tel:0525005573 |
| Footer social | `FooterSocialIcons` → `PhoneHandsetIcon` | LTR handset | Mirrored | icon-only | tel:0525005573 |
| Footer contact | `FooterLink` text | N/A | N/A | 052-500-55-73 | tel:0525005573 |
| Business details | `BusinessDetails` → `PhoneHandsetIcon` | LTR handset | Mirrored | 052-500-55-73 | tel:0525005573 |

**No remaining unmirrored handset SVGs** in shared layout/homepage UI. Final CTA and footer text link intentionally have no icon.

---

## D. Footer Alignment — Before/After

**Before:** Column content `text-start` on all breakpoints; logo small (`h-14`), low contrast.

**After (mobile):**
- `[data-footer-main]` → `text-center lg:text-start`
- Col 1: `flex flex-col items-center lg:items-start` — logo, about, social centered
- Col 3 nav: accordion buttons `justify-center lg:justify-between`
- Col 4: `mx-auto max-w-md lg:mx-0` — map + mini form centered
- Column headings: `text-center lg:text-start`

| Viewport | Logo center offset | main text-align |
|----------|-------------------|-----------------|
| 390px    | 0px               | center          |
| 360px    | 0px               | center          |
| 1440px   | col-aligned       | start           |

**Screenshots:** `footer-390.png`, `footer-360.png`, `footer-1440.png`

---

## E. Footer Logo Asset + Dimensions

| Property | Value |
|----------|-------|
| Asset | `MEDIA.logoFooter` (`/media/3538-…footer….webp`) — production footer logo |
| Treatment | `brightness-[1.4] contrast-[1.08]` for dark-bg legibility (no redraw) |
| Mobile width | 180px |
| Desktop width | 210px |
| Aspect ratio | Preserved (`h-auto w-[…]`) |

No separate white logo asset found in migrated media; CSS enhancement applied to production asset.

---

## F. Client Mobile Grid — Before/After

**Before:** 2-col grid, 92px cells, logos max 62px mobile.

**After:**
- Grid: `grid-cols-2 min-[400px]:grid-cols-3` (2–3 per row)
- Cell height: 96px mobile / 100px sm+
- Logo max-height: 66px mobile / 70px sm+
- Heading + grid centered

**Screenshots:** `client-logos-390.png`, `client-logos-360.png`, `client-logos-768.png`, `client-logos-1440.png`

---

## G. Client Logo Dimensions

| Viewport | Logos | Cell height | Logo height (first) |
|----------|-------|-------------|---------------------|
| 1440px   | 11    | 100px       | 76px                |
| 768px    | 11    | 100px       | 70px                |
| 390px    | 11    | 96px        | 66px                |
| 360px    | 11    | 96px        | 66px                |

No clipping or distortion observed.

---

## H. Desktop Hover Behavior

- Scale: `hover:scale-[1.09]` (~1.08–1.10 target)
- Grayscale → color on hover
- Shadow: `hover:shadow-sm`
- Transition: 220ms ease-out, transform only
- **Screenshot:** `client-logos-hover-1440.png`

---

## I. Mobile Interaction Behavior

- `:active:scale-[1.05]` on logo images (touch feedback)
- Staggered scroll reveal on viewport entry (see J)
- No continuous bounce
- `motion-reduce:` disables scale transitions

---

## J. ScrollReveal Implementation

**Files:**
- `src/components/ui/ScrollReveal.tsx` — client component, IntersectionObserver
- `src/app/globals.css` — reveal CSS under `html.js-scroll-reveal`

**Mechanism:**
1. SSR HTML fully visible (no server-side hide)
2. On hydration, `html.js-scroll-reveal` added
3. Below-fold elements get `opacity: 0` + transform until `.scroll-revealed`
4. Above-fold elements revealed immediately in `useLayoutEffect` if `rect.top < 92vh`

**Variants:** `heading`, `card`, `image`, `logo`, `slide-start`, `slide-end`, `subtle`

---

## K. Sections Using Reveal

| Section | Reveal target | Variant |
|---------|---------------|---------|
| Services | Heading + each card | heading, card (60ms stagger) |
| Reviews | Header block | heading |
| Trust truck | Headline only (NOT truck) | heading |
| Client logos | Heading + each logo | heading, logo (55ms stagger) |
| About | Text + image | slide-start, slide-end |
| FAQ | Heading + intro block | heading |
| Calculator | Heading + form card | heading, card |
| Service areas | Heading, then body | heading, subtle |
| Final CTA | Entire block | subtle |
| Footer | `[data-footer-main]` once | subtle |

**TrustTruckMotion:** NOT wrapped — truck keeps independent `translate3d` scroll motion (~200px desktop).

---

## L. Trigger / rootMargin / Timing

| Parameter | Desktop | Mobile |
|-----------|---------|--------|
| threshold | 0.15 | 0.15 |
| rootMargin | `0px 0px -8% 0px` | same |
| duration | 550ms | 420ms |
| translateY (heading) | 24px | 14px |
| translateY (card) | 32px | 18px |
| stagger (logos) | 55ms | 55ms |

---

## M. Reduced-Motion Behavior

Test: `prefers-reduced-motion: reduce` emulated via Playwright.

| Check | Result |
|-------|--------|
| Reveal elements hidden | 0 / 30 |
| Logo scale disabled | CSS `motion-reduce:` classes |
| Truck motion | Skipped in `TrustTruckMotion` when reduced |

**PASS** — all content immediately visible.

---

## N. Truck-Motion Conflict Test

- ScrollReveal applied to trust **headline wrapper only**
- `[data-truck-motion]` element untouched by ScrollReveal
- Truck uses inline `style.transform = translate3d(...)` — no CSS class conflict
- Verified: no double-transform on truck container

---

## O. Desktop Screenshot Assessment (1440px)

- Service cards: balanced desktop layout unchanged; badge corner overlap intact
- Client logos: 11-up row at xl, readable size, hover scale visible
- Footer: compact 4-column, logo clearer with brightness boost
- Scroll reveals: natural entry timing, no blank sections after load
- Horizontal overflow: **0px**

---

## P. Mobile Screenshot Assessment (390/360px)

- Service cards: centered badge/image/text — reads as single visual unit
- Client logos: 2–3 col grid, adequate size, no tiny floaters
- Footer: intentionally centered stack; accordions usable
- Fixed controls: do not overlap footer form at tested scroll positions
- Horizontal overflow: **0px** at 390 and 360

---

## Q. Content Parity Regression

| Check | Expected | Actual | Status |
|-------|----------|--------|--------|
| H1 count | 1 | 1 | PASS |
| FAQ count | 14 | 14 | PASS |
| Services | 6 | 6 | PASS |
| Client logos | 11 | 11 | PASS |
| #calculator | 1 | 1 | PASS |
| Service copy/hrefs | frozen | unchanged | PASS |
| Calculator CTA text | exact | exact | PASS |

Source: `scripts/homepage-parity-audit.mjs`

---

## R. SEO / Meta / Schema Regression

| Field | Status |
|-------|--------|
| title | PASS — matches production |
| meta description | PASS |
| canonical | PASS — `https://express-hovalot.co.il/` |
| robots | PASS — index, follow |
| schema | PASS — MovingCompany, WebSite, FAQPage |
| URL contract | PASS — no changes |

---

## S. Lint Result

```
npm run lint → PASS (exit 0)
```

---

## T. TypeScript Result

```
npx tsc --noEmit → PASS (exit 0)
```

---

## U. Build Result

```
npm run build → PASS (Next.js 16.3.8, static homepage)
```

---

## V. Remaining Visual Weaknesses (Critical Notes)

1. **Footer logo** — Production `logoFooter` asset is inherently dark; CSS brightness helps but is not a true white knockout logo. A dedicated light footer asset from production would be ideal if discovered later.
2. **Final CTA phone button** — Text-only (no handset icon). Consistent with pre-2A.18; adding `PhoneHandsetIcon` would improve parity with hero/header if desired in a future micro-pass.
3. **Scroll reveal flash risk** — Very fast scroll before hydration completes could briefly show then hide below-fold content; mitigated by immediate reveal for in-viewport elements. No permanent SEO hide.
4. **Mobile about slide** — Horizontal slide variants collapse to vertical translate on mobile (`max-width: 1023px`) to avoid horizontal overflow; subtle trade-off vs desktop opposing-direction reveal.
5. **Floating phone FAB** — Only appears after 320px scroll; not visible at page top (by design).

---

## Horizontal Overflow Summary

| Viewport | Overflow |
|----------|----------|
| 1440px   | 0        |
| 1024px   | 0        |
| 768px    | 0        |
| 390px    | 0        |
| 360px    | 0        |

---

## Screenshot Index

All under `audit/screenshots/phase-2a18/`:

- `services-1440.png`, `services-390.png`, `services-360.png`
- `client-logos-1440.png`, `client-logos-768.png`, `client-logos-390.png`, `client-logos-360.png`
- `client-logos-hover-1440.png`
- `trust-entering-1440.png`
- `reveal-services-entering-1440.png`, `reveal-about-1440.png`, `reveal-faq-calculator-1440.png`
- `footer-1440.png`, `footer-390.png`, `footer-360.png`

---

**Phase 2A.18 STOP — Phase 2B not started.**
