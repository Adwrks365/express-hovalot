/**
 * Import WordPress audit content into src/content/data (verbatim, no rewriting)
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const AUDIT = path.join(ROOT, "audit");
const OUT = path.join(ROOT, "src", "content", "data");

const EXCLUDED_PAGE_SLUGS = ["שגיאה-404-1", "שגיאה-404-2", "%d7%a9%d7%92%d7%99%d7%90%d7%94-404-1", "%d7%a9%d7%92%d7%99%d7%90%d7%94-404-2"];

function decodeSlug(slug) {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

function pathFromLink(link) {
  if (!link) return "/";
  try {
    const pathname = new URL(link).pathname;
    const decoded = pathname
      .split("/")
      .map((seg) => {
        if (!seg) return seg;
        try {
          return decodeURIComponent(seg);
        } catch {
          return seg;
        }
      })
      .join("/");
    return decoded.replace(/\/$/, "") || "/";
  } catch {
    return "/";
  }
}

function normalizeItem(item) {
  const yoast = item.yoast_head_json || {};
  return {
    id: item.id,
    type: item.type,
    slug: decodeSlug(item.slug),
    path: pathFromLink(item.link),
    title: typeof item.title === "string" ? item.title : item.title?.rendered || "",
    contentHtml: typeof item.content === "string" ? item.content : item.content?.rendered || "",
    excerptHtml: typeof item.excerpt === "string" ? item.excerpt : item.excerpt?.rendered || "",
    featuredMediaId: item.featured_media || null,
    parent: item.parent || 0,
    categories: item.categories || [],
    tags: item.tags || [],
    author: item.author,
    date: item.date,
    modified: item.modified,
    seo: {
      title: yoast.title || "",
      description: yoast.description || "",
      canonical: yoast.canonical || item.link || "",
      robots: yoast.robots || {},
      ogTitle: yoast.og_title || "",
      ogDescription: yoast.og_description || "",
      ogImage: yoast.og_image?.[0]?.url || "",
      twitterCard: yoast.twitter_card || "",
      schema: yoast.schema || null,
    },
  };
}

function main() {
  const pagesRaw = JSON.parse(fs.readFileSync(path.join(AUDIT, "content/pages.json"), "utf8"));
  const postsRaw = JSON.parse(fs.readFileSync(path.join(AUDIT, "content/posts.json"), "utf8"));
  const categories = JSON.parse(fs.readFileSync(path.join(AUDIT, "content/categories.json"), "utf8"));
  const tags = JSON.parse(fs.readFileSync(path.join(AUDIT, "content/tags.json"), "utf8"));
  const urlContract = JSON.parse(fs.readFileSync(path.join(AUDIT, "reports/url-contract.json"), "utf8"));

  const pages = pagesRaw.pages
    .filter((p) => !EXCLUDED_PAGE_SLUGS.some((s) => p.slug.includes(s) || decodeSlug(p.slug).includes("404-1") || decodeSlug(p.slug).includes("404-2")))
    .map(normalizeItem);

  const posts = postsRaw.posts.map(normalizeItem);

  const homepage = pages.find((p) => p.path === "" || p.path === "/") || pages.find((p) => p.id === 2701);

  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, "pages.json"), JSON.stringify(pages, null, 2));
  fs.writeFileSync(path.join(OUT, "posts.json"), JSON.stringify(posts, null, 2));
  fs.writeFileSync(path.join(OUT, "categories.json"), JSON.stringify(categories, null, 2));
  fs.writeFileSync(path.join(OUT, "tags.json"), JSON.stringify(tags, null, 2));
  fs.writeFileSync(path.join(OUT, "url-contract.json"), JSON.stringify(urlContract, null, 2));
  if (homepage) fs.writeFileSync(path.join(OUT, "homepage-source.json"), JSON.stringify(homepage, null, 2));

  console.log(JSON.stringify({ pages: pages.length, posts: posts.length, homepage: !!homepage }));
}

main();
