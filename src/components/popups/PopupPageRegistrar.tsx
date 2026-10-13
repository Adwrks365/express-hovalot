import type { ContentRecord } from "@/lib/content-registry";
import type { RedesignArchetype } from "@/lib/redesign/archetype";
import { buildPopupPageConfig } from "@/lib/popups/resolve-config";
import { ContextualPopupRegistrar } from "@/components/popups/ContextualPopupRegistrar";

export function PopupPageRegistrar({
  record,
  archetype,
}: {
  record: Pick<ContentRecord, "path" | "title" | "template" | "slug" | "categories">;
  archetype?: RedesignArchetype;
}) {
  const config = buildPopupPageConfig({
    kind: "content",
    path: record.path,
    title: record.title,
    template: record.template,
    slug: record.slug,
    categories: record.categories,
    archetype,
  });
  return <ContextualPopupRegistrar config={config} />;
}

export function PopupHomeRegistrar({ title }: { title: string }) {
  const config = buildPopupPageConfig({ kind: "home", path: "/", title });
  return <ContextualPopupRegistrar config={config} />;
}

export function PopupArchiveRegistrar({ path, title }: { path: string; title: string }) {
  const config = buildPopupPageConfig({ kind: "archive", path, title });
  return <ContextualPopupRegistrar config={config} />;
}
