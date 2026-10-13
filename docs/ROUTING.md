# URL & Routing Strategy

## Authority

- `audit/reports/url-contract.json`
- `audit/reports/URL_CONTRACT.md`

## Trailing slashes

```ts
// next.config.ts
trailingSlash: true
```

Next.js will serve `/path/` as canonical. Avoid linking to bare `/path` in internal navigation.

## Hebrew paths

- Slugs remain Hebrew UTF-8 (not transliterated)
- Next.js App Router accepts Unicode segment folders when implemented
- Phase 2A: dynamic catch-all or per-slug routes deferred — homepage only live

## Excluded URLs

Do not create 200 pages for:

- `/שגיאה-404-1/`
- `/שגיאה-404-2/`

Use `src/app/not-found.tsx` for genuine 404s.

## Sitemap

`sitemap.ts` generates entries from URL contract. Pages not yet implemented may 404 locally until Phase 2B — sitemap reflects **target** production URLs.
