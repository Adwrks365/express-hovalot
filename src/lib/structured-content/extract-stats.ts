import * as cheerio from "cheerio";

/** Detect numeric trust/stat blocks from source HTML */
export function extractStatsItems(html: string): { label: string; value?: string }[] {
  const $ = cheerio.load(`<div>${html}</div>`, {}, false);
  const items: { label: string; value?: string }[] = [];
  const seen = new Set<string>();

  const push = (value: string | undefined, label: string) => {
    const key = `${value || ""}|${label}`;
    if (seen.has(key) || label.length < 3) return;
    seen.add(key);
    items.push({ value: value || undefined, label });
  };

  $(".elementor-counter-number, .elementor-counter-title").each((_, el) => {
    const num = $(el).hasClass("elementor-counter-number")
      ? $(el).text().replace(/\s+/g, " ").trim()
      : null;
    const title = $(el).hasClass("elementor-counter-title")
      ? $(el).text().replace(/\s+/g, " ").trim()
      : $(el).next(".elementor-counter-title").text().replace(/\s+/g, " ").trim();
    if (num && title) push(num, title);
  });

  $("h3, h4, strong, b").each((_, el) => {
    const text = $(el).text().replace(/\s+/g, " ").trim();
    const numMatch = text.match(/^(\d[\d,+]*\+?)\s*(.+)$/);
    if (numMatch) {
      push(numMatch[1], numMatch[2]!.trim());
      return;
    }
    const next = $(el).next();
    const num = next.text().match(/^(\d[\d,+]*\+?)/);
    if (num && text.length <= 60) push(num[1], text);
  });

  if (items.length >= 2) return items.slice(0, 6);

  const plain = html.replace(/<[^>]+>/g, " ");
  const regex = /(\d{1,4}\+?)\s+([^\d\n]{4,48}?)(?=\d{1,4}\+?|$)/g;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(plain)) !== null) {
    push(m[1], m[2]!.replace(/\s+/g, " ").trim());
  }

  return items.length >= 2 ? items.slice(0, 6) : [];
}

export function looksLikeStatsSection(heading: string | null, html: string): boolean {
  const h = heading || "";
  if (/למה לבחור|ניסיון|לקוחות|שנות|מומח/i.test(h) && /\d+\+?/.test(html)) return true;
  return extractStatsItems(html).length >= 2;
}
