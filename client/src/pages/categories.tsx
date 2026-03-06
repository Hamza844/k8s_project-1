import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PostCard } from "@/components/post-card";
import { Layers, ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Category, PostWithAuthor } from "@shared/schema";

const categoryColors = [
  "from-blue-500/15 to-cyan-500/5 border-blue-500/20",
  "from-purple-500/15 to-pink-500/5 border-purple-500/20",
  "from-amber-500/15 to-orange-500/5 border-amber-500/20",
  "from-emerald-500/15 to-teal-500/5 border-emerald-500/20",
  "from-rose-500/15 to-red-500/5 border-rose-500/20",
  "from-indigo-500/15 to-violet-500/5 border-indigo-500/20",
];

export function CategoriesPage() {
  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto max-w-4xl px-4 sm:px-6 py-14"
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <div className="flex items-center gap-2.5 mb-2">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Layers className="h-4.5 w-4.5 text-primary" />
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight" data-testid="text-categories-title">Explore Topics</h1>
        </div>
        <p className="text-muted-foreground mt-2">Discover stories organized by what matters to you</p>
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : categories && categories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Link href={`/categories/${cat.slug}`}>
                <div
                  className={`rounded-xl border bg-gradient-to-br p-6 cursor-pointer hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 ${categoryColors[i % categoryColors.length]}`}
                  data-testid={`card-category-${cat.id}`}
                >
                  <h3 className="font-semibold text-lg mb-1.5">{cat.name}</h3>
                  {cat.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{cat.description}</p>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-muted-foreground">No categories yet</p>
        </div>
      )}
    </motion.div>
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
        <Link href="/categories">
          <Button variant="ghost" size="sm" className="mb-4 -ml-2 gap-2 text-muted-foreground">
            <ArrowLeft className="h-4 w-4" />
            All Topics
          </Button>
        </Link>
        <h1 className="font-serif text-3xl font-bold tracking-tight" data-testid="text-category-name">
          {category?.name || slug}
        </h1>
        {category?.description && (
          <p className="text-muted-foreground mt-2 leading-relaxed">{category.description}</p>
        )}
      </motion.div>

      {isLoading ? (
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
        <div className="text-center py-16">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
            <Sparkles className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-sm">No posts in this category yet</p>
        </div>
      )}
    </motion.div>
  );
}
