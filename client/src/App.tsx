import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme";
import { AuthProvider } from "@/lib/auth";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home";
import PostPage from "@/pages/post";
import { LoginPage, SignupPage } from "@/pages/auth";
import WritePage from "@/pages/write";
import DashboardPage from "@/pages/dashboard";
import AuthorPage from "@/pages/author";
import { CategoriesPage, CategoryPage } from "@/pages/categories";
import SearchPage from "@/pages/search";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/post/:slug" component={PostPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/signup" component={SignupPage} />
      <Route path="/write" component={WritePage} />
      <Route path="/edit/:slug" component={WritePage} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/author/:username" component={AuthorPage} />
      <Route path="/categories" component={CategoriesPage} />
      <Route path="/categories/:slug" component={CategoryPage} />
      <Route path="/search" component={SearchPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-1">
                <Router />
              </main>
              <Footer />
            </div>
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
