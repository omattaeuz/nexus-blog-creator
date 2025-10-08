import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MessageCircle, 
  Heart, 
  Reply, 
  MoreHorizontal, 
  Check,
  X,
  Flag
} from 'lucide-react';
import { Comment } from '@/services/comments';
import { commentService } from '@/services/comments';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CommentsSystemProps {
  postId: string;
  comments: Comment[];
  onAddComment: (content: string, parentId?: string) => void;
  onLikeComment: (commentId: string) => void;
  onReply: (commentId: string, content: string) => void;
  onModerate: (commentId: string, approved: boolean) => void;
  isModerator?: boolean;
}

export default function CommentsSystem({
  postId,
  comments,
  onAddComment,
  onLikeComment,
  onReply,
  onModerate,
  isModerator = false
}: CommentsSystemProps) {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [showReplies, setShowReplies] = useState<Record<string, boolean>>({});

  const approvedComments = comments.filter(comment => comment.approved);
  const pendingComments = comments.filter(comment => !comment.approved);

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(newComment.trim());
      setNewComment('');
    }
  };

  const handleReply = (commentId: string) => {
    if (replyContent.trim()) {
      onReply(commentId, replyContent.trim());
      setReplyContent('');
      setReplyingTo(null);
    }
  };

  const toggleReplies = (commentId: string) => {
    setShowReplies(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <Card key={comment.id} className={`${isReply ? 'ml-8 border-l-2 border-l-blue-200' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.author}`} />
            <AvatarFallback>{comment.author.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{comment.author}</span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.createdAt), { 
                  addSuffix: true, 
                  locale: ptBR 
                })}
              </span>
              {!comment.approved && (
                <Badge variant="outline" className="text-xs">
                  Pendente
                </Badge>
              )}
            </div>
            
            <p className="text-sm text-foreground">{comment.content}</p>
            
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onLikeComment(comment.id)}
                className="h-6 px-2"
              >
                <Heart className="h-3 w-3 mr-1" />
                {comment.likes}
              </Button>
              
              {!isReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReplyingTo(comment.id)}
                  className="h-6 px-2"
                >
                  <Reply className="h-3 w-3 mr-1" />
                  Responder
                </Button>
              )}
              
              {comment.replies.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleReplies(comment.id)}
                  className="h-6 px-2"
                >
                  <MessageCircle className="h-3 w-3 mr-1" />
                  {comment.replies.length} {comment.replies.length === 1 ? 'resposta' : 'respostas'}
                </Button>
              )}
              
              {isModerator && (
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onModerate(comment.id, true)}
                    className="h-6 w-6 p-0 text-green-600"
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onModerate(comment.id, false)}
                    className="h-6 w-6 p-0 text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                  >
                    <Flag className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
            
            {/* Reply Form */}
            {replyingTo === comment.id && (
              <div className="mt-3 space-y-2">
                <Textarea
                  placeholder="Escreva sua resposta..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="min-h-[80px]"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleReply(comment.id)}
                    disabled={!replyContent.trim()}
                  >
                    Responder
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyContent('');
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
            
            {/* Replies */}
            {showReplies[comment.id] && comment.replies.length > 0 && (
              <div className="mt-3 space-y-2">
                {comment.replies.map(reply => renderComment(reply, true))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Comment Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Deixe um comentário
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitComment} className="space-y-4">
            <Textarea
              placeholder="Compartilhe seus pensamentos..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={!newComment.trim()}>
                Comentar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Comments List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            Comentários ({approvedComments.length})
          </h3>
          {isModerator && pendingComments.length > 0 && (
            <Badge variant="destructive">
              {pendingComments.length} pendentes
            </Badge>
          )}
        </div>
        
        {approvedComments.length === 0 ? (
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
            {approvedComments.map(comment => renderComment(comment))}
          </div>
        )}
      </div>

      {/* Pending Comments (Moderator Only) */}
      {isModerator && pendingComments.length > 0 && (
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="text-orange-600">
              Comentários Pendentes ({pendingComments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingComments.map(comment => renderComment(comment))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
