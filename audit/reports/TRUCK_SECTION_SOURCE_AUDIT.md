# Truck Section Source Audit — Phase 2A.11

**Production source:** Elementor post-2701, section `elementor-element-22e046e`  
**Audit date:** 2026-10-06

## Production composition type

**Answer: #2 — Road/background + separate foreground truck asset**

Production does **not** use a flattened full-bleed truck photo as the section background. Elementor structure:

| Layer | Elementor ID | Type | Asset |
|-------|--------------|------|-------|
| Section | `22e046e` | `background_background: classic` (solid/theme color, no bg image in HTML) | — |
| H3 | `162650a` | Absolute heading widget | Text only |
| H2 | `c7e7a49` | Absolute heading widget | Text only |
| Truck | `352f056` | **Absolute image widget** | **wp-image-3517** |
| Spacers | `42e6c0d`, `c6b6425` | Height control | — |

Production truck image widget had Elementor motion FX (translateX on scroll). **Local implementation: static only.**

## Production text (verbatim)

| Tag | Text |
|-----|------|
| H3 | אקספרס הובלות - שירות מקצועי, מהיר ואמין |
| H2 | הובלות בירושלים והסביבה כולל אריזה ואחסנה |

No CTAs in this section (phone/WhatsApp appear elsewhere).

## Production truck asset

| Field | Value |
|-------|-------|
| WP Media ID | **3517** |
| Elementor widget | `352f056` |
| Production URL | `.../משאית-הובלות-אקספרס-בנסיעה-1024x515.webp` |
| Dimensions | 1024 × 515 (displayed); full 1058w available |
| Alt | משאית הובלות אקספרס בנסיעה |
| Local file | `/media/3517-_D7_9E_D7_A9_D7_90_D7_99_D7_AA-_D7_94_D7_95_D7_91_D7_9C_D7_95_D7_AA-_D7_90_D7_A7_D7_A1_D7_A4_D7_A8_D7_A1-_D7_91_D7_A0_D7_A1_D7_99_D7_A2_D7_94.webp` |

**Note:** Asset 3516 (`rekareka...לפני-פוטר`) is a **footer-adjacent** truck image, **not** used in section 22e046e.

## Current local (before 2A.11)

| Item | Value |
|------|-------|
| Structure | Single `Image fill` + `object-cover` as pseudo-background |
| Asset | 3517 (correct ID, wrong usage) |
| Why truck missing | (1) Cover-crop treated truck as background; (2) **404** — `media-paths.ts` had wrong URL-encoded suffix (`_D7_90_D7_D7_A1` vs correct `_D7_A0_D7_A1` for "בנס") |

## Final local (after 2A.11)

| Item | Value |
|------|-------|
| Structure | Dark brand section + **foreground** `Image` 1024×515 `object-contain` |
| Layout | RTL flex row: copy (physical right) + truck (physical left) |
| Asset | 3517 unchanged |
| Motion | None — no parallax, no fixed attachment |
| Intentional difference | Flex/grid layout instead of Elementor absolute positioning — same asset and hierarchy, easier to maintain responsively |

## Desktop / mobile behavior

| Viewport | Production | Local after |
|----------|------------|-------------|
| Desktop | Absolute truck ~1024px wide, headings overlaid | Side-by-side: headings + full truck visible |
| Mobile | Same assets, Elementor mobile width initial | Stacked: headings then truck, `object-contain` preserves truck identity |
