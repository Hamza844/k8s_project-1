import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ArrowLeft, Save, Send, X, Loader2, Image as ImageIcon } from "lucide-react";
import { Link } from "wouter";
import type { Category, Post, Tag } from "@shared/schema";

export default function WritePage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [, editParams] = useRoute("/edit/:slug");
  const editSlug = editParams?.slug;
  const { toast } = useToast();
  const isEditing = !!editSlug;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: existingPost } = useQuery<Post>({
    queryKey: ["/api/posts", editSlug],
    enabled: isEditing,
  });

  const { data: existingTags } = useQuery<Tag[]>({
    queryKey: ["/api/posts", editSlug, "tags"],
    enabled: isEditing,
  });

  useEffect(() => {
    if (existingPost) {
      setTitle(existingPost.title);
      setContent(existingPost.content);
      setExcerpt(existingPost.excerpt || "");
      setCoverImage(existingPost.coverImage || "");
      setCategoryId(existingPost.categoryId || "");
    }
  }, [existingPost]);

  useEffect(() => {
    if (existingTags) {
      setSelectedTags(existingTags.map((t) => t.name));
    }
  }, [existingTags]);

  const saveMutation = useMutation({
    mutationFn: async (status: string) => {
      const data = {
        title,
        content,
        excerpt,
        coverImage,
        categoryId: categoryId || null,
        status,
        tags: selectedTags,
      };
      if (isEditing) {
        const res = await apiRequest("PATCH", `/api/posts/${editSlug}`, data);
        return res.json();
      } else {
        const res = await apiRequest("POST", "/api/posts", data);
        return res.json();
      }
    },
    onSuccess: (data, status) => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({ title: status === "published" ? "Post published!" : "Draft saved" });
      setLocation(status === "published" ? `/post/${data.slug}` : "/dashboard");
    },
    onError: (err: any) => {
      toast({ title: "Failed to save", description: err.message, variant: "destructive" });
    },
  });

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag));
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-20 text-center">
        <h1 className="font-serif text-2xl font-bold mb-2">Sign in to write</h1>
        <p className="text-muted-foreground mb-4">You need an account to create posts.</p>
        <Link href="/login">
          <Button data-testid="button-login-to-write">Log in</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="sticky top-16 z-40 border-b bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" data-testid="button-back-dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => saveMutation.mutate("draft")}
              disabled={!title.trim() || saveMutation.isPending}
              data-testid="button-save-draft"
            >
              {saveMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Draft
            </Button>
            <Button
              size="sm"
              onClick={() => saveMutation.mutate("published")}
              disabled={!title.trim() || !content.trim() || saveMutation.isPending}
              data-testid="button-publish"
            >
              {saveMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Publish
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
        <div className="space-y-6">
          <div>
            <input
              type="text"
              placeholder="Post title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-transparent font-serif text-3xl sm:text-4xl font-bold tracking-tight outline-none placeholder:text-muted-foreground/40"
              data-testid="input-title"
            />
          </div>

          <div>
            <input
              type="text"
              placeholder="Write a brief excerpt..."
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="w-full bg-transparent text-lg text-muted-foreground outline-none placeholder:text-muted-foreground/40"
              data-testid="input-excerpt"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 space-y-1.5">
              <Label className="text-xs text-muted-foreground">Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger data-testid="select-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id} data-testid={`option-category-${cat.id}`}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 space-y-1.5">
              <Label className="text-xs text-muted-foreground">Cover Image URL</Label>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="https://..."
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  data-testid="input-cover-image"
                />
                <Button size="icon" variant="ghost" disabled>
                  <ImageIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Tags</Label>
            <div className="flex items-center gap-2 flex-wrap">
              {selectedTags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1" data-testid={`badge-selected-tag-${tag}`}>
                  #{tag}
                  <button onClick={() => removeTag(tag)} className="ml-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              <Input
                placeholder="Add tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                className="w-32 h-7 text-sm"
                data-testid="input-tag"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Content (HTML supported)</Label>
            <Textarea
              placeholder="Write your post content here... HTML tags are supported for formatting."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[400px] font-mono text-sm leading-relaxed resize-y"
              data-testid="input-content"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
