import { Feather, Github, Twitter } from "lucide-react";
import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="border-t">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-5">
            <Link href="/">
              <span className="flex items-center gap-2.5 font-serif text-xl font-bold tracking-tight mb-4">
                <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
                  <Feather className="h-4.5 w-4.5 text-primary-foreground" />
                </div>
                Inkwell
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed mb-5">
              A place for curious minds. Read, write, and connect with a growing community of thinkers and creators.
            </p>
          </div>
          <div className="md:col-span-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Platform</h4>
            <nav className="flex flex-col gap-2.5">
              <Link href="/" className="text-sm text-foreground/70 transition-colors" data-testid="footer-link-home">Home</Link>
              <Link href="/categories" className="text-sm text-foreground/70 transition-colors" data-testid="footer-link-categories">Explore</Link>
              <Link href="/write" className="text-sm text-foreground/70 transition-colors" data-testid="footer-link-write">Write</Link>
            </nav>
          </div>
          <div className="md:col-span-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Account</h4>
            <nav className="flex flex-col gap-2.5">
              <Link href="/signup" className="text-sm text-foreground/70 transition-colors" data-testid="footer-link-signup">Create Account</Link>
              <Link href="/login" className="text-sm text-foreground/70 transition-colors" data-testid="footer-link-login">Sign In</Link>
              <Link href="/dashboard" className="text-sm text-foreground/70 transition-colors" data-testid="footer-link-dashboard">Dashboard</Link>
            </nav>
          </div>
          <div className="md:col-span-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Stay connected</h4>
            <p className="text-sm text-foreground/70 leading-relaxed mb-4">
              Join thousands of writers sharing their best ideas every day.
            </p>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t flex items-center justify-between flex-wrap gap-4">
          <p className="text-xs text-muted-foreground">
            Inkwell &middot; Built for writers, by writers.
          </p>
          <p className="text-xs text-muted-foreground">
            All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
