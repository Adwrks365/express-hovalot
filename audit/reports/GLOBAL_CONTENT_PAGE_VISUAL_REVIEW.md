# Global content-page visual review

Generated from `audit/reports/redesign-parity.json` and `audit/reports/redesign-screenshots.json` against the local production build at http://localhost:3010.
Screenshots: `audit/screenshots/global-redesign/NN-<slug>-<width>.png` (1440 / 390 / 375 / 360, full page).

Totals: PASS 67, NEEDS_POLISH 0, FAIL 0, N/A 2 (of 69 internal URLs; homepage excluded and untouched).

Status rules: PASS needs every automated gate clean (text, headings, links, FAQ, tables, media with zero missing and zero unrelated, no raw Elementor markup, no orphan forms, no horizontal overflow at any width) and the page rendered by the new redesign system. "(manual review)" marks pages whose screenshots were also inspected by eye; the other pages share the same archetype renderer and pass the same gates.

| URL | Archetype | Visual status | Content parity | Media fidelity | Responsive / forms | Remaining issues |
| --- | --- | --- | --- | --- | --- | --- |
| `/הכנה-נכונה-להובלת-דירה-בירושלים-5-טיפי` | ARTICLE | PASS | text 39/39, headings 3/3, links 1/1, FAQ 0/0, tables 0/0 | 1/1 source images, missing 0, unrelated 0 | no overflow 1440/390/375/360; forms 1, orphan 0 | None |
| `/מעבר-דירה-בחורף-בירושלים` | ARTICLE | PASS (manual review) | text 127/127, headings 23/23, links 5/5, FAQ 6/6, tables 0/0 | 7/7 source images, missing 0, unrelated 0 | no overflow 1440/390/375/360; forms 1, orphan 0 | None |
| `/מדריך-המומחים-כך-תעברו-דירה-בירושלים-ב` | ARTICLE | PASS | text 81/81, headings 10/10, links 2/2, FAQ 4/4, tables 1/1 | 4/4 source images, missing 0, unrelated 0 | no overflow 1440/390/375/360; forms 1, orphan 0 | None |
| `/מעבר-דירה-בירושלים` | ARTICLE | PASS | text 134/134, headings 14/14, links 11/11, FAQ 0/0, tables 0/0 | 6/6 source images, missing 0, unrelated 0 | no overflow 1440/390/375/360; forms 1, orphan 0 | None |
| `/הובלות-מירושלים` | ARTICLE | PASS | text 137/137, headings 23/23, links 8/8, FAQ 0/0, tables 0/0 | 6/6 source images, missing 0, unrelated 0 | no overflow 1440/390/375/360; forms 1, orphan 0 | None |
| `/הזמן-הכי-טוב-לבצע-הובלה-בירושלים` | ARTICLE | PASS | text 323/323, headings 53/53, links 4/4, FAQ 0/0, tables 1/1 | 14/14 source images, missing 0, unrelated 0 | no overflow 1440/390/375/360; forms 1, orphan 0 | None |
| `/הובלת-פריטים-בודדים-בירושלים` | ARTICLE | PASS | text 33/33, headings 7/7, links 2/2, FAQ 0/0, tables 0/0 | 1/1 source images, missing 0, unrelated 0 | no overflow 1440/390/375/360; forms 1, orphan 0 | None |
| `/הובלות-סטודנטים-בירושלים-מדריך-למעבר` | ARTICLE | PASS | text 34/34, headings 8/8, links 3/3, FAQ 0/0, tables 0/0 | 1/1 source images, missing 0, unrelated 0 | no overflow 1440/390/375/360; forms 1, orphan 0 | None |
| `/הובלות-מוצרי-חשמל-בירושלים` | ARTICLE | PASS | text 38/38, headings 8/8, links 1/1, FAQ 0/0, tables 0/0 | 1/1 source images, missing 0, unrelated 0 | no overflow 1440/390/375/360; forms 1, orphan 0 | None |
| `/הובלות-בירושלים` | ARTICLE | PASS | text 211/211, headings 17/17, links 7/7, FAQ 0/0, tables 0/0 | 4/4 source images, missing 0, unrelated 0 | no overflow 1440/390/375/360; forms 1, orphan 0 | None |
| `/הובלות-בירושלים-2025` | ARTICLE | PASS | text 94/94, headings 13/13, links 6/6, FAQ 0/0, tables 0/0 | 4/4 source images, missing 0, unrelated 0 | no overflow 1440/390/375/360; forms 1, orphan 0 | None |
| `/הובלת-פריט-בודד-בירושלים-מדריך` | ARTICLE | PASS | text 80/80, headings 10/10, links 5/5, FAQ 0/0, tables 0/0 | 4/4 source images, missing 0, unrelated 0 | no overflow 1440/390/375/360; forms 1, orphan 0 | None |
| `/הובלות-בירושלים-המדריך-למעבר-דירה` | ARTICLE | PASS | text 83/83, headings 13/13, links 6/6, FAQ 0/0, tables 0/0 | 1/1 source images, missing 0, unrelated 0 | no overflow 1440/390/375/360; forms 1, orphan 0 | None |
| `/הובלת-דירה-הובלות-קטנות` | ARTICLE | PASS | text 103/103, headings 11/11, links 9/9, FAQ 0/0, tables 1/1 | 1/1 source images, missing 0, unrelated 0 | no overflow 1440/390/375/360; forms 1, orphan 0 | None |
| `/הובלות-קטנות-בירושלים-המדריך-המלא` | ARTICLE | PASS | text 87/87, headings 23/23, links 5/5, FAQ 0/0, tables 0/0 | 5/5 source images, missing 0, unrelated 0 | no overflow 1440/390/375/360; forms 1, orphan 0 | None |
| `/כמה-עולה-הובלת-דירה-בירושלים-ב-2026` | ARTICLE | PASS (manual review) | text 252/252, headings 23/23, links 7/7, FAQ 0/0, tables 1/1 | 7/7 source images, missing 0, unrelated 0 | no overflow 1440/390/375/360; forms 1, orphan 0 | None |
| `/שגיאה-404-1` | — | N/A (HTTP 404) | — | — | no overflow 1440/390/375/360; forms 0, orphan 0 | WordPress 404-template page; route returns 404 locally (no content to redesign). |
| `/שגיאה-404-2` | — | N/A (HTTP 404) | — | — | no overflow 1440/390/375/360; forms 0, orphan 0 | WordPress 404-template page; route returns 404 locally (no content to redesign). |
| `/תודה-רבה` | UTILITY | PASS (manual review) | text 3/3, headings 3/3, links 0/0, FAQ 0/0, tables 0/0 | 0/0 source images, missing 0, unrelated 0 | no overflow 1440/390/375/360; forms 0, orphan 0 | Utility page, compact hero, no conversion by design. |
| `/דף-נחיתה` | SERVICE | PASS | text 3/3, headings 2/2, links 0/0, FAQ 0/0, tables 0/0 | 0/0 source images, missing 0, unrelated 0 | no overflow 1440/390/375/360; forms 1, orphan 0 | Source landing page is very thin (3 text segments); rendered faithfully, nothing added. |
| `/accessibility-statement` | LEGAL | PASS | text 17/17, headings 1/1, links 1/1, FAQ 0/0, tables 0/0 | 0/0 source images, missing 0, unrelated 0 | no overflow 1440/390/375/360; forms 1, orphan 0 | None |
| `/terms-of-use` | LEGAL | PASS (manual review) | text 20/20, headings 10/10, links 2/2, FAQ 0/0, tables 0/0 | 0/0 source images, missing 0, unrelated 0 | no overflow 1440/390/375/360; forms 1, orphan 0 | None |
| `/site-map` | UTILITY | PASS (manual review) | text 2/2, headings 1/1, links 66/66, FAQ 0/0, tables 0/0 | 0/0 source images, missing 0, unrelated 0 | no overflow 1440/390/375/360; forms 0, orphan 0 | 66/66 sitemap links rendered with exact hrefs; no conversion by design (utility). |
| `/blog` | INFORMATION | PASS (manual review) | text 10/10, headings 4/4, links 0/0, FAQ 0/0, tables 0/0 | 0/0 source images, missing 0, unrelated 0 | no overflow 1440/390/375/360; forms 1, orphan 0 | None |
| `/privacy-policy` | LEGAL | PASS | text 43/43, headings 7/7, links 1/1, FAQ 0/0, tables 0/0 | 0/0 source images, missing 0, unrelated 0 | no overflow 1440/390/375/360; forms 1, orphan 0 | None |
| `/about-us` | ABOUT | PASS (manual review) | text 61/61, headings 23/23, links 9/9, FAQ 8/8, tables 0/0 | 2/2 source images, missing 0, unrelated 0 | no overflow 1440/390/375/360; forms 1, orphan 0 | None |
| `/הובלות-באזור-ירושלים` | AREA | PASS | text 50/50, headings 15/15, links 13/13, FAQ 0/0, tables 0/0 | 24/24 source images, missing 0, unrelated 0 | no overflow 1440/390/375/360; forms 1, orphan 0 | None |
| `/הובלות-משרדים-בירושלים` | SERVICE | PASS | text 60/60, headings 22/22, links 3/3, FAQ 4/4, tables 0/0 | 4/4 source images, missing 0, unrelated 0 | no overflow 1440/390/375/360; forms 1, orphan 0 | None |
| `/הובלות-מנוף-בירושלים` | SERVICE | PASS (manual review) | text 72/72, headings 22/22, links 10/10, FAQ 5/5, tables 0/0 | 9/9 source images, missing 0, unrelated 0 | no overflow 1440/390/375/360; forms 1, orphan 0 | None |
| `/הובלות-מיוחדות-בירושלים` | SERVICE | PASS | text 57/57, headings 20/20, links 8/8, FAQ 5/5, tables 0/0 | 8/8 source images, missing 0, unrelated 0 | no overflow 1440/390/375/360; forms 1, orphan 0 | None |
| `/אחסון-תכולת-דירה` | STORAGE | PASS | text 77/77, headings 19/19, links 6/6, FAQ 9/9, tables 0/0 | 9/9 source images, missing 0, unrelated 0 | no overflow 1440/390/375/360; forms 1, orphan 0 | None |
| `/הובלת-בית-בירושלים` | SERVICE | PASS | text 60/60, headings 20/20, links 4/4, FAQ 7/7, tables 0/0 | 5/5 source images, missing 0, unrelated 0 | no overflow 1440/390/375/360; forms 1, orphan 0 | None |
| `/מדריך-מעבר-דירה-ירושלים` | INFORMATION | PASS (manual review) | text 59/59, headings 8/8, links 14/14, FAQ 0/0, tables 0/0 | 12/12 source images, missing 0, unrelated 0 | no overflow 1440/390/375/360; forms 1, orphan 0 | None |
| `/הובלת-משטחים-במרכז` | SERVICE | PASS | text 51/51, headings 18/18, links 0/0, FAQ 4/4, tables 0/0 | 2/2 source images, missing 0, unrelated 0 | no overflow 1440/390/375/360; forms 1, orphan 0 | None |
| `/אחסון-משטחים` | STORAGE | PASS | text 75/75, headings 16/16, links 7/7, FAQ 9/9, tables 0/0 | 6/6 source images, missing 0, unrelated 0 | no overflow 1440/390/375/360; forms 1, orphan 0 | None |
| `/הובלת-דירה-מירושלים` | AREA | PASS | text 40/40, headings 14/14, links 5/5, FAQ 0/0, tables 0/0 | 24/24 source images, missing 0, unrelated 0 | no overflow 1440/390/375/360; forms 1, orphan 0 | None |
| `/שאלות-נפוצות` | FAQ | PASS (manual review) | text 70/70, headings 4/4, links 1/1, FAQ 10/10, tables 0/0 | 0/0 source images, missing 0, unrelated 0 | no overflow 1440/390/375/360; forms 1, orphan 0 | None |
| `/הובלות-דחופות-בירושלים` | SERVICE | PASS | text 79/79, headings 23/23, links 10/10, FAQ 5/5, tables 0/0 | 8/8 source images, missing 0, unrelated 0 | no overflow 1440/390/375/360; forms 1, orphan 0 | None |
| `/מחיר-אחסון-תכולה-בירושלים` | QUOTE | PASS | text 91/91, headings 25/25, links 2/2, FAQ 7/7, tables 0/0 | 9/9 source images, missing 0, unrelated 0 | no overflow 1440/390/375/360; forms 1, orphan 0 | None |
| `/מחירי-הובלת-דירות` | QUOTE | PASS (manual review) | text 61/61, headings 8/8, links 2/2, FAQ 0/0, tables 1/1 | 12/12 source images, missing 0, unrelated 0 | no overflow 1440/390/375/360; forms 2, orphan 0 | 2 forms = source calculator + final conversion form (both source-backed). |
| `/שירותי-הובלה` | SERVICE | PASS | text 48/48, headings 14/14, links 7/7, FAQ 5/5, tables 0/0 | 0/0 source images, missing 0, unrelated 0 | no overflow 1440/390/375/360; forms 1, orphan 0 | None |
| `/חברת-אריזה-והובלה-בירושלים` | SERVICE | PASS | text 57/57, headings 16/16, links 6/6, FAQ 5/5, tables 0/0 | 2/2 source images, missing 0, unrelated 0 | no overflow 1440/390/375/360; forms 1, orphan 0 | None |
| `/אחסון-תכולה-בירושלים` | STORAGE | PASS | text 75/75, headings 23/23, links 4/4, FAQ 7/7, tables 0/0 | 10/10 source images, missing 0, unrelated 0 | no overflow 1440/390/375/360; forms 1, orphan 0 | None |
| `/אחסון-תכולה-לטווח-ארוך` | STORAGE | PASS | text 38/38, headings 19/19, links 6/6, FAQ 9/9, tables 0/0 | 9/9 source images, missing 0, unrelated 0 | no overflow 1440/390/375/360; forms 1, orphan 0 | None |
| `/צרו-קשר` | CONTACT | PASS (manual review) | text 16/16, headings 5/5, links 12/12, FAQ 0/0, tables 0/0 | 0/0 source images, missing 0, unrelated 0 | no overflow 1440/390/375/360; forms 1, orphan 0 | Google Maps iframes (source embeds) render blank in headless screenshots only. |
| `/הצעת-מחיר` | QUOTE | PASS (manual review) | text 21/21, headings 3/3, links 1/1, FAQ 0/0, tables 0/0 | 12/12 source images, missing 0, unrelated 0 | no overflow 1440/390/375/360; forms 2, orphan 0 | 2 forms = source calculator + final conversion form (both source-backed). |
| `/הובלת-דירה-בירושלים` | SERVICE | PASS | text 82/82, headings 16/16, links 7/7, FAQ 5/5, tables 1/1 | 2/2 source images, missing 0, unrelated 0 | no overflow 1440/390/375/360; forms 1, orphan 0 | None |
| `/הובלות-קטנות-בירושלים` | SERVICE | PASS (manual review) | text 83/83, headings 22/22, links 7/7, FAQ 8/8, tables 0/0 | 2/2 source images, missing 0, unrelated 0 | no overflow 1440/390/375/360; forms 1, orphan 0 | None |
| `/מוביל-בירושלים-והסביבה` | AREA | PASS | text 49/49, headings 13/13, links 8/8, FAQ 0/0, tables 0/0 | 24/24 source images, missing 0, unrelated 0 | no overflow 1440/390/375/360; forms 1, orphan 0 | None |
| `/הובלת-משטחים-בירושלים` | SERVICE | PASS | text 49/49, headings 19/19, links 7/7, FAQ 5/5, tables 0/0 | 2/2 source images, missing 0, unrelated 0 | no overflow 1440/390/375/360; forms 1, orphan 0 | None |
| `/אחסון-תכולה-לטווח-קצר` | STORAGE | PASS | text 93/93, headings 21/21, links 8/8, FAQ 9/9, tables 0/0 | 8/8 source images, missing 0, unrelated 0 | no overflow 1440/390/375/360; forms 1, orphan 0 | None |
| `/הובלות-בבית-שמש` | AREA | PASS | text 52/52, headings 17/17, links 14/14, FAQ 0/0, tables 0/0 | 27/27 source images, missing 0, unrelated 0 | no overflow 1440/390/375/360; forms 1, orphan 0 | None |
| `/הובלות-באבו-גוש` | AREA | PASS | text 40/40, headings 13/13, links 10/10, FAQ 0/0, tables 0/0 | 24/24 source images, missing 0, unrelated 0 | no overflow 1440/390/375/360; forms 1, orphan 0 | None |
| `/הובלות-במודיעין` | AREA | PASS (manual review) | text 40/40, headings 13/13, links 9/9, FAQ 0/0, tables 0/0 | 24/24 source images, missing 0, unrelated 0 | no overflow 1440/390/375/360; forms 1, orphan 0 | None |
| `/הובלות-בגבעת-זאב` | AREA | PASS | text 41/41, headings 15/15, links 5/5, FAQ 0/0, tables 0/0 | 24/24 source images, missing 0, unrelated 0 | no overflow 1440/390/375/360; forms 1, orphan 0 | None |
| `/הובלות-במבשרת-ציון` | AREA | PASS | text 41/41, headings 14/14, links 5/5, FAQ 0/0, tables 0/0 | 24/24 source images, missing 0, unrelated 0 | no overflow 1440/390/375/360; forms 1, orphan 0 | None |
| `/הובלות-בפסגת-זאב` | AREA | PASS | text 40/40, headings 14/14, links 13/13, FAQ 0/0, tables 0/0 | 24/24 source images, missing 0, unrelated 0 | no overflow 1440/390/375/360; forms 1, orphan 0 | None |
| `/הובלות-בגוש-עציון` | AREA | PASS | text 46/46, headings 14/14, links 15/15, FAQ 0/0, tables 0/0 | 24/24 source images, missing 0, unrelated 0 | no overflow 1440/390/375/360; forms 1, orphan 0 | None |
| `/הובלות-בביתר-עילית` | AREA | PASS | text 40/40, headings 13/13, links 12/12, FAQ 0/0, tables 0/0 | 24/24 source images, missing 0, unrelated 0 | no overflow 1440/390/375/360; forms 1, orphan 0 | None |
| `/הובלת-פריט-בודד-בירושלים` | SERVICE | PASS | text 76/76, headings 22/22, links 6/6, FAQ 8/8, tables 0/0 | 2/2 source images, missing 0, unrelated 0 | no overflow 1440/390/375/360; forms 1, orphan 0 | None |
| `/הובלות-במעלה-אדומים` | AREA | PASS | text 40/40, headings 13/13, links 12/12, FAQ 0/0, tables 0/0 | 24/24 source images, missing 0, unrelated 0 | no overflow 1440/390/375/360; forms 1, orphan 0 | None |
| `/category/moving-by-region` | ARCHIVE | PASS | text 0/0, headings 0/0, links 0/0, FAQ 0/0, tables 0/0 | 0/0 source images, missing 0, unrelated 0 | no overflow 1440/390/375/360; forms 0, orphan 0 | None |
| `/category/moving-tips` | ARCHIVE | PASS (manual review) | text 0/0, headings 0/0, links 0/0, FAQ 0/0, tables 0/0 | 0/0 source images, missing 0, unrelated 0 | no overflow 1440/390/375/360; forms 0, orphan 0 | None |
| `/category/prices-costs` | ARCHIVE | PASS | text 0/0, headings 0/0, links 0/0, FAQ 0/0, tables 0/0 | 0/0 source images, missing 0, unrelated 0 | no overflow 1440/390/375/360; forms 0, orphan 0 | None |
| `/category/moving-services` | ARCHIVE | PASS | text 0/0, headings 0/0, links 0/0, FAQ 0/0, tables 0/0 | 0/0 source images, missing 0, unrelated 0 | no overflow 1440/390/375/360; forms 0, orphan 0 | None |
| `/tag/הובלות-בירושלים` | ARCHIVE | PASS (manual review) | text 0/0, headings 0/0, links 0/0, FAQ 0/0, tables 0/0 | 0/0 source images, missing 0, unrelated 0 | no overflow 1440/390/375/360; forms 0, orphan 0 | None |
| `/tag/הובלות-קטנות` | ARCHIVE | PASS | text 0/0, headings 0/0, links 0/0, FAQ 0/0, tables 0/0 | 0/0 source images, missing 0, unrelated 0 | no overflow 1440/390/375/360; forms 0, orphan 0 | None |
| `/tag/מעבר-דירה` | ARCHIVE | PASS | text 0/0, headings 0/0, links 0/0, FAQ 0/0, tables 0/0 | 0/0 source images, missing 0, unrelated 0 | no overflow 1440/390/375/360; forms 0, orphan 0 | None |
| `/author/guest_2020` | ARCHIVE | PASS | text 0/0, headings 0/0, links 0/0, FAQ 0/0, tables 0/0 | 0/0 source images, missing 0, unrelated 0 | no overflow 1440/390/375/360; forms 0, orphan 0 | None |

## Global notes

- Site footer (shared chrome, also on the homepage) still contains its existing quick name/phone form. It is outside `<main>`, unchanged, and not counted as a page form.
- Form submission goes to the existing `/api/contact` stub, which validates and acknowledges only (`emailSent: false`). No production email is enabled.
