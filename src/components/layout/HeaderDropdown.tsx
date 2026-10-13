"use client";

import Link from "next/link";
import { useLayoutEffect, useRef, useState } from "react";
import type { NavItem } from "@/config/navigation";
import {
  dropdownColumns,
  dropdownSizeForNav,
  dropdownWidthPx,
} from "@/lib/layout/dropdown-sizes";

/** Adaptive dropdown — compact / medium / mega */
export function HeaderDropdown({
  item,
  open,
  onNavigate,
}: {
  item: NavItem & { children: NavItem[] };
  open: boolean;
  onNavigate: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const childCount = item.children.length;
  const size = dropdownSizeForNav(item.href, childCount);
  const columns = dropdownColumns(size, childCount);
  const isMega = size === "mega";
  const [fixedStyle, setFixedStyle] = useState<React.CSSProperties>({});

  useLayoutEffect(() => {
    const panel = panelRef.current;
    const trigger = panel?.parentElement;
    if (!panel || !trigger) return;

    function positionPanel() {
      const margin = 16;
      const panelWidth = dropdownWidthPx(size, window.innerWidth, margin);
      const triggerRect = trigger!.getBoundingClientRect();

      if (isMega) {
        let left = triggerRect.right - panelWidth;
        left = Math.max(margin, Math.min(left, window.innerWidth - panelWidth - margin));
        setFixedStyle({
          position: "fixed",
          top: triggerRect.bottom + 6,
          left: `${left}px`,
          right: "auto",
          width: `${panelWidth}px`,
        });
        return;
      }

      setFixedStyle({
        position: "absolute",
        insetInlineEnd: 0,
        top: "calc(100% + 0.35rem)",
        width: `${panelWidth}px`,
      });
    }

    positionPanel();
    trigger.addEventListener("mouseenter", positionPanel);
    window.addEventListener("resize", positionPanel);
    window.addEventListener("scroll", positionPanel, true);
    return () => {
      trigger.removeEventListener("mouseenter", positionPanel);
      window.removeEventListener("resize", positionPanel);
      window.removeEventListener("scroll", positionPanel, true);
    };
  }, [childCount, isMega, size]);

  const columnClass =
    columns === 3
      ? "grid grid-cols-1 gap-0.5 sm:grid-cols-2 lg:grid-cols-3"
      : columns === 2
        ? "grid grid-cols-1 gap-0.5 sm:grid-cols-2"
        : "";

  const panelPadding = size === "compact" ? "py-1.5" : "py-2";
  const itemClass =
    size === "compact"
      ? "block px-3 py-2 text-[13px] leading-snug text-white/90 hover:bg-brand-800 hover:text-white focus-visible:bg-brand-800"
      : "block px-3.5 py-2.5 text-[13px] leading-snug text-white/90 hover:bg-brand-800 hover:text-white focus-visible:bg-brand-800 lg:text-sm";

  return (
    <div
      ref={panelRef}
      className={`pointer-events-none invisible z-[60] rounded-xl border border-brand-700/80 bg-brand-900 opacity-0 shadow-elevated transition-all group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100 ${panelPadding} ${
        open ? "!pointer-events-auto !visible !opacity-100" : ""
      } ${isMega ? "" : "absolute top-[calc(100%+0.35rem)]"}`}
      style={{
        ...fixedStyle,
        maxHeight: size === "compact" ? "min(60vh, 24rem)" : "min(70vh, 32rem)",
        overflowY: "auto",
        overflowX: "hidden",
      }}
      role="menu"
    >
      <div className={columnClass}>
        {item.children.map((child) => (
          <Link
            key={child.href}
            href={child.href}
            role="menuitem"
            className={itemClass}
            style={{ whiteSpace: "normal", overflowWrap: "anywhere" }}
            onClick={onNavigate}
          >
            {child.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
