# About Page Structure Parity

Generated: Phase 2B.3F — production source vs local structured renderer

Production: https://express-hovalot.co.il/about-us/  
Local: `/about-us/` (AboutPageHero + structured blocks)

## Section Inventory

| Order | Production Section | Heading | Local Section | Content | Media | Order | Visual Role | Status |
|------:|--------------------|---------|---------------|---------|-------|------:|-------------|--------|
| 1 | Hero richText | H1 + H2 + intro | `AboutPageHero` | MATCH | Team bg image | MATCH | Hero + headline hierarchy | PASS |
| 2 | Form (hero CTA) | Quote form inline | `AboutPageHero` form aside | MATCH | — | MATCH | Hero conversion | PASS |
| 3 | Duplicate mobile CTA | — | — (skipped) | N/A | N/A | N/A | Responsive duplicate | SKIP |
| 4 | מי אנחנו | H2 + copy + truck image | `who-we-are` imageText | MATCH | `/media/4860-hp_mobile...` | MATCH | Two-column about | PASS |
| 5 | המומחיות שלנו | H2 + service links | `expertise` richText | MATCH | — | MATCH | Expertise list | PASS |
| 6 | Duplicate icon lists | — | — (skipped) | N/A | N/A | N/A | Responsive duplicate | SKIP |
| 7 | למה לבחור | H2 + supporting copy | `why-choose` richText | MATCH | — | MATCH | Benefits intro | PASS |
| 8 | Benefits grid | 4 icon features | `benefits` iconFeatureGrid | MATCH | Icons (text markers) | MATCH | 4 benefit cards | PASS |
| 9 | FAQ | 8 Q&A | `faq` faq block | MATCH | — | MATCH | Single accordion | PASS |
| 10 | Duplicate FAQ | — | — (skipped) | N/A | N/A | N/A | Responsive duplicate | SKIP |
| 11–12 | Final CTA + form | H2 + quote form | `final-cta` conversionSection | MATCH | — | MATCH | Final conversion | PASS |
| 13 | Trust / experience | H2 + truck action photo | `trust-experience` imageText | MATCH | `/media/3517-...webp` | MATCH | Trust proof section | PASS |

## Production → Local Block Map

```
Hero (H1/H2/intro)     → AboutPageHero
Hero form              → AboutPageHero (inline QuoteForm)
מי אנחנו               → imageText who-we-are
המומחיות שלנו          → richText expertise
למה לבחור (copy)       → richText why-choose
Benefits (4 items)     → iconFeatureGrid benefits
FAQ                    → faq faq
Trust in action        → imageText trust-experience
Final CTA/form         → conversionSection final-cta
```

## Missing Sections

**MISSING: 0** (all meaningful production sections represented)

## Intentional Modernization

- Compact dark hero replaced with full-width team background + gradient overlay + gold divider (header separation)
- Duplicate Elementor responsive sections omitted (mobile CTA strip, duplicate FAQ, duplicate icon grid)
- Hero form uses approved QuoteForm component instead of raw CF7 markup

## Media Audit

| Production Asset | Local Path | Role | Status |
|------------------|------------|------|--------|
| Team/hero background | `/media/3509-...webp` via `MEDIA.aboutTeam` | Hero bg | PRESERVED |
| Company trucks (who we are) | `/media/4860-hp_mobile_images_bg_2.webp` | Content illustration | PRESERVED |
| Truck in action | `/media/3517-...webp` | Trust section | PRESERVED |
