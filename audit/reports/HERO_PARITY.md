# Hero Parity — Phase 2A.4

**Reference:** https://express-hovalot.co.il/ (Elementor post-2701)  
**Date:** 2026-10-06

## Source element inventory

| SOURCE ELEMENT | SOURCE TEXT | SEMANTIC ROLE | LOCAL STATUS (2A.4) | ACTION |
|----------------|-------------|---------------|---------------------|--------|
| Animated headline | הובלות קטנות וגדולות בירושלים עם ביטוח מלא ואחריות | Production H2 | `<h2>` restored | DONE |
| Main positioning | מומחי הובלות בירושלים | Production H1 | `<h1>` (single page H1) | DONE |
| Services line | הובלת דירות, משרדים ושירותי אחסנה | Production H2 | `<h2>` restored | DONE |
| Supporting paragraph | מחפשים מובילים מומלצים… | Production H4 → paragraph | `<p>` visible | DONE |
| Specialties line | אנו מתמחים במתן מעטפת… | Production H4 (hero area) | `<p>` visible | DONE |
| Benefit badge 1 | הובלת דירות | Image + link | `3586` asset + link | DONE |
| Benefit badge 2 | פתרונות אחסנה | Image + link | `3587` asset + link | DONE |
| Benefit badge 3 | שירותי אריזה | Image + link | `3588` asset + link | DONE |
| Primary CTA | קבלו / בקשת הצעת מחיר | Button | Gold → `/הצעת-מחיר` | DONE |
| Phone CTA | חייגו… 052-500-5573 | tel link | `tel:+972525005573` | DONE |
| Form title | נשמח לעמוד לשירותכם | Production H3 | `<h3>` in form card | DONE |
| Form intro | לכל סוגי ההובלה… | Supporting copy | Visible (xs) | DONE |
| Form fields | name, phone, email, addresses, date, message | Lead form | All preserved | DONE |
| Background slideshow | 3506 + 3508 truck images | LCP background | Static 3506 desktop, 3517 mobile | DOCUMENTED |
| Mobile hero duplicate | Separate mobile headings | Responsive variant | Unified hierarchy, mobile image crop | DONE |

## Heading hierarchy mapping

| OLD (production DOM) | NEW (local semantic) |
|----------------------|----------------------|
| H2 animated headline | H2 `seoHeadline` |
| H1 מומחי הובלות בירושלים | H1 `title` |
| H2 הובלת דירות, משרדים… | H2 `servicesLine` |
| H4 supporting paragraph | p `subtitle` |
| H4 specialties | p `specialties` |
| H3 form title | h3 in form card |

**Note:** Previous local build incorrectly used the long SEO string as the sole H1.

## Hero benefit assets

| Label | Production URL | Local file |
|-------|----------------|------------|
| הובלת דירות | `.../2025/05/הובלת-דירות.webp` | `/media/3586-...webp` |
| פתרונות אחסנה | `.../2025/05/פתרונות-אחסנה.webp` | `/media/3587-...webp` |
| שירותי אריזה | `.../2025/05/שירותי-אריזה.webp` | `/media/3588-...webp` |

## Slideshow decision

Production uses Elementor slideshow (3506 + 3508). Second slide adds no unique text content.

**Decision:** Static hero with 3506 (desktop) / 3517 (mobile) for LCP performance. Documented; no slider JS.

## SEO text preservation

All meaningful Hero phrases remain **visible** in the Hero section. Nothing relocated or hidden.

## Form dimensions (desktop)

- Card width: **300px** (`minmax(280px, 300px)`)
- Padding: 12–14px
- Input height: 40px (heroDense)
- Field pairs: Name|Phone, Origin|Destination

## Performance

- Server Component Hero (no client JS)
- `priority` + `fetchPriority="high"` on LCP image
- No slider library, no video
- QuoteForm only client island in Hero
