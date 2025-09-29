// API service for blog posts
// Integrated with n8n backend workflow

import axios from 'axios';
import { N8N_CONFIG } from '@/config/n8n';

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
    console.log(`🚀 Making ${config.method?.toUpperCase()} request to: ${config.url}`);
    console.log('📤 Request data:', config.data);
    console.log('🔑 Headers:', config.headers);
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ Response received:', {
      status: response.status,
      statusText: response.statusText,
      url: response.config.url,
      method: response.config.method?.toUpperCase(),
      data: response.data,
      headers: response.headers
    });
    
    // Check if N8N is returning workflow started message instead of actual data
    if (response.data && typeof response.data === 'object' && response.data.message === 'Workflow was started') {
      console.warn('⚠️ N8N returned "Workflow was started" - check Response Mode = Last Node');
    }
    
    return response;
  },
  (error) => {
    console.error('❌ Response error:', {
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
      console.error('Error registering user:', error);
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
      console.log('🔐 Attempting login for:', data.email);
      
      const response = await supabaseClient.post<AuthResponse>(
        '/auth/v1/token?grant_type=password',
        { email: data.email, password: data.password },
        { headers: { 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` } }
      );
      
      console.log('✅ Login successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error logging in:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.response) {
          console.error('📋 Full error response:', {
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
      console.error('Error getting current user:', error);
      throw new Error('Falha ao obter usuário atual');
    }
  },

  // Test function to verify Supabase connection
  async testConnection(): Promise<void> {
    try {
      console.log('🧪 Testing Supabase connection...');
      console.log('📍 Supabase URL:', SUPABASE_URL);
      console.log('🔑 API Key (first 20 chars):', SUPABASE_ANON_KEY.substring(0, 20) + '...');
      
      // Test a simple request to verify connection
      const response = await supabaseClient.get('/auth/v1/settings');
      console.log('✅ Supabase connection test successful:', response.status);
    } catch (error) {
      console.error('❌ Supabase connection test failed:', error);
      throw error;
    }
  }
};

export const api = {
  // Create a new post (requires authentication)
  async createPost(data: CreatePostData, token: string): Promise<Post> {
    try {
      // Debug: Check if token is provided
      console.log('➡️ Authorization header?', token ? `Bearer ${token.slice(0, 12)}...` : 'MISSING TOKEN!');
      
      if (!token) {
        throw new Error('Token de autenticação não fornecido');
      }

      // Check if N8n webhook is configured
      if (!N8N_CONFIG.WEBHOOK_URL.includes('railway.app')) {
        console.warn('⚠️ N8n webhook not configured. Using development fallback.');
        
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
      console.error('Error creating post:', error);
      
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
  }): Promise<{ posts: Post[]; total: number; page: number; totalPages: number }> {
    try {
      const params = new URLSearchParams();
      
      if (options?.page) params.append('page', options.page.toString());
      if (options?.limit) params.append('limit', options.limit.toString());
      if (options?.search) params.append('search', options.search);
      
      // Add timestamp to prevent cache
      params.append('_t', Date.now().toString());
      
      const response = await apiClient.get<Post[]>(`/posts?${params.toString()}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });
      
      // The N8n workflow returns an array of posts directly
      const posts = Array.isArray(response.data) ? response.data : [];
      
      // Calculate pagination info
      const total = posts.length;
      const page = options?.page || 1;
      const limit = options?.limit || 10;
      const totalPages = Math.ceil(total / limit);
      
      return {
        posts,
        total,
        page,
        totalPages,
      };
    } catch (error) {
      console.error('Error fetching posts:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.response) {
          const message = error.response.data?.message || `HTTP ${error.response.status}: ${error.response.statusText}`;
          throw new Error(`Falha ao buscar posts: ${message}`);
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
      console.error('Error fetching post:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          return null;
        }
        
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
      console.log('➡️ Authorization header?', token ? `Bearer ${token.slice(0, 12)}...` : 'MISSING TOKEN!');
      
      if (!token) {
        throw new Error('Token de autenticação não fornecido');
      }

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
      console.error('Error updating post:', error);
      
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
      console.log('➡️ Authorization header?', token ? `Bearer ${token.slice(0, 12)}...` : 'MISSING TOKEN!');
      
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
      console.error('Error deleting post:', error);
      
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