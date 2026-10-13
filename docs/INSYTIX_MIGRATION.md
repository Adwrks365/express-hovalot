# Insytix Migration Strategy

## Current WordPress behavior (audit)

| Item | Status |
|------|--------|
| Plugin | `insytix-site-analytics` v2.4.3 (active) |
| Detection | Present on sampled pages alongside GTM/GA4 |
| Events | Page views inferred; lead/form events **UNKNOWN** without plugin source review |
| Site ID | **UNKNOWN** — must be extracted from rendered HTML or plugin settings (read-only) |

## Human requirement

Insytix must be preserved in the new site. Do **not** copy the WordPress plugin blindly.

## Phase 2A approach

1. `InsytixScript.tsx` — loads only when `NEXT_PUBLIC_INSYTIX_ENABLED=true` AND `NEXT_PUBLIC_INSYTIX_SITE_ID` is set
2. **No production events** fired during Phase 2A
3. Placeholder inline script until official Insytix embed/API is confirmed

## Next.js integration plan

1. **Discovery (read-only):** Fetch homepage HTML from production; locate Insytix script URL, site/project ID, and any `data-*` attributes
2. **Event map:** Document pageview vs conversion/lead events; compare with GTM (GTM excluded from new site)
3. **Implementation:** Use `next/script` with `strategy="afterInteractive"`; fire pageviews on App Router navigations via lightweight client helper if required
4. **Forms:** Hook contact form success to Insytix lead event only after event names confirmed
5. **Privacy:** No credentials in client bundle beyond public site ID

## Environment

```
NEXT_PUBLIC_INSYTIX_SITE_ID=
NEXT_PUBLIC_INSYTIX_ENABLED=false
```

## Open items for human review

- Confirm canonical Insytix site ID from production or Insytix dashboard
- Confirm whether Insytix replaces or duplicates GA4 for business reporting
- Approve script enablement before cutover testing
