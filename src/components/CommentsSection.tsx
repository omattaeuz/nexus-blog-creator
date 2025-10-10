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
import { useCommentsWithCache } from '@/hooks/useCommentsWithCache';
import { Comment } from '@/services/comments';

interface CommentsSectionProps {
  postId: string;
  isAuthenticated?: boolean;
  currentUser?: {
    name: string;
    email: string;
  };
  // Props para compatibilidade com CommentsSystem
  comments?: Comment[];
  onAddComment?: (content: string, parentId?: string) => void;
  onLikeComment?: (commentId: string) => void;
  onReply?: (commentId: string, content: string) => void;
  onModerate?: (commentId: string, approved: boolean) => void;
  isModerator?: boolean;
  // Modo de uso: 'standalone' (usa cache) ou 'controlled' (usa props)
  mode?: 'standalone' | 'controlled';
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
    <Card className="mb-4 bg-slate-800/50 backdrop-blur-md border-slate-700/50 shadow-2xl">
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
              <h4 className="font-medium text-sm text-white">{comment.author}</h4>
              <Badge variant="outline" className="text-xs bg-slate-700/50 text-gray-300 border-slate-600/50">
                {formatDistanceToNow(new Date(comment.createdAt), {
                  addSuffix: true,
                  locale: ptBR
                })}
              </Badge>
              {new Date(comment.updatedAt).getTime() !== new Date(comment.createdAt).getTime() && (
                <Badge variant="secondary" className="text-xs bg-slate-600/50 text-gray-300 border-slate-500/50">
                  Editado
                </Badge>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="min-h-[80px] bg-slate-700/50 border-slate-600/50 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400/20"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleEdit} className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white">
                    <Check className="h-3 w-3 mr-1" />
                    Salvar
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancelEdit} className="border-slate-600/50 text-gray-300 hover:bg-slate-700/50 hover:text-white">
                    <X className="h-3 w-3 mr-1" />
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-300 mb-3 whitespace-pre-wrap">
                {comment.content}
              </p>
            )}

            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onLike(comment.id)}
                className="text-gray-400 hover:text-red-400 hover:bg-red-500/20"
              >
                <Heart className="h-4 w-4 mr-1" />
                {comment.likes}
              </Button>
              
              {isAuthenticated && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onReply(comment.id)}
                  className="text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/20"
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
                    className="text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/20"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(comment.id)}
                    className="text-gray-400 hover:text-red-400 hover:bg-red-500/20"
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
                    className="text-green-400 hover:text-green-300 hover:bg-green-500/20"
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onModerate(comment.id, false)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
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
                  className="text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/20 mb-3"
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  {showReplies ? 'Ocultar' : 'Mostrar'} {comment.replies.length} resposta{comment.replies.length !== 1 ? 's' : ''}
                </Button>

                {showReplies && (
                  <div className="ml-4 space-y-3 border-l-2 border-slate-600/50 pl-4">
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
  currentUser,
  // Props para modo controlled
  comments: externalComments,
  onAddComment: externalOnAddComment,
  onLikeComment: externalOnLikeComment,
  onReply: externalOnReply,
  onModerate: externalOnModerate,
  isModerator = false,
  mode = 'standalone'
}: CommentsSectionProps) {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [authorName, setAuthorName] = useState(currentUser?.name || '');
  const [authorEmail, setAuthorEmail] = useState(currentUser?.email || '');

  // Hook para modo standalone (só chama se não for controlled)
  const cacheHook = mode === 'standalone' ? useCommentsWithCache(postId) : null;
  
  // Dados e funções baseadas no modo
  const comments = mode === 'controlled' ? (externalComments || []) : (cacheHook?.comments || []);
  const isLoading = mode === 'controlled' ? false : (cacheHook?.loading || false);
  const error = mode === 'controlled' ? null : (cacheHook?.error || null);
  
  // Funções baseadas no modo
  const createComment = mode === 'controlled' 
    ? async (data: any) => externalOnAddComment?.(data.content, data.parentId)
    : (cacheHook?.createComment || (() => Promise.reject('Cache hook not available')));
    
  const updateComment = mode === 'controlled' 
    ? async (id: string, content: string) => {
        // No modo controlled, não há update direto
        console.warn('Update not supported in controlled mode');
      }
    : (cacheHook?.updateComment || (() => Promise.reject('Cache hook not available')));
    
  const deleteComment = mode === 'controlled' 
    ? async (id: string) => {
        // No modo controlled, não há delete direto
        console.warn('Delete not supported in controlled mode');
      }
    : (cacheHook?.deleteComment || (() => Promise.reject('Cache hook not available')));
    
  const likeComment = mode === 'controlled' 
    ? async (id: string) => externalOnLikeComment?.(id)
    : (cacheHook?.likeComment || (() => Promise.reject('Cache hook not available')));
    
  const moderateComment = mode === 'controlled' 
    ? async (id: string, approved: boolean) => externalOnModerate?.(id, approved)
    : (cacheHook?.moderateComment || (() => Promise.reject('Cache hook not available')));

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
      <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50 shadow-2xl">
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Carregando comentários...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50 shadow-2xl">
        <CardContent className="p-6 text-center">
          <p className="text-red-400">Erro ao carregar comentários: {error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mt-6 space-y-6">
      <div className="flex items-center gap-2">
        <MessageCircle className="h-5 w-5 text-cyan-400" />
        <h3 className="text-lg font-semibold text-white">
          Comentários ({comments.length})
        </h3>
      </div>

      <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-base text-white">Deixe seu comentário</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isAuthenticated && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-300">Nome</label>
                <Input
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Seu nome"
                  className="bg-slate-700/50 border-slate-600/50 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400/20"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300">Email</label>
                <Input
                  type="email"
                  value={authorEmail}
                  onChange={(e) => setAuthorEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="bg-slate-700/50 border-slate-600/50 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400/20"
                />
              </div>
            </div>
          )}
          
          <div>
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Escreva seu comentário..."
              className="min-h-[100px] bg-slate-700/50 border-slate-600/50 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400/20"
            />
          </div>
          
          <Button 
            onClick={handleSubmitComment}
            disabled={!newComment.trim() || (!isAuthenticated && (!authorName.trim() || !authorEmail.trim()))}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Send className="h-4 w-4 mr-2" />
            Comentar
          </Button>
        </CardContent>
      </Card>

      {replyingTo && (
        <Card className="bg-slate-800/50 backdrop-blur-md border-cyan-400/20 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-base text-white">Responder comentário</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isAuthenticated && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-300">Nome</label>
                  <Input
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="Seu nome"
                    className="bg-slate-700/50 border-slate-600/50 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400/20"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">Email</label>
                  <Input
                    type="email"
                    value={authorEmail}
                    onChange={(e) => setAuthorEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="bg-slate-700/50 border-slate-600/50 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400/20"
                  />
                </div>
              </div>
            )}
            
            <div>
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Escreva sua resposta..."
                className="min-h-[80px] bg-slate-700/50 border-slate-600/50 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400/20"
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleSubmitReply}
                disabled={!replyContent.trim() || (!isAuthenticated && (!authorName.trim() || !authorEmail.trim()))}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
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
                className="border-slate-600/50 text-gray-300 hover:bg-slate-700/50 hover:text-white"
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {comments.length === 0 ? (
        <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50 shadow-2xl">
          <CardContent className="p-6 text-center">
            <MessageCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-300">
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