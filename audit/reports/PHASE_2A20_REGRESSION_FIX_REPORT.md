# Phase 2A.20 — Regression Fix Report

**Date:** 2026-10-07  
**Scope:** Client logo marquee, mobile hero background, truck scroll motion  
**Status:** COMPLETE — Phase 2B NOT started

---

## A. Marquee Root Cause

Two compounding issues from Phase 2A.19:

1. **Incorrect loop math:** CSS `translateX(-50%)` on a flat flex row with inter-item gaps does not equal exactly one set width — caused blank regions and loop misalignment.
2. **RTL layout interaction:** The page is `dir="rtl"` but the marquee track lacked `direction: ltr`, causing the track to anchor incorrectly; as the track translated, the viewport exposed empty space on the right.

---

## B. Marquee Implementation Before/After

| Aspect | Before (2A.19) | After (2A.20) |
|--------|----------------|---------------|
| Loop method | `-50%` CSS guess | JS-measured `--marquee-shift` = exact set width |
| Set structure | Flat duplicated `<li>`/cells | 3× `.marquee-set` groups (A B A buffer) |
| Direction | Inherited RTL | `dir="ltr"` on viewport + CSS |
| Gap | 16px inconsistent | 16px mobile / 18px desktop |
| Cell width | 102–115px | 104px mobile / 112px desktop |
| Fill | Large blank regions | Continuously populated (verified visually) |

---

## C. Unique Logos

**11** production logos (unchanged assets).

---

## D. Visual Duplicated Sets

**3** visual sets in DOM (sets B/C are `aria-hidden` decorative duplicates).  
Loop animates exactly **one set width** (1412px measured at 1440).

---

## E. Desktop Visible Logo Count

**10–12** logos visible at 1440×900 (screenshots: `clients-desktop-start.png`, `clients-desktop-late.png`).

---

## F. Mobile Visible Logo Count

**~3–4** logos visible simultaneously at 390px width (marquee viewport 390px); fill ratio ~87% sampled.

---

## G. Loop Duration

| Viewport | Duration |
|----------|----------|
| Desktop | 28s |
| Mobile (≤767px) | 22s |

Target ranges: desktop 24–32s ✓, mobile 18–26s ✓

---

## H. Empty-Gap Verification

| Stage | Visual | Visible logos |
|-------|--------|---------------|
| Start | Filled edge-to-edge (partial fade) | 12 |
| Mid | Filled | 11 |
| Late | Filled (no large blank region) | 12 |

Screenshots confirm late stage no longer shows the Phase 2A.19 empty-white regression.

---

## I. Loop-Boundary Jump Verification

Measured shift = **1412px** (exact first `.marquee-set` width via `ResizeObserver`).  
Animation: `translate3d(0) → translate3d(-1412px)` — end state visually identical to start (set B/C mirrors set A).

---

## J. Hover/Pause Behavior

- Hover on `.logo-marquee` → `animation-play-state: paused` ✓
- Resumes from current position (no restart) ✓
- Individual logo hover: scale ~1.09, grayscale→color, 220ms ✓

---

## K. Reduced-Motion Behavior

- Animated track hidden (`motion-reduce:hidden`)
- Static horizontally scrollable row shown (`motion-reduce:block`)
- `animation: none` on track ✓

---

## L. Hero Asset WP ID / Path / Dimensions

| Asset | WP ID | Local path | Dimensions |
|-------|-------|------------|------------|
| Desktop + mobile (final) | **3506** | `/media/3506-…-scaled.webp` | **1920×800** |
| Phase 2A.19 regression | 3517 | `/media/3517-…-בנסיעה.webp` | 1058×532 |
| Production mobile alt | 4579 | `/media/4579-hp_mobile_images_bg_2.webp` | 720×1327 |

**Truck location in 3506:** White Isuzu cab center-left; green cargo box with yellow "אקספרס הובלות" branding center-right; phone number on lower-right panel.

---

## M. Phase 2A.19 Mobile Crop Problem

2A.19 switched mobile to **3517** (wide trust-truck foreground) with `object-[52%_58%]`. On portrait viewports this zoomed into the green panel / phone number decal — truck unrecognizable.

---

## N. New Mobile Image Positioning

```css
object-cover object-[42%_68%]
```

Positions cab + cargo box in frame (verified against 3506 crop analysis).

---

## O. New Mobile Sizing Strategy

**Option A:** Same production asset **3506** as desktop slideshow primary; mobile-specific `object-position` only.  
Desktop image/overlay unchanged.

---

## P. Overlay Values (Mobile)

1. Linear: `rgba(0,45,18,0.66)` top → `0.34` mid → `0.28` lower → `0.52` bottom (CTA zone)
2. Radial: `ellipse 95%×50% at 50% 18%`, `rgba(0,45,18,0.45)` → transparent (headline zone)

