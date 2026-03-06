import { storage } from "./storage";
import { db } from "./db";
import { users, categories, posts, tags, postTags, comments, likes } from "@shared/schema";
import bcrypt from "bcryptjs";

function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export async function seedDatabase() {
  const existingUsers = await db.select().from(users).limit(1);
  if (existingUsers.length > 0) return;

  console.log("Seeding database...");

  const user1 = await storage.createUser({
    username: "sarahchen",
    email: "sarah@example.com",
    password: hashPassword("password123"),
    displayName: "Sarah Chen",
    bio: "Software engineer and tech writer. I write about web development, design systems, and the future of AI.",
    avatarUrl: "",
  });

  const user2 = await storage.createUser({
    username: "marcuswright",
    email: "marcus@example.com",
    password: hashPassword("password123"),
    displayName: "Marcus Wright",
    bio: "Product designer and creative director. Exploring the intersection of technology and human experience.",
    avatarUrl: "",
  });

  const user3 = await storage.createUser({
    username: "elenamorris",
    email: "elena@example.com",
    password: hashPassword("password123"),
    displayName: "Elena Morris",
    bio: "Data scientist turned writer. Passionate about making complex ideas accessible.",
    avatarUrl: "",
  });

  const cat1 = await storage.createCategory({ name: "Technology", slug: "technology", description: "Latest in tech, programming, and software development" });
  const cat2 = await storage.createCategory({ name: "Design", slug: "design", description: "UI/UX design, product design, and creative thinking" });
  const cat3 = await storage.createCategory({ name: "Productivity", slug: "productivity", description: "Tips and strategies for working smarter" });
  const cat4 = await storage.createCategory({ name: "Science", slug: "science", description: "Scientific discoveries and research" });
  const cat5 = await storage.createCategory({ name: "Culture", slug: "culture", description: "Art, music, books, and cultural commentary" });

  const post1 = await storage.createPost({
    title: "The Art of Building Design Systems That Scale",
    content: `<p>Design systems have become the backbone of modern product development. But building one that truly scales across teams, products, and time is an art that requires careful thought and deliberate choices.</p>

<h2>Why Design Systems Matter</h2>
<p>When your product grows from a single app to an ecosystem of tools, consistency becomes your greatest challenge. A well-crafted design system doesn't just provide components—it provides a shared language that unifies your team's thinking.</p>

<blockquote><p>A design system is not a project. It's a product, serving products.</p></blockquote>

<h2>The Foundation: Design Tokens</h2>
<p>Start with tokens, not components. Colors, spacing, typography, shadows—these are the atoms of your system. Get them right, and everything built on top inherits consistency automatically.</p>

<p>The most common mistake teams make is jumping straight to building buttons and cards. Instead, invest time in establishing a robust token architecture. This creates a single source of truth for visual decisions.</p>

<h2>Component Architecture</h2>
<p>Great design system components share these qualities:</p>
<ul>
<li><strong>Composability:</strong> They combine naturally to create complex patterns</li>
<li><strong>Accessibility:</strong> ARIA labels, keyboard navigation, and screen reader support are built in</li>
<li><strong>Flexibility:</strong> Props and variants handle real-world use cases</li>
<li><strong>Documentation:</strong> Every component tells its own story</li>
</ul>

<h2>The Human Side</h2>
<p>The hardest part of a design system isn't the code—it's the adoption. Build relationships with your consumers. Listen to their pain points. Ship incrementally and iterate based on real usage patterns.</p>

<p>The best design systems are living organisms that evolve with the teams that use them. They're never truly "done," and that's what makes them powerful.</p>`,
    excerpt: "Building a design system that works at scale requires more than just components. It requires a thoughtful approach to tokens, architecture, and adoption.",
    coverImage: "",
    authorId: user1.id,
    categoryId: cat2.id,
    status: "published",
    tags: ["design-systems", "ui", "frontend"],
  });

  const post2 = await storage.createPost({
    title: "Understanding Large Language Models: A Practical Guide",
    content: `<p>Large Language Models have transformed how we think about artificial intelligence. But beneath the hype, there's a fascinating and accessible set of ideas worth understanding.</p>

<h2>What Are LLMs, Really?</h2>
<p>At their core, LLMs are sophisticated pattern-matching machines trained on vast amounts of text. They learn statistical relationships between words, phrases, and concepts, enabling them to generate remarkably coherent text.</p>

<p>Think of it like autocomplete on steroids—but that simplification misses something important. The scale of these models creates emergent capabilities that weren't explicitly programmed.</p>

<h2>The Transformer Architecture</h2>
<p>The breakthrough behind modern LLMs is the transformer architecture, introduced in the landmark paper "Attention Is All You Need." The key innovation is the <strong>self-attention mechanism</strong>, which allows the model to weigh the importance of different parts of the input when generating each word.</p>

<h2>Prompt Engineering</h2>
<p>The way you communicate with an LLM dramatically affects the quality of its output. A few principles:</p>
<ul>
<li>Be specific about the format and style you want</li>
<li>Provide context and examples</li>
<li>Break complex tasks into smaller steps</li>
<li>Iterate and refine your prompts</li>
</ul>

<h2>Limitations and Considerations</h2>
<p>LLMs can hallucinate, generating plausible-sounding but incorrect information. They also have knowledge cutoffs, potential biases from training data, and limited reasoning capabilities in certain domains.</p>

<p>Understanding these limitations isn't a weakness—it's what separates thoughtful practitioners from those who treat AI as magic.</p>`,
    excerpt: "A clear, practical introduction to how large language models work, from transformer architecture to prompt engineering.",
    coverImage: "",
    authorId: user3.id,
    categoryId: cat1.id,
    status: "published",
    tags: ["ai", "machine-learning", "llm"],
  });

  const post3 = await storage.createPost({
    title: "The Deep Work Playbook: How I Reclaimed My Focus",
    content: `<p>In a world designed to fragment our attention, the ability to do deep, focused work is becoming both rare and valuable. Here's how I rebuilt my focus muscle.</p>

<h2>The Attention Crisis</h2>
<p>The average knowledge worker checks email 74 times per day and switches tasks every 3 minutes. We're not working—we're performing an elaborate productivity theater.</p>

<h2>My System</h2>
<p>After burning out twice, I developed a system that transformed my work. It's built on four pillars:</p>

<h3>1. Time Blocking</h3>
<p>Every morning starts with 3 hours of uninterrupted deep work. No meetings, no messages, no exceptions. This isn't about discipline—it's about design.</p>

<h3>2. Environment Design</h3>
<p>I have a dedicated workspace with no phone in reach. The environment should make distraction harder, not rely on willpower to resist it.</p>

<h3>3. The Shutdown Ritual</h3>
<p>At 5:30 PM, I perform a shutdown ritual: review tomorrow's tasks, close all browser tabs, and say out loud, "shutdown complete." This boundary between work and rest is sacred.</p>

<h3>4. Recovery</h3>
<p>Deep work isn't sustainable without deep rest. Long walks, reading fiction, cooking—these aren't luxuries, they're requirements for creative work.</p>

<blockquote><p>The goal is not to fill every minute with productive work. The goal is to make the time you do work count.</p></blockquote>

<p>The transformation wasn't instant. It took about 6 weeks before deep work felt natural. But now, I accomplish more in 4 focused hours than I used to in 8 scattered ones.</p>`,
    excerpt: "After burning out twice, I developed a system for deep work that transformed my productivity and my life.",
    coverImage: "",
    authorId: user2.id,
    categoryId: cat3.id,
    status: "published",
    tags: ["productivity", "focus", "deep-work"],
  });

  const post4 = await storage.createPost({
    title: "Why TypeScript Changed How I Think About Code",
    content: `<p>When I first encountered TypeScript, I saw it as unnecessary ceremony. JavaScript was flexible—why constrain it? Five years later, I can't imagine going back. Here's what changed.</p>

<h2>Types as Documentation</h2>
<p>The most immediate benefit of TypeScript isn't catching bugs—it's communication. Types serve as living documentation that stays in sync with your code. When I read a function signature, I understand the contract without reading the implementation.</p>

<h2>Refactoring Confidence</h2>
<p>The real magic happens when you need to change something. Renaming a property? The compiler tells you every location that needs updating. Changing an API response shape? TypeScript highlights every consumer that needs adjustment.</p>

<h2>Better API Design</h2>
<p>TypeScript forced me to think more carefully about my interfaces. Discriminated unions, mapped types, and generics let me express complex relationships in ways that JavaScript simply can't communicate.</p>

<pre><code>type Result&lt;T&gt; = 
  | { success: true; data: T }
  | { success: false; error: string };</code></pre>

<p>This pattern alone has eliminated entire categories of bugs in my code. The compiler ensures you handle both cases.</p>

<h2>The Learning Curve Is Worth It</h2>
<p>Yes, TypeScript has a learning curve. Yes, some types can be complex. But the investment pays compounding returns. Start with basic types, then grow your sophistication over time.</p>`,
    excerpt: "How TypeScript went from feeling like unnecessary overhead to becoming the foundation of how I think about software.",
    coverImage: "",
    authorId: user1.id,
    categoryId: cat1.id,
    status: "published",
    tags: ["typescript", "javascript", "programming"],
  });

  const post5 = await storage.createPost({
    title: "The Hidden Science of Color in Digital Design",
    content: `<p>Color is the most powerful tool in a designer's toolkit, yet it's often the least understood. Let's explore the science behind effective color choices in digital products.</p>

<h2>Perception Is Everything</h2>
<p>The same color looks different depending on what surrounds it. This isn't a bug in human vision—it's a feature. Our visual system evolved to detect relationships and contrasts, not absolute values.</p>

<h2>The 60-30-10 Rule</h2>
<p>This classic interior design principle translates beautifully to digital interfaces:</p>
<ul>
<li><strong>60%</strong> — Primary/neutral color (your background)</li>
<li><strong>30%</strong> — Secondary color (cards, sections, navigation)</li>
<li><strong>10%</strong> — Accent color (CTAs, highlights, active states)</li>
</ul>

<h2>Accessibility First</h2>
<p>Beautiful colors mean nothing if users can't distinguish them. WCAG 2.1 requires a minimum contrast ratio of 4.5:1 for normal text. This isn't a constraint—it's a design parameter that pushes you toward better solutions.</p>

<h2>Dark Mode Isn't Just Inverted Colors</h2>
<p>A common mistake in dark mode design is simply inverting the color palette. Effective dark themes require:</p>
<ul>
<li>Reduced saturation to avoid eye strain</li>
<li>Elevated surfaces for visual hierarchy</li>
<li>Careful shadow handling (shadows are less visible on dark backgrounds)</li>
</ul>

<p>Color in digital design is where art meets science. The best designers understand both the emotional impact and the technical constraints of their palette choices.</p>`,
    excerpt: "Exploring the fascinating science behind color choices in digital design, from perception to accessibility.",
    coverImage: "",
    authorId: user2.id,
    categoryId: cat2.id,
    status: "published",
    tags: ["design", "color-theory", "accessibility"],
  });

  // Add some comments
  await storage.createComment({ content: "This is exactly the approach we took at my company. The token-first strategy saved us so much time.", postId: post1.id, authorId: user3.id });
  await storage.createComment({ content: "Great breakdown of the transformer architecture! Would love to see a follow-up on fine-tuning techniques.", postId: post2.id, authorId: user1.id });
  await storage.createComment({ content: "The shutdown ritual changed everything for me. Such a simple but powerful idea.", postId: post3.id, authorId: user1.id });
  await storage.createComment({ content: "I had the same journey with TypeScript. The refactoring confidence alone is worth it.", postId: post4.id, authorId: user2.id });
  await storage.createComment({ content: "The 60-30-10 rule is such a practical framework. Using it on my current project.", postId: post5.id, authorId: user3.id });

  // Add some likes
  await storage.toggleLike(post1.id, user2.id);
  await storage.toggleLike(post1.id, user3.id);
  await storage.toggleLike(post2.id, user1.id);
  await storage.toggleLike(post2.id, user2.id);
  await storage.toggleLike(post3.id, user1.id);
  await storage.toggleLike(post3.id, user3.id);
  await storage.toggleLike(post4.id, user2.id);
  await storage.toggleLike(post4.id, user3.id);
  await storage.toggleLike(post5.id, user1.id);

  // Bump some view counts
  for (let i = 0; i < 42; i++) await storage.incrementViewCount(post1.slug);
  for (let i = 0; i < 128; i++) await storage.incrementViewCount(post2.slug);
  for (let i = 0; i < 87; i++) await storage.incrementViewCount(post3.slug);
  for (let i = 0; i < 64; i++) await storage.incrementViewCount(post4.slug);
  for (let i = 0; i < 35; i++) await storage.incrementViewCount(post5.slug);

  console.log("Database seeded successfully!");
}
