// API service for blog posts
// Integrated with n8n backend workflow

import axios from 'axios';
import { N8N_CONFIG } from '@/config/n8n';
import { logApi, logError } from '@/lib/logger';

interface Post {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at?: string;
  user_id?: string;
}

interface CreatePostData {
  title: string;
  content: string;
}

interface UpdatePostData {
  title: string;
  content: string;
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

interface PostsResponse {
  posts: Post[];
  total?: number;
  page?: number;
  totalPages?: number;
}

// Configure axios with base URL for n8n webhook
const baseURL = N8N_CONFIG.WEBHOOK_URL;

const apiClient = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
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
    
    // Check if N8N is returning workflow started message instead of actual data
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
        headers: {
          'Authorization': `Bearer ${token}`
        }
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
      
      if (!token) {
        throw new Error('Token de autenticação não fornecido');
      }

      // Check if N8n webhook is configured
      if (!N8N_CONFIG.WEBHOOK_URL.includes('railway.app')) {
        logError('N8n webhook not configured. Using development fallback.');
        
        // Development fallback - create mock post
        const mockPost: Post = {
          id: `dev-${Date.now()}`,
          title: data.title,
          content: data.content,
          created_at: new Date().toISOString(),
          user_id: 'dev-user-id',
        };
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return mockPost;
      }

      const response = await apiClient.post<Post>('/posts', data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
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
  }): Promise<{ posts: Post[]; total: number; page: number; totalPages: number }> {
    try {
      // Build query parameters for server-side pagination and search
      const params = new URLSearchParams();
      params.append('_t', Date.now().toString());
      
      // Add pagination params
      if (options?.page) params.append('page', options.page.toString());
      if (options?.limit) params.append('limit', options.limit.toString());
      if (options?.search && options.search.trim()) params.append('search', options.search.trim());
      
      // Prepare headers with optional authorization
      const headers: Record<string, string> = {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      };
      
      // Add authorization header if token is provided
      if (options?.token) headers['Authorization'] = `Bearer ${options.token}`;
      
      logApi('Fetching posts from N8N', { 
        page: options?.page, 
        limit: options?.limit, 
        search: options?.search,
        hasToken: !!options?.token
      });
      
      const response = await apiClient.get<Post[] | { posts: Post[]; total: number; page: number; totalPages: number }>(`/posts?${params.toString()}`, {
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
      
      if (isPaginatedResponse) {
        // Server-side pagination and search
        const serverData = response.data as {
          posts?: Post[];
          data?: Post[];
          total: number;
          page: number;
          totalPages: number;
        };
        
        // Handle both 'posts' and 'data' field names
        const posts = serverData.posts || serverData.data || [];
        
        const serverResponse = {
          posts,
          total: serverData.total,
          page: serverData.page,
          totalPages: serverData.totalPages,
        };
        
        logApi('Server-side pagination used', {
          postsCount: posts.length,
          total: serverResponse.total,
          page: serverResponse.page,
          totalPages: serverResponse.totalPages,
          fieldUsed: serverData.posts ? 'posts' : 'data'
        });
        
        return serverResponse;
      } else {
        // Handle different response formats
        let allPosts: Post[] = [];
        
        if (Array.isArray(response.data)) {
          // Array of posts
          allPosts = response.data;
        } else if (response.data && typeof response.data === 'object') {
          // Single post object - convert to array
          if ('id' in response.data && 'title' in response.data && 'content' in response.data) {
            allPosts = [response.data as unknown as Post];
          }
        }
        
        logApi('Processing posts response', {
          responseType: Array.isArray(response.data) ? 'array' : 'object',
          postsCount: allPosts.length,
          hasId: response.data && 'id' in response.data,
          hasTitle: response.data && 'title' in response.data
        });
        
        // Apply search filter if provided and not handled by server
        let filteredPosts = allPosts;
        if (options?.search && options.search.trim() && !options?.page) {
          const searchTerm = options.search.toLowerCase().trim();
          filteredPosts = allPosts.filter(post => 
            post.title.toLowerCase().includes(searchTerm) ||
            post.content.toLowerCase().includes(searchTerm)
          );
        }
        
        // Apply pagination
        const page = options?.page || 1;
        const limit = options?.limit || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedPosts = filteredPosts.slice(startIndex, endIndex);
        
        // Calculate pagination info
        const total = filteredPosts.length;
        const totalPages = Math.ceil(total / limit);
        
        logApi('Client-side pagination used', { 
          totalPosts: allPosts.length,
          filteredPosts: filteredPosts.length,
          paginatedPosts: paginatedPosts.length,
          page,
          totalPages
        });
        
        return {
          posts: paginatedPosts,
          total,
          page,
          totalPages,
        };
      }
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

  // Get a specific post by ID
  async getPost(id: string): Promise<Post | null> {
    try {
      const response = await apiClient.get<Post>(`/posts/${id}?_t=${Date.now()}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });
      return response.data;
    } catch (error) {
      logError('Error fetching post:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) return null;
        
        if (error.response) {
          const message = error.response.data?.message || `HTTP ${error.response.status}: ${error.response.statusText}`;
          throw new Error(`Falha ao buscar post: ${message}`);
        }
        
        const message = error.message || 'Erro de rede ocorreu';
        throw new Error(`Falha ao buscar post: ${message}`);
      }
      throw new Error('Falha ao buscar post: Erro desconhecido');
    }
  },

  // Update an existing post (requires authentication)
  async updatePost(id: string, data: UpdatePostData, token: string): Promise<Post | null> {
    try {
      // Debug: Check if token is provided
      logApi('Authorization header check', { hasToken: !!token, tokenPreview: token ? `${token.slice(0, 12)}...` : 'MISSING TOKEN!' });
      
      if (!token) throw new Error('Token de autenticação não fornecido');

      const response = await apiClient.patch<Post>(`/posts/${id}`, data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });
      
      return response.data;
    } catch (error) {
      logError('Error updating post:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Não autorizado. Faça login para atualizar posts.');
        }
        
        if (error.response?.status === 404) {
          throw new Error('Post não encontrado.');
        }
        
        if (error.response) {
          const message = error.response.data?.message || `HTTP ${error.response.status}: ${error.response.statusText}`;
          throw new Error(`Falha ao atualizar post: ${message}`);
        }
        
        const message = error.message || 'Erro de rede ocorreu';
        throw new Error(`Falha ao atualizar post: ${message}`);
      }
      throw new Error('Falha ao atualizar post: Erro desconhecido');
    }
  },

  // Delete a post (requires authentication)
  async deletePost(id: string, token: string): Promise<boolean> {
    try {
      // Debug: Check if token is provided
      logApi('Authorization header check', { hasToken: !!token, tokenPreview: token ? `${token.slice(0, 12)}...` : 'MISSING TOKEN!' });
      
      if (!token) {
        throw new Error('Token de autenticação não fornecido');
      }

      await apiClient.delete(`/posts/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });
      
      return true;
    } catch (error) {
      logError('Error deleting post:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Não autorizado. Faça login para deletar posts.');
        }
        
        if (error.response?.status === 404) {
          throw new Error('Post não encontrado.');
        }
        
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

