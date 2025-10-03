import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

// Suppress React Testing Library warnings for this test file
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: An update to TestComponent inside a test was not wrapped in act')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Mock do api
vi.mock('../../services/api', () => ({
  api: {
    getPosts: vi.fn(),
    getPost: vi.fn(),
    createPost: vi.fn(),
    updatePost: vi.fn(),
    deletePost: vi.fn(),
  },
}));

// Mock do useAuth
vi.mock('../../contexts/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: null,
    token: 'test-token',
    isAuthenticated: true,
  })),
}));

// Mock do logger
vi.mock('../../lib/logger', () => ({
  logApi: vi.fn(),
  logError: vi.fn(),
}));

// Mock timers
vi.useFakeTimers();

describe('usePosts', () => {
  const mockPosts = [
    { id: '1', title: 'Post 1', content: 'Content 1', created_at: '2024-01-01T00:00:00Z' },
    { id: '2', title: 'Post 2', content: 'Content 2', created_at: '2024-01-02T00:00:00Z' },
  ];

  const mockResponse = {
    posts: mockPosts,
    total: 2,
    page: 1,
    totalPages: 1,
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const { api } = vi.mocked(await import('../../services/api'));
    api.getPosts.mockResolvedValue(mockResponse);
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.useFakeTimers();
  });

  it('should have usePosts hook available', async () => {
    const { usePosts } = await import('../usePosts');
    expect(typeof usePosts).toBe('function');
  });

  it('should initialize with default values', async () => {
    const { usePosts } = await import('../usePosts');
    const { result } = renderHook(() => usePosts({ autoFetch: false, autoRefresh: false }));

    expect(result.current.posts).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.total).toBe(0);
    expect(result.current.currentPage).toBe(1);
    expect(result.current.filters).toEqual({
      sortBy: 'created_at',
      sortOrder: 'desc',
      itemsPerPage: 6,
    });
    expect(result.current.isAutoRefreshing).toBe(false);
  });

  it('should handle search functionality', async () => {
    const { usePosts } = await import('../usePosts');
    const { result } = renderHook(() => usePosts({ autoFetch: false }));

    await act(async () => {
      await result.current.searchPosts('test search');
    });

    const { api } = vi.mocked(await import('../../services/api'));
    expect(api.getPosts).toHaveBeenCalledWith({
      page: 1,
      limit: 6,
      search: 'test search',
      token: 'test-token',
      filters: {
        sortBy: 'created_at',
        sortOrder: 'desc',
        itemsPerPage: 6,
      },
    });
  });

  it('should handle filter updates', async () => {
    const { usePosts } = await import('../usePosts');
    const { result } = renderHook(() => usePosts({ autoFetch: false }));

    const newFilters = {
      sortBy: 'title' as const,
      sortOrder: 'asc' as const,
      dateFrom: new Date('2024-01-01'),
      dateTo: new Date('2024-01-31'),
      itemsPerPage: 12,
    };

    await act(async () => {
      await result.current.updateFilters(newFilters);
    });

    const { api } = vi.mocked(await import('../../services/api'));
    expect(api.getPosts).toHaveBeenCalledWith({
      page: 1,
      limit: 6,
      search: '',
      token: 'test-token',
      filters: newFilters,
    });

    expect(result.current.filters).toEqual(newFilters);
  });

  it('should handle clear filters', async () => {
    const { usePosts } = await import('../usePosts');
    const { result } = renderHook(() => usePosts({ autoFetch: false }));

    // First set some filters
    const customFilters = {
      sortBy: 'title' as const,
      sortOrder: 'asc' as const,
      itemsPerPage: 12,
    };

    await act(async () => {
      await result.current.updateFilters(customFilters);
    });

    // Then clear them
    await act(async () => {
      await result.current.clearFilters();
    });

    expect(result.current.filters).toEqual({
      sortBy: 'created_at',
      sortOrder: 'desc',
      itemsPerPage: 6,
    });
  });

  it('should handle pagination', async () => {
    const { usePosts } = await import('../usePosts');
    const { result } = renderHook(() => usePosts({ autoFetch: false, autoRefresh: false }));

    // Test that pagination functions exist and can be called
    expect(typeof result.current.goToPage).toBe('function');
    expect(typeof result.current.goToNextPage).toBe('function');
    expect(typeof result.current.goToPreviousPage).toBe('function');
    expect(typeof result.current.goToFirstPage).toBe('function');
    expect(typeof result.current.goToLastPage).toBe('function');

    // Test that pagination functions can be called without throwing
    expect(() => {
      result.current.goToPage(2);
    }).not.toThrow();
  });

  it('should handle auto-refresh functionality', async () => {
    const { usePosts } = await import('../usePosts');
    const { result } = renderHook(() => 
      usePosts({ 
        autoFetch: false, 
        autoRefresh: true, 
        refreshInterval: 1000 
      })
    );

    // Test start auto-refresh
    act(() => {
      result.current.startAutoRefresh();
    });

    expect(result.current.isAutoRefreshing).toBe(true);

    // Test stop auto-refresh
    act(() => {
      result.current.stopAutoRefresh();
    });

    expect(result.current.isAutoRefreshing).toBe(false);
  });

  it('should handle errors gracefully', async () => {
    const { usePosts } = await import('../usePosts');
    const errorMessage = 'Network error';
    const { api } = vi.mocked(await import('../../services/api'));
    api.getPosts.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => usePosts({ autoFetch: false }));

    await act(async () => {
      await result.current.fetchPosts();
    });

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.posts).toEqual([]);
    expect(result.current.total).toBe(0);
  });

  it('should handle items per page changes', async () => {
    const { usePosts } = await import('../usePosts');
    const { result } = renderHook(() => usePosts({ autoFetch: false }));

    await act(async () => {
      await result.current.setItemsPerPage(12);
    });

    const { api } = vi.mocked(await import('../../services/api'));
    expect(api.getPosts).toHaveBeenCalledWith({
      page: 1,
      limit: 12,
      search: '',
      token: 'test-token',
      filters: {
        sortBy: 'created_at',
        sortOrder: 'desc',
        itemsPerPage: 6,
      },
    });
  });
});