import wpShortlinkMap from "@/content/data/wp-shortlink-redirects.json";

const map = wpShortlinkMap as Record<string, string>;

export function resolveWpShortlinkPath(postId: string): string | null {
  const dest = map[postId];
  if (!dest) return null;
  return dest.endsWith("/") || dest === "/" ? dest : `${dest}/`;
}
