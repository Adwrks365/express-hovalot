# PHASE 2C.0 — Pre-Cutover SEO Parity Report

Generated: 2026-10-09T05:57:26.005Z

**Scope:** Read-only production crawl vs `http://localhost:3010`. No DNS/deploy/WordPress changes.

## A. URL parity

- Production sitemap URLs: **70**
- Union crawl (sitemap + URL contract): **73**
- Path preservation: Hebrew slugs unchanged; Next.js `trailingSlash: true`.

## B. Status-code parity

Production vs local status mismatches (excluding documented 404 templates): see `PRECUTOVER_SEO_ACCEPTANCE_MATRIX.json`.

Legacy test templates `/שגיאה-404-1/`, `/שגיאה-404-2/`: must **not** ship as indexable content locally (local 404 = intentional).

## C. Canonical parity

Local canonicals must use `https://express-hovalot.co.il/` via `SITE_URL` (no localhost/Vercel in production build).

## D. Sitemap parity

| Source | URL count |
| --- | --- |
| Production sitemap (live) | 70 |
| Local `/sitemap.xml` | 73 |

Local sitemap is contract-driven; reconcile diff in matrix `sitemap` fields. Exclude 404 templates and noindex URLs from launch sitemap.

## E. Robots parity

**Production robots.txt (excerpt):**
```

```

**Local robots.txt (excerpt):**
```

```

Preview builds with `NEXT_PUBLIC_PREVIEW_NOINDEX=true` disallow all — must **not** apply on production domain.

## F. Title / meta parity

Matrix columns `title`, `description`: EXACT | CHANGED | MISSING per URL.

## G. Content parity

Rendered main-scope word coverage vs production (popup/footer noise stripped on local). Threshold: 82% (inner pages), homepage may differ (redesign).

## H. Headings

Matrix includes production/local H1 arrays and local H1 count (target: exactly 1 visible H1).

## I. FAQ / tables / lists

Captured per URL in `PRECUTOVER_PRODUCTION_URLS.json` (`faqItems`, `tables`, `lists`).

## J. Media

Image URL lists per page in production crawl; compare counts in matrix. Broken media: run `phase-2b2-media-validation` if needed.

## K. Internal-link graph

Fresh graph: `PRECUTOVER_PRODUCTION_INTERNAL_LINK_GRAPH.json`  
Parity: `PHASE_2B7_INTERNAL_LINK_PARITY.json` (regenerated with `--refresh`).

Totals: {"productionLinks":9238,"localLinks":8948,"productionMeaningful":8910,"productionBody":912,"productionNavigation":3487,"productionFooter":4491,"productionBreadcrumb":8,"statusByBucket":{"body":{"EXCLUDED_INTENTIONAL":86,"EQUIVALENT":289,"EXACT":536,"CHANGED":1},"navigation":{"EXACT":3417,"EQUIVALENT":70},"footer":{"EXCLUDED_INTENTIONAL":136,"EXACT":4221,"EQUIVALENT":134},"breadcrumb":{"EQUIVALENT":8},"form":{"EXACT":12}},"status":{"EXCLUDED_INTENTIONAL":222,"EXACT":8186,"EQUIVALENT":501,"CHANGED":1},"localBrokenLinks":2,"malformedLocalHrefs":0,"noTrailingSlashLocalHrefs":0,"newLocalBodyLinks":81}

## L. Homepage links

Homepage classified separately (content coverage + intentional redesign). Verify important commercial paths via homepage matrix row.

## M. Orphan pages

See `inbound` in link parity JSON — pages with lost body inbound links.

## N. Redirects

Matrix `redirectChain` on each record; target ≤1 hop to trailing-slash canonical.

## O. Archive behavior

Category/tag/author archives in contract; date archives excluded. Pagination via Pages Router legacy URLs.

## P. Article parity

Articles in crawl set; body coverage via word parity + link graph `article` context.

## Q. Schema

`schemaTypes[]` per URL in production crawl export.

## R. OG / social

`og` object per URL in crawl JSON.

## S. Staging leakage

Flagged when canonical/OG contains localhost, 127.0.0.1, or vercel.app.

## T. 404 / soft-404

Unknown paths must HTTP 404 (not 200 homepage). Test via matrix + manual `/nonexistent-slug/`.

## U. Performance

Representative timing not automated in this pass — re-use Lighthouse on homepage, service, article before cutover.

## V. Final blockers

**BLOCKER count: 0**

_None — ready for human sign-off review._

## W. Cutover recommendation

**Conditional go** — complete human review of INTENTIONAL_EXCEPTION rows, then proceed to Phase 2C.2 (not in this task).

### Intentional exceptions (72)

