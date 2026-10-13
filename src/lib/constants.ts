export const SITE_NAME = "אקספרס הובלות בירושלים";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://express-hovalot.co.il";
/** Visible format — matches legacy production site */
export const PHONE_DISPLAY = "052-500-55-73";
/** Normalized tel URI — no hyphens, no country prefix */
export const PHONE_TEL = "0525005573";
export const WHATSAPP_NUMBER = "972525005573";
export const WHATSAPP_DEFAULT_TEXT =
  "היי הגעתי דרך האתר ואשמח לקבל הצעת מחיר או להזמין הובלה";

export function whatsAppUrl(text = WHATSAPP_DEFAULT_TEXT) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}
