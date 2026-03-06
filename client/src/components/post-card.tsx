import { Link } from "wouter";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Eye, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { PostWithAuthor } from "@shared/schema";

function getReadingTime(content: string) {
  return Math.max(1, Math.ceil(content.replace(/<[^>]*>/g, "").split(/\s+/).length / 200));
}

const gradients = [
  "from-violet-500/20 via-purple-500/10 to-fuchsia-500/20",
  "from-blue-500/20 via-cyan-500/10 to-teal-500/20",
  "from-orange-500/20 via-amber-500/10 to-yellow-500/20",
  "from-rose-500/20 via-pink-500/10 to-red-500/20",
  "from-emerald-500/20 via-green-500/10 to-lime-500/20",
];

function getGradient(id: string) {
  const hash = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return gradients[hash % gradients.length];
}

export function PostCard({ post, featured = false, index = 0 }: { post: PostWithAuthor; featured?: boolean; index?: number }) {
  const timeAgo = post.publishedAt
    ? formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true })
    : formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });
  const readingTime = getReadingTime(post.content);

  if (featured) {
    return (
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="group"
        data-testid={`card-post-featured-${post.id}`}
      >
        <Link href={`/post/${post.slug}`}>
          <div className={`relative rounded-xl overflow-hidden aspect-[2.2/1] mb-6 bg-gradient-to-br ${getGradient(post.id)}`}>
            {post.coverImage ? (
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
                <span className="font-serif text-4xl text-foreground/10 select-none">Inkwell</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
        </Link>
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            {post.category && (
              <Link href={`/categories/${post.category.slug}`}>
                <Badge variant="secondary" className="text-xs font-medium" data-testid={`badge-category-${post.category.id}`}>
                  {post.category.name}
                </Badge>
              </Link>
            )}
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {readingTime} min read
            </span>
          </div>
          <Link href={`/post/${post.slug}`}>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold leading-tight tracking-tight group-hover:text-primary transition-colors duration-300" data-testid="text-post-title">
              {post.title}
            </h2>
          </Link>
          {post.excerpt && (
            <p className="text-muted-foreground leading-relaxed line-clamp-2 text-[15px]" data-testid="text-post-excerpt">
              {post.excerpt}
            </p>
          )}
          <div className="flex items-center justify-between gap-4 pt-2">
            <Link href={`/author/${post.author.username}`}>
              <div className="flex items-center gap-2.5">
                <Avatar className="h-8 w-8 ring-2 ring-background">
                  <AvatarImage src={post.author.avatarUrl || undefined} alt={post.author.displayName} />
                  <AvatarFallback className="text-[10px] font-semibold bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
                    {post.author.displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium" data-testid="text-author-name">{post.author.displayName}</span>
                  <span className="text-muted-foreground/50">&middot;</span>
                  <span className="text-muted-foreground text-xs" data-testid="text-post-date">{timeAgo}</span>
                </div>
              </div>
            </Link>
            <div className="flex items-center gap-3 text-muted-foreground text-sm">
              <span className="flex items-center gap-1" data-testid="text-like-count">
                <Heart className="h-3.5 w-3.5" />
                {post.likeCount || 0}
              </span>
              <span className="flex items-center gap-1" data-testid="text-comment-count">
                <MessageCircle className="h-3.5 w-3.5" />
                {post.commentCount || 0}
              </span>
            </div>
          </div>
        </div>
      </motion.article>
    );
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="group flex gap-5 py-6 border-b last:border-b-0"
      data-testid={`card-post-${post.id}`}
    >
      <div className="flex-1 space-y-2.5 min-w-0">
        <Link href={`/author/${post.author.username}`}>
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={post.author.avatarUrl || undefined} alt={post.author.displayName} />
              <AvatarFallback className="text-[8px] font-semibold bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
                {post.author.displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium" data-testid="text-author-name">{post.author.displayName}</span>
          </div>
        </Link>
        <Link href={`/post/${post.slug}`}>
          <h3 className="font-serif text-lg sm:text-xl font-bold leading-snug tracking-tight group-hover:text-primary transition-colors duration-300 line-clamp-2" data-testid="text-post-title">
            {post.title}
          </h3>
        </Link>
        {post.excerpt && (
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 hidden sm:block" data-testid="text-post-excerpt">
            {post.excerpt}
          </p>
        )}
        <div className="flex items-center gap-3 flex-wrap pt-0.5">
          <span className="text-xs text-muted-foreground" data-testid="text-post-date">{timeAgo}</span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {readingTime} min
          </span>
          {post.category && (
            <Link href={`/categories/${post.category.slug}`}>
              <Badge variant="secondary" className="text-[10px]" data-testid={`badge-category-${post.category.id}`}>
                {post.category.name}
              </Badge>
            </Link>
          )}
          <div className="flex items-center gap-3 text-muted-foreground text-xs ml-auto">
            <span className="flex items-center gap-1" data-testid="text-like-count">
              <Heart className="h-3 w-3" />
              {post.likeCount || 0}
            </span>
            <span className="flex items-center gap-1" data-testid="text-comment-count">
              <MessageCircle className="h-3 w-3" />
              {post.commentCount || 0}
            </span>
            <span className="flex items-center gap-1 hidden sm:flex" data-testid="text-view-count">
              <Eye className="h-3 w-3" />
              {post.viewCount}
            </span>
          </div>
        </div>
      </div>
      <Link href={`/post/${post.slug}`} className="flex-shrink-0">
        <div className={`w-28 h-28 sm:w-36 sm:h-32 rounded-lg overflow-hidden ${post.coverImage ? "bg-muted" : `bg-gradient-to-br ${getGradient(post.id)}`}`}>
          {post.coverImage ? (
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="font-serif text-sm text-foreground/10 select-none">Inkwell</span>
            </div>
          )}
        </div>
      </Link>
    </motion.article>
  );
}
