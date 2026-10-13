# Migration Audit — express-hovalot.co.il

## Production WordPress Site

**https://express-hovalot.co.il/** is the current production WordPress website.

The existing WordPress website is the **source of truth** during migration planning and execution.

## Read-Only Audit Policy

Initial audit access is **strictly read-only**.

During the audit phase:

- **No production modifications** are allowed.
- **No URLs** may be changed without an explicit migration decision.
- **No domain or DNS changes** are allowed during audit or build phases.
- **No production cutover** is allowed until URL, content, media, SEO, links, forms, and tracking reconciliation passes.

## Content and SEO Preservation

- Existing **indexed URLs** should be preserved whenever technically possible.
- Existing **content** must not be rewritten automatically during migration.
- Existing **articles** must be preserved in full.
- Existing **internal links** must be inventoried and preserved.
- Existing **images and media** must be inventoried.
- Existing **SEO metadata** must be inventoried.
- Existing **schema** (structured data) must be inventoried.
- Existing **forms** and their behavior must be inventoried.
- Existing **analytics and tracking** must be inventoried.

## Cutover Requirements

- WordPress must remain **live** until the replacement site passes migration validation.
- Pre-cutover and post-cutover validation checklists must pass before any DNS or domain changes.

## Directory Structure

| Directory | Purpose |
|-----------|---------|
| `audit/public/` | Public-facing page snapshots and URL inventory |
| `audit/wordpress/` | WordPress REST API and CMS findings |
| `audit/server/` | Server and FTP read-only findings |
| `audit/seo/` | SEO metadata, canonicals, robots, sitemaps |
| `audit/content/` | Pages, posts, taxonomies |
| `audit/media/` | Images and media inventory |
| `audit/links/` | Internal and external link maps |
| `audit/forms/` | Forms and CTA behavior |
| `audit/tracking/` | Analytics, GTM, pixels, conversion tags |
| `audit/performance/` | Performance baseline measurements |
| `audit/reports/` | Generated audit reports |
| `audit/private/` | Local-only sensitive data (gitignored) |

## Security

- Credentials belong in `.env.local` only (never committed).
- All production access must be read-only until explicitly authorized for cutover.
