import type { NavItem } from "@/config/navigation";
import { mainNavigation } from "@/config/navigation";
import { homepageContact } from "@/content/homepage-content";
import { PHONE_DISPLAY, PHONE_TEL, whatsAppUrl } from "@/lib/constants";

export type FooterLinkItem = {
  label: string;
  href: string;
};

export type ExternalFooterLink = FooterLinkItem & {
  external: true;
};

/** Verbatim production footer about block — Elementor footer template */
export const footerAbout = {
  title: "אודותינו",
  description:
    "חברת הובלות אקספרס נוסדה לפני למעלה מחמש עשרה שנה והינה בעלת ותק וגם ניסיון רב ביותר בתחום ההובלה, האריזה וגם האחסנה. החברה מתמחה בביצוע הובלות בירושלים והסביבה, כולל שירותי אריזה ואחסנה ברמה הגבוהה ביותר וברמת מקצועיות עילאית.",
};

export const footerContact = {
  title: "צרו איתנו קשר",
  officeTitle: homepageContact.officeTitle,
  address: homepageContact.address,
  phone: PHONE_DISPLAY,
  phoneHref: `tel:${PHONE_TEL}`,
  email: homepageContact.email,
};

export const footerServiceAreas: FooterLinkItem[] = [
  { label: "ירושלים", href: "/" },
  { label: "מודיעין", href: "/הובלות-במודיעין" },
  { label: "גוש עציון", href: "/הובלות-בגוש-עציון" },
  { label: "פסגת זאב", href: "/הובלות-בפסגת-זאב" },
  { label: "מעלה אדומים", href: "/הובלות-במעלה-אדומים" },
  { label: "בית שמש", href: "/הובלות-בבית-שמש" },
  { label: "ביתר עילית", href: "/הובלות-בביתר-עילית" },
  { label: "מבשרת ציון", href: "/הובלות-במבשרת-ציון" },
];

export const footerExternalResources: ExternalFooterLink[] = [
  {
    label: "האתר הרשמי של עיריית ירושלים",
    href: "https://www.jerusalem.muni.il/",
    external: true,
  },
  {
    label: "שכונות בירושלים",
    href: "https://www.jerusalem.muni.il/he/neighborhoods/",
    external: true,
  },
  {
    label: "עדכון מחזיקים בנכס (ארנונה) – עיריית ירושלים",
    href: "https://tor.jerusalem.muni.il/Service.aspx?Id=9",
    external: true,
  },
  {
    label: "בקשה לתו חניה אזורי / מידע חניה",
    href: "https://www.jerusalem.muni.il/he/online-services/parking/",
    external: true,
  },
  {
    label: "הודעה על שינוי מען (כתובת) – רשות האוכלוסין",
    href: "https://www.jerusalem.muni.il/he/online-services/parking/",
    external: true,
  },
];

export const footerSocialLinks = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/expresshovalot",
    external: true as const,
  },
  {
    label: "דוא\"ל",
    href: `mailto:${homepageContact.email}`,
    external: false as const,
  },
  {
    label: "WhatsApp",
    href: whatsAppUrl(),
    external: true as const,
  },
  {
    label: "טלפון",
    href: `tel:${PHONE_TEL}`,
    external: false as const,
  },
  {
    label: "Google",
    href: "https://share.google/Y5MTk1JqQD1R6ydWo",
    external: true as const,
  },
];

function flattenNavItems(items: NavItem[]): FooterLinkItem[] {
  const out: FooterLinkItem[] = [];
  for (const item of items) {
    out.push({ label: item.label, href: item.href });
    if (item.children) out.push(...item.children.map((c) => ({ label: c.label, href: c.href })));
  }
  return out;
}

/** Production footer nav — mirrors Elementor vertical nav-menu widget */
export const footerNavigationLinks: FooterLinkItem[] = flattenNavItems(mainNavigation);

