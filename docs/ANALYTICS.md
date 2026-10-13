# Analytics Decisions (Phase 2A)

## NOT migrated (human-approved)

| ID | Reason |
|----|--------|
| GTM-WV7G52L | Legacy container — excluded per migration decision |

## Documented but NOT deployed

| ID | Source | Notes |
|----|--------|-------|
| G-FT34HGFRWM | gtag.js / GTM | Primary GA4 candidate — **no script added** |
| G-6JX26B9RDG | Secondary load | Likely duplicate page_view — **no script added** |

## Preserved (scaffold only)

| System | Status |
|--------|--------|
| Insytix | Scaffold in `InsytixScript.tsx`; disabled until `NEXT_PUBLIC_INSYTIX_ENABLED=true` |

## Phase 2A confirmation

- Legacy GTM migrated: **NO**
- Duplicate GA4 added: **NO**
- Production analytics events intentionally generated: **NO**

## Human review required before cutover

1. Which GA4 property is canonical for business reporting?
2. Should any GA4 be deployed without GTM, or only Insytix?
3. Form conversion events — map to Insytix, GA4, or both?
