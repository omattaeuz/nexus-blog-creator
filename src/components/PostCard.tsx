import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Edit, Trash2, User } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { formatDate, truncateContent } from "@/lib/formatters";

interface Post {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at?: string;
  author?: string;
}

interface PostCardProps {
  post: Post;
  onDelete?: (id: string) => void;
}

const PostCard = ({ post, onDelete }: PostCardProps) => {
  const handleDelete = () => {
    if (window.confirm("Tem certeza que deseja excluir este post?")) {
      onDelete?.(post.id);
      toast({
        title: "Post excluído",
        description: "O post foi excluído com sucesso.",
        variant: "destructive",
      });
    }
  };


  return (
    <Card className="group hover:shadow-glow transition-all duration-300 bg-gradient-surface border-border/50 h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300 leading-tight">
            {post.title}
          </CardTitle>
          {post.updated_at && post.updated_at !== post.created_at && (
            <Badge variant="secondary" className="ml-2 flex-shrink-0 text-xs">
              Atualizado
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 flex-1 flex flex-col">
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed flex-1">
          {truncateContent(post.content)}
        </p>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>{formatDate(post.created_at)}</span>
          </div>
          {post.author && (
            <div className="flex items-center space-x-1">
              <User className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="truncate">{post.author}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="hover:bg-primary hover:text-primary-foreground transition-all duration-300 flex-1 sm:flex-none"
          >
            <Link to={`/posts/${post.id}`} className="text-center">
              Ler Mais
            </Link>
          </Button>

          <div className="flex items-center justify-center sm:justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="hover:bg-secondary hover:text-secondary-foreground transition-all duration-300"
            >
              <Link to={`/posts/${post.id}/edit`}>
                <Edit className="h-4 w-4" />
                <span className="sr-only">Editar</span>
              </Link>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="hover:bg-destructive hover:text-destructive-foreground transition-all duration-300"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Excluir</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PostCard;