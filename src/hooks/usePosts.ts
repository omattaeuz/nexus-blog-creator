import { useState, useEffect, useCallback, useRef } from 'react';
import { api, type Post } from '@/services/api';
import { useAuth } from '@/contexts/useAuth';
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use ref to store the latest values without causing re-renders
  const currentPageRef = useRef(currentPage);
  const searchTermRef = useRef(searchTerm);
  const limitRef = useRef(limit);
  const tokenRef = useRef(token);
  const initialOptionsRef = useRef(initialOptions);

  // Update refs when values change
  currentPageRef.current = currentPage;
  searchTermRef.current = searchTerm;
  limitRef.current = limit;
  tokenRef.current = token;
  initialOptionsRef.current = initialOptions;

  const fetchPosts = useCallback(async (options: UsePostsOptions = {}) => {
    try {
      setIsLoading(true);
      setError(null);

      const fetchOptions = {
        page: options.page || currentPageRef.current,
        limit: options.limit || limitRef.current,
        search: options.search !== undefined ? options.search : searchTermRef.current,
        token: tokenRef.current,
      };

      logApi('Fetching posts', { ...fetchOptions, hasToken: !!tokenRef.current });
      
      const response = await api.getPosts(fetchOptions);
      
      setPosts(response.posts);
      setTotal(response.total);
      setTotalPages(response.totalPages);
      setCurrentPage(response.page);
      
      if (options.search !== undefined) {
        setSearchTerm(options.search);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch posts';
      logError('Failed to fetch posts', { error: errorMessage });
      setError(errorMessage);
      setPosts([]);
      setTotal(0);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

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
    if (initialOptionsRef.current.autoFetch !== false) {
      fetchPosts(initialOptionsRef.current);
    }
  }, []); // Only run on mount

  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  return {
    posts,
    loading: isLoading,
    error,
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
