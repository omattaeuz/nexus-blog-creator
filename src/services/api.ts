import axios from 'axios';
import { N8N_CONFIG } from '@/config/n8n';
import { logApi, logError } from '@/lib/logger';
import { cacheManager } from '@/lib/cache-manager';

interface Post {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at?: string;
  user_id?: string;
  is_public?: boolean;
  deleted_at?: string | null;
}

interface CreatePostData {
  title: string;
  content: string;
  is_public?: boolean;
}

interface UpdatePostData {
  title: string;
  content: string;
  is_public?: boolean;
}

interface User {
  id: string;
  email: string;
  created_at: string;
}

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

// Configure axios with base URL for n8n webhook
const baseURL = N8N_CONFIG.WEBHOOK_URL;

// Helper function to make requests with CORS handling
const makeRequestWithCorsHandling = async (method: string, url: string, data?: any, options: any = {}) => {
  // DO NOT add CORS headers to the request - these should only be in server responses
  const requestOptions = {
    ...options,
    headers: {
      // Add Content-Type only for requests with body (POST, PUT, PATCH)
      // GET requests don't need Content-Type and it causes preflight
      ...(data && ['post', 'put', 'patch'].includes(method.toLowerCase()) && { 'Content-Type': 'application/json' }),
    // No custom headers for GET requests to avoid preflight
      ...options.headers,
    },
  };

  // Make the request
  let response;

  switch (method.toLowerCase()) {
    case 'get':
      response = await apiClient.get(url, requestOptions);
      break;
    case 'post':
      response = await apiClient.post(url, data, requestOptions);
      break;
    case 'put':
      response = await apiClient.put(url, data, requestOptions);
      break;
    case 'patch':
      response = await apiClient.patch(url, data, requestOptions);
      break;
    case 'delete':
      response = await apiClient.delete(url, requestOptions);
      break;
    default:
      throw new Error(`Unsupported method: ${method}`);
  }

  return response;
};

const apiClient = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    // Minimal headers to avoid preflight requests
    // Only add essential headers that don't trigger preflight
  },
});

// Add request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    logApi(`Making ${config.method?.toUpperCase()} request`, { 
      url: config.url, 
      data: config.data, 
      headers: config.headers 
    });
    return config;
  },
  (error) => {
    logError('Request error', { error: error.message });
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    logApi('Response received', {
      status: response.status,
      statusText: response.statusText,
      url: response.config.url,
      method: response.config.method?.toUpperCase(),
      data: response.data,
      headers: response.headers
    });
    
    if (response.data && typeof response.data === 'object' && response.data.message === 'Workflow was started') {
      logError('N8N returned "Workflow was started" - check Response Mode = Last Node');
    }
    
    return response;
  },
  (error) => {
    logError('Response error', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      data: error.response?.data,
      message: error.message,
      code: error.code
    });
    return Promise.reject(error);
  }
);

// Supabase configuration
const SUPABASE_URL = N8N_CONFIG.SUPABASE.URL;
const SUPABASE_ANON_KEY = N8N_CONFIG.SUPABASE.ANON_KEY;

// Create a separate axios instance for Supabase auth
const supabaseClient = axios.create({
  baseURL: SUPABASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,

  },
});

