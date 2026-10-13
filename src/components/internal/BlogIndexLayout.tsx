import { RedesignPageRenderer } from "@/components/redesign/RedesignPageRenderer";
import type { ContentRecord } from "@/lib/content-registry";

export function BlogIndexLayout({ record }: { record: ContentRecord }) {
  return <RedesignPageRenderer record={record} />;
}
