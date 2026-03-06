import { Link } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { PostWithAuthor } from "@shared/schema";

export function PostCard({ post, featured = false }: { post: PostWithAuthor; featured?: boolean }) {
  const timeAgo = post.publishedAt
    ? formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true })
    : formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });

  if (featured) {
    return (
      <article className="group" data-testid={`card-post-featured-${post.id}`}>
        <Link href={`/post/${post.slug}`}>
          <div className="relative rounded-md overflow-hidden aspect-[2/1] mb-5 bg-muted">
            {post.coverImage ? (
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <span className="font-serif text-3xl text-primary/30">Inkwell</span>
              </div>
            )}
          </div>
        </Link>
        <div className="space-y-3">
          {post.category && (
            <Link href={`/categories/${post.category.slug}`}>
              <Badge variant="secondary" className="text-xs" data-testid={`badge-category-${post.category.id}`}>
                {post.category.name}
              </Badge>
            </Link>
          )}
          <Link href={`/post/${post.slug}`}>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold leading-tight tracking-tight group-hover:text-primary transition-colors" data-testid="text-post-title">
              {post.title}
            </h2>
          </Link>
          {post.excerpt && (
            <p className="text-muted-foreground leading-relaxed line-clamp-2" data-testid="text-post-excerpt">
              {post.excerpt}
            </p>
          )}
          <div className="flex items-center justify-between gap-4 pt-1">
            <Link href={`/author/${post.author.username}`}>
              <div className="flex items-center gap-2">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={post.author.avatarUrl || undefined} alt={post.author.displayName} />
                  <AvatarFallback className="text-[10px] bg-primary text-primary-foreground">
                    {post.author.displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium" data-testid="text-author-name">{post.author.displayName}</span>
                  <span className="text-muted-foreground">&middot;</span>
                  <span className="text-muted-foreground" data-testid="text-post-date">{timeAgo}</span>
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
      </article>
    );
  }

  return (
    <article className="group flex gap-5" data-testid={`card-post-${post.id}`}>
      <div className="flex-1 space-y-2 min-w-0">
        <Link href={`/author/${post.author.username}`}>
          <div className="flex items-center gap-2 mb-1">
            <Avatar className="h-5 w-5">
              <AvatarImage src={post.author.avatarUrl || undefined} alt={post.author.displayName} />
              <AvatarFallback className="text-[8px] bg-primary text-primary-foreground">
                {post.author.displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium" data-testid="text-author-name">{post.author.displayName}</span>
          </div>
        </Link>
        <Link href={`/post/${post.slug}`}>
          <h3 className="font-serif text-lg font-bold leading-snug tracking-tight group-hover:text-primary transition-colors line-clamp-2" data-testid="text-post-title">
            {post.title}
          </h3>
        </Link>
        {post.excerpt && (
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 hidden sm:block" data-testid="text-post-excerpt">
            {post.excerpt}
          </p>
        )}
        <div className="flex items-center gap-3 flex-wrap pt-1">
          <span className="text-xs text-muted-foreground" data-testid="text-post-date">{timeAgo}</span>
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
            <span className="flex items-center gap-1" data-testid="text-view-count">
              <Eye className="h-3 w-3" />
              {post.viewCount}
            </span>
          </div>
        </div>
      </div>
      {post.coverImage && (
        <Link href={`/post/${post.slug}`} className="flex-shrink-0">
          <div className="w-24 h-24 sm:w-32 sm:h-28 rounded-md overflow-hidden bg-muted">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
          </div>
        </Link>
      )}
    </article>
  );
}
