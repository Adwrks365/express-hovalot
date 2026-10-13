# PHASE 2C.3 — Vercel Project + First Production Deployment

Generated: 2026-10-09

## Pre-deploy safety

| Check | Result |
| --- | --- |
| `npm run lint` | Pass |
| `npx tsc --noEmit` | Pass |
| `npm run build` | Pass |
| `.env.local` in `.gitignore` | Yes |
| `.vercel/` in `.gitignore` | Yes (added this phase) |

## Vercel CLI

- **CLI:** 63.1.0 (`npx vercel`)
- **Authenticated as:** `info-88828003` (team **adwrks**)

## Project link

| Field | Value |
| --- | --- |
| Project name | `express-hovalot` |
| Project ID | `prj_yI18KaVVA4T6OyS44vcIgq6X6c9R` |
| Org/Team ID | `team_6RQeL7XWmMHGu9dZ8mvEGBOd` |
| Local link file | `.vercel/project.json` |

**New project created** (no duplicate). Custom domain **not** connected.

## Framework (Vercel auto-detect)

- **Framework:** Next.js 16.3.8
- **Build command:** `npm run build`
- **Output:** Next.js default (zero-config)

## Environment variables — inventory

| Variable | Used by | Build? | Runtime? | Secret? | On Vercel? |
| --- | --- | --- | --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | canonical/metadata | yes | yes | no | not uploaded (defaults to express-hovalot.co.il in code) |
| `NEXT_PUBLIC_PREVIEW_NOINDEX` | optional static flag | yes | yes | no | not required — host-based noindex added |
| `CONTACT_RECIPIENTS` | `/api/contact` | no | yes | semi | not uploaded |
| `CONTACT_EMAIL_ENABLED` | `/api/contact` | no | yes | no | not uploaded (stub remains) |
| `NEXT_PUBLIC_INSYTIX_*` | analytics | yes | yes | no | not uploaded (disabled) |
| `WP_*` / `FTP_*` | migration scripts only | no | no | yes | **not uploaded** |
| `RESEND_*` | n/a yet | — | — | — | **not configured** |

No secrets from `.env.local` were bulk-uploaded to Vercel.

## Preview indexing safety (implemented this phase)

For **`*.vercel.app`** hostnames only:

- `src/middleware.ts` → `X-Robots-Tag: noindex, nofollow`
- Dynamic `robots.txt` → `Disallow: /`
- Root `generateMetadata` → `robots: noindex, nofollow`

**`express-hovalot.co.il` is explicitly excluded** from preview noindex logic.

Verified on production alias: homepage response includes `X-Robots-Tag: noindex, nofollow`.

Canonicals remain `https://express-hovalot.co.il/...` (acceptable for review).

## Deployment

| Field | Value |
| --- | --- |
| Deployment ID | `dpl_9sLSWjU4HVF73ivnwaogCSatjjD1` |
| Deployment URL | https://express-hovalot-3qt1345lv-adwrks.vercel.app |
| **Production alias** | **https://express-hovalot.vercel.app** |
| Status | **READY** |
| Inspector | https://vercel.com/adwrks/express-hovalot/9sLSWjU4HVF73ivnwaogCSatjjD1 |

## Deployment protection

Project has **Vercel Authentication** on deployments. Browsers may require team login unless protection is relaxed in project settings. CLI verification uses `vercel curl` (bypass token).

## Route verification

Homepage verified via `vercel curl -I`: **HTTP 200** + noindex header.

Full automated status matrix: run `vercel curl` per route from a logged-in CLI session, or temporarily adjust Deployment Protection for stakeholder review.

Expected:

- Commercial pages, FAQ, contact, quote, article, sitemap, robots → **200**
- Legacy test `/שגיאה-404-1/` → **404**
- Unknown path → **404**

## Upload optimization

Added `.vercelignore` to exclude `/audit/`, `/migration/private/`, `/tmp/` (first deploy attempted ~1.2GB before ignore).

## Intentionally inactive on Vercel

- Email delivery (`CONTACT_EMAIL_ENABLED` not set → stub API)
- Resend (not configured)
- Insytix analytics (disabled)

## DNS / WordPress

- **No DNS changes**
- **WordPress / uPress unchanged**
- **No custom domain on Vercel**

## Next steps (human)

1. Open https://express-hovalot.vercel.app (may need Vercel login or disable Deployment Protection for external reviewers).
2. Visual QA on Vercel URL.
3. When ready for cutover only: add `express-hovalot.co.il` in Vercel + DNS (separate phase).
