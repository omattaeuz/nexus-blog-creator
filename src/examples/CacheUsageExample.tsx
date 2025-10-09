/**
 * Example of how to use Redis Cache in components
 * This file demonstrates the Cache-Aside Pattern implementation
 */

import { usePostsWithCache } from '@/hooks/usePostsWithCache';
import { useCommentsWithCache } from '@/hooks/useCommentsWithCache';
import { useAnalyticsWithCache } from '@/hooks/useAnalyticsWithCache';
import { CacheInvalidation } from '@/lib/redis-cache';

// Example 1: Posts with Cache
export function PostsWithCacheExample() {
  const { posts, loading, error, refetch, invalidateCache } = usePostsWithCache({
    page: 1,
    limit: 10,
    forceRefresh: false // Use cache first
  });

  const handleCreatePost = async (postData: any) => {
    // Create post via API
    await api.createPost(postData);
    
    // Invalidate cache to ensure fresh data
    await invalidateCache();
    
    // Refetch with fresh data
    await refetch(true);
  };

  return (
    <div>
      {loading && <p>Loading posts...</p>}
      {error && <p>Error: {error}</p>}
      {posts.map(post => (
        <div key={post.id}>{post.title}</div>
      ))}
    </div>
  );
}

// Example 2: Comments with Cache
export function CommentsWithCacheExample({ postId }: { postId: string }) {
  const {
    comments,
    loading,
    error,
    createComment,
    likeComment,
    invalidateCache
  } = useCommentsWithCache(postId);

  const handleAddComment = async (content: string) => {
    try {
      // This automatically invalidates cache and refetches
      await createComment({
        postId,
        content,
        author: 'User',
        authorEmail: 'user@example.com'
      });
    } catch (error) {
      console.error('Failed to create comment:', error);
    }
  };

  const handleLike = async (commentId: string) => {
    try {
      // This updates cache optimistically
      await likeComment(commentId);
    } catch (error) {
      console.error('Failed to like comment:', error);
    }
  };

  return (
    <div>
      {loading && <p>Loading comments...</p>}
      {error && <p>Error: {error}</p>}
      {comments.map(comment => (
        <div key={comment.id}>
          <p>{comment.content}</p>
          <button onClick={() => handleLike(comment.id)}>
            Like ({comment.likes})
          </button>
        </div>
      ))}
    </div>
  );
}

// Example 3: Analytics with Cache
export function AnalyticsWithCacheExample({ posts }: { posts: any[] }) {
  const {
    stats,
    postAnalytics,
    loading,
    error,
    refetch,
    invalidateCache
  } = useAnalyticsWithCache(posts);

  const handleRefreshAnalytics = async () => {
    // Force refresh analytics (expensive operation)
    await refetch(true);
  };

  return (
    <div>
      {loading && <p>Loading analytics...</p>}
      {error && <p>Error: {error}</p>}
      {stats && (
        <div>
          <h3>Dashboard Stats</h3>
          <p>Total Posts: {stats.totalPosts}</p>
          <p>Total Views: {stats.totalViews}</p>
          <p>Total Comments: {stats.totalComments}</p>
          <p>Total Likes: {stats.totalLikes}</p>
        </div>
      )}
    </div>
  );
}

// Example 4: Manual Cache Management
export function ManualCacheExample() {
  const handleClearAllCache = async () => {
    // Clear all cache
    await CacheInvalidation.onPostCreate();
  };

  const handleInvalidateSpecificCache = async (postId: string) => {
    // Invalidate specific post cache
    await CacheInvalidation.onPostUpdate(postId);
  };

  return (
    <div>
      <button onClick={handleClearAllCache}>
        Clear All Cache
      </button>
      <button onClick={() => handleInvalidateSpecificCache('post-123')}>
        Invalidate Post Cache
      </button>
    </div>
  );
}

// Example 5: Cache with Error Handling
export function CacheWithErrorHandlingExample() {
  const { posts, loading, error, refetch } = usePostsWithCache({
    page: 1,
    limit: 10
  });

  const handleRetry = async () => {
    try {
      await refetch(true); // Force refresh
    } catch (error) {
      console.error('Retry failed:', error);
      // Handle retry failure
    }
  };

  if (error) {
    return (
      <div>
        <p>Error loading posts: {error}</p>
        <button onClick={handleRetry}>Retry</button>
      </div>
    );
  }

  return (
    <div>
      {loading && <p>Loading...</p>}
      {posts.map(post => (
        <div key={post.id}>{post.title}</div>
      ))}
    </div>
  );
}

/**
 * Cache Performance Tips:
 * 
 * 1. Use appropriate TTL values:
 *    - Posts: 5 minutes (frequently updated)
 *    - Analytics: 10 minutes (expensive to calculate)
 *    - Comments: 2 minutes (real-time feel)
 *    - User data: 30 minutes (rarely changes)
 * 
 * 2. Invalidate cache strategically:
 *    - On create/update/delete operations
 *    - When data relationships change
 *    - On user actions that affect data
 * 
 * 3. Use optimistic updates for better UX:
 *    - Update UI immediately
 *    - Sync with server in background
 *    - Rollback on failure
 * 
 * 4. Monitor cache performance:
 *    - Track hit/miss ratios
 *    - Monitor memory usage
 *    - Check Redis connection health
 * 
 * 5. Handle cache failures gracefully:
 *    - Fallback to API calls
 *    - Show appropriate error messages
 *    - Retry mechanisms
 */
