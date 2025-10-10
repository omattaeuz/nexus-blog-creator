import { useState } from 'react';
import { Comment } from '@/types/analytics';
import { CommentFactory } from '@/lib/comment-factory';
import CommentsSection from '@/components/CommentsSection';
import { COMMENT_MODES } from '@/lib/constants';

export interface DashboardCommentsProps {
  postId: string;
  isAuthenticated: boolean;
  currentUser?: {
    name?: string;
    email?: string;
  };
}

export default function DashboardComments({ 
  postId, 
  isAuthenticated, 
  currentUser 
}: DashboardCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);

  const handleAddComment = (content: string, parentId?: string) => {
    const newComment = CommentFactory.createComment({
      postId,
      content,
      author: currentUser?.name || 'Usuário',
      authorEmail: currentUser?.email || 'usuario@example.com',
      parentId
    });
    
    setComments(prev => [...prev, newComment]);
  };

  const handleLikeComment = (commentId: string) => {
    setComments(prev => prev.map(comment => 
      comment.id === commentId 
        ? { ...comment, likes: comment.likes + 1 }
        : comment
    ));
  };

  const handleReply = (commentId: string, content: string) => {
    const newReply = CommentFactory.createReply({
      postId,
      content,
      author: currentUser?.name || 'Usuário',
      authorEmail: currentUser?.email || 'usuario@example.com',
      parentCommentId: commentId
    });
    
    setComments(prev => prev.map(comment => 
      comment.id === commentId 
        ? { ...comment, replies: [...comment.replies, newReply] }
        : comment
    ));
  };

  const handleModerate = (commentId: string, approved: boolean) => {
    setComments(prev => prev.map(comment => 
      comment.id === commentId 
        ? { ...comment, approved }
        : comment
    ));
  };

  return (
    <CommentsSection
      postId={postId}
      isAuthenticated={isAuthenticated}
      currentUser={currentUser ? {
        name: currentUser.name || 'Usuário',
        email: currentUser.email || 'usuario@example.com'
      } : undefined}
      comments={comments}
      onAddComment={handleAddComment}
      onLikeComment={handleLikeComment}
      onReply={handleReply}
      onModerate={handleModerate}
      mode={COMMENT_MODES.CONTROLLED}
    />
  );
}