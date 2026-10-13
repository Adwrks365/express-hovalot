const FORM_TYPE_LABELS: Record<string, string> = {
  "hero-quick-quote": "טופס הצעת מחיר — הירו",
  "homepage-quote": "טופס הצעת מחיר — דף הבית",
  quote: "טופס הצעת מחיר",
  "contextual-popup": "פופאפ הצעת מחיר",
  "footer-mini": "טופס מיני — פוטר",
  contact: "טופס יצירת קשר",
  lead: "טופס ליד",
};

export function resolveFormTypeLabel(formType: string, formId?: string): string {
  if (formType && FORM_TYPE_LABELS[formType]) return FORM_TYPE_LABELS[formType];
  if (formId && FORM_TYPE_LABELS[formId]) return FORM_TYPE_LABELS[formId];
  if (formType) return formType;
  if (formId) return formId;
  return "טופס באתר";
}
