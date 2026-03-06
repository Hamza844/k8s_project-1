import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { PostCard } from "@/components/post-card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { TrendingUp, Clock, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PostWithAuthor, Category } from "@shared/schema";

function PostCardSkeleton() {
  return (
    <div className="flex gap-5 py-6 border-b">
      <div className="flex-1 space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="w-36 h-32 rounded-lg flex-shrink-0" />
    </div>
  );
}

function FeaturedSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="w-full aspect-[2.2/1] rounded-xl" />
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
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/3" />
        <div className="absolute top-20 right-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-56 h-56 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-28">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary mb-6"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Discover great writing
            </motion.div>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08] mb-5" data-testid="text-hero-title">
              Where ideas
              <span className="block text-primary">take shape.</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed mb-8 max-w-lg" data-testid="text-hero-subtitle">
              Discover stories, thinking, and expertise from writers on any topic.
            </p>
            <div className="flex items-center gap-3">
              <Link href="/signup">
                <Button size="lg" className="rounded-full gap-2 px-6 shadow-lg shadow-primary/20" data-testid="button-hero-cta">
                  Start reading
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/categories">
                <Button size="lg" variant="outline" className="rounded-full px-6" data-testid="button-hero-explore">
                  Explore topics
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {categories && categories.length > 0 && (
        <section className="border-b bg-muted/30">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              {categories.map((cat, i) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link href={`/categories/${cat.slug}`}>
                    <Badge variant="secondary" className="whitespace-nowrap cursor-pointer rounded-full px-3.5 py-1 text-xs font-medium hover:bg-primary/10 hover:text-primary transition-colors" data-testid={`badge-cat-${cat.id}`}>
                      {cat.name}
                    </Badge>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            {postsLoading ? (
              <>
                <FeaturedSkeleton />
                <div className="mt-10 pt-8 space-y-0">
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
                  <div className="mt-10 pt-2">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="flex items-center gap-2 mb-2"
                    >
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground" data-testid="text-latest-heading">
                        Latest
                      </h2>
                    </motion.div>
                    {latestPosts.map((post, i) => (
                      <PostCard key={post.id} post={post} index={i} />
                    ))}
                  </div>
                )}
                {(!posts || posts.length === 0) && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-24"
                  >
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="h-7 w-7 text-primary" />
                    </div>
                    <p className="text-muted-foreground font-serif text-lg mb-2">No posts yet</p>
                    <p className="text-sm text-muted-foreground mb-6">Be the first to share your story.</p>
                    <Link href="/write">
                      <Button className="rounded-full" data-testid="button-write-first">Write a post</Button>
                    </Link>
                  </motion.div>
                )}
              </>
            )}
          </div>

          <aside className="space-y-8 lg:border-l lg:pl-10">
            {trendingPosts && trendingPosts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center gap-2 mb-6">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <h3 className="text-xs font-semibold uppercase tracking-widest" data-testid="text-trending-heading">
                    Trending
                  </h3>
                </div>
                <div className="space-y-5">
                  {trendingPosts.slice(0, 5).map((post, i) => (
                    <Link key={post.id} href={`/post/${post.slug}`}>
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + i * 0.08 }}
                        className="group flex gap-4 py-2"
                        data-testid={`card-trending-${post.id}`}
                      >
                        <span className="text-3xl font-bold text-muted-foreground/20 font-serif leading-none mt-0.5 tabular-nums">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground mb-1 font-medium">
                            {post.author.displayName}
                          </p>
                          <h4 className="text-sm font-semibold leading-snug group-hover:text-primary transition-colors duration-200 line-clamp-2">
                            {post.title}
                          </h4>
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}

            {categories && categories.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <h3 className="text-xs font-semibold uppercase tracking-widest mb-4" data-testid="text-categories-heading">
                  Discover Topics
                </h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <Link key={cat.id} href={`/categories/${cat.slug}`}>
                      <Badge variant="secondary" className="cursor-pointer rounded-full px-3 py-1 text-xs hover:bg-primary/10 hover:text-primary transition-colors" data-testid={`badge-sidebar-cat-${cat.id}`}>
                        {cat.name}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
