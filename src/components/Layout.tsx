import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { PlusCircle, BookOpen, Home, LogIn, LogOut, User, Settings, Menu } from "lucide-react";
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <nav className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="p-1.5 sm:p-2 rounded-xl bg-gradient-primary shadow-glow group-hover:shadow-lg transition-all duration-300">
                <BookOpen className="h-4 w-4 sm:h-6 sm:w-6 text-primary-foreground" />
              </div>
              <span className="text-lg sm:text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Nexta
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-2">
              <Button
                variant={isActive("/") ? "default" : "ghost"}
                size="sm"
                asChild
                className="transition-all duration-300"
              >
                <Link to="/" className="flex items-center">
                  <Home className="h-4 w-4" />
                  <span className="ml-2">Início</span>
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
                      <span>Blogs</span>
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
                      <span>Novo Post</span>
                    </Link>
                  </Button>
                </>
              )}

              {/* Auth buttons */}
              {isAuthenticated ? (
                <div className="flex items-center space-x-2 ml-4 pl-4 border-l border-border">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span className="hidden lg:inline">{user?.email}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogoutClick}
                    className="transition-all duration-300 hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="ml-2">Sair</span>
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
                      <span className="ml-2">Entrar</span>
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
                      <span className="ml-2">Cadastrar</span>
                    </Link>
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-2">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Abrir menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] sm:w-[350px]">
                  <div className="flex flex-col space-y-4 mt-8">
                    {/* Logo in mobile menu */}
                    <div className="flex items-center space-x-2 pb-4 border-b border-border">
                      <div className="p-2 rounded-xl bg-gradient-primary shadow-glow">
                        <BookOpen className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                        Nexta
                      </span>
                    </div>

                    {/* Navigation Links */}
                    <div className="flex flex-col space-y-2">
                      <Button
                        variant={isActive("/") ? "default" : "ghost"}
                        size="sm"
                        asChild
                        className="justify-start"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Link to="/" className="flex items-center">
                          <Home className="h-4 w-4" />
                          <span className="ml-2">Início</span>
                        </Link>
                      </Button>

                      {isAuthenticated && (
                        <>
                          <Button
                            variant={isActive("/posts") ? "default" : "ghost"}
                            size="sm"
                            asChild
                            className="justify-start"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <Link to="/posts" className="flex items-center">
                              <BookOpen className="h-4 w-4" />
                              <span className="ml-2">Blogs</span>
                            </Link>
                          </Button>

                          <Button
                            variant="default"
                            size="sm"
                            asChild
                            className="justify-start bg-gradient-primary hover:bg-primary-hover shadow-glow"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <Link to="/posts/new" className="flex items-center">
                              <PlusCircle className="h-4 w-4" />
                              <span className="ml-2">Novo Post</span>
                            </Link>
                          </Button>
                        </>
                      )}
                    </div>

                    {/* Auth Section */}
                    <div className="pt-4 border-t border-border">
                      {isAuthenticated ? (
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground px-3 py-2">
                            <User className="h-4 w-4" />
                            <span className="truncate">{user?.email}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              handleLogoutClick();
                              setIsMobileMenuOpen(false);
                            }}
                            className="w-full justify-start hover:bg-destructive hover:text-destructive-foreground"
                          >
                            <LogOut className="h-4 w-4" />
                            <span className="ml-2">Sair</span>
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="w-full justify-start"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <Link to="/login" className="flex items-center">
                              <LogIn className="h-4 w-4" />
                              <span className="ml-2">Entrar</span>
                            </Link>
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            asChild
                            className="w-full justify-start bg-gradient-primary hover:bg-primary-hover shadow-glow"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <Link to="/register" className="flex items-center">
                              <User className="h-4 w-4" />
                              <span className="ml-2">Cadastrar</span>
                            </Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-surface/50">
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
          <div className="text-center text-muted-foreground">
            <p className="text-sm sm:text-base">&copy; 2025 Nexta — Conte histórias que importam</p>
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