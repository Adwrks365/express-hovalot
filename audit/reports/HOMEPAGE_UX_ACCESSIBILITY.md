# Homepage UX & Accessibility — Phase 2A.2 / 2A.3

**Date:** 2026-10-06  
**Reference:** https://express-hovalot.co.il/

## Section order vs production

| Order | Local | Status |
|-------|-------|--------|
| 1 | Hero + form | MATCH |
| 2 | Services grid | MATCH |
| 3 | Reviews carousel | MATCH (2A.3 carousel) |
| 4 | Trust truck + phone | MATCH |
| 5 | Customer logos | MATCH |
| 6 | About | MATCH — after logos per visual reference |
| 7 | FAQ | MATCH |
| 8 | Calculator | MATCH |
| 9 | Service areas + contact | MATCH |
| 10 | Final CTA | MATCH |
| 11 | Footer | MATCH |

## Fixed control positioning (Phase 2A.3)

Split into two physical groups:

| Side | Controls | When visible |
|------|----------|--------------|
| **RIGHT** (`start-3`) | WhatsApp, Phone | After scroll > 320px |
| **LEFT** (`end-3`) | Accessibility (always), Scroll-to-top | A11y always; scroll after 320px |

Gap: 12px. Main `pb-20` on mobile for clearance. No overlap at 360/390px.

## Header (Phase 2A.3)

Single-row header: Logo + Nav + Phone + WhatsApp link + **one** gold quote CTA.  
No duplicate top bar. Mobile: Logo + phone icon + hamburger; quote/WhatsApp in drawer.

## Hero form (Phase 2A.3)

Desktop max width ~340px, compact fields (44px), grid `1fr / minmax(260px,340px)` — form secondary to headline/truck.

## Service images — verification table

| Service | Live URL | Local file | MATCH |
|---------|----------|------------|-------|
| הובלת דירה | `.../2024/03/hovalot.webp` | `/media/2748-hovalot.webp` | YES |
| שירותי אריזה | `.../2020/12/Small_1.webp` | `/media/2311-Small_1.webp` | YES |
| הובלת משטחים | `.../2024/03/parcel.webp` | `/media/2747-parcel.webp` | YES |
| הובלת משרדים | `.../2020/12/Small_2.webp` | `/media/2312-Small_2.webp` | YES |
| שירותי אחסנה | `.../2020/12/Small_3.webp` | `/media/2313-Small_3.webp` | YES |
| הובלת מנוף | `.../2024/03/Asset-9@2x.png` | `/media/2759-Asset-9_2x.png` | YES |

Presentation: circular gold-bordered icons (production-style).

## Reviews carousel (Phase 2A.3)

- Desktop: 3 cards | Tablet: 2 | Mobile: 1
- CSS scroll-snap + prev/next + pagination dots
- RTL `dir="rtl"`, keyboard accessible, no autoplay

## RTL alignment (Phase 2A.3)

- Long-form sections: `text-start` (right in RTL)
- Section headings: centered only where intentional (services intro, logos, final CTA)
- FAQ, service areas, About, contact card: right-aligned

## CTA / Footer separation (Phase 2A.3)

Final CTA: light green/white gradient + gold top border. Footer: dark brand-900 — clear visual break.

## Calculator

Field parity maintained. **LOGIC PENDING** — no fabricated estimates.

## Quality gates

- lint PASS | tsc PASS | build PASS
- duplicate header quote CTAs: 0
- service image mismatches: 0
