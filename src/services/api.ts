import axios from 'axios';
import { N8N_CONFIG } from '@/config/n8n';
import { logApi, logError } from '@/lib/logger';
import { redisCache } from '@/lib/redis-cache';
import { ErrorHandler } from '@/lib/error-handler';
import { BaseApiService } from './base-api';
import type { Post, CreatePostData, UpdatePostData, User } from '@/types';

interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  user: User;
}

interface RegisterData {
  email: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

const _supabaseClient = axios.create({
  baseURL: N8N_CONFIG.SUPABASE.URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'apikey': N8N_CONFIG.SUPABASE.ANON_KEY,
    'Authorization': `Bearer ${N8N_CONFIG.SUPABASE.ANON_KEY}`,
  },
});

class PostService extends BaseApiService {
  async createPost(data: CreatePostData, token: string): Promise<Post> {
    try {
      logApi('Creating post', { title: data.title });
      
      const response = await this.post<Post>(N8N_CONFIG.ENDPOINTS.POSTS, data, token);
      
      logApi('Post created successfully', { id: response.id });
      return response;
    } catch (error) {
      throw ErrorHandler.handleApiError(error, 'createPost', { postData: data });
    }
  }

  async getPosts(options?: {
    page?: number;
    limit?: number;
    search?: string;
    token?: string;
    filters?: {
      sortBy: 'created_at' | 'title' | 'updated_at';
      sortOrder: 'asc' | 'desc';
      dateFrom?: Date;
      dateTo?: Date;
      itemsPerPage: number;
    };
  }): Promise<{ posts: Post[]; total: number; page: number; totalPages: number }> {
    try {
      const params = new URLSearchParams();
      params.append('_t', Date.now().toString());
      
      if (options?.page) params.append('page', options.page.toString());
      if (options?.limit) params.append('limit', options.limit.toString());
      if (options?.search && options.search.trim()) params.append('search', options.search.trim());
      
      if (options?.filters) {
        if (options.filters.sortBy) params.append('sortBy', options.filters.sortBy);
        if (options.filters.sortOrder) params.append('sortOrder', options.filters.sortOrder);
        if (options.filters.dateFrom) params.append('dateFrom', options.filters.dateFrom.toISOString());
        if (options.filters.dateTo) params.append('dateTo', options.filters.dateTo.toISOString());
        if (options.filters.itemsPerPage) params.append('itemsPerPage', options.filters.itemsPerPage.toString());
      }
      
      const headers: Record<string, string> = {};
      if (options?.token) headers['Authorization'] = `Bearer ${options.token}`;
      
      const response = await this.get<any>(`${N8N_CONFIG.ENDPOINTS.POSTS}?${params.toString()}`, options?.token);
      
      const isPaginatedResponse = response && 
        typeof response === 'object' && 
        !Array.isArray(response) &&
        ('posts' in response || 'data' in response);
      
      let allPosts: Post[] = [];
 
      if (isPaginatedResponse) {
        allPosts = response.posts || response.data || [];
      } else if (Array.isArray(response)) {
        allPosts = response;
      }

      let filteredPosts = [...allPosts];

      if (!options?.token) filteredPosts = filteredPosts.filter((post) => post.is_public !== false);

      if (options?.search && options.search.trim()) {
        const term = options.search.trim().toLowerCase();
        filteredPosts = filteredPosts.filter((post) => {
          const title = (post.title || '').toLowerCase();
          const content = (post.content || '').toLowerCase();
          return title.includes(term) || content.includes(term);
        });
      }

      if (options?.filters) {
        if (options.filters.dateFrom) {
          filteredPosts = filteredPosts.filter((post) => 
            new Date(post.created_at) >= options.filters!.dateFrom!
          );
        }
        if (options.filters.dateTo) {
          filteredPosts = filteredPosts.filter((post) => 
            new Date(post.created_at) <= options.filters!.dateTo!
          );
        }

        filteredPosts.sort((a, b) => {
          let aValue: any;
          let bValue: any;
          
          switch (options.filters!.sortBy) {
            case 'title':
              aValue = a.title?.toLowerCase() || '';
              bValue = b.title?.toLowerCase() || '';
              break;
            case 'updated_at':
              aValue = new Date(a.updated_at || a.created_at);
              bValue = new Date(b.updated_at || b.created_at);
              break;
            default:
              aValue = new Date(a.created_at);
              bValue = new Date(b.created_at);
          }
          
          if (options.filters!.sortOrder === 'desc') {
            return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
          } else {
            return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
          }
        });
      }

      const total = filteredPosts.length;
      const page = options?.page || 1;
      const limit = options?.limit || 10;
      const totalPages = Math.ceil(total / limit);
      const start = (page - 1) * limit;
      const end = start + limit;
      const paginatedPosts = filteredPosts.slice(start, end);
      
      logApi('Posts fetched successfully', {
        total,
        filteredCount: total,
        page,
        totalPages
      });
      
      paginatedPosts.forEach(post => {
        if (post.is_public !== false) this.cachePost(post);
      });
      
      return {
        posts: paginatedPosts,
        total,
        page,
        totalPages,
      };
    } catch (error) {
      throw ErrorHandler.handleApiError(error, 'getPosts', { options });
    }
  }

