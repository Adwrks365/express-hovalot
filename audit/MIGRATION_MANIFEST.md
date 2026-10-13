# Migration Manifest — express-hovalot.co.il

> Phase 1 audit + **Phase 1.5 reconciliation** (2026-10-06). Status labels: **CONFIRMED** | **INFERRED** | **UNKNOWN** | **REQUIRES HUMAN DECISION**

---

## Phase 1.5 Reconciliation Summary

| Item | Status | Value |
|------|--------|------:|
| Real broken internal links | **CONFIRMED** | **0** (202 were Cloudflare email-protection URLs) |
| Sitemap URLs | **CONFIRMED** | 70 (46 page + 16 post + 4 cat + 3 tag + 1 author) |
| Indexable crawl records | **CONFIRMED** | 74 |
| Unique canonical indexable | **CONFIRMED** | 73 |
| URLs requiring exact preservation | **CONFIRMED** | 70 (sitemap contract) |
| WP pages requiring migration | **CONFIRMED** | 44 (+ 2 test 404 pages = 46 total) |
| WP posts requiring migration | **CONFIRMED** | 16 |
| Required media assets | **CONFIRMED** | 145 |
| Distinct form workflows | **INFERRED** | ~6–8 (16 HTML signatures, repeated templates) |
| Form email routing | **UNKNOWN** | Requires WP admin review |
| GTM container internals | **UNKNOWN** | Requires GTM export |

---

## 1. Executive Summary

Production WordPress site for **Express Hovalot** (Jerusalem moving company). **46 pages**, **16 articles**, **70 sitemap URLs**, heavy **Elementor Pro** usage, **Yoast SEO**, lead forms, GTM/GA4 tracking. All public content must preserve existing Hebrew URL paths. Authoritative URL contract: `audit/reports/URL_CONTRACT.md`.

## 2. WordPress Environment

- **URL:** https://express-hovalot.co.il/
- **Host:** uPress (FTP: ftp.s816.upress.link)
- **WP root (FTP):** `/`
- **REST API:** Available, authenticated read verified
- **Database:** Not accessed (by design)

## 3. Theme / Child Theme

- **Active theme:** Everest (`everest/`)
- **Also installed:** Astra (inactive)
- **Child theme:** None detected
- **Details:** `audit/wordpress/themes.md`

## 4. Plugins

18 active plugins confirmed via REST. Migration-critical: Elementor, Elementor Pro, Yoast SEO, GTM4WP, Google Reviews, WPCode, Insytix analytics, accessibility widget, ezCache (replace), image-optimization (replace).

**Full list:** `audit/wordpress/plugins.md`

## 5. Public URLs

- **Crawl total:** 205 unique URLs
- **Sitemap total:** 70 URLs
- **Indexable (primary):** ~70 sitemap URLs + homepage
- **Inventory:** `audit/public/url-inventory.json`, `audit/public/url-inventory.md`
- **Route map (proposal):** `audit/public/proposed-route-map.json` — default rule: unchanged paths

## 6. Pages

- **Count:** 46 published
- **Data:** `audit/content/pages.json` (full HTML content preserved)
- **Builder:** Elementor on virtually all pages

## 7. Posts / Articles

- **Count:** 16 published
- **Data:** `audit/content/posts.json` (complete Elementor HTML bodies preserved — not summarized)
- **All articles include:** title, slug, dates, categories, Yoast meta, featured media ID, full content

## 8. Categories / Taxonomies

- **Categories:** 7 (`audit/content/categories.json`)
- **Tags:** 15 (`audit/content/tags.json`)
- **Authors:** 1 in author sitemap
- **Custom post types:** Standard only (post, page) — see `audit/content/post-types.json`

## 9. Media

- **REST library:** 192 items
- **Referenced in crawl:** 125 images
- **Uploads years (FTP):** 2018–2026
- **Manifest:** `audit/media/media-manifest.json`

## 10. Menus

WP REST menu endpoints returned limited data. Navigation extracted from homepage HTML crawl. See `audit/content/header-footer-nav.md`. **Manual visual verification recommended.**

## 11. Header

- Logo, primary nav, phone CTA, WhatsApp CTA, mobile Elementor menu
- **Details:** `audit/content/header-footer-nav.md`

## 12. Footer

- Multi-column links, contact info, legal links, social, copyright, repeated lead forms
- **Details:** `audit/content/header-footer-nav.md`

## 13. Forms

- **16 unique HTML signatures** (**CONFIRMED**); **~6–8 Elementor form_id workflows** (**INFERRED**)
- Sample form IDs: `30f992a`, `af66983`, `3bcec23`, `e6d5b71`, `28b6230e`, `488e82c0` (**CONFIRMED** from live HTML)
- Moving calculator form (non-Elementor selects) on homepage (**CONFIRMED**)
- Email routing: **UNKNOWN**
- **Inventory:** `audit/forms/forms-detailed.md`, `audit/forms/forms-workflow-summary.md`

## 14. Contact / Phone / WhatsApp CTAs

- **Primary phone:** 052-500-5573 (**CONFIRMED** — single number, formatting variants only)
- **Primary WhatsApp:** 972525005573 (**CONFIRMED** — single number, message prefill variants)
- **Details:** `audit/content/phone-whatsapp-reconciliation.md`

## 15. Internal Links