- `https://express-hovalot.co.il/`: Homepage content coverage 84.0% (redesign — review)
- `https://express-hovalot.co.il/about-us/`: Title template differs (verify visible title parity)
- `https://express-hovalot.co.il/accessibility-statement/`: Title template differs (verify visible title parity)
- `https://express-hovalot.co.il/author/guest_2020/`: Title template differs (verify visible title parity); Content word coverage 75.8%; Semantic triage: STRUCTURAL_NORMALIZATION_ONLY
- `https://express-hovalot.co.il/author/guest_2020/page/2/`: Title template differs (verify visible title parity); Content word coverage 76.7%; Semantic triage: STRUCTURAL_NORMALIZATION_ONLY
- `https://express-hovalot.co.il/blog/`: Title template differs (verify visible title parity); Content word coverage 76.9%; Semantic triage: FALSE_POSITIVE
- `https://express-hovalot.co.il/category/moving-by-region/`: Title template differs (verify visible title parity); Content word coverage 72.4%; Semantic triage: STRUCTURAL_NORMALIZATION_ONLY
- `https://express-hovalot.co.il/category/moving-services/`: Title template differs (verify visible title parity); Content word coverage 72.7%; Semantic triage: STRUCTURAL_NORMALIZATION_ONLY
- `https://express-hovalot.co.il/category/moving-services/page/2/`: Title template differs (verify visible title parity); Content word coverage 71.0%; Semantic triage: STRUCTURAL_NORMALIZATION_ONLY
- `https://express-hovalot.co.il/category/moving-tips/`: Title template differs (verify visible title parity); Content word coverage 77.4%; Semantic triage: STRUCTURAL_NORMALIZATION_ONLY
- `https://express-hovalot.co.il/category/moving-tips/page/2/`: Title template differs (verify visible title parity); Content word coverage 65.5%; Semantic triage: STRUCTURAL_NORMALIZATION_ONLY
- `https://express-hovalot.co.il/category/prices-costs/`: Title template differs (verify visible title parity); Content word coverage 69.7%; Semantic triage: STRUCTURAL_NORMALIZATION_ONLY
- `https://express-hovalot.co.il/privacy-policy/`: Title template differs (verify visible title parity)
- `https://express-hovalot.co.il/site-map/`: Title template differs (verify visible title parity)
- `https://express-hovalot.co.il/tag/%D7%94%D7%95%D7%91%D7%9C%D7%95%D7%AA-%D7%91%D7%99%D7%A8%D7%95%D7%A9%D7%9C%D7%99%D7%9D/`: Title template differs (verify visible title parity); Content word coverage 71.4%; Semantic triage: STRUCTURAL_NORMALIZATION_ONLY
- `https://express-hovalot.co.il/tag/%D7%94%D7%95%D7%91%D7%9C%D7%95%D7%AA-%D7%A7%D7%98%D7%A0%D7%95%D7%AA/`: Title template differs (verify visible title parity); Content word coverage 71.0%; Semantic triage: STRUCTURAL_NORMALIZATION_ONLY
- `https://express-hovalot.co.il/tag/%D7%9E%D7%A2%D7%91%D7%A8-%D7%93%D7%99%D7%A8%D7%94/`: Title template differs (verify visible title parity); Content word coverage 71.0%; Semantic triage: STRUCTURAL_NORMALIZATION_ONLY
- `https://express-hovalot.co.il/terms-of-use/`: Title template differs (verify visible title parity)
- `https://express-hovalot.co.il/%D7%90%D7%97%D7%A1%D7%95%D7%9F-%D7%9E%D7%A9%D7%98%D7%97%D7%99%D7%9D/`: Title template differs (verify visible title parity)
- `https://express-hovalot.co.il/%D7%90%D7%97%D7%A1%D7%95%D7%9F-%D7%AA%D7%9B%D7%95%D7%9C%D7%94-%D7%91%D7%99%D7%A8%D7%95%D7%A9%D7%9C%D7%99%D7%9D/`: Title template differs (verify visible title parity)
- `https://express-hovalot.co.il/%D7%90%D7%97%D7%A1%D7%95%D7%9F-%D7%AA%D7%9B%D7%95%D7%9C%D7%94-%D7%9C%D7%98%D7%95%D7%95%D7%97-%D7%90%D7%A8%D7%95%D7%9A/`: Title template differs (verify visible title parity)
- `https://express-hovalot.co.il/%D7%90%D7%97%D7%A1%D7%95%D7%9F-%D7%AA%D7%9B%D7%95%D7%9C%D7%94-%D7%9C%D7%98%D7%95%D7%95%D7%97-%D7%A7%D7%A6%D7%A8/`: Title template differs (verify visible title parity)
- `https://express-hovalot.co.il/%D7%90%D7%97%D7%A1%D7%95%D7%9F-%D7%AA%D7%9B%D7%95%D7%9C%D7%AA-%D7%93%D7%99%D7%A8%D7%94/`: Title template differs (verify visible title parity)
- `https://express-hovalot.co.il/%D7%93%D7%A3-%D7%A0%D7%97%D7%99%D7%AA%D7%94/`: Title template differs (verify visible title parity); Content word coverage 64.7%; Semantic triage: STRUCTURAL_NORMALIZATION_ONLY
- `https://express-hovalot.co.il/%D7%94%D7%95%D7%91%D7%9C%D7%95%D7%AA-%D7%91%D7%90%D7%91%D7%95-%D7%92%D7%95%D7%A9/`: Title template differs (verify visible title parity)

### Link parity gaps

- MISSING body/breadcrumb links: **0**
- Broken local links: **2**

## Artifacts

| File | Purpose |
| --- | --- |
| `PRECUTOVER_PRODUCTION_URLS.json` | Fresh production crawl |
| `PRECUTOVER_PRODUCTION_INTERNAL_LINK_GRAPH.json` | Production link graph |
| `PRECUTOVER_SEO_ACCEPTANCE_MATRIX.json` | Per-URL acceptance |
| `PRECUTOVER_LAUNCH_MANIFEST.json` | Post-cutover verification manifest |

---

**STOP** — Human review required before production cutover. No Phase 2C.2 until sign-off.
