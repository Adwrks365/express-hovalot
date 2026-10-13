# PHASE 2C.1 — Contextual Lead Popup Report

Local only — no deploy, no WordPress/DNS/production email/analytics changes.

## A. Architecture

- Root `layout.tsx` mounts a single `ContextualPopupProvider` (App Router).
- Legacy Pages Router `_app.tsx` wraps the same provider for `/page/N` archive URLs.
- Pages register context via `ContextualPopupRegistrar` / `PopupPageRegistrar` / `PopupHomeRegistrar` / `PopupArchiveRegistrar`.
- UI: lazy `ContextualLeadPopup` (modal) + `MinimizedLeadCta` (bottom-center pill).
- Logic lives under `src/lib/popups/`; UI under `src/components/popups/`.

## B. Provider

`ContextualPopupProvider` owns modal open state, open method, pill visibility, auto triggers (scroll + dwell timer), conversion/form/a11y suppression, session + localStorage cooldowns, and document-level `[data-open-contextual-popup]` handlers.

## C. Context map

See `audit/reports/PHASE_2C1_POPUP_CONTEXT_MAP.md` (generated from `pages.json` + `posts.json`).

## D. Messaging

Hebrew bundles per context in `src/lib/popups/messaging.ts` (`moving-general`, apartment, small moves, office, storage, packing, crane, jerusalem-area, price-quote, article, general). Area headlines adapt from page title via `areaHeadlineFromTitle`.

## E. Trigger strategy

| Profile | Scroll | Dwell |
| --- | --- | --- |
| service / home / area / storage | 50% | 40s |
| article | 60% | 55s |

OR logic — first satisfied condition opens (once per session, if not suppressed).

## F. Suppression logic

Auto-open blocked when: session already auto-shown; dismiss cooldown (3d); submit cooldown (30d); a11y panel open (`html[data-a11y-open]`); focus in `data-lead-form` / hero / final conversion / footer mini form; final conversion or homepage hero form ≥35% visible (IntersectionObserver); modal already open; route excluded.

## G. Session behavior

- `express_popup_auto_shown_session` — max one auto-open per browser session (all routes).
- `express_popup_shown_<path>` — optional per-path marker on auto-open.

## H. Persistence / cooldowns

- Dismiss (X / backdrop / ESC): `express_popup_dismissed_until` — 3 days (auto only).
- Successful submit: `express_popup_submitted_until` — 30 days; pill hidden.

## I. Modal UI

Express green gradient header, white body, gold CTA, ~460px max width, `role="dialog"` + `aria-modal="true"`, ESC/backdrop/X close, body scroll lock, focus into first field.

## J. Minimized CTA

Bottom center (`z-[55]`), green gradient + gold accent, copy: **קבלו הצעת מחיר** / **מהירה וללא התחייבות**. Pill X hides for current path only (no extra cooldown).

## K. Form payload

`POST /api/contact` with `formType` + `formId`: `contextual-popup`, plus `popupContext`, `pageTitle`, `pagePath`, `openMethod`. Required: name + phone; optional details on desktop. Stub still returns `emailSent: false`.

## L. Accessibility

Dialog labelling, ESC, focus trap into form, reduced-motion respected (pill animation disabled). A11y widget sets `data-a11y-open` on `<html>` while open.

## M. Mobile

Modal max-height `92dvh`, internal scroll; simplified fields on small screens; pill positioned above mobile main padding (`bottom-[4.75rem]`).

## N. Floating-control collisions

Modal overlay `z-[80]`; FABs `z-[60]`; pill `z-[55]` centered — corners remain phone/WhatsApp/a11y/scroll-top.

## O. Article integration

Sidebar **השאירו פרטים** uses `ContextualPopupTrigger` (`in_content_cta`). Editorial links unchanged.

## P. Internal-link SEO safety

Only explicit lead CTAs use popup triggers; pricing/editorial links remain normal `<Link>`/`href` navigation.

## Q. Analytics event interface

`src/lib/popups/analytics.ts` — `popup_view`, `popup_close`, `popup_submit`, `popup_minimized_cta_view`, `popup_minimized_cta_click` with `popup_id`, `popup_context`, `page_path`, `open_method` (no PII).

## R. Screenshots

`audit/screenshots/phase-2c1-popup/` — desktop modal, minimized pill, mobile 390 (Playwright QA).

## S. Lint

`npm run lint` — pass (run with build).

## T. TypeScript

`npx tsc --noEmit` — pass.

## U. Build

`npm run build` — pass (79 App routes + legacy archive pages).

## V. Remaining before real email delivery

- Enable `CONTACT_EMAIL_ENABLED` + recipients in a dedicated Phase 2C email task.
- Optional: wire GA4 to `dataLayer` pushes from `trackPopupEvent`.
- Optional: expand manual `ContextualPopupTrigger` on selected service CTAs after UX review.

## QA automation

- `node scripts/phase-2c1-popup-context-map.mjs`
- `node scripts/phase-2c1-popup-qa.mjs` (requires `http://localhost:3010`)

---

**STOP** — human review before deploy or production email/analytics.
