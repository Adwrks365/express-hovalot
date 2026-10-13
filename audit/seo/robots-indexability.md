# Robots & Indexability Audit

## robots.txt

- **URL:** https://express-hovalot.co.il/robots.txt
- **Status:** 200
- **Content:** `User-agent: *` / `Disallow:` (empty — no disallow rules)
- **Sitemap reference:** Points to Yoast sitemap index

## Crawl Indexability Summary

| Metric | Count |
|--------|-------|
| Total URLs crawled | 205 |
| HTTP 200 | 203 |
| HTTP 404 | 1 |
| Indexable (meta robots) | 74 |
| Noindex | 129 |
| Trailing-slash 301 before 200 | 97 |

## Noindex Breakdown

Most noindex URLs are **non-primary surfaces** discovered via internal links:
- Encoded-path duplicates of indexable content
- Date-based archives (`/2026/05/`, etc.)
- Pagination (`/category/.../page/2`)
- Utility paths (`/cdn-cgi/...`)

**Primary SEO URLs (Yoast sitemap):** 70 URLs — all returned 200 in crawl.

## Canonical Behavior

- Yoast canonical tags present on indexable content pages
- Trailing-slash normalization via 301 is sitewide behavior
- Hebrew slug URLs may appear in both encoded and decoded forms — canonical tags generally point to trailing-slash Hebrew form

## Contradictions Flagged

- Review: some crawled page variants marked noindex while sitemap canonical URL is indexable (duplicate path variants)
- Sitemap includes category/tag/author archives — verify intentional indexation strategy
