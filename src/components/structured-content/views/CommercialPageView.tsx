import { IntroBlockSection } from "@/components/structured-content/IntroBlockSection";
import { renderStructuredSection } from "@/components/structured-content/render-structured-section";
import type { StructuredPageModel } from "@/lib/structured-content/types";

export function CommercialPageView({ model }: { model: StructuredPageModel }) {
  return (
    <>
      {model.intro ? <IntroBlockSection intro={model.intro} tone="white" /> : null}
      {model.sections.map((section, index) => renderStructuredSection(section, index))}
    </>
  );
}
