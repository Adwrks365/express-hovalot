import * as cheerio from "cheerio";
import categoriesData from "@/content/data/categories.json";
import posts from "@/content/data/posts.json";
import type { ContentRecord } from "@/lib/content-registry";
import { resolveMediaById } from "@/lib/media";
import { normalizePathname } from "@/lib/paths";

export type TocEntry = { id: string; text: string; level: 2 | 3 };

export type AuthorInfo = {
  name: string;
  slug: string;
  archivePath: string;
  description?: string;
};

export type ArticleNeighbor = {
  path: string;
  title: string;
  featuredImage?: string | null;
};

export type ArticleListItem = {
  id: number;
  path: string;
  title: string;
  date?: string;
  featuredImage?: string | null;
};

export type CategoryListItem = {
  slug: string;
  name: string;
  count: number;
};

type WpCategory = {
  id: number;
  slug: string;
  name: string;
  count?: number;
};

type PostRow = {
  id: number;
  path: string;
  title: string;
  date?: string;
  featuredMediaId?: number | null;
  categories?: number[];
};

export const AUTHOR: AuthorInfo = {
  name: "צוות אקספרס הובלות",
  slug: "guest_2020",
  archivePath: "/author/guest_2020",
};

export function getAuthorInfo(record: ContentRecord): AuthorInfo {
  const graph = record.seo.schema?.["@graph"] as Array<Record<string, unknown>> | undefined;
  const article = graph?.find((n) => n["@type"] === "Article");
  const authorName =
    typeof article?.author === "object" && article.author && "name" in article.author
      ? String((article.author as { name?: string }).name)
      : AUTHOR.name;
  return { ...AUTHOR, name: authorName || AUTHOR.name };
}

export function addHeadingIds(html: string): { html: string; toc: TocEntry[] } {
  const $ = cheerio.load(`<div>${html}</div>`, {}, false);
  const toc: TocEntry[] = [];
  const used = new Set<string>();

  $("h2, h3").each((_, el) => {
    const text = $(el).text().replace(/\s+/g, " ").trim();
    if (!text) return;
    let id = text
      .replace(/\s+/g, "-")
      .replace(/[^\w\u0590-\u05FF-]+/g, "")
      .slice(0, 80);
    let n = 2;
    while (used.has(id)) {
      id = `${id}-${n++}`;
    }
    used.add(id);
    $(el).attr("id", id);
    toc.push({ id, text, level: el.tagName === "h2" ? 2 : 3 });
  });

  return { html: $.root().children().html() || html, toc };
}

function sortedPosts() {
  return [...(posts as Array<{ path: string; title: string; date?: string; featuredMediaId?: number | null }>)].sort(
    (a, b) => (a.date || "").localeCompare(b.date || ""),
  );
}

function toListItem(post: PostRow): ArticleListItem {
  return {
    id: post.id,
    path: post.path,
    title: post.title,
    date: post.date,
    featuredImage: resolveMediaById(post.featuredMediaId ?? null),
  };
}

export function getArticleNeighbors(path: string): {
  prev: ArticleNeighbor | null;
  next: ArticleNeighbor | null;
} {
  const list = sortedPosts() as PostRow[];
  const idx = list.findIndex((p) => normalizePathname(p.path) === normalizePathname(path));
  if (idx < 0) return { prev: null, next: null };
  const prev = idx > 0 ? list[idx - 1] : null;
  const next = idx < list.length - 1 ? list[idx + 1] : null;
  const mapNeighbor = (p: PostRow): ArticleNeighbor => ({
    path: p.path,
    title: p.title,
    featuredImage: resolveMediaById(p.featuredMediaId ?? null),
  });
  return {
    prev: prev ? mapNeighbor(prev) : null,
    next: next ? mapNeighbor(next) : null,
  };
}

export function getRecentArticles(currentPath: string, limit = 5): ArticleListItem[] {
  const list = [...(posts as PostRow[])].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  return list
    .filter((p) => normalizePathname(p.path) !== normalizePathname(currentPath))
    .slice(0, limit)
    .map(toListItem);
}

export function getPrimaryCategory(record: ContentRecord): { name: string; href: string } | null {
  const cats = (categoriesData as { categories: WpCategory[] }).categories || [];
  const id = record.categories?.[0];
  if (!id) return null;
  const cat = cats.find((c) => c.id === id && c.slug !== "uncategorized");
  if (!cat) return null;
  return { name: cat.name, href: `/category/${cat.slug}/` };
}

export function getSidebarCategories(): CategoryListItem[] {
  const cats = (categoriesData as { categories: WpCategory[] }).categories || [];
  return cats
    .filter((c) => c.slug !== "uncategorized" && (c.count ?? 0) > 0)
    .map((c) => ({ slug: c.slug, name: c.name, count: c.count ?? 0 }))
    .sort((a, b) => b.count - a.count);
}

export function getRelatedArticles(record: ContentRecord, limit = 4) {
  const categories = new Set(record.categories || []);
  type PostRow = (typeof posts)[number];
  const list = (posts as PostRow[]).filter(
    (p) => normalizePathname(p.path) !== normalizePathname(record.path),
  );
  const sameCategory = list.filter((p) => (p.categories || []).some((c) => categories.has(c)));
  const pool = (sameCategory.length ? sameCategory : list).sort((a, b) =>
    (b.date || "").localeCompare(a.date || ""),
  );
  return pool.slice(0, limit);
}
