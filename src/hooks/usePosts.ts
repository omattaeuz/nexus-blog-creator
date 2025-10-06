import { useState, useEffect, useCallback, useRef } from 'react';
import { api, type Post } from '@/services/api';
import { useAuth } from '@/contexts/useAuth';
import { logApi, logError } from '@/lib/logger';

export interface FilterOptions {
  sortBy: 'created_at' | 'title' | 'updated_at';
  sortOrder: 'asc' | 'desc';
  dateFrom?: Date;
  dateTo?: Date;
  itemsPerPage: number;
}

interface UsePostsOptions {
  page?: number;
  limit?: number;
  search?: string;
  autoFetch?: boolean;
  filters?: FilterOptions;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
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
  filters: FilterOptions;
  isAutoRefreshing: boolean;
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
  updateFilters: (filters: FilterOptions) => Promise<void>;
  clearFilters: () => Promise<void>;
  startAutoRefresh: () => void;
  stopAutoRefresh: () => void;
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
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>(
    initialOptions.filters || {
      sortBy: 'created_at',
      sortOrder: 'desc',
      itemsPerPage: 6
    }
  );

  // Auto-refresh state
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(initialOptions.autoRefresh ?? true);
  const [refreshInterval, _setRefreshInterval] = useState(initialOptions.refreshInterval || 30000); // 30 seconds default
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Use ref to store the latest values without causing re-renders
  const currentPageRef = useRef(currentPage);
  const searchTermRef = useRef(searchTerm);
  const limitRef = useRef(limit);
  const filtersRef = useRef(filters);
  const tokenRef = useRef(token);
  const initialOptionsRef = useRef(initialOptions);

  // Update refs when values change
  currentPageRef.current = currentPage;
  searchTermRef.current = searchTerm;
  limitRef.current = limit;
  filtersRef.current = filters;
  tokenRef.current = token;
  initialOptionsRef.current = initialOptions;

  const fetchPosts = useCallback(async (options: UsePostsOptions = {}) => {
    try {
      setIsLoading(true);
      setError(null);

      const currentFilters = options.filters || filtersRef.current;
      const fetchOptions = {
        page: options.page || currentPageRef.current,
        limit: options.limit || limitRef.current,
        search: options.search !== undefined ? options.search : searchTermRef.current,
        token: tokenRef.current,
        filters: currentFilters,
      };

      logApi('Fetching posts', { ...fetchOptions, hasToken: !!tokenRef.current });
      
      const response = await api.getPosts(fetchOptions);
      
      setPosts(response.posts);
      setTotal(response.total);
      setTotalPages(response.totalPages);
      setCurrentPage(response.page);
      
      if (options.search !== undefined) setSearchTerm(options.search);
      if (options.filters) setFilters(options.filters);
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
    await fetchPosts({ page: currentPage, limit: limit, search: searchTerm, filters });
  }, [fetchPosts, currentPage, limit, searchTerm, filters]);

  const goToPage = useCallback(async (page: number) => {
    if (page >= 1 && page <= totalPages) await fetchPosts({ page, limit: limit, search: searchTerm, filters });
  }, [fetchPosts, limit, searchTerm, totalPages, filters]);

  const searchPosts = useCallback(async (search: string) => {
    await fetchPosts({ page: 1, limit: limit, search, filters });
  }, [fetchPosts, limit, filters]);

  const clearSearch = useCallback(async () => {
    await fetchPosts({ page: 1, limit: limit, search: '', filters });
  }, [fetchPosts, limit, filters]);

  const goToFirstPage = useCallback(async () => {
    await fetchPosts({ page: 1, limit: limit, search: searchTerm, filters });
  }, [fetchPosts, limit, searchTerm, filters]);

  const goToLastPage = useCallback(async () => {
    await fetchPosts({ page: totalPages, limit: limit, search: searchTerm, filters });
  }, [fetchPosts, limit, searchTerm, totalPages, filters]);

  const goToNextPage = useCallback(async () => {
    if (currentPage < totalPages) {
      await fetchPosts({ page: currentPage + 1, limit: limit, search: searchTerm, filters });
    }
  }, [fetchPosts, currentPage, limit, totalPages, searchTerm, filters]);

  const goToPreviousPage = useCallback(async () => {
    if (currentPage > 1) {
      await fetchPosts({ page: currentPage - 1, limit: limit, search: searchTerm, filters });
    }
  }, [fetchPosts, currentPage, limit, searchTerm, filters]);

  const setItemsPerPage = useCallback(async (newLimit: number) => {
    setLimit(newLimit);
    setCurrentPage(1); // Reset to first page when changing items per page
    await fetchPosts({ page: 1, limit: newLimit, search: searchTerm, filters });
  }, [fetchPosts, searchTerm, filters]);

  const updateFilters = useCallback(async (newFilters: FilterOptions) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when changing filters
    await fetchPosts({ page: 1, limit: limit, search: searchTerm, filters: newFilters });
  }, [fetchPosts, limit, searchTerm]);

  const clearFilters = useCallback(async () => {
    const defaultFilters: FilterOptions = {
      sortBy: 'created_at',
      sortOrder: 'desc',
      itemsPerPage: 6
    };
    setFilters(defaultFilters);
    setCurrentPage(1);
    await fetchPosts({ page: 1, limit: limit, search: searchTerm, filters: defaultFilters });
  }, [fetchPosts, limit, searchTerm]);

  // Auto-refresh functions
  const startAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    setAutoRefreshEnabled(true);
    setIsAutoRefreshing(true);
    
    intervalRef.current = setInterval(async () => {
      try {
        await fetchPosts({ 
          page: currentPageRef.current, 
          limit: limitRef.current, 
          search: searchTermRef.current, 
          filters: filtersRef.current 
        });
      } catch (error) {
        logError('Auto-refresh failed', { error: error instanceof Error ? error.message : 'Unknown error' });
      }
    }, refreshInterval);
    
    logApi('Auto-refresh started', { interval: refreshInterval });
  }, [fetchPosts, refreshInterval]);

  const stopAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    setAutoRefreshEnabled(false);
    setIsAutoRefreshing(false);
    
    logApi('Auto-refresh stopped');
  }, []);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (initialOptionsRef.current.autoFetch !== false) fetchPosts(initialOptionsRef.current);
  }, [fetchPosts]); // Include fetchPosts in dependencies

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefreshEnabled && !isLoading) {
      startAutoRefresh();
    } else {
      stopAutoRefresh();
    }

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefreshEnabled, isLoading, startAutoRefresh, stopAutoRefresh]);

  // Pause auto-refresh when user is interacting (optional enhancement)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopAutoRefresh();
      } else if (autoRefreshEnabled) {
        startAutoRefresh();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [autoRefreshEnabled, startAutoRefresh, stopAutoRefresh]);

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
    filters,
    isAutoRefreshing,
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
    updateFilters,
    clearFilters,
    startAutoRefresh,
    stopAutoRefresh,
  };
}