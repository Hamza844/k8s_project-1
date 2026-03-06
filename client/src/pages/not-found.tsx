import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-6xl font-bold text-muted-foreground/20 font-serif mb-4">404</p>
        <h1 className="font-serif text-2xl font-bold mb-2" data-testid="text-not-found">Page not found</h1>
        <p className="text-muted-foreground mb-6 text-sm">The page you're looking for doesn't exist or has been moved.</p>
        <Link href="/">
          <Button data-testid="button-go-home">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
