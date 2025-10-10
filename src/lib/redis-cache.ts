import { API_CONSTANTS } from './constants';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
  key: string;
}

interface RedisConfig {
  url: string;
  password?: string;
  db?: number;
  retryDelayOnFailover?: number;
  maxRetriesPerRequest?: number;
}

class RedisCacheManager {
  private redis: any = null;
  private isConnected = false;
  private fallbackCache = new Map<string, CacheItem<any>>();
  private config: RedisConfig;

  constructor(config: RedisConfig) {
    this.config = config;
    this.initializeRedis();
  }

  private async initializeRedis() {
    try {
      if (!this.config.url || this.config.url === 'redis://localhost:6379') {
        console.log('ℹ️ Redis not configured, using fallback cache');
        this.isConnected = false;
        return;
      }

      const Redis = await import('ioredis');
      
      this.redis = new Redis.default({
        host: new URL(this.config.url).hostname,
        port: parseInt(new URL(this.config.url).port) || 6379,
        password: this.config.password,
        db: this.config.db || 0,
        retryDelayOnFailover: this.config.retryDelayOnFailover || 100,
        maxRetriesPerRequest: this.config.maxRetriesPerRequest || API_CONSTANTS.RETRY_ATTEMPTS,
        lazyConnect: true,
        connectTimeout: API_CONSTANTS.TIMEOUT / 2, // Half of API timeout
        commandTimeout: API_CONSTANTS.TIMEOUT / 3, // One third of API timeout
      } as any);

      this.redis.on('connect', () => {
        console.log('✅ Redis connected');
        this.isConnected = true;
      });

      this.redis.on('error', (error: Error) => {
        console.warn('⚠️ Redis connection error, using fallback cache:', error.message);
        this.isConnected = false;
      });

      this.redis.on('close', () => {
        console.log('🔌 Redis connection closed');
        this.isConnected = false;
      });

      const connectPromise = this.redis.connect();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), API_CONSTANTS.TIMEOUT / 3)
      );
      
      await Promise.race([connectPromise, timeoutPromise]);
    } catch (error) {
      console.warn('⚠️ Redis not available, using fallback cache:', error);
      this.isConnected = false;
    }
  }

  async set<T>(key: string, data: T, ttlSeconds: number = API_CONSTANTS.CACHE_DURATION / 1000): Promise<void> {
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttlSeconds * 1000,
      key
    };

    try {
      if (this.isConnected && this.redis) {
        await this.redis.setex(key, ttlSeconds, JSON.stringify(cacheItem));
      } else {
        // Fallback to memory cache
        this.fallbackCache.set(key, cacheItem);
      }
    } catch (error) {
      console.warn('Cache set error:', error);
      // Fallback to memory cache
      this.fallbackCache.set(key, cacheItem);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      let cacheItem: CacheItem<T> | null = null;

      if (this.isConnected && this.redis) {
        const cached = await this.redis.get(key);
        if (cached) cacheItem = JSON.parse(cached);

      } else {
        cacheItem = this.fallbackCache.get(key) || null;
      }

      if (!cacheItem) return null;

      if (Date.now() - cacheItem.timestamp > cacheItem.ttl) {
        await this.delete(key);
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      console.warn('Cache get error:', error);
      return null;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      if (this.isConnected && this.redis) {
        await this.redis.del(key);
      }
      this.fallbackCache.delete(key);
    } catch (error) {
      console.warn('Cache delete error:', error);
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      if (this.isConnected && this.redis) {
        const keys = await this.redis.keys(pattern);
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
      }
      
      for (const key of this.fallbackCache.keys()) {
        if (key.includes(pattern.replace('*', ''))) this.fallbackCache.delete(key);

      }
    } catch (error) {
      console.warn('Cache invalidate pattern error:', error);
    }
  }

  async getStats(): Promise<{
    connected: boolean;
    memoryKeys: number;
    redisKeys?: number;
  }> {
    const stats: {
      connected: boolean;
      memoryKeys: number;
      redisKeys?: number;
    } = {
      connected: this.isConnected,
      memoryKeys: this.fallbackCache.size,
    };

    try {
      if (this.isConnected && this.redis) {
        stats.redisKeys = await this.redis.dbsize();
      }
    } catch (error) {
      console.warn('Cache stats error:', error);
    }

    return stats;
  }

  async clear(): Promise<void> {
    try {
      if (this.isConnected && this.redis) await this.redis.flushdb();

      this.fallbackCache.clear();
    } catch (error) {
      console.warn('Cache clear error:', error);
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      if (this.isConnected && this.redis) {
        await this.redis.ping();
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }
}

export const CacheKeys = {
  posts: {
    list: (page?: number, limit?: number) => 
      `posts:list:${page || 1}:${limit || 10}`,
    detail: (id: string) => `posts:detail:${id}`,
    public: (page?: number) => `posts:public:${page || 1}`,
  },
  analytics: {
    dashboard: () => 'analytics:dashboard',
    postStats: (postId: string) => `analytics:post:${postId}`,
    viewsOverTime: (timeRange: string) => `analytics:views:${timeRange}`,
  },
  comments: {
    list: (postId: string) => `comments:list:${postId}`,
    count: (postId: string) => `comments:count:${postId}`,
  },
  user: {
    profile: (userId: string) => `user:profile:${userId}`,
    preferences: (userId: string) => `user:preferences:${userId}`,
  },
  search: {
    results: (query: string, filters: string) => `search:${query}:${filters}`,
  }
};

export const CacheTTL = {
  posts: 300,        // 5 minutes
  analytics: 600,    // 10 minutes
  comments: 120,     // 2 minutes
  user: 1800,        // 30 minutes
  search: 300,       // 5 minutes
};

const redisConfig: RedisConfig = {
  url: import.meta.env.VITE_REDIS_URL || 'redis://localhost:6379',
  password: import.meta.env.VITE_REDIS_PASSWORD,
  db: parseInt(import.meta.env.VITE_REDIS_DB || '0'),
};

export const redisCache = new RedisCacheManager(redisConfig);

export const CacheInvalidation = {
  onPostCreate: () => redisCache.invalidatePattern('posts:*'),
  onPostUpdate: (postId: string) => {
    redisCache.invalidatePattern('posts:*');
    redisCache.invalidatePattern(`analytics:post:${postId}`);
  },
  onPostDelete: (postId: string) => {
    redisCache.invalidatePattern('posts:*');
    redisCache.invalidatePattern(`analytics:post:${postId}`);
    redisCache.invalidatePattern(`comments:list:${postId}`);
  },
  onCommentAdd: (postId: string) => {
    redisCache.invalidatePattern(`comments:list:${postId}`);
    redisCache.invalidatePattern('analytics:dashboard');
  },
  onCommentUpdate: (postId: string) => {
    redisCache.invalidatePattern(`comments:list:${postId}`);
  },
  onCommentDelete: (postId: string) => {
    redisCache.invalidatePattern(`comments:list:${postId}`);
    redisCache.invalidatePattern('analytics:dashboard');
  },
};

export default redisCache;