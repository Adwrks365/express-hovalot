# Phase 2B.2 — Pre-Design Audit (Internal Pages)

Generated: 2026-10-07

Audit method: migrated HTML inspection, local render review, and CSS/layout analysis across representative page families at 1440 / 1024 / 768 / 390 / 360.

---

## Page families inspected

| Family | URL | Findings summary |
|--------|-----|------------------|
| Service | `/הובלת-דירה-בירושלים/` | Elementor column stacks, duplicate H1, oversized vertical gaps, raw images |
| Services hub | `/שירותי-הובלה/` | Same — nested wrappers create empty blocks |
| About | `/about-us` | Long unstyled sections, legacy inline styles, weak section rhythm |
| Quote | `/הצעת-מחיר/` | Form-adjacent content in raw HTML, inconsistent spacing |
| Pricing | `/מחירי-הובלת-דירות/` | Raw pricing tables, inline table CSS from Elementor widgets |
| Blog index | `/blog/` | Plain list-like rows, no cards, no featured images, huge whitespace |
| Articles | 2 posts sampled | Full-width paragraphs, embedded tables OK semantically but unstyled |
| Storage | `/אחסון-תכולה-בירושלים/` | Service layout issues + image sizing inconsistent |
| Location | `/הובלות-במבשרת-ציון/` | Location copy preserved but presentation flat |
| FAQ | `/שאלות-נפוצות/` | FAQ text in HTML paragraphs, not accordion |
| Contact | `/צרו-קשר/` | Contact blocks without callout styling |

---

## Critical visual problems (all families)

### Layout / whitespace
- **Huge empty vertical spaces** from Elementor spacers and min-height sections
- **Legacy margin/padding** on nested divs not reset after wrapper unwrap
- **Sections visually merge** — no consistent section rhythm between H2 blocks

### Typography / hierarchy
- **Duplicate H1** — hero H1 + first content H1
- **Weak H2/H3 distinction** — all headings similar weight after generic `.wp-content` rules
- **Body text too small/narrow or too wide** depending on leftover Elementor width classes
- **Isolated tiny text blocks** floating in white space

### Images / media
- **Raw `<img>` with legacy width/height** causing wrong aspect ratios
- **Tiny or oversized images** when Elementor size classes removed inconsistently
- **Logo lists** render as broken vertical stacks instead of branded strip/marquee
- **Missing srcset** after migration rewrite — needs responsive presentation layer

### WordPress / Elementor artifacts
- **Column/section wrappers** still influencing layout via inline `style`
- **Spacer widgets** leaving empty blocks
- **Elementor button classes** partially styled but inconsistent with homepage CTAs
- **Inline font-size and alignment** fighting Tailwind typography

### Blog / archive
- `/blog/` is **not a card grid** — long title rows only
- **No featured images**, dates weak, no excerpt truncation
- **No hover / card hierarchy**

### Navigation (Header)
- Desktop dropdown **lacks chevron indicator**
- **Gap between parent and submenu** causes hover loss on some items
- Mobile **children always expanded** — no separate chevron toggle
- **Menu does not auto-close on route change** (only on link click in mobile drawer)

### Tables
- Pricing tables use **legacy blue Elementor inline CSS** (`.express-price-table`)
- Not using Express dark-green header system
- Mobile scroll OK in container but visually raw

### CTAs
- Repeated plain text: "רוצים לקבל הצעת מחיר מהירה?" without branded CTA blocks
- Phone/WhatsApp links inline without callout treatment

---

## Responsive issues observed

| Breakpoint | Issues |
|------------|--------|
| 1440 | Content column too narrow relative to viewport; excessive side whitespace |
| 1024 | Dropdown nav cramped; two-column hero image small |
| 768 | Hero image still competes with H1; tables need wrapper |
| 390 / 360 | Occasional horizontal overflow from wide tables/images; mobile nav children always open |

---

## What must NOT change

- URL paths, slugs, canonicals
- Heading/link **text** and paragraph content
- SEO metadata
- Homepage Phase 2A.20 visual baseline
- Footer approved structure

---

## Phase 2B.2 remediation plan

1. Neutralize Elementor **presentation** markup in `wp-html.ts` (preserve semantics)
2. Introduce internal design system components + `RichText` rendering layer
3. Template-specific layouts: Service, Article, Blog index, Standard
4. Refine Internal Hero (controlled height, gradient, compact mobile)
5. Rebuild `/blog/` as article card grid from post inventory
6. Header submenu UX (chevrons, mobile toggle, close on navigate)
7. Branded tables, CTAs, FAQ detection, logo strip reuse
8. Re-run content parity + link/media validation
