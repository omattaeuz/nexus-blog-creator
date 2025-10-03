import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, ArrowLeft, Loader2, AlertCircle, LogIn } from "lucide-react";
import { api, type Post } from "@/services/api";
import { toast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/formatters";
import { cacheManager } from "@/lib/cache-manager";
import ShareButton from "@/components/ShareButton";

const PublicPostDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) {
        setError("ID do post é obrigatório");
        setLoading(false);
        return;
      }

      try {
        // Try to fetch post without authentication token
        const fetchedPost = await api.getPost(id);
        if (!fetchedPost) {
          setError("Post não encontrado");
        } else {
          setPost(fetchedPost);
        }
      } catch (err) {
        // If API fails, try to get post from localStorage (from previous visits)
        console.error('Public access failed, trying localStorage fallback:', err);
        
        // Try to get from cache using the new cache manager
        const cachedPost = cacheManager.getPost(id);
        if (cachedPost) {
          console.log('Found post in cache, showing preview');
          setPost(cachedPost);
          setLoading(false);
          return;
        }
        
        // If no cache available, show appropriate error message
        let errorMessage = "Este post não está disponível publicamente ou requer login para visualização";
        
        if (err instanceof Error) {
          if (err.message.includes('404')) {
            errorMessage = "Post não encontrado";
          } else if (err.message.includes('CORS') || err.message.includes('servidor está com problemas')) {
            errorMessage = "Problema de configuração do servidor. Este post pode não estar disponível publicamente.";
          } else if (err.message.includes('não disponível publicamente')) {
            errorMessage = err.message;
          } else if (err.message.includes('Network Error') || err.message.includes('ERR_NETWORK')) {
            errorMessage = "Servidor temporariamente indisponível. Tente novamente mais tarde.";
          } else if (err.message.includes('500') || err.message.includes('Internal Server Error')) {
            errorMessage = "Erro interno do servidor. O post pode não estar disponível no momento.";
          } else if (err.message.includes('CORS policy')) {
            errorMessage = "Problema de configuração de CORS. Este post pode não estar acessível publicamente.";
          }
        }
        
        setError(errorMessage);
        setLoading(false);
        return;
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-surface">
        <div className="container mx-auto px-3 sm:px-4 py-12 sm:py-20">
          <Card className="max-w-4xl mx-auto bg-gradient-surface shadow-md">
            <CardContent className="p-8 sm:p-12 text-center">
              <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin mx-auto mb-3 sm:mb-4 text-primary" />
              <p className="text-sm sm:text-base text-muted-foreground">Carregando post...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !post) {
    const isLoginRequired = error === "Este post requer login para visualização";
    
    return (
      <div className="min-h-screen bg-gradient-surface">
        <div className="container mx-auto px-3 sm:px-4 py-12 sm:py-20">
          <Card className="max-w-4xl mx-auto bg-gradient-surface shadow-md">
            <CardContent className="p-8 sm:p-12 text-center">
              <AlertCircle className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 sm:mb-6 text-destructive" />
              <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4">
                {isLoginRequired ? "Login Necessário" : "Post não encontrado"}
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8">
                {isLoginRequired 
                  ? "Para visualizar este post, você precisa fazer login na plataforma."
                  : (error || "O post que você está procurando não existe ou foi removido.")
                }
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  onClick={() => window.location.reload()}
                  variant="default"
                  className="bg-gradient-primary hover:bg-primary-hover shadow-glow transition-all duration-300"
                >
                  Tentar Novamente
                </Button>
                
                {isLoginRequired && (
                  <Button
                    variant="outline"
                    asChild
                    className="hover:bg-secondary hover:text-secondary-foreground transition-all duration-300"
                  >
                    <Link to="/login">
                      <LogIn className="h-4 w-4 mr-2" />
                      Fazer Login
                    </Link>
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  onClick={() => navigate("/")}
                  className="hover:bg-secondary hover:text-secondary-foreground transition-all duration-300"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar ao início
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-surface">
      <div className="container mx-auto px-3 sm:px-4 py-12 sm:py-20">
        <Card className="max-w-4xl mx-auto bg-gradient-surface shadow-md">
          <CardHeader className="pb-6">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                onClick={() => navigate("/")}
                className="hover:bg-secondary hover:text-secondary-foreground transition-all duration-300"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              
              <ShareButton
                postTitle={post.title}
                postId={post.id}
                variant="outline"
                size="default"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <CardTitle className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-tight">
                  {post.title}
                </CardTitle>
                {post.updated_at && post.updated_at !== post.created_at && (
                  <Badge variant="secondary" className="flex-shrink-0 text-xs">
                    Atualizado
                  </Badge>
                )}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Publicado em {formatDate(post.created_at)}</span>
                </div>
                {post.updated_at && post.updated_at !== post.created_at && (
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Atualizado em {formatDate(post.updated_at)}</span>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="prose prose-sm sm:prose-base max-w-none">
              <div className="text-foreground leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
                {post.content}
              </div>
            </div>

            {/* Public Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4 sm:pt-6 border-t border-border">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                <Button
                  variant="outline"
                  asChild
                  className="hover:bg-secondary hover:text-secondary-foreground transition-all duration-300 flex-1 sm:flex-none"
                >
                  <Link to="/login" className="flex items-center justify-center space-x-2">
                    <LogIn className="h-4 w-4" />
                    <span>Fazer Login</span>
                  </Link>
                </Button>
              </div>

              <Button
                variant="default"
                asChild
                className="bg-gradient-primary hover:bg-primary-hover shadow-glow transition-all duration-300 w-full sm:w-auto"
              >
                <Link to="/" className="flex items-center justify-center">
                  Ver Mais Posts
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PublicPostDetail;