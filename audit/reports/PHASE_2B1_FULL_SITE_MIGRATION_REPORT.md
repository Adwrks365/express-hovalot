# Phase 2B.1 — Full Site Migration Foundation Report

Generated: 2026-10-07

**Status: INCOMPLETE** — core migration foundation is implemented; two URL-contract entries and several validation gates remain open.

---

## Executive summary

Phase 2B.1 establishes the full-site migration architecture on top of the frozen Phase 2A.20 homepage. The app now serves **71 of 73** URL-contract paths at HTTP 200 locally. All **44 WordPress pages** and **16 posts** from audit content are wired through a shared inner-page system with WordPress HTML sanitization, breadcrumbs, SEO metadata, and archive routes.

The homepage (`/`) was **not modified** in this phase.

---

## A. URL contract

| Metric | Count |
|--------|------:|
| Total URL contract entries | 73 |
| Sitemap members | 70 |
| Preserve-exact (200) | 70 |
| Redirect variants (301) | 3 |

Inventory: `audit/reports/PHASE_2B_SITE_INVENTORY.md`, `audit/reports/phase-2b-site-inventory.json`

---

## B–G. Routes, content, redirects, exclusions

| Metric | Count | Status |
|--------|------:|--------|
| Routes implemented (excl. homepage) | 72 | PASS |
| Homepage | 1 | ALREADY_IMPLEMENTED (frozen) |
| WordPress pages migrated | 44 / 44 | PASS |
| WordPress posts migrated | 16 / 16 | PASS |
| Archive routes (category/tag/author) | 8 | PASS |
| Archive pagination (/page/2/) | 3 | PASS (Pages Router hybrid) |
| Redirect rules documented | 3 | PASS (`audit/reports/REDIRECT_MAP.md`) |
| EXCLUDE / MANUAL_DECISION | 2 | OPEN — see §AN |

### Migration status breakdown

| Status | Count |
|--------|------:|
| MIGRATE_EXACT | 59 |
| MIGRATE_TEMPLATE | 8 |
| ALREADY_IMPLEMENTED | 1 |
| REDIRECT | 3 |
| MANUAL_DECISION | 2 |

---

## H–K. Sitemap

| Metric | Count |
|--------|------:|
| Production sitemap URL count | 70 |
| New sitemap URL count (scaffold) | 70 |
| Exact-match (indexable) | 70 |
| Intentional differences | 0 |

Sitemap generator: `src/app/sitemap.ts` (from URL contract)

---

## L–N. Content parity

Automated content parity (59 pages + posts, homepage excluded):

| Metric | Count |
|--------|------:|
| Compared | 59 |
| PASS | 59 |
| REVIEW | 0 |
| FAIL | 0 |

Report: `audit/reports/phase-2b-content-parity.json`

Content is rendered from verbatim audit HTML via `sanitizeWordPressHtml()` — no summarization or rewriting.

---

## O–R. Media

| Metric | Count |
|--------|------:|
| Media map entries | 192 |
| Successfully downloaded | 178 |
| Failed downloads (audit) | 14 |
| Broken media in local crawl | 0 (img src audit) |
| Remote WordPress dependencies in rendered pages | Some unmapped `/wp-content/` refs may remain in HTML where media-map has no entry |

Media rewriting: `src/lib/media.ts` + `wp-html.ts`

---

## S–V. Internal links

| Metric | Count | Status |
|--------|------:|--------|
| Internal links normalized in content pipeline | Yes | PASS |
| Full local link-graph reconciliation | — | NOT RUN |
| Broken internal links (automated gate) | — | INCOMPLETE |

Internal production URLs in migrated HTML are rewritten to canonical local paths in `wp-html.ts`. Full graph comparison against `audit/links/internal-link-reconciliation.json` is deferred.

---

## W–Y. Metadata / canonical / robots

| Metric | Status |
|--------|--------|
| Per-route Yoast metadata preserved | PASS (from audit JSON) |
| Canonical host | `https://express-hovalot.co.il` |
| Preview noindex | Preserved via `isPreviewNoIndex()` |
| Archive SEO | PASS (category/tag/author) |

---

## Z. Schema

| Type | Where |
|------|-------|
| Organization / WebSite | Root layout (unchanged) |
| Article | Post routes via `articleSchema()` |
| BreadcrumbList | `Breadcrumbs` component |
| FAQPage | Homepage only (unchanged) |

Yoast `@graph` is not duplicated wholesale.

---

## AA–AD. Page type coverage