  async getPost(id: string, token?: string): Promise<Post | null> {
    try {
      const response = await this.get<any>(`${N8N_CONFIG.ENDPOINTS.POSTS_GET_ONE}/${id}?v=${Date.now()}`, token);

      if (response) {
        const post = response.data
          ? (response.data as Post)
          : (Array.isArray(response) && response[0]?.data ? (response[0].data as Post) : null);
        if (post) {
          if (post.id !== id) {
            logError('Mismatched post id from GET ONE', { requestedId: id, returnedId: post.id });
          }
          this.cachePost(post);
          return post;
        }
      }
      
      return null;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;

        if (status === 404) {
          try {
            const publicPosts = await this.getPublicPosts(1, 100);
            const found = publicPosts.data.find(p => p.id === id);
            if (found) {
              this.cachePost(found);
              return found;
            }
          } catch (publicError) {
            logError('Error fetching public posts during 404 fallback:', publicError);
            return null;
          }
        }

        if (status === 403) throw error;
      }

      throw error;
    }
  }

  async getPublicPosts(page: number = 1, limit: number = 10): Promise<{ data: Post[], meta: any }> {
    try {
      const response = await this.get<any>(`${N8N_CONFIG.ENDPOINTS.POSTS_PUBLIC}?page=${page}&limit=${limit}`);

      if (response && response.data) {
        const clean = (response.data as Post[]).filter((p) => p.is_public !== false);
        clean.forEach((post: Post) => {
          this.cachePost(post);
        });
        
        return {
          data: clean,
          meta: response.meta || { page, limit, total: response.data.length }
        };
      }
      
      return { data: [], meta: { page, limit, total: 0 } };
    } catch (error) {
      logError('Error fetching public posts:', error);
      
      logApi('API failed, trying cache fallback for public posts', { page, limit });
      const cachedPosts = (await redisCache.get(`posts:public:${page}`) || []) as Post[];
      
      if (cachedPosts.length > 0) {
        const start = (page - 1) * limit;
        const end = start + limit;
        const paginatedPosts = cachedPosts.slice(start, end);
        
        return {
          data: paginatedPosts,
          meta: { 
            page, 
            limit, 
            total: cachedPosts.length,
            fromCache: true 
          }
        };
      }
      
      return { data: [], meta: { page, limit, total: 0, fromCache: false } };
    }
  }

  async updatePost(id: string, data: UpdatePostData, token: string): Promise<Post | null> {
    try {
      if (!token) throw new Error('Token de autenticação não fornecido');

      const payload: Record<string, any> = {};
      if (typeof data.title === 'string' && data.title.trim().length > 0) payload.title = data.title;
      if (typeof data.content === 'string' && data.content.trim().length > 0) payload.content = data.content;
      if (typeof data.is_public !== 'undefined') payload.is_public = data.is_public;

      const response = await this.put<any>(`${N8N_CONFIG.ENDPOINTS.POSTS_UPDATE}/${id}/update`, payload, token);
      
      const updatedPost = response?.data || response || null;
      if (updatedPost && updatedPost.id) {
        await redisCache.delete(`posts:detail:${updatedPost.id}`);
        await this.cachePost(updatedPost);
      } else {
        try {
          const fresh = await this.get<any>(`${N8N_CONFIG.ENDPOINTS.POSTS_GET_ONE}/${id}?v=${Date.now()}-refresh`, token);
          if (fresh && fresh.data) {
            const post = fresh.data as Post;
            await this.cachePost(post);
            return post;
          }
        } catch (fetchError) {
          logError('Failed to refetch updated post, cache may be stale', { error: fetchError instanceof Error ? fetchError.message : String(fetchError) });
        }
      }
      
      return updatedPost;
    } catch (error) {
      throw ErrorHandler.handleApiError(error, 'updatePost', { postId: id, updateData: data });
    }
  }

  async deletePost(id: string, token: string): Promise<boolean> {
    try {
      logApi('Authorization header check', { hasToken: !!token, tokenPreview: token ? `${token.slice(0, 12)}...` : 'MISSING TOKEN!' });
      
      if (!token) throw new Error('Token de autenticação não fornecido');

      await this.delete<any>(`${N8N_CONFIG.ENDPOINTS.POSTS_DELETE}/${id}`, token);

      await redisCache.delete(`posts:detail:${id}`);
      
      logApi('Post deleted successfully', { id });
      return true;
    } catch (error) {
      throw ErrorHandler.handleApiError(error, 'deletePost', { postId: id });
    }
  }

  async cachePost(post: Post): Promise<void> {
    await redisCache.set(`posts:detail:${post.id}`, post, 300); // 5 minutes TTL
  }
}

