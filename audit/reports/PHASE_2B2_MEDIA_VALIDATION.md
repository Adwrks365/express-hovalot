# Phase 2B.2 Media Validation

Generated: 2026-10-07

## Summary

| Classification | Count |
|----------------|------:|
| **Total assets in map** | **192** |
| Mapped + local file OK (required / in use) | 178 |
| Unmapped — source HTTP 404 (legacy unused) | 14 |
| Missing local file | 0 |
| Duplicate entries | 0 (deduped at map level) |
| Inaccessible source (404 at crawl time) | 14 |
| Truly missing required by migrated content | 0 |

## 178 mapped OK

All 178 assets with `localPath` resolve to files under `public/media/`. These cover featured images, inline article/service images, icons, logos, and homepage-adjacent assets referenced by migrated pages.

## 14 unmapped (legacy unused)

Source URLs return HTTP 404 on production WordPress. These are superseded homepage/mobile background variants and old bullet/image assets — not referenced by migrated indexable content after HTML rewrite:

| ID | Source (404) |
|----|--------------|
| 2927 | hp_mobile_images_bg_3.webp |
| 2923 | hp_mobile_images_bg_2.webp |
| 2918 | hp_mobile_images_bg_1-1.webp |
| 2916 | hp_mobile_images_bg_1.webp |
| 2884 | new_bullets.webp |
| 2880 | bullets.webp |
| 2836 | hp_pic3_new.webp |
| 2808 | hp_pic3.webp |
| 2763 | hp_pic2.webp |
| 2752 | small_images.webp |
| 2722 | small_image_3.webp |
| 2721 | small_image_2.webp |
| 2720 | small_image_1.webp |
| 2708 | hp_pic1-1.webp |

**Human decision:** Accept as legacy unused — no migration action required unless homepage asset audit later requests them.

## Rendered page sample (40 contract URLs)

Sample crawl of first 40 indexable pages found **71 `<img>` references** still containing `wp-content/uploads` strings in raw HTML output. Investigation shows these primarily originate from:

- Homepage Phase 2A.20 frozen markup (intentionally not rewritten)
- JSON-LD / meta `og:image` URLs in `<head>` (not body content images)
- A subset of inline content images on pages not yet re-served from rebuilt production server

Migrated body content images processed through `sanitizeWordPressHtml()` are rewritten to `/media/{id}-*` paths.

## Alt text

Alt text preserved from source map where available. Article featured images use record title as fallback alt in templates.

## JSON artifact

Full file checks: `audit/reports/phase-2b2-media-validation.json`
