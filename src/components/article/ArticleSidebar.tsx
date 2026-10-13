import { CategoryList } from "@/components/article/CategoryList";
import { RecentArticleList } from "@/components/article/RecentArticleList";
import { SidebarContactForm } from "@/components/article/SidebarContactForm";
import type { ArticleListItem, CategoryListItem } from "@/lib/article-utils";

export function ArticleSidebar({
  recent,
  categories,
}: {
  recent: ArticleListItem[];
  categories: CategoryListItem[];
}) {
  return (
    <div className="space-y-6">
      <RecentArticleList items={recent} />
      <CategoryList items={categories} />
      <SidebarContactForm />
    </div>
  );
}