| Type | Migrated | Notes |
|------|:--------:|-------|
| Service pages | Yes | Template: `StandardPageLayout` + classification |
| Location/area pages | Yes | Same pipeline, location classification |
| Static/company/utility | Yes | about, contact, legal, site-map, etc. |
| Articles (16) | Yes | Full HTML preserved |
| Blog index (`/blog/`) | Yes | |
| Archives | Yes | App Router + Pages Router for `/page/2/` |

---

## AE. Archive handling

Per Phase 1.5 / URL contract:

- Categories (4), tags (3), author (1): **PRESERVED**
- Pagination page 2 (3 URLs): **PRESERVED** via hybrid `src/pages/**/page/2/index.tsx` (App Router cannot serve `/page/N/` paths — Next.js reserved segment conflict)
- Non-trailing-slash variants: **301** via `trailingSlash: true`

---

## AF. Homepage regression

| Check | Result |
|-------|--------|
| Homepage source files modified | **NO** |
| Shared Header/Footer modified | **NO** |
| Phase 2A.20 automated QA re-run | Not against prod build on :3000 — script uses :3129 |

**Recommendation:** Compare against `audit/screenshots/phase-2a20/` before cutover.

---

## AG. Header/footer links

Navigation config unchanged (`src/config/navigation.ts`). Footer links point to migrated Hebrew routes. Full footer link crawl not yet automated.

---

## AH–AJ. Quality gates

| Gate | Result |
|------|--------|
| `npm run lint` | **PASS** |
| `npx tsc --noEmit` | **PASS** |
| `npm run build` | **PASS** (79 static pages) |

---

## AK. Full-site crawl

Local crawl (`audit/reports/local-full-site-crawl.json`):

| Metric | Count |
|--------|------:|
| URLs crawled | 73 |
| HTTP 200 | 71 |
| Errors | 2 |

---

## AL. Zero-broken-link gate

| Check | Result |
|-------|--------|
| Expected migrated routes 404 | **2 FAIL** (404 template pages — MANUAL_DECISION) |
| Internal links broken | INCOMPLETE (graph not crawled) |
| Sitemap URLs non-200 | 2 (same 404 pages) |
| Redirect destinations broken | PASS |

---

## AM. Zero-broken-media gate

| Check | Result |
|-------|--------|
| Broken images in crawl | **0** |
| Unmapped wp-content refs | Possible — needs per-page media audit |

---

## AN. Remaining human decisions

1. **`/שגיאה-404-1/`** and **`/שגיאה-404-2/`** — Elementor 404 template pages in sitemap; excluded from content import; currently **404 locally**. Options: migrate as-is, redirect to branded `not-found`, or noindex/remove from sitemap.
2. Tag archives marked **MANUAL DECISION** in Phase 1.5 archives inventory — implemented as indexable per URL contract.

---

## AO. Remaining migration blockers

- Internal link graph validation (§17)
- Media validation pass for all rendered routes (§15)
- Forms functional migration (§25) — UI preserved, delivery not implemented
- Production cutover / DNS — **out of scope**

---

## AP. Production safety

**Confirmed:** No WordPress, DNS, uPress, or production changes were made. This phase is local/preview only.

---

## Architecture delivered

```
src/
  app/
    page.tsx              # Homepage (FROZEN — Phase 2A.20)
    [...slug]/page.tsx    # All Hebrew pages + posts
    category/[slug]/      # Category archives
    tag/[slug]/           # Tag archives
    author/[slug]/        # Author archive
  pages/                  # Hybrid Pages Router for /page/2/ pagination only
  lib/
    content-registry.ts   # Route resolution + content lookup
    wp-html.ts            # Sanitization + link/media rewrite
    paths.ts              # Hebrew path normalization
    archives.ts           # Archive parsing
  components/content/
    InnerPageHero.tsx
    Breadcrumbs.tsx
    WordPressContent.tsx
    StandardPageLayout.tsx
    ArchivePageLayout.tsx
```

### Scripts added

- `npm run inventory:2b`
- `npm run redirects:2b`
- `npm run crawl:2b` (requires `npm run start`)
- `npm run reconcile:2b`
- `npm run parity:2b`

---

## Verdict

**Phase 2B.1 foundation: SUBSTANTIALLY COMPLETE, NOT CLOSED**

Core migration infrastructure, 60 content routes, 8 archive routes, 3 pagination routes, inventory, redirects documentation, and automated parity/crawl tooling are in place. Phase cannot be marked fully complete until the two 404 template URLs are decided and internal-link / media validation gates are run to zero.

**Do not deploy to production. Do not change DNS.**
