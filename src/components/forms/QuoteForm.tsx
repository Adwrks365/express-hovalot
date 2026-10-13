"use client";

import Link from "next/link";
import { useId, useState, type FormEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { useLeadPageContext } from "@/hooks/useLeadPageContext";
import { radius } from "@/lib/ui-tokens";

type FormState = "idle" | "submitting" | "success" | "error";

const initial = {
  name: "",
  phone: "",
  email: "",
  fromAddress: "",
  toAddress: "",
  moveDate: "",
  message: "",
  website: "",
};

export type QuoteFormMetadata = {
  formId?: string;
  formType?: string;
  pagePath?: string;
  pageTitle?: string;
  pageType?: string;
  serviceContext?: string;
};

export function QuoteForm({
  variant = "hero",
  compact = false,
  heroDense = false,
  showEmail = true,
  labelMode = "visible",
  metadata,
}: {
  variant?: "hero" | "section";
  compact?: boolean;
  /** Extra-tight layout for homepage Hero card */
  heroDense?: boolean;
  /** Hero omits email; other forms retain it by default */
  showEmail?: boolean;
  /** Placeholder + sr-only labels for compact lead forms */
  labelMode?: "visible" | "placeholder";
  metadata?: QuoteFormMetadata;
}) {
  const formId = useId();
  const errorId = `${formId}-error`;
  const pageContext = useLeadPageContext();
  const [form, setForm] = useState(initial);
  const [state, setState] = useState<FormState>("idle");
  const [error, setError] = useState("");

  const usePlaceholders = labelMode === "placeholder";

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (form.website) return;
    setState("submitting");
    setError("");

    try {
      const payload: Record<string, string> = {
        name: form.name,
        phone: form.phone,
        fromAddress: form.fromAddress,
        toAddress: form.toAddress,
        moveDate: form.moveDate,
        message: form.message,
        formType:
          metadata?.formType ?? (metadata?.formId === "hero-quick-quote" ? "hero-quick-quote" : variant === "hero" ? "homepage-quote" : "quote"),
      };
      payload.formId = metadata?.formId ?? payload.formType;
      payload.pagePath = metadata?.pagePath ?? pageContext.pagePath;
      payload.pageTitle = metadata?.pageTitle ?? pageContext.pageTitle;
      payload.pageUrl = pageContext.pageUrl;
      if (metadata?.pageType) payload.pageType = metadata.pageType;
      if (metadata?.serviceContext) payload.serviceContext = metadata.serviceContext;
      if (showEmail) {
        payload.email = form.email;
      }

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { ok?: boolean; message?: string };
      if (!res.ok || !data.ok) {
        throw new Error(data.message || "שגיאה בשליחת הטופס");
      }
      setState("success");
      setForm(initial);
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "שגיאה בשליחת הטופס");
    }
  }

  if (state === "success") {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center text-green-900" role="status">
        <p className="text-lg font-semibold">תודה! הפנייה התקבלה.</p>
        <p className="mt-2 text-base">נחזור אליכם בהקדם.</p>
      </div>
    );
  }

  const gap = heroDense ? "space-y-1.5" : compact ? "space-y-2" : "space-y-4";
  const fieldGap = heroDense ? "gap-1.5" : compact ? "gap-2" : "gap-4";
  const inputCls = heroDense
    ? usePlaceholders
      ? inputClassHeroPlaceholder
      : inputClassHeroDense
    : compact
      ? inputClassCompact
      : inputClass;
  const labelDense = heroDense || compact;

  return (
    <form onSubmit={onSubmit} className={gap} noValidate aria-label="טופס הצעת מחיר" data-lead-form>
      <div className={`grid ${fieldGap} sm:grid-cols-2`}>
        <Field
          id={`${formId}-name`}
          label="שם מלא"
          placeholder="שם מלא"
          required
          compact={labelDense}
          usePlaceholder={usePlaceholders}
        >
          <input
            id={`${formId}-name`}
            type="text"
            name="name"
            required
            autoComplete="name"
            placeholder={usePlaceholders ? "שם מלא" : undefined}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={inputCls}
            aria-required="true"
          />
        </Field>
        <Field
          id={`${formId}-phone`}
          label="טלפון"
          placeholder="טלפון *"
          required
          compact={labelDense}
          usePlaceholder={usePlaceholders}
        >
          <input
            id={`${formId}-phone`}
            type="tel"
            name="phone"
            required
            autoComplete="tel"
            dir="ltr"
            inputMode="tel"
            placeholder={usePlaceholders ? "טלפון *" : undefined}
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className={inputCls}
            aria-required="true"
          />
        </Field>
      </div>
      {showEmail ? (
        <Field
          id={`${formId}-email`}
          label="אימייל"
          placeholder="אימייל"
          compact={labelDense}
          usePlaceholder={usePlaceholders}
        >
          <input
            id={`${formId}-email`}
            type="email"
            name="email"
            autoComplete="email"
            dir="ltr"
            placeholder={usePlaceholders ? "אימייל" : undefined}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={inputCls}
          />
        </Field>
      ) : null}
      <div className={`grid ${fieldGap} sm:grid-cols-2`}>
        <Field
          id={`${formId}-from`}
          label="כתובת מוצא"
          placeholder="כתובת מוצא"
          compact={labelDense}
          usePlaceholder={usePlaceholders}
        >
          <input
            id={`${formId}-from`}
            type="text"
            name="fromAddress"
            autoComplete="street-address"
            placeholder={usePlaceholders ? "כתובת מוצא" : undefined}
            value={form.fromAddress}
            onChange={(e) => setForm({ ...form, fromAddress: e.target.value })}
            className={inputCls}
          />
        </Field>
        <Field
          id={`${formId}-to`}
          label="כתובת יעד"
          placeholder="כתובת יעד"
          compact={labelDense}
          usePlaceholder={usePlaceholders}
        >
          <input
            id={`${formId}-to`}
            type="text"
            name="toAddress"
            placeholder={usePlaceholders ? "כתובת יעד" : undefined}
            value={form.toAddress}
            onChange={(e) => setForm({ ...form, toAddress: e.target.value })}
            className={inputCls}
          />
        </Field>
      </div>
      <Field
        id={`${formId}-date`}
        label="תאריך מועדף להובלה"
        placeholder="תאריך מועדף להובלה"
        compact={labelDense}
        usePlaceholder={usePlaceholders}
      >
        <input
          id={`${formId}-date`}
          type="date"
          name="moveDate"
          placeholder={usePlaceholders ? "תאריך מועדף להובלה" : undefined}
          value={form.moveDate}
          onChange={(e) => setForm({ ...form, moveDate: e.target.value })}
          className={inputCls}
        />
      </Field>
      <Field
        id={`${formId}-message`}
        label="פרטים נוספים"
        placeholder="פרטים נוספים"
        compact={labelDense}
        usePlaceholder={usePlaceholders}
      >
        <textarea
          id={`${formId}-message`}
          name="message"
          rows={heroDense ? 2 : compact ? 2 : 3}
          placeholder={usePlaceholders ? "פרטים נוספים" : undefined}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className={inputCls}
        />
      </Field>
      <input
        type="text"
        name="website"
        value={form.website}
        onChange={(e) => setForm({ ...form, website: e.target.value })}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />
      <label htmlFor={`${formId}-consent`} className="flex items-start gap-2.5 text-sm leading-relaxed text-neutral-600">
        <input
          id={`${formId}-consent`}
          name="consent"
          type="checkbox"
          required
          className="mt-1 h-4 w-4 shrink-0 rounded border-neutral-300 text-brand-600 focus:ring-2 focus:ring-brand-200"
        />
        <span>
          אני מסכים/ה לקבל הצעות בהתאם ל־{" "}
          <Link href="/privacy-policy" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-800">
            מדיניות הפרטיות
          </Link>
        </span>
      </label>
      {state === "error" ? (
        <p id={errorId} className="text-base text-red-600" role="alert" aria-live="polite">
          {error}
        </p>
      ) : null}
      <Button
        type="submit"
        variant="gold"
        className={`w-full ${heroDense ? "min-h-[40px] py-1.5 text-sm" : ""}`}
        disabled={state === "submitting"}
        aria-describedby={state === "error" ? errorId : undefined}
      >
        {state === "submitting" ? "שולח..." : "קבלו הצעת מחיר"}
      </Button>
    </form>
  );
}