class AuthService extends BaseApiService {
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await this.supabasePost<AuthResponse>('/auth/v1/signup', {
        email: data.email,
        password: data.password,
      });
      return response;
    } catch (error) {
      throw ErrorHandler.handleAuthError(error, 'register');
    }
  }

  async login(data: LoginData): Promise<AuthResponse> {
    try {
      logApi('Attempting login', { email: data.email });
      
      const response = await this.supabasePost<AuthResponse>(
        '/auth/v1/token?grant_type=password',
        { email: data.email, password: data.password },
        N8N_CONFIG.SUPABASE.ANON_KEY
      );
      
      logApi('Login successful', { data: response });
      return response;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data;
        
        if (errorData.error_code === 'email_not_confirmed') {
          throw new Error('Email não confirmado. Verifique sua caixa de entrada e clique no link de confirmação.');
        }
        
        if (errorData.error === 'invalid_credentials') {
          throw new Error('Email ou senha incorretos. Verifique suas credenciais e tente novamente.');
        }
        
        if (errorData.error === 'invalid_grant') {
          throw new Error('Credenciais inválidas. Verifique seu email e senha.');
        }
      }
      
      throw ErrorHandler.handleAuthError(error, 'login');
    }
  }

  async getCurrentUser(token: string): Promise<User> {
    try {
      const response = await this.supabaseGet<User>('/auth/v1/user', token);
      return response;
    } catch (error) {
      throw ErrorHandler.handleAuthError(error, 'getCurrentUser');
    }
  }

  async testConnection(): Promise<void> {
    try {
      logApi('Testing Supabase connection', { 
        url: N8N_CONFIG.SUPABASE.URL, 
        apiKeyPreview: N8N_CONFIG.SUPABASE.ANON_KEY.substring(0, 20) + '...' 
      });
      
      const response = await this.supabaseGet('/auth/v1/settings');
      logApi('Supabase connection test successful', { response });
    } catch (error) {
      throw ErrorHandler.handleAuthError(error, 'testConnection');
    }
  }
}

const postService = new PostService();
const authService = new AuthService();

export const api = {
  createPost: (data: CreatePostData, token: string) => postService.createPost(data, token),
  getPosts: (options?: any) => postService.getPosts(options),
  getPost: (id: string, token?: string) => postService.getPost(id, token),
  getPublicPosts: (page?: number, limit?: number) => postService.getPublicPosts(page, limit),
  updatePost: (id: string, data: UpdatePostData, token: string) => postService.updatePost(id, data, token),
  deletePost: (id: string, token: string) => postService.deletePost(id, token),
};

export const auth = authService;

export type { AuthResponse, RegisterData, LoginData };