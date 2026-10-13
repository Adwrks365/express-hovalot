import pages from "@/content/data/pages.json";
import posts from "@/content/data/posts.json";
import urlContract from "@/content/data/url-contract.json";
import { parseArchivePath, type ArchiveMatch } from "@/lib/archives";
import { classifyPageTemplate, type PageTemplate } from "@/lib/page-classification";
import { normalizePathname, pathKeys } from "@/lib/paths";
import {
  extractElementorHeroImage,
  extractFirstContentImage,
} from "@/lib/content-sections";
import { sanitizeWordPressHtml } from "@/lib/wp-html";
import { resolveMediaById, wpUrlToLocal } from "@/lib/media";

export type SeoData = {
  title: string;
  description: string;
  canonical: string;
  robots?: Record<string, string>;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: string;
  schema?: Record<string, unknown> | null;
};

export type ContentRecord = {
  id: number;
  type: "page" | "post";
  slug: string;
  path: string;
  title: string;
  contentHtml: string;
  sanitizedHtml: string;
  excerptHtml?: string;
  featuredMediaId?: number | null;
  featuredImage?: string | null;
  heroBackgroundImage?: string | null;
  heroSideImage?: string | null;
  parent?: number;
  categories?: number[];
  tags?: number[];
  author?: number;
  date?: string;
  modified?: string;
  seo: SeoData;
  template: PageTemplate;
};

type RawItem = {
  id: number;
  type: "page" | "post";
  slug: string;
  path: string;
  title: string;
  contentHtml: string;
  excerptHtml?: string;
  featuredMediaId?: number | null;
  parent?: number;
  categories?: number[];
  tags?: number[];
  author?: number;
  date?: string;
  modified?: string;
  seo?: Partial<SeoData>;
};

type ContractItem = {
  oldUrl: string;
  requiredNewPath: string;
  expectedStatus: number;
  expectedIndexability: string;
  expectedCanonical: string;
  contentType: string;
  redirectRequirement?: string;
  notes?: string;
};

function contractPath(item: ContractItem): string {
  return normalizePathname(item.requiredNewPath);
}

function enrichItem(item: RawItem): ContentRecord {
  const path = normalizePathname(item.path.startsWith("/") ? item.path : `/${item.slug}`);
  const seo: SeoData = {
    title: item.seo?.title || item.title,
    description: item.seo?.description || "",
    canonical: item.seo?.canonical || "",
    robots: item.seo?.robots,
    ogTitle: item.seo?.ogTitle,
    ogDescription: item.seo?.ogDescription,
    ogImage: item.seo?.ogImage,
    twitterCard: item.seo?.twitterCard,
    schema: item.seo?.schema ?? null,
  };

  const sanitizedHtml = sanitizeWordPressHtml(item.contentHtml, { stripDuplicateH1: true });
  const rawBg = extractElementorHeroImage(item.contentHtml);
  const heroBackgroundImage = rawBg ? wpUrlToLocal(rawBg) : null;
  const heroSideImage =
    resolveMediaById(item.featuredMediaId ?? null) ||
    extractFirstContentImage(sanitizedHtml);

  return {
    ...item,
    path,
    contentHtml: item.contentHtml,
    sanitizedHtml,
    featuredMediaId: item.featuredMediaId,
    featuredImage: resolveMediaById(item.featuredMediaId ?? null),
    heroBackgroundImage,
    heroSideImage: heroSideImage ? wpUrlToLocal(heroSideImage) : null,
    seo,
    template: classifyPageTemplate(path, item.type),
  };
}

const registry = new Map<string, ContentRecord>();

for (const item of [...(pages as RawItem[]), ...(posts as RawItem[])]) {
  const record = enrichItem(item);
  for (const key of pathKeys(record.path)) {
    registry.set(key, record);
  }
  registry.set(normalizePathname(`/${record.slug}`), record);
}

const contract = urlContract as { items: ContractItem[] };

export function getContractItems(): ContractItem[] {
  return contract.items;
}

export function getContractByPath(path: string): ContractItem | undefined {
  const normalized = normalizePathname(path);
  return contract.items.find((item) => contractPath(item) === normalized);
}

export function getContentByPath(path: string): ContentRecord | null {
  const normalized = normalizePathname(path);
  if (normalized === "/") return null;

  for (const key of pathKeys(normalized)) {
    const hit = registry.get(key);
    if (hit) return hit;
  }
  return null;
}

export function getArchiveByPath(path: string): ArchiveMatch | null {
  return parseArchivePath(path);
}

const ARCHIVE_PREFIXES = ["/category/", "/tag/", "/author/"];

function isArchivePath(p: string): boolean {
  return ARCHIVE_PREFIXES.some((prefix) => p.startsWith(prefix));
}

export function getAllRoutablePaths(): string[] {
  const paths = new Set<string>();

  for (const item of contract.items) {
    const p = contractPath(item);
    if (p === "/" || isArchivePath(p)) continue;
    if (item.expectedStatus === 200) {
      paths.add(p);
    }
  }

  return [...paths];
}

export function getAllContentRecords(): ContentRecord[] {
  const seen = new Set<number>();
  const records: ContentRecord[] = [];
  for (const record of registry.values()) {
    if (seen.has(record.id)) continue;
    seen.add(record.id);
    records.push(record);
  }
  return records;
}

export type RouteResolution =
  | { kind: "content"; record: ContentRecord }
  | { kind: "archive"; archive: ArchiveMatch }
  | { kind: "redirect"; destination: string; permanent: boolean }
  | { kind: "not-found" };

export function resolveRoute(path: string): RouteResolution {
  const normalized = normalizePathname(path);
  const contractItem = getContractByPath(normalized);

  if (contractItem?.expectedStatus === 301) {
    const oldPath = normalizePathname(new URL(contractItem.oldUrl).pathname);
    const destPath = normalizePathname(contractItem.requiredNewPath);
    // 301 applies only to the non-canonical variant (e.g. missing trailing slash)
    if (normalized === oldPath && oldPath !== destPath) {
      return {
        kind: "redirect",
        destination: destPath === "/" ? "/" : `${destPath}/`,
        permanent: true,
      };
    }
  }

  const content = getContentByPath(normalized);
  if (content) return { kind: "content", record: content };

  const archive = getArchiveByPath(normalized);
  if (archive) return { kind: "archive", archive };

  if (contractItem?.expectedStatus === 200) {
    return { kind: "not-found" };
  }

  return { kind: "not-found" };
}
