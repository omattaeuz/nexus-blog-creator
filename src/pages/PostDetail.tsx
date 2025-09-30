import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Edit, Trash2, ArrowLeft, User, Loader2, AlertCircle } from "lucide-react";
import { api, type Post } from "@/services/api";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/useAuth";

const PostDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
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
        const fetchedPost = await api.getPost(id);
        if (!fetchedPost) {
          setError("Post não encontrado");
        } else {
          setPost(fetchedPost);
        }
      } catch (err) {
        setError("Falha ao carregar post");
        toast({
          title: "Erro",
          description: "Falha ao carregar post. Tente novamente.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const handleDelete = async () => {
    if (!post) return;

    if (window.confirm("Tem certeza que deseja excluir este post? Esta ação não pode ser desfeita.")) {
      try {
        await api.deletePost(post.id, token);
        toast({
          title: "Post excluído",
          description: "O post foi excluído com sucesso.",
          variant: "destructive",
        });
        navigate("/posts");
      } catch (error) {
        toast({
          title: "Erro",
          description: "Falha ao excluir post. Tente novamente.",
          variant: "destructive",
        });
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
                className="transition-all duration-300"
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
    <div className="min-h-screen bg-gradient-surface">
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        {/* Back Button */}
        <div className="mb-4 sm:mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/posts")}
            className="hover:bg-secondary transition-all duration-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar aos Posts
          </Button>
        </div>

        {/* Post Content */}
        <Card className="max-w-4xl mx-auto bg-gradient-surface shadow-glow border-border/50">
          <CardHeader className="pb-4 sm:pb-6 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-3 sm:mb-4 gap-3">
              <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground leading-tight">
                {post.title}
              </CardTitle>
              {post.updated_at && post.updated_at !== post.created_at && (
                <Badge variant="secondary" className="self-start sm:ml-4 shrink-0">
                  Atualizado
                </Badge>
              )}
            </div>

            {/* Metadata */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Publicado {formatDate(post.created_at)}</span>
              </div>
              {post.updated_at && post.updated_at !== post.created_at && (
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Atualizado {formatDate(post.updated_at)}</span>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-6 sm:space-y-8 p-4 sm:p-6">
            {/* Post Content */}
            <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none">
              <div className="text-foreground leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
                {post.content}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4 sm:pt-6 border-t border-border">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                <Button
                  variant="outline"
                  asChild
                  className="hover:bg-secondary hover:text-secondary-foreground transition-all duration-300 flex-1 sm:flex-none"
                >
                  <Link to={`/posts/${post.id}/edit`} className="flex items-center justify-center space-x-2">
                    <Edit className="h-4 w-4" />
                    <span>Editar Post</span>
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  onClick={handleDelete}
                  className="hover:bg-destructive hover:text-destructive-foreground transition-all duration-300 flex-1 sm:flex-none"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir Post
                </Button>
              </div>

              <Button
                variant="default"
                asChild
                className="bg-gradient-primary hover:bg-primary-hover shadow-glow transition-all duration-300 w-full sm:w-auto"
              >
                <Link to="/posts" className="flex items-center justify-center">
                  Ver Todos os Posts
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PostDetail;