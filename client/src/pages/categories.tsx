import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PostCard } from "@/components/post-card";
import { Layers } from "lucide-react";
import type { Category, PostWithAuthor } from "@shared/schema";

export function CategoriesPage() {
  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Layers className="h-5 w-5 text-primary" />
          <h1 className="font-serif text-2xl font-bold" data-testid="text-categories-title">Categories</h1>
        </div>
        <p className="text-sm text-muted-foreground">Browse posts by topic</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-24 rounded-md" />
          ))}
        </div>
      ) : categories && categories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <Link key={cat.id} href={`/categories/${cat.slug}`}>
              <div className="rounded-md border p-5 hover-elevate cursor-pointer" data-testid={`card-category-${cat.id}`}>
                <h3 className="font-semibold mb-1">{cat.name}</h3>
                {cat.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{cat.description}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-center py-10">No categories yet</p>
      )}
    </div>
  );
}

export function CategoryPage() {
  const [, params] = useRoute("/categories/:slug");
  const slug = params?.slug;

  const { data: category } = useQuery<Category>({
    queryKey: ["/api/categories", slug],
    enabled: !!slug,
  });

  const { data: posts, isLoading } = useQuery<PostWithAuthor[]>({
    queryKey: ["/api/categories", slug, "posts"],
    enabled: !!slug,
  });

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
      <div className="mb-8">
        <Link href="/categories">
          <span className="text-xs text-muted-foreground mb-2 block">All Categories</span>
        </Link>
        <h1 className="font-serif text-2xl font-bold" data-testid="text-category-name">
          {category?.name || slug}
        </h1>
        {category?.description && (
          <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-5">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <Skeleton className="w-32 h-28 rounded-md" />
            </div>
          ))}
        </div>
      ) : posts && posts.length > 0 ? (
        <div className="space-y-8">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-center py-10 text-sm">No posts in this category yet</p>
      )}
    </div>
  );
}
