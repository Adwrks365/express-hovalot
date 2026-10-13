# Phase 2B.6 — Homepage Design System Extraction

Source: approved Next.js homepage (`src/app/page.tsx`, `src/components/home/**`, `tailwind.config.ts`, `src/lib/layout.ts`, `src/lib/ui-tokens.ts`).

---

## Layout & width

| Token | Value | Usage |
|-------|--------|--------|
| `layoutWidth.wide` | `max-w-[90rem]` (~1440px) | Outer shell |
| `layoutWidth.standard` | `max-w-[77.5rem]` (~1240px) | Most sections via `Container` |
| `layoutWidth.content` | `max-w-[62.5rem]` (~1000px) | FAQ, conversion, structured blocks |
| `layoutWidth.prose` | `max-w-[51rem]` (~816px) | Long-form prose |
| `layoutWidth.proseWide` | `max-w-[72rem]` | Wide intro copy |
| `pagePadding` | `px-4 sm:px-5 lg:px-8` | Horizontal rhythm |

Homepage hero uses `Container` with `lg:grid-cols-[1fr_275px]` and compact vertical padding (`py-7 lg:py-9`).

---

## Color palette

- **Brand greens:** `brand-50` `#f4faf4` through `brand-950` `#0a1f0a`; primary dark `#003405` (`brand-800`), header `#13330E` (`brand-700`).
- **Gold accent:** `accent` / `accent-500` `#CFBD1A`, hover `accent-dark` `#a89815`.
- **Surfaces:** white, `brand-50/45` muted sections, `neutral-50` alternate bands.
- **Hero overlay:** `bg-hero-gradient`, mobile green linear/radial overlays on imagery.

---

## Typography

- Font: Heebo (`--font-heebo`).
- Homepage hero H1: ~`2.25rem` mobile → `3.25rem` desktop, bold, white on dark.
- Section H2 (`sectionTitleClass`): `text-2xl sm:text-3xl font-bold text-brand-800`.
- Body: ~`1.0625rem`–`1.125rem`, line-height ~1.75–1.88 (`.rich-text`).
- Internal H2 in prose: `text-2xl` with `border-b border-brand-100`.

---

## Spacing

- Major sections: `sectionPad.normal` → `py-11 sm:py-14 lg:py-[4.5rem]` (~72–96px desktop).
- CTA bands: `sectionPad.cta` → `py-12 sm:py-16 lg:py-20`.
- Compact: `py-10 sm:py-12 lg:py-14`.
- Internal hero (2B.6 `ContentHero`): `heroPad.standard` → `py-9 sm:py-11 lg:py-[3.25rem]` (more compact than homepage hero).

---

## Radius, shadow, borders

- Buttons: `rounded-[14px]` (`ui-tokens.radius.button`).
- Cards / panels: `rounded-xl` / `rounded-2xl` / `rounded-3xl` for conversion shell.
- Shadows: `shadow-card`, `shadow-soft`, `shadow-elevated`.
- Images: `rounded-xl` / `rounded-2xl`, optional `border border-neutral-200/80`.

---

## CTA hierarchy

| Variant | Role |
|---------|------|
| `gold` | Primary quote / main action |
| `heroOutline` / `outlineDark` | Phone / secondary |
| `whatsapp` | WhatsApp |

Min touch height ~44–48px; homepage hero actions use `min-h-[44px]` and `rounded-[14px]`.

---

## Forms

- Hero form: white card `rounded-xl`, `ring-1 ring-white/80`, compact `QuoteForm variant="hero"`.
- Section form: white inner card, `QuoteForm variant="section"`, gold submit via `Button variant="gold"`.
- Inputs: ~`rounded-[10px]`, consistent height (form components).

---

## Section rhythm (homepage)

Typical flow: **Hero (dark + image)** → white / calculator jump → services → reviews → trust (dark gradient) → logos → about → FAQ → calculator → areas → **final CTA gradient band**.

Internal pages (2B.6): **ContentHero (compact dark)** → white → `brand-50/45` muted → white → neutral-50 → repeat; final conversion uses homepage-like **top border + gradient** when `inspired`.

---

## Motion (`ScrollReveal`)

- Variants: `heading`, `card`, `image`, `subtle`, slide start/end.
- CSS: fade + translate; disabled under `prefers-reduced-motion`.
- Phase 2B.6 enables `animate={true}` on reference pages for prose/image blocks only — not every paragraph.

---

## Trust / FAQ / stats

- **FAQ:** `FaqAccordion` + optional intro in `brand-50/60` ring card (homepage `FaqSection`).
- **Trust:** dark image + `trust-gradient` overlay (`TrustBlockSection`).
- **Stats / reviews:** card grids with homepage spacing (reference only when source contains data).

---

## Components mapped for internal pages

| Homepage reference | Internal primitive |
|--------------------|-------------------|
| `HeroSection` | `ContentHero` (compact, no duplicate form) |
| `ServicesSection` cards | `FeatureGridSection` / `FeatureCards` |
| `FaqSection` | `FaqSectionBlock` |
| `CtaSection` | `FinalConversionSection` (`inspired`) |
| `ClientLogosSection` | `LogoGridSection` |
| `ServiceAreasSection` | `AreaLinksSection` |

Homepage file remains **unchanged** — this document is read-only extraction for Phase 2B.6.
