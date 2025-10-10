import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PostForm from "@/components/PostForm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AnimatedBackground from "@/components/AnimatedBackground";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { api } from "@/services/api";
import { type Post, type UpdatePostData } from "@/types";
import { useAuth } from "@/contexts/useAuth";
import { toast } from "@/hooks/use-toast";
import { ERROR_MESSAGES, SUCCESS_MESSAGES, ROUTES } from "@/lib/constants";

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
        setError(ERROR_MESSAGES.NOT_FOUND);
        setLoading(false);
        return;
      }

      try {
        const fetchedPost = await api.getPost(id, token);
        if (!fetchedPost) setError(ERROR_MESSAGES.NOT_FOUND);
        else setPost(fetchedPost);
        
      } catch (_err) {
        setError(ERROR_MESSAGES.NETWORK_ERROR);
        toast({
          title: "Erro",
          description: ERROR_MESSAGES.NETWORK_ERROR,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, token]);

  const handleSubmit = async (data: UpdatePostData) => {
    if (!id) throw new Error(ERROR_MESSAGES.NOT_FOUND);
    if (!token) throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
    
    const updatedPost = await api.updatePost(id, data, token);
    if (!updatedPost) {
      throw new Error(ERROR_MESSAGES.UNEXPECTED_ERROR);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative">
        <AnimatedBackground />
        <div className="relative z-10 container mx-auto px-3 sm:px-4 py-12 sm:py-20">
          <Card className="max-w-2xl mx-auto bg-slate-800/50 backdrop-blur-md border-slate-700/50 shadow-2xl">
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
          <Card className="max-w-2xl mx-auto bg-slate-800/50 backdrop-blur-md border-slate-700/50 shadow-2xl">
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
                onClick={() => navigate(ROUTES.POSTS)}
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
      <div className="relative z-10 flex items-center justify-center py-8">
        <PostForm initialData={post} onSubmit={handleSubmit} isEdit />
      </div>
    </div>
  );
};

export default EditPost;