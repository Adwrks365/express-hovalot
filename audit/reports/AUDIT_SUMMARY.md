# Audit Summary

Generated: 2026-10-06  
Phase: 1 — Full Read-Only Migration Audit  
Site: https://express-hovalot.co.il/

## Three-Source Reconciliation

| Source | Finding |
|--------|---------|
| **Public crawl** | 205 unique URLs discovered (sitemaps + internal links) |
| **WordPress REST** | 46 pages, 16 posts, 192 media, 7 categories, 15 tags |
| **Yoast sitemaps** | 70 unique URLs across 8 sitemap files |
| **FTP** | WordPress root `/`, active theme **Everest**, 19 plugin directories |

**Discrepancies recorded:**
- 33 crawl URLs not in sitemap (date archives, pagination, Cloudflare utility paths, encoded slug variants)
- 12 indexable crawl URLs not matched to WP pages/posts (categories, archives, homepage variants)
- 97 URLs use trailing-slash 301 normalization before 200
- Internal link raw count inflated by global nav repetition — **7,965 unique** relationships after deduplication

## Audit Gate Answers

1. **Indexable URLs to preserve:** ~70 in sitemap (primary SEO set) + 4 additional indexable non-sitemap URLs requiring review
2. **WordPress pages:** 46 published
3. **Published articles:** 16 — full Elementor HTML bodies preserved in `audit/content/posts.json`
4. **Sitemap URLs accounted:** Yes — all 70 sitemap URLs returned 200 in crawl
5. **URL patterns:** Hebrew slugs, service pages, blog posts, `/category/`, `/tag/`, `/author/`, date archives, legal pages, thank-you/landing pages
6. **Media required:** 192 REST library records; 125 images referenced in crawled HTML
7. **Internal links:** 7,965 unique relationships; 202 broken (mostly trailing-slash / encoded-path mismatches)
8. **Forms to recreate:** 16 unique Elementor form signatures (296 raw occurrences sitewide)
9. **Tracking:** GTM-WV7G52L, GA4 G-FT34HGFRWM (+ G-6JX26B9RDG detected), reCAPTCHA, Insytix analytics plugin
10. **SEO/schema:** Yoast SEO active; Organization, WebSite, Article, FAQPage, BreadcrumbList, Person schema detected
11. **Redirects:** 97 trailing-slash 301s; no standalone redirect plugin active in REST
12. **Elementor:** 101 crawled pages with Elementor markers — primary page builder
13. **Migration-critical plugins:** Elementor Pro, Yoast SEO, GTM4WP, Google Reviews widget, WPCode, accessibility widget
14. **Uncertain:** Form email routing, Elementor global templates/popups inventory, inactive Google Site Kit role, .htaccess redirect rules count only
15. **Human review:** Archive/noindex URLs, 404 test pages, contact link format inconsistencies, duplicate GA4 IDs

## Primary Deliverables

See `audit/MIGRATION_MANIFEST.md` and structured files under `audit/public/`, `audit/content/`, `audit/seo/`, `audit/links/`, `audit/media/`, `audit/forms/`, `audit/tracking/`, `audit/wordpress/`.
