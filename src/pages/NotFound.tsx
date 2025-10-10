import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, AlertCircle } from "lucide-react";
import { logError } from '@/lib/logger';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    logError("404 Error: User attempted to access non-existent route", { path: location.pathname });
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-surface flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="inline-flex items-center justify-center w-20 h-20 mb-8 rounded-xl bg-destructive/10 text-destructive">
          <AlertCircle className="h-10 w-10" />
        </div>
        
        <h1 className="text-6xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
          404
        </h1>
        
        <h2 className="text-2xl font-semibold mb-4 text-foreground">
          Página Não Encontrada
        </h2>
        
        <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
          Oops! A página que você está procurando não existe. Ela pode ter sido movida ou excluída.
        </p>
        
        <Button
          asChild
          size="lg"
          className="bg-gradient-primary hover:bg-primary-hover shadow-glow transition-all duration-300"
        >
          <Link to="/" className="flex items-center space-x-2">
            <Home className="h-5 w-5" />
            <span>Voltar ao Início</span>
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;