export const footerBlogLinks: FooterLinkItem[] = [
  {
    label: "הובלת דירה / הובלות קטנות ? כך תעברו בראש שקט",
    href: "/הובלת-דירה-הובלות-קטנות",
  },
  {
    label: "הובלות בירושלים: המדריך המלא למעבר דירה בטוח ורגוע בעיר הקודש",
    href: "/הובלות-בירושלים-המדריך-למעבר-דירה",
  },
  {
    label: "מעבר דירה בחורף בירושלים: המדריך המלא להובלת דירה בטוחה",
    href: "/מעבר-דירה-בחורף-בירושלים",
  },
  {
    label: 'הובלת פריט בודד בירושלים החל מ – 250 ש"ח',
    href: "/הובלת-פריט-בודד-בירושלים",
  },
  {
    label: "הובלות בירושלים 2026: עלויות, שירותים וחידושים",
    href: "/הובלות-בירושלים-2025",
  },
  {
    label: "הובלות קטנות בירושלים – המדריך המלא",
    href: "/הובלות-קטנות-בירושלים-המדריך-המלא",
  },
  {
    label: "מעבר דירה בירושלים: מדריך מלא להובלות בירושלים והסביבה",
    href: "/מעבר-דירה-בירושלים",
  },
  {
    label: "הובלות מירושלים – המדריך המלא לשירותי הובלה מקצועיים",
    href: "/הובלות-מירושלים",
  },
  { label: "מדריך מעבר דירה ירושלים", href: "/מדריך-מעבר-דירה-ירושלים" },
  {
    label: "כמה עולה הובלת דירה בירושלים ב-2026? מחירון מעודכן וטיפים לחיסכון",
    href: "/כמה-עולה-הובלת-דירה-בירושלים-ב-2026",
  },
  {
    label: "מתי הזמן הכי טוב לבצע הובלה בירושלים?",
    href: "/הזמן-הכי-טוב-לבצע-הובלה-בירושלים",
  },
  { label: "הובלות בירושלים: מעבר קל, שירות מהיר", href: "/הובלות-בירושלים" },
  {
    label: "הובלת פריטים בודדים בירושלים – טיפים חשובים",
    href: "/הובלת-פריטים-בודדים-בירושלים",
  },
  {
    label: "הובלות סטודנטים בירושלים – המדריך הקצר",
    href: "/הובלות-סטודנטים-בירושלים-מדריך-למעבר",
  },
  { label: "הובלת מוצרי חשמל בירושלים", href: "/הובלות-מוצרי-חשמל-בירושלים" },
  {
    label: "5 טיפים להכנה נכונה להובלת דירה בירושלים",
    href: "/הכנה-נכונה-להובלת-דירה-בירושלים-5-טיפי",
  },
];

export const footerRegionalLinks: FooterLinkItem[] = [
  { label: "הובלות במודיעין", href: "/הובלות-במודיעין" },
  { label: "הובלות באבו גוש", href: "/הובלות-באבו-גוש" },
  { label: "הובלות בגבעת זאב", href: "/הובלות-בגבעת-זאב" },
  { label: "הובלות בפסגת זאב", href: "/הובלות-בפסגת-זאב" },
  { label: "הובלות במבשרת ציון", href: "/הובלות-במבשרת-ציון" },
  { label: "הובלות בגוש עציון", href: "/הובלות-בגוש-עציון" },
  { label: "הובלות בבית שמש", href: "/הובלות-בבית-שמש" },
  { label: "הובלות במעלה אדומים", href: "/הובלות-במעלה-אדומים" },
  { label: "הובלות בביתר עילית", href: "/הובלות-בביתר-עילית" },
];

export const footerLegalLinks: FooterLinkItem[] = [
  { label: "הצהרת נגישות", href: "/accessibility-statement" },
  { label: "מדיניות פרטיות", href: "/privacy-policy" },
  { label: "תנאי שימוש", href: "/terms-of-use" },
];

export const footerCredits = {
  copyright: `© ${new Date().getFullYear()} כל הזכויות שמורות לאקספרס הובלות בירושלים`,
  agencyCredit: "בניית אתרים, שיווק ותחזוקה",
  maintenance: { label: "Adwrks 365", href: "http://adwrks.co.il" },
};

