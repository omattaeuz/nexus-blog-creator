import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Edit, Trash2, User, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { formatDate, truncateContent } from "@/lib/formatters";
import { Badge } from "@/components/ui/badge";
import DeletePostModal from "./DeletePostModal";
import ShareButton from "./ShareButton";
import { type Post } from "@/types";

interface PostCardProps {
  post: Post;
  onDelete?: (id: string) => void;
}

const PostCard = ({ post, onDelete }: PostCardProps) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = () => { setShowDeleteModal(true); };

  const handleDeleteConfirm = async () => {
    if (!onDelete) return;
    
    setIsDeleting(true);
    try {
      await onDelete(post.id);
      toast({
        title: "Post excluído",
        description: "O post foi excluído com sucesso.",
        variant: "destructive",
      });
      setShowDeleteModal(false);
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

  const handleDeleteCancel = () => { setShowDeleteModal(false); };

  return (
    <Card className="group hover:shadow-2xl transition-all duration-300 bg-slate-800/50 backdrop-blur-md border-slate-700/50 h-full flex flex-col relative">
      <div className="absolute top-3 right-3 z-10">
        <div 
          className={`w-3 h-3 rounded-full border-2 border-white shadow-sm ${
            post.is_public 
              ? 'bg-green-500' 
              : 'bg-red-500'
          }`}
          title={post.is_public ? 'Post público' : 'Post privado'}
        />
      </div>
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg sm:text-xl font-bold text-white group-hover:text-cyan-400 transition-colors duration-300 leading-tight pr-6">
            {post.title}
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 flex-1 flex flex-col">
        <p className="text-sm sm:text-base text-gray-300 leading-relaxed flex-1">
          {truncateContent(post.content)}
        </p>

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {post.tags.slice(0, 3).map((tag, index) => (
              <Badge 
                key={index} 
                className="text-xs px-2 py-0.5 bg-slate-700/50 text-gray-300 border-slate-600/50"
              >
                #{tag}
              </Badge>
            ))}
            {post.tags.length > 3 && (
              <Badge className="text-xs px-2 py-0.5 bg-slate-700/50 text-gray-300 border-slate-600/50">
                +{post.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-400">
          <div className="flex items-center space-x-1">
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>{formatDate(post.created_at)}</span>
          </div>
          {post.author && (
            <div className="flex items-center space-x-1">
              <User className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="truncate">{post.author.email}</span>
            </div>
          )}
          <div className="flex items-center space-x-1">
            <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>{post.comments_count || 0} comentários</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-2 pt-2">
          <Button
            size="sm"
            asChild
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex-1 sm:flex-none py-3 sm:py-2 text-base sm:text-sm font-semibold hover:scale-105 active:scale-95"
          >
            <Link to={`/posts/${post.id}`} className="text-center flex items-center justify-center">
              <span>Ler Mais</span>
            </Link>
          </Button>

          <div className="flex items-center justify-center sm:justify-end gap-2">
            <ShareButton
              postTitle={post.title}
              postId={post.id}
              variant="ghost"
              size="sm"
            />

            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-gray-400 hover:bg-slate-700/50 hover:text-cyan-400 transition-all duration-300"
              aria-label="Editar post"
            >
              <Link to={`/posts/${post.id}/edit`}>
                <Edit className="h-4 w-4" />
                <span className="sr-only">Editar</span>
              </Link>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteClick}
              className="text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition-all duration-300"
              aria-label="Excluir post"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Excluir</span>
            </Button>
          </div>
        </div>
      </CardContent>
      
      <DeletePostModal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        postTitle={post.title}
        isLoading={isDeleting}
      />
    </Card>
  );
};

export default PostCard;