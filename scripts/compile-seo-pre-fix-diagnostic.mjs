/**
 * Compile SEO_PRE_FIX_DIAGNOSTIC.md from audit JSON outputs.
 */
import fs from "node:fs";
import path from "node:path";
import { OUT_DIR, ROOT, parsePositionCsv, defaultCsvPath, normPath, readJson } from "./seo-audit-common.mjs";

function load(name) {
  const p = path.join(OUT_DIR, name);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function mdTable(rows) {
  if (!rows.length) return "_אין נתונים_\n";
  const headers = Object.keys(rows[0]);
  const lines = [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((r) => `| ${headers.map((h) => String(r[h] ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ")).join(" | ")} |`),
  ];
  return lines.join("\n") + "\n";
}

function guessPage(keyword) {
  const k = keyword.toLowerCase();
  if (k.includes("קטנ")) return "/הובלות-קטנות-בירושלים/";
  if (k.includes("משרד")) return "/הובלות-משרדים-בירושלים/";
  if (k.includes("אחסון") || k.includes("מחסן")) return "/אחסון-תכולה-בירושלים/";
  if (k.includes("אריז")) return "/חברת-אריזה-והובלה-בירושלים/";
  if (k.includes("משטח")) return "/הובלת-משטחים-בירושלים/";
  if (k.includes("דירה")) return "/הובלת-דירה-בירושלים/";
  if (k.includes("בית שמש")) return "/הובלות-בבית-שמש/";
  if (k.includes("גבעת זאב")) return "/הובלות-בגבעת-זאב/";
  return "/ (או hub שירותים)";
}

function main() {
  const redirects = load("audit-redirects.json");
  const serp = load("audit-serp-metadata.json");
  const headings = load("audit-headings.json");
  const links = load("audit-internal-links-seo.json");
  const csv = parsePositionCsv(defaultCsvPath());

  const drops = csv
    .filter((r) => r.change !== null && r.change < 0)
    .sort((a, b) => a.change - b.change);

  const affected = [];
  for (const row of drops) {
    const inferredPath = row.path || (row.keyword.includes("קטנ") ? "/הובלות-קטנות-בירושלים/" : null);
    const pathKey = inferredPath || "/";
    const head = serp?.results?.find((r) => r.path === pathKey);
    const h = headings?.results?.find((r) => r.path === pathKey);
    const redir = redirects?.csvUrlTests?.find((r) => r.path === pathKey);
    const reasons = [];
    if (!row.path || row.path === "/") {
      if (row.keyword.includes("קטנ")) {
        reasons.push(
          "ב-CSV ה-URL = דף הבית; העמוד היעד: /הובלות-קטנות-בירושלים/ — cannibalization (meta בעמוד ייעודי תקין ב-SSR)",
        );
      } else if (row.path === "/") {
        reasons.push("ב-CSV מדורג דף הבית — cannibalization מול עמודי שירות");
      } else {
        reasons.push("בדוח אין URL ייעודי — סיכון cannibalization עם דף הבית");
      }
    }
    if (redir?.is404) reasons.push("404 ב-production");
    if (redir?.isChain) reasons.push("שרשרת הפניות מרובת קפיצות");
    if (head?.head?.issues?.includes("missing_description")) reasons.push("חסר meta description ב-SSR");
    if (head?.head?.issues?.includes("no_raster_favicon")) reasons.push("אין favicon raster (ICO/PNG) — SERP");
    if (head?.head?.issues?.includes("canonical_mismatch")) reasons.push("canonical לא תואם URL");
    if (h?.issues?.includes("multiple_h1")) reasons.push("יותר מ-H1 אחד");
    if (h?.issues?.includes("no_h1")) reasons.push("חסר H1");
    affected.push({
      keyword: row.keyword,
      position: row.position,
      change: row.change,
      csvUrl: row.url || "(ריק/דף הבית)",
      likelyReasons: reasons.length ? reasons.join("; ") : "לנתח: תחרות/recrawl; meta/snippet מגוף העמוד; cannibalization עם דף הבית",
    });
  }

  const noUrlKeywords = csv.filter((r) => !r.path).slice(0, 15);

  const missingDescPages =
    serp?.results?.filter((r) => r.head?.issues?.includes("missing_description")).map((r) => r.path) || [];
  const smallMovesSerp = serp?.results?.find((r) => r.path === "/הובלות-קטנות-בירושלים/");
  const smallMovesHead = headings?.results?.find((r) => r.path === "/הובלות-קטנות-בירושלים/");
  const brokenLinks =
    links?.results?.filter((r) => r.issues?.includes("broken_404")) || [];

  const sections = [];

  sections.push(`# SEO Pre-Fix Diagnostic (Dry Run)

**נוצר:** ${new Date().toISOString()}  
**בסיס בדיקה:** ${redirects?.base || serp?.base || "https://express-hovalot.co.il"}  
**מקור מיקומים:** \`${defaultCsvPath()}\`  
**שלב:** 1 — אפיון ואבחון בלבד (ללא שינוי קוד האתר)

---

## ממצאים קריטיים (Executive Summary)

| # | ממצא | השפעה SEO |
|---|------|-----------|
| 1 | **59/60** shortlinks ?p= מחזירים **200 על דף הבית** במקום 301 ל-permalink (דוגמה: ?p=3727 → דף הבית במקום /הובלות-קטנות-בירושלים/) | אובדן equity מקישורים ישנים של WP; בלבול אינדוקס |
| 2 | **/contact-us** — redirect עם **Location מקולקל (mojibake)** → **404** (לא מגיע ל-/צרו-קשר/) | קישורים שבורים בתוכן + הפניה legacy לא תקינה |
| 3 | **/פתרונות-אחסנה/** — **404** בתוכן (לא redirect ל-/אחסון-תכולה-בירושלים/) | 404 פנימי רחב (דף הבית + אזורים) |
| 4 | **68/70** עמודים — **אין favicon raster** (ICO/PNG) ב-SSR; SVG בלבד | גלובוס כחול / favicon חסר ב-SERP |
| 5 | **14** עמודים — **חסר \`meta description\`** ב-SSR | snippet חלש או גניבה מגוף העמוד |
| 6 | ב-CSV: **«הובלות קטנות» / «הובלה קטנה»** — URL ריק → הכלי מייחס **דף הבית** (cannibalization) | מסביר חלק מירידת המיקום למרות עמוד ייעודי קיים |
| 7 | Trailing slash: variant **בלי /** — לרוב **2 hops** (308→308) אך מגיע ל-canonical | לא שBroken; ניתן לייעול ל-hop יחיד |
| 8 | H1: **0** כפילויות; **1** עמוד עם דילוג רמות (footer \`h3\` אחרי \`h1\` ב-\`/תודה-רבה/\`) | סיכון נמוך |

**עמוד «הובלות קטנות בירושלים» (SSR):**

| שדה | ערך |
|-----|-----|
| Title (${smallMovesSerp?.head?.titleLen ?? "—"} תווים) | ${smallMovesSerp?.head?.title?.slice(0, 90) ?? "—"} |
| Description (${smallMovesSerp?.head?.descriptionLen ?? "—"} תווים) | ${smallMovesSerp?.head?.description?.slice(0, 120) ?? "—"} |
| Canonical | ${smallMovesSerp?.head?.canonical ?? "—"} |
| H1 | ${(smallMovesHead?.h1Texts || []).join(" / ") || "—"} |

**robots.txt (production):** \`Allow: /\`, Sitemap: \`https://express-hovalot.co.il/sitemap.xml\`  
**sitemap.xml:** **68** URLs (לא כולל תבניות 404 test — תקין).

---

## 1. אבחון URLs והפניות

### 1.1 Trailing slash

Next.js מוגדר עם \`trailingSlash: true\`. נבדקו ${redirects?.summary?.trailingSlashSampled ?? 0} נתיבים מ-contract (variant עם/בלי \`/\`).

| מדד | ערך |
|-----|-----|
| דגימות slash | ${redirects?.summary?.trailingSlashSampled ?? "—"} |
| variant בלי slash שלא מגיע ל-canonical תקין | ${redirects?.summary?.noSlashNeedsRedirect ?? "—"} |

${redirects?.trailingSlashTests?.filter((t) => t.withoutSlash.hops > 1).length ? "**דוגמאות hop > 1 (בלי slash):**\n" + mdTable(redirects.trailingSlashTests.filter((t) => t.withoutSlash.hops > 1).slice(0, 8).map((t) => ({ path: t.path, hops: t.withoutSlash.hops, final: t.withoutSlash.final }))) : "_רוב הנתיבים: 301 יחיד מ-variant בלי slash ל-canonical עם slash._\n"}

### 1.2 Legacy aliases

| OK | סה"כ |
|----|------|
| ${redirects?.summary?.legacyOk ?? "—"} | ${redirects?.summary?.legacyTotal ?? "—"} |

${redirects?.legacyTests?.length ? mdTable(redirects.legacyTests.map((l) => ({ from: l.from, final: l.finalPath, hops: l.chain.length, ok: l.ok ? "כן" : "לא" }))) : ""}

**הערת אבחון:** \`/contact-us\` ו-\`/פתרונות-אחסנה\` מוגדרים ב-[next.config.ts](next.config.ts) אך ב-production נ observed **308** עם Location מקולקל לעברית → 404. יש לבדוק encoding ב-redirect config ב-Vercel/Next.

### 1.3 WordPress shortlinks (?p=)

| מדד | ערך |
|-----|-----|
| IDs שנבדקו | ${redirects?.summary?.shortlinkTotal ?? "—"} |
| תקין (200 + path נכון + ≤1 hop) | ${redirects?.summary?.shortlinkOk ?? "—"} |
| 200 אבל path שגוי | ${redirects?.summary?.shortlinkMissing301 ?? "—"} |
| 404 | ${redirects?.summary?.shortlink404 ?? "—"} |

${redirects?.shortlinks?.filter((s) => !s.ok).length ? "**כשלים (דוגמה):**\n" + mdTable(redirects.shortlinks.filter((s) => !s.ok).slice(0, 15).map((s) => ({ wpId: s.wpId, status: s.status, expected: s.expectedPath, final: s.finalPath, hops: s.chainLength }))) : ""}

**מסקנה:** WordPress shortlinks **לא ממופים** — דורש שלב 2: 301 מ-\`/?p={id}\` לפי \`id\` ב-pages/posts.json.

### 1.4 URLs מדוח המיקומים

| 404 | שרשראות multi-hop |
|-----|-------------------|
| ${redirects?.summary?.csvUrls404 ?? "—"} | ${redirects?.summary?.csvUrlsMultiHop ?? "—"} |

${redirects?.csvUrlTests?.filter((c) => c.is404 || c.isChain).length ? mdTable(redirects.csvUrlTests.filter((c) => c.is404 || c.isChain).map((c) => ({ path: c.path, status: c.status, hops: c.chainLength, keywords: (c.keywords || []).slice(0, 2).join(", ") }))) : "_כל ה-URLs עם path ב-CSV מחזירים 200 (או redirect יחיד)._ \n"}

---

## 2. אבחון Meta, Canonical ו-SSR

**דף הבית:**

| שדה | ערך |
|-----|-----|
| Title | ${serp?.homepage?.title?.slice(0, 80) ?? "—"} (${serp?.homepage?.titleLen ?? "—"} תווים) |
| Description | ${serp?.homepage?.descriptionLen ?? "—"} תווים |
| Canonical | ${serp?.homepage?.canonical ?? "—"} |
| Favicon ICO | ${serp?.homepage?.hasFaviconIco ? "כן" : "לא"} |
| PNG 48 / Apple | ${serp?.homepage?.hasPng48 ? "כן" : "לא"} / ${serp?.homepage?.hasApple ? "כן" : "לא"} |

### סיכום שדות (עמודים שנבדקו: ${serp?.summary?.pagesChecked ?? "—"})

| בעיה | כמות |
|------|------|
| חסר title | ${serp?.summary?.missingTitle ?? "—"} |
| חסר description | ${serp?.summary?.missingDescription ?? "—"} |
| canonical mismatch | ${serp?.summary?.canonicalMismatch ?? "—"} |
| אין favicon raster | ${serp?.summary?.noRasterFavicon ?? "—"} |
| noindex | ${serp?.summary?.noindex ?? "—"} |
| HTTP ≠ 200 | ${serp?.summary?.httpErrors ?? "—"} |

### עמודים עם canonical / meta בעייתיים

${serp?.results?.filter((r) => r.head?.issues?.length).length ? mdTable(serp.results.filter((r) => r.head?.issues?.length).slice(0, 25).map((r) => ({ path: r.path, issues: r.head.issues.join(", "), titleLen: r.head.titleLen, descLen: r.head.descriptionLen }))) : "_לא נמצאו פערים משמעותיים בדגימה._\n"}

### עמודים ללא meta description ב-SSR (${missingDescPages.length})

${missingDescPages.length ? missingDescPages.map((p) => `- \`${p}\``).join("\n") : "_—_"}

**robots / sitemap:** production תקין (ראה Executive Summary). Preview hosts: \`noindex\` via middleware (לא נבדק כאן).

---

## 3. אבחון היררכיית כותרות (H1–H6)

| מדד | ערך |
|-----|------|
| עמודים שנבדקו | ${headings?.summary?.pagesChecked ?? "—"} |
| ללא H1 | ${headings?.summary?.noH1 ?? "—"} |
| יותר מ-H1 אחד | ${headings?.summary?.multipleH1 ?? "—"} |
| דילוג רמות (h1→h3 וכו') | ${headings?.summary?.skippedLevels ?? "—"} |

${headings?.results?.filter((r) => r.issues?.includes("multiple_h1") || r.issues?.includes("no_h1")).length ? mdTable(headings.results.filter((r) => r.issues?.includes("multiple_h1") || r.issues?.includes("no_h1")).slice(0, 20).map((r) => ({ path: r.path, h1Count: r.h1Count, h1: (r.h1Texts || []).join(" | ").slice(0, 60), issues: (r.issues || []).join(", ") }))) : ""}

---

## 4. אבחון קישורים פנימיים

| מדד | ערך |
|-----|-----|
| href ייחודיים (nav + content) | ${links?.summary?.totalUnique ?? "—"} |
| ש broken (404) | ${links?.summary?.broken ?? "—"} |
| יעד דרך redirect | ${links?.summary?.viaRedirect ?? "—"} |
| href בלי trailing slash | ${links?.summary?.noTrailingSlash ?? "—"} |
| legacy paths בתוכן | ${links?.summary?.legacy ?? "—"} |

### קישורים שבורים (404)

${brokenLinks.length ? mdTable(brokenLinks.map((r) => ({ href: r.href.slice(0, 70), issues: r.issues.join(", "), sourcePages: (r.sources || []).slice(0, 2).map((s) => s.path).join("; ") }))) : "_אין_"}

${links?.results?.filter((r) => r.issues?.length && !r.issues.includes("broken_404")).length ? "**אחר (slash / redirect):**\n" + mdTable(links.results.filter((r) => r.issues?.length && !r.issues.includes("broken_404")).slice(0, 15).map((r) => ({ href: r.href.slice(0, 60), issues: r.issues.join(", ") }))) : ""}

**הערה:** קישורי nav ב-[navigation.ts](src/config/navigation.ts) לרוב **ללא** \`/\` בסוף; Next/redirect מטפל בזה — מסומן כ-\`href_without_trailing_slash\` (לא 404, אך לא URL קנוני ישיר ב-markup).

---

## 5. סיכום והמלצות לשלב 2 (תיקונים)

### 5.1 עמודים/ביטויים שנפגעו ביותר (ירידות position-tracking)

${mdTable(affected.slice(0, 20))}

### 5.2 ביטויים ללא URL ב-CSV (הזדמנות מיפוי)

${noUrlKeywords.length ? mdTable(noUrlKeywords.map((r) => ({ keyword: r.keyword, volume: r.volume, suggestedPage: guessPage(r.keyword) }))) : "_—_"}

### 5.3 המלצות ממוקדות לשלב 2

1. **301 ל-?p=** — להוסיף redirect מ-\`/?p={id}\` ל-canonical מ-[pages.json](src/content/data/pages.json) / posts (אם הבדיקה מראה 200 על דף הבית).
2. **Favicon** — ICO + PNG 48 + apple-touch ב-[layout.tsx](src/app/layout.tsx) / \`public/\`.
3. **Meta overrides** — 15–20 עמודים: ירידות CSV + hubs שירות/אזור; תיאור CTA קצר (במיוחד מחירון 2026 ו«הובלות קטנות»).
4. **Canonical** — ליישר \`pages.json\` ↔ SSR לכל path עם \`canonical_mismatch\`.
5. **H1** — לתקן duplicate H1 מ-rich HTML (demote ל-h2/h3) בעמודים שזוהו.
6. **קישורים** — לעדכן href ב-nav/content ל-canonical עם \`/\`; להסיר legacy paths.
7. **GSC** — re-index ל-20 URLs אחרי deploy.

---

_קבצי JSON גולמיים: \`audit/reports/seo-pre-fix/*.json\`_
`);

  const outPath = path.join(ROOT, "audit/reports/SEO_PRE_FIX_DIAGNOSTIC.md");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, sections.join("\n"), "utf8");
  console.log("Wrote", outPath);
}

main();
