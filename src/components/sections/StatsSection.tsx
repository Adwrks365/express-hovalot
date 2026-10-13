import { SectionShell } from "@/components/sections/SectionShell";

export function StatsSection({
  items,
  tone = "muted",
}: {
  items: { label: string; value?: string }[];
  tone?: "white" | "muted" | "brand";
}) {
  return (
    <SectionShell tone={tone === "brand" ? "brand" : tone}>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.label} className="rounded-2xl border border-white/10 bg-white/10 p-6 text-center backdrop-blur-sm">
            {item.value ? <p className="text-3xl font-bold text-accent">{item.value}</p> : null}
            <p className={`mt-2 text-base font-medium ${tone === "brand" ? "text-white/90" : "text-brand-900"}`}>
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}
