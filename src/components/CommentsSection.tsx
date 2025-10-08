import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MessageCircle, 
  Heart, 
  Reply, 
  Send,
  Edit,
  Trash2,
  Check,
  X,
  User
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useComments } from '@/hooks/useComments';
import { Comment } from '@/services/comments';

interface CommentsSectionProps {
  postId: string;
  isAuthenticated?: boolean;
  currentUser?: {
    name: string;
    email: string;
  };
}

interface CommentItemProps {
  comment: Comment;
  onReply: (parentId: string) => void;
  onLike: (id: string) => void;
  onEdit: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  onModerate: (id: string, approved: boolean) => void;
  isAuthenticated?: boolean;
  currentUser?: {
    name: string;
    email: string;
  };
  isModerator?: boolean;
}

function CommentItem({ 
  comment, 
  onReply, 
  onLike, 
  onEdit, 
  onDelete, 
  onModerate,
  isAuthenticated,
  currentUser,
  isModerator = false
}: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showReplies, setShowReplies] = useState(true);

  const handleEdit = () => {
    if (isEditing) {
      onEdit(comment.id, editContent);
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setEditContent(comment.content);
    setIsEditing(false);
  };

  const isOwner = currentUser?.email === comment.authorEmail;
  const canModerate = isModerator || isOwner;

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.author}`} />
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-medium text-sm">{comment.author}</h4>
              <Badge variant="outline" className="text-xs">
                {formatDistanceToNow(new Date(comment.createdAt), {
                  addSuffix: true,
                  locale: ptBR
                })}
              </Badge>
              {new Date(comment.updatedAt).getTime() !== new Date(comment.createdAt).getTime() && (
                <Badge variant="secondary" className="text-xs">
                  Editado
                </Badge>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="min-h-[80px]"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleEdit}>
                    <Check className="h-3 w-3 mr-1" />
                    Salvar
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                    <X className="h-3 w-3 mr-1" />
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-foreground mb-3 whitespace-pre-wrap">
                {comment.content}
              </p>
            )}

            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onLike(comment.id)}
                className="text-muted-foreground hover:text-red-500"
              >
                <Heart className="h-4 w-4 mr-1" />
                {comment.likes}
              </Button>
              
              {isAuthenticated && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onReply(comment.id)}
                  className="text-muted-foreground"
                >
                  <Reply className="h-4 w-4 mr-1" />
                  Responder
                </Button>
              )}

              {canModerate && !isEditing && (
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleEdit}
                    className="text-muted-foreground"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(comment.id)}
                    className="text-muted-foreground hover:text-red-500"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              )}

              {isModerator && !comment.approved && (
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onModerate(comment.id, true)}
                    className="text-green-600 hover:text-green-700"
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onModerate(comment.id, false)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>

            {comment.replies.length > 0 && (
              <div className="mt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReplies(!showReplies)}
                  className="text-muted-foreground mb-3"
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  {showReplies ? 'Ocultar' : 'Mostrar'} {comment.replies.length} resposta{comment.replies.length !== 1 ? 's' : ''}
                </Button>

                {showReplies && (
                  <div className="ml-4 space-y-3 border-l-2 border-muted pl-4">
                    {comment.replies.map((reply) => (
                      <CommentItem
                        key={reply.id}
                        comment={reply}
                        onReply={onReply}
                        onLike={onLike}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onModerate={onModerate}
                        isAuthenticated={isAuthenticated}
                        currentUser={currentUser}
                        isModerator={isModerator}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CommentsSection({ 
  postId, 
  isAuthenticated = false, 
  currentUser 
}: CommentsSectionProps) {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [authorName, setAuthorName] = useState(currentUser?.name || '');
  const [authorEmail, setAuthorEmail] = useState(currentUser?.email || '');

  const {
    comments,
    isLoading,
    error,
    createComment,
    updateComment,
    deleteComment,
    likeComment,
    moderateComment
  } = useComments(postId);

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !authorName.trim() || !authorEmail.trim()) return;

    try {
      await createComment({
        postId,
        content: newComment.trim(),
        author: authorName.trim(),
        authorEmail: authorEmail.trim()
      });
      setNewComment('');
    } catch (error) {
      console.error('Error creating comment:', error);
    }
  };

  const handleSubmitReply = async () => {
    if (!replyContent.trim() || !authorName.trim() || !authorEmail.trim() || !replyingTo) return;

    try {
      await createComment({
        postId,
        content: replyContent.trim(),
        author: authorName.trim(),
        authorEmail: authorEmail.trim(),
        parentId: replyingTo
      });
      setReplyContent('');
      setReplyingTo(null);
    } catch (error) {
      console.error('Error creating reply:', error);
    }
  };

  const handleReply = (parentId: string) => {
    setReplyingTo(parentId);
    setReplyContent('');
  };

  const handleEdit = async (id: string, content: string) => {
    try {
      await updateComment(id, content);
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja deletar este comentário?')) {
      try {
        await deleteComment(id);
      } catch (error) {
        console.error('Error deleting comment:', error);
      }
    }
  };

  const handleLike = async (id: string) => {
    try {
      await likeComment(id);
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  const handleModerate = async (id: string, approved: boolean) => {
    try {
      await moderateComment(id, approved);
    } catch (error) {
      console.error('Error moderating comment:', error);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando comentários...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-destructive">Erro ao carregar comentários: {error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mt-6 space-y-6">
      <div className="flex items-center gap-2">
        <MessageCircle className="h-5 w-5" />
        <h3 className="text-lg font-semibold">
          Comentários ({comments.length})
        </h3>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Deixe seu comentário</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isAuthenticated && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Nome</label>
                <Input
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Seu nome"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={authorEmail}
                  onChange={(e) => setAuthorEmail(e.target.value)}
                  placeholder="seu@email.com"
                />
              </div>
            </div>
          )}
          
          <div>
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Escreva seu comentário..."
              className="min-h-[100px]"
            />
          </div>
          
          <Button 
            onClick={handleSubmitComment}
            disabled={!newComment.trim() || (!isAuthenticated && (!authorName.trim() || !authorEmail.trim()))}
          >
            <Send className="h-4 w-4 mr-2" />
            Comentar
          </Button>
        </CardContent>
      </Card>

      {replyingTo && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-base">Responder comentário</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isAuthenticated && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Nome</label>
                  <Input
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="Seu nome"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    value={authorEmail}
                    onChange={(e) => setAuthorEmail(e.target.value)}
                    placeholder="seu@email.com"
                  />
                </div>
              </div>
            )}
            
            <div>
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Escreva sua resposta..."
                className="min-h-[80px]"
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleSubmitReply}
                disabled={!replyContent.trim() || (!isAuthenticated && (!authorName.trim() || !authorEmail.trim()))}
              >
                <Send className="h-4 w-4 mr-2" />
                Responder
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setReplyingTo(null);
                  setReplyContent('');
                }}
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {comments.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Seja o primeiro a comentar!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={handleReply}
              onLike={handleLike}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onModerate={handleModerate}
              isAuthenticated={isAuthenticated}
              currentUser={currentUser}
              isModerator={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}