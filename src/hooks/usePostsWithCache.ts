import { useState, useEffect, useCallback } from 'react';
import { Post } from '@/types/index';
import { api } from '@/services/api';
import { redisCache, CacheKeys, CacheTTL, CacheInvalidation } from '@/lib/redis-cache';

interface UsePostsWithCacheOptions {
  page?: number;
  limit?: number;
  forceRefresh?: boolean;
}

interface UsePostsWithCacheReturn {
  posts: Post[];
  loading: boolean;
  error: string | null;
  refetch: (forceRefresh?: boolean) => Promise<void>;
  invalidateCache: () => Promise<void>;
}

export function usePostsWithCache(options: UsePostsWithCacheOptions = {}): UsePostsWithCacheReturn {
  const { page = 1, limit = 10, forceRefresh = false } = options;
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cacheKey = CacheKeys.posts.list(page, limit);

  const fetchPosts = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);

    try {
      // Try cache first (unless force refresh)
      if (!forceRefresh) {
        const cached = await redisCache.get<Post[]>(cacheKey);
        if (cached) {
          setPosts(cached);
          setLoading(false);
          return;
        }
      }

      // Cache miss - fetch from API
      const response = await api.getPosts({ page, limit });
      const postsData = response.data || response;

      // Store in cache
      await redisCache.set(cacheKey, postsData, CacheTTL.posts);
      
      setPosts(postsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch posts';
      setError(errorMessage);
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, cacheKey]);

  const invalidateCache = useCallback(async () => {
    await CacheInvalidation.onPostCreate();
  }, []);

  useEffect(() => {
    fetchPosts(forceRefresh);
  }, [fetchPosts, forceRefresh]);

  return {
    posts,
    loading,
    error,
    refetch: fetchPosts,
    invalidateCache,
  };
}

// Hook for single post with cache
export function usePostWithCache(postId: string, forceRefresh = false) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cacheKey = CacheKeys.posts.detail(postId);

  const fetchPost = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);

    try {
      // Try cache first
      if (!forceRefresh) {
        const cached = await redisCache.get<Post>(cacheKey);
        if (cached) {
          setPost(cached);
          setLoading(false);
          return;
        }
      }

      // Cache miss - fetch from API
      const response = await api.getPost(postId);
      const postData = response.data || response;

      // Store in cache
      await redisCache.set(cacheKey, postData, CacheTTL.posts);
      
      setPost(postData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch post';
      setError(errorMessage);
      console.error('Error fetching post:', err);
    } finally {
      setLoading(false);
    }
  }, [postId, cacheKey]);

  useEffect(() => {
    if (postId) {
      fetchPost(forceRefresh);
    }
  }, [fetchPost, postId, forceRefresh]);

  return {
    post,
    loading,
    error,
    refetch: fetchPost,
  };
}

// Hook for public posts with cache
export function usePublicPostsWithCache(page = 1, forceRefresh = false) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cacheKey = CacheKeys.posts.public(page);

  const fetchPublicPosts = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);

    try {
      // Try cache first
      if (!forceRefresh) {
        const cached = await redisCache.get<Post[]>(cacheKey);
        if (cached) {
          setPosts(cached);
          setLoading(false);
          return;
        }
      }

      // Cache miss - fetch from API
      const response = await api.getPublicPosts({ page });
      const postsData = response.data || response;

      // Store in cache
      await redisCache.set(cacheKey, postsData, CacheTTL.posts);
      
      setPosts(postsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch public posts';
      setError(errorMessage);
      console.error('Error fetching public posts:', err);
    } finally {
      setLoading(false);
    }
  }, [page, cacheKey]);

  useEffect(() => {
    fetchPublicPosts(forceRefresh);
  }, [fetchPublicPosts, forceRefresh]);

  return {
    posts,
    loading,
    error,
    refetch: fetchPublicPosts,
  };
}
