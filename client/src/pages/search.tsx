import { useQuery } from "@tanstack/react-query";
import { useSearch } from "wouter";
import { motion } from "framer-motion";
import { PostCard } from "@/components/post-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Sparkles } from "lucide-react";
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto max-w-3xl px-4 sm:px-6 py-14"
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <div className="flex items-center gap-2.5 mb-2">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Search className="h-4 w-4 text-primary" />
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight" data-testid="text-search-title">
            {tag ? `Posts tagged #${tag}` : `Results for "${q}"`}
          </h1>
        </div>
        {posts && (
          <p className="text-sm text-muted-foreground mt-2" data-testid="text-search-count">
            {posts.length} {posts.length === 1 ? "post" : "posts"} found
          </p>
        )}
      </motion.div>

      {!searchQuery ? (
        <div className="text-center py-24">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Search className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">Enter a search term to find posts</p>
        </div>
      ) : isLoading ? (
        <div className="space-y-0">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-5 py-6 border-b">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <Skeleton className="w-36 h-32 rounded-lg" />
            </div>
          ))}
        </div>
      ) : posts && posts.length > 0 ? (
        <div>
          {posts.map((post, i) => (
            <PostCard key={post.id} post={post} index={i} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
            <Sparkles className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-sm">No posts found matching your search</p>
        </div>
      )}
    </motion.div>
  );
}
