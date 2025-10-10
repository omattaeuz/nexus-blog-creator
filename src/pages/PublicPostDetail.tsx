import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AnimatedBackground from "@/components/AnimatedBackground";
import { Calendar, ArrowLeft, Loader2, AlertCircle, LogIn, User, Clock } from "lucide-react";
import { api } from "@/services/api";
import { type Post } from "@/types";
import { formatDate, calculateReadingTime } from "@/lib/formatters";
import { redisCache } from "@/lib/redis-cache";
import ShareButton from "@/components/ShareButton";
import RichRendererPro from "@/components/RichRendererPro";
import RelatedPosts from "@/components/RelatedPosts";
import CommentsSection from "@/components/CommentsSection";
import { useAuth } from "@/contexts/useAuth";
import { ERROR_MESSAGES, ROUTES } from "@/lib/constants";

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
        setError(ERROR_MESSAGES.NOT_FOUND);
        setLoading(false);
        return;
      }

      try {
        const fetchedPost = await api.getPost(id);

        if (!fetchedPost) setError(ERROR_MESSAGES.NOT_FOUND);
        else setPost(fetchedPost);

      } catch (err) {
        console.error('Public access failed, trying localStorage fallback:', err);
        
        // Try to get from Redis cache
        const cachedPost = await redisCache.get<Post>(`posts:detail:${id}`);
        if (cachedPost) {
          console.log('Found post in Redis cache, showing preview');
          setPost(cachedPost);
          setLoading(false);
          return;
        }
        
        // If no cache available, show appropriate error message
        let errorMessage: string = ERROR_MESSAGES.UNAUTHORIZED;
        
        if (err instanceof Error) {
          if (err.message.includes('404')) {
            errorMessage = ERROR_MESSAGES.NOT_FOUND;
          } else if (err.message.includes('CORS') || err.message.includes('servidor está com problemas')) {
            errorMessage = ERROR_MESSAGES.NETWORK_ERROR;
          } else if (err.message.includes('não disponível publicamente')) {
            errorMessage = err.message;
          } else if (err.message.includes('Network Error') || err.message.includes('ERR_NETWORK')) {
            errorMessage = ERROR_MESSAGES.NETWORK_ERROR;
          } else if (err.message.includes('500') || err.message.includes('Internal Server Error')) {
            errorMessage = ERROR_MESSAGES.UNEXPECTED_ERROR;
          } else if (err.message.includes('CORS policy')) {
            errorMessage = ERROR_MESSAGES.NETWORK_ERROR;
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative">
        <AnimatedBackground />
        <div className="relative z-10 container mx-auto px-3 sm:px-4 py-12 sm:py-20">
          <Card className="max-w-4xl mx-auto bg-slate-800/50 backdrop-blur-md border-slate-700/50 shadow-2xl">
            <CardContent className="p-8 sm:p-12 text-center">
              <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin mx-auto mb-3 sm:mb-4 text-cyan-400" />
              <p className="text-sm sm:text-base text-gray-300">Carregando post...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !post) {
    const isLoginRequired = error === "Este post requer login para visualização";
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative">
        <AnimatedBackground />
        <div className="relative z-10 container mx-auto px-3 sm:px-4 py-12 sm:py-20">
          <Card className="max-w-4xl mx-auto bg-slate-800/50 backdrop-blur-md border-slate-700/50 shadow-2xl">
            <CardContent className="p-8 sm:p-12 text-center">
              <AlertCircle className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 sm:mb-6 text-red-400" />
              <h1 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">
                {isLoginRequired ? "Login Necessário" : "Post não encontrado"}
              </h1>
              <p className="text-sm sm:text-base text-gray-300 mb-6 sm:mb-8">
                {isLoginRequired 
                  ? "Para visualizar este post, você precisa fazer login na plataforma."
                  : (error || "O post que você está procurando não existe ou foi removido.")
                }
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  onClick={() => window.location.reload()}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Tentar Novamente
                </Button>
                
                {isLoginRequired && (
                  <Button
                    variant="outline"
                    asChild
                    className="border-slate-600/50 text-gray-300 hover:bg-slate-700/50 hover:text-white transition-all duration-300"
                  >
                    <Link to={ROUTES.LOGIN}>
                      <LogIn className="h-4 w-4 mr-2" />
                      Fazer Login
                    </Link>
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  onClick={() => navigate(ROUTES.HOME)}
                  className="border-slate-600/50 text-gray-300 hover:bg-slate-700/50 hover:text-white transition-all duration-300"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative">
      <AnimatedBackground />
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <article className="lg:col-span-3">
            <header className="mb-8">
              <div className="mb-4 flex items-center gap-3">
                <Badge className="bg-green-500/10 text-green-400 border-green-500/50">
                  Público
                </Badge>
                <ShareButton
                  postTitle={post.title}
                  postId={post.id}
                  variant="ghost"
                  size="sm"
                  className="p-2 text-gray-400 hover:text-white hover:bg-slate-700/50"
                />
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
                {post.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-300 mb-6">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>{formatDate(post.created_at)}</span>
                </div>
                {post.author && (
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span>Por {post.author.email}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span>Tempo de leitura: {calculateReadingTime(post.content)} min</span>
                </div>
              </div>
            </header>

            <div className="prose prose-lg max-w-none">
              <RichRendererPro html={post.content} />
            </div>

            <footer className="mt-12 pt-8 border-t border-slate-700/50">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <ShareButton
                  postTitle={post.title}
                  postId={post.id}
                  variant="outline"
                  size="default"
                  className="border-slate-600/50 text-gray-300 hover:bg-slate-700/50 hover:text-white"
                />
                
                <div className="flex items-center gap-3">
                  {!isAuthenticated && (
                    <Button
                      variant="outline"
                      asChild
                      className="border-slate-600/50 text-gray-300 hover:bg-slate-700/50 hover:text-white"
                    >
                      <Link to={ROUTES.LOGIN} className="flex items-center space-x-2">
                        <LogIn className="h-4 w-4" />
                        <span>Fazer Login</span>
                      </Link>
                    </Button>
                  )}
                  
                  <Button
                    variant="default"
                    asChild
                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Link to={ROUTES.HOME} className="flex items-center justify-center">
                      Ver Mais Posts
                    </Link>
                  </Button>
                </div>
              </div>
            </footer>

            <CommentsSection 
              postId={post.id}
              isAuthenticated={isAuthenticated}
              currentUser={isAuthenticated ? {
                name: 'Usuário',
                email: 'user@example.com'
              } : undefined}
            />
          </article>

          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-8">
              {post.author && (
                <Card className="p-6 bg-slate-800/50 backdrop-blur-md border-slate-700/50 shadow-2xl">
                  <h3 className="font-semibold text-white mb-4">Sobre o Autor</h3>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-lg">
                        {post.author.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-white">{post.author.email}</p>
                      <p className="text-sm text-gray-300">Autor do Blog</p>
                    </div>
                  </div>
                </Card>
              )}

              <RelatedPosts 
                currentPostId={post.id}
                currentPostTags={post.tags}
                maxPosts={3}
              />

              <Card className="p-6 bg-slate-800/50 backdrop-blur-md border-slate-700/50 shadow-2xl">
                <h3 className="font-semibold text-white mb-2">Fique por dentro</h3>
                <p className="text-sm text-gray-300 mb-4">
                  Receba os melhores posts diretamente no seu e-mail.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full border-slate-600/50 hover:bg-slate-700/50"
                  style={{ color: 'white !important' }}
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