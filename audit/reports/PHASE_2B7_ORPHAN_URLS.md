# Phase 2B.7: orphan URLs and inbound links

Generated 2026-10-08T11:40:59.555Z from `scripts/link-graph.ts`, comparing production (https://express-hovalot.co.il) with the local build (http://localhost:3010).

A URL counts as an orphan when no other page links to it from the body, navigation or footer. Body links are counted separately because navigation and footer links appear on every page.

## Result

- URLs checked: 68
- Full orphans (no body, navigation or footer inbound link): **3**
- Commercial orphans: **0**
- URLs whose only inbound links are navigation or footer: 1
- URLs whose body inbound count changed from production: 18
- URLs that lost a production body source: 0

## Full orphans

| URL | Type | Production body inbound |
| --- | --- | --- |
| `/tag/הובלות-בירושלים/` | archive | 0 |
| `/tag/הובלות-קטנות/` | archive | 0 |
| `/tag/מעבר-דירה/` | archive | 0 |

## Body inbound changes

| URL | Type | Production body inbound | Local body inbound | Change |
| --- | --- | --- | --- | --- |
| `/author/guest_2020/` | archive | 7 | 24 | +17 |
| `/category/prices-costs/` | archive | 2 | 17 | +15 |
| `/category/moving-by-region/` | archive | 7 | 17 | +10 |
| `/category/moving-tips/` | archive | 13 | 17 | +4 |
| `/מעבר-דירה-בחורף-בירושלים/` | article | 6 | 7 | +1 |
| `/מדריך-המומחים-כך-תעברו-דירה-בירושלים-ב/` | article | 11 | 12 | +1 |
| `/מעבר-דירה-בירושלים/` | article | 6 | 7 | +1 |
| `/הובלות-מירושלים/` | article | 5 | 6 | +1 |
| `/הזמן-הכי-טוב-לבצע-הובלה-בירושלים/` | article | 5 | 6 | +1 |
| `/הובלת-פריטים-בודדים-בירושלים/` | article | 5 | 6 | +1 |
| `/הובלות-סטודנטים-בירושלים-מדריך-למעבר/` | article | 8 | 9 | +1 |
| `/הובלות-מוצרי-חשמל-בירושלים/` | article | 2 | 3 | +1 |
| `/הובלות-בירושלים/` | article | 6 | 7 | +1 |
| `/הובלת-פריט-בודד-בירושלים-מדריך/` | article | 6 | 7 | +1 |
| `/חברת-אריזה-והובלה-בירושלים/` | commercial | 36 | 37 | +1 |
| `/צרו-קשר/` | commercial | 7 | 8 | +1 |
| `/הצעת-מחיר/` | commercial | 7 | 8 | +1 |
| `/category/moving-services/` | archive | 16 | 17 | +1 |

## All URLs

| URL | Type | Body inbound (prod → local) | Navigation (prod / local) | Footer (prod / local) |
| --- | --- | --- | --- | --- |
| `/author/guest_2020/` | archive | 7 → 24 | no / no | no / no |
| `/blog/` | archive | 1 → 1 | yes / yes | yes / yes |
| `/category/moving-by-region/` | archive | 7 → 17 | no / no | no / no |
| `/category/moving-services/` | archive | 16 → 17 | no / no | no / no |
| `/category/moving-tips/` | archive | 13 → 17 | no / no | no / no |
| `/category/prices-costs/` | archive | 2 → 17 | no / no | no / no |
| `/tag/הובלות-בירושלים/` | archive | 0 → 0 | no / no | no / no |
| `/tag/הובלות-קטנות/` | archive | 0 → 0 | no / no | no / no |
| `/tag/מעבר-דירה/` | archive | 0 → 0 | no / no | no / no |
| `/הובלות-בירושלים-2025/` | article | 20 → 20 | yes / yes | yes / yes |
| `/הובלות-בירושלים-המדריך-למעבר-דירה/` | article | 22 → 22 | yes / yes | yes / yes |
| `/הובלות-בירושלים/` | article | 6 → 7 | yes / yes | yes / yes |
| `/הובלות-מוצרי-חשמל-בירושלים/` | article | 2 → 3 | yes / yes | yes / yes |
| `/הובלות-מירושלים/` | article | 5 → 6 | yes / yes | yes / yes |
| `/הובלות-סטודנטים-בירושלים-מדריך-למעבר/` | article | 8 → 9 | yes / yes | yes / yes |
| `/הובלות-קטנות-בירושלים-המדריך-המלא/` | article | 22 → 22 | yes / yes | yes / yes |
| `/הובלת-דירה-הובלות-קטנות/` | article | 22 → 22 | yes / yes | yes / yes |
| `/הובלת-פריט-בודד-בירושלים-מדריך/` | article | 6 → 7 | no / no | no / no |
| `/הובלת-פריטים-בודדים-בירושלים/` | article | 5 → 6 | yes / yes | yes / yes |
| `/הזמן-הכי-טוב-לבצע-הובלה-בירושלים/` | article | 5 → 6 | yes / yes | yes / yes |
| `/הכנה-נכונה-להובלת-דירה-בירושלים-5-טיפי/` | article | 20 → 20 | yes / yes | yes / yes |
| `/כמה-עולה-הובלת-דירה-בירושלים-ב-2026/` | article | 20 → 20 | yes / yes | yes / yes |
| `/מדריך-המומחים-כך-תעברו-דירה-בירושלים-ב/` | article | 11 → 12 | no / no | no / no |
| `/מעבר-דירה-בחורף-בירושלים/` | article | 6 → 7 | yes / yes | yes / yes |
| `/מעבר-דירה-בירושלים/` | article | 6 → 7 | yes / yes | yes / yes |
| `/` | commercial | 54 → 54 | yes / yes | yes / yes |
| `/אחסון-משטחים/` | commercial | 1 → 1 | yes / yes | yes / yes |
| `/אחסון-תכולה-בירושלים/` | commercial | 32 → 32 | yes / yes | yes / yes |
| `/אחסון-תכולה-לטווח-ארוך/` | commercial | 2 → 2 | no / no | no / no |
| `/אחסון-תכולה-לטווח-קצר/` | commercial | 3 → 3 | yes / yes | yes / yes |
| `/אחסון-תכולת-דירה/` | commercial | 5 → 5 | yes / yes | yes / yes |
| `/הובלות-באבו-גוש/` | commercial | 9 → 9 | yes / yes | yes / yes |
| `/הובלות-באזור-ירושלים/` | commercial | 11 → 11 | yes / yes | yes / yes |
| `/הובלות-בבית-שמש/` | commercial | 13 → 13 | yes / yes | yes / yes |
| `/הובלות-בביתר-עילית/` | commercial | 3 → 3 | yes / yes | yes / yes |
| `/הובלות-בגבעת-זאב/` | commercial | 17 → 17 | yes / yes | yes / yes |
| `/הובלות-בגוש-עציון/` | commercial | 2 → 2 | yes / yes | yes / yes |
| `/הובלות-במבשרת-ציון/` | commercial | 18 → 18 | yes / yes | yes / yes |
| `/הובלות-במודיעין/` | commercial | 14 → 14 | yes / yes | yes / yes |
| `/הובלות-במעלה-אדומים/` | commercial | 14 → 14 | yes / yes | yes / yes |
| `/הובלות-בפסגת-זאב/` | commercial | 3 → 3 | yes / yes | yes / yes |
| `/הובלות-דחופות-בירושלים/` | commercial | 2 → 2 | yes / yes | yes / yes |
| `/הובלות-מיוחדות-בירושלים/` | commercial | 5 → 5 | yes / yes | yes / yes |
| `/הובלות-מנוף-בירושלים/` | commercial | 5 → 5 | no / no | no / no |
| `/הובלות-משרדים-בירושלים/` | commercial | 10 → 10 | yes / yes | yes / yes |
| `/הובלות-קטנות-בירושלים/` | commercial | 15 → 15 | yes / yes | yes / yes |
| `/הובלת-בית-בירושלים/` | commercial | 4 → 4 | yes / yes | yes / yes |
| `/הובלת-דירה-בירושלים/` | commercial | 30 → 30 | yes / yes | yes / yes |
| `/הובלת-דירה-מירושלים/` | commercial | 3 → 3 | yes / yes | yes / yes |
| `/הובלת-משטחים-בירושלים/` | commercial | 15 → 15 | yes / yes | yes / yes |
| `/הובלת-משטחים-במרכז/` | commercial | 1 → 1 | no / no | no / no |
| `/הובלת-פריט-בודד-בירושלים/` | commercial | 5 → 5 | yes / yes | yes / yes |
| `/הצעת-מחיר/` | commercial | 7 → 8 | yes / yes | yes / yes |
| `/חברת-אריזה-והובלה-בירושלים/` | commercial | 36 → 37 | yes / yes | yes / yes |
| `/מדריך-מעבר-דירה-ירושלים/` | commercial | 2 → 2 | yes / yes | yes / yes |
| `/מוביל-בירושלים-והסביבה/` | commercial | 3 → 3 | yes / yes | yes / yes |
| `/מחיר-אחסון-תכולה-בירושלים/` | commercial | 4 → 4 | yes / yes | yes / yes |
| `/מחירי-הובלת-דירות/` | commercial | 3 → 3 | yes / yes | yes / yes |
| `/צרו-קשר/` | commercial | 7 → 8 | yes / yes | yes / yes |
| `/שאלות-נפוצות/` | commercial | 1 → 1 | yes / yes | yes / yes |
| `/שירותי-הובלה/` | commercial | 15 → 15 | yes / yes | yes / yes |
| `/about-us/` | commercial | 1 → 1 | yes / yes | yes / yes |
| `/דף-נחיתה/` | utility/legal | 1 → 1 | no / no | no / no |
| `/תודה-רבה/` | utility/legal | 1 → 1 | no / no | no / no |
| `/accessibility-statement/` | utility/legal | 1 → 1 | no / no | yes / yes |
| `/privacy-policy/` | utility/legal | 2 → 2 | no / no | yes / yes |
| `/site-map/` | utility/legal | 0 → 0 | no / no | yes / yes |
| `/terms-of-use/` | utility/legal | 1 → 1 | no / no | yes / yes |
