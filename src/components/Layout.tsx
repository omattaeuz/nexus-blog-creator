import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PlusCircle, BookOpen, Home, LogIn, LogOut, User, Settings } from "lucide-react";
import { useAuth } from "@/contexts/useAuth";
import LogoutConfirmation from "./LogoutConfirmation";
import { logError } from "@/lib/logger";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleLogoutClick = () => {
    setShowLogoutConfirmation(true);
  };

  const handleLogoutConfirm = async () => {
    try {
      await logout();
    } catch (error) {
      logError('Erro ao fazer logout', { error: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirmation(false);
  };

  return (
    <div className="min-h-screen bg-gradient-surface flex flex-col">
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
                Nexta
              </span>
            </Link>

            <div className="flex items-center space-x-2">
              <Button
                variant={isActive("/") ? "default" : "ghost"}
                size="sm"
                asChild
                className="transition-all duration-300"
              >
                <Link to="/" className="flex items-center mr-2">
                  <Home className="h-4 w-4" />
                  <span className="hidden sm:inline">Início</span>
                </Link>
              </Button>

              {isAuthenticated && (
                <>
                  <Button
                    variant={isActive("/posts") ? "default" : "ghost"}
                    size="sm"
                    asChild
                    className="transition-all duration-300"
                  >
                    <Link to="/posts" className="flex items-center space-x-2">
                      <BookOpen className="h-4 w-4" />
                      <span className="hidden sm:inline">Blogs</span>
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
                      <span className="hidden sm:inline">Novo Post</span>
                    </Link>
                  </Button>
                </>
              )}

              {/* Auth buttons */}
              {isAuthenticated ? (
                <div className="flex items-center space-x-2 ml-4 pl-4 border-l border-border">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">{user?.email}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogoutClick}
                    className="transition-all duration-300 hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline ml-2">Sair</span>
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2 ml-4 pl-4 border-l border-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="transition-all duration-300"
                  >
                    <Link to="/login" className="flex items-center">
                      <LogIn className="h-4 w-4" />
                      <span className="hidden sm:inline">Entrar</span>
                    </Link>
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    asChild
                    className="bg-gradient-primary hover:bg-primary-hover shadow-glow transition-all duration-300"
                  >
                    <Link to="/register" className="flex items-center">
                      <User className="h-4 w-4" />
                      <span className="hidden sm:inline">Cadastrar</span>
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-surface/50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2025 Nexta — Conte histórias que importam</p>
          </div>
        </div>
      </footer>

      {/* Logout Confirmation Dialog */}
      <LogoutConfirmation
        isOpen={showLogoutConfirmation}
        onClose={handleLogoutCancel}
        onConfirm={handleLogoutConfirm}
        userEmail={user?.email}
      />
    </div>
  );
};

export default Layout;