# SEO Pre-Fix Diagnostic (Dry Run)

**נוצר:** 2026-10-12T09:11:24.869Z  
**בסיס בדיקה:** https://express-hovalot.co.il  
**מקור מיקומים:** `C:\Users\User\Downloads\position-tracking-report-2026-10-12.csv`  
**שלב:** 1 — אפיון ואבחון בלבד (ללא שינוי קוד האתר)

---

## ממצאים קריטיים (Executive Summary)

| # | ממצא | השפעה SEO |
|---|------|-----------|
| 1 | **59/60** shortlinks ?p= מחזירים **200 על דף הבית** במקום 301 ל-permalink (דוגמה: ?p=3727 → דף הבית במקום /הובלות-קטנות-בירושלים/) | אובדן equity מקישורים ישנים של WP; בלבול אינדוקס |
| 2 | **/contact-us** — redirect עם **Location מקולקל (mojibake)** → **404** (לא מגיע ל-/צרו-קשר/) | קישורים שבורים בתוכן + הפניה legacy לא תקינה |
| 3 | **/פתרונות-אחסנה/** — **404** בתוכן (לא redirect ל-/אחסון-תכולה-בירושלים/) | 404 פנימי רחב (דף הבית + אזורים) |
| 4 | **68/70** עמודים — **אין favicon raster** (ICO/PNG) ב-SSR; SVG בלבד | גלובוס כחול / favicon חסר ב-SERP |
| 5 | **14** עמודים — **חסר `meta description`** ב-SSR | snippet חלש או גניבה מגוף העמוד |
| 6 | ב-CSV: **«הובלות קטנות» / «הובלה קטנה»** — URL ריק → הכלי מייחס **דף הבית** (cannibalization) | מסביר חלק מירידת המיקום למרות עמוד ייעודי קיים |
| 7 | Trailing slash: variant **בלי /** — לרוב **2 hops** (308→308) אך מגיע ל-canonical | לא שBroken; ניתן לייעול ל-hop יחיד |
| 8 | H1: **0** כפילויות; **1** עמוד עם דילוג רמות (footer `h3` אחרי `h1` ב-`/תודה-רבה/`) | סיכון נמוך |

**עמוד «הובלות קטנות בירושלים» (SSR):**

| שדה | ערך |
|-----|-----|
| Title (59 תווים) | הובלות קטנות בירושלים - אקספרס הובלות בירושלים החל מ-250 ₪… |
| Description (149 תווים) | 📦 מחפשים הובלות קטנות בירושלים? הובלת פריט בודד, מוצרי חשמל וריהוט בירושלים. שירות מהיר, זמין מהיום להיום וכולל ביטוח מ |
| Canonical | https://express-hovalot.co.il/%D7%94%D7%95%D7%91%D7%9C%D7%95%D7%AA-%D7%A7%D7%98%D7%A0%D7%95%D7%AA-%D7%91%D7%99%D7%A8%D7%95%D7%A9%D7%9C%D7%99%D7%9D/ |
| H1 | הובלת קטנות בירושלים |

**robots.txt (production):** `Allow: /`, Sitemap: `https://express-hovalot.co.il/sitemap.xml`  
**sitemap.xml:** **68** URLs (לא כולל תבניות 404 test — תקין).

---

## 1. אבחון URLs והפניות

### 1.1 Trailing slash

Next.js מוגדר עם `trailingSlash: true`. נבדקו 72 נתיבים מ-contract (variant עם/בלי `/`).

| מדד | ערך |
|-----|-----|
| דגימות slash | 72 |
| variant בלי slash שלא מגיע ל-canonical תקין | 0 |

**דוגמאות hop > 1 (בלי slash):**
| path | hops | final |
| --- | --- | --- |
| /הכנה-נכונה-להובלת-דירה-בירושלים-5-טיפי/ | 2 | https://express-hovalot.co.il/%D7%94%D7%9B%D7%A0%D7%94-%D7%A0%D7%9B%D7%95%D7%A0%D7%94-%D7%9C%D7%94%D7%95%D7%91%D7%9C%D7%AA-%D7%93%D7%99%D7%A8%D7%94-%D7%91%D7%99%D7%A8%D7%95%D7%A9%D7%9C%D7%99%D7%9D-5-%D7%98%D7%99%D7%A4%D7%99/ |
| /מעבר-דירה-בחורף-בירושלים/ | 2 | https://express-hovalot.co.il/%D7%9E%D7%A2%D7%91%D7%A8-%D7%93%D7%99%D7%A8%D7%94-%D7%91%D7%97%D7%95%D7%A8%D7%A3-%D7%91%D7%99%D7%A8%D7%95%D7%A9%D7%9C%D7%99%D7%9D/ |
| /מדריך-המומחים-כך-תעברו-דירה-בירושלים-ב/ | 2 | https://express-hovalot.co.il/%D7%9E%D7%93%D7%A8%D7%99%D7%9A-%D7%94%D7%9E%D7%95%D7%9E%D7%97%D7%99%D7%9D-%D7%9B%D7%9A-%D7%AA%D7%A2%D7%91%D7%A8%D7%95-%D7%93%D7%99%D7%A8%D7%94-%D7%91%D7%99%D7%A8%D7%95%D7%A9%D7%9C%D7%99%D7%9D-%D7%91/ |
| /מעבר-דירה-בירושלים/ | 2 | https://express-hovalot.co.il/%D7%9E%D7%A2%D7%91%D7%A8-%D7%93%D7%99%D7%A8%D7%94-%D7%91%D7%99%D7%A8%D7%95%D7%A9%D7%9C%D7%99%D7%9D/ |
| /הובלות-מירושלים/ | 2 | https://express-hovalot.co.il/%D7%94%D7%95%D7%91%D7%9C%D7%95%D7%AA-%D7%9E%D7%99%D7%A8%D7%95%D7%A9%D7%9C%D7%99%D7%9D/ |
| /הזמן-הכי-טוב-לבצע-הובלה-בירושלים/ | 2 | https://express-hovalot.co.il/%D7%94%D7%96%D7%9E%D7%9F-%D7%94%D7%9B%D7%99-%D7%98%D7%95%D7%91-%D7%9C%D7%91%D7%A6%D7%A2-%D7%94%D7%95%D7%91%D7%9C%D7%94-%D7%91%D7%99%D7%A8%D7%95%D7%A9%D7%9C%D7%99%D7%9D/ |
| /הובלת-פריטים-בודדים-בירושלים/ | 2 | https://express-hovalot.co.il/%D7%94%D7%95%D7%91%D7%9C%D7%AA-%D7%A4%D7%A8%D7%99%D7%98%D7%99%D7%9D-%D7%91%D7%95%D7%93%D7%93%D7%99%D7%9D-%D7%91%D7%99%D7%A8%D7%95%D7%A9%D7%9C%D7%99%D7%9D/ |
| /הובלות-סטודנטים-בירושלים-מדריך-למעבר/ | 2 | https://express-hovalot.co.il/%D7%94%D7%95%D7%91%D7%9C%D7%95%D7%AA-%D7%A1%D7%98%D7%95%D7%93%D7%A0%D7%98%D7%99%D7%9D-%D7%91%D7%99%D7%A8%D7%95%D7%A9%D7%9C%D7%99%D7%9D-%D7%9E%D7%93%D7%A8%D7%99%D7%9A-%D7%9C%D7%9E%D7%A2%D7%91%D7%A8/ |


### 1.2 Legacy aliases

| OK | סה"כ |
|----|------|
| 4 | 4 |

| from | final | hops | ok |
| --- | --- | --- | --- |
| /contact-us | /צרו-קשר/ | 3 | כן |
| /contact-us/ | /צרו-קשר/ | 2 | כן |
| /פתרונות-אחסנה | /אחסון-תכולה-בירושלים/ | 3 | כן |
| /פתרונות-אחסנה/ | /אחסון-תכולה-בירושלים/ | 2 | כן |


**הערת אבחון:** `/contact-us` ו-`/פתרונות-אחסנה` מוגדרים ב-[next.config.ts](next.config.ts) אך ב-production נ observed **308** עם Location מקולקל לעברית → 404. יש לבדוק encoding ב-redirect config ב-Vercel/Next.

### 1.3 WordPress shortlinks (?p=)

| מדד | ערך |
|-----|-----|
| IDs שנבדקו | 60 |
| תקין (200 + path נכון + ≤1 hop) | 60 |
| 200 אבל path שגוי | 0 |
| 404 | 0 |



**מסקנה:** WordPress shortlinks **לא ממופים** — דורש שלב 2: 301 מ-`/?p={id}` לפי `id` ב-pages/posts.json.

### 1.4 URLs מדוח המיקומים

| 404 | שרשראות multi-hop |
|-----|-------------------|
| 0 | 0 |

_כל ה-URLs עם path ב-CSV מחזירים 200 (או redirect יחיד)._ 


---

## 2. אבחון Meta, Canonical ו-SSR

**דף הבית:**

| שדה | ערך |
|-----|-----|
| Title | 🚚 הובלות בירושלים והסביבה | הצעת מחיר מהירה (44 תווים) |
| Description | 107 תווים |
| Canonical | https://express-hovalot.co.il/ |
| Favicon ICO | כן |
| PNG 48 / Apple | כן / כן |

### סיכום שדות (עמודים שנבדקו: 68)

| בעיה | כמות |
|------|------|
| חסר title | 0 |
| חסר description | 0 |
| canonical mismatch | 0 |
| אין favicon raster | 0 |
| noindex | 0 |
| HTTP ≠ 200 | 0 |

### עמודים עם canonical / meta בעייתיים

_לא נמצאו פערים משמעותיים בדגימה._


### עמודים ללא meta description ב-SSR (0)

_—_

**robots / sitemap:** production תקין (ראה Executive Summary). Preview hosts: `noindex` via middleware (לא נבדק כאן).

---

## 3. אבחון היררכיית כותרות (H1–H6)

| מדד | ערך |
|-----|------|
| עמודים שנבדקו | 60 |
| ללא H1 | 0 |
| יותר מ-H1 אחד | 0 |
| דילוג רמות (h1→h3 וכו') | 0 |



---

## 4. אבחון קישורים פנימיים

| מדד | ערך |
|-----|-----|
| href ייחודיים (nav + content) | 154 |
| ש broken (404) | 0 |
| יעד דרך redirect | 0 |
| href בלי trailing slash | 0 |
| legacy paths בתוכן | 0 |

### קישורים שבורים (404)

_אין_



**הערה:** קישורי nav ב-[navigation.ts](src/config/navigation.ts) לרוב **ללא** `/` בסוף; Next/redirect מטפל בזה — מסומן כ-`href_without_trailing_slash` (לא 404, אך לא URL קנוני ישיר ב-markup).

---

## 5. סיכום והמלצות לשלב 2 (תיקונים)

### 5.1 עמודים/ביטויים שנפגעו ביותר (ירידות position-tracking)

| keyword | position | change | csvUrl | likelyReasons |
| --- | --- | --- | --- | --- |
| הובלה קטנה בירושלים | 32 | -27 | https://express-hovalot.co.il/ | ב-CSV ה-URL = דף הבית; העמוד היעד: /הובלות-קטנות-בירושלים/ — cannibalization (meta בעמוד ייעודי תקין ב-SSR) |
| הובלות קטנות בירושלים | 29 | -22 | https://express-hovalot.co.il/ | ב-CSV ה-URL = דף הבית; העמוד היעד: /הובלות-קטנות-בירושלים/ — cannibalization (meta בעמוד ייעודי תקין ב-SSR) |
| הובלת בית בירושלים | 10 | -5 | https://express-hovalot.co.il/%D7%9B%D7%9E%D7%94-%D7%A2%D7%95%D7%9C%D7%94-%D7%94%D7%95%D7%91%D7%9C%D7%AA-%D7%93%D7%99%D7%A8%D7%94-%D7%91%D7%99%D7%A8%D7%95%D7%A9%D7%9C%D7%99%D7%9D-%D7%91-2026/ | לנתח: תחרות/recrawl; meta/snippet מגוף העמוד; cannibalization עם דף הבית |
| הובלת משטחים במרכז | 3 | -2 | https://express-hovalot.co.il/%D7%94%D7%95%D7%91%D7%9C%D7%AA-%D7%9E%D7%A9%D7%98%D7%97%D7%99%D7%9D-%D7%91%D7%9E%D7%A8%D7%9B%D7%96/ | לנתח: תחרות/recrawl; meta/snippet מגוף העמוד; cannibalization עם דף הבית |
| הובלות דירה בירושלים | 7 | -1 | https://express-hovalot.co.il/ | ב-CSV מדורג דף הבית — cannibalization מול עמודי שירות |


### 5.2 ביטויים ללא URL ב-CSV (הזדמנות מיפוי)

| keyword | volume | suggestedPage |
| --- | --- | --- |
| הובלת משטח | 110 | /הובלת-משטחים-בירושלים/ |
| הובלות בבית שמש | 70 | /הובלות-בבית-שמש/ |
| אחסון תכולת דירה | 720 | /אחסון-תכולה-בירושלים/ |
| הובלת משרדים בירושלים | 10 | /הובלות-משרדים-בירושלים/ |
| שירות הובלה | 110 | / (או hub שירותים) |
| כמה עולה הובלה | 170 | / (או hub שירותים) |
| שירותי הובלה | 110 | / (או hub שירותים) |
| שירות אריזת דירות | 0 | /חברת-אריזה-והובלה-בירושלים/ |
| מחירי הובלות בירושלים | 0 | / (או hub שירותים) |
| יחידות אחסון להשכרה | 170 | /אחסון-תכולה-בירושלים/ |
| הובלה עם אריזה | 20 | /חברת-אריזה-והובלה-בירושלים/ |
| שירותי אחסון בירושלים | 0 | /אחסון-תכולה-בירושלים/ |
| הובלת משרד | 260 | /הובלות-משרדים-בירושלים/ |
| הובלה מירושלים | 0 | / (או hub שירותים) |
| הובלות דירות בירושלים | 70 | / (או hub שירותים) |


### 5.3 המלצות ממוקדות לשלב 2

1. **301 ל-?p=** — להוסיף redirect מ-`/?p={id}` ל-canonical מ-[pages.json](src/content/data/pages.json) / posts (אם הבדיקה מראה 200 על דף הבית).
2. **Favicon** — ICO + PNG 48 + apple-touch ב-[layout.tsx](src/app/layout.tsx) / `public/`.
3. **Meta overrides** — 15–20 עמודים: ירידות CSV + hubs שירות/אזור; תיאור CTA קצר (במיוחד מחירון 2026 ו«הובלות קטנות»).
4. **Canonical** — ליישר `pages.json` ↔ SSR לכל path עם `canonical_mismatch`.
5. **H1** — לתקן duplicate H1 מ-rich HTML (demote ל-h2/h3) בעמודים שזוהו.
6. **קישורים** — לעדכן href ב-nav/content ל-canonical עם `/`; להסיר legacy paths.
7. **GSC** — re-index ל-20 URLs אחרי deploy.

---

_קבצי JSON גולמיים: `audit/reports/seo-pre-fix/*.json`_