- **Unique relationships:** 7,965 (**CONFIRMED**)
- **Actually broken after Phase 1.5:** **0** (**CONFIRMED** — prior 202 were Cloudflare email-protection links)
- **Data:** `audit/links/internal-link-reconciliation.json`

## 16. External Links

- **Inventory:** `audit/links/external-links.md`

## 17. Redirects

- **Trailing-slash 301s:** 97 URLs
- **Standalone redirect map:** Minimal — no dedicated redirect plugin active
- **Details:** `audit/seo/redirect-map-current.md`

## 18. SEO Titles

- Yoast-managed; rendered HTML is authority
- **2 URLs** missing title in crawl (non-primary surfaces)
- **Inventory:** `audit/seo/seo-inventory.json`

## 19. Meta Descriptions

- Present on all primary sitemap URLs via Yoast
- **Inventory:** `audit/seo/seo-inventory.json`

## 20. Canonicals

- Yoast canonical tags on indexable content
- Trailing-slash Hebrew URLs standard
- Cross-check in `audit/seo/seo-inventory.json`

## 21. Robots Directives

- robots.txt: allow all
- Primary content: `index, follow`
- Archives/pagination variants: mixed — see `audit/seo/robots-indexability.md`

## 22. XML Sitemaps

- Yoast sitemap index; 5 child sitemaps (pages, posts, categories, tags, author)
- **Audit:** `audit/seo/sitemap-audit.md`

## 23. H1-H6 Structure

- Captured per URL in `audit/public/url-inventory.json` (h1, h2 arrays)
- Articles use multiple H2 sections via Elementor headings

## 24. Structured Data / Schema

Types detected: Organization, WebSite, WebPage, Article, BreadcrumbList, Person, FAQPage, ImageObject, SearchAction, CollectionPage, ProfilePage

**Inventory:** `audit/seo/schema-inventory.md`

## 25. Open Graph / Social Metadata

- Yoast OG tags on all primary content
- Facebook publisher linked
- Twitter cards on articles (summary_large_image)
- Per-URL data in SEO inventory

## 26. Analytics

- GA4: G-FT34HGFRWM (+ G-6JX26B9RDG — verify duplication)
- **Details:** `audit/tracking/tracking-inventory.md`

## 27. Google Tag Manager

- **Container:** GTM-WV7G52L
- Plugin: GTM4WP active

## 28. Google Ads / Conversion Tracking

- No AW- tags in homepage HTML; may load via GTM — **requires GTM container export for full inventory**

## 29. Meta Pixel

- Not detected in homepage HTML

## 30. Search Console Verification

- Not determined from read-only audit — check WP admin / DNS separately

## 31. Scripts / Third-party Integrations

- **Inventory:** `audit/tracking/third-party-integrations.md`

## 32. Performance

- Lightweight baseline only (no load testing)
- Elementor + multiple scripts detected
- **Details:** `audit/performance/current-baseline.md`

## 33. Mobile / Responsive Behavior

- Elementor responsive layouts; floating WhatsApp/phone CTAs on mobile
- Visual verification required before migration

## 34. Special Functionality

- Elementor forms, FAQ schema sections, price tables, Google Reviews widget, accessibility overlay, search (SearchAction schema)
- **Details:** `audit/content/special-functionality.md`

## 35. WordPress REST API Findings

- Full pagination completed for pages, posts, media, categories, tags
- Yoast fields exposed via `yoast_head_json` on content items
- Plugins/themes endpoints accessible with application password

## 36. Server / FTP Findings

- Read-only theme/plugin directory inventory complete
- .htaccess redirect rules exist (content not stored)
- **Details:** `audit/server/ftp-inventory.md`

## 37. Migration Risks

**Top risks:** `audit/reports/MIGRATION_RISKS.md`

## 38. Items Requiring Manual Review

- Form email routing and success redirects
- Archive/indexation strategy (categories, tags, dates, pagination)
- Test 404 pages (`/שגיאה-404-1`, `/שגיאה-404-2`)
- GTM container full tag list
- Google Site Kit (installed on FTP, inactive in REST)
- Contact link format standardization
- Duplicate GA4 measurement IDs

## 39. Proposed Next.js Route Map

- **Authoritative contract:** `audit/reports/URL_CONTRACT.md` + `audit/reports/url-contract.json`
- **70 URLs** preserve exact path (**CONFIRMED**)
- **3 pagination URLs** need redirect/canonical strategy (**REQUIRES HUMAN DECISION**)
- Trailing-slash 301 behavior must be replicated (**CONFIRMED** sitewide pattern)

## 40. Redirect Map

- Trailing-slash normalization must be replicated in Next.js/hosting
- **Current map:** `audit/seo/redirect-map-current.md`
- Full redirect map to be finalized during implementation phase

## 41. Pre-Cutover Validation

- [ ] All 70 sitemap URLs return 200 with matching titles/descriptions/canonicals
- [ ] All 16 articles render complete content
- [ ] All 16 form types submit correctly (staging)
- [ ] GTM/GA4 firing verified
- [ ] Internal link spot-check (broken 202 resolved or redirected)
- [ ] Schema validation on key templates
- [ ] Mobile visual parity check

## 42. Post-Cutover Validation

- [ ] Search Console URL inspection sample
- [ ] Sitemap resubmission
- [ ] Form lead test (controlled)
- [ ] Analytics real-time verification
- [ ] 301/404 monitoring for 30 days
- [ ] Core Web Vitals comparison vs baseline
