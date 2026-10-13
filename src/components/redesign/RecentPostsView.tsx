import posts from "@/content/data/posts.json";
import { ArticleCard, type ArticleCardData } from "@/components/internal/ArticleCard";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { RedesignSection } from "@/components/redesign/Section";

export function RecentPostsView() {
  const all = [...(posts as ArticleCardData[])].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  return (
    <RedesignSection tone="mist" kind="posts">
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {all.map((post, index) => (
          <ScrollReveal key={post.id} variant="card" delayMs={(index % 3) * 60}>
            <ArticleCard post={post} />
          </ScrollReveal>
        ))}
      </div>
    </RedesignSection>
  );
}
