import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Heart, MessageCircle, Eye, ArrowLeft, Calendar, Clock } from "lucide-react";
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
        <Skeleton className="h-4 w-20 mb-6" />
        <Skeleton className="h-10 w-full mb-3" />
        <Skeleton className="h-10 w-3/4 mb-6" />
        <div className="flex items-center gap-3 mb-8">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div>
            <Skeleton className="h-4 w-32 mb-1" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="w-full aspect-[2/1] rounded-md mb-8" />
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-4 w-full mb-3" />
        ))}
      </div>
    );
  }

  if (!post) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-20 text-center">
        <h1 className="font-serif text-2xl font-bold mb-2">Post not found</h1>
        <p className="text-muted-foreground mb-4">The post you're looking for doesn't exist.</p>
        <Link href="/">
          <Button data-testid="button-go-home">Go home</Button>
        </Link>
      </div>
    );
  }

  const readingTime = Math.max(1, Math.ceil(post.content.split(/\s+/).length / 200));

  return (
    <article className="min-h-screen">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-6" data-testid="button-back">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>

        {post.category && (
          <Link href={`/categories/${post.category.slug}`}>
            <Badge variant="secondary" className="mb-4" data-testid="badge-post-category">
              {post.category.name}
            </Badge>
          </Link>
        )}

        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1] mb-5" data-testid="text-post-title">
          {post.title}
        </h1>

        {post.excerpt && (
          <p className="text-lg text-muted-foreground leading-relaxed mb-6" data-testid="text-post-excerpt">
            {post.excerpt}
          </p>
        )}

        <div className="flex items-center justify-between gap-4 mb-8 pb-6 border-b flex-wrap">
          <Link href={`/author/${post.author.username}`}>
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={post.author.avatarUrl || undefined} alt={post.author.displayName} />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {post.author.displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm" data-testid="text-author-name">{post.author.displayName}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {post.publishedAt ? format(new Date(post.publishedAt), "MMM d, yyyy") : format(new Date(post.createdAt), "MMM d, yyyy")}
                  </span>
                  <span>&middot;</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {readingTime} min read
                  </span>
                </div>
              </div>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Button
              variant={likeStatus?.liked ? "default" : "ghost"}
              size="sm"
              onClick={() => user && likeMutation.mutate()}
              disabled={!user || likeMutation.isPending}
              data-testid="button-like"
            >
              <Heart className={`mr-1 h-4 w-4 ${likeStatus?.liked ? "fill-current" : ""}`} />
              {likeStatus?.count ?? post.likeCount ?? 0}
            </Button>
            <span className="flex items-center gap-1 text-sm text-muted-foreground" data-testid="text-view-count">
              <Eye className="h-4 w-4" />
              {post.viewCount}
            </span>
          </div>
        </div>

        {post.coverImage && (
          <div className="rounded-md overflow-hidden mb-8 bg-muted">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full object-cover max-h-[500px]"
              data-testid="img-post-cover"
            />
          </div>
        )}

        <div
          className="prose prose-lg dark:prose-invert max-w-none font-serif
            prose-headings:font-sans prose-headings:tracking-tight
            prose-p:leading-[1.8] prose-p:text-foreground/90
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
            prose-blockquote:border-l-primary prose-blockquote:bg-muted/30 prose-blockquote:py-1 prose-blockquote:rounded-r-md
            prose-code:bg-muted prose-code:rounded-sm prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-code:font-mono
            prose-img:rounded-md"
          dangerouslySetInnerHTML={{ __html: post.content }}
          data-testid="content-post-body"
        />

        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t">
            {tags.map((tag) => (
              <Link key={tag.id} href={`/search?tag=${tag.slug}`}>
                <Badge variant="secondary" className="text-xs" data-testid={`badge-tag-${tag.id}`}>
                  #{tag.name}
                </Badge>
              </Link>
            ))}
          </div>
        )}

        <section className="mt-10 pt-8 border-t" id="comments" data-testid="section-comments">
          <h2 className="font-serif text-xl font-bold mb-6 flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Comments ({comments?.length || 0})
          </h2>

          {user ? (
            <form onSubmit={handleComment} className="mb-8 space-y-3">
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8 mt-1">
                  <AvatarImage src={user.avatarUrl || undefined} />
                  <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                    {user.displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <Textarea
                    placeholder="Write a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="min-h-[80px] resize-none"
                    data-testid="input-comment"
                  />
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      size="sm"
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
            <div className="bg-muted/50 rounded-md p-4 mb-8 text-center">
              <p className="text-sm text-muted-foreground mb-2">Sign in to join the discussion</p>
              <Link href="/login">
                <Button size="sm" data-testid="button-login-to-comment">Log in</Button>
              </Link>
            </div>
          )}

          <div className="space-y-6">
            {comments?.map((comment) => (
              <div key={comment.id} className="flex gap-3" data-testid={`comment-${comment.id}`}>
                <Link href={`/author/${comment.author.username}`}>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.author.avatarUrl || undefined} />
                    <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                      {comment.author.displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Link href={`/author/${comment.author.username}`}>
                      <span className="text-sm font-medium" data-testid="text-comment-author">
                        {comment.author.displayName}
                      </span>
                    </Link>
                    <span className="text-xs text-muted-foreground" data-testid="text-comment-date">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-foreground/90" data-testid="text-comment-content">
                    {comment.content}
                  </p>
                </div>
              </div>
            ))}
            {(!comments || comments.length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No comments yet. Be the first to share your thoughts!
              </p>
            )}
          </div>
        </section>
      </div>
    </article>
  );
}
