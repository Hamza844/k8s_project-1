import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { PostCard } from "@/components/post-card";
import { Calendar, FileText } from "lucide-react";
import { format } from "date-fns";
import type { User, PostWithAuthor } from "@shared/schema";

export default function AuthorPage() {
  const [, params] = useRoute("/author/:username");
  const username = params?.username;

  const { data: author, isLoading: authorLoading } = useQuery<User>({
    queryKey: ["/api/users", username],
    enabled: !!username,
  });

  const { data: posts, isLoading: postsLoading } = useQuery<PostWithAuthor[]>({
    queryKey: ["/api/users", username, "posts"],
    enabled: !!username,
  });

  if (authorLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
        <div className="flex flex-col items-center text-center gap-4 mb-10">
          <Skeleton className="h-24 w-24 rounded-full" />
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    );
  }

  if (!author) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-24 text-center">
        <h1 className="font-serif text-2xl font-bold mb-2">Author not found</h1>
        <Link href="/">
          <span className="text-primary text-sm font-medium hover:underline">Go home</span>
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto max-w-3xl px-4 sm:px-6 py-16"
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mb-12"
      >
        <div className="absolute inset-0 -top-8 h-32 bg-gradient-to-b from-primary/5 to-transparent rounded-2xl -mx-4" />
        <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          <Avatar className="h-24 w-24 ring-4 ring-background shadow-lg">
            <AvatarImage src={author.avatarUrl || undefined} alt={author.displayName} />
            <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
              {author.displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 pt-1">
            <h1 className="font-serif text-3xl font-bold tracking-tight" data-testid="text-author-name">{author.displayName}</h1>
            <p className="text-sm text-muted-foreground mt-1" data-testid="text-author-username">@{author.username}</p>
            {author.bio && (
              <p className="text-sm text-muted-foreground leading-relaxed mt-3 max-w-md" data-testid="text-author-bio">{author.bio}</p>
            )}
            <div className="flex items-center gap-4 mt-4 justify-center sm:justify-start">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>Joined {format(new Date(author.createdAt), "MMMM yyyy")}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <FileText className="h-3.5 w-3.5" />
                <span>{posts?.length || 0} posts</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="border-t pt-10">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-6 flex items-center gap-2" data-testid="text-posts-heading">
          <FileText className="h-3.5 w-3.5" />
          Posts
        </h2>
        {postsLoading ? (
          <div className="space-y-0">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-5 py-6 border-b">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
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
            <p className="text-sm text-muted-foreground">No posts yet</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
