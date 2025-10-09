import { useState, useEffect, useCallback } from 'react';
import { DashboardStats, PostAnalytics } from '@/types/analytics';
import { analyticsService } from '@/services/analytics';
import { redisCache, CacheKeys, CacheTTL } from '@/lib/redis-cache';

interface UseAnalyticsWithCacheReturn {
  stats: DashboardStats | null;
  postAnalytics: PostAnalytics[];
  loading: boolean;
  error: string | null;
  refetch: (forceRefresh?: boolean) => Promise<void>;
  invalidateCache: () => Promise<void>;
}

export function useAnalyticsWithCache(posts: any[]): UseAnalyticsWithCacheReturn {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [postAnalytics, setPostAnalytics] = useState<PostAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const statsCacheKey = CacheKeys.analytics.dashboard();

  const fetchAnalytics = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);

    try {
      // Try cache first
      if (!forceRefresh) {
        const cachedStats = await redisCache.get<DashboardStats>(statsCacheKey);
        if (cachedStats) {
          setStats(cachedStats);
          setLoading(false);
          return;
        }
      }

      // Cache miss - calculate analytics (expensive operation)
      const calculatedStats = analyticsService.getDashboardStats(posts);
      const calculatedPostAnalytics = analyticsService.getPostAnalytics(posts);

      // Store in cache
      await redisCache.set(statsCacheKey, calculatedStats, CacheTTL.analytics);
      
      setStats(calculatedStats);
      setPostAnalytics(calculatedPostAnalytics);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch analytics';
      setError(errorMessage);
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  }, [posts, statsCacheKey]);

  const invalidateCache = useCallback(async () => {
    await redisCache.invalidatePattern('analytics:*');
  }, []);

  useEffect(() => {
    if (posts.length > 0) {
      fetchAnalytics();
    }
  }, [fetchAnalytics, posts.length]);

  return {
    stats,
    postAnalytics,
    loading,
    error,
    refetch: fetchAnalytics,
    invalidateCache,
  };
}

// Hook for views over time with cache
export function useViewsOverTimeWithCache(posts: any[], timeRange: '7d' | '30d' | '90d' | '1y') {
  const [viewsData, setViewsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cacheKey = CacheKeys.analytics.viewsOverTime(timeRange);

  const fetchViewsData = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);

    try {
      // Try cache first
      if (!forceRefresh) {
        const cached = await redisCache.get<any[]>(cacheKey);
        if (cached) {
          setViewsData(cached);
          setLoading(false);
          return;
        }
      }

      // Cache miss - calculate views data
      const calculatedViewsData = analyticsService.getViewsOverTime(posts, timeRange);

      // Store in cache
      await redisCache.set(cacheKey, calculatedViewsData, CacheTTL.analytics);
      
      setViewsData(calculatedViewsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch views data';
      setError(errorMessage);
      console.error('Error fetching views data:', err);
    } finally {
      setLoading(false);
    }
  }, [posts, timeRange, cacheKey]);

  useEffect(() => {
    if (posts.length > 0) {
      fetchViewsData();
    }
  }, [fetchViewsData, posts.length, timeRange]);

  return {
    viewsData,
    loading,
    error,
    refetch: fetchViewsData,
  };
}

// Hook for engagement data with cache
export function useEngagementDataWithCache(posts: any[]) {
  const [engagementData, setEngagementData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cacheKey = 'analytics:engagement';

  const fetchEngagementData = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);

    try {
      // Try cache first
      if (!forceRefresh) {
        const cached = await redisCache.get<any[]>(cacheKey);
        if (cached) {
          setEngagementData(cached);
          setLoading(false);
          return;
        }
      }

      // Cache miss - calculate engagement data
      const calculatedEngagementData = analyticsService.getEngagementData(posts);

      // Store in cache
      await redisCache.set(cacheKey, calculatedEngagementData, CacheTTL.analytics);
      
      setEngagementData(calculatedEngagementData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch engagement data';
      setError(errorMessage);
      console.error('Error fetching engagement data:', err);
    } finally {
      setLoading(false);
    }
  }, [posts, cacheKey]);

  useEffect(() => {
    if (posts.length > 0) {
      fetchEngagementData();
    }
  }, [fetchEngagementData, posts.length]);

  return {
    engagementData,
    loading,
    error,
    refetch: fetchEngagementData,
  };
}
