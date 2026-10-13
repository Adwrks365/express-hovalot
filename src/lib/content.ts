import pages from "@/content/data/pages.json";
import posts from "@/content/data/posts.json";
import urlContract from "@/content/data/url-contract.json";

export type ContentPage = {
  id: number;
  slug: string;
  path: string;
  title: string;
  type: "page" | "post";
  seo?: {
    title?: string;
    description?: string;
    canonical?: string;
    ogImage?: string;
  };
};

export function getAllPages(): ContentPage[] {
  return (pages as ContentPage[]).concat(posts as ContentPage[]);
}

export function getUrlContract() {
  return urlContract;
}

export function getContentStats() {
  return {
    pages: (pages as unknown[]).length,
    posts: (posts as unknown[]).length,
    contractUrls: (urlContract as { items?: unknown[] }).items?.length ?? 0,
  };
}
