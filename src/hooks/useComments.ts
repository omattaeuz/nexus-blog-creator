import { useState, useEffect, useCallback } from 'react';
import { commentService, Comment, CreateCommentData } from '@/services/comments';

export interface UseCommentsReturn {
  comments: Comment[];
  isLoading: boolean;
  error: string | null;
  createComment: (data: CreateCommentData) => Promise<void>;
  updateComment: (id: string, content: string) => Promise<void>;
  deleteComment: (id: string) => Promise<void>;
  likeComment: (id: string) => Promise<void>;
  moderateComment: (id: string, approved: boolean) => Promise<void>;
  refreshComments: () => Promise<void>;
}

export function useComments(postId: string): UseCommentsReturn {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadComments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const commentList = await commentService.getComments(postId);
      setComments(commentList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar comentários');
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  const createComment = useCallback(async (data: CreateCommentData) => {
    try {
      setError(null);
      await commentService.createComment(data);
      await loadComments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar comentário');
    }
  }, [loadComments]);

  const updateComment = useCallback(async (id: string, content: string) => {
    try {
      setError(null);
      await commentService.updateComment(id, content);
      await loadComments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar comentário');
    }
  }, [loadComments]);

  const deleteComment = useCallback(async (id: string) => {
    try {
      setError(null);
      await commentService.deleteComment(id);
      await loadComments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar comentário');
    }
  }, [loadComments]);

  const likeComment = useCallback(async (id: string) => {
    try {
      setError(null);
      await commentService.likeComment(id);
      await loadComments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao curtir comentário');
    }
  }, [loadComments]);

  const moderateComment = useCallback(async (id: string, approved: boolean) => {
    try {
      setError(null);
      await commentService.moderateComment(id, approved);
      await loadComments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao moderar comentário');
    }
  }, [loadComments]);

  const refreshComments = useCallback(async () => {
    await loadComments();
  }, [loadComments]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  return {
    comments,
    isLoading,
    error,
    createComment,
    updateComment,
    deleteComment,
    likeComment,
    moderateComment,
    refreshComments
  };
}
