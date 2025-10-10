import { useCommentsWithCache } from '@/hooks/useCommentsWithCache';
import type { Comment } from '@/types/analytics';

export interface CommentModeHandlerProps {
  mode: 'standalone' | 'controlled';
  postId: string;
  externalComments?: Comment[];
  externalOnAddComment?: (content: string, parentId?: string) => void;
  externalOnLikeComment?: (id: string) => void;
  externalOnReply?: (id: string, content: string) => void;
  externalOnModerate?: (id: string, approved: boolean) => void;
}

export function useCommentModeHandler({
  mode,
  postId,
  externalComments,
  externalOnAddComment,
  externalOnLikeComment,
  externalOnReply: _externalOnReply,
  externalOnModerate
}: CommentModeHandlerProps) {
  const cacheHook = mode === 'standalone' ? useCommentsWithCache(postId) : null;
  
  const comments = mode === 'controlled' ? (externalComments || []) : (cacheHook?.comments || []);
  const isLoading = mode === 'controlled' ? false : (cacheHook?.loading || false);
  const error = mode === 'controlled' ? null : (cacheHook?.error || null);
  
  const createComment = mode === 'controlled' 
    ? async (data: any) => externalOnAddComment?.(data.content, data.parentId)
    : (cacheHook?.createComment || (() => Promise.reject('Cache hook not available')));
    
  const updateComment = mode === 'controlled' 
    ? async (_id: string, _content: string) => {
        console.warn('Update not supported in controlled mode');
      }
    : (cacheHook?.updateComment || (() => Promise.reject('Cache hook not available')));
    
  const deleteComment = mode === 'controlled' 
    ? async (_id: string) => {
        console.warn('Delete not supported in controlled mode');
      }
    : (cacheHook?.deleteComment || (() => Promise.reject('Cache hook not available')));
    
  const likeComment = mode === 'controlled'
    ? async (id: string) => externalOnLikeComment?.(id)
    : (cacheHook?.likeComment || (() => Promise.reject('Cache hook not available')));
    
  const moderateComment = mode === 'controlled' 
    ? async (id: string, approved: boolean) => externalOnModerate?.(id, approved)
    : (cacheHook?.moderateComment || (() => Promise.reject('Cache hook not available')));

  return {
    comments,
    isLoading,
    error,
    createComment,
    updateComment,
    deleteComment,
    likeComment,
    moderateComment
  };
}