import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MessageCircle, 
  Heart, 
  Reply, 
  Check,
  X,
  Flag
} from 'lucide-react';
import { Comment } from '@/services/comments';
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
    <Card key={comment.id} className={`${isReply ? 'ml-8 border-l-2 border-l-cyan-400/50' : ''} bg-slate-800/50 backdrop-blur-md border-slate-700/50 shadow-2xl`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.author}`} />
            <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">{comment.author.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm text-white">{comment.author}</span>
              <span className="text-xs text-gray-400">
                {formatDistanceToNow(new Date(comment.createdAt), { 
                  addSuffix: true, 
                  locale: ptBR 
                })}
              </span>
              {!comment.approved && (
                <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/50 text-xs">
                  Pendente
                </Badge>
              )}
            </div>
            
            <p className="text-sm text-gray-300">{comment.content}</p>
            
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onLikeComment(comment.id)}
                className="h-6 px-2 text-gray-400 hover:text-red-400 hover:bg-slate-700/50"
              >
                <Heart className="h-3 w-3 mr-1" />
                {comment.likes}
              </Button>
              
              {!isReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReplyingTo(comment.id)}
                  className="h-6 px-2 text-gray-400 hover:text-cyan-400 hover:bg-slate-700/50"
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
                  className="h-6 px-2 text-gray-400 hover:text-blue-400 hover:bg-slate-700/50"
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
                    className="h-6 w-6 p-0 text-green-400 hover:bg-green-500/20"
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onModerate(comment.id, false)}
                    className="h-6 w-6 p-0 text-red-400 hover:bg-red-500/20"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-gray-400 hover:bg-slate-700/50"
                  >
                    <Flag className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
            
            {replyingTo === comment.id && (
              <div className="mt-3 space-y-2">
                <Textarea
                  placeholder="Escreva sua resposta..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="min-h-[80px] bg-slate-700/50 border-slate-600/50 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400/20"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleReply(comment.id)}
                    disabled={!replyContent.trim()}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
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
                    className="border-slate-600/50 text-gray-300 hover:bg-slate-700/50 hover:text-white"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
            
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
      <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50 shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <MessageCircle className="h-5 w-5 text-cyan-400" />
            Deixe um comentário
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitComment} className="space-y-4">
            <Textarea
              placeholder="Compartilhe seus pensamentos..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[100px] bg-slate-700/50 border-slate-600/50 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400/20"
            />
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={!newComment.trim()}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
              >
                Comentar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">
            Comentários ({approvedComments.length})
          </h3>
          {isModerator && pendingComments.length > 0 && (
            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/50">
              {pendingComments.length} pendentes
            </Badge>
          )}
        </div>
        
        {approvedComments.length === 0 ? (
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
            {approvedComments.map(comment => renderComment(comment))}
          </div>
        )}
      </div>

      {isModerator && pendingComments.length > 0 && (
        <Card className="bg-slate-800/50 backdrop-blur-md border-orange-500/50 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-orange-400 flex items-center gap-2">
              <Flag className="h-5 w-5" />
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