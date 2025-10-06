// Cache Manager for Public Posts
// This handles caching and offline access to posts

export interface CachedPost {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at?: string;
  is_public?: boolean;
  cached_at: string;
}

class CacheManager {
  private readonly CACHE_KEY = 'nexus_blog_cache';
  private readonly MAX_CACHE_SIZE = 100; // Maximum number of posts to cache
  private readonly CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

  // Store a post in cache
  storePost(post: any): void {
    try {
      const cachedPost: CachedPost = {
        ...post,
        cached_at: new Date().toISOString()
      };

      const cache = this.getCache();
      
      // Remove existing post with same ID
      const filteredCache = cache.filter(p => p.id !== post.id);
      
      // Add new post
      filteredCache.push(cachedPost);
      
      // Keep only the most recent posts
      const sortedCache = filteredCache
        .sort((a, b) => new Date(b.cached_at).getTime() - new Date(a.cached_at).getTime())
        .slice(0, this.MAX_CACHE_SIZE);
      
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(sortedCache));
      
    } catch (error) {
      console.warn('[Cache] Failed to store post:', error);
    }
  }

  // Get a post from cache
  getPost(id: string): CachedPost | null {
    try {
      const cache = this.getCache();
      const post = cache.find(p => p.id === id);
      
      if (post) {
        // Check if cache is expired
        const cacheAge = Date.now() - new Date(post.cached_at).getTime();
        if (cacheAge > this.CACHE_EXPIRY) {
          this.removePost(id);
          return null;
        }
        
        return post;
      }
      
      return null;
    } catch (error) {
      console.warn('[Cache] Failed to get post:', error);
      return null;
    }
  }

  // Get all cached posts
  getAllPosts(): CachedPost[] {
    try {
      return this.getCache();
    } catch (error) {
      console.warn('[Cache] Failed to get all posts:', error);
      return [];
    }
  }

  // Get public posts from cache
  getPublicPosts(): CachedPost[] {
    try {
      const cache = this.getCache();
      return cache.filter(post => post.is_public === true);
    } catch (error) {
      console.warn('[Cache] Failed to get public posts:', error);
      return [];
    }
  }

  // Remove a post from cache
  removePost(id: string): void {
    try {
      const cache = this.getCache();
      const filteredCache = cache.filter(p => p.id !== id);
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(filteredCache));
    } catch (error) {
      console.warn('[Cache] Failed to remove post:', error);
    }
  }

  // Clear all cache
  clearCache(): void {
    try {
      localStorage.removeItem(this.CACHE_KEY);
      console.log('[Cache] All cache cleared');
    } catch (error) {
      console.warn('[Cache] Failed to clear cache:', error);
    }
  }

  // Get cache statistics
  getCacheStats(): { total: number; public: number; size: string } {
    try {
      const cache = this.getCache();
      const publicPosts = cache.filter(p => p.is_public === true);
      const size = new Blob([JSON.stringify(cache)]).size;
      
      return {
        total: cache.length,
        public: publicPosts.length,
        size: this.formatBytes(size)
      };
    } catch (_error) {
      return { total: 0, public: 0, size: '0 B' };
    }
  }

  // Private method to get cache from localStorage
  private getCache(): CachedPost[] {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (!cached) return [];
      
      const cache = JSON.parse(cached);
      
      // Filter out expired posts
      const now = Date.now();
      const validCache = cache.filter((post: CachedPost) => {
        const cacheAge = now - new Date(post.cached_at).getTime();
        return cacheAge <= this.CACHE_EXPIRY;
      });
      
      // Update cache if some posts were expired
      if (validCache.length !== cache.length) {
        localStorage.setItem(this.CACHE_KEY, JSON.stringify(validCache));
      }
      
      return validCache;
    } catch (error) {
      console.warn('[Cache] Failed to parse cache:', error);
      return [];
    }
  }

  // Format bytes to human readable format
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Export singleton instance
export const cacheManager = new CacheManager();
