# Phase 2B.4 — Pre-Rollout Status

Generated: 2026-10-07T11:25:25.906Z

Source: `audit/reports/full-site-parity-matrix.json` (pre-rollout baseline)

## Status Counts by Dimension

| Dimension | PASS | PASS_WITH_INTENTIONAL_MODERNIZATION | FAIL | MANUAL_REVIEW |
|-----------|-----:|------------------------------------:|-----:|--------------:|
| CONTENT_PARITY | 0 | 0 | 72 | 1 |
| HEADING_PARITY | 66 | 0 | 7 | 0 |
| MEDIA_PARITY | 0 | 72 | 0 | 1 |
| LINK_PARITY | 0 | 0 | 0 | 73 |
| SECTION_PARITY | 0 | 63 | 7 | 3 |
| SEO_PARITY | 0 | 0 | 0 | 73 |
| VISUAL_LAYOUT_REVIEW | 0 | 0 | 7 | 66 |

## Counts by Archetype

| Archetype | URLs |
|-----------|-----:|
| ABOUT | 1 |
| AREA_PAGE | 10 |
| ARTICLE | 16 |
| AUTHOR_ARCHIVE | 1 |
| CATEGORY_ARCHIVE | 5 |
| CONTACT | 1 |
| FAQ | 1 |
| INFORMATION | 9 |
| OTHER | 4 |
| PRICING | 2 |
| SERVICE | 14 |
| STORAGE_SERVICE | 6 |
| TAG_ARCHIVE | 3 |

## Summary

- Total contract URLs: **73**
- Parity matrix rows: **73**
- URLs with any FAIL or MANUAL_REVIEW: **73**

### Key pre-rollout findings

1. **CONTENT_PARITY FAIL (72/73)** — automated text-length heuristic; production Elementor pages include duplicate global template text that local intentionally omits.
2. **HEADING_PARITY** — 66 PASS, 7 FAIL (tag archives).
3. **MEDIA_PARITY** — 72 PASS_WITH_INTENTIONAL_MODERNIZATION.
4. **LINK_PARITY / SEO_PARITY** — all MANUAL_REVIEW (automation pending).
5. **7 curated structured reference pages** already at approval quality.
6. **~53 content pages** still use single-column HTML fallback — primary rollout target.

## FAIL and MANUAL_REVIEW URLs

