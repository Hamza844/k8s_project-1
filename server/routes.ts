import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import { storage } from "./storage";
import { pool } from "./db";
import connectPgSimple from "connect-pg-simple";
import bcrypt from "bcryptjs";
import sanitizeHtml from "sanitize-html";
import { z } from "zod";

function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

const sanitizeOptions: sanitizeHtml.IOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "h1", "h2", "h3", "pre", "code", "figure", "figcaption"]),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    img: ["src", "alt", "title", "width", "height"],
    code: ["class"],
    pre: ["class"],
  },
};

const signupSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_-]+$/),
  email: z.string().email().max(255),
  password: z.string().min(6).max(128),
  displayName: z.string().min(1).max(100),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const postSchema = z.object({
  title: z.string().min(1).max(500),
  content: z.string().min(1).max(100000),
  excerpt: z.string().max(500).optional().default(""),
  coverImage: z.string().max(2000).optional().default(""),
  categoryId: z.string().nullable().optional(),
  status: z.enum(["draft", "published"]).optional().default("draft"),
  tags: z.array(z.string().max(50)).max(10).optional(),
});

const commentSchema = z.object({
  content: z.string().min(1).max(5000),
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const PgStore = connectPgSimple(session);
  app.use(
    session({
      store: new PgStore({ pool, createTableIfMissing: true }),
      secret: process.env.SESSION_SECRET || "inkwell-secret-key",
      resave: false,
      saveUninitialized: false,
      cookie: { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: "lax" },
    })
  );

  // Auth routes
  app.post("/api/auth/signup", async (req: Request, res: Response) => {
    try {
      const parsed = signupSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }
      const { username, email, password, displayName } = parsed.data;
      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) return res.status(400).json({ message: "Email already in use" });
      const existingUsername = await storage.getUserByUsername(username);
      if (existingUsername) return res.status(400).json({ message: "Username already taken" });

      const user = await storage.createUser({
        username,
        email,
        password: hashPassword(password),
        displayName,
        bio: "",
        avatarUrl: "",
      });

      (req.session as any).userId = user.id;
      const { password: _, ...safeUser } = user;
      res.json(safeUser);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid credentials" });
      }
      const { email, password } = parsed.data;
      const user = await storage.getUserByEmail(email);
      if (!user || !verifyPassword(password, user.password)) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      (req.session as any).userId = user.id;
      const { password: _, ...safeUser } = user;
      res.json(safeUser);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.session.destroy(() => {
      res.json({ ok: true });
    });
  });

  app.get("/api/auth/me", async (req: Request, res: Response) => {
    const userId = (req.session as any)?.userId;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    const user = await storage.getUser(userId);
    if (!user) return res.status(401).json({ message: "Not authenticated" });
    const { password: _, ...safeUser } = user;
    res.json(safeUser);
  });

  // Posts
  app.get("/api/posts", async (_req: Request, res: Response) => {
    const posts = await storage.getPosts();
    res.json(posts);
  });

  app.get("/api/posts/trending", async (_req: Request, res: Response) => {
    const posts = await storage.getTrendingPosts();
    res.json(posts);
  });

  app.get("/api/posts/search", async (req: Request, res: Response) => {
    const q = (req.query.q as string) || "";
    const tag = (req.query.tag as string) || "";
    const posts = await storage.searchPosts(q, tag);
    res.json(posts);
  });

  app.get("/api/posts/:slug", async (req: Request, res: Response) => {
    const post = await storage.getPostBySlug(req.params.slug);
    if (!post) return res.status(404).json({ message: "Post not found" });
    await storage.incrementViewCount(req.params.slug);
    res.json(post);
  });

  app.get("/api/posts/:slug/comments", async (req: Request, res: Response) => {
    const post = await storage.getPostBySlug(req.params.slug);
    if (!post) return res.status(404).json({ message: "Post not found" });
    const postComments = await storage.getComments(post.id);
    res.json(postComments);
  });

  app.get("/api/posts/:slug/tags", async (req: Request, res: Response) => {
    const post = await storage.getPostBySlug(req.params.slug);
    if (!post) return res.status(404).json({ message: "Post not found" });
    const postTags = await storage.getPostTags(post.id);
    res.json(postTags);
  });

  app.get("/api/posts/:slug/like-status", async (req: Request, res: Response) => {
    const userId = (req.session as any)?.userId;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    const post = await storage.getPostBySlug(req.params.slug);
    if (!post) return res.status(404).json({ message: "Post not found" });
    const status = await storage.getLikeStatus(post.id, userId);
    res.json(status);
  });

  app.post("/api/posts/:slug/like", async (req: Request, res: Response) => {
    const userId = (req.session as any)?.userId;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    const post = await storage.getPostBySlug(req.params.slug);
    if (!post) return res.status(404).json({ message: "Post not found" });
    const result = await storage.toggleLike(post.id, userId);
    res.json(result);
  });

  app.post("/api/posts/:slug/comments", async (req: Request, res: Response) => {
    const userId = (req.session as any)?.userId;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    const parsed = commentSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Comment content is required" });
    const post = await storage.getPostBySlug(req.params.slug);
    if (!post) return res.status(404).json({ message: "Post not found" });
    const comment = await storage.createComment({
      content: sanitizeHtml(parsed.data.content, { allowedTags: [], allowedAttributes: {} }),
      postId: post.id,
      authorId: userId,
    });
    res.json(comment);
  });

  app.post("/api/posts", async (req: Request, res: Response) => {
    const userId = (req.session as any)?.userId;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    try {
      const parsed = postSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: parsed.error.errors[0].message });
      const data = parsed.data;
      const post = await storage.createPost({
        ...data,
        content: sanitizeHtml(data.content, sanitizeOptions),
        authorId: userId,
      });
      res.json(post);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.patch("/api/posts/:slug", async (req: Request, res: Response) => {
    const userId = (req.session as any)?.userId;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    try {
      const parsed = postSchema.partial().safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: parsed.error.errors[0].message });
      const data = parsed.data;
      if (data.content) data.content = sanitizeHtml(data.content, sanitizeOptions);
      const post = await storage.updatePost(req.params.slug, userId, data);
      res.json(post);
    } catch (err: any) {
      res.status(404).json({ message: err.message });
    }
  });

  app.delete("/api/posts/:slug", async (req: Request, res: Response) => {
    const userId = (req.session as any)?.userId;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    try {
      await storage.deletePost(req.params.slug, userId);
      res.json({ ok: true });
    } catch (err: any) {
      res.status(404).json({ message: err.message });
    }
  });

  // User's own posts
  app.get("/api/user/posts", async (req: Request, res: Response) => {
    const userId = (req.session as any)?.userId;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    const userPosts = await storage.getUserPosts(userId);
    res.json(userPosts);
  });

  // Categories
  app.get("/api/categories", async (_req: Request, res: Response) => {
    const cats = await storage.getCategories();
    res.json(cats);
  });

  app.get("/api/categories/:slug", async (req: Request, res: Response) => {
    const cat = await storage.getCategoryBySlug(req.params.slug);
    if (!cat) return res.status(404).json({ message: "Category not found" });
    res.json(cat);
  });

  app.get("/api/categories/:slug/posts", async (req: Request, res: Response) => {
    const postsList = await storage.getPostsByCategory(req.params.slug);
    res.json(postsList);
  });

  // Users
  app.get("/api/users/:username", async (req: Request, res: Response) => {
    const user = await storage.getUserByUsername(req.params.username);
    if (!user) return res.status(404).json({ message: "User not found" });
    const { password: _, ...safeUser } = user;
    res.json(safeUser);
  });

  app.get("/api/users/:username/posts", async (req: Request, res: Response) => {
    const postsList = await storage.getPostsByAuthor(req.params.username);
    res.json(postsList);
  });

  return httpServer;
}
