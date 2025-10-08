import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, ArrowLeft, Loader2, AlertCircle, LogIn } from "lucide-react";
import { api } from "@/services/api";
import { type Post } from "@/types";
// import { toast } from "@/hooks/use-toast";
import { formatDate, calculateReadingTime } from "@/lib/formatters";
import { cacheManager } from "@/lib/cache-manager";
import ShareButton from "@/components/ShareButton";
import RichRendererPro from "@/components/RichRendererPro";
import RelatedPosts from "@/components/RelatedPosts";
import CommentsSection from "@/components/CommentsSection";
import { useAuth } from "@/contexts/useAuth";

const PublicPostDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
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
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Article Content */}
          <article className="lg:col-span-3">
            {/* Article Header */}
            <header className="mb-8">
              <div className="mb-4 flex items-center gap-3">
                <Badge variant="outline">
                  Público
                </Badge>
                <ShareButton
                  postTitle={post.title}
                  postId={post.id}
                  variant="ghost"
                  size="sm"
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                />
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6">
                {post.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-6">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(post.created_at)}</span>
                </div>
                {post.author && (
                  <div className="flex items-center space-x-2">
                    <span>Por {post.author.email}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <span>•</span>
                  <span>Tempo de leitura: {calculateReadingTime(post.content)} min</span>
                </div>
              </div>
            </header>

            {/* Article Body */}
            <div className="prose prose-lg max-w-none">
              <RichRendererPro html={post.content} />
            </div>

            {/* Article Footer */}
            <footer className="mt-12 pt-8 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <ShareButton
                  postTitle={post.title}
                  postId={post.id}
                  variant="outline"
                  size="default"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                />
                
                <div className="flex items-center gap-3">
                  {!isAuthenticated && (
                    <Button
                      variant="outline"
                      asChild
                      className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      <Link to="/login" className="flex items-center space-x-2">
                        <LogIn className="h-4 w-4" />
                        <span>Fazer Login</span>
                      </Link>
                    </Button>
                  )}
                  
                  <Button
                    variant="default"
                    asChild
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Link to="/" className="flex items-center justify-center">
                      Ver Mais Posts
                    </Link>
                  </Button>
                </div>
              </div>
            </footer>

            {/* Comments Section */}
            <CommentsSection 
              postId={post.id}
              isAuthenticated={isAuthenticated}
              currentUser={isAuthenticated ? {
                name: 'Usuário', // This would come from auth context
                email: 'user@example.com'
              } : undefined}
            />
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-8">
              {/* Author Info */}
              {post.author && (
                <Card className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Sobre o Autor</h3>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-lg">
                        {post.author.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{post.author.email}</p>
                      <p className="text-sm text-gray-600">Autor do Blog</p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Related Posts */}
              <RelatedPosts 
                currentPostId={post.id}
                currentPostTags={post.tags}
                maxPosts={3}
              />

              {/* Newsletter Signup */}
              <Card className="p-6 bg-blue-50 border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">Fique por dentro</h3>
                <p className="text-sm text-blue-700 mb-4">
                  Receba os melhores posts diretamente no seu e-mail.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full border-blue-300 text-blue-700 hover:bg-blue-100"
                  disabled
                >
                  Em breve
                </Button>
              </Card>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default PublicPostDetail;