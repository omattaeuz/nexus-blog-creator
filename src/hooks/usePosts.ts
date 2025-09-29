import { useState, useEffect, useCallback } from 'react';
import { api, type Post } from '@/services/api';
import { useAsyncOperation } from './useAsyncOperation';
import { useAuth } from '@/contexts/AuthContext';
import { logApi, logError } from '@/lib/logger';

interface UsePostsOptions {
  page?: number;
  limit?: number;
  search?: string;
  autoFetch?: boolean;
}

interface UsePostsReturn {
  posts: Post[];
  loading: boolean;
  error: string | null;
  total: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  fetchPosts: (options?: UsePostsOptions) => Promise<void>;
  refreshPosts: () => Promise<void>;
  goToPage: (page: number) => Promise<void>;
  searchPosts: (searchTerm: string) => Promise<void>;
  clearSearch: () => Promise<void>;
}

/**
 * Custom hook for managing posts with pagination and search
 * Provides a clean interface for posts management across components
 */
export function usePosts(initialOptions: UsePostsOptions = {}): UsePostsReturn {
  const { token } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(initialOptions.page || 1);
  const [searchTerm, setSearchTerm] = useState(initialOptions.search || '');
  const [limit] = useState(initialOptions.limit || 6);

  const fetchOperation = useAsyncOperation(
    async (options: UsePostsOptions = {}) => {
      const fetchOptions = {
        page: options.page || currentPage,
        limit: options.limit || limit,
        search: options.search !== undefined ? options.search : searchTerm,
        token: token, // Include authentication token
      };

      logApi('Fetching posts', { ...fetchOptions, hasToken: !!token });
      
      const response = await api.getPosts(fetchOptions);
      
      setPosts(response.posts);
      setTotal(response.total);
      setTotalPages(response.totalPages);
      setCurrentPage(response.page);
      
      if (options.search !== undefined) {
        setSearchTerm(options.search);
      }
      
      return response;
    },
    {
      onError: (error) => {
        logError('Failed to fetch posts', { error: error.message });
        setPosts([]);
        setTotal(0);
        setTotalPages(0);
      }
    }
  );

  const fetchPosts = useCallback(async (options: UsePostsOptions = {}) => {
    await fetchOperation.execute(options);
  }, [fetchOperation, currentPage, limit, searchTerm]);

  const refreshPosts = useCallback(async () => {
    await fetchPosts({ page: currentPage, search: searchTerm });
  }, [fetchPosts, currentPage, searchTerm]);

  const goToPage = useCallback(async (page: number) => {
    if (page >= 1 && page <= totalPages) {
      await fetchPosts({ page, search: searchTerm });
    }
  }, [fetchPosts, searchTerm, totalPages]);

  const searchPosts = useCallback(async (search: string) => {
    await fetchPosts({ page: 1, search });
  }, [fetchPosts]);

  const clearSearch = useCallback(async () => {
    await fetchPosts({ page: 1, search: '' });
  }, [fetchPosts]);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (initialOptions.autoFetch !== false) {
      fetchPosts(initialOptions);
    }
  }, []); // Only run on mount

  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  return {
    posts,
    loading: fetchOperation.isLoading,
    error: fetchOperation.error,
    total,
    totalPages,
    currentPage,
    hasNextPage,
    hasPreviousPage,
    fetchPosts,
    refreshPosts,
    goToPage,
    searchPosts,
    clearSearch,
  };
}
