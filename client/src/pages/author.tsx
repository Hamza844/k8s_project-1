import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { PostCard } from "@/components/post-card";
import { Calendar } from "lucide-react";
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
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
        <div className="flex items-center gap-4 mb-8">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>
    );
  }

  if (!author) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-20 text-center">
        <h1 className="font-serif text-2xl font-bold mb-2">Author not found</h1>
        <Link href="/">
          <span className="text-primary text-sm">Go home</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
      <div className="flex items-start gap-5 mb-10">
        <Avatar className="h-16 w-16 sm:h-20 sm:w-20">
          <AvatarImage src={author.avatarUrl || undefined} alt={author.displayName} />
          <AvatarFallback className="text-xl bg-primary text-primary-foreground">
            {author.displayName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <h1 className="font-serif text-2xl font-bold" data-testid="text-author-name">{author.displayName}</h1>
          <p className="text-sm text-muted-foreground mb-2" data-testid="text-author-username">@{author.username}</p>
          {author.bio && (
            <p className="text-sm text-muted-foreground leading-relaxed max-w-md" data-testid="text-author-bio">{author.bio}</p>
          )}
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-3">
            <Calendar className="h-3 w-3" />
            <span>Joined {format(new Date(author.createdAt), "MMMM yyyy")}</span>
          </div>
        </div>
      </div>

      <div className="border-t pt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-6" data-testid="text-posts-heading">
          Posts ({posts?.length || 0})
        </h2>
        {postsLoading ? (
          <div className="space-y-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-5">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
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
          <p className="text-sm text-muted-foreground text-center py-10">No posts yet</p>
        )}
      </div>
    </div>
  );
}
