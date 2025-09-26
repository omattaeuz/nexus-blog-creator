import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PlusCircle, BookOpen, Home } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-surface">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-lg border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="p-2 rounded-xl bg-gradient-primary shadow-glow group-hover:shadow-lg transition-all duration-300">
                <BookOpen className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Onboarding Blog
              </span>
            </Link>

            {/* Navigation */}
            <div className="flex items-center space-x-2">
              <Button
                variant={isActive("/") ? "default" : "ghost"}
                size="sm"
                asChild
                className="transition-all duration-300"
              >
                <Link to="/" className="flex items-center space-x-2">
                  <Home className="h-4 w-4" />
                  <span className="hidden sm:inline">Home</span>
                </Link>
              </Button>

              <Button
                variant={isActive("/posts") ? "default" : "ghost"}
                size="sm"
                asChild
                className="transition-all duration-300"
              >
                <Link to="/posts" className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4" />
                  <span className="hidden sm:inline">Posts</span>
                </Link>
              </Button>

              <Button
                variant="default"
                size="sm"
                asChild
                className="bg-gradient-primary hover:bg-primary-hover shadow-glow transition-all duration-300"
              >
                <Link to="/posts/new" className="flex items-center space-x-2">
                  <PlusCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">New Post</span>
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-surface/50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2024 Onboarding Blog. Built with ❤️ using Lovable.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;