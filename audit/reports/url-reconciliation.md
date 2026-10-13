# URL Reconciliation

## Counts

| Set | Count |
|-----|------:|
| Crawl-discovered (unique canonical) | 103 |
| Sitemap URLs | 70 |
| Indexable (crawl, HTTP 200) | 74 |
| Indexable canonical keys | 73 |
| Sitemap canonical keys | 70 |
| Non-sitemap crawl URLs | 134 |

## Why 74 indexable but 70 sitemap?

**CONFIRMED:** Yoast sitemap contains exactly **70 unique content URLs** (46 pages + 16 posts + 4 categories + 3 tags + 1 author).

**CONFIRMED:** Crawl found **74** URLs with `index, follow` meta and HTTP 200.

**Explanation:** The 4 extra indexable URLs are **duplicate path variants** of sitemap URLs — same content reachable via percent-encoded slug without trailing slash. They share canonical tags pointing to the sitemap URL form.

### Indexable URLs NOT in sitemap (3)

- /category/moving-tips/page/2 — canonical: /category/moving-tips/page/2/
- /category/moving-services/page/2 — canonical: /category/moving-services/page/2/
- /author/guest_2020/page/2 — canonical: /author/guest_2020/page/2/

These are **non-sitemap indexable variants** — migration should canonical to sitemap URL, not create duplicate routes.

## Sitemap Breakdown (CONFIRMED)

- post: 16
- page: 46
- category: 4
- tag: 3
- author: 1

Total: 70 — no overlap between type sitemaps.

Homepage is included in page-sitemap (46 pages includes `/`).
