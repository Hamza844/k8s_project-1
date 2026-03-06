import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <p className="text-8xl font-bold text-primary/15 font-serif mb-2 select-none">404</p>
        <h1 className="font-serif text-2xl font-bold mb-2" data-testid="text-not-found">Page not found</h1>
        <p className="text-muted-foreground mb-8 text-sm max-w-xs mx-auto">The page you're looking for doesn't exist or has been moved.</p>
        <Link href="/">
          <Button className="rounded-full gap-2" data-testid="button-go-home">
            <ArrowLeft className="h-4 w-4" />
            Go Home
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
