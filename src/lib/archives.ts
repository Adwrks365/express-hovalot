import categoriesData from "@/content/data/categories.json";
import tagsData from "@/content/data/tags.json";
import posts from "@/content/data/posts.json";
import { normalizePathname } from "@/lib/paths";

type WpTerm = {
  id: number;
  slug: string;
  name: string;
  link?: string;
  yoast_head_json?: {
    title?: string;
    description?: string;
    canonical?: string;
    robots?: Record<string, string>;
  };
};

type PostItem = {
  id: number;
  slug: string;
  path: string;
  title: string;
  date?: string;
  categories?: number[];
  tags?: number[];
  author?: number;
  seo?: { title?: string; description?: string; canonical?: string };
};

const categories = (categoriesData as { categories: WpTerm[] }).categories || [];
const tags = (tagsData as { tags: WpTerm[] }).tags || [];
const allPosts = posts as PostItem[];

export type ArchiveKind = "category" | "tag" | "author";

export type ArchiveMatch = {
  kind: ArchiveKind;
  slug: string;
  term?: WpTerm;
  authorSlug?: string;
  page?: number;
};

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function parseArchivePath(path: string): ArchiveMatch | null {
  const normalized = normalizePathname(path);
  const parts = normalized.slice(1).split("/");

  if (parts[0] === "category" && parts[1]) {
    const slug = decodeURIComponent(parts[1]);
    const page = parts[2] === "page" && parts[3] ? Number(parts[3]) : 1;
    const term = categories.find((c) => safeDecode(c.slug) === slug);
    return { kind: "category", slug, term, page: page || 1 };
  }

  if (parts[0] === "tag" && parts[1]) {
    const slug = decodeURIComponent(parts[1]);
    const term = tags.find((t) => safeDecode(t.slug) === slug);
    return { kind: "tag", slug, term, page: 1 };
  }

  if (parts[0] === "author" && parts[1]) {
    const authorSlug = parts[1];
    const page = parts[2] === "page" && parts[3] ? Number(parts[3]) : 1;
    return { kind: "author", slug: authorSlug, authorSlug, page: page || 1 };
  }

  return null;
}

const ARCHIVE_PAGE_SIZE = 10;

export function getArchivePosts(match: ArchiveMatch): PostItem[] {
  const page = match.page || 1;
  const start = (page - 1) * ARCHIVE_PAGE_SIZE;
  return getAllArchivePosts(match).slice(start, start + ARCHIVE_PAGE_SIZE);
}

export function getArchivePageCount(match: ArchiveMatch): number {
  return Math.max(1, Math.ceil(getAllArchivePosts(match).length / ARCHIVE_PAGE_SIZE));
}

/** Base path (no trailing slash) used for `/page/N/` pagination links. */
export function getArchiveBasePath(match: ArchiveMatch): string {
  if (match.kind === "author") return `/author/${match.authorSlug}`;
  return `/${match.kind}/${match.slug}`;
}

function getAllArchivePosts(match: ArchiveMatch): PostItem[] {
  let filtered: PostItem[] = [];

  if (match.kind === "category" && match.term) {
    filtered = allPosts.filter((p) => p.categories?.includes(match.term!.id));
  } else if (match.kind === "tag" && match.term) {
    filtered = allPosts.filter((p) => p.tags?.includes(match.term!.id));
  } else if (match.kind === "author" && match.authorSlug === "guest_2020") {
    filtered = allPosts.filter((p) => p.author === 3);
  }

  filtered.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  return filtered;
}

export function getArchiveTitle(match: ArchiveMatch): string {
  if ((match.kind === "category" || match.kind === "tag") && match.term) {
    return match.term.name;
  }
  if (match.kind === "author") {
    return "מאמרים של: צוות אקספרס הובלות";
  }
  return "ארכיון";
}

export function getArchiveSeo(match: ArchiveMatch) {
  if (match.term?.yoast_head_json) {
    const y = match.term.yoast_head_json;
    return {
      title: y.title || getArchiveTitle(match),
      description: y.description || "",
      canonical: y.canonical || "",
      robots: y.robots,
    };
  }
  return {
    title: match.kind === "author" ? "צוות אקספרס הובלות, Author at אקספרס הובלות בירושלים" : `${getArchiveTitle(match)} - אקספרס הובלות בירושלים`,
    description: "",
    canonical: "",
    robots: { index: "index", follow: "follow" },
  };
}
