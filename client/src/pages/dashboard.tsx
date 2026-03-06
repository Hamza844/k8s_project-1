import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
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
import { PenSquare, Edit, Trash2, Eye, FileText, Send, BarChart3, TrendingUp } from "lucide-react";
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
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-5">
          <BarChart3 className="h-7 w-7 text-muted-foreground" />
        </div>
        <h1 className="font-serif text-2xl font-bold mb-2">Sign in to access your dashboard</h1>
        <p className="text-sm text-muted-foreground mb-6">You need an account to manage your posts.</p>
        <Link href="/login">
          <Button className="rounded-full" data-testid="button-login-dashboard">Log in</Button>
        </Link>
      </div>
    );
  }

  const drafts = posts?.filter((p) => p.status === "draft") || [];
  const published = posts?.filter((p) => p.status === "published") || [];
  const totalViews = posts?.reduce((sum, p) => sum + (p.viewCount || 0), 0) || 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto max-w-4xl px-4 sm:px-6 py-10"
    >
      <div className="flex items-center justify-between gap-4 mb-10 flex-wrap">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-serif text-3xl font-bold tracking-tight" data-testid="text-dashboard-title">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your posts and track performance</p>
        </motion.div>
        <Link href="/write">
          <Button className="rounded-full gap-2" data-testid="button-new-post">
            <PenSquare className="h-4 w-4" />
            New Post
          </Button>
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10"
      >
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="h-4 w-4 text-primary" />
            </div>
          </div>
          <p className="text-2xl font-bold" data-testid="text-stat-total">{posts?.length || 0}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Total Posts</p>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Send className="h-4 w-4 text-emerald-600" />
            </div>
          </div>
          <p className="text-2xl font-bold" data-testid="text-stat-published">{published.length}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Published</p>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Edit className="h-4 w-4 text-amber-600" />
            </div>
          </div>
          <p className="text-2xl font-bold" data-testid="text-stat-drafts">{drafts.length}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Drafts</p>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-violet-600" />
            </div>
          </div>
          <p className="text-2xl font-bold">{totalViews}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Total Views</p>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 p-5 rounded-xl border">
              <Skeleton className="h-10 w-10 rounded-lg" />
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
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-10"
            >
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                <FileText className="h-3.5 w-3.5" />
                Drafts
              </h2>
              <div className="space-y-2">
                {drafts.map((post, i) => (
                  <PostRow key={post.id} post={post} onDelete={(slug) => deleteMutation.mutate(slug)} setLocation={setLocation} index={i} />
                ))}
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
              <Send className="h-3.5 w-3.5" />
              Published
            </h2>
            {published.length > 0 ? (
              <div className="space-y-2">
                {published.map((post, i) => (
                  <PostRow key={post.id} post={post} onDelete={(slug) => deleteMutation.mutate(slug)} setLocation={setLocation} index={i} />
                ))}
              </div>
            ) : (
              <div className="text-center py-14 rounded-xl border border-dashed bg-muted/20">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                  <PenSquare className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-sm mb-4">No published posts yet</p>
                <Link href="/write">
                  <Button variant="secondary" size="sm" className="rounded-full" data-testid="button-write-first-post">
                    Write your first post
                  </Button>
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </motion.div>
  );
}

function PostRow({
  post,
  onDelete,
  setLocation,
  index = 0,
}: {
  post: Post;
  onDelete: (slug: string) => void;
  setLocation: (to: string) => void;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center gap-4 p-4 sm:p-5 rounded-xl border bg-card hover:shadow-sm transition-shadow group"
      data-testid={`row-post-${post.id}`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
          <h3 className="font-semibold text-sm truncate" data-testid="text-post-title">{post.title}</h3>
          <Badge
            variant={post.status === "published" ? "default" : "secondary"}
            className="text-[10px] rounded-full"
          >
            {post.status}
          </Badge>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
          <span>{formatDistanceToNow(new Date(post.updatedAt), { addSuffix: true })}</span>
          <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{post.viewCount}</span>
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
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
          <AlertDialogContent className="rounded-xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete post?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your post.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-lg" data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
              <AlertDialogAction className="rounded-lg" onClick={() => onDelete(post.slug)} data-testid="button-confirm-delete">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </motion.div>
  );
}
