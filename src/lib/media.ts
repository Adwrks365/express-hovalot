import mediaMap from "@/content/media-map.json";

type MediaItem = {
  id: number;
  sourceUrl: string;
  localPath: string | null;
};

const bySource = new Map<string, string>();
const byId = new Map<number, string>();
const byFilename = new Map<string, string>();
const byStem = new Map<string, string>();

function stemFromFilename(filename: string): string {
  return filename
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/-\d+x\d+$/i, "")
    .replace(/^\d+-/, "");
}

function registerStem(stem: string, localPath: string) {
  if (!stem || byStem.has(stem)) return;
  byStem.set(stem, localPath);
}

for (const item of mediaMap.items as MediaItem[]) {
  if (!item.localPath) continue;
  bySource.set(item.sourceUrl, item.localPath);
  byId.set(item.id, item.localPath);
  const filename = item.sourceUrl.split("/").pop()?.split("?")[0]?.toLowerCase();
  if (filename) {
    byFilename.set(filename, item.localPath);
    registerStem(stemFromFilename(filename), item.localPath);
  }
  const localFilename = item.localPath.split("/").pop()?.toLowerCase();
  if (localFilename) registerStem(stemFromFilename(localFilename), item.localPath);
}

export function resolveMediaUrl(sourceUrl: string | null | undefined): string | null {
  if (!sourceUrl) return null;
  const clean = sourceUrl.split("?")[0];
  return bySource.get(sourceUrl) || bySource.get(clean) || null;
}

export function resolveMediaById(id: number | null | undefined): string | null {
  if (!id) return null;
  return byId.get(id) || null;
}

function normalizeUploadFilename(filename: string): string {
  return filename.replace(/-\d+x\d+(?=\.[a-z]+$)/i, "");
}

function resolveThumbUrl(url: string): string | null {
  const file = url.split("/").pop()?.split("?")[0]?.toLowerCase() ?? "";
  if (!file.includes("/thumbs/") && !url.includes("/thumbs/")) {
    // still handle thumbs path in full url
  }
  const thumbName = file.replace(/\.[a-z0-9]+$/i, "");
  const numeric = thumbName.match(/^(\d+)-/);
  if (numeric) {
    const byNum = byStem.get(numeric[1]) || byFilename.get(`${numeric[1]}.webp`);
    if (byNum) return byNum;
  }
  const stripped = thumbName.replace(/-[a-z0-9]{16,}$/i, "");
  if (byStem.has(stripped)) return byStem.get(stripped)!;
  if (byFilename.has(`${stripped}.webp`)) return byFilename.get(`${stripped}.webp`)!;
  return null;
}

/** Map wp-content URL to local /media path when known; null if unmapped */
export function wpUrlToLocal(url: string): string | null {
  if (!url) return null;
  if (url.startsWith("/media/")) return url;
  const clean = url.split("?")[0];
  const direct = resolveMediaUrl(clean);
  if (direct) return direct;
  const raw = clean.split("/").pop()?.toLowerCase();
  const fn = raw ? normalizeUploadFilename(raw) : raw;
  if (fn && byFilename.has(fn)) return byFilename.get(fn)!;
  if (raw && byFilename.has(raw)) return byFilename.get(raw)!;
  if (clean.includes("/thumbs/")) {
    const thumb = resolveThumbUrl(clean);
    if (thumb) return thumb;
  }
  if (raw) {
    const stem = stemFromFilename(raw);
    if (byStem.has(stem)) return byStem.get(stem)!;
  }
  if (url.includes("/wp-content/uploads/")) return null;
  return url;
}

/** Rewrite img src attributes in HTML to local media paths */
export function resolveMediaInHtml(html: string): string {
  return html.replace(/(<img[^>]+src=["'])([^"']+)(["'])/gi, (_, pre, src, post) => {
    const local = wpUrlToLocal(src);
    return local ? `${pre}${local}${post}` : `${pre}${src}${post}`;
  });
}

export function isResolvableMedia(url: string | null | undefined): boolean {
  return Boolean(url && wpUrlToLocal(url));
}