const inputClass = `w-full ${radius.input} border border-neutral-200 bg-white px-4 py-3.5 text-base text-neutral-900 placeholder:text-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 min-h-[48px]`;

const inputClassCompact = `w-full ${radius.input} border border-neutral-200 bg-white px-3 py-2 text-base text-neutral-900 placeholder:text-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 min-h-[44px]`;

const inputClassHeroDense = `w-full rounded-[10px] border border-neutral-200 bg-white px-2 py-1 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-100 min-h-[36px]`;

const inputClassHeroPlaceholder = `w-full ${radius.input} border border-neutral-200 bg-white px-2.5 py-1.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-100 min-h-[40px]`;

function Field({
  id,
  label,
  children,
  required,
  compact = false,
  usePlaceholder = false,
}: {
  id: string;
  label: string;
  placeholder?: string;
  children: ReactNode;
  required?: boolean;
  compact?: boolean;
  usePlaceholder?: boolean;
}) {
  if (usePlaceholder) {
    return (
      <div className="block text-start">
        <label htmlFor={id} className="sr-only">
          {label}
          {required ? " (שדה חובה)" : ""}
        </label>
        {children}
      </div>
    );
  }

  return (
    <div className="block text-start">
      <label
        htmlFor={id}
        className={`block font-medium text-neutral-800 ${compact ? "mb-0 text-[11px] leading-tight sm:text-xs" : "mb-1.5 text-base"}`}
      >
        {label}
        {required ? (
          <span className="text-red-600" aria-hidden="true">
            {" "}
            *
          </span>
        ) : null}
        {required ? <span className="sr-only"> (שדה חובה)</span> : null}
      </label>
      {children}
    </div>
  );
}
