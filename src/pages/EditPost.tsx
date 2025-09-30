import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PostForm from "@/components/PostForm";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";
import { api, type Post, type UpdatePostData } from "@/services/api";
import { useAuth } from "@/contexts/useAuth";
import { toast } from "@/hooks/use-toast";

const EditPost = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) {
        setError("Post ID is required");
        setLoading(false);
        return;
      }

      try {
        const fetchedPost = await api.getPost(id, token);
        if (!fetchedPost) {
          setError("Post not found");
        } else {
          setPost(fetchedPost);
        }
      } catch (err) {
        setError("Failed to fetch post");
        toast({
          title: "Error",
          description: "Failed to load post. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const handleSubmit = async (data: UpdatePostData) => {
    if (!id) throw new Error("Post ID is required");
    if (!token) throw new Error("Authentication required");
    
    const updatedPost = await api.updatePost(id, data, token);
    if (!updatedPost) {
      throw new Error("Failed to update post");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-surface">
        <div className="container mx-auto px-3 sm:px-4 py-12 sm:py-20">
          <Card className="max-w-2xl mx-auto bg-gradient-surface shadow-md">
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
          <Card className="max-w-2xl mx-auto bg-gradient-surface shadow-md border-destructive/20">
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
              <button
                onClick={() => navigate("/posts")}
                className="text-primary hover:underline text-sm sm:text-base"
              >
                Voltar aos Posts
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-8">
      <PostForm initialData={post} onSubmit={handleSubmit} isEdit />
    </div>
  );
};

export default EditPost;