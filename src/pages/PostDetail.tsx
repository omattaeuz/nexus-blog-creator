import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Edit, Trash2, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
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
    return (
      <div className="min-h-screen bg-gradient-surface">
        <div className="container mx-auto px-3 sm:px-4 py-12 sm:py-20">
          <Card className="max-w-4xl mx-auto bg-gradient-surface shadow-md border-destructive/20">
            <CardContent className="p-6 sm:p-8 md:p-12 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mb-4 sm:mb-6 rounded-xl bg-destructive/10 text-destructive">
                <AlertCircle className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8" />
              </div>
              <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-foreground">
                {error || "Post não encontrado"}
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 px-4">
                O post que você está procurando não existe ou foi removido.
              </p>
              <Button
                onClick={() => navigate("/posts")}
                variant="outline"
                className="hover:bg-primary hover:text-primary-foreground transition-all duration-300 flex-1 sm:flex-none"
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
                  {post.is_public ? "Público" : "Privado"}
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

              {/* Action Buttons for Authenticated Users */}
              {isAuthenticated && (
                <div className="flex items-center gap-3 mb-6">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
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
                    className="border-red-300 text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </Button>
                </div>
              )}
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
                
                <Button
                  variant="default"
                  asChild
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Link to="/posts" className="flex items-center justify-center">
                    Ver Todos os Posts
                  </Link>
                </Button>
              </div>
            </footer>
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

          {/* Comments Section */}
          <CommentsSection 
            postId={post.id}
            isAuthenticated={isAuthenticated}
            currentUser={isAuthenticated ? {
              name: 'Usuário', // This would come from auth context
              email: 'user@example.com'
            } : undefined}
          />

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

      {/* Delete Modal */}
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