# Phase 2B.4C — Runtime Verification Note

Generated: 2026-10-07T13:05:00Z

## Production server on port 3010

| Field | Value |
|-------|-------|
| **Port** | 3010 |
| **PID** | 43852 (`next-server` via `npx next start -p 3010`) |
| **Shell PID** | 44512 |
| **Startup time** | 2026-10-07T13:01:35Z (Ready in 121ms) |
| **Build mode** | production (`next build` + `next start`) |
| **BUILD_ID** | `UhSWSfEzZ0spotGqyM6z0` |
| **`.next` rebuilt** | Yes — stale `.next` removed before build |
| **Git commit** | unavailable (repo detection incomplete, `git rev-parse` exit 128) |

## Clean rebuild steps performed

1. Identified and stopped prior listener on 3010 (PID 39192).
2. Deleted `.next/` (build output only — no source/audit data removed).
3. Ran `npm run build` — **PASS**.
4. Started `npx next start -p 3010` — single listener confirmed via `netstat`.

## Verification command

```bash
node scripts/phase-2b4c-runtime-verify.mjs
```

Base URL: `http://localhost:3010`

## Debug markers (temporary, DOM-only)

Added to `InternalPageShell.tsx`:

- `data-page-archetype`
- `data-renderer` (`ArchetypePageRenderer` | `StructuredPageRenderer` | `WordPressContent`)
- `data-raw-fallback`
- `data-structured-block-count`
- `data-semantic-block-types`

Section-level: `data-section-type` on `ArchetypePageRenderer` blocks.

No visible debug text is rendered.
