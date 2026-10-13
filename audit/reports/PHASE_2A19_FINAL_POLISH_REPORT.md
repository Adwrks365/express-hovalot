# Phase 2A.19 — Final Homepage Micro-Polish Report

**Date:** 2026-10-07  
**Scope:** 404 polish, client logo marquee, mobile hero background  
**Status:** COMPLETE — Phase 2B NOT started

---

## A. 404 Before/After

**Before:** Generic centered layout with three CTAs (home, quote form, phone) and a visitor-facing WordPress migration note at the bottom.

**After:** Branded lightweight page with Express logo, green/gold palette, centered hierarchy, two CTAs only (home + phone), no technical notes.

**Screenshots:** `audit/screenshots/phase-2a19/404-desktop.png`, `404-mobile-390.png`

---

## B. 404 HTTP Status Verification

| Test URL | HTTP Status |
|----------|-------------|
| `/this-page-does-not-exist-phase-2a19` | **404** |

Verified via Playwright response status on production build (`next start`).

---

## C. Removed Migration/Development Text

**Removed completely:**
> הערה: עמודי בדיקת 404 הישנים של WordPress אינם מועברים כעמודי תוכן.

**Rendered page checks (PASS):**

| Term | Present |
|------|---------|
| WordPress | NO |
| עמודי בדיקת | NO |
| אינם מועברים | NO |
| migration / audit | NO |

**Present (PASS):** 404, העמוד לא נמצא, חזרה לדף הבית

---

## D. Client Section Before/After

**Before (2A.18):** Static responsive grid with staggered ScrollReveal per logo.

**After:** Continuous horizontal marquee with edge fades; heading still uses ScrollReveal (container only, not track).

**Screenshots:** `client-marquee-1440.png`, `client-marquee-hover-1440.png`

---

## E. Marquee Implementation

| Component | Role |
|-----------|------|
| `ClientLogoMarquee.tsx` | Client component — duplicated track, hover pause, reduced-motion static row |
| `ClientLogosSection.tsx` | Server wrapper — heading + marquee, `overflow-x-clip` |
| `globals.css` | `@keyframes logo-marquee` — translateX 0 → -50%, 30s/25s |

Track uses `dir="ltr"` for seamless loop math. Visual duplicates `aria-hidden`; SR list holds 11 unique brand names.

---

## F. Unique Logo Count

| Context | Count |
|---------|-------|
| Screen-reader list | **11** unique |
| Visual track | 22 (11 × 2 for loop) |
| Production assets | All 11 unchanged |

---

## G. Loop Duration Desktop/Mobile

| Viewport | CSS duration | Target |
|----------|--------------|--------|
| Desktop (>767px) | 30s | 25–35s ✓ |
| Mobile (≤767px) | 25s | 20–30s ✓ |

Movement verified: transform changes between 0ms and 1200ms samples.

---

## H. Hover/Pause Behavior

- Marquee **pauses** on container hover (`animation-play-state: paused`) — verified
- Individual logo: scale ~1.09, grayscale → color, shadow, 220ms transition
- On mouse leave: animation resumes
- No layout shift (transform only)

---

## I. Reduced-Motion Behavior

| Check | Result |
|-------|--------|
| Animated track visible | Hidden (`motion-reduce:hidden`) |
| Static scroll row | Visible (`motion-reduce:block`) |
| Animation | `none` |
| All 11 logos accessible | YES (static horizontal scroll) |

---

## J. Mobile Hero Background Before/After

**Before:** Mobile used WP 4579 asset with heavy radial overlay and `object-[50%_32%]` — truck often unreadable, flat dark-green crop.

**After:** Production mobile truck asset **3517** (`heroTruckWide`, documented in HERO_PARITY) with `object-[52%_58%]` and layered lighter gradient overlay.

Desktop unchanged — still uses 3506 with `object-[70%_center]` and desktop gradient.

**Screenshots:** `hero-mobile-360.png`, `hero-mobile-390.png`, `hero-mobile-430.png` (+ 375 captured in QA run)

---

## K. Mobile Background Positioning Values

| Property | Mobile value |
|----------|--------------|
| Asset | `MEDIA.heroTruckWide` (wp-image-3517) |
| object-fit | `cover` |
| object-position | **52% 58%** |
| Desktop asset | Unchanged (3506, `object-[70%_center]`) |

