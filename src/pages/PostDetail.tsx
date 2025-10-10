import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AnimatedBackground from "@/components/AnimatedBackground";
import { Calendar, Edit, Trash2, ArrowLeft, Loader2, AlertCircle, User, Clock } from "lucide-react";
import { api } from "@/services/api";
import { type Post } from "@/types";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/useAuth";
import { formatDate, calculateReadingTime } from "@/lib/formatters";
import DeletePostModal from "@/components/DeletePostModal";
import ShareButton from "@/components/ShareButton";
import RichRendererPro from "@/components/RichRendererPro";
import RelatedPosts from "@/components/RelatedPosts";
import CommentsSection from "@/components/CommentsSection";

const PostDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) {
        setError("ID do post é obrigatório");
        setLoading(false);
        return;
      }

      try {
        const fetchedPost = await api.getPost(id, token);
        if (!fetchedPost) {
          setError("Post não encontrado");
        } else {
          setPost(fetchedPost);
        }
      } catch (err) {
        console.error('Error fetching post:', err);
        const errorMessage = err instanceof Error ? err.message : "Falha ao carregar post";
        setError(errorMessage);
        toast({
          title: "Erro",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, token]);

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!post || !token) return;

    setIsDeleting(true);
    try {
      await api.deletePost(post.id, token);
      toast({
        title: "Post excluído",
        description: "O post foi excluído com sucesso.",
        variant: "destructive",
      });
      navigate("/posts");
    } catch (error) {
      console.error('Error deleting post:', error);
      const errorMessage = error instanceof Error ? error.message : "Falha ao excluir post. Tente novamente.";
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
  };


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
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative">
        <AnimatedBackground />
        <div className="relative z-10 container mx-auto px-3 sm:px-4 py-12 sm:py-20">
          <Card className="max-w-4xl mx-auto bg-slate-800/50 backdrop-blur-md border-slate-700/50 shadow-2xl">
            <CardContent className="p-6 sm:p-8 md:p-12 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mb-4 sm:mb-6 rounded-xl bg-red-500/10 text-red-400">
                <AlertCircle className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8" />
              </div>
              <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-white">
                {error || "Post não encontrado"}
              </h2>
              <p className="text-sm sm:text-base text-gray-300 mb-4 sm:mb-6 px-4">
                O post que você está procurando não existe ou foi removido.
              </p>
              <Button
                onClick={() => navigate("/posts")}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar aos Posts
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative">
      <AnimatedBackground />
      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Article Content */}
          <article className="lg:col-span-3">
            {/* Article Header */}
            <header className="mb-8">
              <div className="mb-4 flex items-center gap-3">
                <Badge className={`${post.is_public ? 'bg-green-500/10 text-green-400 border-green-500/50' : 'bg-red-500/10 text-red-400 border-red-500/50'}`}>
                  {post.is_public ? "Público" : "Privado"}
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

              {isAuthenticated && (
                <div className="flex items-center gap-3 mb-6">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="border-slate-600/50 text-gray-300 hover:bg-slate-700/50 hover:text-white"
                  >
                    <Link to={`/posts/${post.id}/edit`} className="flex items-center space-x-2">
                      <Edit className="h-4 w-4" />
                      <span>Editar</span>
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDeleteClick}
                    className="border-red-500/50 text-red-400 hover:bg-red-500/20 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </Button>
                </div>
              )}
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
                
                <Button
                  variant="default"
                  asChild
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Link to="/posts" className="flex items-center justify-center">
                    Ver Todos os Posts
                  </Link>
                </Button>
              </div>
            </footer>
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

          <CommentsSection 
            postId={post.id}
            isAuthenticated={isAuthenticated}
            currentUser={isAuthenticated ? {
              name: 'Usuário',
              email: 'user@example.com'
            } : undefined}
          />

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

      <DeletePostModal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        postTitle={post?.title}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default PostDetail;