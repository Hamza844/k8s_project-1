import { eq, desc, sql, and, ilike, or, inArray } from "drizzle-orm";
import { db } from "./db";
import {
  users, posts, categories, tags, postTags, comments, likes,
  type User, type InsertUser, type Post, type InsertPost,
  type Category, type InsertCategory, type Tag, type InsertTag,
  type Comment, type InsertComment, type PostWithAuthor, type CommentWithAuthor,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getPosts(limit?: number): Promise<PostWithAuthor[]>;
  getTrendingPosts(limit?: number): Promise<PostWithAuthor[]>;
  getPostBySlug(slug: string): Promise<PostWithAuthor | undefined>;
  getPostsByAuthor(username: string): Promise<PostWithAuthor[]>;
  getPostsByCategory(categorySlug: string): Promise<PostWithAuthor[]>;
  getUserPosts(userId: string): Promise<Post[]>;
  searchPosts(query: string, tag?: string): Promise<PostWithAuthor[]>;
  createPost(post: InsertPost & { tags?: string[] }): Promise<Post>;
  updatePost(slug: string, userId: string, data: Partial<InsertPost> & { tags?: string[] }): Promise<Post>;
  deletePost(slug: string, userId: string): Promise<void>;
  incrementViewCount(slug: string): Promise<void>;

  getCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(cat: InsertCategory): Promise<Category>;

  getPostTags(postId: string): Promise<Tag[]>;
  getOrCreateTag(name: string): Promise<Tag>;

  getComments(postId: string): Promise<CommentWithAuthor[]>;
  createComment(comment: InsertComment): Promise<Comment>;

  toggleLike(postId: string, userId: string): Promise<{ liked: boolean }>;
  getLikeStatus(postId: string, userId: string): Promise<{ liked: boolean; count: number }>;
  getLikeCount(postId: string): Promise<number>;
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return user;
  }

  async createUser(data: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(data).returning();
    return user;
  }

  private async enrichPosts(rawPosts: Post[]): Promise<PostWithAuthor[]> {
    if (rawPosts.length === 0) return [];
    const authorIds = [...new Set(rawPosts.map((p) => p.authorId))];
    const categoryIds = [...new Set(rawPosts.map((p) => p.categoryId).filter(Boolean))] as string[];

    const allAuthors = authorIds.length > 0
      ? await db.select().from(users).where(inArray(users.id, authorIds))
      : [];
    const allCategories = categoryIds.length > 0
      ? await db.select().from(categories).where(inArray(categories.id, categoryIds))
      : [];

    const postIds = rawPosts.map((p) => p.id);
    const likeCounts = postIds.length > 0
      ? await db.select({ postId: likes.postId, count: sql<number>`count(*)::int` })
          .from(likes).where(inArray(likes.postId, postIds)).groupBy(likes.postId)
      : [];
    const commentCounts = postIds.length > 0
      ? await db.select({ postId: comments.postId, count: sql<number>`count(*)::int` })
          .from(comments).where(inArray(comments.postId, postIds)).groupBy(comments.postId)
      : [];

    const authorMap = new Map(allAuthors.map((a) => [a.id, a]));
    const catMap = new Map(allCategories.map((c) => [c.id, c]));
    const likeMap = new Map(likeCounts.map((l) => [l.postId, l.count]));
    const commentMap = new Map(commentCounts.map((c) => [c.postId, c.count]));

    return rawPosts.map((post) => {
      const author = authorMap.get(post.authorId)!;
      const { password: _, ...safeAuthor } = author;
      return {
        ...post,
        author: safeAuthor as any,
        category: post.categoryId ? catMap.get(post.categoryId) || null : null,
        likeCount: likeMap.get(post.id) || 0,
        commentCount: commentMap.get(post.id) || 0,
      };
    });
  }

  async getPosts(limit = 20): Promise<PostWithAuthor[]> {
    const rawPosts = await db.select().from(posts)
      .where(eq(posts.status, "published"))
      .orderBy(desc(posts.publishedAt))
      .limit(limit);
    return this.enrichPosts(rawPosts);
  }

  async getTrendingPosts(limit = 5): Promise<PostWithAuthor[]> {
    const rawPosts = await db.select().from(posts)
      .where(eq(posts.status, "published"))
      .orderBy(desc(posts.viewCount))
      .limit(limit);
    return this.enrichPosts(rawPosts);
  }

  async getPostBySlug(slug: string): Promise<PostWithAuthor | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.slug, slug)).limit(1);
    if (!post) return undefined;
    const enriched = await this.enrichPosts([post]);
    return enriched[0];
  }

  async getPostsByAuthor(username: string): Promise<PostWithAuthor[]> {
    const author = await this.getUserByUsername(username);
    if (!author) return [];
    const rawPosts = await db.select().from(posts)
      .where(and(eq(posts.authorId, author.id), eq(posts.status, "published")))
      .orderBy(desc(posts.publishedAt));
    return this.enrichPosts(rawPosts);
  }

  async getPostsByCategory(categorySlug: string): Promise<PostWithAuthor[]> {
    const cat = await this.getCategoryBySlug(categorySlug);
    if (!cat) return [];
    const rawPosts = await db.select().from(posts)
      .where(and(eq(posts.categoryId, cat.id), eq(posts.status, "published")))
      .orderBy(desc(posts.publishedAt));
    return this.enrichPosts(rawPosts);
  }

  async getUserPosts(userId: string): Promise<Post[]> {
    return db.select().from(posts)
      .where(eq(posts.authorId, userId))
      .orderBy(desc(posts.updatedAt));
  }

  async searchPosts(query: string, tag?: string): Promise<PostWithAuthor[]> {
    if (tag) {
      const [foundTag] = await db.select().from(tags).where(eq(tags.slug, tag)).limit(1);
      if (!foundTag) return [];
      const taggedPostIds = await db.select({ postId: postTags.postId })
        .from(postTags).where(eq(postTags.tagId, foundTag.id));
      if (taggedPostIds.length === 0) return [];
      const rawPosts = await db.select().from(posts)
        .where(and(
          eq(posts.status, "published"),
          inArray(posts.id, taggedPostIds.map((t) => t.postId))
        ))
        .orderBy(desc(posts.publishedAt));
      return this.enrichPosts(rawPosts);
    }

    if (!query) return [];
    const rawPosts = await db.select().from(posts)
      .where(and(
        eq(posts.status, "published"),
        or(
          ilike(posts.title, `%${query}%`),
          ilike(posts.excerpt, `%${query}%`),
          ilike(posts.content, `%${query}%`)
        )
      ))
      .orderBy(desc(posts.publishedAt));
    return this.enrichPosts(rawPosts);
  }

  async createPost(data: InsertPost & { tags?: string[] }): Promise<Post> {
    const { tags: tagNames, ...postData } = data;
    let baseSlug = slugify(postData.title);
    let slug = baseSlug;
    let counter = 1;
    while (true) {
      const existing = await db.select().from(posts).where(eq(posts.slug, slug)).limit(1);
      if (existing.length === 0) break;
      slug = `${baseSlug}-${counter++}`;
    }

    const now = new Date();
    const [post] = await db.insert(posts).values({
      ...postData,
      slug,
      updatedAt: now,
      publishedAt: postData.status === "published" ? now : null,
    }).returning();

    if (tagNames && tagNames.length > 0) {
      for (const name of tagNames) {
        const tag = await this.getOrCreateTag(name);
        await db.insert(postTags).values({ postId: post.id, tagId: tag.id }).onConflictDoNothing();
      }
    }

    return post;
  }

  async updatePost(slug: string, userId: string, data: Partial<InsertPost> & { tags?: string[] }): Promise<Post> {
    const [existing] = await db.select().from(posts).where(and(eq(posts.slug, slug), eq(posts.authorId, userId))).limit(1);
    if (!existing) throw new Error("Post not found");

    const { tags: tagNames, ...updateData } = data;
    const now = new Date();
    const updateValues: any = { ...updateData, updatedAt: now };

    if (updateData.status === "published" && existing.status !== "published") {
      updateValues.publishedAt = now;
    }

    if (updateData.title && updateData.title !== existing.title) {
      let baseSlug = slugify(updateData.title);
      let newSlug = baseSlug;
      let counter = 1;
      while (true) {
        const found = await db.select().from(posts).where(eq(posts.slug, newSlug)).limit(1);
        if (found.length === 0 || found[0].id === existing.id) break;
        newSlug = `${baseSlug}-${counter++}`;
      }
      updateValues.slug = newSlug;
    }

    const [updated] = await db.update(posts).set(updateValues).where(eq(posts.id, existing.id)).returning();

    if (tagNames) {
      await db.delete(postTags).where(eq(postTags.postId, existing.id));
      for (const name of tagNames) {
        const tag = await this.getOrCreateTag(name);
        await db.insert(postTags).values({ postId: existing.id, tagId: tag.id }).onConflictDoNothing();
      }
    }

    return updated;
  }

  async deletePost(slug: string, userId: string): Promise<void> {
    const [existing] = await db.select().from(posts).where(and(eq(posts.slug, slug), eq(posts.authorId, userId))).limit(1);
    if (!existing) throw new Error("Post not found");
    await db.delete(postTags).where(eq(postTags.postId, existing.id));
    await db.delete(comments).where(eq(comments.postId, existing.id));
    await db.delete(likes).where(eq(likes.postId, existing.id));
    await db.delete(posts).where(eq(posts.id, existing.id));
  }

  async incrementViewCount(slug: string): Promise<void> {
    await db.update(posts).set({ viewCount: sql`${posts.viewCount} + 1` }).where(eq(posts.slug, slug));
  }

  async getCategories(): Promise<Category[]> {
    return db.select().from(categories).orderBy(categories.name);
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [cat] = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
    return cat;
  }

  async createCategory(data: InsertCategory): Promise<Category> {
    const [cat] = await db.insert(categories).values(data).returning();
    return cat;
  }

  async getPostTags(postId: string): Promise<Tag[]> {
    const pts = await db.select().from(postTags).where(eq(postTags.postId, postId));
    if (pts.length === 0) return [];
    const tagIds = pts.map((pt) => pt.tagId);
    return db.select().from(tags).where(inArray(tags.id, tagIds));
  }

  async getOrCreateTag(name: string): Promise<Tag> {
    const slug = slugify(name);
    const [existing] = await db.select().from(tags).where(eq(tags.slug, slug)).limit(1);
    if (existing) return existing;
    const [tag] = await db.insert(tags).values({ name: name.toLowerCase(), slug }).returning();
    return tag;
  }

  async getComments(postId: string): Promise<CommentWithAuthor[]> {
    const rawComments = await db.select().from(comments)
      .where(eq(comments.postId, postId))
      .orderBy(desc(comments.createdAt));
    if (rawComments.length === 0) return [];
    const authorIds = [...new Set(rawComments.map((c) => c.authorId))];
    const allAuthors = await db.select().from(users).where(inArray(users.id, authorIds));
    const authorMap = new Map(allAuthors.map((a) => [a.id, a]));
    return rawComments.map((c) => {
      const author = authorMap.get(c.authorId)!;
      const { password: _, ...safeAuthor } = author;
      return { ...c, author: safeAuthor as any };
    });
  }

  async createComment(data: InsertComment): Promise<Comment> {
    const [comment] = await db.insert(comments).values(data).returning();
    return comment;
  }

  async toggleLike(postId: string, userId: string): Promise<{ liked: boolean }> {
    const [existing] = await db.select().from(likes)
      .where(and(eq(likes.postId, postId), eq(likes.userId, userId))).limit(1);
    if (existing) {
      await db.delete(likes).where(and(eq(likes.postId, postId), eq(likes.userId, userId)));
      return { liked: false };
    }
    await db.insert(likes).values({ postId, userId });
    return { liked: true };
  }

  async getLikeStatus(postId: string, userId: string): Promise<{ liked: boolean; count: number }> {
    const [existing] = await db.select().from(likes)
      .where(and(eq(likes.postId, postId), eq(likes.userId, userId))).limit(1);
    const count = await this.getLikeCount(postId);
    return { liked: !!existing, count };
  }

  async getLikeCount(postId: string): Promise<number> {
    const [result] = await db.select({ count: sql<number>`count(*)::int` })
      .from(likes).where(eq(likes.postId, postId));
    return result?.count || 0;
  }
}

export const storage = new DatabaseStorage();
