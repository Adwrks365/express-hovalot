# Migration Risks

## Critical

1. **Elementor-rendered content** — Nearly all public pages and all 16 articles are built with Elementor. Migration must use rendered HTML + REST content as source of truth, not attempt to port Elementor internals directly.

2. **Hebrew URL preservation** — Slugs use Hebrew characters with encoded/decoded variants and trailing-slash normalization. Next.js must preserve exact indexed paths (46 pages + 16 posts minimum).

3. **Lead forms (Elementor Pro)** — 16 distinct form configurations posting via AJAX. Email destinations, reCAPTCHA keys, and success/redirect behavior require manual verification before rebuild.

4. **SEO metadata authority** — Yoast controls titles, descriptions, canonicals, OG, Twitter, and JSON-LD. Rendered output must match current production; REST `yoast_head_json` available for cross-check.

## High

5. **Tracking duplication** — GTM4WP + Insytix Site Analytics + possible GTM-loaded tags. Risk of double-counting conversions if all re-implemented blindly.

6. **Internal link integrity** — 202 broken internal links detected (likely slash/encoding mismatches). Must reconcile before cutover.

7. **Contact CTA inconsistencies** — Same phone number (052-500-5573) appears in 5 different `tel:` formats; 5 WhatsApp URL variants. Standardize during migration only with explicit approval.

8. **Sitemap vs crawl gap** — 33 non-sitemap URLs discovered (archives, pagination, Cloudflare paths). Decide which require preservation vs redirect.

## Medium

9. **Google Reviews widget** — `wp-reviews-plugin-for-google` active; user-facing reviews section must be recreated or re-embedded.

10. **Accessibility widget** — `pojo-accessibility` active; may affect DOM/overlay behavior.

11. **Performance baseline** — Elementor + multiple scripts; Next.js should improve CWV but visual parity requires careful rebuild.

12. **Inactive/orphan assets** — 192 media in library vs 125 referenced in crawl; unused media may still be linked from uncrawled contexts.

## Requires Manual Review

- Pages: `/שגיאה-404-1`, `/שגיאה-404-2` (test 404 pages in crawl)
- `/דף-נחיתה` landing page indexability
- Category/tag/author archive indexation strategy
- Whether Google Site Kit (FTP present, REST inactive) affects anything live
- Form submission endpoints and CRM/email integrations
