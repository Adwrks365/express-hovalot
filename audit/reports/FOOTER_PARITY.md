# Footer Parity — Phase 2A.11

**Source:** Live production homepage footer (`elementor-location-footer`, Elementor library template)  
**Audit date:** 2026-10-06

## Summary

| Metric | Production | Local before | Local after |
|--------|------------|--------------|-------------|
| Columns (desktop) | 4 × 25% | 4 generic | 4 source-grouped |
| About text | Verbatim 15+ year copy | Short generic | **Verbatim restored** |
| Service area links | 8 cities inline | Missing | **8 cities** |
| Jerusalem external links | 5 | 0 | **5** |
| Full site nav | Vertical nav-menu | 9 service + 4 storage + 4 legal | **Full nav + blog + regional** |
| Blog post links | 16 under טיפים ומידע | 0 | **16** |
| Regional links | 9 under הובלות באזור | 0 | **9** |
| Social links | Facebook, email, WhatsApp, phone, Google | Partial | **5** |
| Map embed | Google Maps iframe | None | **Restored** |
| Credits | moran-art.com, Adwrks 365 | Generic copyright | **Restored** |
| Footer mini-form | Elementor form | N/A | **Omitted** (Final CTA already exists; utility contact via phone/email/map) |

## Inventory table (representative items)

| Item | Production label | Production URL | Type | Local before | Local after |
|------|------------------|----------------|------|--------------|-------------|
| About | אודותינו | — | TEXT | Generic blurb | Verbatim production copy |
| Logo | לוגו פוטר | / | INTERNAL | Yes | Yes (3538) |
| Facebook | Facebook | facebook.com/expresshovalot | EXTERNAL | No | Yes + nofollow |
| WhatsApp | Whatsapp | wa.me/0525005573 | EXTERNAL | Button only | Yes + nofollow |
| Phone | 052-500-5573 | tel:0525005573 | PHONE | Yes | Yes |
| Email | shinua30@gmail.com | mailto: | EMAIL | Partial | Yes |
| Jerusalem | ירושלים | / | INTERNAL | No | Yes |
| Modiin | מודיעין | /הובלות-במודיעין | INTERNAL | No | Yes |
| Jerusalem municipality | האתר הרשמי של עיריית ירושלים | jerusalem.muni.il | EXTERNAL | No | Yes |
| Nav home | הובלות בירושלים | / | INTERNAL | Yes | Yes |
| Nav services | שירותי הובלה (+11 children) | Hebrew paths | INTERNAL | 9 only | **Full tree** |
| Nav storage | אחסון (+4 children) | Hebrew paths | INTERNAL | 4 | Yes |
| Calculator | מחשבון הובלה | /#calculator | INTERNAL | No | Yes |
| FAQ | שאלות נפוצות | /שאלות-נפוצות | INTERNAL | Yes | Yes |
| Blog posts | 16 titles | post paths | INTERNAL | 0 | **16** |
| Regional | 9 area pages | Hebrew paths | INTERNAL | 0 | **9** |
| Sitemap | מפת אתר | /site-map | INTERNAL | Yes | Yes |
| Accessibility | הצהרת נגישות | /accessibility-statement | LEGAL | Yes | Yes |
| Privacy | מדיניות פרטיות | /privacy-policy | LEGAL | Yes | Yes |
| Terms | תנאי שימוש | /terms-of-use | LEGAL | Yes | Yes |
| Design credit | moran-art.com | http://moran-art.com | EXTERNAL | No | Yes + nofollow |
| Maintenance | Adwrks 365 | http://adwrks.co.il | EXTERNAL | No | Yes + nofollow |
| Map | Google Maps embed | google.com/maps/embed | EXTERNAL | No | iframe (lazy) |

## External link policy (local after)

All external footer links use:

```html
target="_blank"
rel="nofollow noopener noreferrer"
```

Internal links: same-tab, no `nofollow`.

## Intentional differences

1. **Footer contact form removed** — production column 4 includes a mini lead form; local site has a single Final CTA immediately above footer per Phase 2A.9/2A.10. Contact utility preserved via phone, email, WhatsApp, map.
2. **Navigation presentation** — production uses one long vertical Elementor menu; local uses grouped columns (ניווט / טיפים / אזור) for readability while preserving all URLs.
3. **Social icons** — text labels instead of Font Awesome circles (no icon font dependency); same destinations.
