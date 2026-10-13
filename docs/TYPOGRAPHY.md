# Typography Contract — Express Hovalot Migration

This document defines the global heading and body typography system for Phase 2B and beyond.

**Implementation:** `src/lib/typography.ts`, `src/components/ui/Heading.tsx`

**Layout widths:** `src/lib/layout.ts`, `Container`, `ContentWidth`, `ProseWidth` — see Phase 2A.6

---

## Semantic rules

| Level | Meaning | Rule |
|-------|---------|------|
| **H1** | Primary page topic | **Exactly one H1** per normal page |
| **H2** | Major page sections | Multiple allowed |
| **H3** | Subsections within an H2 | Cards, form titles, content groups |
| **H4** | Only when structurally required below H3 | Rare |

**Critical:** Heading tag ≠ visual size. Choose `as` for semantics; choose `role` for appearance.

---

## Homepage H1

```
H1: מומחי הובלות בירושלים
```

The SEO phrase *"הובלות קטנות וגדולות בירושלים עם ביטוח מלא ואחריות"* remains visible as **H2** (role: `hero-seo`), not a second H1.

---

## SEO preservation (Phase 2B)

Before migrating any WordPress page:

1. Inventory OLD h1–h4 text from source HTML
2. Map to NEW semantic levels
3. Preserve all meaningful heading **text** — do not delete keyword-relevant phrases for aesthetics
4. Improve poor WordPress semantics without losing content

---

## Visual scale (responsive)

| Role | Token | Desktop (approx.) | Mobile (approx.) | Weight |
|------|-------|-------------------|------------------|--------|
| Hero display H1 | `heroDisplay` | 48px | 32px | 700 |
| Page H1 | `pageH1` | 38–42px | 30px | 700 |
| Section H2 | `sectionH2` | 32px | 24px | 700 |
| Subsection H3 | `subsectionH3` | 22px | 18px | 600 |
| Minor H4 | `minorH4` | 18px | 16px | 600 |
| Body | `body` / `bodyLg` | 16–18px | 16px | 400 |
| Small / caption | `small` / `caption` | 14px / 12px | same | 400 |

Line-height for Hebrew headings: **≥ 1.12** (avoid cramped multi-line titles).

---

## Color / tone

| Background | Headings | Body | Accent emphasis |
|------------|----------|------|-----------------|
| Light (`onLight`) | `text-brand-800` | `text-neutral-700` | `text-brand-600` |
| Dark / image (`onDark`) | `text-white` | `text-white/95` | `text-accent-300` (gold) |

Use gold/yellow only for deliberate emphasis — not all headings.

---

## RTL

- All Hebrew content: `text-start` (right in RTL)
- Phone numbers: `dir="ltr"` on the number span
- Mixed Hebrew/English: natural bidi; avoid forced center on long paragraphs

---

## Components

| Component | Use |
|-----------|-----|
| `Heading` | Generic — set `as` + `role` + `tone` |
| `PageHeading` | Inner page H1 (Phase 2B) |
| `SectionTitle` | Major section H2 (Phase 2B) |
| `SectionHeading` | Legacy homepage sections — migrate to `SectionTitle` in Phase 2B |
| `typeScale.*` | Body/supporting text classes |

### Heading roles

- `hero-display` — Hero H1 visual
- `hero-seo` — Hero SEO H2 (accent on dark)
- `hero-section-line` — Hero services H2 (white on dark)
- `page-h1` — Standard page title
- `section-h2` — Section titles
- `subsection-h3` — Subsections, form titles
- `minor-h4` — Minor headings

---

## Phase 2B checklist

- [ ] One H1 per page derived from source primary topic
- [ ] Compare old vs new heading text inventory
- [ ] Use `Heading` / `PageHeading` / `SectionTitle` — no ad-hoc `text-4xl` in pages
- [ ] Apply `tone="onDark"` on green/image sections
- [ ] Verify RTL and phone number formatting
