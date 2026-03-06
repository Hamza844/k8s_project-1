import { BookOpen } from "lucide-react";
import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="border-t bg-card/50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link href="/">
              <span className="flex items-center gap-2 font-serif text-xl font-bold tracking-tight mb-3">
                <BookOpen className="h-6 w-6 text-primary" />
                Inkwell
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              A modern blog platform for writers and readers. Share your stories, ideas, and knowledge with the world.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-3">Explore</h4>
            <nav className="flex flex-col gap-2">
              <Link href="/" className="text-sm text-muted-foreground transition-colors" data-testid="footer-link-home">Home</Link>
              <Link href="/categories" className="text-sm text-muted-foreground transition-colors" data-testid="footer-link-categories">Categories</Link>
            </nav>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-3">Get Started</h4>
            <nav className="flex flex-col gap-2">
              <Link href="/signup" className="text-sm text-muted-foreground transition-colors" data-testid="footer-link-signup">Create Account</Link>
              <Link href="/login" className="text-sm text-muted-foreground transition-colors" data-testid="footer-link-login">Sign In</Link>
            </nav>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t">
          <p className="text-xs text-muted-foreground text-center">
            Built with care. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
