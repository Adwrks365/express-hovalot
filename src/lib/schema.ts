import { SITE_NAME, SITE_URL, PHONE_DISPLAY } from "@/lib/constants";

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "MovingCompany",
    name: SITE_NAME,
    url: SITE_URL,
    telephone: PHONE_DISPLAY,
    areaServed: {
      "@type": "City",
      name: "ירושלים",
    },
  };
}

export function webSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: "he-IL",
  };
}

export function faqPageSchema(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function articleSchema(input: {
  title: string;
  description?: string;
  path: string;
  datePublished?: string;
  dateModified?: string;
  image?: string | null;
}) {
  const url = `${SITE_URL}${input.path === "/" ? "/" : `${input.path}/`}`;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.description || "",
    url,
    mainEntityOfPage: url,
    datePublished: input.datePublished,
    dateModified: input.dateModified || input.datePublished,
    author: {
      "@type": "Organization",
      name: SITE_NAME,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    ...(input.image ? { image: input.image } : {}),
    inLanguage: "he-IL",
  };
}

export function jsonLd(data: Record<string, unknown>) {
  return JSON.stringify(data);
}