Position chosen to center truck cab/body in typical mobile viewport crop.

---

## L. Overlay Before/After Values

**Before (mobile):**
- Single combined radial + linear, peak opacity ~0.72–0.82

**After (mobile, layered):**

1. **Linear gradient:** `rgba(0,45,18,0.72)` top → `0.42` mid → `0.38` center → `0.58` bottom (CTA zone)
2. **Radial gradient:** `ellipse 90%×55% at 50% 22%`, `rgba(0,45,18,0.5)` → transparent (headline zone only)

Desktop overlay: unchanged (`bg-hero-gradient`).

---

## M. 360/375/390/430 Hero Assessment

| Viewport | Overflow | Assessment |
|----------|----------|------------|
| 360×800 | 0 | Truck silhouette readable; text/CTA readable |
| 375×812 | 0 | Consistent crop |
| 390×844 | 0 | Best reference frame |
| 430×932 | 0 | More truck visible; no clipping issues |

Hero copy, badges, phone, and CTAs preserved unchanged.

---

## N. Content Parity Result

| Check | Expected | Actual | Status |
|-------|----------|--------|--------|
| H1 | 1 | 1 | PASS |
| Services | 6 | 6 | PASS |
| FAQ | 14 | 14 | PASS |
| Unique client logos (SR) | 11 | 11 | PASS |
| #calculator | 1 | 1 | PASS |
| Hero wording | frozen | unchanged | PASS |
| Service/FAQ/About copy | frozen | unchanged | PASS |

---

## O. SEO/Meta/Schema Regression

| Field | Status |
|-------|--------|
| Homepage title | PASS — unchanged |
| meta description | PASS |
| canonical | PASS |
| robots (homepage) | PASS — index, follow |
| schema | PASS — MovingCompany, WebSite, FAQPage |
| 404 robots | `noindex` (metadata export) |
| URL contract | PASS — no changes |

---

## P. Lint

```
npm run lint → PASS
```

---

## Q. TypeScript

```
npx tsc --noEmit → PASS
```

---

## R. Build

```
npm run build → PASS (Next.js 16.3.8)
```

---

## S. Remaining Visual Weaknesses (Critical)

1. **404 includes site header/footer** — Full layout wraps 404 (by design in root layout). Acceptable but 404 content area is compact; footer still appears below fold.
2. **Marquee hover on individual logos** — Pause works on container; individual logo hover scale is subtle during motion. Acceptable trade-off.
3. **Hero mobile asset switch** — Moved from 4579 to documented 3517 per HERO_PARITY; if production Elementor later standardizes on 4579 exclusively, revisit crop only (not copy).
4. **Very bright mobile hero scenes** — If outdoor portions of 3517 appear on some devices, top radial overlay may need ±5% opacity tuning — current readability passes QA.
5. **Parity audit image count** — Automated audit reports 22 logo `<img>` tags (expected with visual duplication); semantic unique count remains 11.

---

## Horizontal Overflow Summary

| Viewport | Overflow |
|----------|----------|
| 1440 | 0 |
| 1024 | 0 |
| 768 | 0 |
| 430 | 0 |
| 390 | 0 |
| 375 | 0 |
| 360 | 0 |
| 404 @ 390 | 0 |

**Fix applied:** `overflow-x-clip` on client logos section + marquee container; removed hero image scale that briefly caused overflow.

---

## Screenshot Index

`audit/screenshots/phase-2a19/`:

- `404-desktop.png`, `404-mobile-390.png`
- `client-marquee-1440.png`, `client-marquee-hover-1440.png`
- `hero-mobile-360.png`, `hero-mobile-375.png`, `hero-mobile-390.png`, `hero-mobile-430.png`

---

## Files Changed

| File | Change |
|------|--------|
| `src/app/not-found.tsx` | Branded 404, noindex metadata, removed WP note |
| `src/components/home/ClientLogoMarquee.tsx` | New marquee component |
| `src/components/home/ClientLogosSection.tsx` | Grid → marquee wrapper |
| `src/components/home/HeroSection.tsx` | Mobile crop + lighter overlay |
| `src/content/homepage-content.ts` | Mobile hero asset → heroTruckWide (3517) |
| `src/app/globals.css` | Marquee keyframes + reduced-motion |
| `scripts/phase-2a19-qa.mjs` | QA automation |

---

**Phase 2A.19 STOP — Phase 2B not started.**
