import { useQuery } from "@tanstack/react-query";
import { useSearch } from "wouter";
import { PostCard } from "@/components/post-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";
import type { PostWithAuthor } from "@shared/schema";

export default function SearchPage() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const q = params.get("q") || "";
  const tag = params.get("tag") || "";

  const searchQuery = q || tag;

  const { data: posts, isLoading } = useQuery<PostWithAuthor[]>({
    queryKey: ["/api/posts/search", `?q=${encodeURIComponent(q)}&tag=${encodeURIComponent(tag)}`],
    enabled: !!searchQuery,
  });

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Search className="h-5 w-5 text-primary" />
          <h1 className="font-serif text-2xl font-bold" data-testid="text-search-title">
            {tag ? `Posts tagged #${tag}` : `Results for "${q}"`}
          </h1>
        </div>
        {posts && (
          <p className="text-sm text-muted-foreground" data-testid="text-search-count">
            {posts.length} {posts.length === 1 ? "post" : "posts"} found
          </p>
        )}
      </div>

      {!searchQuery ? (
        <div className="text-center py-20">
          <Search className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">Enter a search term to find posts</p>
        </div>
      ) : isLoading ? (
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
        <div className="text-center py-20">
          <p className="text-muted-foreground">No posts found matching your search</p>
        </div>
      )}
    </div>
  );
}
