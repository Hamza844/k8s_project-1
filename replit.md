# Inkwell - Modern Blog Platform

## Overview
A modern, Medium-like blog platform built with Express + React + PostgreSQL. Features authentication, blog management with drafts/publish, categories, tags, comments, likes, and search.

## Architecture
- **Frontend**: React with Vite, TailwindCSS, shadcn/ui components, wouter routing
- **Backend**: Express.js with session-based auth
- **Database**: PostgreSQL with Drizzle ORM
- **State Management**: TanStack React Query

## Key Files
- `shared/schema.ts` - Database schema (users, posts, categories, tags, comments, likes)
- `server/routes.ts` - API routes (auth, posts CRUD, comments, likes, search)
- `server/storage.ts` - Database storage layer with Drizzle
- `server/db.ts` - Database connection
- `server/seed.ts` - Seed data (3 users, 5 categories, 5 posts)
- `client/src/App.tsx` - Main app with routing
- `client/src/lib/auth.tsx` - Auth context provider
- `client/src/lib/theme.tsx` - Dark/light theme provider
- `client/src/components/navbar.tsx` - Navigation with search
- `client/src/components/post-card.tsx` - Post card component
- `client/src/pages/` - All page components (home, post, auth, write, dashboard, author, categories, search)

## Database Schema
- users: id, username, email, password, displayName, bio, avatarUrl
- posts: id, title, slug, content, excerpt, coverImage, authorId, categoryId, status, viewCount
- categories: id, name, slug, description
- tags: id, name, slug
- post_tags: postId, tagId (junction table)
- comments: id, content, postId, authorId
- likes: postId, userId (junction table)

## Auth
Session-based authentication using express-session with PostgreSQL session store. Passwords hashed with bcryptjs. Input validation with Zod. HTML content sanitized with sanitize-html.

## Design
- Font: Inter (sans), Source Serif 4 (serif), JetBrains Mono (mono)
- Theme: Light/dark mode with CSS custom properties
- Responsive: Mobile-first design with breakpoints
- Animations: framer-motion for page transitions, card entries, and micro-interactions
- Logo: Feather icon in a primary-colored rounded box
- UI style: rounded-full buttons/badges, gradient card backgrounds, split-screen auth pages, colored stat cards on dashboard, scroll-aware navbar with backdrop blur

## Test Accounts
- sarah@example.com / password123 (Sarah Chen)
- marcus@example.com / password123 (Marcus Wright)
- elena@example.com / password123 (Elena Morris)