/** Production Google Maps embed — footer column 4 */
export const footerMapEmbedSrc =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3391.8967!2d35.2137!3d31.7683!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x15024b052537d6d3%3A0xd36451e896509590!2z15TXldeR15zXldeV16og15DXpN6h16TXqNehIC0g16nXmdeX15XXoiDXnteY16LXpNeZ150g15HXoteU16LguY0!5e0!3m2!1siw!2sil!4v1700000000000!5m2!1siw!2sil";

/** Production footer mini lead form — FORM-02 / Elementor e6d5b71 */
export const footerMiniFormContent = {
  auditFormId: "FORM-02" as const,
  elementorFormId: "e6d5b71" as const,
  title: "צריכים הובלה בירושלים והסביבה?",
  intro: "השאירו פרטים ונחזור אליכם בהקדם עם הצעה משתלמת במיוחד!",
};

export type FooterNavGroup = {
  id: string;
  label: string;
  links: FooterLinkItem[];
};

/** Production footer nav — שירותי הובלה group includes two extra footer-only links */
export const footerServicesLinks: FooterLinkItem[] = [
  { label: "הובלת דירה בירושלים", href: "/הובלת-דירה-בירושלים" },
  { label: "הובלת בית בירושלים", href: "/הובלת-בית-בירושלים" },
  { label: "הובלות קטנות בירושלים", href: "/הובלות-קטנות-בירושלים" },
  { label: "הובלת פריט בודד בירושלים", href: "/הובלת-פריט-בודד-בירושלים" },
  { label: "הובלות מיוחדות בירושלים", href: "/הובלות-מיוחדות-בירושלים" },
  { label: "הובלות דחופות בירושלים", href: "/הובלות-דחופות-בירושלים" },
  { label: "הובלת משטחים בירושלים", href: "/הובלת-משטחים-בירושלים" },
  { label: "הובלות משרדים בירושלים", href: "/הובלות-משרדים-בירושלים" },
  { label: "שירותי אריזה בירושלים", href: "/חברת-אריזה-והובלה-בירושלים" },
  { label: "מוביל בירושלים והסביבה", href: "/מוביל-בירושלים-והסביבה" },
  { label: "הובלת דירה מירושלים", href: "/הובלת-דירה-מירושלים" },
];

export const footerStorageLinks: FooterLinkItem[] =
  mainNavigation.find((n) => n.href === "/אחסון-תכולה-בירושלים")?.children?.map((c) => ({
    label: c.label,
    href: c.href,
  })) ?? [];

export const footerQuoteLinks: FooterLinkItem[] = [
  { label: "מחשבון הובלה", href: "/#calculator" },
  { label: "מחירון הובלת דירות", href: "/מחירי-הובלת-דירות" },
];

export type FooterNavEntry =
  | { type: "link"; label: string; href: string }
  | { type: "group"; id: string; label: string; href: string; links: FooterLinkItem[] };

/** Production footer nav order — Elementor vertical nav post-3528 widget 82e817d (group labels are links in production) */
export const footerNavEntries: FooterNavEntry[] = [
  { type: "link", label: "הובלות בירושלים", href: "/" },
  { type: "link", label: "אודות", href: "/about-us" },
  { type: "group", id: "services", label: "שירותי הובלה", href: "/שירותי-הובלה", links: footerServicesLinks },
  { type: "group", id: "storage", label: "אחסון תכולה", href: "/אחסון-תכולה-בירושלים", links: footerStorageLinks },
  { type: "group", id: "quote", label: "הצעת מחיר", href: "/הצעת-מחיר", links: footerQuoteLinks },
  { type: "link", label: "שאלות נפוצות", href: "/שאלות-נפוצות" },
  { type: "group", id: "tips", label: "טיפים ומידע", href: "/blog", links: footerBlogLinks },
  { type: "group", id: "regional", label: "הובלות באזור ירושלים", href: "/הובלות-באזור-ירושלים", links: footerRegionalLinks },
  { type: "link", label: "צרו קשר", href: "/צרו-קשר" },
  { type: "link", label: "מפת אתר", href: "/site-map" },
];
