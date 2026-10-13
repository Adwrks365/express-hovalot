# URL Migration Contract

Generated: 2026-10-06

## Rules

1. **Default:** Preserve exact sitemap path (decoded Hebrew semantics, handle percent-encoding at HTTP layer)
2. **Trailing slash:** Canonical URLs use trailing slash for WordPress pages/posts — document and replicate
3. **Duplicate variants:** 301 to canonical, do not index separately

## Counts

- URLs requiring exact preservation (sitemap): **70**
- Redirect rules for variants: **3**

See `audit/reports/url-contract.json` for full machine-readable contract.
