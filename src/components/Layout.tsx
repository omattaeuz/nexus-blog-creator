import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { PlusCircle, BookOpen, Home, LogIn, LogOut, User, Menu, BarChart3 } from "lucide-react";
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
      setShowLogoutConfirmation(false);
    } catch (error) {
      logError('Erro ao fazer logout', { error: error instanceof Error ? error.message : 'Unknown error' });
      setShowLogoutConfirmation(false);
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirmation(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
      <header className="fixed top-4 left-0 right-0 z-50">
        <div className="container mx-auto px-4">
          <div className="py-4">
          <nav className="flex items-center justify-between">
            <Link to="/" className="inline-flex items-center space-x-2 group">
              <div className="p-1.5 sm:p-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-12">
                <BookOpen className="h-4 w-4 sm:h-6 sm:w-6 text-white group-hover:animate-bounce" />
              </div>
              <span className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent group-hover:from-cyan-400 group-hover:to-pink-400 transition-all duration-300">
                Nexta
              </span>
            </Link>

            <div className="hidden md:flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className={`transition-all duration-300 rounded-full ${
                  isActive("/") 
                    ? "bg-white/20 text-white" 
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                <Link to="/" className="flex items-center">
                  {isActive("/") && <div className="w-2 h-2 bg-white rounded-full mr-2" />}
                  <Home className="h-4 w-4" />
                  <span className="ml-2">Início</span>
                </Link>
              </Button>

              {isAuthenticated && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className={`transition-all duration-300 rounded-full ${
                      isActive("/posts") 
                        ? "bg-white/20 text-white" 
                        : "text-white/70 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <Link to="/posts" className="flex items-center space-x-2">
                      {isActive("/posts") && <div className="w-2 h-2 bg-white rounded-full mr-2" />}
                      <BookOpen className="h-4 w-4" />
                      <span>Blogs</span>
                    </Link>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className={`transition-all duration-300 rounded-full ${
                      isActive("/dashboard") 
                        ? "bg-white/20 text-white" 
                        : "text-white/70 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <Link to="/dashboard" className="flex items-center space-x-2">
                      {isActive("/dashboard") && <div className="w-2 h-2 bg-white rounded-full mr-2" />}
                      <BarChart3 className="h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </Button>

                  <Button
                    variant="default"
                    size="sm"
                    asChild
                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-full px-6"
                  >
                    <Link to="/posts/new" className="flex items-center space-x-2">
                      <PlusCircle className="h-4 w-4" />
                      <span>Novo Post</span>
                    </Link>
                  </Button>
                </>
              )}

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
                    className="text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300"
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

            <div className="md:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="p-2 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 transition-all duration-300 hover:scale-105 backdrop-blur-sm"
                  >
                    <Menu className="h-5 w-5 text-white" />
                    <span className="sr-only">Abrir menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] sm:w-[350px] bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 border-l border-white/10">
                  <div className="flex flex-col space-y-4 mt-8">
                    <div className="flex items-center space-x-2 pb-4 border-b border-white/10">
                      <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg">
                        <BookOpen className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Nexta
                      </span>
                    </div>

                    <div className="flex flex-col space-y-2">
                      <Button
                        variant={isActive("/") ? "default" : "ghost"}
                        size="sm"
                        asChild
                        className="justify-start text-white hover:bg-white/10 hover:text-white transition-all duration-300"
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
                            className="justify-start text-white hover:bg-white/10 hover:text-white transition-all duration-300"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <Link to="/posts" className="flex items-center">
                              <BookOpen className="h-4 w-4" />
                              <span className="ml-2">Blogs</span>
                            </Link>
                          </Button>

                          <Button
                            variant={isActive("/dashboard") ? "default" : "ghost"}
                            size="sm"
                            asChild
                            className="justify-start text-white hover:bg-white/10 hover:text-white transition-all duration-300"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <Link to="/dashboard" className="flex items-center">
                              <BarChart3 className="h-4 w-4" />
                              <span className="ml-2">Dashboard</span>
                            </Link>
                          </Button>

                          <Button
                            variant="default"
                            size="sm"
                            asChild
                            className="justify-start bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
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

                    <div className="pt-4 border-t border-white/10">
                      {isAuthenticated ? (
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2 text-sm text-gray-300 px-3 py-2">
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
                            className="w-full justify-start text-white hover:bg-red-500/20 hover:text-red-300 transition-all duration-300"
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
                            className="w-full justify-start text-white hover:bg-white/10 hover:text-white transition-all duration-300"
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
                            className="w-full justify-start bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
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
        </div>
      </header>

      <main className="flex-1 w-full pt-20">
        {children}
      </main>

      <footer className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 border-t border-white/10">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="block md:hidden">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center space-x-2 group cursor-pointer mb-4">
                <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                  <BookOpen className="h-6 w-6 text-white group-hover:animate-bounce" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent group-hover:from-cyan-400 group-hover:to-pink-400 transition-all duration-300">
                  Nexta
                </span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed max-w-sm mx-auto">
                A plataforma mais avançada para criadores de conteúdo tech. 
                Performance extrema, design moderno e ferramentas de IA integradas.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="space-y-3">
                <h3 className="text-white font-semibold text-base text-center md:text-left">Produto</h3>
                <ul className="space-y-2 text-sm text-center md:text-left">
                  <li><a href="/posts" className="text-gray-300 hover:text-white transition-colors hover:translate-x-1 inline-block py-1 px-1 -mx-1 rounded">Blogs</a></li>
                  <li><a href="/dashboard" className="text-gray-300 hover:text-white transition-colors hover:translate-x-1 inline-block py-1 px-1 -mx-1 rounded">Dashboard</a></li>
                  <li><a href="/posts/new" className="text-gray-300 hover:text-white transition-colors hover:translate-x-1 inline-block py-1 px-1 -mx-1 rounded">Criar Post</a></li>
                  <li><a href="/posts/public" className="text-gray-300 hover:text-white transition-colors hover:translate-x-1 inline-block py-1 px-1 -mx-1 rounded">Posts Públicos</a></li>
                </ul>
              </div>

              {/* Empresa */}
              <div className="space-y-3">
                <h3 className="text-white font-semibold text-base text-center md:text-left">Empresa</h3>
                <ul className="space-y-2 text-sm text-center md:text-left">
                  <li><a href="#" className="text-gray-300 hover:text-white transition-colors hover:translate-x-1 inline-block py-1 px-1 -mx-1 rounded">Sobre</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white transition-colors hover:translate-x-1 inline-block py-1 px-1 -mx-1 rounded">Blog</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white transition-colors hover:translate-x-1 inline-block py-1 px-1 -mx-1 rounded">Carreiras</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white transition-colors hover:translate-x-1 inline-block py-1 px-1 -mx-1 rounded">Contato</a></li>
                </ul>
              </div>

              {/* Suporte */}
              <div className="space-y-3">
                <h3 className="text-white font-semibold text-base text-center md:text-left">Suporte</h3>
                <ul className="space-y-2 text-sm text-center md:text-left">
                  <li><a href="#" className="text-gray-300 hover:text-white transition-colors hover:translate-x-1 inline-block py-1 px-1 -mx-1 rounded">Central de Ajuda</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white transition-colors hover:translate-x-1 inline-block py-1 px-1 -mx-1 rounded">Documentação</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white transition-colors hover:translate-x-1 inline-block py-1 px-1 -mx-1 rounded">API</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white transition-colors hover:translate-x-1 inline-block py-1 px-1 -mx-1 rounded">Status</a></li>
                </ul>
              </div>

              {/* Comunidade - Added for mobile balance */}
              <div className="space-y-3">
                <h3 className="text-white font-semibold text-base text-center md:text-left">Comunidade</h3>
                <ul className="space-y-2 text-sm text-center md:text-left">
                  <li><a href="#" className="text-gray-300 hover:text-white transition-colors hover:translate-x-1 inline-block py-1 px-1 -mx-1 rounded">Discord</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white transition-colors hover:translate-x-1 inline-block py-1 px-1 -mx-1 rounded">Twitter</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white transition-colors hover:translate-x-1 inline-block py-1 px-1 -mx-1 rounded">GitHub</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white transition-colors hover:translate-x-1 inline-block py-1 px-1 -mx-1 rounded">Newsletter</a></li>
                </ul>
              </div>
            </div>

            <div className="border-t border-white/10 pt-6">
              <div className="text-center space-y-4">
                <p className="text-gray-300 text-sm">
                  &copy; 2025 Nexta. Todos os direitos reservados.
                </p>
                <div className="flex flex-wrap justify-center gap-4 text-sm">
                  <a href="#" className="text-gray-300 hover:text-white transition-colors hover:translate-x-1 inline-block py-1 px-2 -mx-2 rounded">Privacidade</a>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors hover:translate-x-1 inline-block py-1 px-2 -mx-2 rounded">Termos</a>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors hover:translate-x-1 inline-block py-1 px-2 -mx-2 rounded">Cookies</a>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop/Tablet Layout (768px+) - Unchanged */}
          <div className="hidden md:block">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              {/* Brand */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 group cursor-pointer">
                  <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                    <BookOpen className="h-6 w-6 text-white group-hover:animate-bounce" />
                  </div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent group-hover:from-cyan-400 group-hover:to-pink-400 transition-all duration-300">
                    Nexta
                  </span>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">
                  A plataforma mais avançada para criadores de conteúdo tech. 
                  Performance extrema, design moderno e ferramentas de IA integradas.
                </p>
              </div>

              {/* Links */}
              <div className="space-y-4">
                <h3 className="text-white font-semibold">Produto</h3>
                <ul className="space-y-2 text-sm text-center md:text-left">
                  <li><a href="/posts" className="text-gray-300 hover:text-white transition-colors hover:translate-x-1 inline-block">Blogs</a></li>
                  <li><a href="/dashboard" className="text-gray-300 hover:text-white transition-colors hover:translate-x-1 inline-block">Dashboard</a></li>
                  <li><a href="/posts/new" className="text-gray-300 hover:text-white transition-colors hover:translate-x-1 inline-block">Criar Post</a></li>
                  <li><a href="/posts/public" className="text-gray-300 hover:text-white transition-colors hover:translate-x-1 inline-block">Posts Públicos</a></li>
                </ul>
              </div>

              {/* Company */}
              <div className="space-y-4">
                <h3 className="text-white font-semibold">Empresa</h3>
                <ul className="space-y-2 text-sm text-center md:text-left">
                  <li><a href="#" className="text-gray-300 hover:text-white transition-colors hover:translate-x-1 inline-block">Sobre</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white transition-colors hover:translate-x-1 inline-block">Blog</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white transition-colors hover:translate-x-1 inline-block">Carreiras</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white transition-colors hover:translate-x-1 inline-block">Contato</a></li>
                </ul>
              </div>

              {/* Support */}
              <div className="space-y-4">
                <h3 className="text-white font-semibold">Suporte</h3>
                <ul className="space-y-2 text-sm text-center md:text-left">
                  <li><a href="#" className="text-gray-300 hover:text-white transition-colors hover:translate-x-1 inline-block">Central de Ajuda</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white transition-colors hover:translate-x-1 inline-block">Documentação</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white transition-colors hover:translate-x-1 inline-block">API</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white transition-colors hover:translate-x-1 inline-block">Status</a></li>
                </ul>
              </div>
            </div>

            <div className="border-t border-white/10 pt-8">
              <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <p className="text-gray-300 text-sm">
                  &copy; 2025 Nexta. Todos os direitos reservados.
                </p>
                <div className="flex space-x-6 text-sm">
                  <a href="#" className="text-gray-300 hover:text-white transition-colors hover:translate-x-1 inline-block">Privacidade</a>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors hover:translate-x-1 inline-block">Termos</a>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors hover:translate-x-1 inline-block">Cookies</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

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