import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { PenSquare, Edit, Trash2, Eye, Heart, MessageCircle, FileText, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Post } from "@shared/schema";

export default function DashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { data: posts, isLoading } = useQuery<Post[]>({
    queryKey: ["/api/user/posts"],
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: async (slug: string) => {
      await apiRequest("DELETE", `/api/posts/${slug}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/posts"] });
      toast({ title: "Post deleted" });
    },
  });

  if (!user) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-20 text-center">
        <h1 className="font-serif text-2xl font-bold mb-2">Sign in to access your dashboard</h1>
        <Link href="/login">
          <Button className="mt-4" data-testid="button-login-dashboard">Log in</Button>
        </Link>
      </div>
    );
  }

  const drafts = posts?.filter((p) => p.status === "draft") || [];
  const published = posts?.filter((p) => p.status === "published") || [];

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
        <div>
          <h1 className="font-serif text-2xl font-bold" data-testid="text-dashboard-title">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your posts and drafts</p>
        </div>
        <Link href="/write">
          <Button data-testid="button-new-post">
            <PenSquare className="mr-2 h-4 w-4" />
            New Post
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="rounded-md border p-4 text-center">
          <p className="text-2xl font-bold" data-testid="text-stat-total">{posts?.length || 0}</p>
          <p className="text-xs text-muted-foreground mt-1">Total Posts</p>
        </div>
        <div className="rounded-md border p-4 text-center">
          <p className="text-2xl font-bold" data-testid="text-stat-published">{published.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Published</p>
        </div>
        <div className="rounded-md border p-4 text-center">
          <p className="text-2xl font-bold" data-testid="text-stat-drafts">{drafts.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Drafts</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-md border">
              <Skeleton className="h-12 w-12 rounded-md" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {drafts.length > 0 && (
            <div className="mb-8">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Drafts
              </h2>
              <div className="space-y-2">
                {drafts.map((post) => (
                  <PostRow key={post.id} post={post} onDelete={(slug) => deleteMutation.mutate(slug)} setLocation={setLocation} />
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
              <Send className="h-4 w-4" />
              Published
            </h2>
            {published.length > 0 ? (
              <div className="space-y-2">
                {published.map((post) => (
                  <PostRow key={post.id} post={post} onDelete={(slug) => deleteMutation.mutate(slug)} setLocation={setLocation} />
                ))}
              </div>
            ) : (
              <div className="text-center py-10 rounded-md border border-dashed">
                <p className="text-muted-foreground text-sm">No published posts yet</p>
                <Link href="/write">
                  <Button variant="secondary" size="sm" className="mt-3" data-testid="button-write-first-post">
                    Write your first post
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function PostRow({
  post,
  onDelete,
  setLocation,
}: {
  post: Post;
  onDelete: (slug: string) => void;
  setLocation: (to: string) => void;
}) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-md border group" data-testid={`row-post-${post.id}`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <h3 className="font-medium text-sm truncate" data-testid="text-post-title">{post.title}</h3>
          <Badge variant={post.status === "published" ? "default" : "secondary"} className="text-[10px]">
            {post.status}
          </Badge>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
          <span>{formatDistanceToNow(new Date(post.updatedAt), { addSuffix: true })}</span>
          <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{post.viewCount}</span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        {post.status === "published" && (
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setLocation(`/post/${post.slug}`)}
            data-testid="button-view-post"
          >
            <Eye className="h-4 w-4" />
          </Button>
        )}
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setLocation(`/edit/${post.slug}`)}
          data-testid="button-edit-post"
        >
          <Edit className="h-4 w-4" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="icon" variant="ghost" data-testid="button-delete-post">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete post?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your post.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(post.slug)} data-testid="button-confirm-delete">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
