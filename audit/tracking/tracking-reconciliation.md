# Tracking Reconciliation

## IDs Detected

| ID | Source (INFERRED) | Evidence |
|----|-------------------|----------|
| GTM-WV7G52L | GTM4WP plugin + gtm.js | Rendered HTML all sampled pages |
| G-FT34HGFRWM | gtag.js direct OR GTM | Rendered HTML |
| G-6JX26B9RDG | Secondary gtag/GTM load | Rendered HTML — **likely duplicate page_view risk** |
| Insytix | insytix-site-analytics plugin | Active plugin + possible script injection |

## Duplicate GA4 Firing

**INFERRED: YES — likely.** Two GA4 measurement IDs appear in homepage HTML. GTM may also fire GA4 tags inside container.

**CONFIRMED:** GTM container `GTM-WV7G52L` loaded via `gtm.js`.

## Insytix

**CONFIRMED:** Plugin active. Adds separate analytics layer — may duplicate pageview/click tracking.

## GTM Container Internals

**UNKNOWN** — requires GTM container export (read-only from GTM UI) or GTM API access to list tags/triggers/variables.

## Migration Must Preserve

1. GTM-WV7G52L container (exact tag configuration)
2. GA4 primary property (confirm which of G-FT34HGFRWM / G-6JX26B9RDG is canonical)
3. Form conversion events (likely in GTM)
4. reCAPTCHA integration on forms

## Page Samples

```json
{
  "/": {
    "gtm": [
      "GTM-WV7G52L"
    ],
    "ga4": [
      "G-FT34HGFRWM",
      "G-6JX26B9RDG"
    ],
    "gtag": true,
    "gtmScript": true,
    "insytix": true,
    "duracelltomi": true
  },
  "/%d7%9b%d7%9e%d7%94-%d7%a2%d7%95%d7%9c%d7%94-%d7%94%d7%95%d7%91%d7%9c%d7%aa-%d7%93%d7%99%d7%a8%d7%94-%d7%91%d7%99%d7%a8%d7%95%d7%a9%d7%9c%d7%99%d7%9d-%d7%91-2026/": {
    "gtm": [
      "GTM-WV7G52L"
    ],
    "ga4": [
      "G-FT34HGFRWM",
      "G-6JX26B9RDG"
    ],
    "gtag": true,
    "gtmScript": true,
    "insytix": true,
    "duracelltomi": true
  },
  "/%d7%94%d7%95%d7%91%d7%9c%d7%95%d7%aa-%d7%a7%d7%98%d7%a0%d7%95%d7%aa-%d7%91%d7%99%d7%a8%d7%95%d7%a9%d7%9c%d7%99%d7%9d-%d7%94%d7%9e%d7%93%d7%a8%d7%99%d7%9a-%d7%94%d7%9e%d7%9c%d7%90/": {
    "gtm": [
      "GTM-WV7G52L"
    ],
    "ga4": [
      "G-FT34HGFRWM",
      "G-6JX26B9RDG"
    ],
    "gtag": true,
    "gtmScript": true,
    "insytix": true,
    "duracelltomi": true
  }
}
```
