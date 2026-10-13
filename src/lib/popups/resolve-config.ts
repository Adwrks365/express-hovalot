import type { PageTemplate } from "@/lib/page-classification";
import type { RedesignArchetype } from "@/lib/redesign/archetype";
import { resolveArticlePopupContext } from "@/lib/popups/article-pages";
import {
  areaHeadlineFromTitle,
  isManualOnlyRoute,
  isRouteExcludedFromAuto,
  resolveServiceContext,
} from "@/lib/popups/service-pages";
import type { PopupPageConfig, PopupTriggerProfile } from "@/lib/popups/types";

export type PopupConfigInput =
  | { kind: "home"; path: "/"; title: string }
  | {
      kind: "content";
      path: string;
      title: string;
      template: PageTemplate;
      slug: string;
      categories?: number[];
      archetype?: RedesignArchetype;
    }
  | { kind: "archive"; path: string; title: string };

function normalizePath(path: string): string {
  let p = path;
  try {
    p = decodeURIComponent(path);
  } catch {
    /* keep */
  }
  if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
  return p || "/";
}

function triggerFor(template: PageTemplate, context: PopupPageConfig["context"]): PopupTriggerProfile {
  if (template === "article") return "article";
  if (context === "price-quote") return "service";
  return "service";
}

export function buildPopupPageConfig(input: PopupConfigInput): PopupPageConfig {
  if (input.kind === "archive") {
    return {
      context: "general",
      pageTitle: input.title,
      pagePath: normalizePath(input.path),
      autoOpenEnabled: false,
      triggerProfile: "none",
    };
  }

  if (input.kind === "home") {
    return {
      context: "moving-general",
      pageTitle: input.title,
      pagePath: "/",
      autoOpenEnabled: true,
      triggerProfile: "service",
    };
  }

  const path = normalizePath(input.path);
  const { title, template, slug, categories, archetype } = input;

  if (archetype === "contact" || archetype === "quote" || archetype === "legal" || archetype === "utility") {
    return {
      context: archetype === "quote" ? "price-quote" : "general",
      pageTitle: title,
      pagePath: path,
      autoOpenEnabled: false,
      triggerProfile: "none",
    };
  }

  if (isManualOnlyRoute(path)) {
    return {
      context: path.includes("מחיר") ? "price-quote" : "general",
      pageTitle: title,
      pagePath: path,
      autoOpenEnabled: false,
      triggerProfile: "none",
    };
  }

  if (template === "article") {
    const context = resolveArticlePopupContext({ title, slug, categories });
    return {
      context,
      pageTitle: title,
      pagePath: path,
      autoOpenEnabled: !isRouteExcludedFromAuto(path),
      triggerProfile: "article",
      areaHeadline: context === "jerusalem-area" ? areaHeadlineFromTitle(title) : undefined,
    };
  }

  if (template === "blog-index") {
    return {
      context: "general",
      pageTitle: title,
      pagePath: path,
      autoOpenEnabled: false,
      triggerProfile: "none",
    };
  }

  const tpl = template === "location" ? "location" : template === "service" ? "service" : "standard";
  const context = resolveServiceContext(path, title, tpl);
  const autoExcluded = isRouteExcludedFromAuto(path);

  return finalizeAutoOpen({
    context,
    pageTitle: title,
    pagePath: path,
    autoOpenEnabled: !autoExcluded,
    triggerProfile: triggerFor(template, context),
    areaHeadline: context === "jerusalem-area" ? areaHeadlineFromTitle(title) : undefined,
  });
}

const QUOTE_FORM_PATHS = new Set(["/הצעת-מחיר", "/צרו-קשר"]);

/** Disable auto on primary lead-form routes; keep manual + pill. */
export function finalizeAutoOpen(config: PopupPageConfig): PopupPageConfig {
  if (QUOTE_FORM_PATHS.has(config.pagePath)) {
    return { ...config, autoOpenEnabled: false, triggerProfile: "none" };
  }
  return config;
}
