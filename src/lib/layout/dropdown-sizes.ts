/** Adaptive desktop dropdown sizing from item count — small menus stay narrow. */

export type DropdownSize = "compact" | "medium" | "mega";

export function dropdownSizeForNav(_href: string, childCount: number): DropdownSize {
  if (childCount >= 13) return "mega";
  if (childCount >= 5) return "medium";
  return "compact";
}

export function dropdownWidthPx(size: DropdownSize, viewportWidth: number, margin = 16): number {
  const max = viewportWidth - margin * 2;
  switch (size) {
    case "compact":
      return Math.min(280, max);
    case "medium":
      return Math.min(520, max);
    case "mega":
      return Math.min(780, max);
  }
}

export function dropdownColumns(size: DropdownSize, childCount: number): 1 | 2 | 3 {
  if (size === "compact") return 1;
  if (size === "medium") return 2;
  return childCount >= 14 ? 3 : 2;
}
