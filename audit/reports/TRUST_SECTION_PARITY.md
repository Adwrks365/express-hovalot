# Trust / Truck Section Parity — Phase 2A.10

**Source:** Elementor post-2701, section `elementor-element-22e046e`

## Production content (verbatim)

| Semantic | Text |
|----------|------|
| **H3** | אקספרס הובלות - שירות מקצועי, מהיר ואמין |
| **H2** | הובלות בירושלים והסביבה כולל אריזה ואחסנה |

## Production asset

| Field | Value |
|-------|-------|
| WP Media ID | **3517** |
| Production URL | `.../2025/05/משאית-הובלות-אקספרס-בנסיעה-1024x515.webp` |
| Alt | משאית הובלות אקספרס בנסיעה |
| Layout | Full-width static image with absolutely positioned headings |
| Motion | Elementor parallax translateX (NOT migrated) |

## Local BEFORE (Phase 2A.9)

| Item | Value |
|------|-------|
| Asset | **3516** (phone-branded truck — not in post-2701) |
| Headings | H2 only (`homepageTrustBlock.title`) |
| Added copy | חייגו עכשיו…, phone, CTAs |
| Height | ~380px |
| Motion | None (but wrong asset felt like moving strip) |

## Local AFTER (Phase 2A.10)

| Item | Value |
|------|-------|
| Asset | **3517** `/media/3517-...webp` |
| H3 | `homepageTrustBlock.brandLine` |
| H2 | `homepageTrustBlock.headline` |
| CTAs | **Removed** — not in production section |
| Height | 320–460px responsive |
| Motion | **None** — static `next/image` fill, no fixed/parallax |
| Overlay | Directional gradient for RTL text readability |

## CTA differences

Production truck section has **no** phone/quote buttons. CTAs remain in Hero, Final CTA, Footer, fixed controls.

## SEO impact

**None** — restored production H2 headline text; semantic hierarchy improved (H3 + H2).
