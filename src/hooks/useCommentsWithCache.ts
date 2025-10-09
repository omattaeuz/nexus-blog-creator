import { useState, useEffect, useCallback } from 'react';
import { Comment } from '@/services/comments';
import { commentService } from '@/services/comments';
import { redisCache, CacheKeys, CacheTTL, CacheInvalidation } from '@/lib/redis-cache';

interface UseCommentsWithCacheReturn {
  comments: Comment[];
  loading: boolean;
  error: string | null;
  createComment: (data: any) => Promise<Comment>;
  updateComment: (id: string, content: string) => Promise<Comment>;
  deleteComment: (id: string) => Promise<void>;
  likeComment: (id: string) => Promise<Comment>;
  moderateComment: (id: string, approved: boolean) => Promise<Comment>;
  refetch: (forceRefresh?: boolean) => Promise<void>;
  invalidateCache: () => Promise<void>;
}

export function useCommentsWithCache(postId: string): UseCommentsWithCacheReturn {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cacheKey = CacheKeys.comments.list(postId);

  const fetchComments = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);

    try {
      // Try cache first
      if (!forceRefresh) {
        const cached = await redisCache.get<Comment[]>(cacheKey);
        if (cached) {
          setComments(cached);
          setLoading(false);
          return;
        }
      }

      // Cache miss - fetch from service
      const commentsData = await commentService.getComments(postId);

      // Store in cache
      await redisCache.set(cacheKey, commentsData, CacheTTL.comments);
      
      setComments(commentsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch comments';
      setError(errorMessage);
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  }, [postId, cacheKey]);

  const createComment = useCallback(async (data: any): Promise<Comment> => {
    try {
      const newComment = await commentService.createComment(data);
      
      // Invalidate cache and refetch
      await CacheInvalidation.onCommentAdd(postId);
      await fetchComments(true);
      
      return newComment;
    } catch (err) {
      console.error('Error creating comment:', err);
      throw err;
    }
  }, [postId, fetchComments]);

  const updateComment = useCallback(async (id: string, content: string): Promise<Comment> => {
    try {
      const updatedComment = await commentService.updateComment(id, content);
      
      // Invalidate cache and refetch
      await CacheInvalidation.onCommentUpdate(postId);
      await fetchComments(true);
      
      return updatedComment;
    } catch (err) {
      console.error('Error updating comment:', err);
      throw err;
    }
  }, [postId, fetchComments]);

  const deleteComment = useCallback(async (id: string): Promise<void> => {
    try {
      await commentService.deleteComment(id);
      
      // Invalidate cache and refetch
      await CacheInvalidation.onCommentDelete(postId);
      await fetchComments(true);
    } catch (err) {
      console.error('Error deleting comment:', err);
      throw err;
    }
  }, [postId, fetchComments]);

  const likeComment = useCallback(async (id: string): Promise<Comment> => {
    try {
      const likedComment = await commentService.likeComment(id);
      
      // Update local state immediately for better UX
      setComments(prev => prev.map(comment => 
        comment.id === id ? { ...comment, likes: likedComment.likes } : comment
      ));
      
      // Update cache
      await redisCache.set(cacheKey, comments, CacheTTL.comments);
      
      return likedComment;
    } catch (err) {
      console.error('Error liking comment:', err);
      throw err;
    }
  }, [postId, comments, cacheKey]);

  const moderateComment = useCallback(async (id: string, approved: boolean): Promise<Comment> => {
    try {
      const moderatedComment = await commentService.moderateComment(id, approved);
      
      // Invalidate cache and refetch
      await CacheInvalidation.onCommentUpdate(postId);
      await fetchComments(true);
      
      return moderatedComment;
    } catch (err) {
      console.error('Error moderating comment:', err);
      throw err;
    }
  }, [postId, fetchComments]);

  const invalidateCache = useCallback(async () => {
    await CacheInvalidation.onCommentAdd(postId);
  }, [postId]);

  useEffect(() => {
    if (postId) {
      fetchComments();
    }
  }, [fetchComments, postId]);

  return {
    comments,
    loading,
    error,
    createComment,
    updateComment,
    deleteComment,
    likeComment,
    moderateComment,
    refetch: fetchComments,
    invalidateCache,
  };
}
