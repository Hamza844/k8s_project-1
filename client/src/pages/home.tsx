import { useQuery } from "@tanstack/react-query";
import { PostCard } from "@/components/post-card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { TrendingUp, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PostWithAuthor, Category } from "@shared/schema";

function PostCardSkeleton() {
  return (
    <div className="flex gap-5">
      <div className="flex-1 space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="w-32 h-28 rounded-md flex-shrink-0" />
    </div>
  );
}

function FeaturedSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="w-full aspect-[2/1] rounded-md" />
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

export default function HomePage() {
  const { data: posts, isLoading: postsLoading } = useQuery<PostWithAuthor[]>({
    queryKey: ["/api/posts"],
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: trendingPosts } = useQuery<PostWithAuthor[]>({
    queryKey: ["/api/posts/trending"],
  });

  const featuredPost = posts?.[0];
  const latestPosts = posts?.slice(1) || [];

  return (
    <div className="min-h-screen">
      <section className="border-b bg-gradient-to-b from-primary/5 to-transparent">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-20">
          <div className="max-w-2xl">
            <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1] mb-4" data-testid="text-hero-title">
              Where ideas take shape.
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6" data-testid="text-hero-subtitle">
              Discover stories, thinking, and expertise from writers on any topic.
            </p>
            <Link href="/signup">
              <Button size="lg" data-testid="button-hero-cta">
                Start reading
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {categories && categories.length > 0 && (
        <section className="border-b">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              {categories.map((cat) => (
                <Link key={cat.id} href={`/categories/${cat.slug}`}>
                  <Badge variant="secondary" className="whitespace-nowrap cursor-pointer" data-testid={`badge-cat-${cat.id}`}>
                    {cat.name}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            {postsLoading ? (
              <>
                <FeaturedSkeleton />
                <div className="border-t pt-8 space-y-8">
                  {[1, 2, 3].map((i) => (
                    <PostCardSkeleton key={i} />
                  ))}
                </div>
              </>
            ) : (
              <>
                {featuredPost && (
                  <PostCard post={featuredPost} featured />
                )}
                {latestPosts.length > 0 && (
                  <div className="border-t pt-8 space-y-8">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground" data-testid="text-latest-heading">
                        Latest
                      </h2>
                    </div>
                    {latestPosts.map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>
                )}
                {(!posts || posts.length === 0) && (
                  <div className="text-center py-20">
                    <p className="text-muted-foreground font-serif text-lg">No posts yet. Be the first to write one!</p>
                    <Link href="/write">
                      <Button className="mt-4" data-testid="button-write-first">Write a post</Button>
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>

          <aside className="space-y-8 lg:border-l lg:pl-8">
            {trendingPosts && trendingPosts.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-5">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold uppercase tracking-wider" data-testid="text-trending-heading">
                    Trending
                  </h3>
                </div>
                <div className="space-y-5">
                  {trendingPosts.slice(0, 5).map((post, i) => (
                    <Link key={post.id} href={`/post/${post.slug}`}>
                      <div className="group flex gap-3" data-testid={`card-trending-${post.id}`}>
                        <span className="text-2xl font-bold text-muted-foreground/30 font-serif leading-none mt-0.5">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground mb-0.5">
                            {post.author.displayName}
                          </p>
                          <h4 className="text-sm font-semibold leading-snug group-hover:text-primary transition-colors line-clamp-2">
                            {post.title}
                          </h4>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {categories && categories.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" data-testid="text-categories-heading">
                  Discover Topics
                </h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <Link key={cat.id} href={`/categories/${cat.slug}`}>
                      <Badge variant="secondary" className="cursor-pointer" data-testid={`badge-sidebar-cat-${cat.id}`}>
                        {cat.name}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
