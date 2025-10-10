import { useState, useEffect, useCallback } from 'react';
import { Post } from '@/types/index';
import { api } from '@/services/api';
import { redisCache, CacheKeys, CacheTTL, CacheInvalidation } from '@/lib/redis-cache';
import { useAuth } from '@/contexts/useAuth';
import { ERROR_MESSAGES } from '@/lib/constants';

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
  invalidatePostCache: (postId: string) => Promise<void>;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalPosts: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export function usePostsWithCache(options: UsePostsWithCacheOptions = {}): UsePostsWithCacheReturn {
  const { page = 1, limit = 10, forceRefresh = false } = options;
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: page,
    totalPages: 1,
    totalPosts: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const { token } = useAuth();

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
      const response = await api.getPosts({ page, limit, token });
      const postsData = Array.isArray(response) ? response : (response.posts || []);
      const totalPosts = response.total || postsData.length;
      const totalPages = response.totalPages || Math.ceil(totalPosts / limit);

      // Store in cache
      await redisCache.set(cacheKey, postsData, CacheTTL.posts);
      
      setPosts(postsData);
      setPagination({
        currentPage: page,
        totalPages,
        totalPosts,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : ERROR_MESSAGES.NETWORK_ERROR;
      setError(errorMessage);
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, cacheKey, token]);

  const invalidateCache = useCallback(async () => {
    await CacheInvalidation.onPostCreate();
  }, []);

  const invalidatePostCache = useCallback(async (postId: string) => {
    await CacheInvalidation.onPostDelete(postId);
  }, []);

  useEffect(() => {
    fetchPosts(forceRefresh);
  }, [fetchPosts, forceRefresh]);

  useEffect(() => {
    setPagination(prev => ({
      ...prev,
      currentPage: page,
    }));
  }, [page]);

  return {
    posts,
    loading,
    error,
    refetch: fetchPosts,
    invalidateCache,
    invalidatePostCache,
    pagination,
  };
}

export function usePostWithCache(postId: string, forceRefresh = false) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cacheKey = CacheKeys.posts.detail(postId);

  const fetchPost = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);

    try {
      if (!forceRefresh) {
        const cached = await redisCache.get<Post>(cacheKey);
        if (cached) {
          setPost(cached);
          setLoading(false);
          return;
        }
      }

      const response = await api.getPost(postId);
      const postData = response;

      await redisCache.set(cacheKey, postData, CacheTTL.posts);
      
      setPost(postData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : ERROR_MESSAGES.NETWORK_ERROR;
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

export function usePublicPostsWithCache(page = 1, forceRefresh = false) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cacheKey = CacheKeys.posts.public(page);

  const fetchPublicPosts = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);

    try {
      if (!forceRefresh) {
        const cached = await redisCache.get<Post[]>(cacheKey);
        if (cached) {
          setPosts(cached);
          setLoading(false);
          return;
        }
      }

      const response = await api.getPublicPosts(page, 10);
      const postsData = Array.isArray(response) ? response : (response.data || []);

      await redisCache.set(cacheKey, postsData, CacheTTL.posts);
      
      setPosts(postsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : ERROR_MESSAGES.NETWORK_ERROR;
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