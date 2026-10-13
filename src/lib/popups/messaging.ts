import type { PopupContextType, PopupMessaging } from "@/lib/popups/types";

const BRAND = "אקספרס הובלות";

const BASE: Record<PopupContextType, PopupMessaging> = {
  "moving-general": {
    brandLabel: BRAND,
    headline: "מתכננים מעבר? בואו נעשה לכם סדר",
    description: "השאירו פרטים ונחזור אליכם עם הצעת מחיר מותאמת להובלה שלכם.",
    cta: "קבלו הצעת מחיר",
    reassurance: "ללא התחייבות",
  },
  "apartment-moving": {
    brandLabel: BRAND,
    headline: "עוברים דירה בירושלים?",
    description: "ספרו לנו מאיפה, לאן ומתי — ונחזור אליכם עם הצעת מחיר להובלה.",
    cta: "קבלו הצעת מחיר להובלה",
    reassurance: "ללא התחייבות",
  },
  "small-moves": {
    brandLabel: BRAND,
    headline: "צריכים הובלה קטנה ומהירה?",
    description: "פריט בודד, כמה רהיטים או מעבר קטן? השאירו פרטים ונחזור אליכם.",
    cta: "קבלו הצעה",
    reassurance: "ללא התחייבות",
  },
  "office-moving": {
    brandLabel: BRAND,
    headline: "מתכננים מעבר משרד?",
    description: "נשמח להבין את היקף המעבר ולחזור אליכם עם הצעה מסודרת.",
    cta: "קבלו הצעת מחיר",
    reassurance: "ללא התחייבות",
  },
  storage: {
    brandLabel: BRAND,
    headline: "צריכים פתרון אחסון?",
    description: "ספרו לנו מה אתם צריכים לאחסן ולכמה זמן — ונחזור אליכם עם פתרון מתאים.",
    cta: "קבלו הצעה לאחסון",
    reassurance: "ללא התחייבות",
  },
  packing: {
    brandLabel: BRAND,
    headline: "צריכים עזרה באריזה לקראת המעבר?",
    description: "השאירו פרטים ונחזור אליכם לגבי שירותי אריזה והובלה.",
    cta: "בואו נתכנן את המעבר",
    reassurance: "ללא התחייבות",
  },
  "crane-special": {
    brandLabel: BRAND,
    headline: "יש פריט מורכב להובלה?",
    description: "ספרו לנו מה צריך להעביר ונבדוק את הדרך הבטוחה והמתאימה לבצע את ההובלה.",
    cta: "קבלו הצעה",
    reassurance: "ללא התחייבות",
  },
  "jerusalem-area": {
    brandLabel: BRAND,
    headline: "מחפשים חברת הובלות באזור ירושלים?",
    description: "השאירו פרטים ונחזור אליכם עם הצעה בהתאם למעבר שלכם.",
    cta: "קבלו הצעת מחיר",
    reassurance: "ללא התחייבות",
  },
  "price-quote": {
    brandLabel: BRAND,
    headline: "רוצים לקבל הצעת מחיר מדויקת?",
    description: "ספרו לנו כמה פרטים על המעבר ונחזור אליכם.",
    cta: "קבלו הצעת מחיר",
    reassurance: "ללא התחייבות",
  },
  article: {
    brandLabel: BRAND,
    headline: "מתכננים מעבר? בואו נעשה לכם סדר",
    description: "השאירו פרטים ונחזור אליכם עם הצעת מחיר מותאמת להובלה שלכם.",
    cta: "קבלו הצעת מחיר",
    reassurance: "ללא התחייבות",
  },
  general: {
    brandLabel: BRAND,
    headline: "צריכים עזרה עם ההובלה?",
    description: "השאירו פרטים ונחזור אליכם בהקדם.",
    cta: "קבלו הצעת מחיר",
    reassurance: "ללא התחייבות",
  },
};

export function getPopupMessaging(
  context: PopupContextType,
  opts?: { areaHeadline?: string; pageTitle?: string },
): PopupMessaging {
  const base = { ...BASE[context] };
  if (context === "jerusalem-area" && opts?.areaHeadline) {
    base.headline = opts.areaHeadline;
  } else if (context === "jerusalem-area" && opts?.pageTitle) {
    const t = opts.pageTitle.trim();
    if (/הובל/.test(t) && t.length < 80) {
      base.headline = t.endsWith("?") ? t : `צריכים ${t.replace(/^הובלות\s*/i, "הובלה ")}?`;
    }
  }
  return base;
}
