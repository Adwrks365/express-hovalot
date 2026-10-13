# Phase 2B.3B — Visual Comparison (Reference Pages)

Generated: 2026-10-07  
Screenshots: `audit/screenshots/phase-2b3b/`

## Method

For each of the five reference archetypes:

| Page | Production | Local |
|------|------------|-------|
| Desktop 1440 | `{name}-production-desktop-1440.png` | `{name}-local-desktop-1440.png` |
| Mobile 390 | `{name}-production-mobile-390.png` | `{name}-local-mobile-390.png` |

## Summary

| Page | Visible content | Structure | Status |
|------|-----------------|-----------|--------|
| אחסון תכולה לטווח קצר | ~5,800 chars visible | 14 production-derived blocks (hero, CTA, form, feature grids, FAQ, image+text) | **Improved — not pixel parity** |
| צרו קשר | ~1,370 chars | Contact form block + verified address/area copy | **PASS visual QA** |
| שאלות נפוצות | ~1,370 chars | FAQ accordion from production toggle widgets | **PASS visual QA** |
| Article (2026 pricing) | ~16,300 chars visible (was ~0 due to ScrollReveal bug) | Article grid + sidebar + full body | **Content restored — media gaps remain** |
| הצעת מחיר | ~1,560 chars | Form block + stats + trust copy + logo marquee | **PASS visual QA** |

## Per-page notes

### Storage (`storage-short`)

**Resolved**
- Removed generic H2-split layout; uses Elementor-derived structured blocks
- Service cards render as 3-column grid (not stacked raw images)
- Hero intro + image from production section 1

**Remaining vs production**
- Production has denser Elementor sections (counters, more CTA strips)
- 3 images still fail `naturalWidth` (thumb/unmapped assets — see media report)
- Visual rhythm closer to homepage but not yet full landing-page parity

### Contact (`contact`)

**Resolved**
- Professional two-column layout: verified copy + form placeholder
- Phone/WhatsApp CTAs preserved from source HTML

**Intentional modernization**
- Cleaner white/muted sections vs legacy Elementor form styling

### FAQ (`faq`)

**Resolved**
- Q&A pairs from production toggle widgets → accessible accordion
- Intro copy + WhatsApp CTA preserved

### Article (`article-2026`)

**Critical fix**
- Root cause: `ScrollReveal` IntersectionObserver `threshold: 0.15` on ~12,000px article body → content stayed `opacity: 0` (invisible blank region)
- Fix: threshold `0`, in-viewport reveal, 2.5s fallback; articles skip ScrollReveal in `RichText`

**Resolved**
- Full article body visible (~16k chars)
- TOC, author, prev/next present
- Sidebar sticky wrapper fixed (no height coupling)

**Remaining**
- 4 article inline images unmapped/broken (source 404 or thumb paths)
- 1 below-fold ScrollReveal element may still exist outside article column

### Quote (`quote`)

**Resolved**
- Production form section → structured form block + stats row
- Client logo marquee (homepage component) for trust strip

**Remaining**
- Production client carousel logos (tabol, orian, etc.) partially unmapped — marquee uses homepage set

## Structural differences (global)

| Production | Previous local | 2B.3B local |
|------------|----------------|-------------|
| Elementor sections/widgets | H2-split generic sections | Elementor inventory → typed blocks (reference pages only) |
| Mixed column layouts | Single RichText column | Feature grids, image+text, FAQ accordion |
| Visible article content | Hidden (ScrollReveal) | Visible |

## SEO / URL

No URL, canonical, or title changes in this phase.
