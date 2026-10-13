import { Container } from "@/components/ui/Container";

/**
 * Supplements imported WordPress accessibility statement with current on-site tooling (Phase 2C).
 */
export function AccessibilityStatementAddendum() {
  return (
    <section className="border-t border-brand-100 bg-brand-50/40 py-10 sm:py-12" aria-labelledby="a11y-tools-heading">
      <Container width="prose">
        <h2 id="a11y-tools-heading" className="text-xl font-bold text-brand-900 sm:text-2xl">
          כלי הנגישות באתר
        </h2>
        <p className="mt-4 text-base leading-relaxed text-neutral-800">
          בכל עמודי האתר זמין כפתור נגישות קבוע (פינה שמאלית). לחיצה פותחת את תפריט &quot;כלי נגישות&quot; עם
          האפשרויות הבאות:
        </p>
        <ul className="mt-4 list-disc space-y-2 ps-6 text-base leading-relaxed text-neutral-800">
          <li>הגדלת והקטנת גודל הטקסט</li>
          <li>גווני אפור</li>
          <li>ניגודיות גבוהה</li>
          <li>ניגודיות הפוכה</li>
          <li>רקע בהיר</li>
          <li>הדגשת קישורים</li>
          <li>פונט קריא</li>
          <li>איפוס הגדרות הנגישות</li>
        </ul>
        <p className="mt-4 text-base leading-relaxed text-neutral-800">
          ההגדרות נשמרות בדפדפן שלכם (localStorage) וניתן לאפס אותן בכל עת. הכלי מחליף את תוסף הנגישות שהופעל
          בעבר ב-WordPress, ומותאם לעיצוב ולמבנה האתר החדש.
        </p>
        <p className="mt-4 text-sm text-neutral-600">עדכון תיאור כלי הנגישות: אוקטובר 2026.</p>
      </Container>
    </section>
  );
}
