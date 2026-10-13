"use client";

import { useContextualPopup } from "@/components/popups/ContextualPopupProvider";
import type { PopupPageConfig } from "@/lib/popups/types";
import { useEffect } from "react";

export function ContextualPopupRegistrar({ config }: { config: PopupPageConfig }) {
  const { registerPage } = useContextualPopup();

  useEffect(() => {
    registerPage(config);
    return () => registerPage(null);
  }, [
    config.pagePath,
    config.context,
    config.autoOpenEnabled,
    config.triggerProfile,
    config.pageTitle,
    config.areaHeadline,
    registerPage,
    config,
  ]);

  return null;
}
