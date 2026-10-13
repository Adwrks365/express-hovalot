import type { PopupContextType } from "@/lib/popups/types";

function decodePath(path: string): string {
  try {
    return decodeURIComponent(path);
  } catch {
    return path;
  }
}

function norm(path: string): string {
  let p = decodePath(path);
  if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
  return p;
}

/** Paths where auto popup must never run (manual triggers may still work where allowed). */
export const AUTO_EXCLUDED_PATHS = new Set([
  "/צרו-קשר",
  "/הצעת-מחיר",
  "/privacy-policy",
  "/terms-of-use",
  "/accessibility-statement",
  "/תודה-רבה",
]);

export const ROUTE_EXCLUDED_PREFIXES = ["/category/", "/tag/", "/author/"];

export function isRouteExcludedFromAuto(path: string): boolean {
  const p = norm(path);
  if (AUTO_EXCLUDED_PATHS.has(p)) return true;
  if (p === "/צרו-קשר" || p === "/הצעת-מחיר") return true;
  return ROUTE_EXCLUDED_PREFIXES.some((prefix) => p.startsWith(prefix));
}

export function isManualOnlyRoute(path: string): boolean {
  const p = norm(path);
  return (
    p === "/צרו-קשר" ||
    p === "/הצעת-מחיר" ||
    p === "/privacy-policy" ||
    p === "/terms-of-use" ||
    p === "/accessibility-statement"
  );
}

export function resolveServiceContext(path: string, title: string, template: "service" | "location" | "standard"): PopupContextType {
  const p = norm(path);
  const blob = `${p} ${title}`.toLowerCase();

  if (/מנוף|מורכב|פסנתר|כספת|פריטים\s*כבדים/.test(blob)) return "crane-special";
  if (/אחסון|אחסנה/.test(blob)) return "storage";
  if (/אריז/.test(blob)) return "packing";
  if (/משרד|עסק|חברה/.test(blob)) return "office-moving";
  if (/קטנ|פריט\s*בודד|מעבר\s*קטן|רהיט/.test(blob)) return "small-moves";
  if (/דירה|דירות|מעבר\s*דירה/.test(blob)) return "apartment-moving";
  if (/מחיר|מחירון|עלות/.test(blob)) return "price-quote";
  if (template === "location" || /ירושלים|גבעת|מבשרת|בית\s*שמש|מעלה\s*אדומים|אזור/.test(blob)) {
    return "jerusalem-area";
  }
  return "moving-general";
}

export function areaHeadlineFromTitle(title: string): string | undefined {
  const t = title.trim();
  if (!t) return undefined;
  if (t.endsWith("?")) return t;
  if (/^הובלות\s/.test(t)) return `צריכים ${t.replace(/^הובלות/, "הובלה")}?`;
  if (/^הובלת\s/.test(t)) return `צריכים ${t}?`;
  if (/בירושלים|באזור/.test(t)) return `צריכים ${t}?`;
  return undefined;
}