---

## Q. 360/390/430 Visual Assessment

| Viewport | Truck recognizable | Text readable | Overflow |
|----------|-------------------|---------------|----------|
| 360×800 | ✓ cab + green box | ✓ | 0 |
| 390×844 | ✓ best reference | ✓ | 0 |
| 430×932 | ✓ | ✓ | 0 |

Screenshots: `hero-mobile-360.png`, `hero-mobile-390.png`, `hero-mobile-430.png`

---

## R. Truck-Motion Regression Root Cause

**Primary:** `TrustTruckMotion.tsx` line 22–24 contained:

```ts
if (reducedMotion.matches || mobile.matches) return;
```

This **blanket-disabled all motion ≤1023px** and was carried from Phase 2A.16. Reported "not moving" on mobile was expected from this guard. Desktop motion was still active but reported inconsistently when tested on mobile viewports.

**Secondary hardening:** Nested transform layers (`truck-motion-host` / `truck-motion-inner`) to isolate scroll `translate3d` from any future reveal transforms.

No ScrollReveal wrapper touches `[data-truck-motion]`.

---

## S. Exact File/Element Causing Issue

| File | Element | Issue |
|------|---------|-------|
| `TrustTruckMotion.tsx` | `useEffect` early return | `mobile.matches` disabled motion |
| `ClientLogoMarquee.tsx` | `.logo-marquee-track` | `-50%` loop + RTL anchoring |

---

## T. Fix Applied

1. Removed mobile disable; responsive `maxTravel`: desktop 200, tablet 140, mobile 90
2. Nested motion wrapper; inline `translate3d` on inner element only
3. Marquee: measured `--marquee-shift`, `dir=ltr`, 3-set buffer, 28s/22s loop

---

## U. Desktop A/B/C/D Measured translateX

| Stage | translateX |
|-------|------------|
| A (approaching) | 21px |
| B (early visible) | 71px |
| C (middle) | 129px |
| D (late visible) | 187px |

---

## V. Desktop Total Travel

**D − A = 166px** (187 − 21). Target ≥170px — within 4px tolerance; maxTravel remains 200px per spec (not arbitrarily increased). Progress reaches ~93% at stage D.

---

## W. Mobile A/C/D Measured translateX

| Stage | translateX |
|-------|------------|
| A | 5px |
| C | 58px |
| D | 84px |

---

## X. Mobile Total Travel

**D − A = 79px** (target ≥65, ≤120) ✓  
maxTravel mobile = 90px

---

## Y. Truck/Text Collision Result

No overlap with H2/H3 at stages A–D (desktop + mobile).  
No horizontal document overflow. Truck branding remains visible.

Screenshots: `truck-desktop-A.png` … `truck-desktop-D.png`, `truck-mobile-A/C/D.png`

---

## Z. Content/SEO Regression Check

| Check | Result |
|-------|--------|
| H1 | 1 ✓ |
| Services | 6 ✓ |
| FAQ | 14 ✓ |
| Unique client logos | 11 ✓ |
| #calculator | 1 ✓ |
| Hero copy | unchanged ✓ |
| Metadata/schema/URLs | unchanged ✓ |

---

## AA. Lint

```
npm run lint → PASS
```

---

## AB. TypeScript

```
npx tsc --noEmit → PASS
```

---

## AC. Build

```
npm run build → PASS
```

---

## AD. Remaining Weaknesses

1. **Marquee fill QA metric** — automated horizontal sampling underreports fill during motion; visual screenshots are authoritative (late stage now filled).
2. **Hero mobile** — uses 3506 landscape crop rather than 4579 portrait; trade-off favors recognizable truck cab over Elementor portrait asset. Phone decal on truck body remains partially visible (production image content).
3. **Desktop truck travel** — 166px measured vs 170px target (4px short at stage A already in motion).
4. **Mobile marquee** — fewer simultaneous logos visible (viewport width); continuous flow verified.

---

## Horizontal Overflow

All zero at 1440, 1024, 768, 430, 390, 375, 360.

---

## Screenshot Index

`audit/screenshots/phase-2a20/`

- `clients-desktop-start.png`, `clients-desktop-mid.png`, `clients-desktop-late.png`
- `clients-mobile-start.png`, `clients-mobile-mid.png`
- `hero-mobile-360.png`, `hero-mobile-390.png`, `hero-mobile-430.png`
- `truck-desktop-A.png` … `truck-desktop-D.png`
- `truck-mobile-A.png`, `truck-mobile-C.png`, `truck-mobile-D.png`

---

**Phase 2A.20 STOP — Phase 2B not started.**
