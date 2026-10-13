import { SectionShell } from "@/components/sections/SectionShell";
import { Button } from "@/components/ui/Button";
import type { StructuredButton } from "@/lib/structured-pages/types";

function buttonVariant(href: string): "gold" | "whatsapp" | "phone" | "secondary" {
  if (href.includes("wa.me")) return "whatsapp";
  if (href.startsWith("tel:")) return "phone";
  return "gold";
}

export function CtaStripSection({ buttons, tone = "brand" }: { buttons: StructuredButton[]; tone?: "brand" | "muted" }) {
  return (
    <SectionShell tone={tone === "brand" ? "brand" : "muted"}>
      <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
        {buttons.map((btn) => (
          <Button key={btn.href + btn.label} href={btn.href} variant={buttonVariant(btn.href)} className="min-h-[48px] px-6">
            {btn.label}
          </Button>
        ))}
      </div>
    </SectionShell>
  );
}
