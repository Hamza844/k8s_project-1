import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Heart, MessageCircle, Eye, ArrowLeft, Calendar, Clock, Share2, Bookmark } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { useState } from "react";
import type { PostWithAuthor, CommentWithAuthor, Tag } from "@shared/schema";

export default function PostPage() {
  const [, params] = useRoute("/post/:slug");
  const slug = params?.slug;
  const { user } = useAuth();
  const { toast } = useToast();
  const [commentText, setCommentText] = useState("");

  const { data: post, isLoading } = useQuery<PostWithAuthor>({
    queryKey: ["/api/posts", slug],
    enabled: !!slug,
  });

  const { data: comments } = useQuery<CommentWithAuthor[]>({
    queryKey: ["/api/posts", slug, "comments"],
    enabled: !!slug,
  });

  const { data: tags } = useQuery<Tag[]>({
    queryKey: ["/api/posts", slug, "tags"],
    enabled: !!slug,
  });

  const { data: likeStatus } = useQuery<{ liked: boolean; count: number }>({
    queryKey: ["/api/posts", slug, "like-status"],
    enabled: !!slug && !!user,
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/posts/${slug}/like`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts", slug, "like-status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts", slug] });
    },
  });

  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      await apiRequest("POST", `/api/posts/${slug}/comments`, { content });
    },
    onSuccess: () => {
      setCommentText("");
      queryClient.invalidateQueries({ queryKey: ["/api/posts", slug, "comments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts", slug] });
      toast({ title: "Comment added" });
    },
    onError: () => {
      toast({ title: "Failed to add comment", variant: "destructive" });
    },
  });

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    commentMutation.mutate(commentText.trim());
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
        <Skeleton className="h-4 w-20 mb-8" />
        <Skeleton className="h-12 w-full mb-3" />
        <Skeleton className="h-12 w-3/4 mb-8" />
        <div className="flex items-center gap-3 mb-10">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div>
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="w-full aspect-[2/1] rounded-xl mb-10" />
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-4 w-full mb-4" />
        ))}
      </div>
    );
  }

  if (!post) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-5">
          <MessageCircle className="h-7 w-7 text-muted-foreground" />
        </div>
        <h1 className="font-serif text-2xl font-bold mb-2">Post not found</h1>
        <p className="text-muted-foreground mb-6">The post you're looking for doesn't exist or has been removed.</p>
        <Link href="/">
          <Button className="rounded-full" data-testid="button-go-home">Go home</Button>
        </Link>
      </div>
    );
  }

  const readingTime = Math.max(1, Math.ceil(post.content.split(/\s+/).length / 200));

  return (
    <article className="min-h-screen">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="mx-auto max-w-3xl px-4 sm:px-6 py-8"
      >
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-8 -ml-2 gap-2 text-muted-foreground" data-testid="button-back">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {post.category && (
            <Link href={`/categories/${post.category.slug}`}>
              <Badge variant="secondary" className="mb-5 rounded-full px-3" data-testid="badge-post-category">
                {post.category.name}
              </Badge>
            </Link>
          )}

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.08] mb-5" data-testid="text-post-title">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed mb-8" data-testid="text-post-excerpt">
              {post.excerpt}
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-between gap-4 mb-10 pb-8 border-b flex-wrap"
        >
          <Link href={`/author/${post.author.username}`}>
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 ring-2 ring-background shadow-sm">
                <AvatarImage src={post.author.avatarUrl || undefined} alt={post.author.displayName} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground font-semibold">
                  {post.author.displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-sm" data-testid="text-author-name">{post.author.displayName}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {post.publishedAt ? format(new Date(post.publishedAt), "MMM d, yyyy") : format(new Date(post.createdAt), "MMM d, yyyy")}
                  </span>
                  <span className="text-muted-foreground/40">&middot;</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {readingTime} min read
                  </span>
                </div>
              </div>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Button
              variant={likeStatus?.liked ? "default" : "outline"}
              size="sm"
              className="rounded-full gap-1.5"
              onClick={() => user && likeMutation.mutate()}
              disabled={!user || likeMutation.isPending}
              data-testid="button-like"
            >
              <Heart className={`h-4 w-4 ${likeStatus?.liked ? "fill-current" : ""}`} />
              {likeStatus?.count ?? post.likeCount ?? 0}
            </Button>
            <Button variant="outline" size="sm" className="rounded-full gap-1.5" data-testid="text-view-count">
              <Eye className="h-4 w-4" />
              {post.viewCount}
            </Button>
          </div>
        </motion.div>

        {post.coverImage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl overflow-hidden mb-10 bg-muted shadow-sm"
          >
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full object-cover max-h-[500px]"
              data-testid="img-post-cover"
            />
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="prose prose-lg dark:prose-invert max-w-none font-serif
            prose-headings:font-sans prose-headings:tracking-tight prose-headings:font-bold
            prose-p:leading-[1.85] prose-p:text-foreground/85
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
            prose-blockquote:border-l-primary prose-blockquote:bg-muted/30 prose-blockquote:py-1 prose-blockquote:rounded-r-lg prose-blockquote:not-italic
            prose-code:bg-muted prose-code:rounded-md prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-code:font-mono prose-code:before:content-none prose-code:after:content-none
            prose-img:rounded-xl prose-img:shadow-sm
            prose-li:leading-[1.7]"
          dangerouslySetInnerHTML={{ __html: post.content }}
          data-testid="content-post-body"
        />

        {tags && tags.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap gap-2 mt-10 pt-8 border-t"
          >
            {tags.map((tag) => (
              <Link key={tag.id} href={`/search?tag=${tag.slug}`}>
                <Badge variant="secondary" className="text-xs rounded-full px-3 hover:bg-primary/10 hover:text-primary transition-colors" data-testid={`badge-tag-${tag.id}`}>
                  #{tag.name}
                </Badge>
              </Link>
            ))}
          </motion.div>
        )}

        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="mt-12 pt-10 border-t"
          id="comments"
          data-testid="section-comments"
        >
          <h2 className="font-serif text-xl font-bold mb-8 flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
              <MessageCircle className="h-4 w-4 text-primary" />
            </div>
            Comments ({comments?.length || 0})
          </h2>

          {user ? (
            <form onSubmit={handleComment} className="mb-10">
              <div className="flex items-start gap-3">
                <Avatar className="h-9 w-9 mt-1 ring-2 ring-background">
                  <AvatarImage src={user.avatarUrl || undefined} />
                  <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
                    {user.displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-3">
                  <Textarea
                    placeholder="Share your thoughts..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="min-h-[90px] resize-none rounded-lg border-muted-foreground/20 focus:border-primary/40"
                    data-testid="input-comment"
                  />
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      size="sm"
                      className="rounded-full px-5"
                      disabled={!commentText.trim() || commentMutation.isPending}
                      data-testid="button-submit-comment"
                    >
                      {commentMutation.isPending ? "Posting..." : "Post Comment"}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="bg-muted/40 rounded-xl p-6 mb-10 text-center border border-dashed">
              <p className="text-sm text-muted-foreground mb-3">Sign in to join the discussion</p>
              <Link href="/login">
                <Button size="sm" className="rounded-full" data-testid="button-login-to-comment">Log in</Button>
              </Link>
            </div>
          )}

          <div className="space-y-1">
            {comments?.map((comment, i) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex gap-3 py-5 border-b last:border-b-0"
                data-testid={`comment-${comment.id}`}
              >
                <Link href={`/author/${comment.author.username}`}>
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={comment.author.avatarUrl || undefined} />
                    <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
                      {comment.author.displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Link href={`/author/${comment.author.username}`}>
                      <span className="text-sm font-semibold" data-testid="text-comment-author">
                        {comment.author.displayName}
                      </span>
                    </Link>
                    <span className="text-xs text-muted-foreground" data-testid="text-comment-date">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-foreground/85" data-testid="text-comment-content">
                    {comment.content}
                  </p>
                </div>
              </motion.div>
            ))}
            {(!comments || comments.length === 0) && (
              <div className="text-center py-10">
                <p className="text-sm text-muted-foreground">No comments yet. Be the first to share your thoughts!</p>
              </div>
            )}
          </div>
        </motion.section>
      </motion.div>
    </article>
  );
}