| URL | Archetype | Worst Status | Reason |
|-----|-----------|--------------|--------|
| / | OTHER | FAIL | CONTENT: text ratio 40% (Elementor boilerplate / global template duplication in production); SECTIONS: consolidated layout (prod H2=19 local H2=11); LINKS: not yet automated; SEO: metadata diff not yet automated; LAYOUT: needs visual review |
| /אחסון-משטחים | STORAGE_SERVICE | FAIL | CONTENT: text ratio 33% (Elementor boilerplate / global template duplication in production); SECTIONS: consolidated layout (prod H2=12 local H2=5); LINKS: not yet automated; SEO: metadata diff not yet automated; LAYOUT: needs visual review |
| /אחסון-תכולה-בירושלים | STORAGE_SERVICE | FAIL | CONTENT: text ratio 33% (Elementor boilerplate / global template duplication in production); LINKS: not yet automated; SEO: metadata diff not yet automated; LAYOUT: needs visual review |
| /אחסון-תכולה-לטווח-ארוך | STORAGE_SERVICE | FAIL | CONTENT: text ratio 35% (Elementor boilerplate / global template duplication in production); LINKS: not yet automated; SEO: metadata diff not yet automated; LAYOUT: needs visual review |
| /אחסון-תכולה-לטווח-קצר | STORAGE_SERVICE | FAIL | CONTENT: text ratio 34% (Elementor boilerplate / global template duplication in production); SECTIONS: consolidated layout (prod H2=15 local H2=7); LINKS: not yet automated; SEO: metadata diff not yet automated; LAYOUT: needs visual review |
| /אחסון-תכולת-דירה | STORAGE_SERVICE | FAIL | CONTENT: text ratio 34% (Elementor boilerplate / global template duplication in production); LINKS: not yet automated; SEO: metadata diff not yet automated; LAYOUT: needs visual review |
| /דף-נחיתה | INFORMATION | FAIL | CONTENT: text ratio 20% (Elementor boilerplate / global template duplication in production); LINKS: not yet automated; SEO: metadata diff not yet automated; LAYOUT: needs visual review |
| /הובלות-באבו-גוש | AREA_PAGE | FAIL | CONTENT: text ratio 31% (Elementor boilerplate / global template duplication in production); LINKS: not yet automated; SEO: metadata diff not yet automated; LAYOUT: needs visual review |
| /הובלות-באזור-ירושלים | AREA_PAGE | FAIL | CONTENT: text ratio 33% (Elementor boilerplate / global template duplication in production); LINKS: not yet automated; SEO: metadata diff not yet automated; LAYOUT: needs visual review |
| /הובלות-בבית-שמש | AREA_PAGE | FAIL | CONTENT: text ratio 33% (Elementor boilerplate / global template duplication in production); LINKS: not yet automated; SEO: metadata diff not yet automated; LAYOUT: needs visual review |
| /הובלות-בביתר-עילית | AREA_PAGE | FAIL | CONTENT: text ratio 31% (Elementor boilerplate / global template duplication in production); LINKS: not yet automated; SEO: metadata diff not yet automated; LAYOUT: needs visual review |
| /הובלות-בגבעת-זאב | AREA_PAGE | FAIL | CONTENT: text ratio 30% (Elementor boilerplate / global template duplication in production); LINKS: not yet automated; SEO: metadata diff not yet automated; LAYOUT: needs visual review |
| /הובלות-בגוש-עציון | AREA_PAGE | FAIL | CONTENT: text ratio 32% (Elementor boilerplate / global template duplication in production); LINKS: not yet automated; SEO: metadata diff not yet automated; LAYOUT: needs visual review |
| /הובלות-בירושלים | ARTICLE | FAIL | CONTENT: text ratio 52% (Elementor boilerplate / global template duplication in production); LINKS: not yet automated; SEO: metadata diff not yet automated; LAYOUT: needs visual review |
| /הובלות-בירושלים-2025 | ARTICLE | FAIL | CONTENT: text ratio 38% (Elementor boilerplate / global template duplication in production); LINKS: not yet automated; SEO: metadata diff not yet automated; LAYOUT: needs visual review |
| /הובלות-בירושלים-המדריך-למעבר-דירה | ARTICLE | FAIL | CONTENT: text ratio 36% (Elementor boilerplate / global template duplication in production); LINKS: not yet automated; SEO: metadata diff not yet automated; LAYOUT: needs visual review |
| /הובלות-במבשרת-ציון | AREA_PAGE | FAIL | CONTENT: text ratio 31% (Elementor boilerplate / global template duplication in production); LINKS: not yet automated; SEO: metadata diff not yet automated; LAYOUT: needs visual review |
| /הובלות-במודיעין | AREA_PAGE | FAIL | CONTENT: text ratio 31% (Elementor boilerplate / global template duplication in production); LINKS: not yet automated; SEO: metadata diff not yet automated; LAYOUT: needs visual review |
| /הובלות-במעלה-אדומים | AREA_PAGE | FAIL | CONTENT: text ratio 31% (Elementor boilerplate / global template duplication in production); LINKS: not yet automated; SEO: metadata diff not yet automated; LAYOUT: needs visual review |
| /הובלות-בפסגת-זאב | AREA_PAGE | FAIL | CONTENT: text ratio 34% (Elementor boilerplate / global template duplication in production); LINKS: not yet automated; SEO: metadata diff not yet automated; LAYOUT: needs visual review |
| /הובלות-דחופות-בירושלים | SERVICE | FAIL | CONTENT: text ratio 34% (Elementor boilerplate / global template duplication in production); LINKS: not yet automated; SEO: metadata diff not yet automated; LAYOUT: needs visual review |
| /הובלות-מוצרי-חשמל-בירושלים | ARTICLE | FAIL | CONTENT: text ratio 30% (Elementor boilerplate / global template duplication in production); LINKS: not yet automated; SEO: metadata diff not yet automated; LAYOUT: needs visual review |
| /הובלות-מיוחדות-בירושלים | SERVICE | FAIL | CONTENT: text ratio 31% (Elementor boilerplate / global template duplication in production); LINKS: not yet automated; SEO: metadata diff not yet automated; LAYOUT: needs visual review |
| /הובלות-מירושלים | ARTICLE | FAIL | CONTENT: text ratio 43% (Elementor boilerplate / global template duplication in production); LINKS: not yet automated; SEO: metadata diff not yet automated; LAYOUT: needs visual review |
| /הובלות-מנוף-בירושלים | SERVICE | FAIL | CONTENT: text ratio 34% (Elementor boilerplate / global template duplication in production); LINKS: not yet automated; SEO: metadata diff not yet automated; LAYOUT: needs visual review |
| /הובלות-משרדים-בירושלים | SERVICE | FAIL | CONTENT: text ratio 31% (Elementor boilerplate / global template duplication in production); LINKS: not yet automated; SEO: metadata diff not yet automated; LAYOUT: needs visual review |
| /הובלות-סטודנטים-בירושלים-מדריך-למעבר | ARTICLE | FAIL | CONTENT: text ratio 31% (Elementor boilerplate / global template duplication in production); LINKS: not yet automated; SEO: metadata diff not yet automated; LAYOUT: needs visual review |
| /הובלות-קטנות-בירושלים | SERVICE | FAIL | CONTENT: text ratio 35% (Elementor boilerplate / global template duplication in production); LINKS: not yet automated; SEO: metadata diff not yet automated; LAYOUT: needs visual review |
| /הובלות-קטנות-בירושלים-המדריך-המלא | ARTICLE | FAIL | CONTENT: text ratio 36% (Elementor boilerplate / global template duplication in production); LINKS: not yet automated; SEO: metadata diff not yet automated; LAYOUT: needs visual review |
| /הובלת-בית-בירושלים | SERVICE | FAIL | CONTENT: text ratio 33% (Elementor boilerplate / global template duplication in production); LINKS: not yet automated; SEO: metadata diff not yet automated; LAYOUT: needs visual review |
| /הובלת-דירה-בירושלים | SERVICE | FAIL | CONTENT: text ratio 28% (Elementor boilerplate / global template duplication in production); LINKS: not yet automated; SEO: metadata diff not yet automated; LAYOUT: needs visual review |
| /הובלת-דירה-הובלות-קטנות | ARTICLE | FAIL | CONTENT: text ratio 39% (Elementor boilerplate / global template duplication in production); LINKS: not yet automated; SEO: metadata diff not yet automated; LAYOUT: needs visual review |
| /הובלת-דירה-מירושלים | SERVICE | FAIL | CONTENT: text ratio 34% (Elementor boilerplate / global template duplication in production); LINKS: not yet automated; SEO: metadata diff not yet automated; LAYOUT: needs visual review |
| /הובלת-משטחים-בירושלים | SERVICE | FAIL | CONTENT: text ratio 31% (Elementor boilerplate / global template duplication in production); LINKS: not yet automated; SEO: metadata diff not yet automated; LAYOUT: needs visual review |
| /הובלת-משטחים-במרכז | SERVICE | FAIL | CONTENT: text ratio 31% (Elementor boilerplate / global template duplication in production); LINKS: not yet automated; SEO: metadata diff not yet automated; LAYOUT: needs visual review |
| /הובלת-פריט-בודד-בירושלים | SERVICE | FAIL | CONTENT: text ratio 34% (Elementor boilerplate / global template duplication in production); LINKS: not yet automated; SEO: metadata diff not yet automated; LAYOUT: needs visual review |
| /הובלת-פריט-בודד-בירושלים-מדריך | ARTICLE | FAIL | CONTENT: text ratio 36% (Elementor boilerplate / global template duplication in production); LINKS: not yet automated; SEO: metadata diff not yet automated; LAYOUT: needs visual review |
| /הובלת-פריטים-בודדים-בירושלים | ARTICLE | FAIL | CONTENT: text ratio 30% (Elementor boilerplate / global template duplication in production); LINKS: not yet automated; SEO: metadata diff not yet automated; LAYOUT: needs visual review |
| /הזמן-הכי-טוב-לבצע-הובלה-בירושלים | ARTICLE | MANUAL_REVIEW | LINKS: not yet automated; SEO: metadata diff not yet automated; LAYOUT: needs visual review |
| /הכנה-נכונה-להובלת-דירה-בירושלים-5-טיפי | ARTICLE | FAIL | CONTENT: text ratio 30% (Elementor boilerplate / global template duplication in production); LINKS: not yet automated; SEO: metadata diff not yet automated; LAYOUT: needs visual review |
| /הצעת-מחיר | PRICING | FAIL | CONTENT: text ratio 18% (Elementor boilerplate / global template duplication in production); HEADINGS: h2Match 0%; SECTIONS: prod H2=1 local H2=0; LINKS: not yet automated; SEO: metadata diff not yet automated; LAYOUT: visual review failed |
| /חברת-אריזה-והובלה-בירושלים | SERVICE | FAIL | CONTENT: text ratio 31% (Elementor boilerplate / global template duplication in production); LINKS: not yet automated; SEO: metadata diff not yet automated; LAYOUT: needs visual review |
| /כמה-עולה-הובלת-דירה-בירושלים-ב-2026 | ARTICLE | FAIL | CONTENT: text ratio 54% (Elementor boilerplate / global template duplication in production); LINKS: not yet automated; SEO: metadata diff not yet automated; LAYOUT: needs visual review |
| /מדריך-המומחים-כך-תעברו-דירה-בירושלים-ב | ARTICLE | FAIL | CONTENT: text ratio 34% (Elementor boilerplate / global template duplication in production); LINKS: not yet automated; SEO: metadata diff not yet automated; LAYOUT: needs visual review |
| /מדריך-מעבר-דירה-ירושלים | INFORMATION | FAIL | CONTENT: text ratio 32% (Elementor boilerplate / global template duplication in production); LINKS: not yet automated; SEO: metadata diff not yet automated; LAYOUT: needs visual review |
| /מוביל-בירושלים-והסביבה | SERVICE | FAIL | CONTENT: text ratio 36% (Elementor boilerplate / global template duplication in production); LINKS: not yet automated; SEO: metadata diff not yet automated; LAYOUT: needs visual review |
| /מחיר-אחסון-תכולה-בירושלים | STORAGE_SERVICE | FAIL | CONTENT: text ratio 34% (Elementor boilerplate / global template duplication in production); LINKS: not yet automated; SEO: metadata diff not yet automated; LAYOUT: needs visual review |
| /מחירי-הובלת-דירות | PRICING | FAIL | CONTENT: text ratio 29% (Elementor boilerplate / global template duplication in production); LINKS: not yet automated; SEO: metadata diff not yet automated; LAYOUT: needs visual review |
| /מעבר-דירה-בחורף-בירושלים | ARTICLE | FAIL | CONTENT: text ratio 40% (Elementor boilerplate / global template duplication in production); LINKS: not yet automated; SEO: metadata diff not yet automated; LAYOUT: needs visual review |
| /מעבר-דירה-בירושלים | ARTICLE | FAIL | CONTENT: text ratio 45% (Elementor boilerplate / global template duplication in production); LINKS: not yet automated; SEO: metadata diff not yet automated; LAYOUT: needs visual review |
| /צרו-קשר | CONTACT | FAIL | CONTENT: text ratio 20% (Elementor boilerplate / global template duplication in production); LINKS: not yet automated; SEO: metadata diff not yet automated; LAYOUT: needs visual review |
| /שאלות-נפוצות | FAQ | FAIL | CONTENT: text ratio 26% (Elementor boilerplate / global template duplication in production); LINKS: not yet automated; SEO: metadata diff not yet automated; LAYOUT: needs visual review |
| /שגיאה-404-1 | INFORMATION | FAIL | CONTENT: text ratio 18% (Elementor boilerplate / global template duplication in production); HEADINGS: h2Match 0%; SECTIONS: prod H2=1 local H2=0; LINKS: not yet automated; SEO: metadata diff not yet automated; LAYOUT: visual review failed; LOCAL HTTP 404 |
| /שגיאה-404-2 | INFORMATION | FAIL | CONTENT: text ratio 18% (Elementor boilerplate / global template duplication in production); HEADINGS: h2Match 0%; SECTIONS: prod H2=1 local H2=0; LINKS: not yet automated; SEO: metadata diff not yet automated; LAYOUT: visual review failed; LOCAL HTTP 404 |
| /שירותי-הובלה | SERVICE | FAIL | CONTENT: text ratio 34% (Elementor boilerplate / global template duplication in production); LINKS: not yet automated; SEO: metadata diff not yet automated; LAYOUT: needs visual review |
| /תודה-רבה | INFORMATION | FAIL | CONTENT: text ratio 19% (Elementor boilerplate / global template duplication in production); HEADINGS: h2Match 0%; SECTIONS: prod H2=1 local H2=0; LINKS: not yet automated; SEO: metadata diff not yet automated; LAYOUT: visual review failed |
| /about-us | ABOUT | FAIL | CONTENT: text ratio 32% (Elementor boilerplate / global template duplication in production); LINKS: not yet automated; SEO: metadata diff not yet automated; LAYOUT: needs visual review |
| /accessibility-statement | INFORMATION | FAIL | CONTENT: text ratio 23% (Elementor boilerplate / global template duplication in production); LINKS: not yet automated; SEO: metadata diff not yet automated; LAYOUT: needs visual review |
| /author/guest_2020 | AUTHOR_ARCHIVE | FAIL | CONTENT: text ratio 24% (Elementor boilerplate / global template duplication in production); LINKS: not yet automated; SEO: metadata diff not yet automated; LAYOUT: needs visual review |
| /author/guest_2020/page/2/ | OTHER | FAIL | CONTENT: text ratio 22% (Elementor boilerplate / global template duplication in production); LINKS: not yet automated; SEO: metadata diff not yet automated; LAYOUT: needs visual review |
| /blog | CATEGORY_ARCHIVE | FAIL | CONTENT: text ratio 31% (Elementor boilerplate / global template duplication in production); LINKS: not yet automated; SEO: metadata diff not yet automated; LAYOUT: needs visual review |
| /category/moving-by-region | CATEGORY_ARCHIVE | FAIL | CONTENT: text ratio 22% (Elementor boilerplate / global template duplication in production); LINKS: not yet automated; SEO: metadata diff not yet automated; LAYOUT: needs visual review |
| /category/moving-services | CATEGORY_ARCHIVE | FAIL | CONTENT: text ratio 24% (Elementor boilerplate / global template duplication in production); LINKS: not yet automated; SEO: metadata diff not yet automated; LAYOUT: needs visual review |
| /category/moving-services/page/2/ | OTHER | FAIL | CONTENT: text ratio 21% (Elementor boilerplate / global template duplication in production); LINKS: not yet automated; SEO: metadata diff not yet automated; LAYOUT: needs visual review |
| /category/moving-tips | CATEGORY_ARCHIVE | FAIL | CONTENT: text ratio 24% (Elementor boilerplate / global template duplication in production); LINKS: not yet automated; SEO: metadata diff not yet automated; LAYOUT: needs visual review |
| /category/moving-tips/page/2/ | OTHER | FAIL | CONTENT: text ratio 19% (Elementor boilerplate / global template duplication in production); LINKS: not yet automated; SEO: metadata diff not yet automated; LAYOUT: needs visual review |
| /category/prices-costs | CATEGORY_ARCHIVE | FAIL | CONTENT: text ratio 18% (Elementor boilerplate / global template duplication in production); LINKS: not yet automated; SEO: metadata diff not yet automated; LAYOUT: needs visual review |
| /privacy-policy | INFORMATION | FAIL | CONTENT: text ratio 28% (Elementor boilerplate / global template duplication in production); LINKS: not yet automated; SEO: metadata diff not yet automated; LAYOUT: needs visual review |
| /site-map | INFORMATION | FAIL | CONTENT: text ratio 24% (Elementor boilerplate / global template duplication in production); LINKS: not yet automated; SEO: metadata diff not yet automated; LAYOUT: needs visual review |
| /tag/הובלות-בירושלים | TAG_ARCHIVE | FAIL | CONTENT: text ratio 17% (Elementor boilerplate / global template duplication in production); HEADINGS: h2Match 0%; SECTIONS: prod H2=1 local H2=0; LINKS: not yet automated; SEO: metadata diff not yet automated; LAYOUT: visual review failed |
| /tag/הובלות-קטנות | TAG_ARCHIVE | FAIL | CONTENT: text ratio 17% (Elementor boilerplate / global template duplication in production); HEADINGS: h2Match 0%; SECTIONS: prod H2=1 local H2=0; LINKS: not yet automated; SEO: metadata diff not yet automated; LAYOUT: visual review failed |
| /tag/מעבר-דירה | TAG_ARCHIVE | FAIL | CONTENT: text ratio 17% (Elementor boilerplate / global template duplication in production); HEADINGS: h2Match 0%; SECTIONS: prod H2=1 local H2=0; LINKS: not yet automated; SEO: metadata diff not yet automated; LAYOUT: visual review failed |
| /terms-of-use | INFORMATION | FAIL | CONTENT: text ratio 27% (Elementor boilerplate / global template duplication in production); LINKS: not yet automated; SEO: metadata diff not yet automated; LAYOUT: needs visual review |