// Auth service functions using Supabase
export const auth = {
  // Register a new user
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await supabaseClient.post<AuthResponse>('/auth/v1/signup', {
        email: data.email,
        password: data.password,
      });
      return response.data;
    } catch (error) {
      logError('Error registering user:', error);
      if (axios.isAxiosError(error)) {
        if (error.response) {
          const message = error.response.data?.msg || `HTTP ${error.response.status}: ${error.response.statusText}`;
          throw new Error(`Falha ao registrar: ${message}`);
        }
        const message = error.message || 'Erro de rede ocorreu';
        throw new Error(`Falha ao registrar: ${message}`);
      }
      throw new Error('Falha ao registrar: Erro desconhecido');
    }
  },

  // Login user
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      logApi('Attempting login', { email: data.email });
      
      const response = await supabaseClient.post<AuthResponse>(
        '/auth/v1/token?grant_type=password',
        { email: data.email, password: data.password },
        { headers: { 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` } }
      );
      
      logApi('Login successful', { data: response.data });
      return response.data;
    } catch (error) {
      logError('Error logging in', { error: error instanceof Error ? error.message : 'Unknown error' });
      
      if (axios.isAxiosError(error)) {
        if (error.response) {
          logError('Full error response', {
            status: error.response.status,
            statusText: error.response.statusText,
            data: error.response.data,
            headers: error.response.headers
          });
          
          // Handle specific error cases
          if (error.response.data?.error_code === 'email_not_confirmed') {
            throw new Error('Email não confirmado. Verifique sua caixa de entrada e clique no link de confirmação.');
          }
          
          if (error.response.data?.error === 'invalid_credentials') {
            throw new Error('Email ou senha incorretos. Verifique suas credenciais e tente novamente.');
          }
          
          if (error.response.data?.error === 'invalid_grant') {
            throw new Error('Credenciais inválidas. Verifique seu email e senha.');
          }
          
          const message = error.response.data?.error_description || 
                         error.response.data?.msg || 
                         error.response.data?.error ||
                         `HTTP ${error.response.status}: ${error.response.statusText}`;
          throw new Error(`Falha ao fazer login: ${message}`);
        }
        const message = error.message || 'Erro de rede ocorreu';
        throw new Error(`Falha ao fazer login: ${message}`);
      }
      throw new Error('Falha ao fazer login: Erro desconhecido');
    }
  },

  // Get current user from token
  async getCurrentUser(token: string): Promise<User> {
    try {
      const response = await supabaseClient.get<User>('/auth/v1/user', {
        headers: { 'Authorization': `Bearer ${token}`}
      });
      return response.data;
    } catch (error) {
      logError('Error getting current user:', error);
      throw new Error('Falha ao obter usuário atual');
    }
  },

  // Test function to verify Supabase connection
  async testConnection(): Promise<void> {
    try {
      logApi('Testing Supabase connection', { 
        url: SUPABASE_URL, 
        apiKeyPreview: SUPABASE_ANON_KEY.substring(0, 20) + '...' 
      });
      
      // Test a simple request to verify connection
      const response = await supabaseClient.get('/auth/v1/settings');
      logApi('Supabase connection test successful', { status: response.status });
    } catch (error) {
      logError('Supabase connection test failed', { error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  }
};

export const api = {
  // Create a new post (requires authentication)
  async createPost(data: CreatePostData, token: string): Promise<Post> {
    try {
      // Debug: Check if token is provided
      logApi('Authorization header check', { hasToken: !!token, tokenPreview: token ? `${token.slice(0, 12)}...` : 'MISSING TOKEN!' });
      
      if (!token) throw new Error('Token de autenticação não fornecido');

      const response = await makeRequestWithCorsHandling('post', N8N_CONFIG.ENDPOINTS.POSTS, data, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      return response.data;
    } catch (error) {
      logError('Error creating post:', error);
      
      if (axios.isAxiosError(error)) {
        // Handle network errors (N8n not accessible)
        if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
          throw new Error('Erro de conexão: Verifique se o N8n está configurado e acessível.');
        }
        
        // Handle authentication errors
        if (error.response?.status === 401) {
          throw new Error('Não autorizado. Faça login para criar posts.');
        }
        
        // Handle other HTTP errors
        if (error.response) {
          const message = error.response.data?.message || `HTTP ${error.response.status}: ${error.response.statusText}`;
          throw new Error(`Falha ao criar post: ${message}`);
        }
        
        // Handle network errors
        const message = error.message || 'Erro de rede ocorreu';
        throw new Error(`Falha ao criar post: ${message}`);
      }
      throw new Error('Falha ao criar post: Erro desconhecido');
    }
  },

  // Get all posts with optional pagination and filtering
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
      // Build query parameters for server-side pagination and search
      const params = new URLSearchParams();
      params.append('_t', Date.now().toString());
      
      // Add pagination params
      if (options?.page) params.append('page', options.page.toString());
      if (options?.limit) params.append('limit', options.limit.toString());
      if (options?.search && options.search.trim()) params.append('search', options.search.trim());
      
      // Add filter params
      if (options?.filters) {
        if (options.filters.sortBy) params.append('sortBy', options.filters.sortBy);
        if (options.filters.sortOrder) params.append('sortOrder', options.filters.sortOrder);
        if (options.filters.dateFrom) params.append('dateFrom', options.filters.dateFrom.toISOString());
        if (options.filters.dateTo) params.append('dateTo', options.filters.dateTo.toISOString());
        if (options.filters.itemsPerPage) params.append('itemsPerPage', options.filters.itemsPerPage.toString());
      }
      
      // Prepare headers with optional authorization
      const headers: Record<string, string> = {
        // No cache headers to avoid preflight requests
      };
      
      // Add authorization header if token is provided
      if (options?.token) headers['Authorization'] = `Bearer ${options.token}`;
      
      logApi('Fetching posts from N8N', { 
        page: options?.page, 
        limit: options?.limit, 
        search: options?.search,
        hasToken: !!options?.token
      });
      
      const response = await makeRequestWithCorsHandling('get', `${N8N_CONFIG.ENDPOINTS.POSTS}?${params.toString()}`, undefined, {
        headers,
      });
      
      logApi('Posts response received', { 
        dataType: typeof response.data, 
        isArray: Array.isArray(response.data),
        length: Array.isArray(response.data) ? response.data.length : 'not array',
        responseHeaders: response.headers
      });
      
      // Check if server returned paginated response
      const isPaginatedResponse = response.data && 
        typeof response.data === 'object' && 
        !Array.isArray(response.data) &&
        ('posts' in response.data || 'data' in response.data);
      
      // Get posts array from response
      let allPosts: Post[] = [];
      if (isPaginatedResponse) {
        allPosts = response.data.posts || response.data.data || [];
      } else if (Array.isArray(response.data)) {
        allPosts = response.data;
      } else {
        allPosts = [];
      }

      // Apply client-side filtering and sorting
      let filteredPosts = [...allPosts];

      // Always exclude soft-deleted posts; only exclude non-public when not authenticated
      if (options?.token) {
        filteredPosts = filteredPosts.filter((post) => !post.deleted_at);
      } else {
        filteredPosts = filteredPosts.filter((post) => post.is_public !== false && !post.deleted_at);
      }

      // Apply text search filter (title or content) if provided
      if (options?.search && options.search.trim()) {
        const term = options.search.trim().toLowerCase();
        filteredPosts = filteredPosts.filter((post) => {
          const title = (post.title || '').toLowerCase();
          const content = (post.content || '').toLowerCase();
          return title.includes(term) || content.includes(term);
        });
      }

      // Apply date filters
      if (options?.filters) {
        if (options.filters.dateFrom) {
          filteredPosts = filteredPosts.filter(post => 
            new Date(post.created_at) >= options.filters!.dateFrom!
          );
        }
        if (options.filters.dateTo) {
          filteredPosts = filteredPosts.filter(post => 
            new Date(post.created_at) <= options.filters!.dateTo!
          );
        }

        // Apply sorting
        filteredPosts.sort((a, b) => {
          let aValue: any;
          let bValue: any;

          switch (options.filters!.sortBy) {
            case 'title':
              aValue = a.title.toLowerCase();
              bValue = b.title.toLowerCase();
              break;
            case 'updated_at':
              aValue = new Date(a.updated_at || a.created_at);
              bValue = new Date(b.updated_at || b.created_at);
              break;
            case 'created_at':
            default:
              aValue = new Date(a.created_at);
              bValue = new Date(b.created_at);
              break;
          }

          if (options.filters!.sortOrder === 'asc') {
            return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
          } else {
            return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
          }
        });
      }

      // Apply client-side pagination
      const total = filteredPosts.length;
      const page = options?.page || 1;
      const limit = options?.limit || 6;
      const totalPages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedPosts = filteredPosts.slice(startIndex, endIndex);

      logApi('Posts processed', {
        originalCount: allPosts.length,
        filteredCount: total,
        page,
        totalPages
      });
      
      // Cache only public, not-deleted posts
      paginatedPosts.forEach(post => {
        if (post.is_public !== false && !post.deleted_at) this.cachePost(post);
      });
      
      return {
        posts: paginatedPosts,
        total,
        page,
        totalPages,
      };
    } catch (error) {
      logError('Error fetching posts', { error: error instanceof Error ? error.message : 'Unknown error' });
      
      if (axios.isAxiosError(error)) {
        // Handle authentication errors
        if (error.response?.status === 401) {
          throw new Error('Não autorizado. Faça login para acessar os posts.');
        }
        
        // Handle network errors (N8n not accessible)
        if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
          throw new Error('Erro de conexão: Verifique se o N8n está configurado e acessível.');
        }
        
        // Handle other HTTP errors
        if (error.response) {
          const status = error.response.status;
          const message = error.response.data?.message || error.response.data?.error || `HTTP ${status}: ${error.response.statusText}`;
          
          switch (status) {
            case 403:
              throw new Error('Acesso negado. Você não tem permissão para acessar este recurso.');
            case 404:
              throw new Error('Recurso não encontrado.');
            case 500:
              throw new Error('Erro interno do servidor. Tente novamente mais tarde.');
            default:
              throw new Error(`Falha ao buscar posts: ${message}`);
          }
        }
        
        const message = error.message || 'Erro de rede ocorreu';
        throw new Error(`Falha ao buscar posts: ${message}`);
      }
      throw new Error('Falha ao buscar posts: Erro desconhecido');
    }
  },

  // Cache post for public access
  cachePost(post: Post): void {
    cacheManager.storePost(post);
  },

  // Get a specific post by ID (works for both public and private posts)
  async getPost(id: string, token?: string): Promise<Post | null> {
    try {
      // Try specific endpoint with cache-busting: add query version and clear If-None-Match
      const response = await makeRequestWithCorsHandling('get', `${N8N_CONFIG.ENDPOINTS.POSTS_GET_ONE}/${id}?v=${Date.now()}`, undefined, {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
          'If-None-Match': '',
          'Cache-Control': 'no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });

      // Handle HTTP 304 (Not Modified): try cache, then one retry with cache-busting
      if ((response as any)?.status === 304) {
        const cached = cacheManager.getPost(id);
        if (cached) {
          return cached;
        }
        const retry = await makeRequestWithCorsHandling('get', `${N8N_CONFIG.ENDPOINTS.POSTS_GET_ONE}/${id}?v=${Date.now()}-retry`, undefined, {
          headers: {
            ...(token && { 'Authorization': `Bearer ${token}` }),
            'If-None-Match': '',
            'Cache-Control': 'no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          },
        });
        if (retry.data && retry.data.data) {
          const post = retry.data.data;
          this.cachePost(post);
          return post;
        }
      }

      // Normalize response: n8n can return { data } or [ { data, __status } ]
      if (response.data) {
        const post = response.data.data
          ? (response.data.data as Post)
          : (Array.isArray(response.data) && response.data[0]?.data ? (response.data[0].data as Post) : null);
        if (post) {
          // Safety: ensure backend returned the requested ID
          if (post.id !== id) {
            logError('Mismatched post id from GET ONE', { requestedId: id, returnedId: post.id });
          } else {
            this.cachePost(post);
            return post;
          }
        }
      }

      return null;
    } catch (error) {
      logError('Error fetching post from specific endpoint:', error);

      if (axios.isAxiosError(error)) {
        const status = error.response?.status;

        // Some adapters surface 304 as an error; handle same as above
        if (status === 304) {
          const cached = cacheManager.getPost(id);
          if (cached) {
            return cached;
          }
          try {
            const retry = await makeRequestWithCorsHandling('get', `${N8N_CONFIG.ENDPOINTS.POSTS_GET_ONE}/${id}?v=${Date.now()}-err`, undefined, {
              headers: {
                ...(token && { 'Authorization': `Bearer ${token}` }),
                'If-None-Match': '',
                'Cache-Control': 'no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
              },
            });
        if (retry.data) {
          const post = retry.data.data
            ? (retry.data.data as Post)
            : (Array.isArray(retry.data) && retry.data[0]?.data ? (retry.data[0].data as Post) : null);
          if (post) {
            if (post.id === id) {
              this.cachePost(post);
              return post;
            } else {
              logError('Mismatched post id from GET ONE retry', { requestedId: id, returnedId: post.id });
            }
          }
        }
          } catch (retryErr) {
            // fallthrough to remaining handling
          }
        }

        // Only fallback to public list on 404
        if (status === 404) {
          try {
            logApi('Trying to find post in public posts list after 404', { postId: id });
            const publicResponse = await makeRequestWithCorsHandling('get', `${N8N_CONFIG.ENDPOINTS.POSTS_PUBLIC}?limit=100`, undefined, {
              headers: {},
            });

            if (publicResponse.data && publicResponse.data.data) {
              const posts = publicResponse.data.data as Post[];
              const post = posts.find((p: Post) => p.id === id) || null;
              if (post) this.cachePost(post);
              return post;
            }

            return null;
          } catch (publicError) {
            logError('Error fetching public posts during 404 fallback:', publicError);
            return null;
          }
        }

        // Explicitly rethrow 403 for caller to handle messaging
        if (status === 403) {
          throw error;
        }
      }

      // Do not mask 500/other errors – let ErrorBoundary/toast handle
      throw error;
    }
  },

  // Get public posts (no authentication required)
  async getPublicPosts(page: number = 1, limit: number = 10): Promise<{ data: Post[], meta: any }> {
    try {
      const response = await makeRequestWithCorsHandling('get', `${N8N_CONFIG.ENDPOINTS.POSTS_PUBLIC}?_t=${Date.now()}&page=${page}&limit=${limit}`, undefined, {
        headers: {
          // No cache headers to avoid preflight requests
        },
      });

      if (response.data && response.data.data) {
        // Filter out soft-deleted or non-public items returned by mistake
        const clean = (response.data.data as Post[]).filter((p) => p.is_public !== false && !p.deleted_at);
        // Cache only clean public posts for offline access
        clean.forEach((post: Post) => {
          this.cachePost(post);
        });
        
        return {
          data: clean,
          meta: response.data.meta || { page, limit, total: response.data.data.length }
        };
      }
      
      return { data: [], meta: { page, limit, total: 0 } };
    } catch (error) {
      logError('Error fetching public posts:', error);
      
      // If API fails, try to get from cache
      logApi('API failed, trying cache fallback for public posts', { page, limit });
      const cachedPosts = cacheManager.getPublicPosts();
      
      if (cachedPosts.length > 0) {
        // Apply pagination to cached posts
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
      
      return { data: [], meta: { page, limit, total: 0 } };
    }
  },

  // Update an existing post (requires authentication)
  async updatePost(id: string, data: UpdatePostData, token: string): Promise<Post | null> {
    try {
      logApi('Authorization header check', { hasToken: !!token, tokenPreview: token ? `${token.slice(0, 12)}...` : 'MISSING TOKEN!' });
      
      if (!id) throw new Error('ID do post não fornecido');
      if (!token) throw new Error('Token de autenticação não fornecido');

      // Only send fields that are actually provided to avoid overwriting with empty values
      const payload: Record<string, any> = {};
      if (typeof data.title === 'string' && data.title.trim().length > 0) payload.title = data.title;
      if (typeof data.content === 'string' && data.content.trim().length > 0) payload.content = data.content;
      if (typeof data.is_public !== 'undefined') payload.is_public = data.is_public;

      // Use PUT method with the correct endpoint as defined in N8n workflow
      const response = await makeRequestWithCorsHandling('put', `${N8N_CONFIG.ENDPOINTS.POSTS_UPDATE}/${id}/update`, payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          // No cache headers to avoid preflight requests
        },
      });
      
      // Normalize updated post and refresh cache to reflect latest content in views
      const updatedPost = response.data?.data || response.data || null;
      if (updatedPost && updatedPost.id) {
        // Remove any stale cache first to avoid old ETag path
        cacheManager.removePost(updatedPost.id);
        this.cachePost(updatedPost);
      } else {
        // Fallback: refetch from GET ONE and cache
        try {
          const fresh = await makeRequestWithCorsHandling('get', `${N8N_CONFIG.ENDPOINTS.POSTS_GET_ONE}/${id}?v=${Date.now()}-refresh`, undefined, {
            headers: { 'Authorization': `Bearer ${token}`, 'If-None-Match': '' },
          });
          const post = fresh.data?.data || (Array.isArray(fresh.data) && fresh.data[0]?.data) || null;
          if (post) this.cachePost(post);
        } catch {}
      }
      
      return updatedPost;
    } catch (error) {
      logError('Error updating post:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Não autorizado. Faça login para atualizar posts.');
        }
        
        if (error.response?.status === 403) {
          throw new Error('Acesso negado. Você não tem permissão para editar este post.');
        }
        
        if (error.response?.status === 404) {
          throw new Error('Post não encontrado.');
        }
        
        if (error.response) {
          const message = error.response.data?.message || error.response.data?.error || `HTTP ${error.response.status}: ${error.response.statusText}`;
          throw new Error(`Falha ao atualizar post: ${message}`);
        }
        
        const message = error.message || 'Erro de rede ocorreu';
        throw new Error(`Falha ao atualizar post: ${message}`);
      }
      throw new Error('Falha ao atualizar post: Erro desconhecido');
    }
  },

  // Delete a post (requires authentication) - uses dedicated DELETE webhook
  async deletePost(id: string, token: string): Promise<boolean> {
    try {
      // Debug: Check if token is provided
      logApi('Authorization header check', { hasToken: !!token, tokenPreview: token ? `${token.slice(0, 12)}...` : 'MISSING TOKEN!' });
      
      if (!token) {
        throw new Error('Token de autenticação não fornecido');
      }
      // Call dedicated DELETE webhook
      await makeRequestWithCorsHandling('delete', `${N8N_CONFIG.ENDPOINTS.POSTS_DELETE}/${id}`, undefined, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      // Remove from cache immediately
      cacheManager.removePost(id);
      
      return true;
    } catch (error) {
      logError('Error deleting post:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) throw new Error('Não autorizado. Faça login para deletar posts.');
        if (error.response?.status === 403) throw new Error('Acesso negado. Você não tem permissão para deletar este post.');
        if (error.response?.status === 404) throw new Error('Post não encontrado.');
        
        if (error.response) {
          const message = error.response.data?.message || `HTTP ${error.response.status}: ${error.response.statusText}`;
          throw new Error(`Falha ao deletar post: ${message}`);
        }
        
        const message = error.message || 'Erro de rede ocorreu';
        throw new Error(`Falha ao deletar post: ${message}`);
      }
      throw new Error('Falha ao deletar post: Erro desconhecido');
    }
  },
};

export type { Post, CreatePostData, UpdatePostData, User, AuthResponse, RegisterData, LoginData };