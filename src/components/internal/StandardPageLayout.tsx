import { RedesignPageRenderer } from "@/components/redesign/RedesignPageRenderer";
import type { ContentRecord } from "@/lib/content-registry";

export function StandardPageLayout({ record }: { record: ContentRecord }) {
  return <RedesignPageRenderer record={record} />;
}
