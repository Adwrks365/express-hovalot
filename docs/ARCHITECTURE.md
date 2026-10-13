# Express Hovalot — Next.js Architecture (Phase 2A)

## Stack

- **Next.js 16** App Router, TypeScript strict, Tailwind CSS
- **RTL-first**: `lang="he"` `dir="rtl"` on `<html>`
- **Server Components** by default; client only for nav, forms, FAQ, calculator

## Directory layout

```
src/
  app/           # Routes (homepage + API + robots/sitemap)
  components/    # UI, layout, home sections, forms, tracking
  config/        # Navigation from audit
  content/       # Migrated JSON (pages, posts, media map, homepage)
  lib/           # SEO, schema, media resolver, env helpers
scripts/         # import-content, download-media, validate-migration
public/media/    # 192 WordPress assets (local copies)
audit/           # Phase 1/1.5 source of truth (read-only evidence)
```

## Content model

WordPress is the **migration source**, not runtime CMS.

- `src/content/data/pages.json` — 44 pages (excludes 404 test pages)
- `src/content/data/posts.json` — 16 articles
- `src/content/data/url-contract.json` — authoritative URL list
- `src/content/media-map.json` — WP URL → `/media/...` mapping

Content is imported verbatim via `npm run import:content`. No rewriting in scripts.

## Routing

- `trailingSlash: true` in `next.config.ts` — matches production WordPress behavior
- Hebrew slugs preserved exactly per `audit/reports/url-contract.json`
- Phase 2A: only `/` visually implemented; other paths will 404 until Phase 2B+

## SEO

- Per-page metadata via `buildMetadata()` in `src/lib/seo.ts`
- JSON-LD: Organization, WebSite (layout), FAQPage (homepage)
- `robots.ts` / `sitemap.ts` scaffolded from URL contract
- Preview: `NEXT_PUBLIC_PREVIEW_NOINDEX=true` blocks indexing

## Forms

- `POST /api/contact` — validates server-side, honeypot, no email in Phase 2A
- Recipients from `CONTACT_RECIPIENTS` env (not hardcoded in components)
- `CONTACT_EMAIL_ENABLED=false` until mail provider configured

## Analytics

- **GTM-WV7G52L**: NOT migrated (human-approved legacy exclusion)
- **GA4**: documented only; no scripts added (duplicate ID risk)
- **Insytix**: scaffold in `InsytixScript.tsx`; see `docs/INSYTIX_MIGRATION.md`

## Performance

- Heebo font via `next/font` with `display: swap`
- `next/image` for local `/media` assets with sizes/priority on hero
- Minimal client JS: header mobile nav, forms, FAQ accordion, calculator UI
