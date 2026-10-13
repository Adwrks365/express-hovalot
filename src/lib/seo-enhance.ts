import type { SeoFields } from "@/lib/seo";
import { classifySeoPage } from "@/lib/seo-page-types";
import { normalizePathname } from "@/lib/paths";
import seoOverrides from "@/content/seo-overrides.json";

type OverrideEntry = { title?: string; description?: string };

const overrides = seoOverrides as Record<string, OverrideEntry>;

const EMOJI: Record<string, string> = {
  home: "🚚",
  service: "🚚",
  area: "📍",
  storage: "🗄️",
  hub: "📋",
  blog: "💡",
  legal: "📄",
  other: "✅",
};

function trimLen(text: string, max: number): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trim()}…`;
}

function defaultDescription(kind: string, title: string): string {
  const e = EMOJI[kind] ?? "✅";
  const base = title.replace(/\s*-\s*אקספרס.*$/i, "").trim();
  switch (kind) {
    case "service":
      return `${e} ${base} בירושלים — שירות מקצועי, ביטוח מלא והצעת מחיר מהירה. התקשרו עכשיו!`;
    case "area":
      return `${e} הובלות ב${base.replace(/^הובלות\s+/u, "")} — צוות מקומי, מחירים הוגנים. קבלו הצעת מחיר ללא התחייבות.`;
    case "storage":
      return `${e} ${base} — אחסון מאובטח בירושלים. פתרון גמיש לטווח קצר או ארוך. בקשו הצעה היום!`;
    case "hub":
      return `${e} כל ${base} במקום אחד — השוו שירותים וקבלו הצעת מחיר מהירה מאקספרס הובלות.`;
    case "legal":
      return `${e} ${base} — אקספרס הובלות בירושלים. מידע שקוף ללקוחותינו.`;
    default:
      return `${e} ${base} — אקספרס הובלות בירושלים. שירות אמין והצעת מחיר מהירה.`;
  }
}

function sanitizeDescription(desc: string): string {
  return desc.replace(/;/g, ",").replace(/\s+/g, " ").trim();
}

export function enhanceSeoFields(base: SeoFields, path: string): SeoFields {
  const p = normalizePathname(path);
  const override = overrides[p] ?? overrides[p.replace(/\/$/, "")];
  const kind = classifySeoPage(p);

  let title = override?.title || base.title || "";
  let description = override?.description || base.description || "";

  if (!description) {
    description = defaultDescription(kind, title || "שירותי הובלה בירושלים");
  }
  description = sanitizeDescription(description);

  if (!override?.title && title && !/^[\p{Extended_Pictographic}]/u.test(title)) {
    const e = EMOJI[kind] ?? "";
    if (e && title.length < 55) title = `${e} ${title}`;
  }

  return {
    ...base,
    title: trimLen(title, 60),
    description: trimLen(description, 160),
  };
}
