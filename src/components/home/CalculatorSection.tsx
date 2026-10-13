"use client";

import { useState } from "react";
import { homepageCalculator } from "@/content/homepage-content";
import { Container } from "@/components/ui/Container";
import { ContentWidth } from "@/components/ui/ContentWidth";
import { Button } from "@/components/ui/Button";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { sectionPad } from "@/lib/layout";
import { radius, sectionTitleClass } from "@/lib/ui-tokens";

/** Calculator UI — fields mirror production; pricing logic pending audit confirmation */
export function CalculatorSection() {
  const [rooms, setRooms] = useState("");
  const [fromFloor, setFromFloor] = useState("");
  const [toFloor, setToFloor] = useState("");
  const [elevator, setElevator] = useState("no");
  const [moveType, setMoveType] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  const fieldClass = `w-full ${radius.input} border border-neutral-200 bg-white px-3 py-2.5 text-neutral-900 min-h-[44px] text-base focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100`;

  return (
    <section id="calculator" className={`bg-brand-50/70 ${sectionPad.normal}`}>
      <Container>
        <ContentWidth className="mx-auto max-w-3xl text-center">
          <ScrollReveal variant="heading">
            <h2 className={sectionTitleClass}>{homepageCalculator.title}</h2>
            <p className="mx-auto mt-3 max-w-2xl text-base leading-[1.75] text-neutral-700 sm:text-lg">
              {homepageCalculator.subtitle}
            </p>
          </ScrollReveal>

          <ScrollReveal variant="card">
          <form
            onSubmit={handleSubmit}
            className={`mx-auto mt-8 w-full max-w-[650px] border border-brand-100 bg-white p-5 text-start shadow-soft sm:p-6 ${radius.panel}`}
          >
            <h3 className="mb-4 text-lg font-semibold text-brand-800">{homepageCalculator.formTitle}</h3>

            <label className="mb-3 block text-base">
              <span className="mb-1 block text-sm font-medium text-neutral-800">
                {homepageCalculator.whatMoving}
              </span>
              <select
                value={moveType}
                onChange={(e) => setMoveType(e.target.value)}
                className={fieldClass}
              >
                <option value="">בחרו סוג הובלה</option>
                <option value="apartment">הובלת דירה</option>
                <option value="office">הובלת משרד</option>
                <option value="small">הובלה קטנה</option>
                <option value="storage">אחסון</option>
              </select>
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-base">
                <span className="mb-1 block text-sm font-medium text-neutral-800">מספר חדרים</span>
                <select value={rooms} onChange={(e) => setRooms(e.target.value)} className={fieldClass}>
                  <option value="">בחרו</option>
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={String(n)}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-base">
                <span className="mb-1 block text-sm font-medium text-neutral-800">קומת מוצא</span>
                <input
                  type="number"
                  min={0}
                  value={fromFloor}
                  onChange={(e) => setFromFloor(e.target.value)}
                  className={fieldClass}
                />
              </label>
              <label className="block text-base">
                <span className="mb-1 block text-sm font-medium text-neutral-800">קומת יעד</span>
                <input
                  type="number"
                  min={0}
                  value={toFloor}
                  onChange={(e) => setToFloor(e.target.value)}
                  className={fieldClass}
                />
              </label>
              <label className="block text-base">
                <span className="mb-1 block text-sm font-medium text-neutral-800">מעלית</span>
                <select value={elevator} onChange={(e) => setElevator(e.target.value)} className={fieldClass}>
                  <option value="yes">יש מעלית</option>
                  <option value="no">אין מעלית</option>
                </select>
              </label>
            </div>

            {submitted ? (
              <p className="mt-4 rounded-lg bg-brand-50 px-4 py-3 text-base text-brand-800" role="status">
                תודה! לקבלת הצעת מחיר מדויקת נציג מקצועי יחזור אליכם בהקדם — או חייגו עכשיו לשירות מיידי.
              </p>
            ) : null}

            <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
              <Button type="submit" variant="gold" className="min-h-[44px] sm:flex-1">
                קבלו הצעת מחיר
              </Button>
              <Button href="/הצעת-מחיר" variant="outlineDark" className="min-h-[44px] sm:flex-initial">
                טופס הצעת מחיר מלא
              </Button>
            </div>
          </form>
          </ScrollReveal>
        </ContentWidth>
      </Container>
    </section>
  );
}
