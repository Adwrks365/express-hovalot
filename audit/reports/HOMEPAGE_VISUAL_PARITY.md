# Homepage Visual Parity — Phase 2A.1

**Reference:** https://express-hovalot.co.il/ (live production)  
**Local:** Phase 2A Next.js homepage  
**Date:** 2026-10-06

## Brand palette (from production Elementor CSS `post-2701.css`)

| Token | Hex | Source |
|-------|-----|--------|
| forest | `#003405` | Hero gradient, header |
| forest-dark | `#13330E` | Section backgrounds |
| forest-muted | `#1B2C1D` | Footer / dark panels |
| green | `#39A739` | CTA buttons |
| green-bright | `#46CF46` | Hover / accents |
| gold | `#CFBD1A` | Accent highlights |
| gold-light | `#E5D53E` / `#FFF063` | CTA secondary |
| coral | `#FE8066` | Optional accent (production) |
| neutral | `#F8F8F8` / `#FFFFFF` | Backgrounds |

**Correction:** Phase 2A used a generic blue (`brand-*` blue scale). Phase 2A.1 replaces with production green/gold system.

## Section-by-section parity

| # | Production section | Phase 2A local | Gap | Correction |
|---|-------------------|----------------|-----|------------|
| 1 | Green branded header + real logo + phone + WhatsApp + nav | White generic header; **4730-logo.svg renders word "Logo"** | Critical logo/branding | Green header; real webp logos (3239 desktop, 3252 mobile, 3538 footer) |
| 2 | Hero slideshow — truck photo + green gradient + headline + quote form | Blue overlay generic hero | Wrong colors, wrong mood | Truck `3506`, green gradient `#003405`, production headline hierarchy |
| 3 | Intro: "מחפשים מובילים..." + specialties strip | Partial in services intro only | Missing trust intro | Restore intro + "אנו מתמחים במתן מעטפת..." |
| 4 | Six services with distinctive icon imagery (hovalot, Small_1, parcel, etc.) | Generic rectangular cards; **wrong images** (services-4, Asset-9 reused) | Visual identity | Map each service → production image (see HOMEPAGE_MEDIA_PARITY.md) |
| 5 | About + team/truck photography | About text OK; wrong image (3508 clients photo) | Image mismatch | Use team/truck asset `3509` |
| 6 | Google Reviews widget (34 reviews, Trustindex) | **Developer placeholder** | Incomplete | Static UI from extracted `homepage-reviews.json` |
| 7 | Customer logos (adidas, Castro, Elbit, etc.) | **Missing** | Trust content lost | Restore logo strip from migrated assets |
| 8 | Trust CTA + truck image section | Partial final CTA only | Missing mid-page trust block | Restore truck + messaging section |
| 9 | FAQ (green branded accordion) | Accordion OK; blue styling | Brand mismatch | Green/gold FAQ styling |
| 10 | Moving calculator | Calculator with **fabricated pricing formula** | Wrong logic | UI-only; no fake estimates |
| 11 | Service areas (Jerusalem neighborhoods SEO block) | **Missing** | SEO/content loss | Full verbatim block restored |
| 12 | Contact/office details | Partial in footer | Incomplete | Address, phone, email in footer + service areas |
| 13 | Final CTA (phone prominent) | Blue CTA section | Brand mismatch | Green/gold CTA |
| 14 | Footer — green/branded, real logo, links | Generic dark blue footer | Brand mismatch | Production-style footer with 3538 logo |

## Classifications

| Section | Action |
|---------|--------|
| Header, Hero, Services, About, Reviews, Logos, FAQ, Calculator, Service areas, CTA, Footer | **PRESERVE** (modernized) |
| Lorem ipsum blocks on production (×3) | **INTENTIONALLY OMIT** — placeholder junk on live site, not business content |
| Duplicate phone-only sections | **MERGE** into header + CTAs |
| Elementor slideshow JS | **INTENTIONALLY OMIT** — static hero image for performance; same truck asset |

## Logo issue (critical)

`/media/4730-logo.svg` is **not** the Express Hovalot logo — it is SVG path text spelling "Logo".  
Correct assets: `3239` (horizontal+slogan), `3252` (mobile), `3538` (footer).

---

## Phase 2A.1 corrections applied

- Replaced blue token system with production green/gold palette
- Fixed logo to use real webp assets (not `4730-logo.svg`)
- Rebuilt green header, hero with truck + green gradient, gold CTAs
- Mapped all 6 service cards to production icon imagery
- Restored Google reviews UI from `homepage-reviews.json` (8 reviews, 34 count)
- Restored 11 customer logo assets
- Restored full Jerusalem service-areas SEO block + office contact
- Removed calculator fabricated pricing; UI-only pending logic
- Removed all developer placeholder copy from visible UI

---

## Phase 2A.2 polish (approved direction retained)

- Fixed control system: Accessibility + Phone + WhatsApp + Scroll-to-top (no overlap)
- Trust section: full-bleed truck image 3516 with phone CTA
- Hero overlay lightened for truck visibility
- Typography: 16px+ body text, larger form fields
- Section order aligned to production: Reviews → Trust → Logos → About
- Native accessibility widget with localStorage persistence
- See `HOMEPAGE_UX_ACCESSIBILITY.md`

---

## Phase 2A.3 precision corrections

- Hero form compact (~340px desktop), headline/truck primary focus
- Single-row header — removed duplicate top bar / quote CTA
- Fixed controls split: contact RIGHT, a11y+scroll LEFT
- Services: circular gold-bordered production icons
- Reviews: accessible carousel (3/2/1 cards)
- RTL text-start on long-form sections
- FAQ widened (`max-w-6xl`), calculator on light background
- CTA/Footer visual separation (light CTA → dark footer)
- Container max-width 85rem for 1440px desktop
