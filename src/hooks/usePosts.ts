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
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startItem: number;
  endItem: number;
  fetchPosts: (options?: UsePostsOptions) => Promise<void>;
  refreshPosts: () => Promise<void>;
  goToPage: (page: number) => Promise<void>;
  goToFirstPage: () => Promise<void>;
  goToLastPage: () => Promise<void>;
  goToNextPage: () => Promise<void>;
  goToPreviousPage: () => Promise<void>;
  searchPosts: (searchTerm: string) => Promise<void>;
  clearSearch: () => Promise<void>;
  setItemsPerPage: (limit: number) => Promise<void>;
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
  const [limit, setLimit] = useState(initialOptions.limit || 6);
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
      
      if (options.search !== undefined) setSearchTerm(options.search);
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
    await fetchPosts({ page: currentPage, limit: limit, search: searchTerm });
  }, [fetchPosts, currentPage, limit, searchTerm]);

  const goToPage = useCallback(async (page: number) => {
    if (page >= 1 && page <= totalPages) await fetchPosts({ page, limit: limit, search: searchTerm });
  }, [fetchPosts, limit, searchTerm, totalPages]);

  const searchPosts = useCallback(async (search: string) => {
    await fetchPosts({ page: 1, limit: limit, search });
  }, [fetchPosts, limit]);

  const clearSearch = useCallback(async () => {
    await fetchPosts({ page: 1, limit: limit, search: '' });
  }, [fetchPosts, limit]);

  const goToFirstPage = useCallback(async () => {
    await fetchPosts({ page: 1, limit: limit, search: searchTerm });
  }, [fetchPosts, limit, searchTerm]);

  const goToLastPage = useCallback(async () => {
    await fetchPosts({ page: totalPages, limit: limit, search: searchTerm });
  }, [fetchPosts, limit, searchTerm, totalPages]);

  const goToNextPage = useCallback(async () => {
    if (currentPage < totalPages) {
      await fetchPosts({ page: currentPage + 1, limit: limit, search: searchTerm });
    }
  }, [fetchPosts, currentPage, limit, totalPages, searchTerm]);

  const goToPreviousPage = useCallback(async () => {
    if (currentPage > 1) {
      await fetchPosts({ page: currentPage - 1, limit: limit, search: searchTerm });
    }
  }, [fetchPosts, currentPage, limit, searchTerm]);

  const setItemsPerPage = useCallback(async (newLimit: number) => {
    setLimit(newLimit);
    setCurrentPage(1); // Reset to first page when changing items per page
    await fetchPosts({ page: 1, limit: newLimit, search: searchTerm });
  }, [fetchPosts, searchTerm]);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (initialOptionsRef.current.autoFetch !== false) fetchPosts(initialOptionsRef.current);
  }, []); // Only run on mount

  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;
  const startItem = total > 0 ? (currentPage - 1) * limit + 1 : 0;
  const endItem = Math.min(currentPage * limit, total);

  return {
    posts,
    loading: isLoading,
    error,
    total,
    totalPages,
    currentPage,
    itemsPerPage: limit,
    hasNextPage,
    hasPreviousPage,
    startItem,
    endItem,
    fetchPosts,
    refreshPosts,
    goToPage,
    goToFirstPage,
    goToLastPage,
    goToNextPage,
    goToPreviousPage,
    searchPosts,
    clearSearch,
    setItemsPerPage,
  };
}