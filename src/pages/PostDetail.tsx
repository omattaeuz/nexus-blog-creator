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
        <div className="container mx-auto px-4 py-20">
          <Card className="max-w-4xl mx-auto bg-gradient-surface shadow-md">
            <CardContent className="p-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Carregando post...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-surface">
        <div className="container mx-auto px-4 py-20">
          <Card className="max-w-4xl mx-auto bg-gradient-surface shadow-md border-destructive/20">
            <CardContent className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-xl bg-destructive/10 text-destructive">
                <AlertCircle className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">
                {error || "Post não encontrado"}
              </h2>
              <p className="text-muted-foreground mb-6">
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
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
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
          <CardHeader className="pb-6">
            <div className="flex items-start justify-between mb-4">
              <CardTitle className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
                {post.title}
              </CardTitle>
              {post.updated_at && post.updated_at !== post.created_at && (
                <Badge variant="secondary" className="ml-4 shrink-0">
                  Atualizado
                </Badge>
              )}
            </div>

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>Publicado {formatDate(post.created_at)}</span>
              </div>
              {post.updated_at && post.updated_at !== post.created_at && (
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Atualizado {formatDate(post.updated_at)}</span>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Post Content */}
            <div className="prose prose-lg max-w-none">
              <div className="text-foreground leading-relaxed whitespace-pre-wrap">
                {post.content}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-border">
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  asChild
                  className="hover:bg-secondary hover:text-secondary-foreground transition-all duration-300"
                >
                  <Link to={`/posts/${post.id}/edit`} className="flex items-center space-x-2">
                    <Edit className="h-4 w-4" />
                    <span>Editar Post</span>
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  onClick={handleDelete}
                  className="hover:bg-destructive hover:text-destructive-foreground transition-all duration-300"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir Post
                </Button>
              </div>

              <Button
                variant="default"
                asChild
                className="bg-gradient-primary hover:bg-primary-hover shadow-glow transition-all duration-300"
              >
                <Link to="/posts">
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