import { CommercialPageView } from "@/components/structured-content/views/CommercialPageView";
import type { StructuredPageModel } from "@/lib/structured-content/types";

/** About uses the same structured commercial flow — content order preserved from source. */
export function AboutPageView({ model }: { model: StructuredPageModel }) {
  return <CommercialPageView model={model} />;
}
